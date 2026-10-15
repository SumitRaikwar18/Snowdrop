"use client";

import React from "react";
import { Clock, ArrowRight, ShieldAlert } from "lucide-react";

export default function ExpiredView({ drop, onNavigateHome }) {
  const refundedTo = drop?.sender || "0x3fC8...8a2C";
  const amount = drop?.amount || "0.05";

  const formatAddress = (addr) => {
    if (!addr) return "";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="max-w-md mx-auto py-8 sm:py-12 animate-slide-up text-center">
      <div className="bg-white rounded-[28px] sm:rounded-[36px] p-6 sm:p-10 border border-gray-100 shadow-elevated">
        {/* Clock icon inside circle */}
        <div className="w-14 h-14 sm:w-18 sm:h-18 rounded-full bg-gray-100 text-gray-500 mx-auto flex items-center justify-center mb-5 sm:mb-6">
          <Clock className="w-7 h-7 sm:w-9 sm:h-9 stroke-[2.2]" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">
          This drop has expired
        </h1>

        <p className="text-xs sm:text-sm text-gray-500 mt-2 max-w-xs mx-auto leading-relaxed">
          The link is no longer valid. The funds have been refunded to the
          sender&apos;s wallet.
        </p>

        {/* Info Card */}
        <div className="mt-6 sm:mt-8 bg-gray-50 rounded-2xl p-4 sm:p-5 border border-gray-100 text-left space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Refunded to</span>
            <span className="font-mono font-semibold text-navy-900">
              {formatAddress(refundedTo)}
            </span>
          </div>
          <div className="flex items-center justify-between border-t border-gray-200/50 pt-2.5">
            <span className="text-gray-400">Amount</span>
            <span className="font-semibold text-navy-900 text-sm">
              {amount} AVAX
            </span>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-6 sm:mt-8">
          <button
            onClick={onNavigateHome}
            className="w-full inline-flex items-center justify-center gap-2 bg-navy-900 hover:bg-navy-800 text-white font-semibold text-xs sm:text-sm py-3.5 px-6 rounded-full shadow-card hover:shadow-elevated transition-all"
          >
            <span>Return to Home</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Footer */}
        <div className="mt-6 sm:mt-8 pt-4 sm:pt-5 border-t border-gray-100 flex items-center justify-center gap-1.5 text-[10px] sm:text-[11px] font-medium text-gray-400">
          <div className="w-2 h-2 rounded-full bg-avax" />
          <span>Powered by Avalanche Fuji Testnet</span>
        </div>
      </div>
    </div>
  );
}
