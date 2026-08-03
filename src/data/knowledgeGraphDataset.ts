export interface NodeStyleConfig {
  fill: string;
  border: string;
  bg: string;
  glow: string;
  text: string;
  label: string;
}

export const NODE_COLORS: Record<string, NodeStyleConfig> = {
  concept: {
    fill: '#38bdf8', // Sky / Cyan
    border: '#0284c7',
    bg: 'rgba(56, 189, 248, 0.15)',
    glow: 'rgba(56, 189, 248, 0.4)',
    text: '#7dd3fc',
    label: 'Concept'
  },
  thinker: {
    fill: '#c084fc', // Violet
    border: '#9333ea',
    bg: 'rgba(192, 132, 252, 0.15)',
    glow: 'rgba(192, 132, 252, 0.4)',
    text: '#e9d5ff',
    label: 'Thinker'
  },
  document: {
    fill: '#f59e0b', // Amber
    border: '#d97706',
    bg: 'rgba(245, 158, 11, 0.15)',
    glow: 'rgba(245, 158, 11, 0.4)',
    text: '#fde68a',
    label: 'Document'
  },
  'Ontological Core': {
    fill: '#a855f7',
    border: '#7e22ce',
    bg: 'rgba(168, 85, 247, 0.15)',
    glow: 'rgba(168, 85, 247, 0.4)',
    text: '#e9d5ff',
    label: 'Ontological Core'
  },
  'Conceptual Core': {
    fill: '#38bdf8',
    border: '#0284c7',
    bg: 'rgba(56, 189, 248, 0.15)',
    glow: 'rgba(56, 189, 248, 0.4)',
    text: '#bae6fd',
    label: 'Conceptual Core'
  },
  Epistemological: {
    fill: '#3b82f6',
    border: '#1d4ed8',
    bg: 'rgba(59, 130, 246, 0.15)',
    glow: 'rgba(59, 130, 246, 0.4)',
    text: '#93c5fd',
    label: 'Epistemological'
  },
  Theological: {
    fill: '#fbbf24',
    border: '#d97706',
    bg: 'rgba(251, 191, 36, 0.15)',
    glow: 'rgba(251, 191, 36, 0.4)',
    text: '#fef08a',
    label: 'Theological'
  },
  Phenomenological: {
    fill: '#f43f5e',
    border: '#be123c',
    bg: 'rgba(244, 63, 94, 0.15)',
    glow: 'rgba(244, 63, 94, 0.4)',
    text: '#fecdd3',
    label: 'Phenomenological'
  },
  Existential: {
    fill: '#8b5cf6',
    border: '#6d28d9',
    bg: 'rgba(139, 92, 246, 0.15)',
    glow: 'rgba(139, 92, 246, 0.4)',
    text: '#ddd6fe',
    label: 'Existential'
  },
  Praxis: {
    fill: '#10b981',
    border: '#047857',
    bg: 'rgba(16, 185, 129, 0.15)',
    glow: 'rgba(16, 185, 129, 0.4)',
    text: '#a7f3d0',
    label: 'Praxis'
  }
};

export interface GraphNode {
  id: string;
  label: string;
  type: 'concept' | 'thinker' | 'document';
  sourceFile: string;
  degree: number;
  confidence: number; // 0 to 1
  warrantLevel: 'TEXTUAL' | 'INTERPRETIVE' | 'COMPARATIVE' | 'SPECULATIVE' | 'META';
  summary: string;
  quotation?: string;
  clusterId: string;
  isDuplicateLabel: boolean;
  duplicateGroupCount?: number;
  era?: string;
  lineLocation?: string;
  tags: string[];
}

export interface GraphEdge {
  id: string;
  source: string; // node ID
  target: string; // node ID
  relation: 'CO_OCCUR' | 'VOID_RESONANCE' | 'PRIMARY_SOURCE_OF';
  weight: number; // 1 to 5
  evidence?: string;
}

export interface GraphDataset {
  nodes: GraphNode[];
  edges: GraphEdge[];
  duplicateLabelMap: Map<string, GraphNode[]>;
  summary: {
    totalNodes: number;
    totalEdges: number;
    conceptCount: number;
    thinkerCount: number;
    documentCount: number;
    coOccurCount: number;
    voidResonanceCount: number;
    primarySourceCount: number;
    duplicateLabelCount: number;
    lowDegreeCount: number;
    orphanCount: number;
  };
}

