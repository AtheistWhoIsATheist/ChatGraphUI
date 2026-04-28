/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */


import { motion } from 'motion/react';
import { Node } from '../data/corpus';
import { Quote, Sparkles, HelpCircle, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { blocksToString } from '../utils/voidUtils';
import Markdown from 'react-markdown';

interface SummaryFeedProps {
  nodes: Node[];
  onNodeSelect: (node: Node) => void;
  selectedNodeId?: string;
}

export function SummaryFeed({ nodes, onNodeSelect, selectedNodeId }: SummaryFeedProps) {
  const summaries = nodes.filter(n => n.type === 'summary');
  const questions = nodes.filter(n => n.type === 'question');
  const rawDrops = nodes.filter(n => n.status === 'RAW').sort((a, b) => {
    const dateA = a.metadata?.date_added ? new Date(a.metadata.date_added).getTime() : 0;
    const dateB = b.metadata?.date_added ? new Date(b.metadata.date_added).getTime() : 0;
    return dateB - dateA;
  });

  return (
    <div className="flex flex-col h-full bg-zinc-950 p-8 font-mono overflow-y-auto custom-scrollbar relative">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none"></div>
      <div className="mb-12 relative z-10 border-b-2 border-white/5 pb-6">
        <h2 className="text-3xl font-semibold text-white tracking-widest ">Stream Feed</h2>
        <p className="text-xs font-bold text-zinc-200  tracking-widest mt-2 border-l-2 border-white/10 pl-3">Distilled Essence & Raw Drops</p>
      </div>

      <div className="space-y-16 max-w-4xl mx-auto relative z-10">
        {/* Raw Drops Section */}
        {rawDrops.length > 0 && (
          <div className="mb-16">
            <h2 className="text-xl font-bold tracking-widest  text-zinc-300 mb-8 flex items-center gap-3"><div className="w-2 h-8 bg-zinc-800 text-white border-transparent hover:bg-zinc-700"></div> Recent Ingestions <span className="text-zinc-400">[RAW]</span></h2>
            <div className="space-y-6">
              {rawDrops.map((drop) => (
                <motion.div
                  key={drop.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={() => onNodeSelect(drop)}
                  className={cn(
                    "bg-zinc-900/40 p-6 cursor-pointer border transition-colors duration-300 group rounded-xl transition duration-300 backdrop-blur-md flex flex-col",
                    selectedNodeId === drop.id ? "border-white/10 shadow-xl" : "border-white/5 hover:border-white/10"
                  )}
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 border border-white/10 bg-white/5 flex items-center justify-center text-zinc-200 group-hover:bg-zinc-200 text-black border-transparent hover:bg-zinc-300 group-hover:text-zinc-950 transition-colors rounded-xl transition duration-300 backdrop-blur-md">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold text-zinc-400  tracking-widest bg-white/5 border border-[#222] px-3 py-1">Raw Drop • {new Date(drop.metadata?.date_added || Date.now()).toLocaleDateString()}</span>
                  </div>
                  <h3 className="text-xl font-semibold tracking-widest text-white mb-4 ">{drop.label}</h3>
                  <p className="text-sm text-zinc-300 leading-relaxed mb-6 font-serif italic border-l-2 border-white/10 pl-4">{drop.summary}</p>
                  <div className="flex flex-wrap gap-2">
                    {drop.metadata?.tags?.map((tag: string, i: number) => (
                      <span key={i} className="px-3 py-1 bg-white/5 border border-white/5 text-[9px] font-bold text-[#aaa]  tracking-widest">
                        {tag}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Summaries Section */}
        {summaries.length > 0 && (
          <div className="mb-16">
            <h2 className="text-xl font-bold tracking-widest  text-zinc-300 mb-8 flex items-center gap-3"><div className="w-2 h-8 bg-zinc-800 text-white border-transparent hover:bg-zinc-700"></div> Synthesized Summaries</h2>
            <div className="space-y-8">
              {summaries.map((summary) => (
                <motion.div
                  key={summary.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => onNodeSelect(summary)}
                  className={cn(
                    "bg-[#0a0a0a] border p-8 cursor-pointer transition-colors duration-300 group rounded-xl transition duration-300 backdrop-blur-md",
                    selectedNodeId === summary.id ? "border-white/10 shadow-xl" : "border-white/10 hover:border-white/10"
                  )}
                >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 border border-white/10 bg-white/5 flex items-center justify-center text-zinc-300 group-hover:bg-zinc-800 text-white border-transparent hover:bg-zinc-700 group-hover:text-zinc-950 transition-colors rounded-xl transition duration-300 backdrop-blur-md">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-zinc-400  tracking-widest bg-white/5 border border-[#222] px-3 py-1.5">Summary • {summary.status}</span>
              <div className="ml-auto flex items-center gap-3 font-bold">
                <div className="h-2 w-24 bg-white/10 border border-white/5 overflow-hidden">
                  <div 
                    className="h-full bg-zinc-800 text-white border-transparent hover:bg-zinc-700" 
                    style={{ width: `${(summary.confidence || 0) * 100}%` }}
                  />
                </div>
                <span className="text-[10px] text-zinc-300 font-mono">{(summary.confidence || 0) * 100}% CONF</span>
              </div>
            </div>

            <h3 className="text-2xl font-semibold text-white mb-6  tracking-widest">{summary.label}</h3>
            <div className="prose prose-invert prose-p:text-sm max-w-none text-zinc-300 leading-relaxed mb-8 prose-p:leading-relaxed prose-a:text-zinc-300 font-serif">
              <Markdown>{blocksToString(summary.blocks)}</Markdown>
            </div>

            <div className="flex items-center justify-between pt-6 border-t-2 border-white/5">
              <div className="flex items-center gap-4 flex-wrap">
                {summary.evidence_quote_ids?.map((id, i) => (
                  <div key={i} className="flex items-center gap-2 text-[9px] text-zinc-500  tracking-widest font-bold bg-white/5 px-2 py-1">
                    <Quote className="w-3 h-3 text-zinc-200" />
                    SRC: {id}
                  </div>
                ))}
              </div>
              <button className="flex items-center gap-3 px-4 py-2 bg-white/5 border border-transparent group-hover/btn:border-white/10 text-[10px] text-zinc-400 hover:text-zinc-200  font-semibold tracking-widest transition-colors group/btn shrink-0 rounded-xl transition duration-300 backdrop-blur-md">
                Deconstruct
                <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        ))}
        </div>
        </div>
        )}

        {/* Questions Section */}
        <div className="mt-24 mb-16 border-t border-dashed border-white/5 pt-16">
          <h2 className="text-2xl font-semibold text-white tracking-widest  mb-2">Open Questions</h2>
          <p className="text-[10px] font-bold text-zinc-200  tracking-widest pl-3 border-l-2 border-white/10">Inquiries Emerging from Nothingness</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-12">
          {questions.map((q) => (
            <motion.div
              key={q.id}
              whileHover={{ scale: 1.02 }}
              onClick={() => onNodeSelect(q)}
              className={cn(
                "bg-zinc-900/40 p-8 cursor-pointer border transition-colors duration-300 group rounded-xl transition duration-300 backdrop-blur-md flex flex-col",
                selectedNodeId === q.id ? "border-[#FFD700] shadow-xl" : "border-white/10 hover:border-[#FFD700]"
              )}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 border border-[#FFD700] bg-white/5 flex items-center justify-center text-zinc-300 group-hover:bg-[#FFD700] group-hover:text-zinc-950 transition-colors rounded-xl transition duration-300 backdrop-blur-md">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-zinc-400  tracking-widest bg-white/5 border border-[#222] px-3 py-1">Question</span>
              </div>
              <h4 className="text-xl font-semibold tracking-widest text-white mb-4 group-hover:text-zinc-300 transition-colors ">{q.label}</h4>
              <div className="text-sm text-[#aaa] leading-relaxed prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-a:text-zinc-300 font-serif italic border-l-2 border-white/5 pl-4">
                <Markdown>{blocksToString(q.blocks)}</Markdown>
              </div>
              
              <div className="mt-8 pt-6 border-t-2 border-white/5 flex items-center gap-4">
                <div className="flex -space-x-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border border-[#000] bg-white/5 flex items-center justify-center text-[10px] font-semibold text-zinc-500 ">
                      P{i}
                    </div>
                  ))}
                </div>
                <span className="text-[9px] font-bold text-zinc-400  tracking-widest">3 Paths Found</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
