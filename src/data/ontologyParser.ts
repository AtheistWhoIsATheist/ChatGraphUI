import { OntologyNode, OntologyLink } from './ontology';

export function parseNihilismJson(jsonData: any): { nodes: OntologyNode[], links: OntologyLink[] } {
  if (!jsonData) return { nodes: [], links: [] };

  const nodes: OntologyNode[] = [];
  const links: OntologyLink[] = [];
  const existingNodeIds = new Set<string>();

  // Helper to add node safely without duplicate IDs
  const addNode = (node: OntologyNode) => {
    if (!existingNodeIds.has(node.id)) {
      existingNodeIds.add(node.id);
      nodes.push(node);
    }
  };

  // Format 1: Stage 3 Pipeline Data (nodes & edges)
  if (Array.isArray(jsonData.nodes)) {
    jsonData.nodes.forEach((item: any) => {
      let nodeType: OntologyNode['type'] = 'Conceptual Core';
      
      switch (item.kind) {
        case 'T': // Textual quote
          nodeType = 'Epistemological';
          break;
        case 'Q': // Research Question
          nodeType = 'Existential';
          break;
        case 'D': // Interpretive Distinction
          nodeType = 'Ontological Core';
          break;
        case 'P': // Phenomenological
          nodeType = 'Phenomenological';
          break;
        case 'C': // Comparative
          nodeType = 'Conceptual Core';
          break;
        case 'H': // Hypothesis
          nodeType = 'Theological';
          break;
        case 'O': // Output Thesis
          nodeType = 'Praxis';
          break;
        default:
          nodeType = 'Conceptual Core';
      }

      const summary = item.gloss || item.quotation || item.context_gloss || item.label || item.id;
      const thinkerStr = Array.isArray(item.thinkers) && item.thinkers.length > 0 ? item.thinkers.join(', ') : item.source || 'Stage 3 Pipeline';
      const confidenceResonance = typeof item.confidence === 'number' ? Math.round(item.confidence * 100) : 80;

      addNode({
        id: item.id,
        label: item.label || item.id,
        type: nodeType,
        summary: summary,
        resonance: confidenceResonance,
        questions: item.kind === 'Q' ? [item.label] : [],
        era: thinkerStr
      });
    });

    // Parse edges if present
    if (Array.isArray(jsonData.edges)) {
      jsonData.edges.forEach((edge: any) => {
        if (edge.source && edge.target) {
          links.push({
            source: edge.source,
            target: edge.target,
            label: edge.kind || edge.label || edge.relationship || 'relates-to',
            intensity: edge.weight || edge.intensity || 3
          });
        }
      });
    }

    return { nodes, links };
  }

  // Format 2: Index Concepts Schema (index.concepts)
  const concepts = jsonData?.index?.concepts || (Array.isArray(jsonData) ? jsonData : []);

  concepts.forEach((concept: any) => {
    let nodeType: OntologyNode['type'] = 'Conceptual Core';
    if (concept.namespace === 'NT_CORE' || concept.entityType === 'PHILOSOPHICAL_CONCEPT') {
      nodeType = 'Ontological Core';
    } else if (concept.namespace === 'NT_THINKER' || concept.entityType === 'PERSON') {
      nodeType = 'Existential';
    } else if (concept.entityType === 'PHENOMENOLOGICAL_THEME') {
      nodeType = 'Phenomenological';
    } else if (concept.namespace === 'STRUCTURAL_HEADING') {
      nodeType = 'Epistemological';
    }

    let summary = concept.label;
    if (concept.evidence && concept.evidence.length > 0) {
      summary = concept.evidence[0].excerpt.replace(/`/g, '').trim();
    }

    const resonance = Math.min(100, Math.max(10, concept.occurrenceCount || concept.score || 50));

    addNode({
      id: concept.id,
      label: concept.label || concept.id,
      type: nodeType,
      summary,
      resonance,
      questions: [],
      era: concept.namespace || 'Unknown'
    });

    if (concept.backlinks && concept.backlinks.length > 0) {
      concept.backlinks.forEach((bl: any) => {
        if (bl.sourceTitle) {
          const targetId = bl.sourceTitle.toLowerCase().replace(/\s+/g, '-');
          links.push({
            source: concept.id,
            target: targetId,
            label: 'References',
            intensity: Math.min(5, bl.lineStarts ? bl.lineStarts.length : 1)
          });
          
          if (!existingNodeIds.has(targetId)) {
            addNode({
              id: targetId,
              label: bl.sourceTitle,
              type: 'Epistemological',
              summary: `Document: ${bl.sourceTitle}`,
              resonance: 50,
              questions: [],
              era: 'Document'
            });
          }
        }
      });
    }
  });

  return { nodes, links };
}

