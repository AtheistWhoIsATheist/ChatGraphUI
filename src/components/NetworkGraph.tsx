import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { OntologyNode, OntologyLink } from '../data/ontology';

interface NetworkGraphProps {
  nodes: OntologyNode[];
  links: OntologyLink[];
  selectedNodeId: string | null;
  hoveredNodeId: string | null;
  onSelectNode: (nodeId: string | null) => void;
  onHoverNode: (nodeId: string | null) => void;
  width: number;
  height: number;
  distanceMap: Map<string, number>;
  layoutMode: 'force' | 'tree';
  searchQuery?: string;
  matchedNodeIds?: Set<string>;
}

interface D3Node extends OntologyNode, d3.SimulationNodeDatum {
  radius: number;
}
interface D3Link extends d3.SimulationLinkDatum<D3Node> {
  intensity: number;
}

const TYPE_STYLES: Record<string, { color: string }> = {
  'Ontological Core': { color: '#ffffff' },
  'Conceptual Core': { color: '#a1a1aa' },
  'Epistemological': { color: '#38bdf8' },
  'Theological': { color: '#fbbf24' },
  'Phenomenological': { color: '#f43f5e' },
  'Existential': { color: '#8b5cf6' },
  'Praxis': { color: '#10b981' }
};

export const NetworkGraph: React.FC<NetworkGraphProps> = ({
  nodes,
  links,
  selectedNodeId,
  hoveredNodeId,
  onSelectNode,
  onHoverNode,
  width,
  height,
  distanceMap,
  layoutMode,
  searchQuery = '',
  matchedNodeIds = new Set()
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const simulationRef = useRef<d3.Simulation<D3Node, D3Link> | null>(null);
  const nodesRef = useRef<D3Node[]>([]);
  const linksRef = useRef<D3Link[]>([]);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  // Initialize data once
  useEffect(() => {
    nodesRef.current = nodes.map(n => ({ ...n, radius: n.id === 'void' ? 24 : 18 }));
    linksRef.current = links.map(l => ({ 
      source: typeof l.source === 'object' ? (l.source as any).id : l.source,
      target: typeof l.target === 'object' ? (l.target as any).id : l.target,
      intensity: l.intensity 
    })) as unknown as D3Link[];

    const svg = d3.select(svgRef.current as Exclude<typeof svgRef.current, null>);
    
    // Setup Zoom
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        svg.select('.zoom-group').attr('transform', event.transform);
      });
    svg.call(zoom);
    zoomRef.current = zoom;

    svg.on('click', () => onSelectNode(null));

    const g = svg.select('.zoom-group');
    if (g.empty()) {
      svg.append('g').attr('class', 'zoom-group');
    }

    const zoomGroup = svg.select('.zoom-group');

    // Create container groups
    zoomGroup.append('g').attr('class', 'links-layer');
    zoomGroup.append('g').attr('class', 'nodes-layer');

    // Setup Force Simulation
    const simulation = d3.forceSimulation<D3Node>(nodesRef.current)
      .force('link', d3.forceLink<D3Node, D3Link>(linksRef.current).id(d => d.id).distance(d => 130 / (d.intensity * 0.4 + 0.6)))
      .force('charge', d3.forceManyBody().strength(-200))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collide', d3.forceCollide<D3Node>().radius(d => d.radius + 10));
    
    simulationRef.current = simulation;

    // Drag behavior
    const drag = d3.drag<SVGGElement, D3Node>()
      .on('start', (event, d) => {
        if (!event.active && layoutMode === 'force') simulation.alphaTarget(0.3).restart();
        if (layoutMode === 'force') {
          d.fx = d.x;
          d.fy = d.y;
        }
      })
      .on('drag', (event, d) => {
        if (layoutMode === 'force') {
          d.fx = event.x;
          d.fy = event.y;
        }
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
      .append('path')
      .attr('class', 'link')
      .attr('fill', 'none');

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
      });

    // Node visuals
    nodeElements.append('circle')
      .attr('class', 'aura')
      .attr('fill', 'none');

    nodeElements.append('circle')
      .attr('class', 'base')
      .attr('r', d => d.radius)
      .attr('fill', '#050505');

    nodeElements.append('circle')
      .attr('class', 'accent')
      .attr('r', 6)
      .attr('opacity', 0.8);

    nodeElements.append('text')
      .attr('class', 'label')
      .attr('y', d => d.radius + 15)
      .attr('text-anchor', 'middle')
      .text(d => d.label)
      .style('font-family', 'sans-serif')
      .style('pointer-events', 'none');

    nodeElements.append('text')
      .attr('class', 'resonance')
      .attr('y', d => -d.radius - 7)
      .attr('text-anchor', 'middle')
      .style('font-family', 'monospace')
      .style('font-size', '8px')
      .style('fill', '#737373')
      .style('pointer-events', 'none');

    simulation.on('tick', () => {
      if (layoutMode === 'tree') return; // let transitions handle positions
      linkElements.attr('d', (d: any) => `M${d.source.x},${d.source.y} L${d.target.x},${d.target.y}`);
      nodeElements.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    return () => {
      simulation.stop();
      svg.selectAll('*').remove();
    };
  }, []); // Run once

  // Update layout mode
  useEffect(() => {
    if (!simulationRef.current || !svgRef.current) return;
    const simulation = simulationRef.current;
    const svg = d3.select(svgRef.current);
    const linkElements = svg.selectAll('.link');
    const nodeElements = svg.selectAll('.node');

    if (layoutMode === 'tree') {
      simulation.stop();
      
      // Build tree
      const rootId = nodesRef.current.find(n => n.id === 'void') ? 'void' : nodesRef.current[0].id;
      const adj = new Map<string, string[]>();
      linksRef.current.forEach((l: any) => {
        const s = l.source.id;
        const t = l.target.id;
        if (!adj.has(s)) adj.set(s, []);
        adj.get(s)!.push(t);
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

      // Attach disjoint nodes
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

      // Transitions
      nodeElements.transition()
        .duration(750)
        .ease(d3.easeCubicInOut)
        .attr('transform', (d: any) => `translate(${d.fx},${d.fy})`);
      
      linkElements.transition()
        .duration(750)
        .ease(d3.easeCubicInOut)
        .attr('d', (d: any) => {
          const s = d.source;
          const t = d.target;
          // Cubic path for tree view
          return `M${s.fx},${s.fy} C${s.fx},${(s.fy+t.fy)/2} ${t.fx},${(s.fy+t.fy)/2} ${t.fx},${t.fy}`;
        });

    } else {
      nodesRef.current.forEach(n => { n.fx = null; n.fy = null; });
      simulation.alpha(0.3).restart();
      
      linkElements.transition()
        .duration(750)
        .ease(d3.easeCubicInOut)
        .attrTween('d', function(d: any) {
          return function() {
             return `M${d.source.x},${d.source.y} L${d.target.x},${d.target.y}`;
          };
        });
    }
  }, [layoutMode, width, height]);

  // Viewport Auto-Focus on Search
  useEffect(() => {
    if (!svgRef.current || !zoomRef.current || searchQuery.trim() === '') return;
    if (matchedNodeIds.size === 0) return;

    // calculate centroid of matched nodes
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

  // Update Visuals (Highlighting, Hover, Select)
  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    const linkElements = svg.selectAll('.link');
    const nodeElements = svg.selectAll('.node');

    const isSearchActive = searchQuery.trim() !== '';

    linkElements.each(function(d: any) {
      const el = d3.select(this);
      let strokeOpacity = 0.55;
      let strokeWidth = d.intensity * 0.7;
      let linkColor = '#262626';

      if (isSearchActive) {
        const sMatch = matchedNodeIds.has(d.source.id);
        const tMatch = matchedNodeIds.has(d.target.id);
        if (sMatch && tMatch) {
          strokeOpacity = 0.85;
          linkColor = '#ffffff';
          strokeWidth = 2.0;
        } else {
          strokeOpacity = 0.05;
        }
      } else if (selectedNodeId) {
        const sDist = distanceMap.get(d.source.id);
        const tDist = distanceMap.get(d.target.id);
        const sIn = sDist !== undefined && sDist <= 2;
        const tIn = tDist !== undefined && tDist <= 2;
        
        if (sIn && tIn) {
          if ((sDist === 0 && tDist === 1) || (sDist === 1 && tDist === 0)) {
            strokeOpacity = 0.85;
            strokeWidth = 2.5;
            linkColor = '#ffffff';
          } else {
            strokeOpacity = 0.45;
            strokeWidth = 1.5;
            linkColor = '#a1a1aa';
          }
        } else {
          strokeOpacity = 0.08;
        }
      } else if (hoveredNodeId) {
        if (d.source.id === hoveredNodeId || d.target.id === hoveredNodeId) {
          strokeOpacity = 1;
          strokeWidth = d.intensity + 0.8;
          linkColor = '#ffffff';
        } else {
          strokeOpacity = 0.08;
        }
      }

      el.transition().duration(300)
        .attr('stroke', linkColor)
        .attr('stroke-width', strokeWidth)
        .attr('opacity', strokeOpacity)
        .attr('stroke-dasharray', d.intensity > 4 ? 'none' : '4, 4');
    });

    nodeElements.each(function(d: any) {
      const el = d3.select(this);
      const styles = TYPE_STYLES[d.type] || TYPE_STYLES['Conceptual Core'];
      
      let nodeOpacity = 1;
      let scale = 1;
      let customColor = styles.color;
      let customGlow = false;
      let baseStroke = '#262626';
      let baseStrokeWidth = 1.5;
      let showResonance = false;

      if (isSearchActive) {
        if (matchedNodeIds.has(d.id)) {
          nodeOpacity = 1.0;
          scale = 1.15;
          customGlow = true;
          baseStroke = '#ffffff';
          baseStrokeWidth = 2.5;
        } else {
          nodeOpacity = 0.12;
          customColor = '#525252';
        }
      } else if (selectedNodeId) {
        const dist = distanceMap.get(d.id);
        if (dist === 0) {
          nodeOpacity = 1.0;
          scale = 1.15;
          customGlow = true;
          baseStroke = '#ffffff';
          baseStrokeWidth = 2.5;
          showResonance = true;
        } else if (dist === 1) {
          nodeOpacity = 0.85;
          scale = 1.05;
          baseStroke = customColor;
          baseStrokeWidth = 2.0;
        } else if (dist === 2) {
          nodeOpacity = 0.60;
          customColor = '#737373';
          baseStroke = '#525252';
        } else {
          nodeOpacity = 0.15;
          customColor = '#404040';
        }
      } else if (hoveredNodeId) {
        if (d.id === hoveredNodeId) {
          nodeOpacity = 1.0;
          scale = 1.1;
          baseStroke = '#e5e5e5';
          baseStrokeWidth = 2.0;
        } else {
          nodeOpacity = 0.22;
        }
      }

      const r = d.radius * scale;

      el.transition().duration(300).attr('opacity', nodeOpacity);

      const aura = el.select('.aura');
      if (customGlow) {
        aura.transition().duration(300)
          .attr('r', r + 12)
          .attr('stroke', '#ffffff')
          .attr('stroke-width', 2)
          .style('opacity', 0.7)
          .style('filter', 'drop-shadow(0 0 12px rgba(255,255,255,0.6))');
      } else if (d.id === hoveredNodeId || (selectedNodeId && distanceMap.get(d.id) !== undefined && distanceMap.get(d.id)! <= 2)) {
        aura.transition().duration(300)
          .attr('r', r + 7)
          .attr('stroke', customColor)
          .attr('stroke-width', 1.2)
          .style('opacity', 0.4)
          .style('filter', null);
      } else {
        aura.transition().duration(300).style('opacity', 0);
      }

      el.select('.base').transition().duration(300)
        .attr('r', r)
        .attr('stroke', baseStroke)
        .attr('stroke-width', baseStrokeWidth);

      el.select('.accent').transition().duration(300)
        .attr('r', 6 * scale)
        .attr('fill', customColor);

      el.select('.label').transition().duration(300)
        .attr('y', r + 15)
        .style('font-size', (d.id === selectedNodeId || (isSearchActive && matchedNodeIds.has(d.id))) ? '11px' : '10px')
        .style('font-weight', (d.id === selectedNodeId || (isSearchActive && matchedNodeIds.has(d.id))) ? '600' : '500')
        .style('fill', (d.id === selectedNodeId || (isSearchActive && matchedNodeIds.has(d.id))) ? '#ffffff' : (d.id === hoveredNodeId ? '#e5e5e5' : '#a3a3a3'));

      const res = el.select('.resonance');
      if (showResonance) {
        res.text(`${d.resonance}% Ω`).transition().duration(300).attr('y', -r - 7).style('opacity', 1);
      } else {
        res.transition().duration(300).style('opacity', 0);
      }
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
    />
  );
};
