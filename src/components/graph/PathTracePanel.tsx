import React, { useState, useMemo } from 'react';
import { Route, ArrowRight, CheckCircle2, RotateCcw } from 'lucide-react';
import { GraphNode, GraphEdge } from '../../data/knowledgeGraphDataset';

interface PathTracePanelProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  selectedNodeId: string | null;
  onSelectNode: (id: string) => void;
  onHighlightPath: (nodeIds: string[], edgeIds: string[]) => void;
  onClearPath: () => void;
}

export const PathTracePanel: React.FC<PathTracePanelProps> = ({
  nodes,
  edges,
  selectedNodeId,
  onSelectNode,
  onHighlightPath,
  onClearPath
}) => {
  const [startNodeId, setStartNodeId] = useState<string | null>(selectedNodeId);
  const [targetNodeId, setTargetNodeId] = useState<string | null>(null);

  // Shortest path calculation (BFS)
  const pathResult = useMemo(() => {
    if (!startNodeId || !targetNodeId || startNodeId === targetNodeId) return null;

    // Adjacency map
    const adj = new Map<string, { neighborId: string; edgeId: string; relation: string }[]>();
    nodes.forEach(n => adj.set(n.id, []));

    edges.forEach(e => {
      if (adj.has(e.source)) adj.get(e.source)!.push({ neighborId: e.target, edgeId: e.id, relation: e.relation });
      if (adj.has(e.target)) adj.get(e.target)!.push({ neighborId: e.source, edgeId: e.id, relation: e.relation });
    });

    const queue: string[] = [startNodeId];
    const visited = new Set<string>([startNodeId]);
    const parentMap = new Map<string, { prevId: string; edgeId: string; relation: string }>();

    let found = false;
    while (queue.length > 0) {
      const curr = queue.shift()!;
      if (curr === targetNodeId) {
        found = true;
        break;
      }

      const neighbors = adj.get(curr) || [];
      for (const nbr of neighbors) {
        if (!visited.has(nbr.neighborId)) {
          visited.add(nbr.neighborId);
          parentMap.set(nbr.neighborId, { prevId: curr, edgeId: nbr.edgeId, relation: nbr.relation });
          queue.push(nbr.neighborId);
        }
      }
    }

    if (!found) return { found: false, pathNodes: [], pathEdges: [], steps: [] };

    // Reconstruct path
    const pathNodes: string[] = [];
    const pathEdges: string[] = [];
    const steps: { fromId: string; toId: string; edgeId: string; relation: string }[] = [];

    let curr = targetNodeId;
    pathNodes.push(curr);

    while (curr !== startNodeId) {
      const info = parentMap.get(curr)!;
      pathEdges.push(info.edgeId);
      steps.unshift({ fromId: info.prevId, toId: curr, edgeId: info.edgeId, relation: info.relation });
      curr = info.prevId;
      pathNodes.push(curr);
    }

    pathNodes.reverse();

    return {
      found: true,
      pathNodes,
      pathEdges,
      steps
    };
  }, [startNodeId, targetNodeId, nodes, edges]);

  // Apply highlight to canvas
  const handleApplyTrace = () => {
    if (pathResult && pathResult.found) {
      onHighlightPath(pathResult.pathNodes, pathResult.pathEdges);
    }
  };

  const handleSetStartFromSelection = () => {
    if (selectedNodeId) setStartNodeId(selectedNodeId);
  };

  const handleSetTargetFromSelection = () => {
    if (selectedNodeId) setTargetNodeId(selectedNodeId);
  };

  const startNode = nodes.find(n => n.id === startNodeId);
  const targetNode = nodes.find(n => n.id === targetNodeId);

  return (
    <div className="bg-neutral-950 border-b border-neutral-900 p-4 font-mono text-xs text-neutral-200 select-none">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Route className="w-4 h-4 text-emerald-400" />
          <h3 className="font-display text-xs uppercase tracking-wider text-emerald-400 font-bold">
            Evidence Path Trace Tool
          </h3>
        </div>
        <button
          onClick={onClearPath}
          className="text-[10px] text-neutral-400 hover:text-white flex items-center gap-1 cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Clear Trace</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        
        {/* Start Node Selector */}
        <div className="bg-neutral-900/60 border border-neutral-800 p-2.5 rounded-lg space-y-1.5">
          <div className="flex items-center justify-between text-[10px] text-neutral-400 uppercase">
            <span>Start Node (A)</span>
            <button onClick={handleSetStartFromSelection} className="text-emerald-400 hover:underline">
              Use Selection
            </button>
          </div>
          <select
            value={startNodeId || ''}
            onChange={(e) => setStartNodeId(e.target.value || null)}
            className="w-full bg-neutral-950 border border-neutral-800 rounded p-1.5 text-xs font-mono text-neutral-200 focus:outline-none focus:border-emerald-500/50"
          >
            <option value="">Select Start Node...</option>
            {nodes.slice(0, 150).map(n => (
              <option key={`start-${n.id}`} value={n.id}>
                {n.label} ({n.id} - {n.sourceFile})
              </option>
            ))}
          </select>
          {startNode && (
            <div className="text-[10px] text-emerald-300/80 truncate">
              {startNode.type.toUpperCase()} • {startNode.sourceFile}
            </div>
          )}
        </div>

        {/* Target Node Selector */}
        <div className="bg-neutral-900/60 border border-neutral-800 p-2.5 rounded-lg space-y-1.5">
          <div className="flex items-center justify-between text-[10px] text-neutral-400 uppercase">
            <span>Target Node (B)</span>
            <button onClick={handleSetTargetFromSelection} className="text-emerald-400 hover:underline">
              Use Selection
            </button>
          </div>
          <select
            value={targetNodeId || ''}
            onChange={(e) => setTargetNodeId(e.target.value || null)}
            className="w-full bg-neutral-950 border border-neutral-800 rounded p-1.5 text-xs font-mono text-neutral-200 focus:outline-none focus:border-emerald-500/50"
          >
            <option value="">Select Target Node...</option>
            {nodes.slice(0, 150).map(n => (
              <option key={`target-${n.id}`} value={n.id}>
                {n.label} ({n.id} - {n.sourceFile})
              </option>
            ))}
          </select>
          {targetNode && (
            <div className="text-[10px] text-emerald-300/80 truncate">
              {targetNode.type.toUpperCase()} • {targetNode.sourceFile}
            </div>
          )}
        </div>

      </div>

      {/* Trace Results */}
      {pathResult && (
        <div className="bg-emerald-950/20 border border-emerald-500/30 p-3 rounded-xl space-y-2">
          {pathResult.found ? (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-emerald-300 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Path Found: {pathResult.steps.length} Step(s) ({pathResult.pathNodes.length} Nodes)</span>
                </div>
                <button
                  onClick={handleApplyTrace}
                  className="px-3 py-1 bg-emerald-500 text-black font-bold rounded hover:bg-emerald-400 transition-all cursor-pointer text-[11px]"
                >
                  Highlight on Canvas
                </button>
              </div>

              {/* Step Sequence */}
              <div className="flex items-center flex-wrap gap-2 text-[11px] pt-2 border-t border-emerald-900/40">
                {pathResult.pathNodes.map((nid, index) => {
                  const nodeObj = nodes.find(n => n.id === nid);
                  const isEnd = index === pathResult.pathNodes.length - 1;
                  const stepEdge = pathResult.steps[index];

                  return (
                    <React.Fragment key={`path-step-${nid}-${index}`}>
                      <button
                        onClick={() => onSelectNode(nid)}
                        className="px-2 py-1 rounded bg-neutral-900 border border-emerald-500/40 text-emerald-200 hover:text-white font-bold hover:underline"
                      >
                        {nodeObj?.label || nid}
                      </button>
                      {!isEnd && (
                        <div className="flex items-center gap-1 text-[10px] text-emerald-400/80">
                          <span className="font-mono text-neutral-400">[{stepEdge?.relation}]</span>
                          <ArrowRight className="w-3 h-3" />
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="text-amber-400 text-xs text-center py-2">
              No direct path found between selected nodes under current graph parameters.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
