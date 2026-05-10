import fs from 'fs';

const content = fs.readFileSync('src/data/corpus.ts', 'utf8');

// The file exports const corpusNodes: Node[] = [ ... ]; const corpusLinks: Link[] = [ ... ];
// A simple way to dedupe is to import them, dedupe, and rewrite, but we need the types.

async function run() {
  const { corpusNodes, corpusLinks } = require('./dist-ts/corpus.js') || await import('./src/data/corpus.ts');
  
  const uniqueNodes = [];
  const seenIds = new Set();
  for (const n of corpusNodes) {
    if (!seenIds.has(n.id)) {
      seenIds.add(n.id);
      uniqueNodes.push(n);
    }
  }

  const uniqueLinks = [];
  const seenPaths = new Set();
  for (const l of corpusLinks) {
    const s = typeof l.source === 'string' ? l.source : l.source.id;
    const t = typeof l.target === 'string' ? l.target : l.target.id;
    const path = s + '->' + t;
    if (!seenPaths.has(path)) {
      seenPaths.add(path);
      uniqueLinks.push(l);
    }
  }

  console.log(`Deduped nodes from ${corpusNodes.length} to ${uniqueNodes.length}`);
  console.log(`Deduped links from ${corpusLinks.length} to ${uniqueLinks.length}`);
}
run();
