export interface OntologicalNode {
  id: string;
  label: string;
  node_class: 'Figure' | 'Tradition' | 'Text' | 'Concept' | 'Phenomenological Structure' | 'REN Stage' | 'Quote Artifact' | 'Source' | 'Objection' | 'Edge Claim';
  tradition: string;
  phenomenological_extraction: string;
  primary_collapse_type: string;
  edges: Array<{ target: string; type: string; description: string }>;
  ux_treatment: string;
  scholarly_anchor: string;
  ren_stage: number; // 1 to 6
  source_status: 'Verified' | 'Interpretive' | 'Weak' | 'AI Hypothesis' | 'Rejected' | 'Needs Source';
  confidence: number; // 0 to 1
  affect?: string;
  interpretation?: string;
  residue?: string;
}

export interface OntologicalEdge {
  id: string;
  source: string;
  target: string;
  type: 'WITNESSES' | 'DEVELOPS' | 'CONTRASTS_WITH' | 'PRESSURE_TESTS' | 'ANTICIPATES' | 'INTERPRETS_AS' | 'DISSOLVES' | 'MAPS_TO_REN_STAGE' | 'HAS_AFFECT' | 'HAS_RESIDUE';
  claim: string;
  confidence: number;
  status: 'Verified' | 'Interpretive' | 'Weak' | 'AI Hypothesis' | 'Rejected' | 'Needs Source';
  evidence_quote?: string;
}

export interface ObjectionNode {
  id: string;
  name: string;
  target_claim: string;
  severity: 'High' | 'Medium' | 'Low';
  response: string;
  status: 'Unresolved' | 'Addressed' | 'Mitigated';
}

export const NIHILTHEISM_STEPS = [
  { stage: 1, name: "Immersion", definition: "Unconscious presence; absorption in social structures, ordinary rituals, and language." },
  { stage: 2, name: "Disturbance", definition: "First fractures of the given; onset of anxiety (Heideggerian/Kierkegaardian) disclosing contingency." },
  { stage: 3, name: "Support-Collapse", definition: "Active breakdown of the thematic/ultimate placeholders; dissolution of grounding assumptions." },
  { stage: 4, name: "Abyssal Affect", definition: "The lived experience of pure abandoned desolation (Dark Night of the Soul, tragedy, severe pessimism)." },
  { stage: 5, name: "Interpretation", definition: "Active conceptualization of the collapse; apophatic unsaying, emptiness (Śūnyatā), or active nihilism." },
  { stage: 6, name: "Residue", definition: "The persistent unresolved remainder; lingering trace of meaninglessness or permanent silent aporia." }
];

