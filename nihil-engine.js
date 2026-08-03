/**
 * Nihil Reasoning Engine - Core Disparity & Register Analytics Module
 */

/**
 * Calculates Disparity Index (0-100) and sub-metrics for a /map comparison
 * @param {string|object} docA - Source document or topic A
 * @param {string|object} docB - Target document or topic B
 * @returns {object} Disparity breakdown object
 */
export function mapComparison(docA, docB) {
  const titleA = typeof docA === 'string' ? docA : docA?.title || 'Primary Source A';
  const titleB = typeof docB === 'string' ? docB : docB?.title || 'Primary Source B';

  // Seed pseudo-deterministic metrics based on document string lengths/hashes
  const hashA = [...titleA].reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const hashB = [...titleB].reduce((acc, char) => acc + char.charCodeAt(0), 0);

  const structuralDivergence = Math.min(98, Math.max(15, (hashA * 7 + hashB * 3) % 85 + 12));
  const doctrinalGap = Math.min(99, Math.max(20, (hashA * 11 + hashB * 13) % 80 + 18));
  const rhetoricalVariance = Math.min(95, Math.max(10, (hashA * 5 + hashB * 17) % 82 + 15));

  const disparityIndex = Math.round(
    (structuralDivergence * 0.35) + (doctrinalGap * 0.45) + (rhetoricalVariance * 0.20)
  );

  return {
    docA: titleA,
    docB: titleB,
    disparityIndex,
    subMetrics: {
      structuralDivergence,
      doctrinalGap,
      rhetoricalVariance
    },
    registers: ['STRUCTURAL', 'DOCTRINAL', 'RHETORICAL'],
    summary: `Comparison between "${titleA}" and "${titleB}" yields a total Disparity Index of ${disparityIndex}/100. Sub-metric breakdown: Structural Divergence (${structuralDivergence}%), Doctrinal Gap (${doctrinalGap}%), Rhetorical Variance (${rhetoricalVariance}%).`
  };
}

/**
 * Gets CSS badge styling for a register chip type
 * @param {string} type - 'STRUCTURAL' | 'DOCTRINAL' | 'RHETORICAL'
 * @returns {object} Style definitions
 */
export function getRegisterBadgeStyle(type) {
  switch (type?.toUpperCase()) {
    case 'STRUCTURAL':
      return {
        type: 'STRUCTURAL',
        label: '[STRUCTURAL]',
        color: 'blue',
        bgClass: 'bg-blue-500/20',
        textClass: 'text-blue-400',
        borderClass: 'border-blue-500/40',
        dotColor: '#60a5fa'
      };
    case 'DOCTRINAL':
      return {
        type: 'DOCTRINAL',
        label: '[DOCTRINAL]',
        color: 'orange',
        bgClass: 'bg-orange-500/20',
        textClass: 'text-orange-400',
        borderClass: 'border-orange-500/40',
        dotColor: '#fb923c'
      };
    case 'RHETORICAL':
      return {
        type: 'RHETORICAL',
        label: '[RHETORICAL]',
        color: 'fuchsia',
        bgClass: 'bg-fuchsia-500/20',
        textClass: 'text-fuchsia-400',
        borderClass: 'border-fuchsia-500/40',
        dotColor: '#e879f9'
      };
    default:
      return {
        type: 'GENERAL',
        label: '[GENERAL]',
        color: 'slate',
        bgClass: 'bg-slate-500/20',
        textClass: 'text-slate-400',
        borderClass: 'border-slate-500/40',
        dotColor: '#94a3b8'
      };
  }
}

/**
 * Processes a command string (e.g. /map "Doc1" "Doc2")
 * @param {string} input - User input command
 * @returns {object} Agent message response object
 */
export function processCommand(input) {
  const trimmed = input.trim();

  if (trimmed.startsWith('/map')) {
    const parts = trimmed.slice(4).trim().split('"').filter(p => p.trim().length > 0);
    const docA = parts[0] || 'Nietzsche: Will to Power';
    const docB = parts[1] || 'Sartre: Being and Nothingness';

    const comparison = mapComparison(docA, docB);

    let relatedNodeId = 'nihil';
    const lower = (docA + ' ' + docB).toLowerCase();
    if (lower.includes('nietzsche')) relatedNodeId = 'nihil';
    else if (lower.includes('sartre')) relatedNodeId = 'epoche';
    else if (lower.includes('sunyata') || lower.includes('nagarjuna')) relatedNodeId = 'void';
    else if (lower.includes('camus')) relatedNodeId = 'nihil';
    else if (lower.includes('socratic') || lower.includes('descartes')) relatedNodeId = 'epoche';

    return {
      id: `msg-${Date.now()}`,
      sender: 'agent',
      type: 'map_response',
      content: comparison.summary,
      comparison,
      registers: ['STRUCTURAL', 'DOCTRINAL', 'RHETORICAL'],
      relatedNodeId,
      timestamp: new Date().toLocaleTimeString()
    };
  }

  // Standard philosophical response
  let relatedNodeId = 'epoche';
  const lower = trimmed.toLowerCase();
  if (lower.includes('void') || lower.includes('absolute')) relatedNodeId = 'void';
  else if (lower.includes('nihil') || lower.includes('negation')) relatedNodeId = 'nihil';
  else if (lower.includes('epoche') || lower.includes('doubt')) relatedNodeId = 'epoche';

  return {
    id: `msg-${Date.now()}`,
    sender: 'agent',
    type: 'agent_response',
    content: `Deconstructing input: "${trimmed}". Examining ontological anchors across Structural, Doctrinal, and Rhetorical registers.`,
    registers: ['STRUCTURAL', 'DOCTRINAL', 'RHETORICAL'],
    relatedNodeId,
    timestamp: new Date().toLocaleTimeString()
  };
}

/**
 * Filters a list of messages by active register chip filter
 * @param {Array} messages - Array of message objects
 * @param {string|null} selectedRegister - Register filter ('STRUCTURAL' | 'DOCTRINAL' | 'RHETORICAL' | null)
 * @returns {Array} Filtered message array
 */
export function filterMessagesByRegister(messages, selectedRegister) {
  if (!selectedRegister) return messages;
  return messages.filter(msg =>
    Array.isArray(msg.registers) && msg.registers.includes(selectedRegister)
  );
}

// Default export object for both ESM and CJS compatibility
export default {
  mapComparison,
  getRegisterBadgeStyle,
  processCommand,
  filterMessagesByRegister
};
