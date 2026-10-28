"use client";

import React, { useState } from "react";
import { FileText, ExternalLink, Hash, Check, AlertTriangle } from "lucide-react";
import { PropertyData } from "../lib/mockData";

interface DocumentViewerProps {
  property: PropertyData;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({ property }) => {
  const [selectedDocIndex, setSelectedDocIndex] = useState(0);
  const activeDoc = property.documents[selectedDocIndex] || property.documents[0];

  return (
    <div className="bg-surface border border-surfaceBorder rounded-xl overflow-hidden shadow-2xl">
      {/* Header Tabs */}
      <div className="flex items-center border-b border-surfaceBorder bg-background/50 px-4 pt-3 overflow-x-auto">
        {property.documents.map((doc, idx) => (
          <button
            key={doc.cid}
            onClick={() => setSelectedDocIndex(idx)}
            className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-mono rounded-t-lg transition-all border-t border-x ${
              selectedDocIndex === idx
                ? "bg-surface border-surfaceBorder text-accent font-semibold"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{doc.type}</span>
          </button>
        ))}
      </div>

      {/* Split Audit Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[360px]">
        {/* Left Side: Parsed Metadata & W3C Attestation */}
        <div className="lg:col-span-5 p-5 border-r border-surfaceBorder flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                Audited Document Record
              </span>
              <span className="text-[11px] font-mono bg-accent/10 text-accent px-2 py-0.5 rounded border border-accent/20">
                Verified Page {activeDoc.page}
              </span>
            </div>
            <h3 className="text-base font-semibold text-white mb-2">{activeDoc.title}</h3>

            <div className="mt-4 space-y-2.5">
              <div className="p-2.5 bg-background rounded-lg border border-surfaceBorder font-mono text-xs">
                <span className="text-slate-500 block text-[10px]">CONTENT IDENTIFIER (IPFS CID)</span>
                <span className="text-slate-300 break-all">{activeDoc.cid}</span>
              </div>

              <div className="p-2.5 bg-background rounded-lg border border-surfaceBorder font-mono text-xs">
                <span className="text-slate-500 block text-[10px]">W3C CREDENTIAL ISSUER</span>
                <span className="text-accent">did:ethr:0x4f3edf...5b23b1d</span>
                <span className="text-slate-500 text-[10px] block mt-0.5">Licensed Professional Structural/Environmental Inspector</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-surfaceBorder/60 flex items-center justify-between text-xs text-slate-400 font-mono">
            <span className="flex items-center space-x-1">
              <Hash className="w-3.5 h-3.5 text-accent" />
              <span>SHA-256 Validated</span>
            </span>
            <span className="text-emerald-400">100% Cryptographic Match</span>
          </div>
        </div>

        {/* Right Side: Exact Source Paragraph Highlight */}
        <div className="lg:col-span-7 p-6 bg-slate-950/70 font-mono text-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider">
                Raw Forensic Source Text Snippet
              </span>
              <span className="text-[10px] text-slate-500 flex items-center space-x-1">
                <span>pdfplumber engine v0.11</span>
              </span>
            </div>

            <div className="p-4 rounded-lg bg-surface/50 border border-surfaceBorder text-slate-300 leading-relaxed relative">
              <div className="text-slate-400 text-xs mb-3 italic">
                &ldquo;...Excerpt from certified engineering dossier...&rdquo;
              </div>
              <p className="text-sm">
                {activeDoc.excerpt.split(activeDoc.highlightMatch)[0]}
                <mark className="bg-emerald-500/30 text-emerald-300 px-1.5 py-0.5 rounded font-bold border-b border-emerald-400">
                  {activeDoc.highlightMatch}
                </mark>
                {activeDoc.excerpt.split(activeDoc.highlightMatch)[1]}
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-surfaceBorder/40 flex items-center justify-between text-[11px] text-slate-400">
            <span>Deterministic Schema Match: PASS</span>
            <span className="text-accent flex items-center space-x-1">
              <Check className="w-3.5 h-3.5" />
              <span>Direct Link to On-Chain Passport Token</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
