"use client";

import React, { useState } from "react";
import { AlertOctagon, CheckCircle, ShieldAlert, ArrowRight, Zap, RefreshCw } from "lucide-react";
import { PropertyData } from "../lib/mockData";

interface DiscrepancyBreakerProps {
  property: PropertyData;
  onSimulateRevert: () => void;
}

export const DiscrepancyBreaker: React.FC<DiscrepancyBreakerProps> = ({
  property,
  onSimulateRevert,
}) => {
  const isBeta = property.assetCode === "US-OH-CMH-002";
  const [testingDiscrepancy, setTestingDiscrepancy] = useState(false);

  const handleTest = () => {
    setTestingDiscrepancy(true);
    setTimeout(() => {
      setTestingDiscrepancy(false);
      onSimulateRevert();
    }, 600);
  };

  return (
    <div className={`border rounded-xl p-6 transition-all shadow-xl ${
      isBeta
        ? "bg-red-950/20 border-danger/40 shadow-danger/5"
        : "bg-surface border-surfaceBorder shadow-black"
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className={`p-2.5 rounded-lg border ${
            isBeta ? "bg-danger/20 border-danger/40 text-danger" : "bg-accent/20 border-accent/40 text-accent"
          }`}>
            {isBeta ? <AlertOctagon className="w-6 h-6" /> : <CheckCircle className="w-6 h-6" />}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-bold text-white">Discrepancy Breaker & Contingency Gate</h3>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                isBeta ? "bg-danger text-white" : "bg-accent text-slate-950"
              }`}>
                {isBeta ? "CRITICAL MISMATCH DETECTED" : "PASSPORT COMPLIANT"}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Cross-verifying broker memorandum claims against verified cryptographic engineering passports.
            </p>
          </div>
        </div>

        <button
          onClick={handleTest}
          disabled={testingDiscrepancy}
          className={`flex items-center space-x-2 text-xs font-mono px-4 py-2 rounded-lg font-bold transition-all ${
            isBeta
              ? "bg-danger hover:bg-red-600 text-white shadow-lg shadow-danger/20"
              : "bg-accent hover:bg-emerald-400 text-slate-950 shadow-lg shadow-accent/20"
          }`}
        >
          {testingDiscrepancy ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Zap className="w-4 h-4" />
          )}
          <span>{isBeta ? "Execute Revert Verification" : "Re-Verify Assertions"}</span>
        </button>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Metric 1: Power Capacity */}
        <div className="p-4 rounded-lg bg-background/80 border border-surfaceBorder font-mono">
          <div className="text-[11px] text-slate-400 uppercase tracking-wider mb-2">Electrical Substation</div>
          <div className="flex items-baseline justify-between mb-1">
            <span className="text-xs text-slate-400">Broker Flyer:</span>
            <span className="text-sm font-bold text-white">{property.brokerClaims.powerKva} kVA</span>
          </div>
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-xs text-slate-400">Utility Agreement:</span>
            <span className={`text-sm font-bold ${
              property.verifiedSpecs.powerKva < property.brokerClaims.powerKva ? "text-danger" : "text-accent"
            }`}>
              {property.verifiedSpecs.powerKva} kVA
            </span>
          </div>
          {property.verifiedSpecs.powerKva < property.brokerClaims.powerKva && (
            <div className="text-[11px] text-danger bg-danger/10 p-1.5 rounded border border-danger/20 font-bold">
              -2,000 kVA DEFICIT (Under-capacity)
            </div>
          )}
        </div>

        {/* Metric 2: Environmental REC */}
        <div className="p-4 rounded-lg bg-background/80 border border-surfaceBorder font-mono">
          <div className="text-[11px] text-slate-400 uppercase tracking-wider mb-2">Phase I ESA Status</div>
          <div className="flex items-baseline justify-between mb-1">
            <span className="text-xs text-slate-400">Broker Claim:</span>
            <span className="text-sm font-bold text-white">{property.brokerClaims.environmental}</span>
          </div>
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-xs text-slate-400">ASTM E1527-21:</span>
            <span className={`text-sm font-bold ${
              !property.verifiedSpecs.environmentalClean ? "text-danger" : "text-accent"
            }`}>
              {property.verifiedSpecs.environmentalClean ? "0 RECs Clean" : "1 ACTIVE REC"}
            </span>
          </div>
          {!property.verifiedSpecs.environmentalClean && (
            <div className="text-[11px] text-danger bg-danger/10 p-1.5 rounded border border-danger/20 font-bold">
              DEFECT: Historical Solvent Plume
            </div>
          )}
        </div>

        {/* Metric 3: Slab Load & Height */}
        <div className="p-4 rounded-lg bg-background/80 border border-surfaceBorder font-mono">
          <div className="text-[11px] text-slate-400 uppercase tracking-wider mb-2">Structural Clearance</div>
          <div className="flex items-baseline justify-between mb-1">
            <span className="text-xs text-slate-400">Broker Claim:</span>
            <span className="text-sm font-bold text-white">{property.brokerClaims.clearHeight} ft Clear</span>
          </div>
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-xs text-slate-400">Verified Stamp:</span>
            <span className={`text-sm font-bold ${
              property.verifiedSpecs.clearHeight < property.brokerClaims.clearHeight ? "text-danger" : "text-accent"
            }`}>
              {property.verifiedSpecs.clearHeight} ft ({property.verifiedSpecs.slabPsi} psf)
            </span>
          </div>
          {property.verifiedSpecs.clearHeight < property.brokerClaims.clearHeight && (
            <div className="text-[11px] text-danger bg-danger/10 p-1.5 rounded border border-danger/20 font-bold">
              Height Deficit ({property.verifiedSpecs.clearHeight} ft &lt; {property.brokerClaims.clearHeight} ft)
            </div>
          )}
        </div>
      </div>

      {/* Revert Banner for Property Beta */}
      {isBeta ? (
        <div className="p-4 rounded-lg bg-red-950/60 border border-danger/50 text-xs font-mono text-slate-200 flex items-start space-x-3">
          <ShieldAlert className="w-5 h-5 text-danger shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-danger text-sm mb-1">
              AUTOMATIC CONTRACT REVERT ARMED: ContingentEscrow__SpecificationDeficit
            </div>
            <p className="text-slate-300 leading-relaxed">
              If an escrow closing transaction is broadcast for this asset, the smart contract will
              interrogate the <code className="text-white">IndustrialAssetPassport</code>, detect that actual substation power
              (500 kVA) is less than required (2,000 kVA), and abort the transaction in the EVM. Investor funds cannot be transferred.
            </p>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-lg bg-emerald-950/40 border border-accent/40 text-xs font-mono text-slate-200 flex items-center space-x-3">
          <CheckCircle className="w-5 h-5 text-accent shrink-0" />
          <div>
            <div className="font-bold text-accent text-sm">
              ALL PHYSICAL CONTINGENCIES SATISFIED
            </div>
            <p className="text-slate-300">
              Clear height (40.0 ft), slab load (650 psf), and utility feed (4,000 kVA) exceed minimum closing thresholds.
              Contingent Escrow is unlocked for atomic settlement.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
