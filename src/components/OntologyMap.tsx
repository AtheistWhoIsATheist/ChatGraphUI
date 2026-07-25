import React, { useState } from 'react';
import { OntologyNode, OntologyLink, CorpusText } from '../data/ontology';
import { InteractiveGraph } from './InteractiveGraph';
import { NodeDetailPanel } from './NodeDetailPanel';
import { motion, AnimatePresence } from 'motion/react';
import { Network, Search, X } from 'lucide-react';

interface OntologyMapProps {
  nodes: OntologyNode[];
  links: OntologyLink[];
  corpusTexts: CorpusText[];
  selectedNodeId: string | null;
  hoveredNodeId: string | null;
  onSelectNode: (nodeId: string | null) => void;
  onHoverNode: (nodeId: string | null) => void;
  onSelectQuestion: (question: string) => void;
  onNavigateToTab: (tab: any) => void;
}

export const OntologyMap: React.FC<OntologyMapProps> = ({
  nodes,
  links,
  corpusTexts,
  selectedNodeId,
  hoveredNodeId,
  onSelectNode,
  onHoverNode,
  onSelectQuestion,
  onNavigateToTab
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const activeNode = selectedNodeId ? nodes.find(n => n.id === selectedNodeId) : null;

  const matches = searchQuery.trim() !== '' 
    ? nodes.filter(n => 
        n.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
        n.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
        n.type.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];
  
  const matchCount = matches.length;
  const isSearchActive = searchQuery.trim() !== '';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full items-start">
      {/* Left SVG Graph panel (7 cols) */}
      <div className="lg:col-span-7 h-full flex flex-col gap-4">
        {/* Search Toolbar */}
        <div className="flex items-center justify-between bg-neutral-950 border border-neutral-900 rounded-xl p-3 shadow-lg">
          <div className="relative flex-1 max-w-sm flex items-center">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3" />
            <input
              type="text"
              placeholder="Search concepts, types..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-9 pr-9 py-2 text-xs font-mono text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-neutral-700 transition-all"
            />
            {isSearchActive && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 text-neutral-500 hover:text-neutral-300"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          {isSearchActive && (
            <div className="ml-4 px-3 py-1 bg-neutral-900 rounded-md border border-neutral-800 text-[10px] font-mono text-neutral-400">
              {matchCount === 0 ? "No matches" : `${matchCount} node${matchCount === 1 ? '' : 's'} found`}
            </div>
          )}
        </div>

        <InteractiveGraph
          nodes={nodes}
          links={links}
          selectedNodeId={selectedNodeId}
          hoveredNodeId={hoveredNodeId}
          onSelectNode={onSelectNode}
          onHoverNode={onHoverNode}
          searchQuery={searchQuery}
          matchedNodeIds={new Set(matches.map(m => m.id))}
        />
      </div>

      {/* Right Node details panel (5 cols) */}
      <div className="lg:col-span-5 h-full relative">
        <AnimatePresence mode="wait">
          {activeNode ? (
            <NodeDetailPanel
              key={`panel-${activeNode.id}`}
              node={activeNode}
              corpusTexts={corpusTexts}
              onSelectQuestion={onSelectQuestion}
              onNavigateToTab={onNavigateToTab}
            />
          ) : (
            <motion.div
              key="empty-state"
              initial={{ opacity: 0, scale: 0.88, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 8 }}
              transition={{ type: "spring", stiffness: 380, damping: 26, mass: 0.8 }}
              className="bg-neutral-950 border border-neutral-900 rounded-2xl p-8 flex flex-col items-center justify-center text-center gap-4 h-full min-h-[300px] abyssal-glow justify-between py-16 absolute inset-0 w-full"
            >
              <div className="flex flex-col items-center gap-3">
                <Network className="w-10 h-10 text-neutral-800 animate-pulse" />
                <h3 className="font-display text-sm tracking-widest text-neutral-400 uppercase font-medium">No Parameter Selected</h3>
                <p className="text-xs text-neutral-500 leading-relaxed max-w-xs font-sans">
                  Select any concept node in the active network projection grid to examine its ontological parameters, connected texts, and reflective pathways.
                </p>
              </div>
              <div className="bg-neutral-900/30 border border-neutral-900 p-3.5 rounded-xl text-[10px] font-mono text-neutral-500 leading-normal max-w-sm mt-4 text-left select-none">
                <span className="text-neutral-400 font-semibold block mb-1">Recommended Starting Gateways:</span>
                • The Absolute Void (Ontological Core)<br />
                • Socratic Epoché (Epistemological Suspension)<br />
                • Śūnyatā (Radical Emptiness Insight)
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
