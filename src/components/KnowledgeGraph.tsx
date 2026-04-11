import { useEffect, useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as d3 from 'd3';
import { corpusNodes, corpusLinks, Node, NodeType, NodeStatus } from '../data/corpus';
import { NT_NODE_COLORS } from '../data/nt_schema';
import { cn } from '../lib/utils';
import { 
  Maximize, RotateCcw, ZoomIn, ShieldAlert, CheckCircle2, 
  HelpCircle, Activity, Sparkles, Network, BrainCircuit, 
  Filter, Layers, X, Atom, Search, Zap, Link2Off, SlidersHorizontal
} from 'lucide-react';
import { useGraphLayout } from '../hooks/useGraphLayout';
import { blocksToString } from '../utils/voidUtils';

// --- TYPES & CONSTANTS ---

const NODE_COLORS: Record<NodeType, string> = {
  treatise: '#f97316', // Orange-500
  journal: '#eab308',  // Yellow-500
  thinker: '#3b82f6',  // Blue-500
  concept: '#ef4444',  // Red-500
  fragment: '#a8a29e', // Stone-400
  methodology: '#8b5cf6', // Violet-500
  claim: '#ec4899',    // Pink-500
  experience: '#10b981', // Emerald-500
  library_item: '#64748b', // Slate-500
  summary: '#14b8a6',  // Teal-500
  question: '#f43f5e', // Rose-500
  praxis: '#84cc16',   // Lime-500
  axiom: '#d946ef',    // Fuchsia-500
  ...NT_NODE_COLORS,
};

// --- COMPONENT ---

export function KnowledgeGraph({ nodes, links: initialLinks, onNodeSelect, selectedNodeId }: { nodes: Node[]; links: any[]; onNodeSelect: (node: Node) => void; selectedNodeId?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });
  const [clusterMode, setClusterMode] = useState(false);
  const [showLatent, setShowLatent] = useState(false);
  const [gravity, setGravity] = useState(50);
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [expandedNodeId, setExpandedNodeId] = useState<string | null>(null);
  const [transform, setTransform] = useState({ x: 0, y: 0, k: 1 });
  const [isToolbarOpen, setIsToolbarOpen] = useState(true);
  
  // Filters
  const [activeTypes, setActiveTypes] = useState<Set<string>>(new Set());
  const [activeStatuses, setActiveStatuses] = useState<Set<string>>(new Set());

  // Layout Hook
  const { nodes: layoutNodes, links } = useGraphLayout({
    nodes: nodes,
    links: initialLinks,
    width: dimensions.width,
    height: dimensions.height,
    clusterMode,
    gravity,
    activeFilters: { types: activeTypes, statuses: activeStatuses }
  });

  // Resize Observer
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(entries => {
      for (let entry of entries) {
        setDimensions({ width: entry.contentRect.width, height: entry.contentRect.height });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Zoom & Pan Handlers using d3-zoom
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const zoom = d3.zoom<HTMLDivElement, unknown>()
      .scaleExtent([0.1, 5])
      .wheelDelta((event) => {
        const damping = 0.5; // 50% decrease for Z-Axis Stabilization
        return -event.deltaY * (event.deltaMode === 1 ? 0.05 : event.deltaMode ? 1 : 0.002) * damping;
      })
      .filter((event) => {
        // Only allow zoom on wheel if ctrlKey is pressed
        if (event.type === 'wheel') {
          return event.ctrlKey;
        }
        // Allow drag (mousedown) without ctrlKey
        return event.button === 0 || event.type === 'touchstart';
      })
      .on('zoom', (event) => {
        setTransform({
          x: event.transform.x,
          y: event.transform.y,
          k: event.transform.k
        });
      });

    const selection = d3.select(container);
    selection.call(zoom);
    
    // Prevent default wheel behavior when zooming to avoid page scroll
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
      }
    };
    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      selection.on('.zoom', null);
      container.removeEventListener('wheel', handleWheel);
    };
  }, []);

  // --- GAP SYNTHESIS LOGIC ---
  const latentLinksBase = useMemo(() => {
    const lLinks: { sourceId: string; targetId: string; reason: string }[] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const n1 = nodes[i];
        const n2 = nodes[j];
        const isLinked = initialLinks.some(l => 
          (typeof l.source === 'string' ? l.source === n1.id : (l.source as any).id === n1.id) && 
          (typeof l.target === 'string' ? l.target === n2.id : (l.target as any).id === n2.id) ||
          (typeof l.source === 'string' ? l.source === n2.id : (l.source as any).id === n2.id) && 
          (typeof l.target === 'string' ? l.target === n1.id : (l.target as any).id === n1.id)
        );
        if (!isLinked) {
          const tags1 = n1.metadata?.tags || [];
          const tags2 = n2.metadata?.tags || [];
          const sharedTags = tags1.filter(t => tags2.includes(t));
          if (sharedTags.length >= 2) {
            lLinks.push({ sourceId: n1.id, targetId: n2.id, reason: `Shared conceptual space: ${sharedTags.join(', ')}` });
          } else if (
            sharedTags.length === 1 &&
            (n1.type === "concept" ||
              n2.type === "concept" ||
              n1.type === "experience" ||
              n2.type === "experience")
          ) {
            lLinks.push({ sourceId: n1.id, targetId: n2.id, reason: `Potential unified voice via: ${sharedTags[0]}` });
          }
        }
      }
    }
    return lLinks;
  }, [nodes, initialLinks]);

  const activeLatentLinks = useMemo(() => {
    if (!showLatent) return [];
    return latentLinksBase.map(ll => {
      const source = layoutNodes.find(n => n.id === ll.sourceId);
      const target = layoutNodes.find(n => n.id === ll.targetId);
      if (source && target) return { source, target, reason: ll.reason };
      return null;
    }).filter(Boolean) as { source: any; target: any; reason: string }[];
  }, [showLatent, latentLinksBase, layoutNodes]);

  // --- INSIGHT GENERATOR LOGIC ---
  const getInsights = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return null;
    
    const connectedLinks = initialLinks.filter(l => 
      (typeof l.source === 'string' ? l.source === nodeId : (l.source as any).id === nodeId) || 
      (typeof l.target === 'string' ? l.target === nodeId : (l.target as any).id === nodeId)
    );
    const degree = connectedLinks.length;
    
    let suggestion = null;
    if (degree < 2) {
      // Find a related node by tag overlap
      const related = nodes.find(n => 
        n.id !== nodeId && 
        n.metadata?.tags?.some(t => node.metadata?.tags?.includes(t))
      );
      suggestion = related ? `Connect to "${related.label}" via shared tag.` : "Expand metadata to find connections.";
    }

    return { degree, suggestion, isSingularity: degree < 2 };
  };

  const selectedInsights = selectedNodeId ? getInsights(selectedNodeId) : null;

  // --- BUOY-HOVER ANIMATION ENGINE ---
  const layoutNodesRef = useRef(layoutNodes);
  const linksRef = useRef(links);
  const activeLatentLinksRef = useRef(activeLatentLinks);

  useEffect(() => {
    layoutNodesRef.current = layoutNodes;
    linksRef.current = links;
    activeLatentLinksRef.current = activeLatentLinks;
  }, [layoutNodes, links, activeLatentLinks]);

  const nodeRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const linkRefs = useRef<Map<string, SVGPathElement>>(new Map());
  const latentLinkRefs = useRef<Map<string, SVGPathElement>>(new Map());

  useEffect(() => {
    let animationFrameId: number;
    
    const nodeParams = new Map<string, {
      freqX: number;
      freqY: number;
      phaseX: number;
      phaseY: number;
      ampX: number;
      ampY: number;
    }>();

    const getParams = (id: string) => {
      if (!nodeParams.has(id)) {
        nodeParams.set(id, {
          freqX: 0.3 + Math.random() * 0.2, // 0.3 - 0.5 rad/s
          freqY: 0.3 + Math.random() * 0.2,
          phaseX: Math.random() * Math.PI * 2,
          phaseY: Math.random() * Math.PI * 2,
          ampX: 3 + Math.random() * 4, // 3 - 7px
          ampY: 2 + Math.random() * 3, // 2 - 5px
        });
      }
      return nodeParams.get(id)!;
    };

    const renderLoop = (time: number) => {
      const t = time / 1000;
      const currentNodes = layoutNodesRef.current;
      const currentLinks = linksRef.current;
      const currentLatentLinks = activeLatentLinksRef.current;
      
      const offsets = new Map<string, {x: number, y: number}>();
      
      currentNodes.forEach(node => {
        const p = getParams(node.id);
        
        // Harmonic overtone: 30% of main amplitude, 2x frequency
        const harmonicX = Math.sin(t * (p.freqX * 2) + p.phaseX) * (p.ampX * 0.3);
        const harmonicY = Math.sin(t * (p.freqY * 2) + p.phaseY) * (p.ampY * 0.3);
        
        const offsetX = Math.sin(t * p.freqX + p.phaseX) * p.ampX + harmonicX;
        const offsetY = Math.sin(t * p.freqY + p.phaseY) * p.ampY + harmonicY + Math.sin(t * 0.15 + p.phaseX) * 2;
        
        offsets.set(node.id, { x: offsetX, y: offsetY });
        
        const el = nodeRefs.current.get(node.id);
        if (el) {
          el.style.transform = `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px))`;
        }
      });
      
      currentLinks.forEach(link => {
        const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
        const targetId = typeof link.target === 'string' ? link.target : link.target.id;
        
        const sourceNode = typeof link.source === 'string' ? currentNodes.find(n => n.id === sourceId) : link.source as any;
        const targetNode = typeof link.target === 'string' ? currentNodes.find(n => n.id === targetId) : link.target as any;
        
        const sourceOffset = offsets.get(sourceId) || { x: 0, y: 0 };
        const targetOffset = offsets.get(targetId) || { x: 0, y: 0 };
        
        const sx = (sourceNode?.x || 0) + sourceOffset.x;
        const sy = (sourceNode?.y || 0) + sourceOffset.y;
        const tx = (targetNode?.x || 0) + targetOffset.x;
        const ty = (targetNode?.y || 0) + targetOffset.y;
        
        const dx = tx - sx;
        const dy = ty - sy;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        
        const curvature = 0.2;
        const mx = (sx + tx) / 2;
        const my = (sy + ty) / 2;
        const cx = mx - (dy / dist) * (dist * curvature);
        const cy = my + (dx / dist) * (dist * curvature);
        
        const linkId = `link-${sourceId}-${targetId}`;
        const el = linkRefs.current.get(linkId);
        if (el) {
          el.setAttribute('d', `M ${sx} ${sy} Q ${cx} ${cy} ${tx} ${ty}`);
        }
      });

      currentLatentLinks.forEach(link => {
        const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
        const targetId = typeof link.target === 'string' ? link.target : link.target.id;
        
        const sourceNode = typeof link.source === 'string' ? currentNodes.find(n => n.id === sourceId) : link.source as any;
        const targetNode = typeof link.target === 'string' ? currentNodes.find(n => n.id === targetId) : link.target as any;
        
        const sourceOffset = offsets.get(sourceId) || { x: 0, y: 0 };
        const targetOffset = offsets.get(targetId) || { x: 0, y: 0 };
        
        const sx = (sourceNode?.x || 0) + sourceOffset.x;
        const sy = (sourceNode?.y || 0) + sourceOffset.y;
        const tx = (targetNode?.x || 0) + targetOffset.x;
        const ty = (targetNode?.y || 0) + targetOffset.y;
        
        const dx = tx - sx;
        const dy = ty - sy;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        
        const curvature = -0.2;
        const mx = (sx + tx) / 2;
        const my = (sy + ty) / 2;
        const cx = mx - (dy / dist) * (dist * curvature);
        const cy = my + (dx / dist) * (dist * curvature);
        
        const linkId = `latent-${sourceId}-${targetId}`;
        const el = latentLinkRefs.current.get(linkId);
        if (el) {
          el.setAttribute('d', `M ${sx} ${sy} Q ${cx} ${cy} ${tx} ${ty}`);
        }
      });
      
      animationFrameId = requestAnimationFrame(renderLoop);
    };
    
    animationFrameId = requestAnimationFrame(renderLoop);
    
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  // --- RENDER HELPERS ---

  const getNodeColor = (type: NodeType) => NODE_COLORS[type] || '#71717a';

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden bg-[#0a0a0a] text-zinc-100 font-sans selection:bg-orange-500/30">
      
      {/* --- TOOLBAR (TOP LEFT) --- */}
      <div className="absolute top-6 left-6 z-40 flex flex-col gap-4 pointer-events-none">
        
        {/* Toolbar Toggle */}
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            onClick={() => setIsToolbarOpen(!isToolbarOpen)}
            className="p-2 bg-black/40 backdrop-blur-md border border-white/10 rounded-xl shadow-xl text-zinc-400 hover:text-orange-500 hover:bg-white/5 transition-colors"
            title="Toggle Toolbar"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>

        <AnimatePresence>
          {isToolbarOpen && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-4"
            >
              {/* Scented Search */}
              <div className="pointer-events-auto bg-black/40 backdrop-blur-md border border-white/10 p-2 rounded-2xl shadow-xl w-64 flex items-center gap-2">
                <Search className="w-4 h-4 text-zinc-400 ml-2" />
                <input 
                  type="text" 
                  placeholder="Scented Search..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none outline-none text-sm text-zinc-200 placeholder:text-zinc-600 w-full"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="p-1 hover:bg-white/10 rounded-full">
                    <X className="w-3 h-3 text-zinc-400" />
                  </button>
                )}
              </div>

              {/* Filter Group */}
              <div className="pointer-events-auto bg-black/40 backdrop-blur-md border border-white/10 p-4 rounded-2xl shadow-xl w-64">
                <div className="flex items-center gap-2 mb-3 text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  <Filter className="w-3 h-3" /> Filters
                </div>
                
                {/* Type Filters */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {['concept', 'thinker', 'treatise', 'question', 'axiom', 'praxis'].map(type => (
                    <button
                      key={type}
                      onClick={() => {
                        const next = new Set(activeTypes);
                        next.has(type) ? next.delete(type) : next.add(type);
                        setActiveTypes(next);
                      }}
                      className={cn(
                        "text-[10px] uppercase px-2.5 py-1 rounded-full border transition-all duration-300",
                        activeTypes.has(type) 
                          ? "bg-orange-500/20 border-orange-500 text-orange-400 shadow-[0_0_10px_rgba(249,115,22,0.2)]" 
                          : "bg-zinc-900/50 border-white/5 text-zinc-500 hover:border-white/20"
                      )}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                {/* Status Filters */}
                <div className="flex flex-wrap gap-1.5 border-t border-white/5 pt-3">
                  {['VERIFIED', 'INFERENCE', 'HYPOTHESIS'].map(status => (
                    <button
                      key={status}
                      onClick={() => {
                        const next = new Set(activeStatuses);
                        next.has(status) ? next.delete(status) : next.add(status);
                        setActiveStatuses(next);
                      }}
                      className={cn(
                        "text-[10px] uppercase px-2.5 py-1 rounded-full border transition-all duration-300",
                        activeStatuses.has(status)
                          ? "bg-blue-500/20 border-blue-500 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.2)]"
                          : "bg-zinc-900/50 border-white/5 text-zinc-500 hover:border-white/20"
                      )}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Toggles */}
              <div className="pointer-events-auto flex flex-col gap-2">
                <button
                  onClick={() => setClusterMode(!clusterMode)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl border backdrop-blur-md transition-all duration-300 shadow-lg",
                    clusterMode 
                      ? "bg-orange-500 text-black border-orange-400 font-semibold" 
                      : "bg-black/40 border-white/10 text-zinc-400 hover:bg-white/5"
                  )}
                >
                  <Atom className={cn("w-4 h-4", clusterMode && "animate-spin-slow")} />
                  <span className="text-xs uppercase tracking-wider">Cluster Mode</span>
                </button>

                <button
                  onClick={() => setShowLatent(!showLatent)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl border backdrop-blur-md transition-all duration-300 shadow-lg",
                    showLatent 
                      ? "bg-emerald-500 text-black border-emerald-400 font-semibold" 
                      : "bg-black/40 border-white/10 text-zinc-400 hover:bg-white/5"
                  )}
                >
                  <Sparkles className={cn("w-4 h-4", showLatent && "animate-pulse")} />
                  <span className="text-xs uppercase tracking-wider">Gap Synthesis Overlay</span>
                </button>

                {/* Gravity Slider */}
                <div className="bg-black/40 backdrop-blur-md border border-white/10 p-3 rounded-xl shadow-lg flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs text-zinc-400 uppercase tracking-wider">
                    <div className="flex items-center gap-1.5">
                      <SlidersHorizontal className="w-3 h-3" />
                      <span>Gravity</span>
                    </div>
                    <span>{gravity}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={gravity} 
                    onChange={(e) => setGravity(parseInt(e.target.value))}
                    className="w-full accent-orange-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* --- INSIGHT GENERATOR (BOTTOM LEFT) --- */}
      <AnimatePresence>
        {selectedNodeId && selectedInsights && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-6 left-6 z-40 w-80 bg-black/80 backdrop-blur-xl border border-orange-500/30 rounded-2xl p-5 shadow-2xl"
          >
            <div className="flex items-center gap-2 mb-3 text-orange-500">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-widest">Latent Discovery</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                <div className="text-[10px] text-zinc-500 uppercase mb-1">Centrality</div>
                <div className="text-2xl font-light text-white">{selectedInsights.degree}</div>
              </div>
              <div className={cn("rounded-lg p-3 border", selectedInsights.isSingularity ? "bg-red-500/10 border-red-500/30" : "bg-emerald-500/10 border-emerald-500/30")}>
                <div className="text-[10px] text-zinc-500 uppercase mb-1">Status</div>
                <div className={cn("text-xs font-medium", selectedInsights.isSingularity ? "text-red-400" : "text-emerald-400")}>
                  {selectedInsights.isSingularity ? "SINGULARITY" : "CONNECTED"}
                </div>
              </div>
            </div>

            {selectedInsights.suggestion && (
              <div className="text-xs text-zinc-400 bg-white/5 p-3 rounded-lg border border-white/5 leading-relaxed">
                <strong className="text-zinc-300 block mb-1">AI Recommendation:</strong>
                {selectedInsights.suggestion}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- GRAPH CANVAS --- */}
      <div 
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.k})`,
          transformOrigin: '0 0'
        }}
      >
        <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
          <defs>
          <linearGradient id="latent-gradient" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="rgba(16, 185, 129, 0.8)" />
            <stop offset="100%" stopColor="rgba(16, 185, 129, 0.2)" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Latent Links */}
        <AnimatePresence>
          {showLatent && activeLatentLinks.map((link, i) => {
            if (!link.source || !link.target || isNaN(link.source.x) || isNaN(link.target.x)) return null;

            const sourceId = link.source.id;
            const targetId = link.target.id;
            const linkId = `latent-${sourceId}-${targetId}`;
            
            const dx = link.target.x - link.source.x;
            const dy = link.target.y - link.source.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            
            const curvature = -0.2;
            const mx = (link.source.x + link.target.x) / 2;
            const my = (link.source.y + link.target.y) / 2;
            const cx = mx - (dy / dist) * (dist * curvature);
            const cy = my + (dx / dist) * (dist * curvature);

            return (
              <motion.path
                key={linkId}
                ref={(el) => { if (el) latentLinkRefs.current.set(linkId, el as any); else latentLinkRefs.current.delete(linkId); }}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ 
                  pathLength: 1, 
                  opacity: 0.6,
                }}
                exit={{ opacity: 0 }}
                stroke="url(#latent-gradient)"
                strokeWidth={2}
                fill="none"
                strokeDasharray="6,6"
                filter="url(#glow)"
              >
                <animate 
                  attributeName="stroke-dashoffset" 
                  values="100;0" 
                  dur="3s" 
                  repeatCount="indefinite" 
                />
              </motion.path>
            );
          })}
        </AnimatePresence>

        {/* Links */}
        <AnimatePresence>
          {links.map((link, i) => {
            if (!link.source || !link.target || typeof link.source === 'string' || typeof link.target === 'string' || isNaN(link.source.x) || isNaN(link.target.x)) return null;

            const sourceId = link.source.id;
            const targetId = link.target.id;
            const linkId = `link-${sourceId}-${targetId}`;

            // Calculate Quadratic Bezier Control Point
            const dx = link.target.x - link.source.x;
            const dy = link.target.y - link.source.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            
            // Curvature based on index to separate overlapping links
            const curvature = 0.2;
            const mx = (link.source.x + link.target.x) / 2;
            const my = (link.source.y + link.target.y) / 2;
            const cx = mx - (dy / dist) * (dist * curvature);
            const cy = my + (dx / dist) * (dist * curvature);

            const isDimmed = hoveredNodeId && (link.source.id !== hoveredNodeId && link.target.id !== hoveredNodeId);
            const isActive = selectedNodeId === link.source.id || selectedNodeId === link.target.id;

            return (
              <motion.path
                key={linkId}
                ref={(el) => { if (el) linkRefs.current.set(linkId, el as any); else linkRefs.current.delete(linkId); }}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ 
                  pathLength: 1, 
                  opacity: isDimmed ? 0.05 : (isActive ? 0.8 : 0.25)
                }}
                exit={{ opacity: 0 }}
                stroke={isActive ? "#f97316" : "rgba(255,255,255,0.15)"}
                strokeWidth={isActive ? 2 : 1}
                fill="none"
                strokeDasharray={isActive ? "4,4" : "none"}
                style={{
                  strokeDashoffset: isActive ? 0 : 0
                }}
              >
                {isActive && (
                  <animate 
                    attributeName="stroke-dashoffset" 
                    values="100;0" 
                    dur="2s" 
                    repeatCount="indefinite" 
                  />
                )}
              </motion.path>
            );
          })}
        </AnimatePresence>
      </svg>

      {/* Nodes */}
      <div className="absolute inset-0 pointer-events-none">
        <AnimatePresence>
          {layoutNodes.map((node) => {
            const matchesSearch = searchQuery && node.label.toLowerCase().includes(searchQuery.toLowerCase());
            const isDimmed = (searchQuery && !matchesSearch) || (hoveredNodeId && hoveredNodeId !== node.id && !links.some(l => (l.source?.id === node.id && l.target?.id === hoveredNodeId) || (l.target?.id === node.id && l.source?.id === hoveredNodeId)));
            const isSelected = selectedNodeId === node.id;
            const color = getNodeColor(node.type);

            return (
              <motion.div
                key={`node-${node.id}`}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: matchesSearch ? 1.2 : 1, 
                  opacity: isDimmed ? 0.1 : 1 
                }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="absolute"
                style={{ 
                  left: isNaN(node.x) ? 0 : node.x, 
                  top: isNaN(node.y) ? 0 : node.y,
                }}
              >
                <div 
                  ref={(el) => { if (el) nodeRefs.current.set(node.id, el); else nodeRefs.current.delete(node.id); }}
                  className={cn(
                    "pointer-events-auto relative group cursor-pointer flex items-center justify-center",
                    isSelected ? "z-30" : "z-20"
                  )}
                  onMouseEnter={() => setHoveredNodeId(node.id)}
                  onMouseLeave={() => setHoveredNodeId(null)}
                  onClick={() => onNodeSelect(node)}
                  onDoubleClick={() => setExpandedNodeId(node.id)}
                >
                  {/* Node Shape */}
                  <div 
                    className={cn(
                      "rounded-full shadow-[0_0_15px_rgba(0,0,0,0.5)] border-2 transition-all duration-300",
                      isSelected ? "border-white animate-pulse" : "w-4 h-4 border-white/20 group-hover:border-white/60 group-hover:scale-125",
                      matchesSearch && "shadow-[0_0_20px_rgba(255,255,255,0.8)] border-white"
                    )}
                    style={{ 
                      backgroundColor: color, 
                      borderColor: isSelected || matchesSearch ? '#fff' : undefined,
                      boxShadow: isSelected ? `0 0 30px ${color}80` : undefined,
                      width: isSelected ? `${Math.max(24, Math.min(48, (node.metadata?.saturation_level || 50) / 2))}px` : undefined,
                      height: isSelected ? `${Math.max(24, Math.min(48, (node.metadata?.saturation_level || 50) / 2))}px` : undefined,
                    }}
                  />

                  {/* Label */}
                  <div className={cn(
                    "absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-1 rounded-md bg-black/60 backdrop-blur-sm border border-white/10 text-[10px] uppercase tracking-wider transition-all duration-300 pointer-events-none",
                    (hoveredNodeId === node.id || isSelected || matchesSearch) 
                      ? "opacity-100 translate-y-0 text-orange-400 border-orange-500/30" 
                      : (isDimmed ? "opacity-0 -translate-y-1" : "opacity-40 translate-y-0")
                  )}>
                    {node.label}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      </div>

      {/* --- SEMANTIC EXPANSION ENGINE (VOID-REVEAL) --- */}
      <AnimatePresence>
        {expandedNodeId && (() => {
          const expandedNode = nodes.find(n => n.id === expandedNodeId);
          const expandedLinks = initialLinks.filter(l => 
            (typeof l.source === 'string' ? l.source === expandedNodeId : (l.source as any).id === expandedNodeId) || 
            (typeof l.target === 'string' ? l.target === expandedNodeId : (l.target as any).id === expandedNodeId)
          );
          const gravityCount = expandedLinks.length;
          const synapses = expandedLinks.map(l => {
            const sourceId = typeof l.source === 'string' ? l.source : (l.source as any).id;
            const targetId = typeof l.target === 'string' ? l.target : (l.target as any).id;
            const linkedNodeId = sourceId === expandedNodeId ? targetId : sourceId;
            return nodes.find(n => n.id === linkedNodeId);
          }).filter(Boolean) as Node[];

          return (
            <>
              {/* Backdrop */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setExpandedNodeId(null)}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm z-40"
              />
              
              {/* Info Blade */}
              <motion.div 
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="absolute top-0 right-0 h-full w-[450px] bg-[#0f0f0f] border-l border-white/10 z-50 shadow-2xl flex flex-col"
              >
                {/* Header */}
                <div className="p-8 border-b border-white/5 flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 text-orange-500 mb-2">
                      <Activity className="w-4 h-4" />
                      <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Void Data Stream</span>
                    </div>
                    <h2 className="text-3xl font-light text-white leading-tight">
                      {expandedNode?.label}
                    </h2>
                  </div>
                  <button 
                    onClick={() => setExpandedNodeId(null)}
                    className="p-2 hover:bg-white/5 rounded-full transition-colors text-zinc-500 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                  <div className="prose prose-invert prose-sm max-w-none">
                    <div className="text-zinc-400 leading-relaxed whitespace-pre-wrap font-light text-base">
                      {blocksToString(expandedNode?.blocks)}
                    </div>
                  </div>

                  {/* Metadata Crystallization */}
                  <div className="mt-12 space-y-6">
                    {expandedNode?.metadata?.deconstruction_residue && (
                      <div className="p-4 bg-orange-500/5 border border-orange-500/20 rounded-lg">
                        <div className="text-[10px] text-orange-500/70 uppercase tracking-widest mb-2 font-bold">Deconstruction Residue</div>
                        <div className="text-sm text-zinc-300 italic leading-relaxed">
                          "{expandedNode.metadata.deconstruction_residue}"
                        </div>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-zinc-900/50 rounded-lg border border-white/5">
                        <div className="text-[10px] text-zinc-600 uppercase tracking-widest mb-1">Gravity</div>
                        <div className="text-2xl font-light text-orange-400">{gravityCount}</div>
                      </div>
                      <div className="p-4 bg-zinc-900/50 rounded-lg border border-white/5">
                        <div className="text-[10px] text-zinc-600 uppercase tracking-widest mb-1">Status</div>
                        <div className="text-sm text-zinc-300 mt-2">{expandedNode?.status}</div>
                      </div>
                    </div>

                    {synapses.length > 0 && (
                      <div>
                        <div className="text-[10px] text-zinc-600 uppercase tracking-widest mb-3">Synapses</div>
                        <div className="space-y-2">
                          {synapses.map(synapse => (
                            <div 
                              key={synapse.id}
                              onClick={() => setExpandedNodeId(synapse.id)}
                              className="p-3 bg-black/40 border border-white/5 rounded-lg hover:border-white/20 transition-colors cursor-pointer flex justify-between items-center"
                            >
                              <span className="text-sm text-zinc-300">{synapse.label}</span>
                              <span className="text-[9px] uppercase tracking-wider text-zinc-600 border border-white/5 px-1.5 py-0.5 rounded">{synapse.type}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <div className="text-[10px] text-zinc-600 uppercase tracking-widest mb-3">Tags</div>
                      <div className="flex flex-wrap gap-2">
                        {expandedNode?.metadata?.tags?.map((tag, i) => (
                          <motion.span
                            key={tag}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1 }}
                            className="px-3 py-1 bg-zinc-900 border border-zinc-800 rounded text-[10px] uppercase text-zinc-400"
                          >
                            {tag}
                          </motion.span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}

