import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, Trash2, X, FileJson, FileText, Check, AlertCircle, Database } from 'lucide-react';
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

  // Export JSON backup
  const handleExportJSON = () => {
    const backupData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      journalEntries,
      marginalia,
      synthesisHistory,
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nihilismi_sacra_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Export Markdown report
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

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nihilismi_reflections_report_${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Import JSON backup
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);

        if (!parsed || (typeof parsed !== 'object')) {
          throw new Error('Invalid JSON structure.');
        }

        const validJournal = Array.isArray(parsed.journalEntries) ? parsed.journalEntries : [];
        const validMarginalia = Array.isArray(parsed.marginalia) ? parsed.marginalia : [];
        const validSynthesis = Array.isArray(parsed.synthesisHistory) ? parsed.synthesisHistory : [];

        onImportData({
          journalEntries: validJournal,
          marginalia: validMarginalia,
          synthesisHistory: validSynthesis,
        });

        setImportStatus({
          type: 'success',
          message: `Successfully imported ${validJournal.length} journal reflections, ${validMarginalia.length} marginalia notes, and ${validSynthesis.length} paradox syntheses.`
        });
      } catch (err: any) {
        setImportStatus({
          type: 'error',
          message: `Failed to import JSON file: ${err.message || 'Invalid format'}`
        });
      }
    };
    reader.readAsText(file);
    // Reset file input
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
                  Data Backup & Management
                </h2>
                <p className="text-[10px] font-mono text-neutral-500">
                  Export, import, or manage your personal local archives
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-500 hover:text-neutral-200 hover:bg-neutral-900 rounded-lg transition-colors"
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
              Export Archive Options
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleExportJSON}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 rounded-xl text-xs font-mono font-medium text-neutral-200 transition-all hover:border-neutral-700"
              >
                <FileJson className="w-4 h-4 text-sky-400" />
                <span>Export JSON Backup</span>
              </button>
              <button
                onClick={handleExportMarkdown}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 rounded-xl text-xs font-mono font-medium text-neutral-200 transition-all hover:border-neutral-700"
              >
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>Export Markdown</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <label className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider font-semibold">
              Import Archive File
            </label>
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 rounded-xl text-xs font-mono font-medium text-neutral-200 transition-all hover:border-neutral-700"
            >
              <Upload className="w-4 h-4 text-amber-400" />
              <span>Import .JSON Backup File</span>
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
                  className="px-3 py-1.5 bg-rose-900/80 hover:bg-rose-800 border border-rose-700 text-rose-100 rounded-lg text-xs font-mono transition-colors"
                >
                  Confirm Delete All
                </button>
                <button
                  onClick={() => setShowConfirmClear(false)}
                  className="px-2.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 rounded-lg text-xs font-mono"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowConfirmClear(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-lg text-xs font-mono transition-colors"
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
