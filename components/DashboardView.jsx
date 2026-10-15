"use client";

import React from "react";
import { Link2, Users, ExternalLink, Activity, FileCode2, ArrowRight, Coins } from "lucide-react";
import { CONTRACT_ADDRESS, FUJI_EXPLORER_URL } from "../lib/mock";

const AVALANCHE_FAUCET_URL = "https://build.avax.network/console/primary-network/faucet";

export default function DashboardView({ onSelectMode, onNavigate }) {
  const formatContract = (addr) => {
    if (!addr) return "0x4f3a...982c";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in text-left">
      {/* Greeting Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-navy-900 tracking-tight">
            Good to see you!
          </h1>
          <p className="text-sm sm:text-base text-gray-500 mt-1 font-normal">
            Create a drop and share it with anyone.
          </p>
        </div>

        {/* Quick Faucet Link Button */}
        <a
          href={AVALANCHE_FAUCET_URL}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-blue-800 border border-blue-200/80 px-4 py-2 sm:py-2.5 rounded-full text-xs font-bold shadow-2xs hover:shadow-soft transition-all self-start sm:self-center group"
        >
          <Coins className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
          <span>Get Free Testnet AVAX (Faucet)</span>
          <ExternalLink className="w-3.5 h-3.5 text-blue-400 group-hover:text-blue-600 transition-colors" />
        </a>
      </div>

      {/* Two Big Mode Selection Cards (Single vs Group) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Single Drop Card */}
        <div className="bg-white rounded-[28px] sm:rounded-[36px] p-6 sm:p-8 lg:p-9 border border-gray-100 shadow-soft hover:shadow-card hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#EEF4FF] text-[#2563EB] flex items-center justify-center mb-5 sm:mb-6 shadow-2xs">
              <Link2 className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.2]" />
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-navy-900 mb-1.5 sm:mb-2">
              Single Drop
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-gray-500 leading-relaxed font-normal">
              One link &rarr; One claimer
            </p>
          </div>

          <div className="mt-6 sm:mt-8 pt-2">
            <button
              onClick={() => onSelectMode("single")}
              className="w-full bg-navy-900 hover:bg-navy-800 text-white font-bold text-xs sm:text-sm py-3.5 sm:py-4 rounded-full shadow-card hover:shadow-elevated transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
            >
              <span>Create</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Group Drop Card */}
        <div className="bg-white rounded-[28px] sm:rounded-[36px] p-6 sm:p-8 lg:p-9 border border-gray-100 shadow-soft hover:shadow-card hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#FFF7ED] text-[#F97316] flex items-center justify-center mb-5 sm:mb-6 shadow-2xs">
              <Users className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.2]" />
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-navy-900 mb-1.5 sm:mb-2">
              Group Drop
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-gray-500 leading-relaxed font-normal">
              One link &rarr; First N claimers
            </p>
          </div>

          <div className="mt-6 sm:mt-8 pt-2">
            <button
              onClick={() => onSelectMode("group")}
              className="w-full bg-navy-900 hover:bg-navy-800 text-white font-bold text-xs sm:text-sm py-3.5 sm:py-4 rounded-full shadow-card hover:shadow-elevated transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
            >
              <span>Create</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Network & Contract Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-5 pt-1">
        {/* Network Status Card */}
        <div className="bg-white rounded-2xl sm:rounded-[24px] p-4 sm:p-5 border border-gray-100 shadow-soft flex items-center gap-3.5 sm:gap-4">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <Activity className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-[10px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-wider">Network</p>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
              <p className="text-xs sm:text-sm font-bold text-navy-900">
                Avalanche Fuji (Testnet)
              </p>
            </div>
          </div>
        </div>

        {/* Contract Address Card */}
        <a
          href={`${FUJI_EXPLORER_URL}/address/${CONTRACT_ADDRESS}`}
          target="_blank"
          rel="noreferrer"
          className="bg-white rounded-2xl sm:rounded-[24px] p-4 sm:p-5 border border-gray-100 shadow-soft flex items-center justify-between hover:border-gray-200 hover:shadow-card transition-all group"
        >
          <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-blue-50 text-snowblue-600 flex items-center justify-center flex-shrink-0">
              <FileCode2 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-wider">Contract</p>
              <p className="text-xs sm:text-sm font-mono font-bold text-navy-900 group-hover:text-snowblue-600 transition-colors truncate">
                {formatContract(CONTRACT_ADDRESS)}
              </p>
            </div>
          </div>
          <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-snowblue-600 transition-colors mr-1 flex-shrink-0" />
        </a>
      </div>
    </div>
  );
}
