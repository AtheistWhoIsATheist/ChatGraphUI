import React, { useState } from 'react';
import { 
  FileText, Upload, Trash2, Search, Filter as FilterIcon, 
  ChevronDown, Loader2, CheckCircle2, AlertCircle, HardDrive, X, Sparkles, Zap
} from 'lucide-react';
import { cn } from '../lib/utils';
import { IngestionFile } from '../utils/runIngestion';

interface FileManagerProps {
  onExtract: (file: IngestionFile) => void;
  files: IngestionFile[];
  setFiles: React.Dispatch<React.SetStateAction<IngestionFile[]>>;
  onClose: () => void;
}

export function FileManager({ onExtract, files, setFiles, onClose }: FileManagerProps) {
  const [sortBy, setSortBy] = useState<keyof IngestionFile>("uploadDate");
  const [filter, setFilter] = useState("");

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const uploaded = Array.from(e.target.files).map(f => ({
      id: crypto.randomUUID(),
      name: f.name,
      size: f.size,
      type: f.type,
      status: "idle" as const,
      uploadDate: new Date().toISOString(),
      raw: f
    }));
    setFiles(prev => [...prev, ...uploaded]);
  };

  const handleBulkDelete = (ids: string[]) =>
    setFiles(prev => prev.filter(f => !ids.includes(f.id)));

  const sorted = [...files]
    .filter(f => f.name.toLowerCase().includes(filter.toLowerCase()))
    .sort((a, b) => {
      const valA = a[sortBy];
      const valB = b[sortBy];
      if (typeof valA === 'string' && typeof valB === 'string') {
        return valA.localeCompare(valB);
      }
      return (valA as number) - (valB as number);
    });

  return (
    <div className="flex flex-col h-full bg-[#000] border-r-2 border-[#333] font-mono">
      {/* Header */}
      <div className="p-6 border-b-2 border-[#333] bg-[#050505] relative z-10 shadow-[0px_4px_20px_rgba(0,0,0,0.5)]">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 border-2 border-[#00E5FF] bg-[#111]">
              <HardDrive className="w-5 h-5 text-[#00E5FF] animate-pulse-slow" />
            </div>
            <h2 className="text-xl font-black tracking-widest uppercase text-[#eee]">Abyssal Archives</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-[#888] hover:text-[#fff] hover:bg-[#FF3A00] border-2 border-transparent hover:border-[#FF3A00] transition-colors neo-flat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Upload Area */}
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[#555] bg-[#050505] cursor-pointer hover:border-[#00E5FF] hover:bg-[#00E5FF]/5 transition-colors group neo-flat">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-8 h-8 text-[#555] group-hover:text-[#00E5FF] mb-3 transition-colors" />
              <p className="text-xs font-bold text-[#888] group-hover:text-[#00E5FF] transition-colors uppercase tracking-widest">Drop files into the void</p>
              <p className="text-[10px] text-[#555] mt-2 font-bold tracking-widest">TXT, MD, JSON, PDF</p>
            </div>
            <input 
              type="file" 
              multiple 
              accept=".txt,.md,.markdown,.json,.pdf,text/plain,text/markdown,application/json,application/pdf" 
              className="hidden" 
              onChange={handleUpload} 
            />
          </label>

          {/* Search & Sort */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#888]" />
              <input 
                placeholder="SEARCH ARCHIVES..."
                value={filter}
                onChange={e => setFilter(e.target.value)}
                className="w-full bg-[#000] border-2 border-[#333] pl-10 pr-4 py-3 text-xs text-[#eee] placeholder:text-[#555] focus:outline-none focus:border-[#00E5FF] transition-colors neo-flat uppercase tracking-widest font-bold"
              />
            </div>
            <div className="relative">
              <select 
                onChange={e => setSortBy(e.target.value as keyof IngestionFile)}
                className="appearance-none bg-[#000] border-2 border-[#333] pl-4 pr-10 py-3 text-[10px] font-bold tracking-widest uppercase text-[#888] focus:outline-none focus:border-[#00E5FF] transition-colors cursor-pointer h-full neo-flat"
              >
                <option value="uploadDate">Date</option>
                <option value="name">Name</option>
                <option value="size">Size</option>
                <option value="status">Status</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555] pointer-events-none" />
            </div>
          </div>

          <div className="flex gap-4">
            <button 
              onClick={() => files.filter(f => f.status === 'idle').forEach(onExtract)}
              disabled={files.filter(f => f.status === 'idle').length === 0}
              className="flex-1 flex items-center justify-center gap-3 py-3 bg-[#00E5FF] border-2 border-[#00E5FF] text-[10px] font-black uppercase tracking-[0.2em] text-[#000] hover:bg-[#fff] hover:border-[#fff] disabled:opacity-50 disabled:cursor-not-allowed transition-colors neo-flat shadow-[4px_4px_0px_rgba(0,229,255,0.4)] disabled:shadow-none translate-x-[0px]"
            >
              <Sparkles className="w-4 h-4" />
              Extract All
            </button>
            <button 
              onClick={() => setFiles([])}
              disabled={files.length === 0}
              className="px-6 py-3 bg-[#000] border-2 border-[#333] text-[10px] uppercase font-bold tracking-widest text-[#888] hover:text-[#000] hover:bg-[#FF3A00] hover:border-[#FF3A00] disabled:opacity-50 disabled:cursor-not-allowed transition-colors neo-flat"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* File List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4 bg-black relative">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none"></div>
        {sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-[#333] relative z-10">
            <FileText className="w-16 h-16 mb-6 opacity-20" />
            <p className="text-sm font-bold uppercase tracking-[0.2em]">The archives are empty</p>
          </div>
        ) : (
          sorted.map(file => (
            <FileRow 
              key={file.id} 
              file={file} 
              onExtract={() => onExtract(file)}
              onDelete={() => handleBulkDelete([file.id])}
            />
          ))
        )}
      </div>
    </div>
  );
}

function FileRow({ file, onExtract, onDelete }: { file: IngestionFile, onExtract: () => void, onDelete: () => void }) {
  const getStatusIcon = () => {
    switch (file.status) {
      case 'ingesting':
      case 'parsing':
        return <Loader2 className="w-3.5 h-3.5 text-orange-500 animate-spin" />;
      case 'complete':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />;
      case 'error':
        return <AlertCircle className="w-3.5 h-3.5 text-red-500" />;
      default:
        return <FileText className="w-3.5 h-3.5 text-zinc-500" />;
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="group flex items-center gap-4 p-4 bg-[#050505] border-2 border-[#333] neo-flat hover:border-[#00E5FF] transition-colors relative z-10">
      <div className="w-10 h-10 bg-[#111] border border-[#222] flex items-center justify-center shrink-0">
        {getStatusIcon()}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-bold text-[#ccc] truncate font-mono tracking-tight" title={file.name}>{file.name}</p>
          <span className="text-[10px] font-bold text-[#666] whitespace-nowrap bg-[#111] px-2 border border-[#222]">{formatSize(file.size)}</span>
        </div>
        <div className="flex items-center gap-3 mt-2">
          <span className={cn(
            "text-[9px] uppercase tracking-widest font-black",
            file.status === 'complete' ? "text-[#00FF66]" : 
            file.status === 'error' ? "text-[#FF3A00]" : "text-[#00E5FF]"
          )}>
            {file.status}
          </span>
          <span className="text-[9px] text-[#444]">—</span>
          <span className="text-[10px] font-bold text-[#888] tracking-widest">
            {new Date(file.uploadDate).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        {file.status === 'idle' && (
          <button 
            onClick={onExtract}
            className="p-2 bg-[#00E5FF]/10 text-[#00E5FF] hover:bg-[#00E5FF] hover:text-[#000] transition-colors border border-[#00E5FF]/50 neo-flat"
            title="Extract Knowledge"
          >
            <Sparkles className="w-4 h-4" />
          </button>
        )}
        <button 
          onClick={onDelete}
          className="p-2 bg-[#FF3A00]/10 text-[#FF3A00] hover:bg-[#FF3A00] hover:text-[#000] transition-colors border border-[#FF3A00]/50 neo-flat"
          title="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
