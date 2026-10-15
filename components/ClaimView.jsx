import React, { useState, useEffect } from "react";
import { Clock, Loader2, AlertCircle, ArrowLeft, ShieldCheck } from "lucide-react";
import { getMockDrop, claimMockDrop } from "../lib/mock";
import {
  claimRealDrop,
  fetchOnChainDrop,
  fetchOnChainGroupDrop,
  computeCommitFromSecret,
  SNOWDROP_CONTRACT_ADDRESS,
  EXPLORER_URL
} from "../lib/contract";
import { useWallet } from "../lib/walletContext";
import { SnowdropLogo } from "./Navbar";

export default function ClaimView({ secret, onClaimSuccess, onExpired, onBackToHome }) {
  const { account, signer, provider, openWalletModal, refreshBalance } = useWallet();

  const [drop, setDrop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState("");

  useEffect(() => {
    async function fetchDrop() {
      const activeSecret = secret || "0x4e69b2d86105820e981bc923a10584b2c91038e910547b910485c21049581a0b";

      // 1. Try On-Chain Drop Details if contract is configured
      const isContractConfigured =
        SNOWDROP_CONTRACT_ADDRESS &&
        SNOWDROP_CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000";

      if (isContractConfigured && provider && activeSecret) {
        try {
          const commit = computeCommitFromSecret(activeSecret);
          const singleData = await fetchOnChainDrop(commit, provider);
          if (singleData) {
            setDrop({
              commit,
              secret: activeSecret,
              type: "single",
              amount: singleData.amount,
              expiryHours: 24,
              expiresAt: singleData.expiry * 1000,
              sender: singleData.sender,
              status: singleData.claimed ? "claimed" : singleData.isExpired ? "expired" : "active",
              maxClaims: 1,
              claimedCount: singleData.claimed ? 1 : 0
            });
            if (singleData.isExpired) {
              onExpired({ ...singleData, secret: activeSecret });
            }
            setLoading(false);
            return;
          }

          const groupData = await fetchOnChainGroupDrop(commit, provider, account);
          if (groupData) {
            setDrop({
              commit,
              secret: activeSecret,
              type: "group",
              amount: (parseFloat(groupData.perClaim) * groupData.maxClaims).toFixed(4),
              perClaim: groupData.perClaim,
              expiryHours: 24,
              expiresAt: groupData.expiry * 1000,
              sender: groupData.sender,
              status: groupData.claimed >= groupData.maxClaims ? "claimed" : groupData.isExpired ? "expired" : "active",
              maxClaims: groupData.maxClaims,
              claimedCount: groupData.claimed
            });
            if (groupData.isExpired) {
              onExpired({ ...groupData, secret: activeSecret });
            }
            setLoading(false);
            return;
          }
        } catch (chainErr) {
          console.warn("Could not read drop from chain, falling back to mock:", chainErr);
        }
      }

      // 2. Fallback to Local Drop Data
      try {
        const d = await getMockDrop(activeSecret);
        if (!d) {
          setError("Invalid drop secret. Please verify your link.");
        } else if (d.status === "expired" || Date.now() > d.expiresAt) {
          onExpired(d);
          return;
        } else {
          setDrop(d);
        }
      } catch (e) {
        setError("Error loading drop details.");
      } finally {
        setLoading(false);
      }
    }

    fetchDrop();
  }, [secret, provider, account]);

  // Countdown timer effect
  useEffect(() => {
    if (!drop || !drop.expiresAt) return;

    const updateTimer = () => {
      const diff = drop.expiresAt - Date.now();
      if (diff <= 0) {
        setCountdown("Expired");
        onExpired(drop);
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setCountdown(`${hours}h ${mins}m`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000);
    return () => clearInterval(interval);
  }, [drop]);

  const handleClaim = async () => {
    if (!account) {
      openWalletModal();
      return;
    }

    setClaiming(true);
    setError("");

    try {
      const isContractConfigured =
        SNOWDROP_CONTRACT_ADDRESS &&
        SNOWDROP_CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000";

      let claimResult;
      if (signer && isContractConfigured) {
        // Execute Real Fuji On-Chain Claim!
        const txResult = await claimRealDrop({
          signer,
          secret: secret || drop.secret,
          isGroup: drop?.type === "group"
        });

        claimResult = {
          success: true,
          amount: drop.type === "group" ? drop.perClaim : drop.amount,
          type: drop.type,
          txHash: txResult.txHash,
          recipient: account,
          claimedAt: Date.now()
        };
        if (refreshBalance) refreshBalance();
      } else {
        // Simulation Mode
        claimResult = await claimMockDrop(secret || drop.secret, account);
      }

      onClaimSuccess(claimResult);
    } catch (err) {
      console.error("Claim failed:", err);
      if (err.message && err.message.includes("expired")) {
        onExpired(drop);
      } else {
        setError(err.message || "Failed to claim drop. Please verify your wallet network.");
      }
    } finally {
      setClaiming(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-navy-900 mx-auto" />
        <p className="text-sm text-gray-500 mt-3">Reading drop from Avalanche Fuji...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto py-16 text-center animate-fade-in">
        <div className="w-14 h-14 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-bold text-navy-900">Unable to Load Drop</h2>
        <p className="text-sm text-gray-500 mt-2">{error}</p>
        <button
          onClick={onBackToHome}
          className="mt-6 px-6 py-2.5 rounded-full bg-navy-900 text-white text-xs font-semibold"
        >
          Return to Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto py-6 sm:py-8 animate-slide-up text-center">
      {/* Back button */}
      <div className="text-left mb-3 sm:mb-4">
        <button
          onClick={onBackToHome}
          className="inline-flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-navy-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>
      </div>

      {/* Main Claim Card */}
      <div className="relative overflow-hidden rounded-[28px] sm:rounded-[36px] bg-white border border-gray-100 shadow-elevated p-6 sm:p-9">
        {/* Subtle decorative snow backdrop gradient */}
        <div className="absolute top-0 inset-x-0 h-28 sm:h-32 bg-gradient-to-b from-sky-50/70 to-transparent pointer-events-none" />

        <div className="relative z-10">
          {/* Flower Emblem */}
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white shadow-soft border border-gray-100 mx-auto flex items-center justify-center mb-3 sm:mb-4 p-2 sm:p-2.5">
            <SnowdropLogo size={32} className="sm:w-9 sm:h-9" />
          </div>

          <p className="text-[11px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider">
            You&apos;ve received a drop!
          </p>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-navy-900 tracking-tight my-2.5 sm:my-3">
            {drop.type === "group" ? drop.perClaim : drop.amount} AVAX
          </h1>

          <p className="text-xs text-gray-400 font-medium">From Snowdrop</p>

          {/* Group mode status */}
          {drop.type === "group" && (
            <div className="mt-2.5 sm:mt-3 inline-block px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-[11px] font-semibold border border-amber-100">
              Group Drop • {drop.maxClaims - drop.claimedCount} claims remaining
            </div>
          )}

          {/* Expiry Pill */}
          <div className="mt-5 sm:mt-6 inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-full bg-gray-50 border border-gray-100 text-[11px] sm:text-xs font-medium text-gray-500">
            <Clock className="w-3.5 h-3.5 text-gray-400" />
            <span>This link will expire in {countdown || "24 hours"}</span>
          </div>

          {/* Claim Button */}
          <div className="mt-6 sm:mt-8">
            <button
              onClick={handleClaim}
              disabled={claiming}
              className="w-full bg-navy-900 hover:bg-navy-800 text-white font-semibold text-xs sm:text-sm py-3.5 sm:py-4 rounded-full shadow-card hover:shadow-elevated transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-98"
            >
              {claiming ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Claiming {drop.amount} AVAX...</span>
                </>
              ) : account ? (
                <span>Claim Now</span>
              ) : (
                <span>Connect Wallet to Claim</span>
              )}
            </button>
          </div>

          {/* Card Footer */}
          <div className="mt-6 sm:mt-7 pt-4 sm:pt-5 border-t border-gray-100 flex items-center justify-center gap-1.5 text-[10px] sm:text-[11px] font-medium text-gray-400">
            <div className="w-2 h-2 rounded-full bg-avax" />
            <span>Powered by Avalanche Fuji</span>
          </div>
        </div>
      </div>
    </div>
  );
}
