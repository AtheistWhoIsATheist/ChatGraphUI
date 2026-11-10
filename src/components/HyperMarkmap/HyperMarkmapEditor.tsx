import React, { useRef } from 'react';
import {
  FileText,
  Upload,
  RotateCcw,
  Heading1,
  Heading2,
  Heading3,
  List,
  Quote,
  X
} from 'lucide-react';

interface Props {
  markdownText: string;
  onChangeMarkdown: (text: string) => void;
  onClose: () => void;
  onFileUpload: (file: File) => void;
}

export const HyperMarkmapEditor: React.FC<Props> = ({
  markdownText,
  onChangeMarkdown,
  onClose,
  onFileUpload
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const insertSnippet = (snippet: string) => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = markdownText.substring(0, start);
    const after = markdownText.substring(end);
    const newText = before + snippet + after;
    onChangeMarkdown(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + snippet.length, start + snippet.length);
    }, 50);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Handle Tab key indentation
    if (e.key === 'Tab') {
      e.preventDefault();
      insertSnippet('  ');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileUpload(file);
      e.target.value = '';
    }
  };

  // Generate line numbers
  const linesCount = (markdownText.match(/\n/g) || []).length + 1;
  const lineNumbers = Array.from({ length: linesCount }, (_, i) => i + 1);

  return (
    <aside
      aria-label="Markdown Source Editor"
      className="relative flex flex-col w-88 h-full bg-slate-900/95 backdrop-blur-md border-r border-slate-800 z-20 text-slate-300 font-mono text-xs shadow-2xl"
    >
      {/* Editor Header */}
      <div className="flex items-center justify-between px-3 h-9 bg-slate-950/80 border-b border-slate-800">
        <div className="flex items-center gap-1.5">
          <FileText size={12} className="text-slate-400" />
          <span className="font-semibold text-slate-200 tracking-wide uppercase text-[10px]">
            Markdown Source
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 text-[10px]"
            title="Import Markdown file"
          >
            <Upload size={10} />
            <span>Upload</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".md,.markdown,.txt,.json"
            onChange={handleFileChange}
            className="hidden"
          />

          <button
            onClick={() => onChangeMarkdown('')}
            className="p-1 hover:text-rose-400 text-slate-500 rounded hover:bg-slate-800"
            title="Clear editor"
          >
            <RotateCcw size={11} />
          </button>

          <button
            onClick={onClose}
            className="p-1 hover:text-white text-slate-500 rounded hover:bg-slate-800"
            title="Close editor (E)"
          >
            <X size={12} />
          </button>
        </div>
      </div>

      {/* Formatting Shortcuts Bar */}
      <div className="flex items-center gap-1 px-2 py-0.5 bg-slate-950/50 border-b border-slate-800 text-slate-400">
        <button
          onClick={() => insertSnippet('\n# ')}
          className="p-1 hover:text-slate-200 hover:bg-slate-800 rounded"
          title="Heading 1 (#)"
        >
          <Heading1 size={11} />
        </button>
        <button
          onClick={() => insertSnippet('\n## ')}
          className="p-1 hover:text-slate-200 hover:bg-slate-800 rounded"
          title="Heading 2 (##)"
        >
          <Heading2 size={11} />
        </button>
        <button
          onClick={() => insertSnippet('\n### ')}
          className="p-1 hover:text-slate-200 hover:bg-slate-800 rounded"
          title="Heading 3 (###)"
        >
          <Heading3 size={11} />
        </button>
        <div className="w-[1px] h-3 bg-slate-800 mx-1" />
        <button
          onClick={() => insertSnippet('\n- ')}
          className="p-1 hover:text-slate-200 hover:bg-slate-800 rounded"
          title="List Item (- )"
        >
          <List size={11} />
        </button>
        <button
          onClick={() => insertSnippet('\n> ')}
          className="p-1 hover:text-slate-200 hover:bg-slate-800 rounded"
          title="Blockquote (> )"
        >
          <Quote size={11} />
        </button>
      </div>

      {/* Editor Body with Line Numbers */}
      <div className="relative flex-1 flex overflow-hidden">
        {/* Line Numbers */}
        <div className="w-8 py-2.5 bg-slate-950/70 select-none text-right pr-2 text-slate-600 font-mono text-[10px] leading-relaxed border-r border-slate-800/80 overflow-hidden">
          {lineNumbers.map((num) => (
            <div key={num}>{num}</div>
          ))}
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={markdownText}
          onChange={(e) => onChangeMarkdown(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type or paste markdown hierarchy..."
          spellCheck={false}
          className="flex-1 h-full p-2.5 bg-transparent text-slate-200 font-mono text-[11px] leading-relaxed resize-none outline-none overflow-y-auto whitespace-pre selection:bg-slate-700 selection:text-white"
        />
      </div>

      {/* Footer Info */}
      <div className="px-3 py-1 bg-slate-950 border-t border-slate-800 text-[10px] text-slate-500 flex justify-between items-center">
        <span>{linesCount} lines</span>
        <span>Auto-synced</span>
      </div>
    </aside>
  );
};
