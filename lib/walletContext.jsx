"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { ethers } from "ethers";

const FUJI_CHAIN_ID_HEX = "0xa869"; // 43113 in hex
const FUJI_CHAIN_ID_DEC = 43113;
const FUJI_RPC_URL = process.env.NEXT_PUBLIC_FUJI_RPC_URL || "https://api.avax-test.network/ext/bc/C/rpc";

const WalletContext = createContext({
  account: null,
  balance: "0.0",
  networkName: "Avalanche Fuji",
  chainId: FUJI_CHAIN_ID_DEC,
  isWalletModalOpen: false,
  walletError: null,
  connecting: false,
  provider: null,
  signer: null,
  openWalletModal: () => {},
  closeWalletModal: () => {},
  connectWallet: () => {},
  connectWatchAddress: () => {},
  connectMockFallback: () => {},
  disconnectWallet: () => {},
  clearWalletError: () => {},
  refreshBalance: () => {},
});

// Helper to reliably find the right provider
const getInjectedProvider = (type = "metamask") => {
  if (typeof window === "undefined") return null;

  // Core Wallet (Avalanche Native)
  if (type === "core") {
    if (window.avalanche) return window.avalanche;
    if (window.ethereum?.isAvalanche) return window.ethereum;
    if (window.ethereum?.providers?.length) {
      const core = window.ethereum.providers.find((p) => p.isAvalanche);
      if (core) return core;
    }
  }

  // MetaMask
  if (type === "metamask") {
    if (window.ethereum?.providers?.length) {
      const mm = window.ethereum.providers.find((p) => p.isMetaMask);
      if (mm) return mm;
    }
    if (window.ethereum?.isMetaMask) return window.ethereum;
  }

  // Generic Injected (Brave, Rabby, Coinbase, etc.)
  if (window.ethereum) return window.ethereum;
  if (window.avalanche) return window.avalanche;

  return null;
};

