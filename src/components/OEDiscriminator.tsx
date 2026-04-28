import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Microscope, Loader2, AlertTriangle, ChevronDown, ChevronUp, Download, BrainCircuit, Sparkles } from 'lucide-react';
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
    if (level === 0) return "bg-white/5 text-zinc-400 border-white/5";
    if (level === 1) return "bg-white/10 text-zinc-300 border-white/10";
    if (level === 2) return "bg-[#FFD700]/10 text-zinc-300 border-[#FFD700]/30";
    if (level === 3) return "bg-white/10 text-zinc-200 border-white/10";
    if (level === 4) return "bg-[#FF0055]/30 text-[#FF0055] border-[#FF0055]";
    return "bg-white/5 text-zinc-400 border-white/5";
  };

  return (
    <div className="w-full h-full flex flex-col bg-zinc-950 text-zinc-100 p-8 overflow-hidden font-mono relative">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxyZWN0IHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9IiMwMDAiIC8+PGNpcmNsZSBjeD0iNCIgY3k9IjQiIHI9IjEiIGZpbGw9IiMzMzMiIC8+PC9zdmc+')] opacity-20 pointer-events-none z-0"></div>

      <div className="flex-shrink-0 flex justify-between items-end mb-8 border-b-2 border-white/5 pb-6 relative z-10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/5 border border-white/10">
            <BrainCircuit className="w-8 h-8 text-zinc-300 animate-pulse-slow" />
          </div>
          <div>
            <h1 className="text-3xl font-serif font-semibold tracking-widest  text-zinc-300">O-E Discriminator</h1>
            <div className="text-xs font-bold  tracking-widest text-zinc-200 mt-2">Journal314 Ontology/Experience Pipeline</div>
          </div>
        </div>
        {results.length > 0 && (
          <button onClick={downloadResults} className="flex items-center gap-2 text-sm text-zinc-950 font-bold tracking-widest  bg-zinc-800 text-white border-transparent hover:bg-zinc-700 px-4 py-2 hover:bg-zinc-200 text-black border-transparent hover:bg-zinc-300 transition-colors rounded-xl transition duration-300 backdrop-blur-md shadow-xl hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]">
            <Download className="w-4 h-4" /> Download JSON
          </button>
        )}
      </div>
      <p className="text-sm font-mono text-zinc-400 mb-8 max-w-3xl leading-relaxed border-l-2 border-white/10 pl-4 relative z-10">
        Detect and map where language shifts from descriptive occurrence into structural elevation.
        Core maxim: "Allow every experiential tone. Promote none without marking the promotion."
      </p>

      <div className="flex gap-8 overflow-hidden flex-1 relative z-10">
        {/* Input Panel */}
        <div className="w-1/3 flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-4 pb-12">
          <div>
             <label className="text-xs font-bold  tracking-widest text-zinc-200 mb-3 block">Thinker (Optional)</label>
             <input value={thinker} onChange={e => setThinker(e.target.value)} className="w-full bg-zinc-900/40 border border-white/5 p-4 text-sm font-mono text-zinc-300 focus:border-white/10 outline-none rounded-xl transition duration-300 backdrop-blur-md" placeholder="e.g. Emil Cioran" />
          </div>
          <div>
             <label className="text-xs font-bold  tracking-widest text-zinc-200 mb-3 block">Source (Optional)</label>
             <input value={sourceFile} onChange={e => setSourceFile(e.target.value)} className="w-full bg-zinc-900/40 border border-white/5 p-4 text-sm font-mono text-zinc-300 focus:border-white/10 outline-none rounded-xl transition duration-300 backdrop-blur-md" placeholder="e.g. The Trouble with Being Born" />
          </div>
          <div className="flex-1 flex flex-col relative group">
             <label className="text-xs font-bold  tracking-widest text-zinc-200 mb-3 block">Passage Text</label>
             <div className="absolute -inset-1 bg-gradient-to-r from-[#00E5FF] to-transparent opacity-0 group-hover:opacity-10 transition-opacity"></div>
             <textarea 
               value={text} 
               onChange={e => setText(e.target.value)} 
               className="relative z-10 flex-1 min-h-[300px] w-full bg-zinc-900/40 border border-white/5 p-4 text-sm font-mono text-zinc-300 focus:border-white/10 outline-none custom-scrollbar resize-none" 
               placeholder="PASTE PHILOSOPHICAL TEXT TO EVALUATE..."
             />
          </div>
          <button 
            onClick={handleAnalyze} 
            disabled={isProcessing || !text}
            className="mt-4 w-full py-4 bg-zinc-200 text-black border-transparent hover:bg-zinc-300 hover:bg-[#fff] disabled:hover:bg-zinc-200 text-black border-transparent hover:bg-zinc-300 hover:text-zinc-950 text-zinc-950 flex items-center justify-center gap-3 font-mono font-bold tracking-widest  disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-xl hover:shadow-none hover:translate-y-[2px] hover:translate-x-[2px] border border-white/10 disabled:active:translate-y-0 disabled:active:translate-x-0"
          >
            {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Microscope className="w-5 h-5" />}
            {isProcessing ? 'Analyzing Structural Axioms...' : 'Run Discriminator'}
          </button>
        </div>

        {/* Results Panel */}
        <div className="flex-1 border border-white/5 bg-zinc-900/40 flex flex-col overflow-hidden relative">
           <div className="p-5 border-b-2 border-white/5 bg-zinc-950 flex justify-between items-center relative z-10">
             <h2 className="text-sm font-bold tracking-widest  text-zinc-300">Analysis Results <span className="bg-white/5 text-white px-2 py-0.5 ml-2 border border-white/5">[{results.length}]</span></h2>
           </div>
           
           <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-6 relative z-10">
             {results.length === 0 && !isProcessing && (
               <div className="h-full flex items-center justify-center text-zinc-500 font-mono tracking-widest ">
                  No passages evaluated. Awaiting input.
               </div>
             )}

             {results.map((p, idx) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={idx}
                  className="bg-zinc-950 border border-white/10 rounded-xl transition duration-300 backdrop-blur-md group hover:border-white/10 transition-colors"
                >
                  <div 
                    className="p-5 cursor-pointer flex items-start gap-5 transition-colors"
                    onClick={() => setExpandedId(expandedId === idx.toString() ? null : idx.toString())}
                  >
                    <div className={cn("px-3 py-1 font-mono font-bold text-xs  tracking-widest flex-shrink-0 mt-1 border", getLevelColor(p.elevation_level))}>
                       Lvl {p.elevation_level}
                    </div>
                    <div className="flex-1 min-w-0 font-mono">
                       <p className="text-zinc-100 text-sm leading-relaxed mb-3 line-clamp-2 italic">"{p.quote}"</p>
                       <div className="flex gap-3 items-center flex-wrap">
                         <span className="text-[10px] text-zinc-300  font-bold tracking-widest bg-white/10 px-2 py-1 border border-white/10">{p.classification}</span>
                         {p.collapse_violation && <span className="flex items-center gap-1.5 text-[10px] text-zinc-200 bg-white/10 px-2 py-1 font-bold border border-white/10"><AlertTriangle className="w-3 h-3"/> Violation</span>}
                         {p.target_terms?.length > 0 && (
                            <span className="text-[10px] text-zinc-400 font-bold tracking-widest">Terms: <span className="text-zinc-300">{p.target_terms.join(', ')}</span></span>
                         )}
                       </div>
                    </div>
                    <div className="text-zinc-400 flex-shrink-0 mt-1 group-hover:text-zinc-200 transition-colors">
                      {expandedId === idx.toString() ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>

                  <AnimatePresence>
                    {expandedId === idx.toString() && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t-2 border-white/5 bg-zinc-900/40"
                      >
                         <div className="p-6 space-y-6">
                           <div className="flex flex-col gap-2 text-sm font-mono">
                             <span className="text-zinc-300 font-bold text-xs  tracking-widest">Full Quote</span>
                             <span className="text-[#ddd] italic border-l-2 border-white/10 pl-4 py-2 bg-white/5">"{p.quote}"</span>
                           </div>
                           
                           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div className="bg-zinc-950 border border-white/5 p-4 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxyZWN0IHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9IiMwMDAiIC8+PGNpcmNsZSBjeD0iNCIgY3k9IjQiIHI9IjEiIGZpbGw9IiMzMzMiIC8+PC9zdmc+')]">
                                 <span className="text-[10px]  font-bold tracking-widest text-zinc-400 block mb-2">Function</span>
                                 <span className="text-sm font-mono text-zinc-100">{p.axis_function || '-'}</span>
                              </div>
                              <div className="bg-zinc-950 border border-white/5 p-4 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxyZWN0IHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9IiMwMDAiIC8+PGNpcmNsZSBjeD0iNCIgY3k9IjQiIHI9IjEiIGZpbGw9IiMzMzMiIC8+PC9zdmc+')]">
                                 <span className="text-[10px]  font-bold tracking-widest text-zinc-400 block mb-2">Position</span>
                                 <span className="text-sm font-mono text-zinc-100">{p.axis_position || '-'}</span>
                              </div>
                              <div className="bg-zinc-950 border border-white/5 p-4 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxyZWN0IHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9IiMwMDAiIC8+PGNpcmNsZSBjeD0iNCIgY3k9IjQiIHI9IjEiIGZpbGw9IiMzMzMiIC8+PC9zdmc+')]">
                                 <span className="text-[10px]  font-bold tracking-widest text-zinc-400 block mb-2">Dependency</span>
                                 <span className="text-sm font-mono text-zinc-100">{p.axis_dependency || '-'}</span>
                              </div>
                              <div className="bg-zinc-950 border border-white/5 p-4 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxyZWN0IHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9IiMwMDAiIC8+PGNpcmNsZSBjeD0iNCIgY3k9IjQiIHI9IjEiIGZpbGw9IiMzMzMiIC8+PC9zdmc+')]">
                                 <span className="text-[10px]  font-bold tracking-widest text-zinc-400 block mb-2">Triggers</span>
                                 <span className="text-sm font-mono font-bold tracking-widest text-zinc-200">{p.trigger_phrases?.join(', ') || '-'}</span>
                              </div>
                           </div>

                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[#222]">
                             <div className="border border-white/10 p-4 bg-white/10 rounded-xl transition duration-300 backdrop-blur-md hover:border-white/10 transition-colors">
                                <span className="text-xs font-bold  tracking-widest text-zinc-300 mb-2 block flex items-center gap-2"><Sparkles className="w-3 h-3"/> Why Occurrence?</span>
                                <p className="text-sm font-mono text-zinc-300 leading-relaxed">{p.why_occurrence || 'N/A'}</p>
                             </div>
                             <div className="border border-white/10 p-4 bg-white/10 rounded-xl transition duration-300 backdrop-blur-md hover:border-white/10 transition-colors">
                                <span className="text-xs font-bold  tracking-widest text-zinc-200 mb-2 block flex items-center gap-2"><AlertTriangle className="w-3 h-3"/> Why Elevation?</span>
                                <p className="text-sm font-mono text-zinc-300 leading-relaxed">{p.why_elevation || 'N/A'}</p>
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
