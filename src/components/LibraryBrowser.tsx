/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */


import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Node, VoidBlock } from '../data/corpus';
import { File, Video, Link as LinkIcon, Plus, Search, X, Download, AlertCircle, CheckCircle2, FileText, FileJson, FileType } from 'lucide-react';
import { cn } from '../lib/utils';
import { exportEngine, ExportFormat } from '../utils/exportEngine';
import { VoidEditor } from './VoidEditor';
import { blocksToString, migrateContentToBlocks } from '../utils/voidUtils';

interface LibraryBrowserProps {
  nodes: Node[];
  addNode: (node: Node) => void;
  onNodeSelect: (node: Node) => void;
  selectedNodeId?: string;
}

export function LibraryBrowser({ nodes, addNode, onNodeSelect, selectedNodeId }: LibraryBrowserProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  // Form State
  const [newLabel, setNewLabel] = useState('');
  const [newBlocks, setNewBlocks] = useState<VoidBlock[]>([
    { id: 'init_block', type: 'text', content: '', metadata: { lastEdited: Date.now() } }
  ]);
  const [newUrl, setNewUrl] = useState('');
  const [newTags, setNewTags] = useState('');
  const [sourceType, setSourceType] = useState<'article' | 'video' | 'tweet' | 'paper'>('article');
  
  // Validation & Feedback State
  const [errors, setErrors] = useState<{label?: string; content?: string}>({});
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const libraryItems = nodes.filter(n => n.type === 'library_item');

  const getIcon = (url?: string) => {
    if (!url) return <File className="w-4 h-4" />;
    if (url.includes('youtube') || url.includes('video')) return <Video className="w-4 h-4" />;
    return <LinkIcon className="w-4 h-4" />;
  };

  const validateForm = () => {
    const newErrors: {label?: string; content?: string} = {};
    if (!newLabel.trim()) newErrors.label = "Title is required to anchor the node.";
    if (newBlocks.every(b => !b.content.trim())) newErrors.content = "Content cannot be void (yet).";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAdd = () => {
    if (!validateForm()) return;

    const newNode: Node = {
      id: `lib_${Date.now()}`,
      label: newLabel,
      type: 'library_item',
      status: 'RAW',
      blocks: newBlocks,
      metadata: {
        url: newUrl,
        tags: newTags.split(',').map(t => t.trim()).filter(Boolean),
        date_added: new Date().toISOString().split('T')[0],
        geometry: 'square',
        chromatic_tag: sourceType // Storing source type in metadata for now
      }
    };

    addNode(newNode);
    
    // Reset & Feedback
    setIsAdding(false);
    setNewLabel('');
    setNewBlocks([{ id: `blk_${Date.now()}`, type: 'text', content: '', metadata: { lastEdited: Date.now() } }]);
    setNewUrl('');
    setNewTags('');
    setErrors({});
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  const handleExport = (format: ExportFormat) => {
    exportEngine.export(libraryItems, format);
    setIsExporting(false);
  };

  return (
    <div className="flex flex-col h-full bg-[#000] p-8 font-mono relative">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxyZWN0IHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9IiMwMDAiIC8+PGNpcmNsZSBjeD0iNCIgY3k9IjQiIHI9IjEiIGZpbGw9IiMzMzMiIC8+PC9zdmc+')] opacity-20 pointer-events-none z-0"></div>

      {/* Success Toast */}
      <AnimatePresence>
        {showSuccessToast && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-6 left-1/2 -translate-x-1/2 z-50 bg-[#00FF66]/10 border-2 border-[#00FF66] text-[#00FF66] px-6 py-3 shadow-[4px_4px_0_rgba(0,255,102,0.3)] flex items-center gap-3 neo-flat"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-xs font-black uppercase tracking-widest">Ingestion Complete</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between mb-12 relative z-10 border-b-2 border-[#333] pb-6">
        <div>
          <h2 className="text-3xl font-black text-[#fff] tracking-widest uppercase">The Library</h2>
          <p className="text-xs font-bold text-[#FF3A00] uppercase tracking-[0.2em] mt-2 border-l-2 border-[#FF3A00] pl-3">The Void of Raw Information</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#888] group-hover:text-[#00E5FF] transition-colors" />
            <div className="absolute -inset-1 bg-gradient-to-r from-[#00E5FF] to-transparent opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none"></div>
            <input 
              type="text" 
              placeholder="SEARCH THE VOID..." 
              className="bg-[#050505] border-2 border-[#333] hover:border-[#00E5FF] focus:border-[#00E5FF] py-3 pl-12 pr-4 text-xs font-bold tracking-widest uppercase text-[#eee] placeholder:text-[#555] focus:outline-none w-72 transition-colors neo-flat relative z-10"
            />
          </div>
          
          {/* Export Button */}
          <div className="relative">
            <button 
              onClick={() => setIsExporting(!isExporting)}
              className="w-12 h-12 border-2 border-transparent hover:border-[#FF3A00] bg-[#111] hover:bg-[#FF3A00]/10 flex items-center justify-center text-[#888] hover:text-[#FF3A00] transition-colors neo-flat"
              title="Export Corpus"
            >
              <Download className="w-5 h-5" />
            </button>
            <AnimatePresence>
              {isExporting && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setIsExporting(false)} />
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="absolute right-0 top-14 w-56 bg-[#050505] border-2 border-[#333] p-3 z-40 shadow-[8px_8px_0_rgba(0,0,0,1)] flex flex-col gap-2 neo-flat"
                  >
                    <div className="px-3 py-2 text-[10px] text-[#888] font-bold uppercase tracking-[0.2em] border-b-2 border-[#222] mb-2">
                      Select Format
                    </div>
                    {[
                      { label: 'JSON Data', format: 'json', icon: FileJson },
                      { label: 'CSV Table', format: 'csv', icon: FileType },
                      { label: 'Markdown', format: 'md', icon: FileText },
                      { label: 'Plain Text', format: 'txt', icon: FileText },
                      { label: 'PDF Report', format: 'pdf', icon: File },
                      { label: 'Word Doc', format: 'docx', icon: File }
                    ].map((item) => (
                      <button
                        key={item.format}
                        onClick={() => handleExport(item.format as ExportFormat)}
                        className="flex items-center gap-3 px-3 py-3 border border-transparent hover:border-[#00E5FF] hover:bg-[#00E5FF]/10 text-[#ccc] hover:text-[#00E5FF] transition-colors text-xs font-bold tracking-widest uppercase text-left neo-flat group"
                      >
                        <item.icon className="w-4 h-4 text-[#888] group-hover:text-[#00E5FF]" />
                        {item.label}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          <button 
            onClick={() => setIsAdding(true)}
            className="w-12 h-12 border-2 border-transparent hover:border-[#00E5FF] bg-[#111] hover:bg-[#00E5FF]/10 flex items-center justify-center text-[#00E5FF] transition-colors neo-flat"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 overflow-y-auto custom-scrollbar pr-4 pb-20 relative z-10">
        {libraryItems.map((item) => (
          <motion.div
            key={item.id}
            whileHover={{ y: -4 }}
            onClick={() => onNodeSelect(item)}
            className={cn(
              "bg-[#050505] p-6 cursor-pointer border-2 transition-colors duration-300 group neo-flat flex flex-col",
              selectedNodeId === item.id ? "border-[#00E5FF] shadow-[4px_4px_0_rgba(0,229,255,0.3)]" : "border-[#333] hover:border-[#FF3A00]"
            )}
          >
            <div className="flex items-start justify-between mb-6">
              <div className="w-12 h-12 border-2 border-[#444] bg-[#111] flex items-center justify-center text-[#888] group-hover:text-[#FF3A00] group-hover:border-[#FF3A00] transition-colors neo-flat">
                {getIcon(item.metadata?.url)}
              </div>
              <span className="text-[10px] font-bold text-[#555] uppercase tracking-[0.2em] bg-[#111] px-2 py-1 border border-[#222]">{item.status}</span>
            </div>
            
            <h3 className="text-xl font-bold tracking-tight text-[#fff] mb-4 group-hover:text-[#FF3A00] transition-colors line-clamp-2">{item.label}</h3>
            <p className="text-sm text-[#888] line-clamp-3 leading-relaxed mb-6 font-serif italic">
              {blocksToString(item.blocks) || "No preview text available."}
            </p>
            
            <div className="flex flex-wrap gap-2 mt-auto">
              {item.metadata?.tags?.map((tag, i) => (
                <span key={i} className="text-[9px] uppercase font-bold tracking-widest px-2 py-1 bg-[#111] border border-[#333] text-[#ccc]">
                  {tag}
                </span>
              ))}
            </div>
            
            <div className="mt-8 pt-4 border-t-2 border-[#222] flex items-center justify-between">
              <span className="text-[10px] text-[#555] font-bold tracking-widest">{item.metadata?.date_added}</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#FF3A00] rounded-none animate-pulse"></div>
                <span className="text-[9px] text-[#FF3A00] font-black uppercase tracking-[0.2em]">Ready</span>
              </div>
            </div>
          </motion.div>
        ))}
        
        {/* Placeholder for "Add New" */}
        <div 
          onClick={() => setIsAdding(true)}
          className="bg-[#050505] p-6 flex flex-col items-center justify-center border-2 border-dashed border-[#555] opacity-60 hover:opacity-100 hover:border-[#00E5FF] hover:bg-[#00E5FF]/5 transition-all cursor-pointer group min-h-[300px] neo-flat"
        >
          <div className="p-4 border-2 border-[#555] bg-[#111] group-hover:border-[#00E5FF] group-hover:text-[#00E5FF] transition-colors mb-4 neo-flat">
            <Plus className="w-8 h-8 text-[#555] group-hover:text-[#00E5FF] transition-colors" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#888] group-hover:text-[#00E5FF]">Ingest New Data</span>
        </div>
      </div>

      {/* Add New Modal */}
      <AnimatePresence>
        {isAdding && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAdding(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md z-40"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] max-w-[90vw] h-[85vh] bg-[#000] border-2 border-[#00E5FF] p-8 z-50 shadow-[10px_10px_0_rgba(0,229,255,0.2)] flex flex-col font-mono text-[#eee]"
            >
              <div className="flex items-center justify-between mb-8 pb-4 border-b-2 border-[#333] shrink-0">
                <h3 className="text-2xl font-black tracking-widest uppercase text-[#00E5FF]">Ingest New Data</h3>
                <button 
                  onClick={() => setIsAdding(false)}
                  className="w-10 h-10 border-2 border-transparent hover:border-[#FF3A00] hover:bg-[#FF3A00]/10 flex items-center justify-center text-[#888] hover:text-[#FF3A00] transition-colors neo-flat"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-6 pr-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#FF3A00] mb-2 block">Title / Label *</label>
                  <input 
                    type="text" 
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    className={cn(
                      "w-full bg-[#050505] border-2 border-[#333] px-5 py-4 text-sm font-bold tracking-wide text-[#eee] placeholder:text-[#555] focus:outline-none transition-colors neo-flat",
                      errors.label ? "border-[#FF0055]" : "focus:border-[#00E5FF] hover:border-[#666]"
                    )}
                    placeholder="e.g., The Architecture of Silence"
                  />
                  {errors.label && (
                    <div className="flex items-center gap-2 mt-2 text-[#FF0055] text-[10px] font-bold uppercase tracking-widest">
                      <AlertCircle className="w-4 h-4" />
                      <span>{errors.label}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#FF3A00] mb-2 block">Source Type</label>
                  <div className="flex flex-wrap gap-3">
                    {['article', 'video', 'tweet', 'paper'].map((type) => (
                      <button
                        key={type}
                        onClick={() => setSourceType(type as any)}
                        className={cn(
                          "px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-colors border-2 neo-flat",
                          sourceType === type 
                            ? "bg-[#00E5FF] text-[#000] border-[#00E5FF] shadow-[2px_2px_0_rgba(0,229,255,0.4)] translate-x-[-1px] translate-y-[-1px]" 
                            : "bg-[#111] border-[#333] text-[#888] hover:border-[#00E5FF] hover:text-[#fff]"
                        )}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex-1 flex flex-col min-h-[350px]">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#FF3A00] mb-2 block">Content Blocks *</label>
                  <div className="flex-1 bg-[#050505] border-2 border-[#333] p-1 flex neo-flat">
                    <VoidEditor 
                      initialBlocks={newBlocks} 
                      nodes={nodes} 
                      onChange={setNewBlocks} 
                    />
                  </div>
                  {errors.content && (
                    <div className="flex items-center gap-2 mt-2 text-[#FF0055] text-[10px] font-bold uppercase tracking-widest">
                      <AlertCircle className="w-4 h-4" />
                      <span>{errors.content}</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#FF3A00] mb-2 block">Source URL (Optional)</label>
                    <input 
                      type="text" 
                      value={newUrl}
                      onChange={(e) => setNewUrl(e.target.value)}
                      className="w-full bg-[#050505] border-2 border-[#333] px-5 py-4 text-sm font-bold text-[#eee] placeholder:text-[#555] focus:outline-none focus:border-[#00E5FF] hover:border-[#666] transition-colors neo-flat"
                      placeholder="https://..."
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#FF3A00] mb-2 block">Tags (CSV)</label>
                    <input 
                      type="text" 
                      value={newTags}
                      onChange={(e) => setNewTags(e.target.value)}
                      className="w-full bg-[#050505] border-2 border-[#333] px-5 py-4 text-sm font-bold text-[#eee] placeholder:text-[#555] focus:outline-none focus:border-[#00E5FF] hover:border-[#666] transition-colors neo-flat"
                      placeholder="VOID, ARCHITECTURE, SILENCE"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 flex justify-end shrink-0 border-t-2 border-[#333] mt-6">
                <button 
                  onClick={handleAdd}
                  className="px-8 py-4 border-2 border-[#FF3A00] bg-[#FF3A00] hover:bg-[#fff] hover:border-[#fff] text-[#000] font-black text-sm tracking-widest uppercase transition-colors neo-flat shadow-[6px_6px_0_rgba(255,58,0,0.3)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
                >
                  Ingest into Void
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
