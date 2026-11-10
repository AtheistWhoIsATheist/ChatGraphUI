import React, { useState, useMemo, useEffect } from 'react';
import {
  Compass,
  Sparkles,
  Flame,
  ArrowRightLeft,
  Search,
  Plus,
  Trash2,
  Download,
  CheckCircle2,
  FileText,
  BookOpen,
  Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CorpusIngestionBatch, EpistemicStatus } from '../../types';
import { NoteDocument, WorkspaceTabType } from './types';
import { corpusTexts as initialCorpusTexts } from '../../data/ontology';

export interface DisplayClaim {
  id: string;
  text: string;
  classification: 'Occurrence' | 'Elevation';
  epistemicStatus: string;
  sourceTitle: string;
  sourceType: string;
  authorOrThinker: string;
  timestamp: string;
  provenance: string;
  chunkReference?: string;
  noteId?: string;
  batchId?: string;
  isUserOverridden?: boolean;
}

export interface OccurrenceElevationBalanceViewProps {
  ingestionBatches?: CorpusIngestionBatch[];
  vaultNotes?: Record<string, NoteDocument>;
  onOpenNote?: (noteId: string) => void;
  onNavigateToTab?: (tab: WorkspaceTabType) => void;
  onSaveBatch?: (batch: CorpusIngestionBatch) => void;
  onCommitNoteToVault?: (note: NoteDocument) => void;
}

const STORAGE_KEY_OVERRIDES = 'nihiltheism_claim_classification_overrides_v1';
const STORAGE_KEY_CUSTOM_CLAIMS = 'nihiltheism_custom_ingested_claims_v1';

