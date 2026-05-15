import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';

interface InsightOverlayProps {
  selectedNodeId: string | undefined;
  selectedInsights: {
    degree: number;
    suggestion: string | null;
    isSingularity: boolean;
  } | null;
}

export function InsightOverlay({ selectedNodeId, selectedInsights }: InsightOverlayProps) {
  return (
    <AnimatePresence>
      {selectedNodeId && selectedInsights && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="absolute bottom-6 left-6 z-40 w-80 bg-zinc-900/50 border border-white/10 p-6 rounded-2xl backdrop-blur-md shadow-2xl"
        >
          <div className="flex items-center gap-3 mb-4 text-zinc-300">
            <Sparkles className="w-5 h-5 animate-pulse text-amber-400" />
            <span className="text-[10px] font-bold tracking-widest uppercase">Latent Discovery Engine</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white/5 border border-white/5 p-4 text-center rounded-xl">
              <div className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase mb-1">Centrality</div>
              <div className="text-3xl font-serif font-semibold text-white">{selectedInsights.degree}</div>
            </div>
            <div className={cn(
              "border p-4 text-center flex flex-col justify-center rounded-xl", 
              selectedInsights.isSingularity ? "bg-amber-500/10 border-amber-500/30" : "bg-emerald-500/10 border-emerald-500/30"
            )}>
              <div className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase mb-1">Topology</div>
              <div className={cn("text-[10px] font-bold tracking-widest", selectedInsights.isSingularity ? "text-amber-400" : "text-emerald-400")}>
                {selectedInsights.isSingularity ? "SINGULARITY" : "INTEGRATED"}
              </div>
            </div>
          </div>

          {selectedInsights.suggestion && (
            <div className="text-[11px] text-zinc-400 bg-black/40 p-4 border border-white/5 leading-relaxed font-mono rounded-xl">
              <strong className="text-zinc-300 block mb-2 tracking-widest text-[9px] uppercase font-bold">Inference Target:</strong>
              {selectedInsights.suggestion}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