export const ontologyNodes: OntologicalNode[] = [
  {
    id: "nihilism",
    label: "Nihilism",
    node_class: "Concept",
    tradition: "Modern Philosophy",
    phenomenological_extraction: "Baselessness of value, meaning, knowledge, or communicability",
    primary_collapse_type: "Objective meaning / value collapse",
    edges: [
      { target: "doctrinal_nihilism", type: "defines", description: "Defines the intellectual stance of conceptual meaninglessness" },
      { target: "phenomenological_nihilism", type: "contrasts_with", description: "Distinguishes intellectual theories from pre-doctrinal lived collapse" }
    ],
    ux_treatment: "Root concept node with warning: 'Do not equate all negation with nihilism.' Highlight in dark cosmic gray.",
    scholarly_anchor: "IEP defines nihilism around baseless values and radical skepticism; Britannica links it to denial of moral truths and ultimate meaninglessness.",
    ren_stage: 3,
    source_status: "Verified",
    confidence: 0.95
  },
  {
    id: "phenomenological_nihilism",
    label: "Phenomenological Nihilism",
    node_class: "Concept",
    tradition: "Phenomenology",
    phenomenological_extraction: "Lived pre-reflective withdrawal of meaning and world structure before doctrinal formulation",
    primary_collapse_type: "Meaning-world collapse",
    edges: [
      { target: "nihilism", type: "CONTRASTS_WITH", description: "Differs from structured doctrinal nihilism" }
    ],
    ux_treatment: "Central hub node; every relation must specify exact collapse type. Large glowing emerald border.",
    scholarly_anchor: "Grounded by existentialism's focus on the lived human condition, anxiety, absurdity, alienation, and meaning-contingency.",
    ren_stage: 2,
    source_status: "Verified",
    confidence: 0.9
  },
  {
    id: "ecclesiastes",
    label: "Ecclesiastes",
    node_class: "Text",
    tradition: "Hebrew Wisdom Literature",
    phenomenological_extraction: "Vanity (hebel), vapor, absolute futility of worldly labor, cyclical repetition, mortality, the uncontainable wind",
    primary_collapse_type: "Worldly striving collapse",
    edges: [
      { target: "vanity", type: "WITNESSES", description: "Witnesses the futility of human effort under the sun" },
      { target: "thomas_kempis", type: "ANTICIPATES", description: "Inpsires Christian contemplative indifference to worldly honor" },
      { target: "cioran", type: "ANTICIPATES", description: "Echoes modern aphoristic futility" }
    ],
    ux_treatment: "Ancient wisdom text node; distinct serif-styled card for pessimistic comparison.",
    scholarly_anchor: "Ecclesiastes commentary on the concept of 'Hebel' (vapor/vanity); paired with Thomas à Kempis for ascetic/devotional world-critique.",
    ren_stage: 3,
    source_status: "Verified",
    confidence: 0.95
  },
  {
    id: "job",
    label: "Job",
    node_class: "Text",
    tradition: "Hebrew Wisdom Literature",
    phenomenological_extraction: "Suffering and devastation without transparent moral or rational justification",
    primary_collapse_type: "Theodicy / moral intelligibility collapse",
    edges: [
      { target: "suffering_without_justification", type: "WITNESSES", description: "Exhibits pure suffering outside rational theodicy" },
      { target: "theodicy", type: "PRESSURE_TESTS", description: "Shatters simplistic retributive moral accounting" }
    ],
    ux_treatment: "Problem-of-evil panel with 'anti-theodicy' tag. Text highlighted in deep rust-pessimism orange.",
    scholarly_anchor: "SEP frames theodicy as attempts to uphold divine justice; Job-related critiques expose the failure of neat moral order.",
    ren_stage: 4,
    source_status: "Verified",
    confidence: 1.0
  },
  {
    id: "greek_tragedy",
    label: "Greek Tragedy",
    node_class: "Tradition",
    tradition: "Greek Antiquity",
    phenomenological_extraction: "Pity, terror, unmovable fate, fragile agency, inevitable failure of rational heroism",
    primary_collapse_type: "Agency / fate collapse",
    edges: [
      { target: "tragic_exposure", type: "WITNESSES", description: "Dramatizes human vulnerability before blind fate" },
      { target: "nietzsche", type: "DEVELOPS", description: "Laid foundation for Nietzsche's Birth of Tragedy" },
      { target: "schopenhauer", type: "DEVELOPS", description: "Used by Schopenhauer as raw evidence of life's cruelty" }
    ],
    ux_treatment: "Tragedy cluster; acts as a visual bridge from ancient Greek theatre to modern existential absurdity.",
    scholarly_anchor: "Aristotle's Poetics defines tragedy through pity (eleos) and fear (phobos); contemporary existentialist aesthetic theory builds on tragic disclosure.",
    ren_stage: 4,
    source_status: "Verified",
    confidence: 0.95
  },
  {
    id: "heraclitus",
    label: "Heraclitus",
    node_class: "Figure",
    tradition: "Pre-Socratic Philosophy",
    phenomenological_extraction: "Absolute flux, instability, change, and conflict as the fundamental law of the cosmos",
    primary_collapse_type: "Permanence collapse",
    edges: [
      { target: "impermanence", type: "ANTICIPATES", description: "Prefigures radical change" },
      { target: "buddhist_anicca", type: "CONTRASTS_WITH", description: "Compares with Buddhist anicca without identical spiritual solution" }
    ],
    ux_treatment: "Ancient flux node. Subtle fire/ember visual treatment.",
    scholarly_anchor: "Pre-Socratic fragments on flux (panta rhei) and war as the father of all things; secondary comparator to limit anachronism.",
    ren_stage: 2,
    source_status: "Verified",
    confidence: 0.8
  },
  {
    id: "stoicism",
    label: "Stoicism",
    node_class: "Tradition",
    tradition: "Hellenistic Philosophy",
    phenomenological_extraction: "Finitude training, death discipline, radical cognitive control over emotional distress",
    primary_collapse_type: "Death-anxiety regulation",
    edges: [
      { target: "mortality", type: "ANTICIPATES", description: "Disciplines the self to meet mortality calmly" },
      { target: "nihilistic_despair", type: "CONTRASTS_WITH", description: "Counters despair via voluntary submission to cosmic reason" }
    ],
    ux_treatment: "'Response tradition' node. Double-bordered gray frame representing cognitive defense structures.",
    scholarly_anchor: "SEP Stoicism entry; details the logical therapy of Seneca, Epictetus, and Marcus Aurelius.",
    ren_stage: 5,
    source_status: "Verified",
    confidence: 0.95
  },
  {
    id: "seneca",
    label: "Seneca",
    node_class: "Figure",
    tradition: "Stoicism",
    phenomenological_extraction: "Daily rehearsal of death (meletē thanatou), coping with exile and biological decay",
    primary_collapse_type: "Mortality / adversity collapse",
    edges: [
      { target: "stoicism", type: "DEVELOPS", description: "Major roman figure representing Stoicism" },
      { target: "fate", type: "WITNESSES", description: "Preach resilience before unpredictable political execution" }
    ],
    ux_treatment: "Stoic witness node with marble texture accent in pop-up.",
    scholarly_anchor: "Seneca's Moral Letters to Lucilius on death preparation and time management.",
    ren_stage: 5,
    source_status: "Verified",
    confidence: 0.9
  },
  {
    id: "epictetus",
    label: "Epictetus",
    node_class: "Figure",
    tradition: "Stoicism",
    phenomenological_extraction: "Demarcation of control (prohairesis); the self as a free pocket of assent within an unyielding universe",
    primary_collapse_type: "Agency collapse disciplined by assent",
    edges: [
      { target: "stoicism", type: "DEVELOPS", description: "Grounds stoic ethics in the distinction of what is and is not up to us" }
    ],
    ux_treatment: "Stoic countermeasure node with strict geometric border.",
    scholarly_anchor: "Epictetus' Handbook (Enchiridion) and Discourses; focus on inner freedom.",
    ren_stage: 5,
    source_status: "Verified",
    confidence: 0.9
  },
  {
    id: "marcus_aurelius",
    label: "Marcus Aurelius",
    node_class: "Figure",
    tradition: "Stoicism",
    phenomenological_extraction: "Radical temporal transience; human history as empty noise, the cosmic view dissolving personal pride",
    primary_collapse_type: "Mortality / cosmic insignificance",
    edges: [
      { target: "death_reflection", type: "WITNESSES", description: "Strips human fame of historical importance" },
      { target: "stoicism", type: "DEVELOPS", description: "Brings imperial Stoic reflections on cosmic scales" }
    ],
    ux_treatment: "Imperial Stoic card, displaying self-regulatory inner texts. Shaded in cold iron color.",
    scholarly_anchor: "Meditations of Marcus Aurelius; reflections on time, change, fame, death, and Epicurean parallels.",
    ren_stage: 3,
    source_status: "Verified",
    confidence: 0.95
  },
  {
    id: "epicurus",
    label: "Epicurus",
    node_class: "Figure",
    tradition: "Epicureanism",
    phenomenological_extraction: "Therapeutic materialist dissolution of post-mortem fear; death as state of non-existence",
    primary_collapse_type: "Death-anxiety",
    edges: [
      { target: "fear_of_death", type: "WITNESSES", description: "Displaces death anxiety using atomistic physics" },
      { target: "heidegger", type: "CONTRASTS_WITH", description: "Rejects death as ontological concern (death is nothing to us)" }
    ],
    ux_treatment: "Counter-nihilism node focusing on tranquility (ataraxia) and absence of pain (aponia).",
    scholarly_anchor: "SEP Epicurus entry; highlights his argument that 'death is nothing to us' and causes baseless mental torment.",
    ren_stage: 5,
    source_status: "Verified",
    confidence: 0.9
  },
  {
    id: "lucretius",
    label: "Lucretius",
    node_class: "Figure",
    tradition: "Epicureanism",
    phenomenological_extraction: "Symmetry argument between pre-natal and post-mortem infinite voids",
    primary_collapse_type: "Death-anxiety",
    edges: [
      { target: "epicurus", type: "DEVELOPS", description: "Elaborates Epicurean physics in De Rerum Natura" },
      { target: "becker", type: "CONTRASTS_WITH", description: "Anticipates Becker's terror of death but offers mechanical comfort" }
    ],
    ux_treatment: "Materialist therapeutic node with vacuum-seal visual motif.",
    scholarly_anchor: "De Rerum Natura (On the Nature of Things); Lucretian symmetry argument for death's harmlessness.",
    ren_stage: 5,
    source_status: "Verified",
    confidence: 0.95
  },
  {
    id: "buddhism",
    label: "Buddhism",
    node_class: "Tradition",
    tradition: "Eastern Philosophy",
    phenomenological_extraction: "Dukkha (unsatisfactoriness), Anicca (impermanence), and Anattā (non-self) leading to release from reified identity",
    primary_collapse_type: "Self / permanence collapse",
    edges: [
      { target: "non_self", type: "WITNESSES", description: "Establishes lack of permanent egoic center" },
      { target: "impermanence", type: "WITNESSES", description: "Deconstructs unchanging substances in physical/mental world" },
      { target: "nihilistic_annihilation", type: "CONTRASTS_WITH", description: "Explicitly rejects ucchedavada (annihilationism / simple nihilism)" }
    ],
    ux_treatment: "Major golden-yellow tradition hub with subnodes for anattā, dukkha, and śūnyatā.",
    scholarly_anchor: "Grounded in foundational Buddhist doctrine (Pali Canon) addressing the three marks of existence and dependent co-arising.",
    ren_stage: 5,
    source_status: "Verified",
    confidence: 1.0
  },
  {
    id: "non_self",
    label: "Anattā / Non-Self",
    node_class: "Concept",
    tradition: "Buddhism",
    phenomenological_extraction: "The total absence of any permanent, unchanging soul, essence, or egoic center within physical or mental processes",
    primary_collapse_type: "Selfhood collapse",
    edges: [
      { target: "buddhism", type: "DEVELOPS", description: "Core concept of early and Mahāyāna Buddhism" },
      { target: "kierkegaard", type: "CONTRASTS_WITH", description: "Rejects Kierkegaard's self-constituting relationship" },
      { target: "meister_eckhart", type: "WITNESSES", description: "Compares with Eckhart's mystical self-emptying (Entwerdung)" }
    ],
    ux_treatment: "Core concept card; highly central in comparative analysis. Monospaced aggregate listing.",
    scholarly_anchor: "Buddhist psychological analysis of the five aggregates (skandhas) exhibiting no permanent owner.",
    ren_stage: 3,
    source_status: "Verified",
    confidence: 0.95
  },
  {
    id: "nagarjuna",
    label: "Nāgārjuna",
    node_class: "Figure",
    tradition: "Madhyamaka Buddhism",
    phenomenological_extraction: "Emptiness (śūnyatā) of all intrinsic nature; all concepts are dependently arisen and lack independent reality",
    primary_collapse_type: "Ontological substantiality collapse",
    edges: [
      { target: "emptiness", type: "DEVELOPS", description: "Systematizes Mahāyāna emptiness as Middle Way" },
      { target: "reification", type: "PRESSURE_TESTS", description: "Dissolves dogmatic building blocks of existence" }
    ],
    ux_treatment: "Ultra-high centrality anti-reification node. Golden-hued glow with strict diagonal framing.",
    scholarly_anchor: "Mūlamadhyamakakārikā (Fundamental Verses on the Middle Way); deconstructs cause, motion, self, and elements.",
    ren_stage: 5,
    source_status: "Verified",
    confidence: 1.0
  },
  {
    id: "madhyamaka",
    label: "Madhyamaka",
    node_class: "Tradition",
    tradition: "Mahāyāna Buddhism",
    phenomenological_extraction: "The 'Middle Way' between eternalism (existence of essence) and annihilationism (sheer non-existence / standard nihilism)",
    primary_collapse_type: "Essence collapse",
    edges: [
      { target: "nagarjuna", type: "DEVELOPS", description: "The central school founded on Nāgārjuna's treatises" },
      { target: "nihilistic_annihilation", type: "CONTRASTS_WITH", description: "Defends Middle Way against charge of destructive nihilism" }
    ],
    ux_treatment: "Eastern Buddhist tradition subgraph. Linked deeply to Nagarjuna.",
    scholarly_anchor: "SEP Madhyamaka; reviews the doctrine of two truths (conventional and ultimate) as empty of svabhāva (inherent essence).",
    ren_stage: 5,
    source_status: "Verified",
    confidence: 0.95
  },
  {
    id: "huayan_buddhism",
    label: "Huayan Buddhism",
    node_class: "Tradition",
    tradition: "Chinese Buddhism",
    phenomenological_extraction: "Emptiness translated into absolute mutual interpenetration of all phenomena; Indra's Net where every node reflects all others",
    primary_collapse_type: "Separate-being collapse",
    edges: [
      { target: "interdependence", type: "DEVELOPS", description: "Interprets emptiness as affirmative absolute interdependence" },
      { target: "zapffe", type: "CONTRASTS_WITH", description: "Contrasts a cheerful cosmic codependence with Zapffe's tragic isolate view" }
    ],
    ux_treatment: "Luminous, highly interconnected node. Uses intricate web visual layout.",
    scholarly_anchor: "SEP Huayan school; explains Chinese Buddhist interpretation of śūnyatā as infinite interdependence and cosmic harmony.",
    ren_stage: 5,
    source_status: "Verified",
    confidence: 0.9
  },
  {
    id: "dogen",
    label: "Dōgen",
    node_class: "Figure",
    tradition: "Zen Buddhism",
    phenomenological_extraction: "Being-time (Uji); impermanence as ultimate reality; raw practice as enlightenment, not a means to a separate end",
    primary_collapse_type: "Fixed self/time collapse",
    edges: [
      { target: "buddhism", type: "DEVELOPS", description: "Brings Zen/Soto school structure to impermanence" },
      { target: "temporality", type: "WITNESSES", description: "Passages on mountains and waters flowing" }
    ],
    ux_treatment: "Included as conditional Zen witness. Clean cedar wood styled borders.",
    scholarly_anchor: "Shōbōgenzō (Treasury of the True Dharma Eye), specifically 'Uji' and 'Genjōkōan' fascicles on impermanence as the Buddha-nature.",
    ren_stage: 6,
    source_status: "Verified",
    confidence: 0.9
  },
  {
    id: "daoism",
    label: "Daoism / Taoism",
    node_class: "Tradition",
    tradition: "Chinese Philosophy",
    phenomenological_extraction: "Wandering, anti-authoritarian play, critique of artificial language and social norms; alignment with the nameless Dao",
    primary_collapse_type: "Conceptual mastery collapse",
    edges: [
      { target: "ineffability", type: "WITNESSES", description: "Emphasizes the nameless pre-linguistic reality" },
      { target: "western_system_building", type: "CONTRASTS_WITH", description: "Prefers soft fluidity and humor over rigid theoretical grids" }
    ],
    ux_treatment: "Spacious green tradition hub. Emits floating organic dust particles in 3D views.",
    scholarly_anchor: "SEP Daoism; explores the philosophical lineages of Laozi and Zhuangzi resisting state Confucianism.",
    ren_stage: 5,
    source_status: "Verified",
    confidence: 1.0
  },
  {
    id: "laozi",
    label: "Laozi",
    node_class: "Figure",
    tradition: "Daoism",
    phenomenological_extraction: "The Dao that can be named is not the eternal Dao; naming collapse is the entrance to mystery",
    primary_collapse_type: "Naming collapse",
    edges: [
      { target: "ineffability", type: "WITNESSES", description: "Dao as a forced label for ungraspable ultimate presence/absence" },
      { target: "daoism", type: "DEVELOPS", description: "Authoritative classic text of early Daoism" }
    ],
    ux_treatment: "Ineffability anchor node. Paired directly with Christian Pseudo-Dionysius.",
    scholarly_anchor: "Daodejing Chapter 1; Neo-Daoist 'Wang Bi' commentaries establishing Dao as original lack of determinate form (wu).",
    ren_stage: 5,
    source_status: "Verified",
    confidence: 0.95
  },
  {
    id: "zhuangzi",
    label: "Zhuangzi",
    node_class: "Figure",
    tradition: "Daoism",
    phenomenological_extraction: "Perspectival play, celebration of uselessness, laughter at death, mock logic dissolving formal categories",
    primary_collapse_type: "Normativity / perspective collapse",
    edges: [
      { target: "daoism", type: "DEVELOPS", description: "Classical Zhuangzi text on selfhood deconstruction" },
      { target: "analytic_certainty", type: "CONTRASTS_WITH", description: "Mocks the ultimate truth claims of rival schools" }
    ],
    ux_treatment: "'Perspective destabilizer' node. Colorful and unpredictable hovering movement.",
    scholarly_anchor: "Zhuangzi Inner Chapters (specifically 'Discussion on Making All Things Equal'); perspectival fluidity and butterfly dream.",
    ren_stage: 5,
    source_status: "Verified",
    confidence: 1.0
  },
  {
    id: "advaita_vedanta",
    label: "Advaita Vedānta",
    node_class: "Tradition",
    tradition: "Hindu Philosophy",
    phenomenological_extraction: "Maya (cosmic illusion) masking the ultimate nondual identity of Atman (the self) and Brahman (universal ultimate reality)",
    primary_collapse_type: "Empirical individuality collapse",
    edges: [
      { target: "maya", type: "WITNESSES", description: "Identifies empirical plurality as cognitive projection" },
      { target: "nondualism", type: "WITNESSES", description: "Establishes nondual identity of self and universe" }
    ],
    ux_treatment: "Deep orange-red Eastern hub. Paired as a metaphysical comparison with Buddhist emptiness.",
    scholarly_anchor: "SEP Advaita; details radical Upanishadic nondualism where the individual soul is metaphysically identical to the supreme.",
    ren_stage: 5,
    source_status: "Verified",
    confidence: 0.95
  },
  {
    id: "sankara",
    label: "Śaṅkara",
    node_class: "Figure",
    tradition: "Advaita Vedānta",
    phenomenological_extraction: "Deconstruction of the egoic subject to reveal the pure witnessing consciousness (saksin) which is Brahman",
    primary_collapse_type: "Empirical self collapse",
    edges: [
      { target: "advaita_vedanta", type: "DEVELOPS", description: "The premier philosopher and systematizer of classical Advaita" },
      { target: "brahman", type: "DEVELOPS", description: "Establishes Atman as Brahman without remainder" }
    ],
    ux_treatment: "Highly central nondual node. Simple glowing orange geometric card.",
    scholarly_anchor: "Śaṅkara's Brahma Sūtra Bhāṣya and Upadesasahasri; systematic stripping of superimpositions (adhyasa) from consciousness.",
    ren_stage: 5,
    source_status: "Verified",
    confidence: 1.0
  },
  {
    id: "maya",
    label: "Māyā / Avidyā",
    node_class: "Concept",
    tradition: "Advaita Vedānta",
    phenomenological_extraction: "Ignorance or metaphysical illusion that projects an empirical world of multiplicity and suffering",
    primary_collapse_type: "World/self appearance collapse",
    edges: [
      { target: "advaita_vedanta", type: "DEVELOPS", description: "Primary mechanics of world-projection" },
      { target: "non_self", type: "CONTRASTS_WITH", description: "Buddhist anatta denies even the hidden Brahman self behind the veil" }
    ],
    ux_treatment: "Concept node with pop-up: 'Caution: Advaita posits a real Self (Brahman); Buddhism denies it. Avoid easy syncretism.'",
    scholarly_anchor: "IEP Advaita; details the operational machinery of avidyā (ignorance) producing the appearance of the jiva (individual).",
    ren_stage: 3,
    source_status: "Verified",
    confidence: 0.95
  },
  {
    id: "vivekananda",
    label: "Vivekananda",
    node_class: "Figure",
    tradition: "Modern Vedānta",
    phenomenological_extraction: "Dissatisfaction and cosmic homesickness under the sway of maya; modernization of renunciation",
    primary_collapse_type: "Finite identity collapse",
    edges: [
      { target: "advaita_vedanta", type: "DEVELOPS", description: "Brings Advaitic ontology to modern global audiences" },
      { target: "huxley", type: "ANTICIPATES", description: "Prefigures perennialism" }
    ],
    ux_treatment: "Modern bridge node. Uses Victorian-meets-Contemplative typography.",
    scholarly_anchor: "Vivekananda's Jnana Yoga lectures; frames Maya not merely as a theory but as a statement of fact on life's severe limits.",
    ren_stage: 5,
    source_status: "Verified",
    confidence: 0.9
  },
  {
    id: "hinduism",
    label: "Hinduism",
    node_class: "Tradition",
    tradition: "Eastern Philosophy",
    phenomenological_extraction: "Infinite religious-philosophical container for nondual, devotional, and ascetic structures of liberation",
    primary_collapse_type: "Finite-world non-ultimacy",
    edges: [
      { target: "advaita_vedanta", type: "DEVELOPS", description: "Encompasses Advaita as its most influential school" },
      { target: "vedanta", type: "DEVELOPS", description: "Houses school of Upaniṣadic theological research" }
    ],
    ux_treatment: "Broad tradition hub; claims must attach to schools/texts directly rather than this macro-node.",
    scholarly_anchor: "Academic consensus Hinduism; serves strictly as an organizational parent folder to avoid monolithic summaries.",
    ren_stage: 5,
    source_status: "Verified",
    confidence: 0.9
  },
  {
    id: "vedanta",
    label: "Vedānta",
    node_class: "Tradition",
    tradition: "Hindu Philosophy",
    phenomenological_extraction: "Upaniṣadic inquiry into ultimate reality, consciousness, and escape from transmigratory cycles",
    primary_collapse_type: "Empirical ultimate collapse",
    edges: [
      { target: "advaita_vedanta", type: "DEVELOPS", description: "Radically nondual school of Vedanta" },
      { target: "sankara", type: "DEVELOPS", description: "Synthesized by Sankara" }
    ],
    ux_treatment: "Parent tradition node. Sand-brown outline.",
    scholarly_anchor: "Grounded through various Upanishadic commentaries and the Brahma Sutras.",
    ren_stage: 5,
    source_status: "Verified",
    confidence: 0.95
  },
  {
    id: "upanisads",
    label: "Upaniṣads",
    node_class: "Text",
    tradition: "Sanskrit Scriptures",
    phenomenological_extraction: "The inner dialogic journey into the mystery of the self; stripping names and forms (nama-rupa)",
    primary_collapse_type: "Empirical identity collapse",
    edges: [
      { target: "advaita_vedanta", type: "DEVELOPS", description: "Primary philosophical source for Nondual Vedanta" },
      { target: "vedanta", type: "DEVELOPS", description: "Serves as the end or crown (anta) of the Vedas" }
    ],
    ux_treatment: "Scriptural source-tradition node. Monospaced quote tray.",
    scholarly_anchor: "Upaniṣads (Bṛhadāraṇyaka neti-neti passage, Chāndogya tat tvam asi); foundational nondual witnesses.",
    ren_stage: 3,
    source_status: "Verified",
    confidence: 1.0
  },
  {
    id: "pseudo_dionysius",
    label: "Pseudo-Dionysius",
    node_class: "Figure",
    tradition: "Christian Neoplatonism",
    phenomenological_extraction: "Radical negative theology; divine excess blinding human language, necessitating apophatic stripping of all concepts",
    primary_collapse_type: "Language / God-concept collapse",
    edges: [
      { target: "apophatic_theology", type: "DEVELOPS", description: "Establishes apophatic movement in Christian writing" },
      { target: "meister_eckhart", type: "ANTICIPATES", description: "Prefigures Eckhart's godhead beyond the personal creator" }
    ],
    ux_treatment: "High centrality Neoplatonic node. Cold gothic arch display on select.",
    scholarly_anchor: "The Divine Names and Mystical Theology; path of negation (via negativa) rising into divine unknowing.",
    ren_stage: 5,
    source_status: "Verified",
    confidence: 1.0
  },
  {
    id: "apophatic_theology",
    label: "Apophatic Theology",
    node_class: "Tradition",
    tradition: "Christian / Comparative Mysticism",
    phenomenological_extraction: "Negation as the only accurate register of ultimate reality; God is not, God is beyond being",
    primary_collapse_type: "Language collapse",
    edges: [
      { target: "pseudo_dionysius", type: "DEVELOPS", description: "Systematized in the late fifth century" },
      { target: "meister_eckhart", type: "DEVELOPS", description: "Culminates in medieval german speculation" }
    ],
    ux_treatment: "Broad overlay/classification. Connecting Christian mystics to Eastern Daoist paradoxes.",
    scholarly_anchor: "Mystical Theology historical outlines; tracks the dialectic of cataphasis (affirmation) and apophasis (negation).",
    ren_stage: 5,
    source_status: "Verified",
    confidence: 0.95
  },
  {
    id: "meister_eckhart",
    label: "Meister Eckhart",
    node_class: "Figure",
    tradition: "Rhineland Mysticism",
    phenomenological_extraction: "Breakthrough (Durchbruch) to the Godhead beyond God; total detachment (Abgescheidenheit) and poverty of spirit",
    primary_collapse_type: "Possessive self / God-image collapse",
    edges: [
      { target: "detachment", type: "WITNESSES", description: "Advocates stripping the self of private desires, including the desire for God" },
      { target: "cioran", type: "ANTICIPATES", description: "Inspires Cioran's reading of detached decay" },
      { target: "buddhism", type: "ANTICIPATES", description: "Often compared to Zen emptiness by Kyoto School philosophers" }
    ],
    ux_treatment: "High centrality mystical negation node. Glimmering silver border with starry black core.",
    scholarly_anchor: "Sermons on inner detachment; specifically 'Beati pauperes spiritu' (Blessed are the poor in spirit) sermon.",
    ren_stage: 5,
    source_status: "Verified",
    confidence: 1.0
  },
  {
    id: "gregory_of_nyssa",
    label: "Gregory of Nyssa",
    node_class: "Figure",
    tradition: "Patristic Theology",
    phenomenological_extraction: "Infinite spiritual progression (epektasis) into lightless darkness; God as structurally incomprehensible",
    primary_collapse_type: "Conceptual finality collapse",
    edges: [
      { target: "apophatic_theology", type: "DEVELOPS", description: "Precursor patristic witness to apophatic darkness" }
    ],
    ux_treatment: "Early church apophatic node. Cold gray outline.",
    scholarly_anchor: "The Life of Moses; ascent of Mount Sinai into the divine cloud as progress into infinite unknowing.",
    ren_stage: 4,
    source_status: "Verified",
    confidence: 0.9
  },
  {
    id: "cloud_of_unknowing",
    label: "The Cloud of Unknowing",
    node_class: "Text",
    tradition: "Fourteenth-Century English Mysticism",
    phenomenological_extraction: "A dark cloud of forgetting beneath, and a cloud of unknowing above; intentional blindness to details to rest in naked love",
    primary_collapse_type: "Knowledge / language collapse",
    edges: [
      { target: "apophatic_theology", type: "DEVELOPS", description: "Classic text manual of Christian contemplative prayer" }
    ],
    ux_treatment: "Mystical text card with smoke-and-mirror overlay effect.",
    scholarly_anchor: "The Cloud of Unknowing by an anonymous fourteenth-century English monk; outlines apophatic contemplation.",
    ren_stage: 5,
    source_status: "Verified",
    confidence: 0.95
  },
  {
    id: "john_of_the_cross",
    label: "St. John of the Cross",
    node_class: "Figure",
    tradition: "Spanish Mysticism",
    phenomenological_extraction: "The Dark Night of the soul; passive purification of senses and spirit through severe spiritual desolation and felt abandonment",
    primary_collapse_type: "Spiritual consolation collapse",
    edges: [
      { target: "dark_night", type: "WITNESSES", description: "Maps the journey through absolute desolation" },
      { target: "heidegger", type: "ANTICIPATES", description: "Prefigures existential anxiety stripping worldly security" },
      { target: "cioran", type: "ANTICIPATES", description: "Read deeply by Cioran as master of internal void" }
    ],
    ux_treatment: "Core REN witness. Extremely detailed data panel with quote registry. Dark velvet visual styling.",
    scholarly_anchor: "The Dark Night and Ascent of Mount Carmel; details passive trials where God withdraws all spiritual comfort.",
    ren_stage: 4,
    source_status: "Verified",
    confidence: 1.0
  },
  {
    id: "dark_night",
    label: "Dark Night",
    node_class: "Concept",
    tradition: "Spanish Mysticism",
    phenomenological_extraction: "Absolute spiritual deprivation, grief, felt absence of God, and dissolution of religious pride; experienced as passive purgation",
    primary_collapse_type: "Divine-presence collapse",
    edges: [
      { target: "john_of_the_cross", type: "DEVELOPS", description: "Operationalized category of Spanish Carmelite reform" },
      { target: "abyssal_affect", type: "MAPS_TO_REN_STAGE", description: "Serves as the supreme historical witness for REN Stage 4" }
    ],
    ux_treatment: "REN Stage 4 exemplar card. Charcoal-black canvas with white text.",
    scholarly_anchor: "Carmelite theology and Evelyn Underhill's Mysticism; treats dark night as natural psychological transition to union.",
    ren_stage: 4,
    source_status: "Verified",
    confidence: 1.0
  },
  {
    id: "miguel_molinos",
    label: "Miguel de Molinos",
    node_class: "Figure",
    tradition: "Quietism",
    phenomenological_extraction: "The 'internal way' of total passive self-annihilation; silencing thoughts, actions, and will to allow God alone to act",
    primary_collapse_type: "Self-will collapse",
    edges: [
      { target: "quietism", type: "DEVELOPS", description: "Author of The Spiritual Guide, trigger for the Quietist crisis" }
    ],
    ux_treatment: "Controversial quietist node. Highlighted with warning tag: 'Condemned by Rome.'",
    scholarly_anchor: "The Spiritual Guide (1675); details spiritual silence, recollection, and voluntary annihilation of ego.",
    ren_stage: 5,
    source_status: "Verified",
    confidence: 0.95
  },
  {
    id: "quietism",
    label: "Quietism",
    node_class: "Tradition",
    tradition: "Modern Roman Catholic Controversy",
    phenomenological_extraction: "Severe interior passivity; theological claim that the soul must be empty of active deeds, prayers, or care for its own salvation",
    primary_collapse_type: "Active piety collapse",
    edges: [
      { target: "miguel_molinos", type: "DEVELOPS", description: "Centered historically on Molinos' trial" },
      { target: "passivity_risk", type: "objection", description: "Critiqued by church authorities for encouraging moral and spiritual indifference" }
    ],
    ux_treatment: "Controversy node with 'doctrinal dispute' status. Shadowy red indicator.",
    scholarly_anchor: "Historical records of Quietism and papal condemnation Coelestis Pastor (1687) outlining standard theological objections.",
    ren_stage: 5,
    source_status: "Verified",
    confidence: 1.0
  },
  {
    id: "thomas_kempis",
    label: "Thomas à Kempis",
    node_class: "Figure",
    tradition: "Devotio Moderna",
    phenomenological_extraction: "Absolute contempt of the world (contemptus mundi); vanity of temporal honor, earthly knowledge, and social status",
    primary_collapse_type: "Worldly honor collapse",
    edges: [
      { target: "vanity", type: "WITNESSES", description: "Echoes Ecclesiastes vanity claims" },
      { target: "ecclesiastes", type: "DEVELOPS", description: "Translates biblical pessimism into practical monastic life" }
    ],
    ux_treatment: "Ascetic devotional node. Aged parchment border styling.",
    scholarly_anchor: "The Imitation of Christ Book 1; chapters on 'Contempt of the Vanities of the World' and humility.",
    ren_stage: 3,
    source_status: "Verified",
    confidence: 1.0
  },
  {
    id: "teresa_avila",
    label: "Teresa of Ávila",
    node_class: "Figure",
    tradition: "Spanish Mysticism",
    phenomenological_extraction: "Interior prayer trials, severe physical pain and spiritual dry spells as preparation for mystical betrothal",
    primary_collapse_type: "Superficial self / prayer collapse",
    edges: [
      { target: "john_of_the_cross", type: "DEVELOPS", description: "Collaborated with John in Discalced Carmelite reform" }
    ],
    ux_treatment: "Carmelite witness node with interior castle geometric graphic on details scroll.",
    scholarly_anchor: "The Interior Castle; chapters addressing the dry hours and spiritual trials in the Sixth Mansions.",
    ren_stage: 4,
    source_status: "Verified",
    confidence: 0.9
  },
  {
    id: "therese_lisieux",
    label: "Thérèse of Lisieux",
    node_class: "Figure",
    tradition: "French Devotional Carmel",
    phenomenological_extraction: "Intense dry trials, the 'tunnel' of absolute darkness where heaven and immortality seem like a cruel joke to reason",
    primary_collapse_type: "Religious certainty / consolation collapse",
    edges: [
      { target: "dark_night", type: "DEVELOPS", description: "Brings Carmelite passive purification to modern ordinary settings" }
    ],
    ux_treatment: "Spiritual darkness witness. Small glowing violet anchor.",
    scholarly_anchor: "Story of a Soul Chapter 9; detailed letters regarding her final eighteen months living in absolute darkness of faith.",
    ren_stage: 4,
    source_status: "Verified",
    confidence: 0.9
  },
  {
    id: "thomas_merton",
    label: "Thomas Merton",
    node_class: "Figure",
    tradition: "Modern Monasticism",
    phenomenological_extraction: "Silence and active resistance to modern technological noise; finding the true, empty self hidden in God",
    primary_collapse_type: "Modern distraction collapse",
    edges: [
      { target: "contemplation", type: "WITNESSES", description: "Frames modern spiritual sanity through apophatic solitude" },
      { target: "buddhism", type: "ANTICIPATES", description: "Pioneered Christian-Zen dialogue before his sudden death" }
    ],
    ux_treatment: "Modern contemplative bridge node with typewriter font formatting.",
    scholarly_anchor: "New Seeds of Contemplation and Zen and the Birds of Appetite; dialogue on emptiness.",
    ren_stage: 5,
    source_status: "Verified",
    confidence: 0.9
  },
  {
    id: "simone_weil",
    label: "Simone Weil",
    node_class: "Figure",
    tradition: "Modern Mysticism / Political Philosophy",
    phenomenological_extraction: "Decreation (décréation); affliction (malheur) that destroys the social self; attention as pure unselfish wait for absent God",
    primary_collapse_type: "Self / affliction / God-presence collapse",
    edges: [
      { target: "affliction", type: "WITNESSES", description: "Lived physical and mental starvation as alignment with Christ's cross" },
      { target: "job", type: "DEVELOPS", description: "Reads Job as foundational text on raw affliction" },
      { target: "john_of_the_cross", type: "DEVELOPS", description: "Saves Carmelite dark night from purely psychological readings" }
    ],
    ux_treatment: "High-value bridge: severe suffering + absolute apophatic absence. Monospaced red wireframe card.",
    scholarly_anchor: "Gravity and Grace and Waiting for God; essays on decretive attention and the silence of heaven.",
    ren_stage: 4,
    source_status: "Verified",
    confidence: 1.0
  },
  {
    id: "augustine",
    label: "Augustine",
    node_class: "Figure",
    tradition: "Early Christian Philosophy",
    phenomenological_extraction: "The restless heart (inquietum cor); core insufficiency of all finite things when mistaken for ultimate rest",
    primary_collapse_type: "Finite love collapse",
    edges: [
      { target: "restlessness", type: "WITNESSES", description: "Documents internal divided desire" },
      { target: "pascal", type: "ANTICIPATES", description: "Inspires Pascalian diversion diagnosis" },
      { target: "kierkegaard", type: "ANTICIPATES", description: "Shapes Kierkegaard's structure of ontological anxiety" }
    ],
    ux_treatment: "Root of Christian existential inwardness. Deep blue antique layout.",
    scholarly_anchor: "Confessions Book 1 ('our heart is restless until it rests in you') and Book 10 memory reviews.",
    ren_stage: 2,
    source_status: "Verified",
    confidence: 0.95
  },
  {
    id: "pascal",
    label: "Pascal",
    node_class: "Figure",
    tradition: "French Existential Precursor",
    phenomenological_extraction: "Diversion (divertissement); human terror of silent rooms, death, and spatial/cosmic insignificance, masked by constant tracking of toys",
    primary_collapse_type: "Distraction / mortality collapse",
    edges: [
      { target: "diversion", type: "WITNESSES", description: "Frames human activity as desperate flight from the void" },
      { target: "becker", type: "ANTICIPATES", description: "Directly prefigures Becker's theory of heroic culture as terror defense" }
    ],
    ux_treatment: "High-centrality death/diversion node with geometric hourglass vector details.",
    scholarly_anchor: "Pensées (specifically fragments addressing diversion, the wretchedness of man without God, and the silent universe).",
    ren_stage: 3,
    source_status: "Verified",
    confidence: 1.0
  },
  {
    id: "kierkegaard",
    label: "Kierkegaard",
    node_class: "Figure",
    tradition: "Existentialism",
    phenomenological_extraction: "Anxiety (Angest) as the dizziness of freedom; Despair (Sygdommen til Døden) as failure to relate the finite and infinite self under God",
    primary_collapse_type: "Self-relation collapse",
    edges: [
      { target: "despair", type: "WITNESSES", description: "Outlines multi-layered psychology of despair" },
      { target: "anxiety", type: "WITNESSES", description: "Theorizes anxiety as disclosure of ontological potential" }
    ],
    ux_treatment: "Core abyssal philosopher node. Fractured emerald layout with high-frequency static vibration animation.",
    scholarly_anchor: "The Concept of Anxiety (anxiety before possibility) and The Sickness unto Death (despair as misrelation).",
    ren_stage: 4,
    source_status: "Verified",
    confidence: 1.0
  },
  {
    id: "luther",
    label: "Luther",
    node_class: "Figure",
    tradition: "Reformation Theology",
    phenomenological_extraction: "Anfechtung; severe existential trial, crushing terror before the Law, and felt abandonment by God",
    primary_collapse_type: "Moral self-sufficiency collapse",
    edges: [
      { target: "augustine", type: "DEVELOPS", description: "Deeply influenced by Augustinian theology of fallen will" },
      { target: "kierkegaard", type: "ANTICIPATES", description: "Secularized by Kierkegaard into ontological dread" }
    ],
    ux_treatment: "Christian existential precursor node with heavy ink-block aesthetics.",
    scholarly_anchor: "Luther's Lectures on Romans and Genesis; descriptions of the hidden God (Deus absconditus) and trials of despair.",
    ren_stage: 3,
    source_status: "Verified",
    confidence: 0.9
  },
  {
    id: "bunyan",
    label: "Bunyan",
    node_class: "Figure",
    tradition: "Puritanism",
    phenomenological_extraction: "Agonizing internal guilt, conviction of sin, obsessive thoughts, and fear of spiritual loss during long years of isolation",
    primary_collapse_type: "Assurance collapse",
    edges: [
      { target: "sick_soul", type: "WITNESSES", description: "Classic historical case of twice-born psychological distress" }
    ],
    ux_treatment: "Puritan conversion-narrative card. Strictly text-focused design.",
    scholarly_anchor: "Grace Abounding to the Chief of Sinners; autobiographical recording of profound psychological-spiritual torment.",
    ren_stage: 4,
    source_status: "Verified",
    confidence: 0.9
  },
  {
    id: "seraphim_rose",
    label: "Seraphim Rose",
    node_class: "Figure",
    tradition: "Eastern Orthodox Apologetics",
    phenomenological_extraction: "Modern Western secular culture as a total logic of nihilism; stages from liberalism and realism to vitalism and pure destruction",
    primary_collapse_type: "Modern secular meaning collapse",
    edges: [
      { target: "nietzsche", type: "PRESSURE_TESTS", description: "Examines Nietzsche's prediction of nihilism from strict traditionalist angle" }
    ],
    ux_treatment: "Traditionalist Orthodox anti-nihilism node. Dark charcoal icon with golden aura.",
    scholarly_anchor: "Nihilism: The Root of the Revolution of the Modern Age; tracks modern worldview as systematic rebellion.",
    ren_stage: 3,
    source_status: "Verified",
    confidence: 0.85
  },
  {
    id: "cs_lewis",
    label: "C.S. Lewis",
    node_class: "Figure",
    tradition: "Christian Apologetics",
    phenomenological_extraction: "Desire/Longing (Sehnsucht) as evidence of transcendent homeland; grief as raw, mechanical physical sensation of absence",
    primary_collapse_type: "Secular reduction collapse",
    edges: [
      { target: "nihilism", type: "PRESSURE_TESTS", description: "Challenges mechanical materialism as self-defeating" }
    ],
    ux_treatment: "Cognitive counter-witness. Elegant Oxford classical typography overlay.",
    scholarly_anchor: "Surprised by Joy (Sehnsucht definition) and A Grief Observed (experiential devastation of death).",
    ren_stage: 4,
    source_status: "Verified",
    confidence: 0.9
  },
  {
    id: "chesterton",
    label: "Chesterton",
    node_class: "Figure",
    tradition: "Christian Orthodoxy",
    phenomenological_extraction: "Philosophical wonder; default shock that things exist at all, responding to modern gray-pessimism by celebrating primary limits",
    primary_collapse_type: "Modern rationalist flatness collapse",
    edges: [
      { target: "despair", type: "PRESSURE_TESTS", description: "Launches dynamic defense of life's magic" }
    ],
    ux_treatment: "Counter-witness node. Playful and quirky card layout.",
    scholarly_anchor: "Orthodoxy (specifically the chapter 'The Ethics of Elfland' defending wonder).",
    ren_stage: 2,
    source_status: "Verified",
    confidence: 0.9
  },
  {
    id: "aquinas",
    label: "Aquinas",
    node_class: "Figure",
    tradition: "Scholasticism",
    phenomenological_extraction: "Metaphysical structure of being (esse); God as the absolute act of being (actus purus) preventing ultimate void",
    primary_collapse_type: "Groundlessness counterstructure",
    edges: [
      { target: "nihilism", type: "PRESSURE_TESTS", description: "Provides intellectual base resisting physical groundlessness" }
    ],
    ux_treatment: "Metaphysical standard counter-node. Large clean ivory structure block.",
    scholarly_anchor: "Summa Theologiae; proofs of existence (Quinque Viae) and analogy of being.",
    ren_stage: 1,
    source_status: "Verified",
    confidence: 1.0
  },
  {
    id: "nietzsche",
    label: "Nietzsche",
    node_class: "Figure",
    tradition: "Modern Philosophy",
    phenomenological_extraction: "The 'death of God' and consequent devaluation of all supreme values; active vs. passive responses to the void",
    primary_collapse_type: "Value / God-ground collapse",
    edges: [
      { target: "axiological_nihilism", type: "WITNESSES", description: "Maps the collapse of Christian-moral teleology" },
      { target: "dostoevsky", type: "ANTICIPATES", description: "Shares deep clinical diagnostics of modern spiritual crisis" }
    ],
    ux_treatment: "Modern primary nihilism anchor. Cold metallic design with intense crimson fracturing stripes.",
    scholarly_anchor: "The Will to Power (nihilism definition) and The Gay Science Section 125 (The Madman declaring God's death).",
    ren_stage: 3,
    source_status: "Verified",
    confidence: 1.0
  },
  {
    id: "dostoevsky",
    label: "Dostoevsky",
    node_class: "Figure",
    tradition: "Siberian Existential Literature",
    phenomenological_extraction: "The clinical psychology of free rebellion; if there is no God, everything is permissible; the underworld self",
    primary_collapse_type: "Moral order collapse",
    edges: [
      { target: "nihilism", type: "WITNESSES", description: "Dramatizes Russian political and spiritual nihilists" },
      { target: "nietzsche", type: "ANTICIPATES", description: "Influenced Nietzsche's psychology of resentful and criminal minds" }
    ],
    ux_treatment: "Dramaturgical horror node. Shaded under dim lamp-light effect.",
    scholarly_anchor: "The Brothers Karamazov (The Grand Inquisitor, Rebellion chapters) and Notes from Underground.",
    ren_stage: 3,
    source_status: "Verified",
    confidence: 1.0
  },
  {
    id: "russian_nihilism",
    label: "Russian Nihilism",
    node_class: "Tradition",
    tradition: "Nineteenth-Century Political Radicalism",
    phenomenological_extraction: "Political, moral, and historical negation; rejection of church, state, family, and aesthetics in favor of raw scientific utility",
    primary_collapse_type: "Authority collapse",
    edges: [
      { target: "nietzsche", type: "ANTICIPATES", description: "Analyzed by Nietzsche as an early, incomplete vital stage of nihilism" }
    ],
    ux_treatment: "Historical context card; keep distinct from existential and mystical voids. Rendered with black matches icon.",
    scholarly_anchor: "Nihilism historical tracking; Turgenev's Fathers and Sons depicting the classical nihilist Bazarov.",
    ren_stage: 3,
    source_status: "Verified",
    confidence: 0.95
  },
  {
    id: "schopenhauer",
    label: "Schopenhauer",
    node_class: "Figure",
    tradition: "German Pessimism",
    phenomenological_extraction: "The blind, striving, insatiable cosmic Will; perpetual oscillation between painful desire and stagnant boredom",
    primary_collapse_type: "Desire / optimism collapse",
    edges: [
      { target: "suffering", type: "WITNESSES", description: "Posits physical pain and psychological tragedy as natural norm" },
      { target: "buddhism", type: "DEVELOPS", description: "Pioneered first western translation comparisons to Buddhist dukkha" },
      { target: "cioran", type: "ANTICIPATES", description: "Laid bedrock for Cioran's romanticized despair" }
    ],
    ux_treatment: "Pessimism operational hub. Styled with severe, heavy dark-brown woodblock layout.",
    scholarly_anchor: "The World as Will and Representation Volume 1 and 2; chapters on the vanity of existence.",
    ren_stage: 3,
    source_status: "Verified",
    confidence: 1.0
  },
  {
    id: "tolstoy",
    label: "Tolstoy",
    node_class: "Figure",
    tradition: "Existential Literature / Contemplative Crisis",
    phenomenological_extraction: "Sudden, paralyzing arrest of life; the visual encounter with the 'eastern dragon' in the well while clinging to small drops of honey (fame/literary success)",
    primary_collapse_type: "Achievement / reason collapse",
    edges: [
      { target: "sick_soul", type: "WITNESSES", description: "Experiential report of crisis in high success" },
      { target: "william_james", type: "ANTICIPATES", description: "Cited as primary case history in Varieties of Religious Experience" }
    ],
    ux_treatment: "Conversion crisis node with dark golden honey drip visual metaphor.",
    scholarly_anchor: "Leo Tolstoy's A Confession (1882); detailed tracking of his psychological collapse and search for faith.",
    ren_stage: 3,
    source_status: "Verified",
    confidence: 1.0
  },
  {
    id: "william_james",
    label: "William James",
    node_class: "Figure",
    tradition: "Pragmatism / Psychology",
    phenomenological_extraction: "Empirical cataloging of conversion, divided selves, and sick souls; personal struggle with suicidal melancholia",
    primary_collapse_type: "Healthy-mindedness collapse",
    edges: [
      { target: "religious_experience", type: "DEVELOPS", description: "Laid foundation for modern empirical study of mysticism" },
      { target: "tolstoy", type: "DEVELOPS", description: "Analyzes Tolstoy's crisis inside his scientific model" }
    ],
    ux_treatment: "Psychological-phenomenological bridge node. Interactive scale slider graphical accent.",
    scholarly_anchor: "The Varieties of Religious Experience; specifically Lectures IV-VII on the 'Sick Soul' and Lectures VIII on the 'Divided Self'.",
    ren_stage: 2,
    source_status: "Verified",
    confidence: 1.0
  },
  {
    id: "sick_soul",
    label: "Sick Soul",
    node_class: "Concept",
    tradition: "William James Psychology",
    phenomenological_extraction: "The state of consciousness that is absolutely unable to inhabit naive optimism or healthy-minded cheer; must be twice-born",
    primary_collapse_type: "Healthy-minded world collapse",
    edges: [
      { target: "william_james", type: "DEVELOPS", description: "Fundamental category of religious psychology" },
      { target: "cioran", type: "WITNESSES", description: "Extends sick-soul state to permanent intellectual disposition" }
    ],
    ux_treatment: "REN Stage 2/4 transition bridge node. Faint hospital green outline.",
    scholarly_anchor: "Varieties of Religious Experience; analyzed alongside conversion narratives.",
    ren_stage: 2,
    source_status: "Verified",
    confidence: 0.95
  },
  {
    id: "divided_self",
    label: "Divided Self",
    node_class: "Concept",
    tradition: "William James Psychology",
    phenomenological_extraction: "The painful experience of internal division/bifurcation, where the soul feels split between two competing wills or paths",
    primary_collapse_type: "Self-coherence collapse",
    edges: [
      { target: "william_james", type: "DEVELOPS", description: "Category detailing internal conversion forces" },
      { target: "kierkegaard", type: "WITNESSES", description: "Compares with Kierkegaard's 'purity of heart is to will one thing'" }
    ],
    ux_treatment: "Selfhood split visualization card. Split down the center.",
    scholarly_anchor: "Varieties of Religious Experience Lecture VIII; psychology of twice-born salvation.",
    ren_stage: 2,
    source_status: "Verified",
    confidence: 0.9
  },
  {
    id: "heidegger",
    label: "Heidegger",
    node_class: "Figure",
    tradition: "Phenomenology",
    phenomenological_extraction: "Anxiety (Angst) revealing the Nothing (das Nichts); being-toward-death (Sein-zum-Tode); the uncanny slipping away of everyday significance",
    primary_collapse_type: "Everyday significance collapse",
    edges: [
      { target: "nothingness", type: "WITNESSES", description: "Ontological anxiety discloses the nothingness behind ordinary objects" },
      { target: "kierkegaard", type: "DEVELOPS", description: "Secularizes and formalizes Kierkegaardian existential anxiety" },
      { target: "tillich", type: "ANTICIPATES", description: "Pioneered categories for Tillich's theological courage" }
    ],
    ux_treatment: "Highest-priority phenomenology node. Cold steel slate rendering, shifting borders depending on hover.",
    scholarly_anchor: "Being and Time (Division I, Chapter 6 on Anxiety) and Was ist Metaphysik? (What is Metaphysics? addressing the Nothing).",
    ren_stage: 2,
    source_status: "Verified",
    confidence: 1.0
  },
  {
    id: "dasein",
    label: "Dasein",
    node_class: "Concept",
    tradition: "Phenomenology",
    phenomenological_extraction: "Being-in-the-world for whom its own being is an issue; existence structured around possibilities rather than fixed properties",
    primary_collapse_type: "Fixed-substance self collapse",
    edges: [
      { target: "heidegger", type: "DEVELOPS", description: "The central investigative focus of early Heideggerian ontology" }
    ],
    ux_treatment: "Phenomenological category card. Wireframe projection of an empty space.",
    scholarly_anchor: "Being and Time Part I; definition of Dasein as existence (Existenz) rather than simple-presence-at-hand (Vorhandensein).",
    ren_stage: 2,
    source_status: "Verified",
    confidence: 1.0
  },
  {
    id: "anxiety_concept",
    label: "Anxiety",
    node_class: "Concept",
    tradition: "Phenomenology / Existentialism",
    phenomenological_extraction: "Pre-reflective, non-objectual dread where all specific physical objects slip away, leaving Dasein facing its own bare facticity and freedom",
    primary_collapse_type: "Affective abyss",
    edges: [
      { target: "kierkegaard", type: "DEVELOPS", description: "Developed across religious and psychological scales" },
      { target: "heidegger", type: "DEVELOPS", description: "Constructed as fundamental ontological attunement (Befindlichkeit)" }
    ],
    ux_treatment: "Cross-tradition affect node. High frequency vibration borders, radiating outward lines.",
    scholarly_anchor: "Jointly grounded in Kierkegaard's Concept of Anxiety and Heidegger's Being and Time; distinct from specific fear.",
    ren_stage: 2,
    source_status: "Verified",
    confidence: 1.0
  },
  {
    id: "nothingness",
    label: "Nothingness",
    node_class: "Concept",
    tradition: "Comparative Philosophy",
    phenomenological_extraction: "The absolute background of possibility, revealed when active significance or substantial beings withdraw",
    primary_collapse_type: "Ontological collapse",
    edges: [
      { target: "heidegger", type: "DEVELOPS", description: "Investigated as background of being" },
      { target: "apophatic_theology", type: "ANTICIPATES", description: "Secular counterpart to apophatic divine desert" }
    ],
    ux_treatment: "Core concept node with warning: 'Do not reify nothingness into a substance. Maintain absolute negation.' High contrast outline.",
    scholarly_anchor: "SEP Nothingness entry; traces Western ontological negation debates and Heideggerian critique of simple logical negation.",
    ren_stage: 4,
    source_status: "Verified",
    confidence: 1.0
  },
  {
    id: "tillich",
    label: "Tillich",
    node_class: "Figure",
    tradition: "Existential Theology",
    phenomenological_extraction: "Anxiety of nonbeing across three fields: death/finitude, guilt/condemnation, and emptiness/meaninglessness; courage to accept acceptance",
    primary_collapse_type: "Ultimate concern collapse",
    edges: [
      { target: "meaninglessness", type: "WITNESSES", description: "Identifies modern mid-century despair as meaninglessness" },
      { target: "heidegger", type: "DEVELOPS", description: "Brings Heideggerian anxiety into systematic Protestant theology" },
      { target: "becker", type: "ANTICIPATES", description: "Prefigures Becker's hero systems as defense against absolute nonbeing" }
    ],
    ux_treatment: "Theological-existential bridge node. Twin green columns in card details.",
    scholarly_anchor: "The Courage to Be (1652); detailed typologies of ontological, spiritual, and moral anxiety.",
    ren_stage: 5,
    source_status: "Verified",
    confidence: 1.0
  },
  {
    id: "nonbeing",
    label: "Nonbeing",
    node_class: "Concept",
    tradition: "Existential Theology",
    phenomenological_extraction: "The infinite threat to ontic, spiritual, and moral self-affirmation, framing death and meaninglessness",
    primary_collapse_type: "Being-security collapse",
    edges: [
      { target: "tillich", type: "DEVELOPS", description: "Dynamic ontological counterpart to being in Tillich's systematic framework" }
    ],
    ux_treatment: "Ontological-theological concept node. Infinite gradient graphic.",
    scholarly_anchor: "The Courage to Be Chapter 2; the nature of nonbeing and its existential consequences.",
    ren_stage: 3,
    source_status: "Verified",
    confidence: 0.95
  },
  {
    id: "becker",
    label: "Ernest Becker",
    node_class: "Figure",
    tradition: "Synthesized Psychological Anthropology",
    phenomenological_extraction: "Terror of death as the central driving force of human history; culture as a magnificent, shared 'hero-system' or defense illusion",
    primary_collapse_type: "Culture-as-defense collapse",
    edges: [
      { target: "pascal", type: "DEVELOPS", description: "Upgrades Pascalian diversion theory into complete clinical psychology" },
      { target: "tillich", type: "DEVELOPS", description: "Identifies self-affirmation drives with heroic cultural defense" }
    ],
    ux_treatment: "Psychological clinical node. Graph displays cultural defense barriers crumbling.",
    scholarly_anchor: "The Denial of Death (1973) and Escape from Evil; details the vital role of illusion (lie) in biological sanity.",
    ren_stage: 3,
    source_status: "Verified",
    confidence: 1.0
  },
  {
    id: "otto",
    label: "Rudolf Otto",
    node_class: "Figure",
    tradition: "Philosophy of Religion",
    phenomenological_extraction: "The numinous experience: mysterium tremendum et fascinans; the crushing majesty and wild attraction of the absolute other",
    primary_collapse_type: "Sacred comfort collapse",
    edges: [
      { target: "underhill", type: "ANTICIPATES", description: "Provides categories of mystical terror/beauty" }
    ],
    ux_treatment: "Religious-experience conceptual node. Outer glowing white aura.",
    scholarly_anchor: "The Idea of the Holy (1917); outlines elements of awe, majesty, and energy within encounters with the holy.",
    ren_stage: 2,
    source_status: "Verified",
    confidence: 0.9
  },
  {
    id: "underhill",
    label: "Evelyn Underhill",
    node_class: "Figure",
    tradition: "Mysticism / Academic Scrutiny",
    phenomenological_extraction: "Systematization of mystical development into five core stages: awakening, purgation, illumination, dark night, divine union",
    primary_collapse_type: "Ordinary consciousness collapse",
    edges: [
      { target: "john_of_the_cross", type: "DEVELOPS", description: "Normalizes Spanish Carmelite dark night studies for modern psychology" }
    ],
    ux_treatment: "Mystical development map overlay. Five-stage interactive timeline indicator.",
    scholarly_anchor: "Mysticism: A Study in the Nature and Development of Spiritual Consciousness (1911); standard scholarly text.",
    ren_stage: 4,
    source_status: "Verified",
    confidence: 1.0
  },
  {
    id: "huxley",
    label: "Aldous Huxley",
    node_class: "Figure",
    tradition: "Perennial Philosophy",
    phenomenological_extraction: "Universalist spiritual core; chemical and mystical experiences as doors of perception bypassing normal protective brain filters",
    primary_collapse_type: "Ordinary perception collapse",
    edges: [
      { target: "vivekananda", type: "DEVELOPS", description: "Extends modern Hindu universalism to contemporary western drug research" },
      { target: "psychedelic_experience", type: "ANTICIPATES", description: "Pioneered conceptual framework of chemical mysticism" }
    ],
    ux_treatment: "Perennialist bridge node with warning tag: 'Perennialism contested. See Constructivism objection.'",
    scholarly_anchor: "The Perennial Philosophy (1945) and The Doors of Perception (1954); mescaline trials.",
    ren_stage: 5,
    source_status: "Verified",
    confidence: 0.9
  },
  {
    id: "stace_walter",
    label: "Walter Stace",
    node_class: "Figure",
    tradition: "Academic Philosophy of Mysticism",
    phenomenological_extraction: "Phenomenological division of mysticism into 'extrovertive' (physical unity) and 'introvertive' (pure spatial and identity vacuum)",
    primary_collapse_type: "Self-world boundary collapse",
    edges: [
      { target: "hood_scale", type: "ANTICIPATES", description: "Categories used directly to construct the Hood Mysticism Scale" }
    ],
    ux_treatment: "Precursor node mapped to modern psychometric scales.",
    scholarly_anchor: "Mysticism and Philosophy (1960); argues for a common phenomenological core to mystical reportage.",
    ren_stage: 5,
    source_status: "Verified",
    confidence: 0.95
  },
  {
    id: "ralph_hood",
    label: "Ralph Hood",
    node_class: "Figure",
    tradition: "Psychometrics / Psychology",
    phenomenological_extraction: "Scientific measurement of mystical reports; validating dimensions of ego loss, unity, positive affect, and ineffability",
    primary_collapse_type: "Scientific assessment of collapse reports",
    edges: [
      { target: "stace_walter", type: "DEVELOPS", description: "Operationalized Stace's categories into modern Hood M-Scale" }
    ],
    ux_treatment: "Measurement node. Displays dynamic radar charts of current node stats on click.",
    scholarly_anchor: "The Mysticism Scale (1975) and subsequent scientific validation papers across multiple world religions.",
    ren_stage: 5,
    source_status: "Verified",
    confidence: 1.0
  },
  {
    id: "pahnke",
    label: "Walter Pahnke",
    node_class: "Figure",
    tradition: "Clinical Psychedelics Research",
    phenomenological_extraction: "Experimental elicitation of complete mystical experiences in seminary students using psilocybin",
    primary_collapse_type: "Ordinary consciousness collapse",
    edges: [
      { target: "griffiths", type: "ANTICIPATES", description: "Prefigures Griffiths' clinical updates forty years later" },
      { target: "leary_timothy", type: "DEVELOPS", description: "Supervised by Leary under Harvard project" }
    ],
    ux_treatment: "Clinical study node. High contrast hospital/lab layout accent.",
    scholarly_anchor: "The Good Friday Experiment (1962); Harvard University dissertation studying chemical conversion.",
    ren_stage: 5,
    source_status: "Verified",
    confidence: 0.95
  },
  {
    id: "leary_timothy",
    label: "Timothy Leary",
    node_class: "Figure",
    tradition: "Harvard Psilocybin Project",
    phenomenological_extraction: "Consciousness alteration; the complete breaking of ordinary linguistic game coordinates to touch raw reality",
    primary_collapse_type: "Linguistic game collapse",
    edges: [
      { target: "pahnke", type: "DEVELOPS", description: "Academic supervisor supporting Pahnke's chapel trials" }
    ],
    ux_treatment: "Historical context card. Colored with classic psych-fringe borders.",
    scholarly_anchor: "The Psychedelic Experience: A Manual Based on the Tibetan Book of the Dead (1964); early academic stages.",
    ren_stage: 5,
    source_status: "Verified",
    confidence: 0.8
  },
  {
    id: "griffiths_roland",
    label: "Roland Griffiths",
    node_class: "Figure",
    tradition: "Modern Clinical Psychedelics Research",
    phenomenological_extraction: "Rigorous scientific validation that psilocybin can occasion authentic mystical-type experiences of enduring value",
    primary_collapse_type: "Ego/world ordinary-state collapse",
    edges: [
      { target: "pahnke", type: "DEVELOPS", description: "Replicates and hardens the safety and metrics of early psychiatric efforts" }
    ],
    ux_treatment: "Contemporary medicine anchor. Medical emerald-green chart highlights.",
    scholarly_anchor: "Griffiths et al. (2006) 'Psilocybin can occasion mystical-type experiences having substantial personal and spiritual significance'.",
    ren_stage: 5,
    source_status: "Verified",
    confidence: 1.0
  },
  {
    id: "forman_robert",
    label: "Robert Forman",
    node_class: "Figure",
    tradition: "Philosophy of Mysticism",
    phenomenological_extraction: "Pure Consciousness Events (PCEs); mystical states empty of all specific objects, thoughts, and concepts, challenging constructivist models",
    primary_collapse_type: "Content/subject-object collapse",
    edges: [
      { target: "constructivism", type: "PRESSURE_TESTS", description: "Argues PCEs exhibit lack of cultural/doctrinal content, exposing pre-linguistic core" }
    ],
    ux_treatment: "Academic theory selector card. Pure white frame.",
    scholarly_anchor: "The Problem of Pure Consciousness (1990); argues for non-mediated mystical substrates.",
    ren_stage: 5,
    source_status: "Verified",
    confidence: 0.95
  },
  {
    id: "constructivism",
    label: "Constructivism",
    node_class: "Objection",
    tradition: "Academic Philosophy of Religion",
    phenomenological_extraction: "There is no unmediated mystical state; all human experience is radically constructed and shaped by prior language, dogmatics, and culture",
    primary_collapse_type: "Naïve perennialism collapse",
    edges: [
      { target: "huxley", type: "PRESSURE_TESTS", description: "Rejects Huxley's perennial common core as poor scholarship" },
      { target: "mysticism", type: "PRESSURE_TESTS", description: "Argues mystical states are products of training, not discoveries of objective realms" }
    ],
    ux_treatment: "Objection node with custom 'Skeptical critique' layout. Styled in warning yellow border.",
    scholarly_anchor: "Steven Katz (Mysticism and Philosophical Analysis 1978); 'there are no pure, unmediated experiences.'",
    ren_stage: 5,
    source_status: "Verified",
    confidence: 1.0
  },
  {
    id: "mysticism_field",
    label: "Mysticism",
    node_class: "Tradition",
    tradition: "Academic Comparative Religion",
    phenomenological_extraction: "Diverse reports of oneness, ineffability, ultimate truth, and modified boundaries of time and the self",
    primary_collapse_type: "Ordinary experience collapse",
    edges: [
      { target: "underhill", type: "DEVELOPS", description: "Subject of Underhill's developmental cataloging" },
      { target: "stace_walter", type: "DEVELOPS", description: "Subject of Stace's cognitive taxonomy" }
    ],
    ux_treatment: "Global field organization parent. Gray gradient outline.",
    scholarly_anchor: "SEP Mysticism entry; reviews classifications, linguistic limitations, and evidential force of reports.",
    ren_stage: 5,
    source_status: "Verified",
    confidence: 0.95
  },
  {
    id: "psychedelic_experience",
    label: "Psychedelic Experience",
    node_class: "Tradition",
    tradition: "Clinical Psychiatry / Comparative Studies",
    phenomenological_extraction: "Ego-dissolution, spatial-temporal distortion, profound visual beauty, and dread; closely mimicking natural mystical report",
    primary_collapse_type: "Self-world collapse",
    edges: [
      { target: "mysticism_field", type: "WITNESSES", description: "Parallels natural mystical reports under controlled settings" }
    ],
    ux_treatment: "Comparative field card with warning popup: 'Keep distinct from traditional scriptures unless verified by Hood scale.'",
    scholarly_anchor: "Johns Hopkins, Imperial College, and UCLA clinical trials mapping drug-elicited ego loss.",
    ren_stage: 5,
    source_status: "Verified",
    confidence: 0.95
  },
  {
    id: "cioran",
    label: "Emile Cioran",
    node_class: "Figure",
    tradition: "French Pessimism / Literature of Despair",
    phenomenological_extraction: "Aphoristic despair, lucid insomnia, radical refusal of system-building, finding a strange sanctuary in absolute decay",
    primary_collapse_type: "System / consolation collapse",
    edges: [
      { target: "ecclesiastes", type: "DEVELOPS", description: "Brings biblical vanity to ultimate modern literary fatigue" },
      { target: "meister_eckhart", type: "DEVELOPS", description: "Translates medieval detachment into secular exhaustion" },
      { target: "schopenhauer", type: "DEVELOPS", description: "Shares pessimism but abandons structured philosophical frameworks" }
    ],
    ux_treatment: "Primary literary pessimist. Jet-black card with cracked emerald outline and highly unstable movement patterns.",
    scholarly_anchor: "The Trouble with Being Born and A Short History of Decay; aphorisms attacking birth, progress, and sanity.",
    ren_stage: 6,
    source_status: "Verified",
    confidence: 1.0
  },
  {
    id: "zapffe",
    label: "Peter Wessel Zapffe",
    node_class: "Figure",
    tradition: "Schopenhauerian Existential Pessimism",
    phenomenological_extraction: "The tragic mistake of human consciousness over-developing; four mechanisms of defense: isolation, anchoring, distraction, sublimating",
    primary_collapse_type: "Consciousness-as-burden collapse",
    edges: [
      { target: "becker", type: "ANTICIPATES", description: "Directly prefigures Becker's hero systems with his 'anchoring' and 'distraction' mechanisms" },
      { target: "pessimism", type: "DEVELOPS", description: "Uncompromising biological indictment of human survival" }
    ],
    ux_treatment: "Tragic intellectual node. Shaded in cold steel with falling snow visual aesthetic.",
    scholarly_anchor: "The Last Messiah (Den sidste Messias, 1933); details the over-equipped biological species finding its own mind a curse.",
    ren_stage: 3,
    source_status: "Verified",
    confidence: 1.0
  },
  {
    id: "ligotti",
    label: "Thomas Ligotti",
    node_class: "Figure",
    tradition: "Contemporary Horror Philosophy",
    phenomenological_extraction: "The puppet-self; human consciousness as a malignant, useless mutation; the universe as a terrifying, empty machinery of horror",
    primary_collapse_type: "Normality / selfhood collapse",
    edges: [
      { target: "zapffe", type: "DEVELOPS", description: "Brings Zapffe's evolutionary tragic view into clinical horror" }
    ],
    ux_treatment: "Modern cosmic horror asset. Blood-red outline with erratic flickering.",
    scholarly_anchor: "The Conspiracy Against the Human Race: A Short Life of Horror; deconstructs self, progress, and vitality.",
    ren_stage: 4,
    source_status: "Verified",
    confidence: 0.9
  },
  {
    id: "mainlander",
    label: "Philipp Mainländer",
    node_class: "Figure",
    tradition: "German Pessimism",
    phenomenological_extraction: "The death of God as actual historic event; the universe as the decaying corpse of a God who willed non-existence, driving to suicide",
    primary_collapse_type: "Being / value collapse",
    edges: [
      { target: "schopenhauer", type: "DEVELOPS", description: "Translates Schopenhauer's metaphysical Will into a physical will to die" }
    ],
    ux_treatment: "Limit-situation pessimist. Dark indigo visual design.",
    scholarly_anchor: "Die Philosophie der Erlösung (The Philosophy of Redemption, 1876); details cosmic decay and voluntary death of God.",
    ren_stage: 4,
    source_status: "Verified",
    confidence: 0.9
  },
  {
    id: "leopardi",
    label: "Giacomo Leopardi",
    node_class: "Figure",
    tradition: "Italian Literary Pessimism",
    phenomenological_extraction: "Cosmic indifference; nature as a cold stepmother actively destroying her children; human pleasure as mere temporary lack of pain",
    primary_collapse_type: "Nature-as-good collapse",
    edges: [
      { target: "schopenhauer", type: "ANTICIPATES", description: "Prefigures Schopenhauer's philosophical despair within poetry and essays" }
    ],
    ux_treatment: "Classical Italian literary card. Soft charcoal framing.",
    scholarly_anchor: "Canti and Operette Morali; critiques of progressive illusions and cosmic cruelty.",
    ren_stage: 3,
    source_status: "Verified",
    confidence: 0.9
  },
  {
    id: "hartmann_eduard",
    label: "Eduard von Hartmann",
    node_class: "Figure",
    tradition: "German Pessimism",
    phenomenological_extraction: "The unconscious will; the cosmic development as progress toward universal conscious self-destruction",
    primary_collapse_type: "Optimism collapse",
    edges: [
      { target: "schopenhauer", type: "DEVELOPS", description: "Synthesized Hegelian dialectic and Schopenhauerian pessimist will" }
    ],
    ux_treatment: "Pessimist scholastic node. Dull gray.",
    scholarly_anchor: "Philosophie des Unbewussten (Philosophy of the Unconscious, 1869).",
    ren_stage: 3,
    source_status: "Verified",
    confidence: 0.95
  },
  {
    id: "freud",
    label: "Sigmund Freud",
    node_class: "Figure",
    tradition: "Psychoanalysis",
    phenomenological_extraction: "The death drive (Todestrieb); civilization built on the structural repression of biological drives, doomed to permanent discontent",
    primary_collapse_type: "Rational self-mastery collapse",
    edges: [
      { target: "becker", type: "ANTICIPATES", description: "Pioneered clinical depth psychology which Becker reformulates" }
    ],
    ux_treatment: "Depth psychology ancestor card. Striped brown borders.",
    scholarly_anchor: "Beyond the Pleasure Principle (death drive formulation) and Civilization and Its Discontents.",
    ren_stage: 2,
    source_status: "Verified",
    confidence: 1.0
  },
  {
    id: "rank_otto",
    label: "Otto Rank",
    node_class: "Figure",
    tradition: "Psychoanalysis",
    phenomenological_extraction: "Birth trauma; human creativity and heroization as direct, desperate response to primal terror of separation and death",
    primary_collapse_type: "Self-security collapse",
    edges: [
      { target: "becker", type: "DEVELOPS", description: "Deeply reformulates Rankian theories of creative heroization as primary drive" }
    ],
    ux_treatment: "Precursor clinical node. Clean square border.",
    scholarly_anchor: "Art and Artist and The Trauma of Birth; focus on creative defense.",
    ren_stage: 3,
    source_status: "Verified",
    confidence: 0.95
  },
  {
    id: "jung",
    label: "Carl Jung",
    node_class: "Figure",
    tradition: "Analytical Psychology",
    phenomenological_extraction: "The shadow and archetype deconstruction; egoic sovereignty collapse as necessary step toward individuation",
    primary_collapse_type: "Ego sovereignty collapse",
    edges: [
      { target: "mysticism_field", type: "DEVELOPS", description: "Maps mystical reports into archetypal symbols of the deep collective mind" }
    ],
    ux_treatment: "Special psychological node with mandalic background lines on focus.",
    scholarly_anchor: "Psychology and Alchemy and Answer to Job; tracking individual and collective ego fracturing.",
    ren_stage: 2,
    source_status: "Verified",
    confidence: 0.95
  },
  {
    id: "kafka",
    label: "Franz Kafka",
    node_class: "Figure",
    tradition: "Absurdist Existential Literature",
    phenomenological_extraction: "The impenetrable, hostile bureaucracy; human action trapped in arbitrary, infinite corridors under invisible judgment",
    primary_collapse_type: "Social/world intelligibility collapse",
    edges: [
      { target: "alienation_concept", type: "WITNESSES", description: "Supreme dramaturgical witness to estrangement" }
    ],
    ux_treatment: "Literary alienation node. Styled with endless gray brick corridor graphics.",
    scholarly_anchor: "The Trial and The Castle; detailed depictions of absolute, unexplainable administrative dread.",
    ren_stage: 3,
    source_status: "Verified",
    confidence: 1.0
  },
  {
    id: "beckett",
    label: "Samuel Beckett",
    node_class: "Figure",
    tradition: "Theatre of the Absurd",
    phenomenological_extraction: "Absolute exhaustion of language and action; figures waiting forever for something that never arrives, conversing in empty gaps",
    primary_collapse_type: "Narrative/action collapse",
    edges: [
      { target: "absurd_concept", type: "WITNESSES", description: "Stripped existentialism of heroic activism (Camus) in favor of naked passive waiting" }
    ],
    ux_treatment: "Extremely minimalist card. Uses large blank spaces and very small mono lettering. Shaking slowly.",
    scholarly_anchor: "Waiting for Godot and Endgame; studies of absolute exhaustion of plot and agency.",
    ren_stage: 6,
    source_status: "Verified",
    confidence: 1.0
  },
  {
    id: "heisman",
    label: "Mitchell Heisman",
    node_class: "Figure",
    tradition: "Limit-Situation Text",
    phenomenological_extraction: "The claim that rational suicide represents the highest achievement of objective reason, completely breaking biological bias",
    primary_collapse_type: "Reason-as-life-support collapse",
    edges: [
      { target: "rational_suicide", type: "WITNESSES", description: "Extreme intellectual experiment using code-level negation" }
    ],
    ux_treatment: "Safety warning indicator: 'Caution: Extreme limit-situation text. Displaying strictly with philosophical safeguards.' Deep charcoal outline with thin neon red glow.",
    scholarly_anchor: "Suicide Note (1728-page digital draft, 2010); clinical and ontological analysis of active self-annihilation.",
    ren_stage: 4,
    source_status: "Needs Source",
    confidence: 0.7
  },
  {
    id: "borges",
    label: "Jorge Luis Borges",
    node_class: "Figure",
    tradition: "Argentine Philosophical Literature",
    phenomenological_extraction: "The library of Babel; infinity as a terrifying prison; the instability of memory and ego identity",
    primary_collapse_type: "Knowledge/order collapse",
    edges: [
      { target: "epistemic_abyss", type: "WITNESSES", description: "Labyrinthine deconstruction of complete archives" }
    ],
    ux_treatment: "Optional intellectual asset card. Intricate fractal lines.",
    scholarly_anchor: "Fictions (specifically 'The Library of Babel' and 'The Garden of Forking Paths').",
    ren_stage: 3,
    source_status: "Verified",
    confidence: 0.9
  },
  {
    id: "poe_edgar",
    label: "Edgar Allan Poe",
    node_class: "Figure",
    tradition: "Gothic Romanticism",
    phenomenological_extraction: "Obsessive descent into madness, decay, and premature burial; terror of the physical dissolution of boundaries",
    primary_collapse_type: "Psychological stability collapse",
    edges: [
      { target: "horror_concept", type: "WITNESSES", description: "Delineates internal collapse of rationality before morbid obsessions" }
    ],
    ux_treatment: "Gothic aesthetic card, vintage dark accents.",
    scholarly_anchor: "The Fall of the House of Usher and philosophical prose poema Eureka (addressing cosmic expansion and return to blank void).",
    ren_stage: 3,
    source_status: "Verified",
    confidence: 0.8
  },
  {
    id: "montaigne",
    label: "Montaigne",
    node_class: "Figure",
    tradition: "Skepticism",
    phenomenological_extraction: "What do I know? (Que sçay-je?); the complete instability of human opinion, memory, and physical stability",
    primary_collapse_type: "Rational certainty collapse",
    edges: [
      { target: "skepticism", type: "WITNESSES", description: "Pioneered modern self-reflexive doubt" }
    ],
    ux_treatment: "Skeptical classic card. Ancient text styled frame.",
    scholarly_anchor: "Essays (specifically 'Apology for Raymond Sebond' detailing human hubris and limits of reason).",
    ren_stage: 2,
    source_status: "Verified",
    confidence: 0.95
  },
  {
    id: "hume_david",
    label: "David Hume",
    node_class: "Figure",
    tradition: "Empiricism / Skepticism",
    phenomenological_extraction: "Deconstruction of causation and the unified self; physical world as mere habit of association",
    primary_collapse_type: "Epistemic necessity collapse",
    edges: [
      { target: "skepticism", type: "WITNESSES", description: "Radically limited human claims on objective cause" }
    ],
    ux_treatment: "Epistemic limit node. Cold glass texture layout.",
    scholarly_anchor: "A Treatise of Human Nature Book 1; chapters on necessary connection and skepticism with regard to identity.",
    ren_stage: 3,
    source_status: "Verified",
    confidence: 1.0
  },
  {
    id: "clifford_wk",
    label: "W.K. Clifford",
    node_class: "Figure",
    tradition: "Evidentialism",
    phenomenological_extraction: "The claim that believing on insufficient evidence is a severe moral failure, not a benign subjective choice",
    primary_collapse_type: "Unjustified belief collapse",
    edges: [
      { target: "faith_claims", type: "PRESSURE_TESTS", description: "Launches severe moral indictment against optimistic religious leaps" }
    ],
    ux_treatment: "Epistemic QA controller card. Monospaced rule register.",
    scholarly_anchor: "The Ethics of Belief (1877); 'it is wrong always, everywhere, and for anyone, to believe anything upon insufficient evidence.'",
    ren_stage: 5,
    source_status: "Verified",
    confidence: 1.0
  },
  {
    id: "russell_bertrand",
    label: "Bertrand Russell",
    node_class: "Figure",
    tradition: "Analytic Philosophy",
    phenomenological_extraction: "A free man's worship; constructing courage and dignity on the firm foundation of unyielding despair before a cold mechanical cosmos",
    primary_collapse_type: "Metaphysical consolation collapse",
    edges: [
      { target: "secular_skepticism", type: "WITNESSES", description: "Maintains ethical dignity while rejecting cosmic purpose" }
    ],
    ux_treatment: "Analytic counter-node. Clear, sharp mathematical lines.",
    scholarly_anchor: "A Free Man's Worship (1903) and Why I Am Not a Christian; scientific cosmic outlook.",
    ren_stage: 5,
    source_status: "Verified",
    confidence: 1.0
  },
  {
    id: "wittgenstein",
    label: "Wittgenstein",
    node_class: "Figure",
    tradition: "Analytic Philosophy / Language-Limit",
    phenomenological_extraction: "The limits of my language mean the limits of my world; what we cannot speak of we must pass over in silence",
    primary_collapse_type: "Language collapse",
    edges: [
      { target: "pseudo_dionysius", type: "ANTICIPATES", description: "Modern secular analogue to apophatic theological silence" }
    ],
    ux_treatment: "Wittgensteinian silent node. Borders disappear on click, leaving a pure white point.",
    scholarly_anchor: "Tractatus Logico-Philosophicus (especially propositions 6 and 7 on the limits of language and the mystical).",
    ren_stage: 5,
    source_status: "Verified",
    confidence: 1.0
  },
  {
    id: "sartre",
    label: "Jean-Paul Sartre",
    node_class: "Figure",
    tradition: "Existentialism",
    phenomenological_extraction: "Existence precedes essence; nausea at raw brute physical contingency; mankind is condemned to be free",
    primary_collapse_type: "Essence / given meaning collapse",
    edges: [
      { target: "nihiltheism", type: "CONTRASTS_WITH", description: "Our platform rejects Sartre's humanist self-making as soft comfort" }
    ],
    ux_treatment: "Adversarial comparative node. Heavy red borders representing struggle/resistance.",
    scholarly_anchor: "Being and Nothingness (l'être et le néant) and Existentialism is a Humanism; definition of bad faith.",
    ren_stage: 3,
    source_status: "Verified",
    confidence: 1.0
  },
  {
    id: "camus",
    label: "Albert Camus",
    node_class: "Figure",
    tradition: "Absurdism",
    phenomenological_extraction: "The absurd: mismatch between human demand for explanation and cold silence of the universe; Sisyphus' heroic rebellion",
    primary_collapse_type: "Demand-for-meaning/world-silence collapse",
    edges: [
      { target: "nihiltheism", type: "CONTRASTS_WITH", description: "Camus' heroic rebellion is treated as active refusal of deep abyssal collapse" }
    ],
    ux_treatment: "Adversarial comparative node. Styled with stone boulder vector illustration on focus.",
    scholarly_anchor: "The Myth of Sisyphus (suicide evaluation) and The Rebel.",
    ren_stage: 3,
    source_status: "Verified",
    confidence: 1.0
  },
  {
    id: "jaspers_karl",
    label: "Karl Jaspers",
    node_class: "Figure",
    tradition: "Existential Philosophy",
    phenomenological_extraction: "Limit-situations (Grenzsituationen) like death, suffering, guilt, and struggle that shatter everyday security, pointing to transcendence",
    primary_collapse_type: "Boundary-situation collapse",
    edges: [
      { target: "heidegger", type: "DEVELOPS", description: "Parallels Being and Time's attunements" },
      { target: "kierkegaard", type: "DEVELOPS", description: "Builds on Kierkegaard's individual leap criteria" }
    ],
    ux_treatment: "Existential boundary node. Staggered dashed outer lines.",
    scholarly_anchor: "Philosophy Vol 2 (1932); definition of Grenzsituationen and the wreckage (Scheitern) as cipher of transcendence.",
    ren_stage: 4,
    source_status: "Verified",
    confidence: 0.95
  },
  {
    id: "levinas_emmanuel",
    label: "Emmanuel Levinas",
    node_class: "Figure",
    tradition: "French Phenomenology / Ethics",
    phenomenological_extraction: "The ethical face-to-face; egoic self-sovereignty shattered and held hostage by the infinite shock of the concrete other",
    primary_collapse_type: "Self-sovereignty collapse",
    edges: [
      { target: "simone_weil", type: "DEVELOPS", description: "Bridges Weil's unselfish attention into complete ethical ontology" }
    ],
    ux_treatment: "Anti-system moral node. Glowing gold face profile layout.",
    scholarly_anchor: "Totality and Infinity; deconstruction of Western philosophy as violent reduction of the Other to the Same.",
    ren_stage: 5,
    source_status: "Verified",
    confidence: 0.95
  },
  {
    id: "beauvoir_simone",
    label: "Simone de Beauvoir",
    node_class: "Figure",
    tradition: "Existentialism / Ethics",
    phenomenological_extraction: "The ethics of ambiguity; human freedom can only be actualized by actively willing the freedom of others",
    primary_collapse_type: "Fixed meaning collapse",
    edges: [
      { target: "sartre", type: "DEVELOPS", description: "Coordinates Sartre's radical freedom into concrete social and gendered realities" },
      { target: "absurd_concept", type: "CONTRASTS_WITH", description: "Distinguishes existential ambiguity from simple absurdist despair" }
    ],
    ux_treatment: "Existential comparison node. Deep violet frame.",
    scholarly_anchor: "The Ethics of Ambiguity (Pour une morale de l'ambiguïté, 1947); outlines action in a world devoid of given values.",
    ren_stage: 3,
    source_status: "Verified",
    confidence: 1.0
  }
];

