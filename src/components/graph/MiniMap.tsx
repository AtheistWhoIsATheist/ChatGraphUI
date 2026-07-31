import React from 'react';
import { Compass } from 'lucide-react';
import { GraphNode } from '../../data/knowledgeGraphDataset';

interface MiniMapProps {
  nodes: GraphNode[];
  selectedNodeId: string | null;
  onSelectNode: (id: string) => void;
}

export const MiniMap: React.FC<MiniMapProps> = ({ nodes, selectedNodeId, onSelectNode }) => {
  return (
    <div className="absolute bottom-4 left-4 w-36 h-28 bg-neutral-950/90 border border-neutral-850 rounded-xl p-2 hidden sm:flex flex-col justify-between shadow-xl backdrop-blur-md select-none">
      <div className="flex items-center justify-between text-[9px] font-mono text-neutral-500 uppercase">
        <span className="flex items-center gap-1"><Compass className="w-3 h-3 text-cyan-400" /> MiniMap</span>
        <span>{nodes.length}</span>
      </div>

      <div className="relative flex-1 my-1 bg-neutral-900/60 rounded border border-neutral-850/60 overflow-hidden">
        {/* Render small dot representation */}
        {nodes.slice(0, 150).map((n, i) => {
          const isSelected = n.id === selectedNodeId;
          const left = `${(i * 13) % 90 + 5}%`;
          const top = `${((i * 17) % 85) + 5}%`;

          return (
            <div
              key={`minimap-${n.id}`}
              onClick={() => onSelectNode(n.id)}
              style={{ left, top }}
              className={`absolute w-1.5 h-1.5 rounded-full cursor-pointer transition-all ${
                isSelected ? 'bg-amber-400 w-2.5 h-2.5 ring-2 ring-amber-300 z-10' : 'bg-cyan-500/40 hover:bg-cyan-300'
              }`}
            />
          );
        })}
      </div>

      <div className="text-[8px] font-mono text-neutral-600 truncate text-center">
        {selectedNodeId ? `Active: ${selectedNodeId}` : 'Overview Grid'}
      </div>
    </div>
  );
};
