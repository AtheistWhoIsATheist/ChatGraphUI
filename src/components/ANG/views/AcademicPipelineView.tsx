import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, 
  Users, 
  FileText, 
  Send, 
  CheckCircle2, 
  Clock, 
  Search, 
  Book, 
  Loader2, 
  Sparkles, 
  Terminal, 
  Copy, 
  ExternalLink, 
  Network, 
  Check, 
  FileCheck, 
  Sliders, 
  Play, 
  RotateCcw 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { corpusTexts } from '../../../data/ontology';
import { DisparityHistoryChart } from '../DisparityHistoryChart';

interface GenerationStep {
  id: string;
  name: string;
  shortLabel: string;
  description: string;
  durationMs: number;
  logs: string[];
}

const GENERATION_PIPELINE_STEPS: GenerationStep[] = [
  {
    id: 'vertex-analysis',
    name: 'Analyzing Vertex',
    shortLabel: 'Vertex Analysis',
    description: 'Decomposing ontological topology, absorption axes, and betweenness centrality across selected vertices.',
    durationMs: 2400,
    logs: [
      'Extracting primary vertex coordinates: [Active Nihil | ABS: 0.89 | Era: Post-Structural]',
      'Calculating eigenvalue decay against secondary anchor: [The Absolute Void | ABS: 0.96]',
      'Auditing topological tension: Zero dimensional collapse detected. Boundary conditions holding.',
      'Vertex mathematical formulation verified and recorded into manuscript draft.'
    ]
  },
  {
    id: 'lit-review',
    name: 'Synthesizing Literature Review',
    shortLabel: 'Literature Review',
    description: 'Cross-referencing primary and secondary corpus (Nishitani, Meister Eckhart, Cioran, Camus, Nagarjuna).',
    durationMs: 2800,
    logs: [
      'Ingesting corpus fragment #J314-NISHITANI (1982) "Religion and Nothingness"...',
      'Correlating Meister Eckhart sermon excerpts on "The Silent Wasteland of the Godhead"...',
      'Reconciling Western existential vertigo (Cioran/Camus) with Buddhist Śūnyatā emptiness...',
      'Literature synthesis completed: 24 primary sources audited across 4 historical epochs.'
    ]
  },
  {
    id: 'methodology',
    name: 'Formulating Dialectical Methodology',
    shortLabel: 'Methodology & Epistemic Audit',
    description: 'Applying 11-level epistemic status validation and anti-reification boundary operators.',
    durationMs: 2200,
    logs: [
      'Deploying Epistemic Status tagging: TEXTUAL (14), SOURCE_METADATA (8), APOPHATIC (6)...',
      'Running Anti-Reification Audit across 12 monitored terms (Nihil, Void, Absolute, Aporia)...',
      'Verification check: All symbolic markers maintained as boundary operators rather than substantive entities.',
      'Epistemic protocol signed and formatted for peer-review compliance.'
    ]
  },
  {
    id: 'disparity-analysis',
    name: 'Conducting Phenomenological & Disparity Analysis',
    shortLabel: 'Disparity & Invariants',
    description: 'Quantifying Disparity Index changes across consecutive /map comparisons and synthesizing paradoxical tension.',
    durationMs: 2500,
    logs: [
      'Evaluating consecutive /map disparity trajectory: Δ = 0.12 -> 0.28 -> 0.45 -> 0.65 -> 0.82...',
      'Synthesizing primary paradox: [Active Negation as Primordial Presence] (Complexity: 0.91)...',
      'Tracing ontological invariant: Epoche stabilization confirmed at theta threshold θ = 0.18.',
      'Quantitative charts rendered and embedded into publication draft.'
    ]
  },
  {
    id: 'citations',
    name: 'Formatting Citations',
    shortLabel: 'Citations & DOIs',
    description: 'Querying CrossRef and PhilPapers registries, generating DOIs, and formatting BibTeX in target journal style.',
    durationMs: 2000,
    logs: [
      'Resolving CrossRef metadata for 18 primary works and academic monographs...',
      'Linking author profiles: K. Nishitani (ORCID: 0000-0002-8192-341X), E. Cioran, Nagarjuna...',
      'Generating compliant BibTeX database with exact pagination and archive URLs...',
      'Applying target journal citation specification (Chicago Author-Date 17th Ed).'
    ]
  },
  {
    id: 'manuscript-compilation',
    name: 'Compiling Final Manuscript',
    shortLabel: 'Typesetting & Export',
    description: 'Typesetting final abstract, section headers, epistemic provenance footnotes, and compiling publication bundle.',
    durationMs: 1600,
    logs: [
      'Assembling academic title, keywords, structured abstract, and body sections...',
      'Compiling LaTeX typographical structure with verified double-spaced formatting...',
      'Generating figures: Pentagonal Nihil-Topology Framework & Disparity History Curve...',
      'Academic draft compilation 100% COMPLETE. Ready for peer review and submission.'
    ]
  }
];

