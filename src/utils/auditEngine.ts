
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
    groundlessness: AuditFinding[];
  };
}

const REIFICATION_PATTERNS = [
  { regex: /\bthe void\b(?! \s*(?:as|through|of|in\s+the\s+sense))/i, message: "Treating 'The Void' as an entity rather than an operator. Prefer 'void-contact' or 'voidance'." },
  { regex: /\bvoid\b\s+(?:is|contains|holds|exists|wants|acts)/i, message: "Attributing agency or existence to the Void. The Void should be framed as a limit-operator." },
  { regex: /\bnothingness\b\s+(?:is|exists|causes|wants|contains)/i, message: "Reifying Nothingness as a substance. Frame as 'nothingness-marker' or 'phenomenon-of-absence'." },
  { regex: /\bthe Transcendent\b\s+(?:is|acts|wants|reveals)/i, message: "Treating the Transcendent as an agent. Use aporetic framing." }
];

const METAPHYSICAL_PATTERNS = [
  { regex: /\b(is|exists|real|reality|truth|absolute|ultimate|being|existence|actual)\b(?! \s*(?:not|without|limit|aporetic|marker|operator|occurrence|probability))/i, message: "Potential hidden ontological commitment. Frame as 'phenomenological occurrence' or 'probabilistic node'." },
  { regex: /\b(essence|substance|nature|identity|soul|spirit|core)\b(?! \s*of|as|marker|process)/i, message: "Use of substance-language detected. Consider using 'structural recurrence' or 'kinetic regularity'." }
];

const GROUNDLESSNESS_PATTERNS = [
  { regex: /\b(abyss|abyssal|bottomless|unfounded|ungrounded|baseless|rootless|groundless|unanchored)\b/i, message: "Linguistic markers of ontic groundlessness detected." },
  { regex: /\b(dissolving|vanishing|evanescent|fleeting|insubstantial|collapse|rupture|fracture|voiding)\b/i, message: "Patterns of substantial dissolution or structural rupture detected." },
  { regex: /\b(void-contact|voidance|non-being|nihil|nothingness-marker|void-logic)\b/i, message: "Direct reference to the architecture of the void." },
  { regex: /\b(suspension|vertigo|dread|anxiety|angst|drift|hollow)\b/i, message: "Affective correlates of groundlessness detected." }
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
      epistemicMarkers: [],
      groundlessness: []
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

  // 3. Groundlessness Scrutiny
  GROUNDLESSNESS_PATTERNS.forEach(p => {
    const match = text.match(p.regex);
    if (match) {
      report.sections.groundlessness.push({
        check: "Groundlessness Detection",
        result: 'PASS', // Finding groundlessness is often a 'pass' in this specific nihiltheistic context, but we flag it as a finding.
        evidence: match[0],
        recommendation: p.message
      });
    }
  });

  // 4. Epistemic Markers & Unlabeled Claims
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
  const unlabeledSentences = sentences.filter(s => !EPISTEMIC_MARKERS.some(m => s.includes(m)));

  report.sections.epistemicMarkers.push({
    check: "Marker Coverage",
    result: unlabeledSentences.length === 0 ? 'PASS' : (unlabeledSentences.length > sentences.length / 2 ? 'FAIL' : 'WARNING'),
    evidence: unlabeledSentences.length > 0 ? unlabeledSentences[0].trim() : undefined,
    recommendation: unlabeledSentences.length > 0 
      ? `Found ${unlabeledSentences.length} unlabeled claims. Consider tagging with [INTERPRETIVE] or [PHENOMENOLOGICAL].` 
      : "Full epistemic coverage detected."
  });

  const markerCount = EPISTEMIC_MARKERS.filter(m => text.includes(m)).length;
  if (markerCount === 0) {
    report.sections.epistemicMarkers.push({
      check: "Marker Presence",
      result: 'FAIL',
      recommendation: "Add [TEXTUAL], [PHENOMENOLOGICAL], etc. to orient claims."
    });
  }

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

  report.overallScore = Math.max(0, 100 - (failed * 15));
  report.status = failed > 0 ? 'FAIL' : (report.overallScore < 90 ? 'WARNING' : 'PASS');

  return report;
}
