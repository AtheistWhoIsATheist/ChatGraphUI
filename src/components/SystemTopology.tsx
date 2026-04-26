import { motion } from 'motion/react';
import { Database, RefreshCw, Layers, Cpu, Network, Activity, Sparkles, ArrowRight, ArrowDown } from 'lucide-react';

export function SystemTopology() {
  return (
    <div className="w-full h-full bg-[#000] text-zinc-100 p-8 overflow-y-auto custom-scrollbar flex flex-col items-center relative font-mono">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxyZWN0IHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9IiMwMDAiIC8+PGNpcmNsZSBjeD0iNCIgY3k9IjQiIHI9IjEiIGZpbGw9IiMzMzMiIC8+PC9zdmc+')] opacity-20 pointer-events-none"></div>
      
      <div className="max-w-6xl w-full space-y-12 pb-20 relative z-10">
        {/* Header */}
        <div className="text-center space-y-6 mt-12 border-4 border-[#FF3A00] bg-[#000] p-12 relative shadow-[16px_16px_0px_rgba(255,58,0,0.3)]">
          
          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#00E5FF] -translate-x-4 -translate-y-4"></div>
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#00E5FF] translate-x-4 translate-y-4"></div>
          
          <div className="inline-flex items-center justify-center p-6 bg-[#111] border-2 border-[#FF3A00] mb-6">
            <Cpu className="w-16 h-16 text-[#FF3A00] animate-pulse-slow" />
          </div>
          <h1 className="text-5xl md:text-6xl font-serif font-black tracking-widest uppercase text-[#fff] animate-glitch">Analysis Engine Topology</h1>
          <p className="text-[#00E5FF] text-lg font-mono uppercase tracking-[0.2em] max-w-3xl mx-auto leading-relaxed border-t-2 border-[#333] pt-6">
            A Living Philosophical Intelligence Environment. Single, deployable artifact functioning as a recursive abstraction engine.
          </p>
        </div>

        {/* Top Row: Archive & RIP */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative mt-24">
          {/* Abyssal Archive */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="neo-flat p-8 relative overflow-hidden group hover:border-[#00E5FF]">
            <div className="absolute top-0 left-0 w-2 h-full bg-[#00E5FF] group-hover:scale-y-110 transition-transform" />
            <div className="flex items-center gap-4 mb-8 border-b border-[#333] pb-4">
              <Database className="w-8 h-8 text-[#00E5FF]" />
              <h2 className="text-2xl font-bold font-serif tracking-widest text-[#fff] uppercase">Journal314 Repository</h2>
              <span className="text-xs font-bold uppercase tracking-widest text-[#00E5FF] bg-[#111] px-3 py-1 ml-auto">K-Base</span>
            </div>
            <ul className="space-y-6 text-sm text-[#ccc] font-mono tracking-wider">
              <li className="flex items-center gap-4"><div className="w-2 h-2 bg-[#00E5FF] shadow-[0_0_10px_#00E5FF]"/> Axioms (MAC_α, AIF, S→100%)</li>
              <li className="flex items-center gap-4"><div className="w-2 h-2 bg-[#00E5FF] shadow-[0_0_10px_#00E5FF]"/> Operational Codex (A, K, O, RN)</li>
              <li className="flex items-center gap-4"><div className="w-2 h-2 bg-[#00E5FF] shadow-[0_0_10px_#00E5FF]"/> Praxis Directives</li>
              <li className="flex items-center gap-4"><div className="w-2 h-2 bg-[#00E5FF] shadow-[0_0_10px_#00E5FF]"/> Corpus Nodes</li>
            </ul>
          </motion.div>

          {/* Connection Arrow (Desktop) */}
          <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center justify-center z-10 mix-blend-screen">
            <motion.div 
              animate={{ x: [-5, 5, -5] }} 
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              className="bg-[#050505] p-4 border-2 border-[#FF3A00] shadow-[0_0_20px_#FF3A00]"
            >
              <ArrowRight className="w-8 h-8 text-[#FF3A00]" />
            </motion.div>
          </div>

          {/* Recursive Ingestion Protocol */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="neo-flat p-8 relative overflow-hidden group hover:border-[#FF3A00]">
            <div className="absolute top-0 right-0 w-2 h-full bg-[#FF3A00] group-hover:scale-y-110 transition-transform" />
            <div className="flex items-center gap-4 mb-8 border-b border-[#333] pb-4">
              <RefreshCw className="w-8 h-8 text-[#FF3A00]" />
              <h2 className="text-2xl font-bold font-serif tracking-widest text-[#fff] uppercase">Recursive Ingestion Protocol</h2>
            </div>
            <ul className="space-y-6 text-sm text-[#ccc] font-mono tracking-wider">
              <li className="flex items-center gap-4"><div className="w-2 h-2 bg-[#FF3A00] shadow-[0_0_10px_#FF3A00]"/> Web Worker Pipeline</li>
              <li className="flex items-center gap-4"><div className="w-2 h-2 bg-[#FF3A00] shadow-[0_0_10px_#FF3A00]"/> NT Lens Filter</li>
              <li className="flex items-center gap-4"><div className="w-2 h-2 bg-[#FF3A00] shadow-[0_0_10px_#FF3A00]"/> Weighted Jaccard Merge</li>
              <li className="flex items-center gap-4"><div className="w-2 h-2 bg-[#FF3A00] shadow-[0_0_10px_#FF3A00]"/> Recursive Re-evaluation</li>
            </ul>
          </motion.div>
        </div>

        {/* Down Arrow */}
        <div className="flex justify-center py-12">
          <motion.div 
            animate={{ y: [-5, 5, -5] }} 
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            className="p-4 border border-[#333]"
          >
            <ArrowDown className="w-8 h-8 text-[#555]" />
          </motion.div>
        </div>

        {/* Bottom Row: Intelligence Stack */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="border-4 border-[#333] bg-[#000] p-12 relative shadow-[16px_16px_0px_#111]">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#FF3A00] via-[#00E5FF] to-[#FF3A00]" />
          
          <div className="flex items-center justify-center gap-6 mb-16 border-b-2 border-[#111] pb-8">
            <Layers className="w-12 h-12 text-[#fff]" />
            <h2 className="text-4xl font-serif font-bold tracking-widest uppercase text-[#fff]">Four-Module Intelligence Stack</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* M1 */}
            <div className="bg-[#050505] border-2 border-[#222] p-8 hover:border-[#FF3A00] transition-colors group relative overflow-hidden">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#FF3A00] to-transparent opacity-0 group-hover:opacity-10 transition-opacity"></div>
              <div className="text-[#FF3A00] mb-8 scale-125 origin-left"><Database className="w-10 h-10" /></div>
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#00E5FF] mb-4 bg-[#111] inline-block px-3 py-1">[M1]</div>
              <h3 className="text-2xl font-black font-serif text-[#fff] tracking-wider uppercase mb-4">DataHub</h3>
              <p className="text-sm text-[#888] font-mono leading-relaxed">System architecture. Manages ingestion, embeddings, and the document database.</p>
            </div>
            
            {/* M2 */}
            <div className="bg-[#050505] border-2 border-[#222] p-8 hover:border-[#00E5FF] transition-colors group relative overflow-hidden">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#00E5FF] to-transparent opacity-0 group-hover:opacity-10 transition-opacity"></div>
              <div className="text-[#00E5FF] mb-8 scale-125 origin-left"><Network className="w-10 h-10" /></div>
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#FF3A00] mb-4 bg-[#111] inline-block px-3 py-1">[M2]</div>
              <h3 className="text-2xl font-black font-serif text-[#fff] tracking-wider uppercase mb-4">FocusMatrix</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">Dynamic Lens UI. Features Gravity Slider and Scented Search for topological exploration.</p>
            </div>

            {/* M3 */}
            <div className="bg-[#050505] border-2 border-[#222] p-8 hover:border-[#FF3A00] transition-colors group relative overflow-hidden">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#FF3A00] to-transparent opacity-0 group-hover:opacity-10 transition-opacity"></div>
              <div className="text-[#FF3A00] mb-8 scale-125 origin-left"><Activity className="w-10 h-10" /></div>
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#00E5FF] mb-4 bg-[#111] inline-block px-3 py-1">[M3]</div>
              <h3 className="text-2xl font-black font-serif text-[#fff] tracking-wider uppercase mb-4">GapSynth</h3>
              <p className="text-sm text-[#888] font-mono leading-relaxed">Bridge Builder. Network Science module identifying Latent Synapses and structural gaps.</p>
            </div>

            {/* M4 */}
            <div className="bg-[#050505] border-2 border-[#222] p-8 hover:border-[#00E5FF] transition-colors group relative overflow-hidden">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#00E5FF] to-transparent opacity-0 group-hover:opacity-10 transition-opacity"></div>
              <div className="text-[#00E5FF] mb-8 scale-125 origin-left"><Sparkles className="w-10 h-10" /></div>
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#FF3A00] mb-4 bg-[#111] inline-block px-3 py-1">[M4]</div>
              <h3 className="text-2xl font-black font-serif text-[#fff] tracking-wider uppercase mb-4">AutoNarrative</h3>
              <p className="text-sm text-[#888] font-mono leading-relaxed">Semantic Oracle. LLM-driven synthesis of Louvain communities into thematic narratives.</p>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
