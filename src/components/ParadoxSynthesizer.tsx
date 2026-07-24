import React, { useState } from 'react';
import { OntologyNode } from '../data/ontology';
import { ParadoxSynthesis } from '../types';
import { synthesizeParadox } from '../utils/apophaticEngine';
import { HelpCircle, ChevronRight, Activity, Flame, Clock, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ParadoxSynthesizerProps {
  nodes: OntologyNode[];
  synthesisHistory: ParadoxSynthesis[];
  onSaveSynthesis: (synthesis: ParadoxSynthesis) => void;
  onClearHistory: () => void;
}

export const ParadoxSynthesizer: React.FC<ParadoxSynthesizerProps> = ({
  nodes,
  synthesisHistory,
  onSaveSynthesis,
  onClearHistory
}) => {
  const [nodeAId, setNodeAId] = useState('');
  const [nodeBId, setNodeBId] = useState('');
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [currentSynthesis, setCurrentSynthesis] = useState<ParadoxSynthesis | null>(null);
  const [activeStep, setActiveStep] = useState<'none' | 'thesis' | 'antithesis' | 'synthesis'>('none');

  const filteredNodesForB = nodes.filter(n => n.id !== nodeAId);

  // Trigger paradox compilation
  const handleCompileParadox = async () => {
    const nodeA = nodes.find(n => n.id === nodeAId);
    const nodeB = nodes.find(n => n.id === nodeBId);

    if (!nodeA || !nodeB) return;

    setIsSynthesizing(true);
    setCurrentSynthesis(null);
    setActiveStep('none');

    try {
      const response = await fetch('/api/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodeA, nodeB })
      });

      if (!response.ok) {
        throw new Error('Paradox synthesis failed in the cloud void.');
      }

      const result = await response.json();
      const synthResult: ParadoxSynthesis = {
        id: `${nodeA.id}_${nodeB.id}_${Date.now()}`,
        nodeAId: nodeA.id,
        nodeBId: nodeB.id,
        nodeALabel: nodeA.label,
        nodeBLabel: nodeB.label,
        thesis: result.thesis,
        antithesis: result.antithesis,
        synthesis: result.synthesis,
        timestamp: new Date().toISOString()
      };

      setCurrentSynthesis(synthResult);
      onSaveSynthesis(synthResult);

      // Sequence steps for a beautiful, suspenseful reveal
      setActiveStep('thesis');
      setTimeout(() => setActiveStep('antithesis'), 1200);
      setTimeout(() => setActiveStep('synthesis'), 2400);
    } catch (err) {
      console.error('Gemini synthesis failed, falling back to local registry:', err);
      // Seamless offline/local fallback
      const fallbackResult = synthesizeParadox(nodeA, nodeB);
      setCurrentSynthesis(fallbackResult);
      onSaveSynthesis(fallbackResult);

      setActiveStep('thesis');
      setTimeout(() => setActiveStep('antithesis'), 1000);
      setTimeout(() => setActiveStep('synthesis'), 2000);
    } finally {
      setIsSynthesizing(false);
    }
  };

  const handleSelectPastSynthesis = (synth: ParadoxSynthesis) => {
    setCurrentSynthesis(synth);
    setNodeAId(synth.nodeAId);
    setNodeBId(synth.nodeBId);
    setActiveStep('synthesis');
  };

  return (
    <div id="paradox-synthesizer-section" className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
      {/* Synthesizer Panel (7 Columns) */}
      <div className="lg:col-span-7 bg-neutral-950 border border-neutral-900 rounded-2xl p-6 flex flex-col justify-between gap-6 abyssal-glow min-h-[480px]">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-neutral-900 pb-3">
            <Activity className="w-4 h-4 text-neutral-400" />
            <h3 className="font-display text-sm font-semibold tracking-wider text-neutral-200 uppercase">
              Paradox Synthesizer
            </h3>
          </div>

          <p className="text-xs text-neutral-400 leading-relaxed font-sans mb-2">
            Select two core ontological nodes. The synthesizer will compute the cognitive friction between their claims (Thesis and Antithesis) and reveal the apophatic ground where they dissolve into uncreated stillness.
          </p>

          {/* Form Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest block mb-1.5">
                First realization (Concept A)
              </label>
              <select
                value={nodeAId}
                onChange={(e) => {
                  setNodeAId(e.target.value);
                  if (e.target.value === nodeBId) setNodeBId('');
                }}
                className="w-full bg-black border border-neutral-900 focus:border-neutral-700 p-3 rounded-xl text-xs text-neutral-300 outline-none transition-colors"
              >
                <option value="">-- Load Concept --</option>
                {nodes.map(n => (
                  <option key={n.id} value={n.id}>{n.label} ({n.type})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest block mb-1.5">
                Contrasting path (Concept B)
              </label>
              <select
                value={nodeBId}
                onChange={(e) => setNodeBId(e.target.value)}
                disabled={!nodeAId}
                className="w-full bg-black border border-neutral-900 focus:border-neutral-700 p-3 rounded-xl text-xs text-neutral-300 outline-none transition-colors disabled:opacity-40"
              >
                <option value="">-- Select Contrast --</option>
                {filteredNodesForB.map(n => (
                  <option key={n.id} value={n.id}>{n.label} ({n.type})</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Synthesis Process View */}
        <div className="flex-1 min-h-[160px] flex items-center justify-center py-4">
          <AnimatePresence mode="wait">
            {isSynthesizing ? (
              <motion.div
                key="loading-anim"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-3 text-center"
              >
                <div className="relative w-12 h-12 flex items-center justify-center">
                  <span className="absolute inset-0 border-2 border-neutral-800 rounded-full" />
                  <span className="absolute inset-0 border-2 border-t-white rounded-full animate-spin" />
                  <Flame className="w-5 h-5 text-neutral-400 animate-pulse" />
                </div>
                <p className="text-xs font-mono text-neutral-500">
                  Aligning conceptual coordinates...
                </p>
              </motion.div>
            ) : currentSynthesis ? (
              <motion.div
                key="synthesis-steps"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full flex flex-col gap-4 font-sans text-xs text-neutral-300 leading-relaxed"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Step 1: Thesis */}
                  {(activeStep === 'thesis' || activeStep === 'antithesis' || activeStep === 'synthesis') && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-neutral-900/40 border border-neutral-900 p-4 rounded-xl"
                    >
                      <h5 className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                        <ChevronRight className="w-3 h-3 text-neutral-600" />
                        Thesis: {currentSynthesis.nodeALabel}
                      </h5>
                      <p className="leading-relaxed font-sans">{currentSynthesis.thesis}</p>
                    </motion.div>
                  )}

                  {/* Step 2: Antithesis */}
                  {(activeStep === 'antithesis' || activeStep === 'synthesis') && (
                    <motion.div
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-neutral-900/40 border border-neutral-900 p-4 rounded-xl"
                    >
                      <h5 className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                        <ChevronRight className="w-3 h-3 text-neutral-600" />
                        Antithesis: {currentSynthesis.nodeBLabel}
                      </h5>
                      <p className="leading-relaxed font-sans">{currentSynthesis.antithesis}</p>
                    </motion.div>
                  )}
                </div>

                {/* Step 3: Synthesis */}
                {activeStep === 'synthesis' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-neutral-900/20 border border-neutral-850 p-5 rounded-xl border-dashed"
                  >
                    <h5 className="text-[10px] font-mono text-neutral-100 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                      Apophatic Dissolution (Synthesis)
                    </h5>
                    <p className="text-neutral-200 leading-relaxed text-xs font-serif italic select-text">
                      {currentSynthesis.synthesis}
                    </p>
                  </motion.div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="empty-synthesizer"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center text-center gap-2.5 text-neutral-700 py-6"
              >
                <HelpCircle className="w-8 h-8 text-neutral-850" />
                <p className="text-xs font-mono">Conceptual reactor inactive.</p>
                <p className="text-[10px] text-neutral-600 max-w-sm">Select two different parameters above and hit compile to initiate apophatic analysis.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Action Button */}
        <div className="border-t border-neutral-900 pt-4 mt-2">
          <button
            disabled={!nodeAId || !nodeBId || isSynthesizing}
            onClick={handleCompileParadox}
            className="w-full bg-white hover:bg-neutral-100 text-black disabled:bg-neutral-900 disabled:text-neutral-600 border border-transparent disabled:border-neutral-850 font-mono text-xs py-2.5 rounded-xl font-semibold transition-all flex items-center justify-center gap-1.5 shadow-[0_4px_12px_rgba(255,255,255,0.05)] cursor-pointer"
          >
            Synthesize Paradox
          </button>
        </div>
      </div>

      {/* Synthesis History / Ledger (5 Columns) */}
      <div className="lg:col-span-5 bg-neutral-950 border border-neutral-900 rounded-2xl p-5 flex flex-col justify-between gap-4 abyssal-glow max-h-[580px]">
        <div className="flex flex-col gap-3 overflow-hidden h-full">
          <div className="flex justify-between items-center border-b border-neutral-900 pb-2.5">
            <h4 className="font-display text-xs font-semibold tracking-wider text-neutral-400 uppercase flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-neutral-500" />
              Paradox Codex
            </h4>
            {synthesisHistory.length > 0 && (
              <button
                onClick={onClearHistory}
                className="text-[9px] font-mono text-neutral-500 hover:text-red-400 transition-colors cursor-pointer"
              >
                Erase Codex
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2.5">
            {synthesisHistory.length > 0 ? (
              synthesisHistory.map((synth) => (
                <div
                  key={synth.id}
                  onClick={() => handleSelectPastSynthesis(synth)}
                  className="bg-neutral-900/20 hover:bg-neutral-900/50 border border-neutral-900/80 hover:border-neutral-800 p-3 rounded-xl cursor-pointer transition-all flex flex-col gap-1.5"
                >
                  <div className="flex items-center justify-between text-[9px] font-mono">
                    <div className="flex items-center gap-1 text-neutral-400">
                      <span>{synth.nodeALabel}</span>
                      <span className="text-neutral-600 font-sans">⊗</span>
                      <span>{synth.nodeBLabel}</span>
                    </div>
                    <span className="text-[8px] text-neutral-600">
                      {new Date(synth.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-[10px] text-neutral-400 line-clamp-2 italic leading-relaxed font-serif pl-1">
                    "{synth.synthesis}"
                  </p>
                </div>
              ))
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center py-20 text-center text-neutral-700 gap-1.5">
                <BookOpen className="w-6 h-6 text-neutral-850" />
                <p className="text-[10px] font-mono">Paradox Codex currently empty.</p>
                <p className="text-[9px] text-neutral-600 max-w-xs">Synthesized paradoxes are archived here for critical study.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
