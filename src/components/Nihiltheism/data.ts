import { NoteDocument, VaultFile, GraphStarNode, TagItem } from './types';

export const INITIAL_NOTES: Record<string, NoteDocument> = {
  nihiltheism: {
    id: 'nihiltheism',
    title: 'Nihiltheism',
    subtitle: 'The sacredness of non-existence.',
    folder: '20 – Philosophy',
    path: 'Philosophy / Nihiltheism',
    quote: '“Not the worship of nothing,\nbut the freedom within it.”',
    introParagraph: 'Nihiltheism is the recognition that existence holds no intrinsic meaning, and in that absence, a form of sacred freedom emerges. It is not despair, but clarity — a devotion to the void as the truest reality.',
    corePrinciples: [
      {
        number: 1,
        title: 'No inherent meaning',
        description: 'Existence is not designed, and meaning is a human projection.'
      },
      {
        number: 2,
        title: 'Sacred absence',
        description: 'The void is not empty of value, but free from false structure.'
      },
      {
        number: 3,
        title: 'Freedom in negation',
        description: 'To accept meaninglessness is to be free from all imposed meaning.'
      },
      {
        number: 4,
        title: 'Compassion through impermanence',
        description: 'All things fade; therefore, all things are equal.'
      },
      {
        number: 5,
        title: 'Create anyway',
        description: 'Even in a meaningless universe, creation is an act of beauty.'
      }
    ],
    relatedIdeas: [
      '#nihilism',
      '#metaphysics',
      '#existence',
      '#freedom',
      '#aesthetics',
      '#void'
    ],
    closingQuote: 'The universe is not silent. It simply does not care. And that is a kind of peace.',
    backlinksCount: 0,
    wordCount: 247,
    charCount: 1462,
    linkedMentions: [
      {
        id: 'lm-1',
        title: 'Existence',
        snippet: '...in the context of [[Nihiltheism]], existence...',
        targetId: 'existence'
      },
      {
        id: 'lm-2',
        title: 'Absurdity',
        snippet: '...a natural outcome within [[Nihiltheism]]...',
        targetId: 'absurdity'
      },
      {
        id: 'lm-3',
        title: 'The Void',
        snippet: '...as described in [[Nihiltheism]], the void...',
        targetId: 'the-void'
      },
      {
        id: 'lm-4',
        title: 'Freedom',
        snippet: '...true freedom arises from [[Nihiltheism]]...',
        targetId: 'freedom'
      },
      {
        id: 'lm-5',
        title: 'Aesthetic of Emptiness',
        snippet: '...echoes the visual language of [[Nihiltheism]]...',
        targetId: 'aesthetic-of-emptiness'
      }
    ]
  },
  existence: {
    id: 'existence',
    title: 'Existence',
    subtitle: 'The ungrounded horizon of phenomena.',
    folder: '20 – Philosophy',
    path: 'Philosophy / Existence',
    quote: '“Existence precedes essence, but succeeds absence.”',
    introParagraph: 'Existence is the spontaneous emergence of form without prior authorization. Within [[Nihiltheism]], existence is not an error to be cured nor a divine purpose to be realized, but an unprovoked aperture in the abyss.',
    corePrinciples: [
      {
        number: 1,
        title: 'Groundless manifestation',
        description: 'Being arises from nothingness without foundation or architectonic anchor.'
      },
      {
        number: 2,
        title: 'Contingency as liberation',
        description: 'Because being is not necessary, any experience within it is infinitely precious.'
      },
      {
        number: 3,
        title: 'The ontological gap',
        description: 'Between perception and the in-itself lies the tranquil silence of the cosmos.'
      }
    ],
    relatedIdeas: [
      '#existence',
      '#metaphysics',
      '#nihilism',
      '#ontology',
      '#void'
    ],
    closingQuote: 'We do not ask why the stars burn; they burn because silence allowed them room.',
    backlinksCount: 4,
    wordCount: 184,
    charCount: 1102,
    linkedMentions: [
      {
        id: 'lm-ex-1',
        title: 'Nihiltheism',
        snippet: '...recognition that [[Existence]] holds no intrinsic meaning...',
        targetId: 'nihiltheism'
      },
      {
        id: 'lm-ex-2',
        title: 'Consciousness',
        snippet: '...the prism through which [[Existence]] experiences its own silence...',
        targetId: 'consciousness'
      }
    ]
  },
  'aesthetic-of-emptiness': {
    id: 'aesthetic-of-emptiness',
    title: 'Aesthetic of Emptiness',
    subtitle: 'Forms sculpted by omission and silence.',
    folder: '30 – Creation',
    path: 'Creation / Aesthetic of Emptiness',
    quote: '“What is left unpainted contains the whole sky.”',
    introParagraph: 'The aesthetic of emptiness treats negative space not as a deficiency or a vacuum, but as the generative ground of aesthetic delight. Drawing upon Japanese Ma and apophatic mysticism, darkness and spare lineaments reveal the sacred without conceptual violence.',
    corePrinciples: [
      {
        number: 1,
        title: 'Primacy of negative space',
        description: 'The void between strokes dictates the tension and harmony of the composition.'
      },
      {
        number: 2,
        title: 'Apophatic beauty',
        description: 'Describing the sublime by what it withholds, rather than what it displays.'
      },
      {
        number: 3,
        title: 'Monochrome luminance',
        description: 'Deep violet, cosmic indigo, and cold starlight replace gaudy distractions.'
      }
    ],
    relatedIdeas: [
      '#aesthetics',
      '#void',
      '#nihilism',
      '#metaphysics'
    ],
    closingQuote: 'In the stillness of the unsaid, the whole universe resonates.',
    backlinksCount: 3,
    wordCount: 201,
    charCount: 1220,
    linkedMentions: [
      {
        id: 'lm-ae-1',
        title: 'Nihiltheism',
        snippet: '...echoes the visual language of [[Nihiltheism]]...',
        targetId: 'nihiltheism'
      },
      {
        id: 'lm-ae-2',
        title: 'The Void',
        snippet: '...the spatial signature of [[The Void]] manifests as visual grace...',
        targetId: 'the-void'
      }
    ]
  },
  absurdity: {
    id: 'absurdity',
    title: 'Absurdity',
    subtitle: 'The collision between hunger for meaning and silent cosmos.',
    folder: '20 – Philosophy',
    path: 'Philosophy / Absurdity',
    quote: '“The absurd is born of this confrontation between human need and unreasonable silence.”',
    introParagraph: 'Camusian absurdity is recast in [[Nihiltheism]] not as tragic futility, but as a humorous and sacred release valve. When the ego drops its demand for cosmic validation, absurdity transforms into sheer playfulness.',
    corePrinciples: [
      {
        number: 1,
        title: 'Lucid awareness',
        description: 'Refusing both illusory optimism and paralyzing nihilistic despair.'
      },
      {
        number: 2,
        title: 'Rebellion through creation',
        description: 'Continuing to paint, write, and think in full awareness of the cosmic void.'
      }
    ],
    relatedIdeas: ['#absurdity', '#nihilism', '#freedom'],
    closingQuote: 'One must imagine the quiet voyager happy.',
    backlinksCount: 2,
    wordCount: 165,
    charCount: 990,
    linkedMentions: [
      {
        id: 'lm-ab-1',
        title: 'Nihiltheism',
        snippet: '...natural outcome within [[Nihiltheism]]...',
        targetId: 'nihiltheism'
      }
    ]
  },
  'the-void': {
    id: 'the-void',
    title: 'The Void',
    subtitle: 'The luminous womb of unmanifest potential.',
    folder: '20 – Philosophy',
    path: 'Philosophy / The Void',
    quote: '“Empty, yet inexhaustible; dark, yet casting all shadows.”',
    introParagraph: 'The void is not mere physical vacuum or bleak negation. In apophatic ontology, the void is the primordial condition of possibility — prior to space, prior to time, and prior to the split of subject and object.',
    corePrinciples: [
      {
        number: 1,
        title: 'Apophatic clarity',
        description: 'That which cannot be named because it holds every name within its silence.'
      },
      {
        number: 2,
        title: 'Gravitational center',
        description: 'All thoughts, structures, and systems gently collapse back into this quiet expanse.'
      }
    ],
    relatedIdeas: ['#void', '#metaphysics', '#nihilism', '#cosmos'],
    closingQuote: 'All nodes return to the void.',
    backlinksCount: 6,
    wordCount: 190,
    charCount: 1140,
    linkedMentions: [
      {
        id: 'lm-vd-1',
        title: 'Nihiltheism',
        snippet: '...devotion to [[The Void]] as the truest reality...',
        targetId: 'nihiltheism'
      }
    ]
  },
  freedom: {
    id: 'freedom',
    title: 'Freedom',
    subtitle: 'The autonomy born of total release.',
    folder: '20 – Philosophy',
    path: 'Philosophy / Freedom',
    quote: '“Unburdened by destiny, every step is self-authored.”',
    introParagraph: 'If the cosmos had a pre-ordained script, humanity would merely be puppets reciting assigned lines. The absence of intrinsic purpose is the only prerequisite for radical, ethical, and artistic freedom.',
    corePrinciples: [
      {
        number: 1,
        title: 'No cosmic script',
        description: 'You owe the universe nothing; therefore, kindness is a pure, uncoerced choice.'
      },
      {
        number: 2,
        title: 'Radical responsibility',
        description: 'In the absence of gods, we hold one another tenderly across the dark.'
      }
    ],
    relatedIdeas: ['#freedom', '#nihilism', '#philosophy'],
    closingQuote: 'We are free because nothing watches, and nothing condemns.',
    backlinksCount: 3,
    wordCount: 172,
    charCount: 1040,
    linkedMentions: [
      {
        id: 'lm-fr-1',
        title: 'Nihiltheism',
        snippet: '...true freedom arises from [[Nihiltheism]]...',
        targetId: 'nihiltheism'
      }
    ]
  },
  consciousness: {
    id: 'consciousness',
    title: 'Consciousness',
    subtitle: 'The void reflecting upon its own fathomless depth.',
    folder: '20 – Philosophy',
    path: 'Philosophy / Consciousness',
    quote: '“We are a way for the void to witness itself.”',
    introParagraph: 'Consciousness is not an intruder into the cosmos, but the universe waking up in miniature. In consciousness, nothingness experiences the sensation of touch, thought, and contemplation.',
    corePrinciples: [
      {
        number: 1,
        title: 'The luminous spectator',
        description: 'The witness that remains even as thoughts and forms disperse.'
      }
    ],
    relatedIdeas: ['#consciousness', '#metaphysics', '#self'],
    closingQuote: 'Look into the dark long enough, and the dark blinks with gentle recognition.',
    backlinksCount: 4,
    wordCount: 155,
    charCount: 940,
    linkedMentions: [
      {
        id: 'lm-co-1',
        title: 'Nihiltheism',
        snippet: '...witnessing the void without conceptual fear...',
        targetId: 'nihiltheism'
      }
    ]
  },
  meaning: {
    id: 'meaning',
    title: 'Meaning',
    subtitle: 'A poetic invention in an uncaring expanse.',
    folder: '20 – Philosophy',
    path: 'Philosophy / Meaning',
    quote: '“Meaning is not found; it is sung into the storm.”',
    introParagraph: 'To seek pre-existing meaning is like searching for words in raw stone. Meaning is crafted, provisional, fragile, and therefore infinitely sacred in its brevity.',
    corePrinciples: [
      {
        number: 1,
        title: 'Fabricated sanctity',
        description: 'Because meaning is our invention, it belongs wholly to the moments we share.'
      }
    ],
    relatedIdeas: ['#meaning', '#philosophy', '#aesthetics'],
    closingQuote: 'A single candle does not defeat the dark, but it illuminates the faces beside you.',
    backlinksCount: 3,
    wordCount: 160,
    charCount: 980,
    linkedMentions: [
      {
        id: 'lm-me-1',
        title: 'Nihiltheism',
        snippet: '...meaning is a human projection and an artform...',
        targetId: 'nihiltheism'
      }
    ]
  }
};

