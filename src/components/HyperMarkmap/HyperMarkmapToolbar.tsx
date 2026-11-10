import React, { useState } from 'react';
import {
  Search,
  ChevronUp,
  ChevronDown,
  X,
  CircleDot,
  Layers,
  Edit3,
  Download,
  BookOpen,
  Upload,
  Maximize,
  Filter,
  Info
} from 'lucide-react';
import { LayoutMode, DisplaySettings, SearchState, CANONICAL_TRADITIONS } from './types';

interface Props {
  layoutMode: LayoutMode;
  onChangeLayout: (mode: LayoutMode) => void;
  displaySettings: DisplaySettings;
  onChangeSettings: (settings: DisplaySettings) => void;
  searchState: SearchState;
  onSearchChange: (query: string) => void;
  onNextMatch: () => void;
  onPrevMatch: () => void;
  onClearSearch: () => void;
  onFitView: () => void;
  isEditorOpen: boolean;
  onToggleEditor: () => void;
  onSelectPreset: (presetId: string) => void;
  onOpenImportModal: () => void;
  onExport: (format: 'svg' | 'png' | 'md' | 'json') => void;
  totalNodesCount: number;
  selectedTraditionIds: string[];
  onToggleTraditionDrawer: () => void;
  isTraditionDrawerOpen: boolean;
  activeCorpusName: string;
}

