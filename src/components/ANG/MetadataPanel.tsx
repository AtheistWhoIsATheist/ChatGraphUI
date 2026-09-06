import React from 'react';
import { BookOpen, Map, Tag, Circle, Hexagon } from 'lucide-react';
import nihilData from '../../data/nihiltheism-graph.json';

interface MetadataPanelProps {
  nodeId: string | null;
}

export const MetadataPanel: React.FC<MetadataPanelProps> = ({ nodeId }) => {
  if (!nodeId) return null;
  const node = nihilData.graph.nodes.find(n => n.id === nodeId);
  if (!node) return null;

  return (
    <div className="h-48 border-t border-l border-white/5 bg-void-surface p-4 overflow-y-auto flex flex-col gap-3 relative z-10 w-80 shadow-[-10px_0_20px_rgba(0,0,0,0.5)]">
      <div className="text-[10px] text-white/40 font-mono uppercase tracking-widest border-b border-white/10 pb-2 mb-1 flex items-center gap-2">
        <Map size={12} className="text-cyan-cosmic" />
        Metadata & Provenance
      </div>
      
      <div className="flex-1 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-white/90 font-display tracking-wide">{node.label}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 bg-white/10 text-white/60 rounded flex items-center gap-1">
              <Circle size={8} /> {node.type}
            </span>
            <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 bg-violet-ethereal/20 text-violet-ethereal rounded flex items-center gap-1">
              <Hexagon size={8} /> {node.cluster}
            </span>
          </div>
        </div>

        {node.source && (
          <div className="bg-white/5 border border-white/10 p-2 rounded">
            <div className="text-[9px] text-white/40 font-mono uppercase tracking-widest flex items-center gap-1 mb-1">
              <BookOpen size={10} /> Provenance Source
            </div>
            <div className="text-xs text-white/80 font-mono truncate">{node.source}</div>
          </div>
        )}

        {(node as any).tags && (node as any).tags.length > 0 && (
          <div>
            <div className="text-[9px] text-white/40 font-mono uppercase tracking-widest flex items-center gap-1 mb-1">
              <Tag size={10} /> Tags
            </div>
            <div className="flex flex-wrap gap-1">
              {(node as any).tags.map((t: string) => (
                <span key={t} className="text-[9px] uppercase font-mono px-1.5 py-0.5 bg-black/40 border border-white/10 text-white/50 rounded">
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