export const INITIAL_VAULT: VaultFile[] = [
  {
    id: 'v-00',
    name: '00 – Meta',
    type: 'folder',
    children: [
      { id: 'v-00-1', name: 'Methodology & Axioms', type: 'file', noteId: 'nihiltheism' },
      { id: 'v-00-2', name: 'Abyssal Ontology Map', type: 'file', toolView: 'graph' },
      { id: 'v-00-3', name: 'System Invariants', type: 'file', toolView: 'digest' }
    ]
  },
  {
    id: 'v-10',
    name: '10 – Self',
    type: 'folder',
    children: [
      { id: 'v-10-1', name: 'Phenomenology of I', type: 'file', noteId: 'consciousness' },
      { id: 'v-10-2', name: 'Dissolution Notes', type: 'file', noteId: 'nihiltheism' }
    ]
  },
  {
    id: 'v-20',
    name: '20 – Philosophy',
    type: 'folder',
    children: [
      { id: 'v-20-nihiltheism', name: 'Nihiltheism', type: 'file', noteId: 'nihiltheism' },
      { id: 'v-20-existence', name: 'Existence', type: 'file', noteId: 'existence' },
      { id: 'v-20-consciousness', name: 'Consciousness', type: 'file', noteId: 'consciousness' },
      { id: 'v-20-absurdity', name: 'Absurdity', type: 'file', noteId: 'absurdity' },
      { id: 'v-20-meaning', name: 'Meaning', type: 'file', noteId: 'meaning' }
    ]
  },
  {
    id: 'v-30',
    name: '30 – Creation',
    type: 'folder',
    children: [
      { id: 'v-30-aesthetic', name: 'Aesthetic of Emptiness', type: 'file', noteId: 'aesthetic-of-emptiness' },
      { id: 'v-30-canvas', name: 'Spatial Canvas Board', type: 'file', toolView: 'canvas' },
      { id: 'v-30-poetry', name: 'Apophatic Poetics', type: 'file', noteId: 'aesthetic-of-emptiness' }
    ]
  },
  {
    id: 'v-40',
    name: '40 – Systems',
    type: 'folder',
    children: [
      { id: 'v-40-dialectic', name: 'Dialectic Curator', type: 'file', toolView: 'chat' },
      { id: 'v-40-aporia', name: 'Aporia Paradox Registry', type: 'file', toolView: 'questions' },
      { id: 'v-40-void', name: 'The Void Engine', type: 'file', noteId: 'the-void' }
    ]
  },
  {
    id: 'v-50',
    name: '50 – References',
    type: 'folder',
    children: [
      { id: 'v-50-academia', name: 'Dissertation Research Pipeline', type: 'file', toolView: 'academic' },
      { id: 'v-50-library', name: 'Corpus Library & Marginalia', type: 'file', toolView: 'library' },
      { id: 'v-50-ingest', name: 'Source Intake Batch Tool', type: 'file', toolView: 'ingest' },
      { id: 'v-50-cioran', name: 'Cioran & Nishitani', type: 'file', noteId: 'nihiltheism' },
      { id: 'v-50-camus', name: 'Camus & Nagarjuna', type: 'file', noteId: 'absurdity' }
    ]
  },
  {
    id: 'v-90',
    name: '90 – Archive',
    type: 'folder',
    children: [
      { id: 'v-90-digest', name: 'Synthesis Digest', type: 'file', toolView: 'digest' },
      { id: 'v-90-settings', name: 'Abyssal Engine Settings', type: 'file', toolView: 'settings' },
      { id: 'v-90-early', name: 'Early Drafts (2024)', type: 'file', noteId: 'nihiltheism' }
    ]
  }
];

