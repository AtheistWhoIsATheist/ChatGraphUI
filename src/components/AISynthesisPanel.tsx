import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, AlertTriangle, Workflow, 
  Database, BrainCircuit, Network, ArrowLeft, Zap, ShieldAlert, BookOpen, Terminal
} from 'lucide-react';
import { cn } from '../lib/utils';
import Markdown from 'react-markdown';
import { getGeminiClient } from '../lib/gemini';
import { Node as GraphNode, Link as GraphLink } from '../data/corpus';
import { auditNihilContent, AuditReport } from '../utils/auditEngine';
import { findResonantCandidates, ResonanceResult } from '../utils/resonanceEngine';
import { resonanceAnalysisPrompt } from '../backend/ai-prompts';
import { DIRECTIVES } from '../lib/library';

const ai = getGeminiClient();

export interface AISynthesisPanelProps {
  nodes: GraphNode[];
  onIntegrate: (newNodes: GraphNode[], newLinks: GraphLink[]) => void;
  onUndo: () => void;
  canUndo: boolean;
}

export function AISynthesisPanel({ nodes: existingNodes, onIntegrate, onUndo, canUndo }: AISynthesisPanelProps) {
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [extractedNodes, setExtractedNodes] = useState<{id: string, label: string, type: string, confidence: number, isInferred?: boolean}[]>([]);
  const [extractedLinks, setExtractedLinks] = useState<{source: string, target: string, type: string, confidence: number, isInferred?: boolean}[]>([]);
  const [hasIntegrated, setHasIntegrated] = useState(false);
  const [auditReport, setAuditReport] = useState<AuditReport | null>(null);
  const [resonanceData, setResonanceData] = useState<ResonanceResult | null>(null);
  const [scrutinyLog, setScrutinyLog] = useState<string[]>([]);
  const intervalRef = React.useRef<NodeJS.Timeout | null>(null);

  const substrateSamples = [
    "Void-Shift detected in Sector 314. Structural instability correlates with Axiom 04.",
    "The collapse of recursive reification suggests a phenomenological rupture in the thinker's intent.",
    "Apophatic discipline is failing; metaphysical smuggling detected in the substrate's core assertions.",
    "The drift between nihilism and existence accelerates. Topology integration is 80% likely."
  ];

  const handleExtractionAndSynthesis = async () => {
    if (!inputText.trim() || !ai) return;
    setIsProcessing(true);
    setScrutinyLog(["Initializing Scrutiny Protocol...", "Accessing Neural Substrate...", "Calibrating Apophatic Filters..."]);
    setResult(null);
    setExtractedNodes([]);
    setExtractedLinks([]);
    setHasIntegrated(false);
    setAuditReport(null);
    setResonanceData(null);

    // Clear any existing interval just in case
    if (intervalRef.current) clearInterval(intervalRef.current);

    // Simulated log drip for tactical feel
    intervalRef.current = setInterval(() => {
      const logs = [
        "Scanning for Metaphysical Smuggling...",
        "Identifying Epistemic Markers...",
        "Calculating Groundlessness Index...",
        "Mapping Structural Gaps...",
        "Crystallizing Node Topology...",
        "Auditing Semantic Integrity..."
      ];
      setScrutinyLog(prev => [...prev, logs[Math.floor(Math.random() * logs.length)]].slice(-6));
    }, 1200);

    try {
      const contextSummary = existingNodes
        .slice(0, 50)
        .map(n => `- ${n.label} (${n.type})`)
        .join('\n');

      const prompt = `
        Analyze the following phenomenological report or philosophical text in the context of Journal314 and Recursive Existential Nihilism (REN).
        
        CONTEXT (EXISTING TOPOLOGY):
        ${contextSummary}

        TASK:
        1. Extract the key Entities PRESENT in the substrate. Map them to these types: 
           - 'void_concept', 'thinker', 'paradox', 'ren_stage', 'axiom', 'argument', 'synthesis'.
        2. INFER STRUCTURAL GAPS: Propose nodes/links NOT in text but logically implied by REN to bridge to the EXISTING TOPOLOGY.
        3. AGNOSTIC FRAMING: Tag every claim with an Epistemic Marker:
           - [TEXTUAL]: Direct extraction.
           - [PHENOMENOLOGICAL]: Experience report.
           - [INTERPRETIVE]: Inferential reading.
           - [ANALOGICAL]: Cross-domain comparison.
           - [APHATIC]: Limit-of-language claims.
        4. ANTI-REIFICATION: Do NOT treat 'Void' or 'Nothingness' as agents or substances. Use operator-language (e.g., 'void-contact', 'nothingness-marker').
        5. Synthesize a Narrative Synthesis that summarizes the text AND acts as a generative layer proposing new philosophical directions.
        6. Determine Integration Level (Isolated, Pattern, Structural, Unified).

        Format the output in Markdown. At the end, provide a JSON block enclosed in \`\`\`json containing nodes and links in this structure:
        {
          "nodes": [
            {"id": "identifier", "label": "Human Label", "type": "axiom", "confidence": 0.95, "isInferred": false}
          ],
          "links": [
            {"source": "id1", "target": "id2", "type": "supports", "confidence": 0.8, "isInferred": true}
          ]
        }
        
        Text to analyze:
        "${inputText}"
      `;

      const response = await ai.models.generateContent({
          model: 'gemini-flash-latest',
          contents: [{ role: 'user', parts: [{ text: prompt }] }]
      });
      
      const text = response.text || '';
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
      
      let markdownText = text;
      
      if (jsonMatch && jsonMatch[1]) {
         try {
           const parsed = JSON.parse(jsonMatch[1]);
           if (parsed.nodes) setExtractedNodes(parsed.nodes);
           if (parsed.links) setExtractedLinks(parsed.links);
           markdownText = text.replace(jsonMatch[0], ''); 
           
           const report = auditNihilContent(markdownText, parsed.nodes, parsed.links);
           setAuditReport(report);

           const candidates = findResonantCandidates(inputText);
           const resonanceTargets = candidates.map(c => `- ${c.label}: ${c.summary || 'Resonant thinker/concept'}`).join('\n');
           
           const resPrompt = resonanceAnalysisPrompt
             .replace('{input_text}', inputText)
             .replace('{resonant_targets}', resonanceTargets);

           const resResult = await ai.models.generateContent({
             model: 'gemini-flash-latest',
             contents: [{ role: 'user', parts: [{ text: resPrompt }] }],
             config: { responseMimeType: 'application/json' }
           });
           
           const resJson = JSON.parse(resResult.text || '{}');
           setResonanceData(resJson);
           
         } catch (e) {
           console.error("Failed to parse extracted JSON", e);
         }
      }

      setResult(markdownText);
    } catch (error) {
      console.error(error);
      setResult("Structural error in synthesis stream. Verify API connection.");
    } finally {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setIsProcessing(false);
    }
  };

  React.useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const commitToGraph = () => {
    if (extractedNodes.length === 0) return;
    
    const typeToGroup: Record<string, number> = {
      'void_concept': 1,
      'thinker': 2,
      'paradox': 3,
      'ren_stage': 4,
      'axiom': 5,
      'argument': 6,
      'synthesis': 7
    };

    const newGraphNodes: GraphNode[] = extractedNodes.map(n => ({
      id: n.id,
      label: n.label || n.id,
      group: typeToGroup[n.type] || 3,
      type: n.type,
      status: n.isInferred ? 'DRAFT' : 'ACTIVE',
      metadata: { 
        source: 'Analysis Engine Synthesis', 
        confidence: n.confidence,
        isInferred: n.isInferred,
        timestamp: new Date().toISOString() 
      }
    }));

    const newGraphLinks: GraphLink[] = extractedLinks.map(l => ({
      source: l.source,
      target: l.target,
      type: l.type,
      value: l.confidence || 0.5,
      metadata: { 
        isInferred: l.isInferred,
        timestamp: new Date().toISOString()
      }
    }));

    onIntegrate(newGraphNodes, newGraphLinks);
    setHasIntegrated(true);
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#0c0c0c] text-zinc-100 p-8 font-mono relative overflow-hidden">
      {/* Structural Grid Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0" 
           style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(16,185,129,0.05)_0%,_transparent_70%)] pointer-events-none z-0"></div>
      
      <div className="flex-shrink-0 mb-8 flex items-center justify-between gap-4 relative z-10 border-b border-emerald-500/10 pb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/5 border border-white/10 rounded-2xl">
            <BrainCircuit className="w-8 h-8 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-3xl font-serif font-light tracking-[0.2em] text-white">AXIOMFORGE</h1>
            <div className="text-[9px] font-bold tracking-[0.3em] text-emerald-500/60 mt-1 uppercase">Semantic Ingestion & Synthesis Protocol</div>
          </div>
        </div>

        <AnimatePresence>
          {canUndo && (
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onClick={onUndo}
              className="group flex items-center gap-2 px-5 py-3 bg-zinc-900 border border-white/10 hover:border-emerald-500/40 text-zinc-400 hover:text-white transition-all rounded-2xl shadow-xl hover:-translate-x-1"
              title="Revert Growth"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="text-[10px] font-bold tracking-widest uppercase">Rollback Stream</span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-8 flex-1 min-h-0 relative z-10">
        <div className="flex-1 flex flex-col gap-6">
          <div className="p-5 bg-white/5 border border-white/5 rounded-2xl">
             <p className="text-[11px] text-zinc-400 leading-relaxed tracking-wider flex items-center gap-3">
               <Workflow className="w-4 h-4 text-emerald-500" /> 
               Input phenomenological substrate. The Analysis Engine will calculate integration resonance and structural nodes.
             </p>
          </div>
          
          <div className="flex-1 relative group rounded-2xl overflow-hidden border border-white/5 focus-within:border-emerald-500/30 transition-all duration-500 bg-black/20 shadow-2xl">
            <textarea 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full h-full bg-transparent p-8 text-sm font-mono text-zinc-300 resize-none outline-none relative z-10 custom-scrollbar placeholder:text-zinc-800 tracking-tight leading-relaxed"
              placeholder="SUBSURFACE SCANNING ACTIVE [AWAITING SUBSTRATE]..."
            />
            {/* Visual scanline effect */}
            <div className="absolute inset-0 pointer-events-none z-20 bg-gradient-to-b from-transparent via-emerald-500/5 to-transparent h-[10%] w-full animate-[scan_8s_linear_infinite]" />
          </div>

          {/* PEC Ω System Directives Library */}
          <div className="p-4 bg-zinc-950/40 border border-white/5 rounded-2xl flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-500/80 flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-emerald-500" />
                PEC Ω SYSTEM DIRECTIVES LIBRARY
              </span>
              <span className="text-[8px] font-mono text-zinc-500 tracking-[0.2em] uppercase">SEED SUBSTRATE AVAILABLE</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {DIRECTIVES.map((dir) => (
                <button
                  key={dir.id}
                  onClick={() => setInputText(dir.body)}
                  className="text-left p-3.5 bg-zinc-900/50 hover:bg-emerald-950/25 border border-white/5 hover:border-emerald-500/20 hover:scale-[1.01] transition-all rounded-xl duration-300 group flex flex-col gap-1.5"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[11px] font-bold text-white group-hover:text-emerald-400 font-sans transition-colors">{dir.title}</span>
                    <span className={cn(
                      "text-[7px] uppercase font-bold px-1.5 py-0.5 rounded tracking-widest",
                      dir.intensity === "maximal" ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    )}>
                      {dir.intensity}
                    </span>
                  </div>
                  <p className="text-[9px] text-zinc-400 leading-normal font-sans line-clamp-2">{dir.summary}</p>
                  <div className="text-[7.5px] text-zinc-600 font-mono uppercase tracking-wider mt-1">
                    Audience: {dir.audience}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-2">
            {substrateSamples.map((sample, idx) => (
              <button
                key={idx}
                onClick={() => setInputText(sample)}
                className="text-left p-3 text-[9px] text-zinc-500 hover:text-emerald-400 border border-white/5 hover:border-emerald-500/30 bg-white/5 hover:bg-emerald-500/5 transition-all rounded-lg font-mono uppercase tracking-tighter"
              >
                Scan Target: {sample.slice(0, 45)}...
              </button>
            ))}
          </div>

          <button 
            onClick={handleExtractionAndSynthesis}
            disabled={isProcessing || !inputText.trim() || !ai}
            className="group relative overflow-hidden bg-emerald-500 text-black disabled:bg-zinc-800 disabled:text-zinc-500 py-5 px-8 font-bold font-mono tracking-[0.3em] uppercase text-[10px] transition-all active:scale-[0.98] rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.2)]"
          >
            <div className="flex items-center justify-center gap-3 relative z-10">
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-black/20 border-t-black animate-spin rounded-full" />
                  <span className="animate-pulse">Synthesizing Scrutiny...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{ai ? "INITIALIZE SYNTHESIS" : "CORE LACKING"}</span>
                </>
              )}
            </div>
          </button>
        </div>

        <div className="flex-1 bg-zinc-900/10 border border-white/5 p-8 overflow-y-auto custom-scrollbar flex flex-col gap-8 relative rounded-3xl backdrop-blur-3xl">
          {!result && !isProcessing && (
             <div className="absolute inset-0 flex items-center justify-center text-zinc-800 flex-col gap-6">
                <div className="p-6 border border-zinc-900/50 rounded-full animate-pulse">
                  <Database className="w-12 h-12 opacity-20" />
                </div>
                <p className="text-[10px] font-bold tracking-[0.4em] uppercase opacity-40">Awaiting Sub-Textual Input</p>
             </div>
          )}
          
          {isProcessing && (
             <div className="absolute inset-0 flex items-center justify-center flex-col gap-10 bg-black/80 backdrop-blur-md z-50">
                <div className="relative">
                  <div className="w-24 h-24 border-2 border-emerald-500/10 rounded-full animate-ping" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <BrainCircuit className="w-10 h-10 text-emerald-400 animate-pulse" />
                  </div>
                </div>
                
                <div className="w-full max-w-sm flex flex-col gap-2">
                  <div className="text-[10px] tracking-[0.3em] font-bold text-emerald-500/60 font-mono mb-2 uppercase text-center">Sub-Surface Scrutiny Active</div>
                  <div className="bg-black/40 border border-white/5 p-4 rounded-xl flex flex-col gap-1 uppercase font-mono text-[8px] text-zinc-500">
                    {scrutinyLog.map((log, i) => (
                      <div key={i} className="flex items-center gap-3">
                         <span className="text-emerald-500/40">[{new Date().toLocaleTimeString()}]</span>
                         <span className={i === scrutinyLog.length - 1 ? "text-emerald-400 animate-pulse" : ""}>{log}</span>
                      </div>
                    ))}
                  </div>
                </div>
             </div>
          )}
 
          {result && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-8 relative z-10">
               <motion.div 
                 initial={{ y: 20, opacity: 0 }} 
                 animate={{ y: 0, opacity: 1 }}
                 transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                 className="prose prose-invert prose-sm max-w-none font-mono selection:bg-emerald-500/30"
               >
                 <Markdown>{result}</Markdown>
               </motion.div>
 
               {auditReport && (
                 <motion.div 
                   initial={{ scale: 0.95, opacity: 0 }}
                   animate={{ scale: 1, opacity: 1 }}
                   transition={{ delay: 0.2, duration: 0.6 }}
                   className={cn(
                    "p-6 border rounded-xl bg-black/60 backdrop-blur-3xl relative overflow-hidden group",
                    auditReport.status === 'PASS' ? "border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.05)]" : 
                    auditReport.status === 'FAIL' ? "border-red-500/20" : "border-yellow-500/20"
                  )}>
                   <div className="flex items-center justify-between mb-6">
                     <h4 className="text-[9px] font-bold tracking-[0.4em] uppercase text-zinc-500 flex items-center gap-3">
                       <Database className="w-4 h-4 text-emerald-500/60" /> Apophatic Discipline Audit
                     </h4>
                     <div className={cn(
                        "px-3 py-1 rounded-sm text-[9px] font-bold uppercase tracking-[0.1em] border",
                        auditReport.status === 'PASS' ? "bg-emerald-500/5 text-emerald-500 border-emerald-500/20" : 
                        auditReport.status === 'FAIL' ? "bg-red-500/5 text-red-500 border-red-500/20" : "bg-yellow-500/5 text-yellow-500 border-yellow-500/20"
                      )}>
                        {auditReport.status} // {auditReport.overallScore}.00
                      </div>
                   </div>
 
                   <div className="space-y-4">
                      {auditReport.sections.groundlessness.length > 0 && (
                        <motion.div 
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.4 }}
                          className="flex gap-4 p-4 bg-emerald-500/5 rounded-lg border border-emerald-500/10 relative group"
                        >
                          <div className="absolute left-0 top-0 w-1 h-full bg-emerald-500/40" />
                          <Zap className="w-5 h-5 text-emerald-400 flex-shrink-0 animate-pulse" />
                          <div>
                            <div className="text-[11px] text-emerald-400 font-bold uppercase tracking-[0.2em] mb-1">Groundlessness Exhibit</div>
                            <div className="text-[10px] text-zinc-400 leading-relaxed font-mono">
                              The substrate exhibits structural groundlessness through: <span className="text-emerald-300/80">{auditReport.sections.groundlessness.map(g => g.evidence).join(', ')}</span>.
                            </div>
                          </div>
                        </motion.div>
                      )}
                      
                      <div className="space-y-3">
                        {[
                          ...auditReport.sections.antiReification,
                          ...auditReport.sections.metaphysicalSmuggling,
                          ...auditReport.sections.epistemicMarkers
                        ].filter(f => f.result !== 'PASS').map((finding, idx) => (
                          <motion.div 
                            key={idx} 
                            initial={{ x: -10, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.5 + (idx * 0.1) }}
                            className="flex gap-4 p-3 hover:bg-white/5 transition-colors rounded-lg group/finding"
                          >
                            <AlertTriangle className={cn(
                              "w-4 h-4 flex-shrink-0 mt-0.5 transition-colors",
                              finding.result === 'FAIL' ? "text-red-500/60 group-hover/finding:text-red-400" : "text-yellow-500/60 group-hover/finding:text-yellow-400"
                            )} />
                            <div>
                              <div className="text-[10px] text-zinc-300 font-bold tracking-tight">{finding.check}</div>
                              <div className="text-[9px] text-zinc-500 leading-relaxed mt-1 font-mono">
                                {finding.recommendation}
                                {finding.evidence && (
                                  <span className="block mt-2 font-mono text-emerald-500/40 italic text-[8px] bg-emerald-500/5 p-2 rounded border border-emerald-500/10">"{finding.evidence}"</span>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
 
                      {auditReport.status === 'PASS' && (
                        <div className="text-[9px] text-emerald-500/60 flex items-center gap-3 bg-emerald-500/5 p-4 rounded-lg border border-emerald-500/10">
                          <Sparkles className="w-4 h-4" /> 
                          <span className="tracking-widest uppercase">Structural integrity verified: Axioms maintain apophatic discipline.</span>
                        </div>
                      )}
                   </div>
                 </motion.div>
               )}
               
               {resonanceData && (
                 <motion.div 
                   initial={{ y: 20, opacity: 0 }}
                   animate={{ y: 0, opacity: 1 }}
                   transition={{ delay: 0.3 }}
                   className="p-6 border border-emerald-500/20 rounded-xl bg-black/60 backdrop-blur-3xl relative overflow-hidden"
                 >
                   <div className="flex items-center justify-between mb-6">
                     <h4 className="text-[9px] font-bold tracking-[0.4em] uppercase text-emerald-500/60 flex items-center gap-3">
                       <Workflow className="w-4 h-4" /> Resonance Profile // Comparative Scrutiny
                     </h4>
                   </div>
                   
                   <p className="text-[10px] text-zinc-400 italic mb-8 leading-relaxed font-mono border-l border-zinc-800 pl-4 py-2">
                     {resonanceData.summary}
                   </p>
 
                   <div className="space-y-8">
                     <div>
                       <div className="text-[9px] font-bold text-zinc-600 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                         <div className="h-px flex-1 bg-zinc-800" /> Structural Similarities
                       </div>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                         {resonanceData.similarities.map((s, i) => (
                           <div key={i} className="flex flex-col gap-1 p-4 bg-white/[0.02] rounded-lg border border-white/5 hover:border-emerald-500/20 transition-all group">
                             <div className="flex items-center justify-between mb-2">
                               <div className="text-[10px] text-zinc-200 font-bold group-hover:text-emerald-400 transition-colors uppercase tracking-tight">{s.tradition}</div>
                               <div className="text-[8px] text-emerald-500 font-mono bg-emerald-500/10 px-1.5 py-0.5">{(s.intensity * 100).toFixed(0)}%</div>
                             </div>
                             <div className="text-[9px] text-zinc-500 font-mono leading-relaxed">{s.similarity}</div>
                           </div>
                         ))}
                       </div>
                     </div>
 
                     <div>
                       <div className="text-[9px] font-bold text-zinc-600 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                         <div className="h-px flex-1 bg-zinc-800" /> Non-Equivalence Remainders
                       </div>
                       <div className="space-y-3">
                         {resonanceData.remainders.map((r, i) => (
                           <div key={i} className="p-4 bg-red-500/[0.03] rounded-lg border border-red-500/10 flex gap-4">
                             <div className="text-red-500/40 text-[9px] font-mono mt-0.5">0{i+1}</div>
                             <div>
                               <div className="text-[11px] text-zinc-300 font-bold mb-1 uppercase tracking-tight">{r.concept}</div>
                               <div className="text-[10px] text-zinc-500 leading-relaxed font-mono">{r.difference}</div>
                             </div>
                           </div>
                         ))}
                       </div>
                     </div>
 
                     <div>
                       <div className="text-[9px] font-bold text-zinc-600 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                         <div className="h-px flex-1 bg-zinc-800" /> Generative Bridges
                       </div>
                       <div className="grid grid-cols-1 gap-3">
                         {resonanceData.generative_bridges.map((b, i) => (
                           <div key={i} className="p-4 bg-emerald-500/[0.03] rounded-lg border border-emerald-500/10 flex items-start gap-4 hover:border-emerald-500/30 transition-all">
                             <Sparkles className="w-4 h-4 text-emerald-500 mt-0.5" />
                             <div>
                               <div className="text-[11px] text-white font-bold mb-1 tracking-tight">{b.source} <span className="text-emerald-500 mx-2">→</span> {b.target}</div>
                               <div className="text-[10px] text-zinc-500 leading-relaxed font-mono">{b.logic}</div>
                             </div>
                           </div>
                         ))}
                       </div>
                     </div>
                   </div>
                 </motion.div>
               )}
               
               {extractedNodes.length > 0 && (
                 <motion.div 
                   initial={{ opacity: 0 }} 
                   animate={{ opacity: 1 }} 
                   transition={{ delay: 0.5 }}
                   className="mt-12 pt-12 border-t border-emerald-500/10"
                 >
                     <div className="flex items-center justify-between mb-8">
                       <h3 className="text-[10px] font-bold tracking-[0.4em] uppercase text-zinc-500 flex items-center gap-4">
                          <Network className="w-5 h-5 text-emerald-500" /> Extracted Topology
                       </h3>
                       <div className="text-[9px] text-zinc-600 font-mono tracking-widest">{extractedNodes.length} NODES // {extractedLinks.length} LINKS</div>
                     </div>
 
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                        {extractedNodes.map((node, i) => (
                         <motion.div 
                           key={i} 
                           initial={{ x: 20, opacity: 0 }}
                           animate={{ x: 0, opacity: 1 }}
                           transition={{ delay: 0.6 + (i * 0.05) }}
                           className={cn(
                            "px-5 py-4 bg-black/40 border flex items-center gap-4 relative overflow-hidden group rounded-lg transition-all",
                            node.isInferred ? "border-emerald-500/10 border-dashed" : "border-white/5 hover:border-emerald-500/20"
                          )}
                         >
                             <div className={cn(
                               "w-2 h-2 rounded-full transition-all duration-500 group-hover:scale-150 group-hover:shadow-[0_0_10px_rgba(16,185,129,0.5)]",
                               node.isInferred ? "bg-emerald-500/20 border border-emerald-500/40" : "bg-emerald-500/40 group-hover:bg-emerald-500"
                             )} />
                             <div className="flex-1">
                               <div className="flex items-center gap-2">
                                 <div className="text-[12px] font-bold text-white mb-0.5 tracking-tight">{node.label}</div>
                                 {node.isInferred && (
                                   <span className="text-[8px] bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded-sm uppercase tracking-[0.1em] border border-emerald-500/20">Inferred</span>
                                 )}
                               </div>
                               <div className="text-[9px] text-zinc-600 uppercase tracking-[0.2em] font-mono">{node.type}</div>
                             </div>
                             <div className="text-[10px] text-emerald-500/40 font-mono font-bold">
                               {Math.round(node.confidence * 100)}%
                             </div>
                          </motion.div>
                        ))}
                     </div>
 
                     {!hasIntegrated ? (
                       <button
                         onClick={commitToGraph}
                         className="w-full py-5 bg-emerald-500 text-black font-bold tracking-[0.4em] uppercase text-[11px] rounded-xl hover:bg-emerald-400 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] active:scale-[0.99]"
                       >
                         Merge into Core Topology
                       </button>
                     ) : (
                       <div className="w-full py-5 bg-zinc-900/50 border border-emerald-500/20 text-emerald-400/60 font-bold tracking-[0.4em] uppercase text-[11px] rounded-xl flex items-center justify-center gap-4 animate-pulse">
                         <Sparkles className="w-5 h-5" /> Structural Convergence Complete
                       </div>
                     )}
                 </motion.div>
               )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
