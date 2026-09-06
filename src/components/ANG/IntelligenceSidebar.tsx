import React, { useState } from 'react';
import { Brain, Zap } from 'lucide-react';
import { AutoNarrativeResult } from '../../types/ang';
import nihilData from '../../data/nihiltheism-graph.json';

interface IntelligenceSidebarProps {
  activeNodeId: string | null;
}

export const IntelligenceSidebar: React.FC<IntelligenceSidebarProps> = ({ activeNodeId }) => {
  const [loading, setLoading] = useState(false);
  const [narrative, setNarrative] = useState<AutoNarrativeResult | null>(null);

  const activeNode = activeNodeId ? nihilData.graph.nodes.find(n => n.id === activeNodeId) : null;
  const activeCluster = activeNode?.cluster;

  const analyzeCluster = async () => {
    if (!activeCluster) return;
    setLoading(true);
    setNarrative(null);
    try {
      const clusterNodes = nihilData.graph.nodes.filter(n => n.cluster === activeCluster);
      const topNodes = clusterNodes.slice(0, 10); // Simplification of betweenness centrality for now
      
      const res = await fetch('/api/autonarrative', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clusterId: activeCluster, nodes: topNodes })
      });
      const data = await res.json();
      setNarrative(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!activeNodeId) return null;

  return (
    <div className="absolute right-4 top-20 w-80 bg-void-surface/95 border border-white/10 rounded shadow-2xl backdrop-blur-xl flex flex-col z-40 overflow-hidden max-h-[80vh]">
      <div className="p-3 border-b border-white/10 flex justify-between items-center bg-black/40">
        <h3 className="text-cyan-cosmic font-display tracking-widest uppercase text-xs flex items-center gap-2">
          <Brain size={14} /> Semantic Oracle
        </h3>
      </div>
      
      <div className="p-4 flex-1 overflow-y-auto space-y-4">
        {activeNode && (
          <div className="space-y-2">
            <h4 className="text-white/90 font-bold text-sm leading-tight">{activeNode.label}</h4>
            <div className="text-xs text-white/50">{activeNode.desc}</div>
            <div className="flex gap-2 text-[10px] uppercase font-mono tracking-wider">
              <span className="px-2 py-0.5 bg-white/5 border border-white/10 text-white/40 rounded">{activeNode.type}</span>
              {activeCluster && <span className="px-2 py-0.5 bg-violet-ethereal/10 border border-violet-ethereal/20 text-violet-ethereal rounded">Cluster: {activeCluster}</span>}
            </div>
          </div>
        )}

        {activeCluster && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <button 
              onClick={analyzeCluster} 
              disabled={loading}
              className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-xs font-mono flex items-center justify-center gap-2 text-white/80 transition-colors disabled:opacity-50"
            >
              {loading ? <div className="w-3 h-3 border-2 border-white/20 border-t-white/80 rounded-full animate-spin"></div> : <Zap size={14} className="text-cyan-cosmic" />}
              {loading ? 'Synthesizing...' : 'AutoNarrative Extract'}
            </button>
          </div>
        )}

        {narrative && (
          <div className="space-y-4 pt-4 animate-in fade-in slide-in-from-bottom-2">
            <div className="p-3 bg-cyan-cosmic/10 border border-cyan-cosmic/30 rounded">
              <div className="text-[9px] uppercase font-mono text-cyan-cosmic/70 tracking-widest mb-1">Thematic Label</div>
              <div className="text-cyan-cosmic font-bold text-sm">{narrative.thematicLabel}</div>
            </div>
            
            <div className="space-y-1">
              <div className="text-[9px] uppercase font-mono text-white/40 tracking-widest">Synthesis</div>
              <div className="text-xs text-white/70 leading-relaxed">{narrative.summary}</div>
            </div>

            <div className="p-3 bg-orange-400/10 border border-orange-400/30 rounded">
              <div className="text-[9px] uppercase font-mono text-orange-400/70 tracking-widest mb-1">Critical Conflict</div>
              <div className="text-xs text-orange-400/90 leading-relaxed">{narrative.criticalConflict}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
