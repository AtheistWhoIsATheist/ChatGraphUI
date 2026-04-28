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
    <div className="flex flex-col h-full bg-zinc-950 p-8 font-mono relative">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxyZWN0IHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9IiMwMDAiIC8+PGNpcmNsZSBjeD0iNCIgY3k9IjQiIHI9IjEiIGZpbGw9IiMzMzMiIC8+PC9zdmc+')] opacity-20 pointer-events-none z-0"></div>

      {/* Success Toast */}
      <AnimatePresence>
        {showSuccessToast && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-6 left-1/2 -translate-x-1/2 z-50 bg-[#00FF66]/10 border border-[#00FF66] text-zinc-300 px-6 py-3 shadow-xl flex items-center gap-3 rounded-xl transition duration-300 backdrop-blur-md"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-xs font-semibold  tracking-widest">Ingestion Complete</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between mb-12 relative z-10 border-b-2 border-white/5 pb-6">
        <div>
          <h2 className="text-3xl font-semibold text-white tracking-widest ">The Library</h2>
          <p className="text-xs font-bold text-zinc-200  tracking-widest mt-2 border-l-2 border-white/10 pl-3">Raw Information Repository</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-hover:text-zinc-300 transition-colors" />
            <div className="absolute -inset-1 bg-gradient-to-r from-[#00E5FF] to-transparent opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none"></div>
            <input 
              type="text" 
              placeholder="SEARCH REPOSITORY..." 
              className="bg-zinc-900/40 border border-white/5 hover:border-white/10 focus:border-white/10 py-3 pl-12 pr-4 text-xs font-bold tracking-widest  text-zinc-100 placeholder:text-zinc-500 focus:outline-none w-72 transition-colors rounded-xl transition duration-300 backdrop-blur-md relative z-10"
            />
          </div>
          
          {/* Export Button */}
          <div className="relative">
            <button 
              onClick={() => setIsExporting(!isExporting)}
              className="w-12 h-12 border border-transparent hover:border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-zinc-200 transition-colors rounded-xl transition duration-300 backdrop-blur-md"
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
                    className="absolute right-0 top-14 w-56 bg-zinc-900/40 border border-white/5 p-3 z-40 shadow-xl flex flex-col gap-2 rounded-xl transition duration-300 backdrop-blur-md"
                  >
                    <div className="px-3 py-2 text-[10px] text-zinc-400 font-bold  tracking-widest border-b-2 border-[#222] mb-2">
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
                        className="flex items-center gap-3 px-3 py-3 border border-transparent hover:border-white/10 hover:bg-white/10 text-zinc-300 hover:text-zinc-300 transition-colors text-xs font-bold tracking-widest  text-left rounded-xl transition duration-300 backdrop-blur-md group"
                      >
                        <item.icon className="w-4 h-4 text-zinc-400 group-hover:text-zinc-300" />
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
            className="w-12 h-12 border border-transparent hover:border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-300 transition-colors rounded-xl transition duration-300 backdrop-blur-md"
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
              "bg-zinc-900/40 p-6 cursor-pointer border transition-colors duration-300 group rounded-xl transition duration-300 backdrop-blur-md flex flex-col",
              selectedNodeId === item.id ? "border-white/10 shadow-xl" : "border-white/5 hover:border-white/10"
            )}
          >
            <div className="flex items-start justify-between mb-6">
              <div className="w-12 h-12 border border-white/10 bg-white/5 flex items-center justify-center text-zinc-400 group-hover:text-zinc-200 group-hover:border-white/10 transition-colors rounded-xl transition duration-300 backdrop-blur-md">
                {getIcon(item.metadata?.url)}
              </div>
              <span className="text-[10px] font-bold text-zinc-500  tracking-widest bg-white/5 px-2 py-1 border border-[#222]">{item.status}</span>
            </div>
            
            <h3 className="text-xl font-bold tracking-tight text-white mb-4 group-hover:text-zinc-200 transition-colors line-clamp-2">{item.label}</h3>
            <p className="text-sm text-zinc-400 line-clamp-3 leading-relaxed mb-6 font-serif italic">
              {blocksToString(item.blocks) || "No preview text available."}
            </p>
            
            <div className="flex flex-wrap gap-2 mt-auto">
              {item.metadata?.tags?.map((tag, i) => (
                <span key={i} className="text-[9px]  font-bold tracking-widest px-2 py-1 bg-white/5 border border-white/5 text-zinc-300">
                  {tag}
                </span>
              ))}
            </div>
            
            <div className="mt-8 pt-4 border-t-2 border-[#222] flex items-center justify-between">
              <span className="text-[10px] text-zinc-500 font-bold tracking-widest">{item.metadata?.date_added}</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-zinc-200 text-black border-transparent hover:bg-zinc-300 rounded-none animate-pulse"></div>
                <span className="text-[9px] text-zinc-200 font-semibold  tracking-widest">Ready</span>
              </div>
            </div>
          </motion.div>
        ))}
        
        {/* Placeholder for "Add New" */}
        <div 
          onClick={() => setIsAdding(true)}
          className="bg-zinc-900/40 p-6 flex flex-col items-center justify-center border border-dashed border-white/20 opacity-60 hover:opacity-100 hover:border-white/10 hover:bg-white/10 transition-all cursor-pointer group min-h-[300px] rounded-xl transition duration-300 backdrop-blur-md"
        >
          <div className="p-4 border border-white/20 bg-white/5 group-hover:border-white/10 group-hover:text-zinc-300 transition-colors mb-4 rounded-xl transition duration-300 backdrop-blur-md">
            <Plus className="w-8 h-8 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
          </div>
          <span className="text-[10px] font-semibold  tracking-widest text-zinc-400 group-hover:text-zinc-300">Ingest New Data</span>
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
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] max-w-[90vw] h-[85vh] bg-zinc-950 border border-white/10 p-8 z-50 shadow-xl flex flex-col font-mono text-zinc-100"
            >
              <div className="flex items-center justify-between mb-8 pb-4 border-b-2 border-white/5 shrink-0">
                <h3 className="text-2xl font-semibold tracking-widest  text-zinc-300">Ingest New Data</h3>
                <button 
                  onClick={() => setIsAdding(false)}
                  className="w-10 h-10 border border-transparent hover:border-white/10 hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-zinc-200 transition-colors rounded-xl transition duration-300 backdrop-blur-md"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-6 pr-4">
                <div>
                  <label className="text-[10px] font-bold  tracking-widest text-zinc-200 mb-2 block">Title / Label *</label>
                  <input 
                    type="text" 
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    className={cn(
                      "w-full bg-zinc-900/40 border border-white/5 px-5 py-4 text-sm font-bold tracking-wide text-zinc-100 placeholder:text-zinc-500 focus:outline-none transition-colors rounded-xl transition duration-300 backdrop-blur-md",
                      errors.label ? "border-[#FF0055]" : "focus:border-white/10 hover:border-[#666]"
                    )}
                    placeholder="e.g., The Architecture of Silence"
                  />
                  {errors.label && (
                    <div className="flex items-center gap-2 mt-2 text-[#FF0055] text-[10px] font-bold  tracking-widest">
                      <AlertCircle className="w-4 h-4" />
                      <span>{errors.label}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-[10px] font-bold  tracking-widest text-zinc-200 mb-2 block">Source Type</label>
                  <div className="flex flex-wrap gap-3">
                    {['article', 'video', 'tweet', 'paper'].map((type) => (
                      <button
                        key={type}
                        onClick={() => setSourceType(type as any)}
                        className={cn(
                          "px-4 py-3 text-[10px] font-semibold  tracking-widest transition-colors border rounded-xl transition duration-300 backdrop-blur-md",
                          sourceType === type 
                            ? "bg-zinc-800 text-white border-transparent hover:bg-zinc-700 text-zinc-950 border-white/10 shadow-xl translate-x-[-1px] translate-y-[-1px]" 
                            : "bg-white/5 border-white/5 text-zinc-400 hover:border-white/10 hover:text-white"
                        )}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex-1 flex flex-col min-h-[350px]">
                  <label className="text-[10px] font-bold  tracking-widest text-zinc-200 mb-2 block">Content Blocks *</label>
                  <div className="flex-1 bg-zinc-900/40 border border-white/5 p-1 flex rounded-xl transition duration-300 backdrop-blur-md">
                    <VoidEditor 
                      initialBlocks={newBlocks} 
                      nodes={nodes} 
                      onChange={setNewBlocks} 
                    />
                  </div>
                  {errors.content && (
                    <div className="flex items-center gap-2 mt-2 text-[#FF0055] text-[10px] font-bold  tracking-widest">
                      <AlertCircle className="w-4 h-4" />
                      <span>{errors.content}</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-bold  tracking-widest text-zinc-200 mb-2 block">Source URL (Optional)</label>
                    <input 
                      type="text" 
                      value={newUrl}
                      onChange={(e) => setNewUrl(e.target.value)}
                      className="w-full bg-zinc-900/40 border border-white/5 px-5 py-4 text-sm font-bold text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-white/10 hover:border-[#666] transition-colors rounded-xl transition duration-300 backdrop-blur-md"
                      placeholder="https://..."
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold  tracking-widest text-zinc-200 mb-2 block">Tags (CSV)</label>
                    <input 
                      type="text" 
                      value={newTags}
                      onChange={(e) => setNewTags(e.target.value)}
                      className="w-full bg-zinc-900/40 border border-white/5 px-5 py-4 text-sm font-bold text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-white/10 hover:border-[#666] transition-colors rounded-xl transition duration-300 backdrop-blur-md"
                      placeholder="JOURNAL, ENTRY, LOG"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 flex justify-end shrink-0 border-t-2 border-white/5 mt-6">
                <button 
                  onClick={handleAdd}
                  className="px-8 py-4 border border-white/10 bg-zinc-200 text-black border-transparent hover:bg-zinc-300 hover:bg-[#fff] hover:border-[#fff] text-zinc-950 font-semibold text-sm tracking-widest  transition-colors rounded-xl transition duration-300 backdrop-blur-md shadow-xl hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
                >
                  Ingest Document
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
