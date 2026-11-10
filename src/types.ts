export interface JournalEntry {
  id: string;
  nodeId: string;
  nodeLabel: string;
  question: string;
  userText: string;
  tags?: string[];
  analysis: {
    dogmasIdentified: string[];
    apophaticReframing: string;
    contemplationStatus: 'active' | 'integrated' | 'dissolved';
  };
  timestamp: string;
}

export interface Marginalia {
  corpusId: string;
  noteText: string;
  timestamp: string;
}

export interface ParadoxSynthesis {
  id: string;
  nodeAId: string;
  nodeBId: string;
  nodeALabel: string;
  nodeBLabel: string;
  thesis: string;
  antithesis: string;
  synthesis: string;
  timestamp: string;
  complexity?: number;
  synthesizedTruth?: number;
}

// --- Corpus Intake & Second Brain System Types ---

export type EpistemicStatus =
  | 'TEXTUAL'
  | 'SOURCE_METADATA'
  | 'MEMORY_GRAPH'
  | 'INFERRED'
  | 'INTERPRETIVE'
  | 'PHENOMENOLOGICAL'
  | 'ANALOGICAL'
  | 'SPECULATIVE'
  | 'NORMATIVE'
  | 'APOPHATIC'
  | 'UNGROUNDED';

export type PermittedRepresentation =
  | 'operator'
  | 'limit'
  | 'disclosure'
  | 'placeholder'
  | 'contested ontology'
  | 'symbolic marker'
  | 'phenomenological event'
  | 'apophatic boundary';

export interface CanonicalChunk {
  id: string;
  startPosition: number;
  endPosition: number;
  structuralType: 'chapter' | 'section' | 'paragraph' | 'stanza' | 'fragment' | 'header';
  summary: string;
  text: string;
}

export type ClaimClassification = 'Occurrence' | 'Elevation';

export interface EpistemicExtract {
  id: string;
  elementType: 'claim' | 'concept' | 'thinker' | 'quote' | 'relationship';
  text: string;
  thinker?: string;
  tradition?: string;
  epistemicStatus: EpistemicStatus;
  claimType?: ClaimClassification;
  occurrenceElevationLabel?: ClaimClassification;
  chunkReference: string;
  provenance: string;
}

export interface IngestedClaimItem {
  id: string;
  text: string;
  classification: ClaimClassification;
  epistemicStatus?: string;
  sourceTitle: string;
  sourceType?: string;
  authorOrThinker?: string;
  timestamp?: string;
  confidence?: number;
  noteId?: string;
  batchId?: string;
  chunkRef?: string;
  tags?: string[];
}

export interface CorpusIssueFlag {
  id: string;
  type:
    | 'DUPLICATE_EXACT'
    | 'DUPLICATE_NEAR'
    | 'DUPLICATE_CONCEPTUAL'
    | 'LACUNA_CITATION'
    | 'LACUNA_ARGUMENT'
    | 'LACUNA_REFERENCE'
    | 'LACUNA_CROSS_TRADITION'
    | 'MALFORMED_ENCODING'
    | 'MALFORMED_STRUCTURE'
    | 'REVIEW_RISK';
  fileRef: string;
  location: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  description: string;
  recommendation: string;
}

export interface AntiReificationAudit {
  file: string;
  term: string;
  representation: PermittedRepresentation | 'reified_violation';
  status: 'PASS' | 'FAIL';
  location: string;
  note: string;
}

export interface BoundarySignal {
  file: string;
  signalType: string;
  tier: 'MONITOR' | 'CAUTION' | 'ESCALATE';
  actionTaken: string;
}

export interface NextAction {
  id: string;
  type: 'NOTE' | 'GRAPH_EDGE' | 'COMPARISON' | 'PARADOX' | 'SYNTHESIS' | 'QUERY';
  format: string;
  detail: string;
  fileRef: string;
}

export interface VerificationChecklist {
  immutableStorage: boolean;
  epistemicLabels: boolean;
  duplicatesSurfaced: boolean;
  crisisScanned: boolean;
  antiReification: boolean;
  noMergedMetadata: boolean;
  nextActionsProduced: boolean;
  selfVerified: boolean;
  batchReturned: boolean;
}

export interface CorpusIngestionBatch {
  batchId: string;
  timestamp: string;
  filename: string;
  fileExtension: string;
  fileSize: number;
  sha256Hash: string;
  rawContent: string;
  title: string;
  sourceType: string;
  chunks: CanonicalChunk[];
  extracts: EpistemicExtract[];
  issues: CorpusIssueFlag[];
  antiReificationAudits: AntiReificationAudit[];
  boundarySignals: BoundarySignal[];
  nextActions: NextAction[];
  markdownReport: string;
  verificationChecklist: VerificationChecklist;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'model';
  text: string;
  timestamp: string;
  wikilinks?: string[];
  provenanceCitations?: {
    source: string;
    quote: string;
    epistemicStatus: EpistemicStatus;
  }[];
  voidQuotient?: number;
  densificationLevel?: 'Δ0' | 'Δ1' | 'Δ2' | 'Δ3' | 'Δ4';
}

