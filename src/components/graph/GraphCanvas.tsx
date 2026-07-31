import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { GraphNode, GraphEdge, SOURCE_DOCUMENTS } from '../../data/knowledgeGraphDataset';

interface GraphCanvasProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  selectedNodeId: string | null;
  hoveredNodeId: string | null;
  onSelectNode: (nodeId: string | null) => void;
  onHoverNode: (nodeId: string | null) => void;
  onDoubleSelectNode?: (nodeId: string) => void;
  activeLens: 'source_clusters' | 'concept_hubs' | 'thinker_network' | 'audit_mode' | 'path_mode';
  highlightedPathNodeIds?: Set<string>;
  highlightedPathEdgeIds?: Set<string>;
  searchQuery?: string;
}

interface NodePosition {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  clusterX: number;
  clusterY: number;
}

export const GraphCanvas: React.FC<GraphCanvasProps> = ({
  nodes,
  edges,
  selectedNodeId,
  hoveredNodeId,
  onSelectNode,
  onHoverNode,
  onDoubleSelectNode,
  activeLens,
  highlightedPathNodeIds = new Set(),
  highlightedPathEdgeIds = new Set(),
  searchQuery = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Viewport Pan & Zoom State
  const [transform, setTransform] = useState({ x: 0, y: 0, k: 1 });
  const [isPanning, setIsPanning] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);

  // Layout Node Positions Cache
  const positionsRef = useRef<Map<string, NodePosition>>(new Map());

  // Dimensions
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  // Handle Container Resize
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width, height } = entries[0].contentRect;
      setDimensions({
        width: Math.max(400, Math.floor(width)),
        height: Math.max(400, Math.floor(height || 600))
      });
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Compute Cluster Centers for 17 Source Documents or Lenses
  const clusterCenters = useMemo(() => {
    const centers = new Map<string, { x: number; y: number; title: string }>();
    const docCount = SOURCE_DOCUMENTS.length; // 17
    const cx = dimensions.width / 2;
    const cy = dimensions.height / 2;
    const radius = Math.min(dimensions.width, dimensions.height) * 0.38;

    SOURCE_DOCUMENTS.forEach((doc, idx) => {
      const angle = (idx / docCount) * 2 * Math.PI - Math.PI / 2;
      centers.set(doc.title, {
        x: cx + radius * Math.cos(angle),
        y: cy + radius * Math.sin(angle),
        title: doc.title
      });
    });

    return centers;
  }, [dimensions]);

  // Initialize or update node positions deterministically by lens
  useEffect(() => {
    const posMap = positionsRef.current;
    const cx = dimensions.width / 2;
    const cy = dimensions.height / 2;

    nodes.forEach((node, i) => {
      const cluster = clusterCenters.get(node.sourceFile) || { x: cx, y: cy, title: 'Default' };
      const baseRadius = Math.min(22, Math.max(5, Math.sqrt(node.degree) * 2.2));

      if (!posMap.has(node.id)) {
        // Pseudo-random offset around cluster center
        const seedAngle = (i * 137.5 * Math.PI) / 180;
        const seedDist = 15 + ((i % 25) * 4);
        posMap.set(node.id, {
          x: cluster.x + Math.cos(seedAngle) * seedDist,
          y: cluster.y + Math.sin(seedAngle) * seedDist,
          vx: 0,
          vy: 0,
          radius: baseRadius,
          clusterX: cluster.x,
          clusterY: cluster.y
        });
      } else {
        const existing = posMap.get(node.id)!;
        existing.clusterX = cluster.x;
        existing.clusterY = cluster.y;
        existing.radius = baseRadius;
      }
    });
  }, [nodes, clusterCenters, dimensions]);

  // Main Render Loop on HTML5 Canvas
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = dimensions;
    const { x: panX, y: panY, k: scale } = transform;

    ctx.clearRect(0, 0, width, height);

    // Canvas Background
    ctx.fillStyle = '#09090b'; // dark slate
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.translate(panX, panY);
    ctx.scale(scale, scale);

    const posMap = positionsRef.current;

    // 1. Draw Cluster Hull Backgrounds (for Source Clusters Lens)
    if (activeLens === 'source_clusters' || activeLens === 'audit_mode') {
      clusterCenters.forEach((center) => {
        ctx.beginPath();
        ctx.arc(center.x, center.y, 90, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(24, 24, 27, 0.4)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(63, 63, 70, 0.3)';
        ctx.lineWidth = 1 / scale;
        ctx.stroke();

        // Cluster Label
        ctx.font = `600 ${Math.max(10, Math.min(14, 12 / scale))}px 'IBM Plex Mono', monospace`;
        ctx.fillStyle = 'rgba(161, 161, 170, 0.6)';
        ctx.textAlign = 'center';
        ctx.fillText(center.title, center.x, center.y - 100);
      });
    }

    // 2. Draw Edges
    const isFilteredSearch = searchQuery.trim() !== '';
    const searchLower = searchQuery.toLowerCase();

    edges.forEach((edge) => {
      const srcPos = posMap.get(edge.source);
      const tgtPos = posMap.get(edge.target);
      if (!srcPos || !tgtPos) return;

      const isPathEdge = highlightedPathEdgeIds.has(edge.id);
      const isConnectedToSelected = selectedNodeId === edge.source || selectedNodeId === edge.target;

      // Edge Opacity Management
      let alpha = 0.15;
      let strokeColor = '#3f3f46';
      let lineWidth = 0.8;

      if (edge.relation === 'VOID_RESONANCE') {
        strokeColor = '#06b6d4'; // Cyan
        alpha = 0.4;
      } else if (edge.relation === 'PRIMARY_SOURCE_OF') {
        strokeColor = '#f59e0b'; // Amber
        alpha = 0.5;
        lineWidth = 1.2;
      }

      if (isPathEdge) {
        strokeColor = '#10b981'; // Vivid Green Path
        alpha = 0.95;
        lineWidth = 3.0;
      } else if (isConnectedToSelected) {
        alpha = 0.85;
        lineWidth = 2.0;
      } else if (selectedNodeId) {
        alpha = 0.04; // Fade unselected edges
      }

      ctx.beginPath();
      ctx.moveTo(srcPos.x, srcPos.y);
      ctx.lineTo(tgtPos.x, tgtPos.y);
      ctx.strokeStyle = strokeColor;
      ctx.globalAlpha = alpha;
      ctx.lineWidth = lineWidth / scale;
      ctx.stroke();
      ctx.globalAlpha = 1.0;
    });

    // 3. Draw Nodes
    nodes.forEach((node) => {
      const pos = posMap.get(node.id);
      if (!pos) return;

      const isSelected = selectedNodeId === node.id;
      const isHovered = hoveredNodeId === node.id;
      const isPathNode = highlightedPathNodeIds.has(node.id);
      const isMatch = isFilteredSearch && (node.label.toLowerCase().includes(searchLower) || node.id.toLowerCase().includes(searchLower));

      let fillColor = '#38bdf8'; // Cyan for concept
      if (node.type === 'thinker') fillColor = '#c084fc'; // Violet
      if (node.type === 'document') fillColor = '#f59e0b'; // Amber

      if (activeLens === 'audit_mode' && node.isDuplicateLabel) {
        fillColor = '#ef4444'; // Bright Red in Audit Mode for duplicate labels
      }

      const radius = isSelected ? pos.radius * 1.4 : isHovered ? pos.radius * 1.25 : pos.radius;

      ctx.save();
      ctx.translate(pos.x, pos.y);

      // Node Shape Rendering per Spec (Circle, Hexagon, Rectangle)
      ctx.fillStyle = fillColor;
      ctx.strokeStyle = isSelected ? '#ffffff' : isPathNode ? '#10b981' : '#18181b';
      ctx.lineWidth = (isSelected ? 2.5 : 1.2) / scale;

      if (node.type === 'concept') {
        // Circle
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
      } else if (node.type === 'thinker') {
        // Hexagon
        ctx.beginPath();
        for (let a = 0; a < 6; a++) {
          const angle = (a * Math.PI) / 3;
          const hx = radius * Math.cos(angle);
          const hy = radius * Math.sin(angle);
          if (a === 0) ctx.moveTo(hx, hy);
          else ctx.lineTo(hx, hy);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else {
        // Document: Rounded Rectangle
        const w = radius * 2.2;
        const h = radius * 1.6;
        ctx.beginPath();
        ctx.roundRect(-w / 2, -h / 2, w, h, 4);
        ctx.fill();
        ctx.stroke();
      }

      // Duplicate Label Count Badge (CRITICAL SPEC REQUIREMENT)
      if (node.isDuplicateLabel && (node.duplicateGroupCount || 1) > 1) {
        ctx.fillStyle = '#f59e0b'; // Amber Badge
        ctx.beginPath();
        ctx.arc(radius * 0.8, -radius * 0.8, 6 / scale, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = '#000000';
        ctx.font = `bold ${Math.max(8, 9 / scale)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${node.duplicateGroupCount}`, radius * 0.8, -radius * 0.8);
      }

      // Progressive Label Disclosure (Show label if Selected, Hovered, High Degree Hub, or Search Match)
      const shouldShowLabel = isSelected || isHovered || isPathNode || isMatch || (scale > 1.2) || (node.degree >= 12);

      if (shouldShowLabel) {
        ctx.font = `${isSelected ? '700' : '500'} ${Math.max(9, Math.min(14, 11 / scale))}px Inter, sans-serif`;
        ctx.fillStyle = isSelected ? '#ffffff' : isHovered ? '#e4e4e7' : '#a1a1aa';
        ctx.textAlign = 'center';
        ctx.fillText(node.label, 0, radius + (14 / scale));
      }

      ctx.restore();
    });

    ctx.restore();
  }, [dimensions, transform, nodes, edges, selectedNodeId, hoveredNodeId, activeLens, highlightedPathNodeIds, highlightedPathEdgeIds, searchQuery, clusterCenters]);

  useEffect(() => {
    render();
  }, [render]);

  // Pointer Interaction Handlers (Pan, Zoom, Select)
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button !== 0) return; // Left click only
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Convert mouse to graph space
    const graphX = (mouseX - transform.x) / transform.k;
    const graphY = (mouseY - transform.y) / transform.k;

    // Check hit test on nodes
    const posMap = positionsRef.current;
    let clickedNodeId: string | null = null;

    for (const node of nodes) {
      const pos = posMap.get(node.id);
      if (pos) {
        const dx = graphX - pos.x;
        const dy = graphY - pos.y;
        if (dx * dx + dy * dy <= (pos.radius + 6) * (pos.radius + 6)) {
          clickedNodeId = node.id;
          break;
        }
      }
    }

    if (clickedNodeId) {
      onSelectNode(clickedNodeId);
      setDraggedNodeId(clickedNodeId);
    } else {
      setIsPanning(true);
      setDragStart({ x: e.clientX - transform.x, y: e.clientY - transform.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (isPanning) {
      setTransform(prev => ({
        ...prev,
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      }));
      return;
    }

    if (draggedNodeId) {
      const graphX = (mouseX - transform.x) / transform.k;
      const graphY = (mouseY - transform.y) / transform.k;
      const pos = positionsRef.current.get(draggedNodeId);
      if (pos) {
        pos.x = graphX;
        pos.y = graphY;
        render();
      }
      return;
    }

    // Hover test
    const graphX = (mouseX - transform.x) / transform.k;
    const graphY = (mouseY - transform.y) / transform.k;
    const posMap = positionsRef.current;
    let hovered: string | null = null;

    for (const node of nodes) {
      const pos = posMap.get(node.id);
      if (pos) {
        const dx = graphX - pos.x;
        const dy = graphY - pos.y;
        if (dx * dx + dy * dy <= pos.radius * pos.radius) {
          hovered = node.id;
          break;
        }
      }
    }

    onHoverNode(hovered);
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setDraggedNodeId(null);
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.85;
    setTransform(prev => {
      const newScale = Math.min(5, Math.max(0.2, prev.k * zoomFactor));
      return {
        ...prev,
        k: newScale
      };
    });
  };

  const handleDoubleClick = () => {
    if (selectedNodeId && onDoubleSelectNode) {
      onDoubleSelectNode(selectedNodeId);
    }
  };

  return (
    <div ref={containerRef} className="w-full h-full relative overflow-hidden bg-neutral-950 select-none">
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        onDoubleClick={handleDoubleClick}
        className="w-full h-full cursor-grab active:cursor-grabbing block"
      />

      {/* Viewport Zoom Overlay Controls */}
      <div className="absolute bottom-4 right-4 bg-neutral-900/80 backdrop-blur-md border border-neutral-800 rounded-xl p-1.5 flex flex-col gap-1 text-xs font-mono text-neutral-300">
        <button
          onClick={() => setTransform(prev => ({ ...prev, k: Math.min(5, prev.k * 1.2) }))}
          className="p-1.5 hover:bg-neutral-800 rounded text-center cursor-pointer font-bold"
          title="Zoom In"
        >
          +
        </button>
        <span className="text-[10px] text-neutral-500 text-center select-none py-0.5">
          {Math.round(transform.k * 100)}%
        </span>
        <button
          onClick={() => setTransform(prev => ({ ...prev, k: Math.max(0.2, prev.k * 0.8) }))}
          className="p-1.5 hover:bg-neutral-800 rounded text-center cursor-pointer font-bold"
          title="Zoom Out"
        >
          -
        </button>
        <button
          onClick={() => setTransform({ x: 0, y: 0, k: 1 })}
          className="p-1.5 hover:bg-neutral-800 rounded text-center cursor-pointer text-[10px]"
          title="Reset Viewport"
        >
          Reset
        </button>
      </div>

      {/* Screen Reader Live Region for Accessibility */}
      <div className="sr-only" aria-live="polite">
        {selectedNodeId
          ? `Selected node ${nodes.find(n => n.id === selectedNodeId)?.label}. Source file: ${nodes.find(n => n.id === selectedNodeId)?.sourceFile}. Connections: ${nodes.find(n => n.id === selectedNodeId)?.degree}`
          : 'No graph node currently selected.'}
      </div>
    </div>
  );
};
