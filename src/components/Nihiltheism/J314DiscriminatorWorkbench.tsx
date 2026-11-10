import React, { useState, useMemo } from 'react';
import {
  Compass,
  Sparkles,
  Check,
  FileText,
  Zap,
  Bookmark
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { NoteDocument } from './types';

export interface J314EvaluationResult {
  empiricalOccurrence: number; // O_emp: 0.0 - 1.0
  subtractiveClearing: number; // K_neg: 0.0 - 1.0
  eideticElevation: number;    // E_form: 0.0 - 1.0
  constructiveYield: number;   // S_con: 0.0 - 1.0
  elevationRatio: number;      // E / O
  primaryDiagnosis: string;
  subtractiveClearingText: string;
  synthesizedTheorem: string;
  ontologicalStatus: 'Occurrence-Heavy' | 'Transitional Epoché' | 'Elevation-Dominant' | 'Axiomatic Sovereign';
}

const PRESET_PROPOSITIONS = [
  {
    title: 'The Indifferent Void',
    text: 'All meaning is a human projection over an indifferent, silent void; without God or objective purpose, existence collapses into passive despair.',
    category: 'Existential / Cioranian'
  },
  {
    title: 'Radical Kenosis (Eckhart)',
    text: 'The soul must abandon even its concept of God and all creaturely knowing to enter the unconditioned, silent desert of the Gottheit.',
    category: 'Apophatic Mysticism'
  },
  {
    title: 'Śūnyatā & Dependent Origination',
    text: 'Whatever is dependently co-arisen is devoid of intrinsic essence (svabhāva); emptiness is not nothingness, but the middle way of radical relation.',
    category: 'Madhyamaka'
  },
  {
    title: 'Sacred Groundlessness (Nihiltheism)',
    text: 'By deliberately confronting the absolute groundlessness (Abgrund), we dissolve egoic projection to reveal a timeless, liminal presence of pure potentiality.',
    category: 'Nihiltheism J314'
  },
  {
    title: 'Absurd Revolt (Camus)',
    text: 'The absurd is born of this confrontation between the human need for clarity and the unreasonable silence of the world; the only response is defiant revolt.',
    category: 'Existential Absurd'
  }
];

export interface J314DiscriminatorWorkbenchProps {
  vaultNotes?: Record<string, NoteDocument>;
  onCommitToVault?: (note: NoteDocument) => void;
  onOpenNote?: (noteId: string) => void;
  className?: string;
  compact?: boolean;
}

export const J314DiscriminatorWorkbench: React.FC<J314DiscriminatorWorkbenchProps> = ({
  vaultNotes = {},
  onCommitToVault,
  onOpenNote,
  className = '',
  compact = false
}) => {
  const [selectedPresetIndex, setSelectedPresetIndex] = useState<number>(3);
  const [inputText, setInputText] = useState<string>(PRESET_PROPOSITIONS[3].text);
  const [selectedNoteId, setSelectedNoteId] = useState<string>('');
  const [activeStage, setActiveStage] = useState<1 | 2 | 3>(3);
  const [isCommitted, setIsCommitted] = useState<boolean>(false);
  const [committedNoteId, setCommittedNoteId] = useState<string | null>(null);

  // Dynamic evaluation of input text based on ontological keywords and structural density
  const evaluation: J314EvaluationResult = useMemo(() => {
    const text = inputText.toLowerCase();

    // Occurrence signals: dogmatic reification, despair, passive, anxiety, ego, must, absolute truth
    let occCount = 0;
    if (text.includes('despair') || text.includes('meaningless') || text.includes('collapse')) occCount += 1.8;
    if (text.includes('human projection') || text.includes('illusion') || text.includes('passive')) occCount += 1.2;
    if (text.includes('god') || text.includes('revolt') || text.includes('alone') || text.includes('fear')) occCount += 1.0;
    if (text.includes('must') || text.includes('sin') || text.includes('punishment')) occCount += 1.5;

    // Subtractive clearing signals: void, empty, nothing, abandon, kenosis, dissolve, unconditioned, groundless
    let clearCount = 0;
    if (text.includes('void') || text.includes('emptiness') || text.includes('śūnyatā')) clearCount += 2.0;
    if (text.includes('groundless') || text.includes('abgrund') || text.includes('epoché')) clearCount += 2.2;
    if (text.includes('abandon') || text.includes('kenosis') || text.includes('dissolve')) clearCount += 1.8;
    if (text.includes('silence') || text.includes('unsaying') || text.includes('deconstruct')) clearCount += 1.5;

    // Eidetic elevation signals: potentiality, timeless, form, presence, sacred, clarity, freedom, beauty
    let elevCount = 0;
    if (text.includes('potentiality') || text.includes('presence') || text.includes('timeless')) elevCount += 2.2;
    if (text.includes('sacred') || text.includes('freedom') || text.includes('beauty') || text.includes('clarity')) elevCount += 2.0;
    if (text.includes('transcend') || text.includes('form') || text.includes('middle way') || text.includes('eidetic')) clearCount += 1.6;

    // Constructive yield signals: synthesis, theorem, relation, action, harmony, contemplation
    let yieldCount = 0;
    if (text.includes('synthesis') || text.includes('relation') || text.includes('reveal')) yieldCount += 1.8;
    if (text.includes('middle way') || text.includes('pure') || text.includes('response')) yieldCount += 1.5;

    const baseLen = Math.max(text.length / 50, 1);
    const o_emp = Math.min(Math.max((occCount / baseLen) * 0.45 + 0.15, 0.1), 0.95);
    const k_neg = Math.min(Math.max((clearCount / baseLen) * 0.5 + 0.25, 0.15), 0.98);
    const e_form = Math.min(Math.max((elevCount / baseLen) * 0.52 + 0.2, 0.12), 0.96);
    const s_con = Math.min(Math.max((yieldCount / baseLen) * 0.48 + (k_neg * 0.4 + e_form * 0.4), 0.18), 0.97);

    const ratio = parseFloat((e_form / Math.max(o_emp, 0.05)).toFixed(2));

    let status: J314EvaluationResult['ontologicalStatus'] = 'Occurrence-Heavy';
    if (ratio >= 2.5) status = 'Axiomatic Sovereign';
    else if (ratio >= 1.5) status = 'Elevation-Dominant';
    else if (k_neg > 0.5) status = 'Transitional Epoché';

    const cleanTitle = inputText.slice(0, 45).replace(/[^\w\s]/gi, '').trim() || 'Untitled Proposition';

    return {
      empiricalOccurrence: parseFloat(o_emp.toFixed(2)),
      subtractiveClearing: parseFloat(k_neg.toFixed(2)),
      eideticElevation: parseFloat(e_form.toFixed(2)),
      constructiveYield: parseFloat(s_con.toFixed(2)),
      elevationRatio: ratio,
      ontologicalStatus: status,
      primaryDiagnosis:
        o_emp > 0.6
          ? 'Heavy entanglement in reactive psychological friction, substantialist reification, or compensatory dogmatic defense.'
          : 'Low empirical occurrence friction; conceptual terminology maintains fluid transparency before the ungrounded horizon.',
      subtractiveClearingText:
        k_neg > 0.6
          ? 'High kenotic deconstruction (K_neg): Proposition successfully evacuates false substantialist idols and confronts the Abgrund without evasive myth-making.'
          : 'Moderate kenotic clearing: Residues of substantialist attachment or unexamined metaphysical assumptions require further epoché.',
      synthesizedTheorem:
        `Theorem of ${cleanTitle}: In the radical clearing of empirical occurrence (O_emp = ${(o_emp * 100).toFixed(0)}%), ` +
        `subtractive kenosis (K_neg = ${(k_neg * 100).toFixed(0)}%) transmutes contingent existential friction into an invariant aperture ` +
        `of pure potentiality (E_form = ${(e_form * 100).toFixed(0)}%), establishing that the absence of dogmatic foundation is the ontological condition for sacred creative freedom.`
    };
  }, [inputText]);

  // Load a note from user's vault into discriminator
  const handleSelectVaultNote = (noteId: string) => {
    setSelectedNoteId(noteId);
    if (!noteId || !vaultNotes[noteId]) return;
    const note = vaultNotes[noteId];
    const sample = `${note.title}: ${note.introParagraph || note.subtitle || ''}`;
    setInputText(sample);
  };

  // Commit Elevation to Vault Note
  const handleCommitToVault = () => {
    const timestamp = Date.now();
    const docId = `j314-elevation-${timestamp}`;
    const cleanTitle = inputText.slice(0, 36).replace(/[^\w\s]/gi, '').trim() || 'Elevation Synthesis';

    const newDoc: NoteDocument = {
      id: docId,
      title: `J314 Elevation — ${cleanTitle}`,
      subtitle: `Discriminator Telemetry: E/O ${evaluation.elevationRatio} (${evaluation.ontologicalStatus})`,
      folder: '40 – Systems',
      path: `Systems / J314 Elevation / ${cleanTitle}`,
      quote: `“${evaluation.synthesizedTheorem}”`,
      introParagraph:
        `Executed J314 Occurrence-Elevation Discrimination Pass on proposition: "${inputText}". ` +
        `The analysis audited 4 topological dimensions: Empirical Occurrence (O_emp: ${evaluation.empiricalOccurrence}), ` +
        `Subtractive Clearing (K_neg: ${evaluation.subtractiveClearing}), Eidetic Elevation (E_form: ${evaluation.eideticElevation}), ` +
        `and Constructive Yield (S_con: ${evaluation.constructiveYield}).`,
      corePrinciples: [
        {
          number: 1,
          title: 'Empirical Occurrence Audit',
          description: evaluation.primaryDiagnosis
        },
        {
          number: 2,
          title: 'Subtractive Kenosis (Abgrund Confrontation)',
          description: evaluation.subtractiveClearingText
        },
        {
          number: 3,
          title: 'Eidetic Elevation to Pure Potentiality',
          description: `Accesses the timeless liminal realm resonant with Platonic Forms, converting contingent anxiety into serene Gelassenheit.`
        },
        {
          number: 4,
          title: 'Constructive Synthesis Theorem',
          description: evaluation.synthesizedTheorem
        }
      ],
      relatedIdeas: ['#j314', '#elevation', '#occurrence', '#synthesis', '#abgrund', '#forms'],
      closingQuote: 'Not an absence of reality, but the unconditioned clearing wherein all reality discloses its freedom.',
      backlinksCount: 1,
      wordCount: evaluation.synthesizedTheorem.split(/\s+/).length + 80,
      charCount: evaluation.synthesizedTheorem.length + 500,
      isCustom: true
    };

    onCommitToVault?.(newDoc);
    setIsCommitted(true);
    setCommittedNoteId(docId);
    setTimeout(() => setIsCommitted(false), 3000);
  };

  return (
    <div className={`flex flex-col bg-[#07050d] rounded-2xl border border-white/10 overflow-hidden font-sans text-neutral-200 ${compact ? 'text-xs' : ''} ${className}`}>
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-white/10 bg-gradient-to-r from-violet-950/40 via-black to-amber-950/30 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-amber-500 p-[1px] flex items-center justify-center shadow-[0_0_12px_rgba(139,92,246,0.3)]">
            <div className="w-full h-full bg-black/80 rounded-[7px] flex items-center justify-center">
              <Compass size={15} className="text-amber-300" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-mono font-bold tracking-wider text-white uppercase">
                J314 Occurrence-Elevation Discriminator
              </h3>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30">
                Core Engine
              </span>
            </div>
            <p className="text-[11px] text-white/50">
              Discriminating contingent friction (Occurrence) from eidetic potentiality (Elevation)
            </p>
          </div>
        </div>

        {/* Status Pill */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-white/60">Status:</span>
          <span
            className={`text-xs font-mono px-2.5 py-1 rounded-lg border font-semibold ${
              evaluation.ontologicalStatus === 'Axiomatic Sovereign'
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                : evaluation.ontologicalStatus === 'Elevation-Dominant'
                ? 'bg-amber-500/15 text-amber-300 border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                : evaluation.ontologicalStatus === 'Transitional Epoché'
                ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40'
                : 'bg-rose-500/15 text-rose-300 border-rose-500/40'
            }`}
          >
            {evaluation.ontologicalStatus} (E/O: {evaluation.elevationRatio})
          </span>
        </div>
      </div>

      {/* Main Body */}
      <div className="p-4 sm:p-5 space-y-4">
        {/* Source Selector & Presets */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Note Selector */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono uppercase text-white/60 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <FileText size={12} className="text-violet-400" />
                <span>Load from Vault Note</span>
              </span>
              <span className="text-[10px] text-white/40">{Object.keys(vaultNotes).length} notes available</span>
            </label>
            <select
              value={selectedNoteId}
              onChange={(e) => handleSelectVaultNote(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl bg-black/60 border border-white/10 text-xs font-mono text-white/90 focus:outline-none focus:border-violet-500/60"
            >
              <option value="">-- Choose Vault Note to Discriminate --</option>
              {Object.values(vaultNotes).map((n) => (
                <option key={n.id} value={n.id}>
                  {n.title} ({n.folder})
                </option>
              ))}
            </select>
          </div>

          {/* Canonical Presets */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono uppercase text-white/60 flex items-center gap-1.5">
              <Bookmark size={12} className="text-amber-400" />
              <span>Or Select Canonical Philosophical Proposition</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_PROPOSITIONS.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedPresetIndex(idx);
                    setInputText(p.text);
                    setSelectedNoteId('');
                  }}
                  className={`px-2 py-1 rounded-lg text-[11px] font-mono transition-all border ${
                    selectedPresetIndex === idx && !selectedNoteId
                      ? 'bg-amber-500/20 text-amber-200 border-amber-500/40 shadow-sm'
                      : 'bg-white/5 text-white/60 border-white/10 hover:text-white hover:bg-white/10'
                  }`}
                  title={p.category}
                >
                  {p.title}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Input Text Area */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-mono uppercase text-white/60 flex items-center justify-between">
            <span>Proposition Under Discrimination Pass</span>
            <span className="text-[10px] text-white/40">{inputText.length} characters</span>
          </label>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={3}
            placeholder="Type or paste any philosophical proposition, existential assertion, or note passage..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs font-mono text-white/90 focus:outline-none focus:border-amber-500/60 leading-relaxed resize-y"
          />
        </div>

        {/* 4-Axis Diagnostic Decomposition Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* Axis 1: Occurrence */}
          <div className="p-3 rounded-xl bg-rose-950/15 border border-rose-500/25 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-rose-400 font-bold">O_emp (Occurrence)</span>
              <span className="text-white font-bold">{(evaluation.empiricalOccurrence * 100).toFixed(0)}%</span>
            </div>
            <div className="w-full h-1.5 bg-black/60 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-rose-500 to-amber-500"
                initial={{ width: 0 }}
                animate={{ width: `${evaluation.empiricalOccurrence * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <p className="text-[10px] text-white/50 leading-tight">
              Egoic friction, contingent projection, dogmatic defensiveness
            </p>
          </div>

          {/* Axis 2: Subtractive Clearing */}
          <div className="p-3 rounded-xl bg-cyan-950/15 border border-cyan-500/25 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-cyan-400 font-bold">K_neg (Clearing)</span>
              <span className="text-white font-bold">{(evaluation.subtractiveClearing * 100).toFixed(0)}%</span>
            </div>
            <div className="w-full h-1.5 bg-black/60 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                initial={{ width: 0 }}
                animate={{ width: `${evaluation.subtractiveClearing * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <p className="text-[10px] text-white/50 leading-tight">
              Kenotic deconstruction, Abgrund confrontation, epoché
            </p>
          </div>

          {/* Axis 3: Eidetic Elevation */}
          <div className="p-3 rounded-xl bg-violet-950/15 border border-violet-500/25 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-violet-400 font-bold">E_form (Elevation)</span>
              <span className="text-white font-bold">{(evaluation.eideticElevation * 100).toFixed(0)}%</span>
            </div>
            <div className="w-full h-1.5 bg-black/60 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-violet-500 to-purple-400"
                initial={{ width: 0 }}
                animate={{ width: `${evaluation.eideticElevation * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <p className="text-[10px] text-white/50 leading-tight">
              Timeless Platonic potentiality, serene Gelassenheit
            </p>
          </div>

          {/* Axis 4: Constructive Yield */}
          <div className="p-3 rounded-xl bg-amber-950/15 border border-amber-500/25 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-amber-400 font-bold">S_con (Yield)</span>
              <span className="text-white font-bold">{(evaluation.constructiveYield * 100).toFixed(0)}%</span>
            </div>
            <div className="w-full h-1.5 bg-black/60 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-amber-500 to-emerald-400"
                initial={{ width: 0 }}
                animate={{ width: `${evaluation.constructiveYield * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <p className="text-[10px] text-white/50 leading-tight">
              Actionable, articulable constructive philosophical theorem
            </p>
          </div>
        </div>

        {/* 3-Stage Elevation Transmutation Pipeline */}
        <div className="p-4 rounded-xl bg-[#090614] border border-white/10 space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-white/10 pb-2 flex-wrap gap-2">
            <div className="flex items-center gap-2 text-white">
              <Sparkles size={14} className="text-amber-400" />
              <span className="font-bold">Elevation Transmutation Pipeline</span>
            </div>
            <div className="flex items-center gap-1">
              {[
                { stage: 1, label: '1. Raw Occurrence' },
                { stage: 2, label: '2. Subtractive Epoché' },
                { stage: 3, label: '3. Constructive Elevation' }
              ].map((s) => (
                <button
                  key={s.stage}
                  onClick={() => setActiveStage(s.stage as any)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] transition-all border ${
                    activeStage === s.stage
                      ? 'bg-violet-600/30 text-white border-violet-400 font-bold shadow-sm'
                      : 'text-white/50 border-white/5 hover:text-white'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {activeStage === 1 && (
              <motion.div
                key="stage-1"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="space-y-2 p-3 rounded-lg bg-rose-950/10 border border-rose-500/20"
              >
                <div className="flex items-center justify-between text-rose-300 font-bold">
                  <span>STAGE 1: RAW OCCURRENCE DIAGNOSIS</span>
                  <span>O_emp: {(evaluation.empiricalOccurrence * 100).toFixed(0)}%</span>
                </div>
                <p className="text-white/80 leading-relaxed">
                  {evaluation.primaryDiagnosis}
                </p>
                <div className="text-[11px] text-white/50 pt-1 border-t border-white/5">
                  <span className="text-rose-400 font-semibold">Diagnostic Signal: </span>
                  Contingent assertions bind consciousness to historical, empirical, or psychological trauma. Without subtraction, this produces dogmatic paralysis or cynical nihilism.
                </div>
              </motion.div>
            )}

            {activeStage === 2 && (
              <motion.div
                key="stage-2"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="space-y-2 p-3 rounded-lg bg-cyan-950/10 border border-cyan-500/20"
              >
                <div className="flex items-center justify-between text-cyan-300 font-bold">
                  <span>STAGE 2: SUBTRACTIVE EPOCHÉ (KENOTIC CLEARING)</span>
                  <span>K_neg: {(evaluation.subtractiveClearing * 100).toFixed(0)}%</span>
                </div>
                <p className="text-white/80 leading-relaxed">
                  {evaluation.subtractiveClearingText}
                </p>
                <div className="text-[11px] text-white/50 pt-1 border-t border-white/5">
                  <span className="text-cyan-400 font-semibold">Kenotic Vector: </span>
                  Stripping away every positive substantive predicate (Gottheit un-saying / Śūnyatā). The Void is embraced not as privation, but as the primordial clearing of being.
                </div>
              </motion.div>
            )}

            {activeStage === 3 && (
              <motion.div
                key="stage-3"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="space-y-2.5 p-3.5 rounded-lg bg-gradient-to-r from-violet-950/20 via-black to-amber-950/20 border border-amber-500/30"
              >
                <div className="flex items-center justify-between text-amber-300 font-bold">
                  <span className="flex items-center gap-1.5">
                    <Sparkles size={13} className="text-amber-400" />
                    <span>STAGE 3: CONSTRUCTIVE ELEVATION THEOREM</span>
                  </span>
                  <span className="text-emerald-400">E/O: {evaluation.elevationRatio}</span>
                </div>
                <p className="text-white/90 leading-relaxed italic font-serif text-sm">
                  "{evaluation.synthesizedTheorem}"
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-white/10 text-[11px]">
                  <div className="text-white/70">
                    <span className="text-violet-300 font-semibold">Eidetic Resonance: </span>
                    Resonates with Plato's realm of pure Forms as unconditioned potentiality.
                  </div>
                  <div className="text-white/70">
                    <span className="text-amber-300 font-semibold">Gelassenheit Yield: </span>
                    Serene letting-go that generates authentic, positive philosophical clarity.
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Action Commit Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10 flex-wrap gap-2 font-mono text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-white/50">
              Formula: J314_Discriminator(p) = [E_form ⊗ S_con] / (O_emp + 0.05)
            </span>
          </div>

          <div className="flex items-center gap-2">
            {committedNoteId && onOpenNote && (
              <button
                onClick={() => onOpenNote(committedNoteId)}
                className="px-3 py-1.5 rounded-lg bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border border-violet-500/40 transition-colors flex items-center gap-1.5"
              >
                <FileText size={12} />
                <span>Open Created Note</span>
              </button>
            )}

            <button
              onClick={handleCommitToVault}
              disabled={isCommitted}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg font-semibold transition-all shadow-md ${
                isCommitted
                  ? 'bg-emerald-500 text-black shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                  : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.3)]'
              }`}
            >
              {isCommitted ? (
                <>
                  <Check size={13} className="text-black" />
                  <span>Elevated & Committed to Vault!</span>
                </>
              ) : (
                <>
                  <Zap size={13} className="text-black" />
                  <span>Elevate & Commit to Vault</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
