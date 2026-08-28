import React, { useMemo, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CorpusIngestionBatch } from '../types';
import { Activity, Layers, Tag, X, Zap, Trash2 } from 'lucide-react';

interface VisualCorpusGraphProps {
  batches: CorpusIngestionBatch[];
  onSelectBatch?: (batchId: string) => void;
  onDeleteBatch?: (batchId: string) => void;
}

const ELEVATION_KEYWORDS = [
  { word: "void", elevation: 100 },
  { word: "abyss", elevation: 95 },
  { word: "apophatic", elevation: 90 },
  { word: "nihil", elevation: 85 },
  { word: "transcendence", elevation: 80 },
  { word: "epoche", elevation: 75 },
  { word: "epoché", elevation: 75 },
  { word: "dialectic", elevation: 60 },
  { word: "synthesis", elevation: 50 },
  { word: "phenomenology", elevation: 55 },
  { word: "being", elevation: 40 },
  { word: "entity", elevation: 30 },
  { word: "reification", elevation: 25 },
  { word: "text", elevation: 10 },
];

export const VisualCorpusGraph: React.FC<VisualCorpusGraphProps> = ({ batches, onSelectBatch, onDeleteBatch }) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateDims = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };
    updateDims();
    window.addEventListener('resize', updateDims);
    return () => window.removeEventListener('resize', updateDims);
  }, []);

  // Compute Tag Cloud Data
  const tagCloudData = useMemo(() => {
    const counts: Record<string, number> = {};
    ELEVATION_KEYWORDS.forEach(k => counts[k.word] = 0);
    
    batches.forEach(b => {
      const content = (b.rawContent || '').toLowerCase();
      ELEVATION_KEYWORDS.forEach(k => {
        // Simple count
        const matches = content.match(new RegExp(`\\b${k.word}\\b`, 'g'));
        if (matches) counts[k.word] += matches.length;
      });
      b.extracts.forEach(ext => {
        const extLower = ext.text.toLowerCase();
        ELEVATION_KEYWORDS.forEach(k => {
          const matches = extLower.match(new RegExp(`\\b${k.word}\\b`, 'g'));
          if (matches) counts[k.word] += matches.length;
        });
      });
    });

    return ELEVATION_KEYWORDS.map(k => ({
      ...k,
      occurrence: counts[k.word]
    })).filter(k => k.occurrence > 0).sort((a, b) => b.elevation - a.elevation);
  }, [batches]);

  // Compute Graph Nodes & Links
  const graphData = useMemo(() => {
    const nodes: any[] = [];
    const links: any[] = [];
    const nodeMap = new Map<string, any>();

    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;

    // Center Node (The Vault)
    nodes.push({ id: 'VAULT', label: 'THE VAULT', type: 'core', radius: 40, x: centerX, y: centerY });
    nodeMap.set('VAULT', nodes[0]);

    // Batch Nodes
    const batchRadius = Math.min(dimensions.width, dimensions.height) * 0.25;
    batches.forEach((b, i) => {
      const angle = (i / batches.length) * Math.PI * 2;
      const x = centerX + Math.cos(angle) * batchRadius;
      const y = centerY + Math.sin(angle) * batchRadius;
      
      const bNode = { 
        id: b.batchId, 
        label: b.title, 
        type: 'batch', 
        radius: 25, 
        x, y,
        batch: b 
      };
      nodes.push(bNode);
      nodeMap.set(b.batchId, bNode);

      links.push({ source: 'VAULT', target: b.batchId, intensity: 1 });

      // Extract Nodes (limit to max 5 per batch for visual clarity)
      const extracts = b.extracts.slice(0, 5);
      const extDist = batchRadius * 0.7;
      extracts.forEach((ext, j) => {
        const extAngle = angle + ((j - extracts.length/2) * 0.3);
        const ex = x + Math.cos(extAngle) * extDist;
        const ey = y + Math.sin(extAngle) * extDist;
        
        const extNodeId = `${b.batchId}-ext-${j}`;
        const extNode = {
          id: extNodeId,
          label: ext.text.slice(0, 20) + '...',
          fullText: ext.text,
          type: 'extract',
          epistemicStatus: ext.epistemicStatus,
          radius: 12,
          x: ex, y: ey,
          parent: b.batchId
        };
        nodes.push(extNode);
        nodeMap.set(extNodeId, extNode);
        links.push({ source: b.batchId, target: extNodeId, intensity: 0.5 });
      });
    });

    return { nodes, links, nodeMap };
  }, [batches, dimensions]);

  return (
    <div className="w-full h-full flex flex-col xl:flex-row gap-4 relative">
      {/* 1. Ethereal Tag Cloud / Heatmap (Left Panel) */}
      <div className="xl:w-64 flex-shrink-0 bg-neutral-950/80 border border-neutral-900 rounded-2xl p-4 flex flex-col gap-4 z-10 backdrop-blur-sm relative overflow-hidden">
        {/* Subtle ethereal backdrop */}
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/10 to-transparent pointer-events-none" />
        
        <div className="flex items-center gap-2 border-b border-neutral-900/50 pb-2 relative z-10">
          <Activity className="w-4 h-4 text-amber-400" />
          <h3 className="font-display font-bold text-xs uppercase tracking-wider text-neutral-300">
            Resonance Metrics
          </h3>
        </div>
        
        <div className="flex-1 overflow-y-auto relative z-10 space-y-3 pr-1">
          <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest flex justify-between px-1">
            <span>Keyword</span>
            <span>Freq</span>
          </div>
          {tagCloudData.map((tag, i) => {
            // Color mapping based on elevation
            const colorClass = tag.elevation >= 80 ? 'text-violet-400 glow-violet-text' 
                             : tag.elevation >= 50 ? 'text-cyan-400'
                             : 'text-neutral-400';
            const barWidth = Math.min(100, (tag.occurrence / Math.max(...tagCloudData.map(t => t.occurrence))) * 100);
            return (
              <div key={i} className="flex flex-col gap-1">
                <div className="flex justify-between items-end">
                  <span className={`text-xs font-bold capitalize ${colorClass}`}>{tag.word}</span>
                  <span className="text-[10px] font-mono text-neutral-500">{tag.occurrence}</span>
                </div>
                <div className="h-1 bg-neutral-900 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${barWidth}%` }}
                    transition={{ duration: 1, ease: 'easeOut', delay: i * 0.05 }}
                    className={`h-full ${tag.elevation >= 80 ? 'bg-violet-500' : tag.elevation >= 50 ? 'bg-cyan-500' : 'bg-neutral-600'}`}
                  />
                </div>
              </div>
            );
          })}
          {tagCloudData.length === 0 && (
            <div className="text-xs text-neutral-600 font-mono text-center py-6">
              No resonance signals detected in vault.
            </div>
          )}
        </div>
      </div>

      {/* 2. Complex Visual Graph Canvas */}
      <div 
        ref={containerRef}
        className="flex-1 bg-neutral-950 border border-neutral-900 rounded-2xl relative overflow-hidden flex items-center justify-center cursor-crosshair min-h-[500px]"
      >
        {/* Deep Space / Cosmic Background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-neutral-900/40 via-black to-black pointer-events-none" />
        <div 
          className="absolute inset-0 opacity-[0.02] pointer-events-none mix-blend-screen"
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,1) 1px, transparent 0)', backgroundSize: '40px 40px' }}
        />

        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
          <defs>
             {/* Ethereal Glow Filter */}
             <filter id="ethereal-glow" x="-50%" y="-50%" width="200%" height="200%">
               <feGaussianBlur stdDeviation="4" result="blur1" />
               <feGaussianBlur stdDeviation="12" result="blur2" />
               <feMerge>
                 <feMergeNode in="blur2" />
                 <feMergeNode in="blur1" />
                 <feMergeNode in="SourceGraphic" />
               </feMerge>
             </filter>
          </defs>

          {/* Links */}
          {graphData.links.map((link, idx) => {
            const sourceNode = graphData.nodeMap.get(link.source);
            const targetNode = graphData.nodeMap.get(link.target);
            if (!sourceNode || !targetNode) return null;

            const isEmphasized = selectedNodeId === link.source || selectedNodeId === link.target ||
                                 hoveredNodeId === link.source || hoveredNodeId === link.target;
            const isRelated = selectedNodeId ? 
               (selectedNodeId === link.source || selectedNodeId === link.target || 
                (graphData.nodeMap.get(selectedNodeId)?.parent === link.source)) : true;

            const strokeOpacity = isEmphasized ? 0.9 : isRelated ? 0.3 : 0.05;
            const strokeColor = isEmphasized ? '#8b5cf6' : '#38bdf8';
            const strokeWidth = isEmphasized ? 2.5 : 1;

            return (
              <motion.line
                key={`link-${idx}`}
                x1={sourceNode.x}
                y1={sourceNode.y}
                x2={targetNode.x}
                y2={targetNode.y}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                strokeOpacity={strokeOpacity}
                filter={isEmphasized ? "url(#ethereal-glow)" : ""}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: strokeOpacity }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
              />
            );
          })}
        </svg>

        {/* Nodes */}
        <div className="absolute inset-0 z-20">
          {graphData.nodes.map((node) => {
            const isSelected = selectedNodeId === node.id;
            const isHovered = hoveredNodeId === node.id;
            
            // Highlight logic
            const isRelatedToSelected = selectedNodeId === null || 
                                        selectedNodeId === node.id || 
                                        node.parent === selectedNodeId || 
                                        graphData.nodeMap.get(selectedNodeId)?.parent === node.id ||
                                        (node.id === 'VAULT' && graphData.nodeMap.get(selectedNodeId)?.type === 'batch');
            
            let opacity = isRelatedToSelected ? 1 : 0.15;
            let scale = isSelected ? 1.3 : isHovered ? 1.1 : 1;
            
            // Cosmic glow class
            let ringClass = "border-neutral-800 bg-neutral-950";
            if (node.type === 'VAULT') {
               ringClass = "border-purple-500/50 bg-black shadow-[0_0_30px_rgba(168,85,247,0.4)]";
            } else if (node.type === 'batch') {
               ringClass = isSelected ? "border-amber-400 bg-amber-950/60 shadow-[0_0_25px_rgba(251,191,36,0.6)]" : "border-amber-600/40 bg-neutral-900";
            } else {
               ringClass = isSelected ? "border-cyan-400 bg-cyan-950/60 shadow-[0_0_20px_rgba(34,211,238,0.6)]" : "border-cyan-800/40 bg-neutral-900";
            }

            return (
              <motion.div
                key={node.id}
                className={`absolute rounded-full border flex items-center justify-center cursor-pointer backdrop-blur-md transition-colors ${ringClass}`}
                style={{ 
                  width: node.radius * 2, 
                  height: node.radius * 2,
                  left: node.x - node.radius,
                  top: node.y - node.radius,
                  opacity
                }}
                animate={{ scale }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                onMouseEnter={() => setHoveredNodeId(node.id)}
                onMouseLeave={() => setHoveredNodeId(null)}
                onClick={() => {
                   setSelectedNodeId(node.id === selectedNodeId ? null : node.id);
                   if (node.type === 'batch' && onSelectBatch && node.id !== selectedNodeId) {
                     // We can optionally trigger audit view
                   }
                }}
              >
                {node.type === 'VAULT' && <Layers className="w-8 h-8 text-purple-400 opacity-80" />}
                {node.type === 'batch' && <Tag className="w-5 h-5 text-amber-500 opacity-80" />}
                {node.type === 'extract' && <Zap className="w-3 h-3 text-cyan-400 opacity-80" />}
                
                {/* Tooltip / Label */}
                <AnimatePresence>
                  {(isSelected || isHovered || node.type === 'VAULT') && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      className={`absolute top-full mt-2 pointer-events-none flex flex-col items-center min-w-max z-50`}
                    >
                      <span className="bg-black/90 border border-neutral-800 px-2.5 py-1 rounded-lg text-[10px] font-mono text-neutral-200 shadow-xl backdrop-blur-md whitespace-nowrap">
                        {node.label}
                      </span>
                      {isSelected && node.type === 'batch' && (
                        <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded text-[9px] font-mono mt-1 font-bold tracking-widest uppercase">
                          Click to Inspect Batch
                        </span>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Selected Details Overlay */}
        <AnimatePresence>
          {selectedNodeId && graphData.nodeMap.get(selectedNodeId)?.type === 'batch' && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="absolute right-4 top-4 bottom-4 w-72 bg-neutral-950/90 border border-neutral-800/80 rounded-2xl p-4 flex flex-col gap-4 z-40 backdrop-blur-xl shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-display font-bold text-sm text-white uppercase truncate">
                  {graphData.nodeMap.get(selectedNodeId)?.batch?.title}
                </h4>
                <button onClick={() => setSelectedNodeId(null)} className="p-1 text-neutral-500 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="text-[10px] font-mono text-neutral-400 space-y-2">
                <div className="flex justify-between">
                  <span>File:</span>
                  <span className="text-neutral-300 truncate max-w-[150px]">{graphData.nodeMap.get(selectedNodeId)?.batch?.filename}</span>
                </div>
                <div className="flex justify-between">
                  <span>Chunks:</span>
                  <span className="text-amber-400 font-bold">{graphData.nodeMap.get(selectedNodeId)?.batch?.chunks.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Extracts:</span>
                  <span className="text-purple-400 font-bold">{graphData.nodeMap.get(selectedNodeId)?.batch?.extracts.length}</span>
                </div>
              </div>
              
              <div className="mt-auto flex flex-col gap-2">
                <button 
                  onClick={() => onSelectBatch && onSelectBatch(selectedNodeId)}
                  className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-mono rounded-xl border border-neutral-700 hover:border-amber-500/50 transition-colors flex justify-center items-center gap-2"
                >
                  <Activity className="w-4 h-4 text-amber-400" />
                  Open Detailed Audit
                </button>
                <button 
                  onClick={() => {
                    if (onDeleteBatch) onDeleteBatch(selectedNodeId);
                    setSelectedNodeId(null);
                  }}
                  className="px-4 py-2 bg-rose-950/20 hover:bg-rose-900/40 text-rose-300 text-xs font-mono rounded-xl border border-rose-900/50 transition-colors flex justify-center items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Batch
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
