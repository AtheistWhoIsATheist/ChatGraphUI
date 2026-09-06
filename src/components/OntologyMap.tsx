import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import {
  Layers,
  Sparkles,
  Sliders,
  RefreshCw,
  Zap,
  ChevronRight,
  Eye,
  EyeOff,
  Flame,
  Radio,
  Network,
  HelpCircle
} from 'lucide-react';
import { OntologyNode, OntologyLink, CorpusText, initialNodes, initialLinks } from '../data/ontology';
import { ProductionGraphViewer } from './ProductionGraphViewer';
import { CorpusIngestionBatch, Marginalia } from '../types';

interface OntologyMapProps {
  nodes?: OntologyNode[];
  links?: OntologyLink[];
  corpusTexts?: CorpusText[];
  marginalia?: Marginalia[];
  selectedNodeId?: string | null;
  hoveredNodeId?: string | null;
  onSelectNode?: (nodeId: string | null) => void;
  onHoverNode?: (nodeId: string | null) => void;
  onSelectQuestion?: (question: string) => void;
  onNavigateToTab?: (tab: any) => void;
  ingestionBatches?: CorpusIngestionBatch[];
  initialFocusSource?: string | null;
}

// Coordinate layout mapping for the Framer Motion reactive ontological nodes
const NODE_COORDINATES: Record<string, { x: number; y: number }> = {
  void: { x: 50, y: 35 },
  nihil: { x: 28, y: 48 },
  sunyata: { x: 72, y: 46 },
  apophasis: { x: 40, y: 68 },
  entropy: { x: 18, y: 22 },
  absurd: { x: 15, y: 72 },
  epoche: { x: 82, y: 25 },
  aporia: { x: 85, y: 70 },
  detachment: { x: 60, y: 78 }
};

