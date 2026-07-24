import { useState, useEffect, useCallback } from 'react';
import { initialNodes, initialLinks, corpusTexts } from './data/ontology';
import { JournalEntry, Marginalia, ParadoxSynthesis, CorpusIngestionBatch } from './types';
import { InteractiveGraph } from './components/InteractiveGraph';
import { NodeDetailPanel } from './components/NodeDetailPanel';
import { ReflectionChamber } from './components/ReflectionChamber';
import { CorpusBrowser } from './components/CorpusBrowser';
import { ParadoxSynthesizer } from './components/ParadoxSynthesizer';
import { CorpusIntakeTool } from './components/CorpusIntakeTool';
import { DataManagementModal } from './components/DataManagementModal';
import { Network, PenTool, BookOpen, Activity, Clock, Info, Database, Brain } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  // Navigation tabs: 'graph' | 'journal' | 'corpus' | 'paradox' | 'intake'
  const [activeTab, setActiveTab] = useState<'graph' | 'journal' | 'corpus' | 'paradox' | 'intake'>('intake');

  // Core application states
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);
  const [isDataModalOpen, setIsDataModalOpen] = useState(false);

  // Stable callbacks to maintain reference integrity
  const handleSelectNode = useCallback((nodeId: string | null) => {
    setSelectedNodeId(nodeId);
  }, []);

  const handleHoverNode = useCallback((nodeId: string | null) => {
    setHoveredNodeId(nodeId);
  }, []);

  // Persistence States (Local Storage)
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [marginalia, setMarginalia] = useState<Marginalia[]>([]);
  const [synthesisHistory, setSynthesisHistory] = useState<ParadoxSynthesis[]>([]);
  const [ingestionBatches, setIngestionBatches] = useState<CorpusIngestionBatch[]>([]);

  // Time clock display (strictly literal and compliant)
  const [currentTime, setCurrentTime] = useState('');

  // 1. Initialize persistent data from localStorage
  useEffect(() => {
    try {
      const savedJournal = localStorage.getItem('nes2_journal_entries');
      if (savedJournal) setJournalEntries(JSON.parse(savedJournal));

      const savedMarginalia = localStorage.getItem('nes2_marginalia');
      if (savedMarginalia) setMarginalia(JSON.parse(savedMarginalia));

      const savedSynthesis = localStorage.getItem('nes2_synthesis_history');
      if (savedSynthesis) setSynthesisHistory(JSON.parse(savedSynthesis));

      const savedBatches = localStorage.getItem('nes2_ingestion_batches');
      if (savedBatches) setIngestionBatches(JSON.parse(savedBatches));
    } catch (e) {
      console.error('Failed to load archives from persistent local storage:', e);
    }
  }, []);

  // 2. Real-time Clock loop (clean and stabilized)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Helper to update and persist ingested batches
  const handleSaveBatch = (newBatch: CorpusIngestionBatch) => {
    const updated = [newBatch, ...ingestionBatches.filter(b => b.batchId !== newBatch.batchId)];
    setIngestionBatches(updated);
    localStorage.setItem('nes2_ingestion_batches', JSON.stringify(updated));
  };

  const handleDeleteBatch = (batchId: string) => {
    const updated = ingestionBatches.filter(b => b.batchId !== batchId);
    setIngestionBatches(updated);
    localStorage.setItem('nes2_ingestion_batches', JSON.stringify(updated));
  };

  const handleClearAllBatches = () => {
    setIngestionBatches([]);
    localStorage.removeItem('nes2_ingestion_batches');
  };

  // 3. Helper to update and persist journal entries
  const handleSaveJournalEntry = (newEntry: JournalEntry) => {
    const updated = [newEntry, ...journalEntries];
    setJournalEntries(updated);
    localStorage.setItem('nes2_journal_entries', JSON.stringify(updated));
  };

  const handleDeleteJournalEntry = (id: string) => {
    const updated = journalEntries.filter(entry => entry.id !== id);
    setJournalEntries(updated);
    localStorage.setItem('nes2_journal_entries', JSON.stringify(updated));
  };

  // 4. Helper to update and persist marginalia
  const handleSaveMarginalia = (corpusId: string, noteText: string) => {
    let updated: Marginalia[] = [];
    if (noteText.trim() === '') {
      updated = marginalia.filter(m => m.corpusId !== corpusId);
    } else {
      const existingIdx = marginalia.findIndex(m => m.corpusId === corpusId);
      if (existingIdx > -1) {
        updated = [...marginalia];
        updated[existingIdx] = { corpusId, noteText, timestamp: new Date().toISOString() };
      } else {
        updated = [...marginalia, { corpusId, noteText, timestamp: new Date().toISOString() }];
      }
    }
    setMarginalia(updated);
    localStorage.setItem('nes2_marginalia', JSON.stringify(updated));
  };

  const handleDeleteMarginalia = (corpusId: string) => {
    const updated = marginalia.filter(m => m.corpusId !== corpusId);
    setMarginalia(updated);
    localStorage.setItem('nes2_marginalia', JSON.stringify(updated));
  };

  // 5. Helper to update and persist paradox synthesis
  const handleSaveSynthesis = (newSynthesis: ParadoxSynthesis) => {
    const updated = [newSynthesis, ...synthesisHistory];
    setSynthesisHistory(updated);
    localStorage.setItem('nes2_synthesis_history', JSON.stringify(updated));
  };

  const handleClearSynthesisHistory = () => {
    setSynthesisHistory([]);
    localStorage.removeItem('nes2_synthesis_history');
  };

  // Import external archive data (merge or restore)
  const handleImportData = (imported: {
    journalEntries?: JournalEntry[];
    marginalia?: Marginalia[];
    synthesisHistory?: ParadoxSynthesis[];
  }) => {
    if (imported.journalEntries) {
      setJournalEntries(imported.journalEntries);
      localStorage.setItem('nes2_journal_entries', JSON.stringify(imported.journalEntries));
    }
    if (imported.marginalia) {
      setMarginalia(imported.marginalia);
      localStorage.setItem('nes2_marginalia', JSON.stringify(imported.marginalia));
    }
    if (imported.synthesisHistory) {
      setSynthesisHistory(imported.synthesisHistory);
      localStorage.setItem('nes2_synthesis_history', JSON.stringify(imported.synthesisHistory));
    }
  };

  // Clear all local storage state
  const handleClearAllData = () => {
    setJournalEntries([]);
    setMarginalia([]);
    setSynthesisHistory([]);
    localStorage.removeItem('nes2_journal_entries');
    localStorage.removeItem('nes2_marginalia');
    localStorage.removeItem('nes2_synthesis_history');
  };

  // Safe node selector
  const activeNode = selectedNodeId ? initialNodes.find(n => n.id === selectedNodeId) : null;

  // Jump to reflection chamber with selected question
  const handleSelectQuestion = (question: string) => {
    setSelectedQuestion(question);
    setActiveTab('journal');
  };

  return (
    <div id="application-root" className="h-full flex flex-col bg-neutral-950 text-neutral-100 font-sans antialiased overflow-hidden">
      
      {/* 1. Header Layout */}
      <header className="border-b border-neutral-900 bg-neutral-950/80 backdrop-blur-md px-6 py-4 flex flex-shrink-0 justify-between items-center z-20">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h1 className="font-display text-base font-bold uppercase tracking-widest text-white">
              Nihilismi Experientia Sacra II
            </h1>
            <span className="text-[10px] font-mono text-neutral-600 bg-neutral-900 px-2 py-0.5 rounded border border-neutral-850">
              v2.0.1
            </span>
          </div>
          <p className="text-[11px] text-neutral-500 tracking-wide font-sans mt-0.5">
            Interactive Digital Companion & Apophatic Knowledge Architecture
          </p>
        </div>

        {/* Toolbar & lit clock display */}
        <div className="flex items-center gap-4 text-xs text-neutral-500 font-mono">
          <button
            onClick={() => setIsDataModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 rounded-lg text-neutral-300 hover:text-white transition-all text-xs font-mono cursor-pointer"
            title="Export or Import reflections, notes, and paradox syntheses"
          >
            <Database className="w-3.5 h-3.5 text-amber-400" />
            <span>Data Backup & Export</span>
          </button>

          <div className="hidden sm:flex items-center gap-1.5 border-l border-neutral-850 pl-4">
            <Clock className="w-3.5 h-3.5 text-neutral-600" />
            <span>Time:</span>
            <span className="text-neutral-300 font-medium">{currentTime || '--:--:--'}</span>
          </div>
        </div>
      </header>

      {/* Data Management Export / Import Modal */}
      <DataManagementModal
        isOpen={isDataModalOpen}
        onClose={() => setIsDataModalOpen(false)}
        journalEntries={journalEntries}
        marginalia={marginalia}
        synthesisHistory={synthesisHistory}
        onImportData={handleImportData}
        onClearAllData={handleClearAllData}
      />

      {/* 2. Main content container */}
      <main className="flex-1 flex flex-col md:flex-row min-h-0 z-10 overflow-hidden">
        
        {/* Navigation Rail / Sidebar */}
        <nav className="w-full md:w-64 border-b md:border-b-0 md:border-r border-neutral-900 bg-neutral-950/50 flex-shrink-0 flex flex-row md:flex-col justify-between p-3 md:p-4 gap-2">
          <div className="flex flex-row md:flex-col gap-1.5 flex-1 md:flex-none">
            
            {/* Tab: Ontology Map */}
            <button
              onClick={() => setActiveTab('graph')}
              className={`flex-1 md:flex-initial flex items-center justify-center md:justify-start gap-2.5 px-4 py-3 rounded-xl text-xs font-mono tracking-wider transition-all cursor-pointer ${
                activeTab === 'graph'
                  ? 'bg-white text-black font-semibold'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60'
              }`}
            >
              <Network className="w-4 h-4 flex-shrink-0" />
              <span>Ontology Map</span>
            </button>

            {/* Tab: Reflection Chamber */}
            <button
              onClick={() => setActiveTab('journal')}
              className={`flex-1 md:flex-initial flex items-center justify-center md:justify-start gap-2.5 px-4 py-3 rounded-xl text-xs font-mono tracking-wider transition-all cursor-pointer ${
                activeTab === 'journal'
                  ? 'bg-white text-black font-semibold'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60'
              }`}
            >
              <PenTool className="w-4 h-4 flex-shrink-0" />
              <span>Void Journal</span>
            </button>

            {/* Tab: Scholarly Archive */}
            <button
              onClick={() => setActiveTab('corpus')}
              className={`flex-1 md:flex-initial flex items-center justify-center md:justify-start gap-2.5 px-4 py-3 rounded-xl text-xs font-mono tracking-wider transition-all cursor-pointer ${
                activeTab === 'corpus'
                  ? 'bg-white text-black font-semibold'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60'
              }`}
            >
              <BookOpen className="w-4 h-4 flex-shrink-0" />
              <span>Scholarly Archive</span>
            </button>

            {/* Tab: Paradox Synthesizer */}
            <button
              onClick={() => setActiveTab('paradox')}
              className={`flex-1 md:flex-initial flex items-center justify-center md:justify-start gap-2.5 px-4 py-3 rounded-xl text-xs font-mono tracking-wider transition-all cursor-pointer ${
                activeTab === 'paradox'
                  ? 'bg-white text-black font-semibold'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60'
              }`}
            >
              <Activity className="w-4 h-4 flex-shrink-0" />
              <span>Paradox Synthesizer</span>
            </button>

            {/* Tab: Corpus Intake & Second Brain AI */}
            <button
              onClick={() => setActiveTab('intake')}
              className={`flex-1 md:flex-initial flex items-center justify-center md:justify-start gap-2.5 px-4 py-3 rounded-xl text-xs font-mono tracking-wider transition-all cursor-pointer ${
                activeTab === 'intake'
                  ? 'bg-gradient-to-r from-amber-500 to-purple-600 text-white font-semibold shadow-lg shadow-purple-950/50'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60'
              }`}
            >
              <Brain className="w-4 h-4 flex-shrink-0 text-amber-400" />
              <span>Corpus Intake & AI</span>
            </button>
          </div>

          {/* Socratic Motto / Info card at bottom of navigation (desktop only) */}
          <div className="hidden md:flex flex-col gap-2 p-3 bg-neutral-900/20 border border-neutral-900/60 rounded-xl text-[10px] font-mono text-neutral-500 leading-normal select-none">
            <div className="flex items-center gap-1 text-neutral-400">
              <Info className="w-3.5 h-3.5 text-neutral-500 flex-shrink-0" />
              <span>Apophatic Method</span>
            </div>
            <p>Define absolute truth strictly by stating what it is not. Expose certainty to aporia, and settle in silent awareness.</p>
          </div>
        </nav>

        {/* 3. Main Workspace Container */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-black">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="h-full"
            >
              
              {/* Tab Content: Graph / Map View */}
              {activeTab === 'graph' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full items-start">
                  {/* Left SVG Graph panel (7 cols) */}
                  <div className="lg:col-span-7 h-full flex flex-col gap-4">
                    <InteractiveGraph
                      nodes={initialNodes}
                      links={initialLinks}
                      selectedNodeId={selectedNodeId}
                      hoveredNodeId={hoveredNodeId}
                      onSelectNode={handleSelectNode}
                      onHoverNode={handleHoverNode}
                    />
                  </div>

                  {/* Right Node details panel (5 cols) */}
                  <div className="lg:col-span-5 h-full">
                    {activeNode ? (
                      <NodeDetailPanel
                        node={activeNode}
                        corpusTexts={corpusTexts}
                        onSelectQuestion={handleSelectQuestion}
                        onNavigateToTab={setActiveTab}
                      />
                    ) : (
                      <div className="bg-neutral-950 border border-neutral-900 rounded-2xl p-8 flex flex-col items-center justify-center text-center gap-4 h-full min-h-[300px] abyssal-glow justify-between py-16">
                        <div className="flex flex-col items-center gap-3">
                          <Network className="w-10 h-10 text-neutral-800 animate-pulse" />
                          <h3 className="font-display text-sm tracking-widest text-neutral-400 uppercase font-medium">No Parameter Selected</h3>
                          <p className="text-xs text-neutral-500 leading-relaxed max-w-xs font-sans">
                            Select any concept node in the active network projection grid to examine its ontological parameters, connected texts, and reflective pathways.
                          </p>
                        </div>
                        <div className="bg-neutral-900/30 border border-neutral-900 p-3.5 rounded-xl text-[10px] font-mono text-neutral-500 leading-normal max-w-sm mt-4 text-left select-none">
                          <span className="text-neutral-400 font-semibold block mb-1">Recommended Starting Gateways:</span>
                          • The Absolute Void (Ontological Core)<br />
                          • Socratic Epoché (Epistemological Suspension)<br />
                          • Śūnyatā (Radical Emptiness Insight)
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tab Content: Void Journal / Reflection */}
              {activeTab === 'journal' && (
                <ReflectionChamber
                  nodes={initialNodes}
                  selectedNodeId={selectedNodeId}
                  selectedQuestion={selectedQuestion}
                  onSelectNode={setSelectedNodeId}
                  onSelectQuestion={setSelectedQuestion}
                  journalEntries={journalEntries}
                  onSaveEntry={handleSaveJournalEntry}
                  onDeleteEntry={handleDeleteJournalEntry}
                />
              )}

              {/* Tab Content: Scholarly Archive */}
              {activeTab === 'corpus' && (
                <CorpusBrowser
                  corpusTexts={corpusTexts}
                  marginalia={marginalia}
                  onSaveMarginalia={handleSaveMarginalia}
                  onDeleteMarginalia={handleDeleteMarginalia}
                />
              )}

              {/* Tab Content: Paradox Synthesizer */}
              {activeTab === 'paradox' && (
                <ParadoxSynthesizer
                  nodes={initialNodes}
                  synthesisHistory={synthesisHistory}
                  onSaveSynthesis={handleSaveSynthesis}
                  onClearHistory={handleClearSynthesisHistory}
                />
              )}

              {/* Tab Content: Corpus Intake & Second Brain AI */}
              {activeTab === 'intake' && (
                <CorpusIntakeTool
                  ingestionBatches={ingestionBatches}
                  onSaveBatch={handleSaveBatch}
                  onDeleteBatch={handleDeleteBatch}
                  onClearAllBatches={handleClearAllBatches}
                />
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
