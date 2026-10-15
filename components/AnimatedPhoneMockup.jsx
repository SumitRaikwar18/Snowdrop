"use client";

import React, { useState, useEffect } from "react";
import QRCode from "react-qr-code";
import { Check, Loader2, Link as LinkIcon, Send, Copy } from "lucide-react";
import { SnowdropLogo } from "./Navbar";

export default function AnimatedPhoneMockup() {
  // Phase 0: Sender creating drop
  // Phase 1: Link & QR generated
  // Phase 2: Recipient opens link & claims
  // Phase 3: Claimed successfully
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPhase((prev) => (prev + 1) % 4);
    }, phase === 3 ? 3600 : 3200);

    return () => clearTimeout(timer);
  }, [phase]);

  return (
    <div className="w-full max-w-[285px] sm:w-[295px] bg-[#0A101D] rounded-[38px] sm:rounded-[44px] p-2.5 sm:p-3 shadow-elevated border-[5px] sm:border-[6px] border-[#1E293B] transition-all hover:scale-[1.01] duration-300 select-none relative flex-shrink-0 mx-auto">
      {/* Outer Phone Shell */}
      <div className="relative rounded-[30px] sm:rounded-[34px] overflow-hidden bg-gradient-to-b from-[#E9F1FA] via-[#F4F8FC] to-white flex flex-col justify-between p-3.5 sm:p-4 min-h-[460px] sm:min-h-[480px] text-center shadow-inner">
        {/* Dynamic Island / Notch + Status bar */}
        <div className="flex items-center justify-between text-[10px] font-semibold text-gray-500 px-1 pt-0.5">
          <span>9:41</span>
          <div className="w-16 h-4 bg-[#0A101D] rounded-full mx-auto flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-[#1E293B] ml-6" />
          </div>
          <span className="flex items-center gap-1 font-mono text-[9px]">5G 📶</span>
        </div>

        {/* Phase Indicator Pill (Clean, automatic, no buttons) */}
        <div className="mt-2 mb-1">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-wide uppercase bg-white/95 text-navy-900 border border-gray-200/70 shadow-2xs">
            {phase === 0 && "1. Create Drop"}
            {phase === 1 && "2. Link & QR Ready"}
            {phase === 2 && "3. Recipient Claims"}
            {phase === 3 && "4. Instant Transfer"}
          </span>
        </div>

        {/* Dynamic Animated Content Container */}
        <div className="my-auto py-1">
          {/* PHASE 0: Link Creation Flow */}
          {phase === 0 && (
            <div className="animate-fade-in bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-sm border border-white/80 text-left space-y-3">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                <SnowdropLogo size={18} />
                <span className="text-xs font-bold text-navy-900">Create Single Drop</span>
              </div>

              <div>
                <span className="text-[10px] text-gray-400 font-semibold uppercase">Amount</span>
                <div className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2 border border-gray-150 mt-1">
                  <span className="font-extrabold text-navy-900 text-sm">0.05</span>
                  <span className="text-[10px] font-bold text-gray-400">AVAX</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] text-gray-500">
                <span>Expiry</span>
                <span className="font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700">24 hours</span>
              </div>

              {/* Animated Create button with pulse */}
              <div className="pt-1">
                <div className="w-full bg-navy-900 text-white font-semibold text-xs py-2.5 rounded-full text-center flex items-center justify-center gap-1.5 shadow-sm">
                  <span>Create Drop</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                </div>
              </div>
            </div>
          )}

          {/* PHASE 1: Link & QR Generated */}
          {phase === 1 && (
            <div className="animate-fade-in bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-sm border border-white/80 space-y-2">
              <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                <Check className="w-4 h-4 stroke-[3]" />
              </div>
              <p className="text-xs font-bold text-navy-900">Drop Ready to Share!</p>

              {/* QR Code Container with clean padding */}
              <div className="p-2 bg-white rounded-xl border border-gray-150 shadow-2xs inline-block">
                <QRCode
                  value="https://snowdrop.app/claim#s=7f3c9e2184ad64b910486c231758ba1048e9c35b849103c829e8471b058a4a9e"
                  size={80}
                />
              </div>

              {/* Copy link preview */}
              <div className="bg-gray-50 rounded-xl px-2.5 py-1.5 text-[9px] font-mono text-gray-500 border border-gray-200/60 flex items-center justify-between">
                <span className="truncate max-w-[130px]">snowdrop.app/#s=7f3c...</span>
                <span className="text-emerald-600 font-semibold font-sans text-[9px] flex items-center gap-0.5">
                  <Check className="w-2.5 h-2.5" /> Copied
                </span>
              </div>
            </div>
          )}

          {/* PHASE 2: Recipient Opens Link & Clicks Claim */}
          {phase === 2 && (
            <div className="animate-fade-in">
              <div className="w-9 h-9 mx-auto flex items-center justify-center mb-1">
                <SnowdropLogo size={28} />
              </div>

              <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-sm border border-white/80 text-center">
                <p className="text-[10px] text-gray-500 font-medium">You&apos;ve received</p>
                <p className="text-2xl font-extrabold text-navy-900 my-0.5 tracking-tight">
                  0.05 AVAX
                </p>
                <p className="text-[9px] text-gray-400">Expires in 24 hours</p>

                <div className="mt-3 bg-navy-900 text-white font-semibold text-xs py-2.5 rounded-full shadow-sm flex items-center justify-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-snowblue-400" />
                  <span>Claiming on Fuji...</span>
                </div>
              </div>
            </div>
          )}

          {/* PHASE 3: Claimed Successfully! */}
          {phase === 3 && (
            <div className="animate-slide-up bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-sm border border-white/80 space-y-1.5">
              <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm ring-4 ring-emerald-50">
                <Check className="w-4 h-4 stroke-[3]" />
              </div>
              <p className="text-sm font-extrabold text-navy-900">
                Claimed Successfully!
              </p>
              <p className="text-xs font-bold text-emerald-600">
                +0.05 AVAX sent to wallet
              </p>
              <p className="text-[9px] text-gray-400 font-mono">
                tx: 0x9c31...5c21 (Fuji)
              </p>
            </div>
          )}
        </div>

        {/* Mobile Footer */}
        <div className="pt-2 flex items-center justify-center gap-1 text-[9px] text-gray-400 font-medium border-t border-gray-100/60">
          <div className="w-1.5 h-1.5 rounded-full bg-avax" />
          <span>Powered by Avalanche</span>
        </div>
      </div>
    </div>
  );
}
