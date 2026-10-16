import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  Activity,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  BarChart2,
  TrendingUp,
  Share2,
  Scale,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PhilocrashAutopsyModal } from './PhilocrashAutopsyModal';

export interface DisparityMetric {
  id: 'composite' | 'divergence' | 'density' | 'apophatic' | 'gap';
  label: string;
  shortName: string;
  value: number; // 0.0 to 1.0
  color: string;
  bgGradient: string;
  description: string;
}

export interface MapComparisonData {
  id: string;
  name: string;
  comparisonLabel: string;
  epoch: string;
  disparity: number;
  metrics: DisparityMetric[];
}

export const MAP_COMPARISON_DATASETS: MapComparisonData[] = [
  {
    id: 'map-1',
    name: '/map 1',
    comparisonLabel: 'Apophatic Primacy vs Classical Theism',
    epoch: 'Genesis Anchor',
    disparity: 0.42,
    metrics: [
      { id: 'composite', label: 'Composite Disparity Index', shortName: 'Δtotal', value: 0.42, color: '#F59E0B', bgGradient: 'from-amber-500 to-amber-600', description: 'Total variance across ontological tensor' },
      { id: 'divergence', label: 'Topological Divergence', shortName: 'Δλ', value: 0.48, color: '#8B5CF6', bgGradient: 'from-violet-500 to-indigo-600', description: 'Eigenvalue drift between anchor vertices' },
      { id: 'density', label: 'Ontological Density', shortName: 'ρonto', value: 0.65, color: '#06B6D4', bgGradient: 'from-cyan-500 to-blue-600', description: 'Degree of conceptual reification' },
      { id: 'apophatic', label: 'Apophatic Tension', shortName: 'θapoph', value: 0.35, color: '#10B981', bgGradient: 'from-emerald-500 to-teal-600', description: 'Boundary resistance against affirmation' },
      { id: 'gap', label: 'Phenomenological Gap', shortName: 'δgap', value: 0.41, color: '#EC4899', bgGradient: 'from-pink-500 to-rose-600', description: 'Subject-object dissolution distance' }
    ]
  },
  {
    id: 'map-2',
    name: '/map 2',
    comparisonLabel: 'Active Nihil vs Passive Despair (Nietzsche / Cioran)',
    epoch: 'Δ1 Transition',
    disparity: 0.58,
    metrics: [
      { id: 'composite', label: 'Composite Disparity Index', shortName: 'Δtotal', value: 0.58, color: '#F59E0B', bgGradient: 'from-amber-500 to-amber-600', description: 'Total variance across ontological tensor' },
      { id: 'divergence', label: 'Topological Divergence', shortName: 'Δλ', value: 0.62, color: '#8B5CF6', bgGradient: 'from-violet-500 to-indigo-600', description: 'Eigenvalue drift between anchor vertices' },
      { id: 'density', label: 'Ontological Density', shortName: 'ρonto', value: 0.52, color: '#06B6D4', bgGradient: 'from-cyan-500 to-blue-600', description: 'Degree of conceptual reification' },
      { id: 'apophatic', label: 'Apophatic Tension', shortName: 'θapoph', value: 0.55, color: '#10B981', bgGradient: 'from-emerald-500 to-teal-600', description: 'Boundary resistance against affirmation' },
      { id: 'gap', label: 'Phenomenological Gap', shortName: 'δgap', value: 0.59, color: '#EC4899', bgGradient: 'from-pink-500 to-rose-600', description: 'Subject-object dissolution distance' }
    ]
  },
  {
    id: 'map-3',
    name: '/map 3',
    comparisonLabel: 'The Absolute Void vs Socratic Epoché',
    epoch: 'Δ2 Crucible',
    disparity: 0.73,
    metrics: [
      { id: 'composite', label: 'Composite Disparity Index', shortName: 'Δtotal', value: 0.73, color: '#F59E0B', bgGradient: 'from-amber-500 to-amber-600', description: 'Total variance across ontological tensor' },
      { id: 'divergence', label: 'Topological Divergence', shortName: 'Δλ', value: 0.79, color: '#8B5CF6', bgGradient: 'from-violet-500 to-indigo-600', description: 'Eigenvalue drift between anchor vertices' },
      { id: 'density', label: 'Ontological Density', shortName: 'ρonto', value: 0.44, color: '#06B6D4', bgGradient: 'from-cyan-500 to-blue-600', description: 'Degree of conceptual reification' },
      { id: 'apophatic', label: 'Apophatic Tension', shortName: 'θapoph', value: 0.72, color: '#10B981', bgGradient: 'from-emerald-500 to-teal-600', description: 'Boundary resistance against affirmation' },
      { id: 'gap', label: 'Phenomenological Gap', shortName: 'δgap', value: 0.76, color: '#EC4899', bgGradient: 'from-pink-500 to-rose-600', description: 'Subject-object dissolution distance' }
    ]
  },
  {
    id: 'map-4',
    name: '/map 4',
    comparisonLabel: 'Cataphatic Dogma vs Groundless Ground',
    epoch: 'Δ3 Rupture',
    disparity: 0.86,
    metrics: [
      { id: 'composite', label: 'Composite Disparity Index', shortName: 'Δtotal', value: 0.86, color: '#F59E0B', bgGradient: 'from-amber-500 to-amber-600', description: 'Total variance across ontological tensor' },
      { id: 'divergence', label: 'Topological Divergence', shortName: 'Δλ', value: 0.91, color: '#8B5CF6', bgGradient: 'from-violet-500 to-indigo-600', description: 'Eigenvalue drift between anchor vertices' },
      { id: 'density', label: 'Ontological Density', shortName: 'ρonto', value: 0.31, color: '#06B6D4', bgGradient: 'from-cyan-500 to-blue-600', description: 'Degree of conceptual reification' },
      { id: 'apophatic', label: 'Apophatic Tension', shortName: 'θapoph', value: 0.89, color: '#10B981', bgGradient: 'from-emerald-500 to-teal-600', description: 'Boundary resistance against affirmation' },
      { id: 'gap', label: 'Phenomenological Gap', shortName: 'δgap', value: 0.84, color: '#EC4899', bgGradient: 'from-pink-500 to-rose-600', description: 'Subject-object dissolution distance' }
    ]
  },
  {
    id: 'map-5',
    name: '/map 5',
    comparisonLabel: 'Radical Immanence vs Transcendent Illusion',
    epoch: 'Δ4 Horizon',
    disparity: 0.69,
    metrics: [
      { id: 'composite', label: 'Composite Disparity Index', shortName: 'Δtotal', value: 0.69, color: '#F59E0B', bgGradient: 'from-amber-500 to-amber-600', description: 'Total variance across ontological tensor' },
      { id: 'divergence', label: 'Topological Divergence', shortName: 'Δλ', value: 0.74, color: '#8B5CF6', bgGradient: 'from-violet-500 to-indigo-600', description: 'Eigenvalue drift between anchor vertices' },
      { id: 'density', label: 'Ontological Density', shortName: 'ρonto', value: 0.39, color: '#06B6D4', bgGradient: 'from-cyan-500 to-blue-600', description: 'Degree of conceptual reification' },
      { id: 'apophatic', label: 'Apophatic Tension', shortName: 'θapoph', value: 0.61, color: '#10B981', bgGradient: 'from-emerald-500 to-teal-600', description: 'Boundary resistance against affirmation' },
      { id: 'gap', label: 'Phenomenological Gap', shortName: 'δgap', value: 0.68, color: '#EC4899', bgGradient: 'from-pink-500 to-rose-600', description: 'Subject-object dissolution distance' }
    ]
  },
  {
    id: 'map-6',
    name: '/map 6',
    comparisonLabel: 'Asymptotic Invariant Boundary (θ = 0.18 Hold)',
    epoch: 'Δ5 Convergence',
    disparity: 0.82,
    metrics: [
      { id: 'composite', label: 'Composite Disparity Index', shortName: 'Δtotal', value: 0.82, color: '#F59E0B', bgGradient: 'from-amber-500 to-amber-600', description: 'Total variance across ontological tensor' },
      { id: 'divergence', label: 'Topological Divergence', shortName: 'Δλ', value: 0.88, color: '#8B5CF6', bgGradient: 'from-violet-500 to-indigo-600', description: 'Eigenvalue drift between anchor vertices' },
      { id: 'density', label: 'Ontological Density', shortName: 'ρonto', value: 0.18, color: '#06B6D4', bgGradient: 'from-cyan-500 to-blue-600', description: 'Degree of conceptual reification' },
      { id: 'apophatic', label: 'Apophatic Tension', shortName: 'θapoph', value: 0.81, color: '#10B981', bgGradient: 'from-emerald-500 to-teal-600', description: 'Boundary resistance against affirmation' },
      { id: 'gap', label: 'Phenomenological Gap', shortName: 'δgap', value: 0.85, color: '#EC4899', bgGradient: 'from-pink-500 to-rose-600', description: 'Subject-object dissolution distance' }
    ]
  }
];

