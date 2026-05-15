import { corpusNodes, Node } from '../data/corpus';

export interface ResonanceResult {
  similarities: { tradition: string; similarity: string; intensity: number }[];
  remainders: { concept: string; difference: string }[];
  generative_bridges: { source: string; target: string; logic: string }[];
  summary: string;
}

export function findResonantCandidates(text: string): Node[] {
  // Simple keyword matching for initial filtering
  const themes = ['void', 'nothingness', 'negation', 'dread', 'anxiety', 'silence', 'ego', 'transcendence'];
  const foundThemes = themes.filter(t => text.toLowerCase().includes(t));
  
  if (foundThemes.length === 0) return corpusNodes.slice(0, 10);

  return corpusNodes.filter(node => {
    const label = node.label.toLowerCase();
    const summary = (node.summary || '').toLowerCase();
    return foundThemes.some(theme => label.includes(theme) || summary.includes(theme));
  }).slice(0, 15);
}
