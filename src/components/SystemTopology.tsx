import { motion } from 'motion/react';
import { Database, RefreshCw, Layers, Cpu, Network, Activity, Sparkles, ArrowRight, ArrowDown } from 'lucide-react';

export function SystemTopology() {
  return (
    <div className="w-full h-full bg-zinc-950 text-zinc-100 p-8 overflow-y-auto custom-scrollbar flex flex-col items-center relative font-mono">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxyZWN0IHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9IiMwMDAiIC8+PGNpcmNsZSBjeD0iNCIgY3k9IjQiIHI9IjEiIGZpbGw9IiMzMzMiIC8+PC9zdmc+')] opacity-20 pointer-events-none"></div>
      
      <div className="max-w-6xl w-full space-y-12 pb-20 relative z-10">
        {/* Header */}
        <div className="text-center space-y-6 mt-12 border border-white/10 bg-zinc-950 p-12 relative shadow-xl">
          
          <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-white/10 -translate-x-4 -translate-y-4"></div>
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-white/10 translate-x-4 translate-y-4"></div>
          
          <div className="inline-flex items-center justify-center p-6 bg-white/5 border border-white/10 mb-6">
            <Cpu className="w-16 h-16 text-zinc-200 animate-pulse-slow" />
          </div>
          <h1 className="text-5xl md:text-6xl font-serif font-semibold tracking-widest  text-white animate-glitch">Analysis Engine Topology</h1>
          <p className="text-zinc-300 text-lg font-mono  tracking-widest max-w-3xl mx-auto leading-relaxed border-t-2 border-white/5 pt-6">
            A Living Philosophical Intelligence Environment. Single, deployable artifact functioning as a recursive abstraction engine.
          </p>
        </div>

        {/* Top Row: Archive & RIP */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative mt-24">
          {/* Document Repository */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="rounded-xl transition duration-300 backdrop-blur-md p-8 relative overflow-hidden group hover:border-white/10">
            <div className="absolute top-0 left-0 w-2 h-full bg-zinc-800 text-white border-transparent hover:bg-zinc-700 group-hover:scale-y-110 transition-transform" />
            <div className="flex items-center gap-4 mb-8 border-b border-white/5 pb-4">
              <Database className="w-8 h-8 text-zinc-300" />
              <h2 className="text-2xl font-bold font-serif tracking-widest text-white ">Journal314 Repository</h2>
              <span className="text-xs font-bold  tracking-widest text-zinc-300 bg-white/5 px-3 py-1 ml-auto">K-Base</span>
            </div>
            <ul className="space-y-6 text-sm text-zinc-300 font-mono tracking-wider">
              <li className="flex items-center gap-4"><div className="w-2 h-2 bg-zinc-800 text-white border-transparent hover:bg-zinc-700 shadow-xl"/> Axioms (MAC_α, AIF, S→100%)</li>
              <li className="flex items-center gap-4"><div className="w-2 h-2 bg-zinc-800 text-white border-transparent hover:bg-zinc-700 shadow-xl"/> Operational Codex (A, K, O, RN)</li>
              <li className="flex items-center gap-4"><div className="w-2 h-2 bg-zinc-800 text-white border-transparent hover:bg-zinc-700 shadow-xl"/> Praxis Directives</li>
              <li className="flex items-center gap-4"><div className="w-2 h-2 bg-zinc-800 text-white border-transparent hover:bg-zinc-700 shadow-xl"/> Corpus Nodes</li>
            </ul>
          </motion.div>

          {/* Connection Arrow (Desktop) */}
          <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center justify-center z-10 mix-blend-screen">
            <motion.div 
              animate={{ x: [-5, 5, -5] }} 
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              className="bg-zinc-900/40 p-4 border border-white/10 shadow-xl"
            >
              <ArrowRight className="w-8 h-8 text-zinc-200" />
            </motion.div>
          </div>

          {/* Recursive Ingestion Protocol */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="rounded-xl transition duration-300 backdrop-blur-md p-8 relative overflow-hidden group hover:border-white/10">
            <div className="absolute top-0 right-0 w-2 h-full bg-zinc-200 text-black border-transparent hover:bg-zinc-300 group-hover:scale-y-110 transition-transform" />
            <div className="flex items-center gap-4 mb-8 border-b border-white/5 pb-4">
              <RefreshCw className="w-8 h-8 text-zinc-200" />
              <h2 className="text-2xl font-bold font-serif tracking-widest text-white ">Recursive Ingestion Protocol</h2>
            </div>
            <ul className="space-y-6 text-sm text-zinc-300 font-mono tracking-wider">
              <li className="flex items-center gap-4"><div className="w-2 h-2 bg-zinc-200 text-black border-transparent hover:bg-zinc-300 shadow-xl"/> Web Worker Pipeline</li>
              <li className="flex items-center gap-4"><div className="w-2 h-2 bg-zinc-200 text-black border-transparent hover:bg-zinc-300 shadow-xl"/> NT Lens Filter</li>
              <li className="flex items-center gap-4"><div className="w-2 h-2 bg-zinc-200 text-black border-transparent hover:bg-zinc-300 shadow-xl"/> Weighted Jaccard Merge</li>
              <li className="flex items-center gap-4"><div className="w-2 h-2 bg-zinc-200 text-black border-transparent hover:bg-zinc-300 shadow-xl"/> Recursive Re-evaluation</li>
            </ul>
          </motion.div>
        </div>

        {/* Down Arrow */}
        <div className="flex justify-center py-12">
          <motion.div 
            animate={{ y: [-5, 5, -5] }} 
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            className="p-4 border border-white/5"
          >
            <ArrowDown className="w-8 h-8 text-zinc-500" />
          </motion.div>
        </div>

        {/* Bottom Row: Intelligence Stack */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="border border-white/5 bg-zinc-950 p-12 relative shadow-xl">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#FF3A00] via-[#00E5FF] to-[#FF3A00]" />
          
          <div className="flex items-center justify-center gap-6 mb-16 border-b-2 border-[#111] pb-8">
            <Layers className="w-12 h-12 text-white" />
            <h2 className="text-4xl font-serif font-bold tracking-widest  text-white">Four-Module Intelligence Stack</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* M1 */}
            <div className="bg-zinc-900/40 border border-[#222] p-8 hover:border-white/10 transition-colors group relative overflow-hidden">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#FF3A00] to-transparent opacity-0 group-hover:opacity-10 transition-opacity"></div>
              <div className="text-zinc-200 mb-8 scale-125 origin-left"><Database className="w-10 h-10" /></div>
              <div className="text-xs font-bold  tracking-widest text-zinc-300 mb-4 bg-white/5 inline-block px-3 py-1">[M1]</div>
              <h3 className="text-2xl font-semibold font-serif text-white tracking-wider  mb-4">DataHub</h3>
              <p className="text-sm text-zinc-400 font-mono leading-relaxed">System architecture. Manages ingestion, embeddings, and the document database.</p>
            </div>
            
            {/* M2 */}
            <div className="bg-zinc-900/40 border border-[#222] p-8 hover:border-white/10 transition-colors group relative overflow-hidden">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#00E5FF] to-transparent opacity-0 group-hover:opacity-10 transition-opacity"></div>
              <div className="text-zinc-300 mb-8 scale-125 origin-left"><Network className="w-10 h-10" /></div>
              <div className="text-xs font-bold  tracking-widest text-zinc-200 mb-4 bg-white/5 inline-block px-3 py-1">[M2]</div>
              <h3 className="text-2xl font-semibold font-serif text-white tracking-wider  mb-4">FocusMatrix</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">Dynamic Lens UI. Features Gravity Slider and Scented Search for topological exploration.</p>
            </div>

            {/* M3 */}
            <div className="bg-zinc-900/40 border border-[#222] p-8 hover:border-white/10 transition-colors group relative overflow-hidden">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#FF3A00] to-transparent opacity-0 group-hover:opacity-10 transition-opacity"></div>
              <div className="text-zinc-200 mb-8 scale-125 origin-left"><Activity className="w-10 h-10" /></div>
              <div className="text-xs font-bold  tracking-widest text-zinc-300 mb-4 bg-white/5 inline-block px-3 py-1">[M3]</div>
              <h3 className="text-2xl font-semibold font-serif text-white tracking-wider  mb-4">GapSynth</h3>
              <p className="text-sm text-zinc-400 font-mono leading-relaxed">Bridge Builder. Network Science module identifying Latent Synapses and structural gaps.</p>
            </div>

            {/* M4 */}
            <div className="bg-zinc-900/40 border border-[#222] p-8 hover:border-white/10 transition-colors group relative overflow-hidden">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#00E5FF] to-transparent opacity-0 group-hover:opacity-10 transition-opacity"></div>
              <div className="text-zinc-300 mb-8 scale-125 origin-left"><Sparkles className="w-10 h-10" /></div>
              <div className="text-xs font-bold  tracking-widest text-zinc-200 mb-4 bg-white/5 inline-block px-3 py-1">[M4]</div>
              <h3 className="text-2xl font-semibold font-serif text-white tracking-wider  mb-4">AutoNarrative</h3>
              <p className="text-sm text-zinc-400 font-mono leading-relaxed">Semantic Oracle. LLM-driven synthesis of Louvain communities into thematic narratives.</p>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
