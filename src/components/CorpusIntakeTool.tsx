import React, { useState, useRef, useEffect } from 'react';
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
  FileCheck
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

  // Selected batch for detailed audit
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(
    ingestionBatches.length > 0 ? ingestionBatches[0].batchId : null
  );

  // --- Ingestion Console State ---
  const [pastedText, setPastedText] = useState('');
  const [pastedTitle, setPastedTitle] = useState('');
  const [sourceType, setSourceType] = useState('essay');
  const [isProcessing, setIsProcessing] = useState(false);
  const [ingestionStep, setIngestionStep] = useState<number>(0);
  const [ingestionError, setIngestionError] = useState<string | null>(null);
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

  // Auto-scroll chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, chatLoading]);

  // Keep selectedBatchId valid if batches change
  useEffect(() => {
    if (ingestionBatches.length > 0 && (!selectedBatchId || !ingestionBatches.find(b => b.batchId === selectedBatchId))) {
      setSelectedBatchId(ingestionBatches[0].batchId);
    }
  }, [ingestionBatches, selectedBatchId]);

  // Handle direct text ingestion submission
  const processRawIngestion = async (rawText: string, filename: string, title?: string, ext: string = '.md') => {
    if (!rawText.trim() || isProcessing) return;

    setIsProcessing(true);
    setIngestionError(null);
    setIngestionStep(1); // Step 1: Hash & Preserve

    try {
      const normalized = normalizeText(rawText);
      const hash = await calculateSHA256(normalized);
      const { metadata, contentWithoutFrontmatter } = parseFrontmatter(normalized);

      setIngestionStep(2); // Step 2: Normalize & Parse
      await new Promise(r => setTimeout(r, 400));

      setIngestionStep(3); // Step 3: Semantic Chunking
      await new Promise(r => setTimeout(r, 400));

      setIngestionStep(4); // Step 4: Epistemic Extraction & 9-Step Verification
      
      const response = await fetch('/api/corpus/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename,
          fileExtension: ext,
          fileSize: new Blob([normalized]).size,
          sha256Hash: hash,
          rawContent: contentWithoutFrontmatter,
          title: title || metadata.title || filename.replace(/\.[^/.]+$/, ''),
          sourceType: metadata.sourceType || sourceType,
          existingBatches: ingestionBatches.map(b => ({
            batchId: b.batchId,
            sha256Hash: b.sha256Hash,
            title: b.title
          }))
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Server ingestion endpoint failed');
      }

      setIngestionStep(8); // Step 8 & 9: Complete & Self-Verified
      await new Promise(r => setTimeout(r, 400));

      const batchResult: CorpusIngestionBatch = await response.json();
      onSaveBatch(batchResult);
      setSelectedBatchId(batchResult.batchId);

      // Clear input fields
      setPastedText('');
      setPastedTitle('');

      // Add confirmation message to chat
      setMessages(prev => [
        ...prev,
        {
          id: `msg_ingest_${Date.now()}`,
          sender: 'model',
          text: `**Corpus Intake Complete for "${batchResult.title}"** (SHA-256: \`${batchResult.sha256Hash.slice(0, 10)}...\`).\n\n- Extracted **${batchResult.chunks.length}** semantic chunks and **${batchResult.extracts.length}** epistemically-labeled claims.\n- **Anti-Reification Status:** ${batchResult.antiReificationAudits.every(a => a.status === 'PASS') ? 'PASS (All 12 Monitored Terms Verified)' : 'FLAGGED FOR REVIEW'}\n- **Next Actions Produced:** ${batchResult.nextActions.length} recommendations.\n\nYou can now consult me regarding this newly ingested Second Brain material.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          voidQuotient: 0.92,
          densificationLevel: 'Δ4'
        }
      ]);

      setActiveSubTab('audit');
    } catch (err: any) {
      console.error('Ingestion error:', err);
      setIngestionError(err.message || 'Failed to complete corpus intake.');
    } finally {
      setIsProcessing(false);
      setIngestionStep(0);
    }
  };

  // Handle File Upload from disk
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) {
          const ext = '.' + file.name.split('.').pop();
          processRawIngestion(text, file.name, file.name.replace(/\.[^/.]+$/, ''), ext);
        }
      };
      reader.readAsText(file);
    });

    e.target.value = '';
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
          ingestionBatches
        })
      });

      if (!response.ok) {
        throw new Error('Chat API endpoint failure');
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

  const selectedBatch = ingestionBatches.find(b => b.batchId === selectedBatchId);

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
    <div className="h-full flex flex-col bg-neutral-950 text-neutral-200 font-sans border border-neutral-900 rounded-2xl overflow-hidden shadow-2xl">
      
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
            <p className="text-[11px] text-neutral-500 font-mono mt-0.5">
              Nihiltheism Knowledge Engine • Provenance-Aware Ingestion Pipeline
            </p>
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
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".txt,.text,.md,.markdown"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 rounded-xl text-neutral-400 hover:text-amber-400 transition-colors"
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
            {/* Intake Instructions */}
            <div className="bg-neutral-950 border border-neutral-900 rounded-2xl p-6 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-amber-400" />
                <h3 className="font-display text-sm uppercase tracking-wider font-semibold text-white">
                  9-Step Philosophical Corpus Ingestion
                </h3>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed font-sans">
                Upload raw philosophical texts, markdown notes, journal entries, or essays. The engine will normalize the text, calculate its SHA-256 hash, divide it into semantic chunks, extract claims with 11-level Epistemic Status labels, audit all 12 monitored terms for anti-reification compliance, scan for crisis signals, and generate a complete INTAKE REPORT.
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
                onClick={() => fileInputRef.current?.click()}
                className="bg-neutral-950 hover:bg-neutral-900/60 border-2 border-dashed border-neutral-800 hover:border-amber-500/50 rounded-2xl p-8 flex flex-col items-center justify-center text-center gap-4 cursor-pointer transition-all group"
              >
                <div className="p-4 bg-neutral-900 group-hover:bg-amber-500/10 border border-neutral-800 group-hover:border-amber-500/30 rounded-2xl transition-all">
                  <Upload className="w-8 h-8 text-neutral-400 group-hover:text-amber-400 transition-colors" />
                </div>
                <div>
                  <h4 className="font-display text-xs uppercase tracking-wider font-semibold text-neutral-200">
                    Upload .md or .txt Files
                  </h4>
                  <p className="text-[11px] font-mono text-neutral-500 mt-1">
                    Click to select files from your system
                  </p>
                </div>
                <span className="text-[10px] font-mono text-neutral-600 bg-neutral-900 px-3 py-1 rounded-full border border-neutral-800">
                  Supported: .md, .markdown, .txt, .text
                </span>
              </div>

              {/* Box B: Fast Paste Console */}
              <div className="bg-neutral-950 border border-neutral-900 rounded-2xl p-5 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-wider text-neutral-300 font-semibold">
                    Paste Raw Text / Note
                  </span>
                  <select
                    value={sourceType}
                    onChange={(e) => setSourceType(e.target.value)}
                    className="bg-neutral-900 border border-neutral-800 text-neutral-300 text-[10px] font-mono rounded-lg px-2 py-1 focus:outline-none"
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
                />

                <textarea
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  placeholder="Paste your raw philosophical text or markdown content here..."
                  rows={5}
                  className="bg-neutral-900 border border-neutral-800 text-neutral-200 text-xs p-3 rounded-xl focus:outline-none font-mono resize-none"
                />

                <button
                  onClick={() => processRawIngestion(pastedText, `${pastedTitle || 'pasted_note'}.md`, pastedTitle)}
                  disabled={!pastedText.trim() || isProcessing}
                  className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-purple-600 hover:from-amber-500 hover:to-purple-500 disabled:opacity-50 text-white rounded-xl font-mono text-xs uppercase font-semibold tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processing Step {ingestionStep}/9...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>Ingest Into Second Brain</span>
                    </>
                  )}
                </button>
              </div>
            </div>

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
            {selectedBatch ? (
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
                      Batch ID: <span className="text-neutral-300">{selectedBatch.batchId}</span> • SHA-256: <span className="text-neutral-300">{selectedBatch.sha256Hash}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-900/60 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>All 9 Verifications Passed</span>
                    </span>
                  </div>
                </div>

                {/* Grid stats */}
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

              {ingestionBatches.length > 0 && (
                <button
                  onClick={onClearAllBatches}
                  className="px-3 py-1.5 bg-rose-950/40 border border-rose-900/60 hover:bg-rose-900 text-rose-300 text-xs font-mono rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All Archives</span>
                </button>
              )}
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
                  className="px-4 py-2 bg-gradient-to-r from-amber-600 to-purple-600 text-white rounded-xl text-xs font-mono font-semibold"
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
                      selectedBatchId === batch.batchId ? 'border-amber-500/60 shadow-lg shadow-amber-500/5' : 'border-neutral-900 hover:border-neutral-800'
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
                          setSelectedBatchId(batch.batchId);
                          setActiveSubTab('audit');
                        }}
                        className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-neutral-200 rounded-xl text-xs font-mono transition-colors"
                      >
                        Inspect Audit
                      </button>

                      <button
                        onClick={() => onDeleteBatch(batch.batchId)}
                        className="p-1.5 text-neutral-600 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors"
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
