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
        1. Extract the key Entities (THINKERS, CONCEPTS, THEMES, AXIOMS).
        2. Synthesize an overarching narrative or high-level insight connecting these nodes.
        3. Determine the Integration Level (Descriptive Nihilism, Liminal Phase, Nihiltheistic Integration, Mystical Synthesis).

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
    <div className="w-full h-full flex flex-col bg-[#0a0a0a] text-zinc-100 p-8 overflow-hidden font-sans">
      <div className="flex-shrink-0 mb-6 flex items-center gap-3">
        <Sparkles className="w-6 h-6 text-fuchsia-400" />
        <h1 className="text-2xl font-light tracking-tight text-zinc-100">AI Entity Extraction & Synthesis</h1>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 overflow-y-auto custom-scrollbar">
        {/* Left Column - Input */}
        <div className="flex-1 flex flex-col gap-4">
          <p className="text-sm text-zinc-400 leading-relaxed">
            Paste a phenomenological fieldwork report, journal entry, or philosophical text. 
            The AI model will synthesize overarching themes, extract entities (nodes), and calculate integration levels.
          </p>
          <textarea 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="w-full flex-1 min-h-[300px] bg-zinc-900/50 border border-white/10 rounded-xl p-4 text-sm font-mono text-zinc-300 resize-none focus:outline-none focus:border-fuchsia-500/50 transition-colors"
            placeholder="Enter text for analysis... (e.g., 'In the end, there is nothing but darkness and the self dissolving into it. The void is not empty—it is full of what cannot be named.')"
          />
          <button 
            onClick={handleExtractionAndSynthesis}
            disabled={isProcessing || !inputText.trim() || !ai}
            className="bg-fuchsia-600 hover:bg-fuchsia-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            {isProcessing ? (
              <span className="flex items-center gap-2"><Cpu className="w-4 h-4 animate-pulse" /> Processing...</span>
            ) : (
              <span className="flex items-center gap-2"><Workflow className="w-4 h-4" /> {ai ? "Extract & Synthesize" : "API Key Required"}</span>
            )}
          </button>
        </div>

        {/* Right Column - Results */}
        <div className="flex-1 bg-zinc-900/40 border border-white/5 rounded-xl p-6 overflow-y-auto custom-scrollbar flex flex-col gap-6">
          {!result && !isProcessing && (
             <div className="h-full flex items-center justify-center text-zinc-600 flex-col gap-3">
                <FileText className="w-10 h-10 opacity-50" />
                <p className="text-sm">Awaiting text for synthesis...</p>
             </div>
          )}
          
          {isProcessing && (
             <div className="h-full flex items-center justify-center flex-col gap-4">
                <div className="w-12 h-12 rounded-full border-2 border-fuchsia-500/20 border-t-fuchsia-500 animate-spin" />
                <p className="text-sm text-fuchsia-400 font-mono animate-pulse">Running semantic extraction...</p>
             </div>
          )}

          {result && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6">
               <div className="prose prose-invert prose-sm prose-p:leading-relaxed prose-a:text-fuchsia-400 prose-headings:font-light max-w-none">
                 <Markdown>{result}</Markdown>
               </div>
               
               {extractedNodes.length > 0 && (
                 <div className="mt-4 pt-6 border-t border-white/10">
                    <h3 className="text-sm uppercase tracking-widest text-zinc-500 mb-4 flex items-center gap-2">
                       <Database className="w-4 h-4" /> Extracted Graph Nodes
                    </h3>
                    <div className="flex flex-wrap gap-2">
                       {extractedNodes.map((node, i) => (
                         <div key={i} className="px-3 py-1.5 bg-black border border-white/10 rounded-lg flex items-center gap-2">
                            <span className={cn(
                              "text-[10px] font-bold uppercase",
                              node.type === 'THEME' ? 'text-emerald-400' :
                              node.type === 'THINKER' ? 'text-purple-400' : 'text-orange-400'
                            )}>{node.type}</span>
                            <span className="text-sm text-zinc-200">{node.id}</span>
                            <span className="text-[10px] text-zinc-600">{(node.confidence * 100).toFixed(0)}%</span>
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
