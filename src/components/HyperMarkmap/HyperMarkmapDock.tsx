import React from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  CircleDot,
  Layers,
  ChevronDown,
  ChevronUp,
  Maximize,
  Edit3
} from 'lucide-react';
import { LayoutMode } from './types';

interface Props {
  layoutMode: LayoutMode;
  onToggleLayout: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  isEditorOpen: boolean;
  onToggleEditor: () => void;
  zenMode: boolean;
  onToggleZen: () => void;
}

export const HyperMarkmapDock: React.FC<Props> = ({
  layoutMode,
  onToggleLayout,
  onZoomIn,
  onZoomOut,
  onFitView,
  onExpandAll,
  onCollapseAll,
  isEditorOpen,
  onToggleEditor,
  zenMode,
  onToggleZen
}) => {
  // If in Zen Mode, only show a minimal discrete trigger or let Z keybinding handle it
  if (zenMode) return null;

  return (
    <aside
      aria-label="Canvas HUD Controls"
      className="absolute bottom-10 left-4 z-30 flex flex-col items-center gap-1 p-1 bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-lg shadow-xl text-slate-300 font-mono text-[11px] select-none"
    >
      <button
        onClick={onZoomIn}
        className="p-1.5 hover:text-white hover:bg-slate-800 rounded transition-colors"
        title="Zoom In (+)"
        aria-label="Zoom in"
      >
        <ZoomIn size={14} />
      </button>

      <button
        onClick={onZoomOut}
        className="p-1.5 hover:text-white hover:bg-slate-800 rounded transition-colors"
        title="Zoom Out (-)"
        aria-label="Zoom out"
      >
        <ZoomOut size={14} />
      </button>

      <button
        onClick={onFitView}
        className="p-1.5 hover:text-white hover:bg-slate-800 rounded transition-colors"
        title="Fit & Center View (0)"
        aria-label="Fit and center canvas"
      >
        <Maximize2 size={14} />
      </button>

      <div className="w-4 h-[1px] bg-slate-800 my-0.5" />

      <button
        onClick={onToggleLayout}
        className="p-1.5 hover:text-white hover:bg-slate-800 rounded transition-colors"
        title={`Toggle Layout (Current: ${layoutMode}) [Tab]`}
        aria-label="Toggle layout projection"
      >
        {layoutMode === 'radial' ? <CircleDot size={14} /> : <Layers size={14} />}
      </button>

      <button
        onClick={onExpandAll}
        className="p-1.5 hover:text-white hover:bg-slate-800 rounded transition-colors text-[10px] font-bold"
        title="Expand All Nodes"
        aria-label="Expand all nodes"
      >
        <ChevronDown size={14} />
      </button>

      <button
        onClick={onCollapseAll}
        className="p-1.5 hover:text-white hover:bg-slate-800 rounded transition-colors text-[10px] font-bold"
        title="Collapse All Subtrees"
        aria-label="Collapse all subtrees"
      >
        <ChevronUp size={14} />
      </button>

      <div className="w-4 h-[1px] bg-slate-800 my-0.5" />

      <button
        onClick={onToggleEditor}
        className={`p-1.5 rounded transition-colors ${
          isEditorOpen
            ? 'bg-slate-800 text-white'
            : 'hover:text-white hover:bg-slate-800 text-slate-400'
        }`}
        title="Toggle Split Markdown Editor (E)"
        aria-label="Toggle split editor"
      >
        <Edit3 size={14} />
      </button>

      <button
        onClick={onToggleZen}
        className="p-1.5 hover:text-white hover:bg-slate-800 rounded transition-colors"
        title="Zen Mode (Z or Ctrl+B)"
        aria-label="Toggle Zen mode"
      >
        <Maximize size={14} />
      </button>
    </aside>
  );
};
