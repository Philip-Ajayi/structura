"use client";

import React from "react";
import { ShieldCheck, HardHat, Cpu, CheckCircle2 } from "lucide-react";

interface NavbarProps {
  currentAsset: string;
  onSelectAsset: (code: string) => void;
  isSimulatedWeb3: boolean;
  onToggleSimulatedWeb3: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentAsset,
  onSelectAsset,
  isSimulatedWeb3,
  onToggleSimulatedWeb3,
}) => {
  return (
    <header className="border-b border-surfaceBorder bg-surface/80 backdrop-blur-md sticky top-0 z-50 px-6 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="bg-accent/10 border border-accent/30 p-2 rounded-lg">
            <ShieldCheck className="w-6 h-6 text-accent" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-lg font-bold tracking-wider text-white">STRUCTURA</span>
              <span className="bg-surfaceBorder text-slate-400 text-[10px] font-mono px-2 py-0.5 rounded">
                ERC-3643 // W3C-VC
              </span>
            </div>
            <p className="text-xs text-slate-400">Verifiable Property Intelligence & Contingent Capital</p>
          </div>
        </div>

        {/* Demo Asset Selector */}
        <div className="flex items-center space-x-2 bg-background border border-surfaceBorder p-1 rounded-lg">
          <button
            onClick={() => onSelectAsset("US-CA-ONT-001")}
            className={`px-3 py-1.5 rounded-md text-xs font-mono transition-all flex items-center space-x-1.5 ${
              currentAsset === "US-CA-ONT-001"
                ? "bg-accent/20 text-accent border border-accent/40 font-semibold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Property Alpha (Compliant)</span>
          </button>
          <button
            onClick={() => onSelectAsset("US-OH-CMH-002")}
            className={`px-3 py-1.5 rounded-md text-xs font-mono transition-all flex items-center space-x-1.5 ${
              currentAsset === "US-OH-CMH-002"
                ? "bg-danger/20 text-danger border border-danger/40 font-semibold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <HardHat className="w-3.5 h-3.5" />
            <span>Property Beta (Deficit / Revert)</span>
          </button>
        </div>

        {/* Web3 Mode / Wallet Status */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onToggleSimulatedWeb3}
            className={`flex items-center space-x-2 text-xs font-mono px-3 py-1.5 rounded-md border transition-all ${
              isSimulatedWeb3
                ? "bg-emerald-950/60 border-accent/40 text-accent"
                : "bg-surface border-surfaceBorder text-slate-300"
            }`}
            title="Toggle between in-browser sandbox and external Web3 provider"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>{isSimulatedWeb3 ? "Live Judge Sandbox: ON" : "External RPC Node"}</span>
          </button>

          <div className="text-right font-mono text-xs hidden md:block">
            <div className="text-slate-400">Wallet: 0x7099...79C8</div>
            <div className="text-accent flex items-center justify-end space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></span>
              <span>ONCHAINID Verified</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
