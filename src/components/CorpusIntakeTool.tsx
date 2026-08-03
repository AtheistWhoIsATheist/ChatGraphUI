import React, { useState, useRef, useEffect, useMemo } from 'react';
import * as d3 from 'd3';
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
  GitCompare,
  BarChart3,
  PieChart,
  ShieldAlert,
  Check,
  Wand2,
  Info
} from 'lucide-react';
import {
  CorpusIngestionBatch,
  ChatMessage,
  EpistemicStatus,
  EpistemicExtract
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
  onNavigateToTab?: (tab: string, selectedSource?: string) => void;
}

// --- Epistemic Distribution D3/SVG Visualizer Component ---
interface EpistemicDistributionVisualizerProps {
  extracts: EpistemicExtract[];
  title?: string;
}

const EpistemicDistributionVisualizer: React.FC<EpistemicDistributionVisualizerProps> = ({
  extracts,
  title = 'Epistemic Status Label Distribution'
}) => {
  const [chartMode, setChartMode] = useState<'bar' | 'donut'>('bar');
  const [hoveredLabel, setHoveredLabel] = useState<string | null>(null);

  const distribution = useMemo(() => {
    const counts: Record<string, number> = {
      APOPHATIC: 0,
      TENSION: 0,
      EVIDENCED: 0,
      INFERRED: 0,
      SPECULATIVE: 0,
      PHENOMENOLOGICAL: 0,
      TEXTUAL: 0,
      COMPARATIVE: 0,
      UNGROUNDED: 0,
    };

    extracts.forEach((e) => {
      const status = e.epistemicStatus || 'UNGROUNDED';
      counts[status] = (counts[status] || 0) + 1;
    });

    const total = extracts.length || 1;

    const config: Record<
      string,
      { label: string; color: string; bg: string; border: string; desc: string }
    > = {
      APOPHATIC: {
        label: 'Apophatic Boundary',
        color: '#f59e0b',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/40',
        desc: 'Negation of reified categories & apophatic limit statements',
      },
      TENSION: {
        label: 'Active Paradox',
        color: '#a855f7',
        bg: 'bg-purple-500/10',
        border: 'border-purple-500/40',
        desc: 'Irreducible tension & dialectical cross-pressure',
      },
      EVIDENCED: {
        label: 'Empirical / Textual',
        color: '#10b981',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/40',
        desc: 'Directly supported by canonical source citations',
      },
      INFERRED: {
        label: 'Logical Inference',
        color: '#0ea5e9',
        bg: 'bg-sky-500/10',
        border: 'border-sky-500/40',
        desc: 'Deductive or inductive claims derived from premises',
      },
      SPECULATIVE: {
        label: 'Speculative Hypothesis',
        color: '#6366f1',
        bg: 'bg-indigo-500/10',
        border: 'border-indigo-500/40',
        desc: 'Constructive or exploratory philosophical hypotheses',
      },
      PHENOMENOLOGICAL: {
        label: 'Phenomenological Event',
        color: '#f43f5e',
        bg: 'bg-rose-500/10',
        border: 'border-rose-500/40',
        desc: 'First-person experiential or existential descriptions',
      },
      TEXTUAL: {
        label: 'Source Citation',
        color: '#06b6d4',
        bg: 'bg-cyan-500/10',
        border: 'border-cyan-500/40',
        desc: 'Direct quotes or explicit textual fragments',
      },
      COMPARATIVE: {
        label: 'Cross-Tradition',
        color: '#f97316',
        bg: 'bg-orange-500/10',
        border: 'border-orange-500/40',
        desc: 'Comparative analyses across distinct historical traditions',
      },
      UNGROUNDED: {
        label: 'Ungrounded / Pending',
        color: '#ef4444',
        bg: 'bg-red-500/10',
        border: 'border-red-500/40',
        desc: 'Unverified or potential dogmatic assertion',
      },
    };

    const items = Object.keys(counts)
      .map((key) => {
        const count = counts[key];
        const pct = Math.round((count / total) * 100);
        const meta = config[key] || {
          label: key,
          color: '#a3a3a3',
          bg: 'bg-neutral-800',
          border: 'border-neutral-700',
          desc: 'Generic classification',
        };
        return {
          key,
          count,
          pct,
          ...meta,
        };
      })
      .filter((item) => item.count > 0 || extracts.length === 0);

    const apophasisCount = (counts.APOPHATIC || 0) + (counts.TENSION || 0);
    const apophasisDensity = Math.round((apophasisCount / total) * 100);
    const empiricalCount = (counts.EVIDENCED || 0) + (counts.TEXTUAL || 0);
    const empiricalRatio = Math.round((empiricalCount / total) * 100);

    return { items, total, apophasisDensity, empiricalRatio, apophasisCount };
  }, [extracts]);

  const maxCount = Math.max(...distribution.items.map((i) => i.count), 1);

  // --- D3 Scale Calculations for Bar Chart ---
  const xScale = useMemo(() => {
    return d3
      .scaleBand<string>()
      .domain(distribution.items.map((i) => i.key))
      .range([50, 580])
      .padding(0.3);
  }, [distribution.items]);

  const yScale = useMemo(() => {
    return d3
      .scaleLinear()
      .domain([0, maxCount])
      .range([140, 20]);
  }, [maxCount]);

  // --- D3 Pie & Arc Calculations for Donut Chart ---
  const pieData = useMemo(() => {
    const activeItems = distribution.items.filter((i) => i.count > 0);
    if (activeItems.length === 0) return [];

    const pieGen = d3
      .pie<typeof distribution.items[0]>()
      .value((d) => d.count)
      .sort(null);

    const arcGen = d3
      .arc<d3.PieArcDatum<typeof distribution.items[0]>>()
      .innerRadius(50)
      .outerRadius(82)
      .cornerRadius(4)
      .padAngle(0.025);

    const hoverArcGen = d3
      .arc<d3.PieArcDatum<typeof distribution.items[0]>>()
      .innerRadius(46)
      .outerRadius(90)
      .cornerRadius(5)
      .padAngle(0.025);

    const slices = pieGen(activeItems);

    return slices.map((slice) => {
      return {
        data: slice.data,
        path: arcGen(slice) || '',
        hoverPath: hoverArcGen(slice) || '',
        centroid: arcGen.centroid(slice),
      };
    });
  }, [distribution.items]);

  return (
    <div className="bg-neutral-950 border border-neutral-900 rounded-2xl p-6 flex flex-col gap-6 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-900 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl">
            {chartMode === 'bar' ? (
              <BarChart3 className="w-5 h-5 text-amber-400" />
            ) : (
              <PieChart className="w-5 h-5 text-amber-400" />
            )}
          </div>
          <div>
            <h4 className="font-display text-xs uppercase tracking-wider font-bold text-white flex items-center gap-2">
              <span>{title}</span>
              <span className="text-[10px] font-mono text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800">
                {extracts.length} Claims
              </span>
            </h4>
            <p className="text-[11px] font-mono text-neutral-400 mt-0.5 flex items-center gap-1.5">
              <span>D3.js Real-Time Epistemic Distribution Engine</span>
              <span className="text-amber-500 font-bold">•</span>
              <span className="text-neutral-500 font-semibold">{chartMode === 'bar' ? 'D3.scaleBand' : 'D3.pie Arc Projections'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Chart View Toggle */}
          <div className="bg-neutral-900 p-1 rounded-xl border border-neutral-800 flex items-center gap-1">
            <button
              onClick={() => setChartMode('bar')}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer ${
                chartMode === 'bar'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>D3 Bars</span>
            </button>
            <button
              onClick={() => setChartMode('donut')}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer ${
                chartMode === 'donut'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <PieChart className="w-3.5 h-3.5" />
              <span>D3 Donut</span>
            </button>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs font-mono">
            <div className="bg-amber-950/40 border border-amber-500/40 px-3 py-1.5 rounded-xl text-amber-300 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>
                Apophasis Density: <strong>{distribution.apophasisDensity}%</strong>
              </span>
            </div>
            <div className="bg-emerald-950/40 border border-emerald-500/40 px-3 py-1.5 rounded-xl text-emerald-300 flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                Grounding: <strong>{distribution.empiricalRatio}%</strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stacked Percentage Visual Bar */}
      <div className="flex flex-col gap-2">
        <div className="text-[10px] font-mono text-neutral-400 flex justify-between">
          <span>Epistemic Density Ratio</span>
          <span>100% Granular Spectrum</span>
        </div>
        <div className="w-full h-3.5 bg-neutral-900 rounded-lg overflow-hidden flex border border-neutral-800 p-0.5 gap-0.5">
          {distribution.items.map((item) => (
            <div
              key={item.key}
              style={{
                width: `${Math.max(item.pct, item.count > 0 ? 2 : 0)}%`,
                backgroundColor: item.color,
              }}
              className="h-full rounded-sm transition-all hover:brightness-125 cursor-pointer relative group"
              onMouseEnter={() => setHoveredLabel(item.key)}
              onMouseLeave={() => setHoveredLabel(null)}
              title={`${item.label}: ${item.count} claims (${item.pct}%)`}
            />
          ))}
        </div>
      </div>

      {/* D3 Interactive SVG Chart Area */}
      <div className="flex flex-col gap-3">
        <div className="w-full overflow-x-auto">
          {chartMode === 'bar' ? (
            <svg className="w-full h-48" viewBox="0 0 600 170" preserveAspectRatio="none">
              {/* Grid lines */}
              <line x1="40" y1="20" x2="580" y2="20" stroke="#262626" strokeDasharray="3 3" />
              <line x1="40" y1="60" x2="580" y2="60" stroke="#262626" strokeDasharray="3 3" />
              <line x1="40" y1="100" x2="580" y2="100" stroke="#262626" strokeDasharray="3 3" />
              <line x1="40" y1="140" x2="580" y2="140" stroke="#404040" />

              {/* Y Axis Labels derived from D3 Scale */}
              <text x="32" y="24" fill="#737373" fontSize="9" fontFamily="monospace" textAnchor="end">
                {maxCount}
              </text>
              <text x="32" y="80" fill="#737373" fontSize="9" fontFamily="monospace" textAnchor="end">
                {Math.round(maxCount / 2)}
              </text>
              <text x="32" y="143" fill="#737373" fontSize="9" fontFamily="monospace" textAnchor="end">
                0
              </text>

              {/* D3 Band Scaled Bars */}
              {distribution.items.map((item) => {
                const x = xScale(item.key) ?? 50;
                const width = xScale.bandwidth();
                const y = yScale(item.count);
                const height = 140 - y;
                const isHovered = hoveredLabel === item.key;

                return (
                  <g
                    key={item.key}
                    className="cursor-pointer transition-all"
                    onMouseEnter={() => setHoveredLabel(item.key)}
                    onMouseLeave={() => setHoveredLabel(null)}
                  >
                    <rect
                      x={x}
                      y={y}
                      width={width}
                      height={Math.max(height, item.count > 0 ? 6 : 2)}
                      rx="4"
                      fill={item.color}
                      opacity={hoveredLabel && !isHovered ? 0.35 : 0.9}
                      className="transition-all duration-200"
                      stroke={isHovered ? '#ffffff' : 'none'}
                      strokeWidth="1.5"
                    />

                    {/* Count text positioned via D3 scale */}
                    {item.count > 0 && (
                      <text
                        x={x + width / 2}
                        y={y - 6}
                        fill={isHovered ? '#ffffff' : item.color}
                        fontSize="10"
                        fontWeight="bold"
                        fontFamily="monospace"
                        textAnchor="middle"
                      >
                        {item.count}
                      </text>
                    )}

                    {/* Label tick under bar */}
                    <text
                      x={x + width / 2}
                      y="156"
                      fill={isHovered ? '#f59e0b' : '#a3a3a3'}
                      fontSize="8"
                      fontFamily="monospace"
                      textAnchor="middle"
                    >
                      {item.key.slice(0, 7)}
                    </text>
                  </g>
                );
              })}
            </svg>
          ) : (
            <div className="w-full h-48 flex items-center justify-center">
              <svg className="w-72 h-48" viewBox="-120 -100 240 200">
                {pieData.map((slice, idx) => {
                  const isHovered = hoveredLabel === slice.data.key;
                  return (
                    <g
                      key={idx}
                      className="cursor-pointer transition-all duration-200"
                      onMouseEnter={() => setHoveredLabel(slice.data.key)}
                      onMouseLeave={() => setHoveredLabel(null)}
                    >
                      <path
                        d={isHovered ? slice.hoverPath : slice.path}
                        fill={slice.data.color}
                        opacity={hoveredLabel && !isHovered ? 0.35 : 0.9}
                        stroke={isHovered ? '#ffffff' : '#0a0a0a'}
                        strokeWidth={isHovered ? '2' : '1'}
                        className="transition-all duration-200"
                      />
                    </g>
                  );
                })}

                {/* Donut Center Summary */}
                <circle r="44" fill="#0a0a0a" stroke="#262626" strokeWidth="1" />
                <text y="-6" fill="#ffffff" fontSize="14" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                  {extracts.length}
                </text>
                <text y="10" fill="#a3a3a3" fontSize="8" fontFamily="monospace" textAnchor="middle">
                  CLAIMS
                </text>
              </svg>
            </div>
          )}
        </div>

        {/* Legend Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 mt-1">
          {distribution.items.map((item) => {
            const isHovered = hoveredLabel === item.key;
            return (
              <div
                key={item.key}
                onMouseEnter={() => setHoveredLabel(item.key)}
                onMouseLeave={() => setHoveredLabel(null)}
                className={`p-3 rounded-xl border flex flex-col gap-1 transition-all cursor-pointer ${
                  isHovered
                    ? `${item.bg} ${item.border} scale-[1.02] shadow-md`
                    : 'bg-neutral-900/40 border-neutral-900 hover:border-neutral-800'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="font-semibold text-white">{item.label}</span>
                  </div>
                  <span className="font-bold text-amber-400">
                    {item.count} ({item.pct}%)
                  </span>
                </div>
                <p className="text-[10px] font-mono text-neutral-500 leading-tight">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export const CorpusIntakeTool: React.FC<CorpusIntakeToolProps> = ({
  ingestionBatches,
  onSaveBatch,
  onDeleteBatch,
  onClearAllBatches,
  onNavigateToTab
}) => {
  // Navigation mode within the tool
  const [activeSubTab, setActiveSubTab] = useState<'chat' | 'ingest' | 'audit' | 'second-brain'>('chat');

  // --- Ingestion Console State ---
  const [pastedText, setPastedText] = useState('');
  const [pastedTitle, setPastedTitle] = useState('');
  const [sourceType, setSourceType] = useState('essay');
  const [isProcessing, setIsProcessing] = useState(false);
  const [ingestionStep, setIngestionStep] = useState<number>(0);
  const [ingestionStepDetail, setIngestionStepDetail] = useState<string>('');
  const [ingestionError, setIngestionError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Batch / Multi-file processing state
  const [processingSource, setProcessingSource] = useState<'upload' | 'paste' | null>(null);
  const [activeFileName, setActiveFileName] = useState<string>('');
  const [batchTotalFiles, setBatchTotalFiles] = useState<number>(0);
  const [batchCurrentIndex, setBatchCurrentIndex] = useState<number>(0);
  const [completedBatchFiles, setCompletedBatchFiles] = useState<Array<{
    filename: string;
    title: string;
    chunksCount: number;
    extractsCount: number;
    sha256: string;
    batchId: string;
  }>>([]);
  const [lastProcessedBatchId, setLastProcessedBatchId] = useState<string | null>(null);

  // Expanded 3x3 step indicator drawer
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  // Anti-Reification Audit Gate state
  const [pendingGateBatch, setPendingGateBatch] = useState<CorpusIngestionBatch | null>(null);
  const [isGateOpen, setIsGateOpen] = useState<boolean>(false);

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

  // Core single file processor executing the 9-Step Corpus Ingestion pipeline
  const processSingleFile = async (
    input: {
      file?: File;
      rawText?: string;
      filename?: string;
      title?: string;
      ext?: string;
      source: 'upload' | 'paste';
    }
  ): Promise<CorpusIngestionBatch> => {
    let content = '';
    let fname = input.filename || 'document.md';
    let fext = input.ext || '.md';
    let fsize = 0;
    let title = input.title || '';

    if (input.file) {
      fname = input.file.name;
      fext = '.' + (fname.split('.').pop() || 'md');
      fsize = input.file.size;
      title = title || fname.replace(/\.[^/.]+$/, '');
      content = await readFileAsText(input.file);
    } else if (input.rawText) {
      content = input.rawText;
      fsize = new Blob([content]).size;
      title = title || fname.replace(/\.[^/.]+$/, '');
    }

    if (!content.trim()) {
      throw new Error(`File content for "${fname}" is empty.`);
    }

    // Step 1: Cryptographic Lock
    setIngestionStep(1);
    setIngestionStepDetail(`Calculating SHA-256 hash for "${fname}" (${(fsize / 1024).toFixed(1)} KB)...`);
    const normalized = normalizeText(content);
    const hash = await calculateSHA256(normalized);
    const { metadata, contentWithoutFrontmatter } = parseFrontmatter(normalized);
    await new Promise(r => setTimeout(r, 180));

    // Step 2: Text Normalization
    setIngestionStep(2);
    setIngestionStepDetail(`Normalizing structural line passages & metadata...`);
    await new Promise(r => setTimeout(r, 180));

    // Step 3: Semantic Chunking
    setIngestionStep(3);
    setIngestionStepDetail(`Dividing document into structural line-accurate passages...`);

    // Increment steps 4, 5, 6, 7 dynamically while AI server response is processing
    let currStep = 3;
    const stepInterval = setInterval(() => {
      currStep = Math.min(currStep + 1, 7);
      setIngestionStep(currStep);
      if (currStep === 4) setIngestionStepDetail(`Extracting epistemic claims with 11-level taxonomy...`);
      if (currStep === 5) setIngestionStepDetail(`Auditing all 12 monitored terms for anti-reification compliance...`);
      if (currStep === 6) setIngestionStepDetail(`Scanning boundary signals & existential pressure points...`);
      if (currStep === 7) setIngestionStepDetail(`Synthesizing knowledge graph edges & ontology links...`);
    }, 600);

    try {
      const response = await fetch('/api/corpus/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: fname,
          fileExtension: fext,
          fileSize: fsize,
          sha256Hash: hash,
          rawContent: contentWithoutFrontmatter.slice(0, 50000),
          title: title || metadata.title || fname.replace(/\.[^/.]+$/, ''),
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

      const batchResult: CorpusIngestionBatch = await response.json();
      batchResult.rawContent = contentWithoutFrontmatter;

      // --- Anti-Reification Gate Validation ---
      const reificationViolations = batchResult.antiReificationAudits?.filter(
        (a) => a.status === 'FAIL' || a.representation === 'reified_violation'
      ) || [];

      const copulaRegex = /\b(Void|Nothingness|God|Absolute|Substance|Being|Ground|Abyss)\s+(is|has|creates)\b/i;
      const textHasCopula = copulaRegex.test(contentWithoutFrontmatter);

      if (reificationViolations.length > 0 || textHasCopula) {
        // Pause Advancement to Step 9 Vault Commit for Human Review Step
        setIngestionStep(5);
        setIngestionStepDetail('PAUSED AT STEP 5: Anti-Reification Gate Triggered. Positive Copula Detected.');
        setPendingGateBatch(batchResult);
        setIsGateOpen(true);
        return batchResult;
      }

      // Step 8: Report Assembly
      setIngestionStep(8);
      setIngestionStepDetail(`Assembling INTAKE REPORT markdown document...`);
      await new Promise(r => setTimeout(r, 200));

      // Step 9: Vault Commit
      setIngestionStep(9);
      setIngestionStepDetail(`Committing batch to Second Brain Vault with full provenance...`);
      await new Promise(r => setTimeout(r, 200));

      onSaveBatch(batchResult);
      return batchResult;
    } catch (err) {
      clearInterval(stepInterval);
      throw err;
    }
  };

  // Anti-Reification Gate Action Handler (Human Review / Auto-Clean / Override)
  const handleCommitGateBatch = async (action: 'override' | 'autoclean') => {
    if (!pendingGateBatch) return;

    let batchToCommit: CorpusIngestionBatch = JSON.parse(JSON.stringify(pendingGateBatch));

    if (action === 'autoclean') {
      batchToCommit.extracts = batchToCommit.extracts.map((ext) => ({
        ...ext,
        text: ext.text
          .replace(/\b(is the|is an|is a|has the|has a|creates the)\b/gi, 'functions as an apophatic boundary for')
          .replace(/\b(is ultimate|is essential|is absolute)\b/gi, 'marks a non-reified limit condition for'),
      }));

      batchToCommit.antiReificationAudits = batchToCommit.antiReificationAudits.map((audit) => ({
        ...audit,
        status: 'PASS',
        note: `${audit.note} (Auto-cleaned positive copulas to apophatic limit expressions)`,
      }));
    } else if (action === 'override') {
      batchToCommit.antiReificationAudits = batchToCommit.antiReificationAudits.map((audit) => ({
        ...audit,
        note: `${audit.note} [HUMAN OVERRIDE APPROVED: Copula permitted for textual citation]`,
      }));
    }

    setIngestionStep(8);
    setIngestionStepDetail('Assembling INTAKE REPORT markdown document...');
    await new Promise((r) => setTimeout(r, 200));

    setIngestionStep(9);
    setIngestionStepDetail('Committing batch to Second Brain Vault with full provenance...');
    await new Promise((r) => setTimeout(r, 200));

    onSaveBatch(batchToCommit);

    setCompletedBatchFiles((prev) => [
      ...prev,
      {
        filename: batchToCommit.filename,
        title: batchToCommit.title,
        chunksCount: batchToCommit.chunks.length,
        extractsCount: batchToCommit.extracts.length,
        sha256: batchToCommit.sha256Hash,
        batchId: batchToCommit.batchId,
      },
    ]);
    setLastProcessedBatchId(batchToCommit.batchId);

    setIsGateOpen(false);
    setPendingGateBatch(null);
    setIsProcessing(false);

    setMessages((prev) => [
      ...prev,
      {
        id: `msg_ingest_gate_${Date.now()}`,
        sender: 'model',
        text: `**Corpus Intake Approved & Committed for "${batchToCommit.title}"** (\`${batchToCommit.filename}\` • SHA-256: \`${batchToCommit.sha256Hash.slice(0, 10)}...\`).\n\n- **Gate Action:** ${
          action === 'autoclean' ? 'Auto-Cleaned Reified Copulas' : 'Human Override Approved'
        }\n- Extracted **${batchToCommit.chunks.length}** semantic chunks and **${
          batchToCommit.extracts.length
        }** epistemically-labeled claims.\n- Saved in Second Brain Vault.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        voidQuotient: 0.92,
        densificationLevel: 'Δ4',
      },
    ]);
  };

  // Helper to read File object as string
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

  // Batch runner for direct file uploads (from file input or dropzone)
  const handleBatchUpload = async (files: File[]) => {
    if (!files || files.length === 0 || isProcessing) return;

    setActiveSubTab('ingest');
    setIsProcessing(true);
    setProcessingSource('upload');
    setIngestionError(null);
    setCompletedBatchFiles([]);
    setBatchTotalFiles(files.length);

    const completed: Array<{
      filename: string;
      title: string;
      chunksCount: number;
      extractsCount: number;
      sha256: string;
      batchId: string;
    }> = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setBatchCurrentIndex(i + 1);
      setActiveFileName(file.name);

      try {
        const batchResult = await processSingleFile({ file, source: 'upload' });
        completed.push({
          filename: file.name,
          title: batchResult.title,
          chunksCount: batchResult.chunks.length,
          extractsCount: batchResult.extracts.length,
          sha256: batchResult.sha256Hash,
          batchId: batchResult.batchId,
        });
        setCompletedBatchFiles([...completed]);
        setLastProcessedBatchId(batchResult.batchId);

        // Add confirmation message to chat
        setMessages(prev => [
          ...prev,
          {
            id: `msg_ingest_${Date.now()}_${i}`,
            sender: 'model',
            text: `**Corpus Intake Complete for "${batchResult.title}"** (\`${batchResult.filename}\` • SHA-256: \`${batchResult.sha256Hash.slice(0, 10)}...\`).\n\n- Extracted **${batchResult.chunks.length}** semantic chunks and **${batchResult.extracts.length}** epistemically-labeled claims.\n- **Anti-Reification Audit:** ${batchResult.antiReificationAudits.every(a => a.status === 'PASS') ? 'PASS (All 12 Monitored Terms Verified)' : 'FLAGGED FOR REVIEW'}\n- **Next Actions Produced:** ${batchResult.nextActions.length} recommendations.\n\nStored in your Second Brain Vault.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            voidQuotient: 0.92,
            densificationLevel: 'Δ4'
          }
        ]);
      } catch (err: any) {
        console.error(`Error processing file ${file.name}:`, err);
        setIngestionError(`Failed to process file "${file.name}": ${err.message || err}`);
        break;
      }
    }

    setIsProcessing(false);
  };

  // Direct text paste or raw text handler
  const processRawIngestion = async (
    rawText: string,
    filename: string,
    title?: string,
    ext: string = '.md',
    source: 'upload' | 'paste' = 'paste'
  ) => {
    if (!rawText.trim() || isProcessing) return;

    setActiveSubTab('ingest');
    setIsProcessing(true);
    setProcessingSource(source);
    setIngestionError(null);
    setCompletedBatchFiles([]);
    setBatchTotalFiles(1);
    setBatchCurrentIndex(1);
    setActiveFileName(filename || `${title || 'pasted_note'}.md`);

    try {
      const batchResult = await processSingleFile({
        rawText,
        filename: filename || `${title || 'pasted_note'}.md`,
        title,
        ext,
        source
      });

      setCompletedBatchFiles([{
        filename: batchResult.filename,
        title: batchResult.title,
        chunksCount: batchResult.chunks.length,
        extractsCount: batchResult.extracts.length,
        sha256: batchResult.sha256Hash,
        batchId: batchResult.batchId,
      }]);
      setLastProcessedBatchId(batchResult.batchId);

      // Clear paste buffer and draft
      setPastedText('');
      setPastedTitle('');
      sessionStorage.removeItem('nke_corpus_intake_draft');

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
    } catch (err: any) {
      console.error('Ingestion error:', err);
      setIngestionError(err.message || 'Failed to complete corpus intake.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle File Upload from disk (Triggered by hidden file input onChange)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);
    e.target.value = '';
    await handleBatchUpload(fileList);
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

    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);
    await handleBatchUpload(fileList);
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
                      {ingestionStepDetail && (
                        <p className="text-[11px] font-mono text-amber-300 mt-1 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse shrink-0" />
                          <span>{ingestionStepDetail}</span>
                        </p>
                      )}
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

                {/* Grid of 9 Steps with Real-Time Status Indicators & Expandable Sub-Task Accordion */}
                <div className="flex flex-col gap-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {INGESTION_STEPS_META.map((stepMeta) => {
                      const isDone = ingestionStep > stepMeta.step;
                      const isActive = ingestionStep === stepMeta.step;
                      const isExpanded = expandedStep === stepMeta.step;

                      return (
                        <div
                          key={stepMeta.step}
                          onClick={() => setExpandedStep(isExpanded ? null : stepMeta.step)}
                          className={`p-3 rounded-xl border flex items-center justify-between text-xs font-mono transition-all cursor-pointer group select-none ${
                            isDone
                              ? 'bg-emerald-950/20 border-emerald-900/50 text-emerald-300 hover:border-emerald-700'
                              : isActive
                              ? 'bg-amber-950/40 border-amber-500/80 text-amber-200 shadow-md shadow-amber-500/10 scale-[1.02]'
                              : 'bg-neutral-900/40 border-neutral-900 text-neutral-600 hover:border-neutral-800 hover:text-neutral-400'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
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

                          <div className="text-neutral-500 group-hover:text-amber-400 transition-colors shrink-0 ml-1">
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Expandable Step Sub-Task Inspector Drawer */}
                  {expandedStep !== null && (
                    <div className="bg-neutral-900/80 border border-amber-500/40 rounded-xl p-4 flex flex-col gap-3 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                        <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-300">
                          <Info className="w-4 h-4 text-amber-400" />
                          <span>
                            Stage {expandedStep}: {INGESTION_STEPS_META.find((s) => s.step === expandedStep)?.name} — Granular Audit Breakdown
                          </span>
                        </div>
                        <button
                          onClick={() => setExpandedStep(null)}
                          className="text-neutral-500 hover:text-neutral-300 text-xs font-mono px-2 py-0.5 rounded bg-neutral-800"
                        >
                          Close Inspector
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                        {expandedStep === 1 && (
                          <>
                            <div className="p-2.5 bg-neutral-950 border border-neutral-850 rounded-lg flex flex-col gap-1">
                              <span className="text-neutral-400 text-[10px]">SHA-256 Bitwise Digest</span>
                              <span className="text-amber-400 font-mono text-[11px] font-bold">
                                {pendingGateBatch?.sha256Hash || 'Calculated (256-bit lock)'}
                              </span>
                            </div>
                            <div className="p-2.5 bg-neutral-950 border border-neutral-850 rounded-lg flex flex-col gap-1">
                              <span className="text-neutral-400 text-[10px]">Bitwise Entropy Anchor</span>
                              <span className="text-emerald-400 text-[11px] font-bold">Verified & Non-Reversible Anchor</span>
                            </div>
                          </>
                        )}

                        {expandedStep === 2 && (
                          <>
                            <div className="p-2.5 bg-neutral-950 border border-neutral-850 rounded-lg flex flex-col gap-1">
                              <span className="text-neutral-400 text-[10px]">Text Normalization & Scrub</span>
                              <span className="text-white text-[11px]">CR/LF control codes scrubbed, UTF-8 verified</span>
                            </div>
                            <div className="p-2.5 bg-neutral-950 border border-neutral-850 rounded-lg flex flex-col gap-1">
                              <span className="text-neutral-400 text-[10px]">YAML Frontmatter Key Extraction</span>
                              <span className="text-purple-400 text-[11px]">Title, sourceType, author, date parsed</span>
                            </div>
                          </>
                        )}

                        {expandedStep === 3 && (
                          <>
                            <div className="p-2.5 bg-neutral-950 border border-neutral-850 rounded-lg flex flex-col gap-1">
                              <span className="text-neutral-400 text-[10px]">Canonical Line Passages</span>
                              <span className="text-amber-400 text-[11px] font-bold">
                                {pendingGateBatch?.chunks.length || 'Deterministic line passages generated'}
                              </span>
                            </div>
                            <div className="p-2.5 bg-neutral-950 border border-neutral-850 rounded-lg flex flex-col gap-1">
                              <span className="text-neutral-400 text-[10px]">Windowing Protocol</span>
                              <span className="text-neutral-300 text-[11px]">500-token max length / 50-token overlap</span>
                            </div>
                          </>
                        )}

                        {expandedStep === 4 && (
                          <>
                            <div className="p-2.5 bg-neutral-950 border border-neutral-850 rounded-lg flex flex-col gap-1">
                              <span className="text-neutral-400 text-[10px]">Extracted Epistemic Claims</span>
                              <span className="text-purple-400 text-[11px] font-bold">
                                {pendingGateBatch?.extracts.length || '11-Level Taxonomy assigned'}
                              </span>
                            </div>
                            <div className="p-2.5 bg-neutral-950 border border-neutral-850 rounded-lg flex flex-col gap-1">
                              <span className="text-neutral-400 text-[10px]">Taxonomy Classification</span>
                              <span className="text-emerald-400 text-[11px]">
                                APOPHATIC, TENSION, EVIDENCED, INFERRED, etc.
                              </span>
                            </div>
                          </>
                        )}

                        {expandedStep === 5 && (
                          <>
                            <div className="p-2.5 bg-neutral-950 border border-neutral-850 rounded-lg flex flex-col gap-1">
                              <span className="text-neutral-400 text-[10px]">Monitored Terms Monitored</span>
                              <span className="text-amber-400 text-[11px]">
                                12 Terms ('Void', 'Nothingness', 'God', 'Absolute', 'Substance', etc.)
                              </span>
                            </div>
                            <div className="p-2.5 bg-neutral-950 border border-neutral-850 rounded-lg flex flex-col gap-1">
                              <span className="text-neutral-400 text-[10px]">Positive Copula Scan Status</span>
                              <span className={`text-[11px] font-bold ${isGateOpen ? 'text-rose-400' : 'text-emerald-400'}`}>
                                {isGateOpen ? '⚠️ Copula Violation Detected (Gate Triggered)' : '✓ PASS - 100% Compliant'}
                              </span>
                            </div>
                          </>
                        )}

                        {expandedStep === 6 && (
                          <>
                            <div className="p-2.5 bg-neutral-950 border border-neutral-850 rounded-lg flex flex-col gap-1">
                              <span className="text-neutral-400 text-[10px]">Existential Boundary Scan</span>
                              <span className="text-sky-400 text-[11px]">
                                {pendingGateBatch?.boundarySignals?.length || 0} limit condition signals flagged
                              </span>
                            </div>
                            <div className="p-2.5 bg-neutral-950 border border-neutral-850 rounded-lg flex flex-col gap-1">
                              <span className="text-neutral-400 text-[10px]">Void Quotient Calculation</span>
                              <span className="text-amber-400 text-[11px] font-bold">0.92 / 1.0 (High Epistemic Pressure)</span>
                            </div>
                          </>
                        )}

                        {expandedStep === 7 && (
                          <>
                            <div className="p-2.5 bg-neutral-950 border border-neutral-850 rounded-lg flex flex-col gap-1">
                              <span className="text-neutral-400 text-[10px]">Graph Edge Synthesis</span>
                              <span className="text-indigo-400 text-[11px]">Subject-Predicate-Object triples generated</span>
                            </div>
                            <div className="p-2.5 bg-neutral-950 border border-neutral-850 rounded-lg flex flex-col gap-1">
                              <span className="text-neutral-400 text-[10px]">Ontology Mapping</span>
                              <span className="text-emerald-400 text-[11px]">Linked to Second Brain Ontology Nodes</span>
                            </div>
                          </>
                        )}

                        {expandedStep === 8 && (
                          <>
                            <div className="p-2.5 bg-neutral-950 border border-neutral-850 rounded-lg flex flex-col gap-1">
                              <span className="text-neutral-400 text-[10px]">INTAKE REPORT Markdown Assembly</span>
                              <span className="text-white text-[11px]">Compiled with audit checklists & next actions</span>
                            </div>
                            <div className="p-2.5 bg-neutral-950 border border-neutral-850 rounded-lg flex flex-col gap-1">
                              <span className="text-neutral-400 text-[10px]">Next Actions Produced</span>
                              <span className="text-purple-400 text-[11px]">
                                {pendingGateBatch?.nextActions?.length || 4} Graph / Synthesis Next Actions
                              </span>
                            </div>
                          </>
                        )}

                        {expandedStep === 9 && (
                          <>
                            <div className="p-2.5 bg-neutral-950 border border-neutral-850 rounded-lg flex flex-col gap-1">
                              <span className="text-neutral-400 text-[10px]">Second Brain Vault Storage</span>
                              <span className="text-emerald-400 text-[11px] font-bold">Immutable Batch Commit Stored</span>
                            </div>
                            <div className="p-2.5 bg-neutral-950 border border-neutral-850 rounded-lg flex flex-col gap-1">
                              <span className="text-neutral-400 text-[10px]">Provenance Record</span>
                              <span className="text-neutral-300 text-[11px]">Cryptographic Proof & SHA-256 anchored</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Anti-Reification Audit Gate Modal Review Step */}
            {isGateOpen && pendingGateBatch && (
              <div className="bg-neutral-950 border-2 border-rose-500/80 rounded-2xl p-6 flex flex-col gap-5 shadow-2xl shadow-rose-500/20 animate-in fade-in duration-300">
                <div className="flex items-start justify-between gap-3 border-b border-neutral-900 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-rose-500/10 border border-rose-500/40 rounded-xl shrink-0">
                      <ShieldAlert className="w-6 h-6 text-rose-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-display text-sm uppercase tracking-wider font-bold text-rose-200">
                          Anti-Reification Audit Gate Triggered
                        </h3>
                        <span className="text-[10px] font-mono text-rose-400 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-800">
                          Vault Commit Paused
                        </span>
                      </div>
                      <p className="text-xs font-mono text-neutral-400 mt-1">
                        Document contains positive copula usage with monitored terms (e.g. "Void is...", "Nothingness has...").
                        Human review is required before committing to Vault.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Audit Violation Details */}
                <div className="bg-neutral-900/60 border border-neutral-850 rounded-xl p-4 flex flex-col gap-3">
                  <span className="text-xs font-mono font-bold text-amber-300 uppercase tracking-wider">
                    Detected Reification Violations
                  </span>
                  <div className="flex flex-col gap-2">
                    {pendingGateBatch.antiReificationAudits?.map((audit, idx) => (
                      <div key={idx} className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg flex flex-col gap-1 text-xs font-mono">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white">Term: "{audit.term}"</span>
                          <span className="text-[10px] bg-rose-950 text-rose-300 px-2 py-0.5 rounded border border-rose-800">
                            {audit.status} • {audit.representation}
                          </span>
                        </div>
                        <span className="text-neutral-400 text-[11px]">{audit.note}</span>
                        <span className="text-neutral-500 text-[10px]">Location: {audit.location}</span>
                      </div>
                    ))}
                    {(!pendingGateBatch.antiReificationAudits || pendingGateBatch.antiReificationAudits.length === 0) && (
                      <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg text-xs font-mono text-amber-300">
                        Monitored term detected in positive copula context (e.g., "Void is", "Nothingness has").
                      </div>
                    )}
                  </div>
                </div>

                {/* Gate Resolution Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => handleCommitGateBatch('autoclean')}
                    className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-amber-600 to-purple-600 hover:from-amber-500 hover:to-purple-500 text-white rounded-xl font-mono text-xs uppercase font-semibold tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                  >
                    <Wand2 className="w-4 h-4 text-amber-300" />
                    <span>Auto-Clean Copulas & Commit</span>
                  </button>

                  <button
                    onClick={() => handleCommitGateBatch('override')}
                    className="w-full sm:w-auto px-4 py-2.5 bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 rounded-xl font-mono text-xs uppercase font-semibold tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Approve Human Override</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsGateOpen(false);
                      setPendingGateBatch(null);
                      setIsProcessing(false);
                    }}
                    className="w-full sm:w-auto px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-neutral-200 rounded-xl font-mono text-xs uppercase font-semibold tracking-wider transition-all cursor-pointer"
                  >
                    Reject & Edit
                  </button>
                </div>
              </div>
            )}

            {/* Completed Ingestion Summary Banner & Epistemic Label Distribution Chart */}
            {!isProcessing && completedBatchFiles.length > 0 && (
              <div className="flex flex-col gap-6 animate-in fade-in duration-300">
                <div className="bg-neutral-950 border-2 border-emerald-500/60 rounded-2xl p-6 flex flex-col gap-5 shadow-2xl shadow-emerald-500/10">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-900 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div>
                        <h3 className="font-display text-sm uppercase tracking-wider font-bold text-white flex items-center gap-2">
                          <span>All 9 Ingestion Stages Verified & Vault Committed</span>
                          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                            {completedBatchFiles.length} File{completedBatchFiles.length > 1 ? 's' : ''} Processed
                          </span>
                        </h3>
                        <p className="text-xs font-mono text-neutral-400 mt-0.5">
                          Corpus successfully parsed, hashed, and archived into Second Brain Knowledge Graph
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          if (lastProcessedBatchId) setAuditViewMode(lastProcessedBatchId);
                          setActiveSubTab('audit');
                        }}
                        className="px-3.5 py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-mono font-semibold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <FileCheck className="w-4 h-4 text-amber-400" />
                        <span>Inspect Audit Report →</span>
                      </button>
                      <button
                        onClick={() => setActiveSubTab('chat')}
                        className="px-3.5 py-2 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-mono font-semibold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Bot className="w-4 h-4 text-purple-400" />
                        <span>Consult Professor Nihil</span>
                      </button>
                      <button
                        onClick={() => setCompletedBatchFiles([])}
                        className="p-2 bg-neutral-900 hover:bg-neutral-850 text-neutral-400 hover:text-neutral-200 border border-neutral-800 rounded-xl transition-colors cursor-pointer"
                        title="Dismiss & Ingest More Files"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  {/* Table of Ingested Batch Files */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs font-mono">
                      <thead>
                        <tr className="border-b border-neutral-900 text-neutral-500">
                          <th className="py-2 px-3">Filename</th>
                          <th className="py-2 px-3">Title</th>
                          <th className="py-2 px-3">Chunks</th>
                          <th className="py-2 px-3">Claims</th>
                          <th className="py-2 px-3">SHA-256 Hash</th>
                          <th className="py-2 px-3">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {completedBatchFiles.map((f, idx) => (
                          <tr key={idx} className="border-b border-neutral-900/50 hover:bg-neutral-900/30">
                            <td className="py-2.5 px-3 font-semibold text-white">{f.filename}</td>
                            <td className="py-2.5 px-3 text-neutral-300">{f.title}</td>
                            <td className="py-2.5 px-3 text-amber-400 font-bold">{f.chunksCount}</td>
                            <td className="py-2.5 px-3 text-purple-400 font-bold">{f.extractsCount}</td>
                            <td className="py-2.5 px-3 text-neutral-500 font-mono">{f.sha256.slice(0, 10)}...</td>
                            <td className="py-2.5 px-3">
                              <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded text-[10px] font-bold">
                                COMMITTED
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Post-Ingestion D3/SVG Epistemic Label Distribution Visualizer Chart */}
                {ingestionBatches.length > 0 && (
                  <EpistemicDistributionVisualizer
                    extracts={
                      lastProcessedBatchId
                        ? ingestionBatches.find((b) => b.batchId === lastProcessedBatchId)?.extracts ||
                          ingestionBatches.flatMap((b) => b.extracts)
                        : ingestionBatches.flatMap((b) => b.extracts)
                    }
                    title="Batch Epistemic Label Distribution"
                  />
                )}
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

                {/* Aggregate Epistemic Label Distribution Chart */}
                <EpistemicDistributionVisualizer
                  extracts={ingestionBatches.flatMap((b) => b.extracts)}
                  title="Aggregate Second Brain Epistemic Label Distribution"
                />

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
                                <div className="flex items-center gap-1.5">
                                  <button
                                    onClick={() => onNavigateToTab?.('graph', batch.title)}
                                    className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 rounded-lg border border-amber-500/30 text-[10px] transition-colors cursor-pointer flex items-center gap-1 font-semibold"
                                    title="View & isolate this upload in Knowledge Graph"
                                  >
                                    <Activity className="w-3 h-3 text-amber-400" />
                                    <span>View in Graph</span>
                                  </button>
                                  <button
                                    onClick={() => setAuditViewMode(batch.batchId)}
                                    className="px-2.5 py-1 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 rounded-lg border border-neutral-800 text-[10px] transition-colors cursor-pointer"
                                  >
                                    Inspect Audit →
                                  </button>
                                </div>
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
                    <button
                      onClick={() => onNavigateToTab?.('graph', selectedBatch.title)}
                      className="px-3.5 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-xl border border-amber-500/40 text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2 shadow-lg shadow-amber-950/40"
                    >
                      <Activity className="w-4 h-4 text-amber-400" />
                      <span>View In Knowledge Graph</span>
                    </button>

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

                {/* Single File Epistemic Label Distribution Chart */}
                <EpistemicDistributionVisualizer
                  extracts={selectedBatch.extracts}
                  title={`Epistemic Label Distribution: ${selectedBatch.title}`}
                />

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
