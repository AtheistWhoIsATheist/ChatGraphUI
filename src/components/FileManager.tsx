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
    <div className="flex flex-col h-full bg-[#0a0a0a] border-r border-white/5 font-sans">
      {/* Header */}
      <div className="p-6 border-b border-white/5 bg-black/40">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <HardDrive className="w-5 h-5 text-orange-500" />
            <h2 className="text-lg font-light tracking-widest uppercase text-white">Abyssal Archives</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-zinc-500 hover:text-white hover:bg-white/5 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Upload Area */}
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/10 rounded-2xl cursor-pointer hover:border-orange-500/50 hover:bg-white/5 transition-all group">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-8 h-8 text-zinc-500 group-hover:text-orange-500 mb-2 transition-colors" />
              <p className="text-xs text-zinc-500 group-hover:text-zinc-300 transition-colors uppercase tracking-widest">Drop files into the void</p>
              <p className="text-[10px] text-zinc-600 mt-1">TXT, MD, JSON, PDF</p>
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
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
              <input 
                placeholder="Search archives..."
                value={filter}
                onChange={e => setFilter(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-orange-500/50 transition-colors"
              />
            </div>
            <div className="relative">
              <select 
                onChange={e => setSortBy(e.target.value as keyof IngestionFile)}
                className="appearance-none bg-black/40 border border-white/10 rounded-xl pl-3 pr-8 py-2 text-xs text-zinc-400 focus:outline-none focus:border-orange-500/50 transition-colors cursor-pointer h-full"
              >
                <option value="uploadDate">Date</option>
                <option value="name">Name</option>
                <option value="size">Size</option>
                <option value="status">Status</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-600 pointer-events-none" />
            </div>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={() => files.filter(f => f.status === 'idle').forEach(onExtract)}
              disabled={files.filter(f => f.status === 'idle').length === 0}
              className="flex-1 flex items-center justify-center gap-2 py-2 bg-orange-500/10 border border-orange-500/20 rounded-xl text-[10px] uppercase tracking-widest text-orange-500 hover:bg-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Sparkles className="w-3 h-3" />
              Extract All
            </button>
            <button 
              onClick={() => setFiles([])}
              disabled={files.length === 0}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] uppercase tracking-widest text-zinc-500 hover:text-red-500 hover:border-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* File List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2">
        {sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-600">
            <FileText className="w-12 h-12 mb-4 opacity-10" />
            <p className="text-xs uppercase tracking-widest">The archives are empty</p>
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
    <div className="group flex items-center gap-3 p-3 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-white/[0.05] hover:border-white/10 transition-all">
      <div className="w-8 h-8 rounded-lg bg-black/40 flex items-center justify-center shrink-0">
        {getStatusIcon()}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-medium text-zinc-300 truncate" title={file.name}>{file.name}</p>
          <span className="text-[10px] text-zinc-600 whitespace-nowrap">{formatSize(file.size)}</span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className={cn(
            "text-[9px] uppercase tracking-widest font-bold",
            file.status === 'complete' ? "text-emerald-500/70" : 
            file.status === 'error' ? "text-red-500/70" : "text-zinc-600"
          )}>
            {file.status}
          </span>
          <span className="text-[9px] text-zinc-700">•</span>
          <span className="text-[9px] text-zinc-700 uppercase tracking-tighter">
            {new Date(file.uploadDate).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {file.status === 'idle' && (
          <button 
            onClick={onExtract}
            className="p-1.5 text-zinc-500 hover:text-orange-500 hover:bg-orange-500/10 rounded-lg transition-all"
            title="Extract Knowledge"
          >
            <Sparkles className="w-3.5 h-3.5" />
          </button>
        )}
        <button 
          onClick={onDelete}
          className="p-1.5 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
          title="Delete"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
