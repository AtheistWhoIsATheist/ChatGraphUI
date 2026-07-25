import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { ParadoxSynthesis } from '../types';
import { TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';

interface ParadoxTrendChartD3Props {
  synthesisHistory: ParadoxSynthesis[];
  sampleParadoxes?: ParadoxSynthesis[];
}

// Key paradox theme categories
const PARADOX_THEMES = [
  { id: 'apophaticism', label: 'Apophatic Silence', color: '#f59e0b', gradient: 'amberGradient' },
  { id: 'aporia', label: 'Aporia & Suspended Judgement', color: '#818cf8', gradient: 'indigoGradient' },
  { id: 'void', label: 'Absolute Void Dynamics', color: '#ec4899', gradient: 'pinkGradient' },
  { id: 'nihilism', label: 'Active Nihilism & Emptiness', color: '#10b981', gradient: 'emeraldGradient' }
];

interface TimeSeriesPoint {
  date: Date;
  dateStr: string;
  apophaticism: number;
  aporia: number;
  void: number;
  nihilism: number;
  synthesisCount: number;
  recentTitle?: string;
}

export const ParadoxTrendChartD3: React.FC<ParadoxTrendChartD3Props> = ({
  synthesisHistory,
  sampleParadoxes = []
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const [activeThemes, setActiveThemes] = useState<string[]>([
    'apophaticism',
    'aporia',
    'void',
    'nihilism'
  ]);

  const [hoveredPoint, setHoveredPoint] = useState<{
    x: number;
    y: number;
    point: TimeSeriesPoint;
  } | null>(null);

  // Generate temporal time-series dataset combining user history with simulated progression
  const timeSeriesData = useMemo(() => {
    const rawList = synthesisHistory.length > 0 ? synthesisHistory : sampleParadoxes;

    // Create a 7-day or multi-point temporal interval
    const now = new Date();
    const points: TimeSeriesPoint[] = [];

    // Helper to categorize synthesis text into themes
    const classifyTheme = (p: ParadoxSynthesis): string => {
      const text = (p.nodeALabel + ' ' + p.nodeBLabel + ' ' + p.synthesis + ' ' + p.thesis).toLowerCase();
      if (text.includes('aporia') || text.includes('epoche') || text.includes('doubt')) return 'aporia';
      if (text.includes('void') || text.includes('abyss') || text.includes('uncreated')) return 'void';
      if (text.includes('nihil') || text.includes('empty') || text.includes('sunyata')) return 'nihilism';
      return 'apophaticism';
    };

    // If user has real history, sort by timestamp
    if (synthesisHistory.length > 0) {
      // Group by date string
      const grouped: Record<string, { apophaticism: number; aporia: number; void: number; nihilism: number; count: number; title: string }> = {};

      synthesisHistory.forEach((p) => {
        const d = new Date(p.timestamp || Date.now());
        const dStr = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        const theme = classifyTheme(p);

        if (!grouped[dStr]) {
          grouped[dStr] = { apophaticism: 0, aporia: 0, void: 0, nihilism: 0, count: 0, title: `${p.nodeALabel} ⊗ ${p.nodeBLabel}` };
        }
        grouped[dStr][theme as 'apophaticism' | 'aporia' | 'void' | 'nihilism'] += 1;
        grouped[dStr].count += 1;
      });

      // Build continuous trend points
      const days = Object.keys(grouped);
      let cumulativeApophaticism = 0;
      let cumulativeAporia = 0;
      let cumulativeVoid = 0;
      let cumulativeNihilism = 0;

      days.forEach((dStr, idx) => {
        const g = grouped[dStr];
        cumulativeApophaticism += g.apophaticism;
        cumulativeAporia += g.aporia;
        cumulativeVoid += g.void;
        cumulativeNihilism += g.nihilism;

        const dateObj = new Date(now.getTime() - (days.length - 1 - idx) * 86400000);
        points.push({
          date: dateObj,
          dateStr: dStr,
          apophaticism: cumulativeApophaticism,
          aporia: cumulativeAporia,
          void: cumulativeVoid,
          nihilism: cumulativeNihilism,
          synthesisCount: g.count,
          recentTitle: g.title
        });
      });
    }

    // Baseline fallback trend points if history is sparse (< 3 points)
    if (points.length < 3) {
      const daysBack = [6, 5, 4, 3, 2, 1, 0];
      const baselineAcc = { apophaticism: 1, aporia: 1, void: 0, nihilism: 1 };

      return daysBack.map((daysAgo) => {
        const d = new Date(now.getTime() - daysAgo * 86400000);
        const dStr = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        const dayFactor = 6 - daysAgo;

        return {
          date: d,
          dateStr: dStr,
          apophaticism: baselineAcc.apophaticism + Math.floor(dayFactor * 0.8),
          aporia: baselineAcc.aporia + Math.floor(dayFactor * 0.6),
          void: baselineAcc.void + Math.floor(dayFactor * 0.9),
          nihilism: baselineAcc.nihilism + Math.floor(dayFactor * 0.5),
          synthesisCount: 1 + (dayFactor % 2),
          recentTitle: rawList[dayFactor % rawList.length]
            ? `${rawList[dayFactor % rawList.length].nodeALabel} ⊗ ${rawList[dayFactor % rawList.length].nodeBLabel}`
            : 'Socratic Epoché ⊗ Radical Aporia'
        };
      });
    }

    return points;
  }, [synthesisHistory, sampleParadoxes]);

  // Toggle theme visibility
  const toggleTheme = (id: string) => {
    if (activeThemes.includes(id)) {
      if (activeThemes.length > 1) {
        setActiveThemes(activeThemes.filter((t) => t !== id));
      }
    } else {
      setActiveThemes([...activeThemes, id]);
    }
  };

  // Render D3 Trend Chart
  useEffect(() => {
    if (!svgRef.current || !containerRef.current || timeSeriesData.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = containerRef.current.clientWidth || 700;
    const height = 320;
    const margin = { top: 30, right: 30, bottom: 40, left: 40 };

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Define Color Gradients
    const defs = svg.append('defs');

    PARADOX_THEMES.forEach((theme) => {
      const grad = defs
        .append('linearGradient')
        .attr('id', theme.gradient)
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '0%')
        .attr('y2', '100%');

      grad.append('stop').attr('offset', '0%').attr('stop-color', theme.color).attr('stop-opacity', 0.35);
      grad.append('stop').attr('offset', '100%').attr('stop-color', theme.color).attr('stop-opacity', 0.0);
    });

    // X Scale (Time)
    const xScale = d3
      .scaleTime()
      .domain(d3.extent(timeSeriesData, (d) => d.date) as [Date, Date])
      .range([0, innerWidth]);

    // Calculate max value across active themes
    const maxVal = Math.max(
      ...timeSeriesData.map((d) => {
        let val = 0;
        activeThemes.forEach((t) => {
          val = Math.max(val, d[t as keyof TimeSeriesPoint] as number);
        });
        return val;
      }),
      4
    );

    // Y Scale (Frequency / Count)
    const yScale = d3.scaleLinear().domain([0, maxVal + 1]).range([innerHeight, 0]);

    // Grid lines
    g.append('g')
      .attr('class', 'grid')
      .call(
        d3
          .axisLeft(yScale)
          .ticks(5)
          .tickSize(-innerWidth)
          .tickFormat(() => '')
      )
      .selectAll('line')
      .attr('stroke', '#262626')
      .attr('stroke-dasharray', '3,3');

    // Draw Line and Area for each active theme
    PARADOX_THEMES.forEach((theme) => {
      if (!activeThemes.includes(theme.id)) return;

      const lineGenerator = d3
        .line<TimeSeriesPoint>()
        .x((d) => xScale(d.date))
        .y((d) => yScale(d[theme.id as keyof TimeSeriesPoint] as number))
        .curve(d3.curveMonotoneX);

      const areaGenerator = d3
        .area<TimeSeriesPoint>()
        .x((d) => xScale(d.date))
        .y0(innerHeight)
        .y1((d) => yScale(d[theme.id as keyof TimeSeriesPoint] as number))
        .curve(d3.curveMonotoneX);

      // Area Fill
      g.append('path')
        .datum(timeSeriesData)
        .attr('fill', `url(#${theme.gradient})`)
        .attr('d', areaGenerator);

      // Line Path
      g.append('path')
        .datum(timeSeriesData)
        .attr('fill', 'none')
        .attr('stroke', theme.color)
        .attr('stroke-width', 2.5)
        .attr('d', lineGenerator);

      // Data Points / Dots
      g.selectAll(`.dot-${theme.id}`)
        .data(timeSeriesData)
        .enter()
        .append('circle')
        .attr('class', `dot-${theme.id}`)
        .attr('cx', (d) => xScale(d.date))
        .attr('cy', (d) => yScale(d[theme.id as keyof TimeSeriesPoint] as number))
        .attr('r', 4)
        .attr('fill', '#0a0a0a')
        .attr('stroke', theme.color)
        .attr('stroke-width', 2)
        .style('cursor', 'pointer')
        .on('mouseenter', (event, d) => {
          const [cx, cy] = d3.pointer(event, svgRef.current);
          setHoveredPoint({ x: cx, y: cy, point: d });
        })
        .on('mouseleave', () => setHoveredPoint(null));
    });

    // X Axis
    const xAxis = d3.axisBottom(xScale).ticks(5).tickFormat(d3.timeFormat('%b %d') as any);
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .selectAll('text')
      .attr('fill', '#a3a3a3')
      .attr('font-size', '10px')
      .attr('font-family', 'monospace');

    // Y Axis
    const yAxis = d3.axisLeft(yScale).ticks(5);
    g.append('g')
      .call(yAxis)
      .selectAll('text')
      .attr('fill', '#a3a3a3')
      .attr('font-size', '10px')
      .attr('font-family', 'monospace');

    // Style axis paths
    g.selectAll('.domain').attr('stroke', '#404040');
    g.selectAll('.tick line').attr('stroke', '#404040');
  }, [timeSeriesData, activeThemes]);

  return (
    <div className="flex flex-col gap-6 bg-neutral-950 border border-neutral-900 rounded-2xl p-6 abyssal-glow">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-900 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-400 animate-pulse" />
            <h3 className="font-display text-sm font-semibold tracking-wider text-neutral-200 uppercase">
              D3 Synthesis Theme Frequency Trend
            </h3>
            <span className="text-[9px] font-mono bg-amber-950/50 text-amber-400 border border-amber-800/60 px-2 py-0.5 rounded-full">
              D3.js Temporal Engine
            </span>
          </div>
          <p className="text-xs text-neutral-400 font-sans mt-1">
            Tracking cumulative emergence and frequency of apophatic themes in dialectical syntheses over time.
          </p>
        </div>

        {/* Theme Toggles */}
        <div className="flex flex-wrap items-center gap-2">
          {PARADOX_THEMES.map((theme) => {
            const isActive = activeThemes.includes(theme.id);
            return (
              <button
                key={theme.id}
                onClick={() => toggleTheme(theme.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer border ${
                  isActive
                    ? 'bg-neutral-900 text-neutral-200 border-neutral-700 shadow-sm'
                    : 'bg-black text-neutral-600 border-neutral-900 opacity-60 hover:opacity-100'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: isActive ? theme.color : '#525252' }}
                />
                <span>{theme.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* D3 Canvas Container */}
      <div ref={containerRef} className="bg-black/80 border border-neutral-900 rounded-xl p-4 min-h-[340px] relative">
        <svg ref={svgRef} className="w-full h-[320px] overflow-visible" />

        {/* D3 Hover Tooltip */}
        {hoveredPoint && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute z-30 bg-neutral-950/95 border border-amber-500/40 p-3 rounded-xl shadow-2xl max-w-xs text-xs text-neutral-200 pointer-events-none backdrop-blur-md"
            style={{
              left: Math.min(hoveredPoint.x + 15, (containerRef.current?.clientWidth || 600) - 220),
              top: Math.max(hoveredPoint.y - 100, 10)
            }}
          >
            <div className="flex items-center justify-between border-b border-neutral-850 pb-1 mb-2">
              <span className="font-mono text-[10px] text-amber-400 font-semibold uppercase">
                {hoveredPoint.point.dateStr}
              </span>
              <span className="text-[9px] font-mono text-neutral-500">
                {hoveredPoint.point.synthesisCount} syntheses
              </span>
            </div>

            <div className="flex flex-col gap-1 text-[10px] font-mono">
              <div className="flex justify-between">
                <span className="text-amber-400">Apophatic Silence:</span>
                <span className="font-bold">{hoveredPoint.point.apophaticism}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-indigo-400">Aporia & Judgement:</span>
                <span className="font-bold">{hoveredPoint.point.aporia}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-pink-400">Void Dynamics:</span>
                <span className="font-bold">{hoveredPoint.point.void}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-emerald-400">Nihilism & Emptiness:</span>
                <span className="font-bold">{hoveredPoint.point.nihilism}</span>
              </div>
            </div>

            {hoveredPoint.point.recentTitle && (
              <p className="text-[9px] text-neutral-400 italic mt-2 border-t border-neutral-850 pt-1 font-serif truncate">
                "{hoveredPoint.point.recentTitle}"
              </p>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};
