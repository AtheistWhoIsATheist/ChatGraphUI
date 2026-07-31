import React, { useState } from 'react';
import { X, AlertTriangle, Search, ArrowRight } from 'lucide-react';
import { GraphNode } from '../../data/knowledgeGraphDataset';

interface DuplicateGroupDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  duplicateLabelMap: Map<string, GraphNode[]>;
  onSelectNode: (nodeId: string) => void;
  selectedNodeId: string | null;
}

export const DuplicateGroupDrawer: React.FC<DuplicateGroupDrawerProps> = ({
  isOpen,
  onClose,
  duplicateLabelMap,
  onSelectNode,
  selectedNodeId
}) => {
  const [filterQuery, setFilterQuery] = useState('');

  if (!isOpen) return null;

  // Filter duplicate groups by search query
  const duplicateGroups: { label: string; nodes: GraphNode[] }[] = [];
  duplicateLabelMap.forEach((groupNodes, labelStr) => {
    if (groupNodes.length > 1) {
      if (!filterQuery || labelStr.toLowerCase().includes(filterQuery.toLowerCase()) || groupNodes.some(n => n.sourceFile.toLowerCase().includes(filterQuery.toLowerCase()))) {
        duplicateGroups.push({ label: labelStr, nodes: groupNodes });
      }
    }
  });

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-neutral-950 border-l border-neutral-900 h-full flex flex-col shadow-2xl">
        
        {/* Drawer Header */}
        <div className="p-4 border-b border-neutral-900 bg-neutral-900/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-display text-sm font-bold uppercase tracking-wider text-neutral-100">
                Duplicate Label Audit Drawer
              </h2>
              <p className="text-[11px] font-mono text-neutral-400">
                {duplicateGroups.length} repeated label groups across distinct source files
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-200 hover:bg-neutral-900 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Audit Policy Warning Box */}
        <div className="p-3 bg-amber-950/20 border-b border-amber-900/30 px-4 text-[11px] font-mono text-amber-300/90 leading-relaxed flex items-start gap-2">
          <span className="font-bold text-amber-400">POLICY:</span>
          <span>
            Same label does <strong>NOT</strong> mean same entity. Nodes are preserved as distinct entities per source document. Compare provenance before merging or linking.
          </span>
        </div>

        {/* Search Bar */}
        <div className="p-3 border-b border-neutral-900 bg-neutral-950">
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3" />
            <input
              type="text"
              placeholder="Search duplicate labels or source documents..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-8 pr-8 py-1.5 text-xs font-mono text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-amber-500/50"
            />
            {filterQuery && (
              <button onClick={() => setFilterQuery('')} className="absolute right-2.5 text-neutral-500 hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Duplicate Group List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-xs">
          {duplicateGroups.length === 0 ? (
            <div className="text-center py-12 text-neutral-500 text-xs font-mono">
              No duplicate label groups match your search query.
            </div>
          ) : (
            duplicateGroups.map((group, idx) => (
              <div key={`dup-group-${idx}`} className="bg-neutral-900/40 border border-neutral-850 rounded-xl p-3.5 space-y-2.5">
                
                <div className="flex items-center justify-between border-b border-neutral-850 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-neutral-100 text-xs">
                      "{group.label}"
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                    {group.nodes.length} Distinct Nodes
                  </span>
                </div>

                {/* Nodes in this group */}
                <div className="space-y-1.5">
                  {group.nodes.map(node => {
                    const isSelected = selectedNodeId === node.id;
                    return (
                      <div
                        key={node.id}
                        onClick={() => {
                          onSelectNode(node.id);
                        }}
                        className={`p-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-amber-500/20 border-amber-500/60 text-amber-200 shadow-sm'
                            : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white'
                        }`}
                      >
                        <div className="flex flex-col gap-0.5 max-w-[80%]">
                          <div className="flex items-center gap-2 text-[11px]">
                            <span className="font-mono text-neutral-500 font-bold">{node.id}</span>
                            <span className="text-neutral-400 font-medium truncate">{node.sourceFile}</span>
                          </div>
                          <span className="text-[10px] text-neutral-500">
                            Warrant: <strong className="text-cyan-400">{node.warrantLevel}</strong> • Degree: <strong className="text-neutral-300">{node.degree}</strong>
                          </span>
                        </div>

                        <button className="px-2 py-1 rounded bg-neutral-850 hover:bg-neutral-800 text-[10px] text-neutral-300 flex items-center gap-1 border border-neutral-750">
                          <span>Inspect</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>

              </div>
            ))
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-3 border-t border-neutral-900 bg-neutral-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-neutral-300 text-xs font-mono cursor-pointer"
          >
            Close Audit Drawer
          </button>
        </div>

      </div>
    </div>
  );
};
