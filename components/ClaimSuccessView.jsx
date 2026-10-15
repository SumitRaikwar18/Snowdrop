"use client";

import React, { useEffect } from "react";
import confetti from "canvas-confetti";
import { Check, ExternalLink, ArrowRight, Sparkles } from "lucide-react";
import { FUJI_EXPLORER_URL } from "../lib/mock";

export default function ClaimSuccessView({ claimResult, onNavigateToSend }) {
  useEffect(() => {
    // Fire festive celebration confetti!
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#2563EB", "#10B981", "#E84142", "#132238"],
      });
    } catch (e) {
      console.warn("Confetti error", e);
    }
  }, []);

  const txHash = claimResult?.txHash || "0x9c31405a8b417e9231849102c981038e9105849b2c91038e910547b910485c21";
  const amount = claimResult?.amount || "0.05";

  return (
    <div className="max-w-md mx-auto py-8 sm:py-12 animate-slide-up text-center">
      <div className="bg-white rounded-[28px] sm:rounded-[36px] p-6 sm:p-10 border border-gray-100 shadow-elevated relative overflow-hidden">
        {/* Festive circle checkmark */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center mb-5 sm:mb-6 shadow-soft ring-6 sm:ring-8 ring-emerald-50">
          <Check className="w-8 h-8 sm:w-10 sm:h-10 stroke-[3]" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">
          Claimed Successfully!
        </h1>

        <p className="text-sm sm:text-base text-gray-600 mt-2">
          <strong className="text-navy-900 font-bold">{amount} AVAX</strong> has
          been sent to your wallet.
        </p>

        {/* Action Buttons */}
        <div className="mt-6 sm:mt-8 space-y-2.5 sm:space-y-3">
          <a
            href={`${FUJI_EXPLORER_URL}/tx/${txHash}`}
            target="_blank"
            rel="noreferrer"
            className="w-full inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-navy-900 font-semibold text-xs sm:text-sm py-3.5 px-5 sm:px-6 rounded-full border border-gray-200/80 shadow-sm transition-all"
          >
            <span>View on Snowtrace</span>
            <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
          </a>

          <button
            onClick={onNavigateToSend}
            className="w-full inline-flex items-center justify-center gap-2 bg-navy-900 hover:bg-navy-800 text-white font-semibold text-xs sm:text-sm py-3.5 px-5 sm:px-6 rounded-full shadow-card hover:shadow-elevated transition-all"
          >
            <span>Send a Drop Yourself</span>
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
