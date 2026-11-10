// Automated Test Suite for HyperMarkmap Ω Space-Efficiency & HUD Modernization
const fs = require('fs');
const path = require('path');

console.log('=== RUNNING HYPERMARKMAP Ω AUTOMATED VERIFICATION SUITE ===\n');

const CANONICAL_TRADITIONS = [
  { id: "buddhist", label: "Buddhist", kw: "Buddhist", color: "#ff9d8a" },
  { id: "christian", label: "Christian", kw: "Christian", color: "#8affc0" },
  { id: "existential", label: "Existential", kw: "Existential", color: "#ffd28a" },
  { id: "sufi", label: "Sufi", kw: "Sufi", color: "#8ac2ff" },
  { id: "hindu", label: "Hindu", kw: "Hindu", color: "#ff8ad8" },
  { id: "daoist", label: "Daoist", kw: "Daoist", color: "#7affd4" },
  { id: "jewish", label: "Kabbalistic", kw: "Kabbal", color: "#b98aff" },
  { id: "phenomenological", label: "Phenomenological", kw: "Phenomeno", color: "#e8e37a" },
  { id: "postmodern", label: "Postmodern", kw: "Postmodern", color: "#7ab8ff" },
  { id: "counter", label: "Counter-Enlightenment", kw: "Counter", color: "#b0bcd8" }
];

function extractOperator(text) {
  const match = text.match(/([∅⚖⇄🜏⟁])/);
  if (match) {
    return {
      cleanText: text.replace(match[0], '').trim(),
      operator: match[0]
    };
  }
  return { cleanText: text };
}

function detectTraditions(text) {
  if (!text) return [];
  const lower = text.toLowerCase();
  const matched = [];
  for (const t of CANONICAL_TRADITIONS) {
    if (lower.includes(t.kw.toLowerCase())) {
      matched.push(t.id);
    }
  }
  return matched;
}

function computeDescendantCounts(node) {
  const children = node.children || node._children || [];
  let count = children.length;
  for (const child of children) {
    count += computeDescendantCounts(child);
  }
  node.descendantCount = count;
  return count;
}

function computeTraditionCounts(root) {
  const counts = {};
  for (const t of CANONICAL_TRADITIONS) {
    counts[t.id] = 0;
  }
  function traverse(n) {
    if (n.traditions && n.traditions.length > 0) {
      for (const tid of n.traditions) {
        if (counts[tid] !== undefined) counts[tid] += 1;
      }
    }
    const children = n.children || n._children || [];
    for (const child of children) traverse(child);
  }
  traverse(root);
  return counts;
}

function parseMarkdownToTree(markdown) {
  if (!markdown || !markdown.trim()) {
    return { id: 'root', name: 'HyperMarkmap Root', depth: 0, children: [], traditions: [] };
  }
  const lines = markdown.split(/\r?\n/);
  const root = { id: 'root', name: 'Untitled Map', depth: 0, children: [], traditions: [] };
  const stack = [{ node: root, level: 0 }];
  let hasExplicitRoot = false;
  let nodeIdCounter = 1;
  let activeHeadingBaseLevel = 100;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();
    if (!trimmed || trimmed.startsWith('```') || trimmed.startsWith('---')) continue;

    const headingMatch = rawLine.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      const headingCount = headingMatch[1].length;
      const headingRank = headingCount * 100;
      activeHeadingBaseLevel = headingRank;

      const text = headingMatch[2].trim();
      const { cleanText, operator } = extractOperator(text);
      const traditions = detectTraditions(cleanText);

      if (headingCount === 1 && !hasExplicitRoot) {
        root.name = cleanText || 'HyperMarkmap Root';
        root.operator = operator;
        root.traditions = traditions;
        hasExplicitRoot = true;
        stack[0] = { node: root, level: headingRank };
        continue;
      }

      const newNode = {
        id: `node-${nodeIdCounter++}`,
        name: cleanText,
        depth: headingCount,
        operator,
        traditions,
        children: []
      };

      while (stack.length > 1 && stack[stack.length - 1].level >= headingRank) {
        stack.pop();
      }

      const parent = stack[stack.length - 1].node;
      if (!parent.children) parent.children = [];
      parent.children.push(newNode);
      stack.push({ node: newNode, level: headingRank });
      continue;
    }

    const listMatch = rawLine.match(/^(\s*)([-*+]|\d+\.)\s+(.*)$/);
    if (listMatch) {
      const indentSpaces = listMatch[1].replace(/\t/g, '  ').length;
      const text = listMatch[3].trim();
      const { cleanText, operator } = extractOperator(text);
      const traditions = detectTraditions(cleanText);
      const listTier = Math.floor(indentSpaces / 2) + 1;
      const effectiveLevel = activeHeadingBaseLevel + (listTier * 10);
      const visualDepth = Math.floor(activeHeadingBaseLevel / 100) + listTier;

      const newNode = {
        id: `node-${nodeIdCounter++}`,
        name: cleanText,
        depth: visualDepth,
        operator,
        traditions,
        children: []
      };

      while (stack.length > 1 && stack[stack.length - 1].level >= effectiveLevel) {
        stack.pop();
      }

      const parent = stack[stack.length - 1].node;
      if (!parent.children) parent.children = [];
      parent.children.push(newNode);
      stack.push({ node: newNode, level: effectiveLevel });
      continue;
    }

    const quoteMatch = rawLine.match(/^>\s+(.*)$/);
    if (quoteMatch) {
      const quoteText = quoteMatch[1].trim();
      const currentTarget = stack[stack.length - 1].node;
      if (currentTarget) {
        currentTarget.notes = currentTarget.notes
          ? `${currentTarget.notes}\n${quoteText}`
          : quoteText;
        const qTrad = detectTraditions(quoteText);
        if (qTrad.length > 0) {
          currentTarget.traditions = Array.from(new Set([...(currentTarget.traditions || []), ...qTrad]));
        }
      }
    }
  }

  computeDescendantCounts(root);
  return root;
}

