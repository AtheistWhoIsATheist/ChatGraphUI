import React, { useState, useRef, useEffect, useMemo } from 'react';
import * as d3 from 'd3';
import { OntologyNode } from '../data/ontology';
import { ParadoxSynthesis } from '../types';
import { synthesizeParadox } from '../utils/apophaticEngine';
import { ParadoxMetricsChart } from './ParadoxMetricsChart';
import { ParadoxTrendChartD3 } from './ParadoxTrendChartD3';
import { HelpCircle, ChevronRight, Activity, Flame, Clock, BookOpen, Grid, Sparkles, Info, BarChart3, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ParadoxSynthesizerProps {
  nodes: OntologyNode[];
  synthesisHistory: ParadoxSynthesis[];
  onSaveSynthesis: (synthesis: ParadoxSynthesis) => void;
  onClearHistory: () => void;
}

// Default pre-compiled paradoxes if synthesisHistory is short, ensuring heat map is always rich
const SAMPLE_PARADOXES: ParadoxSynthesis[] = [
  {
    id: 'sample_1',
    nodeAId: 'void',
    nodeBId: 'nihil',
    nodeALabel: 'The Absolute Void',
    nodeBLabel: 'Active Nihil',
    thesis: 'The Void is uncreated stillness beyond form or predicate.',
    antithesis: 'Active Nihil is dynamic negation that active purges fixed beliefs.',
    synthesis: 'The Void acts through Active Nihil; stillness and negation are two faces of unconditioned presence.',
    timestamp: new Date().toISOString()
  },
  {
    id: 'sample_2',
    nodeAId: 'epoche',
    nodeBId: 'aporia',
    nodeALabel: 'Socratic Epoché',
    nodeBLabel: 'Radical Aporia',
    thesis: 'Epoché suspends judgment to maintain intellectual stillness.',
    antithesis: 'Aporia experiences the painful collapse of all logical pathways.',
    synthesis: 'Aporia breaks the pride of reason, leaving Epoché as the natural, peaceful resting state.',
    timestamp: new Date().toISOString()
  },
  {
    id: 'sample_3',
    nodeAId: 'sunyata',
    nodeBId: 'void',
    nodeALabel: 'Śūnyatā (Emptiness)',
    nodeBLabel: 'The Absolute Void',
    thesis: 'Śūnyatā asserts all phenomena lack intrinsic essence.',
    antithesis: 'The Void is the abyssal background from which being withdraws.',
    synthesis: 'Emptiness is not empty of existence, but full of unconditioned potentiality.',
    timestamp: new Date().toISOString()
  }
];

// --- D3 HEAT MAP COMPONENT ---
interface ParadoxHeatMapD3Props {
  nodes: OntologyNode[];
  synthesisHistory: ParadoxSynthesis[];
}

const ParadoxHeatMapD3: React.FC<ParadoxHeatMapD3Props> = ({ nodes, synthesisHistory }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [selectedCell, setSelectedCell] = useState<{
    paradox: ParadoxSynthesis;
    node: OntologyNode;
    intensity: number;
    reason: string;
  } | null>(null);

  const [hoveredCell, setHoveredCell] = useState<{
    x: number;
    y: number;
    paradoxTitle: string;
    nodeLabel: string;
    intensity: number;
  } | null>(null);

  // Combine user synthesis history with sample paradoxes
  const allParadoxes = useMemo(() => {
    const combined = [...synthesisHistory];
    SAMPLE_PARADOXES.forEach(sample => {
      if (!combined.some(p => p.id === sample.id || (p.nodeAId === sample.nodeAId && p.nodeBId === sample.nodeBId))) {
        combined.push(sample);
      }
    });
    return combined;
  }, [synthesisHistory]);

  // Compute Heat Map Matrix Data
  const matrixData = useMemo(() => {
    const data: {
      paradox: ParadoxSynthesis;
      node: OntologyNode;
      intensity: number;
      reason: string;
    }[] = [];

    allParadoxes.forEach(paradox => {
      nodes.forEach(node => {
        let intensity = 0.08; // Base background heat
        let reason = 'Unconnected in ontology matrix';

        const isDirectA = node.id === paradox.nodeAId || node.label.toLowerCase() === paradox.nodeALabel.toLowerCase();
        const isDirectB = node.id === paradox.nodeBId || node.label.toLowerCase() === paradox.nodeBLabel.toLowerCase();

        if (isDirectA || isDirectB) {
          intensity = 1.0;
          reason = `Direct Source Anchor node in paradox synthesis (${isDirectA ? 'Concept A' : 'Concept B'})`;
        } else {
          // Check semantic overlap
          const text = (paradox.thesis + ' ' + paradox.antithesis + ' ' + paradox.synthesis).toLowerCase();
          const nodeKey = node.label.toLowerCase();
          const summaryKey = node.summary.toLowerCase();

          if (text.includes(nodeKey) || summaryKey.includes(paradox.nodeALabel.toLowerCase())) {
            intensity = 0.65;
            reason = `High conceptual resonance with thesis/antithesis claims`;
          } else if (node.type === 'Ontological Core' || node.type === 'Conceptual Core') {
            intensity = 0.35;
            reason = `Structural alignment through core ${node.type} taxonomy`;
          } else {
            intensity = 0.15;
            reason = `Subtle ambient field connection`;
          }
        }

        data.push({ paradox, node, intensity, reason });
      });
    });

    return data;
  }, [allParadoxes, nodes]);

  // Render D3 Heat Map
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth || 700;
    const height = Math.max(380, allParadoxes.length * 48 + 80);
    const margin = { top: 70, right: 20, bottom: 60, left: 160 };

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous render

    svg.attr('width', width).attr('height', height);

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // X Scale: Ontology Nodes
    const xScale = d3.scaleBand()
      .range([0, innerWidth])
      .domain(nodes.map(n => n.label))
      .padding(0.08);

    // Y Scale: Synthesized Paradoxes
    const yScale = d3.scaleBand()
      .range([0, innerHeight])
      .domain(allParadoxes.map(p => `${p.nodeALabel} ⊗ ${p.nodeBLabel}`))
      .padding(0.12);

    // Color Interpolator: Dark Charcoal -> Violet Purple -> Golden Flame
    const colorScale = d3.scaleLinear<string>()
      .domain([0.08, 0.4, 0.7, 1.0])
      .range(['#121217', '#4c1d95', '#a855f7', '#f59e0b']);

    // Render X Axis Labels (Ontology Nodes, rotated for legibility)
    g.append('g')
      .attr('transform', `translate(0, -10)`)
      .selectAll('text')
      .data(nodes)
      .enter()
      .append('text')
      .attr('x', n => (xScale(n.label) || 0) + xScale.bandwidth() / 2)
      .attr('y', 0)
      .attr('text-anchor', 'start')
      .attr('transform', n => `rotate(-35, ${(xScale(n.label) || 0) + xScale.bandwidth() / 2}, 0)`)
      .style('fill', '#a3a3a3')
      .style('font-family', 'monospace')
      .style('font-size', '10px')
      .style('font-weight', '600')
      .text(n => n.label.length > 18 ? n.label.slice(0, 16) + '…' : n.label);

    // Render Y Axis Labels (Paradoxes)
    g.append('g')
      .selectAll('text')
      .data(allParadoxes)
      .enter()
      .append('text')
      .attr('x', -10)
      .attr('y', p => (yScale(`${p.nodeALabel} ⊗ ${p.nodeBLabel}`) || 0) + yScale.bandwidth() / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'end')
      .style('fill', '#d4d4d4')
      .style('font-family', 'monospace')
      .style('font-size', '10px')
      .text(p => `${p.nodeALabel.slice(0, 10)} ⊗ ${p.nodeBLabel.slice(0, 10)}`);

    // Render Heat Map Grid Rectangles
    g.selectAll('rect.heat-cell')
      .data(matrixData)
      .enter()
      .append('rect')
      .attr('class', 'heat-cell')
      .attr('x', d => xScale(d.node.label) || 0)
      .attr('y', d => yScale(`${d.paradox.nodeALabel} ⊗ ${d.paradox.nodeBLabel}`) || 0)
      .attr('width', xScale.bandwidth())
      .attr('height', yScale.bandwidth())
      .attr('rx', 4)
      .attr('ry', 4)
      .style('fill', d => colorScale(d.intensity))
      .style('stroke', '#1a1a22')
      .style('stroke-width', '1.5px')
      .style('cursor', 'pointer')
      .style('transition', 'all 0.2s ease')
      .on('mouseover', (event, d) => {
        d3.select(event.currentTarget)
          .style('stroke', '#ffffff')
          .style('stroke-width', '2.5px');

        const [mouseX, mouseY] = d3.pointer(event, containerRef.current);
        setHoveredCell({
          x: mouseX,
          y: mouseY,
          paradoxTitle: `${d.paradox.nodeALabel} ⊗ ${d.paradox.nodeBLabel}`,
          nodeLabel: d.node.label,
          intensity: Math.round(d.intensity * 100)
        });
      })
      .on('mouseout', (event) => {
        d3.select(event.currentTarget)
          .style('stroke', '#1a1a22')
          .style('stroke-width', '1.5px');

        setHoveredCell(null);
      })
      .on('click', (_, d) => {
        setSelectedCell(d);
      });

  }, [nodes, allParadoxes, matrixData]);

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* Description Header */}
      <div className="bg-neutral-900/60 border border-neutral-850 p-4 rounded-xl flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2 text-neutral-300">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>D3 Paradox Connection Matrix • Heatmap View</span>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 text-[10px] text-neutral-400">
          <span>0% Ambient</span>
          <div className="w-24 h-2 bg-gradient-to-r from-[#121217] via-[#7e22ce] to-[#f59e0b] rounded-full border border-neutral-700" />
          <span>100% Direct Anchor</span>
        </div>
      </div>

      {/* SVG Container */}
      <div ref={containerRef} className="relative w-full overflow-x-auto bg-neutral-950 border border-neutral-900 rounded-2xl p-4 flex justify-center">
        <svg ref={svgRef} />

        {/* Floating Hover Tooltip */}
        {hoveredCell && (
          <div
            className="absolute z-20 pointer-events-none bg-neutral-900 border border-neutral-700 text-white p-3 rounded-xl shadow-2xl text-xs font-mono flex flex-col gap-1 backdrop-blur-md"
            style={{ left: hoveredCell.x + 15, top: hoveredCell.y - 10 }}
          >
            <div className="text-amber-400 font-bold">{hoveredCell.paradoxTitle}</div>
            <div className="text-neutral-300">Ontology Node: {hoveredCell.nodeLabel}</div>
            <div className="text-purple-300 font-semibold">Resonance Intensity: {hoveredCell.intensity}%</div>
          </div>
        )}
      </div>

      {/* Selected Cell Inspector Panel */}
      {selectedCell ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 flex flex-col gap-3 font-sans text-xs"
        >
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400" />
              <h4 className="font-display text-sm font-bold text-white uppercase tracking-wider">
                {selectedCell.paradox.nodeALabel} ⊗ {selectedCell.paradox.nodeBLabel}
              </h4>
            </div>
            <span className="text-xs font-mono text-purple-400 bg-purple-950/60 border border-purple-800 px-2.5 py-0.5 rounded-full">
              Node Target: {selectedCell.node.label} ({Math.round(selectedCell.intensity * 100)}% Heat)
            </span>
          </div>

          <p className="text-neutral-400 font-mono text-[11px] leading-relaxed">
            <strong className="text-amber-300">Connection Rationale:</strong> {selectedCell.reason}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1">
            <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-850">
              <span className="text-[10px] font-mono text-neutral-500 uppercase block mb-1">Thesis Claim</span>
              <p className="text-neutral-300">{selectedCell.paradox.thesis}</p>
            </div>
            <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-850">
              <span className="text-[10px] font-mono text-neutral-500 uppercase block mb-1">Apophatic Synthesis</span>
              <p className="text-amber-200 italic font-serif">{selectedCell.paradox.synthesis}</p>
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="bg-neutral-950 border border-neutral-900 rounded-xl p-4 text-center text-xs font-mono text-neutral-500 flex items-center justify-center gap-2">
          <Info className="w-4 h-4 text-neutral-600" />
          <span>Click any cell in the D3 matrix above to inspect its thesis-antithesis synthesis logic.</span>
        </div>
      )}
    </div>
  );
};

