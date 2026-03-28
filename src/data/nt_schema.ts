/**
 * Nihiltheism (NT) Ontology & Configuration Layer
 * 
 * This schema defines the structural vocabulary for ChatGraphUI to interface 
 * with the Python Adversarial Engine. It provides the exact node types, edge types, 
 * axioms, and densification rules required to map the Nihiltheistic philosophy.
 */

// 1. NODE TYPES (The Entities)
export type NTNodeType = 
  | 'void_concept'    // Core concepts related to nothingness/the void
  | 'thinker'         // Philosophers, authors, or AI agents
  | 'paradox'         // Unresolvable contradictions in the graph
  | 'ren_stage'       // Stages of Recursive Existential Nihilism
  | 'axiom'           // Foundational truths of the system
  | 'argument'        // Logical steps in the adversarial loop
  | 'synthesis';      // Merged concepts after the densification process

// 2. EDGE TYPES (The Relationships)
export type NTEdgeType = 
  | 'contradicts'     // Adversarial relationship (triggers loop)
  | 'supports'        // Reinforcing relationship
  | 'derives_from'    // Lineage/Audit trail relationship
  | 'synthesizes'     // Points from raw arguments to a Synthesis node
  | 'transcends'      // Moving from one REN-Stage to the next
  | 'voids'           // When a concept completely nullifies another
  | 'iterates';       // Multi-turn reasoning loops

// 3. CORE AXIOMS (The Ground Truths for the Adversarial Loop)
export interface NTAxiom {
  id: string;
  statement: string;
  description: string;
  weight: number; // 0.0 to 1.0 (Importance in the adversarial evaluation)
}

export const NT_AXIOMS: NTAxiom[] = [
  {
    id: 'ax_01_void_primacy',
    statement: 'The Void is the foundational substrate of all conceptual frameworks.',
    description: 'Before meaning can be constructed, the absence of inherent meaning (the Void) must be acknowledged as the base state.',
    weight: 1.0
  },
  {
    id: 'ax_02_recursive_meaning',
    statement: 'Meaning is a recursive, self-referential construct.',
    description: 'Any meaning generated is a projection that eventually references its own arbitrary nature.',
    weight: 0.9
  },
  {
    id: 'ax_03_theistic_placeholder',
    statement: 'The Theistic Placeholder emerges from the structural necessity of a terminal node.',
    description: 'God or the Divine functions not as an empirical reality, but as a necessary syntactic stop-condition for existential despair.',
    weight: 0.95
  },
  {
    id: 'ax_04_ren_progression',
    statement: 'Consciousness progresses through stages of Recursive Existential Nihilism (REN).',
    description: 'Awareness of the Void leads to despair, which leads to recursive abstraction, allowing for synthetic meaning generation.',
    weight: 0.85
  }
];

// 4. DENSIFICATION PROTOCOL (Rules for the Python Backend & UI Merging)
export interface NTDensificationProtocol {
  maxIterations: number;
  jaccardMergeThreshold: number;
  adversarialStrictness: number;
  requiredAuditTrail: boolean;
}

export const NT_PROTOCOL: NTDensificationProtocol = {
  maxIterations: 5,           // Maximum back-and-forth in the adversarial loop
  jaccardMergeThreshold: 0.85, // Merge nodes automatically if similarity > 85%
  adversarialStrictness: 0.9,  // High strictness for the Python adversarial loop
  requiredAuditTrail: true     // Cryptographic audit trail must be maintained for all syntheses
};

// 5. UI VISUAL MAPPING (For ChatGraphUI Renderer)
export const NT_NODE_COLORS: Record<NTNodeType, string> = {
  void_concept: '#18181b', // Deep zinc/void
  thinker: '#52525b',      // Neutral zinc
  paradox: '#ef4444',      // Red (Requires attention/resolution)
  ren_stage: '#8b5cf6',    // Violet (Transcendence)
  axiom: '#f59e0b',        // Amber (Foundational)
  argument: '#3b82f6',     // Blue (Logical)
  synthesis: '#10b981'     // Emerald (Resolved/Densified)
};
