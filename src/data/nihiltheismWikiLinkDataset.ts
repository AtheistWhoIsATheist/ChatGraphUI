import { OntologyNode, OntologyLink } from './ontology';
import { GraphNode, GraphEdge } from './knowledgeGraphDataset';

export const NIHILTHEISM_WIKI_LINKS_TEXT = `
# Nihiltheism Graph Wiki-Links
[[nihiltheism]] treats [[nothingness]] as the ground of all possible sacred encounter [relatedTo]
[[nihiltheism]] is a convergence of [[existential nihilism]] and [[theological inquiry]] [isA]
[[nihiltheism]] derives from the collapse of [[metaphysical foundation]] as productive event [derivedFrom]
[[nihiltheism]] opposes [[secular nihilism]] which halts at negation without opening [opposes]
[[nihiltheism]] opposes [[theistic faith]] which bypasses void through positive assertion [opposes]
[[nihiltheism]] has [[void-encounter]] as its primary phenomenological datum [hasAttribute]
[[nihiltheism]] depends on [[ego dissolution]] as precondition for genuine confrontation [dependentOn]
[[nihiltheism]] locates [[transcendence]] not beyond but within the structure of emptiness [locatedIn]
[[nothingness]] is not [[mere absence]] but [[generative void]] [isA]
[[nothingness]] functions as [[groundless ground]] of all manifestation [functionsAs]
[[nothingness]] resists [[conceptual grasp]] by definition [resists]
[[nothingness]] discloses [[unconditioned reality]] through [[apophatic silence]] [discloses]
[[existential nihilism]] diagnoses [[meaninglessness]] of finite existence [diagnoses]
[[existential nihilism]] serves as [[necessary threshold]] for [[nihiltheism]] [servesAs]
[[existential nihilism]] risks [[despair]] when unilluminated by [[apophatic horizon]] [risks]
[[theological inquiry]] provides [[apophatic vocabulary]] for [[void-encounter]] [provides]
[[metaphysical foundation]] collapses into [[primordial chaos]] under radical critique [collapsesInto]
[[secular nihilism]] halts at [[flat negation]] without opening to [[sacred void]] [haltsAt]
[[theistic faith]] projects [[ontological guarantee]] over [[existential void]] [projects]
[[void-encounter]] induces [[radical awe]] and [[existential vertigo]] [induces]
[[ego dissolution]] enables [[unmediated relation]] to [[ultimate reality]] [enables]
[[transcendence]] manifests as [[immanent absence]] in [[apophatic experience]] [manifestsAs]
[[apophatic theology]] validates [[nihiltheistic insight]] through [[negative path]] [validates]
[[dark night of the soul]] exemplifies [[existential void-encounter]] [exemplifies]
[[sunyata]] correlates with [[apophatic void]] in [[cross-tradition homology]] [correlatesWith]
[[hyper-lucidity]] exposes [[illusory architecture]] of [[egoic meaning]] [exposes]
[[amor fati]] transforms [[existential dread]] into [[affirmation of void]] [transforms]
[[groundless ground]] resolves [[ontological paradox]] of [[uncaused being]] [resolves]
[[apophatic silence]] transcends [[cataphatic discourse]] regarding [[sacred void]] [transcends]
[[existential vertigo]] signals [[ego collapse]] prior to [[radical awakening]] [signals]
[[sacred void]] synthesizes [[divine presence]] and [[absolute absence]] [synthesizes]
[[apophatic horizon]] boundlessly expands [[hermeneutic horizon]] beyond [[logocentrism]] [expands]
[[unconditioned reality]] remains [[ever-present]] beneath [[conceptual construct]] [remains]
[[egoic meaning]] collapses into [[axiological zero-point]] during [[limit-experience]] [collapsesInto]
[[radical awe]] emerges from [[confrontation with infinity]] without [[protective myth]] [emergesFrom]
[[negative path]] dismantles [[idolatrous certainty]] in favor of [[lived void]] [dismantles]
[[meisther eckhart]] articulates [[gottheit]] as [[abyss of divine nothingness]] [articulates]
[[nietzsche]] diagnoses [[active nihilism]] as [[necessary clearing]] for [[revaluation of values]] [diagnoses]
[[heidegger]] locates [[das nichts]] as [[horizon of being]] disclosing [[angst]] [locates]
[[cioran]] confronts [[heights of despair]] as [[phenomenological portal]] to [[lucid emptiness]] [confronts]
[[nagarjuna]] establishes [[sunyata]] as [[interdependent origination]] free of [[intrinsic essence]] [establishes]
[[tillich]] formulates [[god above god]] as [[transcendence of theism]] in [[courage to be]] [formulates]
[[kierkegaard]] identifies [[dizziness of freedom]] as [[existential angst]] before [[abyss]] [identifies]
[[zapffe]] analyzes [[isolation mechanism]] as [[egoic defense]] against [[cosmic horror]] [analyzes]
`.trim();

export interface ParsedWikiLinkNode {
  id: string;
  label: string;
  type: 'Ontological Core' | 'Conceptual Core' | 'Existential' | 'Phenomenological' | 'Epistemological' | 'Theological' | 'Praxis';
  summary: string;
  occurrenceCount: number;
}

export interface ParsedWikiLinkEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  evidence: string;
}

