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
    <div className="flex flex-col h-full bg-[#000] p-8 font-mono overflow-y-auto custom-scrollbar relative">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none"></div>
      <div className="mb-12 relative z-10 border-b-2 border-[#333] pb-6">
        <h2 className="text-3xl font-black text-[#fff] tracking-widest uppercase">Stream Feed</h2>
        <p className="text-xs font-bold text-[#FF3A00] uppercase tracking-[0.2em] mt-2 border-l-2 border-[#FF3A00] pl-3">Distilled Essence & Raw Drops</p>
      </div>

      <div className="space-y-16 max-w-4xl mx-auto relative z-10">
        {/* Raw Drops Section */}
        {rawDrops.length > 0 && (
          <div className="mb-16">
            <h2 className="text-xl font-bold tracking-widest uppercase text-[#00E5FF] mb-8 flex items-center gap-3"><div className="w-2 h-8 bg-[#00E5FF]"></div> Recent Ingestions <span className="text-[#888]">[RAW]</span></h2>
            <div className="space-y-6">
              {rawDrops.map((drop) => (
                <motion.div
                  key={drop.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={() => onNodeSelect(drop)}
                  className={cn(
                    "bg-[#050505] p-6 cursor-pointer border-2 transition-colors duration-300 group neo-flat flex flex-col",
                    selectedNodeId === drop.id ? "border-[#FF3A00] shadow-[4px_4px_0_rgba(255,58,0,0.3)]" : "border-[#333] hover:border-[#FF3A00]"
                  )}
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 border-2 border-[#FF3A00] bg-[#111] flex items-center justify-center text-[#FF3A00] group-hover:bg-[#FF3A00] group-hover:text-[#000] transition-colors neo-flat">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold text-[#888] uppercase tracking-[0.2em] bg-[#111] border border-[#222] px-3 py-1">Raw Drop • {new Date(drop.metadata?.date_added || Date.now()).toLocaleDateString()}</span>
                  </div>
                  <h3 className="text-xl font-black tracking-widest text-[#fff] mb-4 uppercase">{drop.label}</h3>
                  <p className="text-sm text-[#ccc] leading-relaxed mb-6 font-serif italic border-l-2 border-[#444] pl-4">{drop.summary}</p>
                  <div className="flex flex-wrap gap-2">
                    {drop.metadata?.tags?.map((tag: string, i: number) => (
                      <span key={i} className="px-3 py-1 bg-[#111] border border-[#333] text-[9px] font-bold text-[#aaa] uppercase tracking-widest">
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
            <h2 className="text-xl font-bold tracking-widest uppercase text-[#00E5FF] mb-8 flex items-center gap-3"><div className="w-2 h-8 bg-[#00E5FF]"></div> Synthesized Summaries</h2>
            <div className="space-y-8">
              {summaries.map((summary) => (
                <motion.div
                  key={summary.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => onNodeSelect(summary)}
                  className={cn(
                    "bg-[#0a0a0a] border-2 p-8 cursor-pointer transition-colors duration-300 group neo-flat",
                    selectedNodeId === summary.id ? "border-[#00E5FF] shadow-[6px_6px_0_rgba(0,229,255,0.2)]" : "border-[#444] hover:border-[#00E5FF]"
                  )}
                >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 border-2 border-[#00E5FF] bg-[#111] flex items-center justify-center text-[#00E5FF] group-hover:bg-[#00E5FF] group-hover:text-[#000] transition-colors neo-flat">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-[#888] uppercase tracking-[0.2em] bg-[#111] border border-[#222] px-3 py-1.5">Summary • {summary.status}</span>
              <div className="ml-auto flex items-center gap-3 font-bold">
                <div className="h-2 w-24 bg-[#222] border border-[#333] overflow-hidden">
                  <div 
                    className="h-full bg-[#00E5FF]" 
                    style={{ width: `${(summary.confidence || 0) * 100}%` }}
                  />
                </div>
                <span className="text-[10px] text-[#00E5FF] font-mono">{(summary.confidence || 0) * 100}% CONF</span>
              </div>
            </div>

            <h3 className="text-2xl font-black text-[#fff] mb-6 uppercase tracking-widest">{summary.label}</h3>
            <div className="prose prose-invert prose-p:text-sm max-w-none text-[#ccc] leading-relaxed mb-8 prose-p:leading-relaxed prose-a:text-[#00E5FF] font-serif">
              <Markdown>{blocksToString(summary.blocks)}</Markdown>
            </div>

            <div className="flex items-center justify-between pt-6 border-t-2 border-[#333]">
              <div className="flex items-center gap-4 flex-wrap">
                {summary.evidence_quote_ids?.map((id, i) => (
                  <div key={i} className="flex items-center gap-2 text-[9px] text-[#555] uppercase tracking-widest font-bold bg-[#111] px-2 py-1">
                    <Quote className="w-3 h-3 text-[#FF3A00]" />
                    SRC: {id}
                  </div>
                ))}
              </div>
              <button className="flex items-center gap-3 px-4 py-2 bg-[#111] border-2 border-transparent group-hover/btn:border-[#FF3A00] text-[10px] text-[#888] hover:text-[#FF3A00] uppercase font-black tracking-[0.2em] transition-colors group/btn shrink-0 neo-flat">
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
        <div className="mt-24 mb-16 border-t-4 border-dashed border-[#333] pt-16">
          <h2 className="text-2xl font-black text-[#fff] tracking-widest uppercase mb-2">Open Questions</h2>
          <p className="text-[10px] font-bold text-[#FF3A00] uppercase tracking-[0.2em] pl-3 border-l-2 border-[#FF3A00]">Inquiries Emerging from Nothingness</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-12">
          {questions.map((q) => (
            <motion.div
              key={q.id}
              whileHover={{ scale: 1.02 }}
              onClick={() => onNodeSelect(q)}
              className={cn(
                "bg-[#050505] p-8 cursor-pointer border-2 transition-colors duration-300 group neo-flat flex flex-col",
                selectedNodeId === q.id ? "border-[#FFD700] shadow-[6px_6px_0_rgba(255,215,0,0.2)]" : "border-[#444] hover:border-[#FFD700]"
              )}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 border-2 border-[#FFD700] bg-[#111] flex items-center justify-center text-[#FFD700] group-hover:bg-[#FFD700] group-hover:text-[#000] transition-colors neo-flat">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-[#888] uppercase tracking-[0.2em] bg-[#111] border border-[#222] px-3 py-1">Question</span>
              </div>
              <h4 className="text-xl font-black tracking-widest text-[#fff] mb-4 group-hover:text-[#FFD700] transition-colors uppercase">{q.label}</h4>
              <div className="text-sm text-[#aaa] leading-relaxed prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-a:text-[#FFD700] font-serif italic border-l-2 border-[#333] pl-4">
                <Markdown>{blocksToString(q.blocks)}</Markdown>
              </div>
              
              <div className="mt-8 pt-6 border-t-2 border-[#333] flex items-center gap-4">
                <div className="flex -space-x-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-[#000] bg-[#111] flex items-center justify-center text-[10px] font-black text-[#555] uppercase">
                      P{i}
                    </div>
                  ))}
                </div>
                <span className="text-[9px] font-bold text-[#888] uppercase tracking-widest">3 Paths Found</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
