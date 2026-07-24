import React, { useState } from 'react';
import { CorpusText } from '../data/ontology';
import { Marginalia } from '../types';
import { Search, Tag, MessageSquare, Save, Trash2, Calendar } from 'lucide-react';
import { motion } from 'motion/react';

interface CorpusBrowserProps {
  corpusTexts: CorpusText[];
  marginalia: Marginalia[];
  onSaveMarginalia: (corpusId: string, noteText: string) => void;
  onDeleteMarginalia: (corpusId: string) => void;
}

export const CorpusBrowser: React.FC<CorpusBrowserProps> = ({
  corpusTexts,
  marginalia,
  onSaveMarginalia,
  onDeleteMarginalia
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [draftNoteText, setDraftNoteText] = useState('');

  // Collect all unique tags from the corpus texts
  const allTags = React.useMemo(() => {
    const tags = new Set<string>();
    corpusTexts.forEach(item => item.tags.forEach(t => tags.add(t)));
    return Array.from(tags);
  }, [corpusTexts]);

  // Filter corpus texts based on search term and selected tag
  const filteredTexts = React.useMemo(() => {
    return corpusTexts.filter(item => {
      const matchesSearch = item.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.fragment.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTag = selectedTag ? item.tags.includes(selectedTag) : true;
      return matchesSearch && matchesTag;
    });
  }, [corpusTexts, searchTerm, selectedTag]);

  // Start editing marginalia notes
  const handleStartEditing = (corpusId: string, currentText: string) => {
    setEditingNotesId(corpusId);
    setDraftNoteText(currentText);
  };

  // Save notes
  const handleSaveNotes = (corpusId: string) => {
    onSaveMarginalia(corpusId, draftNoteText.trim());
    setEditingNotesId(null);
  };

  return (
    <div id="corpus-browser-section" className="flex flex-col gap-6 h-full">
      {/* Search and Filter Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-neutral-950 border border-neutral-900 rounded-2xl p-4 abyssal-glow">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-neutral-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search author, title, fragment content..."
            className="w-full bg-black border border-neutral-900 focus:border-neutral-700 rounded-xl py-2 pl-10 pr-4 text-xs text-neutral-200 outline-none transition-all placeholder-neutral-700 font-sans"
          />
        </div>

        {/* Tag Filters list */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <Tag className="w-3.5 h-3.5 text-neutral-600 flex-shrink-0" />
          <button
            onClick={() => setSelectedTag(null)}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-mono tracking-wider transition-all cursor-pointer ${
              selectedTag === null
                ? 'bg-white text-black font-semibold'
                : 'bg-neutral-900 hover:bg-neutral-850 text-neutral-400 hover:text-neutral-200 border border-neutral-850'
            }`}
          >
            All Archive
          </button>
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-mono tracking-wider transition-all cursor-pointer ${
                tag === selectedTag
                  ? 'bg-white text-black font-semibold'
                  : 'bg-neutral-900 hover:bg-neutral-850 border border-neutral-850 text-neutral-400 hover:text-neutral-200'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      {/* Fragments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto max-h-[600px] pr-1">
        {filteredTexts.length > 0 ? (
          filteredTexts.map(text => {
            const notes = marginalia.find(m => m.corpusId === text.id);
            const isEditing = editingNotesId === text.id;

            return (
              <motion.div
                layout
                key={text.id}
                className="bg-neutral-950 border border-neutral-900 rounded-2xl p-6 flex flex-col justify-between gap-5 abyssal-glow hover:border-neutral-800 transition-all group relative"
              >
                <div className="flex flex-col gap-3">
                  {/* Meta */}
                  <div className="flex justify-between items-start text-[10px] font-mono text-neutral-500">
                    <span className="text-neutral-400 font-semibold">{text.author}</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-neutral-600" />
                      {text.period}
                    </span>
                  </div>

                  {/* Document Fragment Content */}
                  <p className="text-xs text-neutral-300 leading-relaxed font-mono bg-neutral-900/30 border border-neutral-900 p-4 rounded-xl relative italic select-text">
                    <span className="absolute top-1 left-2 text-2xl text-neutral-800 select-none font-serif leading-none">“</span>
                    {text.fragment}
                    <span className="absolute bottom-1 right-2 text-2xl text-neutral-800 select-none font-serif leading-none">”</span>
                  </p>

                  <h4 className="text-xs font-display font-medium text-neutral-400 mt-1 pl-1">
                    — {text.title}
                  </h4>

                  {/* Dynamic tags in bubble style */}
                  <div className="flex flex-wrap gap-1.5 mt-2 pl-1">
                    {text.tags.map(t => (
                      <span key={t} className="text-[9px] font-mono text-neutral-500 bg-neutral-900 px-2 py-0.5 rounded border border-neutral-850">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Marginalia Scholarly notes section */}
                <div className="border-t border-neutral-900/60 pt-4 mt-2 flex flex-col gap-2">
                  <div className="flex justify-between items-center text-[10px] font-mono text-neutral-500">
                    <span className="flex items-center gap-1 text-neutral-400">
                      <MessageSquare className="w-3.5 h-3.5 text-neutral-500" />
                      Scholarly Marginalia
                    </span>
                    {!isEditing && (
                      <button
                        onClick={() => handleStartEditing(text.id, notes?.noteText || '')}
                        className="text-neutral-500 hover:text-white transition-colors cursor-pointer"
                      >
                        {notes ? 'Edit Note' : '+ Add Notes'}
                      </button>
                    )}
                  </div>

                  {isEditing ? (
                    <div className="flex flex-col gap-2 mt-1">
                      <textarea
                        value={draftNoteText}
                        onChange={(e) => setDraftNoteText(e.target.value)}
                        placeholder="Inscribe your personal critical annotations, connections to secondary texts, or meditative comments here..."
                        className="w-full h-[80px] bg-black border border-neutral-850 text-neutral-200 text-[11px] p-2 rounded-xl outline-none resize-none font-sans leading-relaxed"
                      />
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => setEditingNotesId(null)}
                          className="px-2.5 py-1 text-[10px] font-mono text-neutral-500 hover:text-neutral-300 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSaveNotes(text.id)}
                          className="px-3 py-1 bg-white hover:bg-neutral-200 text-black text-[10px] font-mono rounded-lg transition-colors font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <Save className="w-3 h-3" />
                          Save Notes
                        </button>
                      </div>
                    </div>
                  ) : notes ? (
                    <div className="bg-neutral-900/40 border border-neutral-900/80 p-3 rounded-xl flex justify-between items-start gap-4">
                      <p className="text-xs text-neutral-400 font-sans leading-relaxed select-text italic">
                        {notes.noteText}
                      </p>
                      <button
                        onClick={() => onDeleteMarginalia(text.id)}
                        className="text-neutral-600 hover:text-red-400 transition-colors p-1 flex-shrink-0"
                        title="Erase Note"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <p className="text-[10px] text-neutral-600 italic pl-1 font-mono">
                      No research marginalia inscribed on this text.
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="col-span-2 flex flex-col items-center justify-center py-20 text-center text-neutral-600 gap-2">
            <Search className="w-8 h-8 text-neutral-800 animate-pulse" />
            <p className="text-xs font-mono">No matching texts found in our archives.</p>
            <p className="text-[11px] text-neutral-700">Try clearing the tag filter or search text input.</p>
          </div>
        )}
      </div>
    </div>
  );
};
