import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

interface D3GraphProps {
  nodes: any[];
  links: any[];
  activeNodeId: string | null;
  onNodeClick: (id: string) => void;
  clusteringMode?: 'none' | 'doctrinal' | 'structural';
  gravityStrength?: number;
  searchTerm?: string;
}

export const D3Graph: React.FC<D3GraphProps> = ({ nodes, links, activeNodeId, onNodeClick, clusteringMode = 'none', gravityStrength = 50, searchTerm = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const workerRef = useRef<Worker | null>(null);
  
  const [hoveredNode, setHoveredNode] = useState<any | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const elementsRef = useRef<{ node: any; link: any; label: any } | null>(null);
  const latestNodesMap = useRef<Map<string, any>>(new Map());

  useEffect(() => {
    if (!containerRef.current || !svgRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const svg = d3.select(svgRef.current)
      .attr('viewBox', [0, 0, width, height])
      .style('background', 'transparent');
    
    svg.selectAll('*').remove();

    const g = svg.append('g');

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });
    
    svg.call(zoom);

    const defs = svg.append('defs');
    const filter = defs.append('filter').attr('id', 'glow');
    filter.append('feGaussianBlur').attr('stdDeviation', '3').attr('result', 'coloredBlur');
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    const link = g.append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', (d: any) => {
        // Enhance visibility by increasing alpha for strong connections
        if (d.relationship === 'supports') return 'rgba(87, 215, 186, 0.8)';
        if (d.relationship === 'challenges') return 'rgba(240, 120, 120, 0.9)';
        if (d.relationship === 'contains') return 'rgba(167, 139, 250, 0.5)';
        return 'rgba(255, 255, 255, 0.2)';
      })
      .attr('stroke-width', (d: any) => {
        if (d.relationship === 'supports') return 3;
        if (d.relationship === 'challenges') return 3;
        if (d.relationship === 'contains') return 1.5;
        return 1;
      })
      .attr('stroke-dasharray', (d: any) => d.relationship === 'challenges' ? '6,6' : 'none')
      .style('filter', 'url(#glow)');

    const node = g.append('g')
      .selectAll('circle')
      .data(nodes)
      .join('circle')
      .attr('r', (d: any) => d.size || 14)
      .attr('fill', (d: any) => d.type === 'concept' ? 'rgba(99, 216, 232, 0.1)' : 'rgba(167, 139, 250, 0.1)')
      .attr('stroke', (d: any) => d.id === activeNodeId ? '#ffffff' : (d.type === 'concept' ? '#63d8e8' : '#a78bfa'))
      .attr('stroke-width', (d: any) => d.id === activeNodeId ? 3 : 1.5)
      .attr('style', 'cursor: pointer;')
      .style('filter', 'url(#glow)')
      .on('mouseenter', (event, d: any) => {
        const latestD = latestNodesMap.current.get(d.id) || d;
        setHoveredNode(latestD);
        d3.select(event.currentTarget).transition().duration(250).attr('r', (d.size || 14) * 1.5);
      })
      .on('mousemove', (event) => {
        const [x, y] = d3.pointer(event, containerRef.current);
        setMousePos({ x, y });
      })
      .on('mouseleave', (event, d: any) => {
        setHoveredNode(null);
        d3.select(event.currentTarget).transition().duration(250).attr('r', (d.size || 14));
      })
      .on('click', (_event, d: any) => {
        onNodeClick(d.id);
      })
      .call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended) as any
      );

    const label = g.append('g')
      .selectAll('text')
      .data(nodes)
      .join('text')
      .attr('fill', 'rgba(255,255,255,0.7)')
      .attr('font-size', '10px')
      .attr('font-family', 'monospace')
      .attr('pointer-events', 'none')
      .text((d: any) => d.label);

    elementsRef.current = { node, link, label };

    workerRef.current = new Worker(new URL('../../workers/d3.worker.ts', import.meta.url), { type: 'module' });
    
    workerRef.current.onmessage = (event) => {
      const { type, payload } = event.data;
      if (type === 'END') {
        const { nodes: updatedNodes } = payload;
        const layout: Record<string, any> = {};
        updatedNodes.forEach((n: any) => {
          layout[n.id] = { x: n.x, y: n.y };
        });
        localStorage.setItem('nihil_graph_layout', JSON.stringify(layout));
      }
      if (type === 'TICK' || type === 'END') {
        const { nodes: updatedNodes, links: updatedLinks } = payload;
        
        updatedNodes.forEach((n: any) => {
          latestNodesMap.current.set(n.id, n);
        });

        if (elementsRef.current) {
          elementsRef.current.node
            .data(updatedNodes, (d: any) => d.id)
            .attr('cx', (d: any) => d.x)
            .attr('cy', (d: any) => d.y);
            
          elementsRef.current.link
            .data(updatedLinks, (d: any) => d.source.id + '-' + d.target.id)
            .attr('x1', (d: any) => d.source.x)
            .attr('y1', (d: any) => d.source.y)
            .attr('x2', (d: any) => d.target.x)
            .attr('y2', (d: any) => d.target.y);
            
          elementsRef.current.label
            .data(updatedNodes, (d: any) => d.id)
            .attr('x', (d: any) => d.x + (d.size || 14) + 6)
            .attr('y', (d: any) => d.y + 3);
        }
      }
    };

