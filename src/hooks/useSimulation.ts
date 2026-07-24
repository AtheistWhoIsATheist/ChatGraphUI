import { useEffect, useRef, useState } from 'react';
import { OntologyNode, OntologyLink } from '../data/ontology';

export interface SimulatedNode extends OntologyNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export interface SimulatedLink extends Omit<OntologyLink, 'source' | 'target'> {
  source: SimulatedNode | string;
  target: SimulatedNode | string;
}

export interface PhysicsParams {
  chargeStrength: number;
  linkDistance: number;
  gravity: number;
  friction: number;
}

const DEFAULT_PARAMS: PhysicsParams = {
  chargeStrength: -200,
  linkDistance: 130,
  gravity: 0.04,
  friction: 0.85
};

export function useSimulation(
  nodes: OntologyNode[],
  links: OntologyLink[],
  width: number,
  height: number,
  physicsParams: PhysicsParams = DEFAULT_PARAMS
) {
  const [simulatedNodes, setSimulatedNodes] = useState<SimulatedNode[]>([]);
  const workerRef = useRef<Worker | null>(null);
  
  // Persistent coordinates cache
  const positionsCacheRef = useRef<Record<string, { x: number; y: number; vx: number; vy: number }>>({});

  // 1. Initialize and manage Web Worker life-cycle
  useEffect(() => {
    // Check if worker already exists, terminate first
    if (workerRef.current) {
      workerRef.current.terminate();
    }

    // In-line Web Worker script for seamless compilation and zero asset-resolution paths
    const workerBlobCode = `
      let nodes = [];
      let links = [];
      let width = 800;
      let height = 600;
      let params = {
        chargeStrength: -200,
        linkDistance: 130,
        gravity: 0.04,
        friction: 0.85
      };
      let isRunning = false;

      self.onmessage = function(e) {
        const { type, data } = e.data;
        if (type === 'init') {
          nodes = data.nodes.map(n => ({
            id: n.id,
            x: n.x !== undefined ? n.x : data.width / 2 + (Math.random() - 0.5) * 100,
            y: n.y !== undefined ? n.y : data.height / 2 + (Math.random() - 0.5) * 100,
            vx: n.vx || 0,
            vy: n.vy || 0,
            fx: n.fx !== undefined ? n.fx : null,
            fy: n.fy !== undefined ? n.fy : null
          }));
          links = data.links.map(l => ({
            source: typeof l.source === 'object' ? l.source.id : l.source,
            target: typeof l.target === 'object' ? l.target.id : l.target,
            intensity: l.intensity || 3
          }));
          width = data.width || width;
          height = data.height || height;
          params = { ...params, ...data.params };
          isRunning = true;
          tick();
        } else if (type === 'update_params') {
          params = { ...params, ...data.params };
          if (data.width) width = data.width;
          if (data.height) height = data.height;
        } else if (type === 'drag') {
          const { nodeId, x, y, fixed } = data;
          const node = nodes.find(n => n.id === nodeId);
          if (node) {
            if (fixed) {
              node.fx = x;
              node.fy = y;
              node.x = x;
              node.y = y;
              node.vx = 0;
              node.vy = 0;
            } else {
              node.fx = null;
              node.fy = null;
            }
          }
        } else if (type === 'stop') {
          isRunning = false;
        }
      };

      function tick() {
        if (!isRunning) return;

        const cx = width / 2;
        const cy = height / 2;

        // 1. Charge / Repulsion force (N-body repulsion)
        for (let i = 0; i < nodes.length; i++) {
          const n1 = nodes[i];
          for (let j = i + 1; j < nodes.length; j++) {
            const n2 = nodes[j];
            const dx = n2.x - n1.x;
            const dy = n2.y - n1.y;
            const distSq = dx * dx + dy * dy + 0.1;
            const dist = Math.sqrt(distSq);
            
            if (dist < 400) {
              const force = (params.chargeStrength || -200) / distSq;
              const fx = (dx / dist) * force;
              const fy = (dy / dist) * force;

              if (n1.fx === null) { n1.vx += fx; n1.vy += fy; }
              if (n2.fx === null) { n2.vx -= fx; n2.vy -= fy; }
            }
          }
        }

        // 2. Link attraction force (Spring pull)
        for (let i = 0; i < links.length; i++) {
          const link = links[i];
          const sourceNode = nodes.find(n => n.id === link.source);
          const targetNode = nodes.find(n => n.id === link.target);
          
          if (sourceNode && targetNode) {
            const dx = targetNode.x - sourceNode.x;
            const dy = targetNode.y - sourceNode.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 0.1;
            
            const targetDist = (params.linkDistance || 130) / (link.intensity * 0.4 + 0.6);
            const k = 0.035; // stiffness
            const force = (dist - targetDist) * k;
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;

            if (sourceNode.fx === null) { sourceNode.vx += fx; sourceNode.vy += fy; }
            if (targetNode.fx === null) { targetNode.vx -= fx; targetNode.vy -= fy; }
          }
        }

        // 3. Gravity / Centering pull and velocity integration
        for (let i = 0; i < nodes.length; i++) {
          const node = nodes[i];
          
          if (node.fx !== null) {
            node.x = node.fx;
            node.y = node.fy;
            node.vx = 0;
            node.vy = 0;
          } else {
            // Pull toward center
            const dx = cx - node.x;
            const dy = cy - node.y;
            node.vx += dx * (params.gravity || 0.04);
            node.vy += dy * (params.gravity || 0.04);

            // Apply friction/decay
            node.vx *= (params.friction || 0.85);
            node.vy *= (params.friction || 0.85);
            
            node.x += node.vx;
            node.y += node.vy;
          }

          // Boundary bounce with damping
          const padding = 35;
          if (node.x < padding) {
            node.x = padding;
            node.vx = Math.abs(node.vx) * 0.5;
          } else if (node.x > width - padding) {
            node.x = width - padding;
            node.vx = -Math.abs(node.vx) * 0.5;
          }

          if (node.y < padding) {
            node.y = padding;
            node.vy = Math.abs(node.vy) * 0.5;
          } else if (node.y > height - padding) {
            node.y = height - padding;
            node.vy = -Math.abs(node.vy) * 0.5;
          }
        }

        self.postMessage({
          type: 'tick',
          data: {
            nodes: nodes.map(n => ({ id: n.id, x: n.x, y: n.y, vx: n.vx, vy: n.vy }))
          }
        });

        setTimeout(tick, 1000 / 60);
      }
    `;

    const blob = new Blob([workerBlobCode], { type: 'application/javascript' });
    const workerUrl = URL.createObjectURL(blob);
    const worker = new Worker(workerUrl);
    workerRef.current = worker;

    // Handle updates from worker
    worker.onmessage = (e) => {
      const { type, data } = e.data;
      if (type === 'tick') {
        const updatedNodes = data.nodes;
        
        // Update local position cache reference
        updatedNodes.forEach((un: any) => {
          positionsCacheRef.current[un.id] = { x: un.x, y: un.y, vx: un.vx, vy: un.vy };
        });

        // Merge original node info with calculated coordinate parameters
        const mergedNodes: SimulatedNode[] = nodes.map(n => {
          const coords = positionsCacheRef.current[n.id] || {
            x: width / 2 + (Math.random() - 0.5) * 100,
            y: height / 2 + (Math.random() - 0.5) * 100,
            vx: 0,
            vy: 0
          };
          return {
            ...n,
            ...coords
          };
        });

        setSimulatedNodes(mergedNodes);
      }
    };

    // Prepare nodes with coordinates retrieved from our cache if available
    const initialNodesWithCoordinates = nodes.map(n => {
      const cached = positionsCacheRef.current[n.id];
      if (cached) {
        return {
          id: n.id,
          x: cached.x,
          y: cached.y,
          vx: cached.vx,
          vy: cached.vy
        };
      } else {
        // Brand new node coordinate layout near center
        return {
          id: n.id,
          x: width / 2 + (Math.random() - 0.5) * 120,
          y: height / 2 + (Math.random() - 0.5) * 120,
          vx: 0,
          vy: 0
        };
      }
    });

    // Start simulation
    worker.postMessage({
      type: 'init',
      data: {
        nodes: initialNodesWithCoordinates,
        links: links,
        width,
        height,
        params: physicsParams
      }
    });

    return () => {
      worker.terminate();
      URL.revokeObjectURL(workerUrl);
    };
  }, [nodes, links]); // Only recreate worker if node/link structural topology changes!

  // 2. Decouple sizing & dynamic parameter updates from worker recreation
  useEffect(() => {
    if (workerRef.current) {
      workerRef.current.postMessage({
        type: 'update_params',
        data: {
          width,
          height,
          params: physicsParams
        }
      });
    }
  }, [width, height, physicsParams]);

  // Drag handler function that streams coordinate changes safely to the worker thread
  const dragNode = (nodeId: string, x: number, y: number, fixed: boolean) => {
    if (workerRef.current) {
      workerRef.current.postMessage({
        type: 'drag',
        data: {
          nodeId,
          x,
          y,
          fixed
        }
      });
    }
  };

  // Convert raw initial link inputs to fully reference-stable links mapping
  const simulatedLinks: SimulatedLink[] = links.map(l => {
    const sNode = simulatedNodes.find(n => n.id === l.source) || l.source;
    const tNode = simulatedNodes.find(n => n.id === l.target) || l.target;
    return {
      ...l,
      source: sNode,
      target: tNode
    };
  });

  return {
    simulatedNodes,
    simulatedLinks,
    dragNode
  };
}
