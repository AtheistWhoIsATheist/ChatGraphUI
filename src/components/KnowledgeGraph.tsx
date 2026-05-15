import { useEffect, useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as d3 from 'd3';
import { Node, NodeType } from '../data/corpus';
import { NT_NODE_COLORS } from '../data/nt_schema';
import { cn } from '../lib/utils';
import { 
  X, Zap, Link2Off
} from 'lucide-react';
import { useGraphLayout } from '../hooks/useGraphLayout';
import { GraphToolbar } from './GraphToolbar';
import { InsightOverlay } from './InsightOverlay';
import { ExpansionPanel } from './ExpansionPanel';
import { AddNodeModal } from './AddNodeModal';
import { logOptimization } from '../utils/selfImprovement';

// --- TYPES & CONSTANTS ---

const NODE_COLORS: Partial<Record<NodeType, string>> = {
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

import { useAppStore } from '../store/appStore';

export function KnowledgeGraph({ 
  onNodeSelect: externalOnNodeSelect, 
}: { 
  onNodeSelect?: (node: Node) => void; 
}) {
  const { 
    nodes, 
    links: initialLinks, 
    selectedNodeId, 
    setSelectedNodeId, 
    setSidebarMode, 
    setRightSidebarOpen,
    addNode, 
    addLink 
  } = useAppStore();

  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });
  const [clusterMode, setClusterMode] = useState(false);
  const [showLatent, setShowLatent] = useState(false);
  const [gravity, setGravity] = useState(50);
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [hoveredLink, setHoveredLink] = useState<any>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [expandedNodeId, setExpandedNodeId] = useState<string | null>(null);
  const [transform, setTransform] = useState({ x: 0, y: 0, k: 1 });
  const [isToolbarOpen, setIsToolbarOpen] = useState(true);
  const [structuralIntegrity, setStructuralIntegrity] = useState(true);
  
  // Manual Node Add State
  const [isAddingNode, setIsAddingNode] = useState(false);
  const [newNode, setNewNode] = useState({ label: '', type: 'concept' });
  
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
    
    const isLinkHovered = hoveredLink && (
      (typeof hoveredLink.source === 'string' ? hoveredLink.source : hoveredLink.source.id) === sourceId &&
      (typeof hoveredLink.target === 'string' ? hoveredLink.target : hoveredLink.target.id) === targetId
    );
    
    const isHovered = hoveredNodeId === sourceId || hoveredNodeId === targetId || isLinkHovered;
    const isFocusMode = !!selectedNodeId || !!hoveredNodeId || !!hoveredLink;
    const isNeighbor = (sourceId === selectedNodeId || targetId === selectedNodeId) || 
                       (sourceId === hoveredNodeId || targetId === hoveredNodeId) || isLinkHovered;
    
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
    let color = isSelected || isHovered ? "#e4e4e7" : (isNeighbor ? "rgba(255,255,255,0.4)" : (isFoundational ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.05)"));

    if (link.type === 'explores') {
      dashArray = "4,4"; 
      isFlowing = true;
      width = width * 2; // Thicker for explores
    } else if (link.type === 'documents') {
      dashArray = "10,6";
      isFlowing = true;
    }

    if (link.type === 'tension') {
      color = isSelected || isHovered ? "#f87171" : "#7f1d1d"; // Reddish for tension
      width = width * 1.5;
    }
    
    return {
      opacity,
      width,
      dashArray,
      isFlowing,
      color,
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
    const voidQuotient = node.metadata?.void_quotient || 0;
    
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
    
    // 4. Void Quotient Impact
    const voidMultiplier = 1.0 + (voidQuotient * 0.4);
    
    const finalRadius = (baseRadius + centralityBonus) * saturationMultiplier * voidMultiplier;
    
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
              onClick={(e) => { 
                e.stopPropagation(); 
                setSelectedNodeId(undefined); 
              }}
              className="ml-2 p-1 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-3 h-3 text-zinc-500 hover:text-white" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- TOOLBAR (TOP LEFT) --- */}
      <GraphToolbar 
        isOpen={isToolbarOpen}
        setIsOpen={setIsToolbarOpen}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeTypes={activeTypes}
        setActiveTypes={setActiveTypes}
        activeStatuses={activeStatuses}
        setActiveStatuses={setActiveStatuses}
        clusterMode={clusterMode}
        setClusterMode={setClusterMode}
        showLatent={showLatent}
        setShowLatent={setShowLatent}
        structuralIntegrity={structuralIntegrity}
        setStructuralIntegrity={setStructuralIntegrity}
        gravity={gravity}
        setGravity={setGravity}
        onAddNode={() => setIsAddingNode(true)}
      />

      {/* --- INSIGHT GENERATOR (BOTTOM LEFT) --- */}
      <InsightOverlay 
        selectedNodeId={selectedNodeId}
        selectedInsights={selectedInsights}
      />

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
            const linkId = `latent-${sourceId}-${targetId}-${i}`;
            
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
            const linkId = `link-${sourceId}-${targetId}-${i}`;
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
              <g key={linkId}
                 className="cursor-pointer pointer-events-auto"
                 onMouseEnter={(e) => {
                   setHoveredLink(link);
                   setTooltipPos({ x: e.clientX, y: e.clientY });
                 }}
                 onMouseMove={(e) => {
                   setTooltipPos({ x: e.clientX, y: e.clientY });
                 }}
                 onMouseLeave={() => setHoveredLink(null)}
              >
                {/* Thicker transparent path for easier hover targeting */}
                <path 
                  d={`M ${link.source.x} ${link.source.y} Q ${cx} ${cy} ${link.target.x} ${link.target.y}`}
                  fill="none"
                  stroke="transparent"
                  strokeWidth={20}
                />
                
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
            const isHovered = hoveredNodeId === node.id || (
              hoveredLink && (
                (typeof hoveredLink.source === 'string' ? hoveredLink.source : hoveredLink.source.id) === node.id || 
                (typeof hoveredLink.target === 'string' ? hoveredLink.target : hoveredLink.target.id) === node.id
              )
            );
            
            const isFocusMode = !!selectedNodeId || !!hoveredNodeId || !!hoveredLink;
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
                  onClick={() => {
                    setSelectedNodeId(node.id);
                    setSidebarMode('details');
                    setRightSidebarOpen(true);
                    externalOnNodeSelect?.(node);
                  }}
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
      <ExpansionPanel 
        expandedNodeId={expandedNodeId}
        setExpandedNodeId={setExpandedNodeId}
        nodes={nodes}
        initialLinks={initialLinks}
      />

      {/* Manual Node Add Overlay */}
      <AddNodeModal 
        isOpen={isAddingNode}
        onClose={() => setIsAddingNode(false)}
        onAddNode={(node) => {
          addNode(node);
          logOptimization('refactor', 'Manually added node to graph', { nodeLabel: node.label });
        }}
      />

      {/* Tooltip for Hovered Link */}
      <AnimatePresence>
        {hoveredLink && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed z-[100] p-3 shadow-2xl bg-zinc-950/95 border border-white/20 rounded-xl pointer-events-none backdrop-blur-md"
            style={{ 
              left: tooltipPos.x + 15, 
              top: tooltipPos.y + 15 
            }}
          >
            <div className="text-[10px] uppercase font-bold text-zinc-400 tracking-widest mb-2 flex items-center gap-2">
              <Link2Off className="w-3 h-3 text-zinc-500" /> Connection Detail
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="text-zinc-200 flex justify-between gap-4">
                <span className="text-zinc-500 text-xs">Type:</span> 
                <span className="font-mono text-xs">{hoveredLink.type || hoveredLink.label || 'direct'}</span>
              </div>
              {hoveredLink.score !== undefined && (
                <div className="text-zinc-200 flex justify-between gap-4">
                  <span className="text-zinc-500 text-xs">Score:</span> 
                  <span className="font-mono text-xs">{Number(hoveredLink.score).toFixed(3)}</span>
                </div>
              )}
              {hoveredLink.weight !== undefined && hoveredLink.weight !== hoveredLink.score && (
                <div className="text-zinc-200 flex justify-between gap-4">
                  <span className="text-zinc-500 text-xs">Weight:</span> 
                  <span className="font-mono text-xs">{Number(hoveredLink.weight).toFixed(3)}</span>
                </div>
              )}
              <div className="mt-2 text-xs border-t border-white/5 pt-2">
                <div className="text-zinc-300 max-w-[250px] truncate">
                  {typeof hoveredLink.source === 'string' ? hoveredLink.source : hoveredLink.source.label || hoveredLink.source.id}
                </div>
                <div className="text-[#00e5ff] font-mono text-[9px] pl-2 leading-none border-l border-white/10 ml-1 py-1">
                  connects to
                </div>
                <div className="text-zinc-300 max-w-[250px] truncate">
                  {typeof hoveredLink.target === 'string' ? hoveredLink.target : hoveredLink.target.label || hoveredLink.target.id}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

