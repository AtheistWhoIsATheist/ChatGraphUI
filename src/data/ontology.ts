import { NODE_COLORS } from './knowledgeGraphDataset';
export { NODE_COLORS };

export interface OntologyNode {
  id: string;
  label: string;
  type: 'Ontological Core' | 'Conceptual Core' | 'Epistemological' | 'Theological' | 'Phenomenological' | 'Existential' | 'Praxis';
  summary: string;
  resonance: number; // 0 to 100
  questions: string[];
  era: string;
}

export interface OntologyLink {
  source: string;
  target: string;
  label: string;
  intensity: number; // 1 to 5
}

export interface CorpusText {
  id: string;
  author: string;
  title: string;
  period: string;
  fragment: string;
  tags: string[];
}

export const initialNodes: OntologyNode[] = [
  {
    id: "void",
    label: "The Absolute Void",
    type: "Ontological Core",
    summary: "The ultimate foundation of nihiltheistic ontology. It is not a mere absence of being, but the infinite, primordial womb from which all being withdraws.",
    resonance: 95,
    questions: [
      "Can the Void be experienced without collapsing into conceptual dogmatism?",
      "How does the withdrawal of the Void manifest in daily temporal awareness?"
    ],
    era: "Primordial"
  },
  {
    id: "nihil",
    label: "Active Nihil",
    type: "Conceptual Core",
    summary: "The active, purifying force of negation that continuously dissolves artificial cognitive structures, exposing the raw silence of existence.",
    resonance: 88,
    questions: [
      "Is negation a secondary cognitive event, or the primary state of reality?",
      "Does Active Nihil liberate the self or accelerate existential vertigo?"
    ],
    era: "Modern / Post-Structural"
  },
  {
    id: "epoche",
    label: "Socratic Epoché",
    type: "Epistemological",
    summary: "The radical suspension of judgment. An intellectual state of active stillness that refuses to solidify fluid perceptions into rigid truths.",
    resonance: 76,
    questions: [
      "How does one maintain Epoché in a culture demanding immediate certainty?",
      "Is the silence of Epoché a defeat of reason, or its absolute peak?"
    ],
    era: "Classical Greece"
  },
  {
    id: "apophasis",
    label: "Apophatic Silence",
    type: "Theological",
    summary: "The theological and philosophical method of speaking of the Absolute strictly through negation—defining truth exclusively by what it is not.",
    resonance: 82,
    questions: [
      "If the Absolute is unnamed, does language serve as a bridge or a barrier?",
      "How does apophasis distinguish itself from simple blankness?"
    ],
    era: "Medieval Mysticism"
  },
  {
    id: "entropy",
    label: "Cosmic Decay",
    type: "Phenomenological",
    summary: "The physical and cosmic expression of the Void, whereby the universe dissolves high-energy structures into cold, uniform, silent thermal equilibrium.",
    resonance: 90,
    questions: [
      "Is thermodynamic entropy the physical shadow of philosophical negation?",
      "Can human creativity be viewed as a localized rebellion against cosmic decay?"
    ],
    era: "Scientific Era"
  },
  {
    id: "absurd",
    label: "The Absurd",
    type: "Existential",
    summary: "The irreconcilable friction between the human consciousness desperately seeking inherent purpose, and the cold, vast, silent universe.",
    resonance: 84,
    questions: [
      "Must the recognition of the Absurd lead to despair, or is it the source of true freedom?",
      "How does revolt sustain itself in the presence of the Absurd?"
    ],
    era: "20th Century Existentialism"
  },
  {
    id: "detachment",
    label: "Abyssal Gelassenheit",
    type: "Praxis",
    summary: "A state of total cognitive, spiritual, and material detachment. Letting go of even the concept of God to rest in the uncreated abyss.",
    resonance: 79,
    questions: [
      "Can one operate in the social realm while remaining in complete detachment?",
      "Does Gelassenheit require the abandonment of personal identity?"
    ],
    era: "14th Century German Mysticism"
  },
  {
    id: "sunyata",
    label: "Śūnyatā (Emptiness)",
    type: "Ontological Core",
    summary: "The core Buddhist insight that all phenomena are empty of inherent, independent self-nature, existing solely as dynamic, codependent webs.",
    resonance: 91,
    questions: [
      "How does emptiness differ from Western nihilism's concept of nothingness?",
      "If all things are empty, how does compassion arise naturally from this void?"
    ],
    era: "Ancient India / Mahayana"
  },
  {
    id: "aporia",
    label: "Aporia",
    type: "Epistemological",
    summary: "A state of profound cognitive puzzle, impasse, or insolubility where all logical pathways lead to self-contradiction, clearing the mind of presumption.",
    resonance: 73,
    questions: [
      "Is aporia a breakdown of the logical machinery or the disclosure of its limits?",
      "How can aporia be used to cultivate active intellectual humility?"
    ],
    era: "Socratic Dialogues"
  }
];

