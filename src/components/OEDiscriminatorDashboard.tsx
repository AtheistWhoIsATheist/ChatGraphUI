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
    <div className="w-full h-full flex flex-col bg-[#000] text-[#eee] p-8 overflow-hidden font-mono relative">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxyZWN0IHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9IiMwMDAiIC8+PGNpcmNsZSBjeD0iNCIgY3k9IjQiIHI9IjEiIGZpbGw9IiMzMzMiIC8+PC9zdmc+')] opacity-20 pointer-events-none z-0"></div>

      <div className="flex-shrink-0 flex items-center gap-4 mb-4 pb-6 border-b-2 border-[#333] relative z-10">
        <div className="p-3 bg-[#111] border-2 border-[#a21caf]">
          <Database className="w-8 h-8 text-[#d946ef] animate-pulse-slow" />
        </div>
        <div>
          <h1 className="text-3xl font-serif font-black tracking-widest uppercase text-[#d946ef]">O-E System Analytics</h1>
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#FF3A00] mt-2">Visualizing Semantic Drift</div>
        </div>
      </div>
      <p className="text-sm text-[#888] mb-8 max-w-3xl leading-relaxed flex-shrink-0 border-l-2 border-[#d946ef] pl-4 relative z-10">
        Visualizing semantic drift: analyzing the frequency of terms and triggers involved in structural elevation mapping across the corpus.
      </p>

      <div className="flex gap-4 mb-8 border-b-2 border-[#333] pb-4 relative z-10 overflow-x-auto custom-scrollbar">
        {[
          { id: 'terms', icon: Hash, title: 'Term Frequency', color: '#d946ef' },
          { id: 'triggers', icon: TrendingUp, title: 'Trigger Modality', color: '#6366f1' },
          { id: 'network', icon: Network, title: 'Topological Signature', color: '#00E5FF' },
          { id: 'pathways', icon: FastForward, title: 'O-to-E Pathways', color: '#FF3A00' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "px-5 py-3 text-sm font-bold tracking-widest uppercase transition-colors flex items-center gap-3 border-2 whitespace-nowrap neo-flat",
              activeTab === tab.id
                ? `bg-[#111] text-[${tab.color}] border-[${tab.color}] shadow-[4px_4px_0_rgba(255,255,255,0.1)] translate-y-[-2px] translate-x-[-2px]`
                : "bg-[#050505] text-[#888] border-transparent hover:border-[#555] hover:text-[#eee]"
            )}
            style={activeTab === tab.id ? { color: tab.color, borderColor: tab.color } : {}}
          >
            <tab.icon className="w-5 h-5" /> {tab.title}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-hidden relative z-10 bg-[#050505] border-2 border-[#333] flex flex-col pt-4 neo-flat">
        {activeTab === 'terms' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full h-full flex flex-col p-6">
            <h3 className="text-sm font-bold text-[#d946ef] uppercase tracking-widest mb-6">Top Analytical Terms Ingested</h3>
            <div className="flex-1 min-h-0 relative">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={oeTermFrequencies.slice(0, 20)} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="term" type="category" axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12, fontFamily: 'monospace' }} />
                  <Tooltip cursor={{ fill: '#111' }} contentStyle={{ backgroundColor: '#000', border: '2px solid #333', borderRadius: '0', fontFamily: 'monospace', textTransform: 'uppercase' }} />
                  <Bar dataKey="count" radius={[0, 0, 0, 0]}>
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full h-full flex flex-col p-6">
            <h3 className="text-sm font-bold text-[#6366f1] uppercase tracking-widest mb-6">Frequent Elevation Triggers</h3>
            <div className="flex-1 min-h-0 relative">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={oeTriggerFrequencies.slice(0, 20)} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="trigger" type="category" axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12, fontFamily: 'monospace' }} />
                  <Tooltip cursor={{ fill: '#111' }} contentStyle={{ backgroundColor: '#000', border: '2px solid #333', borderRadius: '0', fontFamily: 'monospace', textTransform: 'uppercase' }} />
                  <Bar dataKey="count" radius={[0, 0, 0, 0]}>
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
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full h-full overflow-y-auto custom-scrollbar p-6">
              <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
                {oeGraphSample.map((edge, idx) => (
                  <div key={idx} className="bg-[#000] border-2 border-[#333] p-5 flex flex-col gap-4 relative group hover:border-[#00E5FF] transition-colors neo-flat">
                    <div className="text-[10px] text-[#00E5FF] uppercase font-bold tracking-widest bg-[#00E5FF]/10 self-start px-2 py-1 border border-[#00E5FF]/30">Connection Type</div>
                    <div className="text-sm font-bold text-[#eee] break-all max-w-[90%] font-mono">{edge.type}</div>
                    
                    <div className="flex items-start justify-between mt-2 pt-4 border-t-2 border-[#222]">
                      <div className="flex flex-col w-[45%]">
                        <span className="text-[10px] text-[#888] font-bold uppercase tracking-widest">Source</span>
                        <span className="text-xs text-[#ddd] break-words mt-1">{edge.source.split(':').pop() || edge.source}</span>
                      </div>
                      
                      <div className="text-[#FF3A00] font-bold translate-y-2">→</div>
                      
                      <div className="flex flex-col w-[45%] text-right">
                        <span className="text-[10px] text-[#888] font-bold uppercase tracking-widest">Target</span>
                        <span className="text-xs text-[#d946ef] break-words mt-1">{edge.target.split(':').pop() || edge.target}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
           </motion.div>
        )}

        {activeTab === 'pathways' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full h-full flex flex-col p-6">
            <h3 className="text-sm font-bold text-[#FF3A00] uppercase tracking-widest mb-2">Occurrence (O) to Elevation (E) Pathways</h3>
            <p className="text-xs font-mono text-[#888] mb-6 border-l-2 border-[#FF3A00] pl-3">Tracing semantic flow from base phenomenon to its culmination through specific thinkers.</p>
            <div className="flex-1 min-h-0 relative border-2 border-[#333] bg-[#000] overflow-hidden p-6 flex flex-col neo-flat">
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
                          fontWeight={node.type === "T" ? "700" : "500"}
                          fontFamily="monospace"
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
              <div className="absolute bottom-10 right-10 bg-[#000] p-6 border-2 border-[#FF3A00] shadow-[6px_6px_0_rgba(255,58,0,0.3)] max-w-sm transition-opacity z-10 pointer-events-none neo-flat">
                 <div className="text-[10px] text-[#FF3A00] uppercase tracking-widest font-bold mb-2">
                   {PATHWAYS_NODES.find(n => n.id === hoveredNodeId)?.type === 'O' ? 'Occurrence (Base)' : PATHWAYS_NODES.find(n => n.id === hoveredNodeId)?.type === 'E' ? 'Elevation (Culmination)' : 'Thinker (Operator)'}
                 </div>
                 <div className="font-bold font-mono text-[#eee] text-lg mb-3 border-b-2 border-[#333] pb-2">{PATHWAYS_NODES.find(n => n.id === hoveredNodeId)?.label}</div>
                 <div className="text-xs font-mono text-[#888] leading-relaxed">
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

