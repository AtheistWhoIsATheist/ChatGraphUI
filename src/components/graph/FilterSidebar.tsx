import React from 'react';
import { Filter, RotateCcw, ShieldAlert, CheckSquare, Square, ChevronRight } from 'lucide-react';
import { SOURCE_DOCUMENTS, GraphDataset } from '../../data/knowledgeGraphDataset';

export interface FilterState {
  showConcepts: boolean;
  showThinkers: boolean;
  showDocuments: boolean;
  showCoOccur: boolean;
  showVoidResonance: boolean;
  showPrimarySource: boolean;
  selectedSources: Set<string>;
  minDegree: number;
  selectedWarrants: Set<string>;
  onlyDuplicateLabels: boolean;
  onlyLowDegree: boolean;
}

interface FilterSidebarProps {
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  summary: GraphDataset['summary'];
  onResetFilters: () => void;
  onOpenDuplicateDrawer: () => void;
  onCloseSidebar?: () => void;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  onFilterChange,
  summary,
  onResetFilters,
  onOpenDuplicateDrawer,
  onCloseSidebar
}) => {
  const toggleSource = (sourceTitle: string) => {
    const next = new Set(filters.selectedSources);
    if (next.has(sourceTitle)) {
      next.delete(sourceTitle);
    } else {
      next.add(sourceTitle);
    }
    onFilterChange({ ...filters, selectedSources: next });
  };

  const selectAllSources = () => {
    onFilterChange({ ...filters, selectedSources: new Set(SOURCE_DOCUMENTS.map(d => d.title)) });
  };

  const clearAllSources = () => {
    onFilterChange({ ...filters, selectedSources: new Set() });
  };

  const toggleWarrant = (warrant: string) => {
    const next = new Set(filters.selectedWarrants);
    if (next.has(warrant)) {
      next.delete(warrant);
    } else {
      next.add(warrant);
    }
    onFilterChange({ ...filters, selectedWarrants: next });
  };

  return (
    <aside className="w-80 bg-neutral-950 border-r border-neutral-900 flex flex-col h-full select-none overflow-y-auto text-xs">
      
      {/* Sidebar Header */}
      <div className="p-4 border-b border-neutral-900 flex items-center justify-between bg-neutral-900/40">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-amber-400" />
          <h2 className="font-display text-xs uppercase tracking-widest text-neutral-200 font-bold">
            Evidence Filters
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onResetFilters}
            className="flex items-center gap-1 text-[11px] font-mono text-neutral-400 hover:text-white transition-all cursor-pointer"
            title="Reset all filters to default"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
          {onCloseSidebar && (
            <button
              onClick={onCloseSidebar}
              className="p-1 rounded text-neutral-500 hover:text-neutral-200 hover:bg-neutral-900 transition-all cursor-pointer"
            >
              &times;
            </button>
          )}
        </div>
      </div>

      <div className="p-4 space-y-6 flex-1">
        
        {/* Section 1: Entity Types */}
        <div>
          <h3 className="font-mono text-[10px] uppercase tracking-wider text-neutral-500 mb-2.5 font-bold flex items-center gap-1.5">
            <span>Entity Types</span>
            <span className="text-neutral-600 font-normal">({summary.totalNodes} total)</span>
          </h3>

          <div className="space-y-1.5 font-mono text-xs">
            {/* Concept Nodes */}
            <button
              onClick={() => onFilterChange({ ...filters, showConcepts: !filters.showConcepts })}
              className={`w-full flex items-center justify-between p-2 rounded-lg border transition-all cursor-pointer ${
                filters.showConcepts
                  ? 'bg-cyan-950/40 border-cyan-500/40 text-cyan-200'
                  : 'bg-neutral-900/40 border-neutral-850 text-neutral-500 hover:text-neutral-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 border border-cyan-200" />
                <span className="font-medium">Concepts</span>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded bg-neutral-900 text-neutral-400 border border-neutral-800">
                {summary.conceptCount}
              </span>
            </button>

            {/* Thinker Nodes */}
            <button
              onClick={() => onFilterChange({ ...filters, showThinkers: !filters.showThinkers })}
              className={`w-full flex items-center justify-between p-2 rounded-lg border transition-all cursor-pointer ${
                filters.showThinkers
                  ? 'bg-purple-950/40 border-purple-500/40 text-purple-200'
                  : 'bg-neutral-900/40 border-neutral-850 text-neutral-500 hover:text-neutral-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rotate-45 bg-purple-400 border border-purple-200" />
                <span className="font-medium">Thinkers</span>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded bg-neutral-900 text-neutral-400 border border-neutral-800">
                {summary.thinkerCount}
              </span>
            </button>

            {/* Document Nodes */}
            <button
              onClick={() => onFilterChange({ ...filters, showDocuments: !filters.showDocuments })}
              className={`w-full flex items-center justify-between p-2 rounded-lg border transition-all cursor-pointer ${
                filters.showDocuments
                  ? 'bg-amber-950/40 border-amber-500/40 text-amber-200'
                  : 'bg-neutral-900/40 border-neutral-850 text-neutral-500 hover:text-neutral-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-sm bg-amber-400 border border-amber-200" />
                <span className="font-medium">Source Documents</span>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded bg-neutral-900 text-neutral-400 border border-neutral-800">
                {summary.documentCount}
              </span>
            </button>
          </div>
        </div>

        {/* Section 2: Relation Types */}
        <div>
          <h3 className="font-mono text-[10px] uppercase tracking-wider text-neutral-500 mb-2.5 font-bold flex items-center gap-1.5">
            <span>Relation Types</span>
            <span className="text-neutral-600 font-normal">({summary.totalEdges} total)</span>
          </h3>

          <div className="space-y-1.5 font-mono text-xs">
            {/* CO_OCCUR */}
            <button
              onClick={() => onFilterChange({ ...filters, showCoOccur: !filters.showCoOccur })}
              className={`w-full flex items-center justify-between p-2 rounded-lg border transition-all cursor-pointer ${
                filters.showCoOccur
                  ? 'bg-neutral-850 border-neutral-700 text-neutral-200'
                  : 'bg-neutral-900/40 border-neutral-850 text-neutral-500 hover:text-neutral-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="w-3 h-0.5 bg-neutral-400 border-dashed" />
                <span>CO_OCCUR</span>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded bg-neutral-900 text-neutral-400 border border-neutral-800">
                {summary.coOccurCount}
              </span>
            </button>

            {/* VOID_RESONANCE */}
            <button
              onClick={() => onFilterChange({ ...filters, showVoidResonance: !filters.showVoidResonance })}
              className={`w-full flex items-center justify-between p-2 rounded-lg border transition-all cursor-pointer ${
                filters.showVoidResonance
                  ? 'bg-cyan-950/40 border-cyan-500/40 text-cyan-200'
                  : 'bg-neutral-900/40 border-neutral-850 text-neutral-500 hover:text-neutral-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="w-3 h-1 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(56,189,248,0.5)]" />
                <span>VOID_RESONANCE</span>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded bg-neutral-900 text-neutral-400 border border-neutral-800">
                {summary.voidResonanceCount}
              </span>
            </button>

            {/* PRIMARY_SOURCE_OF */}
            <button
              onClick={() => onFilterChange({ ...filters, showPrimarySource: !filters.showPrimarySource })}
              className={`w-full flex items-center justify-between p-2 rounded-lg border transition-all cursor-pointer ${
                filters.showPrimarySource
                  ? 'bg-amber-950/40 border-amber-500/40 text-amber-200'
                  : 'bg-neutral-900/40 border-neutral-850 text-neutral-500 hover:text-neutral-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="w-3 h-1 bg-amber-400 rounded" />
                <span>PRIMARY_SOURCE_OF</span>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded bg-neutral-900 text-neutral-400 border border-neutral-800">
                {summary.primarySourceCount}
              </span>
            </button>
          </div>
        </div>

        {/* Section 3: Audit Presets & Quality Controls */}
        <div>
          <h3 className="font-mono text-[10px] uppercase tracking-wider text-amber-400/90 mb-2.5 font-bold flex items-center justify-between">
            <span>Audit & Quality Controls</span>
          </h3>

          <div className="space-y-2 font-mono text-xs">
            {/* Repeated Labels Audit Toggle */}
            <button
              onClick={() => onFilterChange({ ...filters, onlyDuplicateLabels: !filters.onlyDuplicateLabels })}
              className={`w-full flex items-center justify-between p-2.5 rounded-lg border transition-all cursor-pointer ${
                filters.onlyDuplicateLabels
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-semibold shadow-sm'
                  : 'bg-neutral-900/60 border-neutral-800 text-neutral-300 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <span>Repeated Labels Only</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 bg-amber-500/30 text-amber-300 rounded font-bold">
                102 Groups
              </span>
            </button>

            {/* Open Full Duplicate Manager Drawer */}
            <button
              onClick={onOpenDuplicateDrawer}
              className="w-full text-left p-2 rounded-lg bg-neutral-900/40 border border-neutral-850 hover:border-neutral-700 text-neutral-400 hover:text-neutral-200 flex items-center justify-between transition-all cursor-pointer"
            >
              <span className="text-[11px]">Inspect Duplicate Label Drawer...</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            {/* Low Degree Nodes Filter */}
            <button
              onClick={() => onFilterChange({ ...filters, onlyLowDegree: !filters.onlyLowDegree })}
              className={`w-full flex items-center justify-between p-2 rounded-lg border transition-all cursor-pointer ${
                filters.onlyLowDegree
                  ? 'bg-red-950/40 border-red-500/40 text-red-200'
                  : 'bg-neutral-900/40 border-neutral-850 text-neutral-500 hover:text-neutral-300'
              }`}
            >
              <span>Low-Degree Leaves (degree ≤ 1)</span>
              <span className="text-[11px] px-2 py-0.5 rounded bg-neutral-900 text-neutral-400 border border-neutral-800">
                {summary.lowDegreeCount}
              </span>
            </button>
          </div>
        </div>

        {/* Section 4: Min Degree Threshold Slider */}
        <div>
          <div className="flex items-center justify-between font-mono text-[10px] uppercase text-neutral-500 mb-2">
            <span className="font-bold">Min Degree Threshold</span>
            <span className="text-cyan-400 font-bold text-xs">{filters.minDegree}</span>
          </div>
          <input
            type="range"
            min={0}
            max={25}
            value={filters.minDegree}
            onChange={(e) => onFilterChange({ ...filters, minDegree: parseInt(e.target.value) || 0 })}
            className="w-full accent-cyan-400 bg-neutral-900 h-1.5 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] font-mono text-neutral-600 mt-1">
            <span>0 (All Nodes)</span>
            <span>12 (Hubs)</span>
            <span>25+ (Major)</span>
          </div>
        </div>

        {/* Section 5: Source Document Provenance Filter */}
        <div>
          <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-neutral-500 mb-2.5 font-bold">
            <span>Source Document Provenance</span>
            <div className="flex gap-2">
              <button onClick={selectAllSources} className="text-cyan-400 hover:underline">All</button>
              <span className="text-neutral-700">|</span>
              <button onClick={clearAllSources} className="text-neutral-500 hover:underline">None</button>
            </div>
          </div>

          <div className="max-h-48 overflow-y-auto space-y-1 pr-1 font-mono text-[11px]">
            {SOURCE_DOCUMENTS.map((doc) => {
              const isSelected = filters.selectedSources.has(doc.title);
              return (
                <button
                  key={doc.id}
                  onClick={() => toggleSource(doc.title)}
                  className={`w-full text-left p-1.5 rounded flex items-center justify-between transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-neutral-850 text-neutral-200 border border-neutral-750'
                      : 'text-neutral-600 hover:text-neutral-400 hover:bg-neutral-900/40'
                  }`}
                >
                  <span className="truncate pr-2">{doc.title}</span>
                  {isSelected ? (
                    <CheckSquare className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  ) : (
                    <Square className="w-3.5 h-3.5 text-neutral-700 flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 6: Warrant Level Filter */}
        <div>
          <h3 className="font-mono text-[10px] uppercase tracking-wider text-neutral-500 mb-2 font-bold">
            Warrant Level
          </h3>
          <div className="flex flex-wrap gap-1.5 font-mono text-[10px]">
            {['TEXTUAL', 'INTERPRETIVE', 'COMPARATIVE', 'SPECULATIVE', 'META'].map(warrant => {
              const isSelected = filters.selectedWarrants.has(warrant);
              return (
                <button
                  key={warrant}
                  onClick={() => toggleWarrant(warrant)}
                  className={`px-2 py-1 rounded border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-950/60 border-cyan-500/50 text-cyan-300 font-bold'
                      : 'bg-neutral-900 border-neutral-800 text-neutral-500 hover:text-neutral-300'
                  }`}
                >
                  {warrant}
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </aside>
  );
};
