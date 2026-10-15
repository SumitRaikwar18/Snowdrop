"use client";

import React, { useState, useEffect } from "react";
import QRCode from "react-qr-code";
import { Check, Copy, ExternalLink, ArrowRight, Sparkles } from "lucide-react";
import { FUJI_EXPLORER_URL } from "../lib/mock";

export default function DropCreatedView({ drop, onCreateAnother, onViewMyDrops, onPreviewClaim }) {
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const origin = window.location.origin;
      const url = `${origin}/#s=${drop.secret}&m=${drop.type}`;
      setShareUrl(url);
    }
  }, [drop]);

  const handleCopy = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const formatHash = (hash) => {
    if (!hash) return "";
    return `${hash.slice(0, 8)}...${hash.slice(-4)}`;
  };

  return (
    <div className="max-w-2xl mx-auto py-4 sm:py-6 animate-fade-in text-center">
      {/* Big Green Success Checkmark */}
      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-soft mb-4 sm:mb-5">
        <Check className="w-7 h-7 sm:w-8 sm:h-8 stroke-[3]" />
      </div>

      <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">
        Drop Created!
      </h1>
      <p className="text-xs sm:text-sm text-gray-500 mt-1.5 sm:mt-2 max-w-md mx-auto">
        Share this link with anyone. They can claim the AVAX without needing a
        wallet address upfront.
      </p>

      {/* Main Share Card (QR + Link + Commit) */}
      <div className="mt-6 sm:mt-8 bg-white rounded-[28px] sm:rounded-3xl p-5 sm:p-8 border border-gray-100 shadow-card text-left">
        <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-8">
          {/* QR Code Container */}
          <div className="p-3 bg-white rounded-2xl border border-gray-100 shadow-sm flex-shrink-0">
            {shareUrl ? (
              <QRCode
                value={shareUrl}
                size={130}
                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                viewBox={`0 0 130 130`}
              />
            ) : (
              <div className="w-[130px] h-[130px] bg-gray-100 animate-pulse rounded-xl" />
            )}
          </div>

          {/* Link & Meta */}
          <div className="flex-1 min-w-0 space-y-3 sm:space-y-4 w-full">
            <div>
              <label className="block text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                Share Link
              </label>
              <div className="flex items-center justify-between bg-gray-50 border border-gray-200/80 rounded-xl sm:rounded-2xl px-3 sm:px-3.5 py-2.5 sm:py-3">
                <span className="text-xs font-mono text-navy-900 truncate mr-2 select-all">
                  {shareUrl || "Generating link..."}
                </span>
                <button
                  onClick={handleCopy}
                  className="p-1 sm:p-1.5 rounded-lg text-gray-500 hover:text-navy-900 hover:bg-gray-200/60 transition-colors flex items-center gap-1 flex-shrink-0"
                  title="Copy Link"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />
                      <span className="text-[10px] sm:text-[11px] font-semibold text-emerald-600">
                        Copied!
                      </span>
                    </>
                  ) : (
                    <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Commit & Snowtrace */}
            <div className="flex flex-wrap items-center justify-between text-xs pt-1 border-t border-gray-100 gap-2">
              <span className="text-gray-400 font-mono text-[11px] sm:text-xs">
                Commit:{" "}
                <strong className="text-navy-900 font-medium">
                  {formatHash(drop.commit)}
                </strong>
              </span>
              <a
                href={`${FUJI_EXPLORER_URL}/tx/${drop.txHash}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-snowblue-600 hover:text-snowblue-700 font-semibold text-[11px] sm:text-xs"
              >
                <span>View on Snowtrace</span>
                <ExternalLink className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-3.5">
        <button
          onClick={onCreateAnother}
          className="w-full sm:w-auto bg-navy-900 hover:bg-navy-800 text-white font-semibold text-xs sm:text-sm px-7 sm:px-8 py-3.5 rounded-full shadow-card hover:shadow-elevated transition-all"
        >
          Create Another Drop
        </button>

        <button
          onClick={() => onPreviewClaim(drop.secret)}
          className="w-full sm:w-auto bg-white hover:bg-gray-50 text-navy-900 font-semibold text-xs sm:text-sm px-6 sm:px-7 py-3.5 rounded-full border border-gray-200 shadow-sm transition-all flex items-center justify-center gap-1.5"
        >
          <span>Test Claim Screen</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          onClick={onViewMyDrops}
          className="w-full sm:w-auto text-gray-600 hover:text-navy-900 font-semibold text-xs sm:text-sm px-5 py-3.5 transition-colors"
        >
          View in My Drops
        </button>
      </div>
    </div>
  );
}