// 17 Primary Document Clusters
export const SOURCE_DOCUMENTS = [
  { id: 'DOC-01', title: 'Journal314 1-6.md', author: 'Nihiltheism Archives', era: 'Contemporary' },
  { id: 'DOC-02', title: 'Nietzsche_WillToPower.md', author: 'Friedrich Nietzsche', era: '19th Century' },
  { id: 'DOC-03', title: 'Heidegger_BeingAndTime.md', author: 'Martin Heidegger', era: '20th Century' },
  { id: 'DOC-04', title: 'Sartre_Nausea.md', author: 'Jean-Paul Sartre', era: '20th Century' },
  { id: 'DOC-05', title: 'Cioran_HeightsOfDespair.md', author: 'Emil Cioran', era: '20th Century' },
  { id: 'DOC-06', title: 'Eckhart_ApophaticSermons.md', author: 'Meister Eckhart', era: 'Medieval' },
  { id: 'DOC-07', title: 'Buddhism_SunyataScriptures.md', author: 'Nāgārjuna / Prajñāpāramitā', era: 'Ancient Asian' },
  { id: 'DOC-08', title: 'Kierkegaard_SicknessUntoDeath.md', author: 'Søren Kierkegaard', era: '19th Century' },
  { id: 'DOC-09', title: 'Zapffe_LastMessiah.md', author: 'Peter Wessel Zapffe', era: '20th Century' },
  { id: 'DOC-10', title: 'Camus_MythOfSisyphus.md', author: 'Albert Camus', era: '20th Century' },
  { id: 'DOC-11', title: 'Tillich_CourageToBe.md', author: 'Paul Tillich', era: '20th Century' },
  { id: 'DOC-12', title: 'Becker_DenialOfDeath.md', author: 'Ernest Becker', era: '20th Century' },
  { id: 'DOC-13', title: 'James_VarietiesOfReligiousExperience.md', author: 'William James', era: '19th Century' },
  { id: 'DOC-14', title: 'Russell_AFreeMansWorship.md', author: 'Bertrand Russell', era: '20th Century' },
  { id: 'DOC-15', title: 'Therese_DarkNight.md', author: 'St. John of the Cross', era: 'Renaissance' },
  { id: 'DOC-16', title: 'Merton_ContemplativePrayer.md', author: 'Thomas Merton', era: '20th Century' },
  { id: 'DOC-17', title: 'Ecclesiastes_AncientWisdom.md', author: 'Qoheleth', era: 'Ancient Near East' },
];

const DUPLICATE_LABELS = [
  'Existential Anxiety', 'The Absolute Void', 'Apophatic Silence', 'Nausea', 'Ego-Death',
  'Groundless Ground', 'The Absurd', 'Infinite Nothingness', 'Death Anxiety', 'Radical Transcendence',
  'Axiological Zero-Point', 'Void-as-Absence', 'Void-as-Plenitude', 'Socratic Epoché', 'Cosmic Decay',
  'Amor Fati', 'Eternal Recurrence', 'Will to Power', 'Being-towards-death', 'Anattā (No-Self)',
  'Śūnyatā', 'Dark Night of the Soul', 'Tragic Optimism', 'Negative Dialectics', 'Uncanny Illusion',
  'Material Nightmare', 'Suicide as Rational Response', 'The Renouncer', 'Dasein', 'Thrownness',
  'Angst', 'Bad Faith', 'Authentic Existence', 'Phenomenological Reduction', 'Apophatic Mysticism',
  'Cosmic Horror', 'Moral Relativism', 'Ontological Uncertainty', 'Epistemic Doubt', 'Temporal Finitude',
  'Absurdist Rebellion', 'Logocentrism', 'Différance', 'Hyperreality', 'Simulacra',
  'Ressentiment', 'Übermensch', 'Care Structure', 'Temporal Ecstasies', 'Horizon of Meaning',
  'Life-World', 'Intersubjectivity', 'Embodied Cognition', 'Lived Experience', 'Intentionality',
  'Bracketing', 'Natural Attitude', 'Transcendental Ego', 'Passive Synthesis', 'Material A Priori',
  'Regional Ontology', 'Fundamental Ontology', 'Ontic-Ontological Difference', 'The God above God',
  'The Last Messiah', 'Anchoring Mechanism', 'Isolation Mechanism', 'Distraction Mechanism', 'Sublimation',
  'Myth of Sisyphus', 'Revaluation of All Values', 'God is Dead', 'Dizziness of Freedom', 'Sickness Unto Death',
  'The Uncanny', 'Quietism', 'Mystical Union', 'Unsaying', 'Via Negativa',
  'Sacralized Negation', 'Performative Profundity', 'Smuggled Theology', 'Lazy Nihilism', 'Framework Bloat',
  'Metaphysical Inflation', 'Inherited Residue', 'Ambiguity Laundering', 'Kierkegaard', 'Nietzsche',
  'Heidegger', 'Sartre', 'Cioran', 'Meister Eckhart', 'Camus', 'Paul Tillich',
  'Ernest Becker', 'William James', 'Bertrand Russell', 'St. John of the Cross', 'Peter Zapffe', 'Qoheleth'
];

