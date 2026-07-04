import fs from 'fs';

let content = fs.readFileSync('src/components/KnowledgeGraph.tsx', 'utf-8');

// 1. Add jLouvain import
if (!content.includes('jlouvain')) {
  content = content.replace(
    "import * as d3 from 'd3';",
    "import * as d3 from 'd3';\nimport { jLouvain } from 'jlouvain';"
  );
}

// 2. Add community detection
const communityLogic = `
  // --- COMMUNITY DETECTION ---
  const communities = useMemo(() => {
    if (nodes.length === 0) return {};
    
    const edgeData = initialLinks.map(link => {
      const sourceId = typeof link.source === 'string' ? link.source : (link.source as any).id;
      const targetId = typeof link.target === 'string' ? link.target : (link.target as any).id;
      return { source: sourceId, target: targetId, weight: 1.0 };
    });
    
    const nodeIds = nodes.map(n => n.id);
    
    try {
      const jL = jLouvain().nodes(nodeIds).edges(edgeData);
      return jL();
    } catch (e) {
      console.warn("Louvain clustering failed:", e);
      return {};
    }
  }, [nodes, initialLinks]);

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
`;

if (!content.includes('// --- COMMUNITY DETECTION ---')) {
  content = content.replace(
    '// --- PERSISTENT RELATIONAL WEB LOGIC ---',
    communityLogic + '\n  // --- PERSISTENT RELATIONAL WEB LOGIC ---'
  );
}

// 3. Update calculateLinkStyle to use weight
const linkWeightLogic = `
  const linkWeights = useMemo(() => {
    const weights: Record<string, number> = {};
    initialLinks.forEach(link => {
      const sourceId = typeof link.source === 'string' ? link.source : (link.source as any).id;
      const targetId = typeof link.target === 'string' ? link.target : (link.target as any).id;
      const key = sourceId < targetId ? \`\${sourceId}-\${targetId}\` : \`\${targetId}-\${sourceId}\`;
      weights[key] = (weights[key] || 0) + 1;
    });
    return weights;
  }, [initialLinks]);

  const linkWeightScale = useMemo(() => {
    const weights = Object.values(linkWeights);
    const minWeight = weights.length ? Math.min(...weights) : 1;
    const maxWeight = weights.length ? Math.max(...weights) : 1;
    return d3.scaleLinear()
      .domain([minWeight, maxWeight || 1])
      .range([1.2, 6.0]);
  }, [linkWeights]);
`;

if (!content.includes('const linkWeights = useMemo')) {
  content = content.replace(
    'const calculateLinkStyle = (link: any) => {',
    linkWeightLogic + '\n  const calculateLinkStyle = (link: any) => {'
  );
}

// Inject weight into width calculation
content = content.replace(
  'let width = 1.2;',
  `const linkKey = sourceId < targetId ? \`\${sourceId}-\${targetId}\` : \`\${targetId}-\${sourceId}\`;
    let width = linkWeightScale(linkWeights[linkKey] || 1);`
);

// 4. Update Node Scale to use D3 scaleLinear
const nodeScaleLogic = `
  const nodeDegrees = useMemo(() => {
    const degrees: Record<string, number> = {};
    initialLinks.forEach(link => {
      const sourceId = typeof link.source === 'string' ? link.source : (link.source as any).id;
      const targetId = typeof link.target === 'string' ? link.target : (link.target as any).id;
      degrees[sourceId] = (degrees[sourceId] || 0) + 1;
      degrees[targetId] = (degrees[targetId] || 0) + 1;
    });
    return degrees;
  }, [initialLinks]);

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
      radius,
      aif,
      glowIntensity: aif * 0.6,
      auraSize: aif * 25
    };
  };`;

// Replace existing PERMANENT GLOBAL SCALING LOGIC
const scalingRegex = /const nodeDegrees = useMemo\([\s\S]*?return \{\s*radius: Math\.max.*?\n.*?aif \* 25\s*\};\s*\};/g;
content = content.replace(scalingRegex, nodeScaleLogic);

// Data-throttling strategy
const dataThrottlingLogic = `
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
`;

// Replace `const activeLatentLinks = useMemo(...)` with `dataThrottlingLogic`
const activeLatentRegex = /const activeLatentLinks = useMemo\(\(\) => \{[\s\S]*?\}, \[showLatent, latentLinksBase, layoutNodes\]\);/g;
content = content.replace(activeLatentRegex, dataThrottlingLogic);

// In the component body, replace `layoutNodes` with `visibleNodes` and `links` with `visibleLinks` where appropriate, 
// mainly in the mapping logic inside the return statement.
content = content.replace(
  /layoutNodesRef\.current = layoutNodes;/g,
  "layoutNodesRef.current = visibleNodes;"
);
content = content.replace(
  /linksRef\.current = links;/g,
  "linksRef.current = visibleLinks;"
);
content = content.replace(
  /layoutNodes\.map/g,
  "visibleNodes.map"
);
content = content.replace(
  /links\.map/g,
  "visibleLinks.map"
);
content = content.replace(
  /links\.some/g,
  "visibleLinks.some"
);

// Replace getHierarchicalColor with getClusterColor in calculateLinkStyle and layoutNodes mapping
content = content.replace(
  /const sourceColor = sourceNode \? getHierarchicalColor\(sourceNode\) : '#ffffff';/g,
  "const sourceColor = sourceNode ? getClusterColor(sourceNode) : '#ffffff';"
);

content = content.replace(
  /const color = getHierarchicalColor\(node\);/g,
  "const color = getClusterColor(node);"
);

fs.writeFileSync('src/components/KnowledgeGraph.tsx', content);
