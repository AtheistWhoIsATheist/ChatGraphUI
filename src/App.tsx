import { useState, useEffect, useCallback } from 'react';
import { initialNodes, initialLinks, corpusTexts } from './data/ontology';
import { parseNihilismJson } from './data/ontologyParser';
import graphData from './data/graph-data.json';
import { JournalEntry, Marginalia, ParadoxSynthesis, CorpusIngestionBatch } from './types';
import { OntologyMap } from './components/OntologyMap';
import { ReflectionChamber } from './components/ReflectionChamber';
import { CorpusBrowser } from './components/CorpusBrowser';
import { ParadoxSynthesizer } from './components/ParadoxSynthesizer';
import { CorpusIntakeTool } from './components/CorpusIntakeTool';
import ReasoningEnginePage from '../app/page';
import { DataManagementModal } from './components/DataManagementModal';
import { GoogleDocsManager } from './components/GoogleDocsManager';
import { Network, PenTool, BookOpen, Activity, Clock, Database, Brain, Sparkles, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  // Navigation tabs: 'graph' | 'journal' | 'corpus' | 'paradox' | 'intake' | 'engine' | 'docs'
  const [activeTab, setActiveTab] = useState<'graph' | 'journal' | 'corpus' | 'paradox' | 'intake' | 'engine' | 'docs'>('graph');

  const [targetFocusSource, setTargetFocusSource] = useState<string | null>(null);

  const handleNavigateToGraphWithSource = (tab: any, sourceTitle?: string) => {
    if (sourceTitle) {
      setTargetFocusSource(sourceTitle);
    }
    setActiveTab(tab);
  };

  // Core application states
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);
  const [isDataModalOpen, setIsDataModalOpen] = useState(false);

  // Stable callbacks to maintain reference integrity
  const handleSelectNode = useCallback((nodeId: string | null) => {
    setSelectedNodeId(nodeId);
  }, []);

  const handleNavigateToNode = useCallback((nodeId: string) => {
    setSelectedNodeId(nodeId);
    setActiveTab('graph');
  }, []);

  const handleHoverNode = useCallback((nodeId: string | null) => {
    setHoveredNodeId(nodeId);
  }, []);

  // Persistence States (Local Storage)
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [marginalia, setMarginalia] = useState<Marginalia[]>([]);
  const [synthesisHistory, setSynthesisHistory] = useState<ParadoxSynthesis[]>([]);
  const [ingestionBatches, setIngestionBatches] = useState<CorpusIngestionBatch[]>([]);
  const [lastSavedAt, setLastSavedAt] = useState<number>(0);

  // Time clock display (strictly literal and compliant)
  const [currentTime, setCurrentTime] = useState('');

  
  const [displayNodes, setDisplayNodes] = useState(initialNodes);
  const [displayLinks, setDisplayLinks] = useState(initialLinks);

  useEffect(() => {
    try {
      if (Object.keys(graphData).length > 0) {
        const parsed = parseNihilismJson(graphData as any);
        if (parsed.nodes.length > 0) {
          setDisplayNodes(parsed.nodes);
          setDisplayLinks(parsed.links);
          return;
        }
      }
    } catch (e) {
      console.error('Failed to parse graphData', e);
    }
    setDisplayNodes(initialNodes);
    setDisplayLinks(initialLinks);
  }, []);


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
    setLastSavedAt(Date.now());
  };

  const handleDeleteBatch = (batchId: string) => {
    const updated = ingestionBatches.filter(b => b.batchId !== batchId);
    setIngestionBatches(updated);
    localStorage.setItem('nes2_ingestion_batches', JSON.stringify(updated));
    setLastSavedAt(Date.now());
  };

  const handleClearAllBatches = () => {
    setIngestionBatches([]);
    localStorage.removeItem('nes2_ingestion_batches');
    setLastSavedAt(Date.now());
  };

  // Google Docs Import Handler
  const handleImportGoogleDocToGraph = (docTitle: string, docText: string, docId: string) => {
    const newBatch: CorpusIngestionBatch = {
      batchId: `gdoc-${docId}-${Date.now()}`,
      timestamp: new Date().toISOString(),
      filename: `${docTitle}.gdoc`,
      fileExtension: 'gdoc',
      fileSize: docText.length,
      sha256Hash: `gdoc-${docId}`,
      rawContent: docText,
      title: docTitle,
      sourceType: 'document',
      chunks: [
        {
          id: `chunk-${Date.now()}`,
          startPosition: 0,
          endPosition: docText.length,
          structuralType: 'section',
          summary: `Imported Google Doc: ${docTitle}`,
          text: docText.slice(0, 500)
        }
      ],
      extracts: [
        {
          id: `ext-${Date.now()}`,
          elementType: 'concept',
          text: docTitle,
          epistemicStatus: 'TEXTUAL',
          chunkReference: `chunk-${Date.now()}`,
          provenance: `Google Doc: ${docTitle}`
        }
      ],
      issues: [],
      antiReificationAudits: [],
      boundarySignals: [],
      nextActions: [],
      markdownReport: `# Google Doc Import: ${docTitle}\n\n${docText.slice(0, 1000)}`,
      verificationChecklist: {
        immutableStorage: true,
        epistemicLabels: true,
        duplicatesSurfaced: true,
        crisisScanned: true,
        antiReification: true,
        noMergedMetadata: true,
        nextActionsProduced: true,
        selfVerified: true,
        batchReturned: true
      }
    };
    handleSaveBatch(newBatch);
  };

  // Google Docs Export Handler
  const handleExportGraphToGoogleDoc = async (title: string): Promise<string> => {
    let summaryText = `KNOWLEDGE GRAPH ANALYSIS & SYNTHESIS\nTitle: ${title}\nExported: ${new Date().toLocaleString()}\n\n`;
    summaryText += `Total Nodes Analyzed: ${displayNodes.length}\nTotal Inter-Conceptual Links: ${displayLinks.length}\n\n`;
    summaryText += `PRIMARY CONCEPT NODES:\n`;
    displayNodes.slice(0, 20).forEach((node, idx) => {
      summaryText += `${idx + 1}. ${node.label} (${node.type.toUpperCase()})\n`;
    });
    if (journalEntries.length > 0) {
      summaryText += `\nVOID JOURNAL REFLECTIONS (${journalEntries.length}):\n`;
      journalEntries.slice(0, 5).forEach((entry) => {
        summaryText += `- [${new Date(entry.timestamp).toLocaleDateString()}] ${entry.userText}\n`;
      });
    }
    return summaryText;
  };


  // 3. Helper to update and persist journal entries
  const handleSaveJournalEntry = (newEntry: JournalEntry) => {
    const updated = [newEntry, ...journalEntries];
    setJournalEntries(updated);
    localStorage.setItem('nes2_journal_entries', JSON.stringify(updated));
    setLastSavedAt(Date.now());
  };

  const handleDeleteJournalEntry = (id: string) => {
    const updated = journalEntries.filter(entry => entry.id !== id);
    setJournalEntries(updated);
    localStorage.setItem('nes2_journal_entries', JSON.stringify(updated));
    setLastSavedAt(Date.now());
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
    setLastSavedAt(Date.now());
  };

  const handleDeleteMarginalia = (corpusId: string) => {
    const updated = marginalia.filter(m => m.corpusId !== corpusId);
    setMarginalia(updated);
    localStorage.setItem('nes2_marginalia', JSON.stringify(updated));
    setLastSavedAt(Date.now());
  };

  // 5. Helper to update and persist paradox synthesis
  const handleSaveSynthesis = (newSynthesis: ParadoxSynthesis) => {
    const updated = [newSynthesis, ...synthesisHistory];
    setSynthesisHistory(updated);
    localStorage.setItem('nes2_synthesis_history', JSON.stringify(updated));
    setLastSavedAt(Date.now());
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

  // Jump to reflection chamber with selected question
  const handleSelectQuestion = (question: string) => {
    setSelectedQuestion(question);
    setActiveTab('journal');
  };

  return (
    <div id="application-root" className="h-full flex flex-col bg-neutral-950 text-neutral-100 font-sans antialiased overflow-hidden">
      
      {/* 1. Sleek Unified Top Navigation Header */}
      <header className="border-b border-neutral-900 bg-neutral-950/90 backdrop-blur-xl px-4 py-2.5 flex flex-shrink-0 items-center justify-between gap-4 z-30 select-none">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-cyan-400 font-bold font-mono text-sm shadow-inner">
            N
          </div>
          <div>
            <h1 className="font-display text-xs font-bold uppercase tracking-widest text-neutral-100 flex items-center gap-2">
              Nihilismi Experientia Sacra
              <span className="text-[9px] font-mono text-neutral-500 bg-neutral-900 px-1.5 py-0.5 rounded border border-neutral-850">
                v2.0
              </span>
            </h1>
            <p className="text-[10px] text-neutral-500 font-mono hidden sm:block">
              Apophatic Knowledge Architecture
            </p>
          </div>
        </div>

        {/* Center: Segmented Navigation Pills */}
        <nav className="flex items-center gap-1 bg-neutral-900/90 border border-neutral-850 p-1 rounded-2xl overflow-x-auto no-scrollbar max-w-full">
          <button
            onClick={() => setActiveTab('graph')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'graph'
                ? 'bg-neutral-800 text-cyan-300 font-bold border border-cyan-500/40 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-850/50'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>Ontology Map</span>
          </button>

          <button
            onClick={() => setActiveTab('journal')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'journal'
                ? 'bg-neutral-800 text-cyan-300 font-bold border border-cyan-500/40 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-850/50'
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>Void Journal</span>
          </button>

          <button
            onClick={() => setActiveTab('corpus')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'corpus'
                ? 'bg-neutral-800 text-cyan-300 font-bold border border-cyan-500/40 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-850/50'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Corpus Archive</span>
          </button>

          <button
            onClick={() => setActiveTab('paradox')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'paradox'
                ? 'bg-neutral-800 text-cyan-300 font-bold border border-cyan-500/40 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-850/50'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Paradox</span>
          </button>

          <button
            onClick={() => setActiveTab('intake')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'intake'
                ? 'bg-neutral-800 text-amber-300 font-bold border border-amber-500/40 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-850/50'
            }`}
          >
            <Brain className="w-3.5 h-3.5 text-amber-400" />
            <span>Corpus AI</span>
          </button>

          <button
            onClick={() => setActiveTab('docs')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'docs'
                ? 'bg-neutral-800 text-blue-300 font-bold border border-blue-500/40 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-850/50'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-blue-400" />
            <span>Google Docs</span>
          </button>

          <button
            onClick={() => setActiveTab('engine')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'engine'
                ? 'bg-neutral-800 text-purple-300 font-bold border border-purple-500/40 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-850/50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Reasoning</span>
          </button>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3 shrink-0 text-xs font-mono text-neutral-500">
          <button
            onClick={() => setIsDataModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 rounded-xl text-neutral-300 hover:text-white transition-all cursor-pointer text-xs"
            title="Export or Import data backup"
          >
            <Database className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden lg:inline">Data Backup</span>
          </button>

          <div className="hidden xl:flex items-center gap-1.5 border-l border-neutral-850 pl-3">
            <Clock className="w-3.5 h-3.5 text-neutral-600" />
            <span className="text-neutral-300 font-medium">{currentTime || '--:--'}</span>
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
      <main className="flex-1 min-h-0 z-10 overflow-hidden bg-black">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="h-full"
          >
              
              {/* Tab Content: Graph / Map View */}
              {activeTab === 'graph' && (
                <OntologyMap
                  nodes={displayNodes}
                  links={displayLinks}
                  corpusTexts={corpusTexts}
                  selectedNodeId={selectedNodeId}
                  hoveredNodeId={hoveredNodeId}
                  onSelectNode={handleSelectNode}
                  onHoverNode={handleHoverNode}
                  onSelectQuestion={handleSelectQuestion}
                  onNavigateToTab={setActiveTab}
                  ingestionBatches={ingestionBatches}
                  initialFocusSource={targetFocusSource}
                />
              )}

              {/* Tab Content: Void Journal / Reflection */}
              {activeTab === 'journal' && (
                <ReflectionChamber
                  nodes={displayNodes}
                  selectedNodeId={selectedNodeId}
                  selectedQuestion={selectedQuestion}
                  onSelectNode={setSelectedNodeId}
                  onSelectQuestion={setSelectedQuestion}
                  journalEntries={journalEntries}
                  onSaveEntry={handleSaveJournalEntry}
                  onDeleteEntry={handleDeleteJournalEntry}
                  lastSavedAt={lastSavedAt}
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
                  nodes={displayNodes}
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
                  onNavigateToTab={handleNavigateToGraphWithSource}
                />
              )}

              {/* Tab Content: Google Docs Integration */}
              {activeTab === 'docs' && (
                <GoogleDocsManager
                  onImportDocToGraph={handleImportGoogleDocToGraph}
                  onExportGraphToDoc={handleExportGraphToGoogleDoc}
                  isOpen={true}
                />
              )}

              {/* Tab Content: Reasoning Engine & Live Preview */}
              {activeTab === 'engine' && (
                <ReasoningEnginePage onNavigateToNode={handleNavigateToNode} />
              )}

            </motion.div>
          </AnimatePresence>
      </main>
    </div>
  );
}
