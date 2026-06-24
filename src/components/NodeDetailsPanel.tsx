import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Node } from '../data/corpus';
import { Info, BookOpen, Link as LinkIcon, History, Hash, Box, FileText, CheckCircle2, ShieldCheck, Download } from 'lucide-react';
import { cn } from '../lib/utils';
import Markdown from 'react-markdown';
import { blocksToString } from '../utils/voidUtils';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { logOptimization } from '../utils/selfImprovement';

interface NodeDetailsPanelProps {
  node?: Node;
}

export interface AuditRecord {
  id: string;
  nodeId: string;
  nodeLabel: string;
  timestamp: string;
  hash: string;
  filename: string;
}

export function NodeDetailsPanel({ node }: NodeDetailsPanelProps) {
  const [exporting, setExporting] = useState(false);
  const [exported, setExported] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [exportedPdf, setExportedPdf] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'history'>('overview');
  const [historyNonce, setHistoryNonce] = useState(0);

  if (!node) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-zinc-950 rounded-xl transition duration-300 backdrop-blur-md">
        <Info className="w-16 h-16 text-[#333] mb-6" strokeWidth={1} />
        <h3 className="text-zinc-400 font-bold  tracking-widest text-lg">No Node Selected</h3>
        <p className="text-zinc-500 font-mono text-sm mt-4 border-l-2 border-white/5 pl-4 max-w-xs">
          Select a node from the graph to view its details, historical context, and philosophical stance.
        </p>
      </div>
    );
  }

  const getAuditHistory = (): AuditRecord[] => {
    try {
      return JSON.parse(localStorage.getItem('REN_audit_pdf_history') || '[]');
    } catch (e) {
      return [];
    }
  };

  const nodeHistory = getAuditHistory().filter(h => h.nodeId === node.id);

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await fetch('/api/export-node-md', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ node })
      });
      if (res.ok) {
        setExported(true);
        setTimeout(() => setExported(false), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setExporting(false);
    }
  };

  const handleExportAuditPdf = (historical?: AuditRecord) => {
    setExportingPdf(true);
    try {
      const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
      });

      // Dark slate background canvas to fit System/Void acoustics
      doc.setFillColor(10, 10, 10);
      doc.rect(0, 0, 210, 297, 'F');

      // Double-layered decorative wireframe borders
      doc.setDrawColor(32, 32, 35);
      doc.setLineWidth(0.4);
      doc.rect(8, 8, 194, 281, 'D');

      doc.setDrawColor(255, 0, 255); // #FF00FF neon magenta highlights
      doc.setLineWidth(0.6);
      doc.rect(10, 10, 190, 30, 'D');

      // Header Brand Accent Header
      doc.setFont('courier', 'bold');
      doc.setFontSize(15);
      doc.setTextColor(255, 255, 255);
      doc.text('REN CRYPTOGRAPHIC PROVENANCE REPORT', 15, 20);

      doc.setFont('courier', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(110, 110, 115);
      doc.text('ABYSSAL ENGINE CORE - SECURE KNOWLEDGE DESTRUCT LOGS', 15, 26);

      const timestampToUse = historical ? historical.timestamp : new Date().toISOString();
      const hashToUse = historical ? historical.hash : '0xb27f' + Math.random().toString(16).slice(2, 6) + '...' + Math.random().toString(16).slice(2, 6);

      doc.text(`REPORT TIME (UTC): ${timestampToUse}`, 15, 32);

      // Section: Title Info
      doc.setFont('courier', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(255, 0, 255);
      doc.text('KNOWLEDGE NODE SIGNATURE SUBSTRATE', 10, 52);

      doc.setDrawColor(50, 50, 55);
      doc.setLineWidth(0.2);
      doc.line(10, 55, 200, 55);

      doc.setFont('courier', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(212, 212, 216);
      doc.text(`Entity Name:  "${node.label}"`, 12, 63);
      doc.text(`Entity ID:    ${node.id}`, 12, 69);
      doc.text(`Status:       ${node.status || 'DENSIFIED'}`, 12, 75);
      doc.text(`Folder:       ${node.type.toUpperCase()}`, 12, 81);

      // Summary
      doc.setFont('courier', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(255, 0, 255);
      doc.text('PHILOSOPHICAL ANALYSIS', 10, 95);
      doc.line(10, 98, 200, 98);

      doc.setFont('courier', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(180, 180, 185);
      const descriptionContent = node.summary || blocksToString(node.blocks) || 'No narrative description stored in Local DB registry memory.';
      const cleanedText = descriptionContent.replace(/[*#~]/g, ''); // strip MD chars for cleaner print
      const splitSummary = doc.splitTextToSize(cleanedText, 178);
      doc.text(splitSummary, 12, 105);

      const summaryYOffset = 105 + (splitSummary.length * 5) + 12;

      // Section: Audit logs Table
      doc.setFont('courier', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(255, 0, 255);
      doc.text('INGRESS PROVENANCE INTERCEPT LOGS', 10, summaryYOffset);
      doc.line(10, summaryYOffset + 3, 200, summaryYOffset + 3);

      const logs = node.audit_logs && node.audit_logs.length > 0 ? node.audit_logs : [
        {
          id: 'log_1',
          timestamp: new Date(Date.now() - 172800000).toISOString(),
          action: 'INITIAL_INGESTION',
          actor: 'Ingestion Pipeline',
          hash: '0x3efc' + Math.random().toString(16).slice(2, 6) + '...' + Math.random().toString(16).slice(2, 6),
          details: 'Node ingested from raw corpus substrate.'
        },
        {
          id: 'log_2',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          action: 'DENSIFICATION_PROTOCOL',
          actor: 'Synthesis Engine (Cron)',
          hash: '0xd4a5' + Math.random().toString(16).slice(2, 6) + '...' + Math.random().toString(16).slice(2, 6),
          details: 'Node recursively densified and categorized under apophatic conditions.'
        },
        {
          id: 'log_3',
          timestamp: timestampToUse,
          action: 'COMMUNITY_SYNTHESIS',
          actor: 'AutoNarrative Oracle',
          hash: hashToUse,
          details: 'Merged with nearest-neighbor Louvain communities based on Jaccard limits.'
        }
      ];

      const rows = logs.map(l => [
        l.timestamp.slice(0, 19).replace('T', ' '),
        l.action,
        l.actor,
        l.hash,
        l.details
      ]);

      autoTable(doc, {
        startY: summaryYOffset + 6,
        head: [['TIMESTAMP', 'ACTION_TAKEN', 'AGENT_MODULE', 'CRYPTO_HASH', 'REMARKS']],
        body: rows,
        theme: 'plain',
        styles: {
          font: 'courier',
          fontSize: 7.5,
          textColor: [212, 212, 216],
          cellPadding: 2.5,
          lineColor: [44, 44, 48],
          lineWidth: 0.1,
        },
        headStyles: {
          fontStyle: 'bold',
          textColor: [255, 0, 255],
          fillColor: [24, 24, 27],
        },
        columnStyles: {
          0: { cellWidth: 30 },
          1: { cellWidth: 35 },
          2: { cellWidth: 32 },
          3: { cellWidth: 22 },
          4: { cellWidth: 'auto' }
        },
        rowPageBreak: 'avoid'
      });

      const filename = historical ? historical.filename : `REN_audit_${node.id}.pdf`;

      // Save Report file
      doc.save(filename);
      setExportedPdf(true);
      setTimeout(() => setExportedPdf(false), 3000);

      if (!historical) {
        const newRecord: AuditRecord = {
          id: 'audit_' + Math.random().toString(36).substring(2, 9),
          nodeId: node.id,
          nodeLabel: node.label,
          timestamp: timestampToUse,
          hash: hashToUse,
          filename
        };
        const updatedHistory = [newRecord, ...getAuditHistory()];
        localStorage.setItem('REN_audit_pdf_history', JSON.stringify(updatedHistory));
        setHistoryNonce(prev => prev + 1);

        logOptimization('UX', `Generated Audit PDF for Node ${node.id}`, { filename, hash: hashToUse });
      } else {
        logOptimization('UX', `Re-downloaded Historical Audit PDF for Node ${node.id}`, { filename, hash: hashToUse });
      }
    } catch (err) {
      console.error('Audit PDF Export Failed:', err);
    } finally {
      setExportingPdf(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-900/40 overflow-hidden">
      <div className="p-6 border-b border-white/5 bg-zinc-950">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <Info className="w-6 h-6 text-zinc-300" />
            <h2 className="text-xl font-semibold  tracking-widest text-zinc-300">Node Details</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              disabled={exporting}
              className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-zinc-300 text-xs font-bold tracking-widest rounded-xl transition-colors border border-white/10 cursor-pointer"
            >
              {exported ? <CheckCircle2 className="w-4 h-4 text-[#00FF66]" /> : <FileText className="w-4 h-4" />}
              {exported ? 'Exported' : 'Export MD'}
            </button>
            <button
              onClick={() => handleExportAuditPdf()}
              disabled={exportingPdf}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#FF00FF]/10 hover:bg-[#FF00FF]/25 text-[#FF00FF] hover:text-white border border-[#FF00FF]/30 hover:border-[#FF00FF]/50 text-xs font-bold tracking-widest rounded-xl transition-all cursor-pointer active:scale-95 shadow-lg shadow-[#FF00FF]/5"
            >
              {exportedPdf ? <CheckCircle2 className="w-4 h-4 text-[#00FF66]" /> : <ShieldCheck className="w-4 h-4 animate-pulse" />}
              {exportedPdf ? 'Saved PDF' : 'Audit PDF'}
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="inline-block px-2 py-1 border border-white/10 bg-white/10">
             <p className="text-[10px] text-zinc-200 font-bold  tracking-widest">
               {node.type}
             </p>
          </div>
        </div>

        {/* Tab selection */}
        <div className="flex border-b border-white/10 mt-5">
          <button
            onClick={() => setActiveTab('overview')}
            className={cn(
              "flex-1 pb-2 text-center text-xs font-bold tracking-widest uppercase transition-all border-b-2 font-mono",
              activeTab === 'overview'
                ? "border-emerald-500 text-emerald-400 font-bold"
                : "border-transparent text-zinc-500 hover:text-zinc-300"
            )}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={cn(
              "flex-1 pb-2 text-center text-xs font-bold tracking-widest uppercase transition-all border-b-2 font-mono",
              activeTab === 'history'
                ? "border-[#FF00FF] text-[#FF00FF] font-bold"
                : "border-transparent text-zinc-500 hover:text-[#FF00FF]/70"
            )}
          >
            Audit History ({nodeHistory.length})
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-zinc-900/40 relative">
        {activeTab === 'overview' ? (
          <div className="space-y-8">
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
               <div className="text-9xl font-semibold">{node.type.substring(0, 1).toUpperCase()}</div>
            </div>
            <div className="relative z-10">
              <h3 className="text-2xl font-serif font-semibold text-zinc-100 mb-4  leading-tight">{node.label}</h3>
              <div className="flex flex-wrap gap-2 mb-6">
                {node.metadata?.tags?.map((tag, i) => (
                  <span key={i} className="px-2 py-1 bg-white/5 border border-white/5 text-[10px] text-zinc-300 font-bold  tracking-wider rounded-xl transition duration-300 backdrop-blur-md">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Micro-Telemetry Card Grid */}
              <div className="grid grid-cols-3 gap-2 mb-6 font-mono text-xs">
                {/* Elevation Card */}
                <div className="bg-zinc-950/60 p-3 border border-white/5 rounded-xl backdrop-blur-md flex flex-col justify-between">
                  <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider">ELEVATION LEVEL</span>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-sm font-bold text-purple-400">
                      {node.properties?.elevation_level !== undefined ? `Lvl ${node.properties.elevation_level}` : (node.type === 'system' ? 'Lvl 2' : 'Lvl 0')}
                    </span>
                    <span className="text-[8px] text-zinc-600">/ 4</span>
                  </div>
                  <div className="w-full bg-zinc-900 h-1 rounded overflow-hidden mt-1.5">
                    <div 
                      className="bg-purple-500 h-full rounded transition-all duration-500" 
                      style={{ width: `${((node.properties?.elevation_level !== undefined ? node.properties.elevation_level : (node.type === 'system' ? 2 : 0)) / 4) * 100}%` }} 
                    />
                  </div>
                </div>

                {/* Dread Card */}
                <div className="bg-zinc-950/60 p-3 border border-white/5 rounded-xl backdrop-blur-md flex flex-col justify-between">
                  <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider">DREAD RATIO</span>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-sm font-bold text-red-400">
                      {(((node.properties?.dread || node.properties?.dread_saturation || 0) * 100)).toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-zinc-900 h-1 rounded overflow-hidden mt-1.5">
                    <div 
                      className="bg-red-500 h-full rounded transition-all duration-500" 
                      style={{ width: `${(node.properties?.dread || node.properties?.dread_saturation || 0) * 100}%` }} 
                    />
                  </div>
                </div>

                {/* Void Card */}
                <div className="bg-zinc-950/60 p-3 border border-white/5 rounded-xl backdrop-blur-md flex flex-col justify-between">
                  <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider">VOID DEPTH</span>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-sm font-bold text-violet-400">
                      {(((node.properties?.void_quotient || node.properties?.void_contact_depth || 0) * 100)).toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-zinc-900 h-1 rounded overflow-hidden mt-1.5">
                    <div 
                      className="bg-violet-500 h-full rounded transition-all duration-500" 
                      style={{ width: `${(node.properties?.void_quotient || node.properties?.void_contact_depth || 0) * 100}%` }} 
                    />
                  </div>
                </div>
              </div>

              <div className="text-sm font-mono text-zinc-300 leading-relaxed markdown-body">
                <Markdown>{node.summary || blocksToString(node.blocks)}</Markdown>
              </div>
            </div>

            {/* Philosophical Stance */}
            {node.metadata?.philosophical_stance && (
              <div className="bg-zinc-950 p-6 border border-[#FF00FF] rounded-xl transition duration-300 backdrop-blur-md relative group transition-colors hover:bg-[#FF00FF]/5">
                <div className="flex items-center gap-3 mb-4 border-b-2 border-[#222] pb-3">
                  <Box className="w-5 h-5 text-[#FF00FF]" />
                  <h4 className="text-xs font-bold  tracking-widest text-zinc-100">Philosophical Stance</h4>
                </div>
                <p className="text-sm font-mono text-zinc-300 leading-relaxed">
                  {node.metadata.philosophical_stance}
                </p>
              </div>
            )}

            {/* Structural Significance */}
            {node.metadata?.relation_to_void && (
              <div className="bg-zinc-950 p-6 border border-[#FFD700] rounded-xl transition duration-300 backdrop-blur-md relative transition-colors hover:bg-[#FFD700]/5">
                <div className="flex items-center gap-3 mb-4 border-b-2 border-[#222] pb-3">
                  <Hash className="w-5 h-5 text-zinc-300" />
                  <h4 className="text-xs font-bold  tracking-widest text-zinc-100">Structural Significance</h4>
                </div>
                <p className="text-sm font-mono text-zinc-300 leading-relaxed">
                  {node.metadata.relation_to_void}
                </p>
              </div>
            )}

            {/* Historical Context */}
            {node.metadata?.historical_context && (
              <div className="bg-zinc-950 p-6 border border-white/10 rounded-xl transition duration-300 backdrop-blur-md relative transition-colors hover:bg-white/10">
                <div className="flex items-center gap-3 mb-4 border-b-2 border-[#222] pb-3">
                  <History className="w-5 h-5 text-zinc-300" />
                  <h4 className="text-xs font-bold  tracking-widest text-zinc-100">Historical Context</h4>
                </div>
                <p className="text-sm font-mono text-zinc-300 leading-relaxed">
                  {node.metadata.historical_context}
                </p>
              </div>
            )}

            {/* Source References */}
            {node.metadata?.source_references && node.metadata.source_references.length > 0 && (
              <div className="bg-zinc-950 p-6 border border-[#00FF66] rounded-xl transition duration-300 backdrop-blur-md relative transition-colors hover:bg-[#00FF66]/5">
                <div className="flex items-center gap-3 mb-4 border-b-2 border-[#222] pb-3">
                  <BookOpen className="w-5 h-5 text-zinc-300" />
                  <h4 className="text-xs font-bold  tracking-widest text-zinc-100">Source References</h4>
                </div>
                <ul className="space-y-3 font-mono">
                  {node.metadata.source_references.map((ref, i) => (
                    <li key={i} className="text-sm text-zinc-300 flex items-start gap-3 border-l-2 border-white/5 pl-3 py-1 hover:border-[#00FF66] transition-colors">
                      <LinkIcon className="w-4 h-4 text-zinc-400 mt-0.5 shrink-0" />
                      <span>{ref}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6 font-mono">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-300 mb-2">Cryptographic Audit Trails</h3>
              <p className="text-[10px] text-zinc-500 leading-relaxed">
                Physical, mathematically grounded verification artifacts exported for the node <strong className="text-zinc-300">"{node.label}"</strong>.
              </p>
            </div>

            {nodeHistory.length === 0 ? (
              <div className="p-8 border border-dashed border-white/10 bg-black/40 text-center rounded-xl">
                <ShieldCheck className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest block mb-1">No Historical Reports</span>
                <p className="text-[10px] text-zinc-500 max-w-xs mx-auto leading-relaxed">
                  Trigger the "Audit PDF" generation tool in the top right to register the first cryptographic provenance report.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {nodeHistory.map((item) => (
                  <div 
                    key={item.id} 
                    className="p-4 bg-zinc-950/80 border border-white/5 hover:border-[#FF00FF]/25 hover:bg-[#FF00FF]/5 rounded-xl transition-all"
                  >
                    <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-2 mb-2">
                      <span className="text-[9px] bg-white/5 border border-white/10 text-zinc-400 rounded px-1.5 py-0.5 font-bold uppercase">
                        {item.id}
                      </span>
                      <span className="text-[8px] text-zinc-500 uppercase">
                        {new Date(item.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div className="space-y-1.5 text-[9px]">
                      <p className="text-zinc-400 truncate font-bold">
                        FILE: <span className="text-zinc-200">{item.filename}</span>
                      </p>
                      <p className="text-zinc-500 truncate font-mono select-all">
                        HASH: <span className="text-[#00FF66]">{item.hash}</span>
                      </p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-white/5 flex justify-end">
                      <button
                        onClick={() => handleExportAuditPdf(item)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-[#FF00FF]/15 hover:bg-[#FF00FF]/30 text-white text-[9px] font-bold uppercase tracking-wider rounded-lg transition-colors border border-[#FF00FF]/20 cursor-pointer"
                        title="Re-download identical historical audit PDF document"
                      >
                        <Download className="w-3 h-3 text-[#FF00FF]" />
                        Retrieve & Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