// --- MAIN PARADOX SYNTHESIZER CONTAINER ---
export const ParadoxSynthesizer: React.FC<ParadoxSynthesizerProps> = ({
  nodes,
  synthesisHistory,
  onSaveSynthesis,
  onClearHistory
}) => {
  const [viewMode, setViewMode] = useState<'synthesizer' | 'heatmap' | 'trend' | 'metrics'>('synthesizer');

  const [nodeAId, setNodeAId] = useState('');
  const [nodeBId, setNodeBId] = useState('');
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [currentSynthesis, setCurrentSynthesis] = useState<ParadoxSynthesis | null>(null);
  const [activeStep, setActiveStep] = useState<'none' | 'thesis' | 'antithesis' | 'synthesis'>('none');

  const filteredNodesForB = nodes.filter(n => n.id !== nodeAId);

  // Trigger paradox compilation
  const handleCompileParadox = async () => {
    const nodeA = nodes.find(n => n.id === nodeAId);
    const nodeB = nodes.find(n => n.id === nodeBId);

    if (!nodeA || !nodeB) return;

    setIsSynthesizing(true);
    setCurrentSynthesis(null);
    setActiveStep('none');

    try {
      const response = await fetch('/api/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodeA, nodeB })
      });

      if (!response.ok) {
        let errMessage = `Synthesis API error ${response.status}`;
        try {
          const errData = await response.json();
          if (errData?.error) errMessage = errData.error;
        } catch {
          const rawText = await response.text();
          if (rawText) errMessage = rawText.slice(0, 150);
        }
        throw new Error(errMessage);
      }

      const result = await response.json();
      const synthResult: ParadoxSynthesis = {
        id: `${nodeA.id}_${nodeB.id}_${Date.now()}`,
        nodeAId: nodeA.id,
        nodeBId: nodeB.id,
        nodeALabel: nodeA.label,
        nodeBLabel: nodeB.label,
        thesis: result.thesis,
        antithesis: result.antithesis,
        synthesis: result.synthesis,
        timestamp: new Date().toISOString()
      };

      setCurrentSynthesis(synthResult);
      onSaveSynthesis(synthResult);

      // Sequence steps for a beautiful, suspenseful reveal
      setActiveStep('thesis');
      setTimeout(() => setActiveStep('antithesis'), 1200);
      setTimeout(() => setActiveStep('synthesis'), 2400);
    } catch (err) {
      console.error('Gemini synthesis failed, falling back to local registry:', err);
      // Seamless offline/local fallback
      const fallbackResult = synthesizeParadox(nodeA, nodeB);
      setCurrentSynthesis(fallbackResult);
      onSaveSynthesis(fallbackResult);

      setActiveStep('thesis');
      setTimeout(() => setActiveStep('antithesis'), 1000);
      setTimeout(() => setActiveStep('synthesis'), 2000);
    } finally {
      setIsSynthesizing(false);
    }
  };

  const handleSelectPastSynthesis = (synth: ParadoxSynthesis) => {
    setCurrentSynthesis(synth);
    setNodeAId(synth.nodeAId);
    setNodeBId(synth.nodeBId);
    setActiveStep('synthesis');
  };

  return (
    <div id="paradox-synthesizer-section" className="flex flex-col gap-6 h-full">
      
      {/* Top View Mode Switcher */}
      <div className="flex items-center justify-between bg-neutral-950 border border-neutral-900 p-2.5 rounded-2xl">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-br from-amber-500/20 to-purple-600/20 border border-amber-500/30 rounded-xl">
            <Activity className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h3 className="font-display text-xs uppercase tracking-widest font-bold text-white">
              Apophatic Paradox Engine
            </h3>
            <p className="text-[10px] text-neutral-500 font-mono">
              Dialectical Synthesis & D3 Conceptual Connection Heatmap
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-neutral-900 p-1 rounded-xl border border-neutral-850">
          <button
            onClick={() => setViewMode('synthesizer')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
              viewMode === 'synthesizer'
                ? 'bg-neutral-800 text-white font-medium shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-amber-400" />
            <span>Synthesizer & Codex</span>
          </button>

          <button
            onClick={() => setViewMode('heatmap')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
              viewMode === 'heatmap'
                ? 'bg-neutral-800 text-white font-medium shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Grid className="w-3.5 h-3.5 text-purple-400" />
            <span>D3 Heat Map Matrix</span>
          </button>

          <button
            onClick={() => setViewMode('trend')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
              viewMode === 'trend'
                ? 'bg-neutral-800 text-amber-300 font-medium shadow-sm border border-amber-500/30'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
            <span>D3 Synthesis Trend</span>
          </button>

          <button
            onClick={() => setViewMode('metrics')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
              viewMode === 'metrics'
                ? 'bg-neutral-800 text-amber-300 font-medium shadow-sm border border-amber-500/30'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-amber-400" />
            <span>Recharts Metrics</span>
          </button>
        </div>
      </div>

      {/* Main View Area */}
      {viewMode === 'heatmap' ? (
        <ParadoxHeatMapD3 nodes={nodes} synthesisHistory={synthesisHistory} />
      ) : viewMode === 'trend' ? (
        <ParadoxTrendChartD3 synthesisHistory={synthesisHistory} sampleParadoxes={SAMPLE_PARADOXES} />
      ) : viewMode === 'metrics' ? (
        <ParadoxMetricsChart synthesisHistory={synthesisHistory} sampleParadoxes={SAMPLE_PARADOXES} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
          {/* Synthesizer Panel (7 Columns) */}
          <div className="lg:col-span-7 bg-neutral-950 border border-neutral-900 rounded-2xl p-6 flex flex-col justify-between gap-6 abyssal-glow min-h-[480px]">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 border-b border-neutral-900 pb-3">
                <Activity className="w-4 h-4 text-neutral-400" />
                <h3 className="font-display text-sm font-semibold tracking-wider text-neutral-200 uppercase">
                  Paradox Synthesizer
                </h3>
              </div>

              <p className="text-xs text-neutral-400 leading-relaxed font-sans mb-2">
                Select two core ontological nodes. The synthesizer will compute the cognitive friction between their claims (Thesis and Antithesis) and reveal the apophatic ground where they dissolve into uncreated stillness.
              </p>

              {/* Form Dropdowns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest block mb-1.5">
                    First realization (Concept A)
                  </label>
                  <select
                    value={nodeAId}
                    onChange={(e) => {
                      setNodeAId(e.target.value);
                      if (e.target.value === nodeBId) setNodeBId('');
                    }}
                    className="w-full bg-black border border-neutral-900 focus:border-neutral-700 p-3 rounded-xl text-xs text-neutral-300 outline-none transition-colors"
                  >
                    <option value="">-- Load Concept --</option>
                    {nodes.map(n => (
                      <option key={n.id} value={n.id}>{n.label} ({n.type})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest block mb-1.5">
                    Contrasting path (Concept B)
                  </label>
                  <select
                    value={nodeBId}
                    onChange={(e) => setNodeBId(e.target.value)}
                    disabled={!nodeAId}
                    className="w-full bg-black border border-neutral-900 focus:border-neutral-700 p-3 rounded-xl text-xs text-neutral-300 outline-none transition-colors disabled:opacity-40"
                  >
                    <option value="">-- Select Contrast --</option>
                    {filteredNodesForB.map(n => (
                      <option key={n.id} value={n.id}>{n.label} ({n.type})</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Synthesis Process View */}
            <div className="flex-1 min-h-[160px] flex items-center justify-center py-4">
              <AnimatePresence mode="wait">
                {isSynthesizing ? (
                  <motion.div
                    key="loading-anim"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center gap-3 text-center"
                  >
                    <div className="relative w-12 h-12 flex items-center justify-center">
                      <span className="absolute inset-0 border-2 border-neutral-800 rounded-full" />
                      <span className="absolute inset-0 border-2 border-t-white rounded-full animate-spin" />
                      <Flame className="w-5 h-5 text-neutral-400 animate-pulse" />
                    </div>
                    <p className="text-xs font-mono text-neutral-500">
                      Aligning conceptual coordinates...
                    </p>
                  </motion.div>
                ) : currentSynthesis ? (
                  <motion.div
                    key="synthesis-steps"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="w-full flex flex-col gap-4 font-sans text-xs text-neutral-300 leading-relaxed"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Step 1: Thesis */}
                      {(activeStep === 'thesis' || activeStep === 'antithesis' || activeStep === 'synthesis') && (
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="bg-neutral-900/40 border border-neutral-900 p-4 rounded-xl"
                        >
                          <h5 className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                            <ChevronRight className="w-3 h-3 text-neutral-600" />
                            Thesis: {currentSynthesis.nodeALabel}
                          </h5>
                          <p className="leading-relaxed font-sans">{currentSynthesis.thesis}</p>
                        </motion.div>
                      )}

                      {/* Step 2: Antithesis */}
                      {(activeStep === 'antithesis' || activeStep === 'synthesis') && (
                        <motion.div
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="bg-neutral-900/40 border border-neutral-900 p-4 rounded-xl"
                        >
                          <h5 className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                            <ChevronRight className="w-3 h-3 text-neutral-600" />
                            Antithesis: {currentSynthesis.nodeBLabel}
                          </h5>
                          <p className="leading-relaxed font-sans">{currentSynthesis.antithesis}</p>
                        </motion.div>
                      )}
                    </div>

                    {/* Step 3: Synthesis */}
                    {activeStep === 'synthesis' && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-neutral-900/20 border border-neutral-850 p-5 rounded-xl border-dashed"
                      >
                        <h5 className="text-[10px] font-mono text-neutral-100 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                          <Flame className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                          Apophatic Dissolution (Synthesis)
                        </h5>
                        <p className="text-neutral-200 leading-relaxed text-xs font-serif italic select-text">
                          {currentSynthesis.synthesis}
                        </p>
                      </motion.div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty-synthesizer"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center text-center gap-2.5 text-neutral-700 py-6"
                  >
                    <HelpCircle className="w-8 h-8 text-neutral-850" />
                    <p className="text-xs font-mono">Conceptual reactor inactive.</p>
                    <p className="text-[10px] text-neutral-600 max-w-sm">Select two different parameters above and hit compile to initiate apophatic analysis.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Action Button */}
            <div className="border-t border-neutral-900 pt-4 mt-2">
              <button
                disabled={!nodeAId || !nodeBId || isSynthesizing}
                onClick={handleCompileParadox}
                className="w-full bg-white hover:bg-neutral-100 text-black disabled:bg-neutral-900 disabled:text-neutral-600 border border-transparent disabled:border-neutral-850 font-mono text-xs py-2.5 rounded-xl font-semibold transition-all flex items-center justify-center gap-1.5 shadow-[0_4px_12px_rgba(255,255,255,0.05)] cursor-pointer"
              >
                Synthesize Paradox
              </button>
            </div>
          </div>

          {/* Synthesis History / Ledger (5 Columns) */}
          <div className="lg:col-span-5 bg-neutral-950 border border-neutral-900 rounded-2xl p-5 flex flex-col justify-between gap-4 abyssal-glow max-h-[580px]">
            <div className="flex flex-col gap-3 overflow-hidden h-full">
              <div className="flex justify-between items-center border-b border-neutral-900 pb-2.5">
                <h4 className="font-display text-xs font-semibold tracking-wider text-neutral-400 uppercase flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-neutral-500" />
                  Paradox Codex
                </h4>
                {synthesisHistory.length > 0 && (
                  <button
                    onClick={onClearHistory}
                    className="text-[9px] font-mono text-neutral-500 hover:text-red-400 transition-colors cursor-pointer"
                  >
                    Erase Codex
                  </button>
                )}
              </div>

              <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2.5">
                {synthesisHistory.length > 0 ? (
                  synthesisHistory.map((synth) => (
                    <div
                      key={synth.id}
                      onClick={() => handleSelectPastSynthesis(synth)}
                      className="bg-neutral-900/20 hover:bg-neutral-900/50 border border-neutral-900/80 hover:border-neutral-800 p-3 rounded-xl cursor-pointer transition-all flex flex-col gap-1.5"
                    >
                      <div className="flex items-center justify-between text-[9px] font-mono">
                        <div className="flex items-center gap-1 text-neutral-400">
                          <span>{synth.nodeALabel}</span>
                          <span className="text-neutral-600 font-sans">⊗</span>
                          <span>{synth.nodeBLabel}</span>
                        </div>
                        <span className="text-[8px] text-neutral-600">
                          {new Date(synth.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-[10px] text-neutral-400 line-clamp-2 italic leading-relaxed font-serif pl-1">
                        "{synth.synthesis}"
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center py-20 text-center text-neutral-700 gap-1.5">
                    <BookOpen className="w-6 h-6 text-neutral-850" />
                    <p className="text-[10px] font-mono">Paradox Codex currently empty.</p>
                    <p className="text-[9px] text-neutral-600 max-w-xs">Synthesized paradoxes are archived here for critical study.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
