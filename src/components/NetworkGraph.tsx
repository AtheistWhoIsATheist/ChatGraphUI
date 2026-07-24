import React, { useMemo, useState, useRef, useEffect } from 'react';
import { SimulatedNode, SimulatedLink } from '../hooks/useSimulation';

interface NetworkGraphProps {
  nodes: SimulatedNode[];
  links: SimulatedLink[];
  selectedNodeId: string | null;
  hoveredNodeId: string | null;
  onSelectNode: (nodeId: string | null) => void;
  onHoverNode: (nodeId: string | null) => void;
  dragNode: (nodeId: string, x: number, y: number, fixed: boolean) => void;
  width: number;
  height: number;
}

const TYPE_STYLES: Record<string, { border: string; bg: string; text: string; glow: string; color: string }> = {
  'Ontological Core': {
    border: 'border-neutral-100',
    bg: 'bg-neutral-900',
    text: 'text-neutral-100',
    glow: 'shadow-[0_0_15px_rgba(255,255,255,0.15)]',
    color: '#ffffff'
  },
  'Conceptual Core': {
    border: 'border-zinc-400',
    bg: 'bg-zinc-950',
    text: 'text-zinc-200',
    glow: 'shadow-[0_0_12px_rgba(161,161,170,0.1)]',
    color: '#a1a1aa'
  },
  'Epistemological': {
    border: 'border-sky-500/50',
    bg: 'bg-sky-950/20',
    text: 'text-sky-300',
    glow: 'shadow-[0_0_12px_rgba(14,165,233,0.1)]',
    color: '#38bdf8'
  },
  'Theological': {
    border: 'border-amber-500/50',
    bg: 'bg-amber-950/20',
    text: 'text-amber-300',
    glow: 'shadow-[0_0_12px_rgba(245,158,11,0.1)]',
    color: '#fbbf24'
  },
  'Phenomenological': {
    border: 'border-rose-500/50',
    bg: 'bg-rose-950/20',
    text: 'text-rose-300',
    glow: 'shadow-[0_0_12px_rgba(244,63,94,0.1)]',
    color: '#f43f5e'
  },
  'Existential': {
    border: 'border-violet-500/50',
    bg: 'bg-violet-950/20',
    text: 'text-violet-300',
    glow: 'shadow-[0_0_12px_rgba(139,92,246,0.1)]',
    color: '#8b5cf6'
  },
  'Praxis': {
    border: 'border-emerald-500/50',
    bg: 'bg-emerald-950/20',
    text: 'text-emerald-300',
    glow: 'shadow-[0_0_12px_rgba(16,185,129,0.1)]',
    color: '#10b981'
  }
};