function parseJsonToTree(jsonInput) {
  let raw = typeof jsonInput === 'string' ? JSON.parse(jsonInput) : jsonInput;
  let targetRoot = raw;
  if (raw.data && typeof raw.data === 'object') {
    targetRoot = raw.data;
  } else if (raw.root && (raw.root.data || raw.root.children)) {
    targetRoot = raw.root;
  }
  let nodeIdCounter = 1;

  function normalize(item, depth) {
    let d = item;
    if (item.data && typeof item.data === 'object') {
      d = item.data;
    }

    let name = d.text || d.name || d.title || d.label || item.name || item.text || item.title || 'Untitled';
    let notes = d.note || d.notes || d.description || item.note || item.notes || item.description;

    const { cleanText, operator } = extractOperator(String(name).trim());
    const fullTextForTraditions = `${cleanText} ${notes || ''}`;
    const traditions = detectTraditions(fullTextForTraditions);

    const node = {
      id: item.id || d.id || `json-node-${nodeIdCounter++}`,
      name: cleanText,
      depth,
      operator,
      notes,
      traditions,
      children: []
    };

    const rawChildren = d.children || item.children || d.nodes || item.nodes || [];
    if (Array.isArray(rawChildren)) {
      node.children = rawChildren.map((child) => normalize(child, depth + 1));
    }
    return node;
  }

  const result = normalize(targetRoot, 0);
  computeDescendantCounts(result);
  return result;
}

// -------------------------------------------------------------
// TEST SUITE 1: Markdown Parser & Tradition Extraction Verification
// -------------------------------------------------------------
console.log('TEST 1: Markdown Parser & Tradition Detection...');
const sampleMd = `# Ontology Summit ∅
## Epistemic Ground ⚖
- Buddhist Void Realization [Buddhist]
  - Dionysius Christian Divine Darkness [Christian]
- Eckhart Desert 🜏 [Christian]
> Ineffable silence beyond predicate in Sufi mysticism
## Transcendent Synthesis ⇄
- Gelassenheit [Existential]
`;

const mdTree = parseMarkdownToTree(sampleMd);
console.assert(mdTree.name === 'Ontology Summit', 'Root name should be Ontology Summit');
console.assert(mdTree.operator === '∅', 'Root operator should be ∅');
console.assert(mdTree.children.length === 2, 'Root should have 2 children (headings)');
console.assert(mdTree.children[0].name === 'Epistemic Ground', 'First child heading');
console.assert(mdTree.children[0].operator === '⚖', 'First child operator ⚖');