interface DisparityProps {
  className?: string;
  defaultMapIndex?: number;
  onMapChange?: (mapName: string) => void;
  compact?: boolean;
  onSelectGraphNode?: (nodeId: string) => void;
}

export const DisparityHistoryChart: React.FC<DisparityProps> = ({
  className = '',
  defaultMapIndex = 2,
  onMapChange,
  compact = false,
  onSelectGraphNode
}) => {
  const [activeMapIndex, setActiveMapIndex] = useState<number>(defaultMapIndex);
  const [viewMode, setViewMode] = useState<'nodes' | 'bars' | 'curve'>('nodes');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [sortByValue, setSortByValue] = useState<boolean>(false);

  // Philocrash Autopsy Modal state
  const [autopsyMetricId, setAutopsyMetricId] = useState<string | null>(null);
  const [isAutopsyOpen, setIsAutopsyOpen] = useState<boolean>(false);

  // Auto-play animation cycle across /map comparisons
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setActiveMapIndex((prev) => (prev + 1) % MAP_COMPARISON_DATASETS.length);
    }, 2400);
    return () => clearInterval(timer);
  }, [isPlaying]);

  const currentMap = MAP_COMPARISON_DATASETS[activeMapIndex];
  const previousMap = activeMapIndex > 0 ? MAP_COMPARISON_DATASETS[activeMapIndex - 1] : null;

  const handleSelectMap = (idx: number) => {
    setActiveMapIndex(idx);
    onMapChange?.(MAP_COMPARISON_DATASETS[idx].name);
  };

  const handlePrev = () => {
    setActiveMapIndex((prev) => (prev === 0 ? MAP_COMPARISON_DATASETS.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveMapIndex((prev) => (prev + 1) % MAP_COMPARISON_DATASETS.length);
  };

  const handleOpenAutopsy = (metricId: string) => {
    setAutopsyMetricId(metricId);
    setIsAutopsyOpen(true);
  };

  // Recharts line chart data mapping
  const lineChartData = MAP_COMPARISON_DATASETS.map((m) => ({
    name: m.name,
    disparity: m.disparity
  }));

  // Sort metrics if requested
  const displayMetrics = sortByValue
    ? [...currentMap.metrics].sort((a, b) => b.value - a.value)
    : currentMap.metrics;

  // Dynamic topological layout positions for the interactive topology graph
  // Each satellite node position adapts with metric tension, providing alive spring layout transitions
  const getNodePos = (id: string, val: number) => {
    if (id === 'composite') return { cx: 50, cy: 50 };
    const baseAngles: Record<string, number> = {
      divergence: -135, // top-left
      density: -45,     // top-right
      apophatic: 135,   // bottom-left
      gap: 45           // bottom-right
    };
    const angle = ((baseAngles[id] ?? 0) * Math.PI) / 180;
    const radius = 34 + (val - 0.5) * 8; // Dynamic orbit based on metric value
    return {
      cx: +(50 + radius * Math.cos(angle)).toFixed(1),
      cy: +(50 + radius * Math.sin(angle)).toFixed(1)
    };
  };

  return (
    <>
      <div
        id="visual-disparity-index"
        className={`flex flex-col bg-black/50 border-t border-l border-white/10 ${
          compact ? 'p-2.5 w-72' : 'p-3.5 w-80 lg:w-96'
        } shrink-0 relative overflow-hidden backdrop-blur-md rounded-tl-xl ${className}`}
      >
        {/* Top Header Strip: Title + View Switcher + Play Controls */}
        <div className="border-b border-white/10 pb-2.5 mb-2.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Activity size={13} className="text-amber-400 animate-pulse shrink-0" />
            <div>
              <h3 className="text-xs font-semibold text-white font-mono uppercase tracking-wider flex items-center gap-1.5">
                <span>Visual Disparity Index</span>
                <span className="text-[10px] font-normal text-amber-400/90 font-mono bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                  {currentMap.epoch}
                </span>
              </h3>
              <p className="text-[10px] text-white/40 font-mono truncate max-w-[210px]">
                {currentMap.comparisonLabel}
              </p>
            </div>
          </div>

          {/* View Switcher (Nodes, Bars, Curve) & Auto-Play with Layout Transitions */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`p-1 rounded text-[10px] transition-colors border ${
                isPlaying
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_8px_rgba(245,158,11,0.2)]'
                  : 'text-white/40 hover:text-white border-transparent'
              }`}
              title={isPlaying ? 'Pause Auto Comparison Cycle' : 'Auto Play /map Comparison Cycle'}
              aria-label="Toggle auto comparison play"
            >
              {isPlaying ? <Pause size={12} /> : <Play size={12} />}
            </button>

            {/* View Mode Toggle: Interactive Nodes vs Metric Node Cards vs Recharts Curve */}
            <div className="flex items-center bg-white/5 rounded p-0.5 border border-white/5 relative">
              <button
                onClick={() => setViewMode('nodes')}
                className={`p-1 rounded transition-colors relative z-10 ${
                  viewMode === 'nodes'
                    ? 'text-amber-200'
                    : 'text-white/40 hover:text-white'
                }`}
                title="Interactive Topology Nodes"
                aria-label="Interactive Topology Nodes"
              >
                {viewMode === 'nodes' && (
                  <motion.div
                    layoutId="disparity-view-indicator"
                    className="absolute inset-0 bg-amber-500/25 rounded border border-amber-500/40"
                    transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                  />
                )}
                <Share2 size={12} className="relative z-10" />
              </button>
              <button
                onClick={() => setViewMode('bars')}
                className={`p-1 rounded transition-colors relative z-10 ${
                  viewMode === 'bars'
                    ? 'text-amber-200'
                    : 'text-white/40 hover:text-white'
                }`}
                title="Interactive Metric Node Cards"
                aria-label="Interactive Metric Node Cards"
              >
                {viewMode === 'bars' && (
                  <motion.div
                    layoutId="disparity-view-indicator"
                    className="absolute inset-0 bg-amber-500/25 rounded border border-amber-500/40"
                    transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                  />
                )}
                <BarChart2 size={12} className="relative z-10" />
              </button>
              <button
                onClick={() => setViewMode('curve')}
                className={`p-1 rounded transition-colors relative z-10 ${
                  viewMode === 'curve'
                    ? 'text-amber-200'
                    : 'text-white/40 hover:text-white'
                }`}
                title="Comparative Trend Curve"
                aria-label="Comparative Trend Curve"
              >
                {viewMode === 'curve' && (
                  <motion.div
                    layoutId="disparity-view-indicator"
                    className="absolute inset-0 bg-amber-500/25 rounded border border-amber-500/40"
                    transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                  />
                )}
                <TrendingUp size={12} className="relative z-10" />
              </button>
            </div>
          </div>
        </div>

        {/* Interactive /map Comparison Selector Strip with Layout Transitions */}
        <div className="flex items-center justify-between gap-1 mb-2.5 bg-white/[0.03] p-1 rounded-lg border border-white/5">
          <button
            onClick={handlePrev}
            className="p-1 text-white/40 hover:text-white rounded hover:bg-white/10 transition-colors"
            title="Previous /map comparison"
            aria-label="Previous map"
          >
            <ChevronLeft size={13} />
          </button>

          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {MAP_COMPARISON_DATASETS.map((m, idx) => {
              const isSelected = idx === activeMapIndex;
              return (
                <button
                  key={m.id}
                  onClick={() => handleSelectMap(idx)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors relative ${
                    isSelected
                      ? 'text-amber-200 font-bold'
                      : 'text-white/50 hover:text-white hover:bg-white/5'
                  }`}
                  title={`Select ${m.name} comparison: ${m.comparisonLabel}`}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="disparity-map-indicator"
                      className="absolute inset-0 bg-amber-500/25 rounded border border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.25)]"
                      transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                    />
                  )}
                  <span className="relative z-10">{m.name}</span>
                </button>
              );
            })}
          </div>

          <button
            onClick={handleNext}
            className="p-1 text-white/40 hover:text-white rounded hover:bg-white/10 transition-colors"
            title="Next /map comparison"
            aria-label="Next map"
          >
            <ChevronRight size={13} />
          </button>
        </div>

        {/* Animated Main Content with Spring Layout Transitions */}
        <AnimatePresence mode="wait">
          {/* View Mode 1: Interactive Pentagonal Node Topology View */}
          {viewMode === 'nodes' && (
            <motion.div
              key="view-nodes"
              layout
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.18 }}
              className="flex-1 flex flex-col justify-between space-y-2"
            >
              {/* Instruction Tip */}
              <div className="flex items-center justify-between text-[10px] font-mono text-white/40 px-1">
                <span className="flex items-center gap-1">
                  <Sparkles size={11} className="text-amber-400" />
                  <span>Click any node for Philocrash Autopsy</span>
                </span>
                <span className="text-amber-300/80">θ = 0.18 Hold</span>
              </div>

              {/* Interactive SVG Pentagonal Tensor Topology */}
              <div className="relative w-full aspect-[4/3] max-h-[220px] bg-gradient-to-b from-[#0a0614]/80 to-black/80 rounded-xl border border-white/10 overflow-hidden p-2 flex items-center justify-center shadow-inner">
                {/* Subtle Cosmic Grid Background */}
                <div
                  className="absolute inset-0 opacity-20 pointer-events-none"
                  style={{
                    backgroundImage:
                      'radial-gradient(circle at 50% 50%, rgba(245,158,11,0.15) 0%, transparent 60%)'
                  }}
                />

                {/* Dynamic SVG Tension Arcs and Edges */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100">
                  {/* Orbital boundary ring */}
                  <circle
                    cx="50"
                    cy="50"
                    r="36"
                    fill="none"
                    stroke="rgba(255,255,255,0.06)"
                    strokeWidth="0.8"
                    strokeDasharray="2,2"
                  />

                  {/* Satellite Perimeter Connectors */}
                  {(() => {
                    const dPos = getNodePos('divergence', currentMap.metrics.find((x) => x.id === 'divergence')?.value ?? 0.5);
                    const dePos = getNodePos('density', currentMap.metrics.find((x) => x.id === 'density')?.value ?? 0.5);
                    const gPos = getNodePos('gap', currentMap.metrics.find((x) => x.id === 'gap')?.value ?? 0.5);
                    const aPos = getNodePos('apophatic', currentMap.metrics.find((x) => x.id === 'apophatic')?.value ?? 0.5);
                    return (
                      <polygon
                        points={`${dPos.cx},${dPos.cy} ${dePos.cx},${dePos.cy} ${gPos.cx},${gPos.cy} ${aPos.cx},${aPos.cy}`}
                        fill="none"
                        stroke="rgba(255,255,255,0.08)"
                        strokeWidth="0.8"
                        strokeDasharray="1.5,1.5"
                      />
                    );
                  })()}

                  {/* Radiating Differential Tensor Vectors (Center -> Satellites) */}
                  {['divergence', 'density', 'apophatic', 'gap'].map((id) => {
                    const m = currentMap.metrics.find((x) => x.id === id);
                    const pos = getNodePos(id, m ? m.value : 0.5);
                    const strokeCol = m ? m.color : '#888';
                    return (
                      <line
                        key={`radial-${id}`}
                        x1="50"
                        y1="50"
                        x2={pos.cx}
                        y2={pos.cy}
                        stroke={strokeCol}
                        strokeOpacity="0.4"
                        strokeWidth={m ? 0.8 + m.value * 0.9 : 0.8}
                        strokeDasharray={m && m.value > 0.5 ? 'none' : '1.5,1.5'}
                      />
                    );
                  })}
                </svg>

                {/* Interactive Clickable Nodes Layer with Spring Layout Transitions */}
                <div className="relative w-full h-full">
                  {currentMap.metrics.map((metric) => {
                    const pos = getNodePos(metric.id, metric.value);
                    const isCenter = metric.id === 'composite';

                    return (
                      <motion.button
                        layout
                        key={metric.id}
                        id={`topology-node-${metric.id}`}
                        onClick={() => handleOpenAutopsy(metric.id)}
                        initial={false}
                        animate={{
                          left: `${pos.cx}%`,
                          top: `${pos.cy}%`,
                          scale: 1
                        }}
                        transition={{
                          layout: { type: 'spring', stiffness: 220, damping: 24 },
                          left: { type: 'spring', stiffness: 200, damping: 25 },
                          top: { type: 'spring', stiffness: 200, damping: 25 }
                        }}
                        style={{
                          transform: 'translate(-50%, -50%)'
                        }}
                        className={`absolute group flex flex-col items-center justify-center transition-transform hover:scale-115 active:scale-95 focus:outline-none focus:ring-2 focus:ring-amber-400/80 rounded-full z-10 cursor-pointer`}
                        title={`Click to inspect Philocrash Autopsy for ${metric.label}`}
                        aria-label={`Open Philocrash autopsy for ${metric.label}`}
                      >
                        {/* Node Glowing Sphere Vertex */}
                        <div
                          className={`relative rounded-full flex items-center justify-center font-mono font-bold transition-all shadow-lg border ${
                            isCenter
                              ? 'w-11 h-11 text-xs'
                              : 'w-9 h-9 text-[11px]'
                          }`}
                          style={{
                            backgroundColor: `${metric.color}25`,
                            borderColor: metric.color,
                            color: '#fff',
                            boxShadow: `0 0 ${10 + metric.value * 18}px ${metric.color}60`
                          }}
                        >
                          {/* Orbiting halo pulse on high values */}
                          <div
                            className="absolute inset-0 rounded-full animate-ping opacity-25 pointer-events-none"
                            style={{ backgroundColor: metric.color }}
                          />
                          <span className="relative z-10">{metric.shortName}</span>
                        </div>

                        {/* Node Percentage Value Badge */}
                        <div
                          className="mt-1 px-1.5 py-0.2 rounded-full font-mono text-[9px] font-bold bg-black/85 border border-white/20 text-white/95 group-hover:border-amber-400 transition-colors shadow"
                        >
                          {(metric.value * 100).toFixed(0)}%
                        </div>

                        {/* Hover Callout Label with Autopsy Notice */}
                        <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap bg-black/95 text-white px-2 py-1 rounded text-[10px] font-mono border border-amber-500/40 shadow-xl -bottom-7 z-20">
                          <span className="text-amber-300 font-bold">{metric.label}</span>
                          <span className="text-white/40 ml-1.5">• Click for Autopsy</span>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Quick Summary Pill Bar of all 5 Metrics as Clickable Nodes */}
              <div className="grid grid-cols-5 gap-1 pt-1 font-mono text-[10px]">
                {currentMap.metrics.map((m) => (
                  <button
                    key={`mini-${m.id}`}
                    onClick={() => handleOpenAutopsy(m.id)}
                    className="p-1 rounded bg-white/[0.03] hover:bg-white/10 border border-white/5 hover:border-amber-500/40 text-center transition-all group cursor-pointer"
                    title={`Inspect Philocrash Autopsy for ${m.label}`}
                  >
                    <div className="text-white/50 group-hover:text-amber-300 truncate">
                      {m.shortName}
                    </div>
                    <div className="font-bold text-white text-[11px]">
                      {(m.value * 100).toFixed(0)}%
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* View Mode 2: Interactive Metric Node Cards with Active Layout Transitions */}
          {viewMode === 'bars' && (
            <motion.div
              key="view-bars"
              layout
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.18 }}
              id="visual-disparity-metrics-bars"
              className="flex-1 overflow-y-auto space-y-2 pr-0.5"
            >
              {/* Composite Overall Node Card with Clickable Autopsy Trigger */}
              <motion.button
                layout
                onClick={() => handleOpenAutopsy('composite')}
                className="w-full text-left p-2.5 rounded-xl bg-gradient-to-r from-amber-950/25 via-black/50 to-violet-950/25 border border-white/10 hover:border-amber-500/50 transition-all flex items-center justify-between group cursor-pointer shadow-sm hover:shadow-[0_0_12px_rgba(245,158,11,0.15)]"
                transition={{ layout: { type: 'spring', stiffness: 220, damping: 24 } }}
                title="Click to inspect Philocrash Autopsy for Composite Disparity Index"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    {/* Glowing Vertex Orb */}
                    <span className="w-4 h-4 rounded-full bg-amber-500/20 border border-amber-400 flex items-center justify-center text-[8px] font-mono font-bold text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.5)]">
                      Δ
                    </span>
                    <span className="text-[10px] font-mono uppercase text-white/50 tracking-wider group-hover:text-amber-300 transition-colors">
                      Composite Disparity (Δtotal) • Node
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-base font-bold text-amber-300 font-mono">
                      {currentMap.disparity.toFixed(2)}
                    </span>
                    {previousMap && (
                      <motion.span
                        layout
                        key={`delta-${currentMap.id}`}
                        initial={{ opacity: 0, y: -3 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`text-[10px] font-mono px-1 rounded ${
                          currentMap.disparity >= previousMap.disparity
                            ? 'text-amber-400 bg-amber-500/10'
                            : 'text-emerald-400 bg-emerald-500/10'
                        }`}
                      >
                        {currentMap.disparity >= previousMap.disparity ? '+' : ''}
                        {(currentMap.disparity - previousMap.disparity).toFixed(2)} vs prev
                      </motion.span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-mono px-2 py-1 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 group-hover:bg-amber-500/20 transition-all flex items-center gap-1">
                    <Scale size={10} />
                    <span>Autopsy</span>
                  </span>
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      setSortByValue(!sortByValue);
                    }}
                    className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-white/40 hover:text-white border border-white/5 transition-colors"
                    title="Toggle sort nodes by value (Val) or topology (Topo)"
                  >
                    {sortByValue ? 'Val' : 'Topo'}
                  </span>
                </div>
              </motion.button>

              {/* Animated Interactive Metric Nodes List with Preserved Layout Transitions */}
              <motion.div layout className="space-y-1.5">
                {displayMetrics.map((metric) => {
                  const prevMetric = previousMap?.metrics.find((m) => m.id === metric.id);
                  const delta = prevMetric ? metric.value - prevMetric.value : 0;

                  return (
                    <motion.button
                      layout
                      key={metric.id}
                      id={`metric-node-row-${metric.id}`}
                      onClick={() => handleOpenAutopsy(metric.id)}
                      className="w-full text-left p-2 rounded-lg bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 hover:border-amber-500/30 transition-colors space-y-1 group cursor-pointer"
                      transition={{
                        layout: { type: 'spring', stiffness: 220, damping: 24 }
                      }}
                      title={`Click to open Philocrash Autopsy for ${metric.label}`}
                    >
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <div className="flex items-center gap-1.5 truncate max-w-[210px]">
                          {/* Glowing Interactive Node Glyph */}
                          <span
                            className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 border shadow-sm transition-transform group-hover:scale-110"
                            style={{
                              backgroundColor: `${metric.color}20`,
                              borderColor: `${metric.color}80`,
                              color: metric.color,
                              boxShadow: `0 0 6px ${metric.color}40`
                            }}
                          >
                            {metric.shortName.slice(0, 2)}
                          </span>
                          <span className="text-white/80 group-hover:text-amber-200 transition-colors truncate">
                            {metric.label}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {prevMetric && Math.abs(delta) > 0.001 && (
                            <motion.span
                              layout
                              key={`delta-${metric.id}-${currentMap.id}`}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className={`text-[9px] ${
                                delta > 0 ? 'text-amber-400' : 'text-emerald-400'
                              }`}
                            >
                              {delta > 0 ? '↑' : '↓'}
                              {Math.abs(delta).toFixed(2)}
                            </motion.span>
                          )}
                          <span className="font-bold text-white font-mono">
                            {(metric.value * 100).toFixed(0)}%
                          </span>
                          <ChevronRight
                            size={11}
                            className="text-white/20 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all"
                          />
                        </div>
                      </div>

                      {/* Tensor Progress Track with Fluid Motion Layout Bar */}
                      <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden relative shadow-inner">
                        <motion.div
                          layout
                          className={`h-full rounded-full bg-gradient-to-r ${metric.bgGradient}`}
                          initial={false}
                          animate={{
                            width: `${Math.max(5, metric.value * 100)}%`
                          }}
                          transition={{
                            layout: { type: 'spring', stiffness: 220, damping: 24 },
                            width: { type: 'spring', stiffness: 180, damping: 22, mass: 0.8 }
                          }}
                        />
                      </div>
                    </motion.button>
                  );
                })}
              </motion.div>
            </motion.div>
          )}

          {/* View Mode 3: Recharts Comparison Curve */}
          {viewMode === 'curve' && (
            <motion.div
              key="view-curve"
              layout
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.18 }}
              className="flex-1 min-h-[140px] w-full relative pt-1"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineChartData} margin={{ top: 5, right: 5, bottom: 5, left: -25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.2)" fontSize={8} tickMargin={5} />
                  <YAxis stroke="rgba(255,255,255,0.2)" fontSize={8} domain={[0, 1]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(5,3,10,0.95)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: '8px',
                      fontSize: '10px'
                    }}
                    itemStyle={{ color: '#F59E0B' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="disparity"
                    stroke="#F59E0B"
                    strokeWidth={2}
                    dot={{ fill: '#F59E0B', r: 3 }}
                    activeDot={{ r: 5, onClick: () => handleOpenAutopsy('composite') }}
                  />
                </LineChart>
              </ResponsiveContainer>
              <div className="text-center text-[9px] font-mono text-white/40 mt-1">
                Click active dot or switch to Nodes/Bars view to autopsy specific metrics
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Subtext with Philocrash Autopsy Trigger */}
        <div className="pt-2 mt-2 border-t border-white/5 flex items-center justify-between text-[9px] font-mono text-white/35">
          <button
            onClick={() => handleOpenAutopsy('composite')}
            className="hover:text-amber-300 transition-colors flex items-center gap-1 text-left truncate cursor-pointer"
          >
            <Scale size={10} className="text-amber-400" />
            <span>Philocrash Contradiction Autopsy</span>
          </button>
          <span className="text-amber-400/80 shrink-0">θ = 0.18 Hold</span>
        </div>
      </div>

      {/* Philocrash Metric Autopsy Modal */}
      <PhilocrashAutopsyModal
        isOpen={isAutopsyOpen}
        onClose={() => setIsAutopsyOpen(false)}
        metricId={autopsyMetricId}
        currentMap={currentMap}
        onSelectMetric={(id) => setAutopsyMetricId(id)}
        onSelectGraphNode={onSelectGraphNode}
      />
    </>
  );
};

// Export alias for direct VisualDisparityIndex naming
export const VisualDisparityIndex = DisparityHistoryChart;
