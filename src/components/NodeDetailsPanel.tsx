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
      <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-[#0a0a0a] border-l border-white/5">
        <Info className="w-12 h-12 text-zinc-700 mb-4" />
        <h3 className="text-zinc-400 font-medium">No Node Selected</h3>
        <p className="text-zinc-600 text-sm mt-2">
          Select a node from the graph to view its details, historical context, and philosophical stance.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] border-l border-white/5 overflow-hidden">
      <div className="p-6 border-b border-white/10 bg-[#0f0f0f]">
        <div className="flex items-center gap-3 mb-2">
          <Info className="w-5 h-5 text-orange-500" />
          <h2 className="text-lg font-medium text-zinc-100">Node Details</h2>
        </div>
        <p className="text-xs text-zinc-500 uppercase tracking-widest">
          {node.type}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
        <div>
          <h3 className="text-xl font-serif text-zinc-100 mb-2">{node.label}</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {node.metadata?.tags?.map((tag, i) => (
              <span key={i} className="px-2 py-1 bg-white/5 rounded text-[10px] text-zinc-500 uppercase tracking-wider">
                {tag}
              </span>
            ))}
          </div>
          <div className="text-sm text-zinc-300 leading-relaxed prose prose-invert max-w-none">
            <Markdown>{node.summary || blocksToString(node.blocks)}</Markdown>
          </div>
        </div>

        {/* Philosophical Stance */}
        {node.metadata?.philosophical_stance && (
          <div className="neo-flat rounded-xl p-5 border border-white/5">
            <div className="flex items-center gap-2 mb-3">
              <Box className="w-4 h-4 text-fuchsia-500" />
              <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Philosophical Stance</h4>
            </div>
            <p className="text-sm text-zinc-300 leading-relaxed">
              {node.metadata.philosophical_stance}
            </p>
          </div>
        )}

        {/* Relation to the Void */}
        {node.metadata?.relation_to_void && (
          <div className="neo-flat rounded-xl p-5 border border-white/5">
            <div className="flex items-center gap-2 mb-3">
              <Hash className="w-4 h-4 text-emerald-500" />
              <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Relation to the Void</h4>
            </div>
            <p className="text-sm text-zinc-300 leading-relaxed">
              {node.metadata.relation_to_void}
            </p>
          </div>
        )}

        {/* Historical Context */}
        {node.metadata?.historical_context && (
          <div className="neo-flat rounded-xl p-5 border border-white/5">
            <div className="flex items-center gap-2 mb-3">
              <History className="w-4 h-4 text-blue-500" />
              <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Historical Context</h4>
            </div>
            <p className="text-sm text-zinc-300 leading-relaxed">
              {node.metadata.historical_context}
            </p>
          </div>
        )}

        {/* Source References */}
        {node.metadata?.source_references && node.metadata.source_references.length > 0 && (
          <div className="neo-flat rounded-xl p-5 border border-white/5">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-4 h-4 text-orange-500" />
              <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Source References</h4>
            </div>
            <ul className="space-y-2">
              {node.metadata.source_references.map((ref, i) => (
                <li key={i} className="text-sm text-zinc-300 flex items-start gap-2">
                  <LinkIcon className="w-3 h-3 text-zinc-500 mt-1 shrink-0" />
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
