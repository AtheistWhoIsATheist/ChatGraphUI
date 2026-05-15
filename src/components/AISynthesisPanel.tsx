import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Cpu, FileText, Sparkles, AlertTriangle, Workflow, 
  Undo2, Database, BrainCircuit, Network, ArrowLeft
} from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { cn } from '../lib/utils';
import Markdown from 'react-markdown';
import { getGeminiClient } from '../lib/gemini';
import { Node as GraphNode, Link as GraphLink } from '../data/corpus';

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

  const handleExtractionAndSynthesis = async () => {
    if (!inputText.trim() || !ai) return;
    setIsProcessing(true);
    setResult(null);
    setExtractedNodes([]);
    setExtractedLinks([]);
    setHasIntegrated(false);

    try {
      // Summarize context to avoid token bloat
      const contextSummary = existingNodes
        .slice(0, 50) // Limit to first 50 for context
        .map(n => `- ${n.label} (${n.type})`)
        .join('\n');

      const prompt = `
        Analyze the following phenomenological report or philosophical text in the context of Journal314 and Recursive Existential Nihilism (REN).
        
        CONTEXT (EXISTING TOPOLOGY):
        ${contextSummary}

        TASK:
        1. Extract the key Entities PRESENT in the text. Map them to these types: 
           - 'void_concept', 'thinker', 'paradox', 'ren_stage', 'axiom', 'argument', 'synthesis'.
        2. INFER STRUCTURAL GAPS: Propose nodes and links that are NOT in the text but should logically exist to support the argument or bridge it to the EXISTING TOPOLOGY.
        3. Infer strong Links connecting these entities.
        4. Synthesize a Narrative Synthesis that summarizes the text AND acts as a generative layer proposing new philosophical directions.
        5. Determine Integration Level (Isolated, Pattern, Structural, Unified).

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
          model: 'gemini-2.5-pro',
          contents: prompt,
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
         } catch (e) {
           console.error("Failed to parse extracted JSON", e);
         }
      }

      setResult(markdownText);
    } catch (error) {
      console.error(error);
      setResult("Structural error in synthesis stream. Verify neural connection.");
    } finally {
      setIsProcessing(false);
    }
  };

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
        source: 'AxiomForge Synthesis', 
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
    <div className="w-full h-full flex flex-col bg-zinc-950 text-zinc-100 p-8 font-mono relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxyZWN0IHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9IiMwMDAiIC8+PGNpcmNsZSBjeD0iNCIgY3k9IjQiIHI9IjEiIGZpbGw9IiMzMzMiIC8+PC9zdmc+')] opacity-20 pointer-events-none z-0"></div>
      
      <div className="flex-shrink-0 mb-8 flex items-center justify-between gap-4 relative z-10 border-b-2 border-white/5 pb-6">
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
               Input phenomenological substrate. AxiomForge will calculate integration resonance and structural nodes.
             </p>
          </div>
          
          <div className="flex-1 relative group rounded-3xl overflow-hidden border border-white/5 focus-within:border-emerald-500/30 transition-colors">
            <textarea 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full h-full bg-black/40 p-8 text-sm font-mono text-zinc-300 resize-none outline-none relative z-10 custom-scrollbar placeholder:text-zinc-800"
              placeholder="AWAITING NEURAL SUBSTRATE... (e.g., 'Void-Shift detected in Sector 314. Structural instability correlates with Axiom 04.')"
            />
          </div>
          <button 
            onClick={handleExtractionAndSynthesis}
            disabled={isProcessing || !inputText.trim() || !ai}
            className="group relative overflow-hidden bg-white text-black disabled:bg-zinc-800 disabled:text-zinc-500 py-5 px-8 font-bold font-mono tracking-[0.3em] uppercase text-xs transition-all active:scale-[0.98] rounded-2xl"
          >
            <div className="flex items-center justify-center gap-3 relative z-10">
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-black/20 border-t-black animate-spin rounded-full" />
                  <span>Synthesizing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{ai ? "Initialize Synthesis" : "Core Offline"}</span>
                </>
              )}
            </div>
            <div className="absolute inset-0 bg-emerald-400 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none" />
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
             <div className="absolute inset-0 flex items-center justify-center flex-col gap-8">
                <div className="relative">
                  <div className="w-20 h-20 border-2 border-emerald-500/10 rounded-full animate-ping" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <BrainCircuit className="w-8 h-8 text-emerald-400 animate-pulse" />
                  </div>
                </div>
                <p className="text-[10px] tracking-[0.3em] font-bold text-zinc-500 font-mono animate-pulse uppercase">Crystallizing semantic markers...</p>
             </div>
          )}
 
          {result && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-8 relative z-10">
               <div className="prose prose-invert prose-sm max-w-none font-mono">
                 <Markdown>{result}</Markdown>
               </div>
               
               {extractedNodes.length > 0 && (
                 <div className="mt-8 pt-8 border-t border-white/5">
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-[10px] font-bold tracking-[0.2em] uppercase text-zinc-500 flex items-center gap-3">
                         <Network className="w-4 h-4 text-emerald-500" /> Extracted Topology
                      </h3>
                      <div className="text-[9px] text-zinc-600 font-mono">{extractedNodes.length} Elements | {extractedLinks.length} Connections</div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
                       {extractedNodes.map((node, i) => (
                        <div key={i} className={cn(
                          "px-4 py-3 bg-black/40 border flex items-center gap-4 relative overflow-hidden group rounded-xl transition-all",
                          node.isInferred ? "border-emerald-500/10 border-dashed" : "border-white/5 hover:border-emerald-500/20"
                        )}>
                            <div className={cn(
                              "w-1.5 h-1.5 rounded-full transition-colors",
                              node.isInferred ? "bg-emerald-500/20 border border-emerald-500/40" : "bg-emerald-500/40 group-hover:bg-emerald-500"
                            )} />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <div className="text-[11px] font-bold text-white mb-1">{node.label}</div>
                                {node.isInferred && (
                                  <span className="text-[7px] bg-emerald-500/10 text-emerald-500 px-1 py-0.5 rounded uppercase tracking-tighter">Inferred</span>
                                )}
                              </div>
                              <div className="text-[8px] text-zinc-600 uppercase tracking-widest">{node.type}</div>
                            </div>
                            <div className="text-[9px] text-emerald-500/40 font-mono font-bold">
                              {(node.confidence * 100).toFixed(0)}%
                            </div>
                         </div>
                       ))}
                    </div>

                    {!hasIntegrated ? (
                      <button
                        onClick={commitToGraph}
                        className="w-full py-4 bg-emerald-500 text-black font-bold tracking-[0.3em] uppercase text-[10px] rounded-xl hover:bg-emerald-400 transition-all shadow-lg active:scale-[0.99]"
                      >
                        Merge into Core Topology
                      </button>
                    ) : (
                      <div className="w-full py-4 bg-zinc-900 border border-white/5 text-emerald-400/60 font-bold tracking-[0.3em] uppercase text-[10px] rounded-xl flex items-center justify-center gap-3">
                        <Sparkles className="w-4 h-4" /> Structural Convergence Complete
                      </div>
                    )}
                 </div>
               )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
