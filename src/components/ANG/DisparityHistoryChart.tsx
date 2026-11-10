import React, { useState, useEffect, useMemo } from 'react';
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
  Split,
  Plus,
  Zap,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PhilocrashAutopsyModal } from './PhilocrashAutopsyModal';
import { PHILOCRASH_METRIC_PROFILES, getDifferentialPairwiseProfile } from '../../data/philocrashAutopsyData';
import { NoteDocument } from '../Nihiltheism/types';

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
  isCustom?: boolean;
}

export const BASE_MAP_COMPARISON_DATASETS: MapComparisonData[] = [
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
  vaultNotesCount?: number;
  activeAporiasCount?: number;
  dialecticMessagesCount?: number;
  boundaryTheta?: number;
  onCommitToVault?: (note: NoteDocument) => void;
  onOpenNote?: (noteId: string) => void;
}

export const DisparityHistoryChart: React.FC<DisparityProps> = ({
  className = '',
  defaultMapIndex = 2,
  onMapChange,
  compact = false,
  onSelectGraphNode,
  vaultNotesCount = 12,
  activeAporiasCount = 4,
  dialecticMessagesCount = 8,
  boundaryTheta = 0.18,
  onCommitToVault,
  onOpenNote
}) => {
  const [activeMapIndex, setActiveMapIndex] = useState<number>(defaultMapIndex);
  const [viewMode, setViewMode] = useState<'nodes' | 'bars' | 'curve'>('nodes');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [sortByValue, setSortByValue] = useState<boolean>(false);

  // Multi-Node Comparison Mode
  const [isCompareMode, setIsCompareMode] = useState<boolean>(false);
  const [selectedMetricIds, setSelectedMetricIds] = useState<string[]>(['apophatic', 'density']);

  // Custom Map Snapshots stored in state / localStorage
  const [customSnapshots, setCustomSnapshots] = useState<MapComparisonData[]>(() => {
    try {
      const saved = localStorage.getItem('nihiltheism_custom_snapshots');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // ignore
    }
    return [];
  });

  const [isSnapshotModalOpen, setIsSnapshotModalOpen] = useState<boolean>(false);
  const [snapshotLabel, setSnapshotLabel] = useState<string>('');

  // Philocrash Autopsy Modal state
  const [autopsyMetricId, setAutopsyMetricId] = useState<string | null>(null);
  const [autopsyCompareMetricId, setAutopsyCompareMetricId] = useState<string | null>(null);
  const [isAutopsyOpen, setIsAutopsyOpen] = useState<boolean>(false);

  // Dynamic Live Map from Vault State
  const liveVaultMap: MapComparisonData = useMemo(() => {
    const rawComposite = Math.min(0.35 + (activeAporiasCount * 0.08) + (dialecticMessagesCount * 0.02), 0.95);
    const rawDivergence = Math.min(0.40 + (activeAporiasCount * 0.1), 0.96);
    const rawDensity = Math.max(0.65 - (vaultNotesCount * 0.03), 0.14);
    const rawApophatic = Math.min(0.40 + (boundaryTheta * 1.8), 0.94);
    const rawGap = Math.min(0.45 + (dialecticMessagesCount * 0.04), 0.92);

    return {
      id: 'map-live',
      name: '/map Live',
      comparisonLabel: `Live Vault Reactive State (${vaultNotesCount} notes, ${activeAporiasCount} aporias)`,
      epoch: 'Vault Realtime',
      disparity: parseFloat(rawComposite.toFixed(2)),
      metrics: [
        { id: 'composite', label: 'Composite Disparity Index', shortName: 'Δtotal', value: parseFloat(rawComposite.toFixed(2)), color: '#F59E0B', bgGradient: 'from-amber-500 to-amber-600', description: 'Live aggregate variance across user vault' },
        { id: 'divergence', label: 'Topological Divergence', shortName: 'Δλ', value: parseFloat(rawDivergence.toFixed(2)), color: '#8B5CF6', bgGradient: 'from-violet-500 to-indigo-600', description: 'Dynamic eigenvalue drift from aporia registry' },
        { id: 'density', label: 'Ontological Density', shortName: 'ρonto', value: parseFloat(rawDensity.toFixed(2)), color: '#06B6D4', bgGradient: 'from-cyan-500 to-blue-600', description: 'De-reification index of conceptual notes' },
        { id: 'apophatic', label: 'Apophatic Tension', shortName: 'θapoph', value: parseFloat(rawApophatic.toFixed(2)), color: '#10B981', bgGradient: 'from-emerald-500 to-teal-600', description: 'Boundary resistance against dogmatic closure' },
        { id: 'gap', label: 'Phenomenological Gap', shortName: 'δgap', value: parseFloat(rawGap.toFixed(2)), color: '#EC4899', bgGradient: 'from-pink-500 to-rose-600', description: 'Subject-object dissolution distance in dialogue' }
      ]
    };
  }, [vaultNotesCount, activeAporiasCount, dialecticMessagesCount, boundaryTheta]);

  // Combined Dataset list (/map 1 .. /map 6, /map Live, plus custom snapshots)
  const allDatasets = useMemo(() => {
    return [...BASE_MAP_COMPARISON_DATASETS, liveVaultMap, ...customSnapshots];
  }, [liveVaultMap, customSnapshots]);

  // Auto-play animation cycle across datasets
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setActiveMapIndex((prev) => (prev + 1) % allDatasets.length);
    }, 2500);
    return () => clearInterval(timer);
  }, [isPlaying, allDatasets.length]);

  const currentMap = allDatasets[activeMapIndex] || allDatasets[0];
  const previousMap = activeMapIndex > 0 ? allDatasets[activeMapIndex - 1] : null;
  const twoStepsBackMap = activeMapIndex > 1 ? allDatasets[activeMapIndex - 2] : null;

  const handleSelectMap = (idx: number) => {
    setActiveMapIndex(idx);
    onMapChange?.(allDatasets[idx]?.name || `/map ${idx + 1}`);
  };

  const handlePrev = () => {
    const newIdx = (activeMapIndex - 1 + allDatasets.length) % allDatasets.length;
    handleSelectMap(newIdx);
  };

  const handleNext = () => {
    const newIdx = (activeMapIndex + 1) % allDatasets.length;
    handleSelectMap(newIdx);
  };

  // Node Click handler: if in compare mode (or Shift clicked), select for comparison; else open Autopsy
  const handleNodeClick = (metricId: string, event?: React.MouseEvent) => {
    if (isCompareMode || event?.shiftKey) {
      setSelectedMetricIds((prev) => {
        if (prev.includes(metricId)) {
          // Deselect if already present
          return prev.filter((id) => id !== metricId);
        }
        if (prev.length >= 2) {
          // Keep the newest and replace the oldest
          return [prev[1], metricId];
        }
        return [...prev, metricId];
      });
    } else {
      // Single metric autopsy
      setAutopsyMetricId(metricId);
      setAutopsyCompareMetricId(null);
      setIsAutopsyOpen(true);
    }
  };

  // Launch Differential Philocrash Autopsy for two selected nodes
  const handleLaunchDifferentialAutopsy = () => {
    if (selectedMetricIds.length >= 2) {
      setAutopsyMetricId(selectedMetricIds[0]);
      setAutopsyCompareMetricId(selectedMetricIds[1]);
      setIsAutopsyOpen(true);
    }
  };

  // Snapshot Creation Handler
  const handleSaveSnapshot = () => {
    const newSnapIndex = customSnapshots.length + 7;
    const newSnap: MapComparisonData = {
      id: `map-snap-${Date.now()}`,
      name: `/map ${newSnapIndex}`,
      comparisonLabel: snapshotLabel.trim() || `User Checkpoint ${newSnapIndex}`,
      epoch: 'Custom Snapshot',
      disparity: liveVaultMap.disparity,
      metrics: JSON.parse(JSON.stringify(liveVaultMap.metrics)),
      isCustom: true
    };
    const updated = [...customSnapshots, newSnap];
    setCustomSnapshots(updated);
    try {
      localStorage.setItem('nihiltheism_custom_snapshots', JSON.stringify(updated));
    } catch (e) {
      // ignore
    }
    setSnapshotLabel('');
    setIsSnapshotModalOpen(false);
    setActiveMapIndex(allDatasets.length); // jump to newly created snapshot
  };

  // Differential Profile for Pairwise comparison
  const differentialPair = useMemo(() => {
    if (selectedMetricIds.length < 2) return null;
    return getDifferentialPairwiseProfile(selectedMetricIds[0], selectedMetricIds[1]);
  }, [selectedMetricIds]);

  // Pentagonal vertex coordinate math
  const getPentagonPoint = (index: number, total: number = 5, val: number = 0.5) => {
    const angle = (index * 2 * Math.PI) / total - Math.PI / 2;
    const radius = 34 + (val - 0.5) * 8; // Dynamic orbit based on metric value
    return {
      cx: +(50 + radius * Math.cos(angle)).toFixed(1),
      cy: +(50 + radius * Math.sin(angle)).toFixed(1)
    };
  };

  // Calculate derivatives for telemetry badges
  const getMetricTelemetry = (metricId: string, currentValue: number) => {
    const prevVal = previousMap?.metrics.find((m) => m.id === metricId)?.value ?? currentValue;
    const twoBackVal = twoStepsBackMap?.metrics.find((m) => m.id === metricId)?.value ?? prevVal;

    const delta = currentValue - prevVal;
    const prevDelta = prevVal - twoBackVal;
    const accel = delta - prevDelta;

    const profile = PHILOCRASH_METRIC_PROFILES[metricId];
    const eoRatio = profile?.phase4?.occurrenceVsElevation?.ratio ?? 1.8;

    return {
      delta: parseFloat(delta.toFixed(2)),
      accel: parseFloat(accel.toFixed(2)),
      eoRatio
    };
  };

  // Display metrics (sorted or standard)
  const displayMetrics = useMemo(() => {
    const list = [...currentMap.metrics];
    if (sortByValue) {
      list.sort((a, b) => b.value - a.value);
    }
    return list;
  }, [currentMap, sortByValue]);

  return (
    <>
      <div
        id="visual-disparity-index"
        className={`flex flex-col bg-black/60 border border-white/10 ${
          compact ? 'p-2.5 w-72' : 'p-3.5 w-80 lg:w-96'
        } shrink-0 relative overflow-hidden backdrop-blur-md rounded-2xl ${className}`}
      >
        {/* Top Header Strip */}
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

          {/* View Switcher, Compare Mode & Play Controls */}
          <div className="flex items-center gap-1">
            {/* Compare Toggle Button */}
            <button
              onClick={() => setIsCompareMode(!isCompareMode)}
              className={`px-2 py-0.5 rounded text-[10px] font-mono transition-all border flex items-center gap-1 ${
                isCompareMode
                  ? 'bg-amber-500/25 text-amber-200 border-amber-500/50 shadow-[0_0_8px_rgba(245,158,11,0.25)] font-bold'
                  : 'bg-white/5 text-white/50 border-white/10 hover:text-white hover:bg-white/10'
              }`}
              title="Toggle Multi-Node Differential Comparison Mode"
            >
              <Split size={11} />
              <span>Δ Compare</span>
            </button>

            {/* Auto Play */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`p-1 rounded text-[10px] transition-colors border ${
                isPlaying
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_8px_rgba(245,158,11,0.2)]'
                  : 'text-white/40 hover:text-white border-transparent'
              }`}
              title={isPlaying ? 'Pause Auto Cycle' : 'Auto Play Comparison Cycle'}
              aria-label="Toggle auto comparison play"
            >
              {isPlaying ? <Pause size={12} /> : <Play size={12} />}
            </button>

            {/* View Modes */}
            <div className="flex items-center bg-white/5 rounded p-0.5 border border-white/5 relative">
              <button
                onClick={() => setViewMode('nodes')}
                className={`p-1 rounded transition-colors relative z-10 ${
                  viewMode === 'nodes' ? 'text-amber-200' : 'text-white/40 hover:text-white'
                }`}
                title="Interactive Topology Nodes"
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
                  viewMode === 'bars' ? 'text-amber-200' : 'text-white/40 hover:text-white'
                }`}
                title="Interactive Metric Node Cards"
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
                  viewMode === 'curve' ? 'text-amber-200' : 'text-white/40 hover:text-white'
                }`}
                title="Comparative Trend Curve"
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

        {/* Map Switcher Strip & + Snapshot Button */}
        <div className="flex items-center justify-between gap-1 mb-2.5 bg-white/[0.03] p-1 rounded-lg border border-white/5">
          <button
            onClick={handlePrev}
            className="p-1 text-white/40 hover:text-white rounded hover:bg-white/10 transition-colors shrink-0"
            title="Previous map"
          >
            <ChevronLeft size={13} />
          </button>

          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {allDatasets.map((m, idx) => {
              const isSelected = idx === activeMapIndex;
              return (
                <button
                  key={m.id}
                  onClick={() => handleSelectMap(idx)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors relative shrink-0 ${
                    isSelected
                      ? 'text-amber-200 font-bold'
                      : 'text-white/50 hover:text-white hover:bg-white/5'
                  }`}
                  title={`${m.name}: ${m.comparisonLabel}`}
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

          <div className="flex items-center gap-0.5 shrink-0">
            <button
              onClick={() => setIsSnapshotModalOpen(true)}
              className="p-1 text-amber-300 hover:text-white rounded hover:bg-amber-500/20 transition-colors"
              title="Capture Live Snapshot as /map checkpoint"
            >
              <Plus size={13} />
            </button>

            <button
              onClick={handleNext}
              className="p-1 text-white/40 hover:text-white rounded hover:bg-white/10 transition-colors"
              title="Next map"
            >
              <ChevronRight size={13} />
            </button>
          </div>
        </div>

        {/* Snapshot Modal Drawer */}
        {isSnapshotModalOpen && (
          <div className="mb-2.5 p-2.5 rounded-xl bg-amber-950/20 border border-amber-500/40 space-y-2 text-xs font-mono animate-fade-in">
            <div className="flex items-center justify-between text-amber-300 font-bold">
              <span>Capture /map Snapshot</span>
              <button onClick={() => setIsSnapshotModalOpen(false)} className="text-white/40 hover:text-white">
                <X size={13} />
              </button>
            </div>
            <input
              type="text"
              value={snapshotLabel}
              onChange={(e) => setSnapshotLabel(e.target.value)}
              placeholder="e.g. 'Post-Dialectic Void Convergence'"
              className="w-full px-2.5 py-1.5 rounded-lg bg-black/60 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsSnapshotModalOpen(false)}
                className="px-2.5 py-1 rounded bg-white/5 text-white/60 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSnapshot}
                className="px-3 py-1 rounded bg-amber-500 hover:bg-amber-400 text-black font-bold"
              >
                Save Snapshot
              </button>
            </div>
          </div>
        )}

        {/* Main View Container */}
        <AnimatePresence mode="wait">
          {/* VIEW MODE 1: Interactive Pentagon Topology Nodes */}
          {viewMode === 'nodes' && (
            <motion.div
              key={`nodes-${currentMap.id}`}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25 }}
              className="relative w-full aspect-square max-h-[300px] my-1 flex items-center justify-center"
            >
              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100">
                <defs>
                  <radialGradient id="hubGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                  </radialGradient>
                  <linearGradient id="diffVectorGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ec4899" />
                    <stop offset="50%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>

                {/* Concentric Reference Rings */}
                <circle cx="50" cy="50" r="16" fill="none" stroke="rgba(255,255,255,0.06)" strokeDasharray="1.5 2" />
                <circle cx="50" cy="50" r="32" fill="none" stroke="rgba(255,255,255,0.08)" strokeDasharray="2 3" />
                <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.04)" />

                {/* Center Hub Ambient Glow */}
                <circle cx="50" cy="50" r="22" fill="url(#hubGlow)" />

                {/* Spokes connecting center to each node */}
                {currentMap.metrics.map((m, i) => {
                  const pt = getPentagonPoint(i, 5, m.value);
                  return (
                    <motion.line
                      key={`spoke-${m.id}`}
                      x1="50"
                      y1="50"
                      x2={pt.cx}
                      y2={pt.cy}
                      stroke={m.color}
                      strokeOpacity="0.3"
                      strokeWidth="0.8"
                      strokeDasharray="2 2"
                      animate={{ x2: pt.cx, y2: pt.cy }}
                      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                    />
                  );
                })}

                {/* Outer Tensor Perimeter Lines */}
                {currentMap.metrics.map((m, i) => {
                  const pt1 = getPentagonPoint(i, 5, m.value);
                  const nextIdx = (i + 1) % 5;
                  const pt2 = getPentagonPoint(nextIdx, 5, currentMap.metrics[nextIdx].value);
                  return (
                    <motion.line
                      key={`perimeter-${m.id}-${currentMap.metrics[nextIdx].id}`}
                      x1={pt1.cx}
                      y1={pt1.cy}
                      x2={pt2.cx}
                      y2={pt2.cy}
                      stroke="rgba(255,255,255,0.18)"
                      strokeWidth="0.6"
                      animate={{ x1: pt1.cx, y1: pt1.cy, x2: pt2.cx, y2: pt2.cy }}
                      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                    />
                  );
                })}

                {/* Animated Glowing Differential Resonance Vector (if 2 nodes selected) */}
                {selectedMetricIds.length >= 2 && (() => {
                  const idx1 = currentMap.metrics.findIndex((m) => m.id === selectedMetricIds[0]);
                  const idx2 = currentMap.metrics.findIndex((m) => m.id === selectedMetricIds[1]);
                  if (idx1 !== -1 && idx2 !== -1) {
                    const pt1 = getPentagonPoint(idx1, 5, currentMap.metrics[idx1].value);
                    const pt2 = getPentagonPoint(idx2, 5, currentMap.metrics[idx2].value);
                    const midX = (pt1.cx + pt2.cx) / 2;
                    const midY = (pt1.cy + pt2.cy) / 2;

                    return (
                      <g key="diff-resonance-vector">
                        {/* Outer Glow Line */}
                        <line
                          x1={pt1.cx}
                          y1={pt1.cy}
                          x2={pt2.cx}
                          y2={pt2.cy}
                          stroke="#f59e0b"
                          strokeWidth="2.5"
                          strokeOpacity="0.4"
                          filter="blur(1px)"
                        />
                        {/* Pulsing Core Vector */}
                        <line
                          x1={pt1.cx}
                          y1={pt1.cy}
                          x2={pt2.cx}
                          y2={pt2.cy}
                          stroke="url(#diffVectorGlow)"
                          strokeWidth="1.2"
                          strokeDasharray="2 1"
                        />
                        {/* Midpoint Resonance Badge */}
                        <circle cx={midX} cy={midY} r="3.2" fill="#07050d" stroke="#f59e0b" strokeWidth="0.8" />
                      </g>
                    );
                  }
                  return null;
                })()}
              </svg>

              {/* Center Hub: Composite Disparity Display */}
              <div
                onClick={() => handleNodeClick('composite')}
                className="absolute z-10 flex flex-col items-center justify-center w-16 h-16 rounded-full bg-[#0a0614]/90 border border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.25)] cursor-pointer hover:border-amber-400 hover:scale-105 transition-all text-center group"
                title="Click to view Composite Disparity Autopsy"
              >
                <span className="text-[9px] font-mono text-amber-400/80 uppercase font-semibold group-hover:text-amber-300">
                  Δtotal
                </span>
                <span className="text-sm font-bold font-mono text-white tracking-tight">
                  {(currentMap.disparity * 100).toFixed(0)}%
                </span>
                <span className="text-[7px] font-mono text-white/40">autopsy</span>
              </div>

              {/* Interactive Metric Vertex Nodes */}
              {currentMap.metrics.map((m, i) => {
                const pt = getPentagonPoint(i, 5, m.value);
                const isSelected = selectedMetricIds.includes(m.id);
                const telemetry = getMetricTelemetry(m.id, m.value);

                return (
                  <motion.button
                    key={m.id}
                    layout
                    onClick={(e) => handleNodeClick(m.id, e)}
                    style={{
                      left: `${pt.cx}%`,
                      top: `${pt.cy}%`,
                      transform: 'translate(-50%, -50%)'
                    }}
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                    className={`absolute z-20 flex flex-col items-center justify-center w-11 h-11 rounded-full cursor-pointer transition-all border ${
                      isSelected
                        ? 'border-amber-400 bg-amber-500/25 shadow-[0_0_16px_rgba(245,158,11,0.5)] ring-2 ring-amber-400/40'
                        : 'border-white/20 bg-[#0e0a1a]/95 hover:border-white/60 shadow-[0_0_12px_rgba(0,0,0,0.8)]'
                    }`}
                    title={`${m.label} (${m.shortName}): ${(m.value * 100).toFixed(0)}% — Click for Autopsy (Shift+Click to Compare)`}
                  >
                    <div className="w-2 h-2 rounded-full mb-0.5" style={{ backgroundColor: m.color }} />
                    <span className="text-[9px] font-mono font-bold text-white leading-none">
                      {m.shortName}
                    </span>
                    <span className="text-[8px] font-mono text-white/70 leading-none mt-0.5">
                      {(m.value * 100).toFixed(0)}%
                    </span>

                    {/* Small Differential Indicator Pin */}
                    {telemetry.delta !== 0 && (
                      <span
                        className={`absolute -top-1 -right-1 text-[8px] font-mono px-1 rounded-full border ${
                          telemetry.delta > 0
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        }`}
                      >
                        {telemetry.delta > 0 ? `+${telemetry.delta}` : telemetry.delta}
                      </span>
                    )}
                  </motion.button>
                );
              })}
            </motion.div>
          )}

          {/* VIEW MODE 2: Interactive Metric Node Cards (Stack) */}
          {viewMode === 'bars' && (
            <motion.div
              key={`bars-${currentMap.id}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="space-y-1.5 my-1"
            >
              {displayMetrics.map((m) => {
                const isSelected = selectedMetricIds.includes(m.id);
                const telemetry = getMetricTelemetry(m.id, m.value);

                return (
                  <motion.div
                    key={m.id}
                    layout
                    transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                    onClick={(e) => handleNodeClick(m.id, e)}
                    className={`p-2 rounded-xl transition-all cursor-pointer border relative overflow-hidden group ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                        : 'bg-white/[0.03] border-white/5 hover:border-white/20 hover:bg-white/[0.06]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-mono mb-1">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: m.color }} />
                        <span className="font-bold text-white group-hover:text-amber-300 transition-colors">
                          {m.label}
                        </span>
                        <span className="text-white/40 text-[10px]">({m.shortName})</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {/* Delta Badge */}
                        <span
                          className={`text-[9px] px-1 py-0.2 rounded border ${
                            telemetry.delta > 0
                              ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                              : telemetry.delta < 0
                              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                              : 'bg-white/5 text-white/40 border-white/10'
                          }`}
                        >
                          Δ {telemetry.delta > 0 ? `+${telemetry.delta}` : telemetry.delta}
                        </span>

                        {/* E/O Ratio Badge */}
                        <span className="text-[9px] text-amber-300/80 bg-amber-500/10 px-1 rounded border border-amber-500/20">
                          E/O {telemetry.eoRatio}
                        </span>

                        <span className="font-bold text-white">{(m.value * 100).toFixed(0)}%</span>
                      </div>
                    </div>

                    {/* Progress Bar Track */}
                    <div className="w-full h-1.5 bg-black/50 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full bg-gradient-to-r ${m.bgGradient}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${m.value * 100}%` }}
                        transition={{ duration: 0.4 }}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {/* VIEW MODE 3: Comparative Tensor Curve (Recharts) */}
          {viewMode === 'curve' && (
            <motion.div
              key="curve-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="h-44 w-full my-1 font-mono text-[10px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={allDatasets} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="2 2" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 9 }} />
                  <YAxis domain={[0, 1]} stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 9 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0a0614',
                      borderColor: 'rgba(255,255,255,0.15)',
                      borderRadius: '8px',
                      fontSize: '11px'
                    }}
                  />
                  <Line type="monotone" dataKey="disparity" name="Δtotal" stroke="#F59E0B" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey={(d) => d.metrics[1]?.value} name="Δλ" stroke="#8B5CF6" strokeWidth={1.5} dot={false} />
                  <Line type="monotone" dataKey={(d) => d.metrics[2]?.value} name="ρonto" stroke="#06B6D4" strokeWidth={1.5} dot={false} />
                  <Line type="monotone" dataKey={(d) => d.metrics[3]?.value} name="θapoph" stroke="#10B981" strokeWidth={1.5} dot={false} />
                  <Line type="monotone" dataKey={(d) => d.metrics[4]?.value} name="δgap" stroke="#EC4899" strokeWidth={1.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pairwise Comparison Drawer (if 2 metrics selected) */}
        {selectedMetricIds.length >= 2 && differentialPair && (
          <div className="mt-2.5 p-2.5 rounded-xl bg-gradient-to-r from-violet-950/30 via-black to-amber-950/30 border border-amber-500/30 space-y-2 text-xs font-mono animate-fade-in">
            <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
              <span className="text-amber-300 font-bold flex items-center gap-1.5">
                <Split size={12} className="text-amber-400" />
                <span>Pairwise Differential: {differentialPair.title}</span>
              </span>
              <button
                onClick={() => setSelectedMetricIds([])}
                className="text-white/40 hover:text-white"
                title="Clear selection"
              >
                <X size={12} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-white/50 block">Divergence Vector:</span>
                <span className="text-purple-300 font-bold">{differentialPair.divergenceVector}</span>
              </div>
              <div>
                <span className="text-white/50 block">Covariance Ratio:</span>
                <span className="text-cyan-300 font-bold">{differentialPair.covarianceRatio}</span>
              </div>
            </div>

            <button
              onClick={handleLaunchDifferentialAutopsy}
              className="w-full py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all"
            >
              <Zap size={12} />
              <span>Launch Differential Philocrash Autopsy</span>
            </button>
          </div>
        )}

        {/* Bottom Status Footer */}
        <div className="border-t border-white/10 pt-2 mt-2 flex items-center justify-between text-[10px] font-mono text-white/50">
          <span>Click node for Autopsy • Shift+Click to Compare</span>
          <button
            onClick={() => setSortByValue(!sortByValue)}
            className="hover:text-amber-300 transition-colors"
          >
            {sortByValue ? 'Default Order' : 'Sort by Tension'}
          </button>
        </div>
      </div>

      {/* Philocrash Autopsy Modal */}
      <PhilocrashAutopsyModal
        isOpen={isAutopsyOpen}
        onClose={() => {
          setIsAutopsyOpen(false);
          setAutopsyMetricId(null);
          setAutopsyCompareMetricId(null);
        }}
        metricId={autopsyMetricId}
        compareMetricId={autopsyCompareMetricId}
        currentMap={currentMap}
        onSelectMetric={(id) => setAutopsyMetricId(id)}
        onSelectGraphNode={onSelectGraphNode}
        onCommitToVault={onCommitToVault}
        onOpenNote={onOpenNote}
      />
    </>
  );
};