export const OntologyMap: React.FC<OntologyMapProps> = ({
  nodes: propNodes,
  links: propLinks,
  selectedNodeId: externalSelectedNodeId,
  hoveredNodeId: externalHoveredNodeId,
  onSelectNode: externalOnSelectNode,
  onHoverNode: externalOnHoverNode,
  onSelectQuestion,
  onNavigateToTab,
  ingestionBatches,
  initialFocusSource,
  marginalia = []
}) => {
  // Local state for interactive nodes with live-tunable absorptionAxis metadata
  const [localNodes, setLocalNodes] = useState<OntologyNode[]>(() => {
    const base = propNodes && propNodes.length > 0 ? propNodes : initialNodes;
    return base.map(n => ({
      ...n,
      absorptionAxis: n.metadata?.absorptionAxis ?? n.absorptionAxis ?? 0.5,
      metadata: {
        ...n.metadata,
        absorptionAxis: n.metadata?.absorptionAxis ?? n.absorptionAxis ?? 0.5
      }
    }));
  });

  const [localLinks] = useState<OntologyLink[]>(() => propLinks && propLinks.length > 0 ? propLinks : initialLinks);

  // Void Depth State Filter (0.00 to 1.00)
  const [voidDepth, setVoidDepth] = useState<number>(0.35);

  // View Mode: 'interactive_matrix' (Framer Motion reactive map) or 'corpus_graph' (1,155-Node production canvas)
  const [viewMode, setViewMode] = useState<'interactive_matrix' | 'corpus_graph'>('interactive_matrix');

  // Node selection & hover states
  const [internalSelectedId, setInternalSelectedId] = useState<string | null>('void');
  const [internalHoveredId, setInternalHoveredId] = useState<string | null>(null);

  const selectedNodeId = externalSelectedNodeId !== undefined ? externalSelectedNodeId : internalSelectedId;
  const hoveredNodeId = externalHoveredNodeId !== undefined ? externalHoveredNodeId : internalHoveredId;

  const handleSelectNode = (id: string | null) => {
    setInternalSelectedId(id);
    if (externalOnSelectNode) externalOnSelectNode(id);
  };

  const handleHoverNode = (id: string | null) => {
    setInternalHoveredId(id);
    if (externalOnHoverNode) externalOnHoverNode(id);
  };

  // Isolate connections toggle: clicking a node isolates immediate relationships
  const [isolateConnected, setIsolateConnected] = useState<boolean>(true);

  // Auto-flux simulation state (to observe dynamic Framer Motion glow transitions)
  const [isFluxSimulating, setIsFluxSimulating] = useState<boolean>(false);
  const fluxTimerRef = useRef<number | null>(null);

  // Connected nodes calculation for graph relationship highlighting and dimming
  const connectedNodeIds = useMemo(() => {
    const set = new Set<string>();
    if (!selectedNodeId) return set;
    set.add(selectedNodeId);
    localLinks.forEach(link => {
      if (link.source === selectedNodeId) set.add(link.target);
      if (link.target === selectedNodeId) set.add(link.source);
    });
    return set;
  }, [selectedNodeId, localLinks]);

  // Selected node object
  const activeSelectedNode = useMemo(() => {
    return localNodes.find(n => n.id === selectedNodeId) || localNodes[0];
  }, [localNodes, selectedNodeId]);

  // Void Depth metrics
  const conformingNodesCount = useMemo(() => {
    return localNodes.filter(n => {
      const abs = n.metadata?.absorptionAxis ?? n.absorptionAxis ?? 0.5;
      return abs >= voidDepth;
    }).length;
  }, [localNodes, voidDepth]);

  // Function to tune absorption axis metadata for a specific node in real time
  const handleUpdateAbsorptionAxis = (nodeId: string, newAbsorption: number) => {
    const clamped = Math.max(0.0, Math.min(1.0, parseFloat(newAbsorption.toFixed(3))));
    setLocalNodes(prev => prev.map(node => {
      if (node.id === nodeId) {
        return {
          ...node,
          absorptionAxis: clamped,
          metadata: {
            ...node.metadata,
            absorptionAxis: clamped
          }
        };
      }
      return node;
    }));
  };

  // Simulation loop for smooth live Framer Motion transitions
  useEffect(() => {
    if (!isFluxSimulating) {
      if (fluxTimerRef.current) {
        window.clearInterval(fluxTimerRef.current);
        fluxTimerRef.current = null;
      }
      return;
    }

    fluxTimerRef.current = window.setInterval(() => {
      setLocalNodes(prev => prev.map(node => {
        const currentAbs = node.metadata?.absorptionAxis ?? node.absorptionAxis ?? 0.5;
        // Oscillate or perturb by small delta
        const delta = (Math.random() - 0.48) * 0.18;
        const newAbs = Math.max(0.1, Math.min(0.99, currentAbs + delta));
        return {
          ...node,
          absorptionAxis: parseFloat(newAbs.toFixed(3)),
          metadata: {
            ...node.metadata,
            absorptionAxis: parseFloat(newAbs.toFixed(3))
          }
        };
      }));
    }, 1800);

    return () => {
      if (fluxTimerRef.current) {
        window.clearInterval(fluxTimerRef.current);
      }
    };
  }, [isFluxSimulating]);

  // Reset or randomize absorption states
  const handleRandomizeAbsorption = () => {
    setLocalNodes(prev => prev.map(node => {
      const randomAbs = parseFloat((0.2 + Math.random() * 0.78).toFixed(2));
      return {
        ...node,
        absorptionAxis: randomAbs,
        metadata: {
          ...node.metadata,
          absorptionAxis: randomAbs
        }
      };
    }));
  };

  const handleResetAbsorption = () => {
    setLocalNodes(initialNodes.map(n => ({
      ...n,
      absorptionAxis: n.metadata?.absorptionAxis ?? 0.5,
      metadata: { ...n.metadata, absorptionAxis: n.metadata?.absorptionAxis ?? 0.5 }
    })));
    setVoidDepth(0.35);
  };

  return (
    <div id="ontology-map-root" className="h-full w-full flex flex-col bg-[#050507] text-neutral-200 overflow-hidden font-sans select-none">
      
      {/* 1. Header with 'Void Depth' Slider Component & View Controls */}
      <header className="bg-neutral-950/95 border-b border-neutral-900 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 z-30 backdrop-blur-md">
        
        {/* Left: Branding & Core Indicator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-600 to-cyan-500 p-0.5 shadow-lg shadow-violet-500/20 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-neutral-100">
                  Ontology Map
                </span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold bg-violet-500/20 text-violet-300 border border-violet-500/30">
                  ABSORPTION MATRIX
                </span>
              </div>
              <p className="text-[10px] text-neutral-500 font-mono hidden sm:block">
                Dynamic Void Depth state filtering & Framer Motion glow transitions
              </p>
            </div>
          </div>

          {/* Mode Switcher Pills */}
          <div className="hidden lg:flex items-center bg-neutral-900 border border-neutral-800 p-0.5 rounded-xl font-mono text-[11px]">
            <button
              onClick={() => setViewMode('interactive_matrix')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'interactive_matrix'
                  ? 'bg-violet-600/30 border border-violet-500/50 text-violet-200 font-semibold shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Zap className="w-3 h-3 text-violet-400" />
              <span>Reactive Matrix</span>
            </button>
            <button
              onClick={() => setViewMode('corpus_graph')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'corpus_graph'
                  ? 'bg-cyan-600/30 border border-cyan-500/50 text-cyan-200 font-semibold shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Network className="w-3 h-3 text-cyan-400" />
              <span>1,155-Node Corpus</span>
            </button>
          </div>
        </div>

        {/* Center: 'Void Depth' Slider Component */}
        <div className="flex items-center gap-3 bg-neutral-900/90 border border-neutral-800/80 px-3.5 py-1.5 rounded-2xl shadow-inner shadow-black/40">
          <div className="flex items-center gap-2 text-violet-400">
            <Layers className="w-4 h-4 text-violet-400" />
            <span className="font-mono font-bold text-xs uppercase tracking-wider text-neutral-200">
              Void Depth
            </span>
          </div>

          {/* Range Slider */}
          <div className="flex items-center gap-2">
            <input
              id="void-depth-slider"
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={voidDepth}
              onChange={(e) => setVoidDepth(parseFloat(e.target.value))}
              className="w-24 sm:w-36 md:w-44 h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-violet-500 hover:accent-violet-400 transition-all"
              title="Adjust Void Depth threshold to dynamically dim non-conforming nodes in the graph"
            />
            
            {/* Dynamic Value Pill */}
            <span className={`px-2 py-0.5 rounded-lg font-mono text-[11px] font-bold border transition-colors ${
              voidDepth >= 0.70
                ? 'bg-violet-500/20 text-violet-300 border-violet-500/40 glow-violet'
                : voidDepth >= 0.35
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 glow-cyan'
                : 'bg-neutral-800 text-neutral-400 border-neutral-700'
            }`}>
              {(voidDepth * 100).toFixed(0)}%
            </span>
          </div>

          {/* Preset Buttons */}
          <div className="hidden md:flex items-center gap-1 font-mono text-[10px]">
            <button
              onClick={() => setVoidDepth(0)}
              className={`px-1.5 py-0.5 rounded border transition-colors cursor-pointer ${
                voidDepth === 0 ? 'bg-neutral-700 text-white border-neutral-600' : 'bg-neutral-950 text-neutral-500 border-neutral-800 hover:text-neutral-300'
              }`}
              title="All nodes illuminated (0% Void Depth)"
            >
              Omni
            </button>
            <button
              onClick={() => setVoidDepth(0.40)}
              className={`px-1.5 py-0.5 rounded border transition-colors cursor-pointer ${
                voidDepth === 0.40 ? 'bg-cyan-500/30 text-cyan-200 border-cyan-500/50' : 'bg-neutral-950 text-neutral-500 border-neutral-800 hover:text-cyan-300'
              }`}
              title="Liminal Void Depth (40%)"
            >
              Liminal
            </button>
            <button
              onClick={() => setVoidDepth(0.75)}
              className={`px-1.5 py-0.5 rounded border transition-colors cursor-pointer ${
                voidDepth === 0.75 ? 'bg-violet-500/30 text-violet-200 border-violet-500/50' : 'bg-neutral-950 text-neutral-500 border-neutral-800 hover:text-violet-300'
              }`}
              title="Abyssal Void Depth (75%)"
            >
              Abyssal
            </button>
            <button
              onClick={() => setVoidDepth(0.90)}
              className={`px-1.5 py-0.5 rounded border transition-colors cursor-pointer ${
                voidDepth === 0.90 ? 'bg-purple-600/40 text-purple-200 border-purple-500/60' : 'bg-neutral-950 text-neutral-500 border-neutral-800 hover:text-purple-300'
              }`}
              title="Singularity Void Depth (90%)"
            >
              Singularity
            </button>
          </div>

          {/* Conforming Metric Pill */}
          <div className="hidden xl:flex items-center gap-1 font-mono text-[10px] text-neutral-400 pl-1 border-l border-neutral-800">
            <span className="text-neutral-300 font-bold">{conformingNodesCount}</span>
            <span>/</span>
            <span>{localNodes.length} Illuminated</span>
          </div>
        </div>

        {/* Right: Simulation Triggers & Actions */}
        <div className="flex items-center gap-2">
          {/* Live Wave Simulation Toggle */}
          <button
            onClick={() => setIsFluxSimulating(!isFluxSimulating)}
            className={`px-2.5 py-1.5 rounded-xl border flex items-center gap-1.5 font-mono text-xs transition-all cursor-pointer ${
              isFluxSimulating
                ? 'bg-violet-500/20 border-violet-500/50 text-violet-200 shadow-sm animate-pulse'
                : 'bg-neutral-900 hover:bg-neutral-850 border-neutral-800 text-neutral-300 hover:text-white'
            }`}
            title="Simulate continuous absorption flux to watch Framer Motion animate CSS glow transitions smoothly"
          >
            <Radio className={`w-3.5 h-3.5 ${isFluxSimulating ? 'text-violet-400 animate-spin' : 'text-neutral-400'}`} />
            <span className="hidden sm:inline font-semibold">
              {isFluxSimulating ? 'Simulating Flux' : 'Simulate Wave'}
            </span>
          </button>

          {/* Randomize Metadata button */}
          <button
            onClick={handleRandomizeAbsorption}
            className="p-1.5 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 rounded-xl text-neutral-400 hover:text-cyan-300 transition-colors cursor-pointer"
            title="Randomize Absorption Axis metadata values"
          >
            <Flame className="w-3.5 h-3.5" />
          </button>

          {/* Reset button */}
          <button
            onClick={handleResetAbsorption}
            className="p-1.5 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 rounded-xl text-neutral-400 hover:text-white transition-colors cursor-pointer"
            title="Reset Absorption Axis to initial values"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* 2. Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {viewMode === 'corpus_graph' ? (
          // Full 1,155-Node Production Graph Viewer with unified voidDepth
          <div className="w-full h-full">
            <ProductionGraphViewer
              customNodes={localNodes}
              customLinks={localLinks}
              onNavigateToTab={onNavigateToTab}
              ingestionBatches={ingestionBatches}
              initialFocusSource={initialFocusSource}
              voidDepth={voidDepth}
              onVoidDepthChange={setVoidDepth}
            />
          </div>
        ) : (
          // Reactive Framer Motion Matrix View
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
            
            {/* Interactive Graph Canvas Stage */}
            <div className="flex-1 relative overflow-hidden bg-radial from-neutral-900/30 to-black p-4 flex items-center justify-center">
              
              {/* Dynamic SVG Filter Defs for Node Halo Effects */}
              <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
                <defs>
                  {/* Cyan Cosmic Glow Filter */}
                  <filter id="svg-glow-cyan" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="6" result="blur1" />
                    <feGaussianBlur stdDeviation="14" result="blur2" />
                    <feMerge>
                      <feMergeNode in="blur2" />
                      <feMergeNode in="blur1" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>

                  {/* Violet Ethereal Glow Filter */}
                  <filter id="svg-glow-violet" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="8" result="blur1" />
                    <feGaussianBlur stdDeviation="18" result="blur2" />
                    <feMerge>
                      <feMergeNode in="blur2" />
                      <feMergeNode in="blur1" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>

                  {/* Dynamic Gradient for Energy Links */}
                  <linearGradient id="link-grad-violet-cyan" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.8" />
                  </linearGradient>
                  
                  <linearGradient id="link-grad-cyan" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.7" />
                    <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.7" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Background Grid Texture */}
              <div
                className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                  backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.7) 1px, transparent 0)',
                  backgroundSize: '32px 32px'
                }}
              />

              {/* Connecting Vector Links Layer */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
                {localLinks.map((link, idx) => {
                  const srcCoords = NODE_COORDINATES[link.source];
                  const tgtCoords = NODE_COORDINATES[link.target];
                  if (!srcCoords || !tgtCoords) return null;

                  const srcNode = localNodes.find(n => n.id === link.source);
                  const tgtNode = localNodes.find(n => n.id === link.target);

                  const srcAbsorption = srcNode?.metadata?.absorptionAxis ?? srcNode?.absorptionAxis ?? 0.5;
                  const tgtAbsorption = tgtNode?.metadata?.absorptionAxis ?? tgtNode?.absorptionAxis ?? 0.5;
                  const avgAbsorption = (srcAbsorption + tgtAbsorption) / 2;

                  const isConnectedToSelected = selectedNodeId === link.source || selectedNodeId === link.target;
                  const isConnectedToHovered = hoveredNodeId === link.source || hoveredNodeId === link.target;

                  // Dim link if either endpoint is below Void Depth threshold
                  const isNonConforming = avgAbsorption < voidDepth;
                  let linkOpacity = 0.35;

                  if (isNonConforming && voidDepth > 0) {
                    const shortfall = voidDepth - avgAbsorption;
                    linkOpacity = Math.max(0.04, 0.40 - shortfall * 1.5);
                  }

                  if (selectedNodeId && isolateConnected) {
                    if (!isConnectedToSelected) {
                      linkOpacity = 0.03;
                    } else {
                      linkOpacity = 0.90;
                    }
                  }

                  const isHighAbsorption = avgAbsorption >= 0.70;
                  const strokeGrad = isHighAbsorption ? 'url(#link-grad-violet-cyan)' : 'url(#link-grad-cyan)';

                  return (
                    <g key={`link-${link.source}-${link.target}-${idx}`}>
                      {/* Base link path with Framer Motion transition */}
                      <motion.path
                        d={`M ${srcCoords.x}% ${srcCoords.y}% Q ${(srcCoords.x + tgtCoords.x) / 2 + 3}% ${(srcCoords.y + tgtCoords.y) / 2 - 3}% ${tgtCoords.x}% ${tgtCoords.y}%`}
                        stroke={isConnectedToSelected ? '#22d3ee' : strokeGrad}
                        strokeWidth={isConnectedToSelected ? 2.5 : isConnectedToHovered ? 2.0 : 1.2}
                        strokeDasharray={isConnectedToSelected ? '4 4' : 'none'}
                        fill="none"
                        initial={false}
                        animate={{
                          strokeOpacity: linkOpacity,
                          strokeWidth: isConnectedToSelected ? 2.8 : Math.max(1, link.intensity * 0.4)
                        }}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                      />

                      {/* Animated particle pulse for active illuminated links */}
                      {isConnectedToSelected && linkOpacity > 0.4 && (
                        <circle r="3" fill="#38bdf8" className="animate-ping">
                          <animateMotion
                            path={`M ${srcCoords.x}% ${srcCoords.y}% Q ${(srcCoords.x + tgtCoords.x) / 2 + 3}% ${(srcCoords.y + tgtCoords.y) / 2 - 3}% ${tgtCoords.x}% ${tgtCoords.y}%`}
                            dur="3s"
                            repeatCount="indefinite"
                          />
                        </circle>
                      )}
                    </g>
                  );
                })}
              </svg>

              {/* Interactive Node Grid Stage */}
              <div className="relative w-full h-full max-w-6xl max-h-[780px] z-20">
                {localNodes.map((node) => {
                  const coords = NODE_COORDINATES[node.id] || { x: 50, y: 50 };
                  const isSelected = selectedNodeId === node.id;
                  const isHovered = hoveredNodeId === node.id;
                  const isConnected = connectedNodeIds.has(node.id);

                  // Extract absorption axis metadata value
                  const absorptionAxis = node.metadata?.absorptionAxis ?? node.absorptionAxis ?? 0.5;

                  // Determine CSS Glow Class based on absorption axis threshold:
                  // Higher absorption (>= 0.70) resolves to 'glow-violet', moderate/lower resolves to 'glow-cyan'
                  const isVioletGlow = absorptionAxis >= 0.70;
                  const glowClass = isVioletGlow ? 'glow-violet' : 'glow-cyan';
                  const textGlowClass = isVioletGlow ? 'text-glow-violet' : 'text-glow-cyan';

                  const isInvariant = marginalia.some(m => m.corpusId === node.id && m.noteText.toLowerCase().includes('invariant'));

                  // Dynamic Void Depth Dimming Calculation:
                  // If node's absorption axis is less than voidDepth threshold, calculate proportional dimming opacity
                  const isNonConforming = absorptionAxis < voidDepth;
                  let targetOpacity = 1.0;

                  if (isNonConforming && voidDepth > 0) {
                    const shortfall = voidDepth - absorptionAxis;
                    targetOpacity = Math.max(0.08, 1.0 - shortfall * 2.2);
                  }

                  if (selectedNodeId && isolateConnected && !isConnected) {
                    targetOpacity = Math.min(targetOpacity, 0.12);
                  }

                  // Dynamic Scale & Glow intensity calculations
                  const glowSpread = 16 + absorptionAxis * 28;
                  const glowBlur = 24 + absorptionAxis * 40;
                  const glowColor = isVioletGlow
                    ? `rgba(139, 92, 246, ${0.35 + absorptionAxis * 0.55})`
                    : `rgba(34, 211, 238, ${0.35 + absorptionAxis * 0.55})`;

                  return (
                    <motion.div
                      key={node.id}
                      id={`node-${node.id}`}
                      style={{
                        position: 'absolute',
                        left: `${coords.x}%`,
                        top: `${coords.y}%`,
                        transform: 'translate(-50%, -50%)',
                        transformOrigin: 'center center'
                      }}
                      initial={false}
                      animate={{
                        scale: isSelected ? 1.08 : isHovered ? 1.04 : 1.0,
                        opacity: targetOpacity,
                        boxShadow: `0 0 ${glowSpread}px ${glowColor}, 0 0 ${glowBlur}px ${glowColor}`,
                        borderColor: isSelected
                          ? '#ffffff'
                          : isVioletGlow
                          ? 'rgba(167, 139, 250, 0.8)'
                          : 'rgba(56, 189, 248, 0.75)',
                      }}
                      transition={{
                        type: 'spring',
                        stiffness: 280,
                        damping: 24,
                        mass: 0.8
                      }}
                      onClick={() => handleSelectNode(node.id)}
                      onMouseEnter={() => handleHoverNode(node.id)}
                      onMouseLeave={() => handleHoverNode(null)}
                      className={`group cursor-pointer rounded-2xl border bg-neutral-950/90 backdrop-blur-md p-3 sm:p-3.5 transition-colors select-none ${glowClass} ${
                        isSelected
                          ? 'ring-2 ring-violet-400 ring-offset-2 ring-offset-black z-30'
                          : 'z-20 hover:border-neutral-400'
                      }`}
                    >
                      {/* Node Header Pill: Type Badge & Absorption Axis Indicator */}
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono uppercase font-bold tracking-wider ${
                          isVioletGlow
                            ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                            : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        }`}>
                          {node.type}
                        </span>

                        {/* Live Absorption Axis Value Badge */}
                        <div className="flex items-center gap-1 font-mono text-[9px] font-bold">
                          <span className="text-neutral-500">ABS:</span>
                          <span className={isVioletGlow ? 'text-violet-300' : 'text-cyan-300'}>
                            {absorptionAxis.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Node Main Title */}
                      <h4 className={`font-display text-xs sm:text-sm font-semibold tracking-wide text-white transition-all ${textGlowClass}`}>
                        {node.label}
                      </h4>

                      {/* Sub-label / Resonance Bar */}
                      <div className="mt-2 flex items-center justify-between gap-2 text-[10px] font-mono text-neutral-400">
                        <span className="truncate max-w-[110px] text-neutral-500">{node.era}</span>
                        <div className="w-12 h-1 bg-neutral-800 rounded-full overflow-hidden">
                          <motion.div
                            className={`h-full ${isVioletGlow ? 'bg-violet-500' : 'bg-cyan-400'}`}
                            initial={false}
                            animate={{ width: `${node.resonance}%` }}
                            transition={{ duration: 0.5 }}
                          />
                        </div>
                      </div>

                      {/* Selection Ring Glow Tag */}
                      {isSelected && (
                        <motion.div
                          layoutId="selected-indicator-halo"
                          className="absolute -inset-1 rounded-2xl border border-violet-400/60 pointer-events-none"
                          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        />
                      )}

                      {/* Invariant Glowing Pulse Tag */}
                      {isInvariant && (
                        <div className="absolute -inset-1.5 rounded-2xl border-2 border-amber-500/60 animate-pulse pointer-events-none shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
                      )}
                    </motion.div>
                  );
                })}
              </div>

              {/* Bottom Canvas Controls & Legend */}
              <div className="absolute bottom-3 left-3 flex flex-wrap items-center gap-2 z-20">
                <div className="bg-neutral-950/85 border border-neutral-800 backdrop-blur-md px-3 py-1.5 rounded-xl font-mono text-[10px] text-neutral-400 flex items-center gap-3">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
                    <span>glow-cyan (&lt;0.70)</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-violet-400 shadow-[0_0_8px_#8b5cf6]" />
                    <span>glow-violet (≥0.70)</span>
                  </span>
                </div>

                {/* Isolate Connected Toggle */}
                <button
                  onClick={() => setIsolateConnected(!isolateConnected)}
                  className={`px-2.5 py-1.5 rounded-xl border font-mono text-[10px] flex items-center gap-1.5 transition-all cursor-pointer ${
                    isolateConnected
                      ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300 font-bold'
                      : 'bg-neutral-950/85 border-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                  title="Dim non-connected nodes when an entity is selected"
                >
                  {isolateConnected ? <Eye className="w-3 h-3 text-cyan-400" /> : <EyeOff className="w-3 h-3 text-neutral-500" />}
                  <span>{isolateConnected ? 'Focus Connected (ON)' : 'Focus Connected (OFF)'}</span>
                </button>
              </div>
            </div>

            {/* Right Side: Active Node Inspector & Live Absorption Axis Tuner HUD */}
            <div className="w-full md:w-84 lg:w-96 border-t md:border-t-0 md:border-l border-neutral-900 bg-neutral-950/90 backdrop-blur-xl flex flex-col z-20">
              
              {/* Panel Header */}
              <div className="px-4 py-3 border-b border-neutral-900 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-violet-400" />
                  <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-neutral-200">
                    Entity Inspector
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-neutral-500">
                  ID: {activeSelectedNode.id}
                </span>
              </div>

              {/* Scrollable Node Inspector Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                
                {/* Node Identity Card */}
                <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-2xl p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-mono uppercase font-bold tracking-wider bg-neutral-800 text-neutral-300 border border-neutral-700">
                        {activeSelectedNode.type}
                      </span>
                      <h3 className="font-display text-lg font-bold text-white mt-1.5">
                        {activeSelectedNode.label}
                      </h3>
                      <p className="text-[11px] font-mono text-neutral-400">
                        Era: {activeSelectedNode.era}
                      </p>
                    </div>

                    {/* Resonance score pill */}
                    <div className="text-right font-mono">
                      <div className="text-xs font-bold text-cyan-400">{activeSelectedNode.resonance}%</div>
                      <div className="text-[9px] text-neutral-500 uppercase">Resonance</div>
                    </div>
                  </div>

                  <p className="text-xs text-neutral-300 leading-relaxed">
                    {activeSelectedNode.summary}
                  </p>
                </div>

                {/* 🌟 LIVE ABSORPTION AXIS METADATA TUNER */}
                <div className="bg-gradient-to-br from-violet-950/20 to-neutral-900/80 border border-violet-500/30 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Flame className="w-4 h-4 text-violet-400" />
                      <span className="font-mono text-xs font-bold uppercase tracking-wider text-violet-200">
                        Absorption Axis
                      </span>
                    </div>
                    <span className={`px-2 py-0.5 rounded font-mono text-xs font-bold ${
                      (activeSelectedNode.metadata?.absorptionAxis ?? 0.5) >= 0.70
                        ? 'bg-violet-500/30 text-violet-300 border border-violet-500/50 glow-violet'
                        : 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/50 glow-cyan'
                    }`}>
                      {(activeSelectedNode.metadata?.absorptionAxis ?? 0.5).toFixed(2)}
                    </span>
                  </div>

                  <p className="text-[11px] text-neutral-400">
                    Adjust this slider to dynamically test Framer Motion CSS glow class transitions (<code className="text-cyan-300">glow-cyan</code> vs <code className="text-violet-300">glow-violet</code>) in real time.
                  </p>

                  {/* Tuner Range Slider */}
                  <div className="space-y-1 pt-1">
                    <input
                      id="node-absorption-slider"
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={activeSelectedNode.metadata?.absorptionAxis ?? 0.5}
                      onChange={(e) => handleUpdateAbsorptionAxis(activeSelectedNode.id, parseFloat(e.target.value))}
                      className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-violet-500 hover:accent-violet-400 transition-all"
                    />
                    <div className="flex justify-between font-mono text-[9px] text-neutral-500 px-0.5">
                      <span>0.00 (Cyan)</span>
                      <span className="text-violet-400 font-bold">0.70 Threshold</span>
                      <span>1.00 (Violet)</span>
                    </div>
                  </div>

                  {/* Quick Preset Buttons for Selected Node */}
                  <div className="flex items-center gap-1.5 pt-1">
                    <button
                      onClick={() => handleUpdateAbsorptionAxis(activeSelectedNode.id, 0.35)}
                      className="flex-1 py-1 px-2 rounded-lg bg-neutral-800 hover:bg-neutral-750 border border-neutral-700 text-cyan-300 font-mono text-[10px] transition-colors cursor-pointer text-center"
                    >
                      0.35 (Cyan)
                    </button>
                    <button
                      onClick={() => handleUpdateAbsorptionAxis(activeSelectedNode.id, 0.72)}
                      className="flex-1 py-1 px-2 rounded-lg bg-neutral-800 hover:bg-neutral-750 border border-neutral-700 text-violet-300 font-mono text-[10px] transition-colors cursor-pointer text-center"
                    >
                      0.72 (Violet)
                    </button>
                    <button
                      onClick={() => handleUpdateAbsorptionAxis(activeSelectedNode.id, 0.95)}
                      className="flex-1 py-1 px-2 rounded-lg bg-neutral-800 hover:bg-neutral-750 border border-neutral-700 text-purple-300 font-mono text-[10px] transition-colors cursor-pointer text-center"
                    >
                      0.95 (Deep)
                    </button>
                  </div>
                </div>

                {/* Philosophical Reflection Questions */}
                {activeSelectedNode.questions && activeSelectedNode.questions.length > 0 && (
                  <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-2xl p-4 space-y-2.5">
                    <div className="flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-wider text-neutral-300">
                      <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Reflection Inquiries</span>
                    </div>
                    <div className="space-y-2">
                      {activeSelectedNode.questions.map((q, idx) => (
                        <div
                          key={idx}
                          onClick={() => onSelectQuestion && onSelectQuestion(q)}
                          className="p-2.5 rounded-xl bg-neutral-950/80 hover:bg-neutral-800/60 border border-neutral-800/80 hover:border-cyan-500/40 text-xs text-neutral-300 cursor-pointer transition-all flex items-start gap-2 group"
                        >
                          <ChevronRight className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5 group-hover:translate-x-0.5 transition-transform" />
                          <span className="group-hover:text-white leading-relaxed">{q}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Immediate Linked Concepts */}
                <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-2xl p-4 space-y-2.5">
                  <div className="flex items-center justify-between font-mono text-xs">
                    <span className="font-bold uppercase tracking-wider text-neutral-300">
                      Immediate Relations
                    </span>
                    <span className="text-neutral-500">
                      {localLinks.filter(l => l.source === activeSelectedNode.id || l.target === activeSelectedNode.id).length} links
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {localLinks
                      .filter(l => l.source === activeSelectedNode.id || l.target === activeSelectedNode.id)
                      .map((l, idx) => {
                        const targetId = l.source === activeSelectedNode.id ? l.target : l.source;
                        const targetNode = localNodes.find(n => n.id === targetId);
                        if (!targetNode) return null;
                        const targetAbs = targetNode.metadata?.absorptionAxis ?? 0.5;

                        return (
                          <div
                            key={idx}
                            onClick={() => handleSelectNode(targetId)}
                            className="flex items-center justify-between p-2 rounded-xl bg-neutral-950/80 hover:bg-neutral-800 border border-neutral-850 hover:border-neutral-700 text-xs cursor-pointer transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                              <span className="text-neutral-200 font-medium">{targetNode.label}</span>
                            </div>
                            <span className={`text-[10px] font-mono font-bold ${
                              targetAbs >= 0.70 ? 'text-violet-300' : 'text-cyan-300'
                            }`}>
                              ABS {targetAbs.toFixed(2)}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
