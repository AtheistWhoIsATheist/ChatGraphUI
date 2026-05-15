
import { Node, Link } from '../data/corpus';

export interface AuditFinding {
  check: string;
  result: 'PASS' | 'FAIL' | 'WARNING';
  evidence?: string;
  recommendation?: string;
}

export interface AuditReport {
  timestamp: string;
  overallScore: number;
  status: 'PASS' | 'FAIL' | 'WARNING';
  sections: {
    metaphysicalSmuggling: AuditFinding[];
    apophaticDiscipline: AuditFinding[];
    antiReification: AuditFinding[];
    epistemicMarkers: AuditFinding[];
  };
}

const REIFICATION_PATTERNS = [
  { regex: /\bthe void\b(?! \s*(?:as|through|of|in\s+the\s+sense))/i, message: "Treating 'The Void' as an entity rather than an operator." },
  { regex: /\bvoid\b\s+(?:is|contains|holds|exists|wants|acts)/i, message: "Attributing agency or existence to the Void." },
  { regex: /\bnothingness\b\s+(?:is|exists|causes|wants|contains)/i, message: "Reifying Nothingness as a substance." },
  { regex: /\bthe Transcendent\b\s+(?:is|acts|wants|reveals)/i, message: "Treating the Transcendent as an agent." }
];

const METAPHYSICAL_PATTERNS = [
  { regex: /\b(is|exists)\b(?! \s*(?:not|without|limit|aporetic))/i, message: "Potential hidden ontological commitment ('is'/'exists')." },
  { regex: /\b(essence|substance)\b(?! \s*of|as)/i, message: "Use of substance-language." }
];

const EPISTEMIC_MARKERS = [
  '[TEXTUAL]', '[PHENOMENOLOGICAL]', '[INTERPRETIVE]', '[ANALOGICAL]', '[APHATIC]'
];

export function auditNihilContent(text: string, nodes: Partial<Node>[], links: any[]): AuditReport {
  const report: AuditReport = {
    timestamp: new Date().toISOString(),
    overallScore: 0,
    status: 'PASS',
    sections: {
      metaphysicalSmuggling: [],
      apophaticDiscipline: [],
      antiReification: [],
      epistemicMarkers: []
    }
  };

  // 1. Anti-Reification
  REIFICATION_PATTERNS.forEach(p => {
    const match = text.match(p.regex);
    report.sections.antiReification.push({
      check: "Entity-Void Detection",
      result: match ? 'FAIL' : 'PASS',
      evidence: match ? match[0] : undefined,
      recommendation: match ? p.message : undefined
    });
  });

  // 2. Metaphysical Smuggling
  METAPHYSICAL_PATTERNS.forEach(p => {
    const match = text.match(p.regex);
    report.sections.metaphysicalSmuggling.push({
      check: "Ontological Commitment",
      result: match ? 'WARNING' : 'PASS',
      evidence: match ? match[0] : undefined,
      recommendation: match ? p.message : undefined
    });
  });

  // 3. Epistemic Markers
  const markerCount = EPISTEMIC_MARKERS.filter(m => text.includes(m)).length;
  report.sections.epistemicMarkers.push({
    check: "Marker Presence",
    result: markerCount > 0 ? 'PASS' : 'FAIL',
    recommendation: markerCount === 0 ? "Add [TEXTUAL], [PHENOMENOLOGICAL], etc. to orient claims." : undefined
  });

  // Simple scoring
  const totalChecks = 
    report.sections.antiReification.length + 
    report.sections.metaphysicalSmuggling.length + 
    report.sections.epistemicMarkers.length;
  
  const failed = [
    ...report.sections.antiReification,
    ...report.sections.metaphysicalSmuggling,
    ...report.sections.epistemicMarkers
  ].filter(f => f.result === 'FAIL').length;

  report.overallScore = Math.max(0, 100 - (failed * 20));
  report.status = failed > 0 ? 'FAIL' : (report.overallScore < 90 ? 'WARNING' : 'PASS');

  return report;
}
