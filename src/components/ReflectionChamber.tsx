import React, { useState, useEffect, useMemo } from 'react';
import { JournalEntry } from '../types';
import { OntologyNode } from '../data/ontology';
import { deconstructContemplation } from '../utils/apophaticEngine';
import { PenTool, History, Trash2, HelpCircle, CheckCircle, Flame, Layers, Tag, Plus, X, Sparkles } from 'lucide-react';
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
  lastSavedAt?: number;
}

// Preset themes for 1-click tagging
const PRESET_PHILOSOPHICAL_THEMES = [
  'Apophaticism',
  'Phenomenology',
  'Aporia',
  'Nihilism',
  'Absurdism',
  'Epistemology',
  'Gelassenheit',
  'Emptiness',
  'Ontology',
  'Cosmic Decay',
  'Void'
];

export const ReflectionChamber: React.FC<ReflectionChamberProps> = ({
  nodes,
  selectedNodeId,
  selectedQuestion,
  onSelectNode,
  onSelectQuestion,
  journalEntries,
  onSaveEntry,
  onDeleteEntry,
  lastSavedAt
}) => {
  const [reflectionText, setReflectionText] = useState('');
  const [isDeconstructing, setIsDeconstructing] = useState(false);
  const [activeAnalysis, setActiveAnalysis] = useState<JournalEntry['analysis'] | null>(null);

  // Tag Management State
  const [draftTags, setDraftTags] = useState<string[]>(['Apophaticism']);
  const [customTagInput, setCustomTagInput] = useState('');
  const [selectedTagFilter, setSelectedTagFilter] = useState<string | null>(null);

  // 'Changes Saved' pulse & toast notification state
  const [showSavedPulse, setShowSavedPulse] = useState(false);
  const [autoSaveToast, setAutoSaveToast] = useState<{ show: boolean; msg: string; time: string } | null>(null);

  // Get active node
  const activeNode = nodes.find(n => n.id === selectedNodeId) || null;

  // React to localStorage write events to show 'Changes Saved' pulse
  useEffect(() => {
    if (lastSavedAt && lastSavedAt > 0) {
      setShowSavedPulse(true);
      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setAutoSaveToast({
        show: true,
        msg: 'Journal Entry Auto-Saved & Persisted',
        time: nowStr
      });
      const timer = setTimeout(() => {
        setShowSavedPulse(false);
        setAutoSaveToast(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [lastSavedAt]);

  // Load saved draft on initial mount
  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem('nes2_reflection_draft');
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        if (parsed.text && typeof parsed.text === 'string' && !reflectionText) {
          setReflectionText(parsed.text);
          if (parsed.tags && Array.isArray(parsed.tags)) setDraftTags(parsed.tags);
        }
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  // Debounced auto-save draft reflection text to localStorage
  useEffect(() => {
    if (!reflectionText.trim()) return;

    const timer = setTimeout(() => {
      try {
        localStorage.setItem('nes2_reflection_draft', JSON.stringify({
          text: reflectionText,
          nodeId: selectedNodeId,
          tags: draftTags,
          timestamp: new Date().toISOString()
        }));
        const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setAutoSaveToast({
          show: true,
          msg: 'Draft Reflection Auto-Saved',
          time: nowStr
        });
        setShowSavedPulse(true);

        const toastClearTimer = setTimeout(() => {
          setAutoSaveToast(null);
          setShowSavedPulse(false);
        }, 3000);
        return () => clearTimeout(toastClearTimer);
      } catch (err) {
        console.warn('Draft auto-save failed:', err);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [reflectionText, draftTags, selectedNodeId]);

  // Handle adding custom tag
  const handleAddCustomTag = () => {
    const trimmed = customTagInput.trim().replace(/^#/, '');
    if (trimmed && !draftTags.includes(trimmed)) {
      setDraftTags([...draftTags, trimmed]);
      setCustomTagInput('');
    }
  };

  // Toggle draft tag
  const handleToggleTag = (tag: string) => {
    if (draftTags.includes(tag)) {
      setDraftTags(draftTags.filter(t => t !== tag));
    } else {
      setDraftTags([...draftTags, tag]);
    }
  };

  // Handle deconstruction action
  const handleDeconstruct = async () => {
    if (!activeNode || !selectedQuestion || !reflectionText.trim()) return;

    setIsDeconstructing(true);
    setActiveAnalysis(null);

    const finalTags = draftTags.length > 0 ? draftTags : [activeNode.type, 'Apophaticism'];

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
        let errMessage = `Deconstruction API error ${response.status}`;
        try {
          const errData = await response.json();
          if (errData?.error) errMessage = errData.error;
        } catch {
          const rawText = await response.text();
          if (rawText) errMessage = rawText.slice(0, 150);
        }
        throw new Error(errMessage);
      }

      const analysisResult = await response.json();
      setActiveAnalysis(analysisResult);

      const newEntry: JournalEntry = {
        id: `journal_${Date.now()}`,
        nodeId: activeNode.id,
        nodeLabel: activeNode.label,
        question: selectedQuestion,
        userText: reflectionText,
        tags: finalTags,
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
        tags: finalTags,
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
    if (entry.tags && entry.tags.length > 0) {
      setDraftTags(entry.tags);
    } else {
      setDraftTags([entry.nodeLabel, 'Apophaticism']);
    }
  };

  // Start fresh meditation
  const handleClear = () => {
    setReflectionText('');
    setActiveAnalysis(null);
  };

  // Calculate Frequency Cloud for Tags
  const tagFrequencyData = useMemo(() => {
    const counts: Record<string, number> = {};

    journalEntries.forEach(entry => {
      const entryTags = entry.tags && entry.tags.length > 0 ? entry.tags : [entry.nodeLabel, 'Apophaticism'];
      entryTags.forEach(t => {
        const clean = t.trim();
        if (clean) counts[clean] = (counts[clean] || 0) + 1;
      });
    });

    // Fallback preset cloud if no user journal entries exist yet
    if (Object.keys(counts).length === 0) {
      counts['Apophaticism'] = 4;
      counts['Aporia'] = 3;
      counts['Gelassenheit'] = 2;
      counts['Emptiness'] = 2;
      counts['Nihilism'] = 1;
      counts['Phenomenology'] = 1;
    }

    const maxCount = Math.max(...Object.values(counts), 1);
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);

    return { counts, maxCount, sorted };
  }, [journalEntries]);

  // Filter journal entries by tag
  const filteredJournalEntries = useMemo(() => {
    if (!selectedTagFilter) return journalEntries;
    return journalEntries.filter(entry => {
      const entryTags = entry.tags && entry.tags.length > 0 ? entry.tags : [entry.nodeLabel, 'Apophaticism'];
      return entryTags.includes(selectedTagFilter);
    });
  }, [journalEntries, selectedTagFilter]);

  return (
    <div id="reflection-chamber-section" className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full min-h-[500px]">
      {/* Journal Inputs (7 Columns) */}
      <div className="lg:col-span-7 flex flex-col gap-4 bg-neutral-950 border border-neutral-900 rounded-2xl p-6 abyssal-glow justify-between">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-neutral-900 pb-3">
            <div className="flex items-center gap-2">
              <PenTool className="w-4 h-4 text-neutral-400" />
              <h3 className="font-display text-sm font-semibold tracking-wider text-neutral-200 uppercase">
                Abyssal Reflection Chamber
              </h3>
            </div>

            {/* Subtle 'Changes Saved' Pulse Indicator */}
            <AnimatePresence>
              {showSavedPulse && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, x: 10 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9, x: 10 }}
                  className="flex items-center gap-2 bg-emerald-950/80 border border-emerald-600/80 px-3 py-1 rounded-full text-[10px] font-mono text-emerald-300 shadow-lg shadow-emerald-950/50"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-semibold">Changes Saved to LocalStorage</span>
                </motion.div>
              )}
            </AnimatePresence>
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
              <div className="mt-1">
                <label className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest block mb-1.5">
                  Draft Contemplation
                </label>
                <textarea
                  value={reflectionText}
                  onChange={(e) => setReflectionText(e.target.value)}
                  placeholder="Express your realization, conviction, or doubt. State your absolute truth, and prepare to allow its deconstruction..."
                  className="w-full h-[120px] bg-black border border-neutral-900 focus:border-neutral-700 rounded-xl p-3.5 text-xs text-neutral-200 placeholder-neutral-700 outline-none resize-none leading-relaxed transition-all focus:ring-1 focus:ring-neutral-800 font-sans"
                />
              </div>

              {/* Philosophical Theme Tag Management System */}
              <div className="bg-neutral-900/30 border border-neutral-900/80 p-3.5 rounded-xl flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest flex items-center gap-1.5 font-semibold">
                    <Tag className="w-3 h-3 text-amber-400" />
                    Philosophical Themes & Tag Manager
                  </span>
                  <span className="text-[9px] font-mono text-neutral-500">
                    {draftTags.length} tags attached
                  </span>
                </div>

                {/* Selected Tag Chips */}
                <div className="flex flex-wrap gap-1.5">
                  {draftTags.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-mono bg-amber-950/40 border border-amber-800/60 text-amber-300"
                    >
                      #{tag}
                      <button
                        onClick={() => handleToggleTag(tag)}
                        className="hover:text-red-400 transition-colors ml-0.5 cursor-pointer"
                        title="Remove tag"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>

                {/* Quick Add Preset Themes */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[9px] font-mono text-neutral-500 mr-1">Quick Themes:</span>
                  {PRESET_PHILOSOPHICAL_THEMES.map(theme => {
                    const isSelected = draftTags.includes(theme);
                    return (
                      <button
                        key={theme}
                        onClick={() => handleToggleTag(theme)}
                        className={`text-[9px] font-mono px-2 py-0.5 rounded transition-all cursor-pointer border ${
                          isSelected
                            ? 'bg-neutral-800 text-amber-300 border-amber-600/50'
                            : 'bg-black text-neutral-500 hover:text-neutral-300 border-neutral-850 hover:border-neutral-700'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}#{theme}
                      </button>
                    );
                  })}
                </div>

                {/* Custom Tag Input */}
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="text"
                    value={customTagInput}
                    onChange={(e) => setCustomTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddCustomTag()}
                    placeholder="Type custom philosophical theme & press Enter..."
                    className="flex-1 bg-black border border-neutral-850 focus:border-amber-500/50 rounded-lg px-3 py-1.5 text-[11px] text-neutral-200 outline-none placeholder-neutral-600 font-mono"
                  />
                  <button
                    onClick={handleAddCustomTag}
                    disabled={!customTagInput.trim()}
                    className="px-3 py-1.5 bg-neutral-850 hover:bg-neutral-800 text-neutral-200 disabled:opacity-40 rounded-lg text-xs font-mono flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Plus className="w-3 h-3 text-amber-400" />
                    <span>Tag</span>
                  </button>
                </div>
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

      {/* Analysis Output & History Sidebar (5 Columns) */}
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
                <div className="flex flex-col items-center justify-center py-8 text-center text-neutral-700 gap-1.5">
                  <Flame className="w-6 h-6 text-neutral-800" />
                  <p className="text-[11px] font-mono">No active critique deployed.</p>
                  <p className="text-[10px] text-neutral-600 max-w-xs">Write your realization in the chamber and click 'Deconstruct' to trigger apophatic dissolution.</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Sidebar Panel: Tag Frequency Cloud */}
        <div className="bg-neutral-950 border border-neutral-900 rounded-2xl p-4 abyssal-glow flex flex-col gap-2.5">
          <div className="flex items-center justify-between border-b border-neutral-900 pb-2">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs font-display font-semibold tracking-wider text-neutral-300 uppercase">
                Tag Frequency Cloud
              </span>
            </div>
            {selectedTagFilter && (
              <button
                onClick={() => setSelectedTagFilter(null)}
                className="text-[10px] font-mono text-amber-400 hover:text-amber-200 flex items-center gap-1 cursor-pointer"
              >
                <span>Reset Filter</span>
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5 items-center max-h-[110px] overflow-y-auto pr-1">
            {tagFrequencyData.sorted.map(([tag, count]) => {
              const isSelected = selectedTagFilter === tag;
              const ratio = count / tagFrequencyData.maxCount;
              // Scale font size dynamically based on frequency
              const fontSizeClass = ratio > 0.7 ? 'text-xs font-bold' : ratio > 0.3 ? 'text-[11px] font-semibold' : 'text-[10px] font-normal';

              return (
                <button
                  key={tag}
                  onClick={() => setSelectedTagFilter(isSelected ? null : tag)}
                  className={`px-2.5 py-1 rounded-lg font-mono transition-all flex items-center gap-1 cursor-pointer border ${
                    isSelected
                      ? 'bg-amber-400 text-black font-bold border-amber-300 shadow-md'
                      : 'bg-neutral-900/80 hover:bg-neutral-850 border border-neutral-850 text-neutral-300 hover:text-amber-200'
                  }`}
                >
                  <span className={fontSizeClass}>#{tag}</span>
                  <span className={`text-[9px] px-1 py-0.2 rounded ${isSelected ? 'bg-black/20 text-black' : 'bg-black text-neutral-500'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Void Journal History */}
        <div className="bg-neutral-950 border border-neutral-900 rounded-2xl p-5 abyssal-glow flex flex-col h-[210px] overflow-hidden">
          <div className="flex items-center justify-between border-b border-neutral-900 pb-2 mb-2">
            <div className="flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-neutral-500" />
              <span className="text-xs font-display font-semibold tracking-wider text-neutral-400 uppercase">
                The Void Journal ({filteredJournalEntries.length})
              </span>
            </div>
            {selectedTagFilter && (
              <span className="text-[9px] font-mono text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/60">
                Filter: #{selectedTagFilter}
              </span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2">
            {filteredJournalEntries.length > 0 ? (
              filteredJournalEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="bg-neutral-900/20 hover:bg-neutral-900/40 border border-neutral-900/80 hover:border-neutral-800/80 p-2.5 rounded-xl transition-all flex justify-between items-center gap-3 cursor-pointer group"
                  onClick={() => handleLoadEntry(entry)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[9px] font-mono text-neutral-400 bg-neutral-900 px-1.5 py-0.5 rounded">
                        {entry.nodeLabel}
                      </span>
                      <span className="text-[8px] font-mono text-neutral-600">
                        {new Date(entry.timestamp).toLocaleDateString()}
                      </span>
                      {entry.tags && entry.tags.map(t => (
                        <span key={t} className="text-[8px] font-mono text-amber-400/80 bg-amber-950/30 px-1 rounded">
                          #{t}
                        </span>
                      ))}
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
                <p className="text-[10px] font-mono">
                  {selectedTagFilter ? `No logs found matching tag #${selectedTagFilter}` : 'No previous logs recorded in the Void.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Auto-Save Toast Notification Component */}
      <AnimatePresence>
        {autoSaveToast && autoSaveToast.show && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 bg-neutral-950/95 border border-emerald-500/60 p-3.5 rounded-xl shadow-2xl shadow-emerald-950/60 backdrop-blur-md flex items-center gap-3 text-xs font-mono text-neutral-200"
          >
            <div className="relative flex h-3 w-3 items-center justify-center">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 font-semibold text-emerald-300">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>{autoSaveToast.msg}</span>
              </div>
              <span className="text-[9px] text-neutral-500">Auto-persisted at {autoSaveToast.time}</span>
            </div>
            <button
              onClick={() => setAutoSaveToast(null)}
              className="ml-2 text-neutral-500 hover:text-neutral-200 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
