import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Eye, Clock, Sparkles, RefreshCw } from 'lucide-react';
import Markdown from 'react-markdown';

interface Digest {
  _id: string;
  date: string;
  content: string;
  type: string;
}

export function RevelationDigest() {
  const [digests, setDigests] = useState<Digest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDigests = async () => {
      setLoading(true);
      try {
        const mockDigests: Digest[] = [
          {
            _id: '1',
            date: new Date().toISOString(),
            type: 'weekly_revelation',
            content: `
# Synthesis Digest

*Date: ${new Date().toLocaleDateString()}*

## Structural Shift
Over the past 7 days, the Journal314 and REN entries have demonstrated significant cross-alignment. The boundaries between disparate transcriptions have blurred, revealing a shared structural grammar.

## Consolidated Entries
- **Node: "Entry 45"** - *Pruned*. This node was identified as redundant, failing to capture the structural weight of the event. It has been merged into **"REN Encounter 2"** and **"Structural Rupture"**.
- **Node: "The Event"** - *Densified*. The concept has been split into "Passive Observation" and "Active Reconstruction," providing a more rigorous framework for analysis.

## Transcendent Links Discovered
- A new edge has been forged between Journal314 and REN logs, indicating temporal overlap.
- The tension between independent observational accounts has been synthesized under a unified framework.

## Active Aporias
1. If the events overlap structurally, what are the discrepancies in the timeline?
2. How do subjective REN logs differ from Journal314 empirical accounts?
            `
          }
        ];
        
        setTimeout(() => {
          setDigests(mockDigests);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Failed to fetch digests:', error);
        setLoading(false);
      }
    };

    fetchDigests();
  }, []);

  return (
    <div className="h-full bg-[#000] overflow-y-auto custom-scrollbar p-8 font-mono relative">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxyZWN0IHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9IiMwMDAiIC8+PGNpcmNsZSBjeD0iNCIgY3k9IjQiIHI9IjEiIGZpbGw9IiMzMzMiIC8+PC9zdmc+')] opacity-20 pointer-events-none z-0"></div>
      
      <div className="max-w-4xl mx-auto relative z-10">
        <header className="mb-16 border-b-4 border-[#333] pb-8">
          <div className="flex items-center gap-5 mb-6">
            <div className="p-4 bg-[#111] border-2 border-[#00E5FF] neo-flat">
              <Eye className="w-8 h-8 text-[#00E5FF] animate-pulse-slow" />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-widest text-[#fff] uppercase">REN Synthesis Digest</h1>
              <p className="text-[#00E5FF] font-bold text-xs tracking-[0.2em] uppercase mt-2">Automated Report</p>
            </div>
          </div>
          <p className="text-[#888] max-w-2xl leading-relaxed text-sm font-bold indent-8 border-l-2 border-[#00E5FF] pl-4 bg-[#111] p-4 text-justify neo-flat">
            An autonomous synthesis of the Knowledgebase's evolution. This digest narrativizes the structural relationships between Journal314 entries and REN transcripts.
          </p>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-[#555] gap-4">
            <RefreshCw className="w-12 h-12 animate-spin text-[#00E5FF]" />
            <p className="tracking-[0.2em] uppercase font-black text-sm">Synthesizing Revelations...</p>
          </div>
        ) : (
          <div className="space-y-16">
            {digests.map((digest) => (
              <motion.article 
                key={digest._id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#050505] border-2 border-[#333] p-8 neo-flat relative overflow-hidden group hover:border-[#00E5FF] transition-colors duration-500"
              >
                {/* Decorative background element */}
                <div className="absolute top-0 right-0 p-2 bg-[#111] border-l-2 border-b-2 border-[#333] text-[9px] text-[#FF3A00] font-black uppercase tracking-widest group-hover:border-[#00E5FF] transition-colors">
                  SYS.DIGEST.GEN
                </div>
                
                <div className="flex items-center gap-4 text-xs font-bold text-[#888] uppercase tracking-[0.2em] mb-10 border-b-2 border-[#222] pb-6">
                  <Clock className="w-5 h-5 text-[#FF3A00]" />
                  <span>{new Date(digest.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  <span className="px-3 py-1.5 bg-[#FF3A00]/10 border border-[#FF3A00]/30 text-[#FF3A00] ml-auto flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Autonomous Synthesis
                  </span>
                </div>

                <div className="prose prose-invert max-w-none 
                  prose-headings:font-black prose-headings:uppercase prose-headings:tracking-widest 
                  prose-h1:text-4xl prose-h1:text-[#fff] prose-h1:mb-8
                  prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:text-[#00E5FF] prose-h2:border-b-2 prose-h2:border-[#333] prose-h2:pb-2
                  prose-p:text-[#ccc] prose-p:leading-loose prose-p:font-serif
                  prose-li:text-[#ccc] prose-li:font-serif prose-li:my-2
                  prose-strong:bg-[#111] prose-strong:px-1 prose-strong:border prose-strong:border-[#333] prose-strong:text-[#fff] prose-strong:font-mono">
                  <Markdown>{digest.content}</Markdown>
                </div>

                <div className="mt-12 pt-8 border-t-2 border-[#333] flex flex-wrap gap-6">
                  <button className="px-8 py-4 bg-[#00E5FF] text-[#000] font-black text-sm tracking-widest uppercase transition-colors border-2 border-[#00E5FF] flex items-center gap-3 neo-flat shadow-[4px_4px_0_rgba(0,229,255,0.4)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]">
                    <Eye className="w-5 h-5" />
                    Review Changes
                  </button>
                  <button className="px-8 py-4 bg-[#111] hover:bg-[#FF3A00] text-[#888] hover:text-[#000] font-black text-sm tracking-widest uppercase transition-colors border-2 border-[#333] hover:border-[#FF3A00] neo-flat">
                    Engage Logic
                  </button>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
