export interface NotePrinciple {
  number: number;
  title: string;
  description: string;
}

export interface LinkedMention {
  id: string;
  title: string;
  snippet: string;
  targetId: string;
}

export interface TagItem {
  name: string;
  count: number;
}

export interface NoteDocument {
  id: string;
  title: string;
  subtitle: string;
  folder: string;
  path: string;
  quote?: string;
  introParagraph: string;
  corePrinciples?: NotePrinciple[];
  relatedIdeas: string[];
  closingQuote?: string;
  backlinksCount: number;
  wordCount: number;
  charCount: number;
  contentMarkdown?: string;
  linkedMentions?: LinkedMention[];
  isCustom?: boolean;
  claimCategory?: 'Occurrence' | 'Elevation';
}

export interface VaultFile {
  id: string;
  name: string;
  type: 'file' | 'folder';
  badge?: string | number;
  children?: VaultFile[];
  noteId?: string;
  toolView?: WorkspaceTabType;
}

export interface GraphStarNode {
  id: string;
  label: string;
  isCenter?: boolean;
  angle?: number; // radians
  distance?: number;
  color?: string;
  description?: string;
}

export type WorkspaceTabType = 'note' | 'academic' | 'graph' | 'canvas' | 'chat' | 'library' | 'questions' | 'ingest' | 'digest' | 'settings' | 'balance' | 'hypermarkmap';

export interface WorkspaceTab {
  id: string;
  type: WorkspaceTabType;
  title: string;
  noteId?: string;
}
