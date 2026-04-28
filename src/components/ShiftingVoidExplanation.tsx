import React from 'react';
import { motion } from 'motion/react';
import { BookOpen, Sparkles, Network, Database, Layers } from 'lucide-react';

export function ShiftingVoidExplanation() {
  return (
    <div className="w-full h-full overflow-y-auto bg-zinc-950 text-zinc-300 p-8 custom-scrollbar">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-12"
        >
          {/* Header */}
          <header className="border-b border-white/5 pb-8">
            <h1 className="text-4xl md:text-5xl font-semibold text-white mb-4 tracking-widest ">
              Theoretical Framework
            </h1>
            <p className="text-xl text-zinc-300 font-semibold  tracking-widest">
              Journal314 & REN Analysis
            </p>
          </header>

          {/* Introduction */}
          <section className="space-y-6">
            <h2 className="text-2xl font-semibold text-white flex items-center gap-3  tracking-widest">
              <Sparkles className="w-6 h-6 text-zinc-200" />
              Concept & Purpose
            </h2>
            <div className="prose prose-invert max-w-none text-zinc-400 leading-relaxed space-y-4 font-mono font-bold tracking-widest ">
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
            <h2 className="text-2xl font-semibold text-white flex items-center gap-3  tracking-widest">
              <Database className="w-6 h-6 text-zinc-300" />
              Core Mechanics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-zinc-900/40 border border-white/5 p-6 rounded-xl transition duration-300 backdrop-blur-md">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2  tracking-wide">
                  <Network className="w-5 h-5 text-zinc-300" />
                  Gap Synthesis Overlay
                </h3>
                <p className="text-sm font-mono text-zinc-300">
                  The system continuously scans for unmapped connections between disparate events or statements. These latent synapses represent potential insights waiting to be formalized through the Synthesis Module.
                </p>
              </div>
              <div className="bg-zinc-900/40 border border-white/5 p-6 rounded-xl transition duration-300 backdrop-blur-md">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2  tracking-wide">
                  <Layers className="w-5 h-5 text-zinc-200" />
                  Structural Gaps
                </h3>
                <p className="text-sm font-mono text-zinc-300">
                  By analyzing the topology of the graph, the Engine identifies unresolvable contradictions or missing conceptual bridges and highlights them for further inquiry.
                </p>
              </div>
            </div>
          </section>

          {/* The Role of the Assistant */}
          <section className="space-y-6 bg-zinc-950 border border-white/10 p-8 rounded-xl transition duration-300 backdrop-blur-md mt-8">
            <h2 className="text-2xl font-semibold text-white  tracking-widest">The Assistant's Role</h2>
            <p className="font-mono text-zinc-300 leading-relaxed  tracking-widest font-bold">
              The Synthesis Engine serves as the cognitive partner within this environment. It is not a generic assistant, but an ontology-aware system that guides the user through the texts. It challenges assumptions, generates counterpoints, and ensures that the inquiry remains conceptually rigorous and true to the source material.
            </p>
          </section>

        </motion.div>
      </div>
    </div>
  );
}
