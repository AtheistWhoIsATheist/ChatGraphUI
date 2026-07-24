import { OntologyNode } from '../data/ontology';
import { JournalEntry, ParadoxSynthesis } from '../types';

/**
 * Lists of key words that signal various forms of certainty or dogmatic assertions.
 */
const DOGMATIC_INDICATORS = [
  { term: 'always', category: 'Temporal Absolute' },
  { term: 'never', category: 'Temporal Absolute' },
  { term: 'must', category: 'Moral or Logical Necessity' },
  { term: 'certainly', category: 'Epistemic Certainty' },
  { term: 'impossible', category: 'Epistemic Boundary' },
  { term: 'believe', category: 'Subjective Creed' },
  { term: 'is the only', category: 'Monolithic Claim' },
  { term: 'absolutely', category: 'Ontological Rigidity' },
  { term: 'forever', category: 'Eternal Assertion' },
  { term: 'fact', category: 'Epistemic Closure' },
  { term: 'truth', category: 'Objective Finality' }
];

/**
 * Analyzes a user's reflective journal text and identifies conceptual closures (dogmas)
 * and generates a supportive apophatic deconstruction.
 */
export function deconstructContemplation(
  node: OntologyNode,
  question: string,
  userText: string
): JournalEntry['analysis'] {
  const normalizedText = userText.toLowerCase();
  const foundDogmas: string[] = [];

  // Match assertions
  for (const item of DOGMATIC_INDICATORS) {
    if (normalizedText.includes(item.term)) {
      foundDogmas.push(`${item.term} (${item.category})`);
    }
  }

  // Fallback if no specific rigid terms are used
  if (foundDogmas.length === 0) {
    foundDogmas.push('Subtle Identification (Implicit conceptual framing)');
  }

  // Construct apophatic feedback based on the node's type
  let apophaticReframing = '';

  const cleanedTextSample = userText.trim().slice(0, 40) + (userText.length > 40 ? '...' : '');

  switch (node.type) {
    case 'Ontological Core':
      apophaticReframing = `In reflecting upon "${node.label}", your assertion ("${cleanedTextSample}") grasps at an ultimate foundation. Yet, the apophatic path warns that naming the ground immediately limits it. If we claim it "is" or "is not" anything specific, we reduce a primordial field to a human category. Let go of the need to solidify this emptiness. Notice the silent space that remains when the words are surrendered.`;
      break;
    case 'Conceptual Core':
      apophaticReframing = `Your response to "${question}" attempts to harness the movement of negation. But if negation is made into a system, it becomes its own dogma—a rigid "active nothingness." True negation must negate even itself. Can you allow your conviction about this concept to dissolve, leaving only the pristine, unmediated experience of the present?`;
      break;
    case 'Epistemological':
      apophaticReframing = `By analyzing "${node.label}", you are seeking the boundary of what can be known. Yet, when you state your stance, the mind creates a dualism: the knower and the known. Socratic suspension invites you not to find a better answer, but to rest in the fertile ground of complete non-knowing (aporia). What happens when you treat your thoughts not as facts, but as temporary ripples in a vast, silent ocean?`;
      break;
    case 'Theological':
      apophaticReframing = `The apophatic method in "${node.label}" is a refusal to construct idols out of language. Your reflection attempts to bracket the Absolute. But the divine nothingness is beyond all designations of existence or non-existence. Try speaking of your insight strictly by declaring what it is *not*. In doing so, we clear away the conceptual dust and honor the unassociated reality that lies beyond words.`;
      break;
    case 'Phenomenological':
      apophaticReframing = `Contemplating "${node.label}" (such as Cosmic Decay) exposes our vulnerability to time and change. Your words seek to make peace or find a pattern in this dissolution. But decay is the physical shadow of the Void. Rather than trying to master or escape this movement, can you surrender to it? In complete surrender, the friction between the self and the cosmos collapses into a singular, silent flow.`;
      break;
    case 'Existential':
      apophaticReframing = `The Absurd is born from the demand for meaning in an indifferent world. In your journal, you grapple with this tension. To resolve it by force is to kill the freedom it offers. True revolt is not a victory over the void, but the courage to stand before it, fully awake, without demanding an explanation. Can you rest in the friction itself without seeking an exit?`;
      break;
    case 'Praxis':
      apophaticReframing = `Gelassenheit (total detachment) is not a state of passive waiting, but a radical release—even of the desire to be detached. In formulating your thoughts, you are still "willing" an outcome. Let go of even the concept of letting go. When there is no self left to hold on, and no object left to hold, the uncreated abyss reveals itself as absolute stillness.`;
      break;
    default:
      apophaticReframing = `Your reflection on "${node.label}" shows a sincere movement of the mind. To go deeper, we must examine the silent presuppositions behind your statements. If you treat this realization as a transparent cloud rather than a solid stone, how does your relationship to it change? Allow the concept to dissolve into its underlying quiet.`;
  }

  // Determine contemplation status
  let status: JournalEntry['analysis']['contemplationStatus'] = 'active';
  if (foundDogmas.length <= 1 && userText.length > 100) {
    status = 'integrated';
  } else if (foundDogmas.length > 2) {
    status = 'active';
  } else if (userText.toLowerCase().includes('silence') || userText.toLowerCase().includes('dissolve') || userText.toLowerCase().includes('let go')) {
    status = 'dissolved';
  }

  return {
    dogmasIdentified: foundDogmas,
    apophaticReframing,
    contemplationStatus: status
  };
}

/**
 * Beautiful, specific custom paradoxes for key pairs of philosophical nodes.
 * This guarantees a breathtaking user experience with highly refined content.
 */
