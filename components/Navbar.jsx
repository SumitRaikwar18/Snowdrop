"use client";

import React, { useState } from "react";
import { useWallet } from "../lib/walletContext";
import { CONTRACT_ADDRESS, FUJI_EXPLORER_URL } from "../lib/mock";
import { ChevronDown, LogOut, ExternalLink, Copy, Check } from "lucide-react";

// Universal Snowdrop Snowflake Logo Image Component
export function SnowdropLogo({ size = 32, className = "" }) {
  return (
    <img
      src="/snowflake.png"
      alt="Snowdrop Logo"
      width={size}
      height={size}
      className={`object-contain flex-shrink-0 ${className}`}
    />
  );
}

export default function Navbar({ activeView, setActiveView }) {
  const { account, balance, openWalletModal, disconnectWallet } = useWallet();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [copiedAddr, setCopiedAddr] = useState(false);

  const formatAddress = (addr) => {
    if (!addr) return "";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const handleLogoClick = () => {
    // If wallet is connected, stay inside dashboard/app - NEVER jump back to landing page!
    if (account) {
      setActiveView("dashboard");
    } else {
      setActiveView("landing");
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
    setActiveView("landing");
    setDropdownOpen(false);
  };

  const handleCopyAddress = () => {
    if (typeof navigator !== "undefined" && account) {
      navigator.clipboard.writeText(account);
      setCopiedAddr(true);
      setTimeout(() => setCopiedAddr(false), 2000);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/70 border-b border-gray-100/60 transition-all">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12 h-16 sm:h-20 flex items-center justify-between">
        {/* Brand Logo - clicks to dashboard if logged in, otherwise landing */}
        <button
          onClick={handleLogoClick}
          className="flex items-center gap-2 sm:gap-3 group focus:outline-none"
        >
          <SnowdropLogo size={30} className="sm:w-[34px] sm:h-[34px] group-hover:rotate-12 transition-transform duration-300 drop-shadow-xs" />
          <span className="text-xl sm:text-2xl font-extrabold tracking-wider text-navy-900 font-sans uppercase">
            SNOWDROP
          </span>
        </button>

        {/* Right Action: Connect Wallet or Clean Account Pill */}
        <div className="flex items-center gap-2 sm:gap-3">
          {account ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 sm:gap-2.5 bg-white border border-gray-200/90 shadow-soft rounded-full pl-3 sm:pl-3.5 pr-3 sm:pr-4 py-1.5 sm:py-2 hover:border-gray-300 transition-all text-navy-900 text-xs sm:text-sm font-semibold"
              >
                <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
                <span className="font-mono">{formatAddress(account)}</span>
                <span className="hidden md:inline text-xs font-semibold px-2 py-0.5 rounded-full bg-snowblue-50 text-snowblue-700">
                  {balance} AVAX
                </span>
                <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
              </button>

              {/* Clean, focused wallet dropdown (No redundant "Open Dashboard" button) */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-[calc(100vw-32px)] max-w-xs sm:w-64 bg-white rounded-3xl shadow-elevated border border-gray-100 py-3 z-50 animate-fade-in text-left">
                  {/* Account Info Header */}
                  <div className="px-4 pb-3 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        Connected to Fuji
                      </span>
                      <button
                        onClick={handleCopyAddress}
                        className="text-[11px] text-snowblue-600 hover:underline flex items-center gap-1 font-semibold"
                      >
                        {copiedAddr ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-600">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-xs font-mono font-medium text-navy-900 mt-1 break-all bg-gray-50 p-2 rounded-xl border border-gray-100">
                      {account}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500 mt-2 font-medium">
                      <span>Balance</span>
                      <span className="font-bold text-navy-900">{balance} AVAX</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 px-2 space-y-1">
                    <a
                      href={`${FUJI_EXPLORER_URL}/address/${account}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between px-3 py-2 text-xs font-medium text-gray-600 hover:text-navy-900 hover:bg-gray-50 rounded-xl transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                        View on Snowtrace
                      </span>
                    </a>

                    <button
                      onClick={handleDisconnect}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Disconnect Wallet</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={openWalletModal}
              className="bg-navy-900 hover:bg-navy-800 text-white font-semibold text-xs sm:text-sm px-5 sm:px-7 py-2.5 sm:py-3 rounded-full shadow-md shadow-navy-900/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
