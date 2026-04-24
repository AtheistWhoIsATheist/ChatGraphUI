import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Microscope, Loader2, AlertTriangle, ChevronDown, ChevronUp, Download } from 'lucide-react';
import { cn } from '../lib/utils';

export function OEDiscriminator() {
  const [text, setText] = useState('');
  const [thinker, setThinker] = useState('');
  const [sourceFile, setSourceFile] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!text) return;
    setIsProcessing(true);
    try {
      const res = await fetch('/api/oe-discriminate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, thinker, source_file: sourceFile })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.passages) setResults(data.passages);
      }
    } catch(err) {
      console.error(err);
    }
    setIsProcessing(false);
  };

  const downloadResults = () => {
    if (results.length === 0) return;
    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'occurrence_elevation_map.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getLevelColor = (level: number) => {
    if (level === 0) return "bg-zinc-800 text-zinc-300 border-zinc-700";
    if (level === 1) return "bg-blue-900/40 text-blue-300 border-blue-500/30";
    if (level === 2) return "bg-yellow-900/40 text-yellow-300 border-yellow-500/30";
    if (level === 3) return "bg-orange-900/40 text-orange-400 border-orange-500/30";
    if (level === 4) return "bg-red-900/40 text-red-400 border-red-500/30";
    return "bg-zinc-800 text-zinc-300 border-zinc-700";
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#0a0a0a] text-zinc-100 p-8 overflow-hidden font-sans">
      <div className="flex items-center justify-between mb-2 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Microscope className="w-6 h-6 text-fuchsia-500" />
          <h1 className="text-2xl font-light tracking-tight">Journal314 O-E Discriminator</h1>
        </div>
        {results.length > 0 && (
          <button onClick={downloadResults} className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">
            <Download className="w-4 h-4" /> Download JSON
          </button>
        )}
      </div>
      <p className="text-sm text-zinc-500 mb-8 max-w-3xl leading-relaxed flex-shrink-0">
        Detect and map where language shifts from descriptive occurrence into structural elevation.
        Core maxim: "Allow every experiential tone. Promote none without marking the promotion."
      </p>

      <div className="flex gap-8 overflow-hidden flex-1">
        {/* Input Panel */}
        <div className="w-1/3 flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-4 pb-12">
          <div>
             <label className="text-xs uppercase tracking-widest text-zinc-500 mb-2 block">Thinker (Optional)</label>
             <input value={thinker} onChange={e => setThinker(e.target.value)} className="w-full bg-black border border-white/10 rounded-lg p-3 text-sm focus:border-fuchsia-500/50 outline-none" placeholder="e.g. Emil Cioran" />
          </div>
          <div>
             <label className="text-xs uppercase tracking-widest text-zinc-500 mb-2 block">Source (Optional)</label>
             <input value={sourceFile} onChange={e => setSourceFile(e.target.value)} className="w-full bg-black border border-white/10 rounded-lg p-3 text-sm focus:border-fuchsia-500/50 outline-none" placeholder="e.g. The Trouble with Being Born" />
          </div>
          <div className="flex-1 flex flex-col">
             <label className="text-xs uppercase tracking-widest text-zinc-500 mb-2 block">Passage Text</label>
             <textarea 
               value={text} 
               onChange={e => setText(e.target.value)} 
               className="flex-1 min-h-[300px] w-full bg-black border border-white/10 rounded-lg p-4 text-sm focus:border-fuchsia-500/50 outline-none custom-scrollbar resize-none" 
               placeholder="Paste philosophical text to evaluate..."
             />
          </div>
          <button 
            onClick={handleAnalyze} 
            disabled={isProcessing || !text}
            className="mt-2 w-full py-3 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded-lg flex items-center justify-center gap-2 font-medium tracking-wide disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Microscope className="w-4 h-4" />}
            {isProcessing ? 'Analyzing Structural Axioms...' : 'Run Discriminator'}
          </button>
        </div>

        {/* Results Panel */}
        <div className="flex-1 border border-white/5 bg-zinc-900/20 rounded-2xl flex flex-col overflow-hidden">
           <div className="p-4 border-b border-white/5 bg-black/40 flex justify-between items-center">
             <h2 className="text-sm font-medium tracking-widest uppercase text-zinc-400">Analysis Results ({results.length})</h2>
           </div>
           
           <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
             {results.length === 0 && !isProcessing && (
               <div className="h-full flex items-center justify-center text-zinc-600 text-sm italic">
                  No passages evaluated yet. Run the discriminator.
               </div>
             )}

             {results.map((p, idx) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={idx}
                  className="bg-black/60 border border-white/10 rounded-xl overflow-hidden"
                >
                  <div 
                    className="p-4 cursor-pointer hover:bg-white/[0.02] flex items-start gap-4 transition-colors"
                    onClick={() => setExpandedId(expandedId === idx.toString() ? null : idx.toString())}
                  >
                    <div className={cn("px-2 py-1 rounded text-xs font-bold border flex-shrink-0", getLevelColor(p.elevation_level))}>
                       Lvl {p.elevation_level}
                    </div>
                    <div className="flex-1 min-w-0">
                       <p className="text-zinc-200 text-sm leading-relaxed mb-1 line-clamp-2 italic">"{p.quote}"</p>
                       <div className="flex gap-2 items-center flex-wrap">
                         <span className="text-xs text-zinc-500 uppercase tracking-wider">{p.classification}</span>
                         {p.collapse_violation && <span className="flex items-center gap-1 text-[10px] text-red-400 bg-red-400/10 px-1.5 py-0.5 rounded border border-red-500/20"><AlertTriangle className="w-3 h-3"/> Violation</span>}
                         {p.target_terms?.length > 0 && (
                            <span className="text-[10px] text-zinc-500">Terms: {p.target_terms.join(', ')}</span>
                         )}
                       </div>
                    </div>
                    <div className="text-zinc-600 flex-shrink-0 pt-1">
                      {expandedId === idx.toString() ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>

                  <AnimatePresence>
                    {expandedId === idx.toString() && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-white/5 bg-[#0f0f0f]"
                      >
                         <div className="p-4 space-y-4">
                           <div className="flex flex-col gap-1 text-sm">
                             <span className="text-zinc-500 text-xs uppercase tracking-widest">Full Quote</span>
                             <span className="text-zinc-200 italic border-l-2 border-white/10 pl-3 py-1">"{p.quote}"</span>
                           </div>
                           
                           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div className="bg-black/50 p-3 rounded-lg border border-white/5">
                                 <span className="text-[10px] uppercase text-zinc-500 block mb-1">Function</span>
                                 <span className="text-sm text-zinc-300">{p.axis_function || '-'}</span>
                              </div>
                              <div className="bg-black/50 p-3 rounded-lg border border-white/5">
                                 <span className="text-[10px] uppercase text-zinc-500 block mb-1">Position</span>
                                 <span className="text-sm text-zinc-300">{p.axis_position || '-'}</span>
                              </div>
                              <div className="bg-black/50 p-3 rounded-lg border border-white/5">
                                 <span className="text-[10px] uppercase text-zinc-500 block mb-1">Dependency</span>
                                 <span className="text-sm text-zinc-300">{p.axis_dependency || '-'}</span>
                              </div>
                              <div className="bg-black/50 p-3 rounded-lg border border-white/5">
                                 <span className="text-[10px] uppercase text-zinc-500 block mb-1">Triggers</span>
                                 <span className="text-sm text-zinc-300 font-mono text-xs text-orange-400">{p.trigger_phrases?.join(', ') || '-'}</span>
                              </div>
                           </div>

                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                             <div className="border border-zinc-800 p-3 rounded bg-zinc-900/30">
                                <span className="text-xs font-medium text-emerald-500 mb-1 block">Why Occurrence?</span>
                                <p className="text-sm text-zinc-400 leading-relaxed">{p.why_occurrence || 'N/A'}</p>
                             </div>
                             <div className="border border-zinc-800 p-3 rounded bg-zinc-900/30">
                                <span className="text-xs font-medium text-red-500 mb-1 block">Why Elevation?</span>
                                <p className="text-sm text-zinc-400 leading-relaxed">{p.why_elevation || 'N/A'}</p>
                             </div>
                           </div>
                         </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
}
