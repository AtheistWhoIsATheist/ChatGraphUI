import React, { useState, useRef, useEffect } from 'react';
import { Settings, Maximize2, Minimize2, RefreshCw } from 'lucide-react';
import { STAR_GRAPH_NODES } from './data';

interface RadialStarGraphProps {
  activeNoteId: string;
  onSelectNode: (nodeId: string) => void;
  onOpenFullGraph?: () => void;
}

export const RadialStarGraph: React.FC<RadialStarGraphProps> = ({
  activeNoteId,
  onSelectNode,
  onOpenFullGraph
}) => {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [isRotating, setIsRotating] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [nodeScale, setNodeScale] = useState(1);
  const svgRef = useRef<SVGSVGElement>(null);

  // Subtle continuous constellation drift
  useEffect(() => {
    if (!isRotating) return;
    const interval = setInterval(() => {
      setRotationAngle((prev) => (prev + 0.002) % (Math.PI * 2));
    }, 30);
    return () => clearInterval(interval);
  }, [isRotating]);

  const width = isExpanded ? 540 : 290;
  const height = isExpanded ? 380 : 250;
  const centerX = width / 2;
  const centerY = height / 2;
  const baseRadius = isExpanded ? 140 : 88;

  // Calculate node positions
  const centerNode = STAR_GRAPH_NODES.find((n) => n.isCenter) || STAR_GRAPH_NODES[0];
  const peripheralNodes = STAR_GRAPH_NODES.filter((n) => !n.isCenter);

  return (
    <div
      className={`relative obsidian-card rounded-2xl p-4 transition-all duration-300 ${
        isExpanded ? 'fixed inset-8 z-50 flex flex-col justify-between max-w-4xl mx-auto shadow-2xl backdrop-blur-2xl' : ''
      }`}
    >
      {/* Card Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium tracking-wide text-white/90">Graph</h3>
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-violet-400/60 animate-pulse" />
        </div>
        <div className="flex items-center gap-1.5 text-white/50">
          <button
            onClick={() => setShowSettings(!showSettings)}
            title="Graph Settings"
            className="p-1 rounded hover:text-white hover:bg-white/5 transition-colors"
          >
            <Settings size={13} />
          </button>
          <button
            onClick={() => {
              if (onOpenFullGraph && !isExpanded) {
                onOpenFullGraph();
              } else {
                setIsExpanded(!isExpanded);
              }
            }}
            title={isExpanded ? "Collapse" : "Expand Graph"}
            className="p-1 rounded hover:text-white hover:bg-white/5 transition-colors"
          >
            {isExpanded ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
          </button>
        </div>
      </div>

      {/* Settings Overlay Popover */}
      {showSettings && (
        <div className="absolute top-12 right-4 z-30 p-3 rounded-xl bg-[#141026]/95 border border-white/10 shadow-2xl backdrop-blur-xl text-xs space-y-2.5 w-48 text-white/80">
          <div className="flex items-center justify-between pb-1 border-b border-white/10 text-white/90 font-medium">
            <span>Graph Controls</span>
            <button onClick={() => setShowSettings(false)} className="hover:text-white">✕</button>
          </div>
          <div className="flex items-center justify-between">
            <span>Constellation Drift</span>
            <button
              onClick={() => setIsRotating(!isRotating)}
              className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                isRotating ? 'border-violet-500/50 text-violet-300 bg-violet-500/20' : 'border-white/10 text-white/40'
              }`}
            >
              {isRotating ? 'Active' : 'Paused'}
            </button>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-white/60">
              <span>Node Scale</span>
              <span>{nodeScale.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0.7"
              max="1.4"
              step="0.1"
              value={nodeScale}
              onChange={(e) => setNodeScale(parseFloat(e.target.value))}
              className="w-full accent-violet-400 h-1 bg-white/10 rounded-lg cursor-pointer"
            />
          </div>
          <button
            onClick={() => setRotationAngle(0)}
            className="w-full py-1 text-[11px] rounded bg-white/5 hover:bg-white/10 text-white/70 flex items-center justify-center gap-1.5 transition-colors"
          >
            <RefreshCw size={10} /> Reset Orientation
          </button>
        </div>
      )}

      {/* Interactive SVG Constellation Canvas */}
      <div className="relative w-full flex items-center justify-center overflow-hidden select-none">
        <svg
          ref={svgRef}
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto max-h-[280px]"
        >
          <defs>
            {/* Center Node Multi-tier Radiant Glow Filter */}
            <filter id="coreGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="6" result="blur1" />
              <feGaussianBlur stdDeviation="14" result="blur2" />
              <feMerge>
                <feMergeNode in="blur2" />
                <feMergeNode in="blur1" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <filter id="nodeGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Radiant gradient for links */}
            <linearGradient id="spokeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#C084FC" stopOpacity="0.7" />
              <stop offset="60%" stopColor="#818CF8" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#4C1D95" stopOpacity="0.1" />
            </linearGradient>

            <radialGradient id="centerRadial" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="40%" stopColor="#E9D5FF" />
              <stop offset="75%" stopColor="#A855F7" />
              <stop offset="100%" stopColor="#6B21A8" />
            </radialGradient>
          </defs>

          {/* Background constellation faint guide circle */}
          <circle
            cx={centerX}
            cy={centerY}
            r={baseRadius}
            fill="none"
            stroke="rgba(168, 85, 247, 0.08)"
            strokeDasharray="2 4"
          />

          {/* Spoke filaments connecting Center to Peripheral Nodes */}
          {peripheralNodes.map((node, i) => {
            const angle = (node.angle || (i * (Math.PI * 2)) / peripheralNodes.length) + rotationAngle;
            const dist = baseRadius * (node.distance ? node.distance / 100 : 1);
            const nx = centerX + Math.cos(angle) * dist;
            const ny = centerY + Math.sin(angle) * dist;
            const isHovered = hoveredNode === node.id;
            const isActive = activeNoteId === node.id;

            return (
              <g key={`spoke-${node.id}`}>
                <line
                  x1={centerX}
                  y1={centerY}
                  x2={nx}
                  y2={ny}
                  stroke={isActive || isHovered ? 'rgba(216, 180, 254, 0.7)' : 'rgba(192, 132, 252, 0.22)'}
                  strokeWidth={isActive || isHovered ? 1.6 : 0.9}
                  strokeDasharray={isActive ? 'none' : '3 2'}
                  className="transition-all duration-300"
                />

                {/* Pulsing starlight particle flowing along the link */}
                <circle
                  cx={centerX + (nx - centerX) * (((Date.now() / 1400 + i * 0.15) % 1))}
                  cy={centerY + (ny - centerY) * (((Date.now() / 1400 + i * 0.15) % 1))}
                  r={1.2}
                  fill="#ffffff"
                  opacity={0.65}
                />
              </g>
            );
          })}

          {/* Peripheral Spoke Nodes */}
          {peripheralNodes.map((node, i) => {
            const angle = (node.angle || (i * (Math.PI * 2)) / peripheralNodes.length) + rotationAngle;
            const dist = baseRadius * (node.distance ? node.distance / 100 : 1);
            const nx = centerX + Math.cos(angle) * dist;
            const ny = centerY + Math.sin(angle) * dist;
            const isHovered = hoveredNode === node.id;
            const isActive = activeNoteId === node.id;

            return (
              <g
                key={node.id}
                className="cursor-pointer group"
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                onClick={() => onSelectNode(node.id)}
              >
                {/* Outer halo on hover */}
                {(isHovered || isActive) && (
                  <circle
                    cx={nx}
                    cy={ny}
                    r={(nodeScale * 14)}
                    fill="none"
                    stroke="#C084FC"
                    strokeWidth="1.2"
                    strokeOpacity="0.6"
                    className="animate-ping"
                  />
                )}

                {/* Node Body */}
                <circle
                  cx={nx}
                  cy={ny}
                  r={(nodeScale * (isHovered || isActive ? 6.5 : 4.5))}
                  fill={isActive ? '#FFFFFF' : node.color || '#C084FC'}
                  filter="url(#nodeGlow)"
                  className="transition-all duration-300"
                />

                {/* Node Label Text */}
                <text
                  x={nx}
                  y={ny + (angle > 0 && angle < Math.PI ? 15 : -10)}
                  textAnchor="middle"
                  fill={isHovered || isActive ? '#FFFFFF' : 'rgba(255, 255, 255, 0.65)'}
                  fontSize={isHovered || isActive ? 11 : 9.5}
                  fontFamily="'Plus Jakarta Sans', system-ui, sans-serif"
                  fontWeight={isHovered || isActive ? '600' : '400'}
                  className="transition-all duration-200 select-none pointer-events-none drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]"
                >
                  {node.label}
                </text>
              </g>
            );
          })}

          {/* Central Luminous Singularity Core: Nihiltheism */}
          <g
            className="cursor-pointer group"
            onMouseEnter={() => setHoveredNode(centerNode.id)}
            onMouseLeave={() => setHoveredNode(null)}
            onClick={() => onSelectNode(centerNode.id)}
          >
            {/* Multi-layered soft glow ring */}
            <circle
              cx={centerX}
              cy={centerY}
              r={nodeScale * 22}
              fill="rgba(168, 85, 247, 0.18)"
            />
            <circle
              cx={centerX}
              cy={centerY}
              r={nodeScale * 14}
              fill="rgba(192, 132, 252, 0.35)"
            />
            {/* Core sphere with glowing gradient */}
            <circle
              cx={centerX}
              cy={centerY}
              r={nodeScale * 8.5}
              fill="url(#centerRadial)"
              filter="url(#coreGlow)"
              className="transition-all duration-300 group-hover:scale-110"
            />
            {/* Central Node Label positioned directly beneath, exactly as in screenshot */}
            <text
              x={centerX}
              y={centerY + 24 * nodeScale}
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize={11.5}
              fontFamily="'Plus Jakarta Sans', system-ui, sans-serif"
              fontWeight="600"
              letterSpacing="0.02em"
              className="drop-shadow-[0_2px_8px_rgba(168,85,247,0.8)] select-none pointer-events-none"
            >
              {centerNode.label}
            </text>
          </g>
        </svg>
      </div>

      {/* Subtitle Caption at Bottom of Graph Card */}
      <div className="mt-1 pt-1.5 border-t border-white/5 text-center">
        <p className="text-[11px] font-serif italic text-white/50 tracking-wide">
          “All nodes return to the void.”
        </p>
      </div>
    </div>
  );
};
