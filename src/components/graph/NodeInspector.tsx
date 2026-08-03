import React, { useState } from 'react';
import { Copy, Check, Pin, PinOff, AlertTriangle, ArrowRight, Compass, Share2, Focus, PanelRightClose } from 'lucide-react';
import { GraphNode, GraphEdge } from '../../data/knowledgeGraphDataset';

interface NodeInspectorProps {
  node: GraphNode | null;
  allNodes: GraphNode[];
  edges: GraphEdge[];
  duplicateLabelMap: Map<string, GraphNode[]>;
  onSelectNode: (nodeId: string) => void;
  isPinned: boolean;
  onTogglePin: (nodeId: string) => void;
  onTracePathFromHere: (nodeId: string) => void;
  onAddToCompare: (node: GraphNode) => void;
  compareSet: GraphNode[];
  onRemoveFromCompare: (nodeId: string) => void;
  onClose?: () => void;
  isRelationsIsolated?: boolean;
  onToggleIsolateRelations?: () => void;
}

export const NodeInspector: React.FC<NodeInspectorProps> = ({
  node,
  allNodes,
  edges,
  duplicateLabelMap,
  onSelectNode,
  isPinned,
  onTogglePin,
  onTracePathFromHere,
  onAddToCompare,
  compareSet,
  onRemoveFromCompare,
  onClose,
  isRelationsIsolated = false,
  onToggleIsolateRelations
}) => {
  const [copiedId, setCopiedId] = useState(false);
  const [activeTab, setActiveTab] = useState<'relations' | 'provenance' | 'duplicates'>('relations');

  if (!node) {
    return (
      <aside className="w-full lg:w-96 bg-neutral-950 border-l border-neutral-900 flex flex-col items-center justify-center p-8 text-center h-full select-none">
        <div className="p-4 rounded-2xl bg-neutral-900/50 border border-neutral-850 mb-4">
          <Compass className="w-8 h-8 text-neutral-600 animate-pulse" />
        </div>
        <h3 className="font-display text-xs uppercase tracking-widest text-neutral-400 font-bold mb-1">
          No Node Selected
        </h3>
        <p className="text-[11px] font-mono text-neutral-500 max-w-xs leading-relaxed mb-4">
          Click any node on the graph canvas or search by label or ID to examine its evidence trail, connected relations, and duplicate label context.
        </p>
        <div className="bg-neutral-900/40 border border-neutral-850 p-3 rounded-xl text-[10px] font-mono text-neutral-500 text-left w-full space-y-1">
          <span className="text-neutral-400 font-bold block mb-1">Keyboard Shortcuts:</span>
          <div>• <strong className="text-neutral-300">Click</strong>: Select Node & Inspect</div>
          <div>• <strong className="text-neutral-300">Double-Click</strong>: Expand Neighborhood</div>
          <div>• <strong className="text-neutral-300">Cmd+K</strong>: Global Search</div>
          <div>• <strong className="text-neutral-300">Esc</strong>: Clear Selection</div>
        </div>
      </aside>
    );
  }

  // Copy Node ID to clipboard
  const handleCopyId = () => {
    navigator.clipboard.writeText(node.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  // Find other nodes with the exact same label
  const sameLabelNodes = (duplicateLabelMap.get(node.label) || []).filter(n => n.id !== node.id);
  const hasDuplicates = sameLabelNodes.length > 0;

  // Connected edges and neighbor nodes
  const nodeEdges = edges.filter(e => e.source === node.id || e.target === node.id);
  const coOccurEdges = nodeEdges.filter(e => e.relation === 'CO_OCCUR');
  const voidResonanceEdges = nodeEdges.filter(e => e.relation === 'VOID_RESONANCE');
  const primarySourceEdges = nodeEdges.filter(e => e.relation === 'PRIMARY_SOURCE_OF');

  const isInCompare = compareSet.some(c => c.id === node.id);

  // Type Styling
  const getTypeBadge = () => {
    switch (node.type) {
      case 'concept':
        return {
          label: 'Concept (Circle)',
          color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
          dot: 'bg-cyan-400'
        };
      case 'thinker':
        return {
          label: 'Thinker (Hexagon)',
          color: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
          dot: 'bg-purple-400'
        };
      case 'document':
        return {
          label: 'Source Document (Rectangle)',
          color: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          dot: 'bg-amber-400'
        };
    }
  };

  const typeBadge = getTypeBadge();

  return (
    <aside className="w-full lg:w-96 bg-neutral-950 border-l border-neutral-900 flex flex-col h-full overflow-y-auto select-none text-xs">
      
      {/* Inspector Header */}
      <div className="p-4 border-b border-neutral-900 bg-neutral-900/40 space-y-2">
        <div className="flex items-center justify-between">
          
          {/* Node Type Badge */}
          <div className={`px-2.5 py-0.5 rounded-full border text-[10px] font-mono font-bold flex items-center gap-1.5 ${typeBadge.color}`}>
            <span className={`w-2 h-2 rounded-full ${typeBadge.dot}`} />
            <span>{typeBadge.label}</span>
          </div>

          <div className="flex items-center gap-1">
            {/* Pin Button */}
            <button
              onClick={() => onTogglePin(node.id)}
              className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                isPinned
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                  : 'bg-neutral-900 border-neutral-800 text-neutral-500 hover:text-neutral-200'
              }`}
              title={isPinned ? 'Unpin node' : 'Pin node position'}
            >
              {isPinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
            </button>

            {/* Copy ID */}
            <button
              onClick={handleCopyId}
              className="p-1.5 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 rounded-lg text-neutral-400 hover:text-white transition-all cursor-pointer"
              title="Copy Node ID"
            >
              {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>

            {/* Isolate Node & Relations Button */}
            {onToggleIsolateRelations && (
              <button
                onClick={onToggleIsolateRelations}
                className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                  isRelationsIsolated
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-cyan-300'
                }`}
                title={isRelationsIsolated ? 'Show Full Graph' : 'Isolate Node & Relations'}
              >
                <Focus className="w-3.5 h-3.5 text-cyan-400" />
              </button>
            )}

            {onClose && (
              <button
                onClick={onClose}
                className="p-1.5 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 rounded-lg text-neutral-400 hover:text-white transition-all cursor-pointer flex items-center justify-center"
                title="Close Inspector Sidebar"
              >
                <PanelRightClose className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Node Label Title */}
        <h2 className="font-display text-base font-bold text-white tracking-wide leading-tight">
          "{node.label}"
        </h2>

        {/* Node ID (Mono) & Warrant Level */}
        <div className="flex items-center justify-between font-mono text-[11px] text-neutral-400">
          <span className="bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800 text-cyan-400 font-bold">
            ID: {node.id}
          </span>
          <span className="text-[10px] text-neutral-500">
            Warrant: <strong className="text-neutral-300">{node.warrantLevel}</strong>
          </span>
        </div>
      </div>

      {/* Duplicate-Label Alert Context Banner (CRITICAL SPEC MANDATE) */}
      {hasDuplicates && (
        <div className="bg-amber-950/30 border-b border-amber-500/40 p-3.5 space-y-2">
          <div className="flex items-center gap-2 text-amber-400 font-bold font-mono text-[11px]">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>SAME LABEL, DISTINCT NODE ({sameLabelNodes.length + 1} TOTAL)</span>
          </div>
          <p className="text-[11px] font-mono text-amber-200/80 leading-relaxed">
            This node shares the label "{node.label}" with {sameLabelNodes.length} other distinct node(s) in different source documents. Do not assume same label means same entity!
          </p>

          <div className="space-y-1 pt-1 font-mono text-[10px]">
            {sameLabelNodes.map(dup => (
              <button
                key={`dup-switch-${dup.id}`}
                onClick={() => onSelectNode(dup.id)}
                className="w-full text-left p-1.5 rounded bg-amber-900/30 border border-amber-700/40 hover:bg-amber-900/60 text-amber-200 flex items-center justify-between transition-all cursor-pointer"
              >
                <div className="truncate pr-2">
                  <strong className="text-amber-400">{dup.id}</strong> in <span>{dup.sourceFile}</span>
                </div>
                <span className="text-[9px] bg-amber-500/20 px-1.5 py-0.2 rounded text-amber-300">
                  Switch
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Provenance Quick Bar */}
      <div className="p-3 bg-neutral-900/30 border-b border-neutral-900 space-y-2 font-mono text-xs">
        <div className="flex items-center justify-between text-neutral-400 text-[11px]">
          <span>Source File:</span>
          <span className="text-neutral-200 font-bold truncate max-w-[180px]">{node.sourceFile}</span>
        </div>
        <div className="flex items-center justify-between text-neutral-400 text-[11px]">
          <span>Degree / Connections:</span>
          <span className="text-cyan-400 font-bold">{node.degree} edges</span>
        </div>
        <div className="flex items-center justify-between text-neutral-400 text-[11px]">
          <span>Confidence Score:</span>
          <span className="text-amber-400 font-bold">{Math.round(node.confidence * 100)}%</span>
        </div>
      </div>

      {/* Navigation Tabs for Inspector Details */}
      <div className="flex border-b border-neutral-900 bg-neutral-950 font-mono text-[11px]">
        <button
          onClick={() => setActiveTab('relations')}
          className={`flex-1 py-2.5 text-center font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'relations'
              ? 'border-cyan-400 text-cyan-300 bg-neutral-900/40'
              : 'border-transparent text-neutral-500 hover:text-neutral-300'
          }`}
        >
          Relations ({nodeEdges.length})
        </button>
        <button
          onClick={() => setActiveTab('provenance')}
          className={`flex-1 py-2.5 text-center font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'provenance'
              ? 'border-amber-400 text-amber-300 bg-neutral-900/40'
              : 'border-transparent text-neutral-500 hover:text-neutral-300'
          }`}
        >
          Evidence Trail
        </button>
      </div>

      {/* Tab Content */}
      <div className="p-4 space-y-4 flex-1">
        
        {/* TAB 1: Connected Relations */}
        {activeTab === 'relations' && (
          <div className="space-y-4 font-mono text-xs">
            
            {/* Primary Source Edges */}
            {primarySourceEdges.length > 0 && (
              <div className="space-y-1.5">
                <h4 className="text-[10px] uppercase text-amber-400 font-bold flex items-center gap-1">
                  <span>PRIMARY_SOURCE_OF ({primarySourceEdges.length})</span>
                </h4>
                <div className="space-y-1">
                  {primarySourceEdges.map(edge => {
                    const otherId = edge.source === node.id ? edge.target : edge.source;
                    const otherNode = allNodes.find(n => n.id === otherId);
                    if (!otherNode) return null;
                    return (
                      <button
                        key={edge.id}
                        onClick={() => onSelectNode(otherNode.id)}
                        className="w-full text-left p-2 rounded bg-amber-950/20 border border-amber-800/40 hover:bg-amber-900/40 text-neutral-200 flex items-center justify-between transition-all cursor-pointer"
                      >
                        <div className="truncate pr-2">
                          <span className="font-bold text-amber-300">{otherNode.label}</span>
                          <div className="text-[10px] text-neutral-500 truncate">{otherNode.sourceFile}</div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Void Resonance Edges */}
            {voidResonanceEdges.length > 0 && (
              <div className="space-y-1.5">
                <h4 className="text-[10px] uppercase text-cyan-400 font-bold flex items-center gap-1">
                  <span>VOID_RESONANCE ({voidResonanceEdges.length})</span>
                </h4>
                <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                  {voidResonanceEdges.map(edge => {
                    const otherId = edge.source === node.id ? edge.target : edge.source;
                    const otherNode = allNodes.find(n => n.id === otherId);
                    if (!otherNode) return null;
                    return (
                      <button
                        key={edge.id}
                        onClick={() => onSelectNode(otherNode.id)}
                        className="w-full text-left p-2 rounded bg-cyan-950/20 border border-cyan-800/40 hover:bg-cyan-900/40 text-neutral-200 flex items-center justify-between transition-all cursor-pointer"
                      >
                        <div className="truncate pr-2">
                          <span className="font-bold text-cyan-300">{otherNode.label}</span>
                          <div className="text-[10px] text-neutral-500 truncate">{otherNode.sourceFile}</div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Co-Occur Edges */}
            {coOccurEdges.length > 0 && (
              <div className="space-y-1.5">
                <h4 className="text-[10px] uppercase text-neutral-400 font-bold flex items-center gap-1">
                  <span>CO_OCCUR ({coOccurEdges.length})</span>
                </h4>
                <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                  {coOccurEdges.map(edge => {
                    const otherId = edge.source === node.id ? edge.target : edge.source;
                    const otherNode = allNodes.find(n => n.id === otherId);
                    if (!otherNode) return null;
                    return (
                      <button
                        key={edge.id}
                        onClick={() => onSelectNode(otherNode.id)}
                        className="w-full text-left p-2 rounded bg-neutral-900/60 border border-neutral-800 hover:bg-neutral-850 text-neutral-300 flex items-center justify-between transition-all cursor-pointer"
                      >
                        <div className="truncate pr-2">
                          <span className="font-medium text-neutral-200">{otherNode.label}</span>
                          <div className="text-[10px] text-neutral-500 truncate">{otherNode.sourceFile}</div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-neutral-500 flex-shrink-0" />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        )}

        {/* TAB 2: Provenance & Evidence Trail */}
        {activeTab === 'provenance' && (
          <div className="space-y-4 font-mono text-xs">
            
            {/* Concept Summary */}
            <div className="bg-neutral-900/40 border border-neutral-850 p-3 rounded-xl space-y-1.5">
              <span className="text-[10px] text-neutral-500 font-bold uppercase">Context Summary</span>
              <p className="text-neutral-300 leading-relaxed text-[11px]">
                {node.summary}
              </p>
            </div>

            {/* Quotation */}
            {node.quotation && (
              <div className="bg-neutral-900/60 border border-neutral-800 p-3 rounded-xl space-y-1.5">
                <span className="text-[10px] text-amber-400 font-bold uppercase">Textual Excerpt / Citation</span>
                <blockquote className="text-amber-200/90 italic leading-relaxed text-[11px] border-l-2 border-amber-400/60 pl-2 py-0.5">
                  {node.quotation}
                </blockquote>
              </div>
            )}

            {/* Location & Tags */}
            <div className="space-y-2 text-[11px]">
              <div className="flex justify-between text-neutral-400">
                <span>Location:</span>
                <span className="text-neutral-200 font-bold">{node.lineLocation || 'Section 1'}</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>Era / Context:</span>
                <span className="text-neutral-200 font-bold">{node.era || 'Corpus Archive'}</span>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Inspector Bottom Action Footer */}
      <div className="p-3 border-t border-neutral-900 bg-neutral-950 flex flex-col gap-2 font-mono text-xs">
        {onToggleIsolateRelations && (
          <button
            onClick={onToggleIsolateRelations}
            className={`w-full py-2 rounded-lg border font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              isRelationsIsolated
                ? 'bg-cyan-500/20 border-cyan-500/60 text-cyan-200'
                : 'bg-cyan-950/40 hover:bg-cyan-900 border-cyan-500/40 text-cyan-300'
            }`}
          >
            <Focus className="w-3.5 h-3.5 text-cyan-400" />
            <span>{isRelationsIsolated ? "Show Full Graph" : "Isolate Node & Relations"}</span>
          </button>
        )}

        <button
          onClick={() => onTracePathFromHere(node.id)}
          className="w-full py-2 rounded-lg bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Trace Path From Here</span>
        </button>

        {!isInCompare ? (
          <button
            onClick={() => onAddToCompare(node)}
            className="w-full py-2 rounded-lg bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-neutral-300 font-medium transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Share2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Add to Compare Set</span>
          </button>
        ) : (
          <button
            onClick={() => onRemoveFromCompare(node.id)}
            className="w-full py-2 rounded-lg bg-red-950/40 border border-red-500/40 text-red-300 font-medium transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Remove from Compare Set</span>
          </button>
        )}
      </div>

    </aside>
  );
};
