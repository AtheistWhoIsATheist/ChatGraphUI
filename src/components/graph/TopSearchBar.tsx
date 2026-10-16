import React from 'react';
import { Search, X, Bookmark, HelpCircle, RefreshCw, AlertTriangle, Filter, PanelRight, Focus, FileText, Layers, FolderOpen, Brain } from 'lucide-react';
import { GraphDataset } from '../../data/knowledgeGraphDataset';

interface TopSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeLens: 'source_clusters' | 'concept_hubs' | 'thinker_network' | 'audit_mode' | 'path_mode' | 'selected_relations';
  onLensChange: (lens: 'source_clusters' | 'concept_hubs' | 'thinker_network' | 'audit_mode' | 'path_mode' | 'selected_relations') => void;
  summary: GraphDataset['summary'];
  activeFilterCount: number;
  onToggleSidebar: () => void;
  onToggleRightSidebar: () => void;
  onOpenSavedViews: () => void;
  onOpenDuplicateDrawer: () => void;
  onOpenStatementsDrawer?: () => void;
  onOpenFileManagement?: () => void;
  onOpenAgentsModal?: () => void;
  onOpenHelpModal: () => void;
  onResetView: () => void;
  isSidebarOpen: boolean;
  isRightSidebarOpen: boolean;
  statementCount?: number;
  voidDepth?: number;
  onVoidDepthChange?: (depth: number) => void;
}