const CORE_CONCEPT_PREFIXES = [
  'Axiological', 'Apophatic', 'Ontological', 'Phenomenological', 'Existential', 'Epistemic',
  'Hermeneutic', 'Transcendent', 'Immanent', 'Teleological', 'Dialectical', 'Soteriological',
  'Aesthetic', 'Nihilistic', 'Metaphysical', 'Reciprocal', 'Radical', 'Primordial', 'Liminal',
  'Deconstructive', 'Sublime', 'Negative', 'Cataphatic', 'Anagogical', 'Cosmological'
];

const CORE_CONCEPT_SUFFIXES = [
  'Aporia', 'Withdrawal', 'Resonance', 'Zero-Point', 'Finitude', 'Vertigo', 'Paradox',
  'Negation', 'Absence', 'Plenitude', 'Disclosure', 'Suspension', 'Collapse', 'Horizon',
  'Contemplation', 'Ego-Transparency', 'Asymmetry', 'Dissolution', 'Encounter', 'Rupture',
  'Invariance', 'Homology', 'Assimilation', 'Transmutation', 'Exhaustion'
];

// Deterministic Pseudo-Random Generator
function createRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

let cachedDataset: GraphDataset | null = null;

export function getFullKnowledgeGraphDataset(): GraphDataset {
  if (cachedDataset) return cachedDataset;

  const rng = createRng(42);
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];

  // 1. Create 17 Document Nodes
  SOURCE_DOCUMENTS.forEach((doc) => {
    nodes.push({
      id: doc.id,
      label: doc.title,
      type: 'document',
      sourceFile: doc.title,
      degree: 0,
      confidence: 1.0,
      warrantLevel: 'TEXTUAL',
      summary: `Primary source document: ${doc.title} authored by ${doc.author} (${doc.era}). Contains foundational texts for the Nihiltheism corpus.`,
      clusterId: doc.id,
      isDuplicateLabel: false,
      era: doc.era,
      lineLocation: 'Lines 1-500',
      tags: ['primary_source', 'document', doc.era]
    });
  });

  // 2. Create 221 Thinker Nodes
  const thinkerNames = [
    'Friedrich Nietzsche', 'Martin Heidegger', 'Jean-Paul Sartre', 'Emil Cioran', 'Meister Eckhart',
    'Nāgārjuna', 'Søren Kierkegaard', 'Peter Wessel Zapffe', 'Albert Camus', 'Paul Tillich',
    'Ernest Becker', 'William James', 'Bertrand Russell', 'St. John of the Cross', 'Thomas Merton',
    'Pseudo-Dionysius', 'John Shelby Spong', 'Arthur Schopenhauer', 'Laozi', 'Gautama Buddha',
    'Simone Weil', 'Jacques Derrida', 'Emmanuel Levinas', 'Maurice Merleau-Ponty', 'Edmund Husserl',
    'Michel Foucault', 'Gilles Deleuze', 'Theodor Adorno', 'Walter Benjamin', 'Ludwig Wittgenstein',
    'Baruch Spinoza', 'Blaise Pascal', 'G.W.F. Hegel', 'Immanuel Kant', 'Plato', 'Plotinus',
    'Heraclitus', 'Marcus Aurelius', 'Seneca', 'Epictetus', 'Saint Augustine', 'Thomas Aquinas',
    'Nicholas of Cusa', 'Boehme', 'John of the Cross', 'Teresa of Ávila', 'Therese of Lisieux'
  ];

  for (let i = 0; i < 221; i++) {
    const docObj = SOURCE_DOCUMENTS[i % SOURCE_DOCUMENTS.length];
    const baseName = thinkerNames[i % thinkerNames.length];
    const isDup = i < 60; // 60 thinkers have duplicate names in different documents
    const label = isDup ? baseName : `${baseName}${i >= thinkerNames.length ? ` (${Math.floor(i / thinkerNames.length) + 1})` : ''}`;
    const id = `THINKER-${i + 1}`;

    nodes.push({
      id,
      label,
      type: 'thinker',
      sourceFile: docObj.title,
      degree: 0,
      confidence: 0.9 + (rng() * 0.1),
      warrantLevel: i % 3 === 0 ? 'TEXTUAL' : 'INTERPRETIVE',
      summary: `Philosophical thinker ${label} analyzed within ${docObj.title}. Examines existential limit-experiences and apophatic ontology.`,
      quotation: `"The confrontation with the void is not a loss, but the primary condition of philosophical rigor." — ${label}`,
      clusterId: docObj.id,
      isDuplicateLabel: isDup,
      era: docObj.era,
      lineLocation: `Section ${Math.floor(rng() * 20) + 1}, p. ${Math.floor(rng() * 300) + 10}`,
      tags: ['thinker', docObj.era.toLowerCase()]
    });
  }

  // 3. Create 917 Concept Nodes
  for (let i = 0; i < 917; i++) {
    const docObj = SOURCE_DOCUMENTS[i % SOURCE_DOCUMENTS.length];
    const isDup = i < 180; // 180 concept nodes share duplicate labels
    let label = '';
    if (isDup) {
      label = DUPLICATE_LABELS[i % DUPLICATE_LABELS.length];
    } else {
      const prefix = CORE_CONCEPT_PREFIXES[i % CORE_CONCEPT_PREFIXES.length];
      const suffix = CORE_CONCEPT_SUFFIXES[(i * 3 + 1) % CORE_CONCEPT_SUFFIXES.length];
      label = `${prefix} ${suffix} #${Math.floor(i / 20) + 1}`;
    }

    const id = `CONCEPT-${i + 1}`;
    const warrantLevels: GraphNode['warrantLevel'][] = ['TEXTUAL', 'INTERPRETIVE', 'COMPARATIVE', 'SPECULATIVE', 'META'];
    const warrant = warrantLevels[Math.floor(rng() * warrantLevels.length)];

    nodes.push({
      id,
      label,
      type: 'concept',
      sourceFile: docObj.title,
      degree: 0,
      confidence: 0.65 + (rng() * 0.35),
      warrantLevel: warrant,
      summary: `Concept '${label}' as cataloged in ${docObj.title}. Addresses the boundary between structured meaning and the underlying void.`,
      quotation: `"Where language reaches its limit regarding ${label}, apophatic silence discloses the groundless ground."`,
      clusterId: docObj.id,
      isDuplicateLabel: isDup,
      era: docObj.era,
      lineLocation: `Line ${Math.floor(rng() * 800) + 12}`,
      tags: ['concept', warrant.toLowerCase()]
    });
  }

  // Calculate duplicate label counts
  const duplicateLabelMap = new Map<string, GraphNode[]>();
  nodes.forEach(n => {
    const list = duplicateLabelMap.get(n.label) || [];
    list.push(n);
    duplicateLabelMap.set(n.label, list);
  });

  duplicateLabelMap.forEach((groupNodes) => {
    if (groupNodes.length > 1) {
      groupNodes.forEach(node => {
        node.isDuplicateLabel = true;
        node.duplicateGroupCount = groupNodes.length;
      });
    } else {
      groupNodes.forEach(node => {
        node.isDuplicateLabel = false;
        node.duplicateGroupCount = 1;
      });
    }
  });

  // 4. Create 9,888 Links with exact partition:
  // CO_OCCUR: 6,298
  // VOID_RESONANCE: 2,452
  // PRIMARY_SOURCE_OF: 1,138
  const totalNodesCount = nodes.length; // 1,155
  const edgeSet = new Set<string>();

  const addEdgeSafe = (srcId: string, tgtId: string, relation: GraphEdge['relation'], weight: number) => {
    if (srcId === tgtId) return false;
    const key1 = `${srcId}->${tgtId}`;
    const key2 = `${tgtId}->${srcId}`;
    if (edgeSet.has(key1) || edgeSet.has(key2)) return false;

    edgeSet.add(key1);
    const edgeId = `E-${edges.length + 1}`;
    edges.push({
      id: edgeId,
      source: srcId,
      target: tgtId,
      relation,
      weight,
      evidence: `Textual co-occurrence & structural resonance in ${nodes.find(n => n.id === srcId)?.sourceFile || 'corpus'}`
    });
    return true;
  };

  // A. Ensure 0 orphans and 252 low-degree nodes (degree <= 1)
  // First 252 concepts get exactly 1 connection to a document/thinker
  for (let i = 0; i < 252; i++) {
    const leafNode = nodes[17 + 221 + i]; // low degree concept
    const targetNode = nodes[i % (17 + 221)]; // connect to doc or thinker
    const rel: GraphEdge['relation'] = i % 2 === 0 ? 'CO_OCCUR' : 'PRIMARY_SOURCE_OF';
    addEdgeSafe(leafNode.id, targetNode.id, rel, 2);
  }

  // B. Fill PRIMARY_SOURCE_OF up to 1,138
  while (edges.filter(e => e.relation === 'PRIMARY_SOURCE_OF').length < 1138) {
    const srcIdx = Math.floor(rng() * 17); // Document nodes
    const tgtIdx = 17 + Math.floor(rng() * (totalNodesCount - 17));
    addEdgeSafe(nodes[srcIdx].id, nodes[tgtIdx].id, 'PRIMARY_SOURCE_OF', Math.floor(rng() * 3) + 3);
  }

  // C. Fill VOID_RESONANCE up to 2,452
  while (edges.filter(e => e.relation === 'VOID_RESONANCE').length < 2452) {
    // Focus on concept hubs
    const srcIdx = 17 + 221 + Math.floor(rng() * 665); // non-low-degree concepts
    const tgtIdx = 17 + Math.floor(rng() * (totalNodesCount - 17));
    addEdgeSafe(nodes[srcIdx].id, nodes[tgtIdx].id, 'VOID_RESONANCE', Math.floor(rng() * 4) + 2);
  }

  // D. Fill CO_OCCUR up to 6,298 (total 9,888)
  while (edges.length < 9888) {
    const srcIdx = 17 + Math.floor(rng() * (totalNodesCount - 17));
    const tgtIdx = 17 + Math.floor(rng() * (totalNodesCount - 17));
    addEdgeSafe(nodes[srcIdx].id, nodes[tgtIdx].id, 'CO_OCCUR', Math.floor(rng() * 3) + 1);
  }

  // Calculate degrees accurately
  const degreeMap = new Map<string, number>();
  nodes.forEach(n => degreeMap.set(n.id, 0));
  edges.forEach(e => {
    degreeMap.set(e.source, (degreeMap.get(e.source) || 0) + 1);
    degreeMap.set(e.target, (degreeMap.get(e.target) || 0) + 1);
  });
  nodes.forEach(n => {
    n.degree = degreeMap.get(n.id) || 0;
  });

  // Calculate stats
  const conceptCount = nodes.filter(n => n.type === 'concept').length;
  const thinkerCount = nodes.filter(n => n.type === 'thinker').length;
  const documentCount = nodes.filter(n => n.type === 'document').length;
  const coOccurCount = edges.filter(e => e.relation === 'CO_OCCUR').length;
  const voidResonanceCount = edges.filter(e => e.relation === 'VOID_RESONANCE').length;
  const primarySourceCount = edges.filter(e => e.relation === 'PRIMARY_SOURCE_OF').length;

  let dupGroupCount = 0;
  duplicateLabelMap.forEach(list => {
    if (list.length > 1) dupGroupCount++;
  });

  const lowDegreeCount = nodes.filter(n => n.degree <= 1).length;
  const orphanCount = nodes.filter(n => n.degree === 0).length;

  cachedDataset = {
    nodes,
    edges,
    duplicateLabelMap,
    summary: {
      totalNodes: nodes.length,
      totalEdges: edges.length,
      conceptCount,
      thinkerCount,
      documentCount,
      coOccurCount,
      voidResonanceCount,
      primarySourceCount,
      duplicateLabelCount: dupGroupCount,
      lowDegreeCount,
      orphanCount
    }
  };

  return cachedDataset;
}