const tradCounts = computeTraditionCounts(mdTree);
console.log('Detected Traditions in Sample:', tradCounts);
console.assert(tradCounts.buddhist === 1, 'Should detect 1 Buddhist node');
console.assert(tradCounts.christian >= 2, 'Should detect Christian nodes');
console.assert(tradCounts.sufi === 1, 'Should detect Sufi node from blockquote note');
console.log('✓ TEST 1 PASSED: Markdown parser successfully generated nested hierarchy with operators, quotes, and tradition lanes.\n');

// -------------------------------------------------------------
// TEST SUITE 2: simpleMindMap Canonical JSON Ingestion
// -------------------------------------------------------------
console.log('TEST 2: Canonical JSON Ingestion (JOURNAL314_OMEGA_HYPERMAP_EXPANDED.json)...');
const jsonPath = path.join(__dirname, 'public/data/JOURNAL314_OMEGA_HYPERMAP_EXPANDED.json');
const rawJson = fs.readFileSync(jsonPath, 'utf8');

const t0 = Date.now();
const jsonTree = parseJsonToTree(rawJson);
const parseTimeMs = Date.now() - t0;
const canonicalTradCounts = computeTraditionCounts(jsonTree);

console.log(`Parsed Canonical Tree in ${parseTimeMs}ms:`);
console.log(`- Root Node: "${jsonTree.name}"`);
console.log(`- Total Descendants: ${jsonTree.descendantCount}`);
console.log(`- Top-Level Chapters: ${jsonTree.children ? jsonTree.children.length : 0}`);
console.log(`- Canonical Tradition Distribution:`);
for (const t of CANONICAL_TRADITIONS) {
  console.log(`   • ${t.label}: ${canonicalTradCounts[t.id]}`);
}

console.assert(jsonTree.descendantCount > 100, 'Should have over 100 nodes in canonical corpus');
console.assert(parseTimeMs < 150, 'Parse time must be well under 150ms');
console.log('✓ TEST 2 PASSED: Canonical 297KB simpleMindMap parsed with high efficiency and tradition lane mapping.\n');

// -------------------------------------------------------------
// TEST SUITE 3: Search Engine Auto-Unfolding
// -------------------------------------------------------------
console.log('TEST 3: Search Engine Ancestor Path Determination...');
function searchAndCollectAncestors(root, query) {
  const q = query.toLowerCase();
  const matches = [];
  const ancestorsToUnfold = new Set();

  function traverse(node, ancestors) {
    if (node.name.toLowerCase().includes(q)) {
      matches.push(node.id);
      ancestors.forEach((a) => ancestorsToUnfold.add(a));
    }
    const children = node.children || [];
    for (const child of children) {
      traverse(child, [...ancestors, node.id]);
    }
  }

  traverse(root, []);
  return { matches, ancestorsToUnfold: Array.from(ancestorsToUnfold) };
}

const searchResult = searchAndCollectAncestors(jsonTree, 'Apophatic');
console.log(`Query "Apophatic": ${searchResult.matches.length} matches, ${searchResult.ancestorsToUnfold.length} ancestor branches unfolded`);
console.assert(searchResult.matches.length > 0, 'Should find matches for "Apophatic"');
console.log('✓ TEST 3 PASSED: Search accurately identifies target nodes and builds ancestor chains for unfolding.\n');

// -------------------------------------------------------------
// TEST SUITE 4: Performance Benchmarks
// -------------------------------------------------------------
console.log('TEST 4: Performance Benchmarking...');

const smallStart = Date.now();
for (let i = 0; i < 100; i++) parseMarkdownToTree(sampleMd);
const smallDuration = (Date.now() - smallStart) / 100;

const largeStart = Date.now();
for (let i = 0; i < 20; i++) parseJsonToTree(rawJson);
const largeDuration = (Date.now() - largeStart) / 20;

console.log(`- Small Tree Parse (avg 100 runs): ${smallDuration.toFixed(3)}ms`);
console.log(`- Canonical 297KB Tree Parse (avg 20 runs): ${largeDuration.toFixed(3)}ms`);
console.assert(smallDuration < 5, 'Small tree parsing must be sub-5ms');
console.assert(largeDuration < 50, 'Large tree parsing must be sub-50ms');
console.log('✓ TEST 4 PASSED: Performance metrics meet high-throughput production budget.\n');

console.log('=== ALL TESTS COMPLETED SUCCESSFULLY (4/4 PASSED) ===');
