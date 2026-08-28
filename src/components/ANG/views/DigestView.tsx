import React from 'react';
import { LayoutGrid, Download, FileText, ChevronDown } from 'lucide-react';


interface DigestProps {
  dateStart: string;
  dateEnd: string;
  generatedAt: string;
  stats: {
    sourcesIngested: number;
    nodesCreated: number;
    sessions: number;
    totalSessionTime: string;
    paradoxesConfirmed: number;
    aporiaAdded: number;
    invarianceAnalyses: number;
    newInvariants: number;
  };
  synthesisNote: string;
  pendingReviewCount: number;
}

export const DigestView: React.FC<DigestProps> = ({ 
  dateStart, 
  dateEnd, 
  generatedAt,
  stats,
  synthesisNote,
  pendingReviewCount
}) => {
  return (
    <div className="w-full h-full flex flex-col bg-[#0D0D0D] overflow-y-auto">
      <div className="max-w-4xl mx-auto w-full p-8 flex flex-col gap-8">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1E1E1E] pb-6">
          <div>
            <h1 className="text-xl font-display text-[#C8C0B0] flex items-center gap-3">
              <LayoutGrid className="w-6 h-6 text-[#C8C0B0]" />
              DIGEST: Week of {dateStart} — {dateEnd}
            </h1>
            <p className="text-sm font-mono text-[#5A5450] mt-2 tracking-widest uppercase">
              Generated: {new Date(generatedAt).toLocaleString()}
            </p>
          </div>
          <div className="flex gap-3 text-[10px] font-mono font-bold tracking-widest uppercase">
            <button className="px-4 py-2 bg-[#1E1E1E] hover:bg-[#2A2A2A] text-[#C8C0B0] border border-[#2A2A2A] rounded-xl transition-colors flex items-center gap-2">
              <Download className="w-3 h-3" /> PDF
            </button>
            <button className="px-4 py-2 bg-[#1E1E1E] hover:bg-[#2A2A2A] text-[#C8C0B0] border border-[#2A2A2A] rounded-xl transition-colors flex items-center gap-2">
              <FileText className="w-3 h-3" /> MD
            </button>
          </div>
        </div>

        {/* Stats Block */}
        <div className="bg-[#121212] border border-[#1E1E1E] rounded-2xl p-6 flex flex-col gap-4">
          <h3 className="text-xs font-mono text-[#5A5450] tracking-widest uppercase font-bold border-b border-[#1E1E1E] pb-3 mb-2">This Week in Nihiltheism</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex flex-col gap-1">
              <span className="text-2xl text-[#C8C0B0] font-light">{stats.sourcesIngested}</span>
              <span className="text-[10px] font-mono text-[#8A8278] uppercase tracking-wider">Sources Ingested</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-2xl text-[#3A6A3A] font-light">{stats.nodesCreated}</span>
              <span className="text-[10px] font-mono text-[#8A8278] uppercase tracking-wider">Nodes Created</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-2xl text-[#C8C0B0] font-light">{stats.sessions}</span>
              <span className="text-[10px] font-mono text-[#8A8278] uppercase tracking-wider">Sessions</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-2xl text-[#C8C0B0] font-light">{stats.totalSessionTime}</span>
              <span className="text-[10px] font-mono text-[#8A8278] uppercase tracking-wider">Session Time</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-2xl text-[#6A3A6A] font-light">{stats.paradoxesConfirmed}</span>
              <span className="text-[10px] font-mono text-[#8A8278] uppercase tracking-wider">Paradoxes Confirmed</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-2xl text-[#6A6A2A] font-light">{stats.aporiaAdded}</span>
              <span className="text-[10px] font-mono text-[#8A8278] uppercase tracking-wider">Aporia Added</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-2xl text-[#C8C0B0] font-light">{stats.invarianceAnalyses}</span>
              <span className="text-[10px] font-mono text-[#8A8278] uppercase tracking-wider">Invariance Analyses</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-2xl text-[#C8C0B0] font-light">{stats.newInvariants}</span>
              <span className="text-[10px] font-mono text-[#8A8278] uppercase tracking-wider">New Invariants</span>
            </div>
          </div>
        </div>

        {/* Curator's Synthesis Note */}
        <div className="flex flex-col gap-3">
          <button className="flex items-center gap-2 text-xs font-mono text-[#8A8278] uppercase tracking-widest font-bold hover:text-[#C8C0B0] transition-colors w-full text-left">
            <ChevronDown className="w-4 h-4" /> Curator's Synthesis Note
          </button>
          <div className="bg-[#121212] border-l-2 border-[#3A6A3A] border-y border-r border-[#1E1E1E] rounded-r-2xl p-6 flex flex-col gap-6">
            <div className="text-sm text-[#B8B0A0] leading-[1.7] whitespace-pre-wrap">
              {synthesisNote}
            </div>
            <div className="pt-4 border-t border-[#1E1E1E] flex">
              <button className="text-[10px] font-mono text-[#8A8278] hover:text-[#C8C0B0] uppercase tracking-widest font-bold transition-colors">
                Explore this synthesis with Curator →
              </button>
            </div>
          </div>
        </div>

        {/* Pending Review Items */}
        <div className="flex flex-col gap-3">
          <button className="flex items-center gap-2 text-xs font-mono text-[#8A8278] uppercase tracking-widest font-bold hover:text-[#C8C0B0] transition-colors w-full text-left">
            <ChevronDown className="w-4 h-4" /> Pending Review Items
          </button>
          <div className="bg-[#121212] border border-[#1E1E1E] rounded-2xl p-6 flex items-center justify-between">
            <div className="flex gap-6 text-sm text-[#8A8278]">
              <span>Deferred items: <strong className="text-[#C8C0B0]">{pendingReviewCount}</strong></span>
              <span>Partial paradoxes: <strong className="text-[#6A3A6A]">2</strong></span>
            </div>
            <button className="text-[10px] font-mono bg-[#1E1E1E] hover:bg-[#2A2A2A] text-[#C8C0B0] px-4 py-2 rounded-xl uppercase tracking-widest font-bold transition-colors border border-[#2A2A2A]">
              Review Now →
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
