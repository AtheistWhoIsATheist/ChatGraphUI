import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Node, Link } from '../data/corpus';
import { detectCommunities, Community } from '../utils/communityDetection';
import { Sparkles, Loader2, Layers, RefreshCw } from 'lucide-react';
import { cn } from '../lib/utils';
import { NT_PROTOCOL } from '../data/nt_schema';

interface IntelligenceCardsProps {
  nodes: Node[];
  links: Link[];
  onNodeSelect: (node: Node) => void;
}

export function IntelligenceCards({ nodes, links, onNodeSelect }: IntelligenceCardsProps) {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(false);
  const [synthesizingId, setSynthesizingId] = useState<number | null>(null);

  useEffect(() => {
    // Detect communities on mount or when nodes/links change
    const detected = detectCommunities(nodes, links);
    // Filter out very small communities (e.g., < 3 nodes) to reduce noise
    setCommunities(detected.filter(c => c.nodes.length >= 3));
  }, [nodes, links]);

  const handleSynthesize = async (community: Community) => {
    setSynthesizingId(community.id);
    try {
      const response = await fetch('/api/synthesize-community', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          nodes: community.nodes,
          protocol: NT_PROTOCOL
        })
      });
      
      if (!response.ok) throw new Error('Failed to synthesize');
      
      const data = await response.json();
      
      setCommunities(prev => prev.map(c => 
        c.id === community.id 
          ? { ...c, label: data.label, summary: data.summary }
          : c
      ));
    } catch (error) {
      console.error('Error synthesizing community:', error);
    } finally {
      setSynthesizingId(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#000] border-l-4 border-[#333] font-mono relative overflow-hidden">
      <div className="px-6 py-4 border-b-4 border-[#333] bg-[#050505] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Layers className="w-6 h-6 text-[#FF00FF]" strokeWidth={3} />
          <div>
            <h2 className="text-sm font-black text-[#eee] tracking-widest uppercase">Semantic Oracle</h2>
            <p className="text-[10px] text-[#FF00FF] uppercase tracking-widest mt-0.5">AutoNarrative Active</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar relative">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none"></div>
        {communities.map((community, i) => (
          <motion.div 
            key={community.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-[#050505] p-5 border-2 border-[#333] hover:border-[#FF00FF] transition-colors relative overflow-hidden group neo-flat shadow-[6px_6px_0px_rgba(255,0,255,0.2)]"
          >
            <div className="absolute top-0 left-0 w-2 h-full bg-[#FF00FF]" />
            
            <div className="flex justify-between items-start mb-4 pl-3 border-b-2 border-[#222] pb-4">
              <div>
                <h3 className="text-lg font-black text-[#eee] uppercase tracking-wide">
                  {community.label || `CLUSTER_${community.id}`}
                </h3>
                <div className="inline-block px-2 py-1 bg-[#111] border border-[#333] mt-2">
                  <p className="text-[10px] text-[#FF00FF] font-bold uppercase tracking-widest">
                    {community.nodes.length} SIG-NODES
                  </p>
                </div>
              </div>
              
              {!community.summary && (
                <button
                  onClick={() => handleSynthesize(community)}
                  disabled={synthesizingId === community.id}
                  className="w-10 h-10 bg-[#FF00FF] border border-[#000] flex items-center justify-center text-[#000] hover:bg-[#fff] disabled:opacity-50 disabled:bg-[#333] disabled:text-[#888] transition-colors cursor-pointer shadow-[3px_3px_0px_rgba(0,0,0,0.5)]"
                  title="Synthesize Narrative"
                >
                  {synthesizingId === community.id ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Sparkles className="w-5 h-5" />
                  )}
                </button>
              )}
            </div>

            <div className="pl-3">
              {community.summary ? (
                <div className="text-sm text-[#ccc] leading-relaxed mb-4 border-l-2 border-[#FF00FF] pl-4 py-2 bg-[#111]">
                  {community.summary}
                </div>
              ) : (
                <div className="text-xs text-[#555] font-bold uppercase tracking-widest mb-4">
                  AWAITING SYNTHESIS...
                </div>
              )}

              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t-2 border-[#222]">
                {community.nodes.slice(0, 5).map(node => (
                  <button
                    key={node.id}
                    onClick={() => onNodeSelect(node)}
                    className="px-2 py-1 bg-[#000] border-2 border-[#333] text-[10px] font-bold text-[#888] hover:text-[#00E5FF] hover:border-[#00E5FF] transition-colors truncate max-w-[120px] uppercase"
                  >
                    {node.label}
                  </button>
                ))}
                {community.nodes.length > 5 && (
                  <span className="px-2 py-1 text-[10px] font-bold text-[#555] bg-[#111] border border-[#222]">
                    +{community.nodes.length - 5} MORE
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        ))}

        {communities.length === 0 && (
          <div className="text-center text-[#555] text-sm mt-10 uppercase tracking-widest font-bold">
            No significant communities detected.
          </div>
        )}
      </div>
    </div>
  );
}
