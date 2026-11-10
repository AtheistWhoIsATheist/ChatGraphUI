import React, { useState, useRef } from 'react';
import { Upload, FileText, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCorpusIngested: (content: string, filename: string) => void;
}

export const CorpusImportModal: React.FC<Props> = ({ isOpen, onClose, onCorpusIngested }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pasteText, setPasteText] = useState('');
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
      setErrorMessage(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setErrorMessage(null);
    }
  };

  const handleUploadSubmit = async () => {
    setErrorMessage(null);

    let fileToUpload: File | null = selectedFile;
    if (activeTab === 'paste') {
      if (!pasteText.trim()) {
        setErrorMessage('Please enter markdown or structured text.');
        return;
      }
      const blob = new Blob([pasteText], { type: 'text/markdown;charset=utf-8' });
      fileToUpload = new File([blob], 'pasted-corpus.md', { type: 'text/markdown' });
    }

    if (!fileToUpload) {
      setErrorMessage('Please select a markdown or JSON file to upload.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Strictly use native HTML FormData construct
      const formData = new FormData();
      formData.append('file', fileToUpload);

      const res = await fetch('/api/corpus/upload', {
        method: 'POST',
        body: formData // Browser sends multipart/form-data boundary automatically
      });

      if (!res.ok) {
        throw new Error(`Upload server responded with HTTP ${res.status}`);
      }

      const data = await res.json();
      if (data.content) {
        onCorpusIngested(data.content, data.filename || fileToUpload.name);
        onClose();
      } else {
        throw new Error('Server returned empty content payload');
      }
    } catch (err: any) {
      console.warn('Multipart upload failed or offline fallback initiated:', err);
      // Client-side fallback read to guarantee resilience
      if (fileToUpload) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const raw = e.target?.result as string;
          if (raw) {
            onCorpusIngested(raw, fileToUpload.name);
            onClose();
          }
        };
        reader.readAsText(fileToUpload);
      } else {
        setErrorMessage(err.message || 'Failed to ingest corpus file');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-5 text-slate-200 text-xs font-sans">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center">
              <Upload size={14} className="text-slate-300" />
            </div>
            <div>
              <h2 className="font-semibold text-sm text-white font-mono tracking-wide">
                Ingest Philosophical Corpus
              </h2>
              <span className="text-[10px] text-slate-400 font-mono">
                Pure Multipart/Form-Data Ingestion Pipeline
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        {/* Tab selection */}
        <div className="flex items-center gap-2 mb-4 border-b border-slate-800/80 pb-2 font-mono text-[11px]">
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-3 py-1 rounded transition-colors ${
              activeTab === 'upload'
                ? 'bg-slate-800 text-white font-medium'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            File Upload (.md, .json)
          </button>
          <button
            onClick={() => setActiveTab('paste')}
            className={`px-3 py-1 rounded transition-colors ${
              activeTab === 'paste'
                ? 'bg-slate-800 text-white font-medium'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Direct Text Input
          </button>
        </div>

        {/* Tab 1: Upload */}
        {activeTab === 'upload' && (
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors ${
              dragActive
                ? 'border-slate-500 bg-slate-800/50'
                : 'border-slate-800 hover:border-slate-700 bg-slate-950/40'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".md,.markdown,.txt,.json"
              onChange={handleFileChange}
              className="hidden"
            />

            {selectedFile ? (
              <div className="flex items-center gap-2 text-slate-200">
                <FileText size={18} className="text-slate-400" />
                <span className="font-mono text-xs font-semibold">{selectedFile.name}</span>
                <span className="text-[10px] text-slate-500">
                  ({(selectedFile.size / 1024).toFixed(1)} KB)
                </span>
              </div>
            ) : (
              <>
                <Upload size={24} className="text-slate-500 mb-2" />
                <p className="text-slate-300 font-medium mb-1">
                  Click or drag and drop markdown file here
                </p>
                <p className="text-[10px] text-slate-500 font-mono">
                  Supports CommonMark .md, .txt, or simpleMindMap .json
                </p>
              </>
            )}
          </div>
        )}

        {/* Tab 2: Paste */}
        {activeTab === 'paste' && (
          <textarea
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            placeholder="# Paste your markdown hierarchy or corpus notes here..."
            rows={7}
            className="w-full p-3 bg-slate-950/60 border border-slate-800 rounded-lg text-slate-200 font-mono text-xs outline-none focus:border-slate-700 resize-none"
          />
        )}

        {/* Error message */}
        {errorMessage && (
          <div className="mt-3 p-2 bg-rose-950/40 border border-rose-800/40 rounded flex items-center gap-2 text-rose-300 text-[11px]">
            <AlertCircle size={13} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 mt-5 pt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors font-mono text-[11px]"
          >
            Cancel
          </button>

          <button
            onClick={handleUploadSubmit}
            disabled={isSubmitting || (activeTab === 'upload' && !selectedFile) || (activeTab === 'paste' && !pasteText.trim())}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none text-white border border-slate-700 font-mono text-[11px] font-medium transition-colors"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={12} className="animate-spin" />
                <span>Streaming Payload...</span>
              </>
            ) : (
              <>
                <CheckCircle size={12} />
                <span>Ingest to Graph</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
