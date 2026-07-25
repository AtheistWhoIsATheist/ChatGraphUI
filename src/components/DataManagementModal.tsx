import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, Trash2, X, FileText, Check, AlertCircle, Database, FileCode } from 'lucide-react';
import { JournalEntry, Marginalia, ParadoxSynthesis } from '../types';

interface DataManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  journalEntries: JournalEntry[];
  marginalia: Marginalia[];
  synthesisHistory: ParadoxSynthesis[];
  onImportData: (data: {
    journalEntries?: JournalEntry[];
    marginalia?: Marginalia[];
    synthesisHistory?: ParadoxSynthesis[];
  }) => void;
  onClearAllData: () => void;
}

export const DataManagementModal: React.FC<DataManagementModalProps> = ({
  isOpen,
  onClose,
  journalEntries,
  marginalia,
  synthesisHistory,
  onImportData,
  onClearAllData,
}) => {
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Export Plain Text (.txt) archive
  const handleExportPlainText = () => {
    let txt = `===================================================\n`;
    txt += `NIHILISMI EXPERIENTIA SACRA - ARCHIVED REFLECTIONS\n`;
    txt += `Exported on ${new Date().toLocaleString()}\n`;
    txt += `===================================================\n\n`;

    txt += `SECTION 1: VOID JOURNAL REFLECTIONS (${journalEntries.length})\n`;
    txt += `---------------------------------------------------\n\n`;
    if (journalEntries.length === 0) {
      txt += `[No journal reflections recorded.]\n\n`;
    } else {
      journalEntries.forEach((entry, idx) => {
        txt += `Reflective Note #${idx + 1}\n`;
        txt += `Concept: ${entry.nodeLabel}\n`;
        txt += `Date: ${new Date(entry.timestamp).toLocaleString()}\n`;
        txt += `Question: ${entry.question}\n`;
        txt += `User Reflection:\n${entry.userText}\n\n`;
        txt += `Apophatic Reframing:\n${entry.analysis.apophaticReframing}\n\n`;
        txt += `Status: ${entry.analysis.contemplationStatus.toUpperCase()}\n`;
        txt += `---------------------------------------------------\n\n`;
      });
    }

    txt += `SECTION 2: SCHOLARLY MARGINALIA (${marginalia.length})\n`;
    txt += `---------------------------------------------------\n\n`;
    if (marginalia.length === 0) {
      txt += `[No marginalia notes recorded.]\n\n`;
    } else {
      marginalia.forEach((item, idx) => {
        txt += `Marginalia #${idx + 1}\n`;
        txt += `Corpus ID: ${item.corpusId}\n`;
        txt += `Date: ${new Date(item.timestamp).toLocaleString()}\n`;
        txt += `Note Content:\n${item.noteText}\n`;
        txt += `---------------------------------------------------\n\n`;
      });
    }

    txt += `SECTION 3: PARADOX CODEX SYNTHESES (${synthesisHistory.length})\n`;
    txt += `---------------------------------------------------\n\n`;
    if (synthesisHistory.length === 0) {
      txt += `[No paradox syntheses recorded.]\n\n`;
    } else {
      synthesisHistory.forEach((synth, idx) => {
        txt += `Paradox #${idx + 1}: ${synth.nodeALabel} vs ${synth.nodeBLabel}\n`;
        txt += `Thesis: ${synth.thesis}\n`;
        txt += `Antithesis: ${synth.antithesis}\n`;
        txt += `Apophatic Dissolution: ${synth.synthesis}\n`;
        txt += `---------------------------------------------------\n\n`;
      });
    }

    const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nihilismi_reflections_archive_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Export Markdown (.md) report
  const handleExportMarkdown = () => {
    let md = `# Nihilismi Experientia Sacra - Archived Reflections\n\n`;
    md += `*Exported on ${new Date().toLocaleString()}*\n\n`;

    md += `--- \n\n## 1. Void Journal Entries (${journalEntries.length})\n\n`;
    if (journalEntries.length === 0) {
      md += `*No journal reflections recorded.*\n\n`;
    } else {
      journalEntries.forEach((entry, idx) => {
        md += `### ${idx + 1}. Concept: ${entry.nodeLabel}\n`;
        md += `**Date:** ${new Date(entry.timestamp).toLocaleString()}\n`;
        md += `**Question:** "${entry.question}"\n\n`;
        md += `**Reflection:**\n> ${entry.userText}\n\n`;
        md += `**Apophatic Reframing:**\n> ${entry.analysis.apophaticReframing}\n\n`;
        md += `**Identified Mental Anchors:** ${entry.analysis.dogmasIdentified.join(', ') || 'None'}\n`;
        md += `**Status:** ${entry.analysis.contemplationStatus.toUpperCase()}\n\n---\n\n`;
      });
    }

    md += `## 2. Scholarly Marginalia (${marginalia.length})\n\n`;
    if (marginalia.length === 0) {
      md += `*No marginalia notes recorded.*\n\n`;
    } else {
      marginalia.forEach((item) => {
        md += `### Corpus ID: ${item.corpusId}\n`;
        md += `**Date:** ${new Date(item.timestamp).toLocaleString()}\n`;
        md += `**Note:**\n> ${item.noteText}\n\n`;
      });
    }

    md += `## 3. Paradox Codex Syntheses (${synthesisHistory.length})\n\n`;
    if (synthesisHistory.length === 0) {
      md += `*No paradox syntheses recorded.*\n\n`;
    } else {
      synthesisHistory.forEach((synth, idx) => {
        md += `### Paradox ${idx + 1}: ${synth.nodeALabel} ↔ ${synth.nodeBLabel}\n`;
        md += `**Date:** ${new Date(synth.timestamp).toLocaleString()}\n\n`;
        md += `**Thesis:** ${synth.thesis}\n\n`;
        md += `**Antithesis:** ${synth.antithesis}\n\n`;
        md += `**Apophatic Dissolution:**\n> ${synth.synthesis}\n\n---\n\n`;
      });
    }

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nihilismi_reflections_report_${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Import Markdown (.md, .markdown) or Plain Text (.txt, .text) files
  const handleImportMarkdownOrText = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (!text || !text.trim()) {
          throw new Error('File content is empty.');
        }

        // Parse Markdown / Plain Text blocks into journal entries and marginalia
        const newJournalEntries: JournalEntry[] = [];
        const newMarginalia: Marginalia[] = [];
        const newSyntheses: ParadoxSynthesis[] = [];

        // Split by major Markdown headers (e.g., # or ## or ---)
        const sections = text.split(/(?=\n#{1,3}\s+|\n---+\n|\nSECTION\s+\d+:)/i).map(s => s.trim()).filter(Boolean);

        sections.forEach((sec, idx) => {
          // Check if section looks like a reflection or note
          if (sec.toLowerCase().includes('concept:') || sec.toLowerCase().includes('reflection') || sec.toLowerCase().includes('question:')) {
            const conceptMatch = sec.match(/concept:\s*([^\n]+)/i);
            const questionMatch = sec.match(/question:\s*"([^"]+)"|question:\s*([^\n]+)/i);
            const reflectionMatch = sec.match(/(?:reflection|user reflection):\s*([\s\S]+?)(?=\n\*\*|\n---|\napophatic|$)/i);
            
            const concept = conceptMatch ? conceptMatch[1].trim() : `Imported Markdown Note #${idx + 1}`;
            const question = questionMatch ? (questionMatch[1] || questionMatch[2]).trim() : 'What is the ground of this imported reflection?';
            const userContent = reflectionMatch ? reflectionMatch[1].trim() : sec.slice(0, 400);

            newJournalEntries.push({
              id: `imported_journal_${Date.now()}_${idx}`,
              nodeId: 'imported_node',
              nodeLabel: concept,
              question,
              userText: userContent,
              timestamp: new Date().toISOString(),
              analysis: {
                dogmasIdentified: ['Reification Anchor'],
                apophaticReframing: `In imported Markdown context: "${userContent.slice(0, 120)}..."`,
                contemplationStatus: 'active'
              }
            });
          } else if (sec.toLowerCase().includes('marginalia') || sec.toLowerCase().includes('corpus id:')) {
            const noteMatch = sec.match(/(?:note|note content):\s*([\s\S]+?)(?=\n---|$$)/i);
            const noteContent = noteMatch ? noteMatch[1].trim() : sec.slice(0, 300);

            newMarginalia.push({
              corpusId: `imported_doc_${idx + 1}`,
              noteText: noteContent,
              timestamp: new Date().toISOString()
            });
          } else {
            // General Plain Text or Markdown paragraph
            newMarginalia.push({
              corpusId: `markdown_import_${idx + 1}`,
              noteText: sec,
              timestamp: new Date().toISOString()
            });
          }
        });

        // Merge with existing
        const mergedJournal = [...newJournalEntries, ...journalEntries];
        const mergedMarginalia = [...newMarginalia, ...marginalia];
        const mergedSyntheses = [...newSyntheses, ...synthesisHistory];

        onImportData({
          journalEntries: mergedJournal,
          marginalia: mergedMarginalia,
          synthesisHistory: mergedSyntheses
        });

        setImportStatus({
          type: 'success',
          message: `Successfully imported "${file.name}"! Created ${newJournalEntries.length} reflections and ${newMarginalia.length} marginalia entries from Markdown/Text.`
        });
      } catch (err: any) {
        setImportStatus({
          type: 'error',
          message: `Failed to import file: ${err.message || 'Invalid Markdown or Text file'}`
        });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-lg bg-neutral-950 border border-neutral-900 rounded-2xl p-6 shadow-2xl flex flex-col gap-6 text-neutral-200"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-neutral-900 pb-4">
            <div className="flex items-center gap-2.5">
              <Database className="w-5 h-5 text-neutral-400" />
              <div>
                <h2 className="font-display text-sm uppercase tracking-wider font-semibold text-neutral-100">
                  Markdown & Plain Text Archives
                </h2>
                <p className="text-[10px] font-mono text-neutral-500">
                  Import and export your Second Brain reflections in Markdown (.md) or Plain Text (.txt)
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-500 hover:text-neutral-200 hover:bg-neutral-900 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Counts Overview */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-neutral-900/60 border border-neutral-900 rounded-xl p-3 text-center">
              <span className="block text-xl font-display font-semibold text-neutral-100">{journalEntries.length}</span>
              <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider">Reflections</span>
            </div>
            <div className="bg-neutral-900/60 border border-neutral-900 rounded-xl p-3 text-center">
              <span className="block text-xl font-display font-semibold text-neutral-100">{marginalia.length}</span>
              <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider">Marginalia</span>
            </div>
            <div className="bg-neutral-900/60 border border-neutral-900 rounded-xl p-3 text-center">
              <span className="block text-xl font-display font-semibold text-neutral-100">{synthesisHistory.length}</span>
              <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider">Syntheses</span>
            </div>
          </div>

          {/* Action Sections */}
          <div className="flex flex-col gap-3">
            <label className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider font-semibold">
              Export Archive Files
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleExportMarkdown}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 rounded-xl text-xs font-mono font-medium text-emerald-300 transition-all hover:border-emerald-700 cursor-pointer"
              >
                <FileCode className="w-4 h-4 text-emerald-400" />
                <span>Export Markdown (.md)</span>
              </button>
              <button
                onClick={handleExportPlainText}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 rounded-xl text-xs font-mono font-medium text-amber-300 transition-all hover:border-amber-700 cursor-pointer"
              >
                <FileText className="w-4 h-4 text-amber-400" />
                <span>Export Plain Text (.txt)</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <label className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider font-semibold">
              Import / Upload Markdown or Plain Text
            </label>
            <input
              type="file"
              ref={fileInputRef}
              accept=".md,.markdown,.txt,.text"
              onChange={handleImportMarkdownOrText}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 rounded-xl text-xs font-mono font-medium text-neutral-200 transition-all hover:border-amber-500/50 cursor-pointer"
            >
              <Upload className="w-4 h-4 text-amber-400" />
              <span>Upload / Import (.md or .txt)</span>
            </button>
          </div>

          {/* Status Message */}
          {importStatus && (
            <div className={`p-3 rounded-xl border text-xs font-mono flex items-start gap-2 ${
              importStatus.type === 'success'
                ? 'bg-emerald-950/30 border-emerald-900/60 text-emerald-300'
                : 'bg-rose-950/30 border-rose-900/60 text-rose-300'
            }`}>
              {importStatus.type === 'success' ? (
                <Check className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              )}
              <span>{importStatus.message}</span>
            </div>
          )}

          {/* Clear Storage */}
          <div className="border-t border-neutral-900 pt-4 flex items-center justify-between">
            <span className="text-[10px] font-mono text-neutral-500">
              Clear local storage cache
            </span>

            {showConfirmClear ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    onClearAllData();
                    setShowConfirmClear(false);
                    setImportStatus({ type: 'success', message: 'All local archive records cleared.' });
                  }}
                  className="px-3 py-1.5 bg-rose-900/80 hover:bg-rose-800 border border-rose-700 text-rose-100 rounded-lg text-xs font-mono transition-colors cursor-pointer"
                >
                  Confirm Delete All
                </button>
                <button
                  onClick={() => setShowConfirmClear(false)}
                  className="px-2.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 rounded-lg text-xs font-mono cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowConfirmClear(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-lg text-xs font-mono transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Reset Local Data</span>
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