// Local Storage layout loading
    let savedPositions: any = null;
    try {
      const saved = localStorage.getItem('nihil_graph_layout');
      if (saved) savedPositions = JSON.parse(saved);
    } catch (e) {}

    const payloadNodes = nodes.map(n => {
      const pos = savedPositions?.[n.id];
      if (pos) {
        return { ...n, x: pos.x, y: pos.y, fx: pos.x, fy: pos.y };
      }
      return n;
    });

    workerRef.current.postMessage({
      type: 'INIT',
      payload: { nodes: payloadNodes, links, width, height, clusteringMode, gravityStrength }
    });

    const resizeObserver = new ResizeObserver(entries => {
      if (!entries.length) return;
      const { width, height } = entries[0].contentRect;
      svg.attr('viewBox', [0, 0, width, height]);
      
      if (workerRef.current) {
         workerRef.current.postMessage({
           type: 'INIT',
           payload: { nodes, links, width, height, clusteringMode, gravityStrength }
         });
      }
    });
    
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };

    function dragstarted(event: any, d: any) {
      if (workerRef.current) {
        workerRef.current.postMessage({ type: 'DRAG_START', payload: { id: d.id, x: event.x, y: event.y } });
      }
    }
    function dragged(event: any, d: any) {
      if (workerRef.current) {
        workerRef.current.postMessage({ type: 'DRAG', payload: { id: d.id, x: event.x, y: event.y } });
      }
    }
    function dragended(_event: any, d: any) {
      if (workerRef.current) {
        workerRef.current.postMessage({ type: 'DRAG_END', payload: { id: d.id } });
      }
    }

  }, [nodes, links, clusteringMode, gravityStrength]);
  
useEffect(() => {
    if (elementsRef.current) {
      const searchLower = (searchTerm || '').toLowerCase();
      
      elementsRef.current.node
        .attr('stroke', (d: any) => {
          if (d.id === activeNodeId) return '#ffffff';
          if (searchLower && d.label.toLowerCase().includes(searchLower)) return '#facc15'; // Scented Search Heatmap
          return d.type === 'concept' ? '#63d8e8' : '#a78bfa';
        })
        .attr('stroke-width', (d: any) => {
          if (d.id === activeNodeId) return 3;
          if (searchLower && d.label.toLowerCase().includes(searchLower)) return 3;
          return 1.5;
        })
        .attr('fill', (d: any) => {
           if (searchLower && d.label.toLowerCase().includes(searchLower)) return 'rgba(250, 204, 21, 0.4)';
           return d.type === 'concept' ? 'rgba(99, 216, 232, 0.1)' : 'rgba(167, 139, 250, 0.1)';
        });
    }
  }, [activeNodeId, searchTerm]);

  return (
    <div ref={containerRef} className="w-full h-full relative z-10 pointer-events-auto overflow-hidden">
      <svg ref={svgRef} className="w-full h-full" />
      {hoveredNode && (
        <div 
          className="absolute pointer-events-none p-4 bg-void-surface/95 border border-violet-ethereal/40 rounded-lg shadow-2xl backdrop-blur-md z-50 transition-opacity duration-200"
          style={{ 
            left: mousePos.x + 20, 
            top: mousePos.y - 20,
            maxWidth: '300px'
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-cyan-cosmic font-mono uppercase tracking-widest">{hoveredNode.type}</span>
            <span className="text-[9px] text-white/40 font-mono">MASS: {hoveredNode.size}</span>
          </div>
          <div className="font-display text-white text-base mb-2 leading-tight">{hoveredNode.label}</div>
          <div className="text-xs text-white/60 font-mono italic mb-3 leading-relaxed">{hoveredNode.desc}</div>
          
          <div className="text-[9px] text-white/30 uppercase tracking-widest mb-1 border-t border-white/10 pt-2">Tags / Clusters</div>
          <div className="flex flex-wrap gap-1">
            <span className="px-1.5 py-0.5 bg-white/10 border border-white/20 rounded text-[9px] text-white/80 font-mono uppercase">
              {hoveredNode.cluster || 'unclustered'}
            </span>
            {hoveredNode.tags?.map((t: string) => (
              <span key={t} className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-[9px] text-white/50 font-mono">
                {t}
              </span>
            ))}
          </div>
          
          <div className="mt-3 text-[9px] text-white/40 font-mono uppercase truncate">
            SRC: {hoveredNode.source || 'Unassigned'}
          </div>
        </div>
      )}
    </div>
  );
};
