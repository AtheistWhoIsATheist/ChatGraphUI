import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { motion } from 'motion/react';
import { oeTermFrequencies, oeTriggerFrequencies, oeGraphSample } from '../data/oeStats';
import { Database, Network, TrendingUp, Hash, FastForward } from 'lucide-react';
import { cn } from '../lib/utils';

// Flow data model
const PATHWAYS_NODES = [
  // Occurrences (O-claims)
  { id: "o1", label: "Suffering / Death", type: "O", group: 0 },
  { id: "o2", label: "Nothingness / Void", type: "O", group: 0 },
  { id: "o3", label: "Despair / Anxiety", type: "O", group: 0 },
  
  // Thinkers
  { id: "t1", label: "Meister Eckhart", type: "T", group: 1 },
  { id: "t2", label: "Simone Weil", type: "T", group: 1 },
  { id: "t3", label: "Kierkegaard", type: "T", group: 1 },
  { id: "t4", label: "Arthur Schopenhauer", type: "T", group: 1 },
  { id: "t5", label: "Emil Cioran", type: "T", group: 1 },

  // Elevations (E-claims)
  { id: "e1", label: "Divine / Perfect Union", type: "E", group: 2 },
  { id: "e2", label: "Ultimate Truth / Salvation", type: "E", group: 2 },
  { id: "e3", label: "Transcendental Emptiness", type: "E", group: 2 },
];

const PATHWAYS_LINKS = [
  // O -> T
  { source: "o1", target: "t2", value: 35 }, // Suffering -> Weil
  { source: "o1", target: "t4", value: 25 }, // Suffering -> Schopenhauer
  { source: "o2", target: "t1", value: 40 }, // Nothingness -> Eckhart
  { source: "o2", target: "t5", value: 30 }, // Nothingness -> Cioran
  { source: "o3", target: "t3", value: 45 }, // Despair -> Kierkegaard
  { source: "o3", target: "t5", value: 20 }, // Despair -> Cioran

  // T -> E
  { source: "t1", target: "e1", value: 38 }, // Eckhart -> Divine Union
  { source: "t2", target: "e1", value: 25 }, // Weil -> Divine Union
  { source: "t2", target: "e2", value: 10 }, // Weil -> Truth/Salvation
  { source: "t3", target: "e2", value: 40 }, // Kierkegaard -> Truth/Salvation
  { source: "t4", target: "e3", value: 22 }, // Schopenhauer -> Transcendental Emptiness
  { source: "t5", target: "e3", value: 45 }, // Cioran -> Transcendental Emptiness
];

