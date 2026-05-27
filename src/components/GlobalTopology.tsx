import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { 
  Network, Sparkles, Loader2, ZoomIn, ZoomOut, RotateCcw, 
  Search, Filter, ShieldCheck, Cpu, ArrowRight, BookOpen, Layers, Info, GitCompare
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore } from '../store/appStore';
import { detectCommunities, Community } from '../utils/communityDetection';
import { Node, Link } from '../data/corpus';
import { cn } from '../lib/utils';
import Markdown from 'react-markdown';
import { getGeminiClient } from '../lib/gemini';
import { logOptimization } from '../utils/selfImprovement';

const ai = getGeminiClient();

// High-contrast cyberpunk / Void-themed colors
const CLUSTER_COLORS = [
  '#10b981', // emerald
  '#ec4899', // hot pink
  '#3b82f6', // sapphire blue
  '#8b5cf6', // royal violet
  '#eab308', // amber gold
  '#f97316', // neon orange
  '#14b8a6', // teal
  '#ef4444', // blood red
  '#06b6d4', // cyan
  '#a855f7', // amethyst
];

interface D3Node extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  type: string;
  status?: string;
  communityId: number;
  radius: number;
}

interface D3Link extends d3.SimulationLinkDatum<D3Node> {
  source: string | D3Node;
  target: string | D3Node;
  value?: number;
}