export function WalletProvider({ children }) {
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState("0.0");
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [walletError, setWalletError] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);

  const activeProviderRef = useRef(null);

  /**
   * Fetch LIVE balance directly from Avalanche Fuji C-Chain
   * Always falls back to Fuji Public JSON-RPC node so balance is 100% accurate!
   */
  const fetchBalance = useCallback(async (addr, injectedProv = null) => {
    if (!addr || !ethers.isAddress(addr)) return;

    try {
      // 1. Try fetching via injected provider if available
      const prov = injectedProv || activeProviderRef.current;
      if (prov && typeof prov.request === "function") {
        try {
          const balHex = await prov.request({
            method: "eth_getBalance",
            params: [addr, "latest"],
          });
          if (balHex) {
            const balAvax = parseFloat(ethers.formatEther(balHex)).toFixed(4);
            setBalance(balAvax);
            return;
          }
        } catch (injectedErr) {
          // fall through to public RPC
        }
      }

      // 2. Fetch directly from Avalanche Fuji Testnet RPC node
      const rpcProvider = new ethers.JsonRpcProvider(FUJI_RPC_URL);
      const balWei = await rpcProvider.getBalance(addr);
      const balFormatted = parseFloat(ethers.formatEther(balWei)).toFixed(4);
      setBalance(balFormatted);
    } catch (e) {
      console.warn("Could not fetch Fuji balance:", e);
    }
  }, []);

  const refreshBalance = useCallback(() => {
    if (account) {
      fetchBalance(account);
    }
  }, [account, fetchBalance]);

  // Ensure user is on Avalanche Fuji Testnet (Chain ID: 43113)
  const ensureFujiNetwork = async (prov) => {
    if (!prov || typeof prov.request !== "function") return true;

    try {
      await prov.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: FUJI_CHAIN_ID_HEX }],
      });
      return true;
    } catch (switchError) {
      // Chain 4902: Network not yet added to wallet
      if (switchError.code === 4902 || switchError?.data?.originalError?.code === 4902) {
        try {
          await prov.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: FUJI_CHAIN_ID_HEX,
                chainName: "Avalanche Fuji Testnet",
                nativeCurrency: { name: "AVAX", symbol: "AVAX", decimals: 18 },
                rpcUrls: [FUJI_RPC_URL],
                blockExplorerUrls: ["https://testnet.snowtrace.io"],
              },
            ],
          });
          return true;
        } catch (addError) {
          console.warn("Failed to add Fuji network:", addError);
          return false;
        }
      }
      console.warn("Failed to switch network:", switchError);
      return false;
    }
  };

  // Reconnect previous session on page refresh
  useEffect(() => {
    const saved = localStorage.getItem("snowdrop_connected_account");
    if (saved && ethers.isAddress(saved)) {
      setAccount(saved);
      const injected = getInjectedProvider("metamask") || getInjectedProvider("core");
      if (injected) {
        activeProviderRef.current = injected;
        const browserProvider = new ethers.BrowserProvider(injected);
        setProvider(browserProvider);
        browserProvider.getSigner().then(setSigner).catch(() => {});
      }
      fetchBalance(saved, injected);
    }
  }, [fetchBalance]);

  // Auto-refresh balance every 12 seconds when an account is connected
  useEffect(() => {
    if (!account) return;
    const interval = setInterval(() => {
      fetchBalance(account);
    }, 12000);
    return () => clearInterval(interval);
  }, [account, fetchBalance]);

  // Listen for wallet account & chain changes
  useEffect(() => {
    const prov = activeProviderRef.current || getInjectedProvider("metamask");
    if (!prov || typeof prov.on !== "function") return;

    const handleAccountsChanged = (accounts) => {
      if (!accounts || accounts.length === 0) {
        disconnectWallet();
      } else {
        const newAddr = accounts[0];
        setAccount(newAddr);
        localStorage.setItem("snowdrop_connected_account", newAddr);
        fetchBalance(newAddr, prov);
      }
    };

    const handleChainChanged = () => {
      if (account) {
        fetchBalance(account, prov);
      }
    };

    prov.on("accountsChanged", handleAccountsChanged);
    prov.on("chainChanged", handleChainChanged);

    return () => {
      if (prov.removeListener) {
        prov.removeListener("accountsChanged", handleAccountsChanged);
        prov.removeListener("chainChanged", handleChainChanged);
      }
    };
  }, [account, fetchBalance]);

  const openWalletModal = () => {
    setWalletError(null);
    setIsWalletModalOpen(true);
  };

  const closeWalletModal = () => {
    setWalletError(null);
    setIsWalletModalOpen(false);
  };

  const clearWalletError = () => setWalletError(null);

  /**
   * Connect Live Web3 Wallet (MetaMask, Core, or Injected)
   */
  const connectWallet = async (walletType = "metamask") => {
    setWalletError(null);
    setConnecting(true);

    const injected = getInjectedProvider(walletType);

    if (!injected) {
      setConnecting(false);
      const walletName = walletType === "core" ? "Core Wallet" : "MetaMask";
      setWalletError(
        `${walletName} was not found in your browser. You can install ${walletName}, connect another wallet, or use a live Fuji address below.`
      );
      return;
    }

    try {
      // Request accounts
      const accounts = await injected.request({
        method: "eth_requestAccounts",
      });

      if (accounts && accounts.length > 0) {
        const userAddr = accounts[0];
        activeProviderRef.current = injected;

        const browserProvider = new ethers.BrowserProvider(injected);
        setProvider(browserProvider);
        try {
          const userSigner = await browserProvider.getSigner();
          setSigner(userSigner);
        } catch (signerErr) {
          console.warn("Could not obtain signer immediately:", signerErr);
        }

        setAccount(userAddr);
        localStorage.setItem("snowdrop_connected_account", userAddr);

        // Switch to Fuji Testnet
        await ensureFujiNetwork(injected);

        // Fetch live on-chain balance
        await fetchBalance(userAddr, injected);

        setIsWalletModalOpen(false);
        setConnecting(false);
        return;
      }
    } catch (err) {
      console.warn("Wallet connection error:", err);
      setConnecting(false);

      if (err.code === 4001) {
        setWalletError("Connection rejected in wallet. Please click 'Connect' again to approve.");
      } else if (err.code === -32002) {
        setWalletError("Connection request is already pending. Please open your wallet extension to approve it.");
      } else {
        setWalletError(
          err.message || "Failed to connect to wallet. Make sure your wallet is unlocked."
        );
      }
    }
  };

  /**
   * Watch any real Fuji Address (e.g. for testing live balance & Snowtrace tracking)
   */
  const connectWatchAddress = async (addr) => {
    if (!addr || !ethers.isAddress(addr)) {
      setWalletError("Please enter a valid 0x Ethereum / Avalanche address.");
      return;
    }
    setConnecting(true);
    setAccount(addr);
    localStorage.setItem("snowdrop_connected_account", addr);
    activeProviderRef.current = null;
    setProvider(new ethers.JsonRpcProvider(FUJI_RPC_URL));
    await fetchBalance(addr);
    setConnecting(false);
    setIsWalletModalOpen(false);
  };

  /**
   * Instant Demo / Fallback account
   */
  const connectMockFallback = () => {
    const demoAddr = "0x3fC8D80F16e51D6Db69B4B32cAfb8f3319088a2C";
    setAccount(demoAddr);
    setBalance("0.4200");
    localStorage.setItem("snowdrop_connected_account", demoAddr);
    setIsWalletModalOpen(false);
    setWalletError(null);
  };

  const disconnectWallet = () => {
    setAccount(null);
    setBalance("0.0");
    setSigner(null);
    setProvider(null);
    activeProviderRef.current = null;
    localStorage.removeItem("snowdrop_connected_account");
  };

  return (
    <WalletContext.Provider
      value={{
        account,
        balance,
        networkName: "Avalanche Fuji (Testnet)",
        chainId: FUJI_CHAIN_ID_DEC,
        isWalletModalOpen,
        walletError,
        connecting,
        provider,
        signer,
        openWalletModal,
        closeWalletModal,
        connectWallet,
        connectWatchAddress,
        connectMockWallet: connectWallet,
        connectMockFallback,
        disconnectWallet,
        clearWalletError,
        refreshBalance,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export const useWallet = () => useContext(WalletContext);
