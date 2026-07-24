import React, { useState } from 'react';
import { JournalEntry } from '../types';
import { OntologyNode } from '../data/ontology';
import { deconstructContemplation } from '../utils/apophaticEngine';
import { PenTool, History, Trash2, HelpCircle, CheckCircle, Flame, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ReflectionChamberProps {
  nodes: OntologyNode[];
  selectedNodeId: string | null;
  selectedQuestion: string | null;
  onSelectNode: (nodeId: string | null) => void;
  onSelectQuestion: (question: string | null) => void;
  journalEntries: JournalEntry[];
  onSaveEntry: (entry: JournalEntry) => void;
  onDeleteEntry: (id: string) => void;
}

export const ReflectionChamber: React.FC<ReflectionChamberProps> = ({
  nodes,
  selectedNodeId,
  selectedQuestion,
  onSelectNode,
  onSelectQuestion,
  journalEntries,
  onSaveEntry,
  onDeleteEntry
}) => {
  const [reflectionText, setReflectionText] = useState('');
  const [isDeconstructing, setIsDeconstructing] = useState(false);
  const [activeAnalysis, setActiveAnalysis] = useState<JournalEntry['analysis'] | null>(null);

  // Get active node
  const activeNode = nodes.find(n => n.id === selectedNodeId) || null;

  // Handle deconstruction action
  const handleDeconstruct = async () => {
    if (!activeNode || !selectedQuestion || !reflectionText.trim()) return;

    setIsDeconstructing(true);
    setActiveAnalysis(null);

    try {
      const response = await fetch('/api/deconstruct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          node: activeNode,
          question: selectedQuestion,
          userText: reflectionText
        })
      });

      if (!response.ok) {
        throw new Error('Apophasis failed to articulate in the server void.');
      }

      const analysisResult = await response.json();
      setActiveAnalysis(analysisResult);

      const newEntry: JournalEntry = {
        id: `journal_${Date.now()}`,
        nodeId: activeNode.id,
        nodeLabel: activeNode.label,
        question: selectedQuestion,
        userText: reflectionText,
        analysis: analysisResult,
        timestamp: new Date().toISOString()
      };

      onSaveEntry(newEntry);
    } catch (err) {
      console.error('Gemini deconstruction failed, falling back to local engine:', err);
      // Seamless offline/local fallback
      const fallbackResult = deconstructContemplation(activeNode, selectedQuestion, reflectionText);
      setActiveAnalysis(fallbackResult);

      const fallbackEntry: JournalEntry = {
        id: `journal_${Date.now()}`,
        nodeId: activeNode.id,
        nodeLabel: activeNode.label,
        question: selectedQuestion,
        userText: reflectionText,
        analysis: fallbackResult,
        timestamp: new Date().toISOString()
      };

      onSaveEntry(fallbackEntry);
    } finally {
      setIsDeconstructing(false);
    }
  };

  // Select a past entry to load
  const handleLoadEntry = (entry: JournalEntry) => {
    onSelectNode(entry.nodeId);
    onSelectQuestion(entry.question);
    setReflectionText(entry.userText);
    setActiveAnalysis(entry.analysis);
  };

  // Start fresh meditation
  const handleClear = () => {
    setReflectionText('');
    setActiveAnalysis(null);
  };

  return (
    <div id="reflection-chamber-section" className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full min-h-[500px]">
      {/* Journal Inputs (7 Columns) */}
      <div className="lg:col-span-7 flex flex-col gap-4 bg-neutral-950 border border-neutral-900 rounded-2xl p-6 abyssal-glow justify-between">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-neutral-900 pb-3">
            <PenTool className="w-4 h-4 text-neutral-400" />
            <h3 className="font-display text-sm font-semibold tracking-wider text-neutral-200 uppercase">
              Abyssal Reflection Chamber
            </h3>
          </div>

          {/* Node and Question Selection State */}
          {activeNode && selectedQuestion ? (
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center text-[10px] font-mono text-neutral-500">
                <span className="bg-neutral-900 px-2 py-0.5 rounded border border-neutral-850">
                  Topic: {activeNode.label}
                </span>
                <span>Active Inquiry</span>
              </div>
              <div className="bg-neutral-900/40 border border-neutral-900 px-4 py-3 rounded-xl text-xs text-neutral-300 leading-relaxed font-sans">
                {selectedQuestion}
              </div>

              {/* Text Input */}
              <div className="mt-2">
                <label className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest block mb-1.5">
                  Draft Contemplation
                </label>
                <textarea
                  value={reflectionText}
                  onChange={(e) => setReflectionText(e.target.value)}
                  placeholder="Express your realization, conviction, or doubt. State your absolute truth, and prepare to allow its deconstruction..."
                  className="w-full h-[140px] bg-black border border-neutral-900 focus:border-neutral-700 rounded-xl p-3.5 text-xs text-neutral-200 placeholder-neutral-700 outline-none resize-none leading-relaxed transition-all focus:ring-1 focus:ring-neutral-800 font-sans"
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
              <HelpCircle className="w-8 h-8 text-neutral-800" />
              <p className="text-xs text-neutral-500 font-mono">
                No active contemplation topic loaded.
              </p>
              <p className="text-[11px] text-neutral-600 max-w-sm">
                Select a concepts node in the <span className="text-neutral-400">Ontology Map</span> or click an <span className="text-neutral-400">apophatic inquiry question</span> in the inspector to begin.
              </p>
            </div>
          )}
        </div>

        {activeNode && selectedQuestion && (
          <div className="flex items-center gap-3 mt-4 pt-4 border-t border-neutral-900">
            <button
              onClick={handleClear}
              className="px-4 py-2 bg-neutral-900 hover:bg-neutral-850 border border-neutral-850 rounded-xl text-xs font-mono text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer"
            >
              Clear
            </button>
            <button
              disabled={!reflectionText.trim() || isDeconstructing}
              onClick={handleDeconstruct}
              className="flex-1 bg-white hover:bg-neutral-100 text-black disabled:bg-neutral-900 disabled:text-neutral-600 border border-transparent disabled:border-neutral-850 font-mono text-xs py-2 rounded-xl transition-all font-semibold flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(255,255,255,0.05)] cursor-pointer"
            >
              {isDeconstructing ? (
                <>
                  <span className="w-1.5 h-1.5 bg-neutral-500 rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-neutral-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 bg-neutral-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                  <span className="ml-1 text-neutral-500">Deconstructing Certainty...</span>
                </>
              ) : (
                'Deconstruct Certainty'
              )}
            </button>
          </div>
        )}
      </div>

      {/* Analysis Output & History (5 Columns) */}
      <div className="lg:col-span-5 flex flex-col gap-4 h-full">
        {/* Active Analysis Panel */}
        <div className="bg-neutral-950 border border-neutral-900 rounded-2xl p-5 abyssal-glow flex flex-col justify-between gap-4 flex-1">
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center border-b border-neutral-900 pb-2.5">
              <h4 className="font-display text-xs font-semibold tracking-wider text-neutral-400 uppercase">
                Apophatic Analysis
              </h4>
              {activeAnalysis && (
                <span className={`text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 rounded border flex items-center gap-1.5 ${
                  activeAnalysis.contemplationStatus === 'dissolved' 
                    ? 'text-neutral-100 border-neutral-800 bg-neutral-900' 
                    : activeAnalysis.contemplationStatus === 'integrated' 
                    ? 'text-neutral-400 border-neutral-900 bg-neutral-950' 
                    : 'text-neutral-600 border-neutral-950'
                }`}>
                  {activeAnalysis.contemplationStatus === 'dissolved' && <Flame className="w-3 h-3 text-red-400 animate-pulse" />}
                  {activeAnalysis.contemplationStatus === 'integrated' && <CheckCircle className="w-3 h-3 text-emerald-500" />}
                  {activeAnalysis.contemplationStatus === 'active' && <Layers className="w-3 h-3 text-sky-500" />}
                  {activeAnalysis.contemplationStatus}
                </span>
              )}
            </div>

            <AnimatePresence mode="wait">
              {activeAnalysis ? (
                <motion.div
                  key={activeAnalysis.apophaticReframing}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col gap-4"
                >
                  {/* Identified dogmas */}
                  <div>
                    <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest block mb-1.5">
                      Intellectual Anchors (Rigid Terms)
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {activeAnalysis.dogmasIdentified.map((dogma, i) => (
                        <span key={i} className="text-[10px] font-mono text-neutral-400 bg-neutral-900 border border-neutral-850 px-2 py-0.5 rounded">
                          {dogma}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Reframing text */}
                  <div>
                    <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest block mb-1.5">
                      Deconstructive Realization
                    </span>
                    <p className="text-xs text-neutral-300 leading-relaxed font-sans bg-neutral-900/20 border border-neutral-900 p-3.5 rounded-xl">
                      {activeAnalysis.apophaticReframing}
                    </p>
                  </div>
                </motion.div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center text-neutral-700 gap-1.5">
                  <Flame className="w-6 h-6 text-neutral-800" />
                  <p className="text-[11px] font-mono">No active critique deployed.</p>
                  <p className="text-[10px] text-neutral-600 max-w-xs">Write your realization in the chamber and click 'Deconstruct' to trigger apophatic dissolution.</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Void Journal History */}
        <div className="bg-neutral-950 border border-neutral-900 rounded-2xl p-5 abyssal-glow flex flex-col h-[200px] overflow-hidden">
          <div className="flex items-center gap-1.5 border-b border-neutral-900 pb-2 mb-2">
            <History className="w-3.5 h-3.5 text-neutral-500" />
            <span className="text-xs font-display font-semibold tracking-wider text-neutral-400 uppercase">
              The Void Journal ({journalEntries.length})
            </span>
          </div>

          <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2">
            {journalEntries.length > 0 ? (
              journalEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="bg-neutral-900/20 hover:bg-neutral-900/40 border border-neutral-900/80 hover:border-neutral-800/80 p-2.5 rounded-xl transition-all flex justify-between items-center gap-3 cursor-pointer group"
                  onClick={() => handleLoadEntry(entry)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-mono text-neutral-400 bg-neutral-900 px-1.5 py-0.5 rounded">
                        {entry.nodeLabel}
                      </span>
                      <span className="text-[8px] font-mono text-neutral-600">
                        {new Date(entry.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-[10px] text-neutral-400 truncate mt-1 italic">
                      "{entry.userText}"
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteEntry(entry.id);
                      if (activeAnalysis?.apophaticReframing === entry.analysis.apophaticReframing) {
                        setActiveAnalysis(null);
                      }
                    }}
                    className="text-neutral-600 hover:text-red-400 p-1.5 hover:bg-neutral-900 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    title="Dissolve from history"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-neutral-700 py-6">
                <p className="text-[10px] font-mono">No previous logs recorded in the Void.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
