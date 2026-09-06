import * as d3 from 'd3';

let simulation: any;
let currentNodes: any[] = [];

self.onmessage = (event) => {
  const { type, payload } = event.data;

  if (type === 'INIT') {
    const { nodes, links, width, height, clusteringMode = 'none', gravityStrength = 50 } = payload;
    
    // Convert links to d3 expected format if not already
    currentNodes = nodes.map((d: any) => ({ ...d }));
    const d3Links = links.map((d: any) => ({ ...d }));

    if (simulation) {
      simulation.stop();
    }

    simulation = d3.forceSimulation(currentNodes as any)
      .alphaDecay(0.05)
      .alphaMin(0.005)
      .force('link', d3.forceLink(d3Links).id((d: any) => d.id).distance((l: any) => {
        if (l.relationship === 'supports') return 80;
        if (l.relationship === 'challenges' || l.relationship === 'conflict') return 250;
        return 140; 
      }))
      .force('charge', d3.forceManyBody()
        .strength((d: any) => -(d.size || 14) * 45)
        .theta(0.9)
        .distanceMax(600)
      )
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collide', d3.forceCollide().radius((d: any) => (d.size || 14) * 1.5 + 10).iterations(1));

    if (clusteringMode !== 'none') {
      const clusters: Record<string, {x: number, y: number, count: number}> = {};
      
      const getClusterKey = (d: any) => clusteringMode === 'structural' ? d.type : d.cluster;

      simulation.force('cluster', (alpha: number) => {
        currentNodes.forEach((d: any) => {
          const key = getClusterKey(d);
          if (!clusters[key]) {
            clusters[key] = { x: 0, y: 0, count: 0 };
          }
        });
        
        const clusterNames = Object.keys(clusters);
        const radius = Math.min(width, height) * 0.35;
        
        clusterNames.forEach((name, i) => {
          const angle = (i / clusterNames.length) * 2 * Math.PI;
          clusters[name].x = (width / 2) + Math.cos(angle) * radius;
          clusters[name].y = (height / 2) + Math.sin(angle) * radius;
        });

        currentNodes.forEach((d: any) => {
          const key = getClusterKey(d);
          const target = clusters[key];
          if (target) {
            d.vx -= (d.x - target.x) * alpha * 0.1;
            d.vy -= (d.y - target.y) * alpha * 0.1;
          }
        });
      });
    }

    // Calculate basic degree centrality for Gravity
    const degreeMap: Record<string, number> = {};
    d3Links.forEach((l: any) => {
      const srcId = typeof l.source === 'object' ? l.source.id : l.source;
      const tgtId = typeof l.target === 'object' ? l.target.id : l.target;
      degreeMap[srcId] = (degreeMap[srcId] || 0) + 1;
      degreeMap[tgtId] = (degreeMap[tgtId] || 0) + 1;
    });

    const maxDegree = Math.max(...Object.values(degreeMap), 1);
    const gravityFactor = (gravityStrength / 100);

    simulation.force('radial', d3.forceRadial((d: any) => {
      // High degree -> pulled to center (radius 0)
      // Low degree -> pushed to periphery (radius high)
      const degree = degreeMap[d.id] || 0;
      const influence = degree / maxDegree;
      return (1 - influence) * (Math.min(width, height) * 0.45);
    }, width / 2, height / 2).strength(gravityFactor * 0.5));

    simulation.on('tick', () => {
      self.postMessage({
        type: 'TICK',
        payload: {
          nodes: currentNodes,
          links: d3Links
        }
      });
    });

    simulation.on('end', () => {
      self.postMessage({
        type: 'END',
        payload: {
          nodes: currentNodes,
          links: d3Links
        }
      });
    });

  } else if (type === 'DRAG_START') {
    if (simulation) {
      simulation.alphaTarget(0.3).restart();
      const node = currentNodes.find(n => n.id === payload.id);
      if (node) {
        node.fx = payload.x;
        node.fy = payload.y;
      }
    }
  } else if (type === 'DRAG') {
    if (simulation) {
      const node = currentNodes.find(n => n.id === payload.id);
      if (node) {
        node.fx = payload.x;
        node.fy = payload.y;
      }
    }
  } else if (type === 'DRAG_END') {
    if (simulation) {
      simulation.alphaTarget(0);
      const node = currentNodes.find(n => n.id === payload.id);
      if (node) {
        node.fx = null;
        node.fy = null;
      }
    }
  }
};
