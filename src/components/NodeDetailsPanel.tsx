import React from 'react';
import { motion } from 'motion/react';
import { Node } from '../data/corpus';
import { Info, BookOpen, Link as LinkIcon, History, Hash, Box } from 'lucide-react';
import { cn } from '../lib/utils';
import Markdown from 'react-markdown';
import { blocksToString } from '../utils/voidUtils';

interface NodeDetailsPanelProps {
  node?: Node;
}

export function NodeDetailsPanel({ node }: NodeDetailsPanelProps) {
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

  return (
    <div className="flex flex-col h-full bg-zinc-900/40 overflow-hidden">
      <div className="p-6 border-b border-white/5 bg-zinc-950">
        <div className="flex items-center gap-3 mb-2">
          <Info className="w-6 h-6 text-zinc-300" />
          <h2 className="text-xl font-semibold  tracking-widest text-zinc-300">Node Details</h2>
        </div>
        <div className="inline-block px-2 py-1 mt-2 border border-white/10 bg-white/10">
           <p className="text-[10px] text-zinc-200 font-bold  tracking-widest">
             {node.type}
           </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8 bg-zinc-900/40 relative">
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
    </div>
  );
}