export const STAR_GRAPH_NODES: GraphStarNode[] = [
  { id: 'nihiltheism', label: 'Nihiltheism', isCenter: true, color: '#C084FC', description: 'The luminous singularity of sacred absence' },
  { id: 'absurdity', label: 'Absurdity', angle: -Math.PI / 2, distance: 95, color: '#A855F7', description: 'The playfulness born of unanswerable silence' },
  { id: 'meaning', label: 'Meaning', angle: -Math.PI / 6, distance: 105, color: '#C084FC', description: 'Artful human projection across the void' },
  { id: 'freedom', label: 'Freedom', angle: Math.PI / 10, distance: 110, color: '#DDD6FE', description: 'Radical autonomy without cosmic script' },
  { id: 'the-void', label: 'The Void', angle: Math.PI * 0.38, distance: 100, color: '#818CF8', description: 'The primordial origin and eternal return' },
  { id: 'aesthetics', label: 'Aesthetics', angle: Math.PI * 0.65, distance: 98, color: '#A78BFA', description: 'Beauty sculpted by omission and silence' },
  { id: 'consciousness', label: 'Consciousness', angle: Math.PI * 0.95, distance: 112, color: '#C4B5FD', description: 'The void reflecting upon its own mystery' },
  { id: 'existence', label: 'Existence', angle: -Math.PI * 0.75, distance: 102, color: '#E9D5FF', description: 'Ungrounded manifestation in space-time' }
];

export const TAG_LIST: TagItem[] = [
  { name: '#nihilism', count: 12 },
  { name: '#philosophy', count: 9 },
  { name: '#existence', count: 8 },
  { name: '#void', count: 6 },
  { name: '#freedom', count: 5 },
  { name: '#aesthetics', count: 4 },
  { name: '#consciousness', count: 4 },
  { name: '#meaning', count: 3 },
  { name: '#self', count: 3 },
  { name: '#cosmos', count: 2 }
];
