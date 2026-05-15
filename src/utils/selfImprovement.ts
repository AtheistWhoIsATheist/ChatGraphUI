export enum ImprovementMode {
  REPAIRING = 'REPAIRING',
  OPTIMIZING = 'OPTIMIZING',
  STABLE = 'STABLE'
}

export interface ExecutionLog {
  timestamp: string;
  mode: ImprovementMode;
  action: 'fix' | 'refactor' | 'validate' | 'monitor';
  previous_state: string;
  current_state: string;
  details: string;
  results: Record<string, any>;
}

const STORAGE_KEY = 'recursive_self_improvement_logs';

export function logOptimization(action: ExecutionLog['action'], details: string, results: Record<string, any>) {
  const logs: ExecutionLog[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  
  const newLog: ExecutionLog = {
    timestamp: new Date().toISOString(),
    mode: ImprovementMode.OPTIMIZING,
    action,
    previous_state: logs.length > 0 ? logs[logs.length - 1].current_state : 'INITIAL',
    current_state: 'OPTIMIZED',
    details,
    results
  };

  logs.push(newLog);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
  console.log('[SYSTEM SELF-IMPROVEMENT]', newLog);
}

export function getLogs(): ExecutionLog[] {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
}