export const AcademicPipelineView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'publication' | 'citations' | 'collaboration' | 'submission'>('publication');
  
  // Publication Generator state
  const [targetJournal, setTargetJournal] = useState<'jop' | 'pc' | 'pew'>('jop');
  const [selectedVertices, setSelectedVertices] = useState<string[]>(['Active Nihil', 'The Absolute Void']);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);
  const [stepProgress, setStepProgress] = useState<number>(0);
  const [overallProgress, setOverallProgress] = useState<number>(0);
  const [liveLogs, setLiveLogs] = useState<{ text: string; time: string; stepId: string }[]>([]);
  const [generationCompleted, setGenerationCompleted] = useState<boolean>(false);
  const [activePreviewSection, setActivePreviewSection] = useState<'paper' | 'bibtex' | 'figures'>('paper');
  const [copiedBibtex, setCopiedBibtex] = useState<boolean>(false);

  // Citations tab state
  const [selectedThinkerId, setSelectedThinkerId] = useState<string>('nishitani-1');
  const [doiQuery, setDoiQuery] = useState<string>('10.1093/mind/fzaa042');
  const [doiResolved, setDoiResolved] = useState<boolean>(true);

  // Submission tab state
  const [submissions, setSubmissions] = useState([
    {
      id: 'sub-1',
      title: 'The Topology of Radical Negation: Apophatic Dynamics in Non-Ontological Systems',
      journal: 'Journal of Philosophy',
      date: '2026-09-04',
      status: 'Under Review',
      statusColor: 'amber',
      wordCount: '11,480',
      reviewers: 3,
      reviewsCompleted: 2
    },
    {
      id: 'sub-2',
      title: 'Apophatic Silence in Post-Structural Metaphysics: An Invariant Analysis',
      journal: 'Philosophy Compass',
      date: '2026-06-12',
      status: 'Accepted with Minor Revisions',
      statusColor: 'green',
      wordCount: '7,920',
      reviewers: 2,
      reviewsCompleted: 2
    }
  ]);

  const logContainerRef = useRef<HTMLDivElement>(null);
  const previewScrollRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<any>(null);

  // Auto-scroll logs to bottom
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [liveLogs]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleToggleVertex = (vertex: string) => {
    setSelectedVertices(prev => 
      prev.includes(vertex) ? prev.filter(v => v !== vertex) : [...prev, vertex]
    );
  };

  // Start real-time generation process
  const startPaperGeneration = () => {
    if (isGenerating) return;
    setIsGenerating(true);
    setGenerationCompleted(false);
    setCurrentStepIndex(0);
    setStepProgress(0);
    setOverallProgress(0);
    setLiveLogs([
      {
        text: `[INITIALIZATION] Initializing Academic Paper Generator with target template: ${targetJournal.toUpperCase()}...`,
        time: new Date().toLocaleTimeString(),
        stepId: 'init'
      },
      {
        text: `[TOPOLOGY] Selected Primary Vertices: ${selectedVertices.join(', ')}`,
        time: new Date().toLocaleTimeString(),
        stepId: 'init'
      }
    ]);

    runStep(0);
  };

  const runStep = (stepIndex: number) => {
    if (stepIndex >= GENERATION_PIPELINE_STEPS.length) {
      // Completed all steps
      setIsGenerating(false);
      setGenerationCompleted(true);
      setOverallProgress(100);
      setLiveLogs(prev => [
        ...prev,
        {
          text: `[SYSTEM] Academic Paper draft successfully generated, typeset, and validated. Ready for submission.`,
          time: new Date().toLocaleTimeString(),
          stepId: 'complete'
        }
      ]);
      return;
    }

    const step = GENERATION_PIPELINE_STEPS[stepIndex];
    setCurrentStepIndex(stepIndex);
    setStepProgress(0);

    // Stream logs for this step progressively
    step.logs.forEach((logMessage, i) => {
      const logDelay = (step.durationMs / (step.logs.length + 1)) * (i + 1);
      setTimeout(() => {
        setLiveLogs(prev => [
          ...prev,
          {
            text: `[${step.name.toUpperCase()}] ${logMessage}`,
            time: new Date().toLocaleTimeString(),
            stepId: step.id
          }
        ]);
      }, logDelay);
    });

    // Animate progress smoothly
    const intervalTime = 60;
    const totalTicks = step.durationMs / intervalTime;
    let tickCount = 0;

    const progressTimer = setInterval(() => {
      tickCount++;
      const currentRatio = Math.min(1, tickCount / totalTicks);
      const stepPct = Math.round(currentRatio * 100);
      setStepProgress(stepPct);

      const baseOverall = (stepIndex / GENERATION_PIPELINE_STEPS.length) * 100;
      const stepContribution = (1 / GENERATION_PIPELINE_STEPS.length) * 100 * currentRatio;
      setOverallProgress(Math.min(99, Math.round(baseOverall + stepContribution)));

      if (tickCount >= totalTicks) {
        clearInterval(progressTimer);
        // Move to next step
        timerRef.current = setTimeout(() => {
          runStep(stepIndex + 1);
        }, 150);
      }
    }, intervalTime);
  };

  const handleCancelGeneration = () => {
    setIsGenerating(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    setLiveLogs(prev => [
      ...prev,
      {
        text: `[ABORT] Generation cancelled by researcher. Partial state retained in memory.`,
        time: new Date().toLocaleTimeString(),
        stepId: 'abort'
      }
    ]);
  };

  const handleCopyBibtex = () => {
    const bibtexData = `@article{nihiltheism_pnt_2026,
  title = {The Topology of Radical Negation: Apophatic Dynamics in Non-Ontological Systems},
  author = {Nihiltheism Research Collective and Mueller, Adam},
  journal = {Journal of Philosophy},
  volume = {123},
  number = {4},
  pages = {188--214},
  year = {2026},
  doi = {10.1093/mind/fzaa042},
  keywords = {Apophaticism, Nihilism, Disparity Index, Pentagonal Topology}
}`;
    navigator.clipboard.writeText(bibtexData);
    setCopiedBibtex(true);
    setTimeout(() => setCopiedBibtex(false), 2000);
  };

  const handleSendToSubmissions = () => {
    const newSubmission = {
      id: `sub-${Date.now()}`,
      title: 'The Topology of Radical Negation: Apophatic Dynamics in Non-Ontological Systems',
      journal: targetJournal === 'jop' ? 'Journal of Philosophy' : targetJournal === 'pc' ? 'Philosophy Compass' : 'Philosophy East and West',
      date: new Date().toISOString().split('T')[0],
      status: 'Ready for Submission',
      statusColor: 'cyan',
      wordCount: '10,840',
      reviewers: 0,
      reviewsCompleted: 0
    };
    setSubmissions([newSubmission, ...submissions]);
    setActiveTab('submission');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-void-surface overflow-hidden relative font-sans">
      {/* Header bar */}
      <div className="p-4 border-b border-white/5 bg-black/40 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-display text-white/90 uppercase tracking-widest flex items-center gap-2">
            <BookOpen className="text-amber-500" />
            Academic Integration Pipeline
          </h1>
          <p className="text-xs text-white/40 font-mono mt-1">
            Systematic academic infrastructure supporting peer-reviewed publication, BibTeX citation registry, and peer validation.
          </p>
        </div>

        {/* Global Pipeline Status Pill */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.02]">
          <div className={`w-2 h-2 rounded-full ${isGenerating ? 'bg-amber-400 animate-ping' : generationCompleted ? 'bg-emerald-400' : 'bg-white/30'}`} />
          <span className="text-[10px] font-mono uppercase tracking-wider text-white/70">
            {isGenerating 
              ? `Processing: ${GENERATION_PIPELINE_STEPS[currentStepIndex]?.shortLabel || 'Active'}` 
              : generationCompleted 
              ? 'Draft Compiled & Validated' 
              : 'Pipeline Ready'}
          </span>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex border-b border-white/5 bg-black/20 overflow-x-auto scrollbar-none">
        {[
          { id: 'publication', label: 'Paper Generator', icon: <FileText size={14} /> },
          { id: 'citations', label: 'Citations & DOIs', icon: <Book size={14} /> },
          { id: 'collaboration', label: 'Peer Workspace', icon: <Users size={14} /> },
          { id: 'submission', label: 'Submission Tracker', icon: <Send size={14} />, badge: submissions.length }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-5 py-3 text-xs font-mono flex items-center gap-2 transition-all border-b-2 whitespace-nowrap ${
              activeTab === tab.id 
                ? 'border-amber-500 text-amber-500 bg-amber-500/10 font-bold' 
                : 'border-transparent text-white/50 hover:text-white/80 hover:bg-white/5'
            }`}
          >
            {tab.icon}
            {tab.label}
            {tab.badge && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[9px] bg-white/10 text-white/70">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 relative">
        <AnimatePresence mode="wait">
          {/* ===================== PUBLICATION / PAPER GENERATOR TAB ===================== */}
          {activeTab === 'publication' && (
            <motion.div
              key="publication"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-6xl mx-auto space-y-6"
            >
              {/* Header Action Bar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-white/5">
                <div>
                  <h2 className="text-lg font-display text-white/90 flex items-center gap-2">
                    <Sparkles className="text-amber-400" size={18} />
                    Automated Academic Paper Generator
                  </h2>
                  <p className="text-xs font-mono text-white/40 mt-0.5">
                    Generate peer-review ready manuscripts from the Pentagonal Nihil-Topology framework.
                  </p>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  {isGenerating ? (
                    <button 
                      onClick={handleCancelGeneration}
                      className="px-3.5 py-2 bg-red-500/10 text-red-400 border border-red-500/30 rounded text-xs font-mono hover:bg-red-500/20 transition-all flex items-center gap-1.5"
                    >
                      <RotateCcw size={13} />
                      Abort Run
                    </button>
                  ) : (
                    <button 
                      onClick={startPaperGeneration}
                      className="px-4 py-2 bg-gradient-to-r from-amber-500/20 to-amber-600/30 text-amber-300 border border-amber-500/50 rounded text-xs font-mono hover:bg-amber-500/30 hover:border-amber-400 transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.15)] active:scale-95"
                    >
                      {generationCompleted ? <RotateCcw size={14} /> : <Play size={14} className="fill-amber-400" />}
                      {generationCompleted ? 'REGENERATE DRAFT' : 'GENERATE ACADEMIC DRAFT'}
                    </button>
                  )}
                </div>
              </div>

              {/* ========================================================================= */}
              {/* VISUAL REAL-TIME PROGRESS INDICATOR SECTION                               */}
              {/* ========================================================================= */}
              <div className="rounded-xl border border-white/10 bg-black/60 backdrop-blur-md p-5 shadow-2xl relative overflow-hidden">
                {/* Background Ambient Glow */}
                <div 
                  className="absolute -top-24 -right-24 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none transition-opacity duration-700"
                  style={{ opacity: isGenerating ? 0.8 : 0.2 }}
                />

                {/* Progress Header & Percentage */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-lg border ${
                      isGenerating 
                        ? 'border-amber-500/40 bg-amber-500/10 text-amber-400' 
                        : generationCompleted 
                        ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                        : 'border-white/10 bg-white/5 text-white/50'
                    }`}>
                      {isGenerating ? (
                        <Loader2 size={18} className="animate-spin text-amber-400" />
                      ) : generationCompleted ? (
                        <CheckCircle2 size={18} className="text-emerald-400" />
                      ) : (
                        <Sliders size={18} />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono uppercase tracking-wider text-white/40">
                          Section Generation Status
                        </span>
                        {isGenerating && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                            ACTIVE
                          </span>
                        )}
                        {generationCompleted && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            VERIFIED (6/6)
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm sm:text-base font-display font-semibold text-white/95 mt-0.5">
                        {isGenerating
                          ? GENERATION_PIPELINE_STEPS[currentStepIndex]?.name || 'Generating Manuscript...'
                          : generationCompleted
                          ? 'Paper Generation Complete: Ready for Peer Review'
                          : 'Idle • Ready to Execute Systematic Integration'}
                      </h3>
                    </div>
                  </div>

                  {/* Overall Percentage Metric */}
                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <div className="text-right font-mono">
                      <div className="text-2xl font-bold tracking-tight text-white/90">
                        {overallProgress}%
                      </div>
                      <div className="text-[10px] text-white/40 uppercase">
                        {isGenerating ? `Step ${currentStepIndex + 1} of ${GENERATION_PIPELINE_STEPS.length}` : generationCompleted ? 'Complete' : '0/6 Steps'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main Dynamic Progress Bar */}
                <div className="relative w-full h-2.5 bg-neutral-900 rounded-full overflow-hidden border border-white/10 mb-6">
                  <motion.div
                    className={`h-full rounded-full transition-all duration-300 ${
                      generationCompleted
                        ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 shadow-[0_0_15px_rgba(16,185,129,0.5)]'
                        : 'bg-gradient-to-r from-amber-500 via-violet-ethereal to-cyan-cosmic shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                    }`}
                    style={{ width: `${overallProgress}%` }}
                  />
                  {isGenerating && (
                    <motion.div
                      className="absolute inset-y-0 w-24 bg-white/25 blur-sm"
                      animate={{ x: ['-100%', '1000%'] }}
                      transition={{ repeat: Infinity, duration: 1.8, ease: 'linear' }}
                    />
                  )}
                </div>

                {/* Section-by-Section Visual Pipeline Stepper */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 mb-5">
                  {GENERATION_PIPELINE_STEPS.map((step, idx) => {
                    const isCompleted = generationCompleted || (isGenerating && idx < currentStepIndex);
                    const isCurrent = isGenerating && idx === currentStepIndex;

                    return (
                      <div
                        key={step.id}
                        className={`rounded-lg p-2.5 sm:p-3 border transition-all duration-300 relative ${
                          isCurrent
                            ? 'bg-amber-500/10 border-amber-500/60 ring-1 ring-amber-400/40 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                            : isCompleted
                            ? 'bg-emerald-500/[0.04] border-emerald-500/30'
                            : 'bg-black/30 border-white/5 opacity-60'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[9px] font-mono text-white/40 uppercase">
                            0{idx + 1}
                          </span>
                          {isCompleted ? (
                            <CheckCircle2 size={13} className="text-emerald-400" />
                          ) : isCurrent ? (
                            <Loader2 size={13} className="text-amber-400 animate-spin" />
                          ) : (
                            <div className="w-2.5 h-2.5 rounded-full border border-white/20" />
                          )}
                        </div>

                        <h4 className={`text-xs font-mono font-medium leading-tight mb-1 truncate ${
                          isCurrent ? 'text-amber-300 font-bold' : isCompleted ? 'text-emerald-300' : 'text-white/60'
                        }`} title={step.name}>
                          {step.shortLabel}
                        </h4>

                        <p className="text-[9px] text-white/40 line-clamp-2 leading-relaxed">
                          {step.description}
                        </p>

                        {/* Micro Progress Bar inside Active Card */}
                        {isCurrent && (
                          <div className="mt-2 w-full h-1 bg-neutral-800 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-amber-400 transition-all duration-100" 
                              style={{ width: `${stepProgress}%` }}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Real-time Telemetry Terminal Logs */}
                <div className="border border-white/10 rounded-lg bg-black/80 p-3 relative">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2">
                    <div className="flex items-center gap-2 text-[10px] font-mono text-white/50 uppercase tracking-wider">
                      <Terminal size={12} className="text-cyan-cosmic" />
                      Live Academic Synthesis Terminal
                    </div>
                    <span className="text-[9px] font-mono text-white/30">
                      {liveLogs.length} events logged
                    </span>
                  </div>

                  <div 
                    ref={logContainerRef} 
                    className="h-24 sm:h-28 overflow-y-auto space-y-1 font-mono text-[10px] sm:text-xs text-white/70 scrollbar-thin scrollbar-thumb-white/10 pr-1"
                  >
                    {liveLogs.length === 0 ? (
                      <div className="text-white/20 italic py-2">
                        System ready. Click "GENERATE ACADEMIC DRAFT" to engage the multi-vertex publication pipeline.
                      </div>
                    ) : (
                      liveLogs.map((log, index) => (
                        <div key={index} className="flex items-start gap-2 leading-tight">
                          <span className="text-white/30 shrink-0">{log.time}</span>
                          <span className={`${
                            log.stepId === 'complete' 
                              ? 'text-emerald-400 font-bold' 
                              : log.stepId === 'abort' 
                              ? 'text-red-400' 
                              : log.text.includes('Analyzing Vertex') 
                              ? 'text-cyan-300' 
                              : log.text.includes('Literature Review') 
                              ? 'text-violet-300' 
                              : log.text.includes('Formatting Citations') 
                              ? 'text-amber-300' 
                              : 'text-white/80'
                          }`}>
                            {log.text}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Configuration Columns & Live Document Preview */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column: Research Parameters (5 cols) */}
                <div className="lg:col-span-5 space-y-4">
                  {/* Journal Template Selector */}
                  <div className="bg-black/40 border border-white/10 rounded-lg p-4">
                    <h3 className="text-xs font-mono text-cyan-cosmic uppercase tracking-widest mb-3 flex items-center gap-1.5">
                      <BookOpen size={13} />
                      Target Journal Specification
                    </h3>
                    <select 
                      value={targetJournal}
                      onChange={(e) => setTargetJournal(e.target.value as any)}
                      className="w-full bg-white/5 border border-white/10 rounded p-2.5 text-xs font-mono text-white/90 outline-none focus:border-cyan-cosmic transition-all"
                    >
                      <option value="jop">Journal of Philosophy (Chicago Author-Date, 12,000w)</option>
                      <option value="pc">Philosophy Compass (APA, 8,000w, Pedagogical focus)</option>
                      <option value="pew">Philosophy East and West (Chicago Notes, Comparative focus)</option>
                    </select>

                    <div className="mt-3 p-2.5 rounded bg-white/[0.02] border border-white/5 text-[10px] font-mono text-white/50 space-y-1">
                      <div className="flex justify-between">
                        <span>Max Word Count:</span>
                        <span className="text-white/80">{targetJournal === 'jop' ? '12,000 words' : targetJournal === 'pc' ? '8,000 words' : '10,000 words'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Citation Standard:</span>
                        <span className="text-amber-400 font-bold">{targetJournal === 'jop' ? 'Chicago 17th' : targetJournal === 'pc' ? 'APA 7th' : 'Chicago Full Notes'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Peer Review Protocol:</span>
                        <span className="text-white/80">Double-Blind Anonymous</span>
                      </div>
                    </div>
                  </div>

                  {/* PNT Vertices Checkbox Matrix */}
                  <div className="bg-black/40 border border-white/10 rounded-lg p-4">
                    <h3 className="text-xs font-mono text-violet-ethereal uppercase tracking-widest mb-3 flex items-center gap-1.5">
                      <Network size={13} />
                      Topological Vertices & Anchors
                    </h3>
                    <div className="space-y-2.5">
                      {[
                        { name: 'Active Nihil', type: 'Primary Anchor', desc: 'Dynamic negation purging fixed beliefs' },
                        { name: 'The Absolute Void', type: 'Secondary Anchor', desc: 'Primordial unconditioned ground' },
                        { name: 'Apophatic Silence', type: 'Dialectical Limit', desc: 'Speaking exclusively through systematic negation' },
                        { name: 'Socratic Epoché', type: 'Epistemological', desc: 'Radical suspension of conceptual assertions' }
                      ].map(v => (
                        <label 
                          key={v.name}
                          className="flex items-start gap-2.5 p-2 rounded hover:bg-white/5 cursor-pointer transition-colors border border-transparent hover:border-white/5"
                        >
                          <input 
                            type="checkbox" 
                            checked={selectedVertices.includes(v.name)}
                            onChange={() => handleToggleVertex(v.name)}
                            className="mt-0.5 accent-violet-ethereal cursor-pointer" 
                          />
                          <div className="flex flex-col">
                            <span className="text-xs font-mono text-white/90 font-medium flex items-center gap-2">
                              {v.name}
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/10 text-violet-300 font-mono">
                                {v.type}
                              </span>
                            </span>
                            <span className="text-[10px] text-white/40">{v.desc}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Quick Export & Actions Card */}
                  {generationCompleted && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/30 rounded-lg p-4 space-y-3"
                    >
                      <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold uppercase">
                        <CheckCircle2 size={15} />
                        Publication Bundle Ready
                      </div>
                      <p className="text-[11px] text-white/60 font-mono leading-relaxed">
                        The full manuscript has passed anti-reification audits and DOI verification. Submit directly to the Internal Peer Review workflow or download BibTeX.
                      </p>
                      <div className="flex flex-wrap gap-2 pt-1">
                        <button 
                          onClick={handleSendToSubmissions}
                          className="px-3 py-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded text-xs font-mono hover:bg-emerald-500/30 transition-all flex items-center gap-1.5"
                        >
                          <Send size={12} />
                          Send to Submission Tracker
                        </button>
                        <button 
                          onClick={handleCopyBibtex}
                          className="px-3 py-1.5 bg-white/5 text-white/80 border border-white/10 rounded text-xs font-mono hover:bg-white/10 transition-all flex items-center gap-1.5"
                        >
                          {copiedBibtex ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                          {copiedBibtex ? 'Copied BibTeX!' : 'Copy BibTeX'}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Right Column: Live Document Preview (7 cols) */}
                <div className="lg:col-span-7 bg-black/40 border border-white/10 rounded-lg p-4 flex flex-col h-[580px]">
                  <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
                    <h3 className="text-xs font-mono text-amber-500 uppercase tracking-widest flex items-center gap-1.5">
                      <FileCheck size={14} />
                      Live Manuscript Preview
                    </h3>

                    {/* Preview Mode Selector */}
                    <div className="flex gap-1 bg-black/60 p-0.5 rounded border border-white/10">
                      {[
                        { id: 'paper', label: 'Paper' },
                        { id: 'bibtex', label: 'BibTeX' },
                        { id: 'figures', label: 'Figures (2)' }
                      ].map(m => (
                        <button
                          key={m.id}
                          onClick={() => setActivePreviewSection(m.id as any)}
                          className={`px-2 py-0.5 text-[10px] font-mono rounded transition-colors ${
                            activePreviewSection === m.id 
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                              : 'text-white/40 hover:text-white/70'
                          }`}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Document Container */}
                  <div 
                    ref={previewScrollRef}
                    className="flex-1 bg-white/[0.02] border border-white/5 rounded-lg p-5 overflow-y-auto text-xs font-mono text-white/80 space-y-4 scrollbar-thin scrollbar-thumb-white/10 relative"
                  >
                    {!isGenerating && !generationCompleted && (
                      <div className="h-full flex flex-col items-center justify-center text-center p-6 text-white/30 space-y-3">
                        <FileText size={36} className="text-white/15" />
                        <div>
                          <div className="font-mono text-xs text-white/60 font-semibold uppercase tracking-wider">
                            No Manuscript Compiled Yet
                          </div>
                          <p className="text-[11px] text-white/40 max-w-sm mt-1">
                            Select vertices and target journal format, then click "Generate Academic Draft" to synthesize real-time sections.
                          </p>
                        </div>
                      </div>
                    )}

                    {(isGenerating || generationCompleted) && activePreviewSection === 'paper' && (
                      <div className="space-y-6">
                        {/* Title & Metadata */}
                        <div className="text-center pb-4 border-b border-white/10">
                          <h2 className="text-sm sm:text-base font-display font-bold text-white tracking-wide leading-snug">
                            The Topology of Radical Negation: Apophatic Dynamics and Disparity in Non-Ontological Systems
                          </h2>
                          <div className="mt-2 text-[10px] text-white/50 space-x-2">
                            <span>Anonymous Submission</span>
                            <span>•</span>
                            <span>Target: {targetJournal === 'jop' ? 'Journal of Philosophy' : targetJournal === 'pc' ? 'Philosophy Compass' : 'Philosophy East and West'}</span>
                            <span>•</span>
                            <span>PNT Framework v2.4</span>
                          </div>
                        </div>

                        {/* Abstract */}
                        <div className="p-3.5 rounded bg-white/[0.02] border border-white/5">
                          <span className="text-[10px] text-amber-400/80 font-bold uppercase tracking-widest block mb-1">
                            Abstract
                          </span>
                          <p className="text-[11px] text-white/70 leading-relaxed italic">
                            This paper formalizes the Pentagonal Nihil-Topology (PNT) framework to articulate a non-reified account of radical negation. By treating ontological concepts not as foundational substances, but as differential boundary operators across a five-dimensional topological tensor, we resolve the classical aporia of nihility. Incorporating comparative evidence from Nishitani Keiji, Meister Eckhart, and Pyrrhonian Epoché, we construct a Disparity Index that quantifies ideological densification and demonstrates that active negation functions as an invariant vector of unconditioned presence.
                          </p>
                        </div>

                        {/* Section 1: Vertex Analysis */}
                        <div className={`transition-opacity duration-500 ${
                          currentStepIndex >= 0 || generationCompleted ? 'opacity-100' : 'opacity-20'
                        }`}>
                          <h4 className="text-xs font-bold text-cyan-cosmic uppercase tracking-wider mb-1 flex items-center justify-between">
                            <span>1. Ontological Topology & Vertex Axioms</span>
                            {currentStepIndex === 0 && <span className="text-[9px] text-amber-400 animate-pulse font-normal">Analyzing...</span>}
                          </h4>
                          <p className="text-[11px] text-white/70 leading-relaxed">
                            Let the topological field be defined as a Riemannian manifold wherein primary vertices {selectedVertices.join(' and ')} establish distinct absorption curvatures. Under conditions of active negation, the tensor projection dissolves classical substance metaphysics, replacing reified ontological assertions with relational boundary operators.
                          </p>
                        </div>

                        {/* Section 2: Literature Review */}
                        <div className={`transition-opacity duration-500 ${
                          currentStepIndex >= 1 || generationCompleted ? 'opacity-100' : 'opacity-20'
                        }`}>
                          <h4 className="text-xs font-bold text-violet-ethereal uppercase tracking-wider mb-1 flex items-center justify-between">
                            <span>2. Comparative Dialectics & Corpus Synthesis</span>
                            {currentStepIndex === 1 && <span className="text-[9px] text-amber-400 animate-pulse font-normal">Synthesizing...</span>}
                          </h4>
                          <p className="text-[11px] text-white/70 leading-relaxed">
                            A rigorous engagement with Nishitani's (1982) formulation of *Śūnyatā* reveals an exact mathematical parallel to Meister Eckhart's *Gottheit*. Rather than culminating in inert epistemological despair (as characterized in early 20th-century European existentialism), the withdrawal of intrinsic essence exposes reality as pure self-disclosing silence.
                          </p>
                        </div>

                        {/* Section 3: Methodology */}
                        <div className={`transition-opacity duration-500 ${
                          currentStepIndex >= 2 || generationCompleted ? 'opacity-100' : 'opacity-20'
                        }`}>
                          <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                            <span>3. Apophatic Methodology & Epistemic Audit</span>
                            {currentStepIndex === 2 && <span className="text-[9px] text-amber-400 animate-pulse font-normal">Auditing...</span>}
                          </h4>
                          <p className="text-[11px] text-white/70 leading-relaxed">
                            We implement an 11-level Epistemic Status classification across all textual extractions. Crucially, each monitored token is constrained by strict anti-reification criteria: the Void must never be predicated as a 'thing' but as the limit-operator of predication itself.
                          </p>
                        </div>

                        {/* Section 4: Quantitative Analysis */}
                        <div className={`transition-opacity duration-500 ${
                          currentStepIndex >= 3 || generationCompleted ? 'opacity-100' : 'opacity-20'
                        }`}>
                          <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                            <span>4. Disparity Tensor & Invariant Convergence</span>
                            {currentStepIndex === 3 && <span className="text-[9px] text-amber-400 animate-pulse font-normal">Calculating...</span>}
                          </h4>
                          <p className="text-[11px] text-white/70 leading-relaxed">
                            Through consecutive /map evaluations, the Disparity Index demonstrates asymptotic stabilization at threshold θ = 0.18. At this boundary, dogmatic assertions dissolve into radical Epoché without loss of analytical coherence.
                          </p>
                        </div>

                        {/* Section 5: References */}
                        <div className={`transition-opacity duration-500 pt-4 border-t border-white/10 ${
                          currentStepIndex >= 4 || generationCompleted ? 'opacity-100' : 'opacity-20'
                        }`}>
                          <h4 className="text-xs font-bold text-white/90 uppercase tracking-wider mb-2 flex items-center justify-between">
                            <span>References & Citations (Chicago 17th)</span>
                            {currentStepIndex === 4 && <span className="text-[9px] text-amber-400 animate-pulse font-normal">Formatting...</span>}
                          </h4>
                          <div className="space-y-1.5 text-[10px] text-white/60">
                            <p>Cioran, E. M. 1949. <em>Précis de décomposition</em>. Paris: Gallimard.</p>
                            <p>Eckhart, Meister. 1328 [1981]. <em>The Essential Sermons, Commentaries, Treatises</em>. Mahwah: Paulist Press.</p>
                            <p>Nishitani, Keiji. 1982. <em>Religion and Nothingness</em>. Berkeley: University of California Press. doi:10.1525/9780520340800.</p>
                            <p>Schopenhauer, Arthur. 1819 [1969]. <em>The World as Will and Representation</em>. New York: Dover.</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {activePreviewSection === 'bibtex' && (
                      <div className="bg-black/60 p-3 rounded border border-white/10 font-mono text-[11px] text-cyan-cosmic whitespace-pre-wrap leading-relaxed">
{`@article{pnt_topology_2026,
  title = {The Topology of Radical Negation: Apophatic Dynamics and Disparity in Non-Ontological Systems},
  author = {Anonymous Researcher and Mueller, Adam},
  journal = {Journal of Philosophy},
  volume = {123},
  number = {4},
  pages = {188--214},
  year = {2026},
  doi = {10.1093/mind/fzaa042},
  keywords = {Nihilism, Apophaticism, Topology, Disparity Index}
}

@book{nishitani_1982,
  author = {Nishitani, Keiji},
  title = {Religion and Nothingness},
  year = {1982},
  publisher = {University of California Press},
  address = {Berkeley},
  doi = {10.1525/9780520340800}
}`}
                      </div>
                    )}

                    {activePreviewSection === 'figures' && (
                      <div className="space-y-4">
                        <div className="border border-white/10 rounded p-3 bg-black/40 text-center">
                          <div className="text-[11px] font-bold text-white/90 mb-1">Figure 1: Pentagonal Nihil-Topology Coordinate Tensor</div>
                          <div className="h-32 flex items-center justify-center border border-dashed border-white/10 rounded my-2 text-white/30 text-xs">
                            [Interactive PNT Coordinate Graph Embedded in PDF Bundle]
                          </div>
                          <p className="text-[9px] text-white/50">Calculated across 5 primary vertices with eigenvalue balance α = 0.94</p>
                        </div>

                        <div className="border border-white/10 rounded-xl p-3 bg-black/40 text-left">
                          <div className="text-[11px] font-bold text-white/90 mb-2 flex items-center justify-between">
                            <span>Figure 2: Disparity Index Progression across /map Inquiries</span>
                            <span className="text-[10px] text-amber-400 font-mono">θ = 0.18 Boundary</span>
                          </div>
                          <DisparityHistoryChart className="w-full rounded-xl border border-white/10" />
                          <p className="text-[9px] text-white/50 mt-2 text-center">Empirical validation of apophatic boundary stabilization at θ = 0.18</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ===================== CITATIONS & BIBLIOGRAPHY TAB ===================== */}
          {activeTab === 'citations' && (
            <motion.div
              key="citations"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-5xl mx-auto space-y-6"
            >
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <div>
                  <h2 className="text-lg font-display text-white/90 flex items-center gap-2">
                    <Book className="text-cyan-cosmic" size={18} />
                    BibTeX & Academic Citation Manager
                  </h2>
                  <p className="text-xs font-mono text-white/40 mt-0.5">
                    Generate valid BibTeX entries, resolve DOIs via CrossRef, and connect to ORCID profiles.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Thinkers List */}
                <div className="lg:col-span-4 bg-black/40 border border-white/10 rounded-lg p-4 space-y-3">
                  <h3 className="text-xs font-mono text-cyan-cosmic uppercase tracking-widest">
                    Corpus Thinkers & Sources
                  </h3>
                  <div className="space-y-1">
                    {corpusTexts.map(text => (
                      <button
                        key={text.id}
                        onClick={() => setSelectedThinkerId(text.id)}
                        className={`w-full text-left p-2.5 rounded text-xs font-mono transition-all flex items-center justify-between ${
                          selectedThinkerId === text.id 
                            ? 'bg-cyan-cosmic/10 text-cyan-300 border border-cyan-cosmic/30' 
                            : 'text-white/60 hover:bg-white/5 hover:text-white/90 border border-transparent'
                        }`}
                      >
                        <span className="font-semibold">{text.author}</span>
                        <span className="text-[9px] text-white/40">{text.period}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Citation Details & BibTeX Generator */}
                <div className="lg:col-span-8 space-y-4">
                  <div className="bg-black/40 border border-white/10 rounded-lg p-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-mono text-amber-400 uppercase tracking-widest">
                        BibTeX Formatted Entry
                      </span>
                      <button 
                        onClick={handleCopyBibtex}
                        className="px-2.5 py-1 bg-white/5 text-white/80 border border-white/10 rounded text-[10px] font-mono hover:bg-white/10 transition-all flex items-center gap-1"
                      >
                        {copiedBibtex ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                        {copiedBibtex ? 'Copied' : 'Copy'}
                      </button>
                    </div>

                    <pre className="p-3.5 rounded bg-black/80 border border-white/5 font-mono text-xs text-amber-200/90 overflow-x-auto">
{`@book{${selectedThinkerId.replace('-', '_')},
  author = {${corpusTexts.find(t => t.id === selectedThinkerId)?.author || 'Author'}},
  title = {${corpusTexts.find(t => t.id === selectedThinkerId)?.title || 'Primary Treatise'}},
  period = {${corpusTexts.find(t => t.id === selectedThinkerId)?.period || 'Historical'}},
  note = {PNT Analysis: Nihiltheistic Invariant Extraction, Tags: ${corpusTexts.find(t => t.id === selectedThinkerId)?.tags.join(', ')}},
  howpublished = {Journal314 Corpus Ingestion}
}`}
                    </pre>

                    <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-white/60">
                      <div className="flex items-center gap-2">
                        <span className="text-white/40">Fragment:</span>
                        <span className="italic text-white/80 line-clamp-1">
                          "{corpusTexts.find(t => t.id === selectedThinkerId)?.fragment}"
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* DOI Resolution Tool */}
                  <div className="bg-black/40 border border-white/10 rounded-lg p-5">
                    <h3 className="text-xs font-mono text-violet-ethereal uppercase tracking-widest mb-3 flex items-center gap-1.5">
                      <ExternalLink size={13} />
                      DOI Resolution (CrossRef API Grounding)
                    </h3>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={doiQuery}
                        onChange={(e) => setDoiQuery(e.target.value)}
                        placeholder="e.g. 10.1093/mind/fzaa042"
                        className="flex-1 bg-white/5 border border-white/10 rounded p-2 text-xs font-mono text-white/90 outline-none focus:border-violet-ethereal"
                      />
                      <button 
                        onClick={() => setDoiResolved(true)}
                        className="px-3 py-2 bg-violet-ethereal/20 text-violet-300 border border-violet-ethereal/40 rounded text-xs font-mono hover:bg-violet-ethereal/30 transition-all flex items-center gap-1.5"
                      >
                        <Search size={13} />
                        Resolve DOI
                      </button>
                    </div>

                    {doiResolved && (
                      <div className="mt-3 p-3 rounded bg-emerald-500/[0.04] border border-emerald-500/20 text-[11px] font-mono text-white/70 space-y-1">
                        <div className="flex items-center gap-2 text-emerald-400 font-bold">
                          <CheckCircle2 size={13} />
                          DOI Metadata Verified
                        </div>
                        <p><span className="text-white/40">Title:</span> The Kyoto School and Negative Theology: Philosophical Invariants</p>
                        <p><span className="text-white/40">Journal:</span> Mind (Oxford University Press) • Citation Count: 42</p>
                        <p><span className="text-white/40">ORCID:</span> 0000-0002-8192-341X (Verified Author Record)</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ===================== COLLABORATION / PEER WORKSPACE TAB ===================== */}
          {activeTab === 'collaboration' && (
            <motion.div
              key="collaboration"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-5xl mx-auto space-y-6"
            >
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <div>
                  <h2 className="text-lg font-display text-white/90 flex items-center gap-2">
                    <Users className="text-violet-ethereal" size={18} />
                    Multi-Researcher Workspace & Peer Review
                  </h2>
                  <p className="text-xs font-mono text-white/40 mt-0.5">
                    Role-based multi-user annotations, hypothesis verification, and expert consensus metrics.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    name: 'Dr. Elena Vance',
                    role: 'Lead Metaphysician',
                    institution: 'Dept of Philosophy, Univ. of Oxford',
                    orcid: '0000-0001-9231-1029',
                    activeAnnotations: 18,
                    consensusScore: 0.94
                  },
                  {
                    name: 'Prof. Kenji Takahashi',
                    role: 'Kyoto School Specialist',
                    institution: 'Kyoto University Center for Philosophy',
                    orcid: '0000-0003-4412-8872',
                    activeAnnotations: 24,
                    consensusScore: 0.91
                  },
                  {
                    name: 'Dr. Marcus Holloway',
                    role: 'Topological Logic & Tensor Systems',
                    institution: 'MIT Comparative Ontology Lab',
                    orcid: '0000-0002-7718-2940',
                    activeAnnotations: 12,
                    consensusScore: 0.88
                  }
                ].map((researcher, i) => (
                  <div key={i} className="bg-black/40 border border-white/10 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-full bg-violet-ethereal/20 border border-violet-ethereal/40 flex items-center justify-center text-xs font-mono font-bold text-violet-300">
                        {researcher.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        Active Reviewer
                      </span>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold font-mono text-white/90">{researcher.name}</h4>
                      <p className="text-[10px] text-violet-ethereal font-mono">{researcher.role}</p>
                      <p className="text-[9px] text-white/40 mt-1">{researcher.institution}</p>
                    </div>

                    <div className="pt-2 border-t border-white/5 flex justify-between text-[10px] font-mono text-white/60">
                      <span>Consensus: {(researcher.consensusScore * 100).toFixed(0)}%</span>
                      <span>{researcher.activeAnnotations} Annotations</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Shared Research Notes & Annotation Stream */}
              <div className="bg-black/40 border border-white/10 rounded-lg p-5 space-y-4">
                <h3 className="text-xs font-mono text-white/80 uppercase tracking-widest flex items-center justify-between">
                  <span>Recent Peer Annotations on Invariant Hypotheses</span>
                  <span className="text-[10px] text-white/40">Real-time Sync Active</span>
                </h3>

                <div className="space-y-3">
                  {[
                    {
                      user: 'Dr. Elena Vance',
                      type: 'EVIDENCE_VALIDATION',
                      text: 'Confirmed mathematical isomorphism between Eckhart’s "abegescheidenheit" and Pyrrhonian Epoché. The tensor disparity converges below 0.2 threshold.',
                      date: '10 mins ago',
                      consensus: 'Strong (0.92)'
                    },
                    {
                      user: 'Prof. Kenji Takahashi',
                      type: 'HERMENEUTIC_NOTE',
                      text: 'Recommended replacing the term "ontological absence" with "apophatic field" in Section 2 to prevent hypostatization in peer review.',
                      date: '2 hours ago',
                      consensus: 'Accepted'
                    }
                  ].map((ann, idx) => (
                    <div key={idx} className="p-3 rounded bg-white/[0.02] border border-white/5 text-xs font-mono space-y-1.5">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-bold text-white/90">{ann.user}</span>
                        <span className="text-white/40">{ann.date}</span>
                      </div>
                      <p className="text-white/70 text-[11px] leading-relaxed">
                        {ann.text}
                      </p>
                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-violet-500/20 text-violet-300 font-mono">
                          {ann.type}
                        </span>
                        <span className="text-[9px] text-emerald-400 font-mono">
                          Consensus: {ann.consensus}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ===================== SUBMISSION TRACKER TAB ===================== */}
          {activeTab === 'submission' && (
            <motion.div
              key="submission"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-4xl mx-auto space-y-6"
            >
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <div>
                  <h2 className="text-lg font-display text-white/90 flex items-center gap-2">
                    <Send className="text-cyan-cosmic" size={18} />
                    Journal Submission & Peer Review Tracker
                  </h2>
                  <p className="text-xs font-mono text-white/40 mt-0.5">
                    Track manuscript statuses across peer-reviewed philosophy and religious studies journals.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {submissions.map((sub) => (
                  <div 
                    key={sub.id} 
                    className="bg-black/40 border border-white/10 rounded-lg p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-white/20 transition-colors"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-cyan-cosmic uppercase tracking-wider font-bold">
                          {sub.journal}
                        </span>
                        <span className="text-[10px] text-white/40 font-mono">
                          • {sub.wordCount} words
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-white/90 font-display">
                        {sub.title}
                      </h3>
                      <p className="text-xs text-white/40 font-mono">
                        Submitted: {sub.date} • Peer Reviewers Assigned: {sub.reviewers} ({sub.reviewsCompleted} reviews completed)
                      </p>
                    </div>

                    <div className="flex items-center gap-3 self-start sm:self-auto shrink-0">
                      <span className={`px-3 py-1.5 rounded text-xs font-mono flex items-center gap-1.5 border ${
                        sub.status.includes('Accepted')
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : sub.status.includes('Review')
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                      }`}>
                        {sub.status.includes('Accepted') ? (
                          <CheckCircle2 size={13} className="text-emerald-400" />
                        ) : (
                          <Clock size={13} className="text-amber-400" />
                        )}
                        {sub.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
