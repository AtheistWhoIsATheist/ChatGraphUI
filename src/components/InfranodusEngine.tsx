import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import jLouvain from 'jlouvain';
import { 
  Sparkles, Loader2, Type, RefreshCw, Plus, Save, Info, AlertTriangle, 
  HelpCircle, Trash2, ArrowRight, Zap, Download, Layers, Play, Check, Network
} from 'lucide-react';
import { getGeminiClient } from '../lib/gemini';
import { useAppStore } from '../store/appStore';
import { Node, Link } from '../data/corpus';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { logOptimization } from '../utils/selfImprovement';

const ai = getGeminiClient();

// Default Stopwords list
const DEFAULT_STOPWORDS = new Set([
  'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', "you're", "you've", "you'll", "you'd",
  'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', "she's", 'her', 'hers',
  'herself', 'it', "it's", 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which',
  'who', 'whom', 'this', 'that', "that'll", 'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been',
  'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if',
  'or', 'because', 'as', 'until', 'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between',
  'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out',
  'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why',
  'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not',
  'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', "don't", 'should',
  "should've", 'now', 'd', 'll', 'm', 'o', 're', 've', 'y', 'ain', 'aren', "aren't", 'couldn', "couldn't",
  'didn', "didn't", 'doesn', "doesn't", 'hadn', "hadn't", 'hasn', "hasn't", 'haven', "haven't", 'isn', "isn't",
  'ma', 'mightn', "mightn't", 'mustn', "mustn't", 'needn', "needn't", 'shan', "shan't", 'shouldn', "shouldn't",
  'wasn', "wasn't", 'weren', "weren't", 'won', "won't", 'wouldn', "wouldn't", 'also', 'would', 'could', 'should',
  'get', 'one', 'two', 'like', 'many', 'much', 'even', 'make', 'made', 'take', 'took', 'see', 'saw'
]);

// Sample texts for user convenience
const SAMPLE_TEXTS = [
  {
    title: "Apophasis & Ego Dissolution",
    text: "The path of apophasis requires complete ego dissolution. When the thinker encounters the ontological abyss, they experience a profound meaning vacuum. Silence is not merely the absence of sound, but the presence of groundlessness. In this groundlessness, a temporal rupture occurs, creating a collapse of all structures."
  },
  {
    title: "The Religious Experience of Nihilism",
    text: "The religious experience of nihilism is characterized by kenotic constraints and affective terror. The ontodicy collapse leads to existential dread. Yet, within this darkness, a new synthesis arises. The kenosis of the mind reveals the active void. We must sustain the paradox rather than rush to reification."
  },
  {
    title: "Kenotic Ingestion Report",
    text: "Our cognitive ingestion of the void reveals several structural gaps. By practicing anti-reification methodology, we dissolve the boundaries between subject and object. The shifting void demands a hyper-fluid ontology. Transcendent echoes can be heard in the silence of renunciation."
  }
];

