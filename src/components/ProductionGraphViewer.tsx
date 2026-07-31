import React, { useState, useMemo, useEffect } from 'react';
import { getFullKnowledgeGraphDataset, GraphDataset, GraphNode, SOURCE_DOCUMENTS } from '../data/knowledgeGraphDataset';
import { TopSearchBar } from './graph/TopSearchBar';
import { FilterSidebar, FilterState } from './graph/FilterSidebar';
import { GraphCanvas } from './graph/GraphCanvas';
import { NodeInspector } from './graph/NodeInspector';
import { DuplicateGroupDrawer } from './graph/DuplicateGroupDrawer';
import { PathTracePanel } from './graph/PathTracePanel';
import { SavedViewsMenu, SavedViewConfig } from './graph/SavedViewsMenu';
import { MiniMap } from './graph/MiniMap';
import { X, ShieldCheck } from 'lucide-react';

interface ProductionGraphViewerProps {
  customNodes?: any[];
  customLinks?: any[];
  onNavigateToTab?: (tab: string) => void;
}

const DEFAULT_FILTERS: FilterState = {
  showConcepts: true,
  showThinkers: true,
  showDocuments: true,
  showCoOccur: true,
  showVoidResonance: true,
  showPrimarySource: true,
  selectedSources: new Set(SOURCE_DOCUMENTS.map(d => d.title)),
  minDegree: 0,
  selectedWarrants: new Set(['TEXTUAL', 'INTERPRETIVE', 'COMPARATIVE', 'SPECULATIVE', 'META']),
  onlyDuplicateLabels: false,
  onlyLowDegree: false,
};

