"use client";

import React, { useState } from "react";
import QRCode from "react-qr-code";
import {
  Link as LinkIcon,
  Play,
  ArrowRight,
  Copy,
  Check,
  Clock,
  ArrowUpDown,
  Users,
  Shield,
  ExternalLink,
  KeyRound,
  Share2,
  Zap,
  CheckCircle2,
  RotateCcw,
} from "lucide-react";
import { useWallet } from "../lib/walletContext";
import { SnowdropLogo } from "./Navbar";
import AnimatedPhoneMockup from "./AnimatedPhoneMockup";
import { CONTRACT_ADDRESS, FUJI_EXPLORER_URL } from "../lib/mock";

export default function LandingView({ onNavigate }) {
  const { account, openWalletModal } = useWallet();
  const [copied, setCopied] = useState(false);

  const sampleLink = "https://snowdrop.app/claim#s=7f3c...";

  const handleCopy = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(
        "https://snowdrop.app/claim#s=7f3c9e2184ad64b910486c231758ba1048e9c35b849103c829e8471b058a4a9e"
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCreate = () => {
    if (account) {
      onNavigate("dashboard");
    } else {
      openWalletModal();
    }
  };

  return (
    <div className="relative w-full overflow-hidden">
      {/* 
        Full-Bleed 100vw Panoramic Background Image:
        Snowdrops Beneath Sunrise Mountains (hero-bg.png)
      */}
      <div className="absolute inset-x-0 top-0 z-0 h-[680px] sm:h-[760px] lg:h-[840px] xl:h-[880px] w-full overflow-hidden pointer-events-none select-none">
        <img
          src="/hero-bg.png"
          alt="Snowdrops beneath sunrise mountains"
          className="w-full h-full object-cover object-[center_30%] opacity-90"
        />
        {/* Natural gradient fade at bottom to seamlessly blend into page background #F8FAF8 */}
        <div className="absolute inset-x-0 bottom-0 h-48 sm:h-56 bg-gradient-to-t from-[#F8FAF8] via-[#F8FAF8]/60 to-transparent" />
        {/* Subtle white vignette behind text for ultra-sharp readability without obscuring mountains */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/75 via-white/25 to-transparent" />
      </div>

      {/* Hero Section Container (Full room, generous width) */}
      <section className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12 pt-6 sm:pt-10 pb-16 sm:pb-20 lg:pt-16 lg:pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 lg:gap-8 items-center">
          {/* Left Column: Headline, Subtitle & CTAs */}
          <div className="lg:col-span-6 space-y-5 sm:space-y-7 text-left relative z-10">
            {/* Pill Tag & Quick Faucet Link */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white/90 backdrop-blur-md border border-[#D9E6FE] text-[#2563EB] text-xs sm:text-sm font-semibold shadow-xs">
                <LinkIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Send AVAX to anyone with a link</span>
              </div>
              <a
                href="https://build.avax.network/console/primary-network/faucet"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full bg-white/90 backdrop-blur-md border border-gray-200/80 hover:border-blue-300 text-navy-800 hover:text-blue-600 text-xs font-semibold shadow-xs transition-all group"
              >
                <span>💧 Free Fuji Faucet</span>
                <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-blue-600 transition-colors" />
              </a>
            </div>

            {/* Main Headline (2 Clean Unbroken Lines on desktop/tablet, naturally wrapping on mobile) */}
            <h1 className="text-4xl sm:text-6xl lg:text-[68px] xl:text-[74px] font-extrabold tracking-[-0.03em] sm:tracking-[-0.035em] text-navy-900 leading-[1.08] sm:leading-[1.05]">
              <span className="block sm:whitespace-nowrap">Money falls like snow.</span>
              <span className="block mt-1 sm:whitespace-nowrap">
                Anyone can <span className="text-[#2563EB]">catch it.</span>
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-xl text-gray-700 leading-relaxed max-w-xl font-normal">
              Snowdrop lets you send AVAX to anyone, anywhere — no wallet address
              needed. Just create a link, share it, and let them claim.
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-2">
              <button
                onClick={handleCreate}
                className="inline-flex items-center justify-center gap-2.5 bg-navy-900 hover:bg-navy-800 text-white font-bold text-sm sm:text-base px-7 sm:px-8 py-3.5 sm:py-4 rounded-full shadow-card hover:shadow-elevated transition-all hover:scale-[1.01] active:scale-[0.98]"
              >
                <span>Create a Drop</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  const el = document.getElementById("how-it-works");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="inline-flex items-center justify-center gap-2.5 bg-white/95 hover:bg-white text-navy-900 font-bold text-sm sm:text-base px-6 sm:px-7 py-3.5 sm:py-4 rounded-full border border-gray-200/90 shadow-soft transition-all"
              >
                <div className="w-5 h-5 rounded-full bg-navy-900 text-white flex items-center justify-center">
                  <Play className="w-2.5 h-2.5 fill-current ml-0.5" />
                </div>
                <span>How it works</span>
              </button>
            </div>
          </div>

          {/* Right Column: Hero Graphic Pair (Card + Live Animated Phone) */}
          <div className="lg:col-span-6 flex items-center justify-center lg:justify-end">
            <div className="relative flex flex-col sm:flex-row items-center justify-center gap-5 w-full max-w-xl mx-auto lg:mx-0">
              {/* Card 1: Your Drop is Ready */}
              <div className="w-full max-w-[320px] sm:w-[305px] bg-white/95 backdrop-blur-md rounded-[28px] sm:rounded-[32px] p-5 sm:p-7 shadow-elevated border border-gray-100 flex flex-col justify-between transition-transform hover:-translate-y-1 duration-300">
                <div>
                  <h3 className="font-extrabold text-navy-900 text-base">
                    Your Drop is Ready
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Share this link or scan the QR code
                  </p>

                  {/* Share Link Input */}
                  <div className="mt-4 flex items-center justify-between bg-gray-50 rounded-xl px-3 sm:px-3.5 py-2.5 border border-gray-200/70">
                    <span className="text-xs font-mono text-gray-600 truncate max-w-[150px] sm:max-w-[170px]">
                      {sampleLink}
                    </span>
                    <button
                      onClick={handleCopy}
                      className="p-1 text-gray-400 hover:text-navy-900 transition-colors"
                      title="Copy Link"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* QR Code Container */}
                  <div className="mt-4 p-3 bg-white rounded-2xl border border-gray-100 shadow-2xs flex items-center justify-center">
                    <QRCode
                      value="https://snowdrop.app/claim#s=7f3c9e2184ad64b910486c231758ba1048e9c35b849103c829e8471b058a4a9e"
                      size={120}
                      style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                      viewBox={`0 0 120 120`}
                    />
                  </div>

                  {/* Metadata Rows */}
                  <div className="mt-5 space-y-2.5 text-xs text-gray-600">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-gray-400">
                        <Clock className="w-3.5 h-3.5" /> Amount
                      </span>
                      <span className="font-extrabold text-navy-900 text-sm">0.05 AVAX</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-gray-400">
                        <Clock className="w-3.5 h-3.5" /> Expires in
                      </span>
                      <span className="font-semibold text-navy-900">24 hours</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-gray-400">
                        <ArrowUpDown className="w-3.5 h-3.5" /> Type
                      </span>
                      <span className="font-semibold text-navy-900">Single drop</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-center gap-1.5 text-[11px] font-medium text-gray-400">
                  <div className="w-2 h-2 rounded-full bg-avax" />
                  <span>Powered by Avalanche</span>
                </div>
              </div>

              {/* Card 2: Interactive Animated Phone Mockup */}
              <AnimatedPhoneMockup />
            </div>
          </div>
        </div>
      </section>

      {/* WHY SNOWDROP Bento Grid Section */}
      <section id="why-snowdrop" className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12 py-16 sm:py-24 border-t border-gray-200/60">
        <div className="text-left mb-10 sm:mb-14">
          <p className="text-xs sm:text-sm font-extrabold tracking-widest text-[#2563EB] uppercase">
            WHY SNOWDROP
          </p>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-navy-900 mt-2 tracking-tight">
            Simple. Secure. On-chain.
          </h2>
          <p className="text-base sm:text-lg text-gray-500 mt-2">
            Built for real people, not just crypto users.
          </p>
        </div>

        {/* Bento Grid Layout (Spacious 4-Column Cards, 1 on mobile, 2 on tablet, 4 on desktop) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Bento Card 1: One Link. Done. */}
          <div className="bg-white rounded-[28px] sm:rounded-[36px] p-6 sm:p-8 border border-gray-100 shadow-soft hover:shadow-card hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#EEF4FF] text-[#2563EB] flex items-center justify-center mb-5 sm:mb-7">
                <LinkIcon className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-navy-900 mb-2 sm:mb-2.5">
                One Link. Done.
              </h3>
              <p className="text-sm sm:text-base text-gray-500 leading-relaxed mb-6">
                No wallet address. No complicated steps. Just a link.
              </p>
            </div>

            <div className="p-3 sm:p-3.5 bg-gray-50 rounded-2xl border border-gray-100 text-xs font-mono text-gray-400 flex items-center justify-between">
              <span className="truncate">https://snowdrop.app/#s=...</span>
              <span className="text-emerald-600 font-sans font-bold text-xs ml-1">
                Active
              </span>
            </div>
          </div>

          {/* Bento Card 2: Group Drops */}
          <div className="bg-white rounded-[28px] sm:rounded-[36px] p-6 sm:p-8 border border-gray-100 shadow-soft hover:shadow-card hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#ECFDF5] text-[#10B981] flex items-center justify-center mb-5 sm:mb-7">
                <Users className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-navy-900 mb-2 sm:mb-2.5">
                Group Drops
              </h3>
              <p className="text-sm sm:text-base text-gray-500 leading-relaxed mb-6">
                Send to multiple people. First N claimers get paid.
              </p>
            </div>

            <div className="p-3 sm:p-3.5 bg-emerald-50/60 rounded-2xl border border-emerald-100 text-xs text-emerald-800 flex items-center justify-between font-semibold">
              <span>5 claimers</span>
              <span className="font-extrabold">0.02 AVAX each</span>
            </div>
          </div>

          {/* Bento Card 3: Auto Refund */}
          <div className="bg-white rounded-[28px] sm:rounded-[36px] p-6 sm:p-8 border border-gray-100 shadow-soft hover:shadow-card hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#F5F3FF] text-[#8B5CF6] flex items-center justify-center mb-5 sm:mb-7">
                <Clock className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-navy-900 mb-2 sm:mb-2.5">
                Auto Refund
              </h3>
              <p className="text-sm sm:text-base text-gray-500 leading-relaxed mb-6">
                If it&apos;s not claimed in time, funds go back to you.
              </p>
            </div>

            <div className="p-3 sm:p-3.5 bg-purple-50/60 rounded-2xl border border-purple-100 text-xs text-purple-800 flex items-center justify-between font-semibold">
              <span>Expiry countdown</span>
              <span className="font-extrabold">24h &rarr; 100% refund</span>
            </div>
          </div>

          {/* Bento Card 4: Fully On-chain */}
          <div className="bg-white rounded-[28px] sm:rounded-[36px] p-6 sm:p-8 border border-gray-100 shadow-soft hover:shadow-card hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#FFF7ED] text-[#F97316] flex items-center justify-center mb-5 sm:mb-7">
                <Shield className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-navy-900 mb-2.5">
                Fully On-chain
              </h3>
              <p className="text-sm sm:text-base text-gray-500 leading-relaxed mb-6">
                Transparent, secure, and non-custodial.
              </p>
            </div>

            <div className="p-3 sm:p-3.5 bg-amber-50/60 rounded-2xl border border-amber-100 text-xs text-amber-800 flex items-center justify-between font-semibold">
              <span>Avalanche Fuji</span>
              <span className="font-extrabold">Chain 43113</span>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS Bento Grid Section */}
      <section id="how-it-works" className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12 py-16 sm:py-24 border-t border-gray-200/60">
        <div className="text-left mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/60 text-[#2563EB] text-xs font-extrabold uppercase tracking-widest mb-3">
            <span>HOW IT WORKS</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-navy-900 tracking-tight">
            Send & Claim in 3 Simple Steps
          </h2>
          <p className="text-base sm:text-lg text-gray-500 mt-2 max-w-2xl font-normal">
            Fully non-custodial, cryptographic link drops on Avalanche C-Chain. The private secret never leaves your device.
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5 sm:gap-6">
          {/* Bento Card 1: Step 01 */}
          <div className="lg:col-span-6 bg-white rounded-[28px] sm:rounded-[36px] p-6 sm:p-8 lg:p-9 border border-gray-100 shadow-soft hover:shadow-card hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-5 sm:mb-6">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#EEF4FF] text-[#2563EB] flex items-center justify-center">
                  <KeyRound className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.2]" />
                </div>
                <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                  STEP 01
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-navy-900 mb-2">
                1. Lock AVAX & Generate Secret
              </h3>
              <p className="text-sm sm:text-base text-gray-500 leading-relaxed mb-6 font-normal">
                Choose the amount (e.g. 0.05 AVAX) and expiry. Your browser generates a 32-byte secret key locally. The smart contract only receives its hash <code className="bg-gray-100 text-blue-700 px-1.5 py-0.5 rounded font-mono text-xs font-semibold">keccak256(secret)</code>.
              </p>
            </div>

            <div className="p-3.5 bg-gray-50/90 rounded-2xl border border-gray-100 font-mono text-xs space-y-1.5">
              <div className="flex items-center justify-between text-gray-500">
                <span>Secret (In Browser)</span>
                <span className="text-gray-800 font-bold truncate max-w-[160px]">0x4e69b2d8...</span>
              </div>
              <div className="flex items-center justify-between text-gray-500">
                <span>Contract Commit</span>
                <span className="text-blue-600 font-bold truncate max-w-[160px]">keccak256(secret)</span>
              </div>
            </div>
          </div>

          {/* Bento Card 2: Step 02 */}
          <div className="lg:col-span-6 bg-white rounded-[28px] sm:rounded-[36px] p-6 sm:p-8 lg:p-9 border border-gray-100 shadow-soft hover:shadow-card hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-5 sm:mb-6">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#ECFDF5] text-[#10B981] flex items-center justify-center">
                  <Share2 className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.2]" />
                </div>
                <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                  STEP 02
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-navy-900 mb-2">
                2. Share via Any App or QR Code
              </h3>
              <p className="text-sm sm:text-base text-gray-500 leading-relaxed mb-6 font-normal">
                Share via Telegram, WhatsApp, Discord, or QR. The secret lives solely in the URL fragment <code className="bg-gray-100 text-emerald-700 px-1.5 py-0.5 rounded font-mono text-xs font-semibold">#s=...</code> — meaning it is strictly client-side and never touches any web server.
              </p>
            </div>

            <div className="p-3.5 bg-emerald-50/50 rounded-2xl border border-emerald-100/80 font-mono text-xs space-y-1.5 text-emerald-900">
              <div className="flex items-center justify-between">
                <span>URL Fragment</span>
                <span className="font-bold truncate max-w-[170px]">https://snowdrop.app/#s=...</span>
              </div>
              <div className="flex items-center justify-between text-emerald-700">
                <span>Server Traffic</span>
                <span className="font-bold">Zero-Knowledge (Hidden)</span>
              </div>
            </div>
          </div>

          {/* Bento Card 3: Step 03 */}
          <div className="lg:col-span-7 bg-white rounded-[28px] sm:rounded-[36px] p-6 sm:p-8 lg:p-9 border border-gray-100 shadow-soft hover:shadow-card hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-5 sm:mb-6">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#F5F3FF] text-[#8B5CF6] flex items-center justify-center">
                  <Zap className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.2]" />
                </div>
                <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-100">
                  STEP 03
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-navy-900 mb-2">
                3. Instant 1-Click Claim
              </h3>
              <p className="text-sm sm:text-base text-gray-500 leading-relaxed mb-6 font-normal">
                The recipient opens the link in any mobile or desktop wallet and clicks <strong>Claim Now</strong>. The smart contract validates the cryptographic preimage and transfers AVAX directly to their address in under 1 second.
              </p>
            </div>

            <div className="p-3.5 bg-purple-50/50 rounded-2xl border border-purple-100/80 text-xs text-purple-900 flex flex-wrap items-center justify-between gap-2 font-semibold">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-purple-600" />
                <span>On-Chain Finality: &lt; 1 sec</span>
              </div>
              <span className="font-mono text-purple-700 bg-white/80 px-2 py-0.5 rounded-lg border border-purple-100">Gas &lt; $0.001</span>
            </div>
          </div>

          {/* Bento Card 4: Step 04 */}
          <div className="lg:col-span-5 bg-white rounded-[28px] sm:rounded-[36px] p-6 sm:p-8 lg:p-9 border border-gray-100 shadow-soft hover:shadow-card hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-5 sm:mb-6">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#FFF7ED] text-[#F97316] flex items-center justify-center">
                  <RotateCcw className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.2]" />
                </div>
                <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-100">
                  SAFETY LOCK
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-navy-900 mb-2">
                100% Safety Refund
              </h3>
              <p className="text-sm sm:text-base text-gray-500 leading-relaxed mb-6 font-normal">
                Never lose funds. If a link expires before being claimed, the original sender can reclaim 100% of their deposited AVAX with one click.
              </p>
            </div>

            <div className="p-3.5 bg-amber-50/60 rounded-2xl border border-amber-100/80 text-xs text-amber-900 flex items-center justify-between font-semibold">
              <span>Timelock Protection</span>
              <span className="font-bold text-amber-700">Zero Lost Funds</span>
            </div>
          </div>
        </div>
      </section>

      {/* Modern High-Impact Responsive Footer */}
      <footer className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12 pt-10 sm:pt-14 pb-16 sm:pb-20 border-t border-gray-200/60">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          {/* Logo & Tagline */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <SnowdropLogo size={28} />
            <span className="text-xl font-extrabold tracking-wider text-navy-900 uppercase">
              SNOWDROP
            </span>
            <span className="hidden sm:inline text-xs text-gray-400">
              — Send AVAX via link
            </span>
          </div>

          {/* Center Links */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-gray-500 font-medium">
            <a
              href={`${FUJI_EXPLORER_URL}/address/${CONTRACT_ADDRESS}`}
              target="_blank"
              rel="noreferrer"
              className="hover:text-navy-900 transition-colors flex items-center gap-1.5"
            >
              <span>Snowtrace Contract</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <a
              href="https://build.avax.network/console/primary-network/faucet"
              target="_blank"
              rel="noreferrer"
              className="hover:text-navy-900 transition-colors flex items-center gap-1"
            >
              <span>Avalanche Faucet</span>
              <ExternalLink className="w-3 h-3 text-gray-400" />
            </a>
          </div>

          {/* Right badge */}
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-400">
            <div className="w-2 h-2 rounded-full bg-avax" />
            <span>Powered by Avalanche</span>
          </div>
        </div>

        <div className="mt-8 sm:mt-10 text-center text-xs text-gray-400 border-t border-gray-100 pt-6">
          &copy; {new Date().getFullYear()} SNOWDROP. Built on Avalanche Fuji C-Chain.
        </div>
      </footer>
    </div>
  );
}