export const ontologyEdges: OntologicalEdge[] = [
  {
    id: "e1",
    source: "nihilism",
    target: "phenomenological_nihilism",
    type: "CONTRASTS_WITH",
    claim: "Nihilism as a conceptual theory must be distinguished from the pre-reflective phenomenological disclose of world-collapse.",
    confidence: 0.9,
    status: "Verified",
    evidence_quote: "Existentialism distinguishes intellectual nihilism from raw experiences of dread and significance collapse."
  },
  {
    id: "e2",
    source: "ecclesiastes",
    target: "thomas_kempis",
    type: "ANTICIPATES",
    claim: "The ancient wisdom tracking of 'Hebel' (vanity) serves as the textual template for Medieval Devotio contempt of worldly honor.",
    confidence: 0.95,
    status: "Verified",
    evidence_quote: "Thomas à Kempis begins his manual quoting Ecclesiastes: 'Vanity of vanities, and all is vanity.'"
  },
  {
    id: "e3",
    source: "john_of_the_cross",
    target: "dark_night",
    type: "WITNESSES",
    claim: "The soul undergoes a passive purification where all spiritual, emotional, and cognitive support structures are systematically severed.",
    confidence: 1.0,
    status: "Verified",
    evidence_quote: "Carmelite scriptures record hours of dry trial where all contact with the sacred seems entirely absent."
  },
  {
    id: "e4",
    source: "nagarjuna",
    target: "non_self",
    type: "DEVELOPS",
    claim: "Emptiness (śūnyatā) deconstructs the last remaining substance projection of Atman behind mental processes.",
    confidence: 0.98,
    status: "Verified",
    evidence_quote: "Mahāyāna treatises deconstruct individual souls alongside mental dharma building blocks."
  },
  {
    id: "e5",
    source: "meister_eckhart",
    target: "cioran",
    type: "ANTICIPATES",
    claim: "Total detachment (Abgescheidenheit) prefigures modern pessimistic relief in absolute inner emptiness.",
    confidence: 0.85,
    status: "Verified",
    evidence_quote: "Cioran extensively praised Eckhart as the only spiritual thinker who correctly diagnosed the need to dissolve God."
  },
  {
    id: "e6",
    source: "heidegger",
    target: "nothingness",
    type: "WITNESSES",
    claim: "Anxiety is the supreme ontological attunement that forces Dasein to encounter the background Nothing.",
    confidence: 1.0,
    status: "Verified",
    evidence_quote: "Being and Time notes anxiety slips away specific beings, leaving Dasein to face its bare facticity."
  },
  {
    id: "e7",
    source: "becker",
    target: "pascal",
    type: "DEVELOPS",
    claim: "Modern death denial anthropology formalizes Pascalian diversion into a complete clinical model of heroic culture.",
    confidence: 0.95,
    status: "Verified",
    evidence_quote: "Becker cites Pensées as the earliest and most accurate clinical description of man's desperate flight from spatial insignificance."
  },
  {
    id: "e8",
    source: "griffiths_roland",
    target: "pahnke",
    type: "DEVELOPS",
    claim: "Controlled psychiatric administration of psilocybin replicates the clinical metrics of seminary mystical conversion.",
    confidence: 1.0,
    status: "Verified",
    evidence_quote: "Griffiths 2006 utilizes modern double-blind structures to validate Pahnke's early Harvard findings."
  },
  {
    id: "e9",
    source: "sartre",
    target: "wittgenstein",
    type: "CONTRASTS_WITH",
    claim: "Sartre's active self-constituting humanism stands in tension with Wittgensteinian silent pass of limits.",
    confidence: 0.88,
    status: "Interpretive",
    evidence_quote: "Comparison of French activist existential freedom with the silent limits of early logical positivism."
  }
];