export const ProductionGraphViewer: React.FC<ProductionGraphViewerProps> = ({}) => {
  // Load primary canonical knowledge graph dataset (1,155 nodes, 9,888 links)
  const fullDataset: GraphDataset = useMemo(() => getFullKnowledgeGraphDataset(), []);

  // Primary state variables
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLens, setActiveLens] = useState<'source_clusters' | 'concept_hubs' | 'thinker_network' | 'audit_mode' | 'path_mode'>('source_clusters');
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

  // Selection & Inspector state
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('CONCEPT-1');
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [pinnedNodeIds, setPinnedNodeIds] = useState<Set<string>>(new Set());
  const [compareSet, setCompareSet] = useState<GraphNode[]>([]);

  // UI Overlays
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDuplicateDrawerOpen, setIsDuplicateDrawerOpen] = useState(false);
  const [isSavedViewsOpen, setIsSavedViewsOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  // Path Trace State
  const [highlightedPathNodeIds, setHighlightedPathNodeIds] = useState<Set<string>>(new Set());
  const [highlightedPathEdgeIds, setHighlightedPathEdgeIds] = useState<Set<string>>(new Set());

  // Filtered Nodes Calculation
  const filteredNodes = useMemo(() => {
    return fullDataset.nodes.filter((node: GraphNode) => {
      // Entity Type Filter
      if (node.type === 'concept' && !filters.showConcepts) return false;
      if (node.type === 'thinker' && !filters.showThinkers) return false;
      if (node.type === 'document' && !filters.showDocuments) return false;

      // Source Document Filter
      if (filters.selectedSources.size > 0 && !filters.selectedSources.has(node.sourceFile)) return false;

      // Degree Filter
      if (node.degree < filters.minDegree) return false;

      // Warrant Level Filter
      if (filters.selectedWarrants.size > 0 && !filters.selectedWarrants.has(node.warrantLevel)) return false;

      // Audit Mode Filters
      if (filters.onlyDuplicateLabels && !node.isDuplicateLabel) return false;
      if (filters.onlyLowDegree && node.degree > 1) return false;

      // Search Query Filter
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchesLabel = node.label.toLowerCase().includes(q);
        const matchesId = node.id.toLowerCase().includes(q);
        const matchesSource = node.sourceFile.toLowerCase().includes(q);
        if (!matchesLabel && !matchesId && !matchesSource) return false;
      }

      return true;
    });
  }, [fullDataset.nodes, filters, searchQuery]);

  const filteredNodeIdSet = useMemo(() => new Set(filteredNodes.map((n: GraphNode) => n.id)), [filteredNodes]);

  // Filtered Edges Calculation
  const filteredEdges = useMemo(() => {
    return fullDataset.edges.filter((edge) => {
      if (!filteredNodeIdSet.has(edge.source) || !filteredNodeIdSet.has(edge.target)) return false;

      if (edge.relation === 'CO_OCCUR' && !filters.showCoOccur) return false;
      if (edge.relation === 'VOID_RESONANCE' && !filters.showVoidResonance) return false;
      if (edge.relation === 'PRIMARY_SOURCE_OF' && !filters.showPrimarySource) return false;

      return true;
    });
  }, [fullDataset.edges, filteredNodeIdSet, filters]);

  // Active Selected Node Object
  const activeNode = useMemo(() => {
    return fullDataset.nodes.find((n: GraphNode) => n.id === selectedNodeId) || null;
  }, [fullDataset.nodes, selectedNodeId]);

  // Active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (!filters.showConcepts || !filters.showThinkers || !filters.showDocuments) count++;
    if (!filters.showCoOccur || !filters.showVoidResonance || !filters.showPrimarySource) count++;
    if (filters.selectedSources.size < SOURCE_DOCUMENTS.length) count++;
    if (filters.minDegree > 0) count++;
    if (filters.selectedWarrants.size < 5) count++;
    if (filters.onlyDuplicateLabels) count++;
    if (filters.onlyLowDegree) count++;
    return count;
  }, [filters]);

  // Toggle Node Pinning
  const handleTogglePin = (nodeId: string) => {
    const next = new Set(pinnedNodeIds);
    if (next.has(nodeId)) {
      next.delete(nodeId);
    } else {
      next.add(nodeId);
    }
    setPinnedNodeIds(next);
  };

  // Add/Remove from Compare Set
  const handleAddToCompare = (node: GraphNode) => {
    if (!compareSet.some(c => c.id === node.id)) {
      setCompareSet([...compareSet, node]);
    }
  };

  const handleRemoveFromCompare = (nodeId: string) => {
    setCompareSet(compareSet.filter(c => c.id !== nodeId));
  };

  // Load Saved View Configuration
  const handleLoadSavedView = (view: SavedViewConfig) => {
    setActiveLens(view.lens);
    setFilters(view.filters);
    setPinnedNodeIds(new Set(view.pinnedNodeIds));
  };

  // Keyboard Shortcuts Handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
        if (searchInput) searchInput.focus();
      } else if (e.key === 'Escape') {
        setSelectedNodeId(null);
        setIsDuplicateDrawerOpen(false);
        setIsSavedViewsOpen(false);
        setIsHelpModalOpen(false);
        setHighlightedPathNodeIds(new Set());
        setHighlightedPathEdgeIds(new Set());
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="h-full flex flex-col bg-neutral-950 text-neutral-100 overflow-hidden font-sans select-none">
      
      {/* 1. Top Bar */}
      <TopSearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeLens={activeLens}
        onLensChange={(lens: 'source_clusters' | 'concept_hubs' | 'thinker_network' | 'audit_mode' | 'path_mode') => {
          setActiveLens(lens);
          if (lens === 'audit_mode') {
            setFilters(prev => ({ ...prev, onlyDuplicateLabels: true }));
          }
        }}
        summary={fullDataset.summary}
        activeFilterCount={activeFilterCount}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onOpenSavedViews={() => setIsSavedViewsOpen(true)}
        onOpenDuplicateDrawer={() => setIsDuplicateDrawerOpen(true)}
        onOpenHelpModal={() => setIsHelpModalOpen(true)}
        onResetView={() => {
          setFilters(DEFAULT_FILTERS);
          setSearchQuery('');
          setActiveLens('source_clusters');
          setSelectedNodeId('CONCEPT-1');
          setHighlightedPathNodeIds(new Set());
          setHighlightedPathEdgeIds(new Set());
        }}
        isSidebarOpen={isSidebarOpen}
      />

      {/* Path Trace Sub-Bar (when Path Mode lens is active) */}
      {activeLens === 'path_mode' && (
        <PathTracePanel
          nodes={filteredNodes}
          edges={filteredEdges}
          selectedNodeId={selectedNodeId}
          onSelectNode={setSelectedNodeId}
          onHighlightPath={(nodeIds: string[], edgeIds: string[]) => {
            setHighlightedPathNodeIds(new Set(nodeIds));
            setHighlightedPathEdgeIds(new Set(edgeIds));
          }}
          onClearPath={() => {
            setHighlightedPathNodeIds(new Set());
            setHighlightedPathEdgeIds(new Set());
          }}
        />
      )}

      {/* 2. Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Left Filter Sidebar */}
        {isSidebarOpen && (
          <FilterSidebar
            filters={filters}
            onFilterChange={setFilters}
            summary={fullDataset.summary}
            onResetFilters={() => setFilters(DEFAULT_FILTERS)}
            onOpenDuplicateDrawer={() => setIsDuplicateDrawerOpen(true)}
            onCloseSidebar={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Center Main Graph Canvas */}
        <div className="flex-1 h-full relative">
          <GraphCanvas
            nodes={filteredNodes}
            edges={filteredEdges}
            selectedNodeId={selectedNodeId}
            hoveredNodeId={hoveredNodeId}
            onSelectNode={setSelectedNodeId}
            onHoverNode={setHoveredNodeId}
            activeLens={activeLens}
            highlightedPathNodeIds={highlightedPathNodeIds}
            highlightedPathEdgeIds={highlightedPathEdgeIds}
            searchQuery={searchQuery}
          />

          {/* Bottom Left MiniMap */}
          <MiniMap
            nodes={filteredNodes}
            selectedNodeId={selectedNodeId}
            onSelectNode={setSelectedNodeId}
          />

          {/* Active Canvas Legend Bar */}
          <div className="absolute top-3 left-3 bg-neutral-950/80 border border-neutral-850 backdrop-blur-md px-3 py-1.5 rounded-xl font-mono text-[10px] text-neutral-400 flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400" /> Concept
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rotate-45 bg-purple-400" /> Thinker
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-sm bg-amber-400" /> Document
            </span>
            {filters.onlyDuplicateLabels && (
              <span className="text-amber-400 font-bold border-l border-neutral-800 pl-2">
                Audit: 102 Duplicate Label Groups
              </span>
            )}
          </div>
        </div>

        {/* Right Inspector Panel */}
        <NodeInspector
          node={activeNode}
          allNodes={fullDataset.nodes}
          edges={fullDataset.edges}
          duplicateLabelMap={fullDataset.duplicateLabelMap}
          onSelectNode={setSelectedNodeId}
          isPinned={selectedNodeId ? pinnedNodeIds.has(selectedNodeId) : false}
          onTogglePin={handleTogglePin}
          onTracePathFromHere={(id: string) => {
            setActiveLens('path_mode');
            setSelectedNodeId(id);
          }}
          onAddToCompare={handleAddToCompare}
          compareSet={compareSet}
          onRemoveFromCompare={handleRemoveFromCompare}
        />

      </div>

      {/* Overlay Drawers & Modals */}
      <DuplicateGroupDrawer
        isOpen={isDuplicateDrawerOpen}
        onClose={() => setIsDuplicateDrawerOpen(false)}
        duplicateLabelMap={fullDataset.duplicateLabelMap}
        onSelectNode={(id: string) => {
          setSelectedNodeId(id);
          setIsDuplicateDrawerOpen(false);
        }}
        selectedNodeId={selectedNodeId}
      />

      <SavedViewsMenu
        isOpen={isSavedViewsOpen}
        onClose={() => setIsSavedViewsOpen(false)}
        currentLens={activeLens}
        currentFilters={filters}
        pinnedNodeIds={Array.from(pinnedNodeIds)}
        onLoadView={handleLoadSavedView}
      />

      {/* Specification & Keyboard Help Modal */}
      {isHelpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 font-mono text-xs animate-fade-in">
          <div className="w-full max-w-lg bg-neutral-950 border border-neutral-900 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-900 pb-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold">
                <ShieldCheck className="w-5 h-5" />
                <h3 className="font-display text-sm uppercase tracking-wider text-neutral-100">
                  Graph Viewer Specification & Provenance Rules
                </h3>
              </div>
              <button onClick={() => setIsHelpModalOpen(false)} className="text-neutral-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-neutral-300 text-[11px] leading-relaxed">
              <p><strong className="text-amber-400">1. Evidence First:</strong> Every node and edge retains its explicit canonical source file provenance and warrant level.</p>
              <p><strong className="text-amber-400">2. Duplicate Label Awareness:</strong> 102 labels appear more than once in the corpus. Same label does NOT mean same entity — nodes are kept distinct.</p>
              <p><strong className="text-amber-400">3. Scale & Performance:</strong> Visualizing 1,155 nodes and 9,888 relations with progressive disclosure, document cluster hulls, and Level of Detail (LOD) label suppression.</p>
            </div>

            <div className="bg-neutral-900 p-3 rounded-xl border border-neutral-850 space-y-1 text-[10px]">
              <div className="font-bold text-neutral-200">Keyboard Shortcuts:</div>
              <div>• <kbd className="bg-neutral-800 px-1 py-0.5 rounded text-cyan-400 font-bold">Cmd + K</kbd> : Global Search</div>
              <div>• <kbd className="bg-neutral-800 px-1 py-0.5 rounded text-cyan-400 font-bold">Esc</kbd> : Clear Selection / Close Overlays</div>
              <div>• <kbd className="bg-neutral-800 px-1 py-0.5 rounded text-cyan-400 font-bold">Click</kbd> : Select & Inspect Node</div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsHelpModalOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-cyan-500 text-black font-bold hover:bg-cyan-400"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