export function InfranodusEngine() {
  const { integrateSyntheticData } = useAppStore();
  
  // Text Input States
  const [inputText, setInputText] = useState(SAMPLE_TEXTS[0].text);
  const [windowSize, setWindowSize] = useState<number>(3); // sliding window size
  const [minWordLength, setMinWordLength] = useState<number>(3);
  const [useStopwords, setUseStopwords] = useState<boolean>(true);
  const [customStopwords, setCustomStopwords] = useState<string>('');
  
  // Graph Extraction States
  const [parsedNodes, setParsedNodes] = useState<Node[]>([]);
  const [parsedLinks, setParsedLinks] = useState<Link[]>([]);
  const [communities, setCommunities] = useState<Record<string, number>>({});
  const [nodeDegrees, setNodeDegrees] = useState<Record<string, number>>({});
  
  // Selected elements
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [hoveredLink, setHoveredLink] = useState<any>(null);
  const [selectedClusterId, setSelectedClusterId] = useState<number | null>(null);
  
  // UI & Layout & Animation States
  const d3Container = useRef<SVGSVGElement | null>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 500 });
  const [transform, setTransform] = useState({ x: 0, y: 0, k: 1 });
  const simulationRef = useRef<d3.Simulation<any, any> | null>(null);
  
  // AI States
  const [clusterNames, setClusterNames] = useState<Record<number, string>>({});
  const [namingClusterId, setNamingClusterId] = useState<number | null>(null);
  const [bridgingIdea, setBridgingIdea] = useState<string | null>(null);
  const [isBridging, setIsBridging] = useState<boolean>(false);
  const [bridgeTargetClusters, setBridgeTargetClusters] = useState<{ c1: number, c2: number } | null>(null);
  const [savingStatus, setSavingStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // Stopwords combined list
  const currentStopwords = useMemo(() => {
    const list = new Set(DEFAULT_STOPWORDS);
    if (customStopwords.trim()) {
      customStopwords.split(/[\s,]+/).forEach(w => {
        if (w.trim()) list.add(w.toLowerCase().trim());
      });
    }
    return list;
  }, [customStopwords]);

  // Compute Network Statistics
  const stats = useMemo(() => {
    const nodeCount = parsedNodes.length;
    const linkCount = parsedLinks.length;
    
    if (nodeCount === 0) {
      return { density: 0, modularity: 0, avgDegree: 0 };
    }
    
    // Density: Actual links / Possible links
    const possibleLinks = (nodeCount * (nodeCount - 1)) / 2;
    const density = possibleLinks > 0 ? linkCount / possibleLinks : 0;
    
    // Average degree
    const totalDegree = Object.values(nodeDegrees).reduce((acc, d) => acc + d, 0);
    const avgDegree = totalDegree / nodeCount;
    
    // Qualitative Modularity estimate based on cluster count
    const clusterSet = new Set(Object.values(communities));
    const clusterCount = clusterSet.size;
    const modularity = nodeCount > 5 ? Math.min(0.85, 0.15 + (clusterCount / nodeCount) * 0.4) : 0;
    
    return { density, modularity, avgDegree };
  }, [parsedNodes, parsedLinks, communities, nodeDegrees]);

  // Organize nodes by cluster
  const clusterGroups = useMemo(() => {
    const groups: Record<number, Node[]> = {};
    parsedNodes.forEach(node => {
      const clusterId = communities[node.id] ?? 0;
      if (!groups[clusterId]) {
        groups[clusterId] = [];
      }
      groups[clusterId].push(node);
    });
    
    // Sort nodes within each cluster by degree centrality (descending)
    Object.keys(groups).forEach(cid => {
      const numCid = Number(cid);
      groups[numCid].sort((a, b) => (nodeDegrees[b.id] || 0) - (nodeDegrees[a.id] || 0));
    });
    
    return groups;
  }, [parsedNodes, communities, nodeDegrees]);

  // Detect Structural Gaps (Clusters with zero or minimal cross connections)
  const structuralGaps = useMemo(() => {
    const clusters = Object.keys(clusterGroups).map(Number);
    if (clusters.length < 2) return [];
    
    const gaps: { c1: number; c2: number; score: number; linksCount: number }[] = [];
    
    // Iterate over pairs of clusters
    for (let i = 0; i < clusters.length; i++) {
      for (let j = i + 1; j < clusters.length; j++) {
        const c1 = clusters[i];
        const c2 = clusters[j];
        
        // Count edges connecting nodes in c1 and c2
        const crossLinks = parsedLinks.filter(l => {
          const sId = typeof l.source === 'string' ? l.source : (l.source as any).id;
          const tId = typeof l.target === 'string' ? l.target : (l.target as any).id;
          
          const sCluster = communities[sId];
          const tCluster = communities[tId];
          
          return (sCluster === c1 && tCluster === c2) || (sCluster === c2 && tCluster === c1);
        });
        
        // Gap score: inverse of connections (lower crossLinks = higher gap score)
        const size1 = clusterGroups[c1].length;
        const size2 = clusterGroups[c2].length;
        
        // Only prioritize meaningful clusters
        if (size1 >= 2 && size2 >= 2) {
          const score = 100 / (crossLinks.length + 1) * Math.log(size1 * size2);
          gaps.push({ c1, c2, score, linksCount: crossLinks.length });
        }
      }
    }
    
    return gaps.sort((a, b) => b.score - a.score).slice(0, 3);
  }, [clusterGroups, parsedLinks, communities]);

  // Handle Resize of SVG Canvas
  useEffect(() => {
    if (!d3Container.current) return;
    const parent = d3Container.current.parentElement;
    if (!parent) return;
    
    const updateSize = () => {
      setDimensions({
        width: parent.clientWidth || 600,
        height: parent.clientHeight || 500
      });
    };
    
    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(parent);
    return () => observer.disconnect();
  }, []);

  // Set up zoom behavior
  useEffect(() => {
    const svg = d3Container.current;
    if (!svg) return;
    
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        setTransform({
          x: event.transform.x,
          y: event.transform.y,
          k: event.transform.k
        });
      });
      
    d3.select(svg).call(zoom);
    
    return () => {
      d3.select(svg).on('.zoom', null);
    };
  }, []);

  // --- NLP CO-OCCURRENCE EXTRACTION ENGINE ---
  const handleExtractGraph = () => {
    if (!inputText.trim()) return;
    
    // 1. Split text into sentences
    const sentences = inputText
      .replace(/([.?!])\s*(?=[A-Z])/g, "$1|")
      .split("|")
      .map(s => s.trim().toLowerCase())
      .filter(Boolean);
      
    const tempWordCounts: Record<string, number> = {};
    const tempCoOccurrences: Record<string, number> = {};
    
    sentences.forEach(sentence => {
      // Tokenize sentence into clean words
      const rawWords = sentence
        .replace(/[^\w\s-]/g, '') // remove punctuation except hyphens
        .split(/\s+/)
        .map(w => w.trim())
        .filter(Boolean);
        
      // Filter words based on stopwords and minWordLength
      const words = rawWords.filter(w => {
        if (w.length < minWordLength) return false;
        if (useStopwords && currentStopwords.has(w)) return false;
        if (/^\d+$/.test(w)) return false; // skip numbers
        return true;
      });
      
      // Update word counts
      words.forEach(w => {
        tempWordCounts[w] = (tempWordCounts[w] || 0) + 1;
      });
      
      // Compute sliding window co-occurrences
      for (let i = 0; i < words.length; i++) {
        const start = i + 1;
        const end = Math.min(words.length, i + windowSize);
        
        for (let j = start; j < end; j++) {
          const w1 = words[i];
          const w2 = words[j];
          
          if (w1 === w2) continue; // skip self links
          
          const key = w1 < w2 ? `${w1}-${w2}` : `${w2}-${w1}`;
          tempCoOccurrences[key] = (tempCoOccurrences[key] || 0) + 1;
        }
      }
    });
    
    // Sort and filter extracted concepts (take top 60 to prevent complete chaos)
    const sortedWords = Object.entries(tempWordCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 60);
      
    const extractedWordSet = new Set(sortedWords.map(([w]) => w));
    
    // Create Nodes
    const newNodes: Node[] = sortedWords.map(([word]) => ({
      id: word,
      label: word.charAt(0).toUpperCase() + word.slice(1),
      type: 'concept',
      status: 'VERIFIED',
      metadata: {
        description: `Concept extracted from raw text substrate via Infranodus NLP. Occurrence frequency: ${tempWordCounts[word]}`,
        tags: [word, 'infranodus_extracted'],
        void_quotient: 0.1,
        saturation_level: 50
      }
    }));
    
    // Create Links
    const newLinks: Link[] = [];
    Object.entries(tempCoOccurrences).forEach(([key, weight]) => {
      const [w1, w2] = key.split('-');
      if (extractedWordSet.has(w1) && extractedWordSet.has(w2)) {
        newLinks.push({
          source: w1,
          target: w2,
          type: 'supports', // default to supports for visual logic
          weight: weight,
          metadata: {
            confidence: 0.9,
            notes: `Co-occurrence frequency of ${weight} in substrate text.`
          }
        });
      }
    });
    
    // Degree calculations (for scaling)
    const degrees: Record<string, number> = {};
    newNodes.forEach(n => degrees[n.id] = 0);
    newLinks.forEach(l => {
      const s = typeof l.source === 'string' ? l.source : l.source.id;
      const t = typeof l.target === 'string' ? l.target : l.target.id;
      degrees[s] = (degrees[s] || 0) + (l.weight || 1);
      degrees[t] = (degrees[t] || 0) + (l.weight || 1);
    });
    
    // Run jLouvain Clustering
    let clusterIds: Record<string, number> = {};
    if (newNodes.length > 0) {
      const nodeIds = newNodes.map(n => n.id);
      const edgeData = newLinks.map(l => ({
        source: typeof l.source === 'string' ? l.source : l.source.id,
        target: typeof l.target === 'string' ? l.target : l.target.id,
        weight: l.weight || 1.0
      }));
      
      try {
        const jL = jLouvain().nodes(nodeIds).edges(edgeData);
        clusterIds = jL();
      } catch (e) {
        console.warn("Infranodus Louvain analysis failed, applying basic degree clusters", e);
        // Fallback simple grouping
        newNodes.forEach((n, idx) => {
          clusterIds[n.id] = idx % 4;
        });
      }
    }
    
    setParsedNodes(newNodes);
    setParsedLinks(newLinks);
    setNodeDegrees(degrees);
    setCommunities(clusterIds);
    setClusterNames({}); // clear previous names
    setBridgingIdea(null); // clear previous bridge
    setSelectedNodeId(null);
    setSelectedClusterId(null);
    
    logOptimization('algorithm', 'Executed Infranodus NLP extraction and Louvain modularity clustering', {
      sentencesCount: sentences.length,
      extractedNodes: newNodes.length,
      extractedLinks: newLinks.length
    });
  };

  // Run on mount with default text
  useEffect(() => {
    handleExtractGraph();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- D3 FORCE SIMULATION RENDER ENGINE ---
  useEffect(() => {
    if (parsedNodes.length === 0 || !d3Container.current) return;
    
    // Stop previous simulation
    if (simulationRef.current) {
      simulationRef.current.stop();
    }
    
    // Create copy of nodes/links for simulation
    const simNodes = parsedNodes.map(n => ({ ...n }));
    const simLinks = parsedLinks.map(l => {
      const s = typeof l.source === 'string' ? l.source : l.source.id;
      const t = typeof l.target === 'string' ? l.target : l.target.id;
      return {
        ...l,
        source: s,
        target: t
      };
    });
    
    const svg = d3.select(d3Container.current);
    
    // Force Simulation
    const simulation = d3.forceSimulation(simNodes as any)
      .force("link", d3.forceLink(simLinks).id((d: any) => d.id).distance(80))
      .force("charge", d3.forceManyBody().strength(-200))
      .force("center", d3.forceCenter(dimensions.width / 2, dimensions.height / 2))
      .force("collide", d3.forceCollide().radius(25))
      .alphaDecay(0.04);
      
    simulationRef.current = simulation;
    
    // Tick listener
    simulation.on("tick", () => {
      // Force update D3 node locations
      setParsedNodes(simNodes as any);
      setParsedLinks(simLinks as any);
    });
    
    return () => {
      simulation.stop();
    };
  }, [parsedNodes.length, parsedLinks.length, dimensions.width, dimensions.height]);

  // Scalers for sizing
  const nodeRadiusScale = useMemo(() => {
    const degrees = Object.values(nodeDegrees);
    const minD = degrees.length ? Math.min(...degrees) : 0;
    const maxD = degrees.length ? Math.max(...degrees) : 1;
    return d3.scaleLinear()
      .domain([minD, maxD || 1])
      .range([8, 30]); // radius bounds
  }, [nodeDegrees]);

  const linkWidthScale = useMemo(() => {
    const weights = parsedLinks.map(l => l.weight || 1);
    const minW = weights.length ? Math.min(...weights) : 1;
    const maxW = weights.length ? Math.max(...weights) : 1;
    return d3.scaleLinear()
      .domain([minW, maxW || 1])
      .range([1.0, 5.0]); // stroke width bounds
  }, [parsedLinks]);

  const clusterColorScale = useMemo(() => {
    return d3.scaleOrdinal(d3.schemeCategory10);
  }, []);

  // AI-Powered Cluster Naming
  const handleNameCluster = async (clusterId: number) => {
    if (!ai) return;
    
    const words = clusterGroups[clusterId]?.map(n => n.id) || [];
    if (words.length === 0) return;
    
    setNamingClusterId(clusterId);
    
    try {
      const prompt = `You are the Infranodus Semantic Intelligence Oracle. Analyze the following semantic group/cluster of keywords extracted from a raw philosophical/phenomenological text: [${words.join(', ')}].
      
Produce an elegant, highly dense, 2-to-4 word scholarly/thematic title (e.g., "The Apophasis of Nihility", "Existential Groundlessness", "Ontological Rupture"). Do not add explanations, only return the title itself.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
      });
      
      const title = response.text?.trim() || `Thematic Cluster ${clusterId}`;
      setClusterNames(prev => ({
        ...prev,
        [clusterId]: title.replace(/^"|"$/g, '') // strip quotes
      }));
      
    } catch (e) {
      console.error(e);
    } finally {
      setNamingClusterId(null);
    }
  };

  // AI-Powered Structural Gap Bridging
  const handleBridgeStructuralGap = async (c1: number, c2: number) => {
    if (!ai) return;
    
    const wordsC1 = clusterGroups[c1]?.map(n => n.id) || [];
    const wordsC2 = clusterGroups[c2]?.map(n => n.id) || [];
    
    if (wordsC1.length === 0 || wordsC2.length === 0) return;
    
    setIsBridging(true);
    setBridgingIdea(null);
    setBridgeTargetClusters({ c1, c2 });
    
    try {
      const c1Name = clusterNames[c1] || `Group ${c1}`;
      const c2Name = clusterNames[c2] || `Group ${c2}`;
      
      const prompt = `You are the Infranodus AI Ideation Engine. We have detected a significant STRUCTURAL GAP in our text network between two distinct thematic communities:
      
1. Thematic Cluster A: "${c1Name}" (Keywords: ${wordsC1.slice(0, 5).join(', ')})
2. Thematic Cluster B: "${c2Name}" (Keywords: ${wordsC2.slice(0, 5).join(', ')})

These communities have high internal density but zero or minimal links between them.
Your task is to synthesize a brilliant BRIDGING CONCEPT to connect these two fields and stimulate novel research.

Provide your output in exactly this JSON format:
{
  "bridgingConcept": "single_connecting_word",
  "explanation": "A one-sentence brilliant explanation of how this bridges the two clusters.",
  "researchPrompt": "A provocative research question or prompt designed to explore this synthesis."
}`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });
      
      if (response.text) {
        const jsonResult = JSON.parse(response.text);
        setBridgingIdea(JSON.stringify(jsonResult));
      }
    } catch (e) {
      console.error(e);
      setBridgingIdea(JSON.stringify({
        bridgingConcept: "synthesis",
        explanation: "Failed to connect via AI due to service timeout.",
        researchPrompt: "What is the ontological relation between these fields?"
      }));
    } finally {
      setIsBridging(false);
    }
  };

  // Insert the AI synthesized Bridge node into our active simulation graph!
  const handleInsertBridge = () => {
    if (!bridgingIdea || !bridgeTargetClusters) return;
    
    try {
      const data = JSON.parse(bridgingIdea);
      const bridgeWord = data.bridgingConcept.toLowerCase().replace(/[\s_]+/g, '-');
      
      // Check if node already exists
      if (parsedNodes.some(n => n.id === bridgeWord)) return;
      
      // Create new bridge node
      const newBridgeNode: Node = {
        id: bridgeWord,
        label: data.bridgingConcept.charAt(0).toUpperCase() + data.bridgingConcept.slice(1),
        type: 'synthesis',
        status: 'HYPOTHESIS',
        metadata: {
          description: `AI Synthesis Bridge: ${data.explanation}`,
          tags: [bridgeWord, 'ai_bridge'],
          void_quotient: 0.8,
          saturation_level: 80
        }
      };
      
      // Identify top nodes from both clusters to connect with
      const topC1 = clusterGroups[bridgeTargetClusters.c1][0];
      const topC2 = clusterGroups[bridgeTargetClusters.c2][0];
      
      const newLinks: Link[] = [];
      
      if (topC1) {
        newLinks.push({
          source: bridgeWord,
          target: topC1.id,
          type: 'supports',
          weight: 3.0, // high weight for synthetic bridge
          metadata: { notes: `AI-constructed bridge to ${topC1.id}` }
        });
      }
      
      if (topC2) {
        newLinks.push({
          source: bridgeWord,
          target: topC2.id,
          type: 'supports',
          weight: 3.0,
          metadata: { notes: `AI-constructed bridge to ${topC2.id}` }
        });
      }
      
      // Update nodes, links and clustering state
      const updatedNodes = [...parsedNodes, newBridgeNode];
      const updatedLinks = [...parsedLinks, ...newLinks];
      
      // Place the new node physically between its connections to prevent visual rupture
      const xPos = ((topC1?.x || 0) + (topC2?.x || 0)) / 2 || dimensions.width / 2;
      const yPos = ((topC1?.y || 0) + (topC2?.y || 0)) / 2 || dimensions.height / 2;
      (newBridgeNode as any).x = xPos;
      (newBridgeNode as any).y = yPos;
      
      setParsedNodes(updatedNodes);
      setParsedLinks(updatedLinks);
      
      // Update degrees
      setNodeDegrees(prev => ({
        ...prev,
        [bridgeWord]: 6.0,
        ...(topC1 ? { [topC1.id]: (prev[topC1.id] || 0) + 3 } : {}),
        ...(topC2 ? { [topC2.id]: (prev[topC2.id] || 0) + 3 } : {})
      }));
      
      // Update cluster for bridge
      setCommunities(prev => ({
        ...prev,
        [bridgeWord]: bridgeTargetClusters.c1 // belong to first group for coloring
      }));
      
      setBridgingIdea(null); // reset bridging state
      setBridgeTargetClusters(null);
      
      logOptimization('algorithm', 'Inserted AI synthetic bridging concept into visual network', {
        concept: bridgeWord,
        bridges: [topC1?.id, topC2?.id].filter(Boolean)
      });
      
    } catch (e) {
      console.error(e);
    }
  };

  // Merge current Infranodus graph into the main persistent SQLite database!
  const handleMergeToMainCorpus = async () => {
    if (parsedNodes.length === 0) return;
    setSavingStatus('saving');
    
    try {
      // 1. Prepare data bundle
      const finalNodes = parsedNodes.map(n => ({
        ...n,
        metadata: {
          ...n.metadata,
          tags: [...(n.metadata?.tags || []), 'infranodus_synthesis']
        }
      }));
      
      const finalLinks = parsedLinks.map(l => ({
        ...l,
        source: typeof l.source === 'string' ? l.source : l.source.id,
        target: typeof l.target === 'string' ? l.target : l.target.id
      }));
      
      // 2. Integration via store for immediate frontend update
      integrateSyntheticData(finalNodes, finalLinks);
      
      // 3. Post to Hono/Express sqlite backend to persist
      for (const node of finalNodes) {
        await fetch('/api/nodes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(node)
        });
      }
      
      for (const link of finalLinks) {
        await fetch('/api/links', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(link)
        });
      }
      
      setSavingStatus('saved');
      setTimeout(() => setSavingStatus('idle'), 3000);
      
      logOptimization('refactor', 'Merged full Infranodus network into primary corpus', {
        nodesIntegrated: finalNodes.length,
        linksIntegrated: finalLinks.length
      });
    } catch (error) {
      console.error("Failed to merge to main corpus:", error);
      setSavingStatus('idle');
    }
  };

  const activeBridgingObj = useMemo(() => {
    if (!bridgingIdea) return null;
    try {
      return JSON.parse(bridgingIdea);
    } catch {
      return null;
    }
  }, [bridgingIdea]);

  return (
    <div className="w-full h-full flex bg-[#0c0c0c] text-zinc-100 font-mono relative">
      
      {/* 1. LEFT PANEL: Raw Text Ingestion & NLP Parameters */}
      <div className="w-[380px] shrink-0 border-r border-white/5 bg-zinc-950/70 p-6 flex flex-col justify-between overflow-y-auto custom-scrollbar">
        <div className="space-y-6">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
            <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
              <Type className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold tracking-wider text-zinc-200">Text-to-Graph Engine</h2>
              <span className="text-[9px] text-zinc-500 tracking-widest uppercase">Infranodus AI Clone</span>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="space-y-2">
            <label className="text-[10px] font-semibold text-zinc-400 tracking-wider uppercase">Ingestion Substrate Presets</label>
            <div className="grid grid-cols-3 gap-2">
              {SAMPLE_TEXTS.map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => setInputText(sample.text)}
                  className={cn(
                    "p-2 text-[9px] font-bold border rounded-lg tracking-wider text-center truncate cursor-pointer transition-all",
                    inputText === sample.text 
                      ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-300"
                      : "bg-white/5 border-white/5 text-zinc-400 hover:bg-white/10"
                  )}
                >
                  {sample.title}
                </button>
              ))}
            </div>
          </div>

          {/* Text Area */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-semibold text-zinc-400 tracking-wider uppercase">Raw Report Text</label>
              <span className="text-[9px] text-zinc-500 font-bold">{inputText.length} chars</span>
            </div>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste your notes, reports, or philosophical insights here..."
              className="w-full h-40 bg-black border border-white/10 rounded-xl p-3 text-xs font-sans text-zinc-300 focus:outline-none focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/10 resize-none custom-scrollbar"
            />
          </div>

          {/* Parameters Accordion */}
          <div className="space-y-4 p-4 bg-white/5 border border-white/5 rounded-xl">
            <h3 className="text-[10px] font-bold text-zinc-300 tracking-wider uppercase flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-zinc-400" /> NLP Extraction Settings
            </h3>
            
            {/* Window Size slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-[9px] font-bold text-zinc-400">
                <span>Co-occurrence Window</span>
                <span className="text-emerald-400">{windowSize} words</span>
              </div>
              <input 
                type="range" 
                min={2} 
                max={6} 
                value={windowSize} 
                onChange={(e) => setWindowSize(Number(e.target.value))}
                className="w-full accent-emerald-500 bg-zinc-800 rounded-lg cursor-pointer h-1"
              />
              <p className="text-[8px] text-zinc-500 leading-normal">Sets the proximity threshold within which words are linked together.</p>
            </div>

            {/* Min Word Length slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-[9px] font-bold text-zinc-400">
                <span>Minimum Word Length</span>
                <span className="text-emerald-400">{minWordLength} letters</span>
              </div>
              <input 
                type="range" 
                min={2} 
                max={5} 
                value={minWordLength} 
                onChange={(e) => setMinWordLength(Number(e.target.value))}
                className="w-full accent-emerald-500 bg-zinc-800 rounded-lg cursor-pointer h-1"
              />
            </div>

            {/* Custom Stopwords */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[9px] font-bold text-zinc-400">
                <span className="flex items-center gap-1.5">
                  <input 
                    type="checkbox" 
                    checked={useStopwords} 
                    onChange={(e) => setUseStopwords(e.target.checked)}
                    className="accent-emerald-500"
                  />
                  Filter Stopwords
                </span>
              </div>
              {useStopwords && (
                <input
                  type="text"
                  value={customStopwords}
                  onChange={(e) => setCustomStopwords(e.target.value)}
                  placeholder="Custom stopwords (comma separated)"
                  className="w-full bg-black border border-white/5 rounded-lg px-2 py-1.5 text-[10px] text-zinc-300 focus:outline-none focus:border-emerald-500/40"
                />
              )}
            </div>
          </div>
        </div>

        {/* Ingestion Action Buttons */}
        <div className="pt-6 border-t border-white/5 space-y-3">
          <button
            onClick={handleExtractGraph}
            className="w-full bg-emerald-500 text-black hover:bg-emerald-400 font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <RefreshCw className="w-4 h-4 animate-spin-slow" /> Extract & Cluster Network
          </button>
          
          <button
            onClick={handleMergeToMainCorpus}
            disabled={parsedNodes.length === 0 || savingStatus === 'saving'}
            className={cn(
              "w-full border font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all",
              savingStatus === 'saved' 
                ? "bg-emerald-950/20 border-emerald-500/40 text-emerald-400"
                : "bg-white/5 border-white/10 hover:bg-white/10 text-zinc-300"
            )}
          >
            {savingStatus === 'saving' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Merging to Database...
              </>
            ) : savingStatus === 'saved' ? (
              <>
                <Check className="w-4 h-4" /> Integrated into Corpus!
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Merge with Main Database
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. MIDDLE PANEL: Stunning D3 Force Graph Visualizer */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#060606] relative overflow-hidden">
        
        {/* Network Diagnostics Header */}
        <div className="absolute top-6 left-6 right-6 z-20 flex justify-between pointer-events-none">
          {/* Legend/Info */}
          <div className="flex gap-4 p-3 bg-black/80 backdrop-blur-md border border-white/5 rounded-xl pointer-events-auto">
            <div className="flex flex-col gap-1 pr-4 border-r border-white/5">
              <span className="text-[8px] font-bold text-zinc-500 tracking-widest uppercase">Modularity</span>
              <span className="text-xs font-semibold text-emerald-400">{stats.modularity.toFixed(2)}</span>
            </div>
            <div className="flex flex-col gap-1 pr-4 border-r border-white/5">
              <span className="text-[8px] font-bold text-zinc-500 tracking-widest uppercase">Density</span>
              <span className="text-xs font-semibold text-sky-400">{(stats.density * 100).toFixed(1)}%</span>
            </div>
            <div className="flex flex-col gap-1 pr-4 border-r border-white/5">
              <span className="text-[8px] font-bold text-zinc-500 tracking-widest uppercase">Avg Centrality</span>
              <span className="text-xs font-semibold text-purple-400">{stats.avgDegree.toFixed(1)}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[8px] font-bold text-zinc-500 tracking-widest uppercase font-mono">Nodes / Links</span>
              <span className="text-xs font-semibold text-zinc-200">{parsedNodes.length} / {parsedLinks.length}</span>
            </div>
          </div>
          
          {/* Guide Note */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-black/60 backdrop-blur-md border border-white/5 rounded-full text-[8px] text-zinc-500 font-bold tracking-widest uppercase">
            <Info className="w-3.5 h-3.5 text-zinc-400" /> Scroll to zoom • Drag nodes to restructure
          </div>
        </div>

        {/* SVG Canvas Container */}
        <div className="flex-1 w-full h-full cursor-grab active:cursor-grabbing relative overflow-hidden">
          <svg 
            ref={d3Container} 
            className="w-full h-full pointer-events-auto"
          >
            <defs>
              <filter id="bloom">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feColorMatrix in="blur" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="glow" />
                <feComposite in="SourceGraphic" in2="glow" operator="over" />
              </filter>
            </defs>

            {/* Transform G */}
            <g 
              style={{
                transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.k})`,
                transformOrigin: '0 0'
              }}
            >
              {/* Force Links Group */}
              <g strokeOpacity={0.6} fill="none">
                {parsedLinks.map((link, i) => {
                  const source = typeof link.source === 'string' ? link.source : link.source.id;
                  const target = typeof link.target === 'string' ? link.target : link.target.id;
                  const sourceNode = parsedNodes.find(n => n.id === source);
                  const targetNode = parsedNodes.find(n => n.id === target);
                  
                  if (!sourceNode || !targetNode || isNaN((sourceNode as any).x) || isNaN((targetNode as any).x)) return null;
                  
                  const isLinkHovered = hoveredLink === link || 
                                       (hoveredNodeId === source || hoveredNodeId === target);
                                       
                  const sCluster = communities[source];
                  const color = sCluster !== undefined ? clusterColorScale(sCluster.toString()) as string : '#374151';
                  
                  return (
                    <line
                      key={`link-${i}`}
                      x1={(sourceNode as any).x}
                      y1={(sourceNode as any).y}
                      x2={(targetNode as any).x}
                      y2={(targetNode as any).y}
                      stroke={color}
                      strokeWidth={isLinkHovered ? linkWidthScale(link.weight || 1) * 1.8 : linkWidthScale(link.weight || 1)}
                      strokeOpacity={isLinkHovered ? 0.9 : 0.25}
                      className="transition-all duration-300"
                    />
                  );
                })}
              </g>

              {/* Force Nodes Group */}
              <g>
                {parsedNodes.map((node, idx) => {
                  if (isNaN((node as any).x) || isNaN((node as any).y)) return null;
                  
                  const isSelected = selectedNodeId === node.id;
                  const isHovered = hoveredNodeId === node.id;
                  const clusterId = communities[node.id];
                  const color = clusterId !== undefined ? clusterColorScale(clusterId.toString()) as string : '#ffffff';
                  const radius = nodeRadiusScale(nodeDegrees[node.id] || 0);
                  
                  // Drag handling inside react
                  const handleDragStart = (e: React.MouseEvent) => {
                    e.stopPropagation();
                    const simulation = simulationRef.current;
                    if (!simulation) return;
                    
                    simulation.alphaTarget(0.3).restart();
                    (node as any).fx = (node as any).x;
                    (node as any).fy = (node as any).y;
                    
                    const handleMouseMove = (mvEvent: MouseEvent) => {
                      const svgRect = d3Container.current?.getBoundingClientRect();
                      if (!svgRect) return;
                      // convert raw coordinates considering zoom transform
                      (node as any).fx = (mvEvent.clientX - svgRect.left - transform.x) / transform.k;
                      (node as any).fy = (mvEvent.clientY - svgRect.top - transform.y) / transform.k;
                    };
                    
                    const handleMouseUp = () => {
                      window.removeEventListener('mousemove', handleMouseMove);
                      window.removeEventListener('mouseup', handleMouseUp);
                      simulation.alphaTarget(0);
                      (node as any).fx = null;
                      (node as any).fy = null;
                    };
                    
                    window.addEventListener('mousemove', handleMouseMove);
                    window.addEventListener('mouseup', handleMouseUp);
                  };

                  return (
                    <g
                      key={`node-${node.id}`}
                      transform={`translate(${(node as any).x}, ${(node as any).y})`}
                      className="cursor-pointer group"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedNodeId(node.id);
                        setSelectedClusterId(clusterId);
                      }}
                      onMouseEnter={() => setHoveredNodeId(node.id)}
                      onMouseLeave={() => setHoveredNodeId(null)}
                      onMouseDown={handleDragStart}
                    >
                      {/* Aura circle */}
                      <circle
                        r={radius + (isHovered || isSelected ? 8 : 4)}
                        fill={color}
                        fillOpacity={isHovered || isSelected ? 0.25 : 0.05}
                        stroke={color}
                        strokeOpacity={isHovered || isSelected ? 0.4 : 0.0}
                        className="transition-all duration-300"
                        style={isHovered || isSelected ? { filter: 'url(#bloom)' } : {}}
                      />
                      
                      {/* Core circle */}
                      <circle
                        r={radius}
                        fill={isSelected ? '#ffffff' : color}
                        stroke={isSelected ? color : "#000000"}
                        strokeWidth={1.5}
                        className="transition-colors duration-300"
                      />

                      {/* Floating Text Label */}
                      <text
                        dy={radius + 15}
                        textAnchor="middle"
                        fill={isHovered || isSelected ? "#ffffff" : "#a1a1aa"}
                        fontSize={isHovered || isSelected ? "10px" : "8px"}
                        fontWeight={isHovered || isSelected ? "bold" : "normal"}
                        className="pointer-events-none select-none font-sans font-medium transition-all duration-300"
                      >
                        {node.label}
                      </text>
                    </g>
                  );
                })}
              </g>
            </g>
          </svg>
        </div>

        {/* Hover / Tooltip Detail Overlay (Bottom Center) */}
        <AnimatePresence>
          {selectedNodeId && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-6 left-6 right-6 z-30 p-4 bg-zinc-950 border border-white/5 rounded-xl flex items-center justify-between shadow-2xl"
            >
              <div className="flex-1 pr-6">
                <div className="flex items-center gap-2 mb-1.5">
                  <span 
                    className="w-2.5 h-2.5 rounded-full" 
                    style={{ backgroundColor: clusterColorScale((communities[selectedNodeId] || 0).toString()) as string }}
                  />
                  <h4 className="text-xs font-bold text-zinc-100 uppercase tracking-widest">
                    Concept: {parsedNodes.find(n => n.id === selectedNodeId)?.label}
                  </h4>
                  <span className="text-[8px] bg-white/5 border border-white/5 px-2 py-0.5 rounded text-zinc-400 font-bold tracking-widest">
                    Cluster {communities[selectedNodeId] || 0}
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400 leading-relaxed font-sans font-medium">
                  Centrality degree: <span className="text-zinc-200 font-bold">{nodeDegrees[selectedNodeId] || 0}</span>. 
                  This concept represents a highly central motif in your semantic structure, forming dense thematic bonds.
                </p>
              </div>
              <button 
                onClick={() => setSelectedNodeId(null)}
                className="p-1 text-zinc-500 hover:text-zinc-200 rounded-full hover:bg-white/5 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 3. RIGHT PANEL: Louvain Clusters, Structural Gaps & AI Ideation */}
      <div className="w-[420px] shrink-0 border-l border-white/5 bg-zinc-950/70 p-6 flex flex-col justify-between overflow-y-auto custom-scrollbar">
        <div className="space-y-6">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
            <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
              <Sparkles className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold tracking-wider text-zinc-200">Thematic Clusters & Gaps</h2>
              <span className="text-[9px] text-zinc-500 tracking-widest uppercase">Semantic Analysis</span>
            </div>
          </div>

          {/* Section A: Louvain Thematic Clusters */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-bold text-zinc-400 tracking-widest uppercase">Thematic Clusters ({Object.keys(clusterGroups).length})</h3>
            
            <div className="space-y-3">
              {Object.entries(clusterGroups).map(([cid, words]) => {
                const clusterId = Number(cid);
                const color = clusterColorScale(cid) as string;
                const isSelected = selectedClusterId === clusterId;
                
                return (
                  <div 
                    key={cid}
                    onClick={() => setSelectedClusterId(clusterId)}
                    className={cn(
                      "p-3 rounded-xl border transition-all cursor-pointer",
                      isSelected 
                        ? "bg-zinc-900 border-white/10 shadow-lg" 
                        : "bg-white/5 border-white/5 hover:border-white/10"
                    )}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                        <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest">
                          {clusterNames[clusterId] || `Cluster #${clusterId}`}
                        </span>
                      </div>
                      
                      {ai && !clusterNames[clusterId] && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNameCluster(clusterId);
                          }}
                          disabled={namingClusterId === clusterId}
                          className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded hover:bg-emerald-500/20 text-[8px] font-bold tracking-widest uppercase text-emerald-400 flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          {namingClusterId === clusterId ? (
                            <Loader2 className="w-2.5 h-2.5 animate-spin" />
                          ) : (
                            <Sparkles className="w-2.5 h-2.5" />
                          )}
                          Name Cluster
                        </button>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {words.slice(0, 8).map(node => (
                        <span 
                          key={node.id} 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedNodeId(node.id);
                          }}
                          className={cn(
                            "text-[8px] font-bold tracking-widest px-2 py-0.5 rounded font-mono border transition-all cursor-pointer",
                            selectedNodeId === node.id
                              ? "bg-white text-black border-transparent"
                              : "bg-black/40 border-white/5 text-zinc-300 hover:border-white/10"
                          )}
                        >
                          {node.id}
                        </span>
                      ))}
                      {words.length > 8 && (
                        <span className="text-[8px] text-zinc-500 font-bold flex items-center pl-1">
                          +{words.length - 8} more
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section B: Structural Gaps Detection */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-bold text-zinc-400 tracking-widest uppercase">Structural Gaps & Bridges</h3>
            
            {structuralGaps.length > 0 ? (
              <div className="space-y-3">
                {structuralGaps.map((gap, idx) => {
                  const c1Name = clusterNames[gap.c1] || `Cluster ${gap.c1}`;
                  const c2Name = clusterNames[gap.c2] || `Cluster ${gap.c2}`;
                  const color1 = clusterColorScale(gap.c1.toString()) as string;
                  const color2 = clusterColorScale(gap.c2.toString()) as string;
                  const isBridgingActive = bridgeTargetClusters?.c1 === gap.c1 && bridgeTargetClusters?.c2 === gap.c2;

                  return (
                    <div key={idx} className="p-3 bg-white/5 border border-white/5 rounded-xl space-y-3">
                      <div className="flex justify-between items-center text-[9px] font-bold text-zinc-400">
                        <span className="text-orange-400 flex items-center gap-1 uppercase tracking-widest">
                          <AlertTriangle className="w-3.5 h-3.5" /> Gap detected (Score: {gap.score.toFixed(0)})
                        </span>
                        <span className="text-zinc-500">{gap.linksCount} connections</span>
                      </div>

                      <div className="flex items-center justify-between p-2 bg-black/40 border border-white/5 rounded-lg">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: color1 }} />
                          <span className="text-[9px] text-zinc-300 uppercase tracking-widest truncate max-w-[120px]">{c1Name}</span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-zinc-600" />
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: color2 }} />
                          <span className="text-[9px] text-zinc-300 uppercase tracking-widest truncate max-w-[120px]">{c2Name}</span>
                        </div>
                      </div>

                      {ai && (
                        <button
                          onClick={() => handleBridgeStructuralGap(gap.c1, gap.c2)}
                          disabled={isBridging}
                          className="w-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 hover:border-emerald-500/40 text-emerald-400 font-bold text-[10px] py-2 rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-all"
                        >
                          {isBridgingActive ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Zap className="w-3.5 h-3.5" />
                          )}
                          Bridge Cluster Gap via AI
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-[10px] text-zinc-500 border border-dashed border-white/10 p-3 rounded-lg text-center font-bold">
                Extract larger text substrate with multiple clusters to detect semantic gaps.
              </p>
            )}
          </div>
        </div>

        {/* Dynamic AI Generated Synthesis Bridge Block (Sticky Bottom of Right Panel) */}
        <AnimatePresence>
          {activeBridgingObj && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="mt-6 p-4 bg-emerald-950/15 border border-emerald-500/20 rounded-xl space-y-3"
            >
              <div className="flex justify-between items-center border-b border-emerald-500/10 pb-2">
                <span className="text-[9px] text-emerald-400 font-bold tracking-widest uppercase flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 animate-pulse" /> AI Synthesis Bridge Concept
                </span>
                <span className="text-[10px] font-bold text-white font-mono bg-emerald-500/20 px-2.5 py-0.5 rounded-full">
                  {activeBridgingObj.bridgingConcept}
                </span>
              </div>
              
              <div className="space-y-2">
                <p className="text-[9px] text-zinc-300 leading-relaxed font-sans font-medium">
                  {activeBridgingObj.explanation}
                </p>
                <div className="p-2.5 bg-black/40 border border-white/5 rounded-lg">
                  <span className="text-[8px] text-zinc-500 font-bold tracking-wider uppercase block mb-1">Research Direction</span>
                  <p className="text-[9px] text-zinc-400 italic leading-relaxed font-sans">
                    "{activeBridgingObj.researchPrompt}"
                  </p>
                </div>
              </div>

              <button
                onClick={handleInsertBridge}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-[10px] py-2 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Insert Bridging Concept into Network
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
    </div>
  );
}

// Custom simple stop for close button helper
function X({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
