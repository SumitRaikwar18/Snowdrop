"use client";

import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import ClaimView from "../../components/ClaimView";
import ClaimSuccessView from "../../components/ClaimSuccessView";
import ExpiredView from "../../components/ExpiredView";
import { useRouter } from "next/navigation";

export default function ClaimPage() {
  const router = useRouter();
  const [secret, setSecret] = useState("");
  const [claimResult, setClaimResult] = useState(null);
  const [expiredDrop, setExpiredDrop] = useState(null);
  const [status, setStatus] = useState("claiming"); // "claiming" | "success" | "expired"

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash;
      if (hash && hash.includes("#s=")) {
        const params = new URLSearchParams(hash.replace("#", ""));
        const s = params.get("s");
        if (s) setSecret(s);
      }
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-cream-100 text-navy-900">
      <Navbar activeView="claim" setActiveView={() => router.push("/")} />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex items-center justify-center">
        {status === "claiming" && (
          <ClaimView
            secret={secret}
            onClaimSuccess={(res) => {
              setClaimResult(res);
              setStatus("success");
            }}
            onExpired={(d) => {
              setExpiredDrop(d);
              setStatus("expired");
            }}
            onBackToHome={() => router.push("/")}
          />
        )}

        {status === "success" && (
          <ClaimSuccessView
            claimResult={claimResult}
            onNavigateToSend={() => router.push("/")}
          />
        )}

        {status === "expired" && (
          <ExpiredView
            drop={expiredDrop}
            onNavigateHome={() => router.push("/")}
          />
        )}
      </main>
    </div>
  );
}
