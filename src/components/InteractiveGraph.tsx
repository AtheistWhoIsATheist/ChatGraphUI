import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sliders, Compass, RefreshCw, Network, Route } from 'lucide-react';
import { OntologyNode, OntologyLink } from '../data/ontology';
import { useSimulation, PhysicsParams } from '../hooks/useSimulation';
import { NetworkGraph } from './NetworkGraph';
import { NetworkGraph3D } from './NetworkGraph3D';

interface InteractiveGraphProps {
  nodes: OntologyNode[];
  links: OntologyLink[];
  selectedNodeId: string | null;
  hoveredNodeId: string | null;
  onSelectNode: (nodeId: string | null) => void;
  onHoverNode: (nodeId: string | null) => void;
  searchQuery?: string;
  matchedNodeIds?: Set<string>;
}

const DEFAULT_PHYSICS: PhysicsParams = {
  chargeStrength: -200,
  linkDistance: 130,
  gravity: 0.04,
  friction: 0.85
};

export const InteractiveGraph: React.FC<InteractiveGraphProps> = ({
  nodes,
  links,
  selectedNodeId,
  hoveredNodeId,
  onSelectNode,
  onHoverNode,
  searchQuery = '',
  matchedNodeIds = new Set()
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  
  // 1. Interactive settings & dimension states
  const [dimensions, setDimensions] = useState({ width: 600, height: 450 });
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');
  const [layoutMode, setLayoutMode] = useState<'force' | 'tree'>('force');
  const [showSettings, setShowSettings] = useState(false);
  const [physics, setPhysics] = useState<PhysicsParams>(DEFAULT_PHYSICS);

  // 2. Responsive Observer targeting layout containers
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width, height } = entries[0].contentRect;
      
      // Keep boundaries reasonable
      setDimensions({
        width: Math.max(320, Math.floor(width)),
        height: Math.max(350, Math.floor(height || 450))
      });
    });

    observer.observe(containerRef.current);
    return () => {
      observer.disconnect();
    };
  }, []);

  // 3. Harness our optimized custom simulation hook
  const { simulatedNodes, simulatedLinks } = useSimulation(
    nodes,
    links,
    dimensions.width,
    dimensions.height,
    physics
  );

  const activeNode = nodes.find(n => n.id === (selectedNodeId || hoveredNodeId)) || null;

  // Compute distance map for 2-Step Distance Neighborhood Highlighting
  const distanceMap = useMemo(() => {
    const map = new Map<string, number>();
    if (!selectedNodeId) return map;

    const adj = new Map<string, string[]>();
    nodes.forEach(n => adj.set(n.id, []));
    links.forEach(l => {
      const s = typeof l.source === 'object' && l.source !== null ? (l.source as any).id : (l.source as string);
      const t = typeof l.target === 'object' && l.target !== null ? (l.target as any).id : (l.target as string);
      if (adj.has(s)) adj.get(s)!.push(t);
      if (adj.has(t)) adj.get(t)!.push(s);
    });

    const queue: { id: string; dist: number }[] = [{ id: selectedNodeId, dist: 0 }];
    map.set(selectedNodeId, 0);

    let head = 0;
    while (head < queue.length) {
      const { id, dist } = queue[head++];
      if (dist >= 2) continue; // max distance 2

      const neighbors = adj.get(id) || [];
      for (const neighbor of neighbors) {
        if (!map.has(neighbor)) {
          map.set(neighbor, dist + 1);
          queue.push({ id: neighbor, dist: dist + 1 });
        }
      }
    }
    return map;
  }, [selectedNodeId, nodes, links]);

  return (
    <div
      id="interactive-ontology-graph-container"
      ref={containerRef}
      className="relative w-full h-[400px] md:h-[520px] bg-black border border-neutral-900 rounded-2xl overflow-hidden flex items-center justify-center select-none shadow-[0_4px_30px_rgba(0,0,0,0.8)]"
    >
      {/* 2D Render Canvas / SVG Viewport */}
      {viewMode === '2d' ? (
        <NetworkGraph
          nodes={nodes}
          links={links}
          selectedNodeId={selectedNodeId}
          hoveredNodeId={hoveredNodeId}
          onSelectNode={onSelectNode}
          onHoverNode={onHoverNode}
          width={dimensions.width}
          height={dimensions.height}
          distanceMap={distanceMap}
          layoutMode={layoutMode}
          searchQuery={searchQuery}
          matchedNodeIds={matchedNodeIds}
        />
      ) : (
        /* 3D WebGL Cosmos Rendering */
        <NetworkGraph3D
          nodes={simulatedNodes}
          links={simulatedLinks}
          selectedNodeId={selectedNodeId}
          hoveredNodeId={hoveredNodeId}
          onSelectNode={onSelectNode}
          onHoverNode={onHoverNode}
          width={dimensions.width}
          height={dimensions.height}
          distanceMap={distanceMap}
        />
      )}

      {/* Floating Header UI */}
      <div className="absolute top-4 left-4 z-10 pointer-events-none flex flex-col gap-1.5">
        <h3 className="font-display text-xs tracking-widest text-neutral-400 uppercase font-medium flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5 text-neutral-500 animate-spin-slow" />
          Ontological Dynamic Map
        </h3>
        <p className="text-[10px] text-neutral-600 font-mono">
          {viewMode === '2d' ? (layoutMode === 'force' ? '2D Force Projection' : '2D Hierarchical Tree') : '3D Multi-Dimensional Cosmos'}
        </p>
      </div>

      {/* Control Overlays (Top Right) */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        {/* Layout Toggle (Force vs Tree) only in 2D mode */}
        {viewMode === '2d' && (
          <div className="bg-neutral-950/90 border border-neutral-900 rounded-xl p-0.5 flex mr-2">
            <button
              onClick={() => setLayoutMode('force')}
              className={`px-3 py-1.5 rounded-lg text-[10px] flex items-center gap-1.5 font-mono tracking-wider transition-all duration-200 uppercase ${
                layoutMode === 'force'
                  ? 'bg-neutral-800 text-neutral-100 font-semibold shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              <Network className="w-3 h-3" />
              Force
            </button>
            <button
              onClick={() => setLayoutMode('tree')}
              className={`px-3 py-1.5 rounded-lg text-[10px] flex items-center gap-1.5 font-mono tracking-wider transition-all duration-200 uppercase ${
                layoutMode === 'tree'
                  ? 'bg-neutral-800 text-neutral-100 font-semibold shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              <Route className="w-3 h-3" />
              Tree
            </button>
          </div>
        )}

        {/* Toggle between 2D Projection and 3D Cosmos */}
        <div className="bg-neutral-950/90 border border-neutral-900 rounded-xl p-0.5 flex">
          <button
            id="toggle-2d-mode-btn"
            onClick={() => setViewMode('2d')}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-mono tracking-wider transition-all duration-200 uppercase ${
              viewMode === '2d'
                ? 'bg-neutral-800 text-neutral-100 font-semibold'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            2D Plane
          </button>
          <button
            id="toggle-3d-mode-btn"
            onClick={() => setViewMode('3d')}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-mono tracking-wider transition-all duration-200 uppercase ${
              viewMode === '3d'
                ? 'bg-neutral-800 text-neutral-100 font-semibold'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            3D Cosmos
          </button>
        </div>

        {/* Physics Control Button toggle */}
        <button
          id="toggle-physics-panel-btn"
          onClick={() => setShowSettings(!showSettings)}
          className={`p-2 rounded-xl border transition-all duration-200 ${
            showSettings
              ? 'bg-neutral-800 border-neutral-700 text-neutral-100'
              : 'bg-neutral-950/90 border-neutral-900 text-neutral-500 hover:text-neutral-300 hover:border-neutral-800'
          }`}
          title="Adjust physics field constants"
        >
          <Sliders className="w-4 h-4" />
        </button>
      </div>

      {/* Physics parameter settings overlay */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            id="physics-tuning-drawer"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute top-16 right-4 z-30 w-64 bg-neutral-950/95 border border-neutral-900 rounded-2xl p-4 backdrop-blur-md shadow-2xl flex flex-col gap-4"
          >
            <div className="flex items-center justify-between border-b border-neutral-900 pb-2">
              <span className="text-[10px] font-mono font-semibold tracking-wider text-neutral-400 uppercase">Physics Field Tuner</span>
              <button
                id="reset-physics-btn"
                onClick={() => setPhysics(DEFAULT_PHYSICS)}
                className="text-[9px] font-mono text-neutral-500 hover:text-neutral-300 flex items-center gap-1"
                title="Reset simulation constants"
              >
                <RefreshCw className="w-2.5 h-2.5" />
                Reset
              </button>
            </div>

            {/* Slider 1: Repulsive Force / Charge Strength */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-[9px] font-mono text-neutral-500">
                <span>Repulsion Force (N-body)</span>
                <span className="text-neutral-300">{Math.abs(physics.chargeStrength)}</span>
              </div>
              <input
                id="charge-strength-slider"
                type="range"
                min="-400"
                max="-50"
                step="10"
                value={physics.chargeStrength}
                onChange={(e) => setPhysics(prev => ({ ...prev, chargeStrength: parseInt(e.target.value) }))}
                className="w-full accent-neutral-300 h-1 bg-neutral-900 rounded-lg cursor-pointer"
              />
            </div>

            {/* Slider 2: Link Target Distance */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-[9px] font-mono text-neutral-500">
                <span>Connection Stiffness Length</span>
                <span className="text-neutral-300">{physics.linkDistance}px</span>
              </div>
              <input
                id="link-distance-slider"
                type="range"
                min="60"
                max="220"
                step="5"
                value={physics.linkDistance}
                onChange={(e) => setPhysics(prev => ({ ...prev, linkDistance: parseInt(e.target.value) }))}
                className="w-full accent-neutral-300 h-1 bg-neutral-900 rounded-lg cursor-pointer"
              />
            </div>

            {/* Slider 3: Centripetal Gravity Pull */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-[9px] font-mono text-neutral-500">
                <span>Centripetal Gravity</span>
                <span className="text-neutral-300">{(physics.gravity * 100).toFixed(0)}%</span>
              </div>
              <input
                id="gravity-slider"
                type="range"
                min="0.01"
                max="0.12"
                step="0.01"
                value={physics.gravity}
                onChange={(e) => setPhysics(prev => ({ ...prev, gravity: parseFloat(e.target.value) }))}
                className="w-full accent-neutral-300 h-1 bg-neutral-900 rounded-lg cursor-pointer"
              />
            </div>

            {/* Quick Helper Text inside drawer */}
            <p className="text-[8px] font-mono text-neutral-600 leading-normal border-t border-neutral-900 pt-2">
              Forces stream calculations asynchronously via background threads (Web Workers) to prevent frame lagging. Drag nodes in 2D to anchor physical structures.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Legend / Quick Status (Bottom Left Overlay) */}
      <div className="absolute bottom-4 left-4 bg-neutral-950/80 border border-neutral-900 px-3 py-2 rounded-xl text-[9px] font-mono text-neutral-500 flex flex-col gap-1 backdrop-blur-sm z-10">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-white block" />
          <span>Core Ontological</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 block" />
          <span>Theological / Apophatic</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-400 block" />
          <span>Epistemological</span>
        </div>
      </div>

      {/* Hover/Selection Status Panel (Bottom Right Overlay) */}
      {activeNode && (
        <div className="absolute bottom-4 right-4 bg-neutral-950/90 border border-neutral-900 px-3 py-2 rounded-xl text-[9px] font-mono text-neutral-300 max-w-[200px] backdrop-blur-sm z-10 flex flex-col gap-1 border-r-2 border-r-neutral-200">
          <div className="flex justify-between items-center gap-2">
            <span className="font-semibold text-neutral-200 uppercase truncate">{activeNode.label}</span>
            <span className="text-neutral-500">Ω {activeNode.resonance}%</span>
          </div>
          <span className="text-[8px] text-neutral-500 uppercase font-semibold">{activeNode.type}</span>
        </div>
      )}
    </div>
  );
};
