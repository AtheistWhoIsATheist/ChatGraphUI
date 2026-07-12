import React, { useEffect, useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as d3 from 'd3';
import jLouvain from 'jlouvain';
import { Node, NodeType, Link } from '../data/corpus';
import { NT_NODE_COLORS } from '../data/nt_schema';
import { cn } from '../lib/utils';
import { 
  X, Zap, Link2Off, Layers, Eye, EyeOff, Trash2, Check, FolderPlus, Plus, SlidersHorizontal, ArrowUpRight, HelpCircle
} from 'lucide-react';
import { useGraphLayout } from '../hooks/useGraphLayout';
import { GraphToolbar } from './GraphToolbar';
import { InsightOverlay } from './InsightOverlay';
import { ExpansionPanel } from './ExpansionPanel';
import { AddNodeModal } from './AddNodeModal';
import { logOptimization } from '../utils/selfImprovement';
import { useAppStore } from '../store/appStore';

// --- TYPES & CONSTANTS ---

interface Collection {
  id: string;
  label: string;
  nodeIds: string[]; // member node IDs
  isCollapsed: boolean;
}

const NODE_COLORS: Record<string, string> = {
  treatise: '#0066ff',     // Cosmic Blue
  journal: '#00e5ff',      // Electric Cyan
  thinker: '#ffb703',      // Intense Amber Gold
  theme: '#8a2be2',        // Royal Purple
  concept: '#0066ff',      // Cosmic Blue
  fragment: '#374151',     // Translucent Gunmetal Gray
  methodology: '#00f5d4',   // Radioactive Emerald Green
  claim: '#ff5500',        // HD Burnt Orange
  experience: '#00f5d4',   // Radioactive Emerald Green
  library_item: '#374151', // Translucent Gunmetal Gray
  summary: '#ff5500',      // HD Burnt Orange
  question: '#d946ef',     // Cosmic Fuchsia
  praxis: '#00f5d4',       // Radioactive Emerald Green
  axiom: '#ff5500',        // HD Burnt Orange
  collection: '#f59e0b',   // Packed Amber for collection nodes
  
  // Nihiltheism Ontology specific overrides (ensuring absolute coherence)
  void_concept: '#d946ef', // Cosmic Fuchsia
  paradox: '#d946ef',      // Cosmic Fuchsia
  ren_stage: '#ff5500',    // HD Burnt Orange
  argument: '#0066ff',     // Cosmic Blue
  synthesis: '#00f5d4',    // Radioactive Emerald Green
};

const getHierarchicalColor = (node: Node) => {
  if (node.id === 'void') return '#ffffff'; // The Singularity is pure light
  if (['presence', 'collapse', 'spiritual_emergency', 'the_religious_experience_of_nihilism'].includes(node.id)) return '#d946ef'; // Cosmic Fuchsia
  if (['anti_reification', 'kenotic_constraints', 'ontodicy_collapse', 'ren_phenomenology'].includes(node.id) || node.id.includes('framework')) return '#00e5ff'; // Electric Cyan
  if (node.type === 'collection') {
    return node.metadata?.isCollapsed ? '#f59e0b' : '#10b981'; // Amber if collapsed, Emerald if expanded
  }
  return NODE_COLORS[node.type] || NODE_COLORS[node.type as string] || '#00f5d4';
};

export const KnowledgeGraph = React.memo(function KnowledgeGraph({ 
  onNodeSelect: externalOnNodeSelect, 
}: { 
  onNodeSelect?: (node: Node) => void; 
}) {
  const { 
    nodes, 
    links: initialLinks, 
    selectedNodeId, 
    setSelectedNodeId, 
    setSidebarMode, 
    setRightSidebarOpen,
    addNode, 
    addLink 
  } = useAppStore();

  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });
  const [clusterMode, setClusterMode] = useState(false);
  const [showLatent, setShowLatent] = useState(false);
  const [gravity, setGravity] = useState(50);
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [hoveredLink, setHoveredLink] = useState<any>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [expandedNodeId, setExpandedNodeId] = useState<string | null>(null);
  const [transform, setTransform] = useState({ x: 0, y: 0, k: 1 });
  const [isToolbarOpen, setIsToolbarOpen] = useState(true);
  const [structuralIntegrity, setStructuralIntegrity] = useState(true);
  
  // Collections & Multi-Select States
  const [collections, setCollections] = useState<Collection[]>(() => {
    try {
      const saved = localStorage.getItem('knowledge_graph_collections');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('knowledge_graph_collections', JSON.stringify(collections));
  }, [collections]);

  const [selectedNodeIds, setSelectedNodeIds] = useState<Set<string>>(new Set());
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [hoveredCollectionId, setHoveredCollectionId] = useState<string | null>(null);
  const [isCollectionsHubExpanded, setIsCollectionsHubExpanded] = useState(false);
  const [showLinkStrengthLegend, setShowLinkStrengthLegend] = useState(true);

  // Manual Node Add State
  const [isAddingNode, setIsAddingNode] = useState(false);
  const [newNode, setNewNode] = useState({ label: '', type: 'concept' });
  
  // Visual & Spacing styling
  const [nodeStylePreset, setNodeStylePreset] = useState<'void-glow' | 'glass' | 'neon' | 'solid'>('void-glow');
  const [nodeSpacing, setNodeSpacing] = useState(70);

  // Filters
  const [activeTypes, setActiveTypes] = useState<Set<string>>(new Set());
  const [activeStatuses, setActiveStatuses] = useState<Set<string>>(new Set());

  // Track latest layout coordinates to place collection nodes at centroid
  const latestCoordsRef = useRef<Map<string, { x: number; y: number }>>(new Map());

  // Collection Handlers
  const handleCreateCollection = () => {
    if (selectedNodeIds.size < 2) return;
    
    // Auto-create a cool descriptive default name based on first selected nodes
    const selectedLabels = Array.from(selectedNodeIds)
      .map(id => nodes.find(n => n.id === id)?.label || '')
      .filter(Boolean);
    
    let defaultLabel = `Collection of ${selectedNodeIds.size} nodes`;
    if (selectedLabels.length >= 2) {
      defaultLabel = `Cluster: ${selectedLabels[0]} & ${selectedLabels[1]}`;
      if (selectedLabels.length > 2) {
        defaultLabel += ` (+${selectedLabels.length - 2})`;
      }
    }

    const label = newCollectionName.trim() || defaultLabel;
    const newCol: Collection = {
      id: `collection-${Date.now()}`,
      label,
      nodeIds: Array.from(selectedNodeIds),
      isCollapsed: true // default to collapsed to manage complexity!
    };
    
    setCollections(prev => [...prev, newCol]);
    setSelectedNodeIds(new Set());
    setNewCollectionName('');
    setMultiSelectMode(false);
    
    logOptimization('refactor', 'Grouped multiple nodes into a visual collection', { 
      collectionId: newCol.id, 
      label, 
      nodesCount: newCol.nodeIds.length 
    });
  };

  const handleToggleCollectionCollapse = (id: string) => {
    setCollections(prev => prev.map(c => c.id === id ? { ...c, isCollapsed: !c.isCollapsed } : c));
  };

  const handleDissolveCollection = (id: string) => {
    setCollections(prev => prev.filter(c => c.id !== id));
    logOptimization('refactor', 'Dissolved node collection back to normal graph coordinates', { collectionId: id });
  };

  // Preprocess nodes and links to inject collections
  const { processedNodes, processedLinks } = useMemo(() => {
    const collapsedMembers = new Set<string>();
    const expandedMembers = new Set<string>();
    
    collections.forEach(c => {
      if (c.isCollapsed) {
        c.nodeIds.forEach(id => collapsedMembers.add(id));
      } else {
        c.nodeIds.forEach(id => expandedMembers.add(id));
      }
    });

    // 1. Build list of visible nodes
    const finalNodes: Node[] = [];
    
    // Add original nodes that are not collapsed collection members
    nodes.forEach(n => {
      if (!collapsedMembers.has(n.id)) {
        finalNodes.push(n);
      }
    });

    // Add active collection nodes
    collections.forEach(c => {
      // Find average position of member nodes if they exist
      let sumX = 0;
      let sumY = 0;
      let count = 0;
      c.nodeIds.forEach(id => {
        const coord = latestCoordsRef.current.get(id);
        if (coord) {
          sumX += coord.x;
          sumY += coord.y;
          count++;
        }
      });

      const colNode: Node = {
        id: c.id,
        label: c.label,
        type: 'collection',
        status: 'VERIFIED',
        summary: `Group collection of ${c.nodeIds.length} nodes: ${c.nodeIds.map(id => nodes.find(n => n.id === id)?.label || id).join(', ')}`,
        blocks: [
          {
            id: `blk-${c.id}`,
            type: 'text',
            content: `This is an aggregated visual group collection containing ${c.nodeIds.length} nodes:\n\n${c.nodeIds.map(id => `• **${nodes.find(n => n.id === id)?.label || id}** (${nodes.find(n => n.id === id)?.type || 'direct'})`).join('\n')}`,
            metadata: {
              lastEdited: Date.now(),
              sentiment: 'neutral'
            }
          }
        ],
        metadata: {
          isCollection: true,
          isCollapsed: c.isCollapsed,
          nodeIds: c.nodeIds,
          tags: ['collection', 'hierarchy-group'],
          philosophical_stance: 'Topological Aggregation & Complexity Management',
          relation_to_void: 'Folds complex regional topologies into cohesive visual singularities.',
          source_references: ['Dynamic Ontodicy Topography Layer 3']
        }
      };

      // Set initial positions based on centroid of member nodes to prevent erratic jumps
      if (count > 0) {
        (colNode as any).x = sumX / count;
        (colNode as any).y = sumY / count;
      }

      finalNodes.push(colNode);
    });

    // 2. Build list of visible links
    const finalLinks: Link[] = [];

    // Map any node ID to its collapsed collection node ID if applicable
    const getTargetNodeId = (nodeId: string): string => {
      const col = collections.find(c => c.nodeIds.includes(nodeId));
      if (col && col.isCollapsed) {
        return col.id;
      }
      return nodeId;
    };

    initialLinks.forEach(link => {
      const sId = typeof link.source === 'string' ? link.source : (link.source as any).id;
      const tId = typeof link.target === 'string' ? link.target : (link.target as any).id;

      const sourceMapped = getTargetNodeId(sId);
      const targetMapped = getTargetNodeId(tId);

      // Skip internal links (links where both source and target are collapsed in the same collection)
      if (sourceMapped === targetMapped) {
        return;
      }

      finalLinks.push({
        ...link,
        source: sourceMapped,
        target: targetMapped
      });
    });

    // Add physical guide links between expanded collection nodes and members to bind them closely in the physics simulation
    collections.forEach(c => {
      if (!c.isCollapsed) {
        c.nodeIds.forEach(memberId => {
          if (finalNodes.some(n => n.id === memberId)) {
            finalLinks.push({
              source: c.id,
              target: memberId,
              type: 'collection_member',
              weight: 5.0, // Strong gravity pull to group members around collection hub
              properties: {
                score: 1.0
              }
            });
          }
        });
      }
    });

    return { processedNodes: finalNodes, processedLinks: finalLinks };
  }, [nodes, initialLinks, collections]);

  // Dynamically compute existing types and statuses in graph nodes
  const availableTypes = useMemo(() => {
    const typesSet = new Set<string>();
    nodes.forEach(n => {
      if (n.type) typesSet.add(n.type);
    });
    const defaults = ['concept', 'thinker', 'treatise', 'question', 'axiom', 'praxis'];
    defaults.forEach(t => typesSet.add(t));
    return Array.from(typesSet).sort();
  }, [nodes]);

  const availableStatuses = useMemo(() => {
    const statusesSet = new Set<string>();
    nodes.forEach(n => {
      if (n.status) statusesSet.add(n.status);
    });
    const defaults = ['VERIFIED', 'INFERENCE', 'HYPOTHESIS'];
    defaults.forEach(s => statusesSet.add(s));
    return Array.from(statusesSet).sort();
  }, [nodes]);

  // Layout Hook
  const { nodes: layoutNodes, links } = useGraphLayout({
    nodes: processedNodes,
    links: processedLinks,
    width: dimensions.width,
    height: dimensions.height,
    clusterMode,
    gravity,
    nodeSpacing,
    activeFilters: { types: activeTypes, statuses: activeStatuses }
  });

  // Track coordinates changes
  useEffect(() => {
    layoutNodes.forEach(n => {
      if (!isNaN(n.x) && !isNaN(n.y)) {
        latestCoordsRef.current.set(n.id, { x: n.x, y: n.y });
      }
    });
  }, [layoutNodes]);

  const getNodeStyles = (
    node: Node, 
    color: string, 
    matchesSearch: boolean, 
    isSelected: boolean, 
    isHovered: boolean, 
    isConnectedToFocus: boolean, 
    scale: any,
    isMultiSelected: boolean = false
  ) => {
    let borderRadius = "9999px"; // Standard circle
    let borderStyle = "solid";
    
    if (node.type === 'thinker') {
      borderRadius = "35%"; // Soft rounded squircle
    } else if (node.type === 'axiom' || node.type === 'axiom_type' || node.id.includes('axiom')) {
      borderRadius = "8px"; // Compact soft box for axiomatic truths
      borderStyle = "double";
    } else if (node.type === 'question' || node.id.includes('question')) {
      borderRadius = "50% 50% 50% 10%"; // Tear-drop inquiry geometry
    } else if (node.type === 'paradox') {
      borderRadius = "0px"; // Brutalist sharp square
      borderStyle = "dashed";
    } else if (node.type === 'collection') {
      borderRadius = "40%"; // Octagon / squarish collection container
      borderStyle = node.metadata?.isCollapsed ? "dashed" : "double";
    }

    let bgStyle = "";
    let borderStyleValue = "";
    let shadowStyle = "";

    switch (nodeStylePreset) {
      case 'solid':
        bgStyle = isSelected ? '#fff' : color;
        borderStyleValue = isMultiSelected 
          ? '3px dashed #f59e0b'
          : (isSelected || matchesSearch ? '2.5px solid #fff' : `2.5px ${borderStyle} rgba(0,0,0,0.45)`);
        shadowStyle = isMultiSelected
          ? '0 0 30px #f59e0b'
          : (isSelected || isHovered ? `0 0 25px ${color}` : `0 4px 10px rgba(0,0,0,0.45)`);
        break;
      case 'neon':
        bgStyle = isSelected ? `${color}40` : `${color}05`;
        borderStyleValue = isMultiSelected
          ? '2.5px dashed #f59e0b'
          : (isSelected || matchesSearch ? `2.5px solid #fff` : `2.0px ${borderStyle} ${color}`);
        shadowStyle = isMultiSelected
          ? '0 0 35px #f59e0b, inset 0 0 15px #f59e0b'
          : (isSelected || isHovered 
              ? `0 0 35px ${color}, inset 0 0 15px ${color}` 
              : `0 0 12px ${color}45`);
        break;
      case 'glass':
        bgStyle = isSelected ? `${color}35` : `rgba(12, 12, 12, 0.75)`;
        borderStyleValue = isMultiSelected
          ? '2px dashed #f59e0b'
          : (isSelected || matchesSearch ? `2px solid #fff` : `1.2px ${borderStyle} ${color}cc`);
        shadowStyle = isMultiSelected
          ? '0 0 30px #f59e0b'
          : (isSelected || isHovered 
              ? `0 0 30px ${color}80` 
              : `0 4px 12px rgba(0,0,0,0.65)`);
        break;
      case 'void-glow':
      default: // hologram / void-glow
        bgStyle = isSelected ? `${color}` : `${color}15`;
        borderStyleValue = isMultiSelected
          ? '2px dashed #f59e0b'
          : (isSelected || matchesSearch 
              ? '2px solid #fff' 
              : (isHovered || isConnectedToFocus ? `1.5px solid ${color}` : `1px ${borderStyle} ${color}80`));
        shadowStyle = isMultiSelected
          ? '0 0 30px #f59e0b'
          : (isSelected || isHovered 
              ? `0 0 ${20 + scale.glowIntensity * 50}px ${color}` 
              : `0 0 10px rgba(0,0,0,0.5)`);
        break;
    }

    return {
      borderRadius,
      borderStyle,
      backgroundColor: bgStyle,
      border: borderStyleValue,
      boxShadow: shadowStyle,
      width: `${scale.radius * 2}px`,
      height: `${scale.radius * 2}px`,
    };
  };

  // Resize Observer
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(entries => {
      for (let entry of entries) {
        setDimensions({ width: entry.contentRect.width, height: entry.contentRect.height });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Zoom & Pan Handlers using d3-zoom
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const zoom = d3.zoom<HTMLDivElement, unknown>()
      .scaleExtent([0.1, 5])
      .wheelDelta((event) => {
        const damping = 0.5; // 50% decrease for Z-Axis Stabilization
        return -event.deltaY * (event.deltaMode === 1 ? 0.05 : event.deltaMode ? 1 : 0.002) * damping;
      })
      .filter((event) => {
        if (event.type === 'wheel') {
          return event.ctrlKey;
        }
        return event.button === 0 || event.type === 'touchstart';
      })
      .on('zoom', (event) => {
        setTransform({
          x: event.transform.x,
          y: event.transform.y,
          k: event.transform.k
        });
      });

    const selection = d3.select(container);
    selection.call(zoom);
    
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
      }
    };
    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      selection.on('.zoom', null);
      container.removeEventListener('wheel', handleWheel);
    };
  }, []);

  // --- AUTO-CENTER SEARCH MATCH ---
  useEffect(() => {
    if (searchQuery.trim().length > 2) {
      const firstMatch = layoutNodes.find(n => n.label.toLowerCase().includes(searchQuery.toLowerCase()));
      if (firstMatch && !isNaN(firstMatch.x) && !isNaN(firstMatch.y)) {
        const k = Math.max(1.2, transform.k);
        setTransform({
          x: dimensions.width / 2 - firstMatch.x * k,
          y: dimensions.height / 2 - firstMatch.y * k,
          k: k
        });
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  // --- GAP SYNTHESIS LOGIC ---
  const latentLinksBase = useMemo(() => {
    const lLinks: { sourceId: string; targetId: string; reason: string }[] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const n1 = nodes[i];
        const n2 = nodes[j];
        const isLinked = initialLinks.some(l => 
          (typeof l.source === 'string' ? l.source === n1.id : (l.source as any).id === n1.id) && 
          (typeof l.target === 'string' ? l.target === n2.id : (l.target as any).id === n2.id) ||
          (typeof l.source === 'string' ? l.source === n2.id : (l.source as any).id === n2.id) && 
          (typeof l.target === 'string' ? l.target === n1.id : (l.target as any).id === n1.id)
        );
        if (!isLinked) {
          const tags1 = n1.metadata?.tags || [];
          const tags2 = n2.metadata?.tags || [];
          const sharedTags = tags1.filter(t => tags2.includes(t));
          if (sharedTags.length >= 2) {
            lLinks.push({ sourceId: n1.id, targetId: n2.id, reason: `Shared conceptual space: ${sharedTags.join(', ')}` });
          } else if (
            sharedTags.length === 1 &&
            (n1.type === "concept" ||
              n2.type === "concept" ||
              n1.type === "experience" ||
              n2.type === "experience")
          ) {
            lLinks.push({ sourceId: n1.id, targetId: n2.id, reason: `Potential unified voice via: ${sharedTags[0]}` });
          }
        }
      }
    }
    return lLinks;
  }, [nodes, initialLinks]);

  // --- PERMANENT GLOBAL SCALING LOGIC ---
  const nodeDegrees = useMemo(() => {
    const degrees: Record<string, number> = {};
    processedLinks.forEach(link => {
      const sourceId = typeof link.source === 'string' ? link.source : (link.source as any).id;
      const targetId = typeof link.target === 'string' ? link.target : (link.target as any).id;
      degrees[sourceId] = (degrees[sourceId] || 0) + 1;
      degrees[targetId] = (degrees[targetId] || 0) + 1;
    });
    return degrees;
  }, [processedLinks]);

  const centralityScale = useMemo(() => {
    const degrees = Object.values(nodeDegrees);
    const minDegree = degrees.length ? Math.min(...degrees) : 0;
    const maxDegree = degrees.length ? Math.max(...degrees) : 1;
    return d3.scaleLinear()
      .domain([minDegree, maxDegree || 1])
      .range([12, 65]);
  }, [nodeDegrees]);

  const calculateNodeScale = (node: Node) => {
    const degree = nodeDegrees[node.id] || 0;
    const radius = centralityScale(degree);
    const saturation = node.metadata?.saturation_level || 50;
    const aif = (Math.min(degree, 10) / 10) * 0.4 + (saturation / 100) * 0.6;
    
    return {
      radius: node.type === 'collection' ? Math.max(radius * 1.25, 26) : radius, // Make collection hubs bigger
      aif,
      glowIntensity: aif * 0.6,
      auraSize: aif * 25
    };
  };

  const { visibleNodes, visibleLinks, activeLatentLinks } = useMemo(() => {
    if (layoutNodes.length <= 1000) {
      return { 
        visibleNodes: layoutNodes, 
        visibleLinks: links,
        activeLatentLinks: showLatent ? latentLinksBase.map(ll => {
          const source = layoutNodes.find(n => n.id === ll.sourceId);
          const target = layoutNodes.find(n => n.id === ll.targetId);
          if (source && target) return { source, target, reason: ll.reason };
          return null;
        }).filter(Boolean) as { source: any; target: any; reason: string }[] : []
      };
    }
    
    const sortedNodes = [...layoutNodes].sort((a, b) => (nodeDegrees[b.id] || 0) - (nodeDegrees[a.id] || 0));
    const throttledNodes = sortedNodes.slice(0, 1000);
    const throttledNodeIds = new Set(throttledNodes.map(n => n.id));
    
    const throttledLinks = links.filter(link => {
      const sourceId = typeof link.source === 'string' ? link.source : (link.source as any).id;
      const targetId = typeof link.target === 'string' ? link.target : (link.target as any).id;
      return throttledNodeIds.has(sourceId) && throttledNodeIds.has(targetId);
    });

    const throttledLatentLinks = showLatent ? latentLinksBase.filter(ll => throttledNodeIds.has(ll.sourceId) && throttledNodeIds.has(ll.targetId)).map(ll => {
      const source = throttledNodes.find(n => n.id === ll.sourceId);
      const target = throttledNodes.find(n => n.id === ll.targetId);
      if (source && target) return { source, target, reason: ll.reason };
      return null;
    }).filter(Boolean) as { source: any; target: any; reason: string }[] : [];
    
    return { visibleNodes: throttledNodes, visibleLinks: throttledLinks, activeLatentLinks: throttledLatentLinks };
  }, [layoutNodes, links, nodeDegrees, latentLinksBase, showLatent]);

  // --- INSIGHT GENERATOR LOGIC ---
  const getInsights = (nodeId: string) => {
    const node = processedNodes.find(n => n.id === nodeId);
    if (!node) return null;
    
    const connectedLinks = processedLinks.filter(l => 
      (typeof l.source === 'string' ? l.source === nodeId : (l.source as any).id === nodeId) || 
      (typeof l.target === 'string' ? l.target === nodeId : (l.target as any).id === nodeId)
    );
    const degree = connectedLinks.length;
    
    let suggestion = null;
    if (degree < 2) {
      const related = processedNodes.find(n => 
        n.id !== nodeId && 
        n.metadata?.tags?.some(t => node.metadata?.tags?.includes(t))
      );
      suggestion = related ? `Connect to "${related.label}" via shared tag.` : "Expand metadata to find connections.";
    }

    return { degree, suggestion, isSingularity: degree < 2 };
  };

  const selectedInsights = selectedNodeId ? getInsights(selectedNodeId) : null;

  // --- COMMUNITY DETECTION ---
  const communities = useMemo(() => {
    if (processedNodes.length === 0) return {};
    
    const edgeData = processedLinks.map(link => {
      const sourceId = typeof link.source === 'string' ? link.source : (link.source as any).id;
      const targetId = typeof link.target === 'string' ? link.target : (link.target as any).id;
      return { source: sourceId, target: targetId, weight: 1.0 };
    });
    
    const nodeIds = processedNodes.map(n => n.id);
    
    try {
      const jL = jLouvain().nodes(nodeIds).edges(edgeData);
      return jL();
    } catch (e) {
      console.warn("Louvain clustering failed:", e);
      return {};
    }
  }, [processedNodes, processedLinks]);

  const clusterColorScale = useMemo(() => {
    return d3.scaleOrdinal(d3.schemeCategory10);
  }, []);

  const getClusterColor = (node: Node) => {
    const clusterId = communities[node.id];
    if (clusterId !== undefined) {
      return clusterColorScale(clusterId.toString());
    }
    return getHierarchicalColor(node);
  };

  // --- PERSISTENT RELATIONAL WEB LOGIC ---
  const linkWeights = useMemo(() => {
    const weights: Record<string, number> = {};
    processedLinks.forEach(link => {
      const sourceId = typeof link.source === 'string' ? link.source : (link.source as any).id;
      const targetId = typeof link.target === 'string' ? link.target : (link.target as any).id;
      const key = sourceId < targetId ? `${sourceId}-${targetId}` : `${targetId}-${sourceId}`;
      weights[key] = (weights[key] || 0) + 1;
    });
    return weights;
  }, [processedLinks]);

  const linkWeightScale = useMemo(() => {
    const weights = Object.values(linkWeights);
    const minWeight = weights.length ? Math.min(...weights) : 1;
    const maxWeight = weights.length ? Math.max(...weights) : 1;
    return d3.scaleLinear()
      .domain([minWeight, maxWeight || 1])
      .range([1.2, 6.0]);
  }, [linkWeights]);

  const calculateLinkStyle = (link: any) => {
    const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
    const targetId = typeof link.target === 'string' ? link.target : link.target.id;
    
    const sourceNode = processedNodes.find(n => n.id === sourceId);
    const targetNode = processedNodes.find(n => n.id === targetId);
    
    const isFoundational = sourceId === 'void' || targetId === 'void' || 
                          (sourceNode?.type === 'concept' && targetNode?.type === 'concept');
    
    const isSelected = selectedNodeId === sourceId || selectedNodeId === targetId;
    
    const isLinkHovered = hoveredLink && (
      (typeof hoveredLink.source === 'string' ? hoveredLink.source : hoveredLink.source.id) === sourceId &&
      (typeof hoveredLink.target === 'string' ? hoveredLink.target : hoveredLink.target.id) === targetId
    );
    
    const isHovered = hoveredNodeId === sourceId || hoveredNodeId === targetId || isLinkHovered;
    const isFocusMode = !!selectedNodeId || !!hoveredNodeId || !!hoveredLink || !!hoveredCollectionId;
    const isNeighbor = (sourceId === selectedNodeId || targetId === selectedNodeId) || 
                       (sourceId === hoveredNodeId || targetId === hoveredNodeId) || isLinkHovered;
    
    // Compute connection strength (0.0 to 1.0)
    let strength = 0.5;
    if (link.properties?.score !== undefined) {
      strength = Math.min(1.0, Number(link.properties.score));
    } else if (link.weight !== undefined) {
      strength = Math.min(1.0, Number(link.weight) / 5.0);
    } else if (link.score !== undefined) {
      strength = Math.min(1.0, Number(link.score));
    } else {
      if (['tension', 'contradicts', 'supports', 'transcends', 'synthesis'].includes(link.type)) {
        strength = 0.8;
      } else if (link.type === 'collection_member') {
        strength = 1.0;
      } else {
        strength = 0.4;
      }
    }
    const isStrong = strength >= 0.75;
    const isWeak = strength < 0.4;

    // 1. Dynamic Weight & Opacity
    let opacity = structuralIntegrity ? 0.25 : 0.1;
    const linkKey = sourceId < targetId ? `${sourceId}-${targetId}` : `${targetId}-${sourceId}`;
    let width = linkWeightScale(linkWeights[linkKey] || 1);
    
    if (isFoundational) {
      opacity = structuralIntegrity ? 0.5 : 0.2;
      width = 2.2;
    }

    if (isStrong) {
      width = width * 1.4;
      opacity = opacity * 1.5;
    } else if (isWeak) {
      width = 1.0;
      opacity = opacity * 0.6;
    }
    
    if (isFocusMode) {
      if (isSelected || isHovered) {
        opacity = 1.0;
        width = isStrong ? 4.5 : 3.2;
      } else if (isNeighbor) {
        opacity = 0.4;
        width = isStrong ? 2.3 : 1.8;
      } else {
        opacity = 0.01; // Deep Focus: Almost vanish unrelated
      }
    }
    
    // 2. Connection Hierarchy (Visual Style)
    let dashArray = "none";
    let isFlowing = false;
    
    if (isWeak) {
      dashArray = "3,4"; // Weak connections are finely dashed
    } else if (link.type === 'explores') {
      dashArray = "4,4"; 
      isFlowing = true;
      width = width * 1.1;
    } else if (link.type === 'documents') {
      dashArray = "10,6";
      isFlowing = true;
    } else if (link.type === 'collection_member') {
      dashArray = "2,3"; // Expanded collection binding is a tight dashed guide line
    }

    // Resolve dynamic colors for the cluster links
    const sourceColor = sourceNode ? getClusterColor(sourceNode) : '#ffffff';
    let color = sourceColor;

    if (link.type === 'collection_member') {
      color = "#10b981"; // Emerald green for parent-child bindings
    } else if (link.type === 'tension' || link.type === 'contradicts') {
      color = isSelected || isHovered ? "#f43f5e" : `${sourceColor}cc`;
    } else if (link.type === 'supports') {
      color = isSelected || isHovered ? "#10b981" : `${sourceColor}cc`;
    } else if (link.type === 'derives_from' || link.type === 'synthesizes') {
      color = isSelected || isHovered ? "#06b6d4" : `${sourceColor}cc`;
    } else if (link.type === 'transcends') {
      color = isSelected || isHovered ? "#a855f7" : `${sourceColor}cc`;
    }

    // Adjust link opacity dynamically based on interaction states
    if (isFocusMode) {
      if (isSelected || isHovered) {
        // Active links stay fully opaque
      } else if (isNeighbor) {
        color = `${color}66`; // 40% opacity for neighbors
      } else {
        color = `${color}03`; // 1.2% opacity for others in focus mode
      }
    } else {
      if (isFoundational) {
        color = `${color}55`; // 33% opacity for foundational
      } else {
        color = `${color}2a`; // 16% opacity for normal background links
      }
    }
    
    return {
      opacity,
      width,
      dashArray,
      isFlowing,
      color,
      isActive: isSelected || isHovered,
      isStrong,
      isWeak,
      strength
    };
  };

  // --- BUOY-HOVER ANIMATION ENGINE ---
  const layoutNodesRef = useRef(layoutNodes);
  const linksRef = useRef(links);
  const activeLatentLinksRef = useRef(activeLatentLinks);

  useEffect(() => {
    layoutNodesRef.current = visibleNodes;
    linksRef.current = visibleLinks;
    activeLatentLinksRef.current = activeLatentLinks;
  }, [layoutNodes, links, activeLatentLinks]);

  const nodeRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const linkRefs = useRef<Map<string, SVGPathElement>>(new Map());
  const latentLinkRefs = useRef<Map<string, SVGPathElement>>(new Map());

  useEffect(() => {
    let animationFrameId: number;
    
    const nodeParams = new Map<string, {
      freqX: number;
      freqY: number;
      phaseX: number;
      phaseY: number;
      ampX: number;
      ampY: number;
    }>();

    const getParams = (id: string) => {
      if (!nodeParams.has(id)) {
        nodeParams.set(id, {
          freqX: 0.3 + Math.random() * 0.2, // 0.3 - 0.5 rad/s
          freqY: 0.3 + Math.random() * 0.2,
          phaseX: Math.random() * Math.PI * 2,
          phaseY: Math.random() * Math.PI * 2,
          ampX: 3 + Math.random() * 4, // 3 - 7px
          ampY: 2 + Math.random() * 3, // 2 - 5px
        });
      }
      return nodeParams.get(id)!;
    };

    const renderLoop = (time: number) => {
      const t = time / 1000;
      const currentNodes = layoutNodesRef.current;
      const currentLinks = linksRef.current;
      const currentLatentLinks = activeLatentLinksRef.current;
      
      const offsets = new Map<string, {x: number, y: number}>();
      
      currentNodes.forEach(node => {
        const p = getParams(node.id);
        const harmonicX = Math.sin(t * (p.freqX * 2) + p.phaseX) * (p.ampX * 0.3);
        const harmonicY = Math.sin(t * (p.freqY * 2) + p.phaseY) * (p.ampY * 0.3);
        
        const offsetX = Math.sin(t * p.freqX + p.phaseX) * p.ampX + harmonicX;
        const offsetY = Math.sin(t * p.freqY + p.phaseY) * p.ampY + harmonicY + Math.sin(t * 0.15 + p.phaseX) * 2;
        
        offsets.set(node.id, { x: offsetX, y: offsetY });
        
        const el = nodeRefs.current.get(node.id);
        if (el) {
          el.style.transform = `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px))`;
        }
      });
      
      currentLinks.forEach((link, idx) => {
        const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
        const targetId = typeof link.target === 'string' ? link.target : link.target.id;
        
        const sourceNode = typeof link.source === 'string' ? currentNodes.find(n => n.id === sourceId) : link.source as any;
        const targetNode = typeof link.target === 'string' ? currentNodes.find(n => n.id === targetId) : link.target as any;
        
        const sourceOffset = offsets.get(sourceId) || { x: 0, y: 0 };
        const targetOffset = offsets.get(targetId) || { x: 0, y: 0 };
        
        const sx = (sourceNode?.x || 0) + sourceOffset.x;
        const sy = (sourceNode?.y || 0) + sourceOffset.y;
        const tx = (targetNode?.x || 0) + targetOffset.x;
        const ty = (targetNode?.y || 0) + targetOffset.y;
        
        const dx = tx - sx;
        const dy = ty - sy;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        
        const curvature = 0.2;
        const mx = (sx + tx) / 2;
        const my = (sy + ty) / 2;
        const cx = mx - (dy / dist) * (dist * curvature);
        const cy = my + (dx / dist) * (dist * curvature);
        
        const baseLinkId = `link-${sourceId}-${targetId}-${idx}`;
        const glowEl = linkRefs.current.get(`${baseLinkId}-glow`);
        const mainEl = linkRefs.current.get(`${baseLinkId}-main`);
        const coreEl = linkRefs.current.get(`${baseLinkId}-core`);
        
        const pathData = `M ${sx} ${sy} Q ${cx} ${cy} ${tx} ${ty}`;
        if (glowEl) glowEl.setAttribute('d', pathData);
        if (mainEl) mainEl.setAttribute('d', pathData);
        if (coreEl) coreEl.setAttribute('d', pathData);
      });

      currentLatentLinks.forEach(link => {
        const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
        const targetId = typeof link.target === 'string' ? link.target : link.target.id;
        
        const sourceNode = typeof link.source === 'string' ? currentNodes.find(n => n.id === sourceId) : link.source as any;
        const targetNode = typeof link.target === 'string' ? currentNodes.find(n => n.id === targetId) : link.target as any;
        
        const sourceOffset = offsets.get(sourceId) || { x: 0, y: 0 };
        const targetOffset = offsets.get(targetId) || { x: 0, y: 0 };
        
        const sx = (sourceNode?.x || 0) + sourceOffset.x;
        const sy = (sourceNode?.y || 0) + sourceOffset.y;
        const tx = (targetNode?.x || 0) + targetOffset.x;
        const ty = (targetNode?.y || 0) + targetOffset.y;
        
        const dx = tx - sx;
        const dy = ty - sy;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        
        const curvature = -0.2;
        const mx = (sx + tx) / 2;
        const my = (sy + ty) / 2;
        const cx = mx - (dy / dist) * (dist * curvature);
        const cy = my + (dx / dist) * (dist * curvature);
        
        const linkId = `latent-${sourceId}-${targetId}`;
        const el = latentLinkRefs.current.get(linkId);
        if (el) {
          el.setAttribute('d', `M ${sx} ${sy} Q ${cx} ${cy} ${tx} ${ty}`);
        }
      });
      
      animationFrameId = requestAnimationFrame(renderLoop);
    };
    
    animationFrameId = requestAnimationFrame(renderLoop);
    
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden bg-[#0a0a0a] text-zinc-100 font-sans selection:bg-orange-500/30">
      
      {/* Sovereign Context Indicator */}
      <AnimatePresence>
        {selectedNodeId && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 px-6 py-2 bg-black/60 backdrop-blur-2xl border border-orange-500/40 rounded-full shadow-2xl"
          >
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-zinc-200 animate-pulse" />
              <span className="text-[10px] font-semibold tracking-widest text-orange-100">Sovereign Inquiry Active</span>
            </div>
            <div className="w-px h-4 bg-white/10" />
            <div className="text-[10px] font-bold tracking-widest text-zinc-400">
              {processedNodes.find(n => n.id === selectedNodeId)?.label || nodes.find(n => n.id === selectedNodeId)?.label}
            </div>
            <button 
              onClick={(e) => { 
                e.stopPropagation(); 
                setSelectedNodeId(undefined); 
              }}
              className="ml-2 p-1 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-3 h-3 text-zinc-500 hover:text-white" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- TOOLBAR (TOP LEFT) --- */}
      <GraphToolbar 
        isOpen={isToolbarOpen}
        setIsOpen={setIsToolbarOpen}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeTypes={activeTypes}
        setActiveTypes={setActiveTypes}
        activeStatuses={activeStatuses}
        setActiveStatuses={setActiveStatuses}
        clusterMode={clusterMode}
        setClusterMode={setClusterMode}
        showLatent={showLatent}
        setShowLatent={setShowLatent}
        structuralIntegrity={structuralIntegrity}
        setStructuralIntegrity={setStructuralIntegrity}
        gravity={gravity}
        setGravity={setGravity}
        onAddNode={() => setIsAddingNode(true)}
        nodeStylePreset={nodeStylePreset}
        setNodeStylePreset={setNodeStylePreset}
        nodeSpacing={nodeSpacing}
        setNodeSpacing={setNodeSpacing}
        availableTypes={availableTypes}
        availableStatuses={availableStatuses}
        multiSelectMode={multiSelectMode}
        setMultiSelectMode={setMultiSelectMode}
      />

      {/* --- INSIGHT GENERATOR (BOTTOM LEFT) --- */}
      <InsightOverlay 
        selectedNodeId={selectedNodeId}
        selectedInsights={selectedInsights}
      />

      {/* Background Singularity (Aesthetic Anchor) */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden opacity-30 select-none">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 300, repeat: Infinity, ease: "linear" }}
          className="relative w-[200%] h-[200%] flex items-center justify-center"
        >
          {/* Fractal Grid */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px]" />
          <div className="absolute w-full h-full bg-[radial-gradient(circle_at_center,transparent_0%,#000_70%)]" />
          
          {/* Distant "Stars" Particles */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 contrast-150 brightness-50 mix-blend-overlay" />
        </motion.div>
      </div>

      {/* --- FLOATING COLLECTIONS HUB (TOP RIGHT) --- */}
      <div className="absolute top-6 right-6 z-40 flex flex-col items-end gap-3 pointer-events-none max-h-[85vh] overflow-y-auto no-scrollbar">
        <button
          onClick={() => setIsCollectionsHubExpanded(!isCollectionsHubExpanded)}
          className="pointer-events-auto flex items-center gap-2.5 px-4 py-2 bg-black/40 backdrop-blur-md border border-white/10 hover:border-white/20 rounded-xl shadow-xl text-zinc-400 hover:text-zinc-200 transition-all cursor-pointer font-mono text-[10px] font-bold tracking-widest uppercase"
        >
          <Layers className="w-4 h-4 text-amber-500 animate-pulse" />
          <span>Collections ({collections.length})</span>
        </button>

        <AnimatePresence>
          {isCollectionsHubExpanded && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="pointer-events-auto w-72 p-4 bg-zinc-950/95 border border-white/5 rounded-2xl shadow-2xl backdrop-blur-md flex flex-col gap-3.5"
            >
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <span className="text-[10px] font-bold tracking-widest uppercase text-zinc-200 flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-amber-500" />
                  Collections Substrate
                </span>
                <button
                  onClick={() => setIsCollectionsHubExpanded(false)}
                  className="p-1 hover:bg-white/5 rounded-md text-zinc-500 hover:text-zinc-300 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Collections list */}
              <div className="flex flex-col gap-2 max-h-[250px] overflow-y-auto pr-1 no-scrollbar">
                {collections.length === 0 ? (
                  <div className="text-center py-6 border border-dashed border-white/5 rounded-xl bg-black/20">
                    <Layers className="w-7 h-7 text-zinc-700 mx-auto mb-2" />
                    <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest leading-relaxed">
                      No collections defined.<br />Select multiple nodes using <span className="text-amber-500">Shift+Click</span> or toggle Multi-Select mode.
                    </p>
                  </div>
                ) : (
                  collections.map(col => {
                    const isColHovered = hoveredCollectionId === col.id;
                    return (
                      <div
                        key={col.id}
                        onMouseEnter={() => setHoveredCollectionId(col.id)}
                        onMouseLeave={() => setHoveredCollectionId(null)}
                        className={cn(
                          "p-2.5 bg-zinc-900/30 border border-white/5 hover:border-white/10 rounded-xl flex flex-col gap-2 transition-all duration-300",
                          isColHovered && "bg-amber-500/[0.02] border-amber-500/20"
                        )}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex flex-col gap-0.5 max-w-[70%]">
                            <span className="text-[11px] font-bold text-zinc-200 truncate leading-tight">
                              {col.label}
                            </span>
                            <span className="text-[8px] font-mono text-zinc-500 leading-none">
                              {col.nodeIds.length} members
                            </span>
                          </div>
                          
                          {/* Collapse Indicator badge */}
                          <span 
                            className={cn(
                              "text-[8px] font-bold font-mono uppercase px-1.5 py-0.5 rounded border leading-none shrink-0",
                              col.isCollapsed 
                                ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            )}
                          >
                            {col.isCollapsed ? 'Packed' : 'Open'}
                          </span>
                        </div>

                        {/* Control actions */}
                        <div className="flex items-center gap-1 border-t border-white/5 pt-2">
                          <button
                            onClick={() => handleToggleCollectionCollapse(col.id)}
                            className="flex-1 flex items-center justify-center gap-1 px-2 py-1 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-zinc-200 text-[9px] font-mono uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                          >
                            {col.isCollapsed ? (
                              <>
                                <Eye className="w-3 h-3 text-emerald-400" />
                                <span>Expand</span>
                              </>
                            ) : (
                              <>
                                <EyeOff className="w-3 h-3 text-amber-400" />
                                <span>Collapse</span>
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => handleDissolveCollection(col.id)}
                            className="p-1 hover:bg-red-500/20 text-zinc-500 hover:text-red-400 rounded-lg transition-colors cursor-pointer"
                            title="Dissolve Collection (releases members)"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* --- LINK STRENGTH LEGEND (BOTTOM RIGHT) --- */}
      {showLinkStrengthLegend && (
        <div className="absolute bottom-6 right-6 z-40 p-4 bg-zinc-950/80 border border-white/5 rounded-2xl backdrop-blur-md flex flex-col gap-2.5 max-w-[200px] pointer-events-auto">
          <div className="flex items-center justify-between pb-1.5 border-b border-white/5">
            <span className="text-[9px] font-bold tracking-widest uppercase text-zinc-200 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
              Line Intensity
            </span>
            <button
              onClick={() => setShowLinkStrengthLegend(false)}
              className="text-zinc-500 hover:text-zinc-300"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          <div className="flex flex-col gap-1.5 font-mono text-[8px] text-zinc-400 uppercase">
            <div className="flex items-center gap-2">
              <div className="w-8 h-1.5 bg-gradient-to-r from-white/20 via-white/80 to-white/20 rounded shadow-[0_0_10px_white]" />
              <span>Strong (Active)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-1 bg-white/40 rounded" />
              <span>Medium</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-px border-t border-dashed border-white/20" />
              <span>Weak (Latent)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5 bg-emerald-500/80 rounded" />
              <span>Collection</span>
            </div>
          </div>
        </div>
      )}

      {/* --- GRAPH CANVAS --- */}
      <div 
        className="absolute inset-0 w-full h-full pointer-events-none overflow-visible transition-transform duration-700 ease-[cubic-bezier(0.2,0,0,1)]"
        style={{
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.k})`,
          transformOrigin: '0 0'
        }}
      >
        <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
          <defs>
            <linearGradient id="latent-gradient" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="rgba(16, 185, 129, 0.8)" />
              <stop offset="100%" stopColor="rgba(16, 185, 129, 0.2)" />
            </linearGradient>
            <filter id="void-bloom" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feColorMatrix in="blur" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="glow" />
              <feComposite in="SourceGraphic" in2="glow" operator="over" />
            </filter>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
        
        {/* Latent Links */}
        <AnimatePresence>
          {showLatent && activeLatentLinks.map((link, i) => {
            if (!link.source || !link.target || isNaN(link.source.x) || isNaN(link.target.x)) return null;

            const sourceId = link.source.id;
            const targetId = link.target.id;
            const linkId = `latent-${sourceId}-${targetId}-${i}`;
            
            const dx = link.target.x - link.source.x;
            const dy = link.target.y - link.source.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            
            const curvature = -0.2;
            const mx = (link.source.x + link.target.x) / 2;
            const my = (link.source.y + link.target.y) / 2;
            const cx = mx - (dy / dist) * (dist * curvature);
            const cy = my + (dx / dist) * (dist * curvature);

            return (
              <motion.path
                key={linkId}
                ref={(el) => { if (el) latentLinkRefs.current.set(linkId, el as any); else latentLinkRefs.current.delete(linkId); }}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ 
                  pathLength: 1, 
                  opacity: 0.6,
                }}
                exit={{ opacity: 0 }}
                stroke="url(#latent-gradient)"
                strokeWidth={2}
                fill="none"
                strokeDasharray="6,6"
                filter="url(#glow)"
              >
                <animate 
                  attributeName="stroke-dashoffset" 
                  values="100;0" 
                  dur="3s" 
                  repeatCount="indefinite" 
                />
              </motion.path>
            );
          })}
        </AnimatePresence>

        {/* Links */}
        <AnimatePresence>
          {visibleLinks.map((link, idx) => {
            if (!link.source || !link.target || typeof link.source === 'string' || typeof link.target === 'string' || isNaN(link.source.x) || isNaN(link.target.x)) return null;

            const sourceId = link.source.id;
            const targetId = link.target.id;
            const baseLinkId = `link-${sourceId}-${targetId}-${idx}`;
            const style = calculateLinkStyle(link);

            // Calculate Quadratic Bezier Control Point
            const dx = link.target.x - link.source.x;
            const dy = link.target.y - link.source.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            
            const curvature = 0.2;
            const mx = (link.source.x + link.target.x) / 2;
            const my = (link.source.y + link.target.y) / 2;
            const cx = mx - (dy / dist) * (dist * curvature);
            const cy = my + (dx / dist) * (dist * curvature);

            return (
              <g key={baseLinkId}
                 className="cursor-pointer pointer-events-auto"
                 onMouseEnter={(e) => {
                   setHoveredLink(link);
                   setTooltipPos({ x: e.clientX, y: e.clientY });
                 }}
                 onMouseMove={(e) => {
                   setTooltipPos({ x: e.clientX, y: e.clientY });
                 }}
                 onMouseLeave={() => setHoveredLink(null)}
              >
                {/* Thicker transparent path for easier hover targeting */}
                <path 
                  d={`M ${link.source.x} ${link.source.y} Q ${cx} ${cy} ${link.target.x} ${link.target.y}`}
                  fill="none"
                  stroke="transparent"
                  strokeWidth={20}
                />
                
                {/* 1. Underlying wide glowing path for strong links (Neon Tube Core Glow) */}
                {style.isStrong && (
                  <path
                    ref={(el) => { if (el) linkRefs.current.set(`${baseLinkId}-glow`, el as any); else linkRefs.current.delete(`${baseLinkId}-glow`); }}
                    d={`M ${link.source.x} ${link.source.y} Q ${cx} ${cy} ${link.target.x} ${link.target.y}`}
                    fill="none"
                    stroke={style.color}
                    strokeWidth={style.width + 6}
                    opacity={style.opacity * 0.25}
                    strokeDasharray={style.dashArray}
                    style={{ filter: "url(#void-bloom)" }}
                  />
                )}

                {/* 2. Standard main path */}
                <motion.path
                  ref={(el) => { if (el) linkRefs.current.set(`${baseLinkId}-main`, el as any); else linkRefs.current.delete(`${baseLinkId}-main`); }}
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ 
                    pathLength: 1, 
                    opacity: style.opacity
                  }}
                  exit={{ opacity: 0 }}
                  stroke={style.color}
                  strokeWidth={style.width}
                  fill="none"
                  strokeDasharray={style.dashArray}
                />

                {/* 3. Overlapping bright inner core for strong links (Neon Pipe Fiber Core) */}
                {style.isStrong && (
                  <motion.path
                    ref={(el) => { if (el) linkRefs.current.set(`${baseLinkId}-core`, el as any); else linkRefs.current.delete(`${baseLinkId}-core`); }}
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ 
                      pathLength: 1, 
                      opacity: style.opacity * 0.9
                    }}
                    exit={{ opacity: 0 }}
                    stroke="#ffffff"
                    strokeWidth={1.5}
                    fill="none"
                    strokeDasharray={style.dashArray}
                  />
                )}
                
                {/* Animated Data Packets (Logic Flow Animation) */}
                {(style.isActive || style.isStrong) && !style.isWeak && (
                  <g className="pointer-events-none">
                    {[0, 1, 2].map((packetIndex) => (
                      <motion.circle
                        key={`${baseLinkId}-packet-${packetIndex}`}
                        r={style.isStrong ? 2.2 + packetIndex * 0.4 : 1.2 + packetIndex * 0.3}
                        fill={style.isStrong ? "#ffffff" : style.color}
                        initial={{ offsetDistance: "0%" }}
                        animate={{ offsetDistance: "100%" }}
                        transition={{ 
                          duration: style.isStrong 
                            ? (1.0 + Math.random() * 0.3) // Strong links flow FASTER
                            : (1.5 + Math.random() * 0.5), 
                          repeat: Infinity, 
                          delay: packetIndex * 0.5,
                          ease: "linear" 
                        }}
                        style={{
                          offsetPath: `path('M ${link.source.x} ${link.source.y} Q ${cx} ${cy} ${link.target.x} ${link.target.y}')`,
                          filter: style.isStrong 
                            ? `blur(${0.3}px) drop-shadow(0 0 8px #ffffff)` 
                            : `blur(${0.4}px) drop-shadow(0 0 6px ${style.color})`,
                        }}
                      />
                    ))}
                  </g>
                )}
              </g>
            );
          })}
        </AnimatePresence>
      </svg>

      {/* Nodes */}
      <div className="absolute inset-0 pointer-events-none">
        <AnimatePresence>
          {visibleNodes.map((node) => {
            const hasSearchQuery = searchQuery && searchQuery.trim().length > 0;
            const matchesSearch = hasSearchQuery && node.label.toLowerCase().includes(searchQuery.toLowerCase());
            const isSelected = selectedNodeId === node.id;
            
            // Check collection context hover highlights
            const colHovered = hoveredCollectionId ? collections.find(c => c.id === hoveredCollectionId) : null;
            const isMemberOfHoveredCol = colHovered ? colHovered.nodeIds.includes(node.id) : false;
            const isHoveredColNode = node.id === hoveredCollectionId;

            const isHovered = hoveredNodeId === node.id || isHoveredColNode || isMemberOfHoveredCol || (
              hoveredLink && (
                (typeof hoveredLink.source === 'string' ? hoveredLink.source : hoveredLink.source.id) === node.id || 
                (typeof hoveredLink.target === 'string' ? hoveredLink.target : hoveredLink.target.id) === node.id
              )
            );
            
            const isFocusMode = !!selectedNodeId || !!hoveredNodeId || !!hoveredLink || !!hoveredCollectionId;
            const isConnectedToFocus = visibleLinks.some(l => 
              (l.source?.id === node.id && (l.target?.id === selectedNodeId || l.target?.id === hoveredNodeId || (colHovered && colHovered.nodeIds.includes(l.target?.id)))) || 
              (l.target?.id === node.id && (l.source?.id === selectedNodeId || l.source?.id === hoveredNodeId || (colHovered && colHovered.nodeIds.includes(l.source?.id))))
            );

            // True if faded out by focus isolation OR search isolation
            const isDimmed = (isFocusMode && !isSelected && !isHovered && !isConnectedToFocus) || (hasSearchQuery && !matchesSearch);
            const isDeeplyDimmed = isDimmed && ((isFocusMode && !isConnectedToFocus) || (hasSearchQuery && !matchesSearch));

            const isMultiSelected = selectedNodeIds.has(node.id);

            const color = getClusterColor(node);
            const scale = calculateNodeScale(node);

            return (
              <motion.div
                key={`node-${node.id}`}
                initial={{ scale: 0.3, opacity: 0, filter: "blur(12px) brightness(0.3)", rotate: -12 }}
                animate={{ 
                  scale: matchesSearch ? 1.35 : (isSelected ? 1.18 : (isHovered ? 1.08 : 1)), 
                  opacity: isDeeplyDimmed ? 0.05 : (isDimmed ? 0.25 : 1),
                  filter: isDeeplyDimmed 
                    ? "blur(3.5px) grayscale(0.8) brightness(0.35)" 
                    : (isHovered || isSelected ? "blur(0px) brightness(1.2)" : "blur(0px) brightness(1.0)"),
                  rotate: isHovered ? [0, 2, -2, 0] : 0
                }}
                exit={{ scale: 0.2, opacity: 0, filter: "blur(8px)" }}
                transition={{ 
                  scale: { type: "spring", stiffness: 350, damping: 25 },
                  opacity: { duration: 0.4 },
                  filter: { duration: 0.3 },
                  rotate: isHovered ? { duration: 4, repeat: Infinity, ease: "easeInOut" } : { duration: 0.5 }
                }}
                className="absolute"
                style={{ 
                  left: isNaN(node.x) ? 0 : node.x, 
                  top: isNaN(node.y) ? 0 : node.y,
                  zIndex: isSelected ? 50 : (isHovered || isConnectedToFocus ? 40 : 10)
                }}
              >
                <div 
                  ref={(el) => { if (el) nodeRefs.current.set(node.id, el); else nodeRefs.current.delete(node.id); }}
                  className={cn(
                    "pointer-events-auto relative group cursor-pointer flex items-center justify-center transition-all duration-700",
                  )}
                  onMouseEnter={() => setHoveredNodeId(node.id)}
                  onMouseLeave={() => setHoveredNodeId(null)}
                  onClick={(e) => {
                    if (multiSelectMode || e.shiftKey) {
                      e.stopPropagation();
                      const next = new Set(selectedNodeIds);
                      if (next.has(node.id)) {
                        next.delete(node.id);
                      } else {
                        next.add(node.id);
                      }
                      setSelectedNodeIds(next);
                      setSelectedNodeId(undefined); // Clear single selected node
                    } else {
                      setSelectedNodeId(node.id);
                      setSidebarMode('details');
                      setRightSidebarOpen(true);
                      externalOnNodeSelect?.(node);
                    }
                  }}
                  onDoubleClick={() => setExpandedNodeId(node.id)}
                >
                  {/* Elite Abyssal Aura (Layered) */}
                  {scale.aif > 0.3 && (
                    <>
                      <motion.div 
                        animate={{ 
                          scale: [1, 1.15, 1],
                          rotate: [0, 180, 360],
                          opacity: [scale.aif * 0.15, scale.aif * 0.45, scale.aif * 0.15]
                        }}
                        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                        className="absolute rounded-full pointer-events-none border border-dashed border-white/5"
                        style={{
                          width: scale.radius * 2 + scale.auraSize * 1.5,
                          height: scale.radius * 2 + scale.auraSize * 1.5,
                        }}
                      />
                      <motion.div 
                        animate={{ 
                          scale: [1.1, 1, 1.1],
                          opacity: [scale.aif * 0.1, scale.aif * 0.3, scale.aif * 0.1]
                        }}
                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute rounded-full pointer-events-none"
                        style={{
                          width: scale.radius * 2 + scale.auraSize,
                          height: scale.radius * 2 + scale.auraSize,
                          background: `radial-gradient(circle, ${color}30 0%, transparent 80%)`,
                          filter: `blur(${scale.auraSize / 3}px)`,
                        }}
                      />
                    </>
                  )}

                  {/* Node Shape */}
                  <div 
                    className={cn(
                      "shadow-2xl transition-all duration-500 relative flex items-center justify-center",
                      isSelected ? "animate-pulse" : "group-hover:scale-105",
                      matchesSearch && "shadow-[0_0_40px_white] ring-4 ring-white/20"
                    )}
                    style={getNodeStyles(node, color, matchesSearch, isSelected, isHovered, isConnectedToFocus, scale, isMultiSelected)}
                  >
                    {/* Inner Semantic Core */}
                    <div 
                      className="absolute inset-[20%] opacity-45"
                      style={{ 
                        backgroundColor: color,
                        borderRadius: node.type === 'thinker' ? "35%" : (node.type === 'axiom' || node.type === 'axiom_type' || node.id.includes('axiom') ? "6px" : "9999px")
                      }}
                    />

                    {/* Collection Pack Indicator Count */}
                    {node.type === 'collection' && (
                      <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white font-mono select-none">
                        {node.metadata?.isCollapsed ? `+${node.metadata?.nodeIds?.length}` : '•'}
                      </div>
                    )}
                  </div>

                  {/* Label (Floating & Colorful) */}
                  <div 
                    className={cn(
                      "absolute top-full mt-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap px-1.5 py-0.5 text-center font-sans tracking-tight transition-all duration-300 pointer-events-none",
                      (isHovered || isSelected || matchesSearch)
                        ? "opacity-100 scale-110 font-bold z-50"
                        : (isDeeplyDimmed ? "opacity-0 scale-75" : "opacity-85 font-medium")
                    )}
                    style={{
                      color: isHovered || isSelected || matchesSearch ? '#ffffff' : color,
                      fontSize: `${Math.max(10, Math.min(18, 9 + scale.radius * 0.15))}px`,
                      textShadow: isHovered || isSelected || matchesSearch 
                        ? `0 0 8px ${color}, 0 0 16px ${color}, 0 1px 3px rgba(0,0,0,0.95)`
                        : `0 1px 2px rgba(0,0,0,0.9)`,
                    }}
                  >
                    {node.label}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      </div>

      {/* --- FLOATING BOTTOM ACTION BAR FOR MULTI-SELECT GROUPING --- */}
      <AnimatePresence>
        {selectedNodeIds.size > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 50, x: "-50%" }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 flex flex-col md:flex-row items-center gap-4 p-4 bg-zinc-950/95 border border-amber-500/30 rounded-2xl shadow-2xl backdrop-blur-2xl pointer-events-auto"
          >
            <div className="flex items-center gap-3 pr-2 border-r border-white/10 shrink-0">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-[10px] font-bold tracking-widest text-zinc-100 uppercase font-mono">
                Multi-Select: {selectedNodeIds.size} nodes
              </span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Name cluster..."
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCreateCollection();
                  }
                }}
                className="bg-zinc-900 border border-white/10 hover:border-white/20 transition-colors px-3 py-1.5 rounded-xl text-xs font-mono text-zinc-200 outline-none placeholder:text-zinc-600 focus:border-amber-500/50 w-44"
              />

              <button
                onClick={handleCreateCollection}
                className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-black text-[10px] font-extrabold tracking-widest uppercase transition-all rounded-xl cursor-pointer shadow-lg shadow-emerald-500/10 flex items-center gap-1.5 font-mono"
              >
                <FolderPlus className="w-3.5 h-3.5" /> Group
              </button>

              <button
                onClick={() => {
                  setSelectedNodeIds(new Set());
                  setNewCollectionName('');
                }}
                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-zinc-200 text-[10px] font-mono font-bold tracking-widest uppercase transition-all rounded-xl cursor-pointer"
              >
                Clear
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- SEMANTIC EXPANSION ENGINE (ANALYSIS-REVEAL) --- */}
      <ExpansionPanel 
        expandedNodeId={expandedNodeId}
        setExpandedNodeId={setExpandedNodeId}
        nodes={nodes}
        initialLinks={initialLinks}
      />

      {/* Manual Node Add Overlay */}
      <AddNodeModal 
        isOpen={isAddingNode}
        onClose={() => setIsAddingNode(false)}
        onAddNode={(node) => {
          addNode(node);
          logOptimization('refactor', 'Manually added node to graph', { nodeLabel: node.label });
        }}
      />

      {/* Tooltip for Hovered Link */}
      <AnimatePresence>
        {hoveredLink && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed z-[100] p-3 shadow-2xl bg-zinc-950/95 border border-white/20 rounded-xl pointer-events-none backdrop-blur-md"
            style={{ 
              left: tooltipPos.x + 15, 
              top: tooltipPos.y + 15 
            }}
          >
            <div className="text-[10px] uppercase font-bold text-zinc-400 tracking-widest mb-2 flex items-center gap-2">
              <Link2Off className="w-3 h-3 text-zinc-500" /> Connection Detail
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="text-zinc-200 flex justify-between gap-4">
                <span className="text-zinc-500 text-xs">Type:</span> 
                <span className="font-mono text-xs">{hoveredLink.type || hoveredLink.label || 'direct'}</span>
              </div>
              {hoveredLink.score !== undefined && (
                <div className="text-zinc-200 flex justify-between gap-4">
                  <span className="text-zinc-500 text-xs">Score:</span> 
                  <span className="font-mono text-xs">{Number(hoveredLink.score).toFixed(3)}</span>
                </div>
              )}
              {hoveredLink.weight !== undefined && hoveredLink.weight !== hoveredLink.score && (
                <div className="text-zinc-200 flex justify-between gap-4">
                  <span className="text-zinc-500 text-xs">Weight:</span> 
                  <span className="font-mono text-xs">{Number(hoveredLink.weight).toFixed(3)}</span>
                </div>
              )}
              <div className="mt-2 text-xs border-t border-white/5 pt-2">
                <div className="text-zinc-300 max-w-[250px] truncate">
                  {typeof hoveredLink.source === 'string' ? hoveredLink.source : hoveredLink.source.label || hoveredLink.source.id}
                </div>
                <div className="text-[#00e5ff] font-mono text-[9px] pl-2 leading-none border-l border-white/10 ml-1 py-1">
                  connects to
                </div>
                <div className="text-zinc-300 max-w-[250px] truncate">
                  {typeof hoveredLink.target === 'string' ? hoveredLink.target : hoveredLink.target.label || hoveredLink.target.id}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});
