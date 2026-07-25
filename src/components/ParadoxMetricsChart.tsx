import React, { useMemo, useState } from 'react';
import { ParadoxSynthesis } from '../types';
import { getParadoxMetrics } from '../utils/apophaticEngine';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  ComposedChart,
  Bar,
  Line,
  Cell
} from 'recharts';
import { Activity, Sparkles, Scale, ShieldCheck, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ParadoxMetricsChartProps {
  synthesisHistory: ParadoxSynthesis[];
  sampleParadoxes?: ParadoxSynthesis[];
}

// Default sample fallback paradoxes if synthesisHistory is empty
const DEFAULT_SAMPLES: ParadoxSynthesis[] = [
  {
    id: 'sample_1',
    nodeAId: 'void',
    nodeBId: 'nihil',
    nodeALabel: 'The Absolute Void',
    nodeBLabel: 'Active Nihil',
    thesis: 'The Void is uncreated stillness beyond form or predicate.',
    antithesis: 'Active Nihil is dynamic negation that actively purges fixed beliefs.',
    synthesis: 'The Void acts through Active Nihil; stillness and negation are two faces of unconditioned presence.',
    timestamp: new Date().toISOString(),
    complexity: 88,
    synthesizedTruth: 94
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
    timestamp: new Date().toISOString(),
    complexity: 72,
    synthesizedTruth: 85
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
    timestamp: new Date().toISOString(),
    complexity: 94,
    synthesizedTruth: 98
  },
  {
    id: 'sample_4',
    nodeAId: 'apophasis',
    nodeBId: 'detachment',
    nodeALabel: 'Apophatic Silence',
    nodeBLabel: 'Abyssal Gelassenheit',
    thesis: 'Apophatic silence negates words to honor the unknowable.',
    antithesis: 'Gelassenheit releases desire and self-will.',
    synthesis: 'Wordless silence and selfless surrender merge into primordial stillness.',
    timestamp: new Date().toISOString(),
    complexity: 64,
    synthesizedTruth: 89
  }
];

export const ParadoxMetricsChart: React.FC<ParadoxMetricsChartProps> = ({
  synthesisHistory,
  sampleParadoxes = DEFAULT_SAMPLES
}) => {
  const [selectedPoint, setSelectedPoint] = useState<any | null>(null);
  const [chartMode, setChartMode] = useState<'scatter' | 'composed'>('scatter');

  // Prepare combined dataset
  const chartData = useMemo(() => {
    const rawList = synthesisHistory.length > 0 ? synthesisHistory : sampleParadoxes;
    return rawList.map((item) => {
      const { complexity, synthesizedTruth } = getParadoxMetrics(item);
      const pairLabel = `${item.nodeALabel} ⊗ ${item.nodeBLabel}`;
      return {
        ...item,
        pairLabel,
        shortPair: `${item.nodeALabel.split(' ')[0]} ⊗ ${item.nodeBLabel.split(' ')[0]}`,
        complexity,
        synthesizedTruth,
        frictionRatio: Number((synthesizedTruth / (complexity || 1)).toFixed(2)),
        dateStr: new Date(item.timestamp).toLocaleDateString()
      };
    });
  }, [synthesisHistory, sampleParadoxes]);

  // Key KPI metrics
  const stats = useMemo(() => {
    if (chartData.length === 0) {
      return { avgComplexity: 0, avgTruth: 0, total: 0, topPair: 'N/A' };
    }
    const sumComp = chartData.reduce((acc, curr) => acc + curr.complexity, 0);
    const sumTruth = chartData.reduce((acc, curr) => acc + curr.synthesizedTruth, 0);
    const avgComplexity = Math.round(sumComp / chartData.length);
    const avgTruth = Math.round(sumTruth / chartData.length);
    const topItem = [...chartData].sort((a, b) => b.synthesizedTruth - a.synthesizedTruth)[0];

    return {
      avgComplexity,
      avgTruth,
      total: chartData.length,
      topPair: topItem ? topItem.pairLabel : 'N/A'
    };
  }, [chartData]);

  // Custom Scatter Tooltip
  const CustomScatterTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-neutral-950/95 border border-amber-500/30 p-3.5 rounded-xl shadow-2xl max-w-xs backdrop-blur-md text-xs font-sans text-neutral-200 flex flex-col gap-2">
          <div className="flex items-center justify-between border-b border-neutral-850 pb-1.5">
            <span className="font-mono text-[10px] text-amber-400 font-semibold tracking-wider uppercase">
              {data.pairLabel}
            </span>
            <span className="text-[9px] font-mono text-neutral-500">{data.dateStr}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono bg-neutral-900/60 p-2 rounded-lg border border-neutral-850">
            <div>
              <span className="text-neutral-500 block">Complexity:</span>
              <span className="text-indigo-400 font-bold">{data.complexity}%</span>
            </div>
            <div>
              <span className="text-neutral-500 block">Synthesized Truth:</span>
              <span className="text-amber-400 font-bold">{data.synthesizedTruth}%</span>
            </div>
          </div>
          <p className="text-[10px] text-neutral-400 italic line-clamp-3 leading-relaxed font-serif">
            "{data.synthesis}"
          </p>
          <span className="text-[9px] font-mono text-neutral-500 text-right">Click point for detailed breakdown</span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col gap-6 bg-neutral-950 border border-neutral-900 rounded-2xl p-6 abyssal-glow">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-900 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-amber-400 animate-pulse" />
            <h3 className="font-display text-sm font-semibold tracking-wider text-neutral-200 uppercase">
              Paradox Metrics Engine
            </h3>
            <span className="text-[9px] font-mono bg-amber-950/50 text-amber-400 border border-amber-800/60 px-2 py-0.5 rounded-full">
              Recharts Visualizer
            </span>
          </div>
          <p className="text-xs text-neutral-400 font-sans mt-1">
            Mapping cognitive friction (Paradox Complexity) against apophatic clarity (Synthesized Truth Index).
          </p>
        </div>

        {/* View Mode Switches */}
        <div className="flex items-center gap-2 bg-black border border-neutral-900 p-1 rounded-xl">
          <button
            onClick={() => setChartMode('scatter')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer ${
              chartMode === 'scatter'
                ? 'bg-amber-500/20 border border-amber-500/50 text-amber-300 font-semibold shadow-sm'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Scatter Plot (X/Y)</span>
          </button>
          <button
            onClick={() => setChartMode('composed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer ${
              chartMode === 'composed'
                ? 'bg-amber-500/20 border border-amber-500/50 text-amber-300 font-semibold shadow-sm'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Dual Index Bar & Line</span>
          </button>
        </div>
      </div>

      {/* Metric KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-neutral-900/40 border border-neutral-900 p-3.5 rounded-xl flex flex-col gap-1">
          <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest flex items-center gap-1">
            <Flame className="w-3 h-3 text-indigo-400" />
            Avg Complexity
          </span>
          <span className="text-xl font-mono font-bold text-indigo-300">{stats.avgComplexity}%</span>
          <span className="text-[9px] text-neutral-600 font-sans">Cognitive Dialectic Friction</span>
        </div>

        <div className="bg-neutral-900/40 border border-neutral-900 p-3.5 rounded-xl flex flex-col gap-1">
          <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-amber-400" />
            Avg Synthesized Truth
          </span>
          <span className="text-xl font-mono font-bold text-amber-300">{stats.avgTruth}%</span>
          <span className="text-[9px] text-neutral-600 font-sans">Apophatic Resolution Quotient</span>
        </div>

        <div className="bg-neutral-900/40 border border-neutral-900 p-3.5 rounded-xl flex flex-col gap-1">
          <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest">
            Total Syntheses
          </span>
          <span className="text-xl font-mono font-bold text-neutral-200">{stats.total}</span>
          <span className="text-[9px] text-neutral-600 font-sans">
            {synthesisHistory.length === 0 ? 'Sample Dataset Loaded' : 'Archived Paradoxes'}
          </span>
        </div>

        <div className="bg-neutral-900/40 border border-neutral-900 p-3.5 rounded-xl flex flex-col gap-1 overflow-hidden">
          <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest">
            Zenith Resolution
          </span>
          <span className="text-xs font-mono font-semibold text-emerald-400 truncate mt-1">
            {stats.topPair}
          </span>
          <span className="text-[9px] text-neutral-600 font-sans">Highest Truth Score</span>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="bg-black/80 border border-neutral-900 rounded-xl p-4 min-h-[360px] relative">
        {synthesisHistory.length === 0 && (
          <div className="mb-3 px-3 py-1.5 bg-neutral-900/80 border border-neutral-800 rounded-lg text-[10px] font-mono text-amber-400/90 flex items-center justify-between">
            <span>Displaying pre-compiled paradox metrics (Synthesize user paradoxes to build custom dataset).</span>
            <span className="text-neutral-500">Live Engine Ready</span>
          </div>
        )}

        <div className="w-full h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            {chartMode === 'scatter' ? (
              <ScatterChart margin={{ top: 20, right: 30, bottom: 25, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                <XAxis
                  type="number"
                  dataKey="complexity"
                  name="Paradox Complexity"
                  unit="%"
                  domain={[40, 100]}
                  stroke="#737373"
                  tick={{ fontSize: 10, fill: '#a3a3a3' }}
                  label={{
                    value: 'Paradox Complexity (Friction %)',
                    position: 'insideBottom',
                    offset: -12,
                    fill: '#888',
                    fontSize: 10,
                    fontFamily: 'monospace'
                  }}
                />
                <YAxis
                  type="number"
                  dataKey="synthesizedTruth"
                  name="Synthesized Truth"
                  unit="%"
                  domain={[40, 100]}
                  stroke="#737373"
                  tick={{ fontSize: 10, fill: '#a3a3a3' }}
                  label={{
                    value: 'Synthesized Truth Index (%)',
                    angle: -90,
                    position: 'insideLeft',
                    offset: 10,
                    fill: '#888',
                    fontSize: 10,
                    fontFamily: 'monospace'
                  }}
                />
                <ZAxis type="number" dataKey="complexity" range={[120, 450]} />
                <Tooltip content={<CustomScatterTooltip />} />
                <ReferenceLine x={70} stroke="#404040" strokeDasharray="3 3" />
                <ReferenceLine y={75} stroke="#404040" strokeDasharray="3 3" />
                <Scatter
                  name="Paradox Syntheses"
                  data={chartData}
                  onClick={(entry) => setSelectedPoint(entry)}
                  cursor="pointer"
                >
                  {chartData.map((entry, index) => {
                    const isHighTruth = entry.synthesizedTruth >= 85;
                    return (
                      <Cell
                        key={`cell-${index}`}
                        fill={isHighTruth ? '#f59e0b' : '#818cf8'}
                        stroke={isHighTruth ? '#fbbf24' : '#a5b4fc'}
                        strokeWidth={2}
                      />
                    );
                  })}
                </Scatter>
              </ScatterChart>
            ) : (
              <ComposedChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 40 }}>
                <CartesianGrid strokeDasharray="2 2" stroke="#1f1f1f" />
                <XAxis
                  dataKey="shortPair"
                  stroke="#737373"
                  tick={{ fontSize: 9, fill: '#a3a3a3' }}
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                />
                <YAxis domain={[0, 100]} stroke="#737373" tick={{ fontSize: 10, fill: '#a3a3a3' }} />
                <Tooltip content={<CustomScatterTooltip />} />
                <Bar
                  dataKey="complexity"
                  name="Paradox Complexity"
                  fill="#4f46e5"
                  radius={[4, 4, 0, 0]}
                  opacity={0.7}
                  onClick={(entry) => setSelectedPoint(entry)}
                  cursor="pointer"
                />
                <Line
                  type="monotone"
                  dataKey="synthesizedTruth"
                  name="Synthesized Truth"
                  stroke="#f59e0b"
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#f59e0b', stroke: '#fff', strokeWidth: 1.5 }}
                />
              </ComposedChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Selected Point Detailed Breakdown Modal / Inspector */}
      <AnimatePresence>
        {selectedPoint && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="bg-neutral-900/90 border border-amber-500/40 rounded-xl p-5 flex flex-col gap-3"
          >
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400" />
                <h4 className="font-mono text-xs font-bold text-amber-300">
                  Detailed Metric Inspection: {selectedPoint.pairLabel}
                </h4>
              </div>
              <button
                onClick={() => setSelectedPoint(null)}
                className="text-xs font-mono text-neutral-500 hover:text-neutral-200 cursor-pointer"
              >
                Close Inspection
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="bg-black p-3 rounded-lg border border-neutral-850 flex flex-col gap-1">
                <span className="text-[10px] font-mono text-neutral-500">THESIS CLAIM ({selectedPoint.nodeALabel})</span>
                <p className="text-neutral-300 leading-relaxed font-sans">{selectedPoint.thesis}</p>
              </div>

              <div className="bg-black p-3 rounded-lg border border-neutral-850 flex flex-col gap-1">
                <span className="text-[10px] font-mono text-neutral-500">ANTITHESIS CLAIM ({selectedPoint.nodeBLabel})</span>
                <p className="text-neutral-300 leading-relaxed font-sans">{selectedPoint.antithesis}</p>
              </div>
            </div>

            <div className="bg-amber-950/20 border border-amber-900/40 p-3 rounded-lg">
              <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest block mb-1">
                APOPHATIC SYNTHESIS GROUND
              </span>
              <p className="text-xs text-neutral-200 font-serif italic leading-relaxed">
                "{selectedPoint.synthesis}"
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