export function GlobalTopology() {
  const { nodes, links, setSelectedNodeId, setSidebarMode, setRightSidebarOpen } = useAppStore();
  const d3Container = useRef<SVGSVGElement | null>(null);
  
  // UI states
  const [selectedClusterId, setSelectedClusterId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNodeTypes, setSelectedNodeTypes] = useState<Set<string>>(new Set());
  const [linkDistance, setLinkDistance] = useState(120);
  const [chargeStrength, setChargeStrength] = useState(-250);
  const [clusteringStrength, setClusteringStrength] = useState(0.15);
  
  // Goal 2: Visibility filters for Louvain communities
  const [hiddenClusterIds, setHiddenClusterIds] = useState<Set<number>>(new Set());

  // Goal 5: Layout gravity switch state
  const [gravityFocused, setGravityFocused] = useState(false);

  // Goal 3: Batch parsing states
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);
  const [batchReports, setBatchReports] = useState<{ id: number; title: string; content: string }[] | null>(null);
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0 });

  // Goal 4: Side-by-side comparison state
  const [comparisonMode, setComparisonMode] = useState(false);
  const [selectedCompareIds, setSelectedCompareIds] = useState<number[]>([]);
  const [isComparing, setIsComparing] = useState(false);
  const [comparisonReport, setComparisonReport] = useState<string | null>(null);

  // Cache coordinate vectors to prevent jumpy layout resets during updates
  const posRef = useRef<Map<string, { x: number; y: number; vx: number; vy: number }>>(new Map());

  // Highlighting and zoom references
  const [hoveredNode, setHoveredNode] = useState<D3Node | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  
  // Synthesis and community states
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [synthesis, setSynthesis] = useState<string | null>(null);
  const [autoLabels, setAutoLabels] = useState<Record<number, string>>({});
  const [autoSummaries, setAutoSummaries] = useState<Record<number, string>>({});

  // 1. Detect dynamic communities using our Louvain utility
  const communities = useMemo(() => {
    return detectCommunities(nodes, links);
  }, [nodes, links]);

  // Create a map to fetch community ID for any Node ID
  const nodeCommunityMap = useMemo(() => {
    const map = new Map<string, number>();
    communities.forEach(c => {
      c.nodes.forEach(n => {
        map.set(n.id, c.id);
      });
    });
    return map;
  }, [communities]);

  // Active node types available in the current graph
  const allNodeTypes = useMemo(() => {
    const types = new Set<string>();
    nodes.forEach(n => types.add(n.type));
    return Array.from(types);
  }, [nodes]);

  // Handle Type Toggle
  const toggleNodeType = (type: string) => {
    const next = new Set(selectedNodeTypes);
    if (next.has(type)) {
      next.delete(type);
    } else {
      next.add(type);
    }
    setSelectedNodeTypes(next);
  };

  // Toggle Cluster Visibility
  const toggleClusterVisibility = (clusterId: number) => {
    const next = new Set(hiddenClusterIds);
    if (next.has(clusterId)) {
      next.delete(clusterId);
    } else {
      next.add(clusterId);
    }
    setHiddenClusterIds(next);
  };

  // Helper to resolve color
  const getClusterColor = (communityId: number) => {
    return CLUSTER_COLORS[communityId % CLUSTER_COLORS.length];
  };

  // Process data for D3 force layout
  const filteredD3Data = useMemo(() => {
    // Filter nodes by search, type, and Louvain community visibility
    const activeNodes = nodes.filter(n => {
      const commId = nodeCommunityMap.get(n.id) ?? 0;
      if (hiddenClusterIds.has(commId)) return false;

      const matchesSearch = searchQuery === '' || 
        n.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
        n.id.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = selectedNodeTypes.size === 0 || selectedNodeTypes.has(n.type);
      
      return matchesSearch && matchesType;
    });

    const activeNodeIds = new Set(activeNodes.map(n => n.id));

    // Create D3 Nodes
    const d3Nodes: D3Node[] = activeNodes.map(n => {
      const commId = nodeCommunityMap.get(n.id) ?? 0;
      // Assign radii based on node centrality/type
      let r = 12;
      if (n.type === 'thinker') r = 18;
      if (n.type === 'tradition' || n.type === 'system') r = 16;
      if (n.type === 'claim') r = 10;
      
      // Pull cached coordinates if they exist to animate transitions smoothly
      const prev = posRef.current.get(n.id);
      return {
        id: n.id,
        label: n.label,
        type: n.type,
        status: n.status,
        communityId: commId,
        radius: r,
        x: prev?.x,
        y: prev?.y,
        vx: prev?.vx,
        vy: prev?.vy
      };
    });

    // Create D3 Links that connect active nodes only
    const d3Links: D3Link[] = [];
    links.forEach(l => {
      const sourceId = typeof l.source === 'string' ? l.source : l.source.id;
      const targetId = typeof l.target === 'string' ? l.target : l.target.id;

      if (activeNodeIds.has(sourceId) && activeNodeIds.has(targetId)) {
        d3Links.push({
          source: sourceId,
          target: targetId,
          value: l.weight || 2
        });
      }
    });

    return { d3Nodes, d3Links };
  }, [nodes, links, nodeCommunityMap, searchQuery, selectedNodeTypes, hiddenClusterIds]);

  // 2. D3 Visualization Setup and Rendering
  useEffect(() => {
    if (!d3Container.current) return;

    const svg = d3.select(d3Container.current);
    const width = d3Container.current.parentElement?.clientWidth || 900;
    const height = d3Container.current.parentElement?.clientHeight || 650;

    svg.attr('width', width)
       .attr('height', height)
       .attr('viewBox', [0, 0, width, height] as any);

    // Clean previous plot
    svg.selectAll('*').remove();

    // Define subtle defs for glow filters and patterns
    const defs = svg.append('defs');
    
    // Grid pattern
    const pattern = defs.append('pattern')
      .attr('id', 'bg-grid-global')
      .attr('width', 40)
      .attr('height', 40)
      .attr('patternUnits', 'userSpaceOnUse');

    pattern.append('rect')
      .attr('width', 40)
      .attr('height', 40)
      .attr('fill', 'transparent');

    pattern.append('circle')
      .attr('cx', 20)
      .attr('cy', 20)
      .attr('r', 1)
      .attr('fill', '#333333');

    // Glow filter
    const glowFilter = defs.append('filter')
      .attr('id', 'glow-global')
      .attr('x', '-20%')
      .attr('y', '-20%')
      .attr('width', '140%')
      .attr('height', '140%');

    glowFilter.append('feGaussianBlur')
      .attr('stdDeviation', 4)
      .attr('result', 'blur');

    glowFilter.append('feMerge')
      .selectAll('feMergeNode')
      .data(['blur', 'SourceGraphic'])
      .join('feMergeNode')
      .attr('in', d => d);

    // Visual elements groups
    const gMain = svg.append('g').attr('class', 'main-group');
    
    // Draw background grid
    gMain.append('rect')
      .attr('width', width * 3)
      .attr('height', height * 3)
      .attr('x', -width)
      .attr('y', -height)
      .attr('fill', 'url(#bg-grid-global)')
      .style('pointer-events', 'none');

    const hullGroup = gMain.append('g').attr('class', 'hulls');
    const linkGroup = gMain.append('g').attr('class', 'links');
    const nodeGroup = gMain.append('g').attr('class', 'nodes');
    const labelGroup = gMain.append('g').attr('class', 'labels');

    // Pan & Zoom Behavior Setup
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.25, 4])
      .on('zoom', (event) => {
        gMain.attr('transform', event.transform);
      });

    zoomBehaviorRef.current = zoom;
    svg.call(zoom);

    // Initial Zooming offset centered
    svg.call(zoom.transform, d3.zoomIdentity.translate(width / 2, height / 2).scale(0.8).translate(-width / 2, -height / 2));

    const { d3Nodes, d3Links } = filteredD3Data;

    // Simulation Setup
    const simulation = d3.forceSimulation(d3Nodes)
      .force('link', d3.forceLink<D3Node, D3Link>(d3Links).id(d => d.id).distance(linkDistance))
      .force('charge', d3.forceManyBody().strength(chargeStrength))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collide', d3.forceCollide<D3Node>().radius(d => d.radius + 8).iterations(3));

    // Goal 5 & 2: Dynamic smooth transitions on gravity adjustments
    simulation.force('community', (alpha) => {
      const communityCount = communities.length || 1;
      const radius = 220; // radius of gravity-focused orbit circle

      // Find centroids for each community ID
      const communityCentroids = new Map<number, { x: number; y: number; count: number }>();
      
      d3Nodes.forEach(node => {
        const commId = node.communityId;
        if (!communityCentroids.has(commId)) {
          communityCentroids.set(commId, { x: 0, y: 0, count: 0 });
        }
        const cent = communityCentroids.get(commId)!;
        cent.x += node.x || 0;
        cent.y += node.y || 0;
        cent.count += 1;
      });

      // Divide by counts to get average position
      communityCentroids.forEach((val) => {
        val.x /= val.count;
        val.y /= val.count;
      });

      // Pull nodes toward centroids smoothly
      d3Nodes.forEach(node => {
        if (!node.x || !node.y) return;
        
        let targetX = width / 2;
        let targetY = height / 2;

        if (gravityFocused) {
          // Pull to distinct centroids spaced beautifully on a circular orbit
          const angle = (node.communityId * 2 * Math.PI) / communityCount;
          targetX = width / 2 + Math.cos(angle) * radius;
          targetY = height / 2 + Math.sin(angle) * radius;
        } else {
          // Standard clustering forces: pull to standard calculated centroid
          const centroid = communityCentroids.get(node.communityId);
          if (centroid) {
            targetX = centroid.x;
            targetY = centroid.y;
          }
        }

        // Apply force smoothly
        const strength = gravityFocused ? 0.35 : clusteringStrength;
        node.vx! += (targetX - node.x) * strength * alpha;
        node.vy! += (targetY - node.y) * strength * alpha;
      });
    });

    // Draw Links
    const link = linkGroup.selectAll('line')
      .data(d3Links)
      .join('line')
      .attr('stroke', '#1e1e24')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', d => Math.max(1, Math.min(6, (d.value || 1.5))));

    // Draw Nodes
    const node = nodeGroup.selectAll('circle')
      .data(d3Nodes)
      .join('circle')
      .attr('r', d => d.radius)
      .attr('fill', d => getClusterColor(d.communityId))
      .attr('stroke', '#09090b')
      .attr('stroke-width', 2)
      .attr('cursor', 'pointer')
      .attr('class', d => `node-glob-${d.id}`)
      .on('click', (event, d) => {
        if (comparisonMode) {
          event.stopPropagation();
          // Toggle comparative selectors
          setSelectedCompareIds(prev => {
            const hasId = prev.includes(d.communityId);
            let next: number[];
            if (hasId) {
              next = prev.filter(id => id !== d.communityId);
            } else {
              next = [...prev, d.communityId].slice(0, 2);
            }
            return next;
          });
          return;
        }

        setSelectedNodeId(d.id);
        setSidebarMode('details');
        setRightSidebarOpen(true);
        // Dim or focus state
        node.style('opacity', n => n.communityId === d.communityId ? 1 : 0.2);
        link.style('opacity', l => {
          const sId = typeof l.source === 'string' ? l.source : (l.source as D3Node).id;
          const tId = typeof l.target === 'string' ? l.target : (l.target as D3Node).id;
          return sId === d.id || tId === d.id ? 1 : 0.05;
        });
        setSelectedClusterId(d.communityId);
        event.stopPropagation();
      })
      .on('mouseover', (event, d) => {
        setHoveredNode(d);
        // Find screen coordinates
        const rect = svg.node()?.getBoundingClientRect();
        if (rect) {
          setTooltipPos({
            x: event.clientX - rect.left + 15,
            y: event.clientY - rect.top + 15
          });
        }
      })
      .on('mousemove', (event) => {
        const rect = svg.node()?.getBoundingClientRect();
        if (rect) {
          setTooltipPos({
            x: event.clientX - rect.left + 15,
            y: event.clientY - rect.top + 15
          });
        }
      })
      .on('mouseout', () => {
        setHoveredNode(null);
      })
      .call(drag(simulation) as any);

    // Reset focused state when clicking empty area on canvas
    svg.on('click', () => {
      node.style('opacity', 1);
      link.style('opacity', 0.6);
      setSelectedClusterId(null);
    });

    // Draw Labels
    const labels = labelGroup.selectAll('text')
      .data(d3Nodes)
      .join('text')
      .text(d => d.label)
      .attr('font-size', '10px')
      .attr('font-family', 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace')
      .attr('fill', '#d4d4d8')
      .attr('text-anchor', 'middle')
      .attr('dy', '.35em')
      .style('pointer-events', 'none')
      .style('text-shadow', '0 1px 4px rgba(0,0,0,0.9)');

    // 3. Render Convex Hulls for visual cluster containment
    const hullLine = d3.line<[number, number]>().curve(d3.curveBasisClosed);

    function updateHulls() {
      const communityNodes = new Map<number, [number, number][]>();
      
      d3Nodes.forEach(n => {
        if (!n.x || !n.y) return;
        const commId = n.communityId;
        if (!communityNodes.has(commId)) {
          communityNodes.set(commId, []);
        }
        
        // Add coordinates along with offsets to create some padding around the actual node circle
        const p = 14;
        communityNodes.get(commId)!.push([n.x - p, n.y - p]);
        communityNodes.get(commId)!.push([n.x + p, n.y - p]);
        communityNodes.get(commId)!.push([n.x + p, n.y + p]);
        communityNodes.get(commId)!.push([n.x - p, n.y + p]);
      });

      const hullsData: { communityId: number; path: string }[] = [];

      communityNodes.forEach((points, commId) => {
        if (points.length < 3) return; // Need at least 3 points for a convex hull
        const hull = d3.polygonHull(points);
        if (hull) {
          const pathString = hullLine(hull);
          if (pathString) {
            hullsData.push({ communityId: commId, path: pathString });
          }
        }
      });

      const hulls = hullGroup.selectAll('path')
        .data(hullsData, (d: any) => d.communityId);

      hulls.exit().remove();

      hulls.enter()
        .append('path')
        .attr('stroke', d => getClusterColor(d.communityId))
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '4, 4')
        .attr('fill', d => getClusterColor(d.communityId))
        .attr('fill-opacity', 0.04)
        .style('transition', 'fill-opacity 0.2s')
        .merge(hulls as any)
        .attr('d', d => d.path)
        .style('opacity', d => (selectedClusterId === null || selectedClusterId === d.communityId) && !comparisonMode ? 1 : selectedCompareIds.includes(d.communityId) ? 1 : 0.15);
    }

    // Tick callback
    simulation.on('tick', () => {
      // Continuously save node coordinates to prevent popping and support smooth D3 toggling
      d3Nodes.forEach(node => {
        if (node.id && node.x !== undefined && node.y !== undefined) {
          posRef.current.set(node.id, {
            x: node.x,
            y: node.y,
            vx: node.vx || 0,
            vy: node.vy || 0
          });
        }
      });

      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node
        .attr('cx', (d: any) => d.x)
        .attr('cy', (d: any) => d.y);

      labels
        .attr('x', (d: any) => d.x)
        .attr('y', (d: any) => d.y + d.radius + 12);

      updateHulls();
    });

    // D3 Dragging helper
    function drag(simulation: d3.Simulation<D3Node, undefined>) {
      function dragstarted(event: any) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      }
      function dragged(event: any) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      }
      function dragended(event: any) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
      }
      return d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended);
    }

    // Cleanup simulation on unmount
    return () => {
      simulation.stop();
    };
  }, [filteredD3Data, linkDistance, chargeStrength, clusteringStrength, selectedClusterId, gravityFocused, comparisonMode, selectedCompareIds]);

  // Zoom manipulation actions
  const handleZoomIn = () => {
    if (d3Container.current && zoomBehaviorRef.current) {
      d3.select(d3Container.current).transition().call(zoomBehaviorRef.current.scaleBy, 1.3);
    }
  };

  const handleZoomOut = () => {
    if (d3Container.current && zoomBehaviorRef.current) {
      d3.select(d3Container.current).transition().call(zoomBehaviorRef.current.scaleBy, 0.7);
    }
  };

  const handleResetZoom = () => {
    if (d3Container.current && zoomBehaviorRef.current) {
      const width = d3Container.current.parentElement?.clientWidth || 900;
      const height = d3Container.current.parentElement?.clientHeight || 650;
      d3.select(d3Container.current).transition().call(
        zoomBehaviorRef.current.transform, 
        d3.zoomIdentity.translate(width / 2, height / 2).scale(0.8).translate(-width / 2, -height / 2)
      );
      // Reset interactive state
      d3.selectAll('circle').style('opacity', 1);
      d3.selectAll('line').style('opacity', 0.6);
      setSelectedClusterId(null);
      setSelectedCompareIds([]);
    }
  };

  // 4. Gemini AI Synthesis for a selected cluster
  const handleSynthesizeCluster = async (commId: number) => {
    const community = communities.find(c => c.id === commId);
    if (!community || !ai) return;

    setIsSynthesizing(true);
    setSynthesis(null);

    const labelsText = community.nodes.map(n => `ID: ${n.id} (Label: "${n.label}", Type: ${n.type})`).join(',\n');

    try {
      const prompt = `You are the AutoNarrative Semantic Oracle, analyzing the dynamic topological cluster ID "${commId}" of the Journal314 REN philosophy network.
      
Here is the raw data substrate of nodes belonging to this cluster:
${labelsText}

Perform a rigorous, Phase 2 Synthesis of this cluster. 
1. Assign a highly conceptual, dense title representing the core philosophical topic mapping these nodes together.
2. Outline the underlying conceptual resonance, explaining how these ideas form a cohesive structural worldview. Use the vocabulary of Nihiltheistic topology (groundlessness, apophasis, A-Series).
3. Do NOT include generic filler intro/outro. Provide deep, dense, academic philosophical synthesis in clean Markdown format.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt
      });

      const text = response.text || 'No synthesis generated.';
      
      // Attempt to extract title/label automatically (usually in headings)
      let autoTitle = `CLUSTER_${commId}_SYNTHESIS`;
      const titleMatch = text.match(/#+\s+(.*)/);
      if (titleMatch && titleMatch[1]) {
        autoTitle = titleMatch[1].trim();
      }

      setAutoLabels(prev => ({ ...prev, [commId]: autoTitle }));
      setAutoSummaries(prev => ({ ...prev, [commId]: text }));
      setSynthesis(text);
    } catch (e) {
      console.error(e);
      setSynthesis('Failed to prompt dynamic AI engine. Please verify the Gemini API key in your workspace configurations.');
    } finally {
      setIsSynthesizing(false);
    }
  };

  // Goal 3: Parallelized / Batch Synthesis Mode for all communities
  const handleBatchSynthesize = async () => {
    if (communities.length === 0 || !ai) return;
    setIsBatchProcessing(true);
    setBatchReports([]);
    setBatchProgress({ current: 0, total: communities.length });

    const reports: { id: number; title: string; content: string }[] = [];

    for (let i = 0; i < communities.length; i++) {
      const comm = communities[i];
      const commId = comm.id;
      setBatchProgress(prev => ({ ...prev, current: i + 1 }));

      const labelsText = comm.nodes.map(n => `ID: ${n.id} (Label: "${n.label}", Type: ${n.type})`).join(',\n');

      try {
        const prompt = `You are the AutoNarrative Semantic Oracle, analyzing the dynamic topological cluster ID "${commId}" of the Journal314 REN philosophy network.
        
Here is the raw data substrate of nodes belonging to this cluster:
${labelsText}

Perform a rigorous, Phase 2 Synthesis of this cluster. 
1. Assign a highly conceptual, dense title representing the core philosophical topic mapping these nodes together.
2. Outline the underlying conceptual resonance, explaining how these ideas form a cohesive structural worldview. Use the vocabulary of Nihiltheistic topology (groundlessness, apophasis, A-Series).
3. Do NOT include generic filler intro/outro. Provide deep, dense, academic philosophical synthesis in clean Markdown format.`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.0-flash',
          contents: prompt
        });

        const text = response.text || 'No synthesis generated.';
        
        let autoTitle = `CLUSTER_${commId}_SYNTHESIS`;
        const titleMatch = text.match(/#+\s+(.*)/);
        if (titleMatch && titleMatch[1]) {
          autoTitle = titleMatch[1].trim();
        }

        setAutoLabels(prev => ({ ...prev, [commId]: autoTitle }));
        setAutoSummaries(prev => ({ ...prev, [commId]: text }));

        reports.push({
          id: commId,
          title: autoTitle,
          content: text
        });
      } catch (e) {
        console.error(`Batch processing failed for Cluster ${commId}:`, e);
        reports.push({
          id: commId,
          title: `CLUSTER_${commId}_ERR`,
          content: `Batch prompt failure: ${e}`
        });
      }
    }

    setBatchReports(reports);
    setIsBatchProcessing(false);
    logOptimization('UX', `Executed Batch Synthesis for ${communities.length} clusters.`);
  };

  // Goal 4: Side-by-side programmatic comparison & dynamic Venn state generator
  const getComparisonData = () => {
    if (selectedCompareIds.length < 2) return null;
    const idA = selectedCompareIds[0];
    const idB = selectedCompareIds[1];
    const commA = communities.find(c => c.id === idA);
    const commB = communities.find(c => c.id === idB);
    if (!commA || !commB) return null;

    // Collate thematic tags
    const tagsA = new Set<string>();
    commA.nodes.forEach(n => n.metadata?.tags?.forEach(t => tagsA.add(t)));
    const tagsB = new Set<string>();
    commB.nodes.forEach(n => n.metadata?.tags?.forEach(t => tagsB.add(t)));

    // Venn programmatic intersection and difference arrays
    const sharedTags = Array.from(tagsA).filter(t => tagsB.has(t));
    const uniqueTagsA = Array.from(tagsA).filter(t => !tagsB.has(t));
    const uniqueTagsB = Array.from(tagsB).filter(t => !tagsA.has(t));

    // Shared node types
    const typesA = Array.from(new Set(commA.nodes.map(n => n.type)));
    const typesB = Array.from(new Set(commB.nodes.map(n => n.type)));
    const sharedTypes = typesA.filter(t => typesB.includes(t));

    return {
      idA,
      idB,
      commA,
      commB,
      sharedTags,
      uniqueTagsA,
      uniqueTagsB,
      sharedTypes
    };
  };

  const compData = getComparisonData();

  const handleCompareClusters = async () => {
    if (!compData || !ai) return;

    setIsComparing(true);
    setComparisonReport(null);

    const labelsA = compData.commA.nodes.map(n => n.label).join(', ');
    const labelsB = compData.commB.nodes.map(n => n.label).join(', ');

    try {
      const prompt = `Compare Cluster ${compData.idA} and Cluster ${compData.idB} in the Journal314 REN philosophical network.

Cluster ${compData.idA} encompasses these nodes: ${labelsA}
Cluster ${compData.idB} encompasses these nodes: ${labelsB}

Logical Venn elements discovered:
- Programmatic Intersect Tags: ${compData.sharedTags.join(', ') || 'None found programmatically'}
- Unique Cluster ${compData.idA} Tags: ${compData.uniqueTagsA.join(', ')}
- Unique Cluster ${compData.idB} Tags: ${compData.uniqueTagsB.join(', ')}

Please perform deep recursive theme densification (using gemini-1.5-pro capabilities):
1. Substrate Contrast analysis. Write on what distinguishes their philosophical structures.
2. Bridge Thesis: Outline shared ground and concepts that connect these apparent opposites.
Provide directly in dense, clean academic format formatted for easy reading.`;

      const response = await ai.models.generateContent({
        model: 'gemini-1.5-pro',
        contents: prompt
      });

      setComparisonReport(response.text || 'No comparison analysis generated.');
    } catch (e) {
      console.error(e);
      setComparisonReport('Comparative engine error. Verify your platform configs.');
    } finally {
      setIsComparing(false);
    }
  };

  return (
    <div className="w-full h-full flex bg-zinc-950 text-zinc-100 font-mono relative overflow-hidden">
      
      {/* Content wrapper */}
      <div className="flex-1 flex flex-col p-6 overflow-hidden relative z-10">
        
        {/* Decorative Grid overlays */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.03),transparent)] pointer-events-none" />

        {/* Header bar */}
        <div className="flex-shrink-0 flex flex-col md:flex-row md:items-center justify-between pb-4 mb-4 border-b border-white/5">
          <div>
            <div className="flex items-center gap-3">
              <Network className="w-6 h-6 text-emerald-500" />
              <h1 className="text-xl font-bold tracking-widest text-zinc-100 uppercase">Global Topology</h1>
            </div>
            <p className="text-xs text-zinc-400 mt-1 max-w-xl">
              An interactive D3 force-directed visualization grouping the knowledge substrate into dense Louvain topological clusters. Click nodes to focus on specific cliques.
            </p>
          </div>
          <div className="flex items-center gap-4 mt-3 md:mt-0 text-xs font-mono border-l-2 border-emerald-500/30 pl-4 py-1 bg-white/[0.01]">
            <div>
              <span className="text-zinc-500">NODES</span>
              <p className="font-bold text-zinc-200">{nodes.length}</p>
            </div>
            <div>
              <span className="text-zinc-500">LINKS</span>
              <p className="font-bold text-zinc-200">{links.length}</p>
            </div>
            <div>
              <span className="text-zinc-500">CLUSTERS</span>
              <p className="font-bold text-emerald-400">{communities.length}</p>
            </div>
          </div>
        </div>

        {/* Dashboard Panels Layout */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 overflow-hidden">
          
          {/* Column 1: Control Rail & Types (W=1) */}
          <div className="lg:col-span-1 flex flex-col gap-5 overflow-y-auto custom-scrollbar pr-1">
            
            {/* Search */}
            <div className="bg-zinc-900/40 p-4 border border-white/5 rounded-xl backdrop-blur-md">
              <label className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-2 block">Scented Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  placeholder="FILTER BY LABELS..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-black/60 border border-white/5 pl-9 pr-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-600 rounded-lg focus:outline-none focus:border-emerald-500/30 transition-colors uppercase font-mono tracking-wider"
                />
              </div>
            </div>

            {/* Goal 2: Visible / Hidden Louvain Communities component */}
            <div className="bg-zinc-900/40 p-4 border border-white/5 rounded-xl backdrop-blur-md">
              <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest block mb-3">Louvain Community Filters</span>
              <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar pr-1 font-mono">
                {communities.map(c => {
                  const isVisible = !hiddenClusterIds.has(c.id);
                  return (
                    <button
                      key={c.id}
                      onClick={() => toggleClusterVisibility(c.id)}
                      className={cn(
                        "w-full text-left text-[10px] px-3 py-2 border rounded-lg transition-all flex items-center justify-between font-mono cursor-pointer",
                        isVisible
                          ? "bg-zinc-900/40 border-white/5 text-zinc-300 hover:bg-zinc-800/40"
                          : "bg-black/40 border-dashed border-white/5 text-zinc-600 line-through"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span 
                          className={cn("w-2 h-2 rounded-full", !isVisible && "opacity-30")} 
                          style={{ backgroundColor: getClusterColor(c.id) }} 
                        />
                        <span>CLUSTER {c.id}</span>
                      </div>
                      <span className="text-[8px] bg-white/5 px-1 rounded text-zinc-500">
                        {c.nodes.length} N
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Filter by Entity Type */}
            <div className="bg-zinc-900/40 p-4 border border-white/5 rounded-xl backdrop-blur-md">
              <div className="flex items-center gap-2 mb-3">
                <Filter className="w-4 h-4 text-zinc-400" />
                <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest">Filter Entity Type</span>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                {allNodeTypes.map(type => (
                  <button
                    key={type}
                    onClick={() => toggleNodeType(type)}
                    className={cn(
                      "w-full text-left text-xs px-3 py-2 border rounded-lg transition-all flex items-center justify-between font-mono cursor-pointer",
                      selectedNodeTypes.has(type)
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                        : "bg-black/20 border-white/5 text-zinc-400 hover:border-white/10"
                    )}
                  >
                    <span className="uppercase">{type}</span>
                    <span className="text-[9px] bg-white/5 px-1.5 py-0.5 rounded text-zinc-500">
                      {nodes.filter(n => n.type === type).length}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Parameters Adjustments */}
            <div className="bg-zinc-900/40 p-4 border border-white/5 rounded-xl backdrop-blur-md space-y-4">
              <label className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest block border-b border-white/5 pb-2">Physics Forces</label>
              
              {/* Goal 5: Orbit or Centroid Gravity Mode Toggle */}
              <div className="flex flex-col gap-2">
                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Layout Gravity Mode</span>
                <div className="grid grid-cols-2 gap-1 bg-black/60 p-1 rounded-lg border border-white/5">
                  <button
                    onClick={() => setGravityFocused(false)}
                    className={cn(
                      "py-1.5 text-[9px] font-bold uppercase rounded-md transition-all font-mono cursor-pointer",
                      !gravityFocused 
                        ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400" 
                        : "text-zinc-500 hover:text-zinc-300"
                    )}
                  >
                    Standard
                  </button>
                  <button
                    onClick={() => setGravityFocused(true)}
                    className={cn(
                      "py-1.5 text-[9px] font-bold uppercase rounded-md transition-all font-mono cursor-pointer",
                      gravityFocused 
                        ? "bg-purple-500/10 border border-purple-500/30 text-purple-400" 
                        : "text-zinc-500 hover:text-zinc-300"
                    )}
                  >
                    Orbit Gravity
                  </button>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[10px] font-mono text-zinc-400 mb-1">
                  <span>LINK STRETCH</span>
                  <span className="text-zinc-200">{linkDistance}px</span>
                </div>
                <input
                  type="range"
                  min="60"
                  max="250"
                  value={linkDistance}
                  onChange={(e) => setLinkDistance(Number(e.target.value))}
                  className="w-full accent-emerald-500 bg-zinc-800 h-1 rounded cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[10px] font-mono text-zinc-400 mb-1">
                  <span>REPULSIVENESS</span>
                  <span className="text-zinc-200">{chargeStrength}</span>
                </div>
                <input
                  type="range"
                  min="-600"
                  max="-50"
                  value={chargeStrength}
                  onChange={(e) => setChargeStrength(Number(e.target.value))}
                  className="w-full accent-emerald-500 bg-zinc-800 h-1 rounded cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[10px] font-mono text-zinc-400 mb-1">
                  <span>CLUSTERING GRAVITY</span>
                  <span className="text-zinc-200">{clusteringStrength.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.01"
                  max="0.5"
                  step="0.01"
                  value={clusteringStrength}
                  onChange={(e) => setClusteringStrength(Number(e.target.value))}
                  className="w-full accent-emerald-500 bg-zinc-800 h-1 rounded cursor-pointer"
                />
              </div>
            </div>

            {/* Micro Legenda */}
            <div className="bg-zinc-900/40 p-4 border border-white/5 rounded-xl backdrop-blur-md">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-3">Clustering Legend</span>
              <div className="grid grid-cols-2 gap-2 text-[9px] font-mono">
                {communities.slice(0, 8).map(c => (
                  <div key={c.id} className="flex items-center gap-2 truncate">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: getClusterColor(c.id) }} />
                    <span className="text-zinc-300 truncate">CLUSTER_{c.id}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Column 2: Interactive SVG Area (W=3) */}
          <div className="lg:col-span-3 flex flex-col bg-zinc-950 border border-white/5 relative overflow-hidden rounded-xl shadow-2xl">
            
            {/* Viewport Control Anchors */}
            <div className="absolute top-4 right-4 z-20 flex gap-2">
              <button 
                onClick={handleZoomIn}
                className="p-2.5 bg-zinc-900/80 border border-white/5 hover:border-emerald-500/30 text-zinc-400 hover:text-emerald-400 rounded-lg backdrop-blur-md shadow-lg transition-all cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button 
                onClick={handleZoomOut}
                className="p-2.5 bg-zinc-900/80 border border-white/5 hover:border-emerald-500/30 text-zinc-400 hover:text-emerald-400 rounded-lg backdrop-blur-md shadow-lg transition-all cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button 
                onClick={handleResetZoom}
                className="p-2.5 bg-zinc-900/80 border border-white/5 hover:border-emerald-500/30 text-zinc-400 hover:text-emerald-400 rounded-lg backdrop-blur-md shadow-lg transition-all cursor-pointer"
                title="Reset Fit / Clear Selection"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Selected Cluster Banner */}
            {selectedClusterId !== null && !comparisonMode && (
              <div className="absolute top-4 left-4 z-20 bg-emerald-500/10 border border-emerald-500/30 px-4 py-2 text-xs font-mono rounded-lg backdrop-blur-md flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ backgroundColor: getClusterColor(selectedClusterId) }} />
                <span>ACTIVE FILTER: <strong className="text-emerald-400">CLUSTER_{selectedClusterId}</strong></span>
                <button 
                  onClick={handleResetZoom}
                  className="text-zinc-500 hover:text-zinc-200 font-bold ml-2 text-[10px]"
                >
                  [CLEAR]
                </button>
              </div>
            )}

            {/* Venn Comparison banner instructions */}
            {comparisonMode && (
              <div className="absolute top-4 left-4 z-20 bg-purple-500/10 border border-purple-500/30 px-4 py-2 text-xs font-mono rounded-lg backdrop-blur-md flex items-center gap-3">
                <GitCompare className="w-4 h-4 text-purple-400 animate-spin" />
                <span>VENN COMPARISON BUILDER: <strong className="text-purple-400">{selectedCompareIds.length}/2</strong> SELECTED</span>
                <button 
                  onClick={() => {
                    setSelectedCompareIds([]);
                    setComparisonReport(null);
                  }}
                  className="text-zinc-500 hover:text-zinc-200 font-bold ml-2 text-[10px]"
                >
                  [RESET]
                </button>
              </div>
            )}

            {/* Map Canvas Canvas */}
            <div className="flex-1 relative cursor-move bg-black select-none">
              <svg ref={d3Container} className="w-full h-full" />

              {/* Dynamic Absolute Hover Tooltip */}
              <AnimatePresence>
                {hoveredNode && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.1 }}
                    style={{ left: tooltipPos.x, top: tooltipPos.y }}
                    className="absolute z-50 p-4 bg-zinc-950/95 border-l-2 border-emerald-500 border border-white/10 rounded-xl backdrop-blur-md shadow-2xl font-mono text-xs w-72 pointer-events-none"
                  >
                    <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2">
                      <span className="text-[10px] text-zinc-500 uppercase tracking-widest">{hoveredNode.type}</span>
                      <span className="text-[9px] font-bold px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase rounded">
                        CLUSTER_{hoveredNode.communityId}
                      </span>
                    </div>
                    <h3 className="font-serif font-bold text-zinc-100 text-sm mb-1 leading-tight">{hoveredNode.label}</h3>
                    {hoveredNode.status && (
                      <p className="text-[9px] text-zinc-500 mt-2 font-bold uppercase tracking-wider">
                        STATUS: <span className="text-zinc-300">{hoveredNode.status}</span>
                      </p>
                    )}
                    <div className="mt-3 pt-2 border-t border-white/5 flex gap-2 items-center text-[9px] text-[#A1A1AA] uppercase">
                      <Cpu className="w-3.5 h-3.5 text-zinc-500" />
                      <span>{comparisonMode ? 'Click to select for comparison' : 'Click node to reveal metadata'}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

        </div>
      </div>

      {/* Right Sidebar: Cluster Details & Narrative Synthesis panel / Venn side-by-side mode */}
      <div className="w-[380px] bg-zinc-950/60 border-l border-white/5 flex flex-col relative z-20">
        
        {/* Scrutiny Header */}
        <div className="p-6 border-b border-white/5 bg-zinc-900/20 flex justify-between items-center">
          <div>
            <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-widest flex items-center gap-3">
              <Layers className="w-5 h-5 text-emerald-400" />
              Cluster Scrutiny
            </h2>
            <p className="text-[10px] text-zinc-500 font-mono mt-1 leading-relaxed">
              Analyze computed communities on the dynamic substrate graph.
            </p>
          </div>
          <div>
            <button
              onClick={() => {
                setComparisonMode(!comparisonMode);
                setSelectedCompareIds([]);
                setComparisonReport(null);
              }}
              className={cn(
                "px-2.5 py-1.5 text-[9px] font-bold uppercase rounded-lg border tracking-widest transition-all font-mono cursor-pointer",
                comparisonMode 
                  ? "bg-[#FF00FF]/15 border-[#FF00FF]/50 text-[#FF00FF]" 
                  : "bg-black/40 border-white/5 text-zinc-500 hover:text-zinc-300"
              )}
              title="Venn Comparison Mode between 2 clusters"
            >
              VENN
            </button>
          </div>
        </div>

        {/* Dynamic Sidebar Content wrapper */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
          
          {comparisonMode ? (
            /* ========================================================= */
            /* GOAL 4: VENN side-by-side comparison panel view */
            /* ========================================================= */
            <div className="space-y-6">
              
              <div className="p-4 border border-purple-500/20 bg-purple-500/[0.02] rounded-xl font-mono">
                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest block mb-2">Venn Comparer Selected Cliques</span>
                <p className="text-[10px] text-zinc-400 leading-relaxed mb-4">
                  Select 2 groups below or click circles on the topological model to run Venn concept subtraction.
                </p>

                <div className="space-y-2">
                  {communities.map(comm => {
                    const isSelected = selectedCompareIds.includes(comm.id);
                    return (
                      <button
                        key={comm.id}
                        onClick={() => {
                          setSelectedCompareIds(prev => {
                            const hasId = prev.includes(comm.id);
                            let next: number[];
                            if (hasId) {
                              next = prev.filter(id => id !== comm.id);
                            } else {
                              next = [...prev, comm.id].slice(0, 2);
                            }
                            return next;
                          });
                        }}
                        className={cn(
                          "w-full text-left p-2.5 border rounded-lg transition-all flex items-center justify-between font-mono cursor-pointer text-xs",
                          isSelected
                            ? "bg-purple-500/10 border-purple-500/40 text-purple-300 font-bold"
                            : "bg-black/40 border-white/5 text-zinc-400 hover:border-white/10"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getClusterColor(comm.id) }} />
                          <span>CLUSTER {comm.id}</span>
                        </div>
                        {isSelected && <span className="text-[8px] bg-purple-500 text-white font-bold px-1.5 py-0.5 rounded uppercase">COMPARING</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {compData ? (
                <div className="space-y-6">
                  {/* Dynamic Concept Venn diagram using Tailwind CSS layering */}
                  <div className="relative h-44 flex items-center justify-center font-mono select-none overflow-hidden border border-white/5 bg-zinc-950/80 rounded-xl p-2 shadow-2xl">
                    
                    {/* Left Circle */}
                    <div className="absolute left-[12%] w-32 h-32 rounded-full bg-emerald-500/10 border-2 border-dashed border-emerald-500/30 flex flex-col justify-center items-center p-3 text-center transition-all">
                      <span className="text-[10px] font-bold text-emerald-400">CLUSTER {compData.idA}</span>
                      <span className="text-[8px] text-zinc-500 mt-1 uppercase tracking-widest truncate max-w-[80px]">
                        {compData.uniqueTagsA.slice(0, 2).join(', ') || 'Thematic base'}
                      </span>
                    </div>

                    {/* Right Circle */}
                    <div className="absolute right-[12%] w-32 h-32 rounded-full bg-purple-500/10 border-2 border-dashed border-purple-500/30 flex flex-col justify-center items-center p-3 text-center transition-all">
                      <span className="text-[10px] font-bold text-purple-400">CLUSTER {compData.idB}</span>
                      <span className="text-[8px] text-zinc-500 mt-1 uppercase tracking-widest truncate max-w-[80px]">
                        {compData.uniqueTagsB.slice(0, 2).join(', ') || 'Thematic base'}
                      </span>
                    </div>

                    {/* Intersection core overlay */}
                    <div className="absolute z-10 w-24 h-24 rounded-full bg-zinc-900 border border-white/15 flex flex-col justify-center items-center p-2 text-center shadow-lg">
                      <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">BRIDGE</span>
                      <span className="text-[10px] font-bold text-emerald-400 mt-1">{compData.sharedTags.length} COMMON</span>
                      <span className="text-[7px] text-zinc-500 mt-0.5 truncate max-w-[70px]">
                        {compData.sharedTags.slice(0, 1).join(', ') || 'Substrate resonance'}
                      </span>
                    </div>
                  </div>

                  {/* Dynamic Details List of distinct vs shared concepts */}
                  <div className="space-y-4 font-mono">
                    <div className="space-y-2">
                      <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Bridging Shared Tags</span>
                      {compData.sharedTags.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {compData.sharedTags.map((t, idx) => (
                            <span key={idx} className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] px-2 py-0.5 rounded">
                              {t}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[9px] text-zinc-600 italic">No programmatic tag overlaps found in local substrate metadata.</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4">
                      <div>
                        <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">Cluster {compData.idA} Base</span>
                        <div className="flex flex-wrap gap-1 mt-1 text-[8px] text-zinc-400">
                          {compData.uniqueTagsA.slice(0, 4).map((t, idx) => (
                            <span key={idx} className="bg-white/5 px-1 py-0.5 rounded truncate max-w-full">{t}</span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-purple-400 uppercase tracking-widest">Cluster {compData.idB} Base</span>
                        <div className="flex flex-wrap gap-1 mt-1 text-[8px] text-zinc-400">
                          {compData.uniqueTagsB.slice(0, 4).map((t, idx) => (
                            <span key={idx} className="bg-white/5 px-1 py-0.5 rounded truncate max-w-full">{t}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Venn Comparative prompting */}
                  <div>
                    <button
                      onClick={handleCompareClusters}
                      disabled={isComparing || !ai}
                      className="w-full bg-zinc-900 text-white border border-white/10 hover:border-purple-400/40 text-xs font-semibold py-3 flex items-center justify-center gap-3 rounded-xl cursor-pointer shadow-lg active:scale-98 disabled:opacity-50"
                    >
                      {isComparing ? (
                        <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                      ) : (
                        <Sparkles className="w-4 h-4 text-purple-400" />
                      )}
                      {ai ? 'GENERATE COMPARATIVE INSIGHT' : 'GEMINI API KEY REQUIRED'}
                    </button>
                  </div>

                  {comparisonReport && (
                    <div className="p-5 bg-black/60 border border-purple-500/20 rounded-xl max-h-96 overflow-y-auto custom-scrollbar">
                      <div className="markdown-body text-zinc-300 text-xs font-mono leading-relaxed space-y-4">
                        <Markdown>{comparisonReport}</Markdown>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-5 border border-dashed border-white/10 rounded-xl text-center bg-black/20">
                  <Info className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
                  <span className="text-zinc-400 text-xs font-bold uppercase tracking-widest block mb-2">Select 2 clusters</span>
                  <p className="text-[10px] text-zinc-500 leading-relaxed">
                    To synthesize comparative dynamics, toggle selection chips for two community clusters above in the roster lists.
                  </p>
                </div>
              )}

            </div>
          ) : selectedClusterId !== null ? (
            /* ========================================================= */
            /* Standard Cluster Details Mode */
            /* ========================================================= */
            <div className="space-y-6">
              
              {/* Cluster Meta */}
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1.5 h-full" style={{ backgroundColor: getClusterColor(selectedClusterId) }} />
                <div className="pl-2">
                  <h3 className="text-lg font-bold text-zinc-100 tracking-wider">
                    {autoLabels[selectedClusterId] || `CYPHER_CLUSTER_${selectedClusterId}`}
                  </h3>
                  <div className="flex items-center gap-3 mt-3">
                    <span className="text-[10px] font-bold px-2.5 py-1 bg-white/5 border border-white/10 text-zinc-300 uppercase tracking-widest">
                      {communities.find(c => c.id === selectedClusterId)?.nodes.length || 0} Entities
                    </span>
                  </div>
                </div>
              </div>

              {/* Cluster Elements */}
              <div className="space-y-2">
                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Encompassed Nodes</span>
                <div className="grid grid-cols-2 gap-2">
                  {communities.find(c => c.id === selectedClusterId)?.nodes.map(n => (
                    <button
                      key={n.id}
                      onClick={() => {
                        setSelectedNodeId(n.id);
                        setSidebarMode('details');
                        setRightSidebarOpen(true);
                      }}
                      className="text-left text-[10px] font-mono border border-white/5 bg-black/40 hover:bg-zinc-900/60 transition-colors p-2 truncate rounded-lg group cursor-pointer"
                    >
                      <span className="text-zinc-500 uppercase font-bold text-[8px] block">{n.type}</span>
                      <strong className="text-zinc-300 group-hover:text-emerald-400 transition-colors">{n.label}</strong>
                    </button>
                  ))}
                </div>
              </div>

              {/* AI Synsthesis Narrative */}
              <div>
                <button
                  onClick={() => handleSynthesizeCluster(selectedClusterId)}
                  disabled={isSynthesizing || !ai}
                  className="w-full bg-zinc-900 text-white border border-white/10 hover:border-emerald-500/30 text-zinc-100 disabled:opacity-50 text-xs font-semibold tracking-widest py-3.5 flex items-center justify-center gap-3 transition-colors rounded-xl cursor-pointer shadow-lg hover:shadow-emerald-500/5"
                >
                  {isSynthesizing ? (
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                  ) : (
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                  )}
                  {ai ? 'SYNTHESIZE CONCEPTUAL LINK' : 'GEMINI API KEY REQUIRED'}
                </button>
              </div>

              {/* Rendering synthesized text */}
              {isSynthesizing && (
                <div className="flex flex-col items-center justify-center py-10 bg-black/40 rounded-xl border border-white/5">
                  <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
                  <span className="text-[10px] text-zinc-500 font-bold tracking-widest mt-3">PROMPTING THE SEMANTIC ORACLE...</span>
                </div>
              )}

              {synthesis && !isSynthesizing && (
                <div className="p-5 bg-black/60 border border-white/5 rounded-xl max-h-96 overflow-y-auto custom-scrollbar">
                  <div className="markdown-body text-zinc-300 text-xs font-mono leading-relaxed space-y-4">
                    <Markdown>{synthesis}</Markdown>
                  </div>
                </div>
              )}

            </div>
          ) : (
            /* ========================================================= */
            /* Fallback Lists Mode and Goal 3 Summarized Batch View */
            /* ========================================================= */
            <div className="space-y-6">
              
              {/* Fallback instruction list */}
              <div className="p-5 border border-dashed border-white/10 rounded-xl text-center bg-black/20">
                <Info className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
                <span className="text-zinc-400 text-xs font-bold uppercase tracking-widest block mb-2">No focused cluster</span>
                <p className="text-[10px] text-zinc-500 leading-relaxed font-mono">
                  Interact with nodes on the graph canvas or select an overview cluster below to initiate deep semantic parsing.
                </p>
              </div>

              {/* Goal 3: Parallelized Batch processing progress component */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Calculated Substrates</span>
                  <button
                    onClick={handleBatchSynthesize}
                    disabled={isBatchProcessing || !ai}
                    className="text-[9px] bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 hover:border-emerald-500/40 px-2 py-1 rounded font-bold uppercase transition-colors cursor-pointer disabled:opacity-40"
                    title="Generate AI Syntheses for all computed community clusters in batch"
                  >
                    🚀 BATCH ALL ({communities.length})
                  </button>
                </div>

                {isBatchProcessing && (
                  <div className="p-4 bg-zinc-900 border border-white/5 rounded-xl space-y-3">
                    <div className="flex justify-between text-[10px] font-bold uppercase text-zinc-400">
                      <span>Batch Synthesizing All</span>
                      <span className="text-emerald-400">{batchProgress.current} / {batchProgress.total}</span>
                    </div>
                    <div className="w-full bg-zinc-950 rounded h-1.5 overflow-hidden">
                      <div 
                        className="bg-emerald-500 h-full transition-all duration-300"
                        style={{ width: `${(batchProgress.current / batchProgress.total) * 100}%` }}
                      />
                    </div>
                    <p className="text-[8px] text-zinc-500 font-mono tracking-wider animate-pulse uppercase">
                      Prompting semantic details in parallel substrate...
                    </p>
                  </div>
                )}

                {/* Goal 3 summarized dynamic report list view */}
                {batchReports && (
                  <div className="p-4 bg-zinc-950 border border-emerald-500/30 rounded-xl space-y-4 shadow-2xl">
                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Batch Summarized Report</span>
                      <button 
                        onClick={() => setBatchReports(null)}
                        className="text-[9px] text-zinc-500 hover:text-zinc-200 cursor-pointer"
                      >
                        [CLOSE]
                      </button>
                    </div>
                    <div className="space-y-4 max-h-72 overflow-y-auto custom-scrollbar pr-1 font-mono">
                      {batchReports.map(report => (
                        <div key={report.id} className="p-3 bg-white/[0.02] border border-white/5 rounded-lg space-y-2">
                          <div className="flex justify-between items-center bg-black/60 p-2 border border-white/5 rounded">
                            <span className="text-[9px] text-zinc-400 font-bold">CLUSTER {report.id}</span>
                            <span className="text-[8px] text-emerald-500 font-bold uppercase truncate max-w-[150px]">{report.title}</span>
                          </div>
                          <div className="text-[9px] text-zinc-400 leading-relaxed max-h-24 overflow-y-auto custom-scrollbar">
                             <Markdown>{report.content}</Markdown>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  {communities.map(comm => (
                    <button
                      key={comm.id}
                      onClick={() => setSelectedClusterId(comm.id)}
                      className="w-full text-left p-3.5 border border-white/5 bg-black/40 hover:border-emerald-500/20 hover:bg-zinc-900/20 rounded-xl transition-all flex items-center justify-between group cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getClusterColor(comm.id) }} />
                        <span className="text-xs font-bold text-zinc-300">CLUSTER {comm.id}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] bg-white/5 border border-white/10 text-zinc-400 font-bold px-2 py-0.5 rounded">
                          {comm.nodes.length} N
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-emerald-500 transition-colors" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
