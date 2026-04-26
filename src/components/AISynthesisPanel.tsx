import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Cpu, FileText, Sparkles, AlertTriangle, Workflow } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { cn } from '../lib/utils';
import Markdown from 'react-markdown';

// Initialize Gemini
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export function AISynthesisPanel() {
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [extractedNodes, setExtractedNodes] = useState<{id: string, type: string, confidence: number}[]>([]);

  const handleExtractionAndSynthesis = async () => {
    if (!inputText.trim() || !ai) return;
    setIsProcessing(true);
    setResult(null);
    setExtractedNodes([]);

    try {
      const prompt = `
        Analyze the following phenomenological report or philosophical text.
        1. Extract the key Entities (EVENTS, ENTITIES, LOCATIONS, THEMES).
        2. Synthesize an overarching narrative or high-level insight connecting these nodes across Journal314 and REN.
        3. Determine the Integration Level (Isolated Observation, Pattern Recognition, Structural Causality, Unified Theory).

        Format the output in Markdown. At the end, provide a JSON block enclosed in \`\`\`json containing the extracted nodes in this format:
        [{"id": "Concept Name", "type": "THEME", "confidence": 0.9}]
        
        Text to analyze:
        "${inputText}"
      `;

      // Use a standard model
      const response = await ai.models.generateContent({
          model: 'gemini-2.5-pro',
          contents: prompt,
      });
      
      const text = response.text || '';
      
      // Attempt to parse JSON nodes
      const jsonMatch = text.match(/\`\`\`json\n([\s\S]*?)\n\`\`\`/);
      
      let nodes = [];
      let markdownText = text;
      
      if (jsonMatch && jsonMatch[1]) {
         try {
           nodes = JSON.parse(jsonMatch[1]);
           setExtractedNodes(nodes);
           markdownText = text.replace(jsonMatch[0], ''); // remove JSON from the displayed markdown
         } catch (e) {
           console.error("Failed to parse extracted JSON nodes", e);
         }
      }

      setResult(markdownText);
    } catch (error) {
      console.error(error);
      setResult("Error processing the text. Please check your API key and connection.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#000] text-[#eee] p-8 font-mono relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxyZWN0IHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9IiMwMDAiIC8+PGNpcmNsZSBjeD0iNCIgY3k9IjQiIHI9IjEiIGZpbGw9IiMzMzMiIC8+PC9zdmc+')] opacity-20 pointer-events-none z-0"></div>
      
      <div className="flex-shrink-0 mb-8 flex items-center gap-4 relative z-10 border-b-2 border-[#333] pb-6">
        <div className="p-3 bg-[#111] border-2 border-[#00E5FF]">
          <Sparkles className="w-8 h-8 text-[#00E5FF] animate-pulse-slow" />
        </div>
        <div>
          <h1 className="text-3xl font-serif font-black tracking-widest uppercase text-[#00E5FF]">AxiomForge</h1>
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#FF3A00] mt-2">AI Entity Extraction & Synthesis Protocol</div>
        </div>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-8 flex-1 min-h-0 relative z-10">
        {/* Left Column - Input */}
        <div className="flex-1 flex flex-col gap-6">
          <p className="text-sm text-[#888] leading-relaxed tracking-wider border-l-2 border-[#FF3A00] pl-4">
            Input phenomenological fieldwork, journal entry, or philosophical anomaly. 
            The AxiomForge will synthesize overarching themes, extract node entities, and calculate integration resonance.
          </p>
          <div className="flex-1 relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#00E5FF] to-transparent opacity-0 group-hover:opacity-20 transition-opacity"></div>
            <textarea 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full h-full bg-[#050505] border-2 border-[#333] p-6 text-sm font-mono text-[#ccc] resize-none focus:outline-none focus:border-[#00E5FF] transition-colors relative z-10 custom-scrollbar"
              placeholder="AWAITING INPUT... (e.g., 'Journal 314 Entry: The static returns at 03:00. REN transcript correlates with loss of signal.')"
            />
          </div>
          <button 
            onClick={handleExtractionAndSynthesis}
            disabled={isProcessing || !inputText.trim() || !ai}
            className="bg-[#000] disabled:opacity-50 disabled:cursor-not-allowed text-[#00E5FF] font-bold font-mono tracking-widest uppercase py-4 px-6 border-2 border-[#00E5FF] flex items-center justify-center gap-3 transition-all hover:bg-[#00E5FF] hover:text-[#000] shadow-[6px_6px_0px_rgba(0,229,255,0.2)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
          >
            {isProcessing ? (
              <span className="flex items-center gap-3"><Cpu className="w-5 h-5 animate-pulse" /> Processing...</span>
            ) : (
              <span className="flex items-center gap-3"><Workflow className="w-5 h-5" /> {ai ? "Extract & Synthesize" : "API Key Required"}</span>
            )}
          </button>
        </div>

        {/* Right Column - Results */}
        <div className="flex-1 bg-[#050505] border-2 border-[#333] p-8 overflow-y-auto custom-scrollbar flex flex-col gap-8 relative">
          {!result && !isProcessing && (
             <div className="absolute inset-0 flex items-center justify-center text-[#444] flex-col gap-4">
                <FileText className="w-16 h-16 opacity-30" />
                <p className="text-sm font-bold tracking-widest uppercase">Awaiting Raw Substrate...</p>
             </div>
          )}
          
          {isProcessing && (
             <div className="absolute inset-0 flex items-center justify-center flex-col gap-6">
                <div className="w-16 h-16 border-4 border-[#333] border-t-[#00E5FF] animate-spin" />
                <p className="text-sm tracking-widest font-bold uppercase text-[#00E5FF] font-mono animate-pulse">Running semantic extraction...</p>
             </div>
          )}

          {result && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-8 relative z-10">
               <div className="prose prose-invert prose-sm prose-p:leading-relaxed prose-a:text-[#00E5FF] prose-headings:font-serif prose-headings:text-[#FF3A00] max-w-none font-mono">
                 <Markdown>{result}</Markdown>
               </div>
               
               {extractedNodes.length > 0 && (
                 <div className="mt-8 pt-8 border-t-2 border-[#333]">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-[#888] mb-6 flex items-center gap-3">
                       <Database className="w-5 h-5 text-[#00E5FF]" /> Extracted Graph Nodes
                    </h3>
                    <div className="flex flex-wrap gap-4">
                       {extractedNodes.map((node, i) => (
                         <div key={i} className="px-4 py-2 bg-[#111] border border-[#444] flex items-center gap-3 relative overflow-hidden group hover:border-[#00E5FF]">
                            <div className="absolute top-0 right-0 p-1 bg-[#111] border-b border-l border-[#333] text-[9px] text-[#FF3A00] font-mono">
                              C={(node.confidence * 100).toFixed(0)}%
                            </div>
                            <span className={cn(
                              "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5",
                              node.type === 'THEME' ? 'bg-[#ff3a00]/20 text-[#ff3a00]' :
                              node.type === 'THINKER' ? 'bg-[#00e5ff]/20 text-[#00e5ff]' : 'bg-[#fff]/10 text-[#fff]'
                            )}>{node.type}</span>
                            <span className="text-sm font-bold text-[#eee] tracking-tight">{node.id}</span>
                         </div>
                       ))}
                    </div>
                 </div>
               )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

// Included missing Database icon directly since I missed updating the imports
import { Database } from 'lucide-react';
