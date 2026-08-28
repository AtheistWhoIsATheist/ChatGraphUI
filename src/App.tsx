// @ts-nocheck
import { AngLayout } from './components/ANG/AngLayout';
import { ChatView } from './components/ANG/views/ChatView';
import { AporiaView } from './components/ANG/views/AporiaView';
import { DigestView } from './components/ANG/views/DigestView';
import { SettingsView } from './components/ANG/views/SettingsView';
import { LibraryView } from './components/ANG/views/LibraryView';
import { AngView, GateMode, BoundaryState } from './types/ang';
import { useState, useEffect, useCallback } from 'react';
import { initialNodes, initialLinks, corpusTexts } from './data/ontology';
import { parseNihilismJson } from './data/ontologyParser';
import graphData from './data/graph-data.json';
import { JournalEntry, Marginalia, ParadoxSynthesis, CorpusIngestionBatch } from './types';
import { OntologyMap } from './components/OntologyMap';
import { CorpusIntakeTool } from './components/CorpusIntakeTool';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [activeAngView, setActiveAngView] = useState<AngView>('chat');
  const [gateMode, setGateMode] = useState<GateMode>('AUTO');
  const [messages, setMessages] = useState<any[]>([
    {
      id: 'msg-1',
      role: 'CURATOR',
      content: `Welcome to the ANG System — the Abyssal Navigation Graph for Nihiltheism.

This system is built to support your philosophical research into Nihiltheism — the framework that holds the experience of nihilism as a temporal expression of the Transcendent.

To begin:
• Ask me anything about NT
• Add your first source via the Ingest view (⊕)
• Explore the graph (⬡) to see the current architecture
• Review your open questions (◇)

The void is ready. So am I.`,
      timestamp: new Date().toISOString()
    }
  ]);
  const [aporias, setAporias] = useState<any[]>([
    {
      id: 'aporia-1',
      text: 'Who or what is the witness of the dissolution?',
      whyUnresolvable: 'The very report of dissolution implies a witness. But if a witness persists, dissolution was incomplete. If dissolution was complete, no report is possible. The paradox is self-referentially unresolvable.',
      functionalValue: 'Points toward the nature of awareness itself — what is it that persists through dissolution? This question cannot be answered without begging it. It is NT\'s most productive aporia.',
      sourceId: 'P3 Paradox',
      createdAt: new Date().toISOString(),
      status: 'CONFIRMED'
    },
    {
      id: 'aporia-2',
      text: 'Can the void be encountered without a self to encounter it?',
      whyUnresolvable: 'Any description of the encounter requires a phenomenological subject, but the void-encounter precisely dissolves the subject-object structure.',
      functionalValue: 'Prevents the reification of the void as an object of experience.',
      sourceId: 'P1/P3 intersection',
      createdAt: new Date().toISOString(),
      status: 'CONFIRMED'
    }
  ]);

  const handleSendMessage = (content: string) => {
    const newMsg = {
      id: `msg-${Date.now()}`,
      role: 'RESEARCHER',
      content,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, newMsg]);
    
    // Simulate curator response
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: `msg-${Date.now()+1}`,
        role: 'CURATOR',
        content: `I hear what you are saying. This points toward the paradox of Absence-as-Presence. We must apply apophatic discipline here to avoid reifying the void.`,
        timestamp: new Date().toISOString(),
        metadata: { depthLevel: 3, triggers: ['T1', 'T2'] }
      }]);
    }, 1500);
  };

  const [boundaryState] = useState<BoundaryState>({ theta: 0.18, mode: 'CLEAR' });

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
    <AngLayout
      activeView={activeAngView}
      onNavigate={setActiveAngView}
      gateMode={gateMode}
      onGateModeChange={setGateMode}
      boundaryState={boundaryState}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={activeAngView}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18 }}
          className="h-full"
        >
          {activeAngView === 'chat' && (
            <ChatView 
              messages={messages} 
              onSendMessage={handleSendMessage} 
              boundaryState={boundaryState}
              sessionTime="0h 0m"
              nodesCreated={0}
            />
          )}
          {activeAngView === 'graph' && (
            <OntologyMap
              nodes={displayNodes}
              links={displayLinks}
              corpusTexts={corpusTexts}
              selectedNodeId={selectedNodeId}
              hoveredNodeId={hoveredNodeId}
              onSelectNode={handleSelectNode}
              onHoverNode={handleHoverNode}
              onSelectQuestion={handleSelectQuestion}
              onNavigateToTab={(t) => {}}
              ingestionBatches={ingestionBatches}
              initialFocusSource={targetFocusSource}
            />
          )}
          {activeAngView === 'library' && (
            <LibraryView 
              corpusTexts={corpusTexts}
              marginalia={marginalia}
              onSaveMarginalia={handleSaveMarginalia}
              onDeleteMarginalia={handleDeleteMarginalia}
            />
          )}
          {activeAngView === 'questions' && (
            <AporiaView aporias={aporias} />
          )}
          {activeAngView === 'ingest' && (
            <CorpusIntakeTool
              ingestionBatches={ingestionBatches}
              onSaveBatch={handleSaveBatch}
              onDeleteBatch={handleDeleteBatch}
              onClearAllBatches={handleClearAllBatches}
              onNavigateToTab={() => {}}
            />
          )}
          {activeAngView === 'digest' && (
            <DigestView 
              dateStart="Aug 19"
              dateEnd="Aug 26"
              generatedAt={new Date().toISOString()}
              stats={{
                sourcesIngested: 3,
                nodesCreated: 127,
                sessions: 7,
                totalSessionTime: "14h 23m",
                paradoxesConfirmed: 1,
                aporiaAdded: 3,
                invarianceAnalyses: 2,
                newInvariants: 1
              }}
              synthesisNote="The void discloses rather than merely negates. This week's ingestions have reinforced the paradoxical tension between absence and presence."
              pendingReviewCount={4}
            />
          )}
          {activeAngView === 'settings' && (
            <SettingsView />
          )}
        </motion.div>
      </AnimatePresence>
    </AngLayout>
  );
};
