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
  treatise: '#a1a1aa', // zinc-400
  journal: '#d4d4d8',  // zinc-300
  thinker: '#e4e4e7',  // zinc-200
  theme: '#52525b',    // zinc-600
  concept: '#71717a',  // zinc-500
  fragment: '#3f3f46', // zinc-700
  methodology: '#a1a1aa', // zinc-400
  claim: '#d4d4d8',    // zinc-300
  experience: '#e4e4e7', // zinc-200
  library_item: '#52525b', // zinc-600
  summary: '#71717a',  // zinc-500
  question: '#3f3f46', // zinc-700
  praxis: '#a1a1aa',   // zinc-400
  axiom: '#d4d4d8',    // zinc-300
  ...NT_NODE_COLORS,
};

const getHierarchicalColor = (node: Node) => {
  if (node.id === 'void') return '#ffffff'; // The Singularity is pure light
  if (['presence', 'collapse', 'spiritual_emergency', 'ren'].includes(node.id)) return '#e4e4e7'; // zinc-200
  if (node.type === 'methodology' || node.id.includes('series') || node.id.includes('codex')) return '#a1a1aa'; // zinc-400
  return NODE_COLORS[node.type] || '#71717a';
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
  const [structuralIntegrity, setStructuralIntegrity] = useState(true);
  
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

  // --- AUTO-CENTER SEARCH MATCH ---
  useEffect(() => {
    if (searchQuery.trim().length > 2) {
      const firstMatch = layoutNodes.find(n => n.label.toLowerCase().includes(searchQuery.toLowerCase()));
      if (firstMatch && !isNaN(firstMatch.x) && !isNaN(firstMatch.y)) {
        // Transition to center the first match
        const k = Math.max(1.2, transform.k);
        setTransform({
          x: dimensions.width / 2 - firstMatch.x * k,
          y: dimensions.height / 2 - firstMatch.y * k,
          k: k
        });
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

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

  // --- PERSISTENT RELATIONAL WEB LOGIC ---
  const calculateLinkStyle = (link: any) => {
    const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
    const targetId = typeof link.target === 'string' ? link.target : link.target.id;
    
    const sourceNode = nodes.find(n => n.id === sourceId);
    const targetNode = nodes.find(n => n.id === targetId);
    
    const isFoundational = sourceId === 'void' || targetId === 'void' || 
                          (sourceNode?.type === 'concept' && targetNode?.type === 'concept');
    
    const isSelected = selectedNodeId === sourceId || selectedNodeId === targetId;
    const isHovered = hoveredNodeId === sourceId || hoveredNodeId === targetId;
    const isFocusMode = !!selectedNodeId || !!hoveredNodeId;
    const isNeighbor = (sourceId === selectedNodeId || targetId === selectedNodeId) || 
                       (sourceId === hoveredNodeId || targetId === hoveredNodeId);
    
    // 1. Dynamic Weight & Opacity
    let opacity = structuralIntegrity ? 0.25 : 0.1;
    let width = 1.2;
    
    if (isFoundational) {
      opacity = structuralIntegrity ? 0.5 : 0.2;
      width = 2.2;
    }
    
    if (isFocusMode) {
      if (isSelected || isHovered) {
        opacity = 1.0;
        width = 3.2;
      } else if (isNeighbor) {
        opacity = 0.4;
        width = 1.8;
      } else {
        opacity = 0.01; // Deep Focus: Almost vanish unrelated
      }
    }
    
    // 2. Connection Hierarchy (Visual Style)
    let dashArray = "none";
    let isFlowing = false;
    if (link.type === 'explores' || link.type === 'documents') {
      dashArray = "10,6"; 
      isFlowing = true;
    }
    
    return {
      opacity,
      width,
      dashArray,
      isFlowing,
      color: isSelected || isHovered ? "#e4e4e7" : (isNeighbor ? "rgba(255,255,255,0.4)" : (isFoundational ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.05)")),
      isActive: isSelected || isHovered
    };
  };

  // --- PERMANENT GLOBAL SCALING LOGIC ---
  const nodeDegrees = useMemo(() => {
    const degrees: Record<string, number> = {};
    initialLinks.forEach(link => {
      const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
      const targetId = typeof link.target === 'string' ? link.target : link.target.id;
      degrees[sourceId] = (degrees[sourceId] || 0) + 1;
      degrees[targetId] = (degrees[targetId] || 0) + 1;
    });
    return degrees;
  }, [initialLinks]);

  const calculateNodeScale = (node: Node) => {
    const degree = nodeDegrees[node.id] || 0;
    const saturation = node.metadata?.saturation_level || 50;
    
    // 1. Base Scale by Type/ID (Hierarchical)
    let baseRadius = 15;
    if (node.id === 'void') baseRadius = 45; // Level 1: Singularity
    else if (['presence', 'collapse', 'spiritual_emergency', 'ren'].includes(node.id)) baseRadius = 35; // Level 2: Foundations
    else if (node.type === 'methodology' || node.id.includes('series') || node.id.includes('codex')) baseRadius = 25; // Level 3: Operations
    else baseRadius = 12; // Level 4: Specifics
    
    // 2. Structural Weighting (Centrality)
    const centralityBonus = Math.min(degree * 2.5, 25);
    
    // 3. Semantic Saturation
    const saturationMultiplier = 0.8 + (saturation / 100) * 0.4;
    
    const finalRadius = (baseRadius + centralityBonus) * saturationMultiplier;
    
    // 4. Abyssal Integration Factor (AIF)
    const aif = (Math.min(degree, 10) / 10) * 0.4 + (saturation / 100) * 0.6;
    
    return {
      radius: Math.max(6, Math.min(65, finalRadius)),
      aif,
      glowIntensity: aif * 0.6,
      auraSize: aif * 25
    };
  };

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

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden bg-[#0a0a0a] text-zinc-100 font-sans selection:bg-orange-500/30">
      
      {/* Sovereign Context Indicator */}
      <AnimatePresence>
        {selectedNodeId && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 px-6 py-2 bg-black/60 backdrop-blur-2xl border border-orange-500/40 rounded-full shadow-2xl"
          >
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-zinc-200 animate-pulse" />
              <span className="text-[10px]  font-semibold tracking-widest text-orange-100">Sovereign Inquiry Active</span>
            </div>
            <div className="w-px h-4 bg-white/10" />
            <div className="text-[10px]  font-bold tracking-widest text-zinc-400">
              {nodes.find(n => n.id === selectedNodeId)?.label}
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); onNodeSelect({ id: undefined } as any); }}
              className="ml-2 p-1 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-3 h-3 text-zinc-500 hover:text-white" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- TOOLBAR (TOP LEFT) --- */}
      <div className="absolute top-6 left-6 z-40 flex flex-col gap-4 pointer-events-none">
        
        {/* Toolbar Toggle */}
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            onClick={() => setIsToolbarOpen(!isToolbarOpen)}
            className="p-2 bg-black/40 backdrop-blur-md border border-white/10 rounded-xl shadow-xl text-zinc-400 hover:text-zinc-200 hover:bg-white/5 transition-colors"
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
              <div className="pointer-events-auto bg-zinc-950 border border-white/5 hover:border-white/10 transition-colors p-3 w-64 flex items-center gap-3 rounded-2xl transition hover:bg-white/5 backdrop-blur-md">
                <Search className="w-5 h-5 text-zinc-300" />
                <input 
                  type="text" 
                  placeholder="Scented Search..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none outline-none text-sm text-zinc-100 placeholder:text-zinc-500 w-full font-mono  tracking-widest"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="p-1 hover:bg-white/5">
                    <X className="w-4 h-4 text-zinc-400" />
                  </button>
                )}
              </div>

              {/* Filter Group */}
              <div className="pointer-events-auto bg-zinc-950 border border-white/5 p-5 w-64 rounded-2xl transition hover:bg-white/5 backdrop-blur-md">
                <div className="flex items-center gap-2 mb-4 text-xs font-bold text-zinc-200  tracking-widest">
                  <Filter className="w-4 h-4" /> Filters
                </div>
                
                {/* Type Filters */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {['concept', 'thinker', 'treatise', 'question', 'axiom', 'praxis'].map(type => (
                    <button
                      key={type}
                      onClick={() => {
                        const next = new Set(activeTypes);
                        next.has(type) ? next.delete(type) : next.add(type);
                        setActiveTypes(next);
                      }}
                      className={cn(
                        "text-[10px]  px-3 py-1 font-bold tracking-widest border transition-all cursor-pointer",
                        activeTypes.has(type) 
                          ? "bg-zinc-100 text-black border-white/10 text-zinc-950 shadow-2xl translate-x-[-2px] translate-y-[-2px]" 
                          : "bg-zinc-900/50 border-white/5 text-zinc-400 hover:border-white/10 hover:text-white"
                      )}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                {/* Status Filters */}
                <div className="flex flex-wrap gap-2 border-t-2 border-[#111] pt-4">
                  {['VERIFIED', 'INFERENCE', 'HYPOTHESIS'].map(status => (
                    <button
                      key={status}
                      onClick={() => {
                        const next = new Set(activeStatuses);
                        next.has(status) ? next.delete(status) : next.add(status);
                        setActiveStatuses(next);
                      }}
                      className={cn(
                        "text-[10px]  px-3 py-1 font-bold tracking-widest border transition-all cursor-pointer",
                        activeStatuses.has(status)
                          ? "bg-white/10 border-white/10 text-zinc-950 shadow-2xl translate-x-[-2px] translate-y-[-2px]"
                          : "bg-zinc-900/50 border-white/5 text-zinc-400 hover:border-white/10 hover:text-white"
                      )}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Toggles */}
              <div className="pointer-events-auto flex flex-col gap-3">
                <button
                  onClick={() => setClusterMode(!clusterMode)}
                  className={cn(
                    "flex items-center gap-3 px-5 py-3 border transition-all duration-300 font-bold",
                    clusterMode 
                      ? "bg-zinc-100 text-black text-zinc-950 border-white/10 shadow-2xl translate-x-[-2px] translate-y-[-2px]" 
                      : "bg-zinc-900/50 border-white/5 text-zinc-400 hover:border-white/10 hover:text-white"
                  )}
                >
                  <Atom className={cn("w-5 h-5", clusterMode && "animate-spin-slow")} />
                  <span className="text-xs  tracking-widest">Cluster Mode</span>
                </button>

                <button
                  onClick={() => setShowLatent(!showLatent)}
                  className={cn(
                    "flex items-center gap-3 px-5 py-3 border transition-all duration-300 font-bold",
                    showLatent 
                      ? "bg-white/10 text-zinc-950 border-white/10 shadow-2xl translate-x-[-2px] translate-y-[-2px]" 
                      : "bg-zinc-900/50 border-white/5 text-zinc-400 hover:border-white/10 hover:text-white"
                  )}
                >
                  <Sparkles className={cn("w-5 h-5", showLatent && "animate-pulse")} />
                  <span className="text-xs  tracking-widest">Gap Synthesis</span>
                </button>

                <button
                  onClick={() => setStructuralIntegrity(!structuralIntegrity)}
                  className={cn(
                    "flex items-center gap-3 px-5 py-3 border transition-all duration-300 font-bold",
                    structuralIntegrity 
                      ? "bg-zinc-100 text-black text-zinc-950 border-white/10 shadow-2xl translate-x-[-2px] translate-y-[-2px]" 
                      : "bg-zinc-900/50 border-white/5 text-zinc-400 hover:border-white/10 hover:text-white"
                  )}
                >
                  <Network className={cn("w-5 h-5", structuralIntegrity && "animate-pulse")} />
                  <span className="text-xs  tracking-widest">Structural Integrity</span>
                </button>

                {/* Gravity Slider */}
                <div className="bg-zinc-900/50 border border-white/5 p-4 flex flex-col gap-3 font-mono font-bold tracking-widest rounded-2xl transition hover:bg-white/5 backdrop-blur-md">
                  <div className="flex items-center justify-between text-xs text-zinc-300 ">
                    <div className="flex items-center gap-2">
                      <SlidersHorizontal className="w-4 h-4" />
                      <span>Gravity Collapse</span>
                    </div>
                    <span>{gravity}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={gravity} 
                    onChange={(e) => setGravity(parseInt(e.target.value))}
                    className="w-full accent-[#FF3A00] h-1 bg-white/10 appearance-none cursor-pointer"
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
            className="absolute bottom-6 left-6 z-40 w-80 bg-zinc-900/50 border border-white/10 p-6 rounded-2xl transition hover:bg-white/5 backdrop-blur-md shadow-2xl"
          >
            <div className="flex items-center gap-3 mb-4 text-zinc-300">
              <Sparkles className="w-5 h-5 animate-pulse" />
              <span className="text-xs font-bold  tracking-widest">Latent Discovery</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white/5 border border-white/5 p-4 text-center">
                <div className="text-[10px] text-zinc-200  font-bold tracking-widest mb-2">Centrality</div>
                <div className="text-3xl font-serif font-semibold text-white">{selectedInsights.degree}</div>
              </div>
              <div className={cn("border p-4 text-center flex flex-col justify-center", selectedInsights.isSingularity ? "bg-[#ff3a00]/10 border-[#ff3a00]" : "bg-[#00e5ff]/10 border-[#00e5ff]")}>
                <div className="text-[10px] text-zinc-400  font-bold tracking-widest mb-2">Status</div>
                <div className={cn("text-xs font-semibold tracking-widest", selectedInsights.isSingularity ? "text-zinc-200" : "text-zinc-300")}>
                  {selectedInsights.isSingularity ? "SINGULARITY" : "CONNECTED"}
                </div>
              </div>
            </div>

            {selectedInsights.suggestion && (
              <div className="text-xs text-zinc-300 bg-zinc-950 p-4 border border-white/5 leading-relaxed font-mono">
                <strong className="text-zinc-300 block mb-2  tracking-widest text-[10px]">AI Recommendation:</strong>
                {selectedInsights.suggestion}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Singularity (Aesthetic Anchor) */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden opacity-30 select-none">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 300, repeat: Infinity, ease: "linear" }}
          className="relative w-[200%] h-[200%] flex items-center justify-center"
        >
          {/* Fractal Grid */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px]" />
          <div className="absolute w-full h-full bg-[radial-gradient(circle_at_center,transparent_0%,#000_70%)]" />
          
          {/* Distant "Stars" Particles */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 contrast-150 brightness-50 mix-blend-overlay" />
        </motion.div>
      </div>

      {/* --- GRAPH CANVAS --- */}
      <div 
        className="absolute inset-0 w-full h-full pointer-events-none overflow-visible transition-transform duration-700 ease-[cubic-bezier(0.2,0,0,1)]"
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
            <filter id="void-bloom" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feColorMatrix in="blur" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="glow" />
              <feComposite in="SourceGraphic" in2="glow" operator="over" />
            </filter>
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
            const style = calculateLinkStyle(link);

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

            return (
              <g key={linkId}>
                <motion.path
                  ref={(el) => { if (el) linkRefs.current.set(linkId, el as any); else linkRefs.current.delete(linkId); }}
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ 
                    pathLength: 1, 
                    opacity: style.opacity
                  }}
                  exit={{ opacity: 0 }}
                  stroke={style.color}
                  strokeWidth={style.width}
                  fill="none"
                  strokeDasharray={style.dashArray}
                />
                
                {/* Animated Data Packets (Logic Flow) */}
                {style.isActive && (
                  <g className="pointer-events-none">
                    {[0, 1, 2].map((i) => (
                      <motion.circle
                        key={`${linkId}-packet-${i}`}
                        r={1.2 + i * 0.3}
                        fill={style.color}
                        initial={{ offsetDistance: "0%" }}
                        animate={{ offsetDistance: "100%" }}
                        transition={{ 
                          duration: 1.5 + Math.random() * 0.5, 
                          repeat: Infinity, 
                          delay: i * 0.6,
                          ease: "linear" 
                        }}
                        style={{
                          offsetPath: `path('M ${link.source.x} ${link.source.y} Q ${cx} ${cy} ${link.target.x} ${link.target.y}')`,
                          filter: `blur(${0.5}px) drop-shadow(0 0 5px ${style.color})`,
                        }}
                      />
                    ))}
                  </g>
                )}
              </g>
            );
          })}
        </AnimatePresence>
      </svg>

      {/* Nodes */}
      <div className="absolute inset-0 pointer-events-none">
        <AnimatePresence>
          {layoutNodes.map((node) => {
            const hasSearchQuery = searchQuery && searchQuery.trim().length > 0;
            const matchesSearch = hasSearchQuery && node.label.toLowerCase().includes(searchQuery.toLowerCase());
            const isSelected = selectedNodeId === node.id;
            const isHovered = hoveredNodeId === node.id;
            
            const isFocusMode = !!selectedNodeId || !!hoveredNodeId;
            const isConnectedToFocus = links.some(l => 
              (l.source?.id === node.id && (l.target?.id === selectedNodeId || l.target?.id === hoveredNodeId)) || 
              (l.target?.id === node.id && (l.source?.id === selectedNodeId || l.source?.id === hoveredNodeId))
            );

            // True if faded out by focus isolation OR search isolation
            const isDimmed = (isFocusMode && !isSelected && !isHovered && !isConnectedToFocus) || (hasSearchQuery && !matchesSearch);
            // Even darker if not matching focus
            const isDeeplyDimmed = isDimmed && ((isFocusMode && !isConnectedToFocus) || (hasSearchQuery && !matchesSearch));

            const color = getHierarchicalColor(node);
            const scale = calculateNodeScale(node);

            return (
              <motion.div
                key={`node-${node.id}`}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: matchesSearch ? 1.3 : (isSelected ? 1.15 : 1), 
                  opacity: isDeeplyDimmed ? 0.05 : (isDimmed ? 0.2 : 1),
                  filter: isDeeplyDimmed ? "blur(2px) grayscale(0.5)" : "blur(0px) grayscale(0)"
                }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 35 }}
                className="absolute"
                style={{ 
                  left: isNaN(node.x) ? 0 : node.x, 
                  top: isNaN(node.y) ? 0 : node.y,
                  zIndex: isSelected ? 50 : (isHovered || isConnectedToFocus ? 40 : 10)
                }}
              >
                <div 
                  ref={(el) => { if (el) nodeRefs.current.set(node.id, el); else nodeRefs.current.delete(node.id); }}
                  className={cn(
                    "pointer-events-auto relative group cursor-pointer flex items-center justify-center transition-all duration-700",
                  )}
                  onMouseEnter={() => setHoveredNodeId(node.id)}
                  onMouseLeave={() => setHoveredNodeId(null)}
                  onClick={() => onNodeSelect(node)}
                  onDoubleClick={() => setExpandedNodeId(node.id)}
                >
                  {/* Elite Abyssal Aura (Layered) */}
                  {scale.aif > 0.3 && (
                    <>
                      <motion.div 
                        animate={{ 
                          scale: [1, 1.15, 1],
                          rotate: [0, 180, 360],
                          opacity: [scale.aif * 0.15, scale.aif * 0.45, scale.aif * 0.15]
                        }}
                        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                        className="absolute rounded-full pointer-events-none border border-dashed border-white/5"
                        style={{
                          width: scale.radius * 2 + scale.auraSize * 1.5,
                          height: scale.radius * 2 + scale.auraSize * 1.5,
                        }}
                      />
                      <motion.div 
                        animate={{ 
                          scale: [1.1, 1, 1.1],
                          opacity: [scale.aif * 0.1, scale.aif * 0.3, scale.aif * 0.1]
                        }}
                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute rounded-full pointer-events-none"
                        style={{
                          width: scale.radius * 2 + scale.auraSize,
                          height: scale.radius * 2 + scale.auraSize,
                          background: `radial-gradient(circle, ${color}30 0%, transparent 80%)`,
                          filter: `blur(${scale.auraSize / 3}px)`,
                        }}
                      />
                    </>
                  )}

                  {/* Node Shape */}
                  <div 
                    className={cn(
                      "rounded-full shadow-2xl border transition-all duration-500",
                      isSelected ? "animate-pulse" : "group-hover:scale-110",
                      matchesSearch && "shadow-[0_0_40px_white] ring-4 ring-white/20"
                    )}
                    style={{ 
                      backgroundColor: isSelected ? `${color}` : `${color}15`, 
                      borderColor: isSelected || matchesSearch ? '#fff' : (isHovered || isConnectedToFocus ? color : `${color}80`),
                      boxShadow: (isSelected || isHovered) ? `0 0 ${20 + scale.glowIntensity * 50}px ${color}` : `0 0 10px rgba(0,0,0,0.5)`,
                      width: `${scale.radius * 2}px`,
                      height: `${scale.radius * 2}px`,
                    }}
                  >
                    {/* Inner Semantic Core */}
                    <div 
                      className="absolute inset-2 rounded-full opacity-40"
                      style={{ backgroundColor: color }}
                    />
                  </div>

                  {/* Label (Dynamic Density) */}
                  <div className={cn(
                    "absolute top-full mt-3 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1.5 rounded-lg bg-black/80 backdrop-blur-xl border border-white/10 text-[10px]  font-bold tracking-widest transition-all duration-500 pointer-events-none",
                    (isHovered || isSelected || matchesSearch || scale.radius > 30) 
                      ? "opacity-100 translate-y-0 text-white border-orange-500 shadow-2xl bg-orange-950/20" 
                      : (isDeeplyDimmed ? "opacity-0 -translate-y-2 scale-90" : "opacity-30 translate-y-0 text-zinc-400")
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

      {/* --- SEMANTIC EXPANSION ENGINE (ANALYSIS-REVEAL) --- */}
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
                    <div className="flex items-center gap-2 text-zinc-200 mb-2">
                      <Activity className="w-4 h-4" />
                      <span className="text-[10px]  tracking-widest font-bold">Data Stream</span>
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
                        <div className="text-[10px] text-zinc-200/70  tracking-widest mb-2 font-bold">Deconstruction Residue</div>
                        <div className="text-sm text-zinc-300 italic leading-relaxed">
                          "{expandedNode.metadata.deconstruction_residue}"
                        </div>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-zinc-900/50 rounded-lg border border-white/5">
                        <div className="text-[10px] text-zinc-600  tracking-widest mb-1">Gravity</div>
                        <div className="text-2xl font-light text-zinc-300">{gravityCount}</div>
                      </div>
                      <div className="p-4 bg-zinc-900/50 rounded-lg border border-white/5">
                        <div className="text-[10px] text-zinc-600  tracking-widest mb-1">Status</div>
                        <div className="text-sm text-zinc-300 mt-2">{expandedNode?.status}</div>
                      </div>
                    </div>

                    {synapses.length > 0 && (
                      <div>
                        <div className="text-[10px] text-zinc-600  tracking-widest mb-3">Synapses</div>
                        <div className="space-y-2">
                          {synapses.map(synapse => (
                            <div 
                              key={synapse.id}
                              onClick={() => setExpandedNodeId(synapse.id)}
                              className="p-3 bg-black/40 border border-white/5 rounded-lg hover:border-white/20 transition-colors cursor-pointer flex justify-between items-center"
                            >
                              <span className="text-sm text-zinc-300">{synapse.label}</span>
                              <span className="text-[9px]  tracking-wider text-zinc-600 border border-white/5 px-1.5 py-0.5 rounded">{synapse.type}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <div className="text-[10px] text-zinc-600  tracking-widest mb-3">Tags</div>
                      <div className="flex flex-wrap gap-2">
                        {expandedNode?.metadata?.tags?.map((tag, i) => (
                          <motion.span
                            key={tag}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1 }}
                            className="px-3 py-1 bg-zinc-900 border border-zinc-800 rounded text-[10px]  text-zinc-400"
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

