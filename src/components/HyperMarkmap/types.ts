export interface HyperNode {
  id: string;
  name: string;
  content?: string;
  depth: number;
  children?: HyperNode[];
  _children?: HyperNode[]; // Collapsed children
  collapsed?: boolean;
  parent?: HyperNode;
  color?: string;
  notes?: string;
  linkCount?: number;
  descendantCount?: number;
  tags?: string[];
  isMatch?: boolean;
  isCurrentMatch?: boolean;
  operator?: '∅' | '⚖' | '⇄' | '🜏' | '⟁' | string;
  traditions?: string[];
  isDimmed?: boolean;
  x?: number;
  y?: number;
}

export type LayoutMode = 'radial' | 'horizontal';

export type ColorTheme = 'cosmic' | 'amethyst' | 'cyan' | 'slate';

export interface DisplaySettings {
  showGlow: boolean;
  showStarfield: boolean;
  showFilaments: boolean;
  showOrbs: boolean;
  colorTheme: ColorTheme;
  fontSize: number;
  nodeSpacing: number;
  maxVisibleDepth: number;
  zenMode: boolean;
}

export interface TraditionLane {
  id: string;
  label: string;
  kw: string;
  color: string;
  count?: number;
}

export const CANONICAL_TRADITIONS: TraditionLane[] = [
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

export const PHILOSOPHICAL_OPERATORS: Record<string, { label: string; color: string; description: string }> = {
  '∅': { label: 'void', color: '#94a3b8', description: 'Ontological origin / absolute groundlessness' },
  '⚖': { label: 'firewall', color: '#cbd5e1', description: 'Apophatic boundary / epistemic threshold' },
  '⇄': { label: 'hyperedge', color: '#38bdf8', description: 'Phenomenological reciprocal connection' },
  '🜏': { label: 'residue', color: '#a78bfa', description: 'Non-equivalence remainder / ontological trace' },
  '⟁': { label: 'apophatic', color: '#f87171', description: 'Negative clearance / transcendent horizon' }
};

export interface MapPreset {
  id: string;
  name: string;
  description: string;
  type: 'markdown' | 'json';
  contentUrl?: string;
  content?: string;
}

export interface SearchState {
  query: string;
  matchIds: string[];
  currentIndex: number;
  totalMatches: number;
}

export interface TraditionFilterState {
  selectedIds: string[]; // empty means all traditions active
  muteZeroCount: boolean;
}
