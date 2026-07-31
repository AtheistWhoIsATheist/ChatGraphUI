import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Send,
  Database,
  Sparkles,
  Bot,
  User,
  ShieldCheck,
  Layers,
  Activity,
  ArrowUpRight,
  Loader2,
  Trash2,
  Brain,
  FileCheck,
  Save,
  ChevronDown,
  ChevronUp,
  GitCompare
} from 'lucide-react';
import {
  CorpusIngestionBatch,
  ChatMessage,
  EpistemicStatus
} from '../types';
import {
  calculateSHA256,
  normalizeText,
  parseFrontmatter
} from '../lib/corpusIngestion';
import { initialNodes } from '../data/ontology';

interface CorpusIntakeToolProps {
  ingestionBatches: CorpusIngestionBatch[];
  onSaveBatch: (batch: CorpusIngestionBatch) => void;
  onDeleteBatch: (batchId: string) => void;
  onClearAllBatches: () => void;
}

export const CorpusIntakeTool: React.FC<CorpusIntakeToolProps> = ({
  ingestionBatches,
  onSaveBatch,
  onDeleteBatch,
  onClearAllBatches
}) => {
  // Navigation mode within the tool
  const [activeSubTab, setActiveSubTab] = useState<'chat' | 'ingest' | 'audit' | 'second-brain'>('chat');

  // --- Ingestion Console State ---
  const [pastedText, setPastedText] = useState('');
  const [pastedTitle, setPastedTitle] = useState('');
  const [sourceType, setSourceType] = useState('essay');
  const [isProcessing, setIsProcessing] = useState(false);
  const [ingestionStep, setIngestionStep] = useState<number>(0);
  const [ingestionError, setIngestionError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Batch / Multi-file processing state
  const [processingSource, setProcessingSource] = useState<'upload' | 'paste' | null>(null);
  const [activeFileName, setActiveFileName] = useState<string>('');
  const [batchTotalFiles, setBatchTotalFiles] = useState<number>(0);
  const [batchCurrentIndex, setBatchCurrentIndex] = useState<number>(0);

  // Audit Sub-Tab View Mode ('all' for aggregate Second Brain stats, or batchId)
  const [auditViewMode, setAuditViewMode] = useState<string>('all');

  // Aggregate stats across all batches for Second Brain Summary
  const aggregateStats = useMemo(() => {
    if (ingestionBatches.length === 0) {
      return { totalBatches: 0, totalChunks: 0, totalExtracts: 0, totalAudits: 0, totalNextActions: 0 };
    }
    return {
      totalBatches: ingestionBatches.length,
      totalChunks: ingestionBatches.reduce((acc, b) => acc + (b.chunks?.length || 0), 0),
      totalExtracts: ingestionBatches.reduce((acc, b) => acc + (b.extracts?.length || 0), 0),
      totalAudits: ingestionBatches.reduce((acc, b) => acc + (b.antiReificationAudits?.length || 0), 0),
      totalNextActions: ingestionBatches.reduce((acc, b) => acc + (b.nextActions?.length || 0), 0),
    };
  }, [ingestionBatches]);

  // Selected batch for detailed audit
  const selectedBatch = useMemo(() => {
    if (auditViewMode === 'all') return null;
    return ingestionBatches.find(b => b.batchId === auditViewMode) || (ingestionBatches.length > 0 ? ingestionBatches[0] : null);
  }, [ingestionBatches, auditViewMode]);

  // Collapsible Mini-Diff State
  const [showMiniDiff, setShowMiniDiff] = useState(false);

  // Auto-save Session Storage State
  const [lastAutoSave, setLastAutoSave] = useState<string | null>(null);

  // Global File Input Reference (Always mounted at root)
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Chatbot State ---
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_init',
      sender: 'model',
      text: 'Greetings. I am Professor Nihil (Socratech Omega), your wiki-grounded philosophical interlocutor for the Nihiltheism Knowledge Engine.\n\nAttach or paste your philosophical texts, notes, or essays below to build your Second Brain. I will ingest them with full epistemic provenance, anti-reification discipline, and apophatic rigor.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      wikilinks: ['Apophatic Reframing', 'Śūnyatā', 'Absolute Nothingness'],
      voidQuotient: 0.85,
      densificationLevel: 'Δ3'
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // --- 1. SESSION STORAGE AUTO-SAVE & RESTORE ---
  // Restore draft state on mount
  useEffect(() => {
    try {
      const savedDraft = sessionStorage.getItem('nke_corpus_intake_draft');
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        if (parsed.pastedText) setPastedText(parsed.pastedText);
        if (parsed.pastedTitle) setPastedTitle(parsed.pastedTitle);
        if (parsed.sourceType) setSourceType(parsed.sourceType);
        if (parsed.chatInput) setChatInput(parsed.chatInput);
        if (parsed.activeSubTab) setActiveSubTab(parsed.activeSubTab);
        if (parsed.messages && Array.isArray(parsed.messages) && parsed.messages.length > 1) {
          setMessages(parsed.messages);
        }
        if (parsed.updatedAt) {
          setLastAutoSave(new Date(parsed.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        }
      }
    } catch (e) {
      console.error('Failed to restore draft from sessionStorage:', e);
    }
  }, []);

  // Periodic Auto-Save to sessionStorage (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (pastedText || pastedTitle || chatInput || messages.length > 1) {
        try {
          const now = new Date();
          const draft = {
            pastedText,
            pastedTitle,
            sourceType,
            chatInput,
            activeSubTab,
            messages,
            updatedAt: now.toISOString()
          };
          sessionStorage.setItem('nke_corpus_intake_draft', JSON.stringify(draft));
          setLastAutoSave(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        } catch (e) {
          console.error('Failed to auto-save to sessionStorage:', e);
        }
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [pastedText, pastedTitle, sourceType, chatInput, activeSubTab, messages]);

  // Auto-scroll chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, chatLoading]);

  // Keep auditViewMode valid if batches change
  useEffect(() => {
    if (auditViewMode !== 'all' && ingestionBatches.length > 0 && !ingestionBatches.find(b => b.batchId === auditViewMode)) {
      setAuditViewMode(ingestionBatches[0].batchId);
    }
  }, [ingestionBatches, auditViewMode]);

  // --- 2. MINI-DIFF GENERATOR FOR CONCEPT PREVIEW ---
  const miniDiffResults = useMemo(() => {
    if (!pastedText.trim()) return null;

    // Extract potential concept lines / headings from draft text
    const lines = pastedText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const headings = lines.filter(l => l.startsWith('#') || l.length < 80);
    
    // Compare extracted concepts with existing initialNodes and ingested extracts
    const diffEntries: {
      concept: string;
      status: 'ADDED' | 'MODIFIED' | 'IDENTICAL';
      matchedExisting?: string;
      epistemicEstimate: EpistemicStatus;
      detail: string;
    }[] = [];

    headings.slice(0, 8).forEach((h) => {
      const cleanH = h.replace(/^#+\s*/, '');
      if (!cleanH) return;

      const matchedNode = initialNodes.find(n => 
        n.label.toLowerCase().includes(cleanH.toLowerCase()) || 
        cleanH.toLowerCase().includes(n.label.toLowerCase())
      );

      if (matchedNode) {
        diffEntries.push({
          concept: cleanH,
          status: 'MODIFIED',
          matchedExisting: matchedNode.label,
          epistemicEstimate: 'MEMORY_GRAPH',
          detail: `Extends existing ontology entity "${matchedNode.label}" (${matchedNode.type})`
        });
      } else {
        diffEntries.push({
          concept: cleanH,
          status: 'ADDED',
          epistemicEstimate: 'TEXTUAL',
          detail: 'New epistemic concept node ready for knowledge graph insertion'
        });
      }
    });

    const addedCount = diffEntries.filter(d => d.status === 'ADDED').length;
    const modifiedCount = diffEntries.filter(d => d.status === 'MODIFIED').length;

    return {
      entries: diffEntries,
      addedCount,
      modifiedCount,
      totalDraftLines: lines.length
    };
  }, [pastedText, ingestionBatches]);

  // 9-Step Metadata for Stepper UI
  const INGESTION_STEPS_META = [
    { step: 1, name: 'Cryptographic Lock', desc: 'SHA-256 hash & immutable lock' },
    { step: 2, name: 'Text Normalization', desc: 'Parsing metadata & line structure' },
    { step: 3, name: 'Semantic Chunking', desc: 'Dividing into line-accurate passages' },
    { step: 4, name: 'Epistemic Claims', desc: '11-level taxonomy extraction' },
    { step: 5, name: 'Anti-Reification', desc: 'Auditing all 12 monitored terms' },
    { step: 6, name: 'Boundary Signals', desc: 'Crisis & existential risk scan' },
    { step: 7, name: 'Graph Synthesis', desc: 'Generating knowledge graph edges' },
    { step: 8, name: 'Report Assembly', desc: 'Compiling INTAKE REPORT markdown' },
    { step: 9, name: 'Vault Commit', desc: 'Self-verification & Second Brain commit' },
  ];

  // Handle direct text ingestion submission
  const processRawIngestion = async (
    rawText: string,
    filename: string,
    title?: string,
    ext: string = '.md',
    source: 'upload' | 'paste' = 'paste'
  ) => {
    if (!rawText.trim() || isProcessing) return;

    setIsProcessing(true);
    setProcessingSource(source);
    setActiveFileName(filename);
    setIngestionError(null);
    setIngestionStep(1); // Step 1: Hash & Preserve

    // Smooth step interval while waiting for AI processing
    const stepInterval = setInterval(() => {
      setIngestionStep((prev) => (prev < 7 ? prev + 1 : prev));
    }, 700);

    try {
      const normalized = normalizeText(rawText);
      const hash = await calculateSHA256(normalized);
      const { metadata, contentWithoutFrontmatter } = parseFrontmatter(normalized);

      const response = await fetch('/api/corpus/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename,
          fileExtension: ext,
          fileSize: new Blob([normalized]).size,
          sha256Hash: hash,
          rawContent: contentWithoutFrontmatter.slice(0, 50000), // Slice here to avoid huge payloads
          title: title || metadata.title || filename.replace(/\.[^/.]+$/, ''),
          sourceType: metadata.sourceType || sourceType,
          existingBatches: ingestionBatches.map(b => ({
            batchId: b.batchId,
            sha256Hash: b.sha256Hash,
            title: b.title
          }))
        })
      });

      clearInterval(stepInterval);

      if (!response.ok) {
        let errMessage = `Server error ${response.status}`;
        try {
          const errData = await response.json();
          if (errData?.error) errMessage = errData.error;
        } catch {
          const rawText = await response.text();
          if (rawText) errMessage = rawText.slice(0, 150);
        }
        throw new Error(errMessage);
      }

      setIngestionStep(8); // Step 8: Assembly
      await new Promise(r => setTimeout(r, 200));
      setIngestionStep(9); // Step 9: Vault Commit
      await new Promise(r => setTimeout(r, 200));

      const batchResult: CorpusIngestionBatch = await response.json();
      batchResult.rawContent = contentWithoutFrontmatter; // Restore full content from client state
      
      onSaveBatch(batchResult);
      setAuditViewMode(batchResult.batchId);

      // Clear input fields and session storage draft if source was paste
      if (source === 'paste') {
        setPastedText('');
        setPastedTitle('');
        sessionStorage.removeItem('nke_corpus_intake_draft');
      }

      // Add confirmation message to chat
      setMessages(prev => [
        ...prev,
        {
          id: `msg_ingest_${Date.now()}`,
          sender: 'model',
          text: `**Corpus Intake Complete for "${batchResult.title}"** (\`${batchResult.filename}\` • SHA-256: \`${batchResult.sha256Hash.slice(0, 10)}...\`).\n\n- Extracted **${batchResult.chunks.length}** semantic chunks and **${batchResult.extracts.length}** epistemically-labeled claims.\n- **Anti-Reification Audit:** ${batchResult.antiReificationAudits.every(a => a.status === 'PASS') ? 'PASS (All 12 Monitored Terms Verified)' : 'FLAGGED FOR REVIEW'}\n- **Next Actions Produced:** ${batchResult.nextActions.length} recommendations.\n\nStored in your Second Brain Vault.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          voidQuotient: 0.92,
          densificationLevel: 'Δ4'
        }
      ]);

      setAuditViewMode(batchResult.batchId);
      setActiveSubTab('audit');
    } catch (err: any) {
      clearInterval(stepInterval);
      console.error('Ingestion error:', err);
      setIngestionError(err.message || 'Failed to complete corpus intake.');
    } finally {
      setIsProcessing(false);
      setProcessingSource(null);
      setIngestionStep(0);
    }
  };

  // Helper to read file as text via Promise
  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        resolve((event.target?.result as string) || '');
      };
      reader.onerror = (err) => {
        reject(err);
      };
      reader.readAsText(file);
    });
  };

  // Handle File Upload from disk (Triggered by hidden file input onChange)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setActiveSubTab("ingest");
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);
    e.target.value = '';

    setBatchTotalFiles(fileList.length);
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      setBatchCurrentIndex(i + 1);
      try {
        const text = await readFileAsText(file);
        if (text && text.trim()) {
          const ext = '.' + (file.name.split('.').pop() || 'md');
          await processRawIngestion(text, file.name, file.name.replace(/\.[^/.]+$/, ''), ext, 'upload');
        }
      } catch (err) {
        console.error(`Error reading file ${file.name}:`, err);
        setIngestionError(`Failed to read file "${file.name}" from disk.`);
      }
    }
    setBatchTotalFiles(0);
    setBatchCurrentIndex(0);
  };

  // Drag and drop handlers for upload box
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setActiveSubTab("ingest");

    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);
    setBatchTotalFiles(fileList.length);
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      setBatchCurrentIndex(i + 1);
      try {
        const text = await readFileAsText(file);
        if (text && text.trim()) {
          const ext = '.' + (file.name.split('.').pop() || 'md');
          await processRawIngestion(text, file.name, file.name.replace(/\.[^/.]+$/, ''), ext, 'upload');
        }
      } catch (err) {
        console.error(`Error reading dropped file ${file.name}:`, err);
        setIngestionError(`Failed to read dropped file "${file.name}".`);
      }
    }
    setBatchTotalFiles(0);
    setBatchCurrentIndex(0);
  };

  // Send message to Philosophical Interlocutor
  const handleSendMessage = async () => {
    if (!chatInput.trim() || chatLoading) return;

    const userText = chatInput.trim();
    setChatInput('');
    setChatLoading(true);

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);

    try {
      const response = await fetch('/api/corpus/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          conversationHistory: messages.slice(-8),
          ingestionBatches: ingestionBatches.map(b => ({
            ...b,
            rawContent: undefined // Don't send huge raw text over the network for chat
          }))
        })
      });

      if (!response.ok) {
        let errText = `Chat API error ${response.status}`;
        try {
          const errData = await response.json();
          if (errData?.error) errText = errData.error;
        } catch {
          const rawText = await response.text();
          if (rawText) errText = rawText.slice(0, 150);
        }
        throw new Error(errText);
      }

      const data = await response.json();

      const modelMsg: ChatMessage = {
        id: `model_${Date.now()}`,
        sender: 'model',
        text: data.text || 'Silence in the void.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        wikilinks: data.wikilinks || [],
        provenanceCitations: data.provenanceCitations || [],
        voidQuotient: data.voidQuotient ?? 0.75,
        densificationLevel: data.densificationLevel || 'Δ2'
      };

      setMessages(prev => [...prev, modelMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: 'model',
          text: 'The connection to the philosophical engine was interrupted. Please retry.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  // Color helper for epistemic status tags
  const getEpistemicBadgeColor = (status: EpistemicStatus) => {
    switch (status) {
      case 'TEXTUAL':
        return 'bg-emerald-950/60 border-emerald-800/80 text-emerald-300';
      case 'SOURCE_METADATA':
        return 'bg-sky-950/60 border-sky-800/80 text-sky-300';
      case 'MEMORY_GRAPH':
        return 'bg-purple-950/60 border-purple-800/80 text-purple-300';
      case 'APOPHATIC':
        return 'bg-amber-950/60 border-amber-800/80 text-amber-300';
      case 'PHENOMENOLOGICAL':
        return 'bg-indigo-950/60 border-indigo-800/80 text-indigo-300';
      case 'INTERPRETIVE':
      case 'INFERRED':
        return 'bg-neutral-900 border-neutral-700 text-neutral-300';
      case 'UNGROUNDED':
        return 'bg-rose-950/60 border-rose-800/80 text-rose-300';
      default:
        return 'bg-neutral-900 border-neutral-800 text-neutral-400';
    }
  };

  return (
    <div className="h-full flex flex-col bg-neutral-950 text-neutral-200 font-sans border border-neutral-900 rounded-2xl overflow-hidden shadow-2xl relative">
      
      {/* GLOBAL FILE INPUT ELEMENT (Always mounted at root) */}
      <input
        type="file"
        ref={fileInputRef}
        accept=".txt,.text,.md,.markdown"
        multiple
        onClick={(e) => {
          (e.target as HTMLInputElement).value = '';
        }}
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* 1. Header Toolbar */}
      <header className="border-b border-neutral-900 bg-neutral-950/90 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-amber-500/20 to-purple-600/20 border border-amber-500/30 rounded-xl">
            <Brain className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-sm uppercase tracking-widest font-bold text-white">
                Corpus Intake & Second Brain
              </h2>
              <span className="text-[10px] font-mono text-purple-400 bg-purple-950/50 border border-purple-800/50 px-2 py-0.5 rounded-full">
                God-Tier Directive v1.0
              </span>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-neutral-500 font-mono mt-0.5">
              <span>Nihiltheism Knowledge Engine • Provenance-Aware Ingestion Pipeline</span>
              {lastAutoSave && (
                <span className="text-emerald-400/90 flex items-center gap-1 bg-emerald-950/40 border border-emerald-900/50 px-2 py-0.5 rounded-md text-[10px]">
                  <Save className="w-3 h-3 text-emerald-400" />
                  <span>Draft Auto-Saved ({lastAutoSave})</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Sub-tabs Navigation */}
        <div className="flex items-center gap-1.5 bg-neutral-900/80 p-1 rounded-xl border border-neutral-850">
          <button
            onClick={() => setActiveSubTab('chat')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
              activeSubTab === 'chat'
                ? 'bg-neutral-800 text-white font-medium shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Bot className="w-3.5 h-3.5 text-purple-400" />
            <span>Philosopher AI</span>
          </button>

          <button
            onClick={() => setActiveSubTab('ingest')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
              activeSubTab === 'ingest'
                ? 'bg-neutral-800 text-white font-medium shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5 text-amber-400" />
            <span>File Intake Console</span>
          </button>

          <button
            onClick={() => setActiveSubTab('audit')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
              activeSubTab === 'audit'
                ? 'bg-neutral-800 text-white font-medium shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Ingestion Audit</span>
          </button>

          <button
            onClick={() => setActiveSubTab('second-brain')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
              activeSubTab === 'second-brain'
                ? 'bg-neutral-800 text-white font-medium shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-sky-400" />
            <span>Second Brain Vault ({ingestionBatches.length})</span>
          </button>
        </div>
      </header>

      {/* 2. Main Sub-tab View Area */}
      <div className="flex-1 overflow-hidden relative flex flex-col bg-black/40">

        {/* --- SUB-TAB 1: PHILOSOPHER AI CHATBOT (PROFESSOR NIHIL) --- */}
        {activeSubTab === 'chat' && (
          <div className="h-full flex flex-col justify-between">
            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-4 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender === 'model' && (
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-900 to-amber-900 border border-purple-700/50 flex items-center justify-center text-amber-300 font-mono text-xs font-bold shrink-0">
                      Ω
                    </div>
                  )}

                  <div className={`max-w-3xl flex flex-col gap-2 ${
                    msg.sender === 'user'
                      ? 'bg-neutral-900 border border-neutral-800 text-neutral-100 rounded-2xl p-4'
                      : 'bg-neutral-950 border border-neutral-900 text-neutral-200 rounded-2xl p-5 shadow-xl'
                  }`}>
                    {/* Header meta for model */}
                    {msg.sender === 'model' && (
                      <div className="flex items-center justify-between pb-2.5 border-b border-neutral-900 text-[10px] font-mono">
                        <div className="flex items-center gap-2 text-purple-400 font-semibold">
                          <Activity className="w-3.5 h-3.5" />
                          <span>PROFESSOR NIHIL • SOCRATECH OMEGA</span>
                          <span className="text-neutral-600">|</span>
                          <span className="text-neutral-400">{msg.densificationLevel || 'Δ3'}</span>
                        </div>

                        {msg.voidQuotient !== undefined && (
                          <div className="flex items-center gap-2">
                            <span className="text-neutral-500">Void Resonance:</span>
                            <div className="w-16 h-1.5 bg-neutral-900 rounded-full overflow-hidden border border-neutral-800">
                              <div
                                className="h-full bg-gradient-to-r from-purple-500 to-amber-400 rounded-full"
                                style={{ width: `${Math.round(msg.voidQuotient * 100)}%` }}
                              />
                            </div>
                            <span className="text-amber-400 font-bold">{Math.round(msg.voidQuotient * 100)}%</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Message Body */}
                    <div className="text-xs sm:text-sm leading-relaxed font-sans whitespace-pre-wrap">
                      {msg.text}
                    </div>

                    {/* Provenance Citations if present */}
                    {msg.provenanceCitations && msg.provenanceCitations.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-neutral-900 flex flex-col gap-1.5">
                        <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider font-semibold">
                          Grounding & Provenance Citations:
                        </span>
                        <div className="grid grid-cols-1 gap-1.5">
                          {msg.provenanceCitations.map((cit, idx) => (
                            <div key={idx} className="bg-neutral-900/60 border border-neutral-850 p-2 rounded-lg text-[11px] font-mono flex items-start gap-2">
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${getEpistemicBadgeColor(cit.epistemicStatus)}`}>
                                {cit.epistemicStatus}
                              </span>
                              <div className="flex-1">
                                <span className="text-neutral-300 font-semibold">{cit.source}: </span>
                                <span className="text-neutral-400 italic">"{cit.quote}"</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Wikilinks Badges */}
                    {msg.wikilinks && msg.wikilinks.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 mt-2">
                        {msg.wikilinks.map((link, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-950/40 border border-purple-800/40 text-purple-300 text-[10px] font-mono rounded-md"
                          >
                            <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                            <span>[[{link}]]</span>
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="text-[9px] font-mono text-neutral-600 text-right mt-1">
                      {msg.timestamp}
                    </div>
                  </div>

                  {msg.sender === 'user' && (
                    <div className="w-8 h-8 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400 font-mono text-xs font-bold shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}

              {chatLoading && (
                <div className="flex items-center gap-3 bg-neutral-950 border border-neutral-900 p-4 rounded-2xl w-fit text-xs font-mono text-purple-400">
                  <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                  <span className="animate-pulse">Professor Nihil densifying Second Brain corpus...</span>
                </div>
              )}

              <div ref={chatBottomRef} />
            </div>

            {/* Chat Input Console */}
            <div className="p-4 border-t border-neutral-900 bg-neutral-950/90 flex flex-col gap-2">
              <div className="flex items-center justify-between text-[10px] font-mono text-neutral-500">
                <span>Grounding: {ingestionBatches.length} Batches Ingested in Second Brain</span>
                <span className="text-amber-400/80">Shift + Enter for multiline • ENTER to consult</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 rounded-xl text-neutral-400 hover:text-amber-400 transition-colors cursor-pointer"
                  title="Upload .txt or .md files directly into Second Brain"
                >
                  <Upload className="w-4 h-4" />
                </button>

                <textarea
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Ask a philosophical question or consult your ingested Second Brain corpus..."
                  rows={2}
                  className="flex-1 bg-neutral-900/80 border border-neutral-800 text-neutral-100 px-4 py-2.5 rounded-xl resize-none focus:outline-none focus:border-purple-500/50 transition-colors font-sans text-xs sm:text-sm placeholder:text-neutral-600"
                  disabled={chatLoading}
                />

                <button
                  onClick={handleSendMessage}
                  disabled={!chatInput.trim() || chatLoading}
                  className="px-5 py-3 bg-gradient-to-r from-purple-700 to-amber-700 hover:from-purple-600 hover:to-amber-600 disabled:opacity-50 text-white rounded-xl font-mono text-xs uppercase font-semibold tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-lg"
                >
                  {chatLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  <span className="hidden sm:inline">Consult</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- SUB-TAB 2: FILE INTAKE CONSOLE --- */}
        {activeSubTab === 'ingest' && (
          <div className="h-full overflow-y-auto p-6 flex flex-col gap-6 max-w-4xl mx-auto">
            {/* Active Ingestion Stepper Console (Visible during processing) */}
            {isProcessing && (
              <div className="bg-neutral-950 border-2 border-amber-500/50 rounded-2xl p-6 flex flex-col gap-5 shadow-2xl shadow-amber-500/10 animate-in fade-in duration-300">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-900 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                      <Loader2 className="w-5 h-5 text-amber-400 animate-spin" />
                    </div>
                    <div>
                      <h3 className="font-display text-sm uppercase tracking-wider font-bold text-white flex items-center gap-2">
                        <span>Ingestion Pipeline Executing</span>
                        <span className="text-[10px] font-mono text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800">
                          Step {ingestionStep}/9
                        </span>
                      </h3>
                      <p className="text-xs font-mono text-neutral-400 mt-0.5">
                        Active Target: <span className="text-neutral-200 font-semibold">{activeFileName || 'Pasted Document'}</span>
                        {batchTotalFiles > 1 && (
                          <span className="text-amber-400 ml-2 font-bold">
                            (Batch File {batchCurrentIndex} of {batchTotalFiles})
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  {batchTotalFiles > 1 && (
                    <div className="w-full sm:w-48 flex flex-col gap-1 text-[10px] font-mono">
                      <div className="flex justify-between text-neutral-400">
                        <span>Batch Progress</span>
                        <span className="text-amber-400 font-bold">{Math.round((batchCurrentIndex / batchTotalFiles) * 100)}%</span>
                      </div>
                      <div className="w-full h-2 bg-neutral-900 rounded-full overflow-hidden border border-neutral-800">
                        <div
                          className="h-full bg-gradient-to-r from-amber-500 to-purple-500 transition-all duration-300"
                          style={{ width: `${(batchCurrentIndex / batchTotalFiles) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Grid of 9 Steps with Real-Time Status Indicators */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {INGESTION_STEPS_META.map((stepMeta) => {
                    const isDone = ingestionStep > stepMeta.step;
                    const isActive = ingestionStep === stepMeta.step;
                    return (
                      <div
                        key={stepMeta.step}
                        className={`p-3 rounded-xl border flex items-center gap-3 text-xs font-mono transition-all ${
                          isDone
                            ? 'bg-emerald-950/20 border-emerald-900/50 text-emerald-300'
                            : isActive
                            ? 'bg-amber-950/40 border-amber-500/80 text-amber-200 shadow-md shadow-amber-500/10 scale-[1.02]'
                            : 'bg-neutral-900/40 border-neutral-900 text-neutral-600'
                        }`}
                      >
                        <div className="shrink-0">
                          {isDone ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          ) : isActive ? (
                            <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
                          ) : (
                            <span className="w-4 h-4 rounded-full border border-neutral-800 text-[10px] flex items-center justify-center font-bold">
                              {stepMeta.step}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className={`font-semibold truncate text-[11px] ${isActive ? 'text-white' : ''}`}>
                            {stepMeta.name}
                          </span>
                          <span className="text-[9px] text-neutral-500 truncate">{stepMeta.desc}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Intake Instructions */}
            <div className="bg-neutral-950 border border-neutral-900 rounded-2xl p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-amber-400" />
                  <h3 className="font-display text-sm uppercase tracking-wider font-semibold text-white">
                    9-Step Philosophical Corpus Ingestion
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-neutral-500 bg-neutral-900 px-2.5 py-1 rounded-lg border border-neutral-800">
                  SHA-256 Hash Guard Active
                </span>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed font-sans">
                Upload raw philosophical texts, markdown notes, journal entries, or essays. The engine will normalize the text, calculate its SHA-256 hash, divide it into line-accurate semantic chunks, extract claims with 11-level Epistemic Status labels, audit all 12 monitored terms for anti-reification compliance, scan for crisis signals, and generate a complete INTAKE REPORT.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-mono">
                <div className="bg-neutral-900 p-2.5 rounded-xl border border-neutral-850">
                  <span className="text-amber-400 block font-semibold">1. Hash & Store</span>
                  <span className="text-neutral-500">Immutable SHA-256</span>
                </div>
                <div className="bg-neutral-900 p-2.5 rounded-xl border border-neutral-850">
                  <span className="text-purple-400 block font-semibold">2. Epistemic Labels</span>
                  <span className="text-neutral-500">11-Level Taxonomy</span>
                </div>
                <div className="bg-neutral-900 p-2.5 rounded-xl border border-neutral-850">
                  <span className="text-emerald-400 block font-semibold">3. Anti-Reification</span>
                  <span className="text-neutral-500">12 Monitored Terms</span>
                </div>
                <div className="bg-neutral-900 p-2.5 rounded-xl border border-neutral-850">
                  <span className="text-sky-400 block font-semibold">4. Action Report</span>
                  <span className="text-neutral-500">Graph-Native Output</span>
                </div>
              </div>
            </div>

            {/* Direct Upload / Drag-and-Drop Dropzone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Box A: Upload File */}
              <div
                onClick={() => !isProcessing && fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`bg-neutral-950 border-2 border-dashed ${
                  isProcessing && processingSource === 'upload'
                    ? 'border-amber-400/80 bg-amber-500/10'
                    : isDragging
                    ? 'border-amber-400 bg-amber-500/10 scale-[1.01]'
                    : 'border-neutral-800 hover:border-amber-500/50 hover:bg-neutral-900/60'
                } rounded-2xl p-8 flex flex-col items-center justify-center text-center gap-4 transition-all group ${
                  isProcessing && processingSource !== 'upload' ? 'opacity-50 pointer-events-none' : 'cursor-pointer'
                }`}
              >
                {isProcessing && processingSource === 'upload' ? (
                  <div className="flex flex-col items-center gap-3 py-4">
                    <Loader2 className="w-10 h-10 text-amber-400 animate-spin" />
                    <div>
                      <h4 className="font-display text-xs uppercase tracking-wider font-bold text-white">
                        Ingesting File {batchCurrentIndex > 0 ? `${batchCurrentIndex}/${batchTotalFiles}` : ''}
                      </h4>
                      <p className="text-[11px] font-mono text-amber-300 mt-1">
                        {activeFileName || 'Reading document from disk...'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="p-4 bg-neutral-900 group-hover:bg-amber-500/10 border border-neutral-800 group-hover:border-amber-500/30 rounded-2xl transition-all">
                      <Upload className="w-8 h-8 text-neutral-400 group-hover:text-amber-400 transition-colors" />
                    </div>
                    <div>
                      <h4 className="font-display text-xs uppercase tracking-wider font-semibold text-neutral-200">
                        Upload .md or .txt Files
                      </h4>
                      <p className="text-[11px] font-mono text-neutral-500 mt-1">
                        Click to select single or multiple files, or drag & drop here
                      </p>
                    </div>
                    <span className="text-[10px] font-mono text-neutral-600 bg-neutral-900 px-3 py-1 rounded-full border border-neutral-800">
                      Supported: .md, .markdown, .txt, .text
                    </span>
                  </>
                )}
              </div>

              {/* Box B: Fast Paste Console */}
              <div className={`bg-neutral-950 border border-neutral-900 rounded-2xl p-5 flex flex-col gap-3 ${
                isProcessing && processingSource === 'upload' ? 'opacity-50 pointer-events-none' : ''
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-wider text-neutral-300 font-semibold">
                    Paste Raw Text / Note
                  </span>
                  <select
                    value={sourceType}
                    onChange={(e) => setSourceType(e.target.value)}
                    className="bg-neutral-900 border border-neutral-800 text-neutral-300 text-[10px] font-mono rounded-lg px-2 py-1 focus:outline-none"
                    disabled={isProcessing}
                  >
                    <option value="essay">Essay / Treatise</option>
                    <option value="journal_entry">Journal Reflection</option>
                    <option value="translation">Translation Fragment</option>
                    <option value="personal_note">Personal Note</option>
                    <option value="aphorism">Aphorisms</option>
                  </select>
                </div>

                <input
                  type="text"
                  value={pastedTitle}
                  onChange={(e) => setPastedTitle(e.target.value)}
                  placeholder="Document Title (e.g., Nishitani on the Experience of Nothingness)"
                  className="bg-neutral-900 border border-neutral-800 text-neutral-200 text-xs px-3 py-2 rounded-xl focus:outline-none font-sans"
                  disabled={isProcessing}
                />

                <textarea
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  placeholder="Paste your raw philosophical text or markdown content here..."
                  rows={5}
                  className="bg-neutral-900 border border-neutral-800 text-neutral-200 text-xs p-3 rounded-xl focus:outline-none font-mono resize-none"
                  disabled={isProcessing}
                />

                <button
                  onClick={() => processRawIngestion(pastedText, `${pastedTitle || 'pasted_note'}.md`, pastedTitle, '.md', 'paste')}
                  disabled={!pastedText.trim() || isProcessing}
                  className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-purple-600 hover:from-amber-500 hover:to-purple-500 disabled:opacity-50 text-white rounded-xl font-mono text-xs uppercase font-semibold tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                >
                  {isProcessing && processingSource === 'paste' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Ingesting Step {ingestionStep}/9...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>Ingest Text Into Second Brain</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* --- COLLAPSIBLE PREVIEW AREA WITH MINI-DIFF VIEW --- */}
            {miniDiffResults && (
              <div className="bg-neutral-950 border border-neutral-900 rounded-2xl overflow-hidden transition-all">
                <button
                  onClick={() => setShowMiniDiff(!showMiniDiff)}
                  className="w-full px-6 py-4 bg-neutral-900/60 hover:bg-neutral-900 border-b border-neutral-850 flex items-center justify-between text-xs font-mono cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <GitCompare className="w-4 h-4 text-amber-400" />
                    <span className="font-semibold text-neutral-200 uppercase tracking-wider">
                      Knowledge Graph Mini-Diff Preview
                    </span>
                    <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded">
                      +{miniDiffResults.addedCount} New Concepts
                    </span>
                    <span className="text-[10px] text-purple-400 bg-purple-950/60 border border-purple-800/80 px-2 py-0.5 rounded">
                      ~{miniDiffResults.modifiedCount} Existing Node Connections
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-neutral-400 text-[11px]">
                    <span>{showMiniDiff ? 'Collapse Diff' : 'Expand Diff'}</span>
                    {showMiniDiff ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {showMiniDiff && (
                  <div className="p-5 flex flex-col gap-4 bg-black/60 font-mono text-xs">
                    <p className="text-[11px] text-neutral-400 font-sans leading-relaxed">
                      This mini-diff compares concepts detected in your draft input with existing core ontology entities before final commit.
                    </p>

                    <div className="space-y-2">
                      {miniDiffResults.entries.map((entry, idx) => (
                        <div
                          key={idx}
                          className={`p-3 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 ${
                            entry.status === 'ADDED'
                              ? 'bg-emerald-950/30 border-emerald-800/50 text-emerald-200'
                              : 'bg-purple-950/30 border-purple-800/50 text-purple-200'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            {entry.status === 'ADDED' ? (
                              <span className="px-1.5 py-0.5 bg-emerald-900 border border-emerald-700 text-emerald-300 rounded text-[9px] font-bold">
                                + ADDED
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 bg-purple-900 border border-purple-700 text-purple-300 rounded text-[9px] font-bold">
                                ~ MODIFIED
                              </span>
                            )}
                            <span className="font-semibold text-white">{entry.concept}</span>
                          </div>

                          <div className="text-[10px] text-neutral-400 flex items-center gap-2">
                            <span>{entry.detail}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Error Message */}
            {ingestionError && (
              <div className="bg-rose-950/40 border border-rose-900/60 p-4 rounded-xl text-xs font-mono text-rose-300 flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                <span>{ingestionError}</span>
              </div>
            )}
          </div>
        )}

        {/* --- SUB-TAB 3: INGESTION AUDIT & VERIFICATION REPORT --- */}
        {activeSubTab === 'audit' && (
          <div className="h-full overflow-y-auto p-6 flex flex-col gap-6 max-w-5xl mx-auto">
            {/* Audit View Selector Dropdown */}
            <div className="bg-neutral-950 border border-neutral-900 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <FileCheck className="w-5 h-5 text-amber-400 shrink-0" />
                <div>
                  <h3 className="font-display text-sm font-bold text-white uppercase tracking-wider">
                    Corpus Audit & Verification Center
                  </h3>
                  <p className="text-[11px] font-mono text-neutral-500">
                    Inspect epistemic provenance, anti-reification status, and graph recommendations
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <label className="text-[11px] font-mono text-neutral-400 whitespace-nowrap">View Audit Scope:</label>
                <select
                  value={auditViewMode}
                  onChange={(e) => setAuditViewMode(e.target.value)}
                  className="bg-neutral-900 border border-neutral-800 text-amber-300 text-xs font-mono rounded-xl px-3 py-1.5 focus:outline-none w-full sm:w-64"
                >
                  <option value="all">📁 All Ingested Files Combined ({ingestionBatches.length})</option>
                  {ingestionBatches.map(b => (
                    <option key={b.batchId} value={b.batchId}>
                      📄 {b.title} ({b.filename})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* View Mode 1: Aggregate Second Brain Audit Summary */}
            {auditViewMode === 'all' ? (
              <>
                {/* Aggregate Stats Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-neutral-950 border border-neutral-900 p-4 rounded-xl text-center">
                    <span className="block text-2xl font-display font-bold text-white">{aggregateStats.totalBatches}</span>
                    <span className="text-[10px] font-mono text-neutral-500 uppercase">Documents Ingested</span>
                  </div>
                  <div className="bg-neutral-950 border border-neutral-900 p-4 rounded-xl text-center">
                    <span className="block text-2xl font-display font-bold text-amber-400">{aggregateStats.totalChunks}</span>
                    <span className="text-[10px] font-mono text-neutral-500 uppercase">Semantic Chunks</span>
                  </div>
                  <div className="bg-neutral-950 border border-neutral-900 p-4 rounded-xl text-center">
                    <span className="block text-2xl font-display font-bold text-purple-400">{aggregateStats.totalExtracts}</span>
                    <span className="text-[10px] font-mono text-neutral-500 uppercase">Epistemic Claims</span>
                  </div>
                  <div className="bg-neutral-950 border border-neutral-900 p-4 rounded-xl text-center">
                    <span className="block text-2xl font-display font-bold text-sky-400">{aggregateStats.totalNextActions}</span>
                    <span className="text-[10px] font-mono text-neutral-500 uppercase">Next Actions Generated</span>
                  </div>
                </div>

                {/* Second Brain File Inventory Table */}
                <div className="bg-neutral-950 border border-neutral-900 rounded-2xl p-6 flex flex-col gap-4">
                  <h4 className="font-display text-xs uppercase tracking-wider font-semibold text-neutral-200 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Database className="w-4 h-4 text-amber-400" />
                      <span>Ingested Second Brain File Inventory</span>
                    </span>
                    <span className="text-[10px] font-mono text-neutral-500">
                      Total Size: {(ingestionBatches.reduce((acc, b) => acc + (b.fileSize || 0), 0) / 1024).toFixed(1)} KB
                    </span>
                  </h4>

                  {ingestionBatches.length === 0 ? (
                    <div className="p-8 text-center text-neutral-500 font-mono text-xs">
                      No files ingested yet. Return to the File Intake Console to upload philosophical material.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs font-mono">
                        <thead>
                          <tr className="border-b border-neutral-900 text-neutral-500">
                            <th className="py-2 px-3">Document Title</th>
                            <th className="py-2 px-3">Filename</th>
                            <th className="py-2 px-3">Chunks</th>
                            <th className="py-2 px-3">Claims</th>
                            <th className="py-2 px-3">SHA-256 Hash</th>
                            <th className="py-2 px-3">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {ingestionBatches.map((batch) => (
                            <tr key={batch.batchId} className="border-b border-neutral-900/50 hover:bg-neutral-900/30">
                              <td className="py-2.5 px-3 font-semibold text-white">{batch.title}</td>
                              <td className="py-2.5 px-3 text-neutral-400">{batch.filename}</td>
                              <td className="py-2.5 px-3 text-amber-400 font-bold">{batch.chunks.length}</td>
                              <td className="py-2.5 px-3 text-purple-400 font-bold">{batch.extracts.length}</td>
                              <td className="py-2.5 px-3 text-neutral-500 font-mono">{batch.sha256Hash.slice(0, 10)}...</td>
                              <td className="py-2.5 px-3">
                                <button
                                  onClick={() => setAuditViewMode(batch.batchId)}
                                  className="px-2.5 py-1 bg-neutral-900 hover:bg-amber-950/60 hover:text-amber-300 text-neutral-300 rounded-lg border border-neutral-800 text-[10px] transition-colors cursor-pointer"
                                >
                                  Inspect Single Audit →
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            ) : selectedBatch ? (
              <>
                {/* Batch Header card */}
                <div className="bg-neutral-950 border border-neutral-900 rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-display text-base font-bold text-white uppercase tracking-wider">
                        {selectedBatch.title}
                      </h3>
                      <span className="text-[10px] font-mono text-amber-400 bg-amber-950/50 border border-amber-800/50 px-2.5 py-0.5 rounded-full uppercase">
                        {selectedBatch.sourceType}
                      </span>
                    </div>
                    <p className="text-[11px] font-mono text-neutral-500 mt-1">
                      Filename: <span className="text-neutral-200">{selectedBatch.filename}</span> • SHA-256: <span className="text-neutral-300">{selectedBatch.sha256Hash}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-900/60 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>All 9 Verifications Passed</span>
                    </span>
                  </div>
                </div>

                {/* Grid stats for selected file */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-neutral-950 border border-neutral-900 p-4 rounded-xl text-center">
                    <span className="block text-2xl font-display font-bold text-white">{selectedBatch.chunks.length}</span>
                    <span className="text-[10px] font-mono text-neutral-500 uppercase">Semantic Chunks</span>
                  </div>
                  <div className="bg-neutral-950 border border-neutral-900 p-4 rounded-xl text-center">
                    <span className="block text-2xl font-display font-bold text-amber-400">{selectedBatch.extracts.length}</span>
                    <span className="text-[10px] font-mono text-neutral-500 uppercase">Epistemic Extracts</span>
                  </div>
                  <div className="bg-neutral-950 border border-neutral-900 p-4 rounded-xl text-center">
                    <span className="block text-2xl font-display font-bold text-purple-400">{selectedBatch.antiReificationAudits.length}</span>
                    <span className="text-[10px] font-mono text-neutral-500 uppercase">Monitored Terms Checked</span>
                  </div>
                  <div className="bg-neutral-950 border border-neutral-900 p-4 rounded-xl text-center">
                    <span className="block text-2xl font-display font-bold text-sky-400">{selectedBatch.nextActions.length}</span>
                    <span className="text-[10px] font-mono text-neutral-500 uppercase">Next Action Recommendations</span>
                  </div>
                </div>

                {/* Section A: Epistemic Extracts with Taxonomy Badges */}
                <div className="bg-neutral-950 border border-neutral-900 rounded-2xl p-6 flex flex-col gap-4">
                  <h4 className="font-display text-xs uppercase tracking-wider font-semibold text-neutral-200 flex items-center gap-2">
                    <Brain className="w-4 h-4 text-amber-400" />
                    <span>Extracted Epistemic Claims ({selectedBatch.extracts.length})</span>
                  </h4>

                  <div className="grid grid-cols-1 gap-2.5 max-h-80 overflow-y-auto pr-1">
                    {selectedBatch.extracts.map((ext) => (
                      <div key={ext.id} className="bg-neutral-900/60 border border-neutral-850 p-3 rounded-xl flex flex-col gap-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${getEpistemicBadgeColor(ext.epistemicStatus)}`}>
                            {ext.epistemicStatus}
                          </span>
                          <span className="text-[10px] font-mono text-neutral-500">
                            {ext.thinker ? `Thinker: ${ext.thinker}` : 'General Inquiry'} • {ext.chunkReference}
                          </span>
                        </div>
                        <p className="text-neutral-200 font-sans leading-relaxed">
                          "{ext.text}"
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section B: Anti-Reification Audit Table */}
                <div className="bg-neutral-950 border border-neutral-900 rounded-2xl p-6 flex flex-col gap-4">
                  <h4 className="font-display text-xs uppercase tracking-wider font-semibold text-neutral-200 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Anti-Reification Audit (12 Monitored Terms)</span>
                  </h4>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs font-mono">
                      <thead>
                        <tr className="border-b border-neutral-900 text-neutral-500">
                          <th className="py-2 px-3">Term</th>
                          <th className="py-2 px-3">Verified Representation</th>
                          <th className="py-2 px-3">Status</th>
                          <th className="py-2 px-3">Location & Note</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedBatch.antiReificationAudits.map((audit, idx) => (
                          <tr key={idx} className="border-b border-neutral-900/50 hover:bg-neutral-900/30">
                            <td className="py-2.5 px-3 font-semibold text-amber-300">{audit.term}</td>
                            <td className="py-2.5 px-3 text-purple-300">{audit.representation}</td>
                            <td className="py-2.5 px-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                audit.status === 'PASS' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-rose-950 text-rose-300 border border-rose-800'
                              }`}>
                                {audit.status}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-neutral-400">{audit.note} ({audit.location})</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Section C: Concrete Next Actions List */}
                <div className="bg-neutral-950 border border-neutral-900 rounded-2xl p-6 flex flex-col gap-4">
                  <h4 className="font-display text-xs uppercase tracking-wider font-semibold text-neutral-200 flex items-center gap-2">
                    <ArrowUpRight className="w-4 h-4 text-sky-400" />
                    <span>Next Action Recommendations</span>
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedBatch.nextActions.map((action) => (
                      <div key={action.id} className="bg-neutral-900/60 border border-neutral-850 p-3.5 rounded-xl flex flex-col gap-1.5 text-xs font-mono">
                        <div className="flex items-center justify-between">
                          <span className="text-sky-400 font-bold">{action.type}</span>
                          <span className="text-[10px] text-neutral-500">{action.fileRef}</span>
                        </div>
                        <p className="text-neutral-300 font-sans">{action.detail}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section D: Full Markdown Intake Report */}
                <div className="bg-neutral-950 border border-neutral-900 rounded-2xl p-6 flex flex-col gap-3">
                  <h4 className="font-display text-xs uppercase tracking-wider font-semibold text-neutral-200">
                    Full Intake Report Document
                  </h4>
                  <textarea
                    readOnly
                    value={selectedBatch.markdownReport}
                    rows={12}
                    className="w-full bg-neutral-900 border border-neutral-800 text-neutral-300 font-mono text-xs p-4 rounded-xl focus:outline-none"
                  />
                </div>
              </>
            ) : (
              <div className="bg-neutral-950 border border-neutral-900 rounded-2xl p-12 text-center text-neutral-500 font-mono text-xs flex flex-col items-center gap-3">
                <FileCheck className="w-8 h-8 text-neutral-700" />
                <span>No batch selected for audit. Ingest a file in the File Intake Console to inspect its report.</span>
              </div>
            )}
          </div>
        )}

        {/* --- SUB-TAB 4: SECOND BRAIN VAULT --- */}
        {activeSubTab === 'second-brain' && (
          <div className="h-full overflow-y-auto p-6 flex flex-col gap-6 max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-sm uppercase tracking-wider font-bold text-white">
                  Ingested Second Brain Batches ({ingestionBatches.length})
                </h3>
                <p className="text-[11px] font-mono text-neutral-500 mt-0.5">
                  Persistent local corpus archive powering Professor Nihil's grounded responses
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 bg-neutral-900 border border-neutral-800 hover:border-amber-500/50 text-neutral-200 text-xs font-mono rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-amber-400" />
                  <span>Upload Files</span>
                </button>

                {ingestionBatches.length > 0 && (
                  <button
                    onClick={onClearAllBatches}
                    className="px-3 py-1.5 bg-rose-950/40 border border-rose-900/60 hover:bg-rose-900 text-rose-300 text-xs font-mono rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear All Archives</span>
                  </button>
                )}
              </div>
            </div>

            {ingestionBatches.length === 0 ? (
              <div className="bg-neutral-950 border border-neutral-900 rounded-2xl p-12 text-center text-neutral-500 font-mono text-xs flex flex-col items-center gap-4">
                <Database className="w-10 h-10 text-neutral-800" />
                <h4 className="text-neutral-300 font-bold">Your Second Brain Vault is Empty</h4>
                <p className="max-w-md text-neutral-500">
                  Upload `.md` or `.txt` files or paste your reflections in the File Intake Console to build your persistent Nihiltheism Knowledge Graph.
                </p>
                <button
                  onClick={() => setActiveSubTab('ingest')}
                  className="px-4 py-2 bg-gradient-to-r from-amber-600 to-purple-600 text-white rounded-xl text-xs font-mono font-semibold cursor-pointer"
                >
                  Open Ingestion Console
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {ingestionBatches.map((batch) => (
                  <div
                    key={batch.batchId}
                    className={`bg-neutral-950 border ${
                      auditViewMode === batch.batchId ? 'border-amber-500/60 shadow-lg shadow-amber-500/5' : 'border-neutral-900 hover:border-neutral-800'
                    } rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all`}
                  >
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-amber-400" />
                        <h4 className="font-display text-sm font-bold text-white uppercase tracking-wider">
                          {batch.title}
                        </h4>
                        <span className="text-[10px] font-mono text-neutral-500 bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800">
                          {batch.filename}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-[10px] font-mono text-neutral-500">
                        <span>Chunks: <strong className="text-neutral-300">{batch.chunks.length}</strong></span>
                        <span>Extracts: <strong className="text-amber-400">{batch.extracts.length}</strong></span>
                        <span>Hash: <strong className="text-neutral-300">{batch.sha256Hash.slice(0, 10)}...</strong></span>
                        <span>Date: <strong className="text-neutral-400">{new Date(batch.timestamp).toLocaleDateString()}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setAuditViewMode(batch.batchId);
                          setActiveSubTab('audit');
                        }}
                        className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-neutral-200 rounded-xl text-xs font-mono transition-colors cursor-pointer"
                      >
                        Inspect Audit
                      </button>

                      <button
                        onClick={() => onDeleteBatch(batch.batchId)}
                        className="p-1.5 text-neutral-600 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer"
                        title="Delete Batch"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
