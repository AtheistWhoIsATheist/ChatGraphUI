export interface DisparityComparison {
  docA: string;
  docB: string;
  disparityIndex: number;
  subMetrics: {
    structuralDivergence: number;
    doctrinalGap: number;
    rhetoricalVariance: number;
  };
  registers: string[];
  summary: string;
}

export interface RegisterBadgeStyle {
  type: string;
  label: string;
  color: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  dotColor: string;
}

export interface AgentMessage {
  id: string;
  sender: 'user' | 'agent';
  type?: string;
  content: string;
  registers: Array<'STRUCTURAL' | 'DOCTRINAL' | 'RHETORICAL'>;
  comparison?: DisparityComparison;
  relatedNodeId?: string;
  timestamp: string;
}

export declare function mapComparison(docA: any, docB: any): DisparityComparison;
export declare function getRegisterBadgeStyle(type: string): RegisterBadgeStyle;
export declare function processCommand(input: string): AgentMessage;
export declare function filterMessagesByRegister<T extends AgentMessage>(messages: T[], selectedRegister: string | null): T[];

const engine: {
  mapComparison: typeof mapComparison;
  getRegisterBadgeStyle: typeof getRegisterBadgeStyle;
  processCommand: typeof processCommand;
  filterMessagesByRegister: typeof filterMessagesByRegister;
};

export default engine;
