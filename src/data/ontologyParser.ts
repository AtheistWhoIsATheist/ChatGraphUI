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

  // Format 2: InfraNodus Statements Schema ({ statements: [ [ { uid, text, tags, ... } ] ] })
  if (Array.isArray(jsonData.statements)) {
    const rawStatements: any[] = [];
    jsonData.statements.forEach((item: any) => {
      if (Array.isArray(item)) {
        item.forEach(st => {
          if (st && st.text) rawStatements.push(st);
        });
      } else if (item && item.text) {
        rawStatements.push(item);
      }
    });

    if (rawStatements.length > 0) {
      const stopWords = new Set(['the', 'and', 'for', 'that', 'this', 'with', 'from', 'have', 'were', 'what', 'which', 'their', 'there', 'about', 'response', 'human', 'nihilism', 'universal', 'journal', 'thinkers', 'themes']);
      const wordCounts = new Map<string, { label: string; count: number; uids: string[]; textSample: string }>();

      rawStatements.forEach((st, idx) => {
        const text = st.text || '';
        const uidStr = String(st.uid || idx);
        let tags: string[] = [];
        try {
          tags = typeof st.tags === 'string' ? JSON.parse(st.tags) : (Array.isArray(st.tags) ? st.tags : []);
        } catch {
          tags = [];
        }

        // Add statement node
        const stmtNodeId = `STMT-${uidStr}`;
        addNode({
          id: stmtNodeId,
          label: text.length > 45 ? `${text.slice(0, 42)}...` : text,
          type: 'Epistemological',
          summary: text,
          resonance: 85,
          questions: [],
          era: tags.length > 0 ? tags[0] : 'Universal Nihilism 1&2'
        });

        // Check for wiki links e.g. [[concept]]
        const wikiMatches: string[] = [];
        const wikiRegex = /\[\[(.*?)\]\]/g;
        let wMatch;
        while ((wMatch = wikiRegex.exec(text)) !== null) {
          if (wMatch[1] && wMatch[1].trim()) {
            wikiMatches.push(wMatch[1].trim());
          }
        }

        if (wikiMatches.length > 0) {
          // If statement contains wiki links, link wiki concept nodes directly
          wikiMatches.forEach((conceptLabel, cIdx) => {
            const conceptId = `CONCEPT-WIKI-${conceptLabel.toLowerCase().replace(/\s+/g, '-')}`;
            const formattedLabel = conceptLabel
              .split(' ')
              .map(w => w.charAt(0).toUpperCase() + w.slice(1))
              .join(' ');

            const existing = wordCounts.get(conceptId);
            if (existing) {
              existing.count++;
              existing.uids.push(uidStr);
            } else {
              wordCounts.set(conceptId, {
                label: formattedLabel,
                count: 1,
                uids: [uidStr],
                textSample: text
              });
            }

            links.push({
              source: stmtNodeId,
              target: conceptId,
              label: 'MENTIONS',
              intensity: 4
            });

            // Connect consecutive wiki concepts
            if (cIdx > 0) {
              const prevConceptLabel = wikiMatches[cIdx - 1];
              const prevConceptId = `CONCEPT-WIKI-${prevConceptLabel.toLowerCase().replace(/\s+/g, '-')}`;
              
              // extract tag relation e.g. [relatedTo]
              const relMatch = text.match(/\[([a-zA-Z0-9_-]+)\]$/);
              const relLabel = relMatch ? relMatch[1] : 'RELATES_TO';

              links.push({
                source: prevConceptId,
                target: conceptId,
                label: relLabel,
                intensity: 4
              });
            }
          });
        } else {
          // Extract key terms (standard tokenization)
          const tokens = text.match(/\b[A-Za-z0-9_-]{4,}\b/g) || [];
          const seenInStmt = new Set<string>();

          tokens.forEach((tok: string) => {
            const lower = tok.toLowerCase();
            if (!stopWords.has(lower) && !seenInStmt.has(lower)) {
              seenInStmt.add(lower);
              const conceptId = `CONCEPT-INFRANODUS-${lower}`;
              const existing = wordCounts.get(conceptId);
              if (existing) {
                existing.count++;
                existing.uids.push(uidStr);
              } else {
                wordCounts.set(conceptId, {
                  label: tok.charAt(0).toUpperCase() + tok.slice(1),
                  count: 1,
                  uids: [uidStr],
                  textSample: text
                });
              }

              links.push({
                source: stmtNodeId,
                target: conceptId,
                label: 'CONTAINS',
                intensity: 3
              });
            }
          });
        }
      });

      wordCounts.forEach((info, conceptId) => {
        addNode({
          id: conceptId,
          label: info.label,
          type: 'Ontological Core',
          summary: `InfraNodus concept appearing in ${info.count} statements. Sample context: "${info.textSample.slice(0, 100)}..."`,
          resonance: Math.min(100, info.count * 15 + 30),
          questions: [],
          era: 'InfraNodus Knowledge Base'
        });
      });

      return { nodes, links };
    }
  }

  // Format 3: Index Concepts Schema (index.concepts)
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

