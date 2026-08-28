import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { OntologyNode, OntologyLink } from '../data/ontology';

interface NetworkGraphProps {
  nodes: OntologyNode[];
  links: OntologyLink[];
  width: number;
  height: number;
  onHoverNode: (id: string | null) => void;
  onSelectNode: (id: string) => void;
  selectedNodeId: string | null;
  hoveredNodeId: string | null;
  distanceMap: Map<string, number>;
  searchQuery: string;
  matchedNodeIds: Set<string>;
  layoutMode?: 'force' | 'tree';
}

interface D3Node extends OntologyNode, d3.SimulationNodeDatum {
  radius: number;
  degree: number;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

interface D3Link extends d3.SimulationLinkDatum<D3Node> {
  intensity: number;
}

const TYPE_STYLES: Record<string, { color: string }> = {
  'NT_CORE': { color: '#a855f7' },
  'NT_THINKER': { color: '#3b82f6' },
  'PROMPT_SYSTEM': { color: '#ef4444' },
  'STRUCTURAL_HEADING': { color: '#eab308' },
  'UNKNOWN_REVIEW': { color: '#64748b' },
  'NGRAM_FRAGMENT': { color: '#94a3b8' },
  'Ontological Core': { color: '#a855f7' },
  'Conceptual Core': { color: '#d4d4d8' },
  'Epistemological': { color: '#3b82f6' },
  'Theological': { color: '#fbbf24' },
  'Phenomenological': { color: '#f43f5e' },
  'Existential': { color: '#8b5cf6' },
  'Praxis': { color: '#10b981' }
};

const getStyle = (type: string) => TYPE_STYLES[type] || { color: '#d4d4d8' };

export const NetworkGraph: React.FC<NetworkGraphProps> = ({
  nodes,
  links,
  width,
  height,
  onHoverNode,
  onSelectNode,
  selectedNodeId,
  hoveredNodeId,
  distanceMap,
  searchQuery,
  matchedNodeIds,
  layoutMode = 'force'
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const simulationRef = useRef<d3.Simulation<D3Node, D3Link> | null>(null);

  const nodesRef = useRef<D3Node[]>([]);
  const linksRef = useRef<D3Link[]>([]);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  const zoomState = useRef<{k: number, x: number, y: number}>({k: 1, x: 0, y: 0});
  const thresholds = useRef({ t15: 0, t50: 0 });

  useEffect(() => {
    const degrees = new Map<string, number>();
    nodes.forEach(n => degrees.set(n.id, 0));
    links.forEach(l => {
      const s = typeof l.source === 'object' && l.source !== null ? (l.source as any).id : (l.source as string);
      const t = typeof l.target === 'object' && l.target !== null ? (l.target as any).id : (l.target as string);
      degrees.set(s, (degrees.get(s) || 0) + 1);
      degrees.set(t, (degrees.get(t) || 0) + 1);
    });

    const sortedDeg = Array.from(degrees.values()).sort((a,b)=>b-a);
    thresholds.current.t15 = sortedDeg[Math.floor(sortedDeg.length * 0.08)] || 10; // Top ~8% hubs
    thresholds.current.t50 = sortedDeg[Math.floor(sortedDeg.length * 0.25)] || 5;  // Top ~25% hubs

    nodesRef.current = nodes.map(n => {
      const deg = degrees.get(n.id) || 0;
      return { 
        ...n, 
        degree: deg,
        radius: 3.5 + Math.log(1 + deg) * 1.8 
      };
    });
    
    linksRef.current = links.map(l => ({ 
      source: typeof l.source === 'object' && l.source !== null ? (l.source as any).id : l.source,
      target: typeof l.target === 'object' && l.target !== null ? (l.target as any).id : l.target,
      intensity: l.intensity 
    })) as unknown as D3Link[];

    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current as Exclude<typeof svgRef.current, null>);
    
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        zoomState.current = event.transform;
        svg.select('.zoom-group').attr('transform', event.transform);
        
        const k = event.transform.k;
        const labelScale = Math.max(0.75, Math.min(1.3, 1 / Math.pow(k, 0.4)));
        svg.selectAll('.label-group').attr('transform', `scale(${labelScale})`);

        svg.selectAll('.label-group').style('opacity', function(d: any) {
          if (d.id === selectedNodeId || d.id === hoveredNodeId) return 1;
          const nodeOpacity = parseFloat(d3.select((this as any).parentNode).style('opacity') || '1');
          if (nodeOpacity < 0.2) return 0;
          if (k < 1.2) return d.degree >= thresholds.current.t15 ? 0.95 : 0;
          if (k < 2.0) return d.degree >= thresholds.current.t50 ? 0.95 : 0;
          return 0.95;
        });
      });
      
    svg.call(zoom);
    zoomRef.current = zoom;

    svg.on('dblclick.zoom', (event) => {
        event.stopPropagation();
        svg.transition().duration(750).call(zoom.transform, d3.zoomIdentity);
    });

    const g = svg.select('.zoom-group');
    if (g.empty()) {
      svg.append('g').attr('class', 'zoom-group');
    }

    const zoomGroup = svg.select('.zoom-group');
    zoomGroup.selectAll('*').remove();

    zoomGroup.append('g').attr('class', 'links-layer');
    zoomGroup.append('g').attr('class', 'nodes-layer');

    const simulation = d3.forceSimulation<D3Node>(nodesRef.current)
      .force('link', d3.forceLink<D3Node, D3Link>(linksRef.current).id(d => d.id).distance(() => 70).strength(0.2))
      .force('charge', d3.forceManyBody().strength(-280).distanceMax(900))
      .force('center', d3.forceCenter(width / 2, height / 2).strength(0.02))
      .force('collide', d3.forceCollide<D3Node>().radius(d => d.radius + 10).iterations(3))
      .force('x', d3.forceX<D3Node>(width / 2).strength(0.025))
      .force('y', d3.forceY<D3Node>(height / 2).strength(0.025))
      .alphaDecay(0.02)
      .velocityDecay(0.4);
    
    simulationRef.current = simulation;

    const drag = d3.drag<SVGGElement, D3Node>()
      .on('start', (event, d) => {
        if (!event.active && layoutMode === 'force') simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on('drag', (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on('end', (event, d) => {
        if (!event.active && layoutMode === 'force') simulation.alphaTarget(0);
        if (layoutMode === 'force') {
          d.fx = null;
          d.fy = null;
        }
      });

    const linkElements = zoomGroup.select('.links-layer')
      .selectAll('.link')
      .data(linksRef.current)
      .enter()
      .append('line')
      .attr('class', 'link')
      .attr('stroke', 'rgba(160, 180, 210, 0.15)')
      .attr('stroke-width', 0.5)
      .attr('shape-rendering', 'geometricPrecision');

    const nodeElements = zoomGroup.select('.nodes-layer')
      .selectAll('.node')
      .data(nodesRef.current)
      .enter()
      .append('g')
      .attr('class', 'node')
      .style('cursor', 'pointer')
      .call(drag as any)
      .on('mouseenter', (_event, d) => onHoverNode(d.id))
      .on('mouseleave', () => onHoverNode(null))
      .on('click', (event, d) => {
        event.stopPropagation();
        onSelectNode(d.id);
        
        const transform = d3.zoomIdentity
            .translate(width / 2, height / 2)
            .scale(2)
            .translate(-(d.x || 0), -(d.y || 0));
        svg.transition().duration(750).ease(d3.easeCubicInOut).call(zoom.transform, transform);
      });

    // Dynamic absorption glow halo using SVG filter effects
    nodeElements.append('circle')
      .attr('class', 'absorption-glow')
      .attr('r', d => {
        const absorption = d.metadata?.absorptionAxis ?? d.absorptionAxis ?? 0.5;
        return d.radius + (absorption * 8);
      })
      .attr('fill', d => getStyle(d.type).color)
      .attr('filter', d => {
        const absorption = d.metadata?.absorptionAxis ?? d.absorptionAxis ?? 0.5;
        if (absorption >= 0.85) return 'url(#svg-glow-abyssal)';
        if (absorption >= 0.70) return 'url(#svg-glow-intense)';
        if (absorption >= 0.50) return 'url(#svg-glow-medium)';
        return 'url(#svg-glow-subtle)';
      })
      .style('opacity', d => {
        const absorption = d.metadata?.absorptionAxis ?? d.absorptionAxis ?? 0.5;
        return 0.25 + (absorption * 0.55);
      });

    // Solid core, no blur, crisp
    nodeElements.append('circle')
      .attr('class', 'core')
      .attr('r', d => d.radius)
      .attr('fill', d => getStyle(d.type).color)
      .attr('shape-rendering', 'geometricPrecision')
      .style('opacity', 1.0);

    // Sharp outer ring (only shown when highlighted)
    nodeElements.append('circle')
      .attr('class', 'active-ring')
      .attr('r', d => d.radius + 3)
      .attr('fill', 'none')
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 1.5)
      .attr('shape-rendering', 'geometricPrecision')
      .style('opacity', 0);

    // Label group container with crisp high-contrast pill badge and pin-sharp vector typography
    const labelGroups = nodeElements.append('g')
      .attr('class', 'label-group')
      .style('pointer-events', 'none');

    labelGroups.append('rect')
      .attr('class', 'label-bg')
      .attr('rx', 4)
      .attr('ry', 4)
      .attr('fill', 'rgba(8, 10, 15, 0.90)')
      .attr('stroke', 'rgba(255, 255, 255, 0.16)')
      .attr('stroke-width', '0.75px')
      .attr('shape-rendering', 'geometricPrecision');

    labelGroups.append('text')
      .attr('class', 'label')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .text(d => d.label.length > 22 ? d.label.slice(0, 20) + '…' : d.label)
      .style('font-family', 'ui-sans-serif, system-ui, -apple-system, sans-serif')
      .style('font-size', '10.5px')
      .style('font-weight', '500')
      .style('fill', '#f1f5f9')
      .style('letter-spacing', '0.01em')
      .style('text-rendering', 'geometricPrecision');

    // Dynamically align pill bounds to text dimensions
    labelGroups.each(function(d: any) {
      const g = d3.select(this);
      const textEl = g.select('text').node() as SVGTextElement | null;
      const yOffset = d.radius + 13;
      if (textEl) {
        try {
          const bbox = textEl.getBBox();
          const padX = 6;
          const padY = 3;
          g.select('text')
            .attr('x', 0)
            .attr('y', yOffset);
          g.select('rect')
            .attr('x', -bbox.width / 2 - padX)
            .attr('y', yOffset - bbox.height / 2 - padY)
            .attr('width', bbox.width + padX * 2)
            .attr('height', bbox.height + padY * 2);
        } catch {
          const displayText = d.label.length > 22 ? d.label.slice(0, 20) + '…' : d.label;
          const estWidth = displayText.length * 6 + 10;
          g.select('text').attr('x', 0).attr('y', yOffset);
          g.select('rect')
            .attr('x', -estWidth / 2)
            .attr('y', yOffset - 8)
            .attr('width', estWidth)
            .attr('height', 16);
        }
      }
    });

    simulation.on('tick', () => {
      if (layoutMode === 'tree') return;
      
      linkElements
          .attr('x1', (d: any) => d.source.x)
          .attr('y1', (d: any) => d.source.y)
          .attr('x2', (d: any) => d.target.x)
          .attr('y2', (d: any) => d.target.y);
      
      nodeElements.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    return () => {
      simulation.stop();
    };
  }, [nodes, links, width, height]);

  useEffect(() => {
    if (!svgRef.current || !simulationRef.current) return;
    const simulation = simulationRef.current;
    const svg = d3.select(svgRef.current);
    const linkElements = svg.selectAll('.link');
    const nodeElements = svg.selectAll('.node');

    if (layoutMode === 'tree') {
      simulation.stop();
      
      let rootId = '';
      if (selectedNodeId) rootId = selectedNodeId;
      else if (nodesRef.current.length > 0) {
        let maxDeg = -1;
        nodesRef.current.forEach(n => {
          if (n.degree > maxDeg) { maxDeg = n.degree; rootId = n.id; }
        });
      }
      
      if (!rootId && nodesRef.current.length > 0) rootId = nodesRef.current[0].id;

      const adj = new Map<string, string[]>();
      linksRef.current.forEach((l: any) => {
        if (!adj.has(l.source.id)) adj.set(l.source.id, []);
        if (!adj.has(l.target.id)) adj.set(l.target.id, []);
        adj.get(l.source.id)!.push(l.target.id);
      });
      
      const visited = new Set<string>();
      const treeNodes = new Map<string, any>();
      nodesRef.current.forEach(n => treeNodes.set(n.id, { id: n.id, children: [] }));

      const root = treeNodes.get(rootId);
      visited.add(rootId);
      const queue = [rootId];

      while (queue.length > 0) {
        const currId = queue.shift()!;
        const currNode = treeNodes.get(currId);
        const neighbors = adj.get(currId) || [];
        for (const neighborId of neighbors) {
          if (!visited.has(neighborId)) {
            visited.add(neighborId);
            const neighborNode = treeNodes.get(neighborId);
            currNode.children.push(neighborNode);
            queue.push(neighborId);
          }
        }
      }
      
      nodesRef.current.forEach(n => {
        if (!visited.has(n.id)) {
          root.children.push(treeNodes.get(n.id));
        }
      });
      
      const rootHierarchy = d3.hierarchy(root);
      const treeLayout = d3.tree().size([Math.max(10, width - 100), Math.max(10, height - 100)]);
      treeLayout(rootHierarchy as any);
      
      const treePositions = new Map<string, {x: number, y: number}>();
      rootHierarchy.descendants().forEach((d: any) => {
        treePositions.set(d.data.id, { x: d.x + 50, y: d.y + 50 });
      });
      
      nodesRef.current.forEach(n => {
        const pos = treePositions.get(n.id);
        if (pos) {
          n.fx = pos.x;
          n.fy = pos.y;
        }
      });
      
      nodeElements.transition()
        .duration(750)
        .ease(d3.easeCubicInOut)
        .attr('transform', (d: any) => `translate(${d.fx},${d.fy})`);
      
      // Update link to use line not path since we changed it to 'line'
      linkElements.transition()
        .duration(750)
        .ease(d3.easeCubicInOut)
        .attr('x1', (d: any) => d.source.fx)
        .attr('y1', (d: any) => d.source.fy)
        .attr('x2', (d: any) => d.target.fx)
        .attr('y2', (d: any) => d.target.fy);
    } else {
      nodesRef.current.forEach(n => { n.fx = null; n.fy = null; });
      simulation.alpha(0.3).restart();
    }
  }, [layoutMode, width, height]);

  useEffect(() => {
    if (!svgRef.current || !zoomRef.current || searchQuery.trim() === '') return;
    if (matchedNodeIds.size === 0) return;

    const svg = d3.select(svgRef.current);
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    nodesRef.current.forEach(n => {
      if (matchedNodeIds.has(n.id)) {
        const x = layoutMode === 'tree' ? (n.fx || n.x || 0) : (n.x || 0);
        const y = layoutMode === 'tree' ? (n.fy || n.y || 0) : (n.y || 0);
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    });

    if (minX !== Infinity) {
      const cx = (minX + maxX) / 2;
      const cy = (minY + maxY) / 2;
      const dx = maxX - minX;
      const dy = maxY - minY;
      const scale = Math.max(0.5, Math.min(2, 0.9 / Math.max(dx / width, dy / height || 1)));
      const transform = d3.zoomIdentity.translate(width / 2, height / 2).scale(scale).translate(-cx, -cy);
      
      svg.transition().duration(750).ease(d3.easeCubicInOut).call(zoomRef.current.transform, transform);
    }
  }, [searchQuery, matchedNodeIds, layoutMode, width, height]);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    const linkElements = svg.selectAll('.link');
    const nodeElements = svg.selectAll('.node');

    const isSearchActive = searchQuery.trim() !== '';

    linkElements.each(function(d: any) {
      const el = d3.select(this);
      let strokeOpacity = 0.15;
      let strokeColor = 'rgba(160, 180, 210, 0.15)'; 
      let strokeWidth = 0.5;

      if (isSearchActive) {
        const sMatch = matchedNodeIds.has(d.source.id);
        const tMatch = matchedNodeIds.has(d.target.id);
        if (sMatch && tMatch) {
          strokeOpacity = 0.85;
          strokeColor = '#ffffff';
          strokeWidth = 1.5;
        } else {
          strokeOpacity = 0.02;
        }
      } else if (selectedNodeId) {
        const sDist = distanceMap.get(d.source.id);
        const tDist = distanceMap.get(d.target.id);
        const sIn = sDist !== undefined && sDist <= 2;
        const tIn = tDist !== undefined && tDist <= 2;
        
        if (sIn && tIn) {
          if ((sDist === 0 && tDist === 1) || (sDist === 1 && tDist === 0)) {
            strokeOpacity = 0.9;
            strokeWidth = 1.5;
            strokeColor = getStyle(d.source.type).color;
          } else {
            strokeOpacity = 0.3;
            strokeColor = '#94a3b8'; 
          }
        } else {
          strokeOpacity = 0.02;
        }
      } else if (hoveredNodeId) {
        if (d.source.id === hoveredNodeId || d.target.id === hoveredNodeId) {
          strokeOpacity = 0.9;
          strokeWidth = 1.5;
          strokeColor = getStyle(d.source.id === hoveredNodeId ? d.source.type : d.target.type).color;
        } else {
          strokeOpacity = 0.02;
        }
      }

      el.transition().duration(250)
        .attr('stroke', strokeColor)
        .attr('stroke-width', strokeWidth)
        .style('opacity', strokeOpacity);
    });

    nodeElements.each(function(d: any) {
      const el = d3.select(this);
      
      let nodeOpacity = 1;
      let isHighlighted = false;

      if (isSearchActive) {
        if (matchedNodeIds.has(d.id)) {
          nodeOpacity = 1.0;
          isHighlighted = true;
        } else {
          nodeOpacity = 0.08;
        }
      } else if (selectedNodeId) {
        const dist = distanceMap.get(d.id);
        if (dist === 0 || dist === 1) {
          nodeOpacity = 1.0;
          if (dist === 0) isHighlighted = true;
        } else if (dist === 2) {
          nodeOpacity = 0.5;
        } else {
          nodeOpacity = 0.08;
        }
      } else if (hoveredNodeId) {
        if (d.id === hoveredNodeId) {
          nodeOpacity = 1.0;
          isHighlighted = true;
        } else {
          const isNeighbor = linksRef.current.some((l: any) => 
            (l.source.id === hoveredNodeId && l.target.id === d.id) ||
            (l.target.id === hoveredNodeId && l.source.id === d.id)
          );
          if (isNeighbor) { 
            nodeOpacity = 0.9;
          } else { 
            nodeOpacity = 0.08;
          }
        }
      }

      el.transition().duration(250).style('opacity', nodeOpacity);
      
      el.select('.active-ring')
        .transition().duration(250)
        .style('opacity', isHighlighted ? 1 : 0)
        .attr('stroke', isHighlighted ? '#ffffff' : getStyle(d.type).color);

      const k = zoomState.current.k;
      el.select('.label-group')
        .transition().duration(250)
        .style('opacity', () => {
            if (isHighlighted) return 1;
            if (nodeOpacity < 0.2) return 0; 
            if (k < 1.2) return d.degree >= thresholds.current.t15 ? 0.95 : 0;
            if (k < 2.0) return d.degree >= thresholds.current.t50 ? 0.95 : 0;
            return 0.95;
        });

      el.select('.label-bg')
        .transition().duration(250)
        .attr('stroke', isHighlighted ? '#f59e0b' : 'rgba(255, 255, 255, 0.16)')
        .attr('fill', isHighlighted ? 'rgba(24, 28, 42, 0.96)' : 'rgba(8, 10, 15, 0.88)');

      el.select('.label')
        .text((d: any) => isHighlighted ? d.label : (d.label && d.label.length > 22 ? d.label.slice(0, 20) + '…' : d.label))
        .transition().duration(250)
        .style('fill', isHighlighted ? '#fbbf24' : '#f1f5f9');
    });

  }, [searchQuery, matchedNodeIds, selectedNodeId, hoveredNodeId, distanceMap]);

  return (
    <svg
      id="svg-network-canvas"
      ref={svgRef}
      width="100%"
      height="100%"
      viewBox={`0 0 ${width} ${height}`}
      className="absolute inset-0 select-none z-0 overflow-hidden"
      style={{
          background: '#080a0f',
          // Optional subtle vignette at the edges, no heavy gradient
          backgroundImage: 'radial-gradient(circle at center, transparent 0%, rgba(8, 10, 15, 0.9) 100%)'
      }}
      shapeRendering="geometricPrecision"
    >
        <defs>
            <pattern id="canvas-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1" fill="rgba(255, 255, 255, 0.04)" shapeRendering="geometricPrecision" />
            </pattern>

            {/* Dynamic SVG Glow Filters for Node Absorption Axis scaling */}
            <filter id="svg-glow-subtle" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <filter id="svg-glow-medium" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
              <feComponentTransfer in="blur" result="boost">
                <feFuncA type="linear" slope="1.4" />
              </feComponentTransfer>
              <feMerge>
                <feMergeNode in="boost" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <filter id="svg-glow-intense" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur1" />
              <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur2" />
              <feComponentTransfer in="blur1" result="boost1">
                <feFuncA type="linear" slope="1.8" />
              </feComponentTransfer>
              <feMerge>
                <feMergeNode in="boost1" />
                <feMergeNode in="blur2" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <filter id="svg-glow-abyssal" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blur1" />
              <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur2" />
              <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur3" />
              <feComponentTransfer in="blur1" result="boost1">
                <feFuncA type="linear" slope="2.2" />
              </feComponentTransfer>
              <feMerge>
                <feMergeNode in="boost1" />
                <feMergeNode in="blur2" />
                <feMergeNode in="blur3" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
        </defs>
        <rect width="100%" height="100%" fill="url(#canvas-grid)" />
    </svg>
  );
};
