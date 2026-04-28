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
    <div className="flex flex-col h-full bg-zinc-950 border-r-2 border-white/5 font-mono">
      {/* Header */}
      <div className="p-6 border-b-2 border-white/5 bg-zinc-900/40 relative z-10 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 border border-white/10 bg-white/5">
              <HardDrive className="w-5 h-5 text-zinc-300 animate-pulse-slow" />
            </div>
            <h2 className="text-xl font-semibold tracking-widest  text-zinc-100">Document Repository</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-200 text-black border-transparent hover:bg-zinc-300 border border-transparent hover:border-white/10 transition-colors rounded-xl transition duration-300 backdrop-blur-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Upload Area */}
          <label className="flex flex-col items-center justify-center w-full h-32 border border-dashed border-white/20 bg-zinc-900/40 cursor-pointer hover:border-white/10 hover:bg-white/10 transition-colors group rounded-xl transition duration-300 backdrop-blur-md">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-8 h-8 text-zinc-500 group-hover:text-zinc-300 mb-3 transition-colors" />
              <p className="text-xs font-bold text-zinc-400 group-hover:text-zinc-300 transition-colors  tracking-widest">Drop files to ingest</p>
              <p className="text-[10px] text-zinc-500 mt-2 font-bold tracking-widest">TXT, MD, JSON, PDF</p>
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
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input 
                placeholder="SEARCH ARCHIVES..."
                value={filter}
                onChange={e => setFilter(e.target.value)}
                className="w-full bg-zinc-950 border border-white/5 pl-10 pr-4 py-3 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-white/10 transition-colors rounded-xl transition duration-300 backdrop-blur-md  tracking-widest font-bold"
              />
            </div>
            <div className="relative">
              <select 
                onChange={e => setSortBy(e.target.value as keyof IngestionFile)}
                className="appearance-none bg-zinc-950 border border-white/5 pl-4 pr-10 py-3 text-[10px] font-bold tracking-widest  text-zinc-400 focus:outline-none focus:border-white/10 transition-colors cursor-pointer h-full rounded-xl transition duration-300 backdrop-blur-md"
              >
                <option value="uploadDate">Date</option>
                <option value="name">Name</option>
                <option value="size">Size</option>
                <option value="status">Status</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
            </div>
          </div>

          <div className="flex gap-4">
            <button 
              onClick={() => files.filter(f => f.status === 'idle').forEach(onExtract)}
              disabled={files.filter(f => f.status === 'idle').length === 0}
              className="flex-1 flex items-center justify-center gap-3 py-3 bg-zinc-800 text-white border-transparent hover:bg-zinc-700 border border-white/10 text-[10px] font-semibold  tracking-widest text-zinc-950 hover:bg-[#fff] hover:border-[#fff] disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-xl transition duration-300 backdrop-blur-md shadow-xl disabled:shadow-none translate-x-[0px]"
            >
              <Sparkles className="w-4 h-4" />
              Extract All
            </button>
            <button 
              onClick={() => setFiles([])}
              disabled={files.length === 0}
              className="px-6 py-3 bg-zinc-950 border border-white/5 text-[10px]  font-bold tracking-widest text-zinc-400 hover:text-zinc-950 hover:bg-zinc-200 text-black border-transparent hover:bg-zinc-300 hover:border-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-xl transition duration-300 backdrop-blur-md"
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
            <p className="text-sm font-bold  tracking-widest">The archives are empty</p>
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
        return <Loader2 className="w-3.5 h-3.5 text-zinc-200 animate-spin" />;
      case 'complete':
        return <CheckCircle2 className="w-3.5 h-3.5 text-zinc-300" />;
      case 'error':
        return <AlertCircle className="w-3.5 h-3.5 text-[#FF0000]" />;
      default:
        return <FileText className="w-3.5 h-3.5 text-zinc-400" />;
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
    <div className="group flex items-center gap-4 p-4 bg-zinc-900/40 border border-white/5 rounded-xl transition duration-300 backdrop-blur-md hover:border-white/10 transition-colors relative z-10">
      <div className="w-10 h-10 bg-white/5 border border-[#222] flex items-center justify-center shrink-0">
        {getStatusIcon()}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-bold text-zinc-300 truncate font-mono tracking-tight" title={file.name}>{file.name}</p>
          <span className="text-[10px] font-bold text-[#666] whitespace-nowrap bg-white/5 px-2 border border-[#222]">{formatSize(file.size)}</span>
        </div>
        <div className="flex items-center gap-3 mt-2">
          <span className={cn(
            "text-[9px]  tracking-widest font-semibold",
            file.status === 'complete' ? "text-zinc-300" : 
            file.status === 'error' ? "text-zinc-200" : "text-zinc-300"
          )}>
            {file.status}
          </span>
          <span className="text-[9px] text-[#444]">—</span>
          <span className="text-[10px] font-bold text-zinc-400 tracking-widest">
            {new Date(file.uploadDate).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        {file.status === 'idle' && (
          <button 
            onClick={onExtract}
            className="p-2 bg-white/10 text-zinc-300 hover:bg-zinc-800 text-white border-transparent hover:bg-zinc-700 hover:text-zinc-950 transition-colors border border-white/10 rounded-xl transition duration-300 backdrop-blur-md"
            title="Extract Knowledge"
          >
            <Sparkles className="w-4 h-4" />
          </button>
        )}
        <button 
          onClick={onDelete}
          className="p-2 bg-white/10 text-zinc-200 hover:bg-zinc-200 text-black border-transparent hover:bg-zinc-300 hover:text-zinc-950 transition-colors border border-white/10 rounded-xl transition duration-300 backdrop-blur-md"
          title="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