export const HyperMarkmapToolbar: React.FC<Props> = ({
  layoutMode,
  onChangeLayout,
  displaySettings,
  onChangeSettings,
  searchState,
  onSearchChange,
  onNextMatch,
  onPrevMatch,
  onClearSearch,
  isEditorOpen,
  onToggleEditor,
  onSelectPreset,
  onOpenImportModal,
  onExport,
  totalNodesCount,
  selectedTraditionIds,
  onToggleTraditionDrawer,
  isTraditionDrawerOpen,
  activeCorpusName
}) => {
  const [showPresetsMenu, setShowPresetsMenu] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showInfoHover, setShowInfoHover] = useState(false);

  // Active traditions count
  const activeTraditionsCount =
    selectedTraditionIds.length === 0
      ? CANONICAL_TRADITIONS.length
      : selectedTraditionIds.length;

  return (
    <header className="relative z-30 flex items-center justify-between gap-2 px-3 h-10 min-h-10 max-h-10 bg-slate-900/85 backdrop-blur-md border-b border-slate-800 text-slate-300 text-xs select-none">
      {/* Left: Brand, Tradition Badge Trigger, Corpus Presets, Ingest */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="flex items-center gap-1.5 font-mono">
          <span className="font-semibold text-white tracking-wider text-[11px] uppercase">
            HyperMarkmap
          </span>
          <span className="text-slate-400 font-serif font-bold text-xs">Ω</span>

          {/* Hoverable Telemetry Info Dot (ⓘ) */}
          <div className="relative">
            <button
              onMouseEnter={() => setShowInfoHover(true)}
              onMouseLeave={() => setShowInfoHover(false)}
              className="p-0.5 text-slate-500 hover:text-slate-300 transition-colors"
              title="Corpus Telemetry"
              aria-label="Corpus telemetry info"
            >
              <Info size={12} />
            </button>

            {showInfoHover && (
              <div className="absolute left-0 top-full mt-1.5 w-64 p-2.5 bg-slate-900/95 border border-slate-800 rounded-lg shadow-2xl z-50 text-[10px] text-slate-400 font-mono leading-relaxed">
                <div className="font-semibold text-slate-200 mb-1">{activeCorpusName}</div>
                <div>Mapped Nodes: <span className="text-slate-200">{totalNodesCount}</span></div>
                <div>Traditions: <span className="text-slate-200">{activeTraditionsCount} active</span></div>
                <div className="mt-1 pt-1 border-t border-slate-800 text-slate-500">
                  Philosophical Cartography Engine • Bun/Hono/Vite
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="w-[1px] h-3.5 bg-slate-800 mx-0.5" />

        {/* Collapsible Tradition Filter Badge Trigger */}
        <button
          onClick={onToggleTraditionDrawer}
          className={`flex items-center gap-1.5 px-2 py-1 rounded border text-[11px] font-mono transition-colors ${
            isTraditionDrawerOpen || selectedTraditionIds.length > 0
              ? 'bg-slate-800 border-slate-700 text-white font-medium'
              : 'bg-slate-950/60 hover:bg-slate-800/60 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
          title="Toggle Tradition Filter Drawer"
          aria-expanded={isTraditionDrawerOpen}
        >
          <Filter size={11} className="text-slate-400" />
          <span>Traditions</span>
          <span className="px-1 py-0.2 rounded text-[9px] bg-slate-950 text-slate-300 border border-slate-800">
            {activeTraditionsCount === CANONICAL_TRADITIONS.length ? 'All' : `${activeTraditionsCount}`}
          </span>
          <ChevronDown size={11} className={`transition-transform ${isTraditionDrawerOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Corpus Presets Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowPresetsMenu(!showPresetsMenu)}
            className="flex items-center gap-1 px-2 py-1 rounded bg-slate-950/60 hover:bg-slate-800/60 border border-slate-800 transition-colors text-slate-400 hover:text-slate-200 text-[11px] font-mono"
            title="Select Philosophical Corpus Preset"
          >
            <BookOpen size={11} className="text-slate-400" />
            <span className="hidden sm:inline">Corpus</span>
            <ChevronDown size={10} />
          </button>

          {showPresetsMenu && (
            <div className="absolute left-0 top-full mt-1 w-64 py-1.5 bg-slate-900 border border-slate-800 rounded-lg shadow-2xl z-50 font-sans">
              <div className="px-3 py-1 text-[10px] uppercase font-mono text-slate-500 font-semibold tracking-wider">
                Corpus Presets
              </div>
              <button
                onClick={() => {
                  onSelectPreset('journal314');
                  setShowPresetsMenu(false);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-slate-800 text-slate-200 flex flex-col"
              >
                <span className="font-medium text-xs">Journal 314 Omega (297 KB)</span>
                <span className="text-[10px] text-slate-500 font-mono">15-chapter canonical simpleMindMap</span>
              </button>
              <button
                onClick={() => {
                  onSelectPreset('apophatic');
                  setShowPresetsMenu(false);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-slate-800 text-slate-200 flex flex-col"
              >
                <span className="font-medium text-xs">Apophatic & Nihiltheistic Dialectic</span>
                <span className="text-[10px] text-slate-500 font-mono">Groundlessness and trans-rational void</span>
              </button>
              <button
                onClick={() => {
                  onSelectPreset('taxonomies');
                  setShowPresetsMenu(false);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-slate-800 text-slate-200 flex flex-col"
              >
                <span className="font-medium text-xs">Seven Liberal Arts & Quadrivium</span>
                <span className="text-[10px] text-slate-500 font-mono">Classical metaphysical tree</span>
              </button>
            </div>
          )}
        </div>

        {/* Multipart Form-Data Ingestion Modal Trigger */}
        <button
          onClick={onOpenImportModal}
          className="flex items-center gap-1 px-2 py-1 rounded bg-slate-950/60 hover:bg-slate-800/60 border border-slate-800 transition-colors text-slate-400 hover:text-slate-200 text-[11px] font-mono"
          title="Import Corpus (Multipart Form-Data)"
        >
          <Upload size={11} className="text-slate-400" />
          <span className="hidden sm:inline">Import</span>
        </button>
      </div>

      {/* Center: Streamlined Universal Command Bar */}
      <div className="flex items-center gap-2 flex-1 max-w-md mx-2">
        <div className="relative flex-1 flex items-center">
          <Search size={12} className="absolute left-2.5 text-slate-500 pointer-events-none" />
          <input
            type="text"
            value={searchState.query}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search concepts, operators ( / )..."
            className="w-full pl-7 pr-16 py-1 bg-slate-950/80 hover:bg-slate-950 focus:bg-slate-950 border border-slate-800 focus:border-slate-700 rounded text-xs text-slate-200 placeholder-slate-600 outline-none transition-all font-mono"
          />

          {searchState.query && (
            <div className="absolute right-1 flex items-center gap-1 text-[10px] font-mono text-slate-300 bg-slate-800 px-1 py-0.2 rounded border border-slate-700">
              {searchState.totalMatches > 0 ? (
                <>
                  <span>{searchState.currentIndex + 1}/{searchState.totalMatches}</span>
                  <button onClick={onPrevMatch} className="p-0.5 hover:text-white" title="Previous match">
                    <ChevronUp size={10} />
                  </button>
                  <button onClick={onNextMatch} className="p-0.5 hover:text-white" title="Next match">
                    <ChevronDown size={10} />
                  </button>
                </>
              ) : (
                <span className="text-rose-400">0</span>
              )}
              <button onClick={onClearSearch} className="p-0.5 hover:text-rose-400" title="Clear">
                <X size={10} />
              </button>
            </div>
          )}
        </div>

        {/* Inline Depth Selector */}
        <div className="flex items-center gap-1 font-mono text-[11px] flex-shrink-0">
          <span className="text-slate-500">Depth:</span>
          <select
            value={displaySettings.maxVisibleDepth}
            onChange={(e) =>
              onChangeSettings({
                ...displaySettings,
                maxVisibleDepth: parseInt(e.target.value, 10)
              })
            }
            className="bg-slate-950 border border-slate-800 text-slate-300 rounded px-1.5 py-0.5 outline-none cursor-pointer text-xs"
          >
            <option value={7}>All</option>
            <option value={1}>1</option>
            <option value={2}>2</option>
            <option value={3}>3</option>
            <option value={4}>4</option>
            <option value={5}>5</option>
            <option value={6}>6</option>
          </select>
        </div>
      </div>

      {/* Right Controls: Topology Switcher, Editor, Zen Mode, Export */}
      <div className="flex items-center gap-1.5 flex-shrink-0 font-mono text-[11px]">
        {/* Topology Mode Switcher */}
        <div className="flex items-center bg-slate-950 p-0.5 rounded border border-slate-800">
          <button
            onClick={() => onChangeLayout('radial')}
            className={`flex items-center gap-1 px-2 py-0.5 rounded transition-colors ${
              layoutMode === 'radial'
                ? 'bg-slate-800 text-white font-medium'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Radial Galaxy Topology (Tab)"
          >
            <CircleDot size={11} />
            <span className="hidden md:inline">Radial</span>
          </button>
          <button
            onClick={() => onChangeLayout('horizontal')}
            className={`flex items-center gap-1 px-2 py-0.5 rounded transition-colors ${
              layoutMode === 'horizontal'
                ? 'bg-slate-800 text-white font-medium'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Horizontal Hierarchical Tree (Tab)"
          >
            <Layers size={11} />
            <span className="hidden md:inline">Tree</span>
          </button>
        </div>

        {/* Split Editor Toggle */}
        <button
          onClick={onToggleEditor}
          className={`flex items-center gap-1 px-2 py-1 rounded border transition-colors ${
            isEditorOpen
              ? 'bg-slate-800 border-slate-700 text-white font-medium'
              : 'bg-slate-950/60 hover:bg-slate-800/60 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
          title="Toggle Split Markdown Editor (E)"
        >
          <Edit3 size={11} />
          <span className="hidden lg:inline">Editor</span>
        </button>

        {/* Zen Mode Button */}
        <button
          onClick={() => onChangeSettings({ ...displaySettings, zenMode: true })}
          className="flex items-center gap-1 px-2 py-1 rounded bg-slate-950/60 hover:bg-slate-800/60 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          title="Zen Mode (Z or Ctrl+B)"
        >
          <Maximize size={11} />
          <span className="hidden lg:inline">Zen</span>
        </button>

        {/* Export Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white transition-colors"
            title="Export Visualization"
          >
            <Download size={11} />
            <span className="hidden sm:inline">Export</span>
            <ChevronDown size={10} />
          </button>

          {showExportMenu && (
            <div className="absolute right-0 top-full mt-1 w-44 py-1 bg-slate-900 border border-slate-800 rounded-lg shadow-2xl z-50 font-sans">
              <div className="px-3 py-1 text-[10px] uppercase font-mono text-slate-500 font-semibold tracking-wider">
                Export Options
              </div>
              <button
                onClick={() => {
                  onExport('svg');
                  setShowExportMenu(false);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-slate-800 text-slate-200 text-xs"
              >
                Vector SVG (.svg)
              </button>
              <button
                onClick={() => {
                  onExport('png');
                  setShowExportMenu(false);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-slate-800 text-slate-200 text-xs"
              >
                High-Res PNG (2x .png)
              </button>
              <button
                onClick={() => {
                  onExport('md');
                  setShowExportMenu(false);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-slate-800 text-slate-200 text-xs"
              >
                CommonMark (.md)
              </button>
              <button
                onClick={() => {
                  onExport('json');
                  setShowExportMenu(false);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-slate-800 text-slate-200 text-xs"
              >
                Hierarchical JSON (.json)
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
