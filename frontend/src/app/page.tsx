"use client";

import React, { useState } from "react";
import { Navbar } from "../components/Navbar";
import { DocumentViewer } from "../components/DocumentViewer";
import { DiscrepancyBreaker } from "../components/DiscrepancyBreaker";
import { EscrowConsole } from "../components/EscrowConsole";
import { PROPERTIES } from "../lib/mockData";
import { Layers, ShieldCheck, Zap, ArrowUpRight } from "lucide-react";

export default function StructuraDashboard() {
  const [selectedAssetCode, setSelectedAssetCode] = useState<string>("US-CA-ONT-001");
  const [isSimulatedWeb3, setIsSimulatedWeb3] = useState<boolean>(true);
  const [notification, setNotification] = useState<string | null>(null);

  const activeProperty = PROPERTIES[selectedAssetCode] || PROPERTIES["US-CA-ONT-001"];

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between">
      <div>
        <Navbar
          currentAsset={selectedAssetCode}
          onSelectAsset={setSelectedAssetCode}
          isSimulatedWeb3={isSimulatedWeb3}
          onToggleSimulatedWeb3={() => setIsSimulatedWeb3(!isSimulatedWeb3)}
        />

        {notification && (
          <div className="bg-danger text-white font-mono text-xs py-2 px-6 text-center border-b border-red-700 animate-pulse">
            {notification}
          </div>
        )}

        <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
          {/* Asset Overview Banner */}
          <div className="bg-surface border border-surfaceBorder rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <span className="font-mono text-xs text-accent uppercase tracking-wider font-semibold">
                  Industrial Asset Passport // {activeProperty.assetCode}
                </span>
                <span className="text-slate-500 text-xs">•</span>
                <span className="text-xs text-slate-400 font-mono">Delaware Statutory Trust (DST) SPV</span>
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">{activeProperty.name}</h1>
              <p className="text-sm text-slate-400">{activeProperty.location} • {activeProperty.sqft.toLocaleString()} RSF Logistics Facility</p>
            </div>

            <div className="flex items-center space-x-4 font-mono text-xs">
              <div className="bg-background border border-surfaceBorder px-4 py-2.5 rounded-lg text-right">
                <span className="text-slate-500 block text-[10px]">VALUATION / TARGET</span>
                <span className="text-white font-bold text-sm">$48,500,000</span>
              </div>
              <div className="bg-background border border-surfaceBorder px-4 py-2.5 rounded-lg text-right">
                <span className="text-slate-500 block text-[10px]">ANNUAL NNN YIELD</span>
                <span className="text-accent font-bold text-sm">6.85% APY</span>
              </div>
            </div>
          </div>

          {/* Section 1: Discrepancy Breaker */}
          <section className="space-y-3">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-accent" />
              <h2 className="text-sm font-mono uppercase tracking-wider text-slate-300 font-bold">
                1. Programmatic Due Diligence & Discrepancy Gate
              </h2>
            </div>
            <DiscrepancyBreaker
              property={activeProperty}
              onSimulateRevert={() =>
                showNotification(
                  "EVM Abort: ContingentEscrow__SpecificationDeficit triggered! Capital preserved."
                )
              }
            />
          </section>

          {/* Section 2: Split-Screen Document Audit Console */}
          <section className="space-y-3">
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-accent" />
              <h2 className="text-sm font-mono uppercase tracking-wider text-slate-300 font-bold">
                2. Verifiable Document Ingestion & Forensics Viewer
              </h2>
            </div>
            <DocumentViewer property={activeProperty} />
          </section>

          {/* Section 3: Web3 Contingent Escrow Execution */}
          <section className="space-y-3">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-accent" />
              <h2 className="text-sm font-mono uppercase tracking-wider text-slate-300 font-bold">
                3. Programmatic Contingency Settlement Terminal
              </h2>
            </div>
            <EscrowConsole
              property={activeProperty}
              isSimulatedWeb3={isSimulatedWeb3}
              onTriggerRevertSimulation={() =>
                showNotification("Transaction Reverted on-chain: Deficit prevents token issuance.")
              }
            />
          </section>
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-surfaceBorder bg-surface py-6 px-6 mt-12 text-center text-xs font-mono text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span>STRUCTURA PROTOCOL // ERC-3643 & W3C VERIFIABLE CREDENTIAL SPECIFICATION</span>
          <span>Open-Source Institutional Industrial Infrastructure</span>
        </div>
      </footer>
    </div>
  );
}