export function parseWikiLinksText(text: string): {
  nodes: OntologyNode[];
  links: OntologyLink[];
  graphNodes: GraphNode[];
  graphEdges: GraphEdge[];
  statements: { uid: number; text: string; tags: string[] }[];
} {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0 && !l.startsWith('#'));
  const nodesMap = new Map<string, ParsedWikiLinkNode>();
  const rawEdges: { source: string; target: string; label: string; statementText: string }[] = [];
  const statements: { uid: number; text: string; tags: string[] }[] = [];

  let stmtUid = 200000000;

  lines.forEach((line) => {
    stmtUid++;
    // Extract relation tag at end if present e.g. [relatedTo]
    const relMatch = line.match(/\[([a-zA-Z0-9_-]+)\]$/);
    let relationType = 'relatesTo';
    let cleanLine = line;

    if (relMatch) {
      relationType = relMatch[1];
      cleanLine = line.replace(/\[([a-zA-Z0-9_-]+)\]$/, '').trim();
    }

    // Extract all wiki-link nodes [[node_label]]
    const matches: string[] = [];
    const regex = /\[\[(.*?)\]\]/g;
    let match;
    while ((match = regex.exec(cleanLine)) !== null) {
      if (match[1] && match[1].trim()) {
        matches.push(match[1].trim());
      }
    }

    statements.push({
      uid: stmtUid,
      text: line,
      tags: ['wiki-links', 'nihiltheism', relationType]
    });

    if (matches.length >= 1) {
      matches.forEach((conceptLabel) => {
        const id = `CONCEPT-WIKI-${conceptLabel.toLowerCase().replace(/\s+/g, '-')}`;
        const formattedLabel = conceptLabel
          .split(' ')
          .map(w => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');

        // Determine node type based on keywords
        let nodeType: ParsedWikiLinkNode['type'] = 'Conceptual Core';
        const lower = conceptLabel.toLowerCase();
        if (lower.includes('nihiltheism') || lower.includes('nothingness') || lower.includes('void') || lower.includes('ontological') || lower.includes('ground')) {
          nodeType = 'Ontological Core';
        } else if (lower.includes('encounter') || lower.includes('vertigo') || lower.includes('awe') || lower.includes('dissolution') || lower.includes('night')) {
          nodeType = 'Phenomenological';
        } else if (lower.includes('theology') || lower.includes('god') || lower.includes('sacred') || lower.includes('gottheit')) {
          nodeType = 'Theological';
        } else if (lower.includes('nihilism') || lower.includes('despair') || lower.includes('angst') || lower.includes('existential')) {
          nodeType = 'Existential';
        } else if (lower.includes('silence') || lower.includes('apophatic') || lower.includes('lucidity') || lower.includes('critique')) {
          nodeType = 'Epistemological';
        } else if (lower.includes('path') || lower.includes('revaluation') || lower.includes('practice')) {
          nodeType = 'Praxis';
        }

        const existing = nodesMap.get(id);
        if (existing) {
          existing.occurrenceCount++;
          if (!existing.summary.includes(line)) {
            existing.summary += ` | ${line}`;
          }
        } else {
          nodesMap.set(id, {
            id,
            label: formattedLabel,
            type: nodeType,
            summary: `Wiki-Link concept: "${formattedLabel}". Context: ${line}`,
            occurrenceCount: 1
          });
        }
      });
    }

    // Connect pairs of concepts in statement
    if (matches.length >= 2) {
      for (let i = 0; i < matches.length - 1; i++) {
        const srcLabel = matches[i];
        const tgtLabel = matches[i + 1];
        const srcId = `CONCEPT-WIKI-${srcLabel.toLowerCase().replace(/\s+/g, '-')}`;
        const tgtId = `CONCEPT-WIKI-${tgtLabel.toLowerCase().replace(/\s+/g, '-')}`;

        rawEdges.push({
          source: srcId,
          target: tgtId,
          label: relationType,
          statementText: line
        });
      }
    }
  });

  // Build OntologyNode[] and OntologyLink[]
  const nodes: OntologyNode[] = Array.from(nodesMap.values()).map(n => ({
    id: n.id,
    label: n.label,
    type: n.type,
    summary: n.summary.length > 200 ? `${n.summary.slice(0, 197)}...` : n.summary,
    resonance: Math.min(100, Math.max(35, n.occurrenceCount * 25 + 25)),
    questions: [],
    era: 'Nihiltheism Wiki-Links Ontology'
  }));

  const links: OntologyLink[] = rawEdges.map(e => ({
    source: e.source,
    target: e.target,
    label: e.label,
    intensity: 4
  }));

  // Build GraphNode[] and GraphEdge[] for main viewer
  const graphNodes: GraphNode[] = Array.from(nodesMap.values()).map(n => ({
    id: n.id,
    label: n.label,
    type: 'concept',
    sourceFile: 'Nihiltheism Wiki-Links Ontology',
    degree: 0, // calculated later
    confidence: 0.95,
    warrantLevel: 'TEXTUAL',
    summary: n.summary.length > 250 ? `${n.summary.slice(0, 247)}...` : n.summary,
    quotation: `"${n.summary.split('|')[0] || n.label}"`,
    clusterId: 'DOC-WIKI-NIHILTHEISM',
    isDuplicateLabel: false,
    era: 'Nihiltheism Ontology',
    lineLocation: 'Wiki-Link Statement',
    tags: ['wiki-link', 'nihiltheism', n.type.toLowerCase()]
  }));

  const graphEdges: GraphEdge[] = rawEdges.map((e, idx) => ({
    id: `E-WIKI-${idx + 1}`,
    source: e.source,
    target: e.target,
    relation: e.label.toLowerCase().includes('oppose') ? 'VOID_RESONANCE' : 'CO_OCCUR',
    weight: 4,
    evidence: e.statementText
  }));

  return { nodes, links, graphNodes, graphEdges, statements };
}