export const NetworkGraphComponent: React.FC<NetworkGraphProps> = ({
  nodes,
  links,
  selectedNodeId,
  hoveredNodeId,
  onSelectNode,
  onHoverNode,
  dragNode,
  width,
  height
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  const activeNodeId = selectedNodeId || hoveredNodeId;

  // Determine connected neighbors
  const connectedNodeIds = useMemo(() => {
    if (!activeNodeId) return new Set<string>();
    const neighbors = new Set<string>([activeNodeId]);
    for (const link of links) {
      const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
      const targetId = typeof link.target === 'object' ? link.target.id : link.target;
      if (sourceId === activeNodeId) {
        neighbors.add(targetId);
      } else if (targetId === activeNodeId) {
        neighbors.add(sourceId);
      }
    }
    return neighbors;
  }, [activeNodeId, links]);

  const isDimmable = activeNodeId !== null;

  // Drag interaction math
  const handleMouseDown = (nodeId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveDragId(nodeId);
    
    if (svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      dragNode(nodeId, x, y, true);
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (activeDragId && svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      dragNode(activeDragId, x, y, true);
    }
  };

  const handleMouseUp = () => {
    if (activeDragId) {
      dragNode(activeDragId, 0, 0, false);
      setActiveDragId(null);
    }
  };

  useEffect(() => {
    if (activeDragId) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [activeDragId]);

  return (
    <svg
      id="svg-network-canvas"
      ref={svgRef}
      width="100%"
      height="100%"
      viewBox={`0 0 ${width} ${height}`}
      className="absolute inset-0 select-none z-0 overflow-hidden"
      onClick={() => onSelectNode(null)}
    >
      {/* Dynamic Link Lines */}
      <g id="link-group">
        {links.map((link, idx) => {
          const sourceNode = typeof link.source === 'object' ? link.source : null;
          const targetNode = typeof link.target === 'object' ? link.target : null;

          if (!sourceNode || !targetNode) return null;

          const sId = sourceNode.id;
          const tId = targetNode.id;

          const isHighlighted = activeNodeId && (sId === activeNodeId || tId === activeNodeId);
          const isDimmed = isDimmable && !isHighlighted;

          return (
            <g key={`link-line-${sId}-${tId}-${idx}`}>
              {/* Highlight background path glow */}
              {isHighlighted && (
                <line
                  x1={sourceNode.x}
                  y1={sourceNode.y}
                  x2={targetNode.x}
                  y2={targetNode.y}
                  stroke="rgba(255, 255, 255, 0.15)"
                  strokeWidth={link.intensity + 5}
                  className="blur-[2px]"
                />
              )}
              <line
                x1={sourceNode.x}
                y1={sourceNode.y}
                x2={targetNode.x}
                y2={targetNode.y}
                stroke={isHighlighted ? '#ffffff' : '#262626'}
                strokeWidth={isHighlighted ? link.intensity + 0.8 : link.intensity * 0.7}
                strokeDasharray={link.intensity > 4 ? 'none' : '4, 4'}
                opacity={isDimmed ? 0.08 : isHighlighted ? 1 : 0.55}
                className="transition-all duration-300 ease-out"
              />
            </g>
          );
        })}
      </g>

      {/* Dynamic Interactive Nodes */}
      <g id="node-group">
        {nodes.map((node) => {
          const styles = TYPE_STYLES[node.type] || TYPE_STYLES['Conceptual Core'];
          const isSelected = selectedNodeId === node.id;
          const isHovered = hoveredNodeId === node.id;
          const isActive = isSelected || isHovered;
          const isHighlightedInContext = !isDimmable || connectedNodeIds.has(node.id);
          const isDimmed = isDimmable && !isHighlightedInContext;

          const r = node.id === 'void' ? 24 : 18;

          return (
            <g
              key={`node-group-${node.id}`}
              transform={`translate(${node.x}, ${node.y})`}
              className="cursor-pointer"
              onMouseEnter={() => onHoverNode(node.id)}
              onMouseLeave={() => onHoverNode(null)}
              onClick={(e) => {
                e.stopPropagation();
                onSelectNode(node.id === selectedNodeId ? null : node.id);
              }}
              onMouseDown={(e) => handleMouseDown(node.id, e)}
              opacity={isDimmed ? 0.22 : 1}
            >
              {/* Outer Pulsing Aura Ring */}
              {isActive && (
                <circle
                  r={r + 7}
                  fill="none"
                  stroke={isSelected ? '#ffffff' : '#a1a1aa'}
                  strokeWidth="1.2"
                  className="animate-pulse opacity-40"
                />
              )}

              {/* Main Node base circle */}
              <circle
                r={r}
                fill="#050505"
                stroke={isSelected ? '#ffffff' : isHovered ? '#e5e5e5' : '#262626'}
                strokeWidth={isSelected ? 2.5 : isActive ? 2 : 1.5}
                className="transition-all duration-200"
              />

              {/* Inner Accent Dot */}
              <circle
                r={6}
                fill={styles.color}
                opacity={0.8}
              />

              {/* Text label */}
              <text
                y={r + 15}
                textAnchor="middle"
                className={`font-display font-medium text-[10px] select-none pointer-events-none fill-current transition-all duration-200 ${
                  isSelected ? 'fill-white font-semibold text-[11px]' : isActive ? 'fill-neutral-200' : 'fill-neutral-400'
                }`}
              >
                {node.label}
              </text>

              {/* Resonance level text overlay when selected */}
              {isSelected && (
                <text
                  y={-r - 7}
                  textAnchor="middle"
                  className="font-mono text-[8px] fill-neutral-500 font-medium select-none pointer-events-none"
                >
                  {node.resonance}% Ω
                </text>
              )}
            </g>
          );
        })}
      </g>
    </svg>
  );
};

// Protect graph from re-renders that aren't node or link coordinate adjustments
export const NetworkGraph = React.memo(NetworkGraphComponent);
