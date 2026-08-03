import React, { useState, useMemo, useCallback } from 'react';
import {
  Filter,
  Palette,
  RotateCcw,
  Search
} from 'lucide-react';
import {
  GraphNode,
  GraphEdge,
  NODE_COLORS,
  getFullKnowledgeGraphDataset
} from '../data/knowledgeGraphDataset';
import { GraphCanvas, NodeStylingOptions } from './graph/GraphCanvas';

export interface NodeFilterOptions {
  showConcepts: boolean;
  showThinkers: boolean;
  showDocuments: boolean;
  showDuplicateLabels: boolean;
  showLowDegree: boolean;
  minDegree: number;
  selectedStatus?: 'all' | 'active' | 'duplicates_only' | 'high_hubs';
}

export interface KnowledgeGraphProps {
  nodes?: GraphNode[];
  edges?: GraphEdge[];
  selectedNodeId?: string | null;
  hoveredNodeId?: string | null;
  onSelectNode?: (nodeId: string | null) => void;
  onHoverNode?: (nodeId: string | null) => void;
  width?: number;
  height?: number;
  className?: string;
  initialFilters?: Partial<NodeFilterOptions>;
  initialStyling?: Partial<NodeStylingOptions>;
}

export const KnowledgeGraph: React.FC<KnowledgeGraphProps> = ({
  nodes: customNodes,
  edges: customEdges,
  selectedNodeId: externalSelectedNodeId,
  hoveredNodeId: externalHoveredNodeId,
  onSelectNode: externalOnSelectNode,
  onHoverNode: externalOnHoverNode,
  className = '',
  initialFilters,
  initialStyling
}) => {
  // Load default dataset if custom nodes/edges aren't supplied
  const defaultDataset = useMemo(() => getFullKnowledgeGraphDataset(), []);
  const rawNodes = customNodes || defaultDataset.nodes;
  const rawEdges = customEdges || defaultDataset.edges;

  // Internal selection/hover state if not controlled externally
  const [internalSelectedId, setInternalSelectedId] = useState<string | null>(null);
  const [internalHoveredId, setInternalHoveredId] = useState<string | null>(null);

  const selectedNodeId = externalSelectedNodeId !== undefined ? externalSelectedNodeId : internalSelectedId;
  const hoveredNodeId = externalHoveredNodeId !== undefined ? externalHoveredNodeId : internalHoveredId;

  const handleSelectNode = useCallback((id: string | null) => {
    if (externalOnSelectNode) externalOnSelectNode(id);
    else setInternalSelectedId(id);
  }, [externalOnSelectNode]);

  const handleHoverNode = useCallback((id: string | null) => {
    if (externalOnHoverNode) externalOnHoverNode(id);
    else setInternalHoveredId(id);
  }, [externalOnHoverNode]);

  // 1. Filter UI State (Node Types & Status)
  const [filters, setFilters] = useState<NodeFilterOptions>({
    showConcepts: initialFilters?.showConcepts ?? true,
    showThinkers: initialFilters?.showThinkers ?? true,
    showDocuments: initialFilters?.showDocuments ?? true,
    showDuplicateLabels: initialFilters?.showDuplicateLabels ?? false,
    showLowDegree: initialFilters?.showLowDegree ?? true,
    minDegree: initialFilters?.minDegree ?? 0,
    selectedStatus: initialFilters?.selectedStatus ?? 'all'
  });

  // 2. Styling Options State (Border, Glow, Fill by Type)
  const [stylingOptions, setStylingOptions] = useState<NodeStylingOptions>({
    borderStyle: initialStyling?.borderStyle ?? 'type_color',
    nodeFillStyle: initialStyling?.nodeFillStyle ?? 'filled',
    showGlow: initialStyling?.showGlow ?? true
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [isStyleMenuOpen, setIsStyleMenuOpen] = useState(false);

  // 3. Filter-Aware Graph Layout Logic
  // Filter nodes according to type & status selections
  const visibleNodes = useMemo(() => {
    return rawNodes.filter(node => {
      // Type Filters
      if (node.type === 'concept' && !filters.showConcepts) return false;
      if (node.type === 'thinker' && !filters.showThinkers) return false;
      if (node.type === 'document' && !filters.showDocuments) return false;

      // Status Filters
      if (filters.showDuplicateLabels && !node.isDuplicateLabel) return false;
      if (!filters.showLowDegree && node.degree < 3) return false;
      if (node.degree < filters.minDegree) return false;

      if (filters.selectedStatus === 'duplicates_only' && !node.isDuplicateLabel) return false;
      if (filters.selectedStatus === 'high_hubs' && node.degree < 8) return false;

      return true;
    });
  }, [rawNodes, filters]);

  // Filter edges so that only edges connecting two visible nodes remain
  const visibleEdges = useMemo(() => {
    const visibleNodeIds = new Set(visibleNodes.map(n => n.id));
    return rawEdges.filter(edge => visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target));
  }, [rawEdges, visibleNodes]);

  const resetFilters = () => {
    setFilters({
      showConcepts: true,
      showThinkers: true,
      showDocuments: true,
      showDuplicateLabels: false,
      showLowDegree: true,
      minDegree: 0,
      selectedStatus: 'all'
    });
  };

  return (
    <div className={`relative w-full h-full flex flex-col bg-neutral-950 text-neutral-200 overflow-hidden font-sans ${className}`}>
      
      {/* Top Header Controls (Filters, Styling Options, Search) */}
      <div className="z-20 px-4 py-2 bg-neutral-900/90 border-b border-neutral-850 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 text-xs">
        
        {/* Filter Toggle Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setIsFilterMenuOpen(!isFilterMenuOpen); setIsStyleMenuOpen(false); }}
            className={`px-3 py-1.5 rounded-xl border font-mono font-bold flex items-center gap-2 transition-all cursor-pointer ${
              isFilterMenuOpen
                ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-lg'
                : 'bg-neutral-850 border-neutral-750 text-neutral-300 hover:text-white'
            }`}
          >
            <Filter className="w-3.5 h-3.5 text-cyan-400" />
            <span>Filter Nodes ({visibleNodes.length}/{rawNodes.length})</span>
          </button>

          <button
            onClick={() => { setIsStyleMenuOpen(!isStyleMenuOpen); setIsFilterMenuOpen(false); }}
            className={`px-3 py-1.5 rounded-xl border font-mono font-bold flex items-center gap-2 transition-all cursor-pointer ${
              isStyleMenuOpen
                ? 'bg-purple-500/20 border-purple-500 text-purple-300 shadow-lg'
                : 'bg-neutral-850 border-neutral-750 text-neutral-300 hover:text-white'
            }`}
          >
            <Palette className="w-3.5 h-3.5 text-purple-400" />
            <span>Node Styling Options</span>
          </button>
        </div>

        {/* Quick Type Chips Indicator */}
        <div className="hidden md:flex items-center gap-2 font-mono text-[11px]">
          {Object.entries(NODE_COLORS).slice(0, 3).map(([typeKey, cfg]) => {
            const isTypeActive =
              (typeKey === 'concept' && filters.showConcepts) ||
              (typeKey === 'thinker' && filters.showThinkers) ||
              (typeKey === 'document' && filters.showDocuments);

            return (
              <button
                key={typeKey}
                onClick={() => {
                  if (typeKey === 'concept') setFilters(f => ({ ...f, showConcepts: !f.showConcepts }));
                  if (typeKey === 'thinker') setFilters(f => ({ ...f, showThinkers: !f.showThinkers }));
                  if (typeKey === 'document') setFilters(f => ({ ...f, showDocuments: !f.showDocuments }));
                }}
                className={`px-2.5 py-1 rounded-lg border font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isTypeActive ? 'opacity-100 border-neutral-700' : 'opacity-40 border-transparent bg-neutral-900 line-through'
                }`}
                style={{ backgroundColor: cfg.bg, color: cfg.text, borderColor: isTypeActive ? cfg.border : 'transparent' }}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cfg.fill }} />
                <span className="capitalize">{cfg.label}s</span>
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="relative flex items-center w-48 sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 text-neutral-500 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search nodes..."
            className="w-full pl-8 pr-3 py-1 bg-neutral-950 border border-neutral-800 rounded-lg text-xs font-mono text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-cyan-500/60"
          />
        </div>
      </div>

      {/* Floating Filter Menu Panel */}
      {isFilterMenuOpen && (
        <div className="absolute top-12 left-4 z-30 w-72 bg-neutral-900/95 border border-cyan-500/40 rounded-2xl p-4 shadow-2xl backdrop-blur-xl font-mono text-xs flex flex-col gap-3 animate-fade-in">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
            <span className="font-bold text-cyan-400 flex items-center gap-1.5">
              <Filter className="w-4 h-4" /> Node Type & Status Filters
            </span>
            <button onClick={resetFilters} className="text-[10px] text-neutral-400 hover:text-cyan-300 flex items-center gap-1">
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          </div>

          {/* Node Types */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] text-neutral-400 font-bold">Node Types</span>
            <label className="flex items-center justify-between p-1.5 rounded-lg bg-neutral-950/60 border border-neutral-850 cursor-pointer hover:bg-neutral-800/40">
              <span className="flex items-center gap-2 text-cyan-300">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" /> Concept Nodes
              </span>
              <input
                type="checkbox"
                checked={filters.showConcepts}
                onChange={(e) => setFilters({ ...filters, showConcepts: e.target.checked })}
                className="accent-cyan-500 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-1.5 rounded-lg bg-neutral-950/60 border border-neutral-850 cursor-pointer hover:bg-neutral-800/40">
              <span className="flex items-center gap-2 text-purple-300">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-400" /> Thinker Nodes
              </span>
              <input
                type="checkbox"
                checked={filters.showThinkers}
                onChange={(e) => setFilters({ ...filters, showThinkers: e.target.checked })}
                className="accent-purple-500 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-1.5 rounded-lg bg-neutral-950/60 border border-neutral-850 cursor-pointer hover:bg-neutral-800/40">
              <span className="flex items-center gap-2 text-amber-300">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Document Nodes
              </span>
              <input
                type="checkbox"
                checked={filters.showDocuments}
                onChange={(e) => setFilters({ ...filters, showDocuments: e.target.checked })}
                className="accent-amber-500 cursor-pointer"
              />
            </label>
          </div>

          {/* Status Filters */}
          <div className="flex flex-col gap-1.5 pt-1 border-t border-neutral-850">
            <span className="text-[11px] text-neutral-400 font-bold">Node Status</span>
            <label className="flex items-center justify-between p-1.5 rounded-lg bg-neutral-950/60 border border-neutral-850 cursor-pointer hover:bg-neutral-800/40">
              <span className="text-amber-400">Duplicate Labels Only</span>
              <input
                type="checkbox"
                checked={filters.showDuplicateLabels}
                onChange={(e) => setFilters({ ...filters, showDuplicateLabels: e.target.checked })}
                className="accent-amber-500 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-1.5 rounded-lg bg-neutral-950/60 border border-neutral-850 cursor-pointer hover:bg-neutral-800/40">
              <span className="text-neutral-300">Minimum Connections ({filters.minDegree})</span>
              <input
                type="range"
                min={0}
                max={15}
                value={filters.minDegree}
                onChange={(e) => setFilters({ ...filters, minDegree: Number(e.target.value) })}
                className="w-20 accent-cyan-500 cursor-pointer"
              />
            </label>
          </div>
        </div>
      )}

      {/* Floating Node Styling Options Panel */}
      {isStyleMenuOpen && (
        <div className="absolute top-12 left-44 z-30 w-72 bg-neutral-900/95 border border-purple-500/40 rounded-2xl p-4 shadow-2xl backdrop-blur-xl font-mono text-xs flex flex-col gap-3 animate-fade-in">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
            <span className="font-bold text-purple-400 flex items-center gap-1.5">
              <Palette className="w-4 h-4" /> Type-Based Node Styling
            </span>
          </div>

          {/* Border Style Option */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] text-neutral-400 font-bold">Border Distinction</span>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => setStylingOptions(s => ({ ...s, borderStyle: 'type_color' }))}
                className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${
                  stylingOptions.borderStyle === 'type_color'
                    ? 'bg-purple-500/20 border-purple-400 text-purple-200 font-bold'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-400'
                }`}
              >
                Type Colored
              </button>
              <button
                onClick={() => setStylingOptions(s => ({ ...s, borderStyle: 'solid' }))}
                className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${
                  stylingOptions.borderStyle === 'solid'
                    ? 'bg-purple-500/20 border-purple-400 text-purple-200 font-bold'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-400'
                }`}
              >
                Dark Outline
              </button>
            </div>
          </div>

          {/* Radial Glow Halo Option */}
          <div className="flex flex-col gap-1.5 pt-1 border-t border-neutral-850">
            <label className="flex items-center justify-between p-2 rounded-lg bg-neutral-950 border border-neutral-850 cursor-pointer">
              <span className="text-purple-300">Show Type Radial Glow</span>
              <input
                type="checkbox"
                checked={stylingOptions.showGlow}
                onChange={(e) => setStylingOptions(s => ({ ...s, showGlow: e.target.checked }))}
                className="accent-purple-500 cursor-pointer"
              />
            </label>
          </div>
        </div>
      )}

      {/* Main Graph Canvas Canvas Area */}
      <div className="flex-1 w-full h-full relative">
        <GraphCanvas
          nodes={visibleNodes}
          edges={visibleEdges}
          selectedNodeId={selectedNodeId}
          hoveredNodeId={hoveredNodeId}
          onSelectNode={handleSelectNode}
          onHoverNode={handleHoverNode}
          activeLens="source_clusters"
          searchQuery={searchQuery}
          stylingOptions={stylingOptions}
        />
      </div>
    </div>
  );
};