export function OEDashboard() {
  const [activeTab, setActiveTab] = useState<'terms' | 'triggers' | 'network' | 'pathways'>('terms');
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  // Dynamic Graph Dimensions
  const viewWidth = 800;
  const viewHeight = 400;

  const graphCoords = useMemo(() => {
    const coords: Record<string, { x: number, y: number, height: number }> = {};
    const cols: Array<typeof PATHWAYS_NODES[0]>[] = [[], [], []];
    
    // Distribute nodes to columns
    PATHWAYS_NODES.forEach(n => cols[n.group].push(n));

    // Calculate generic sizes
    cols.forEach((colNodes, colIndex) => {
      const x = colIndex === 0 ? 50 : colIndex === 1 ? viewWidth / 2 : viewWidth - 50;
      const totalHeightAvailable = viewHeight - 40; // Use margins
      
      let currentY = 20;
      const verticalSpacing = colNodes.length > 1 ? (totalHeightAvailable / colNodes.length) : 0;
      
      colNodes.forEach((node) => {
        // Base uniform rect heights by type just for visualization representation
        const h = node.type === "T" ? 30 : 40;

        // Spread them dynamically
        const yOffset = colNodes.length === 1 ? viewHeight / 2 - h / 2 : currentY + (verticalSpacing / 2) - h / 2;
        
        coords[node.id] = { x, y: yOffset, height: h };
        currentY += verticalSpacing;
      });
    });

    return coords;
  }, [viewWidth, viewHeight]);

  return (
    <div className="w-full h-full flex flex-col bg-[#0a0a0a] text-zinc-100 p-8 overflow-hidden font-sans">
      <div className="flex items-center gap-3 mb-2 flex-shrink-0">
        <Database className="w-6 h-6 text-fuchsia-500" />
        <h1 className="text-2xl font-light tracking-tight">O-E System Analytics</h1>
      </div>
      <p className="text-sm text-zinc-500 mb-8 max-w-3xl leading-relaxed flex-shrink-0">
        Visualizing semantic drift: analyzing the frequency of terms and triggers involved in structural elevation mapping across the corpus.
      </p>

      <div className="flex gap-4 mb-6 border-b border-white/10 pb-4">
        <button
          onClick={() => setActiveTab('terms')}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
            activeTab === "terms"
              ? "bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/30"
              : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-zinc-200"
          )}
        >
          <Hash className="w-4 h-4" /> Term Frequency
        </button>
        <button
          onClick={() => setActiveTab('triggers')}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
            activeTab === "triggers"
              ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
              : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-zinc-200"
          )}
        >
          <TrendingUp className="w-4 h-4" /> Trigger Modality
        </button>
        <button
          onClick={() => setActiveTab('network')}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
            activeTab === "network"
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-zinc-200"
          )}
        >
          <Network className="w-4 h-4" /> Topological Signature
        </button>
        <button
          onClick={() => setActiveTab('pathways')}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 flex-shrink-0",
            activeTab === "pathways"
              ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
              : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-zinc-200"
          )}
        >
          <FastForward className="w-4 h-4" /> O-to-E Pathways
        </button>
      </div>

      <div className="flex-1 overflow-hidden relative">
        {activeTab === 'terms' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full h-full flex flex-col">
            <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-widest mb-6">Top Analytical Terms Ingested</h3>
            <div className="flex-1 min-h-0 relative">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={oeTermFrequencies.slice(0, 20)} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="term" type="category" axisLine={false} tickLine={false} tick={{ fill: '#a1a1aa', fontSize: 12 }} />
                  <Tooltip cursor={{ fill: '#ffffff0a' }} contentStyle={{ backgroundColor: '#000', border: '1px solid #3f3f46', borderRadius: '8px' }} />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {oeTermFrequencies.slice(0, 20).map((entry, index) => (
                      <Cell key={`cell-\${index}`} fill={index < 3 ? '#d946ef' : '#a21caf'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}

        {activeTab === 'triggers' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full h-full flex flex-col">
            <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-widest mb-6">Frequent Elevation Triggers</h3>
            <div className="flex-1 min-h-0 relative">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={oeTriggerFrequencies.slice(0, 20)} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="trigger" type="category" axisLine={false} tickLine={false} tick={{ fill: '#a1a1aa', fontSize: 12 }} />
                  <Tooltip cursor={{ fill: '#ffffff0a' }} contentStyle={{ backgroundColor: '#000', border: '1px solid #3f3f46', borderRadius: '8px' }} />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {oeTriggerFrequencies.slice(0, 20).map((entry, index) => (
                      <Cell key={`cell-\${index}`} fill={index < 3 ? '#6366f1' : '#4338ca'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}

        {activeTab === 'network' && (
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full h-full overflow-y-auto custom-scrollbar pr-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {oeGraphSample.map((edge, idx) => (
                  <div key={idx} className="bg-zinc-900/40 border border-white/5 p-4 rounded-xl flex flex-col gap-2 relative group hover:bg-white/5 transition-colors">
                    <div className="text-[10px] text-zinc-600 uppercase tracking-widest">Connection Type</div>
                    <div className="text-sm font-bold text-emerald-400 break-all">{edge.type}</div>
                    
                    <div className="flex items-start justify-between mt-2 pt-2 border-t border-white/5">
                      <div className="flex flex-col w-[45%]">
                        <span className="text-[9px] text-zinc-500 uppercase tracking-wider">Source</span>
                        <span className="text-xs text-zinc-300 break-words mt-1">{edge.source.split(':').pop() || edge.source}</span>
                      </div>
                      
                      <div className="text-zinc-600">→</div>
                      
                      <div className="flex flex-col w-[45%] text-right">
                        <span className="text-[9px] text-zinc-500 uppercase tracking-wider">Target</span>
                        <span className="text-xs text-fuchsia-300 break-words mt-1">{edge.target.split(':').pop() || edge.target}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
           </motion.div>
        )}

        {activeTab === 'pathways' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full h-full flex flex-col">
            <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-widest mb-2">Occurrence (O) to Elevation (E) Pathways</h3>
            <p className="text-xs text-zinc-500 mb-6">Tracing semantic flow from base phenomenon to its culmination through specific thinkers.</p>
            <div className="flex-1 min-h-0 relative border border-white/5 bg-zinc-950/50 rounded-xl overflow-hidden p-6 flex flex-col">
              <svg width="100%" height="100%" viewBox={`0 0 ${viewWidth} ${viewHeight}`} preserveAspectRatio="xMidYMid meet">
                
                {/* 1. Links (Bez Curves) */}
                <g className="links">
                  {PATHWAYS_LINKS.map((link, idx) => {
                    const src = graphCoords[link.source];
                    const tgt = graphCoords[link.target];
                    if (!src || !tgt) return null;

                    const widthStroke = Math.max(1, (link.value / 45) * 8);

                    const x1 = src.x;
                    const y1 = src.y + (src.height / 2);
                    const x2 = tgt.x;
                    const y2 = tgt.y + (tgt.height / 2);

                    const midX = (x1 + x2) / 2;

                    const pathd = `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`;

                    const isHovered = hoveredNodeId === link.source || hoveredNodeId === link.target;
                    const isFaded = hoveredNodeId && !isHovered;

                    return (
                      <path
                        key={`link-${idx}`}
                        d={pathd}
                        fill="none"
                        stroke={isHovered ? '#ea580c' : '#52525b'}
                        strokeWidth={widthStroke}
                        strokeOpacity={isHovered ? 0.8 : isFaded ? 0.1 : 0.4}
                        className="transition-all duration-300 ease-in-out"
                        style={{ pointerEvents: 'none' }}
                      />
                    );
                  })}
                </g>

                {/* 2. Nodes */}
                <g className="nodes">
                  {PATHWAYS_NODES.map((node, i) => {
                    const c = graphCoords[node.id];
                    if (!c) return null;

                    const isHovered = hoveredNodeId === node.id;
                    const isFaded = hoveredNodeId && !isHovered;

                    // Color based on type
                    let fill = '#3f3f46';
                    let textFill = '#d4d4d8';
                    if (node.type === "O") { fill = '#18181b'; textFill = '#d946ef'; }
                    if (node.type === "T") { fill = '#27272a'; textFill = '#f97316'; }
                    if (node.type === "E") { fill = '#18181b'; textFill = '#6366f1'; }

                    return (
                      <g 
                        key={`node-${node.id}`} 
                        className="cursor-crosshair transition-all duration-300"
                        onMouseEnter={() => setHoveredNodeId(node.id)}
                        onMouseLeave={() => setHoveredNodeId(null)}
                        style={{ opacity: isFaded ? 0.3 : 1 }}
                      >
                        <rect
                          x={c.x - 4}
                          y={c.y - c.height / 2}
                          width={8}
                          height={c.height}
                          fill={isHovered ? '#f97316' : fill}
                          rx={3}
                        />
                        <text
                          x={node.group === 0 ? c.x - 12 : node.group === 2 ? c.x + 12 : c.x}
                          y={c.y}
                          textAnchor={node.group === 0 ? "end" : node.group === 2 ? "start" : "middle"}
                          dominantBaseline="middle"
                          fill={isHovered ? '#fff' : textFill}
                          fontSize={node.type === "T" ? "12px" : "14px"}
                          fontWeight={node.type === "T" ? "600" : "400"}
                          className="select-none pointer-events-none"
                          style={{
                            textShadow: isHovered ? '0 0 8px rgba(0,0,0,0.8)' : 'none',
                          }}
                        >
                          {node.type === "T" ? (
                             <tspan dy="-16">{node.label}</tspan>
                          ) : (
                             node.label
                          )}
                        </text>
                        {/* Hidden interactive area to ease hovering */}
                        <circle cx={c.x} cy={c.y} r={24} fill="transparent" />
                      </g>
                    );
                  })}
                </g>
              </svg>
            </div>
            {hoveredNodeId && (
              <div className="absolute bottom-10 right-10 bg-black/80 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-2xl max-w-xs transition-opacity z-10 pointer-events-none">
                 <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1">
                   {PATHWAYS_NODES.find(n => n.id === hoveredNodeId)?.type === 'O' ? 'Occurrence (Base)' : PATHWAYS_NODES.find(n => n.id === hoveredNodeId)?.type === 'E' ? 'Elevation (Culmination)' : 'Thinker (Operator)'}
                 </div>
                 <div className="font-medium text-white text-sm mb-2">{PATHWAYS_NODES.find(n => n.id === hoveredNodeId)?.label}</div>
                 <div className="text-xs text-zinc-400">
                    Transitions are calculated based on sequential contextual drift within classified text segments linked to this node.
                 </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

