import React, { useState } from 'react';
import { FileText, Search, Tag, X, Database, Plus, ChevronRight, Hash, Layers } from 'lucide-react';

export interface InfraNodusStatement {
  uid: string | number;
  text: string;
  tags: string[];
  timestamp?: number;
  context?: number;
}

interface StatementsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  statements: InfraNodusStatement[];
  onSelectStatement?: (stmt: InfraNodusStatement) => void;
  onImportStatementsJson?: (jsonString: string) => void;
  onLoadNihilismDataset?: () => void;
  onLoadWikiLinksDataset?: () => void;
  activeStatementUid?: string | number | null;
}

export const StatementsDrawer: React.FC<StatementsDrawerProps> = ({
  isOpen,
  onClose,
  statements,
  onSelectStatement,
  onImportStatementsJson,
  onLoadNihilismDataset,
  onLoadWikiLinksDataset,
  activeStatementUid
}) => {
  const [filterText, setFilterText] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [pasteJsonInput, setPasteJsonInput] = useState('');
  const [newStmtInput, setNewStmtInput] = useState('');
  const [newTagInput] = useState('universal-nihilism');

  if (!isOpen) return null;

  // Extract all unique tags
  const allTags = Array.from(
    new Set(statements.flatMap(s => s.tags || []))
  );

  // Filter statements
  const filtered = statements.filter(s => {
    if (selectedTag && !s.tags?.includes(selectedTag)) return false;
    if (filterText.trim()) {
      const q = filterText.toLowerCase();
      return s.text.toLowerCase().includes(q) || String(s.uid).includes(q);
    }
    return true;
  });

  const handleImportSubmit = () => {
    if (onImportStatementsJson && pasteJsonInput.trim()) {
      const input = pasteJsonInput.trim();
      if (!input.startsWith('{') && !input.startsWith('[')) {
        // Raw text line statements
        const lines = input.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        const stmtsObj = {
          statements: lines.map((line, idx) => ({
            uid: Date.now() + idx,
            text: line,
            tags: JSON.stringify(['imported-wiki-link']),
            timestamp: Date.now() * 1000,
            context: 1
          }))
        };
        onImportStatementsJson(JSON.stringify(stmtsObj));
      } else {
        onImportStatementsJson(input);
      }
      setPasteJsonInput('');
      setIsImporting(false);
    }
  };

  const handleAddSingleStatement = () => {
    if (!newStmtInput.trim()) return;
    const newJson = JSON.stringify({
      statements: [
        [
          {
            uid: Date.now(),
            text: newStmtInput,
            tags: JSON.stringify([newTagInput || 'user-statement']),
            timestamp: Date.now() * 1000,
            context: 1
          }
        ]
      ]
    });
    if (onImportStatementsJson) {
      onImportStatementsJson(newJson);
      setNewStmtInput('');
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-[420px] max-w-full bg-slate-950/95 border-l border-slate-800 shadow-2xl backdrop-blur-2xl z-50 flex flex-col text-xs text-slate-200 select-none animate-in slide-in-from-right duration-200 font-sans">
      
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-cyan-500/20 border border-cyan-500/30 text-cyan-400">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-bold text-sm text-slate-100 flex items-center gap-2">
              InfraNodus Statements
              <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold">
                {statements.length}
              </span>
            </h2>
            <p className="text-[10px] font-mono text-slate-400">
              Text entries, UIDs & co-occurrence tags
            </p>
          </div>
        </div>
        
        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Top Action Bar: Load Datasets & Import */}
      <div className="p-3 border-b border-slate-800/80 bg-slate-900/30 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          {onLoadNihilismDataset && (
            <button
              onClick={onLoadNihilismDataset}
              className="flex-1 py-1.5 px-2 bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 rounded-xl font-mono text-[10px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer shadow-sm"
              title="Load Universal Nihilism 1&2 Statements"
            >
              <Database className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="truncate">Load Nihilism 1&2</span>
            </button>
          )}

          {onLoadWikiLinksDataset && (
            <button
              onClick={onLoadWikiLinksDataset}
              className="flex-1 py-1.5 px-2 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 rounded-xl font-mono text-[10px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer shadow-sm"
              title="Load Nihiltheism Graph Wiki-Links"
            >
              <Database className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">Nihiltheism Wiki-Links</span>
            </button>
          )}
        </div>

        <button
          onClick={() => setIsImporting(!isImporting)}
          className="w-full py-1.5 px-3 bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/40 text-purple-300 rounded-xl font-mono text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Import Statements / Wiki-Links</span>
        </button>
      </div>

      {/* Inline Import Modal / Form */}
      {isImporting && (
        <div className="p-4 border-b border-slate-800 bg-slate-900/80 space-y-2 animate-fade-in">
          <label className="block text-[11px] font-mono text-cyan-300 font-bold">
            Paste InfraNodus Export JSON (statements array format):
          </label>
          <textarea
            value={pasteJsonInput}
            onChange={(e) => setPasteJsonInput(e.target.value)}
            placeholder='{"statements": [ [ {"uid": 123, "text": "Universal Nihilism...", "tags": "[\"pdf: universal nihilism 1&2\"]"} ] ]}'
            rows={4}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 font-mono text-[10px] text-slate-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setIsImporting(false)}
              className="px-3 py-1 bg-slate-800 text-slate-300 rounded-lg text-[11px] cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleImportSubmit}
              className="px-3 py-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-[11px] cursor-pointer"
            >
              Parse Statements
            </button>
          </div>
        </div>
      )}

      {/* Add Single Statement Bar */}
      <div className="p-3 border-b border-slate-800/80 bg-slate-900/20 flex items-center gap-2">
        <input
          type="text"
          placeholder="Add new statement text..."
          value={newStmtInput}
          onChange={(e) => setNewStmtInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddSingleStatement()}
          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 font-mono text-[11px] text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60"
        />
        <button
          onClick={handleAddSingleStatement}
          className="p-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl cursor-pointer"
          title="Add statement to graph"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Search & Tag Filter Bar */}
      <div className="p-3 border-b border-slate-800 space-y-2">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Filter statements by keywords or UID..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 font-mono text-[11px] text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60"
          />
        </div>

        {allTags.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider shrink-0">Tags:</span>
            <button
              onClick={() => setSelectedTag(null)}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
                selectedTag === null ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              All ({statements.length})
            </button>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-mono shrink-0 transition-all cursor-pointer flex items-center gap-1 ${
                  selectedTag === tag ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
                }`}
              >
                <Tag className="w-2.5 h-2.5 text-cyan-400" />
                <span>{tag}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Statements Feed */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-500 font-mono text-[11px] space-y-2">
            <FileText className="w-8 h-8 text-slate-700 mx-auto" />
            <p>No statements match current filter.</p>
            {onLoadNihilismDataset && (
              <button
                onClick={onLoadNihilismDataset}
                className="mt-2 px-3 py-1.5 bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 rounded-xl font-bold cursor-pointer"
              >
                Load Universal Nihilism 1&2 Dataset
              </button>
            )}
          </div>
        ) : (
          filtered.map((stmt, idx) => {
            const isActive = String(activeStatementUid) === String(stmt.uid);
            return (
              <div
                key={stmt.uid || idx}
                onClick={() => onSelectStatement && onSelectStatement(stmt)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer relative group ${
                  isActive
                    ? 'bg-cyan-950/40 border-cyan-500/60 shadow-[0_0_15px_rgba(6,182,212,0.15)] text-slate-100'
                    : 'bg-slate-900/50 hover:bg-slate-900 border-slate-800/80 hover:border-slate-700 text-slate-300'
                }`}
              >
                {/* Statement Header */}
                <div className="flex items-center justify-between gap-2 mb-1.5 font-mono text-[10px]">
                  <span className="text-cyan-400 font-bold flex items-center gap-1">
                    <Hash className="w-3 h-3 text-cyan-500" />
                    UID: {stmt.uid}
                  </span>
                  {stmt.tags && stmt.tags.length > 0 && (
                    <div className="flex items-center gap-1">
                      {stmt.tags.slice(0, 2).map((t, i) => (
                        <span key={i} className="bg-slate-800 border border-slate-700 text-slate-400 px-1.5 py-0.2 rounded text-[9px]">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Statement Text */}
                <p className="text-xs leading-relaxed font-sans text-slate-200 font-normal">
                  {stmt.text}
                </p>

                {/* Focus Indicator Arrow */}
                <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-slate-500 group-hover:text-cyan-400 transition-colors">
                  <span>Click to isolate node cluster</span>
                  <ChevronRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Drawer Footer Metrics */}
      <div className="p-3 border-t border-slate-800 bg-slate-950 font-mono text-[10px] text-slate-400 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          <span>InfraNodus Matrix Active</span>
        </span>
        <span className="text-slate-300 font-bold">
          {filtered.length} / {statements.length} Rendered
        </span>
      </div>

    </div>
  );
};