export const objectionsData: ObjectionNode[] = [
  {
    id: "obj1",
    name: "Constructivist Particularism",
    target_claim: "Cross-historical universality of the 'Void' experience.",
    severity: "High",
    response: "The platform addresses this by preserving 'Micro-Differences' and strict typologies (using relationship edges like CONTRASTS_WITH), refusing to merge Zen emptiness (Śūnyatā) into Carmelite Dark Night under a cheap perennial label.",
    status: "Addressed"
  },
  {
    id: "obj2",
    name: "Theistic Smuggling Risk",
    target_claim: "Apophatic Christian theology.",
    severity: "Medium",
    response: "Guaranteed by the O-E Discriminator. Any positive claim representing darkness as a hidden 'fatherly love' is highlighted as a 'Level 3/4 Elevation violation' of the collapse boundary.",
    status: "Mitigated"
  },
  {
    id: "obj3",
    name: "Quietism Passivity Risk",
    target_claim: "Absolute self-annihilation claims (Molinos, Quietism).",
    severity: "Low",
    response: "The platform marks these contested nodes with 'Doctrinal Dispute' warning banners and maps active objections from contemporary theologians next to them.",
    status: "Addressed"
  },
  {
    id: "obj4",
    name: "Biological Existential Melancholy Reducibility",
    target_claim: "Affective Dread as Epistemic Disclosure (Kierkegaard, Heidegger).",
    severity: "High",
    response: "The platform maintains clinical agnosticism. It offers both William James' sick-soul psychology and Heideggerian ontological frames side-by-side, without choosing between brain chemistry or existential truth.",
    status: "Unresolved"
  }
];
