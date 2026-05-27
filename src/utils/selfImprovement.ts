/**
 * Logs optimizations for the Recursive Self-Improvement protocol.
 * Persists to localStorage to maintain a cryptographic-adjacent audit trail.
 */

export interface ImprovementLog {
  timestamp: string;
  type: 'UX' | 'REFACTOR' | 'UI' | 'ALGORITHM';
  description: string;
  outcome: string;
}

export const logOptimization = (
  typeOrItem: 'UX' | 'REFACTOR' | 'UI' | 'ALGORITHM' | string | Omit<ImprovementLog, 'timestamp'>,
  description?: string,
  outcome?: any
) => {
  let logItem: Omit<ImprovementLog, 'timestamp'>;

  if (typeof typeOrItem === 'object' && typeOrItem !== null) {
    logItem = typeOrItem as Omit<ImprovementLog, 'timestamp'>;
  } else {
    let finalType: 'UX' | 'REFACTOR' | 'UI' | 'ALGORITHM' = 'REFACTOR';
    const typeStr = String(typeOrItem).toUpperCase();
    if (typeStr === 'UX' || typeStr === 'REFACTOR' || typeStr === 'UI' || typeStr === 'ALGORITHM') {
      finalType = typeStr as 'UX' | 'REFACTOR' | 'UI' | 'ALGORITHM';
    }

    let finalOutcome = '';
    if (outcome !== undefined) {
      if (typeof outcome === 'object') {
        finalOutcome = JSON.stringify(outcome);
      } else {
        finalOutcome = String(outcome);
      }
    }

    logItem = {
      type: finalType,
      description: description || '',
      outcome: finalOutcome
    };
  }

  const log: ImprovementLog = {
    ...logItem,
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

export const getImprovementLogs = (): ImprovementLog[] => {
  try {
    return JSON.parse(localStorage.getItem('journal314_improvement_log') || '[]');
  } catch (e) {
    return [];
  }
};
