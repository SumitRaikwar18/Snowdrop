import React, { useState } from "react";
import { ArrowLeft, Loader2, Sparkles, Clock, Users, ShieldAlert, ExternalLink } from "lucide-react";
import { createMockDrop, saveRealDropToHistory } from "../lib/mock";
import { createRealDrop, SNOWDROP_CONTRACT_ADDRESS } from "../lib/contract";
import { useWallet } from "../lib/walletContext";

export default function CreateDropForm({ initialMode = "single", onBack, onCreated }) {
  const { account, balance, signer, openWalletModal, refreshBalance } = useWallet();

  const [mode, setMode] = useState(initialMode); // "single" | "group"
  const [amount, setAmount] = useState("0.05");
  const [maxClaims, setMaxClaims] = useState(5);
  const [expiryHours, setExpiryHours] = useState(24);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const expiryOptions = [
    { label: "1 hour", value: 1 },
    { label: "24 hours", value: 24 },
    { label: "7 days", value: 168 },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!account) {
      openWalletModal();
      return;
    }

    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      setError("Please enter a valid amount greater than 0");
      return;
    }
    if (numAmount > parseFloat(balance)) {
      setError(`Insufficient balance. You have ${balance} AVAX.`);
      return;
    }

    setError("");
    setLoading(true);

    try {
      let drop;
      const isContractConfigured =
        SNOWDROP_CONTRACT_ADDRESS &&
        SNOWDROP_CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000";

      if (signer && isContractConfigured) {
        // Execute Real Avalanche Fuji On-Chain Transaction!
        drop = await createRealDrop({
          signer,
          amount: numAmount,
          expiryHours,
          type: mode,
          maxClaims: mode === "group" ? maxClaims : 1,
          perClaim: mode === "group" ? (numAmount / maxClaims).toFixed(4) : "0",
        });
        saveRealDropToHistory(drop);
        if (refreshBalance) refreshBalance();
      } else {
        // Instant Simulation / Demo Mode
        drop = await createMockDrop({
          amount: numAmount,
          expiryHours,
          type: mode,
          maxClaims: mode === "group" ? maxClaims : 1,
          sender: account,
        });
      }
      onCreated(drop);
    } catch (err) {
      console.error("Drop creation failed:", err);
      setError(err.message || "Failed to create drop. Please verify your balance and network.");
    } finally {
      setLoading(false);
    }
  };

  const getExpiryLabel = (hours) => {
    if (hours === 1) return "1 hour";
    if (hours === 24) return "24 hours";
    if (hours === 168) return "7 days";
    return `${hours} hours`;
  };

  return (
    <div className="animate-fade-in text-left">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-navy-900 transition-colors mb-6 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span>Back to Dashboard</span>
      </button>

      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-navy-900 tracking-tight">
          {mode === "single" ? "Create Single Drop" : "Create Group Drop"}
        </h1>
        <p className="text-sm sm:text-base text-gray-500 mt-1 font-normal">
          {mode === "single"
            ? "Send AVAX to anyone with a link."
            : "One link for multiple recipients. First N claimers get paid."}
        </p>
      </div>

      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left Column: Form Controls */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 bg-white rounded-[28px] sm:rounded-[36px] p-5 sm:p-8 lg:p-9 border border-gray-100 shadow-soft space-y-5 sm:space-y-6">
          {/* Mode Switcher Tabs */}
          <div className="flex rounded-2xl bg-gray-100 p-1.5 border border-gray-200/50 w-full max-w-[280px] sm:max-w-xs">
            <button
              type="button"
              onClick={() => setMode("single")}
              className={`flex-1 py-2 sm:py-2.5 text-xs font-bold rounded-xl transition-all ${
                mode === "single"
                  ? "bg-white text-navy-900 shadow-sm"
                  : "text-gray-500 hover:text-navy-900"
              }`}
            >
              Single Drop
            </button>
            <button
              type="button"
              onClick={() => setMode("group")}
              className={`flex-1 py-2 sm:py-2.5 text-xs font-bold rounded-xl transition-all ${
                mode === "group"
                  ? "bg-white text-navy-900 shadow-sm"
                  : "text-gray-500 hover:text-navy-900"
              }`}
            >
              Group Drop
            </button>
          </div>

          {/* Amount Field */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              {mode === "single" ? "Amount (AVAX)" : "Total Amount (AVAX)"}
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.001"
                min="0.001"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.05"
                className="w-full pl-3.5 sm:pl-4 pr-16 py-3.5 sm:py-4 bg-gray-50/70 border border-gray-200 rounded-2xl text-navy-900 font-extrabold text-lg sm:text-xl focus:outline-none focus:ring-2 focus:ring-snowblue-500/30 focus:border-snowblue-500 focus:bg-white transition-all"
                required
              />
              <div className="absolute right-3.5 sm:right-4 top-1/2 -translate-y-1/2 text-xs sm:text-sm font-extrabold text-gray-400">
                AVAX
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 mt-2.5 text-xs">
              <span className="text-gray-400">
                Available:{" "}
                <strong className="text-navy-900 font-bold">
                  {balance} AVAX
                </strong>
              </span>
              <div className="flex items-center gap-3">
                <a
                  href="https://build.avax.network/console/primary-network/faucet"
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 hover:underline font-semibold inline-flex items-center gap-1"
                >
                  <span>Need AVAX? Faucet</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <button
                  type="button"
                  onClick={() => setAmount(balance)}
                  className="text-snowblue-600 font-bold hover:underline"
                >
                  Use Max
                </button>
              </div>
            </div>
          </div>

          {/* Group Drop: Max Claims */}
          {mode === "group" && (
            <div className="p-4 sm:p-5 bg-amber-50/50 rounded-2xl border border-amber-100">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-amber-900">
                  Number of Claimers (2 - 20)
                </label>
                <span className="text-xs sm:text-sm font-extrabold text-amber-900 px-2.5 sm:px-3 py-1 bg-white rounded-xl border border-amber-200 shadow-2xs">
                  {maxClaims} claimers
                </span>
              </div>
              <input
                type="range"
                min="2"
                max="20"
                value={maxClaims}
                onChange={(e) => setMaxClaims(parseInt(e.target.value))}
                className="w-full accent-amber-600 cursor-pointer mt-2"
              />
              <div className="flex justify-between items-center text-xs text-amber-800 font-medium mt-2.5">
                <span>Each claimer receives:</span>
                <strong className="font-extrabold">
                  {(parseFloat(amount || 0) / maxClaims).toFixed(4)} AVAX
                </strong>
              </div>
            </div>
          )}

          {/* Expiry Selector */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Expiry
            </label>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {expiryOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setExpiryHours(opt.value)}
                  className={`py-3 sm:py-3.5 px-2 sm:px-4 rounded-xl sm:rounded-2xl text-[11px] sm:text-xs font-extrabold border transition-all ${
                    expiryHours === opt.value
                      ? "border-snowblue-500 bg-snowblue-50/70 text-snowblue-700 shadow-2xs"
                      : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2.5 p-3.5 sm:p-4 bg-red-50 text-red-700 text-xs rounded-2xl border border-red-100">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-navy-900 hover:bg-navy-800 text-white font-bold text-xs sm:text-sm py-3.5 sm:py-4 rounded-full shadow-card hover:shadow-elevated transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating Drop on Fuji...</span>
              </>
            ) : (
              <span>Create Drop</span>
            )}
          </button>
        </form>

        {/* Right Column: Live Sticky "Drop Details" Card */}
        <div className="lg:col-span-5 w-full">
          <div className="bg-white rounded-[28px] sm:rounded-[36px] p-5 sm:p-7 border border-gray-100 shadow-soft sticky top-28">
            <h3 className="font-extrabold text-navy-900 text-base mb-4">
              Drop Details
            </h3>

            <div className="space-y-3.5 sm:space-y-4 text-xs sm:text-sm pb-5 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Type</span>
                <span className="font-bold text-navy-900 capitalize">
                  {mode} Drop
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Total Amount</span>
                <span className="font-extrabold text-navy-900 text-base">
                  {amount || "0"} AVAX
                </span>
              </div>
              {mode === "group" && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Claims Limit</span>
                  <span className="font-bold text-navy-900">
                    {maxClaims} claimers
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Expiry</span>
                <span className="font-bold text-navy-900">
                  {getExpiryLabel(expiryHours)}
                </span>
              </div>
            </div>

            <div className="mt-4 sm:mt-5">
              <p className="text-xs text-gray-400 leading-relaxed">
                The link will be valid for {getExpiryLabel(expiryHours)}. If not
                claimed in time, funds will be automatically refundable to your
                wallet.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
