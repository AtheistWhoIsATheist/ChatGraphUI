import fs from 'fs';

const corpusContent = fs.readFileSync('src/data/corpus.ts', 'utf-8');
const newCorpus = JSON.parse(fs.readFileSync('new_corpus.json', 'utf-8'));

// Convert the objects properly
const mappedNodes = newCorpus.nodes.map(n => ({
  id: n.id,
  label: n.label,
  type: n.type,
  blocks: [], // No text blocks
  metadata: {
     geometry: n.type === 'thinker' ? 'circle' : 'diamond'
  },
  properties: n.properties || {},
  position: n.position || undefined,
  quote_count: n.properties?.quote_count || 0
}));

const mappedEdges = newCorpus.edges.map(e => ({
  source: e.source,
  target: e.target,
  type: e.type.toLowerCase(),
  properties: e.properties
}));

const insertJSONString = (obj) => JSON.stringify(obj, null, 2);

const updatedContent = corpusContent
  .replace('export const corpusNodes: Node[] = [', 'export const corpusNodes: Node[] = [\n' + mappedNodes.map(n => insertJSONString(n)).join(',\n') + ',')
  .replace('export const corpusLinks: Link[] = [', 'export const corpusLinks: Link[] = [\n' + mappedEdges.map(e => insertJSONString(e)).join(',\n') + ',');

fs.writeFileSync('src/data/corpus.ts', updatedContent);
console.log('Injected nodes into corpus.ts');