interface StaticParadox {
  thesis: string;
  antithesis: string;
  synthesis: string;
}

const STATIC_PARADOX_REGISTRY: Record<string, StaticParadox> = {
  'void-sunyata': {
    thesis: "The Absolute Void represents the primordial, infinite abyss of withdrawal—the cosmic background of non-being.",
    antithesis: "Śūnyatā is the radical codependency and emptiness of all active phenomena, meaning all things are empty of independent essence.",
    synthesis: "These two deep fields dissolve into one: the Void is not 'out there' as a cold spatial distance, nor is Śūnyatā a purely local logical property. The Void is the inner emptiness of every present phenomenon, and every phenomenon is a localized blossoming of the Void itself. Form is emptiness, emptiness is form."
  },
  'void-entropy': {
    thesis: "The Absolute Void is a timeless, metaphysical origin from which all existence withdrew.",
    antithesis: "Cosmic Decay (Entropy) is a temporal, physical process that drags the physical universe toward absolute, cold, uniform thermal stillness.",
    synthesis: "Thermodynamic entropy is the physical shadow of the primordial Void. The universe is physically returning to the silence it metaphysically never left. Decay is not a tragic end, but the physical self-correction of reality dissolving back into its original, uncreated, peaceful stillness."
  },
  'epoche-aporia': {
    thesis: "Socratic Epoché is the active, intentional suspension of judgment to keep the mind fluid and prevent cognitive dogmatism.",
    antithesis: "Aporia is the involuntary, baffling state of mental blockade or logical impasse where all paths lead to contradiction.",
    synthesis: "Epoché is the practice; aporia is the result. By intentionally suspending judgment, we invite the cognitive gridlock that forces the rational mind to break. In this fertile block, aporia ceases to be a source of frustration and instead becomes the gateway of ultimate clarity—a beautiful, silent space free of presumption."
  },
  'nihil-absurd': {
    thesis: "Active Nihilism is a deliberate, purifying force that aggressively strips away artificial structures and values.",
    antithesis: "The Absurd is the constant, existential friction of a human seeking meaning in a world that offers none.",
    synthesis: "Instead of desperately struggling against the Absurd, Active Nihil uses the Absurd as a solvent. By actively negating the illusion of a pre-packaged cosmic meaning, we transform the Absurd from a heavy weight of despair into the absolute lightness of pure, creative freedom. The friction dissolves when we stop demanding the world be anything other than a silent canvas."
  },
  'apophasis-detachment': {
    thesis: "Apophatic Silence is a discursive and theological method of describing the Absolute solely by saying what it is not.",
    antithesis: "Abyssal Gelassenheit is a psychological and spiritual practice of total detachment, letting go of all possessions, desires, and thoughts.",
    synthesis: "Apophatis is the negation of language; Gelassenheit is the negation of the self. Together, they form the complete circle of apophatic praxis. By denying words (apophasis), we clear the mind; by denying our hold on self-identity (Gelassenheit), we clear the heart. What remains is the uncreated, wordless abyss where knower and known dissolve into supreme silence."
  }
};

/**
 * Dynamically synthesizes a paradox between any two philosophical nodes.
 * If a static paradox is available, it uses it; otherwise, it creates a beautifully
 * structured custom synthesis on-the-fly.
 */
export function synthesizeParadox(
  nodeA: OntologyNode,
  nodeB: OntologyNode
): ParadoxSynthesis {
  const pairKey1 = `${nodeA.id}-${nodeB.id}`;
  const pairKey2 = `${nodeB.id}-${nodeA.id}`;

  let staticParadox = STATIC_PARADOX_REGISTRY[pairKey1] || STATIC_PARADOX_REGISTRY[pairKey2];

  if (staticParadox) {
    return {
      id: `${nodeA.id}_${nodeB.id}_${Date.now()}`,
      nodeAId: nodeA.id,
      nodeBId: nodeB.id,
      nodeALabel: nodeA.label,
      nodeBLabel: nodeB.label,
      thesis: staticParadox.thesis,
      antithesis: staticParadox.antithesis,
      synthesis: staticParadox.synthesis,
      timestamp: new Date().toISOString()
    };
  }

  // Generate dynamic, meaningful synthesis
  const thesis = `"${nodeA.label}" (${nodeA.type}) anchors its stance on the insight that ${nodeA.summary.replace(/\.$/, '')}, drawing its primary resonance from the era of ${nodeA.era}.`;
  const antithesis = `Conversely, "${nodeB.label}" (${nodeB.type}) challenges this or approaches the Absolute from another angle, asserting that ${nodeB.summary.replace(/\.$/, '')}, rising from the era of ${nodeB.era}.`;
  
  const synthesis = `The aporetic friction between ${nodeA.label} and ${nodeB.label} reveals a profound paradox. While the former focuses on the structural or epistemic aspect of ${nodeA.type.toLowerCase()}, the latter directs our attention to the immediate reality of ${nodeB.type.toLowerCase()}. Rather than forcing these paths to reconcile into a dogmatic system, we must allow their contradiction to stand. In the space of this unsolvable tension, the analytical mind is exhausted, and we are forced to drop all labels. They dissolve into a singular, quiet awareness that transcends both positions, inviting us into the sacred stillness of the apophatic void.`;

  return {
    id: `${nodeA.id}_${nodeB.id}_${Date.now()}`,
    nodeAId: nodeA.id,
    nodeBId: nodeB.id,
    nodeALabel: nodeA.label,
    nodeBLabel: nodeB.label,
    thesis,
    antithesis,
    synthesis,
    timestamp: new Date().toISOString()
  };
}
