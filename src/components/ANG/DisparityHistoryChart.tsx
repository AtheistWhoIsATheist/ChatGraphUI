import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, ChevronLeft, ChevronRight, Play, Pause, BarChart2, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';

export interface MapComparisonData {
  id: string;
  name: string;
  comparisonLabel: string;
  epoch: string;
  disparity: number;
  metrics: {
    id: string;
    label: string;
    shortName: string;
    value: number;
    color: string;
    bgGradient: string;
    description: string;
  }[];
}

export const MAP_COMPARISON_DATASETS: MapComparisonData[] = [
  {
    id: 'map-1',
    name: '/map 1',
    comparisonLabel: 'Axiomatic Baseline (Nishitani ↔ Nagarjuna)',
    epoch: 'Δ0 Origin',
    disparity: 0.12,
    metrics: [
      { id: 'composite', label: 'Composite Disparity Index', shortName: 'Δtotal', value: 0.12, color: '#F59E0B', bgGradient: 'from-amber-500 to-amber-600', description: 'Total variance across ontological tensor' },
      { id: 'divergence', label: 'Topological Divergence', shortName: 'Δλ', value: 0.16, color: '#8B5CF6', bgGradient: 'from-violet-500 to-indigo-600', description: 'Eigenvalue drift between anchor vertices' },
      { id: 'density', label: 'Ontological Density', shortName: 'ρonto', value: 0.84, color: '#06B6D4', bgGradient: 'from-cyan-500 to-blue-600', description: 'Degree of conceptual reification' },
      { id: 'apophatic', label: 'Apophatic Tension', shortName: 'θapoph', value: 0.10, color: '#10B981', bgGradient: 'from-emerald-500 to-teal-600', description: 'Boundary resistance against affirmation' },
      { id: 'gap', label: 'Phenomenological Gap', shortName: 'δgap', value: 0.15, color: '#EC4899', bgGradient: 'from-pink-500 to-rose-600', description: 'Subject-object dissolution distance' }
    ]
  },
  {
    id: 'map-2',
    name: '/map 2',
    comparisonLabel: 'Subtractive Vector (Meister Eckhart Ingestion)',
    epoch: 'Δ1 Vector',
    disparity: 0.28,
    metrics: [
      { id: 'composite', label: 'Composite Disparity Index', shortName: 'Δtotal', value: 0.28, color: '#F59E0B', bgGradient: 'from-amber-500 to-amber-600', description: 'Total variance across ontological tensor' },
      { id: 'divergence', label: 'Topological Divergence', shortName: 'Δλ', value: 0.35, color: '#8B5CF6', bgGradient: 'from-violet-500 to-indigo-600', description: 'Eigenvalue drift between anchor vertices' },
      { id: 'density', label: 'Ontological Density', shortName: 'ρonto', value: 0.71, color: '#06B6D4', bgGradient: 'from-cyan-500 to-blue-600', description: 'Degree of conceptual reification' },
      { id: 'apophatic', label: 'Apophatic Tension', shortName: 'θapoph', value: 0.26, color: '#10B981', bgGradient: 'from-emerald-500 to-teal-600', description: 'Boundary resistance against affirmation' },
      { id: 'gap', label: 'Phenomenological Gap', shortName: 'δgap', value: 0.31, color: '#EC4899', bgGradient: 'from-pink-500 to-rose-600', description: 'Subject-object dissolution distance' }
    ]
  },
  {
    id: 'map-3',
    name: '/map 3',
    comparisonLabel: 'Dialectic Singularity (Cioran Abyss Encounter)',
    epoch: 'Δ2 Rift',
    disparity: 0.45,
    metrics: [
      { id: 'composite', label: 'Composite Disparity Index', shortName: 'Δtotal', value: 0.45, color: '#F59E0B', bgGradient: 'from-amber-500 to-amber-600', description: 'Total variance across ontological tensor' },
      { id: 'divergence', label: 'Topological Divergence', shortName: 'Δλ', value: 0.52, color: '#8B5CF6', bgGradient: 'from-violet-500 to-indigo-600', description: 'Eigenvalue drift between anchor vertices' },
      { id: 'density', label: 'Ontological Density', shortName: 'ρonto', value: 0.54, color: '#06B6D4', bgGradient: 'from-cyan-500 to-blue-600', description: 'Degree of conceptual reification' },
      { id: 'apophatic', label: 'Apophatic Tension', shortName: 'θapoph', value: 0.42, color: '#10B981', bgGradient: 'from-emerald-500 to-teal-600', description: 'Boundary resistance against affirmation' },
      { id: 'gap', label: 'Phenomenological Gap', shortName: 'δgap', value: 0.49, color: '#EC4899', bgGradient: 'from-pink-500 to-rose-600', description: 'Subject-object dissolution distance' }
    ]
  },
  {
    id: 'map-4',
    name: '/map 4',
    comparisonLabel: 'Apophatic Compression (Camus Absurd Reduction)',
    epoch: 'Δ3 Compression',
    disparity: 0.38,
    metrics: [
      { id: 'composite', label: 'Composite Disparity Index', shortName: 'Δtotal', value: 0.38, color: '#F59E0B', bgGradient: 'from-amber-500 to-amber-600', description: 'Total variance across ontological tensor' },
      { id: 'divergence', label: 'Topological Divergence', shortName: 'Δλ', value: 0.44, color: '#8B5CF6', bgGradient: 'from-violet-500 to-indigo-600', description: 'Eigenvalue drift between anchor vertices' },
      { id: 'density', label: 'Ontological Density', shortName: 'ρonto', value: 0.63, color: '#06B6D4', bgGradient: 'from-cyan-500 to-blue-600', description: 'Degree of conceptual reification' },
      { id: 'apophatic', label: 'Apophatic Tension', shortName: 'θapoph', value: 0.35, color: '#10B981', bgGradient: 'from-emerald-500 to-teal-600', description: 'Boundary resistance against affirmation' },
      { id: 'gap', label: 'Phenomenological Gap', shortName: 'δgap', value: 0.40, color: '#EC4899', bgGradient: 'from-pink-500 to-rose-600', description: 'Subject-object dissolution distance' }
    ]
  },
  {
    id: 'map-5',
    name: '/map 5',
    comparisonLabel: 'Epoché Horizon (Pyrrhonian Suspension)',
    epoch: 'Δ4 Horizon',
    disparity: 0.65,
    metrics: [
      { id: 'composite', label: 'Composite Disparity Index', shortName: 'Δtotal', value: 0.65, color: '#F59E0B', bgGradient: 'from-amber-500 to-amber-600', description: 'Total variance across ontological tensor' },
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
}

export const DisparityHistoryChart: React.FC<DisparityProps> = ({
  className = '',
  defaultMapIndex = 2,
  onMapChange,
  compact = false
}) => {
  const [activeMapIndex, setActiveMapIndex] = useState<number>(defaultMapIndex);
  const [viewMode, setViewMode] = useState<'bars' | 'curve'>('bars');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [sortByValue, setSortByValue] = useState<boolean>(false);

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

  // Recharts line chart data mapping
  const lineChartData = MAP_COMPARISON_DATASETS.map((m) => ({
    name: m.name,
    disparity: m.disparity
  }));

  // Sort metrics if requested
  const displayMetrics = sortByValue
    ? [...currentMap.metrics].sort((a, b) => b.value - a.value)
    : currentMap.metrics;

  return (
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

        {/* View Switcher & Auto-Play Buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`p-1 rounded text-[10px] transition-colors border ${
              isPlaying
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'text-white/40 hover:text-white border-transparent'
            }`}
            title={isPlaying ? 'Pause Auto Comparison Cycle' : 'Auto Play /map Comparison Cycle'}
            aria-label="Toggle auto comparison play"
          >
            {isPlaying ? <Pause size={12} /> : <Play size={12} />}
          </button>

          <button
            onClick={() => setViewMode(viewMode === 'bars' ? 'curve' : 'bars')}
            className="p-1 rounded text-white/40 hover:text-white transition-colors"
            title={viewMode === 'bars' ? 'View Line Chart' : 'View Metrics Bars'}
            aria-label="Switch view mode"
          >
            {viewMode === 'bars' ? <TrendingUp size={12} /> : <BarChart2 size={12} />}
          </button>
        </div>
      </div>

      {/* Interactive /map Comparison Selector Strip */}
      <div className="flex items-center justify-between gap-1 mb-3 bg-white/[0.03] p-1 rounded-lg border border-white/5">
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
                className={`px-2 py-0.5 rounded text-[10px] font-mono transition-all relative ${
                  isSelected
                    ? 'bg-amber-500/25 text-amber-200 font-bold border border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.25)]'
                    : 'text-white/50 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
                title={`Select ${m.name} comparison: ${m.comparisonLabel}`}
              >
                {m.name}
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

      {/* Main Content Area */}
      {viewMode === 'bars' ? (
        /* METRICS BARS WITH FLUID MOTION/REACT LAYOUT ANIMATION */
        <div id="visual-disparity-metrics-bars" className="flex-1 overflow-y-auto space-y-2.5 pr-0.5">
          {/* Composite Top Gauge */}
          <div className="p-2 rounded-xl bg-gradient-to-r from-amber-950/20 via-black/40 to-violet-950/20 border border-white/10 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono uppercase text-white/50 tracking-wider">
                Overall Index (Δ)
              </span>
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

            <button
              onClick={() => setSortByValue(!sortByValue)}
              className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-white/40 hover:text-white border border-white/5 transition-colors"
              title="Toggle sort bars by value"
            >
              {sortByValue ? 'Ordered: Val' : 'Ordered: Topo'}
            </button>
          </div>

          {/* Animated Metrics Bars List */}
          <motion.div layout className="space-y-2">
            {displayMetrics.map((metric) => {
              const prevMetric = previousMap?.metrics.find((m) => m.id === metric.id);
              const delta = prevMetric ? metric.value - prevMetric.value : 0;

              return (
                <motion.div
                  layout
                  key={metric.id}
                  id={`metric-row-${metric.id}`}
                  className="space-y-1 group"
                  transition={{
                    layout: { type: 'spring', stiffness: 220, damping: 24 }
                  }}
                >
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-white/70 group-hover:text-white transition-colors truncate max-w-[190px]">
                      {metric.label}
                    </span>

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
                    </div>
                  </div>

                  {/* Progress Track with Fluid Motion Layout Bar */}
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden relative shadow-inner">
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
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      ) : (
        /* RECHARTS COMPARISON CURVE */
        <div className="flex-1 min-h-[140px] w-full relative pt-1">
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
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Footer Subtext */}
      <div className="pt-2 mt-2 border-t border-white/5 flex items-center justify-between text-[9px] font-mono text-white/35">
        <span className="truncate">Consecutive /map comparison tensor</span>
        <span className="text-amber-400/80">θ = 0.18 Hold</span>
      </div>
    </div>
  );
};

// Export alias for direct VisualDisparityIndex naming
export const VisualDisparityIndex = DisparityHistoryChart;