export const TopSearchBar: React.FC<TopSearchBarProps> = ({
  searchQuery,
  onSearchChange,
  activeLens,
  onLensChange,
  summary,
  activeFilterCount,
  onToggleSidebar,
  onToggleRightSidebar,
  onOpenSavedViews,
  onOpenDuplicateDrawer,
  onOpenStatementsDrawer,
  onOpenFileManagement,
  onOpenAgentsModal,
  onOpenHelpModal,
  onResetView,
  isSidebarOpen,
  isRightSidebarOpen,
  statementCount = 10,
  voidDepth = 0,
  onVoidDepthChange
}) => {
  return (
    <header className="bg-neutral-950 border-b border-neutral-900 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs select-none">
      
      {/* Left section: Filter Sidebar Toggle & Search */}
      <div className="flex items-center gap-2 flex-1 min-w-[280px]">
        <button
          onClick={onToggleSidebar}
          className={`px-2.5 py-1.5 rounded-lg border flex items-center gap-1.5 transition-all cursor-pointer font-mono text-[11px] ${
            isSidebarOpen || activeFilterCount > 0
              ? 'bg-neutral-850 border-neutral-700 text-white shadow-sm'
              : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200'
          }`}
          title="Toggle Filters & Graph Lenses"
        >
          <Filter className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Filters</span>
          {activeFilterCount > 0 && (
            <span className="ml-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1.5 py-0.2 rounded-full text-[10px] font-bold">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Global Search Input */}
        <div className="relative flex-1 max-w-md flex items-center">
          <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search 1,155 nodes by label, ID (mono), source file, or relation... (Cmd+K)"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-8 pr-8 py-1.5 text-xs font-mono text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 text-neutral-500 hover:text-neutral-300 p-0.5 rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Center: Lens / View Mode Selector */}
      <div className="flex items-center gap-1 bg-neutral-900/80 border border-neutral-850 p-1 rounded-xl font-mono text-[11px]">
        <span className="text-neutral-500 px-2 text-[10px] uppercase tracking-wider hidden lg:inline">Lens:</span>
        <button
          onClick={() => onLensChange('source_clusters')}
          className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
            activeLens === 'source_clusters'
              ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300 font-medium'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
          }`}
          title="Cluster nodes by source document provenance (Default)"
        >
          Source Clusters
        </button>

        <button
          onClick={() => onLensChange('concept_hubs')}
          className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
            activeLens === 'concept_hubs'
              ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-medium'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
          }`}
          title="Highlight major concept hubs and void resonance"
        >
          Concept Hubs
        </button>

        <button
          onClick={() => onLensChange('thinker_network')}
          className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
            activeLens === 'thinker_network'
              ? 'bg-purple-500/20 border border-purple-500/40 text-purple-300 font-medium'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
          }`}
          title="Focus on thinker connections and intellectual lineages"
        >
          Thinkers
        </button>

        <button
          onClick={() => onLensChange('audit_mode')}
          className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
            activeLens === 'audit_mode'
              ? 'bg-red-500/20 border border-red-500/40 text-red-300 font-medium'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
          }`}
          title="Highlight 102 duplicate label groups & 252 low-degree nodes"
        >
          Audit Mode
        </button>

        <button
          onClick={() => onLensChange('path_mode')}
          className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
            activeLens === 'path_mode'
              ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-medium'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
          }`}
          title="A-to-B path trace and evidence chain analysis"
        >
          Path Trace
        </button>

        <button
          onClick={() => onLensChange('selected_relations')}
          className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
            activeLens === 'selected_relations'
              ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-bold shadow-sm'
              : 'text-neutral-400 hover:text-cyan-200 hover:bg-neutral-800/50'
          }`}
          title="Isolate and render ONLY the selected node(s) and their immediate relations"
        >
          <Focus className="w-3 h-3 text-cyan-400" />
          <span>Selected & Relations</span>
        </button>
      </div>

      {/* Void Depth State Filter Slider */}
      {onVoidDepthChange && (
        <div className="flex items-center gap-2 bg-neutral-900/90 border border-neutral-800 px-3 py-1 rounded-xl font-mono text-[11px]">
          <div className="flex items-center gap-1.5 text-violet-400">
            <Layers className="w-3.5 h-3.5" />
            <span className="font-bold uppercase tracking-wider text-[10px]">Void Depth</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={voidDepth}
            onChange={(e) => onVoidDepthChange(parseFloat(e.target.value))}
            className="w-20 md:w-28 h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-violet-500 hover:accent-violet-400"
            title="Adjust Void Depth filter to dynamically dim non-conforming nodes"
          />
          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
            voidDepth > 0.6 ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40' : voidDepth > 0 ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-neutral-500'
          }`}>
            {(voidDepth * 100).toFixed(0)}%
          </span>
          {voidDepth > 0 && (
            <button
              onClick={() => onVoidDepthChange(0)}
              className="text-[10px] text-neutral-500 hover:text-neutral-300 p-0.5"
              title="Reset Void Depth"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      )}

      {/* Right: Graph Stats Summary & Action Triggers */}
      <div className="flex items-center gap-2 font-mono text-[11px] text-neutral-400">
        
        {/* File Management & Ingestion Modal Button */}
        {onOpenFileManagement && (
          <button
            onClick={onOpenFileManagement}
            className="px-2.5 py-1.5 rounded-lg border bg-violet-950/40 border-violet-500/40 hover:border-violet-400 text-violet-200 flex items-center gap-1.5 transition-all cursor-pointer font-mono text-[11px] font-semibold shadow-sm hover:bg-violet-900/40"
            title="Open Graph Corpus & File Management (Treatises, Ingestion, Grounding)"
          >
            <FolderOpen className="w-3.5 h-3.5 text-violet-400" />
            <span className="hidden sm:inline">Treatises</span>
          </button>
        )}

        {/* Nihiltheism Philosophical Agents Button */}
        {onOpenAgentsModal && (
          <button
            onClick={onOpenAgentsModal}
            className="px-2.5 py-1.5 rounded-lg border bg-amber-950/40 border-amber-500/40 hover:border-amber-400 text-amber-200 flex items-center gap-1.5 transition-all cursor-pointer font-mono text-[11px] font-semibold shadow-sm hover:bg-amber-900/40"
            title="Open Nihiltheism Philosophical Agents (Hermeneutics, Anti-Reification Audit, Aporia Synthesis)"
          >
            <Brain className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">AI Agents</span>
          </button>
        )}

        {/* InfraNodus Statements Drawer Button */}
        {onOpenStatementsDrawer && (
          <button
            onClick={onOpenStatementsDrawer}
            className="px-2.5 py-1.5 rounded-lg border bg-neutral-900 border-cyan-500/30 hover:border-cyan-500/60 text-cyan-300 flex items-center gap-1.5 transition-all cursor-pointer font-mono text-[11px] font-bold shadow-sm"
            title="Open InfraNodus Statements & Data Feed"
          >
            <FileText className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Statements</span>
            <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-1.5 py-0.2 rounded-full text-[10px]">
              {statementCount}
            </span>
          </button>
        )}

        {/* Toggle Inspector Right Sidebar Button */}
        <button
          onClick={onToggleRightSidebar}
          className={`px-2.5 py-1.5 rounded-lg border flex items-center gap-1.5 transition-all cursor-pointer font-mono text-[11px] ${
            isRightSidebarOpen
              ? 'bg-neutral-850 border-neutral-700 text-white shadow-sm'
              : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-cyan-300'
          }`}
          title={isRightSidebarOpen ? "Hide Inspector Panel" : "Show Inspector Panel"}
        >
          <PanelRight className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline font-bold">Inspector</span>
        </button>

        {/* Duplicate label badge */}
        <button
          onClick={onOpenDuplicateDrawer}
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 hover:border-amber-500/40 rounded-lg text-amber-400/90 transition-all cursor-pointer"
          title="Inspect 102 repeated label groups"
        >
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          <span>{summary.duplicateLabelCount} Dups</span>
        </button>

        {/* Total Nodes & Edges Pill */}
        <div className="hidden xl:flex items-center gap-2 bg-neutral-900/60 border border-neutral-850 px-2.5 py-1 rounded-lg text-neutral-400">
          <span><strong className="text-neutral-200">{summary.totalNodes.toLocaleString()}</strong> nodes</span>
          <span className="text-neutral-600">|</span>
          <span><strong className="text-neutral-200">{summary.totalEdges.toLocaleString()}</strong> links</span>
        </div>

        {/* Saved Views Menu Button */}
        <button
          onClick={onOpenSavedViews}
          className="p-1.5 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 rounded-lg text-neutral-300 hover:text-white transition-all cursor-pointer flex items-center gap-1"
          title="Saved Views & Presets"
        >
          <Bookmark className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">Saved Views</span>
        </button>

        {/* Reset View Button */}
        <button
          onClick={onResetView}
          className="p-1.5 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 rounded-lg text-neutral-400 hover:text-neutral-200 transition-all cursor-pointer"
          title="Reset Pan, Zoom, and Filters"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>

        {/* Keyboard Shortcuts Help Button */}
        <button
          onClick={onOpenHelpModal}
          className="p-1.5 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 rounded-lg text-neutral-400 hover:text-neutral-200 transition-all cursor-pointer"
          title="Graph Viewer Specification & Keyboard Shortcuts"
        >
          <HelpCircle className="w-3.5 h-3.5 text-neutral-400" />
        </button>
      </div>

    </header>
  );
};
