import React, { useState, useEffect } from 'react';
import {
  X,
  BookOpen,
  Quote,
  Scale,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  Copy,
  Check,
  Sparkles,
  ExternalLink,
  Brain,
  Zap,
  Split,
  FileText,
  Compass
} from 'lucide-react';
import { motion } from 'motion/react';
import {
  PHILOCRASH_METRIC_PROFILES,
  MetricAutopsyProfile,
  AutopsyLens,
  EpistemicStatusTag,
  getDifferentialPairwiseProfile,
  DifferentialPairwiseProfile
} from '../../data/philocrashAutopsyData';
import { MapComparisonData } from './DisparityHistoryChart';
import { NoteDocument } from '../Nihiltheism/types';

interface PhilocrashAutopsyModalProps {
  isOpen: boolean;
  onClose: () => void;
  metricId: string | null;
  compareMetricId?: string | null;
  currentMap: MapComparisonData;
  onSelectMetric?: (metricId: string) => void;
  onSelectGraphNode?: (nodeId: string) => void;
  onCommitToVault?: (note: NoteDocument) => void;
  onOpenNote?: (noteId: string) => void;
}

export const PhilocrashAutopsyModal: React.FC<PhilocrashAutopsyModalProps> = ({
  isOpen,
  onClose,
  metricId,
  compareMetricId = null,
  currentMap,
  onSelectMetric,
  onSelectGraphNode,
  onCommitToVault,
  onOpenNote
}) => {
  const [activeLens, setActiveLens] = useState<AutopsyLens>('tripartite');
  const [activePhase, setActivePhase] = useState<1 | 2 | 3 | 4>(4);
  const [copiedReport, setCopiedReport] = useState<boolean>(false);
  const [showDeepThinkAudit, setShowDeepThinkAudit] = useState<boolean>(false);
  const [activeComparativePhilosopherIndex, setActiveComparativePhilosopherIndex] = useState<number>(0);
  const [isDifferentialView, setIsDifferentialView] = useState<boolean>(!!compareMetricId);
  const [injectedPremise, setInjectedPremise] = useState<string>('');
  const [appliedCustomPremise, setAppliedCustomPremise] = useState<string | null>(null);
  const [committedNoteId, setCommittedNoteId] = useState<string | null>(null);
  const [isCommitted, setIsCommitted] = useState<boolean>(false);

  // Sync differential mode with props
  useEffect(() => {
    if (compareMetricId) {
      setIsDifferentialView(true);
    }
  }, [compareMetricId]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !metricId) return null;

  const profile: MetricAutopsyProfile =
    PHILOCRASH_METRIC_PROFILES[metricId] || PHILOCRASH_METRIC_PROFILES.composite;

  const compareProfile: MetricAutopsyProfile | null = compareMetricId
    ? PHILOCRASH_METRIC_PROFILES[compareMetricId] || null
    : null;

  const differentialData: DifferentialPairwiseProfile | null = compareMetricId
    ? getDifferentialPairwiseProfile(metricId, compareMetricId)
    : null;

  const currentMetricData = currentMap.metrics.find((m) => m.id === metricId);
  const metricValue = currentMetricData ? currentMetricData.value : 0.5;

  const compareMetricData = compareMetricId
    ? currentMap.metrics.find((m) => m.id === compareMetricId)
    : null;
  const compareMetricValue = compareMetricData ? compareMetricData.value : 0.5;

  const metricIds = ['composite', 'divergence', 'density', 'apophatic', 'gap'];
  const currentIndex = metricIds.indexOf(metricId);

  const handlePrevMetric = () => {
    const prevIdx = (currentIndex - 1 + metricIds.length) % metricIds.length;
    onSelectMetric?.(metricIds[prevIdx]);
  };

  const handleNextMetric = () => {
    const nextIdx = (currentIndex + 1) % metricIds.length;
    onSelectMetric?.(metricIds[nextIdx]);
  };

  // Helper for Epistemic Status Badges
  const renderEpistemicBadge = (tag: EpistemicStatusTag) => {
    const STYLES: Record<EpistemicStatusTag, { bg: string; text: string; border: string }> = {
      'Axiomatic Invariant': { bg: 'bg-emerald-500/15', text: 'text-emerald-300', border: 'border-emerald-500/30' },
      'Phenomenological Datum': { bg: 'bg-cyan-500/15', text: 'text-cyan-300', border: 'border-cyan-500/30' },
      'Dialectical Synthesis': { bg: 'bg-purple-500/15', text: 'text-purple-300', border: 'border-purple-500/30' },
      'Boundary Operator': { bg: 'bg-amber-500/15', text: 'text-amber-300', border: 'border-amber-500/30' },
      'Horizon-Bound / Unverifiable': { bg: 'bg-rose-500/15', text: 'text-rose-300', border: 'border-rose-500/30' }
    };
    const s = STYLES[tag] || STYLES['Dialectical Synthesis'];
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono border ${s.bg} ${s.text} ${s.border}`}>
        [{tag}]
      </span>
    );
  };

  // Commit Full Autopsy to Vault as a Note
  const handleCommitAutopsyToVault = () => {
    const timestamp = Date.now();
    const docId = `autopsy-${metricId}-${timestamp}`;
    const cleanTitle = isDifferentialView && compareProfile
      ? `Autopsy Differential: ${profile.symbol} ⊗ ${compareProfile.symbol}`
      : `Philocrash Autopsy: ${profile.label} (${profile.symbol})`;

    const synthesisTheorem = isDifferentialView && differentialData
      ? differentialData.synthesizedTheorem
      : profile.phase4.constructiveSynthesis.synthesizedElevationTheorem;

    const newDoc: NoteDocument = {
      id: docId,
      title: cleanTitle,
      subtitle: `Epoch: ${currentMap.name} (${currentMap.comparisonLabel}) • Epistemic: [${profile.epistemicStatus}]`,
      folder: '40 – Systems',
      path: `Systems / Autopsies / ${cleanTitle}`,
      quote: `“${synthesisTheorem}”`,
      introParagraph: isDifferentialView && differentialData
        ? `Differential Philocrash Autopsy evaluating cross-metric interference between [[${profile.label}]] (${profile.symbol}) and [[${compareProfile?.label}]] (${compareProfile?.symbol}) during ${currentMap.name}. Covariance Ratio: ${differentialData.covarianceRatio}, Synthesis Index: ${differentialData.constructiveSynthesisIndex}.`
        : `Forensic Philocrash Autopsy of [[${profile.label}]] (${profile.symbol}) at quantitative value ${(metricValue * 100).toFixed(1)}%. Primary Target of Critique: ${profile.phase1.primaryTarget} Transmuted via J314 Elevation into constructive ontological potentiality.`,
      corePrinciples: [
        {
          number: 1,
          title: 'Structural Contradiction Resolution',
          description: profile.phase4.structuralAutopsy.invariantResolution
        },
        {
          number: 2,
          title: 'Doctrinal Kenosis & De-Reification',
          description: profile.phase4.doctrinalAutopsy.invariantResolution
        },
        {
          number: 3,
          title: 'Rhetorical Performative Balance',
          description: profile.phase4.rhetoricalAutopsy.invariantResolution
        },
        {
          number: 4,
          title: 'Synthesized Elevation Theorem',
          description: synthesisTheorem
        }
      ],
      relatedIdeas: [
        '#philocrash',
        '#autopsy',
        `#${metricId}`,
        '#constructive-synthesis',
        '#elevation',
        '#abgrund'
      ],
      closingQuote: profile.phase4.asymptoticInvariantHold,
      backlinksCount: 1,
      wordCount: 320,
      charCount: 2100,
      isCustom: true
    };

    onCommitToVault?.(newDoc);
    setIsCommitted(true);
    setCommittedNoteId(docId);
    setTimeout(() => setIsCommitted(false), 3000);
  };

  const handleCopyReport = () => {
    const theorem = isDifferentialView && differentialData
      ? differentialData.synthesizedTheorem
      : profile.phase4.constructiveSynthesis.synthesizedElevationTheorem;

    const markdown = `# PHILOCRASH AUTOPSY REPORT: ${profile.label} (${profile.symbol})
**Epoch:** ${currentMap.name} (${currentMap.comparisonLabel})
**Quantitative Value:** ${(metricValue * 100).toFixed(1)}% | **Tensor Formula:** ${profile.tensorFormula}
**Epistemic Status:** [${profile.epistemicStatus}]
**Elevation / Occurrence Ratio:** ${profile.phase4.occurrenceVsElevation.ratio} (${profile.phase4.occurrenceVsElevation.statusBadge})

---

## CONSTRUCTIVE ELEVATION THEOREM
> "${theorem}"

- **Boundary Mechanism:** ${profile.phase4.constructiveSynthesis.boundaryMechanism}
- **Eidetic Potentiality:** ${profile.phase4.constructiveSynthesis.eideticPotentiality}
- **Actionable Heuristic:** ${profile.phase4.constructiveSynthesis.actionableHeuristic}

---

## PHASE 1: THE BIG PICTURE
- **Primary Target:** ${profile.phase1.primaryTarget}
- **Core Pillars:**
${profile.phase1.corePillars.map((p) => `  * ${p.title}: ${p.explanation}`).join('\n')}

---

## COMPARATIVE PHILOSOPHER MATRIX (CONSTRUCTIVE RESONANCE & NON-EQUIVALENCE)
${profile.comparativePhilosophers.map((cp) => `### ${cp.philosopher} (${cp.tradition}) [${cp.epistemicTag}]
- **Locus:** ${cp.locus}
- **Constructive Resonance:** ${cp.constructiveResonance}
- **Non-Equivalence Remainder:** ${cp.nonEquivalenceRemainder}
`).join('\n')}

---

## PHASE 4: THE CRUCIBLE & CONTRADICTION AUTOPSY
- **Structural:** ${profile.phase4.structuralAutopsy.invariantResolution}
- **Doctrinal:** ${profile.phase4.doctrinalAutopsy.invariantResolution}
- **Rhetorical:** ${profile.phase4.rhetoricalAutopsy.invariantResolution}
- **Asymptotic Hold:** ${profile.phase4.asymptoticInvariantHold}
`;

    navigator.clipboard?.writeText?.(markdown);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2200);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="philocrash-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-xl animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl max-h-[94vh] flex flex-col bg-[#07050d] border border-white/15 rounded-2xl shadow-[0_0_60px_rgba(0,0,0,0.95),0_0_30px_rgba(245,158,11,0.15)] overflow-hidden text-neutral-200 font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="relative px-5 py-3.5 border-b border-white/10 bg-gradient-to-r from-black/95 via-[#0e081c] to-black/95 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${profile.bgGradient} p-[1px] flex items-center justify-center shadow-md`}>
              <div className="w-full h-full bg-black/80 rounded-[7px] flex items-center justify-center">
                <span className="font-mono text-xs font-bold text-white">{profile.symbol}</span>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 id="philocrash-modal-title" className="text-sm font-semibold tracking-wide text-white">
                  {isDifferentialView && compareProfile
                    ? `Differential Autopsy: ${profile.symbol} vs. ${compareProfile.symbol}`
                    : `Philocrash Autopsy: ${profile.label}`}
                </h2>
                {renderEpistemicBadge(profile.epistemicStatus)}
              </div>
              <p className="text-[11px] font-mono text-white/50">
                {currentMap.name} • {currentMap.comparisonLabel} • Value: {(metricValue * 100).toFixed(0)}%
              </p>
            </div>
          </div>

          {/* Controls: Prev/Next, Differential Toggle, Copy, Close */}
          <div className="flex items-center gap-2 flex-wrap">
            {compareMetricId && (
              <button
                onClick={() => setIsDifferentialView(!isDifferentialView)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono transition-all border ${
                  isDifferentialView
                    ? 'bg-amber-500/20 text-amber-200 border-amber-500/40 shadow-sm'
                    : 'bg-white/5 text-white/60 border-white/10 hover:text-white'
                }`}
              >
                <Split size={12} />
                <span>{isDifferentialView ? 'Pairwise Mode' : 'Single Mode'}</span>
              </button>
            )}

            <div className="flex items-center bg-white/5 rounded-lg border border-white/10 p-0.5">
              <button
                onClick={handlePrevMetric}
                className="p-1 rounded text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                title="Previous Metric (Left Arrow)"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="px-2 text-xs font-mono text-white/70">
                {currentIndex + 1} / {metricIds.length}
              </span>
              <button
                onClick={handleNextMetric}
                className="p-1 rounded text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                title="Next Metric (Right Arrow)"
              >
                <ChevronRight size={14} />
              </button>
            </div>

            <button
              onClick={handleCopyReport}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 transition-colors"
              title="Copy Markdown Autopsy Report"
            >
              {copiedReport ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
              <span>{copiedReport ? 'Copied' : 'Report'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-white/50 hover:text-rose-300 transition-colors"
              title="Close Autopsy (Esc)"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Phase Navigation Tabs */}
        <div className="px-5 py-2 border-b border-white/10 bg-black/60 flex items-center justify-between gap-2 overflow-x-auto shrink-0 font-mono text-xs">
          <div className="flex items-center gap-1.5">
            {[
              { phase: 1, label: 'Phase 1: Big Picture', icon: <BookOpen size={12} /> },
              { phase: 2, label: 'Phase 2: Comparative Matrix', icon: <Quote size={12} /> },
              { phase: 3, label: 'Phase 3: Human Element', icon: <Compass size={12} /> },
              { phase: 4, label: 'Phase 4: The Crucible & Synthesis', icon: <Scale size={12} /> }
            ].map((p) => (
              <button
                key={p.phase}
                onClick={() => setActivePhase(p.phase as any)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all border ${
                  activePhase === p.phase
                    ? 'bg-violet-600/30 text-white border-violet-400 font-semibold shadow-sm'
                    : 'text-white/60 border-white/5 hover:text-white hover:bg-white/5'
                }`}
              >
                {p.icon}
                <span>{p.label}</span>
              </button>
            ))}
          </div>

          {/* Occurrence vs Elevation Sub-Badge */}
          <div className="hidden sm:flex items-center gap-2 text-[11px] text-white/60">
            <span>E/O Ratio:</span>
            <span className="font-bold text-amber-300">{profile.phase4.occurrenceVsElevation.ratio}</span>
            <span className="text-white/40">•</span>
            <span className="text-emerald-300 font-semibold">{profile.phase4.occurrenceVsElevation.statusBadge}</span>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 text-xs sm:text-sm">
          {/* Differential Pairwise Banner (if in differential view) */}
          {isDifferentialView && differentialData && compareProfile && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-gradient-to-r from-violet-950/30 via-black to-amber-950/30 border border-amber-500/30 space-y-2.5 font-mono text-xs"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <div className="flex items-center gap-2 text-amber-300 font-bold">
                  <Split size={14} className="text-amber-400" />
                  <span>Pairwise Differential Autopsy: {differentialData.title}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="text-white/60">Values:</span>
                  <span className="text-amber-300 font-bold">{(metricValue * 100).toFixed(0)}% vs {(compareMetricValue * 100).toFixed(0)}%</span>
                  <span className="text-white/40">•</span>
                  <span className="text-white/60">Covariance:</span>
                  <span className="text-cyan-300 font-bold">{differentialData.covarianceRatio}</span>
                  <span className="text-white/40">•</span>
                  <span className="text-white/60">Synthesis Index:</span>
                  <span className="text-emerald-300 font-bold">{differentialData.constructiveSynthesisIndex}</span>
                </div>
              </div>

              <p className="text-white/80 leading-relaxed font-sans text-xs sm:text-sm">
                <span className="text-amber-400 font-bold font-mono">Interference Diagnosis: </span>
                {differentialData.crossInterferenceDiagnosis}
              </p>

              <div className="p-2.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-200">
                <span className="font-bold">Synthesized Cross-Metric Theorem: </span>
                <span className="italic font-serif">"{differentialData.synthesizedTheorem}"</span>
              </div>
            </motion.div>
          )}

          {/* PHASE 1: THE BIG PICTURE */}
          {activePhase === 1 && (
            <motion.div
              key="phase-1"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Primary Target Banner */}
              <div className="p-4 rounded-xl bg-rose-950/15 border border-rose-500/25 space-y-1.5">
                <span className="text-xs font-mono uppercase text-rose-400 font-bold flex items-center gap-1.5">
                  <AlertTriangle size={13} />
                  <span>Primary Target of Critique</span>
                </span>
                <p className="text-white/90 leading-relaxed">{profile.phase1.primaryTarget}</p>
              </div>

              {/* Core Pillars Grid */}
              <div className="space-y-2">
                <h3 className="text-xs font-mono uppercase text-white/60 font-semibold tracking-wider">
                  Architectural Pillars
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {profile.phase1.corePillars.map((p, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-1 hover:border-violet-500/30 transition-colors"
                    >
                      <h4 className="text-xs font-mono font-bold text-violet-300">{p.title}</h4>
                      <p className="text-xs text-white/70 leading-relaxed">{p.explanation}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Primary Texts */}
              <div className="space-y-2">
                <h3 className="text-xs font-mono uppercase text-white/60 font-semibold tracking-wider">
                  Canonical Treatises & Locus
                </h3>
                <div className="space-y-2">
                  {profile.phase1.primaryTexts.map((t, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-1">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-amber-400 font-bold">{t.author} — "{t.treatise}"</span>
                        <span className="text-white/40">{t.locus}</span>
                      </div>
                      <p className="text-xs text-white/75">{t.context}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* PHASE 2: COMPARATIVE PHILOSOPHER MATRIX */}
          {activePhase === 2 && (
            <motion.div
              key="phase-2"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="text-xs font-mono uppercase text-amber-400 font-bold tracking-wider">
                    Comparative Philosopher Matrix: Constructive Resonance & Non-Equivalence Remainder
                  </h3>
                  <p className="text-[11px] text-white/50">
                    Nihiltheism engages 7 philosophical traditions, extracting constructive synthesis while honoring irreducible differences.
                  </p>
                </div>
              </div>

              {/* Philosopher Selector Buttons */}
              <div className="flex flex-wrap gap-1.5 pb-2 border-b border-white/10">
                {profile.comparativePhilosophers.map((cp, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveComparativePhilosopherIndex(idx)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all border flex items-center gap-1.5 ${
                      activeComparativePhilosopherIndex === idx
                        ? 'bg-amber-500/20 text-amber-200 border-amber-500/40 shadow-sm font-bold'
                        : 'bg-white/5 text-white/60 border-white/10 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <span>{cp.philosopher}</span>
                    <span className="text-[9px] opacity-70">[{cp.epistemicTag.slice(0, 4)}]</span>
                  </button>
                ))}
              </div>

              {/* Selected Philosopher Detailed Card */}
              {profile.comparativePhilosophers[activeComparativePhilosopherIndex] && (
                <div className="p-4 rounded-xl bg-gradient-to-br from-white/[0.04] to-black/60 border border-white/15 space-y-3.5">
                  {(() => {
                    const cp = profile.comparativePhilosophers[activeComparativePhilosopherIndex];
                    return (
                      <>
                        <div className="flex items-center justify-between border-b border-white/10 pb-2 flex-wrap gap-2">
                          <div>
                            <span className="text-base font-bold text-white">{cp.philosopher}</span>
                            <span className="text-white/40 text-xs font-mono ml-2">({cp.tradition})</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-white/50">{cp.locus}</span>
                            {renderEpistemicBadge(cp.epistemicTag)}
                          </div>
                        </div>

                        {/* Constructive Resonance */}
                        <div className="p-3 rounded-lg bg-emerald-950/15 border border-emerald-500/25 space-y-1">
                          <span className="text-xs font-mono uppercase text-emerald-400 font-bold flex items-center gap-1.5">
                            <Check size={12} />
                            <span>Constructive Resonance with Nihiltheism</span>
                          </span>
                          <p className="text-xs sm:text-sm text-white/85 leading-relaxed">{cp.constructiveResonance}</p>
                        </div>

                        {/* Non-Equivalence Remainder */}
                        <div className="p-3 rounded-lg bg-amber-950/15 border border-amber-500/25 space-y-1">
                          <span className="text-xs font-mono uppercase text-amber-400 font-bold flex items-center gap-1.5">
                            <AlertTriangle size={12} />
                            <span>Non-Equivalence Remainder (Irreducible Difference)</span>
                          </span>
                          <p className="text-xs sm:text-sm text-white/85 leading-relaxed">{cp.nonEquivalenceRemainder}</p>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}

              {/* Psychological Friction & Lexicon */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-1.5">
                  <span className="text-xs font-mono uppercase text-purple-400 font-bold">
                    Psychological Friction Point
                  </span>
                  <p className="text-xs font-semibold text-white">{profile.phase2.psychologicalFriction.frictionType}</p>
                  <p className="text-xs text-white/70">{profile.phase2.psychologicalFriction.phenomenologicalDescription}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-1.5">
                  <span className="text-xs font-mono uppercase text-cyan-400 font-bold">
                    Aporia Signal & Trigger
                  </span>
                  <p className="text-xs text-white/80 font-mono">{profile.phase2.psychologicalFriction.aporiaSignal}</p>
                  <p className="text-xs text-white/60">{profile.phase2.individualVsCollective}</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* PHASE 3: THE HUMAN ELEMENT */}
          {activePhase === 3 && (
            <motion.div
              key="phase-3"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="p-4 rounded-xl bg-gradient-to-r from-violet-950/20 to-black/60 border border-violet-500/30 space-y-1.5">
                <span className="text-xs font-mono uppercase text-violet-300 font-bold">
                  Definition of Authentic Selfhood
                </span>
                <p className="text-white/90 leading-relaxed italic font-serif text-sm">
                  "{profile.phase3.authenticSelfhood}"
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Threats to Individuality */}
                <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-2">
                  <span className="text-xs font-mono uppercase text-rose-400 font-bold">
                    Threats to Subjective Lucidity
                  </span>
                  <ul className="space-y-1.5 text-xs text-white/75">
                    {profile.phase3.threatsToIndividuality.map((t, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-rose-400 font-mono">•</span>
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Subtractive Leap (Gelassenheit) */}
                <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-2">
                  <span className="text-xs font-mono uppercase text-emerald-400 font-bold">
                    The Subtractive Leap (Gelassenheit)
                  </span>
                  <p className="text-xs text-white/80 leading-relaxed">{profile.phase3.subtractiveLeap}</p>
                </div>
              </div>

              {/* Injunctions for Subjective Accountability */}
              <div className="p-3.5 rounded-xl bg-amber-950/15 border border-amber-500/20 space-y-2">
                <span className="text-xs font-mono uppercase text-amber-300 font-bold">
                  Injunctions for Personal Accountability
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {profile.phase3.personalAccountabilityInjunctions.map((i, idx) => (
                    <div key={idx} className="p-2.5 rounded bg-black/40 border border-white/5 text-xs text-white/80">
                      <span className="text-amber-400 font-mono font-bold mr-1">§{idx + 1}</span>
                      {i}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* PHASE 4: THE CRUCIBLE, CONTRADICTION AUTOPSY & SYNTHESIZED ELEVATION */}
          {activePhase === 4 && (
            <motion.div
              key="phase-4"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Flagship Banner: Synthesized Elevation Theorem */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-violet-950/40 via-[#0d091a] to-amber-950/30 border border-amber-500/40 space-y-3 shadow-[0_0_20px_rgba(245,158,11,0.1)]">
                <div className="flex items-center justify-between border-b border-white/10 pb-2 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Sparkles size={15} className="text-amber-400" />
                    <span className="text-xs font-mono font-bold text-amber-300 uppercase tracking-wider">
                      Synthesized Elevation Theorem & Boundary Resolution
                    </span>
                  </div>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-200 border border-amber-500/30">
                    J314 Core Resolution
                  </span>
                </div>

                <p className="text-sm sm:text-base text-white/95 leading-relaxed font-serif italic">
                  "{profile.phase4.constructiveSynthesis.synthesizedElevationTheorem}"
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 text-xs font-mono border-t border-white/10">
                  <div className="p-2.5 rounded bg-white/[0.03] border border-white/5">
                    <span className="text-cyan-300 font-bold block mb-1">Boundary Mechanism:</span>
                    <span className="text-white/70 font-sans text-xs">{profile.phase4.constructiveSynthesis.boundaryMechanism}</span>
                  </div>
                  <div className="p-2.5 rounded bg-white/[0.03] border border-white/5">
                    <span className="text-purple-300 font-bold block mb-1">Eidetic Potentiality:</span>
                    <span className="text-white/70 font-sans text-xs">{profile.phase4.constructiveSynthesis.eideticPotentiality}</span>
                  </div>
                  <div className="p-2.5 rounded bg-white/[0.03] border border-white/5">
                    <span className="text-emerald-300 font-bold block mb-1">Actionable Heuristic:</span>
                    <span className="text-white/70 font-sans text-xs">{profile.phase4.constructiveSynthesis.actionableHeuristic}</span>
                  </div>
                </div>
              </div>

              {/* Tripartite Contradiction Autopsy Lens Switcher */}
              <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
                <span className="text-xs font-mono text-white/60 uppercase">Contradiction Autopsy Lenses:</span>
                <div className="flex items-center gap-1 bg-black/60 p-1 rounded-xl border border-white/10">
                  {(['tripartite', 'structural', 'doctrinal', 'rhetorical'] as AutopsyLens[]).map((lens) => (
                    <button
                      key={lens}
                      onClick={() => setActiveLens(lens)}
                      className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${
                        activeLens === lens
                          ? 'bg-amber-500/20 text-amber-200 border border-amber-500/40 shadow-sm font-semibold'
                          : 'text-white/50 hover:text-white'
                      }`}
                    >
                      {lens.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Contradiction Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Structural */}
                {(activeLens === 'tripartite' || activeLens === 'structural') && (
                  <div className="p-3.5 rounded-xl bg-violet-950/15 border border-violet-500/25 space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono font-bold text-violet-300 border-b border-violet-500/20 pb-1.5">
                      <span>1. STRUCTURAL AUTOPSY</span>
                      <span>Formal Tension</span>
                    </div>
                    <p className="text-xs text-white/85 leading-relaxed">
                      <span className="text-rose-400 font-semibold font-mono">Contradiction: </span>
                      {profile.phase4.structuralAutopsy.contradiction}
                    </p>
                    <p className="text-xs text-white/70">
                      <span className="text-amber-400 font-semibold font-mono">Aporia: </span>
                      {profile.phase4.structuralAutopsy.aporia}
                    </p>
                    <div className="p-2 rounded bg-violet-500/10 border border-violet-500/20 text-xs text-violet-200">
                      <span className="font-bold font-mono">Resolution: </span>
                      {profile.phase4.structuralAutopsy.invariantResolution}
                    </div>
                  </div>
                )}

                {/* Doctrinal */}
                {(activeLens === 'tripartite' || activeLens === 'doctrinal') && (
                  <div className="p-3.5 rounded-xl bg-amber-950/15 border border-amber-500/25 space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono font-bold text-amber-300 border-b border-amber-500/20 pb-1.5">
                      <span>2. DOCTRINAL AUTOPSY</span>
                      <span>Theological Reification</span>
                    </div>
                    <p className="text-xs text-white/85 leading-relaxed">
                      <span className="text-rose-400 font-semibold font-mono">Contradiction: </span>
                      {profile.phase4.doctrinalAutopsy.contradiction}
                    </p>
                    <p className="text-xs text-white/70">
                      <span className="text-amber-400 font-semibold font-mono">Reification Risk: </span>
                      {profile.phase4.doctrinalAutopsy.dogmaticReificationRisk}
                    </p>
                    <div className="p-2 rounded bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200">
                      <span className="font-bold font-mono">Resolution: </span>
                      {profile.phase4.doctrinalAutopsy.invariantResolution}
                    </div>
                  </div>
                )}

                {/* Rhetorical */}
                {(activeLens === 'tripartite' || activeLens === 'rhetorical') && (
                  <div className="p-3.5 rounded-xl bg-cyan-950/15 border border-cyan-500/25 space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono font-bold text-cyan-300 border-b border-cyan-500/20 pb-1.5">
                      <span>3. RHETORICAL AUTOPSY</span>
                      <span>Performative Paradox</span>
                    </div>
                    <p className="text-xs text-white/85 leading-relaxed">
                      <span className="text-rose-400 font-semibold font-mono">Contradiction: </span>
                      {profile.phase4.rhetoricalAutopsy.contradiction}
                    </p>
                    <p className="text-xs text-white/70">
                      <span className="text-amber-400 font-semibold font-mono">Stylistic Paradox: </span>
                      {profile.phase4.rhetoricalAutopsy.stylisticParadox}
                    </p>
                    <div className="p-2 rounded bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-200">
                      <span className="font-bold font-mono">Resolution: </span>
                      {profile.phase4.rhetoricalAutopsy.invariantResolution}
                    </div>
                  </div>
                )}
              </div>

              {/* Asymptotic Hold Banner */}
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-violet-500/10 to-transparent border border-amber-500/30 flex items-center justify-between text-xs font-mono">
                <span className="text-white/90">
                  <span className="font-bold text-amber-400">Asymptotic Convergence: </span>
                  {profile.phase4.asymptoticInvariantHold}
                </span>
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] shrink-0 ml-2">
                  θ = 0.18 Hold
                </span>
              </div>
            </motion.div>
          )}

          {/* DeepThinker-CA Interactive Cognitive Audit Engine */}
          {showDeepThinkAudit && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-4 rounded-xl bg-[#090614] border border-amber-500/40 space-y-4 font-mono text-xs shadow-lg"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <div className="flex items-center gap-2 text-amber-300 font-bold">
                  <Brain size={15} className="text-amber-400" />
                  <span>DeepThinker-CA Meta-Cognitive Audit: {profile.label}</span>
                </div>
                <button
                  onClick={() => setShowDeepThinkAudit(false)}
                  className="text-white/40 hover:text-white"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Interactive Premise Injection */}
              <div className="p-3 rounded-lg bg-black/50 border border-white/10 space-y-2">
                <label className="text-[11px] text-white/60 block">
                  Inject Alternative Hypothesis or User Premise:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={injectedPremise}
                    onChange={(e) => setInjectedPremise(e.target.value)}
                    placeholder="e.g. 'Can Nothingness possess teleological intentionality?'"
                    className="flex-1 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500/50 font-mono"
                  />
                  <button
                    onClick={() => setAppliedCustomPremise(injectedPremise || null)}
                    className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold transition-colors"
                  >
                    Audit Premise
                  </button>
                </div>
              </div>

              {/* 5-Step Recursive Process */}
              <div className="space-y-2.5">
                <div className="p-2.5 rounded bg-white/[0.03] border border-emerald-500/20">
                  <span className="text-emerald-400 font-bold">🟢 STEP 1: INITIAL THESIS</span>
                  <p className="text-white/85 mt-1 font-sans text-xs">
                    {appliedCustomPremise
                      ? `Testing Premise: "${appliedCustomPremise}" against metric ${profile.symbol}.`
                      : `Disparity metric ${profile.symbol} objectively measures cognitive distortion between philosophical models and reality.`}
                  </p>
                </div>

                <div className="p-2.5 rounded bg-white/[0.03] border border-red-500/20">
                  <span className="text-red-400 font-bold">🔴 STEP 2: DUAL-PATH CRITIQUE (The Incinerator)</span>
                  <p className="text-white/85 mt-1 font-sans text-xs">
                    Any metric applied to radical Nothingness is a category error. By assigning numerical eigenvalues or ratios, the system secretly posits an ontological substance to measure. The formula is guilty of Pythagorean reification.
                  </p>
                </div>

                <div className="p-2.5 rounded bg-white/[0.03] border border-purple-500/20">
                  <span className="text-purple-400 font-bold">🟣 STEP 3: ORTHOGONAL PIVOT (System 3 Meta-Critique)</span>
                  <p className="text-white/85 mt-1 font-sans text-xs">
                    The blind spot of both Step 1 and Step 2 is assuming measurement must represent an entity. The third angle: {profile.symbol} is an operational boundary operator, not a descriptive ruler. It records the curvature of human resistance, not the substance of the Void.
                  </p>
                </div>

                <div className="p-2.5 rounded bg-white/[0.03] border border-amber-500/20">
                  <span className="text-amber-400 font-bold">🟡 STEP 4: HOLISTIC SYNTHESIS (The Lattice)</span>
                  <p className="text-white/85 mt-1 font-sans text-xs">
                    Applying Nāgārjuna’s Two Truths (Samvṛti & Paramārtha), the metric functions on the conventional plane to dissolve conventional dogmatism. When the threshold θ = 0.18 is attained, the metric dissolves its own necessity.
                  </p>
                </div>

                <div className="p-2.5 rounded bg-white/[0.03] border border-cyan-500/20">
                  <span className="text-cyan-400 font-bold">💎 STEP 5: FINAL VERDICT & CONSTRUCTIVE ANSWER</span>
                  <p className="text-white/95 mt-1 font-sans text-xs">
                    <span className="font-bold">Confidence: 96%.</span> {profile.label} is validated as an indispensable negative hygiene and constructive bridge to timeless Platonic potentiality.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Footer Actions & Commit to Vault */}
        <div className="px-5 py-3.5 border-t border-white/10 bg-black/90 flex flex-wrap items-center justify-between gap-3 shrink-0 font-mono text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowDeepThinkAudit(!showDeepThinkAudit)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/15 hover:bg-purple-500/25 text-purple-200 border border-purple-500/40 transition-colors"
            >
              <Brain size={13} className="text-purple-400" />
              <span>{showDeepThinkAudit ? 'Hide Cognitive Audit' : 'DeepThinker-CA Audit'}</span>
            </button>

            {onSelectGraphNode && profile.correlatedGraphNodeId && (
              <button
                onClick={() => {
                  onSelectGraphNode(profile.correlatedGraphNodeId);
                  onClose();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 transition-colors"
                title={`Inspect correlated knowledge graph node '${profile.correlatedGraphNodeId}'`}
              >
                <ExternalLink size={13} />
                <span>Locate in Graph</span>
              </button>
            )}

            {committedNoteId && onOpenNote && (
              <button
                onClick={() => {
                  onOpenNote(committedNoteId);
                  onClose();
                }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-violet-600/30 text-violet-200 border border-violet-400 transition-colors"
              >
                <FileText size={12} />
                <span>Open Created Note</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleCommitAutopsyToVault}
              disabled={isCommitted}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg font-bold transition-all shadow-md ${
                isCommitted
                  ? 'bg-emerald-500 text-black shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                  : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.3)]'
              }`}
            >
              {isCommitted ? (
                <>
                  <Check size={13} />
                  <span>Elevated & Committed!</span>
                </>
              ) : (
                <>
                  <Zap size={13} />
                  <span>Elevate & Commit to Vault</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
