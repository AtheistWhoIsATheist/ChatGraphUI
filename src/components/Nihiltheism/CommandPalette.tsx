import React, { useState, useEffect } from 'react';
import { Search, FileText, CornerDownLeft } from 'lucide-react';
import { NoteDocument } from './types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  notes: Record<string, NoteDocument>;
  onSelectNote: (noteId: string) => void;
  onSelectTag?: (tag: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  notes,
  onSelectNote,
  onSelectTag
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const noteList = Object.values(notes);
  const filteredNotes = noteList.filter((n) =>
    n.title.toLowerCase().includes(query.toLowerCase()) ||
    n.subtitle.toLowerCase().includes(query.toLowerCase()) ||
    n.relatedIdeas.some((t) => t.toLowerCase().includes(query.toLowerCase())) ||
    n.path.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (noteId: string) => {
    onSelectNote(noteId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/60 backdrop-blur-md animate-fadeIn">
      {/* Backdrop click to close */}
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-xl obsidian-card rounded-2xl overflow-hidden border border-white/15 shadow-2xl z-10 flex flex-col max-h-[70vh]">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-white/10 gap-3">
          <Search size={16} className="text-white/40" />
          <input
            autoFocus
            type="text"
            placeholder="Search notes, principles, tags, or type a command..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex((prev) => Math.min(prev + 1, filteredNotes.length - 1));
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex((prev) => Math.max(prev - 1, 0));
              } else if (e.key === 'Enter' && filteredNotes[selectedIndex]) {
                handleSelect(filteredNotes[selectedIndex].id);
              }
            }}
            className="flex-1 bg-transparent text-sm text-white placeholder-white/30 focus:outline-none"
          />
          <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-white/50 border border-white/10">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredNotes.length === 0 ? (
            <div className="py-8 text-center text-xs text-white/40">
              No matching notes or fragments found in vault.
            </div>
          ) : (
            filteredNotes.map((note, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={note.id}
                  onClick={() => handleSelect(note.id)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${
                    isSelected ? 'bg-violet-600/30 border border-violet-500/40 text-white' : 'text-white/70 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <FileText size={14} className={isSelected ? 'text-violet-300' : 'text-white/40'} />
                    <div className="truncate">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-white">{note.title}</span>
                        <span className="text-[10px] font-mono text-white/40">{note.path}</span>
                      </div>
                      <p className="text-[11px] text-white/50 truncate">{note.subtitle}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {note.relatedIdeas.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectTag?.(tag);
                          onClose();
                        }}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 hover:bg-violet-600/40 text-white/40 hover:text-white transition-colors cursor-pointer"
                      >
                        {tag}
                      </span>
                    ))}
                    {isSelected && <CornerDownLeft size={12} className="text-violet-300 ml-1" />}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Navigation Hints */}
        <div className="px-4 py-2 bg-white/[0.02] border-t border-white/5 flex items-center justify-between text-[10px] text-white/40">
          <div className="flex items-center gap-3">
            <span><kbd className="font-mono bg-white/5 px-1 py-0.5 rounded">↑↓</kbd> Navigate</span>
            <span><kbd className="font-mono bg-white/5 px-1 py-0.5 rounded">↵</kbd> Open Note</span>
            <span><kbd className="font-mono bg-white/5 px-1 py-0.5 rounded">ESC</kbd> Dismiss</span>
          </div>
          <span className="font-mono">Obsidian Vault Index</span>
        </div>
      </div>
    </div>
  );
};
