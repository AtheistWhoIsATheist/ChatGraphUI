import fs from 'fs';

const rawUserPayload = fs.readFileSync('new_corpus.json', 'utf8');
const userPayload = JSON.parse(rawUserPayload);

const mappedNodes = userPayload.nodes.map(n => ({
  id: n.id,
  label: n.label,
  type: n.type.toLowerCase(),
  blocks: [], // No text blocks
  metadata: {
     geometry: n.type === 'thinker' || n.type === 'THINKER' ? 'circle' : 'diamond'
  },
  properties: n.properties || {},
  position: n.position || undefined,
  quote_count: n.properties?.quote_count || 0
}));

const mappedEdges = userPayload.edges.map(e => ({
  source: e.source,
  target: e.target,
  type: e.type.toLowerCase(), // e.g. "RESONANCE" -> "resonance"
  properties: e.properties
}));

const insertJSONString = (obj) => JSON.stringify(obj, null, 2);

const currentContent = fs.readFileSync('src/data/corpus.ts', 'utf8');

const updatedContent = currentContent
  .replace('export const corpusNodes: Node[] = [', 'export const corpusNodes: Node[] = [\n' + mappedNodes.map(n => insertJSONString(n)).join(',\n') + ',')
  .replace('export const corpusLinks: Link[] = [', 'export const corpusLinks: Link[] = [\n' + mappedEdges.map(e => insertJSONString(e)).join(',\n') + ',');

fs.writeFileSync('src/data/corpus.ts', updatedContent);
console.log('Done mapping JSON to corpus.ts');
