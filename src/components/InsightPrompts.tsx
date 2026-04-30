import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Node, Link } from '../data/corpus';
import { Zap, ArrowRight, Sparkles, BrainCircuit, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import Markdown from 'react-markdown';

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
  const [synthesizingId, setSynthesizingId] = useState<string | null>(null);
  const [synthesisResults, setSynthesisResults] = useState<Record<string, string>>({});

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

  const handleSynthesizePair = async (sourceTargetId: string, sourceLabel: string, targetLabel: string, reason: string) => {
    setSynthesizingId(sourceTargetId);
    try {
      const apiKey = process.env.GEMINI_API_KEY?.trim();
      if (!apiKey) {
        setSynthesisResults(prev => ({ ...prev, [sourceTargetId]: "Error: GEMINI_API_KEY not configured." }));
        return;
      }
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `
        SYSTEM_IDENTITY: PEC-Engine (Philosophical Exploration Catalyst).
        MISSION: Collide these two disparate concepts from our knowledge graph.
        
        [Concept A]: "${sourceLabel}"
        [Concept B]: "${targetLabel}"
        [Bridge]: ${reason}
        
        OUTPUT FORMAT (STRICT MARKDOWN):
        Do not use JSON. Write a mini-essay with these headers:
        
        ## The Polarity
        (Define the tension/contradiction between the two ideas).
        
        ## The Synthesis
        (The bridge. Identify the hidden unity or productive paradox.)
      `;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: prompt,
      });

      if (response.text) {
        setSynthesisResults(prev => ({ ...prev, [sourceTargetId]: response.text }));
      }
    } catch (e: any) {
      console.error(e);
      setSynthesisResults(prev => ({ ...prev, [sourceTargetId]: "Synthesis failed. Entropy encountered." }));
    } finally {
      setSynthesizingId(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-100 font-mono border-l border-white/5 relative">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxyZWN0IHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9IiMwMDAiIC8+PGNpcmNsZSBjeD0iNCIgY3k9IjQiIHI9IjEiIGZpbGw9IiMzMzMiIC8+PC9zdmc+')] opacity-20 pointer-events-none z-0"></div>

      {/* Header */}
      <div className="p-6 border-b border-white/5 bg-zinc-900/40 relative z-10">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-white/5 border border-[#FFD700] rounded-xl transition duration-300 backdrop-blur-md">
            <BrainCircuit className="w-6 h-6 text-zinc-300 animate-pulse-slow" />
          </div>
          <h2 className="text-2xl font-semibold tracking-widest  text-white">Insight Prompts</h2>
        </div>
        <p className="text-[10px] text-zinc-400 font-bold  tracking-widest leading-relaxed border-l-2 border-[#FFD700] pl-3">
          Latent Synapses detected. 
          <br/>These are conceptual bridges waiting to be formalized.
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar relative z-10">
        {latentLinks.length === 0 ? (
          <div className="text-center p-8 border border-dashed border-white/20 bg-white/5 text-zinc-400 font-bold  tracking-widest text-[10px] rounded-xl transition duration-300 backdrop-blur-md">
            No latent synapses detected. <br/><span className="text-zinc-300">Expand your ontology.</span>
          </div>
        ) : (
          latentLinks.map((link, idx) => {
            const pairId = `${link.source.id}-${link.target.id}`;
            const isActive = activePrompt === pairId;
            const isSynthesizing = synthesizingId === pairId;
            const result = synthesisResults[pairId];

            return (
            <motion.div
              key={pairId}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={cn(
                "p-6 border transition-all duration-300 cursor-pointer group rounded-xl transition duration-300 backdrop-blur-md relative overflow-hidden",
                isActive
                  ? "bg-zinc-900/40 border-[#FFD700] shadow-xl"
                  : "bg-white/5 border-white/5 hover:border-[#FFD700]"
              )}
              onClick={() => setActivePrompt(
                isActive ? null : pairId
              )}
            >
              {isActive && (
                 <div className="absolute top-0 right-0 p-1 bg-[#FFD700] text-zinc-950 text-[8px] font-semibold  tracking-widest border-b-2 border-l-2 border-[#000]">
                   ACTIVE.SYNAPSE
                 </div>
              )}

              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 border border-[#FFD700] bg-zinc-950 flex items-center justify-center text-zinc-300">
                    <Zap className="w-4 h-4" />
                  </div>
                  <span className="text-[10px]  tracking-widest text-zinc-300 font-semibold bg-[#FFD700]/10 border border-[#FFD700]/30 px-2 py-1">
                    Latent Bridge
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div 
                  className="text-base font-semibold text-white group-hover:text-zinc-300 transition-colors leading-snug  tracking-wider"
                  onClick={(e) => { e.stopPropagation(); onNodeSelect(link.source); }}
                >
                  {link.source.label}
                </div>
                
                <div className="flex items-center gap-3 text-zinc-200 pl-3 border-l-2 border-white/10 py-2 bg-zinc-950 border-y-2 border-r-2 border-y-[#222] border-r-[#222]">
                  <ArrowRight className="w-4 h-4" />
                  <span className="text-[10px]  tracking-widest font-bold">
                    VIA: {link.reason}
                  </span>
                </div>

                <div 
                  className="text-base font-semibold text-white group-hover:text-zinc-300 transition-colors leading-snug  tracking-wider text-right"
                  onClick={(e) => { e.stopPropagation(); onNodeSelect(link.target); }}
                >
                  {link.target.label}
                </div>
              </div>

              <AnimatePresence>
                {isActive && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-6 pt-6 border-t-2 border-white/5">
                      {result ? (
                        <div className="prose prose-invert prose-sm font-sans mb-4 p-4 border border-[#FFD700]/50 bg-[#FFD700]/5 rounded-xl">
                          <Markdown>{result}</Markdown>
                        </div>
                      ) : (
                        <p className="text-xs text-zinc-300 leading-relaxed mb-6 font-serif italic border-l-2 border-white/10 pl-4">
                          <strong className="text-zinc-300 font-mono not-italic  tracking-widest block mb-2 text-[10px]">Synthesis Prompt:</strong>
                          How does the concept of "{link.source.label}" recontextualize or challenge "{link.target.label}" when viewed through the lens of {link.reason}?
                        </p>
                      )}
                      {!result && (
                        <button 
                          disabled={isSynthesizing}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSynthesizePair(pairId, link.source.label, link.target.label, link.reason);
                          }}
                          className="w-full py-4 border border-white/10 bg-zinc-800 text-white border-transparent hover:bg-zinc-700 hover:bg-[#fff] hover:border-[#fff] disabled:opacity-50 disabled:bg-zinc-800 disabled:text-zinc-400 hover:text-zinc-950 font-semibold text-xs tracking-widest  transition-colors flex items-center justify-center gap-3 rounded-xl transition duration-300 backdrop-blur-md shadow-xl hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
                        >
                          {isSynthesizing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                          {isSynthesizing ? "Synthesizing..." : "Generate Synthesis"}
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )})
        )}
      </div>
    </div>
  );
}
