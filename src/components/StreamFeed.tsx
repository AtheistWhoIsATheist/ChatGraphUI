import React from 'react';
import { SummaryFeed } from './SummaryFeed';
import { RevelationDigest } from './RevelationDigest';
import { Node } from '../data/corpus';
import { Sparkles, Eye } from 'lucide-react';

export function StreamFeed({ nodes, onNodeSelect, selectedNodeId }: { nodes: Node[], onNodeSelect: (node: Node) => void, selectedNodeId?: string }) {
  return (
    <div className="w-full h-full flex flex-col md:flex-row overflow-hidden bg-zinc-950 font-mono text-zinc-100">
      <div className="flex-1 border-r-2 border-white/5 h-full overflow-hidden flex flex-col relative z-10">
        <div className="p-6 border-b-2 border-white/5 bg-zinc-900/40 flex items-center gap-4">
          <div className="p-2 bg-white/5 border border-white/10">
            <Sparkles className="w-5 h-5 text-zinc-200 animate-pulse-slow" />
          </div>
          <h2 className="text-xl font-semibold tracking-widest  text-zinc-200">AutoNarrative Summaries</h2>
        </div>
        <div className="flex-1 overflow-hidden relative">
          <SummaryFeed nodes={nodes} onNodeSelect={onNodeSelect} selectedNodeId={selectedNodeId} />
        </div>
      </div>
      <div className="flex-1 h-full overflow-hidden flex flex-col relative z-20">
        <div className="p-6 border-b-2 border-white/5 bg-zinc-900/40 flex items-center gap-4">
          <div className="p-2 bg-white/5 border border-white/10">
            <Eye className="w-5 h-5 text-zinc-300 animate-pulse-slow" />
          </div>
          <h2 className="text-xl font-semibold tracking-widest  text-zinc-300">Data Feed</h2>
        </div>
        <div className="flex-1 overflow-hidden relative">
          <RevelationDigest />
        </div>
      </div>
    </div>
  );
}