export const initialLinks: OntologyLink[] = [
  { source: "void", target: "nihil", label: "Grounds the force of", intensity: 5 },
  { source: "void", target: "apophasis", label: "Theological mirror of", intensity: 4 },
  { source: "void", target: "sunyata", label: "Metaphysical overlap", intensity: 5 },
  { source: "nihil", target: "absurd", label: "Prerequisite for", intensity: 4 },
  { source: "epoche", target: "aporia", label: "Resolves into", intensity: 4 },
  { source: "epoche", target: "detachment", label: "Epistemic equivalent of", intensity: 3 },
  { source: "apophasis", target: "detachment", label: "Praxis guide for", intensity: 5 },
  { source: "entropy", target: "void", label: "Physical trajectory to", intensity: 4 },
  { source: "absurd", target: "epoche", label: "Compels the suspension of", intensity: 3 },
  { source: "sunyata", target: "detachment", label: "Experiential root of", intensity: 4 },
  { source: "aporia", target: "nihil", label: "Dismantles dogma into", intensity: 3 }
];

export const corpusTexts: CorpusText[] = [
  {
    id: "cioran-1",
    author: "Emile Cioran",
    title: "The Trouble with Being Born",
    period: "1973",
    fragment: "Only one thing matters: learning to be the loser. To breathe in silence, to accept the absolute defeat of every conviction. We do not run toward death; we flee the catastrophe of birth, a blunder that we spend our lives trying to undo.",
    tags: ["Birth", "Nihilism", "Defeat", "Silence"]
  },
  {
    id: "eckhart-1",
    author: "Meister Eckhart",
    title: "Sermon on Poverty",
    period: "1310",
    fragment: "I pray to God that He may quit me of God, for His unassociated being is above all being and above all distinctions. It is in the uncreated abyss of the divine nothingness that the soul finds its absolute stillness.",
    tags: ["Gelassenheit", "Godhead", "Nothingness", "Mysticism"]
  },
  {
    id: "nishitani-1",
    author: "Keiji Nishitani",
    title: "Religion and Nothingness",
    period: "1961",
    fragment: "The self is only truly itself when it reaches the field of Śūnyatā, where all things are seen as empty and yet fully present in their absolute uniqueness. This emptiness is not the nihilism of despair, but the horizon of absolute freedom.",
    tags: ["Sunyata", "Self", "Emptiness", "Kyoto School"]
  },
  {
    id: "camus-1",
    author: "Albert Camus",
    title: "The Myth of Sisyphus",
    period: "1942",
    fragment: "There is but one truly serious philosophical problem, and that is suicide. Judging whether life is or is not worth living amounts to answering the fundamental question of philosophy. Sisyphus teaches us that the struggle itself is enough to fill a human heart.",
    tags: ["Absurd", "Revolt", "Suicide", "Sisyphus"]
  },
  {
    id: "schopenhauer-1",
    author: "Arthur Schopenhauer",
    title: "The World as Will and Representation",
    period: "1819",
    fragment: "What remains after the total abolition of the Will is, for all those who are still full of Will, assuredly nothing. But, conversely, to those in whom the Will has turned and denied itself, this world of ours, which is so very real, is with all its suns and galaxies—nothing.",
    tags: ["Will", "Representation", "Nothingness", "Denial"]
  },
  {
    id: "nagajuna-1",
    author: "Nagarjuna",
    title: "Mulamadhyamakakarika",
    period: "150 CE",
    fragment: "Whatever arises dependently is explained as empty. That is dependency-characterization; that is the middle path. There is no phenomenon that is not dependently arisen; therefore, there is no phenomenon that is not empty.",
    tags: ["Sunyata", "Dependence", "Middle Way", "Nagarjuna"]
  }
];
