import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Node, Link } from '../data/corpus';
import { Zap, ArrowRight, Sparkles, BrainCircuit } from 'lucide-react';
import { cn } from '../lib/utils';

export function InsightPrompts({ 
  nodes, 
  links,
  onNodeSelect 
}: { 
  nodes: Node[]; 
  links: Link[];
  onNodeSelect: (node: Node) => void;
}) {
  const [activePrompt, setActivePrompt] = useState<string | null>(null);

  const latentLinks = useMemo(() => {
    const lLinks: { source: Node; target: Node; reason: string }[] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const n1 = nodes[i];
        const n2 = nodes[j];
        const isLinked = links.some(l => 
          (typeof l.source === 'string' ? l.source === n1.id : (l.source as any).id === n1.id) && 
          (typeof l.target === 'string' ? l.target === n2.id : (l.target as any).id === n2.id) ||
          (typeof l.source === 'string' ? l.source === n2.id : (l.source as any).id === n2.id) && 
          (typeof l.target === 'string' ? l.target === n1.id : (l.target as any).id === n1.id)
        );
        if (!isLinked) {
          const tags1 = n1.metadata?.tags || [];
          const tags2 = n2.metadata?.tags || [];
          const sharedTags = tags1.filter(t => tags2.includes(t));
          if (sharedTags.length >= 2) {
            lLinks.push({ source: n1, target: n2, reason: sharedTags.join(', ') });
          }
        }
      }
    }
    return lLinks.slice(0, 15); // Limit to top 15 for performance/UI
  }, [nodes, links]);

  return (
    <div className="flex flex-col h-full bg-[#000] text-[#eee] font-mono border-l-4 border-[#333] relative">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxyZWN0IHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9IiMwMDAiIC8+PGNpcmNsZSBjeD0iNCIgY3k9IjQiIHI9IjEiIGZpbGw9IiMzMzMiIC8+PC9zdmc+')] opacity-20 pointer-events-none z-0"></div>

      {/* Header */}
      <div className="p-6 border-b-4 border-[#333] bg-[#050505] relative z-10">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-[#111] border-2 border-[#FFD700] neo-flat">
            <BrainCircuit className="w-6 h-6 text-[#FFD700] animate-pulse-slow" />
          </div>
          <h2 className="text-2xl font-black tracking-widest uppercase text-[#fff]">Insight Prompts</h2>
        </div>
        <p className="text-[10px] text-[#888] font-bold uppercase tracking-[0.2em] leading-relaxed border-l-2 border-[#FFD700] pl-3">
          Latent Synapses detected. 
          <br/>These are conceptual bridges waiting to be formalized.
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar relative z-10">
        {latentLinks.length === 0 ? (
          <div className="text-center p-8 border-2 border-dashed border-[#555] bg-[#111] text-[#888] font-bold uppercase tracking-widest text-[10px] neo-flat">
            No latent synapses detected. <br/><span className="text-[#00E5FF]">Expand your ontology.</span>
          </div>
        ) : (
          latentLinks.map((link, idx) => (
            <motion.div
              key={`${link.source.id}-${link.target.id}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={cn(
                "p-6 border-2 transition-all duration-300 cursor-pointer group neo-flat relative overflow-hidden",
                activePrompt === `${link.source.id}-${link.target.id}`
                  ? "bg-[#050505] border-[#FFD700] shadow-[6px_6px_0_rgba(255,215,0,0.3)]"
                  : "bg-[#111] border-[#333] hover:border-[#FFD700]"
              )}
              onClick={() => setActivePrompt(
                activePrompt === `${link.source.id}-${link.target.id}` ? null : `${link.source.id}-${link.target.id}`
              )}
            >
              {activePrompt === `${link.source.id}-${link.target.id}` && (
                 <div className="absolute top-0 right-0 p-1 bg-[#FFD700] text-[#000] text-[8px] font-black uppercase tracking-widest border-b-2 border-l-2 border-[#000]">
                   ACTIVE.SYNAPSE
                 </div>
              )}

              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 border-2 border-[#FFD700] bg-[#000] flex items-center justify-center text-[#FFD700]">
                    <Zap className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[#FFD700] font-black bg-[#FFD700]/10 border border-[#FFD700]/30 px-2 py-1">
                    Latent Bridge
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div 
                  className="text-base font-black text-[#fff] group-hover:text-[#FFD700] transition-colors leading-snug uppercase tracking-wider"
                  onClick={(e) => { e.stopPropagation(); onNodeSelect(link.source); }}
                >
                  {link.source.label}
                </div>
                
                <div className="flex items-center gap-3 text-[#FF3A00] pl-3 border-l-2 border-[#FF3A00] py-2 bg-[#000] border-y-2 border-r-2 border-y-[#222] border-r-[#222]">
                  <ArrowRight className="w-4 h-4" />
                  <span className="text-[10px] uppercase tracking-widest font-bold">
                    VIA: {link.reason}
                  </span>
                </div>

                <div 
                  className="text-base font-black text-[#fff] group-hover:text-[#FFD700] transition-colors leading-snug uppercase tracking-wider text-right"
                  onClick={(e) => { e.stopPropagation(); onNodeSelect(link.target); }}
                >
                  {link.target.label}
                </div>
              </div>

              <AnimatePresence>
                {activePrompt === `${link.source.id}-${link.target.id}` && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-6 pt-6 border-t-2 border-[#333]">
                      <p className="text-xs text-[#ccc] leading-relaxed mb-6 font-serif italic border-l-2 border-[#444] pl-4">
                        <strong className="text-[#FFD700] font-mono not-italic uppercase tracking-widest block mb-2 text-[10px]">Synthesis Prompt:</strong>
                        How does the concept of "{link.source.label}" recontextualize or challenge "{link.target.label}" when viewed through the lens of {link.reason}?
                      </p>
                      <button className="w-full py-4 border-2 border-[#00E5FF] bg-[#00E5FF] hover:bg-[#fff] hover:border-[#fff] text-[#000] font-black text-xs tracking-widest uppercase transition-colors flex items-center justify-center gap-3 neo-flat shadow-[4px_4px_0_rgba(0,229,255,0.4)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]">
                        <Sparkles className="w-4 h-4" />
                        Generate Synthesis
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
