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
    <div className="h-full bg-zinc-950 overflow-y-auto custom-scrollbar p-8 font-mono relative">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxyZWN0IHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9IiMwMDAiIC8+PGNpcmNsZSBjeD0iNCIgY3k9IjQiIHI9IjEiIGZpbGw9IiMzMzMiIC8+PC9zdmc+')] opacity-20 pointer-events-none z-0"></div>
      
      <div className="max-w-4xl mx-auto relative z-10">
        <header className="mb-16 border-b border-white/5 pb-8">
          <div className="flex items-center gap-5 mb-6">
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl transition duration-300 backdrop-blur-md">
              <Eye className="w-8 h-8 text-zinc-300 animate-pulse-slow" />
            </div>
            <div>
              <h1 className="text-4xl font-semibold tracking-widest text-white ">REN Synthesis Digest</h1>
              <p className="text-zinc-300 font-bold text-xs tracking-widest  mt-2">Automated Report</p>
            </div>
          </div>
          <p className="text-zinc-400 max-w-2xl leading-relaxed text-sm font-bold indent-8 border-l-2 border-white/10 pl-4 bg-white/5 p-4 text-justify rounded-xl transition duration-300 backdrop-blur-md">
            An autonomous synthesis of the Knowledgebase's evolution. This digest narrativizes the structural relationships between Journal314 entries and REN transcripts.
          </p>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-zinc-500 gap-4">
            <RefreshCw className="w-12 h-12 animate-spin text-zinc-300" />
            <p className="tracking-widest  font-semibold text-sm">Synthesizing Revelations...</p>
          </div>
        ) : (
          <div className="space-y-16">
            {digests.map((digest) => (
              <motion.article 
                key={digest._id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-zinc-900/40 border border-white/5 p-8 rounded-xl transition duration-300 backdrop-blur-md relative overflow-hidden group hover:border-white/10 transition-colors duration-500"
              >
                {/* Decorative background element */}
                <div className="absolute top-0 right-0 p-2 bg-white/5 border-l-2 border-b-2 border-white/5 text-[9px] text-zinc-200 font-semibold  tracking-widest group-hover:border-white/10 transition-colors">
                  SYS.DIGEST.GEN
                </div>
                
                <div className="flex items-center gap-4 text-xs font-bold text-zinc-400  tracking-widest mb-10 border-b-2 border-[#222] pb-6">
                  <Clock className="w-5 h-5 text-zinc-200" />
                  <span>{new Date(digest.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  <span className="px-3 py-1.5 bg-white/10 border border-white/10 text-zinc-200 ml-auto flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Autonomous Synthesis
                  </span>
                </div>

                <div className="prose prose-invert max-w-none 
                  prose-headings:font-semibold prose-headings: prose-headings:tracking-widest 
                  prose-h1:text-4xl prose-h1:text-white prose-h1:mb-8
                  prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:text-zinc-300 prose-h2:border-b-2 prose-h2:border-white/5 prose-h2:pb-2
                  prose-p:text-zinc-300 prose-p:leading-loose prose-p:font-serif
                  prose-li:text-zinc-300 prose-li:font-serif prose-li:my-2
                  prose-strong:bg-white/5 prose-strong:px-1 prose-strong:border prose-strong:border-white/5 prose-strong:text-white prose-strong:font-mono">
                  <Markdown>{digest.content}</Markdown>
                </div>

                <div className="mt-12 pt-8 border-t-2 border-white/5 flex flex-wrap gap-6">
                  <button className="px-8 py-4 bg-zinc-800 text-white border-transparent hover:bg-zinc-700 text-zinc-950 font-semibold text-sm tracking-widest  transition-colors border border-white/10 flex items-center gap-3 rounded-xl transition duration-300 backdrop-blur-md shadow-xl hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]">
                    <Eye className="w-5 h-5" />
                    Review Changes
                  </button>
                  <button className="px-8 py-4 bg-white/5 hover:bg-zinc-200 text-black border-transparent hover:bg-zinc-300 text-zinc-400 hover:text-zinc-950 font-semibold text-sm tracking-widest  transition-colors border border-white/5 hover:border-white/10 rounded-xl transition duration-300 backdrop-blur-md">
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
