export type GateMode = 'AUTO' | 'DEEP' | 'FAST';
export type BoundaryMode = 'CLEAR' | 'MONITOR' | 'CAUTION' | 'ESCALATE' | 'IMMEDIATE';

export interface BoundaryState {
  theta: number;
  mode: BoundaryMode;
}

export type AngView = 'chat' | 'graph' | 'library' | 'questions' | 'ingest' | 'digest' | 'settings';

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