export const OccurrenceElevationBalanceView: React.FC<OccurrenceElevationBalanceViewProps> = ({
  ingestionBatches = [],
  vaultNotes = {},
  onOpenNote,
  onNavigateToTab,
  onSaveBatch: _onSaveBatch,
  onCommitNoteToVault
}) => {
  // Classification overrides { [claimId]: 'Occurrence' | 'Elevation' }
  const [classificationOverrides, setClassificationOverrides] = useState<Record<string, 'Occurrence' | 'Elevation'>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_OVERRIDES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // ignore
    }
    return {};
  });

  // User-created custom claims
  const [customClaims, setCustomClaims] = useState<DisplayClaim[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CUSTOM_CLAIMS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // ignore
    }
    return [];
  });

  // Persist overrides and custom claims
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_OVERRIDES, JSON.stringify(classificationOverrides));
    } catch (e) {
      // ignore
    }
  }, [classificationOverrides]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CUSTOM_CLAIMS, JSON.stringify(customClaims));
    } catch (e) {
      // ignore
    }
  }, [customClaims]);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEpistemicFilter, setSelectedEpistemicFilter] = useState<string>('ALL');
  const [selectedSourceFilter, setSelectedSourceFilter] = useState<string>('ALL');

  // Quick Ingest Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newClaimText, setNewClaimText] = useState('');
  const [newClaimType, setNewClaimType] = useState<'Occurrence' | 'Elevation'>('Occurrence');
  const [newClaimSource, setNewClaimSource] = useState('Personal Research');
  const [newClaimAuthor, setNewClaimAuthor] = useState('');
  const [newClaimEpistemicStatus, setNewClaimEpistemicStatus] = useState<EpistemicStatus>('PHENOMENOLOGICAL');

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Compile all claims across Ingestion Batches, Vault Notes, Canonical Texts, and Custom Ingests
  const allClaims: DisplayClaim[] = useMemo(() => {
    const list: DisplayClaim[] = [];

    // 1. Claims from Ingested Batches
    ingestionBatches.forEach((batch) => {
      (batch.extracts || []).forEach((ext) => {
        // Deterministic classification based on extract metadata, keyword heuristics, or user override
        let defaultClass: 'Occurrence' | 'Elevation' = ext.claimType || ext.occurrenceElevationLabel || 'Occurrence';
        if (!ext.claimType && !ext.occurrenceElevationLabel) {
          const lower = (ext.text || '').toLowerCase();
          const isElev =
            lower.includes('transcend') ||
            lower.includes('potentiality') ||
            lower.includes('timeless') ||
            lower.includes('sacred') ||
            lower.includes('clarity') ||
            lower.includes('kenosis') ||
            lower.includes('abgrund') ||
            lower.includes('śūnyatā') ||
            lower.includes('sunyata') ||
            lower.includes('gelassenheit') ||
            lower.includes('apophasis') ||
            lower.includes('freedom') ||
            lower.includes('form');
          defaultClass = isElev ? 'Elevation' : 'Occurrence';
        }

        const effectiveClass = classificationOverrides[ext.id] || defaultClass;

        list.push({
          id: ext.id,
          text: ext.text,
          classification: effectiveClass,
          epistemicStatus: ext.epistemicStatus || 'EVIDENCED',
          sourceTitle: batch.title || batch.filename,
          sourceType: 'Corpus Batch',
          authorOrThinker: ext.thinker || 'Canonical Source',
          timestamp: batch.timestamp,
          provenance: ext.provenance || `${batch.filename} (${ext.chunkReference || 'ext'})`,
          chunkReference: ext.chunkReference,
          batchId: batch.batchId,
          isUserOverridden: !!classificationOverrides[ext.id]
        });
      });
    });

    // 2. Claims extracted from Vault Notes
    Object.values(vaultNotes).forEach((note) => {
      const noteClass: 'Occurrence' | 'Elevation' = note.claimCategory || (
        note.title.toLowerCase().includes('emptiness') ||
        note.title.toLowerCase().includes('timeless') ||
        note.title.toLowerCase().includes('apophatic') ||
        note.title.toLowerCase().includes('kenosis')
          ? 'Elevation'
          : 'Occurrence'
      );

      // Intro paragraph as a claim
      if (note.introParagraph && note.introParagraph.length > 25) {
        const id = `vault_note_intro_${note.id}`;
        list.push({
          id,
          text: note.introParagraph,
          classification: classificationOverrides[id] || noteClass,
          epistemicStatus: noteClass === 'Elevation' ? 'APOPHATIC' : 'PHENOMENOLOGICAL',
          sourceTitle: note.title,
          sourceType: 'Vault Note',
          authorOrThinker: 'Nihiltheism Vault',
          timestamp: 'Live Note',
          provenance: `[[${note.title}]]`,
          noteId: note.id,
          isUserOverridden: !!classificationOverrides[id]
        });
      }

      // Core principles as claims
      (note.corePrinciples || []).forEach((p, idx) => {
        const id = `vault_note_principle_${note.id}_${idx}`;
        const pLower = p.description.toLowerCase();
        const pClass: 'Occurrence' | 'Elevation' =
          pLower.includes('transcend') || pLower.includes('sacred') || pLower.includes('void') || pLower.includes('clarity')
            ? 'Elevation'
            : 'Occurrence';

        list.push({
          id,
          text: `${p.title}: ${p.description}`,
          classification: classificationOverrides[id] || pClass,
          epistemicStatus: pClass === 'Elevation' ? 'INFERRED' : 'PHENOMENOLOGICAL',
          sourceTitle: note.title,
          sourceType: 'Vault Principle',
          authorOrThinker: 'Nihiltheism Vault',
          timestamp: 'Live Note',
          provenance: `[[${note.title}]] §${p.number}`,
          noteId: note.id,
          isUserOverridden: !!classificationOverrides[id]
        });
      });
    });

    // 3. Built-in Canonical Corpus Texts
    initialCorpusTexts.forEach((cText) => {
      const id = `corpus_text_${cText.id}`;
      const lower = cText.fragment.toLowerCase();
      const isElev =
        cText.author.includes('Eckhart') ||
        cText.author.includes('Nishitani') ||
        cText.author.includes('Nagarjuna') ||
        lower.includes('abyss') ||
        lower.includes('freedom') ||
        lower.includes('sunyata');
      const defaultClass: 'Occurrence' | 'Elevation' = isElev ? 'Elevation' : 'Occurrence';

      list.push({
        id,
        text: cText.fragment,
        classification: classificationOverrides[id] || defaultClass,
        epistemicStatus: defaultClass === 'Elevation' ? 'APOPHATIC' : 'PHENOMENOLOGICAL',
        sourceTitle: cText.title,
        sourceType: 'Historical Corpus',
        authorOrThinker: cText.author,
        timestamp: cText.period,
        provenance: `${cText.author}, ${cText.title} (${cText.period})`,
        isUserOverridden: !!classificationOverrides[id]
      });
    });

    // 4. Custom User Ingested Claims
    customClaims.forEach((c) => {
      list.push({
        ...c,
        classification: classificationOverrides[c.id] || c.classification,
        isUserOverridden: !!classificationOverrides[c.id]
      });
    });

    return list;
  }, [ingestionBatches, vaultNotes, classificationOverrides, customClaims]);

  // Filtered Claims
  const filteredClaims = useMemo(() => {
    return allClaims.filter((claim) => {
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesText = claim.text.toLowerCase().includes(q);
        const matchesAuthor = claim.authorOrThinker.toLowerCase().includes(q);
        const matchesSource = claim.sourceTitle.toLowerCase().includes(q);
        const matchesProvenance = claim.provenance.toLowerCase().includes(q);
        if (!matchesText && !matchesAuthor && !matchesSource && !matchesProvenance) {
          return false;
        }
      }

      // Epistemic filter
      if (selectedEpistemicFilter !== 'ALL') {
        if (!claim.epistemicStatus.toUpperCase().includes(selectedEpistemicFilter.toUpperCase())) {
          return false;
        }
      }

      // Source filter
      if (selectedSourceFilter !== 'ALL') {
        if (claim.sourceType !== selectedSourceFilter) {
          return false;
        }
      }

      return true;
    });
  }, [allClaims, searchQuery, selectedEpistemicFilter, selectedSourceFilter]);

  // Separate into Dual Columns
  const occurrenceClaims = useMemo(() => {
    return filteredClaims.filter((c) => c.classification === 'Occurrence');
  }, [filteredClaims]);

  const elevationClaims = useMemo(() => {
    return filteredClaims.filter((c) => c.classification === 'Elevation');
  }, [filteredClaims]);

  // Balance Metrics
  const totalCount = allClaims.length;
  const occurrenceCount = allClaims.filter((c) => c.classification === 'Occurrence').length;
  const elevationCount = allClaims.filter((c) => c.classification === 'Elevation').length;

  const occurrencePercent = totalCount > 0 ? (occurrenceCount / totalCount) * 100 : 50;
  const elevationPercent = totalCount > 0 ? (elevationCount / totalCount) * 100 : 50;
  const elevationRatio = occurrenceCount > 0 ? (elevationCount / occurrenceCount).toFixed(2) : '∞';

  // Toggle classification for a claim
  const handleToggleClassification = (claimId: string, current: 'Occurrence' | 'Elevation') => {
    const next: 'Occurrence' | 'Elevation' = current === 'Occurrence' ? 'Elevation' : 'Occurrence';
    setClassificationOverrides((prev) => ({
      ...prev,
      [claimId]: next
    }));
    showToast(`Reclassified claim to "${next}"`);
  };

  // Add custom claim
  const handleAddCustomClaim = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClaimText.trim()) return;

    const newClaim: DisplayClaim = {
      id: `custom_claim_${Date.now()}`,
      text: newClaimText.trim(),
      classification: newClaimType,
      epistemicStatus: newClaimEpistemicStatus,
      sourceTitle: newClaimSource.trim() || 'Direct Ingestion',
      sourceType: 'Direct Ingest',
      authorOrThinker: newClaimAuthor.trim() || 'Researcher',
      timestamp: new Date().toLocaleDateString(),
      provenance: `Direct Segment Ingestion (${newClaimType})`,
      isUserOverridden: false
    };

    setCustomClaims((prev) => [newClaim, ...prev]);
    setIsAddModalOpen(false);
    setNewClaimText('');
    setNewClaimAuthor('');
    showToast(`Ingested new ${newClaimType} claim into library`);
  };

  // Commit claim as elevated note to Vault
  const handleCommitClaimToVault = (claim: DisplayClaim) => {
    if (!onCommitNoteToVault) return;
    const newNote: NoteDocument = {
      id: `claim-note-${Date.now()}`,
      title: `${claim.classification}: ${claim.sourceTitle.slice(0, 35)}`,
      subtitle: `Ingested ${claim.classification} claim by ${claim.authorOrThinker || 'Researcher'}`,
      folder: claim.classification === 'Elevation' ? '40 – Systems' : '20 – Phenomenology',
      path: `Claims / ${claim.classification} / ${claim.sourceTitle.slice(0, 20)}`,
      introParagraph: claim.text,
      quote: `“${claim.text}” — ${claim.authorOrThinker || claim.sourceTitle}`,
      corePrinciples: [
        { number: 1, title: 'Classification', description: `Categorized as ${claim.classification} with epistemic status [${claim.epistemicStatus}].` },
        { number: 2, title: 'Provenance', description: claim.provenance }
      ],
      relatedIdeas: [
        claim.classification.toLowerCase(),
        claim.epistemicStatus.toLowerCase(),
        '#claims-balance'
      ],
      backlinksCount: 1,
      wordCount: claim.text.split(' ').length,
      charCount: claim.text.length,
      isCustom: true,
      claimCategory: claim.classification
    };
    onCommitNoteToVault(newNote);
    showToast(`Committed ${claim.classification} note to Vault`);
  };

  // Delete custom claim
  const handleDeleteCustomClaim = (id: string) => {
    setCustomClaims((prev) => prev.filter((c) => c.id !== id));
    showToast('Custom claim removed');
  };

  // Export full audit report
  const handleExportAudit = () => {
    const report = {
      generatedAt: new Date().toISOString(),
      balanceMetrics: {
        totalClaims: totalCount,
        occurrenceCount,
        elevationCount,
        elevationRatio,
        occurrencePercent: occurrencePercent.toFixed(1) + '%',
        elevationPercent: elevationPercent.toFixed(1) + '%'
      },
      occurrenceClaims: allClaims.filter((c) => c.classification === 'Occurrence'),
      elevationClaims: allClaims.filter((c) => c.classification === 'Elevation')
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(report, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `nihiltheism-claims-balance-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Claims Balance JSON audit downloaded');
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#05030a] text-neutral-200 overflow-hidden font-sans">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-14 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-neutral-900 border border-violet-500/50 text-violet-200 text-xs font-mono rounded-xl shadow-2xl flex items-center gap-2 backdrop-blur-md"
          >
            <CheckCircle2 className="w-4 h-4 text-violet-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. Header & Live Balance Telemetry Bar */}
      <div className="shrink-0 p-4 border-b border-white/[0.08] bg-[#090614]/90 backdrop-blur-md flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500/20 via-purple-500/20 to-cyan-500/20 border border-white/10 flex items-center justify-center text-amber-300">
              <Compass className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-white tracking-wide">
                  Occurrence vs. Elevation Balance
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/5 border border-white/10 text-white/70">
                  J314 Library Discriminator
                </span>
              </div>
              <p className="text-xs text-white/50 font-mono mt-0.5">
                Dual-column comparative audit of empirical phenomenological friction vs. transcendent structural claims
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-violet-600/30 hover:bg-violet-600/50 border border-violet-400/50 text-white text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
            >
              <Plus className="w-3.5 h-3.5 text-violet-300" />
              <span>Ingest Claim</span>
            </button>

            {onNavigateToTab && (
              <button
                onClick={() => onNavigateToTab('ingest')}
                className="px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white/80 text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer"
                title="Open 9-Step Corpus Intake Pipeline"
              >
                <BookOpen className="w-3.5 h-3.5 text-neutral-400" />
                <span>Corpus Intake</span>
              </button>
            )}

            <button
              onClick={handleExportAudit}
              className="px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white/80 text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer"
              title="Download claims audit JSON"
            >
              <Download className="w-3.5 h-3.5 text-neutral-400" />
              <span>Export Audit</span>
            </button>
          </div>
        </div>

        {/* 2. Visual Balance Gauge Bar & KPI Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-black/40 border border-white/5 rounded-2xl p-3">
          {/* KPI 1: Total Claims */}
          <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col justify-between">
            <span className="text-[10px] font-mono uppercase text-white/40">Total Ingested Claims</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-bold font-mono text-white">{totalCount}</span>
              <span className="text-[11px] font-mono text-white/50">across library</span>
            </div>
          </div>

          {/* KPI 2: Occurrence Claims */}
          <div className="p-2.5 rounded-xl bg-amber-500/[0.05] border border-amber-500/20 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase text-amber-300/80">Occurrence Claims</span>
              <Flame className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-bold font-mono text-amber-300">{occurrenceCount}</span>
              <span className="text-[11px] font-mono text-amber-400/70">({occurrencePercent.toFixed(1)}%)</span>
            </div>
          </div>

          {/* KPI 3: Elevation Claims */}
          <div className="p-2.5 rounded-xl bg-violet-500/[0.05] border border-violet-500/20 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase text-violet-300/80">Elevation Claims</span>
              <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-bold font-mono text-violet-300">{elevationCount}</span>
              <span className="text-[11px] font-mono text-violet-400/70">({elevationPercent.toFixed(1)}%)</span>
            </div>
          </div>

          {/* KPI 4: Ratio & Dialectical State */}
          <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase text-cyan-300/80">Elevation Ratio (E/O)</span>
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-bold font-mono text-cyan-300">{elevationRatio}x</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-800 text-cyan-300">
                {parseFloat(elevationRatio) >= 1.4 ? 'Elevated Clarity' : parseFloat(elevationRatio) >= 0.8 ? 'Dialectic Equilibrium' : 'Occurrence Heavy'}
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Proportion Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] font-mono">
            <span className="text-amber-400 flex items-center gap-1.5">
              <Flame className="w-3 h-3 text-amber-400" />
              <span>Occurrence: {occurrencePercent.toFixed(1)}%</span>
            </span>
            <span className="text-white/40">Dynamic Dialectic Balance Bar</span>
            <span className="text-violet-400 flex items-center gap-1.5">
              <span>Elevation: {elevationPercent.toFixed(1)}%</span>
              <Sparkles className="w-3 h-3 text-violet-400" />
            </span>
          </div>
          <div className="w-full h-2.5 bg-neutral-900 rounded-full overflow-hidden flex border border-white/10 p-[1px]">
            <motion.div
              className="h-full bg-gradient-to-r from-amber-600 to-amber-500 rounded-l-full"
              style={{ width: `${occurrencePercent}%` }}
              transition={{ duration: 0.4 }}
            />
            <motion.div
              className="h-full bg-gradient-to-r from-violet-600 to-cyan-400 rounded-r-full"
              style={{ width: `${elevationPercent}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>

        {/* 3. Search and Filter Strip */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search claims by keyword, thinker, or source provenance..."
              className="w-full bg-black/50 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-violet-500/50 font-sans"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white text-xs font-mono"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
            {/* Epistemic Status Filter */}
            <select
              value={selectedEpistemicFilter}
              onChange={(e) => setSelectedEpistemicFilter(e.target.value)}
              className="px-3 py-1.5 bg-black/60 border border-white/10 rounded-xl text-xs font-mono text-white/80 focus:outline-none focus:border-violet-500/50"
            >
              <option value="ALL">All Epistemic Labels</option>
              <option value="APOPHATIC">Apophatic</option>
              <option value="PHENOMENOLOGICAL">Phenomenological</option>
              <option value="EVIDENCED">Evidenced / Textual</option>
              <option value="INFERRED">Inferred</option>
              <option value="SPECULATIVE">Speculative</option>
              <option value="TENSION">Tension</option>
            </select>

            {/* Source Type Filter */}
            <select
              value={selectedSourceFilter}
              onChange={(e) => setSelectedSourceFilter(e.target.value)}
              className="px-3 py-1.5 bg-black/60 border border-white/10 rounded-xl text-xs font-mono text-white/80 focus:outline-none focus:border-violet-500/50"
            >
              <option value="ALL">All Sources</option>
              <option value="Corpus Batch">Corpus Batches</option>
              <option value="Vault Note">Vault Notes</option>
              <option value="Historical Corpus">Historical Texts</option>
              <option value="Direct Ingest">Direct Ingests</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. Dual-Column Side-by-Side Comparison Container */}
      <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/[0.08]">
        {/* ========================================================================= */}
        {/* LEFT COLUMN: OCCURRENCE (Phenomenological Event)                           */}
        {/* ========================================================================= */}
        <div className="h-full flex flex-col overflow-hidden bg-[#07040d]/60">
          {/* Column Header Card */}
          <div className="p-4 border-b border-white/[0.06] bg-amber-950/20 flex flex-col gap-2 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-amber-300">
                    Occurrence Claims
                  </h3>
                  <span className="text-[10px] text-amber-400/70 font-mono">
                    Phenomenological Events & Empirical Friction
                  </span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/20 border border-amber-500/30 text-amber-300">
                {occurrenceClaims.length} Claims
              </span>
            </div>

            <p className="text-[11px] text-white/50 font-sans leading-relaxed">
              Contingent empirical events, experiential friction, psychological reactions, situated worldly limits, and unexamined dogmatic projections.
            </p>
          </div>

          {/* Column Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {occurrenceClaims.length === 0 ? (
              <div className="h-48 flex flex-col items-center justify-center text-center p-6 border border-dashed border-white/10 rounded-2xl text-white/40 font-mono text-xs">
                <Flame className="w-6 h-6 text-amber-400/40 mb-2" />
                <span>No Occurrence claims match your filters.</span>
                <span className="text-[10px] text-white/30 mt-1">
                  Use the Ingest Claim button or toggle an Elevation claim to Occurrence.
                </span>
              </div>
            ) : (
              occurrenceClaims.map((claim) => (
                <div
                  key={claim.id}
                  className="p-3.5 rounded-2xl bg-[#0c0916]/80 hover:bg-[#100d1d] border border-amber-500/20 hover:border-amber-500/40 transition-all flex flex-col gap-2.5 shadow-sm group"
                >
                  {/* Top Bar: Provenance + Epistemic Pill */}
                  <div className="flex items-center justify-between gap-2 text-[10px] font-mono">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="px-1.5 py-0.5 rounded bg-white/5 text-white/70 border border-white/10 truncate">
                        {claim.sourceTitle}
                      </span>
                      {claim.authorOrThinker && (
                        <span className="text-amber-400/90 truncate font-semibold">
                          • {claim.authorOrThinker}
                        </span>
                      )}
                    </div>

                    <span className="px-1.5 py-0.5 rounded bg-amber-950/80 border border-amber-800 text-amber-300 font-bold shrink-0">
                      [{claim.epistemicStatus}]
                    </span>
                  </div>

                  {/* Main Claim Text */}
                  <p className="text-xs text-neutral-200 font-sans leading-relaxed">
                    "{claim.text}"
                  </p>

                  {/* Footer & Interactive Reclassification Toggle */}
                  <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[10px] font-mono text-white/40">
                    <span className="truncate max-w-[180px]" title={claim.provenance}>
                      {claim.provenance}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {claim.noteId && onOpenNote && (
                        <button
                          onClick={() => onOpenNote(claim.noteId!)}
                          className="px-2 py-0.5 rounded bg-white/[0.04] hover:bg-white/[0.08] text-white/60 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                          title="Open note in Vault"
                        >
                          <FileText className="w-3 h-3" />
                          <span>Note</span>
                        </button>
                      )}

                      {onCommitNoteToVault && (
                        <button
                          onClick={() => handleCommitClaimToVault(claim)}
                          className="px-2 py-0.5 rounded bg-white/[0.04] hover:bg-emerald-500/20 text-white/50 hover:text-emerald-300 transition-colors cursor-pointer flex items-center gap-1"
                          title="Commit to Vault Note"
                        >
                          <span>+Vault</span>
                        </button>
                      )}

                      {/* Re-Classification Toggle Switch */}
                      <button
                        onClick={() => handleToggleClassification(claim.id, 'Occurrence')}
                        className="px-2.5 py-1 rounded-lg bg-violet-600/20 hover:bg-violet-600/40 border border-violet-500/30 text-violet-300 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer font-semibold shadow-sm"
                        title="Reclassify claim as Transcendent Elevation"
                      >
                        <span>Elevate →</span>
                        <ArrowRightLeft className="w-3 h-3 text-violet-400" />
                      </button>

                      {claim.id.startsWith('custom_claim_') && (
                        <button
                          onClick={() => handleDeleteCustomClaim(claim.id)}
                          className="p-1 rounded text-white/30 hover:text-rose-400 transition-colors cursor-pointer"
                          title="Delete custom claim"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: ELEVATION (Transcendent Claim)                              */}
        {/* ========================================================================= */}
        <div className="h-full flex flex-col overflow-hidden bg-[#07040d]/60">
          {/* Column Header Card */}
          <div className="p-4 border-b border-white/[0.06] bg-violet-950/20 flex flex-col gap-2 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-violet-500/20 border border-violet-500/40 text-violet-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-violet-300">
                    Elevation Claims
                  </h3>
                  <span className="text-[10px] text-violet-400/70 font-mono">
                    Transcendent Structural Claims & Eidetic Clarity
                  </span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-violet-500/20 border border-violet-500/30 text-violet-300">
                {elevationClaims.length} Claims
              </span>
            </div>

            <p className="text-[11px] text-white/50 font-sans leading-relaxed">
              Transcendent structural insight, eidetic clarity, kenotic subtractive clearing, Gelassenheit, and constructive synthesis into timeless potentiality.
            </p>
          </div>

          {/* Column Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {elevationClaims.length === 0 ? (
              <div className="h-48 flex flex-col items-center justify-center text-center p-6 border border-dashed border-white/10 rounded-2xl text-white/40 font-mono text-xs">
                <Sparkles className="w-6 h-6 text-violet-400/40 mb-2" />
                <span>No Elevation claims match your filters.</span>
                <span className="text-[10px] text-white/30 mt-1">
                  Use the Ingest Claim button or toggle an Occurrence claim to Elevation.
                </span>
              </div>
            ) : (
              elevationClaims.map((claim) => (
                <div
                  key={claim.id}
                  className="p-3.5 rounded-2xl bg-[#0c0916]/80 hover:bg-[#100d1d] border border-violet-500/20 hover:border-violet-500/40 transition-all flex flex-col gap-2.5 shadow-sm group"
                >
                  {/* Top Bar: Provenance + Epistemic Pill */}
                  <div className="flex items-center justify-between gap-2 text-[10px] font-mono">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="px-1.5 py-0.5 rounded bg-white/5 text-white/70 border border-white/10 truncate">
                        {claim.sourceTitle}
                      </span>
                      {claim.authorOrThinker && (
                        <span className="text-violet-400/90 truncate font-semibold">
                          • {claim.authorOrThinker}
                        </span>
                      )}
                    </div>

                    <span className="px-1.5 py-0.5 rounded bg-violet-950/80 border border-violet-800 text-violet-300 font-bold shrink-0">
                      [{claim.epistemicStatus}]
                    </span>
                  </div>

                  {/* Main Claim Text */}
                  <p className="text-xs text-neutral-200 font-sans leading-relaxed">
                    "{claim.text}"
                  </p>

                  {/* Footer & Interactive Reclassification Toggle */}
                  <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[10px] font-mono text-white/40">
                    <span className="truncate max-w-[180px]" title={claim.provenance}>
                      {claim.provenance}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {claim.noteId && onOpenNote && (
                        <button
                          onClick={() => onOpenNote(claim.noteId!)}
                          className="px-2 py-0.5 rounded bg-white/[0.04] hover:bg-white/[0.08] text-white/60 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                          title="Open note in Vault"
                        >
                          <FileText className="w-3 h-3" />
                          <span>Note</span>
                        </button>
                      )}

                      {onCommitNoteToVault && (
                        <button
                          onClick={() => handleCommitClaimToVault(claim)}
                          className="px-2 py-0.5 rounded bg-white/[0.04] hover:bg-emerald-500/20 text-white/50 hover:text-emerald-300 transition-colors cursor-pointer flex items-center gap-1"
                          title="Commit to Vault Note"
                        >
                          <span>+Vault</span>
                        </button>
                      )}

                      {/* Re-Classification Toggle Switch */}
                      <button
                        onClick={() => handleToggleClassification(claim.id, 'Elevation')}
                        className="px-2.5 py-1 rounded-lg bg-amber-600/20 hover:bg-amber-600/40 border border-amber-500/30 text-amber-300 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer font-semibold shadow-sm"
                        title="Reclassify claim as Phenomenological Occurrence"
                      >
                        <ArrowRightLeft className="w-3 h-3 text-amber-400" />
                        <span>← To Occurrence</span>
                      </button>

                      {claim.id.startsWith('custom_claim_') && (
                        <button
                          onClick={() => handleDeleteCustomClaim(claim.id)}
                          className="p-1 rounded text-white/30 hover:text-rose-400 transition-colors cursor-pointer"
                          title="Delete custom claim"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 5. Quick Ingest Claim Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-lg bg-[#0e0a1a] border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 font-sans"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-violet-400" />
                <h3 className="text-sm font-semibold text-white font-mono uppercase tracking-wider">
                  Ingest Philosophical Segment / Claim
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-white/40 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddCustomClaim} className="flex flex-col gap-4 text-xs font-mono">
              {/* Category Toggle Switch */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] text-white/60">Classification Category:</label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-black/60 rounded-xl border border-white/10">
                  <button
                    type="button"
                    onClick={() => setNewClaimType('Occurrence')}
                    className={`py-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      newClaimType === 'Occurrence'
                        ? 'bg-amber-600 text-white shadow-md'
                        : 'text-white/50 hover:text-white'
                    }`}
                  >
                    <Flame className="w-3.5 h-3.5" />
                    <span>Occurrence (Event)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewClaimType('Elevation')}
                    className={`py-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      newClaimType === 'Elevation'
                        ? 'bg-violet-600 text-white shadow-md'
                        : 'text-white/50 hover:text-white'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Elevation (Transcendent)</span>
                  </button>
                </div>
              </div>

              {/* Claim Text Area */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-white/60">Claim / Segment Text:</label>
                <textarea
                  value={newClaimText}
                  onChange={(e) => setNewClaimText(e.target.value)}
                  placeholder="Enter the philosophical claim, assertion, or textual segment..."
                  rows={4}
                  required
                  className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-violet-500 font-sans"
                />
              </div>

              {/* Source & Thinker Fields */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] text-white/60">Author / Thinker:</label>
                  <input
                    type="text"
                    value={newClaimAuthor}
                    onChange={(e) => setNewClaimAuthor(e.target.value)}
                    placeholder="e.g. Cioran, Nishitani, Eckhart"
                    className="bg-black/50 border border-white/10 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-violet-500 font-sans"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] text-white/60">Source Document:</label>
                  <input
                    type="text"
                    value={newClaimSource}
                    onChange={(e) => setNewClaimSource(e.target.value)}
                    placeholder="e.g. Treatise on Emptiness"
                    className="bg-black/50 border border-white/10 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-violet-500 font-sans"
                  />
                </div>
              </div>

              {/* Epistemic Status */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-white/60">Epistemic Status Label:</label>
                <select
                  value={newClaimEpistemicStatus}
                  onChange={(e) => setNewClaimEpistemicStatus(e.target.value as EpistemicStatus)}
                  className="bg-black/50 border border-white/10 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-violet-500 font-mono"
                >
                  <option value="PHENOMENOLOGICAL">PHENOMENOLOGICAL (Experiential Datum)</option>
                  <option value="APOPHATIC">APOPHATIC (Apophatic Boundary & Negation)</option>
                  <option value="EVIDENCED">EVIDENCED (Textually Grounded)</option>
                  <option value="INFERRED">INFERRED (Logical Deduction)</option>
                  <option value="SPECULATIVE">SPECULATIVE (Ontological Hypothesis)</option>
                  <option value="TENSION">TENSION (Active Dialectical Paradox)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-white/50 hover:text-white text-xs font-mono cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs font-mono transition-all cursor-pointer shadow-lg"
                >
                  Save to Library
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
