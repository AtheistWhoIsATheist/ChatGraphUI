import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { motion } from 'motion/react';
import { oeTermFrequencies, oeTriggerFrequencies, oeGraphSample } from '../data/oeStats';
import { Database, Network, TrendingUp, Hash, FastForward } from 'lucide-react';
import { cn } from '../lib/utils';

export function OEDashboard() {
  const [activeTab, setActiveTab] = useState<'terms' | 'triggers' | 'network' | 'pathways'>('terms');

  // Mock data for O-E pathways / thinkers
  const oePathways = [
    { thinker: "Meister Eckhart", o_count: 42, e_count: 38, transitions: 25 },
    { thinker: "Philipp Mainländer", o_count: 60, e_count: 15, transitions: 5 },
    { thinker: "Emil Cioran", o_count: 75, e_count: 8, transitions: 3 },
    { thinker: "Friedrich Nietzsche", o_count: 55, e_count: 22, transitions: 18 },
    { thinker: "Julian of Norwich", o_count: 20, e_count: 45, transitions: 12 },
    { thinker: "Arthur Schopenhauer", o_count: 65, e_count: 10, transitions: 4 },
    { thinker: "Simone Weil", o_count: 35, e_count: 40, transitions: 22 },
  ].sort((a, b) => b.transitions - a.transitions);

  return (
    <div className="w-full h-full flex flex-col bg-[#0a0a0a] text-zinc-100 p-8 overflow-hidden font-sans">
      <div className="flex items-center gap-3 mb-2 flex-shrink-0">
        <Database className="w-6 h-6 text-fuchsia-500" />
        <h1 className="text-2xl font-light tracking-tight">O-E System Analytics</h1>
      </div>
      <p className="text-sm text-zinc-500 mb-8 max-w-3xl leading-relaxed flex-shrink-0">
        Visualizing semantic drift: analyzing the frequency of terms and triggers involved in structural elevation mapping across the corpus.
      </p>

      <div className="flex gap-4 mb-6 border-b border-white/10 pb-4">
        <button
          onClick={() => setActiveTab('terms')}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
            activeTab === "terms"
              ? "bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/30"
              : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-zinc-200"
          )}
        >
          <Hash className="w-4 h-4" /> Term Frequency
        </button>
        <button
          onClick={() => setActiveTab('triggers')}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
            activeTab === "triggers"
              ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
              : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-zinc-200"
          )}
        >
          <TrendingUp className="w-4 h-4" /> Trigger Modality
        </button>
        <button
          onClick={() => setActiveTab('network')}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
            activeTab === "network"
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-zinc-200"
          )}
        >
          <Network className="w-4 h-4" /> Topological Signature
        </button>
        <button
          onClick={() => setActiveTab('pathways')}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 flex-shrink-0",
            activeTab === "pathways"
              ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
              : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-zinc-200"
          )}
        >
          <FastForward className="w-4 h-4" /> O-to-E Pathways
        </button>
      </div>

      <div className="flex-1 overflow-hidden relative">
        {activeTab === 'terms' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full h-full flex flex-col">
            <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-widest mb-6">Top Analytical Terms Ingested</h3>
            <div className="flex-1 min-h-0 relative">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={oeTermFrequencies.slice(0, 20)} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="term" type="category" axisLine={false} tickLine={false} tick={{ fill: '#a1a1aa', fontSize: 12 }} />
                  <Tooltip cursor={{ fill: '#ffffff0a' }} contentStyle={{ backgroundColor: '#000', border: '1px solid #3f3f46', borderRadius: '8px' }} />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {oeTermFrequencies.slice(0, 20).map((entry, index) => (
                      <Cell key={`cell-\${index}`} fill={index < 3 ? '#d946ef' : '#a21caf'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}

        {activeTab === 'triggers' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full h-full flex flex-col">
            <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-widest mb-6">Frequent Elevation Triggers</h3>
            <div className="flex-1 min-h-0 relative">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={oeTriggerFrequencies.slice(0, 20)} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="trigger" type="category" axisLine={false} tickLine={false} tick={{ fill: '#a1a1aa', fontSize: 12 }} />
                  <Tooltip cursor={{ fill: '#ffffff0a' }} contentStyle={{ backgroundColor: '#000', border: '1px solid #3f3f46', borderRadius: '8px' }} />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {oeTriggerFrequencies.slice(0, 20).map((entry, index) => (
                      <Cell key={`cell-\${index}`} fill={index < 3 ? '#6366f1' : '#4338ca'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}

        {activeTab === 'network' && (
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full h-full overflow-y-auto custom-scrollbar pr-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {oeGraphSample.map((edge, idx) => (
                  <div key={idx} className="bg-zinc-900/40 border border-white/5 p-4 rounded-xl flex flex-col gap-2 relative group hover:bg-white/5 transition-colors">
                    <div className="text-[10px] text-zinc-600 uppercase tracking-widest">Connection Type</div>
                    <div className="text-sm font-bold text-emerald-400 break-all">{edge.type}</div>
                    
                    <div className="flex items-start justify-between mt-2 pt-2 border-t border-white/5">
                      <div className="flex flex-col w-[45%]">
                        <span className="text-[9px] text-zinc-500 uppercase tracking-wider">Source</span>
                        <span className="text-xs text-zinc-300 break-words mt-1">{edge.source.split(':').pop() || edge.source}</span>
                      </div>
                      
                      <div className="text-zinc-600">→</div>
                      
                      <div className="flex flex-col w-[45%] text-right">
                        <span className="text-[9px] text-zinc-500 uppercase tracking-wider">Target</span>
                        <span className="text-xs text-fuchsia-300 break-words mt-1">{edge.target.split(':').pop() || edge.target}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
           </motion.div>
        )}

        {activeTab === 'pathways' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full h-full flex flex-col">
            <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-widest mb-2">Thinkers with highest O-to-E transition volumes</h3>
            <p className="text-xs text-zinc-500 mb-6">Transition indicates the presence of a void-phenomenological feature acting as an operator to an Elevation claim.</p>
            <div className="flex-1 min-h-0 relative">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={oePathways} layout="vertical" margin={{ top: 0, right: 30, left: 100, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="thinker" type="category" axisLine={false} tickLine={false} tick={{ fill: '#a1a1aa', fontSize: 12 }} />
                  <Tooltip cursor={{ fill: '#ffffff0a' }} contentStyle={{ backgroundColor: '#000', border: '1px solid #3f3f46', borderRadius: '8px' }} />
                  <Bar dataKey="transitions" radius={[0, 4, 4, 0]}>
                    {oePathways.map((entry, index) => (
                      <Cell key={`cell-\${index}`} fill={index < 3 ? '#f97316' : '#ea580c'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
