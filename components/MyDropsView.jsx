"use client";

import React, { useState, useEffect } from "react";
import QRCode from "react-qr-code";
import {
  Clock,
  Users,
  Copy,
  Check,
  RotateCcw,
  ExternalLink,
  X,
  Loader2,
} from "lucide-react";
import { getMockUserDrops, refundMockDrop, FUJI_EXPLORER_URL } from "../lib/mock";
import { refundRealDrop, SNOWDROP_CONTRACT_ADDRESS } from "../lib/contract";
import { useWallet } from "../lib/walletContext";

export default function MyDropsView({ onSelectDropForClaim }) {
  const { account, signer, refreshBalance } = useWallet();
  const [drops, setDrops] = useState([]);
  const [filter, setFilter] = useState("all"); // "all" | "active" | "claimed" | "refunded"
  const [copiedId, setCopiedId] = useState(null);
  const [refundingCommit, setRefundingCommit] = useState(null);
  const [selectedModalDrop, setSelectedModalDrop] = useState(null);

  const loadDrops = () => {
    const list = getMockUserDrops();
    setDrops(list);
  };

  useEffect(() => {
    loadDrops();
  }, []);

  const handleCopy = (drop) => {
    if (typeof window !== "undefined" && navigator.clipboard) {
      const url = `${window.location.origin}/#s=${drop.secret}&m=${drop.type}`;
      navigator.clipboard.writeText(url);
      setCopiedId(drop.commit);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleRefund = async (drop) => {
    setRefundingCommit(drop.commit);
    try {
      const isContractConfigured =
        SNOWDROP_CONTRACT_ADDRESS &&
        SNOWDROP_CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000";

      if (signer && isContractConfigured) {
        await refundRealDrop({
          signer,
          commit: drop.commit,
          isGroup: drop.type === "group",
        });
        if (refreshBalance) refreshBalance();
      } else {
        await refundMockDrop(drop.commit, account);
      }
      loadDrops();
    } catch (err) {
      console.error("Refund failed", err);
    } finally {
      setRefundingCommit(null);
    }
  };

  // Filter drops
  const filteredDrops = drops.filter((d) => {
    if (filter === "all") return true;
    if (filter === "active") return d.status === "active";
    if (filter === "claimed") return d.status === "claimed";
    if (filter === "refunded") return d.status === "refunded";
    return true;
  });

  const countActive = drops.filter((d) => d.status === "active").length;
  const countClaimed = drops.filter((d) => d.status === "claimed").length;
  const countRefunded = drops.filter((d) => d.status === "refunded").length;

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
            Active
          </span>
        );
      case "claimed":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600 border border-red-100">
            Claimed
          </span>
        );
      case "refunded":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700 border border-gray-200">
            Refunded
          </span>
        );
      case "expired":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-100">
            Expired
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 sm:space-y-7 animate-fade-in text-left">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-navy-900 tracking-tight">
          My Drops
        </h1>
        <p className="text-sm sm:text-base text-gray-500 mt-1 font-normal">
          Track your created drops and manage them.
        </p>
      </div>

      {/* Filter Tabs (Horizontal scroll on mobile with zero wrapping) */}
      <div className="flex items-center gap-1.5 sm:gap-2 border-b border-gray-200/60 pb-3 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setFilter("all")}
          className={`px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex-shrink-0 ${
            filter === "all"
              ? "bg-navy-900 text-white shadow-sm"
              : "text-gray-500 hover:text-navy-900 hover:bg-gray-100"
          }`}
        >
          All ({drops.length})
        </button>
        <button
          onClick={() => setFilter("active")}
          className={`px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex-shrink-0 ${
            filter === "active"
              ? "bg-navy-900 text-white shadow-sm"
              : "text-gray-500 hover:text-navy-900 hover:bg-gray-100"
          }`}
        >
          Active ({countActive})
        </button>
        <button
          onClick={() => setFilter("claimed")}
          className={`px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex-shrink-0 ${
            filter === "claimed"
              ? "bg-navy-900 text-white shadow-sm"
              : "text-gray-500 hover:text-navy-900 hover:bg-gray-100"
          }`}
        >
          Claimed ({countClaimed})
        </button>
        <button
          onClick={() => setFilter("refunded")}
          className={`px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex-shrink-0 ${
            filter === "refunded"
              ? "bg-navy-900 text-white shadow-sm"
              : "text-gray-500 hover:text-navy-900 hover:bg-gray-100"
          }`}
        >
          Refunded ({countRefunded})
        </button>
      </div>

      {/* Drops List */}
      <div className="space-y-3 sm:space-y-3.5">
        {filteredDrops.length === 0 ? (
          <div className="bg-white rounded-[28px] sm:rounded-[32px] p-8 sm:p-12 text-center border border-gray-100 shadow-soft">
            <p className="text-sm text-gray-400">No drops found in this filter.</p>
          </div>
        ) : (
          filteredDrops.map((drop) => {
            const isRefunding = refundingCommit === drop.commit;
            const isExpired = drop.status === "expired" || (drop.status === "active" && Date.now() > drop.expiresAt);

            return (
              <div
                key={drop.commit}
                className="bg-white rounded-[22px] sm:rounded-[26px] p-4 sm:p-5 border border-gray-100 shadow-soft hover:shadow-card transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 sm:gap-4"
              >
                {/* Left Info */}
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  <div
                    className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                      drop.type === "group"
                        ? "bg-amber-50 text-amber-600"
                        : "bg-blue-50 text-blue-600"
                    }`}
                  >
                    {drop.type === "group" ? (
                      <Users className="w-5 h-5 sm:w-6 sm:h-6" />
                    ) : (
                      <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-extrabold text-navy-900 text-sm sm:text-base">
                        {drop.type === "group" ? "Group Drop" : "Single Drop"}
                      </h4>
                      {getStatusBadge(isExpired && drop.status !== "refunded" ? "expired" : drop.status)}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">
                      <strong className="text-navy-900 font-bold">{drop.amount} AVAX</strong> •{" "}
                      {drop.type === "group"
                        ? `${drop.claimedCount}/${drop.maxClaims} claimed • ${drop.expiryHours}h`
                        : `${drop.expiryHours} hours`}
                    </p>
                  </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-2 self-stretch sm:self-center justify-end flex-wrap sm:flex-nowrap pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                  {/* Copy Link Button */}
                  {drop.status === "active" && (
                    <button
                      onClick={() => handleCopy(drop)}
                      className="flex-1 sm:flex-initial justify-center px-3 sm:px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:text-navy-900 hover:border-gray-300 transition-all flex items-center gap-1.5"
                    >
                      {copiedId === drop.commit ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-600">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Link</span>
                        </>
                      )}
                    </button>
                  )}

                  {/* Refund Button for expired drops */}
                  {(drop.status === "expired" || isExpired) && drop.status !== "refunded" && (
                    <button
                      onClick={() => handleRefund(drop)}
                      disabled={isRefunding}
                      className="flex-1 sm:flex-initial justify-center px-3.5 sm:px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {isRefunding ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <RotateCcw className="w-3.5 h-3.5" />
                      )}
                      <span>Refund</span>
                    </button>
                  )}

                  {/* View Details Button */}
                  <button
                    onClick={() => setSelectedModalDrop(drop)}
                    className="flex-1 sm:flex-initial justify-center px-3.5 sm:px-4 py-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-navy-900 text-xs font-bold border border-gray-200/80 transition-all"
                  >
                    View
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* View Drop Detail Modal */}
      {selectedModalDrop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setSelectedModalDrop(null)}
            className="absolute inset-0 bg-navy-950/40 backdrop-blur-sm"
          />
          <div className="relative bg-white rounded-3xl p-5 sm:p-7 max-w-sm w-full shadow-card border border-gray-100 z-10 animate-slide-up text-center">
            <button
              onClick={() => setSelectedModalDrop(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-navy-900"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-bold text-navy-900">
              {selectedModalDrop.type === "group" ? "Group Drop" : "Single Drop"}
            </h3>
            <p className="text-3xl font-extrabold text-navy-900 my-2">
              {selectedModalDrop.amount} AVAX
            </p>

            <div className="p-3 bg-white rounded-2xl border border-gray-100 shadow-sm inline-block my-3">
              <QRCode
                value={
                  typeof window !== "undefined"
                    ? `${window.location.origin}/#s=${selectedModalDrop.secret}&m=${selectedModalDrop.type}`
                    : ""
                }
                size={140}
              />
            </div>

            <div className="text-xs text-gray-500 space-y-1.5 text-left bg-gray-50 rounded-xl p-3.5 mt-2">
              <p>
                <strong>Status:</strong> {selectedModalDrop.status}
              </p>
              <p className="break-all font-mono text-[10px]">
                <strong>Commit:</strong> {selectedModalDrop.commit}
              </p>
              <a
                href={`${FUJI_EXPLORER_URL}/tx/${selectedModalDrop.txHash}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-snowblue-600 font-bold pt-1"
              >
                <span>View on Snowtrace</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="mt-5 flex gap-2">
              <button
                onClick={() => {
                  onSelectDropForClaim(selectedModalDrop.secret);
                  setSelectedModalDrop(null);
                }}
                className="flex-1 bg-navy-900 text-white py-3 rounded-full text-xs font-bold"
              >
                Open Claim View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
