/**
 * Logs optimizations for the Recursive Self-Improvement protocol.
 * Persists to localStorage to maintain a cryptographic-adjacent audit trail.
 */

export interface improvementLog {
  timestamp: string;
  type: 'UX' | 'REFACTOR' | 'UI' | 'ALGORITHM';
  description: string;
  outcome: string;
}

export const logOptimization = (item: Omit<improvementLog, 'timestamp'>) => {
  const log: improvementLog = {
    ...item,
    timestamp: new Date().toISOString()
  };

  try {
    const existing = JSON.parse(localStorage.getItem('journal314_improvement_log') || '[]');
    const updated = [log, ...existing].slice(0, 50);
    localStorage.setItem('journal314_improvement_log', JSON.stringify(updated));
    console.log(`[RECURSIVE-SELF-IMPROVEMENT] ${log.type}: ${log.description}`);
  } catch (e) {
    console.error('Failed to log optimization', e);
  }
};

export const getImprovementLogs = (): improvementLog[] => {
  try {
    return JSON.parse(localStorage.getItem('journal314_improvement_log') || '[]');
  } catch (e) {
    return [];
  }
};
