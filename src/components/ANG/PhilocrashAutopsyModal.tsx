import React, { useState, useEffect } from 'react';
import {
  X,
  Layers,
  BookOpen,
  Quote,
  UserCheck,
  Scale,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  Copy,
  Check,
  Sparkles,
  ExternalLink,
  ShieldAlert,
  Brain,
  Hash,
  Flame
} from 'lucide-react';
import { motion } from 'motion/react';
import {
  PHILOCRASH_METRIC_PROFILES,
  MetricAutopsyProfile,
  AutopsyLens
} from '../../data/philocrashAutopsyData';
import { MapComparisonData } from './DisparityHistoryChart';

interface PhilocrashAutopsyModalProps {
  isOpen: boolean;
  onClose: () => void;
  metricId: string | null;
  currentMap: MapComparisonData;
  onSelectMetric?: (metricId: string) => void;
  onSelectGraphNode?: (nodeId: string) => void;
}

export const PhilocrashAutopsyModal: React.FC<PhilocrashAutopsyModalProps> = ({
  isOpen,
  onClose,
  metricId,
  currentMap,
  onSelectMetric,
  onSelectGraphNode
}) => {
  const [activeLens, setActiveLens] = useState<AutopsyLens>('structural');
  const [activePhase, setActivePhase] = useState<1 | 2 | 3 | 4>(4);
  const [copiedReport, setCopiedReport] = useState<boolean>(false);
  const [showDeepThinkAudit, setShowDeepThinkAudit] = useState<boolean>(false);

  // Close on Escape key, arrow keys to cycle metrics
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
  const currentMetricData = currentMap.metrics.find((m) => m.id === metricId);
  const metricValue = currentMetricData ? currentMetricData.value : 0.5;

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

  const handleCopyReport = () => {
    const markdown = `# PHILOCRASH AUTOPSY REPORT: ${profile.label} (${profile.symbol})
**Map Epoch:** ${currentMap.name} (${currentMap.comparisonLabel})
**Quantitative Value:** ${(metricValue * 100).toFixed(1)}% | **Tensor:** ${profile.tensorFormula}
**Autopsy Lens:** ${activeLens.toUpperCase()} CONTRADICTION

---

## PHASE 1: THE BIG PICTURE
- **Primary Target of Critique:** ${profile.phase1.primaryTarget}
- **Core Pillars:**
${profile.phase1.corePillars.map((p) => `  * ${p.title}: ${p.explanation}`).join('\n')}
- **Primary Canonical Treatises:**
${profile.phase1.primaryTexts.map((t) => `  * ${t.author} - "${t.treatise}" (${t.locus}): ${t.context}`).join('\n')}
- **Literary & Dialectical Architecture:** ${profile.phase1.literaryStyle}

---

## PHASE 2: CORE VOCABULARY & PSYCHOLOGICAL FRICTION
- **Canonical Quotes:**
${profile.phase2.canonicalQuotes.map((q) => `  > "${q.quote}" — ${q.source}\n    *Commentary:* ${q.commentary}`).join('\n\n')}
- **Psychological Friction:** ${profile.phase2.psychologicalFriction.frictionType}
  ${profile.phase2.psychologicalFriction.phenomenologicalDescription}
  *Aporia Signal:* ${profile.phase2.psychologicalFriction.aporiaSignal}
- **Individual vs. Collective Metaphysics:** ${profile.phase2.individualVsCollective}

---

## PHASE 3: THE HUMAN ELEMENT & AUTHENTICITY
- **Definition of Authentic Selfhood:** ${profile.phase3.authenticSelfhood}
- **Greatest Threats to Selfhood:**
${profile.phase3.threatsToIndividuality.map((t) => `  * ${t}`).join('\n')}
- **The Subtractive Leap (Gelassenheit):** ${profile.phase3.subtractiveLeap}
- **Injunctions for Subjective Accountability:**
${profile.phase3.personalAccountabilityInjunctions.map((i) => `  * ${i}`).join('\n')}

---

## PHASE 4: THE CRUCIBLE & CONTRADICTION AUTOPSY
- **Structural Autopsy:**
  * Contradiction: ${profile.phase4.structuralAutopsy.contradiction}
  * Formal Mechanism: ${profile.phase4.structuralAutopsy.formalMechanism}
  * Aporia: ${profile.phase4.structuralAutopsy.aporia}
  * Invariant Resolution: ${profile.phase4.structuralAutopsy.invariantResolution}
- **Doctrinal Autopsy:**
  * Contradiction: ${profile.phase4.doctrinalAutopsy.contradiction}
  * Reification Risk: ${profile.phase4.doctrinalAutopsy.dogmaticReificationRisk}
  * Aporia: ${profile.phase4.doctrinalAutopsy.aporia}
  * Invariant Resolution: ${profile.phase4.doctrinalAutopsy.invariantResolution}
- **Rhetorical Autopsy:**
  * Contradiction: ${profile.phase4.rhetoricalAutopsy.contradiction}
  * Stylistic Paradox: ${profile.phase4.rhetoricalAutopsy.stylisticParadox}
  * Aporia: ${profile.phase4.rhetoricalAutopsy.aporia}
  * Invariant Resolution: ${profile.phase4.rhetoricalAutopsy.invariantResolution}
- **Asymptotic Invariant Hold:** ${profile.phase4.asymptoticInvariantHold}
`;

    navigator.clipboard.writeText(markdown);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2200);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="philocrash-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-8 bg-black/85 backdrop-blur-xl animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl max-h-[92vh] flex flex-col bg-[#07050d] border border-white/15 rounded-2xl shadow-[0_0_60px_rgba(0,0,0,0.9),0_0_30px_rgba(245,158,11,0.12)] overflow-hidden text-neutral-200 font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Cosmic Header Bar */}
        <div className="relative px-5 py-4 border-b border-white/10 bg-gradient-to-r from-black/90 via-[#0f0919] to-black/90 flex flex-wrap items-center justify-between gap-3 shrink-0">
          {/* Subtle Ambient Cosmic Line */}
          <div
            className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-80"
            style={{
              boxShadow: `0 0 12px ${profile.color}`
            }}
          />

          {/* Left: Metric Identity & Symbol Badge */}
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-mono font-bold text-sm shadow-inner border"
              style={{
                backgroundColor: `${profile.color}20`,
                borderColor: `${profile.color}60`,
                color: profile.color
              }}
            >
              {profile.symbol}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2
                  id="philocrash-modal-title"
                  className="text-base sm:text-lg font-bold text-white tracking-wide flex items-center gap-2 font-mono"
                >
                  <span>{profile.label}</span>
                  <span className="text-xs px-2 py-0.5 rounded font-mono font-normal bg-white/5 border border-white/10 text-white/70">
                    Autopsy
                  </span>
                </h2>
              </div>
              <p className="text-xs text-white/50 font-mono flex items-center gap-2 mt-0.5">
                <span>Epoch: {currentMap.name} ({currentMap.epoch})</span>
                <span className="text-white/20">•</span>
                <span className="text-amber-400/90 font-semibold">{(metricValue * 100).toFixed(0)}% Value</span>
                <span className="text-white/20">•</span>
                <span className="text-white/40">{profile.tensorFormula}</span>
              </p>
            </div>
          </div>

          {/* Right: Quick Metric Switcher & Close */}
          <div className="flex items-center gap-2">
            {/* Metric Navigator Arrows */}
            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg border border-white/10">
              <button
                onClick={handlePrevMetric}
                className="p-1 rounded text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                title="Previous Metric Autopsy (Arrow Left)"
                aria-label="Previous metric"
              >
                <ChevronLeft size={14} />
              </button>
              <div className="flex items-center gap-1 px-1">
                {metricIds.map((id) => {
                  const m = PHILOCRASH_METRIC_PROFILES[id];
                  const isCurrent = id === metricId;
                  return (
                    <button
                      key={id}
                      onClick={() => onSelectMetric?.(id)}
                      className={`px-1.5 py-0.5 text-[10px] font-mono rounded transition-all ${
                        isCurrent
                          ? 'bg-amber-500/30 text-amber-200 font-bold border border-amber-500/50'
                          : 'text-white/40 hover:text-white hover:bg-white/5 border border-transparent'
                      }`}
                      title={`Inspect ${m.label}`}
                    >
                      {m.symbol}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={handleNextMetric}
                className="p-1 rounded text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                title="Next Metric Autopsy (Arrow Right)"
                aria-label="Next metric"
              >
                <ChevronRight size={14} />
              </button>
            </div>

            {/* Copy Report Button */}
            <button
              onClick={handleCopyReport}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 transition-colors"
              title="Copy Philocrash Autopsy Report in Markdown"
            >
              {copiedReport ? (
                <>
                  <Check size={12} className="text-emerald-400" />
                  <span className="text-emerald-300">Copied</span>
                </>
              ) : (
                <>
                  <Copy size={12} />
                  <span>Report</span>
                </>
              )}
            </button>

            {/* Close Modal Button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 border border-white/5 transition-colors"
              aria-label="Close modal"
              title="Close Autopsy Modal (Esc)"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Sub-Header Navigation: Philocrash 4-Phase Stepper + Autopsy Lens Selector */}
        <div className="px-5 py-2.5 bg-black/60 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 shrink-0">
          {/* Philocrash 4-Phase Tabs */}
          <div className="flex items-center gap-1 sm:gap-2">
            <span className="text-[10px] uppercase font-mono tracking-wider text-white/40 mr-1 hidden sm:inline">
              Philocrash Framework:
            </span>

            {[
              { phase: 1, label: 'Phase 1: Big Picture', icon: BookOpen },
              { phase: 2, label: 'Phase 2: Vocabulary', icon: Quote },
              { phase: 3, label: 'Phase 3: Human Element', icon: UserCheck },
              { phase: 4, label: 'Phase 4: The Crucible', icon: Scale }
            ].map(({ phase, label, icon: Icon }) => {
              const isActive = activePhase === phase;
              return (
                <button
                  key={phase}
                  onClick={() => setActivePhase(phase as 1 | 2 | 3 | 4)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono transition-all border ${
                    isActive
                      ? 'bg-amber-500/20 text-amber-200 border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.2)] font-semibold'
                      : 'text-white/60 hover:text-white hover:bg-white/5 border-transparent'
                  }`}
                >
                  <Icon size={12} />
                  <span>{label}</span>
                </button>
              );
            })}
          </div>

          {/* Autopsy Lens Switcher (Structural / Doctrinal / Rhetorical / Tripartite) */}
          <div className="flex items-center gap-1 bg-white/[0.04] p-1 rounded-lg border border-white/10">
            <span className="text-[10px] font-mono text-white/40 px-1 hidden md:inline">
              Autopsy Lens:
            </span>
            <button
              onClick={() => setActiveLens('structural')}
              className={`px-2 py-0.5 rounded text-[11px] font-mono transition-all ${
                activeLens === 'structural'
                  ? 'bg-red-500/30 text-red-200 border border-red-500/50 font-bold'
                  : 'text-white/50 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
              title="Examine Structural / Formal contradictions in topological measurement"
            >
              Structural
            </button>
            <button
              onClick={() => setActiveLens('doctrinal')}
              className={`px-2 py-0.5 rounded text-[11px] font-mono transition-all ${
                activeLens === 'doctrinal'
                  ? 'bg-purple-500/30 text-purple-200 border border-purple-500/50 font-bold'
                  : 'text-white/50 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
              title="Examine Doctrinal / Ideological contradictions between philosophical systems"
            >
              Doctrinal
            </button>
            <button
              onClick={() => setActiveLens('rhetorical')}
              className={`px-2 py-0.5 rounded text-[11px] font-mono transition-all ${
                activeLens === 'rhetorical'
                  ? 'bg-amber-500/30 text-amber-200 border border-amber-500/50 font-bold'
                  : 'text-white/50 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
              title="Examine Rhetorical / Performative paradoxes of articulating the unconditioned"
            >
              Rhetorical
            </button>
            <button
              onClick={() => setActiveLens('tripartite')}
              className={`px-2 py-0.5 rounded text-[11px] font-mono transition-all ${
                activeLens === 'tripartite'
                  ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-500/50 font-bold'
                  : 'text-white/50 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
              title="Comparative tripartite view: Structural, Doctrinal & Rhetorical simultaneously"
            >
              Tripartite
            </button>
          </div>
        </div>

        {/* Scrollable Main Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 text-sm">
          {/* Phase 1: The Big Picture */}
          {activePhase === 1 && (
            <motion.div
              key="phase-1"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Primary Target of Critique */}
              <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/30 space-y-2">
                <div className="flex items-center gap-2 text-red-400 font-mono text-xs uppercase tracking-wider font-semibold">
                  <ShieldAlert size={14} />
                  <span>Primary Mission & Target of Critique</span>
                </div>
                <p className="text-white/90 text-sm leading-relaxed">
                  {profile.phase1.primaryTarget}
                </p>
              </div>

              {/* Core Pillars Grid */}
              <div className="space-y-3">
                <h3 className="text-xs uppercase font-mono tracking-wider text-white/50 flex items-center gap-2">
                  <Layers size={13} className="text-amber-400" />
                  <span>Foundational Philosophical Pillars (4–5 Axioms)</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {profile.phase1.corePillars.map((pillar, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all space-y-1.5"
                    >
                      <div className="flex items-center gap-2 font-mono text-xs text-amber-300 font-semibold">
                        <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center text-[10px]">
                          {idx + 1}
                        </span>
                        <span>{pillar.title}</span>
                      </div>
                      <p className="text-xs text-white/70 leading-relaxed pl-7">
                        {pillar.explanation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Primary Texts & Canonical Treatises */}
              <div className="space-y-3">
                <h3 className="text-xs uppercase font-mono tracking-wider text-white/50 flex items-center gap-2">
                  <BookOpen size={13} className="text-cyan-400" />
                  <span>Canonical Written Works & Treatises</span>
                </h3>
                <div className="space-y-2.5">
                  {profile.phase1.primaryTexts.map((text, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="font-bold text-white text-sm">
                          {text.author} — <span className="italic text-amber-300">"{text.treatise}"</span>
                        </span>
                        <span className="text-white/40 text-[11px] bg-white/5 px-2 py-0.5 rounded">
                          {text.locus}
                        </span>
                      </div>
                      <p className="text-xs text-white/70 leading-relaxed">
                        {text.context}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Literary Style & Architecture */}
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 space-y-1">
                <span className="text-[10px] font-mono uppercase text-white/40 tracking-wider">
                  Literary Architecture & Dialectical Devices
                </span>
                <p className="text-xs text-white/80 leading-relaxed">
                  {profile.phase1.literaryStyle}
                </p>
              </div>
            </motion.div>
          )}

          {/* Phase 2: Core Vocabulary & Psychological Friction */}
          {activePhase === 2 && (
            <motion.div
              key="phase-2"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Canonical Quotes */}
              <div className="space-y-3">
                <h3 className="text-xs uppercase font-mono tracking-wider text-white/50 flex items-center gap-2">
                  <Quote size={13} className="text-amber-400" />
                  <span>Canonical Quotations & Primary Anchor Insights</span>
                </h3>
                <div className="space-y-3">
                  {profile.phase2.canonicalQuotes.map((q, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-gradient-to-r from-amber-950/15 via-black/40 to-transparent border border-amber-500/20 space-y-2"
                    >
                      <blockquote className="text-sm italic text-amber-100 font-serif leading-relaxed border-l-2 border-amber-400 pl-3">
                        "{q.quote}"
                      </blockquote>
                      <div className="flex items-center justify-between text-xs font-mono text-white/50 pt-1">
                        <span>— {q.source}</span>
                      </div>
                      <p className="text-xs text-white/70 font-mono bg-black/30 p-2 rounded border border-white/5">
                        <span className="text-amber-400/90 font-semibold">Commentary: </span>
                        {q.commentary}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Psychological Friction Autopsy */}
              <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-purple-300 font-mono text-xs uppercase tracking-wider font-semibold">
                    <AlertTriangle size={14} />
                    <span>Psychological Friction Autopsy: {profile.phase2.psychologicalFriction.frictionType}</span>
                  </div>
                  <span className="text-[10px] font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                    Aporia Trigger
                  </span>
                </div>
                <p className="text-xs text-white/80 leading-relaxed">
                  {profile.phase2.psychologicalFriction.phenomenologicalDescription}
                </p>
                <div className="p-2.5 rounded-lg bg-black/40 border border-purple-500/20 text-xs font-mono text-purple-200">
                  <span className="font-semibold text-purple-300">Tensor Signal: </span>
                  {profile.phase2.psychologicalFriction.aporiaSignal}
                </div>
              </div>

              {/* Individual vs. Collective Metaphysics */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-1.5">
                <span className="text-[10px] font-mono uppercase text-white/40 tracking-wider">
                  The Tension between Individual Consciousness & Collective Metaphysical Illusion
                </span>
                <p className="text-xs text-white/80 leading-relaxed">
                  {profile.phase2.individualVsCollective}
                </p>
              </div>

              {/* Specialized Nihiltheistic Lexicon */}
              <div className="space-y-3">
                <h3 className="text-xs uppercase font-mono tracking-wider text-white/50 flex items-center gap-2">
                  <Hash size={13} className="text-emerald-400" />
                  <span>Specialized Lexicon & Invented Vocabulary</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {profile.phase2.specializedLexicon.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-white/[0.03] border border-white/10 space-y-1"
                    >
                      <div className="flex items-center justify-between font-mono text-xs">
                        <span className="font-bold text-emerald-300">{item.term}</span>
                        {item.transliteration && (
                          <span className="text-[10px] text-white/40 italic">
                            {item.transliteration}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-white/70 leading-relaxed">
                        {item.definition}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Phase 3: The Human Element & Views on Authenticity */}
          {activePhase === 3 && (
            <motion.div
              key="phase-3"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Definition of Authentic Selfhood */}
              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs uppercase tracking-wider font-semibold">
                  <UserCheck size={14} />
                  <span>Authentic Selfhood on the Field of Emptiness</span>
                </div>
                <p className="text-white/90 text-sm leading-relaxed">
                  {profile.phase3.authenticSelfhood}
                </p>
              </div>

              {/* The Subtractive Existential Leap */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/20 via-black/40 to-transparent border border-amber-500/30 space-y-2">
                <span className="text-xs font-mono uppercase text-amber-400 tracking-wider font-semibold flex items-center gap-1.5">
                  <Sparkles size={13} />
                  <span>The Demanded Existential Leap: Subtractive Gelassenheit</span>
                </span>
                <p className="text-xs text-white/80 leading-relaxed">
                  {profile.phase3.subtractiveLeap}
                </p>
              </div>

              {/* Threats to Individuality */}
              <div className="space-y-3">
                <h3 className="text-xs uppercase font-mono tracking-wider text-white/50 flex items-center gap-2">
                  <AlertTriangle size={13} className="text-red-400" />
                  <span>Primary Threats to Existential Sovereignty</span>
                </h3>
                <div className="space-y-2">
                  {profile.phase3.threatsToIndividuality.map((threat, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-red-950/10 border border-red-500/20 text-xs text-white/80 flex items-start gap-2.5"
                    >
                      <span className="text-red-400 font-mono font-bold">•</span>
                      <span>{threat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Injunctions for Subjective Accountability */}
              <div className="space-y-3">
                <h3 className="text-xs uppercase font-mono tracking-wider text-white/50 flex items-center gap-2">
                  <Scale size={13} className="text-cyan-400" />
                  <span>Demands for Personal Accountability & Non-Conformity</span>
                </h3>
                <div className="space-y-2">
                  {profile.phase3.personalAccountabilityInjunctions.map((inj, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-cyan-950/10 border border-cyan-500/20 text-xs text-white/80 flex items-start gap-2.5"
                    >
                      <span className="text-cyan-400 font-mono font-bold">§{idx + 1}</span>
                      <span>{inj}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Phase 4: The Crucible & Forensic Contradiction Autopsy */}
          {activePhase === 4 && (
            <motion.div
              key="phase-4"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Autopsy Focal View based on activeLens */}
              {activeLens === 'structural' && (
                <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/40 space-y-4">
                  <div className="flex items-center justify-between border-b border-red-500/20 pb-2">
                    <div className="flex items-center gap-2 font-mono text-sm text-red-300 font-bold">
                      <Flame size={16} />
                      <span>Structural Contradiction Autopsy</span>
                    </div>
                    <span className="text-[10px] font-mono text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                      Topological / Formal Axis
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-xs font-mono uppercase text-red-400/90 font-semibold">
                      1. Core Structural Contradiction
                    </h4>
                    <p className="text-xs text-white/90 leading-relaxed pl-2 border-l border-red-500/30">
                      {profile.phase4.structuralAutopsy.contradiction}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-xs font-mono uppercase text-red-400/90 font-semibold">
                      2. Formal Mechanics & Tensor Friction
                    </h4>
                    <p className="text-xs text-white/80 leading-relaxed pl-2 border-l border-red-500/30">
                      {profile.phase4.structuralAutopsy.formalMechanism}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-xs font-mono uppercase text-red-400/90 font-semibold">
                      3. Unresolved Structural Aporia
                    </h4>
                    <p className="text-xs text-red-200/90 leading-relaxed pl-2 border-l border-red-500/30 italic">
                      "{profile.phase4.structuralAutopsy.aporia}"
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-black/40 border border-red-500/30 text-xs font-mono text-white/90">
                    <span className="text-red-400 font-semibold">Invariant Resolution: </span>
                    {profile.phase4.structuralAutopsy.invariantResolution}
                  </div>
                </div>
              )}

              {activeLens === 'doctrinal' && (
                <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/40 space-y-4">
                  <div className="flex items-center justify-between border-b border-purple-500/20 pb-2">
                    <div className="flex items-center gap-2 font-mono text-sm text-purple-300 font-bold">
                      <Scale size={16} />
                      <span>Doctrinal Contradiction Autopsy</span>
                    </div>
                    <span className="text-[10px] font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                      Ideological / Dogmatic Axis
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-xs font-mono uppercase text-purple-400/90 font-semibold">
                      1. Core Doctrinal Contradiction
                    </h4>
                    <p className="text-xs text-white/90 leading-relaxed pl-2 border-l border-purple-500/30">
                      {profile.phase4.doctrinalAutopsy.contradiction}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-xs font-mono uppercase text-purple-400/90 font-semibold">
                      2. Dogmatic Reification Risk
                    </h4>
                    <p className="text-xs text-white/80 leading-relaxed pl-2 border-l border-purple-500/30">
                      {profile.phase4.doctrinalAutopsy.dogmaticReificationRisk}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-xs font-mono uppercase text-purple-400/90 font-semibold">
                      3. Unresolved Doctrinal Aporia
                    </h4>
                    <p className="text-xs text-purple-200/90 leading-relaxed pl-2 border-l border-purple-500/30 italic">
                      "{profile.phase4.doctrinalAutopsy.aporia}"
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-black/40 border border-purple-500/30 text-xs font-mono text-white/90">
                    <span className="text-purple-400 font-semibold">Invariant Resolution: </span>
                    {profile.phase4.doctrinalAutopsy.invariantResolution}
                  </div>
                </div>
              )}

              {activeLens === 'rhetorical' && (
                <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/40 space-y-4">
                  <div className="flex items-center justify-between border-b border-amber-500/20 pb-2">
                    <div className="flex items-center gap-2 font-mono text-sm text-amber-300 font-bold">
                      <Quote size={16} />
                      <span>Rhetorical Contradiction Autopsy</span>
                    </div>
                    <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      Performative / Linguistic Paradox
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-xs font-mono uppercase text-amber-400/90 font-semibold">
                      1. Core Rhetorical Contradiction
                    </h4>
                    <p className="text-xs text-white/90 leading-relaxed pl-2 border-l border-amber-500/30">
                      {profile.phase4.rhetoricalAutopsy.contradiction}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-xs font-mono uppercase text-amber-400/90 font-semibold">
                      2. Stylistic Paradox & Negative Linguistic Traps
                    </h4>
                    <p className="text-xs text-white/80 leading-relaxed pl-2 border-l border-amber-500/30">
                      {profile.phase4.rhetoricalAutopsy.stylisticParadox}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-xs font-mono uppercase text-amber-400/90 font-semibold">
                      3. Unresolved Rhetorical Aporia
                    </h4>
                    <p className="text-xs text-amber-200/90 leading-relaxed pl-2 border-l border-amber-500/30 italic">
                      "{profile.phase4.rhetoricalAutopsy.aporia}"
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-black/40 border border-amber-500/30 text-xs font-mono text-white/90">
                    <span className="text-amber-400 font-semibold">Invariant Resolution: </span>
                    {profile.phase4.rhetoricalAutopsy.invariantResolution}
                  </div>
                </div>
              )}

              {activeLens === 'tripartite' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Structural Card */}
                    <div className="p-3.5 rounded-xl bg-red-950/15 border border-red-500/30 space-y-2">
                      <div className="font-mono text-xs text-red-300 font-bold flex items-center gap-1.5">
                        <Flame size={13} />
                        <span>Structural Autopsy</span>
                      </div>
                      <p className="text-[11px] text-white/80 leading-relaxed">
                        {profile.phase4.structuralAutopsy.contradiction}
                      </p>
                      <div className="text-[10px] font-mono text-red-300/80 italic pt-1 border-t border-red-500/20">
                        Aporia: {profile.phase4.structuralAutopsy.aporia}
                      </div>
                    </div>

                    {/* Doctrinal Card */}
                    <div className="p-3.5 rounded-xl bg-purple-950/15 border border-purple-500/30 space-y-2">
                      <div className="font-mono text-xs text-purple-300 font-bold flex items-center gap-1.5">
                        <Scale size={13} />
                        <span>Doctrinal Autopsy</span>
                      </div>
                      <p className="text-[11px] text-white/80 leading-relaxed">
                        {profile.phase4.doctrinalAutopsy.contradiction}
                      </p>
                      <div className="text-[10px] font-mono text-purple-300/80 italic pt-1 border-t border-purple-500/20">
                        Aporia: {profile.phase4.doctrinalAutopsy.aporia}
                      </div>
                    </div>

                    {/* Rhetorical Card */}
                    <div className="p-3.5 rounded-xl bg-amber-950/15 border border-amber-500/30 space-y-2">
                      <div className="font-mono text-xs text-amber-300 font-bold flex items-center gap-1.5">
                        <Quote size={13} />
                        <span>Rhetorical Autopsy</span>
                      </div>
                      <p className="text-[11px] text-white/80 leading-relaxed">
                        {profile.phase4.rhetoricalAutopsy.contradiction}
                      </p>
                      <div className="text-[10px] font-mono text-amber-300/80 italic pt-1 border-t border-amber-500/20">
                        Aporia: {profile.phase4.rhetoricalAutopsy.aporia}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Strengths & Vulnerabilities Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Systemic Strengths */}
                <div className="p-4 rounded-xl bg-emerald-950/10 border border-emerald-500/20 space-y-2">
                  <h4 className="text-xs font-mono uppercase text-emerald-400 font-semibold flex items-center gap-1.5">
                    <Check size={13} />
                    <span>Systemic Strengths of Formulation</span>
                  </h4>
                  <ul className="space-y-1.5 text-xs text-white/80">
                    {profile.phase4.strengths.map((s, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-emerald-400 font-mono">+</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Critical Vulnerabilities */}
                <div className="p-4 rounded-xl bg-amber-950/10 border border-amber-500/20 space-y-2">
                  <h4 className="text-xs font-mono uppercase text-amber-400 font-semibold flex items-center gap-1.5">
                    <AlertTriangle size={13} />
                    <span>Vulnerabilities & Blind Spots</span>
                  </h4>
                  <ul className="space-y-1.5 text-xs text-white/80">
                    {profile.phase4.vulnerabilities.map((v, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-amber-400 font-mono">!</span>
                        <span>{v}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Asymptotic Invariant Hold Banner */}
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-violet-500/10 to-transparent border border-amber-500/30 flex items-center justify-between text-xs font-mono">
                <span className="text-white/80">
                  <span className="font-bold text-amber-400">Asymptotic Convergence: </span>
                  {profile.phase4.asymptoticInvariantHold}
                </span>
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] shrink-0 ml-2">
                  θ = 0.18 Hold
                </span>
              </div>
            </motion.div>
          )}

          {/* DeepThinker-CA / Apophatic Cognitive Reflection Mode Drawer */}
          {showDeepThinkAudit && (
            <div className="p-4 rounded-xl bg-[#090614] border border-amber-500/40 space-y-4 animate-fade-in font-mono text-xs">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <div className="flex items-center gap-2 text-amber-300 font-bold">
                  <Brain size={14} className="text-amber-400" />
                  <span>DeepThinker-CA Meta-Cognitive Audit: {profile.label}</span>
                </div>
                <button
                  onClick={() => setShowDeepThinkAudit(false)}
                  className="text-white/40 hover:text-white"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="space-y-3">
                <div className="p-2.5 rounded bg-white/5 border border-white/10">
                  <span className="text-emerald-400 font-bold">🟢 STEP 1: INITIAL THESIS</span>
                  <p className="text-white/80 mt-1">
                    "Disparity metric {profile.symbol} objectively measures cognitive distortion between philosophical models and reality."
                  </p>
                </div>

                <div className="p-2.5 rounded bg-white/5 border border-white/10">
                  <span className="text-red-400 font-bold">🔴 STEP 2: DUAL-PATH CRITIQUE (The Incinerator)</span>
                  <p className="text-white/80 mt-1">
                    Any metric applied to radical Nothingness is a category error. By assigning numerical eigenvalues or ratios, the system secretly posits an ontological substance to measure. The formula is guilty of Pythagorean reification.
                  </p>
                </div>

                <div className="p-2.5 rounded bg-white/5 border border-white/10">
                  <span className="text-purple-400 font-bold">🟣 STEP 3: ORTHOGONAL PIVOT (System 3 Meta-Critique)</span>
                  <p className="text-white/80 mt-1">
                    The blind spot of both Step 1 and Step 2 is assuming measurement must represent an entity. The third angle: {profile.symbol} is an operational boundary operator, not a descriptive ruler. It records the curvature of human resistance, not the substance of the Void.
                  </p>
                </div>

                <div className="p-2.5 rounded bg-white/5 border border-white/10">
                  <span className="text-amber-400 font-bold">🟡 STEP 4: HOLISTIC SYNTHESIS (The Lattice)</span>
                  <p className="text-white/80 mt-1">
                    Applying Nāgārjuna’s Two Truths (Samvṛti & Paramārtha), the metric functions on the conventional plane to dissolve conventional dogmatism. When the threshold θ = 0.18 is attained, the metric dissolves its own necessity.
                  </p>
                </div>

                <div className="p-2.5 rounded bg-white/5 border border-white/10">
                  <span className="text-cyan-400 font-bold">💎 STEP 5: FINAL VERDICT</span>
                  <p className="text-white/90 mt-1">
                    <span className="font-bold">Confidence: 94%.</span> {profile.label} is validated as an indispensable negative hygiene against ideological stagnation.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Actions Footer */}
        <div className="px-5 py-3 border-t border-white/10 bg-black/80 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowDeepThinkAudit(!showDeepThinkAudit)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono bg-purple-500/15 hover:bg-purple-500/25 text-purple-200 border border-purple-500/40 transition-colors"
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
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 transition-colors"
                title={`Inspect correlated knowledge graph node '${profile.correlatedGraphNodeId}'`}
              >
                <ExternalLink size={13} />
                <span>Locate in Knowledge Graph</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono text-white/40 hidden sm:inline">
              Autopsy Framework: Philocrash Protocol v4.2
            </span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg text-xs font-mono bg-amber-500 hover:bg-amber-400 text-black font-semibold transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
