import fs from 'fs';
import { corpusNodes, corpusLinks } from '../src/data/corpus.ts';

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
    // Make sure we output string IDs for serialization
    uniqueLinks.push({ ...l, source: s, target: t });
  }
}

const header = `export type NodeType = 'concept' | 'thinker' | 'tradition' | 'methodology' | 'system' | 'library_item' | 'summary' | 'question' | 'event' | string;

export interface Node {
  id: string;
  label: string;
  type: NodeType;
  status?: 'RAW' | 'ACTIVE' | 'DENSIFIED' | 'ARCHIVED' | string;
  summary?: string;
  blocks?: any[];
  socratic_questions?: any[]; 
  metadata?: {
    tags?: string[];
    [key: string]: any;
  };
  [key: string]: any;
}

export interface Link {
  source: string;
  target: string;
  type?: string;
  [key: string]: any;
}

export const corpusNodes: Node[] = `;

const mid = `;\n\nexport const corpusLinks: Link[] = `;

const footer = `;\n`;

fs.writeFileSync('src/data/corpus.ts', header + JSON.stringify(uniqueNodes, null, 2) + mid + JSON.stringify(uniqueLinks, null, 2) + footer);

console.log('Deduped corpus.ts successfully!', uniqueNodes.length, uniqueLinks.length);
