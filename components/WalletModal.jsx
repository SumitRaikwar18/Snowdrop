"use client";

import React, { useState } from "react";
import { useWallet } from "../lib/walletContext";
import { X, ChevronRight, AlertCircle, Loader2, Sparkles, ExternalLink, Search } from "lucide-react";

export default function WalletModal() {
  const {
    isWalletModalOpen,
    closeWalletModal,
    connectWallet,
    connectWatchAddress,
    connectMockFallback,
    walletError,
    connecting,
  } = useWallet();

  const [customAddress, setCustomAddress] = useState("");
  const [showAddressInput, setShowAddressInput] = useState(false);

  if (!isWalletModalOpen) return null;

  const wallets = [
    {
      id: "core",
      name: "Core Wallet",
      desc: "Official Avalanche Web3 Wallet by Ava Labs",
      badge: "Avalanche Native",
      icon: (
        <span className="w-10 h-10 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center text-2xl shadow-xs">
          🔺
        </span>
      ),
      isPrimary: true,
    },
    {
      id: "injected",
      name: "Browser Extension",
      desc: "Connect any Avalanche-compatible browser wallet",
      badge: "EIP-1193",
      icon: (
        <span className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-2xl shadow-xs">
          🌐
        </span>
      ),
    },
  ];

  const handleCustomAddressSubmit = (e) => {
    e.preventDefault();
    if (customAddress.trim()) {
      connectWatchAddress(customAddress.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={closeWalletModal}
        className="absolute inset-0 bg-navy-950/50 backdrop-blur-sm transition-opacity"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-card border border-gray-100 p-5 sm:p-7 z-10 animate-slide-up">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-navy-900 tracking-tight">
              Connect Fuji Wallet
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Live on Avalanche Fuji Testnet (Chain ID: 43113)
            </p>
          </div>
          <button
            onClick={closeWalletModal}
            className="p-1.5 text-gray-400 hover:text-navy-900 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error notification banner */}
        {walletError && (
          <div className="mb-4 p-3.5 bg-amber-50 rounded-2xl border border-amber-200/80 text-left space-y-2 animate-fade-in">
            <div className="flex items-start gap-2 text-amber-900 text-xs">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="leading-relaxed font-medium">
                {walletError}
              </div>
            </div>
            <div className="flex items-center gap-3 pt-1 border-t border-amber-200/60 text-xs">
              <button
                onClick={() => connectWallet("core")}
                className="font-semibold text-amber-800 hover:underline"
              >
                Retry Core Wallet
              </button>
              <span className="text-amber-300">•</span>
              <a
                href="https://core.app"
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-red-600 hover:underline inline-flex items-center gap-0.5"
              >
                <span>Install Core (core.app)</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <span className="text-amber-300">•</span>
              <button
                onClick={connectMockFallback}
                className="font-semibold text-amber-800 hover:underline"
              >
                Use Demo
              </button>
            </div>
          </div>
        )}

        {/* Wallet Options List */}
        <div className="space-y-2.5">
          {wallets.map((w) => (
            <button
              key={w.id}
              onClick={() => connectWallet(w.id)}
              disabled={connecting}
              className={`w-full flex items-center justify-between p-3.5 rounded-2xl border transition-all text-left group ${
                w.isPrimary
                  ? "border-red-200/80 bg-red-50/20 hover:border-red-300 hover:bg-red-50/40"
                  : "border-gray-100 hover:border-blue-200 hover:bg-blue-50/40"
              } active:scale-[0.99]`}
            >
              <div className="flex items-center gap-3">
                {w.icon}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-navy-900 group-hover:text-blue-900 transition-colors">
                      {w.name}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        w.isPrimary
                          ? "bg-red-100/70 text-red-700 border border-red-200/50"
                          : "bg-blue-50 text-blue-700"
                      }`}
                    >
                      {w.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    {w.desc}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-red-500 group-hover:translate-x-0.5 transition-all" />
            </button>
          ))}
        </div>

        {/* Custom Real Fuji Address Input Section */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          {!showAddressInput ? (
            <button
              onClick={() => setShowAddressInput(true)}
              className="w-full text-center text-xs font-semibold text-gray-500 hover:text-navy-900 py-1.5 transition-colors flex items-center justify-center gap-1.5"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Or connect any real Fuji address to watch live balance</span>
            </button>
          ) : (
            <form onSubmit={handleCustomAddressSubmit} className="space-y-2 animate-fade-in">
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider text-left">
                Enter Real Fuji C-Chain Address
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="0x..."
                  value={customAddress}
                  onChange={(e) => setCustomAddress(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs font-mono rounded-xl border border-gray-200 focus:outline-none focus:border-navy-900 focus:ring-1 focus:ring-navy-900"
                />
                <button
                  type="submit"
                  disabled={!customAddress.trim()}
                  className="px-3.5 py-2 text-xs font-semibold bg-navy-900 text-white rounded-xl hover:bg-navy-800 disabled:opacity-50 transition-colors"
                >
                  View Live
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Quick Instant Demo Account */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <button
            onClick={connectMockFallback}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-gray-50 hover:bg-gray-100 text-xs font-semibold text-gray-600 hover:text-navy-900 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Continue with Instant Demo Account (0.42 AVAX)</span>
          </button>
        </div>

        {/* Footer info */}
        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
          <span>Need Fuji Testnet AVAX?</span>
          <a
            href="https://build.avax.network/console/primary-network/faucet"
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 hover:underline inline-flex items-center gap-1 font-semibold"
          >
            <span>Official Avalanche Faucet</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
