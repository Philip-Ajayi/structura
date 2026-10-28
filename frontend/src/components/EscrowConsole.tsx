"use client";

import React, { useState } from "react";
import { Lock, ShieldCheck, AlertOctagon, RefreshCw, CheckCircle2, Box, Cpu } from "lucide-react";
import { PropertyData } from "../lib/mockData";

interface EscrowConsoleProps {
  property: PropertyData;
  isSimulatedWeb3: boolean;
  onTriggerRevertSimulation: () => void;
}

export const EscrowConsole: React.FC<EscrowConsoleProps> = ({
  property,
  onTriggerRevertSimulation,
}) => {
  const isBeta = property.assetCode === "US-OH-CMH-002";
  const [escrowState, setEscrowState] = useState<"CREATED" | "FUNDED" | "SETTLED" | "REVERTED">("CREATED");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [txDetails, setTxDetails] = useState<{ txHash: string; blockNumber: number; gasUsed: number } | null>(null);

  const handleDeposit = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch(`/api/escrow/deposit/${property.assetCode}`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setEscrowState("FUNDED");
        setTxDetails({
          txHash: data.tx_hash,
          blockNumber: data.block_number,
          gasUsed: data.gas_used,
        });
      } else {
        setErrorMessage("Deposit transaction failed on node.");
      }
    } catch {
      setErrorMessage("Could not reach Ethereum RPC node.");
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteSettlement = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch(`/api/escrow/settle/${property.assetCode}`, { method: "POST" });
      const data = await res.json();

      if (data.status === "SETTLED" && data.success) {
        setEscrowState("SETTLED");
        setTxDetails({
          txHash: data.tx_hash,
          blockNumber: data.block_number,
          gasUsed: data.gas_used,
        });
      } else {
        // Real EVM Revert received from Anvil
        setEscrowState("REVERTED");
        setErrorMessage(data.revert_reason || "Transaction reverted by EVM.");
        onTriggerRevertSimulation();
      }
    } catch {
      setErrorMessage("Failed to broadcast settlement to Anvil EVM.");
    } finally {
      setLoading(false);
    }
  };

  const resetEscrow = () => {
    setEscrowState("CREATED");
    setErrorMessage(null);
    setTxDetails(null);
  };

  return (
    <div className="bg-surface border border-surfaceBorder rounded-xl p-6 shadow-2xl">
      {/* Console Header */}
      <div className="flex items-center justify-between border-b border-surfaceBorder pb-4 mb-6">
        <div>
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block">
            Execution Engine
          </span>
          <h3 className="text-lg font-bold text-white flex items-center space-x-2">
            <span>Contingent Escrow Terminal</span>
            <span className="text-xs font-mono bg-accent/10 border border-accent/30 text-accent px-2 py-0.5 rounded flex items-center space-x-1">
              <Cpu className="w-3 h-3" />
              <span>Live Anvil EVM (Chain ID: 31337)</span>
            </span>
          </h3>
        </div>

        <div className="flex items-center space-x-2 font-mono text-xs">
          <span className="text-slate-400">Escrow State:</span>
          <span className={`px-2.5 py-1 rounded font-bold ${
            escrowState === "SETTLED" ? "bg-accent/20 text-accent border border-accent/40" :
            escrowState === "REVERTED" ? "bg-danger/20 text-danger border border-danger/40" :
            escrowState === "FUNDED" ? "bg-amber-500/20 text-amber-400 border border-amber-500/40" :
            "bg-surfaceBorder text-slate-300"
          }`}>
            {escrowState}
          </span>
        </div>
      </div>

      {/* Escrow Parameters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 font-mono text-xs">
        <div className="p-3 bg-background rounded-lg border border-surfaceBorder">
          <span className="text-slate-500 block text-[10px]">ESCROW DEPOSIT</span>
          <span className="text-sm font-bold text-white">
            {isBeta ? "$250,000 USDC" : "$500,000 USDC"}
          </span>
        </div>
        <div className="p-3 bg-background rounded-lg border border-surfaceBorder">
          <span className="text-slate-500 block text-[10px]">EQUITY ISSUANCE</span>
          <span className="text-sm font-bold text-accent">
            {isBeta ? "2,500 Units" : "5,000 Class A Units"}
          </span>
        </div>
        <div className="p-3 bg-background rounded-lg border border-surfaceBorder">
          <span className="text-slate-500 block text-[10px]">MIN. POWER THRESHOLD</span>
          <span className="text-sm font-bold text-white">
            {isBeta ? ">= 2,000 kVA" : ">= 3,500 kVA"}
          </span>
        </div>
        <div className="p-3 bg-background rounded-lg border border-surfaceBorder">
          <span className="text-slate-500 block text-[10px]">ENVIRONMENTAL GATE</span>
          <span className="text-sm font-bold text-white">0 RECs Required</span>
        </div>
      </div>

      {/* Error Message Box (When Reverted by EVM) */}
      {errorMessage && (
        <div className="mb-6 p-4 rounded-lg bg-red-950/60 border border-danger text-xs font-mono text-white flex items-start space-x-3">
          <AlertOctagon className="w-5 h-5 text-danger shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold text-danger text-sm">REAL ON-CHAIN TRANSACTION REVERTED BY EVM</div>
            <p className="text-slate-200 bg-black/40 p-2 rounded border border-danger/30 font-mono text-[11px]">
              {errorMessage}
            </p>
            <p className="text-slate-400 text-[11px] pt-1">
              The smart contract prevented funds transfer. Zero security tokens were minted.
            </p>
          </div>
        </div>
      )}

      {/* Success Box (When Settled on EVM) */}
      {escrowState === "SETTLED" && txDetails && (
        <div className="mb-6 p-4 rounded-lg bg-emerald-950/50 border border-accent text-xs font-mono text-white flex items-start space-x-3">
          <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
          <div className="space-y-1.5">
            <div className="font-bold text-accent text-sm">LIVE ATOMIC CLOSING COMPLETE (MINED ON-CHAIN)</div>
            <p className="text-slate-200">
              1. $500,000 USDC disbursed to Delaware Statutory Trust (SPV) seller account.
              <br />
              2. 5,000 Class A fractional tokens minted into buyer KYC-whitelisted wallet (0x7099...79C8).
            </p>
            <div className="pt-2 border-t border-accent/20 flex flex-wrap gap-4 text-[11px] text-slate-300">
              <span className="flex items-center space-x-1">
                <Box className="w-3.5 h-3.5 text-accent" />
                <span>Mined Block: <strong>#{txDetails.blockNumber}</strong></span>
              </span>
              <span>Gas Used: <strong>{txDetails.gasUsed.toLocaleString()}</strong></span>
              <span className="text-slate-400 break-all">Tx Hash: <span className="text-accent">{txDetails.txHash}</span></span>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-4">
        {escrowState === "CREATED" && (
          <button
            onClick={handleDeposit}
            disabled={loading}
            className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs px-5 py-3 rounded-lg font-bold transition-all border border-slate-600 shadow-md"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
            <span>Step 1: Broadcast USDC Deposit to Node</span>
          </button>
        )}

        {escrowState === "FUNDED" && (
          <button
            onClick={handleExecuteSettlement}
            disabled={loading}
            className={`flex items-center space-x-2 font-mono text-xs px-6 py-3 rounded-lg font-bold transition-all shadow-lg ${
              isBeta
                ? "bg-danger hover:bg-red-600 text-white shadow-danger/20"
                : "bg-accent hover:bg-emerald-400 text-slate-950 shadow-accent/20"
            }`}
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
            <span>
              {isBeta
                ? "Step 2: Execute Settlement (Trigger Live EVM Revert)"
                : "Step 2: Execute Settlement (Live 1-Block Atomic Close)"}
            </span>
          </button>
        )}

        {(escrowState === "SETTLED" || escrowState === "REVERTED") && (
          <button
            onClick={resetEscrow}
            className="flex items-center space-x-2 font-mono text-xs px-4 py-2.5 rounded-lg bg-surface border border-surfaceBorder text-slate-300 hover:text-white"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Escrow Demo</span>
          </button>
        )}
      </div>
    </div>
  );
};
