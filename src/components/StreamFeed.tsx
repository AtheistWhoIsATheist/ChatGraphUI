import React from 'react';
import { SummaryFeed } from './SummaryFeed';
import { RevelationDigest } from './RevelationDigest';
import { Node } from '../data/corpus';
import { Sparkles, Eye } from 'lucide-react';

export function StreamFeed({ nodes, onNodeSelect, selectedNodeId }: { nodes: Node[], onNodeSelect: (node: Node) => void, selectedNodeId?: string }) {
  return (
    <div className="w-full h-full flex flex-col md:flex-row overflow-hidden bg-[#0a0a0a]">
      <div className="flex-1 border-r border-white/5 h-full overflow-hidden flex flex-col">
        <div className="p-6 border-b border-white/5 bg-black/40 flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-orange-500" />
          <h2 className="text-lg font-light tracking-widest uppercase text-white">AutoNarrative Summaries</h2>
        </div>
        <div className="flex-1 overflow-hidden relative">
          <SummaryFeed nodes={nodes} onNodeSelect={onNodeSelect} selectedNodeId={selectedNodeId} />
        </div>
      </div>
      <div className="flex-1 h-full overflow-hidden flex flex-col">
        <div className="p-6 border-b border-white/5 bg-black/40 flex items-center gap-3">
          <Eye className="w-5 h-5 text-orange-500" />
          <h2 className="text-lg font-light tracking-widest uppercase text-white">The Shifting Void</h2>
        </div>
        <div className="flex-1 overflow-hidden relative">
          <RevelationDigest />
        </div>
      </div>
    </div>
  );
}
