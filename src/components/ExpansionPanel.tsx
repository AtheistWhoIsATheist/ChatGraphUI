import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Activity } from 'lucide-react';
import { Node } from '../data/corpus';
import { blocksToString } from '../utils/voidUtils';

interface ExpansionPanelProps {
  expandedNodeId: string | null;
  setExpandedNodeId: (id: string | null) => void;
  nodes: Node[];
  initialLinks: any[];
}

export function ExpansionPanel({ expandedNodeId, setExpandedNodeId, nodes, initialLinks }: ExpansionPanelProps) {
  const expandedNode = nodes.find(n => n.id === expandedNodeId);
  const expandedLinks = initialLinks.filter(l => 
    (typeof l.source === 'string' ? l.source === expandedNodeId : (l.source as any).id === expandedNodeId) || 
    (typeof l.target === 'string' ? l.target === expandedNodeId : (l.target as any).id === expandedNodeId)
  );
  const gravityCount = expandedLinks.length;
  const synapses = expandedLinks.map(l => {
    const sourceId = typeof l.source === 'string' ? l.source : (l.source as any).id;
    const targetId = typeof l.target === 'string' ? l.target : (l.target as any).id;
    const linkedNodeId = sourceId === expandedNodeId ? targetId : sourceId;
    return nodes.find(n => n.id === linkedNodeId);
  }).filter(Boolean) as Node[];

  return (
    <AnimatePresence>
      {expandedNodeId && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setExpandedNodeId(null)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
          
          <motion.div 
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute top-0 right-0 h-full w-[450px] bg-[#0c0c0c] border-l border-white/10 z-50 shadow-2xl flex flex-col"
          >
            <div className="p-8 border-b border-white/5 flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 text-zinc-500 mb-2">
                  <Activity className="w-4 h-4 text-emerald-500" />
                  <span className="text-[10px] tracking-widest font-bold uppercase">Semantic Stream Root</span>
                </div>
                <h2 className="text-3xl font-serif font-light text-white leading-tight">
                  {expandedNode?.label}
                </h2>
              </div>
              <button 
                onClick={() => setExpandedNodeId(null)}
                className="p-2 hover:bg-white/5 rounded-full transition-colors text-zinc-500 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <div className="prose prose-invert prose-sm max-w-none">
                <div className="text-zinc-400 leading-relaxed whitespace-pre-wrap font-light text-base font-mono">
                  {blocksToString(expandedNode?.blocks)}
                </div>
              </div>

              <div className="mt-12 space-y-6">
                {expandedNode?.metadata?.deconstruction_residue && (
                  <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-2 opacity-10">
                      <Activity className="w-12 h-12" />
                    </div>
                    <div className="text-[9px] text-zinc-500 uppercase tracking-widest mb-3 font-bold">Sub-textual Residue</div>
                    <div className="text-sm text-zinc-300 italic leading-relaxed font-serif">
                      "{expandedNode.metadata.deconstruction_residue}"
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-zinc-900/50 rounded-2xl border border-white/5">
                    <div className="text-[9px] text-zinc-600 uppercase tracking-widest mb-1 font-bold">Vector Gravity</div>
                    <div className="text-2xl font-light text-zinc-300 font-mono">{gravityCount}</div>
                  </div>
                  <div className="p-4 bg-zinc-900/50 rounded-2xl border border-white/5">
                    <div className="text-[9px] text-zinc-600 uppercase tracking-widest mb-1 font-bold">Verification</div>
                    <div className="text-xs text-zinc-300 mt-2 font-mono uppercase">{expandedNode?.status}</div>
                  </div>
                </div>

                {synapses.length > 0 && (
                  <div>
                    <div className="text-[9px] text-zinc-600 uppercase tracking-widest mb-4 font-bold border-b border-white/5 pb-2">Topological Synapses</div>
                    <div className="space-y-2">
                      {synapses.map(synapse => (
                        <div 
                          key={synapse.id}
                          onClick={() => setExpandedNodeId(synapse.id)}
                          className="p-4 bg-black/40 border border-white/5 rounded-xl hover:border-emerald-500/40 transition-all cursor-pointer flex justify-between items-center group"
                        >
                          <span className="text-sm text-zinc-400 group-hover:text-white transition-colors">{synapse.label}</span>
                          <span className="text-[8px] uppercase tracking-wider text-zinc-600 border border-white/10 px-2 py-0.5 rounded-full group-hover:border-emerald-500/20 group-hover:text-emerald-500 transition-all">{synapse.type}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <div className="text-[9px] text-zinc-600 uppercase tracking-widest mb-4 font-bold border-b border-white/5 pb-2">Semantic Markers</div>
                  <div className="flex flex-wrap gap-2">
                    {expandedNode?.metadata?.tags?.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-zinc-900/50 border border-white/10 rounded-full text-[9px] uppercase tracking-tighter text-zinc-500 font-mono hover:text-zinc-300 hover:border-white/20 transition-all cursor-crosshair"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
