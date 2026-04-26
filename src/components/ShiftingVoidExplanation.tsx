import React from 'react';
import { motion } from 'motion/react';
import { BookOpen, Sparkles, Network, Database, Layers } from 'lucide-react';

export function ShiftingVoidExplanation() {
  return (
    <div className="w-full h-full overflow-y-auto bg-[#000] text-zinc-300 p-8 custom-scrollbar">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-12"
        >
          {/* Header */}
          <header className="border-b-4 border-[#333] pb-8">
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-widest uppercase">
              Theoretical Framework
            </h1>
            <p className="text-xl text-[#00E5FF] font-black uppercase tracking-widest">
              Journal314 & REN Analysis
            </p>
          </header>

          {/* Introduction */}
          <section className="space-y-6">
            <h2 className="text-2xl font-black text-white flex items-center gap-3 uppercase tracking-widest">
              <Sparkles className="w-6 h-6 text-[#FF3A00]" />
              Concept & Purpose
            </h2>
            <div className="prose prose-invert max-w-none text-zinc-400 leading-relaxed space-y-4 font-mono font-bold tracking-widest uppercase">
              <p>
                The <strong>Analysis Engine</strong> is not merely a static repository of information, but a dynamic, self-organizing knowledge base designed to map the contours of <em>Journal314</em> and the <em>REN transcriptions</em>. It is an analytical engine that actively seeks out contradictions, structural gaps, and latent connections within the corpus.
              </p>
              <p>
                Traditional knowledge bases attempt to build a simple keyword logic. This engine maps the structural gaps and topologies of thought. It tracks the tension between Journal and REN events seamlessly across dimensions.
              </p>
            </div>
          </section>

          {/* Core Mechanics */}
          <section className="space-y-6">
            <h2 className="text-2xl font-black text-white flex items-center gap-3 uppercase tracking-widest">
              <Database className="w-6 h-6 text-[#00E5FF]" />
              Core Mechanics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#050505] border-2 border-[#333] p-6 neo-flat">
                <h3 className="text-lg font-black text-white mb-3 flex items-center gap-2 uppercase tracking-wide">
                  <Network className="w-5 h-5 text-[#00E5FF]" />
                  Gap Synthesis Overlay
                </h3>
                <p className="text-sm font-mono text-[#ccc]">
                  The system continuously scans for unmapped connections between disparate events or statements. These latent synapses represent potential insights waiting to be formalized through the Synthesis Module.
                </p>
              </div>
              <div className="bg-[#050505] border-2 border-[#333] p-6 neo-flat">
                <h3 className="text-lg font-black text-white mb-3 flex items-center gap-2 uppercase tracking-wide">
                  <Layers className="w-5 h-5 text-[#FF3A00]" />
                  Structural Gaps
                </h3>
                <p className="text-sm font-mono text-[#ccc]">
                  By analyzing the topology of the graph, the Engine identifies unresolvable contradictions or missing conceptual bridges and highlights them for further inquiry.
                </p>
              </div>
            </div>
          </section>

          {/* The Role of the Assistant */}
          <section className="space-y-6 bg-[#000] border-4 border-[#FF3A00] p-8 neo-flat mt-8">
            <h2 className="text-2xl font-black text-white uppercase tracking-widest">The Assistant's Role</h2>
            <p className="font-mono text-[#ccc] leading-relaxed uppercase tracking-widest font-bold">
              The Synthesis Engine serves as the cognitive partner within this environment. It is not a generic assistant, but an ontology-aware system that guides the user through the texts. It challenges assumptions, generates counterpoints, and ensures that the inquiry remains conceptually rigorous and true to the source material.
            </p>
          </section>

        </motion.div>
      </div>
    </div>
  );
}
