"use client";

import React, { useState, useEffect, useRef } from "react";
import Navbar from "../components/Navbar";
import LandingView from "../components/LandingView";
import DashboardView from "../components/DashboardView";
import CreateDropForm from "../components/CreateDropForm";
import DropCreatedView from "../components/DropCreatedView";
import MyDropsView from "../components/MyDropsView";
import ClaimView from "../components/ClaimView";
import ClaimSuccessView from "../components/ClaimSuccessView";
import ExpiredView from "../components/ExpiredView";
import { useWallet } from "../lib/walletContext";
import { Link2, Inbox, Settings, X, ExternalLink, ShieldCheck } from "lucide-react";

export default function Home() {
  const { account, disconnectWallet } = useWallet();

  const [activeView, setActiveView] = useState("landing");
  const [createMode, setCreateMode] = useState("single"); // "single" | "group"
  const [latestCreatedDrop, setLatestCreatedDrop] = useState(null);
  const [claimSecret, setClaimSecret] = useState("");
  const [claimResult, setClaimResult] = useState(null);
  const [expiredDropData, setExpiredDropData] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const prevAccountRef = useRef(account);

  // Directly navigate to dashboard on connect, and to landing on disconnect
  useEffect(() => {
    if (!prevAccountRef.current && account) {
      if (activeView === "landing") {
        setActiveView("dashboard");
      }
    }
    if (prevAccountRef.current && !account) {
      if (["dashboard", "create", "mydrops"].includes(activeView)) {
        setActiveView("landing");
      }
    }
    prevAccountRef.current = account;
  }, [account, activeView]);

  // Check URL fragment for #s= (e.g. #s=0x... or #s=abc123)
  useEffect(() => {
    const handleHash = () => {
      if (typeof window !== "undefined") {
        const hash = window.location.hash;
        if (hash && hash.includes("#s=")) {
          const params = new URLSearchParams(hash.replace("#", ""));
          const secret = params.get("s");
          if (secret) {
            setClaimSecret(secret);
            setActiveView("claim");
          }
        }
      }
    };

    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  const handleSelectModeFromDashboard = (mode) => {
    setCreateMode(mode);
    setActiveView("create");
  };

  const handleDropCreated = (drop) => {
    setLatestCreatedDrop(drop);
    setActiveView("created");
  };

  const handlePreviewClaim = (secret) => {
    setClaimSecret(secret);
    setActiveView("claim");
  };

  const handleClaimSuccess = (result) => {
    setClaimResult(result);
    setActiveView("success");
  };

  const handleDropExpired = (drop) => {
    setExpiredDropData(drop);
    setActiveView("expired");
  };

  const isAppView = ["dashboard", "create", "mydrops"].includes(activeView);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAF8] text-[#132238] overflow-x-hidden">
      {/* Top Navigation */}
      <Navbar activeView={activeView} setActiveView={setActiveView} />

      {/* Main Content: Full-Bleed for Landing, Fully Responsive Container for App Views */}
      {activeView === "landing" ? (
        <div className="flex-1 w-full overflow-hidden">
          <LandingView
            onNavigate={(view) => {
              if (view === "claim") {
                setClaimSecret("");
                setActiveView("claim");
              } else {
                setActiveView(view);
              }
            }}
          />
        </div>
      ) : (
        <main className="flex-1 w-full max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-5 sm:py-8 lg:py-10">
          {isAppView && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6 lg:gap-8 items-start">
              {/* Responsive Navigation Sidebar */}
              <aside className="md:col-span-3 w-full">
                {/* Mobile Horizontal App Bar (< md screens) */}
                <div className="flex md:hidden items-center gap-1.5 p-1.5 bg-white rounded-2xl border border-gray-100 shadow-soft mb-5">
                  <button
                    onClick={() => setActiveView("dashboard")}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                      activeView === "dashboard" || activeView === "create"
                        ? "bg-snowblue-50 text-snowblue-700 shadow-2xs"
                        : "text-gray-500 hover:text-navy-900"
                    }`}
                  >
                    <Link2 className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>Send Drop</span>
                  </button>

                  <button
                    onClick={() => setActiveView("mydrops")}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                      activeView === "mydrops"
                        ? "bg-snowblue-50 text-snowblue-700 shadow-2xs"
                        : "text-gray-500 hover:text-navy-900"
                    }`}
                  >
                    <Inbox className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>My Drops</span>
                  </button>

                  <button
                    onClick={() => setIsSettingsOpen(true)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold text-gray-500 hover:text-navy-900"
                  >
                    <Settings className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>Settings</span>
                  </button>
                </div>

                {/* Desktop Sticky Vertical Sidebar (md+ screens) */}
                <div className="hidden md:block sticky top-28">
                  <div className="bg-white rounded-[28px] p-3 border border-gray-100/90 shadow-soft space-y-1">
                    {/* Navigation Items */}
                    <button
                      onClick={() => setActiveView("dashboard")}
                      className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all text-left group ${
                        activeView === "dashboard" || activeView === "create"
                          ? "bg-snowblue-50 text-snowblue-700 shadow-2xs"
                          : "text-gray-500 hover:text-navy-900 hover:bg-gray-50/80"
                      }`}
                    >
                      <Link2 className={`w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-110 ${
                        activeView === "dashboard" || activeView === "create" ? "text-snowblue-600 stroke-[2.5]" : "text-gray-400"
                      }`} />
                      <span>Send a Drop</span>
                    </button>

                    <button
                      onClick={() => setActiveView("mydrops")}
                      className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all text-left group ${
                        activeView === "mydrops"
                          ? "bg-snowblue-50 text-snowblue-700 shadow-2xs"
                          : "text-gray-500 hover:text-navy-900 hover:bg-gray-50/80"
                      }`}
                    >
                      <Inbox className={`w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-110 ${
                        activeView === "mydrops" ? "text-snowblue-600 stroke-[2.5]" : "text-gray-400"
                      }`} />
                      <span>My Drops</span>
                    </button>

                    <button
                      onClick={() => setIsSettingsOpen(true)}
                      className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold text-gray-500 hover:text-navy-900 hover:bg-gray-50/80 transition-all text-left group"
                    >
                      <Settings className="w-4 h-4 flex-shrink-0 text-gray-400 transition-transform group-hover:rotate-45 duration-300" />
                      <span>Settings</span>
                    </button>

                    {/* Integrated Network Status Card */}
                    <div className="pt-3 mt-3 border-t border-gray-100 px-1 pb-1">
                      <div className="p-3 bg-gray-50/80 rounded-2xl border border-gray-150/60 space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-navy-900">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                            </span>
                            <span>Fuji C-Chain</span>
                          </div>
                          <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded-md bg-white border border-gray-200/80 text-gray-500">
                            43113
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-400 pl-3.5 font-medium">
                          Non-custodial mock mode
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </aside>

              {/* Main Stage View */}
              <div className="md:col-span-9 w-full min-w-0">
                {activeView === "dashboard" && (
                  <DashboardView
                    onSelectMode={handleSelectModeFromDashboard}
                    onNavigate={setActiveView}
                  />
                )}

                {activeView === "create" && (
                  <CreateDropForm
                    initialMode={createMode}
                    onBack={() => setActiveView("dashboard")}
                    onCreated={handleDropCreated}
                  />
                )}

                {activeView === "mydrops" && (
                  <MyDropsView
                    onSelectDropForClaim={(secret) => {
                      setClaimSecret(secret);
                      setActiveView("claim");
                    }}
                  />
                )}
              </div>
            </div>
          )}

          {/* Drop Created View (Screen 5) */}
          {activeView === "created" && latestCreatedDrop && (
            <DropCreatedView
              drop={latestCreatedDrop}
              onCreateAnother={() => setActiveView("create")}
              onViewMyDrops={() => setActiveView("mydrops")}
              onPreviewClaim={handlePreviewClaim}
            />
          )}

          {/* Claim View (Screen 7) */}
          {activeView === "claim" && (
            <ClaimView
              secret={claimSecret}
              onClaimSuccess={handleClaimSuccess}
              onExpired={handleDropExpired}
              onBackToHome={() => {
                window.location.hash = "";
                setActiveView("landing");
              }}
            />
          )}

          {/* Claim Success Celebration (Screen 8) */}
          {activeView === "success" && (
            <ClaimSuccessView
              claimResult={claimResult}
              onNavigateToSend={() => {
                window.location.hash = "";
                setActiveView("dashboard");
              }}
            />
          )}

          {/* Drop Expired View (Screen 9) */}
          {activeView === "expired" && (
            <ExpiredView
              drop={expiredDropData}
              onNavigateHome={() => {
                window.location.hash = "";
                setActiveView("landing");
              }}
            />
          )}
        </main>
      )}

      {/* Settings / Info Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setIsSettingsOpen(false)}
            className="absolute inset-0 bg-navy-950/40 backdrop-blur-sm"
          />
          <div className="relative bg-white rounded-3xl p-5 sm:p-7 max-w-md w-full shadow-card border border-gray-100 z-10 animate-slide-up text-left">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-navy-900">Settings & Info</h3>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:text-navy-900 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-gray-600">
              <div className="p-3 bg-gray-50 rounded-xl space-y-1">
                <p className="font-semibold text-navy-900">Network</p>
                <p>Avalanche Fuji C-Chain (Chain ID 43113)</p>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl space-y-1">
                <p className="font-semibold text-navy-900">Contract Address</p>
                <p className="font-mono text-[11px] break-all">{CONTRACT_ADDRESS}</p>
                <a
                  href={`${FUJI_EXPLORER_URL}/address/${CONTRACT_ADDRESS}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-snowblue-600 font-semibold pt-1"
                >
                  <span>Snowtrace Explorer</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="p-3 bg-blue-50/60 rounded-xl text-blue-900 space-y-1">
                <p className="font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  URL Fragment Security
                </p>
                <p className="text-[11px] leading-relaxed text-blue-800/80">
                  Secrets travel only in the URL hash (<code>#s=...</code>) and are
                  never transmitted to any web server.
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsSettingsOpen(false)}
              className="mt-6 w-full bg-navy-900 text-white font-semibold py-3 rounded-full text-xs shadow-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
