export type GateMode = 'AUTO' | 'DEEP' | 'FAST';
export type BoundaryMode = 'CLEAR' | 'MONITOR' | 'CAUTION' | 'ESCALATE' | 'IMMEDIATE';

export interface BoundaryState {
  theta: number;
  mode: BoundaryMode;
}

export type AngView = 'workspace' | 'chat' | 'graph' | 'library' | 'questions' | 'ingest' | 'digest' | 'settings' | 'academic';

export interface AporiaNode {
  id: string;
  text: string;
  whyUnresolvable: string;
  functionalValue: string;
  sourceId?: string;
  createdAt: string;
  status: 'CONFIRMED' | 'EXPLORING';
}

export interface AngSession {
  id: string;
  startTime: string;
  thetaMax: number;
  nodesCreated: number;
  deepPathActivations: number;
}

export type FileStatus = 'UPLOADED' | 'knowledge_base' | 'SHADOW_EXTRACTED' | 'ERROR';

export interface FileManagerFile {
  id: string;
  name: string;
  size: number;
  uploadDate: string;
  status: FileStatus;
  content?: string;
  type?: string;
}

export interface AutoNarrativeResult {
  clusterId: string;
  thematicLabel: string;
  summary: string;
  criticalConflict: string;
}

export interface GapSynthesisResult {
  clusterA: string;
  clusterB: string;
  latentSynapse: string;
  insightPrompt: string;
}

export interface ImaginaryEmotion {
  id: string;
  name: string;
  phenomenology: string;
  intensity: number; // 0.0 to 1.0
  color: string;
}
