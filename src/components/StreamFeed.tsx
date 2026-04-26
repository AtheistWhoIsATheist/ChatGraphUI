import React from 'react';
import { SummaryFeed } from './SummaryFeed';
import { RevelationDigest } from './RevelationDigest';
import { Node } from '../data/corpus';
import { Sparkles, Eye } from 'lucide-react';

export function StreamFeed({ nodes, onNodeSelect, selectedNodeId }: { nodes: Node[], onNodeSelect: (node: Node) => void, selectedNodeId?: string }) {
  return (
    <div className="w-full h-full flex flex-col md:flex-row overflow-hidden bg-[#000] font-mono text-[#eee]">
      <div className="flex-1 border-r-2 border-[#333] h-full overflow-hidden flex flex-col relative z-10">
        <div className="p-6 border-b-2 border-[#333] bg-[#050505] flex items-center gap-4">
          <div className="p-2 bg-[#111] border-2 border-[#FF3A00]">
            <Sparkles className="w-5 h-5 text-[#FF3A00] animate-pulse-slow" />
          </div>
          <h2 className="text-xl font-black tracking-widest uppercase text-[#FF3A00]">AutoNarrative Summaries</h2>
        </div>
        <div className="flex-1 overflow-hidden relative">
          <SummaryFeed nodes={nodes} onNodeSelect={onNodeSelect} selectedNodeId={selectedNodeId} />
        </div>
      </div>
      <div className="flex-1 h-full overflow-hidden flex flex-col relative z-20">
        <div className="p-6 border-b-2 border-[#333] bg-[#050505] flex items-center gap-4">
          <div className="p-2 bg-[#111] border-2 border-[#00E5FF]">
            <Eye className="w-5 h-5 text-[#00E5FF] animate-pulse-slow" />
          </div>
          <h2 className="text-xl font-black tracking-widest uppercase text-[#00E5FF]">Data Feed</h2>
        </div>
        <div className="flex-1 overflow-hidden relative">
          <RevelationDigest />
        </div>
      </div>
    </div>
  );
}
