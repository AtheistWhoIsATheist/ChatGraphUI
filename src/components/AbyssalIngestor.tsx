import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'motion/react';
import { UploadCloud, FileText, Database, Zap, Sparkles } from 'lucide-react';
import { Node } from '../data/corpus';

type IngestStage = 'idle' | 'ingestion' | 'parsing' | 'synthesis' | 'complete';

interface AbyssalIngestorProps {
  onComplete: (node: Node) => void;
}

export function AbyssalIngestor({ onComplete }: AbyssalIngestorProps) {
  const [stage, setStage] = useState<IngestStage>('idle');
  const [fileName, setFileName] = useState('');
  const [progress, setProgress] = useState(0);

  const processFile = async (file: File) => {
    setFileName(file.name);
    setStage('ingestion');
    
    // [STAGE 1]: INGESTION (Reading file)
    const text = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });

    // Simulate progress
    for (let i = 0; i <= 100; i += 10) {
      setProgress(i);
      await new Promise(r => setTimeout(r, 50));
    }

    setStage('parsing');
    setProgress(0);
    // [STAGE 2]: PARSING (Extracting text)
    for (let i = 0; i <= 100; i += 10) {
      setProgress(i);
      await new Promise(r => setTimeout(r, 100));
    }

    setStage('synthesis');
    setProgress(0);
    // [STAGE 3]: OMEGA_SYNTHESIS [Ω] (Calculating Gravity connections)
    for (let i = 0; i <= 100; i += 5) {
      setProgress(i);
      await new Promise(r => setTimeout(r, 100));
    }

    // Create node
    const newNode: Node = {
      id: `ingested_${Date.now()}`,
      label: file.name.replace(/\.[^/.]+$/, ""),
      type: 'fragment',
      status: 'RAW',
      blocks: [{
        id: `blk_${Date.now()}`,
        type: 'text',
        content: text.substring(0, 1000) + (text.length > 1000 ? '...' : '') // Truncate for safety
      }],
      metadata: {
        tags: ['ingested', 'raw'],
        geometry: 'diamond'
      }
    };

    setStage('complete');
    setTimeout(() => {
      onComplete(newNode);
      setStage('idle');
      setProgress(0);
    }, 1000);
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      processFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'text/markdown': ['.md'],
      'application/pdf': ['.pdf']
    },
    maxFiles: 1
  });

  return (
    <div className="w-full h-full flex items-center justify-center p-8 bg-[#0a0a0a]">
      <div className="w-full max-w-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-serif tracking-widest text-white/90 uppercase mb-2">The Abyssal Ingestor</h1>
          <p className="text-zinc-500 tracking-[0.2em] uppercase text-xs">Phase 1: The Source</p>
        </div>

        <AnimatePresence mode="wait">
          {stage === 'idle' ? (
            <motion.div
              key="dropzone"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-3xl p-16 flex flex-col items-center justify-center cursor-pointer transition-all duration-500 ${
                  isDragActive ? 'border-orange-500 bg-orange-500/5' : 'border-white/10 bg-black/40 hover:border-white/20 hover:bg-white/5'
                }`}
              >
                <input {...getInputProps()} />
                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                  <UploadCloud className={`w-10 h-10 ${isDragActive ? 'text-orange-500' : 'text-zinc-500'}`} />
                </div>
                <p className="text-xl text-zinc-300 font-light mb-2 text-center">
                  {isDragActive ? "Release to the Void" : "Drag & Drop to Ingest"}
                </p>
                <p className="text-xs text-zinc-600 uppercase tracking-widest text-center">
                  Supported formats: .pdf, .md, .txt
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="pipeline"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-black/60 border border-white/10 rounded-3xl p-12 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
                <motion.div 
                  className="h-full bg-orange-500"
                  animate={{ width: `${progress}%` }}
                  transition={{ ease: "linear", duration: 0.1 }}
                />
              </div>

              <div className="flex flex-col items-center justify-center space-y-8">
                <div className="text-center">
                  <h3 className="text-2xl font-light text-white mb-2">{fileName}</h3>
                  <div className="flex items-center justify-center gap-2 text-orange-500">
                    {stage === 'ingestion' && <Database className="w-4 h-4 animate-pulse" />}
                    {stage === 'parsing' && <FileText className="w-4 h-4 animate-pulse" />}
                    {stage === 'synthesis' && <Zap className="w-4 h-4 animate-pulse" />}
                    {stage === 'complete' && <Sparkles className="w-4 h-4" />}
                    
                    <span className="text-xs uppercase tracking-[0.2em] font-bold">
                      {stage === 'ingestion' && '[STAGE 1]: INGESTION'}
                      {stage === 'parsing' && '[STAGE 2]: PARSING'}
                      {stage === 'synthesis' && '[STAGE 3]: OMEGA_SYNTHESIS [Ω]'}
                      {stage === 'complete' && 'ASSIMILATION COMPLETE'}
                    </span>
                  </div>
                </div>

                <div className="w-full max-w-md space-y-4">
                  <Step active={stage === 'ingestion' || stage === 'parsing' || stage === 'synthesis' || stage === 'complete'} done={stage !== 'ingestion'} label="Reading File Stream" />
                  <Step active={stage === 'parsing' || stage === 'synthesis' || stage === 'complete'} done={stage !== 'ingestion' && stage !== 'parsing'} label="Extracting Ontological Text" />
                  <Step active={stage === 'synthesis' || stage === 'complete'} done={stage === 'complete'} label="Calculating Gravity Connections" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Step({ active, done, label }: { active: boolean, done: boolean, label: string }) {
  return (
    <div className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-500 ${
      active ? 'bg-white/5 border-white/10' : 'bg-transparent border-transparent opacity-30'
    }`}>
      <div className={`w-6 h-6 rounded-full flex items-center justify-center border ${
        done ? 'bg-emerald-500/20 border-emerald-500 text-emerald-500' : 
        active ? 'border-orange-500 text-orange-500' : 'border-zinc-600 text-zinc-600'
      }`}>
        {done ? <Sparkles className="w-3 h-3" /> : <div className={`w-2 h-2 rounded-full ${active ? 'bg-orange-500 animate-ping' : 'bg-zinc-600'}`} />}
      </div>
      <span className={`text-sm ${active ? 'text-zinc-200' : 'text-zinc-600'}`}>{label}</span>
    </div>
  );
}
