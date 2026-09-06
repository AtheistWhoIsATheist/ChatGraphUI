import React, { useState, useEffect } from 'react';
import { Search, Upload, Trash2, Activity, GitMerge, FileText, Database } from 'lucide-react';
import { FileManagerFile, FileStatus } from '../../types/ang';

interface FileManagerProps {
  onClose?: () => void;
}

export const FileManager: React.FC<FileManagerProps> = ({ onClose }) => {
  const [files, setFiles] = useState<FileManagerFile[]>([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'size' | 'uploadDate' | 'status'>('uploadDate');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Local Storage Persistence
  useEffect(() => {
    const saved = localStorage.getItem('nihil_file_manager_state');
    if (saved) {
      try {
        setFiles(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved files", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('nihil_file_manager_state', JSON.stringify(files));
  }, [files]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newFiles: FileManagerFile[] = Array.from(e.target.files).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      uploadDate: new Date().toISOString(),
      status: 'UPLOADED',
      type: file.type || file.name.split('.').pop() || 'unknown',
      content: "Simulated content extract for " + file.name
    }));
    setFiles(prev => [...prev, ...newFiles]);
  };

  const handleBulkDelete = () => {
    setFiles(prev => prev.filter(f => !selectedIds.has(f.id)));
    setSelectedIds(new Set());
  };

  const handleStatusChange = (id: string, newStatus: FileStatus) => {
    setFiles(prev => prev.map(f => f.id === id ? { ...f, status: newStatus } : f));
  };

  const onBulkAnalyze = () => {
    const targetFiles = files.filter(f => f.status === 'knowledge_base' && selectedIds.has(f.id));
    alert(`Triggering onBulkAnalyze for ${targetFiles.length} files...`);
    // Simulated processing
    setTimeout(() => {
      setFiles(prev => prev.map(f => 
        (f.status === 'knowledge_base' && selectedIds.has(f.id)) ? { ...f, status: 'SHADOW_EXTRACTED' } : f
      ));
    }, 1000);
  };

  const onBulkGraft = () => {
    const targetFiles = files.filter(f => f.status === 'SHADOW_EXTRACTED' && selectedIds.has(f.id));
    alert(`Triggering onBulkGraft for ${targetFiles.length} files into the graph...`);
    // Simulated processing
    setTimeout(() => {
      setFiles(prev => prev.map(f => 
        (f.status === 'SHADOW_EXTRACTED' && selectedIds.has(f.id)) ? { ...f, status: 'knowledge_base' } : f
      ));
    }, 1000);
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const filteredAndSortedFiles = files
    .filter(f => f.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'size') return b.size - a.size;
      if (sortBy === 'status') return a.status.localeCompare(b.status);
      return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
    });

  return (
    <div className="flex flex-col h-full bg-void-surface/95 border-l border-white/10 p-4 text-white/80 font-mono text-xs w-96 backdrop-blur-md z-50 absolute right-0 top-0 bottom-0 shadow-2xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-cyan-cosmic font-display tracking-widest uppercase text-sm flex items-center gap-2">
          <Database size={16} /> DataHub Ingestion
        </h2>
        {onClose && <button onClick={onClose} className="text-white/50 hover:text-white">&times;</button>}
      </div>

      <div className="flex gap-2 mb-4">
        <label className="flex-1 neumorphic-button text-center py-2 cursor-pointer bg-white/5 hover:bg-white/10 transition-colors border border-white/10 rounded flex justify-center items-center gap-2">
          <Upload size={14} /> Import (PDF, MD, TXT)
          <input type="file" multiple className="hidden" accept=".pdf,.md,.txt,.json" onChange={handleFileUpload} />
        </label>
      </div>

      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search size={12} className="absolute left-2 top-2 text-white/40" />
          <input 
            type="text" 
            placeholder="Semantic Search..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded pl-7 pr-2 py-1.5 focus:border-violet-ethereal/50 outline-none text-white/90"
          />
        </div>
        <select 
          value={sortBy}
          onChange={(e: any) => setSortBy(e.target.value)}
          className="bg-black/40 border border-white/10 rounded px-2 text-white/70 outline-none"
        >
          <option value="uploadDate">Date</option>
          <option value="name">Name</option>
          <option value="size">Size</option>
          <option value="status">Status</option>
        </select>
      </div>

      <div className="flex gap-2 mb-4 border-b border-white/10 pb-4">
        <button 
          onClick={handleBulkDelete}
          disabled={selectedIds.size === 0}
          className="flex-1 py-1 bg-red-900/30 text-red-400 border border-red-900/50 rounded hover:bg-red-900/50 disabled:opacity-30 flex items-center justify-center gap-1 transition-colors"
        >
          <Trash2 size={12} /> Delete
        </button>
        <button 
          onClick={onBulkAnalyze}
          disabled={selectedIds.size === 0}
          className="flex-1 py-1 bg-violet-ethereal/20 text-violet-ethereal border border-violet-ethereal/30 rounded hover:bg-violet-ethereal/40 disabled:opacity-30 flex items-center justify-center gap-1 transition-colors"
        >
          <Activity size={12} /> Bulk Analyze
        </button>
        <button 
          onClick={onBulkGraft}
          disabled={selectedIds.size === 0}
          className="flex-1 py-1 bg-cyan-cosmic/20 text-cyan-cosmic border border-cyan-cosmic/30 rounded hover:bg-cyan-cosmic/40 disabled:opacity-30 flex items-center justify-center gap-1 transition-colors"
        >
          <GitMerge size={12} /> Bulk Graft
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-2">
        {filteredAndSortedFiles.length === 0 ? (
          <div className="text-center text-white/30 py-8">No files found.</div>
        ) : (
          filteredAndSortedFiles.map(file => (
            <div key={file.id} className="p-2 border border-white/5 bg-white/5 rounded flex flex-col gap-2 relative group hover:border-white/20 transition-colors">
              <div className="flex items-start gap-2">
                <input 
                  type="checkbox" 
                  checked={selectedIds.has(file.id)}
                  onChange={() => toggleSelect(file.id)}
                  className="mt-1 accent-violet-ethereal"
                />
                <div className="flex-1 min-w-0">
                  <div className="truncate text-white/90 font-bold" title={file.name}>{file.name}</div>
                  <div className="flex justify-between text-[10px] text-white/40 mt-1">
                    <span>{(file.size / 1024).toFixed(1)} KB</span>
                    <span>{new Date(file.uploadDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center mt-1 pt-1 border-t border-white/5">
                <select 
                  value={file.status}
                  onChange={(e: any) => handleStatusChange(file.id, e.target.value)}
                  className="bg-transparent text-[10px] border border-white/10 rounded px-1 text-white/60 outline-none"
                >
                  <option value="UPLOADED">UPLOADED</option>
                  <option value="knowledge_base">knowledge_base</option>
                  <option value="SHADOW_EXTRACTED">SHADOW_EXTRACTED</option>
                  <option value="ERROR">ERROR</option>
                </select>
                <FileText size={12} className="text-white/20" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
