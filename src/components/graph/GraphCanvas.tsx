import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { Focus, Maximize2, Eye, EyeOff, PanelRight, Compass } from 'lucide-react';
import { GraphNode, GraphEdge, SOURCE_DOCUMENTS, NODE_COLORS } from '../../data/knowledgeGraphDataset';

export interface NodeStylingOptions {
  borderStyle?: 'type_color' | 'solid' | 'glowing';
  nodeFillStyle?: 'filled' | 'translucent';
  showGlow?: boolean;
}

interface GraphCanvasProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  selectedNodeId: string | null;
  hoveredNodeId: string | null;
  onSelectNode: (nodeId: string | null) => void;
  onHoverNode: (nodeId: string | null) => void;
  onDoubleSelectNode?: (nodeId: string) => void;
  activeLens: 'source_clusters' | 'concept_hubs' | 'thinker_network' | 'audit_mode' | 'path_mode' | 'selected_relations';
  highlightedPathNodeIds?: Set<string>;
  highlightedPathEdgeIds?: Set<string>;
  searchQuery?: string;
  isPathIsolated?: boolean;
  onToggleIsolatePath?: () => void;
  isRightSidebarOpen?: boolean;
  onToggleRightSidebar?: () => void;
  stylingOptions?: NodeStylingOptions;
  voidDepth?: number;
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
  searchQuery = '',
  isPathIsolated = false,
  onToggleIsolatePath,
  isRightSidebarOpen = true,
  onToggleRightSidebar,
  stylingOptions,
  voidDepth = 0
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Viewport Pan & Zoom State
  const [transform, setTransform] = useState({ x: 0, y: 0, k: 0.65 });
  const [isPanning, setIsPanning] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);

  // Layout Controls
  const [spreadMultiplier, setSpreadMultiplier] = useState<number>(1.8);
  const [edgeMode, setEdgeMode] = useState<'subtle' | 'selected_only' | 'full'>('subtle');
  const [showAllLabels, setShowAllLabels] = useState<boolean>(true);
  const [isVoidDepthActive, setIsVoidDepthActive] = useState<boolean>(false);

  // Layout Node Positions Cache
  const positionsRef = useRef<Map<string, NodePosition>>(new Map());

  // Dimensions
  const [dimensions, setDimensions] = useState({ width: 900, height: 700 });

  // Handle Container Resize
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width, height } = entries[0].contentRect;
      setDimensions({
        width: Math.max(500, Math.floor(width)),
        height: Math.max(500, Math.floor(height || 700))
      });
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Compute Cluster Centers for Source Documents or Lenses across a spacious layout
  const clusterCenters = useMemo(() => {
    const centers = new Map<string, { x: number; y: number; title: string }>();
    const docCount = SOURCE_DOCUMENTS.length; // 17
    const cx = dimensions.width / 2;
    const cy = dimensions.height / 2;
    // Massively scale layout radius to spread clusters far apart
    const baseRadius = Math.max(dimensions.width, dimensions.height) * 1.0 * spreadMultiplier;

    SOURCE_DOCUMENTS.forEach((doc, idx) => {
      const angle = (idx / docCount) * 2 * Math.PI - Math.PI / 2;
      centers.set(doc.title, {
        x: cx + baseRadius * Math.cos(angle),
        y: cy + baseRadius * Math.sin(angle),
        title: doc.title
      });
    });

    return centers;
  }, [dimensions, spreadMultiplier]);

  // Force-directed relaxation & initialization pass
  const relaxLayout = useCallback(() => {
    const posMap = positionsRef.current;
    const cx = dimensions.width / 2;
    const cy = dimensions.height / 2;

    // 1. Ensure all nodes have initial position centered around their cluster
    nodes.forEach((node, i) => {
      const cluster = clusterCenters.get(node.sourceFile) || { x: cx, y: cy, title: 'Default' };
      const baseRadius = Math.min(24, Math.max(8, Math.sqrt(node.degree) * 2.8));

      if (!posMap.has(node.id)) {
        const seedAngle = (i * 137.5 * Math.PI) / 180;
        const seedDist = 60 + ((i % 25) * 18) * spreadMultiplier;
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

    // 2. Iterative physics relaxation loop (cluster gravity + link attraction + repulsion + collision)
    const nodeCount = nodes.length;
    const minPadding = 32; // Generous node spacing padding

    for (let pass = 0; pass < 35; pass++) {
      // A. Pull towards cluster center
      for (let i = 0; i < nodeCount; i++) {
        const pos = posMap.get(nodes[i].id);
        if (!pos) continue;
        pos.x += (pos.clusterX - pos.x) * 0.025;
        pos.y += (pos.clusterY - pos.y) * 0.025;
      }

      // B. Inter-node repulsion & collision prevention
      for (let i = 0; i < nodeCount; i++) {
        const posA = posMap.get(nodes[i].id);
        if (!posA) continue;

        for (let j = i + 1; j < nodeCount; j++) {
          const posB = posMap.get(nodes[j].id);
          if (!posB) continue;

          const dx = posB.x - posA.x;
          const dy = posB.y - posA.y;
          const distSq = dx * dx + dy * dy + 0.001;
          const minDist = posA.radius + posB.radius + minPadding;

          if (distSq < minDist * minDist) {
            const dist = Math.sqrt(distSq);
            const overlap = minDist - dist;
            const nx = dx / dist;
            const ny = dy / dist;

            posA.x -= nx * overlap * 0.55;
            posA.y -= ny * overlap * 0.55;
            posB.x += nx * overlap * 0.55;
            posB.y += ny * overlap * 0.55;
          }
        }
      }

      // C. Edge attraction
      edges.forEach((edge) => {
        const posA = posMap.get(edge.source);
        const posB = posMap.get(edge.target);
        if (!posA || !posB) return;

        const dx = posB.x - posA.x;
        const dy = posB.y - posA.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const idealDist = 90;
        const pull = (dist - idealDist) * 0.015;

        posA.x += (dx / dist) * pull;
        posA.y += (dy / dist) * pull;
        posB.x -= (dx / dist) * pull;
        posB.y -= (dy / dist) * pull;
      });
    }
  }, [nodes, edges, clusterCenters, dimensions, spreadMultiplier]);

  useEffect(() => {
    relaxLayout();
  }, [relaxLayout]);

  // Auto-fit view camera to a specific set of nodes (Traced Path or Isolated Relations)
  const fitNodeSetToView = useCallback((targetIds: Set<string>) => {
    if (targetIds.size === 0) return;
    const posMap = positionsRef.current;
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

    targetIds.forEach(id => {
      const pos = posMap.get(id);
      if (pos) {
        if (pos.x < minX) minX = pos.x;
        if (pos.x > maxX) maxX = pos.x;
        if (pos.y < minY) minY = pos.y;
        if (pos.y > maxY) maxY = pos.y;
      }
    });

    if (minX !== Infinity && maxX !== -Infinity) {
      const pathWidth = Math.max(120, maxX - minX);
      const pathHeight = Math.max(120, maxY - minY);
      const centerX = (minX + maxX) / 2;
      const centerY = (minY + maxY) / 2;

      const padding = 180;
      const scaleX = (dimensions.width - padding) / pathWidth;
      const scaleY = (dimensions.height - padding) / pathHeight;
      const targetScale = Math.min(3.5, Math.max(0.8, Math.min(scaleX, scaleY)));

      const targetX = dimensions.width / 2 - centerX * targetScale;
      const targetY = dimensions.height / 2 - centerY * targetScale;

      setTransform({ x: targetX, y: targetY, k: targetScale });
    }
  }, [dimensions]);

  // Auto-fit camera when highlighted path nodes change
  const prevPathKeyRef = useRef<string>('');
  useEffect(() => {
    if (highlightedPathNodeIds.size > 0) {
      const key = Array.from(highlightedPathNodeIds).sort().join(',');
      if (key !== prevPathKeyRef.current) {
        prevPathKeyRef.current = key;
        const timer = setTimeout(() => {
          fitNodeSetToView(highlightedPathNodeIds);
        }, 100);
        return () => clearTimeout(timer);
      }
    } else {
      prevPathKeyRef.current = '';
    }
  }, [highlightedPathNodeIds, fitNodeSetToView]);

  // Auto-fit camera when 'selected_relations' lens is active and nodes change
  useEffect(() => {
    if (activeLens === 'selected_relations' && nodes.length > 0 && nodes.length <= 40) {
      const ids = new Set(nodes.map(n => n.id));
      const timer = setTimeout(() => {
        fitNodeSetToView(ids);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [activeLens, nodes, fitNodeSetToView]);

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
    const nodeMap = new Map<string, GraphNode>();
    nodes.forEach(n => nodeMap.set(n.id, n));

    // Pre-calculate connected nodes for graph dimming interaction
    const connectedToSelected = new Set<string>();
    if (selectedNodeId) {
      connectedToSelected.add(selectedNodeId);
      edges.forEach(edge => {
        if (edge.source === selectedNodeId) connectedToSelected.add(edge.target);
        if (edge.target === selectedNodeId) connectedToSelected.add(edge.source);
      });
    }

    // 1. Draw Cluster Hull Backgrounds & Region Titles
    if (activeLens === 'source_clusters' || activeLens === 'audit_mode') {
      clusterCenters.forEach((center) => {
        const hullRadius = 180 * spreadMultiplier;
        ctx.beginPath();
        ctx.arc(center.x, center.y, hullRadius, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(24, 24, 27, 0.25)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(63, 63, 70, 0.25)';
        ctx.lineWidth = 1.2 / scale;
        ctx.setLineDash([6 / scale, 6 / scale]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Cluster Title Pill Badge
        const titleText = center.title;
        const fontSize = Math.max(11, Math.min(16, 13 / scale));
        ctx.font = `700 ${fontSize}px 'IBM Plex Mono', monospace`;
        const metrics = ctx.measureText(titleText);
        const paddingX = 12 / scale;
        const paddingY = 6 / scale;
        const pillW = metrics.width + paddingX * 2;
        const pillH = fontSize + paddingY * 2;
        const pillX = center.x - pillW / 2;
        const pillY = center.y - hullRadius - pillH;

        ctx.fillStyle = 'rgba(15, 15, 18, 0.92)';
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.lineWidth = 1 / scale;
        ctx.beginPath();
        ctx.roundRect(pillX, pillY, pillW, pillH, 8 / scale);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#38bdf8';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(titleText, center.x, pillY + pillH / 2);
      });
    }

    // 2. Draw Edges with Curve Arcs & Edge Mode Filtering
    const isFilteredSearch = searchQuery.trim() !== '';
    const searchLower = searchQuery.toLowerCase();

    edges.forEach((edge) => {
      const srcPos = posMap.get(edge.source);
      const tgtPos = posMap.get(edge.target);
      if (!srcPos || !tgtPos) return;

      const isPathEdge = highlightedPathEdgeIds.has(edge.id);
      const isConnectedToSelected = selectedNodeId === edge.source || selectedNodeId === edge.target;
      const isConnectedToHovered = hoveredNodeId === edge.source || hoveredNodeId === edge.target;

      if (edgeMode === 'selected_only' && !isConnectedToSelected && !isConnectedToHovered && !isPathEdge) {
        return; // Skip drawing unselected edges in selected_only mode
      }

      // Edge Color & Line Width
      let alpha = edgeMode === 'subtle' ? 0.08 : 0.22;
      let strokeColor = '#52525b';
      let lineWidth = 0.8;

      if (edge.relation === 'VOID_RESONANCE') {
        strokeColor = '#06b6d4'; // Cyan
        alpha = edgeMode === 'subtle' ? 0.15 : 0.35;
      } else if (edge.relation === 'PRIMARY_SOURCE_OF') {
        strokeColor = '#f59e0b'; // Amber
        alpha = edgeMode === 'subtle' ? 0.20 : 0.45;
        lineWidth = 1.2;
      }

      if (isPathEdge) {
        strokeColor = '#10b981'; // Vivid Green
        alpha = 0.95;
        lineWidth = 3.2;
      } else if (isConnectedToSelected || isConnectedToHovered) {
        strokeColor = isConnectedToSelected ? '#38bdf8' : '#c084fc';
        alpha = 0.90;
        lineWidth = 2.4;
      } else if (selectedNodeId) {
        alpha = 0.02; // Drastically dim background edges when something is selected
      }

      // Void Depth Link Dimming based on absorption axis
      if (voidDepth > 0 && !isPathEdge && !isConnectedToSelected) {
        const srcNode = nodeMap.get(edge.source);
        const tgtNode = nodeMap.get(edge.target);
        const srcAbs = srcNode?.metadata?.absorptionAxis ?? (srcNode as any)?.absorptionAxis ?? 0.5;
        const tgtAbs = tgtNode?.metadata?.absorptionAxis ?? (tgtNode as any)?.absorptionAxis ?? 0.5;
        const avgAbs = (srcAbs + tgtAbs) / 2;
        if (avgAbs < voidDepth) {
          const shortfall = voidDepth - avgAbs;
          alpha *= Math.max(0.04, 1.0 - (shortfall * 2.2));
        }
      }

      // Curved Arc Edge Calculation
      const dx = tgtPos.x - srcPos.x;
      const dy = tgtPos.y - srcPos.y;
      const midX = (srcPos.x + tgtPos.x) / 2;
      const midY = (srcPos.y + tgtPos.y) / 2;

      // Slight curvature perpendicular offset
      const curveOffset = 18;
      const ctrlX = midX - dy * (curveOffset / (Math.sqrt(dx * dx + dy * dy) || 1));
      const ctrlY = midY + dx * (curveOffset / (Math.sqrt(dx * dx + dy * dy) || 1));

      ctx.beginPath();
      ctx.moveTo(srcPos.x, srcPos.y);
      ctx.quadraticCurveTo(ctrlX, ctrlY, tgtPos.x, tgtPos.y);
      ctx.strokeStyle = strokeColor;
      ctx.globalAlpha = alpha;
      ctx.lineWidth = lineWidth / scale;
      ctx.stroke();
      ctx.globalAlpha = 1.0;
    });

    // 3. Draw Nodes & Backdrop Pill Labels
    nodes.forEach((node) => {
      const pos = posMap.get(node.id);
      if (!pos) return;

      const isSelected = selectedNodeId === node.id;
      const isHovered = hoveredNodeId === node.id;
      const isPathNode = highlightedPathNodeIds.has(node.id);
      const isMatch = isFilteredSearch && (node.label.toLowerCase().includes(searchLower) || node.id.toLowerCase().includes(searchLower));

      const typeStyle = NODE_COLORS[node.type] || NODE_COLORS['concept'];
      let fillColor = typeStyle.fill;
      let strokeColor = stylingOptions?.borderStyle === 'type_color' 
        ? typeStyle.border 
        : (isSelected ? '#ffffff' : isPathNode ? '#10b981' : isHovered ? typeStyle.border : '#18181b');

      if (activeLens === 'audit_mode' && node.isDuplicateLabel) {
        fillColor = '#ef4444'; // Bright Red
        strokeColor = '#f87171';
      }

      const radius = isSelected ? pos.radius * 1.4 : isHovered ? pos.radius * 1.25 : pos.radius;

      ctx.save();
      
      // Dim non-connected nodes
      if (selectedNodeId && !connectedToSelected.has(node.id)) {
        ctx.globalAlpha = 0.08;
      }

      // Void Depth state-based filter: dynamically dim non-conforming nodes
      const nodeAbsorption = node.metadata?.absorptionAxis ?? (node as any).absorptionAxis ?? 0.5;
      if (voidDepth > 0 && !isSelected && !isHovered && !isPathNode) {
        if (nodeAbsorption < voidDepth) {
          const shortfall = voidDepth - nodeAbsorption;
          const dimAlpha = Math.max(0.04, 1.0 - (shortfall * 2.4));
          ctx.globalAlpha = Math.min(ctx.globalAlpha, dimAlpha);
        }
      }

      ctx.translate(pos.x, pos.y);

      // Radial Glow Halo
      const showBaseGlow = isSelected || isHovered || isPathNode || stylingOptions?.showGlow;
      if (showBaseGlow || isVoidDepthActive || voidDepth > 0) {
        const absorption = nodeAbsorption;
        const glowMultiplier = (isVoidDepthActive || voidDepth > 0) ? 1.0 + (absorption * 2.5) : (1.0 + (absorption * 0.8));
        const outerRadius = radius * (1.8 + absorption * 1.2) * glowMultiplier;

        const glowGrad = ctx.createRadialGradient(0, 0, radius * 0.4, 0, 0, outerRadius);
        let coreGlow = isPathNode ? 'rgba(16, 185, 129, 0.55)' : typeStyle.glow;

        if (isVoidDepthActive || voidDepth > 0) {
          if (absorption >= 0.75) {
            coreGlow = `rgba(139, 92, 246, ${0.35 + absorption * 0.55})`; // glow-violet
          } else if (absorption >= 0.4) {
            coreGlow = `rgba(34, 211, 238, ${0.35 + absorption * 0.55})`; // glow-cyan
          } else {
            coreGlow = typeStyle.glow.replace(/[\d.]+\)$/, `${0.2 + absorption * 0.4})`);
          }
        }

        glowGrad.addColorStop(0, coreGlow);
        glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(0, 0, outerRadius, 0, 2 * Math.PI);
        ctx.fill();
      }

      // Node Shape
      ctx.fillStyle = fillColor;
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = (isSelected ? 2.8 : isHovered ? 2.0 : 1.4) / scale;

      if (node.type === 'concept') {
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
      } else if (node.type === 'thinker') {
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
        const w = radius * 2.2;
        const h = radius * 1.6;
        ctx.beginPath();
        ctx.roundRect(-w / 2, -h / 2, w, h, 4);
        ctx.fill();
        ctx.stroke();
      }

      // Duplicate Badge
      if (node.isDuplicateLabel && (node.duplicateGroupCount || 1) > 1) {
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(radius * 0.8, -radius * 0.8, 6 / scale, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = '#000000';
        ctx.font = `bold ${Math.max(8, 9 / scale)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${node.duplicateGroupCount}`, radius * 0.8, -radius * 0.8);
      }

      // Progressive Label Disclosure with Dark Backdrop Pill
      const shouldShowLabel = showAllLabels || isSelected || isHovered || isPathNode || isMatch || (scale > 0.85) || (node.degree >= 6);

      if (shouldShowLabel) {
        const labelText = node.label;
        const fontSize = Math.max(9, Math.min(13, 11 / scale));
        ctx.font = `${isSelected ? '700' : '500'} ${fontSize}px sans-serif`;

        const textMetrics = ctx.measureText(labelText);
        const padX = 6 / scale;
        const padY = 3 / scale;
        const pillW = textMetrics.width + padX * 2;
        const pillH = fontSize + padY * 2;
        const pillX = -pillW / 2;
        const pillY = radius + (4 / scale);

        // Dark Backdrop Pill Rectangle
        ctx.fillStyle = isSelected
          ? 'rgba(15, 23, 42, 0.95)'
          : isHovered
          ? 'rgba(24, 24, 27, 0.92)'
          : 'rgba(9, 9, 11, 0.88)';
        ctx.strokeStyle = isSelected
          ? '#38bdf8'
          : isHovered
          ? typeStyle.border
          : 'rgba(63, 63, 70, 0.4)';
        ctx.lineWidth = 1 / scale;

        ctx.beginPath();
        ctx.roundRect(pillX, pillY, pillW, pillH, 4 / scale);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = isSelected ? '#ffffff' : isHovered ? '#e4e4e7' : typeStyle.text || '#d4d4d8';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(labelText, 0, pillY + pillH / 2);
      }

      ctx.restore();
    });

    ctx.restore();
  }, [dimensions, transform, nodes, edges, selectedNodeId, hoveredNodeId, activeLens, highlightedPathNodeIds, highlightedPathEdgeIds, searchQuery, clusterCenters, spreadMultiplier, edgeMode, showAllLabels, stylingOptions, isVoidDepthActive, voidDepth]);

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

      {/* Active Path Control Floating Overlay */}
      {highlightedPathNodeIds.size > 0 && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-neutral-900/90 border border-emerald-500/50 backdrop-blur-md px-4 py-2 rounded-2xl shadow-2xl z-20 font-mono text-xs text-emerald-300 flex items-center gap-3 animate-fade-in">
          <div className="flex items-center gap-1.5 font-bold">
            <Compass className="w-4 h-4 text-emerald-400" />
            <span>Traced Path Active ({highlightedPathNodeIds.size} Nodes)</span>
          </div>
          <button
            onClick={() => fitNodeSetToView(highlightedPathNodeIds)}
            className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-lg transition-all cursor-pointer text-[11px] flex items-center gap-1"
            title="Auto-zoom and center camera on traced path"
          >
            <Maximize2 className="w-3 h-3" />
            <span>Fit Path</span>
          </button>
          {onToggleIsolatePath && (
            <button
              onClick={onToggleIsolatePath}
              className={`px-2.5 py-1 rounded-lg border font-bold transition-all cursor-pointer text-[11px] flex items-center gap-1 ${
                isPathIsolated
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-200'
                  : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:text-white'
              }`}
            >
              {isPathIsolated ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              <span>{isPathIsolated ? 'Show All Nodes' : 'Isolate Path'}</span>
            </button>
          )}
        </div>
      )}

      {/* Selected & Relations Mode Active Banner */}
      {activeLens === 'selected_relations' && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-neutral-900/90 border border-cyan-500/50 backdrop-blur-md px-4 py-2 rounded-2xl shadow-2xl z-20 font-mono text-xs text-cyan-300 flex items-center gap-3 animate-fade-in">
          <div className="flex items-center gap-1.5 font-bold">
            <Focus className="w-4 h-4 text-cyan-400" />
            <span>Selected Node & Relations Lens ({nodes.length} Nodes)</span>
          </div>
          <button
            onClick={() => fitNodeSetToView(new Set(nodes.map(n => n.id)))}
            className="px-2.5 py-1 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-lg transition-all cursor-pointer text-[11px] flex items-center gap-1"
          >
            <Maximize2 className="w-3 h-3" />
            <span>Fit View</span>
          </button>
        </div>
      )}

      {/* Open Inspector Floating Button when Right Sidebar is Closed */}
      {!isRightSidebarOpen && onToggleRightSidebar && (
        <button
          onClick={onToggleRightSidebar}
          className="absolute top-3 right-3 z-30 px-3 py-1.5 bg-neutral-900/90 hover:bg-neutral-850 border border-cyan-500/50 rounded-xl text-cyan-300 font-mono text-xs font-bold flex items-center gap-2 shadow-xl backdrop-blur-md transition-all cursor-pointer"
          title="Open Node Inspector Sidebar"
        >
          <PanelRight className="w-4 h-4 text-cyan-400" />
          <span>Open Inspector</span>
        </button>
      )}

      {/* Graph Clarity & Layout Control Bar (Bottom Left) */}
      <div className="absolute bottom-4 left-4 z-20 bg-neutral-900/90 border border-neutral-800 rounded-2xl p-2.5 backdrop-blur-xl shadow-2xl font-mono text-xs flex flex-wrap items-center gap-3 text-neutral-300">
        
        {/* Layout Spread Slider */}
        <div className="flex items-center gap-2 pr-2 border-r border-neutral-800">
          <span className="text-[11px] text-cyan-400 font-bold">Cluster Spread:</span>
          <input
            type="range"
            min={1.0}
            max={3.0}
            step={0.2}
            value={spreadMultiplier}
            onChange={(e) => setSpreadMultiplier(parseFloat(e.target.value))}
            className="w-20 accent-cyan-500 cursor-pointer"
          />
          <span className="text-[10px] text-neutral-400 w-8">{spreadMultiplier}x</span>
        </div>

        {/* Physics Scatter & Relax Button */}
        <button
          onClick={() => {
            relaxLayout();
            render();
          }}
          className="px-2.5 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-200 font-bold rounded-lg transition-all cursor-pointer text-[11px]"
          title="Run layout physics relaxation to scatter overlapping nodes"
        >
          Unclutter Nodes
        </button>

        {/* Edge Visibility Mode */}
        <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-xl border border-neutral-850 text-[10px]">
          <span className="text-neutral-500 px-1 font-semibold">Edges:</span>
          <button
            onClick={() => setEdgeMode('subtle')}
            className={`px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer ${
              edgeMode === 'subtle' ? 'bg-cyan-500 text-black' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Subtle Arcs
          </button>
          <button
            onClick={() => setEdgeMode('selected_only')}
            className={`px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer ${
              edgeMode === 'selected_only' ? 'bg-cyan-500 text-black' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Selected Links Only
          </button>
          <button
            onClick={() => setEdgeMode('full')}
            className={`px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer ${
              edgeMode === 'full' ? 'bg-cyan-500 text-black' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Full Mesh
          </button>
        </div>

        {/* Label Display Mode */}
        <button
          onClick={() => setShowAllLabels(!showAllLabels)}
          className={`px-2.5 py-1 rounded-xl border font-bold transition-all cursor-pointer text-[11px] ${
            showAllLabels
              ? 'bg-purple-500/20 border-purple-500/50 text-purple-200'
              : 'bg-neutral-850 border-neutral-750 text-neutral-400'
          }`}
        >
          {showAllLabels ? 'Labels: All Pills' : 'Labels: Smart Only'}
        </button>

        {/* Void Depth Visualizer Toggle */}
        <button
          onClick={() => setIsVoidDepthActive(!isVoidDepthActive)}
          className={`px-2.5 py-1 rounded-xl border font-bold transition-all cursor-pointer text-[11px] ${
            isVoidDepthActive
              ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-200 shadow-[0_0_10px_rgba(34,211,238,0.2)]'
              : 'bg-neutral-850 border-neutral-750 text-neutral-400'
          }`}
          title="Visualize metadata 'absorption axis' via node glow intensity"
        >
          Void Depth: {isVoidDepthActive ? 'ON' : 'OFF'}
        </button>
      </div>

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

export const KnowledgeGraph = GraphCanvas;

