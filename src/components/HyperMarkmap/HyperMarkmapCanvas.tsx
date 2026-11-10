import { useEffect, useRef, useImperativeHandle, forwardRef, useCallback } from 'react';
import * as d3 from 'd3';
import { HyperNode, LayoutMode, DisplaySettings } from './types';

export interface HyperMarkmapCanvasRef {
  fitView: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetView: () => void;
  focusNode: (nodeId: string) => void;
  exportSvg: () => string;
  exportPng: (scale?: number) => Promise<string>;
}

interface Props {
  rootNode: HyperNode;
  layoutMode: LayoutMode;
  displaySettings: DisplaySettings;
  selectedNodeId: string | null;
  onSelectNode: (node: HyperNode | null) => void;
  onToggleNode: (nodeId: string) => void;
  searchMatchIds?: string[];
  activeMatchId?: string | null;
  selectedTraditionIds?: string[];
}

export const HyperMarkmapCanvas = forwardRef<HyperMarkmapCanvasRef, Props>(({
  rootNode,
  layoutMode,
  displaySettings,
  selectedNodeId,
  onSelectNode,
  onToggleNode,
  searchMatchIds = [],
  activeMatchId = null,
  selectedTraditionIds = []
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const starfieldCanvasRef = useRef<HTMLCanvasElement>(null);
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const gRef = useRef<SVGGElement | null>(null);

  // Expose imperatives for zoom, fit, export
  useImperativeHandle(ref, () => ({
    fitView: () => handleFitView(true),
    zoomIn: () => {
      if (svgRef.current && zoomBehaviorRef.current) {
        d3.select(svgRef.current).transition().duration(250).call(zoomBehaviorRef.current.scaleBy, 1.3);
      }
    },
    zoomOut: () => {
      if (svgRef.current && zoomBehaviorRef.current) {
        d3.select(svgRef.current).transition().duration(250).call(zoomBehaviorRef.current.scaleBy, 0.77);
      }
    },
    resetView: () => {
      if (svgRef.current && zoomBehaviorRef.current) {
        d3.select(svgRef.current).transition().duration(350).call(zoomBehaviorRef.current.transform, d3.zoomIdentity);
      }
    },
    focusNode: (nodeId: string) => {
      handleFocusNode(nodeId);
    },
    exportSvg: () => {
      if (!svgRef.current) return '';
      return new XMLSerializer().serializeToString(svgRef.current);
    },
    exportPng: async (scale = 2) => {
      if (!svgRef.current) return '';
      const svgString = new XMLSerializer().serializeToString(svgRef.current);
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const URL = window.URL || window.webkitURL || window;
      const blobURL = URL.createObjectURL(svgBlob);

      const image = new Image();
      return new Promise<string>((resolve) => {
        image.onload = () => {
          const width = (svgRef.current?.clientWidth || 1200) * scale;
          const height = (svgRef.current?.clientHeight || 800) * scale;
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.fillStyle = '#090d16';
            ctx.fillRect(0, 0, width, height);
            ctx.drawImage(image, 0, 0, width, height);
            resolve(canvas.toDataURL('image/png'));
          } else {
            resolve('');
          }
          URL.revokeObjectURL(blobURL);
        };
        image.src = blobURL;
      });
    }
  }));

  // Background Starfield & Subtle Celestial Geometry
  useEffect(() => {
    const canvas = starfieldCanvasRef.current;
    if (!canvas || !displaySettings.showStarfield) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Subtle particles
    const stars: { x: number; y: number; r: number; alpha: number; speed: number }[] = [];
    for (let i = 0; i < 70; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.2 + 0.3,
        alpha: Math.random() * 0.4 + 0.1,
        speed: Math.random() * 0.008 + 0.003
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Low-profile celestial concentric rings
      const centerX = width / 2;
      const centerY = height / 2;
      const maxR = Math.min(width, height) * 0.45;

      ctx.strokeStyle = 'rgba(148, 163, 184, 0.03)';
      ctx.lineWidth = 1;
      for (let r = 90; r <= maxR; r += 130) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Discrete particles
      for (const star of stars) {
        star.alpha += star.speed;
        if (star.alpha > 0.6 || star.alpha < 0.1) star.speed = -star.speed;

        ctx.fillStyle = `rgba(203, 213, 225, ${Math.max(0.08, star.alpha)})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [displaySettings.showStarfield]);

  // Fit View Helper
  const handleFitView = useCallback((animate = true) => {
    if (!svgRef.current || !gRef.current || !zoomBehaviorRef.current) return;
    const svg = d3.select(svgRef.current);
    const bounds = gRef.current.getBBox();
    const parent = svgRef.current.parentElement;
    const fullWidth = parent?.clientWidth || 1000;
    const fullHeight = parent?.clientHeight || 700;

    if (bounds.width === 0 || bounds.height === 0) return;

    const scale = Math.min(
      Math.max(0.15, 0.88 / Math.max(bounds.width / fullWidth, bounds.height / fullHeight)),
      2.5
    );

    const midX = bounds.x + bounds.width / 2;
    const midY = bounds.y + bounds.height / 2;

    const transform = d3.zoomIdentity
      .translate(fullWidth / 2 - scale * midX, fullHeight / 2 - scale * midY)
      .scale(scale);

    if (animate) {
      svg.transition().duration(500).ease(d3.easeCubicOut).call(zoomBehaviorRef.current.transform, transform);
    } else {
      svg.call(zoomBehaviorRef.current.transform, transform);
    }
  }, []);

  // Focus specific node
  const handleFocusNode = useCallback((nodeId: string) => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    const nodeElem = svgRef.current.querySelector(`[data-node-id="${nodeId}"]`);
    if (!nodeElem) return;

    const transformAttr = nodeElem.getAttribute('transform');
    if (!transformAttr) return;

    const translateMatch = transformAttr.match(/translate\(([^,]+),([^)]+)\)/);
    if (!translateMatch) return;

    const nx = parseFloat(translateMatch[1]);
    const ny = parseFloat(translateMatch[2]);

    const parent = svgRef.current.parentElement;
    const fullWidth = parent?.clientWidth || 1000;
    const fullHeight = parent?.clientHeight || 700;

    const targetScale = 1.35;
    const transform = d3.zoomIdentity
      .translate(fullWidth / 2 - targetScale * nx, fullHeight / 2 - targetScale * ny)
      .scale(targetScale);

    d3.select(svgRef.current)
      .transition()
      .duration(550)
      .ease(d3.easeCubicOut)
      .call(zoomBehaviorRef.current.transform, transform);
  }, []);

  // ResizeObserver for responsive adaptation
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(() => {
      // Small debounce
      handleFitView(false);
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [handleFitView]);

  // Main D3 Tree Render Engine
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    let g = svg.select<SVGGElement>('g.main-layer');

    if (g.empty()) {
      g = svg.append('g').attr('class', 'main-layer');
      gRef.current = g.node();

      const zoom = d3.zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.08, 6])
        .on('zoom', (event) => {
          g.attr('transform', event.transform.toString());
        });

      zoomBehaviorRef.current = zoom;
      svg.call(zoom);
      svg.on('dblclick.zoom', null); // Allow double-click to toggle collapse/expand
      svg.on('click', () => {
        onSelectNode(null); // Deselect on background click
      });
    }

    // Build D3 Hierarchy with maxVisibleDepth filter
    function filterDepth(node: HyperNode, curDepth: number): any {
      const copy = { ...node };
      if (curDepth >= displaySettings.maxVisibleDepth) {
        if (copy.children && copy.children.length > 0) {
          copy._children = copy.children;
          copy.children = undefined;
        }
      } else if (copy.children) {
        copy.children = copy.children.map((c) => filterDepth(c, curDepth + 1));
      }
      return copy;
    }

    const filteredRoot = filterDepth(rootNode, 0);
    const rootHierarchy = d3.hierarchy<HyperNode>(filteredRoot, (d) => d.children);

    // Layout generator
    let layoutGen: any;
    if (layoutMode === 'radial') {
      layoutGen = d3.tree<HyperNode>()
        .size([2 * Math.PI, 600])
        .separation((a, b) => (a.parent === b.parent ? 1.2 : 2) / a.depth);
    } else {
      layoutGen = d3.tree<HyperNode>()
        .nodeSize([38, 230])
        .separation((a, b) => (a.parent === b.parent ? 1.1 : 1.5));
    }

    const treeData = layoutGen(rootHierarchy);
    const nodes = treeData.descendants();
    const links = treeData.links();

    // Calculate Cartesian coordinates
    nodes.forEach((d: any) => {
      if (layoutMode === 'radial') {
        const radius = d.depth === 0 ? 0 : d.y * (1 + d.depth * 0.08);
        const angle = d.x - Math.PI / 2;
        d.targetX = radius * Math.cos(angle);
        d.targetY = radius * Math.sin(angle);
        d.angle = angle;
      } else {
        d.targetX = d.y;
        d.targetY = d.x;
      }
    });

    // Check if node matches tradition filter
    const hasTraditionFilter = selectedTraditionIds.length > 0;
    const isNodeTraditionActive = (d: any) => {
      if (!hasTraditionFilter) return true;
      if (d.depth === 0) return true;
      const nodeTraditions: string[] = d.data.traditions || [];
      return nodeTraditions.some((t) => selectedTraditionIds.includes(t));
    };

    // Sober workstation color palette
    const getNodeColor = (d: any) => {
      if (d.data.id === activeMatchId) return '#f59e0b'; // amber search active
      if (searchMatchIds.includes(d.data.id)) return '#38bdf8'; // sky blue match
      if (d.depth === 0) return '#f8fafc'; // crisp white
      if (d.depth === 1) return '#38bdf8'; // slate cyan
      if (d.depth === 2) return '#94a3b8'; // silver slate
      if (d.depth === 3) return '#64748b'; // cool slate
      return '#475569'; // gunmetal
    };

    const getNodeRadius = (d: any) => {
      if (d.depth === 0) return 11;
      if (d.depth === 1) return 7;
      if (d.depth === 2) return 5;
      return 3.5;
    };

    // --- RENDER LINKS (FILAMENTS) ---
    const linkGroup = g.selectAll<SVGGElement, any>('g.links-layer').data([null]);
    const linkGroupEnter = linkGroup.enter().append('g').attr('class', 'links-layer');
    const linksLayer = linkGroup.merge(linkGroupEnter);

    const linkGenerator = layoutMode === 'radial'
      ? (d: any) => {
          const sx = d.source.targetX;
          const sy = d.source.targetY;
          const tx = d.target.targetX;
          const ty = d.target.targetY;
          const mx = (sx + tx) / 2;
          const my = (sy + ty) / 2;
          return `M ${sx} ${sy} Q ${mx * 1.05} ${my * 1.05} ${tx} ${ty}`;
        }
      : d3.linkHorizontal<any, any>()
          .x((d: any) => d.targetX)
          .y((d: any) => d.targetY);

    const linkSelection = linksLayer.selectAll<SVGPathElement, any>('path.filament-path')
      .data(links, (d: any) => `${d.source.data.id}->${d.target.data.id}`);

    linkSelection.exit().transition().duration(200).style('opacity', 0).remove();

    linkSelection.enter()
      .append('path')
      .attr('class', 'filament-path')
      .attr('fill', 'none')
      .attr('stroke', (d: any) => getNodeColor(d.target))
      .attr('stroke-opacity', (d: any) => (isNodeTraditionActive(d.target) ? 0.35 : 0.08))
      .attr('stroke-width', (d: any) => Math.max(1, 2.5 - d.target.depth * 0.4))
      .merge(linkSelection)
      .transition()
      .duration(350)
      .attr('d', linkGenerator as any)
      .attr('stroke', (d: any) => getNodeColor(d.target))
      .attr('stroke-opacity', (d: any) => (isNodeTraditionActive(d.target) ? 0.35 : 0.08))
      .attr('stroke-width', (d: any) => Math.max(1, 2.5 - d.target.depth * 0.4));

    // --- RENDER NODES ---
    const nodeGroup = g.selectAll<SVGGElement, any>('g.nodes-layer').data([null]);
    const nodeGroupEnter = nodeGroup.enter().append('g').attr('class', 'nodes-layer');
    const nodesLayer = nodeGroup.merge(nodeGroupEnter);

    const nodeSelection = nodesLayer.selectAll<SVGGElement, any>('g.hyper-node')
      .data(nodes, (d: any) => d.data.id);

    nodeSelection.exit().transition().duration(200).style('opacity', 0).remove();

    const nodeEnter = nodeSelection.enter()
      .append('g')
      .attr('class', 'hyper-node group cursor-pointer')
      .attr('data-node-id', (d: any) => d.data.id)
      .attr('transform', (d: any) => `translate(${d.targetX}, ${d.targetY})`)
      .on('click', (event, d: any) => {
        event.stopPropagation();
        onSelectNode(d.data);
      })
      .on('dblclick', (event, d: any) => {
        event.stopPropagation();
        onToggleNode(d.data.id);
      });

    // Subtle diffuse halo
    nodeEnter.append('circle')
      .attr('class', 'node-halo')
      .attr('r', (d: any) => getNodeRadius(d) * 2)
      .attr('fill', (d: any) => getNodeColor(d))
      .attr('opacity', 0.12);

    // Node core orb
    nodeEnter.append('circle')
      .attr('class', 'node-core')
      .attr('r', (d: any) => getNodeRadius(d))
      .attr('fill', (d: any) => getNodeColor(d))
      .attr('stroke', '#090d16')
      .attr('stroke-width', 1.5);

    // Node text label
    nodeEnter.append('text')
      .attr('class', 'node-label font-sans font-medium select-none')
      .attr('fill', '#e2e8f0')
      .attr('font-size', (d: any) => (d.depth === 0 ? 14 : d.depth === 1 ? 12 : 10))
      .attr('paint-order', 'stroke')
      .attr('stroke', '#090d16')
      .attr('stroke-width', 3)
      .attr('stroke-linejoin', 'round');

    // Collapse indicator badge (+N)
    const badgeGroup = nodeEnter.append('g')
      .attr('class', 'collapse-badge')
      .attr('cursor', 'pointer')
      .on('click', (event, d: any) => {
        event.stopPropagation();
        onToggleNode(d.data.id);
      });

    badgeGroup.append('circle')
      .attr('class', 'badge-bg')
      .attr('r', 7)
      .attr('fill', '#1e293b')
      .attr('stroke', '#475569')
      .attr('stroke-width', 1);

    badgeGroup.append('text')
      .attr('class', 'badge-text font-mono')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('font-size', 8)
      .attr('font-weight', 'bold')
      .attr('fill', '#94a3b8');

    // UPDATE MERGED NODES
    const nodeMerge = nodeSelection.merge(nodeEnter);

    nodeMerge.transition()
      .duration(350)
      .attr('transform', (d: any) => `translate(${d.targetX}, ${d.targetY})`)
      .style('opacity', (d: any) => (isNodeTraditionActive(d) ? 1 : 0.22));

    // Update Halos
    nodeMerge.select('circle.node-halo')
      .attr('fill', (d: any) => getNodeColor(d))
      .attr('r', (d: any) => getNodeRadius(d) * (d.data.id === selectedNodeId ? 2.8 : 2))
      .attr('opacity', (d: any) => (d.data.id === selectedNodeId ? 0.35 : 0.12));

    // Update Cores
    nodeMerge.select('circle.node-core')
      .attr('fill', (d: any) => getNodeColor(d))
      .attr('stroke', (d: any) => (d.data.id === selectedNodeId ? '#38bdf8' : '#090d16'))
      .attr('stroke-width', (d: any) => (d.data.id === selectedNodeId ? 2 : 1.5));

    // Update Labels
    nodeMerge.select('text.node-label')
      .text((d: any) => {
        const op = d.data.operator ? ` ${d.data.operator}` : '';
        return `${d.data.name}${op}`;
      })
      .attr('text-anchor', (d: any) => {
        if (layoutMode === 'radial') {
          return d.targetX >= 0 ? 'start' : 'end';
        }
        return 'start';
      })
      .attr('dx', (d: any) => {
        const r = getNodeRadius(d);
        if (layoutMode === 'radial') {
          return d.targetX >= 0 ? r + 8 : -(r + 8);
        }
        return r + 8;
      })
      .attr('dy', '0.32em')
      .attr('fill', (d: any) => (d.data.id === selectedNodeId ? '#38bdf8' : '#f1f5f9'));

    // Update Collapse Badges
    nodeMerge.select('g.collapse-badge')
      .style('display', (d: any) => {
        const hasHidden = d.data._children && d.data._children.length > 0;
        return hasHidden ? 'inline' : 'none';
      })
      .attr('transform', (d: any) => {
        const r = getNodeRadius(d);
        return `translate(${r + 10}, ${-r - 4})`;
      })
      .select('text.badge-text')
      .text((d: any) => {
        const count = d.data.descendantCount || (d.data._children ? d.data._children.length : 0);
        return `+${count}`;
      });

  }, [
    rootNode,
    layoutMode,
    displaySettings,
    selectedNodeId,
    searchMatchIds,
    activeMatchId,
    selectedTraditionIds,
    onSelectNode,
    onToggleNode
  ]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-[#090d16] overflow-hidden select-none"
    >
      {/* Background canvas for starry particles and geometry */}
      {displaySettings.showStarfield && (
        <canvas
          ref={starfieldCanvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none z-0"
        />
      )}

      {/* SVG Canvas for D3 interactive graph */}
      <svg
        ref={svgRef}
        className="relative z-10 w-full h-full cursor-grab active:cursor-grabbing"
      />
    </div>
  );
});

HyperMarkmapCanvas.displayName = 'HyperMarkmapCanvas';
