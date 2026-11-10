export type AutopsyLens = 'structural' | 'doctrinal' | 'rhetorical' | 'tripartite';

export type EpistemicStatusTag =
  | 'Axiomatic Invariant'
  | 'Phenomenological Datum'
  | 'Dialectical Synthesis'
  | 'Boundary Operator'
  | 'Horizon-Bound / Unverifiable';

export interface ComparativePhilosopherEntry {
  philosopher: string;
  tradition: string;
  locus: string;
  constructiveResonance: string;
  nonEquivalenceRemainder: string;
  epistemicTag: EpistemicStatusTag;
}

export interface ConstructiveElevationSynthesis {
  synthesizedElevationTheorem: string;
  boundaryMechanism: string;
  eideticPotentiality: string;
  actionableHeuristic: string;
}

export interface OccurrenceVsElevationBreakdown {
  occurrenceTrap: string;
  occurrenceDiagnosis?: string;
  elevationResolution: string;
  empiricalScore: number;
  elevationScore: number;
  ratio: number;
  statusBadge: string;
}

export interface PhilocrashPhase1 {
  primaryTarget: string;
  corePillars: { title: string; explanation: string }[];
  primaryTexts: { author: string; treatise: string; locus: string; context: string }[];
  literaryStyle: string;
}

export interface PhilocrashPhase2 {
  canonicalQuotes: { quote: string; source: string; commentary: string }[];
  psychologicalFriction: {
    frictionType: string;
    phenomenologicalDescription: string;
    aporiaSignal: string;
  };
  individualVsCollective: string;
  specializedLexicon: { term: string; transliteration?: string; definition: string }[];
}

export interface PhilocrashPhase3 {
  authenticSelfhood: string;
  threatsToIndividuality: string[];
  subtractiveLeap: string;
  personalAccountabilityInjunctions: string[];
}

export interface PhilocrashPhase4 {
  strengths: string[];
  vulnerabilities: string[];
  structuralAutopsy: {
    contradiction: string;
    formalMechanism: string;
    aporia: string;
    invariantResolution: string;
  };
  doctrinalAutopsy: {
    contradiction: string;
    dogmaticReificationRisk: string;
    aporia: string;
    invariantResolution: string;
  };
  rhetoricalAutopsy: {
    contradiction: string;
    stylisticParadox: string;
    aporia: string;
    invariantResolution: string;
  };
  asymptoticInvariantHold: string;
  constructiveSynthesis: ConstructiveElevationSynthesis;
  occurrenceVsElevation: OccurrenceVsElevationBreakdown;
}

export interface MetricAutopsyProfile {
  id: string;
  label: string;
  symbol: string;
  color: string;
  bgGradient: string;
  description: string;
  tensorFormula: string;
  defaultLens: 'structural' | 'doctrinal' | 'rhetorical';
  correlatedGraphNodeId: string;
  epistemicStatus: EpistemicStatusTag;
  comparativePhilosophers: ComparativePhilosopherEntry[];
  phase1: PhilocrashPhase1;
  phase2: PhilocrashPhase2;
  phase3: PhilocrashPhase3;
  phase4: PhilocrashPhase4;
}

export interface DifferentialPairwiseProfile {
  pairKey: string;
  metricAId: string;
  metricBId: string;
  title: string;
  divergenceVector: string;
  covarianceRatio: number;
  constructiveSynthesisIndex: number;
  crossInterferenceDiagnosis: string;
  synthesizedTheorem: string;
  dialecticalResolution: string;
}

export const PHILOCRASH_METRIC_PROFILES: Record<string, MetricAutopsyProfile> = {
  composite: {
    id: 'composite',
    label: 'Composite Disparity Index',
    symbol: 'Δtotal',
    color: '#F59E0B',
    bgGradient: 'from-amber-500 to-amber-600',
    description: 'Integral measure of total ontological variance across the pentagonal nihil-topology tensor.',
    tensorFormula: 'Δtotal = ∮ (∇λ ⊗ ρonto) · dθapoph + ∥δgap∥',
    defaultLens: 'structural',
    correlatedGraphNodeId: 'void',
    epistemicStatus: 'Axiomatic Invariant',
    comparativePhilosophers: [
      {
        philosopher: 'Nishitani Keiji',
        tradition: 'Kyoto School Zen Ontology',
        locus: 'Religion and Nothingness, Ch. III (Nihilism and Śūnyatā)',
        constructiveResonance: 'Concurs that relative nihilism must be radicalized into absolute Emptiness (Śūnyatā) to dissolve existential despair into unconditioned affirmation.',
        nonEquivalenceRemainder: 'Nishitani roots Emptiness in Mahāyāna non-duality and Pratītyasamutpāda; Nihiltheism formulates an operational differential tensor (Δtotal) with invariant asymptotic boundaries.',
        epistemicTag: 'Dialectical Synthesis'
      },
      {
        philosopher: 'Meister Eckhart',
        tradition: 'Rhineland Apophatic Mysticism',
        locus: 'German Sermons, Sermon 52 (Beati pauperes spiritu)',
        constructiveResonance: 'Demands radical kenosis: the soul must abandon even "God" as a conceptual idol to inhabit the silent desert of the Gottheit (the divine groundless ground).',
        nonEquivalenceRemainder: 'Eckhart assumes an ultimate mystical union (unio mystica) with the unmanifest divine; Nihiltheism refuses metaphysical reunion, treating the Void as an unconditioned clearing.',
        epistemicTag: 'Boundary Operator'
      },
      {
        philosopher: 'Nāgārjuna',
        tradition: 'Madhyamaka Buddhism',
        locus: 'Mūlamadhyamakakārikā XXIV.18',
        constructiveResonance: 'Employs systematic tetralemma (catuṣkoṭi) to demonstrate that all entities lack intrinsic essence (svabhāva), clearing the field for dependent arising.',
        nonEquivalenceRemainder: 'Nāgārjuna’s target is soteriological cessation of duḥkha; Nihiltheism applies variance topology to bridge academic metaphysics and aesthetic contemplation of the abyss.',
        epistemicTag: 'Axiomatic Invariant'
      },
      {
        philosopher: 'Emil Cioran',
        tradition: 'Tragic Pessimism & Aphoristic Nihilism',
        locus: 'The Trouble with Being Born (Aphorisms on Birth)',
        constructiveResonance: 'Shares the acute, unsparing diagnostic eye for the absurdity of existence and the tragic vanity of human ideological edifices.',
        nonEquivalenceRemainder: 'Cioran remains trapped in passive melancholic paralysis; Nihiltheism enacts J314 Elevation—transmuting nothingness into creative, sacred freedom.',
        epistemicTag: 'Phenomenological Datum'
      },
      {
        philosopher: 'Sextus Empiricus',
        tradition: 'Pyrrhonean Skepticism',
        locus: 'Outlines of Pyrrhonism I.12 (Isostheneia & Epoché)',
        constructiveResonance: 'Suspension of judgment (epoché) through equipollence of opposing arguments strips dogmatic weight from conceptual systems.',
        nonEquivalenceRemainder: 'Pyrrhonism aims for quietist tranquility (ataraxia) by conforming to ordinary life; Nihiltheism demands transformative encounter with the groundless ontological limit.',
        epistemicTag: 'Boundary Operator'
      },
      {
        philosopher: 'Albert Camus',
        tradition: 'Absurdist Phenomenological Existentialism',
        locus: 'The Myth of Sisyphus (An Absurd Reasoning)',
        constructiveResonance: 'Affirms that lucid encounter with the silence of the cosmos requires living without appeal, refusing the leap of religious or intellectual suicide.',
        nonEquivalenceRemainder: 'Camus grounds the absurd in anthropomorphic friction (man longing for clarity vs. silent universe); Nihiltheism uncovers the Void as an objective, sacred ontological field.',
        epistemicTag: 'Phenomenological Datum'
      },
      {
        philosopher: 'Plato',
        tradition: 'Classical Eidetic Metaphysics',
        locus: 'Republic VI (Form of the Good / Epekeina tes ousias) & Phaedo',
        constructiveResonance: 'Reveals that once contingent sensory occurrence is stripped away, consciousness encounters an otherworldly realm of timeless, invariant structural clarity.',
        nonEquivalenceRemainder: 'Plato hypostasizes the Forms as eternal substantial substances in a celestial hierarchy; Nihiltheism understands this liminal space as pure potentiality arising from absolute groundlessness.',
        epistemicTag: 'Horizon-Bound / Unverifiable'
      }
    ],
    phase1: {
      primaryTarget: 'Substantialist ontology and the dogmatic presumption that reality can be grounded in a foundational positive essence.',
      corePillars: [
        {
          title: 'Axiomatic Groundlessness (Abgrund)',
          explanation: 'Being is not anchored in self-subsistent substance; every affirmative structure arises as a contingent condensation over radical Nothingness.'
        },
        {
          title: 'Integrative Variance Measurement',
          explanation: 'Disparity is not a defect or error in thought, but the exact quantitative footprint of ideological resistance against active negation.'
        },
        {
          title: 'Asymptotic Hold at θ = 0.18',
          explanation: 'The index stabilizes at an invariant threshold where conceptual dogmatism ceases without collapsing into catatonic silence.'
        },
        {
          title: 'Triadic Autopsy Balance',
          explanation: 'Complete philosophical equilibrium requires continuous auditing of structural form, doctrinal assertion, and rhetorical performativity.'
        }
      ],
      primaryTexts: [
        {
          author: 'Nishitani Keiji',
          treatise: 'Religion and Nothingness',
          locus: 'Chapter III: Nihilism and Sūnyatā',
          context: 'Articulating how radical nihilism undergoes a self-overcoming only when the Void is realized not as relative nothingness (nihil privativum) but as absolute Emptiness.'
        },
        {
          author: 'Meister Eckhart',
          treatise: 'German Sermons (Deutsche Werke)',
          locus: 'Sermon 52: Beati pauperes spiritu',
          context: 'Exhorting the soul to become so radically poor that it wants nothing, knows nothing, and possesses nothing—abandoning even God for the Gottheit (the unconditioned divine desert).'
        },
        {
          author: 'Nāgārjuna',
          treatise: 'Mūlamadhyamakakārikā',
          locus: 'Chapter XXIV: Examination of the Noble Truths, Verse 18',
          context: 'Establishing that dependent co-arising is itself Emptiness (śūnyatā), which is neither annihilation nor eternalism, functioning as the middle path free of reification.'
        }
      ],
      literaryStyle: 'Formal topological treatise combined with rigorous dialectical deduction and apophatic reduction ad absurdum.'
    },
    phase2: {
      canonicalQuotes: [
        {
          quote: 'Absolute Nothingness is that which is at the ground of all that is, and yet is itself not a thing.',
          source: 'Nishitani Keiji, Religion and Nothingness (p. 70)',
          commentary: 'The foundation is itself groundless, establishing why Δtotal quantifies departure from pure openness.'
        },
        {
          quote: 'Man should be so free of God and of all his works that God could find no place in him to act.',
          source: 'Meister Eckhart, Sermon 52',
          commentary: 'Radical kenosis demands the absolute subtraction of conceptual possession.'
        },
        {
          quote: 'Whatever is dependently co-arisen, that is explained to be emptiness. That, being a dependent designation, is itself the middle way.',
          source: 'Nāgārjuna, Mūlamadhyamakakārikā XXIV.18',
          commentary: 'The Composite Index measures whether designations are treated as dependent pointers or reified substances.'
        }
      ],
      psychologicalFriction: {
        frictionType: 'Metaphysical Vertigo (Angst vor dem Nichts)',
        phenomenologicalDescription: 'The cognitive shock when the mind discovers that its ultimate ontological anchor is not a granite bed of Being, but an unfathomable abyss without bottom.',
        aporiaSignal: 'Spike in Δtotal (> 0.60) signaling intense dogmatic defense mechanisms against radical groundlessness.'
      },
      individualVsCollective: 'Society constructs elaborate dogmatic edifices (theological, economic, moral) to insulate the collective from the abyss; the lucid thinker must inhabit the boundary without consolatory mythologies.',
      specializedLexicon: [
        {
          term: 'Composite Disparity (Δtotal)',
          definition: 'The aggregate divergence between conceptual representations and the unconditioned reality of the Void.'
        },
        {
          term: 'Abgrund',
          transliteration: 'German: un-ground / abyss',
          definition: 'The primordial absence of foundation that makes all contingent emergence possible.'
        },
        {
          term: 'Invariant Boundary (θ = 0.18)',
          definition: 'The operational asymptote where dialectical inquiry stabilizes without dogmatic relapse.'
        },
        {
          term: 'Axiological Zero-Point',
          definition: 'The threshold where artificial hierarchies of meaning dissolve into unconditioned presence.'
        }
      ]
    },
    phase3: {
      authenticSelfhood: 'Authentic selfhood within Nihiltheism is the capacity to abide in the radical clearing of the Void without manufacturing defensive metaphysical crutches or falling into cynical passivity.',
      threatsToIndividuality: [
        'Idolatry of conceptual systems that mistake linguistic models for the unconditioned ground.',
        'Crowd-enforced consolatory theologies that offer synthetic meaning at the cost of intellectual lucidity.',
        'Secular flat nihilism that reduces the absence of essence to despair rather than generative liberation.'
      ],
      subtractiveLeap: 'The decisive movement of "Gelassenheit" (letting-go): relinquishing the compulsive demand for an ultimate metaphysical guarantor and stepping directly into active, lucid negation.',
      personalAccountabilityInjunctions: [
        'Never affirm a doctrine merely to soothe existential anxiety.',
        'Audit every conceptual category for implicit reification.',
        'Hold the tension of the ungrounded state without premature intellectual synthesis.'
      ]
    },
    phase4: {
      strengths: [
        'Provides a quantitative topological framework to track ideological dogmatism across philosophical traditions.',
        'Prevents both naive religious dogmatism and superficial cynical nihilism from foreclosing genuine inquiry.',
        'Synthesizes Eastern apophasis (Nāgārjuna, Kyoto School) with Western negative theology and existential critique.'
      ],
      vulnerabilities: [
        'Risk of meta-reification: treating the index itself as a new Pythagorean idol or quantitative dogma.',
        'Cognitive exhaustion from maintaining perpetual epoché without resting in intermediate pragmatic truths.',
        'Semantic vertigo where all terminology threatens to collapse into identical emptiness.'
      ],
      structuralAutopsy: {
        contradiction: 'Formalization of the Ineffable: The structural contradiction consists in employing differential calculus and topological tensors to quantify that which is asserted to be beyond all number, distinction, and form.',
        formalMechanism: 'The tensor model requires distinct orthogonal coordinates (λ, ρ, θ, δ), yet Nihiltheism claims the Void is fundamentally non-dual and undivided.',
        aporia: 'If the Void cannot be measured, any numerical value for Δtotal is necessarily an arbitrary cognitive construct; but if it is not measured, thought falls prey to unexamined dogmatic bias.',
        invariantResolution: 'Δtotal does not measure the Void in-itself (which is immeasurable), but rather the friction coefficient of human conceptual structures as they attempt to enclose the Void.'
      },
      doctrinalAutopsy: {
        contradiction: 'Theology vs. Nihility: The doctrinal contradiction lies in claiming a "sacred" character for radical negation while denying every classical theological attribute (personality, providence, goodness, eternity).',
        dogmaticReificationRisk: 'Religions continually recapture apophatic insights by turning Nothingness into "Divine Mystery" or an esoteric hypostasis of Being.',
        aporia: 'Can one maintain "Theism" within Nihiltheism without smuggling in a concealed deity, or does the term reduce to an oxymoron designed solely to provoke scandal?',
        invariantResolution: 'Theism is preserved purely as an apophatic horizon: not a God who exists, but the sacred depth of non-existence that shatters all conceptual idols.'
      },
      rhetoricalAutopsy: {
        contradiction: 'The Performative Paradox of Negation: The rhetorical contradiction is stating that "nothing can be said of the unconditioned" while generating extensive treatises, formulas, and dialectical charts.',
        stylisticParadox: 'Every sentence written in defense of apophasis constitutes a cataphatic violation of its own primary premise.',
        aporia: 'Silence cannot defend itself against dogmatism; language cannot utter the Void without betraying it.',
        invariantResolution: 'Rhetoric is deployed as a Wittgensteinian ladder or Nagarjunian raft: an self-consuming fire that burns away its own propositions once understanding has been awakened.'
      },
      asymptoticInvariantHold: 'Stabilized at θ = 0.18: At this critical boundary, ideological densification is systematically minimized, allowing active negation to function as an unconditioned vector of clarity.',
      constructiveSynthesis: {
        synthesizedElevationTheorem: 'Theorem of Integral Variance: Δtotal functions not as a descriptive metric of ontological substance, but as an operational boundary operator that maps cognitive displacement from the unconditioned zero-point, transmuting conceptual friction into an encounter with pure potentiality.',
        boundaryMechanism: 'De-reifies metaphysical claims by converting static dogmatic propositions into dynamic vectors along the five topological axes, neutralizing reification before it calcifies.',
        eideticPotentiality: 'By clearing the false density of empirical occurrence, the index discloses the timeless liminal horizon wherein all possible forms subsist without dogmatic coercion.',
        actionableHeuristic: 'When Δtotal exceeds 0.70, apply subtractive kenosis to reduce ontological density; when Δtotal stabilizes at 0.18, execute constructive synthesis into vault theorems.'
      },
      occurrenceVsElevation: {
        occurrenceTrap: 'Fixating on the numerical value as an empirical ranking or competitive score, relapsing into technocratic reification.',
        elevationResolution: 'Using the index as an apophatic mirror that dissolves the reifying ego, attuning the intellect to the silent presence of the Void.',
        empiricalScore: 0.38,
        elevationScore: 0.88,
        ratio: 2.32,
        statusBadge: 'Elevation-Dominant [Constructive Synthesis]'
      }
    }
  },

  divergence: {
    id: 'divergence',
    label: 'Topological Divergence',
    symbol: 'Δλ',
    color: '#8B5CF6',
    bgGradient: 'from-violet-500 to-indigo-600',
    description: 'Eigenvalue drift between anchor vertices in the ontological comparison matrix.',
    tensorFormula: 'Δλ = ∥λ(anchor_A) - λ(anchor_B)∥ / Tr(M_tensor)',
    defaultLens: 'structural',
    correlatedGraphNodeId: 'epoche',
    epistemicStatus: 'Boundary Operator',
    comparativePhilosophers: [
      {
        philosopher: 'Sextus Empiricus',
        tradition: 'Pyrrhonean Skepticism',
        locus: 'Outlines of Pyrrhonism I.12',
        constructiveResonance: 'Equipollence (isostheneia) of opposing claims demonstrates the inevitable divergence between competing conceptual anchors.',
        nonEquivalenceRemainder: 'Pyrrhonism accepts divergence as cause for permanent agnosticism; Nihiltheism tracks divergence as a topological gradient toward higher constructive synthesis.',
        epistemicTag: 'Boundary Operator'
      },
      {
        philosopher: 'Nishitani Keiji',
        tradition: 'Kyoto School Zen',
        locus: 'Religion and Nothingness, Ch. II',
        constructiveResonance: 'Divergence tracks the distance between Cartesian subjectivism and the realization of Śūnyatā as the field of circuminsessional interpenetration.',
        nonEquivalenceRemainder: 'Nishitani relies on Zen kōan intuition; Nihiltheism formalizes eigenvalue drift within an analytical comparison tensor.',
        epistemicTag: 'Dialectical Synthesis'
      },
      {
        philosopher: 'Meister Eckhart',
        tradition: 'Rhineland Mysticism',
        locus: 'Sermon 52',
        constructiveResonance: 'The radical divergence between God (the created concept) and Gottheit (the uncreated ground) must never be blurred.',
        nonEquivalenceRemainder: 'Eckhart retains theological vocabulary; Nihiltheism strips all paternalistic divine imagery into clean ontological vectors.',
        epistemicTag: 'Axiomatic Invariant'
      },
      {
        philosopher: 'Nāgārjuna',
        tradition: 'Madhyamaka Buddhism',
        locus: 'MMK Ch. I (Pratyaya-parīkṣā)',
        constructiveResonance: 'Shows that no entity arises from itself, from another, from both, or from no cause—divergence unmasks the impossibility of intrinsic causation.',
        nonEquivalenceRemainder: 'Madhyamaka operates within Buddhist karmic soteriology; Nihiltheism addresses contemporary secular vertigo and digital hyper-reification.',
        epistemicTag: 'Axiomatic Invariant'
      },
      {
        philosopher: 'Emil Cioran',
        tradition: 'Existential Pessimism',
        locus: 'A Short History of Decay',
        constructiveResonance: 'Tracks the inevitable fracturing and self-betrayal of every intellectual crusade and fanatical dogma.',
        nonEquivalenceRemainder: 'Cioran revels in the wreckage of thought; Nihiltheism preserves the wreckage as an apophatic foundation for radical peace.',
        epistemicTag: 'Phenomenological Datum'
      },
      {
        philosopher: 'Albert Camus',
        tradition: 'Absurdist Philosophy',
        locus: 'The Myth of Sisyphus',
        constructiveResonance: 'Recognizes the irreducible divergence between human yearning for unity and the opaque, silent universe.',
        nonEquivalenceRemainder: 'Camus treats the divergence as absurd friction; Nihiltheism reveals it as the sacred aperture of non-dogmatic potentiality.',
        epistemicTag: 'Phenomenological Datum'
      },
      {
        philosopher: 'Plato',
        tradition: 'Eidetic Metaphysics',
        locus: 'Parmenides & Sophist (On Non-Being)',
        constructiveResonance: 'Investigates how the One and the Many diverge, establishing the dialectic of Same and Other as structural invariants.',
        nonEquivalenceRemainder: 'Plato prioritizes the One as supreme being; Nihiltheism identifies the prior unconditioned clearing of the Void that precedes even the One.',
        epistemicTag: 'Horizon-Bound / Unverifiable'
      }
    ],
    phase1: {
      primaryTarget: 'The dogmatic assumption of doctrinal univocity or seamless synthesis between incompatible metaphysical frameworks.',
      corePillars: [
        {
          title: 'Differential Eigenvalue Mapping',
          explanation: 'Philosophical systems are not monolithic truths; their internal vectors diverge mathematically along primary conceptual axes.'
        },
        {
          title: 'Non-Commutative Incommensurability',
          explanation: 'Translating concepts between Western ontology (Being) and Eastern apophasis (Śūnyatā) leaves an irreducible remainder of topological drift.'
        },
        {
          title: 'Apophatic Dispersion',
          explanation: 'When dogmatic anchors are relaxed, the conceptual manifold naturally diverges, exposing the contingency of all ideological synthesis.'
        },
        {
          title: 'Epoché of False Unity',
          explanation: 'Suspending the impulse to force heterogeneous thinkers into an artificial syncretism preserves the sharp edge of philosophical inquiry.'
        }
      ],
      primaryTexts: [
        {
          author: 'Sextus Empiricus',
          treatise: 'Outlines of Pyrrhonism',
          locus: 'Book I, Chapters 12–15',
          context: 'Systematizing the Ten Tropes of Epoché to demonstrate that for every dogmatic assertion, an equally persuasive counter-assertion exists (isostheneia).'
        },
        {
          author: 'Keiji Nishitani',
          treatise: 'Religion and Nothingness',
          locus: 'Chapter II: The Standpoint of Śūnyatā',
          context: 'Tracing how European nihilism diverges from Eastern nothingness because the former remains chained to the nihil of despair while the latter reaches the field of absolute emptiness.'
        }
      ],
      literaryStyle: 'Formal matrix algebra, differential geometry metaphors, and comparative apophatic philology.'
    },
    phase2: {
      canonicalQuotes: [
        {
          quote: 'To every argument an equal argument is opposed.',
          source: 'Sextus Empiricus, Outlines of Pyrrhonism I.12',
          commentary: 'Δλ formalizes isostheneia as mathematical eigenvalue divergence.'
        },
        {
          quote: 'European nihilism has not yet broken through the wall of nothingness to the field of Śūnyatā.',
          source: 'Keiji Nishitani, Religion and Nothingness (p. 97)',
          commentary: 'The divergence metric quantifies the remaining distance between reactive despair and absolute liberation.'
        }
      ],
      psychologicalFriction: {
        frictionType: 'Cognitive Dissonance of Incommensurability',
        phenomenologicalDescription: 'The anxiety provoked when two deeply cherished conceptual models point in diametrically opposed directions without possibility of naive compromise.',
        aporiaSignal: 'Sudden divergence spike (Δλ > 0.75) signaling an epistemological rupture between anchor systems.'
      },
      individualVsCollective: 'Collectives demand enforced doctrinal unanimity; the philosopher measures and honors divergence as the signature of intellectual freedom.',
      specializedLexicon: [
        {
          term: 'Topological Divergence (Δλ)',
          definition: 'The normalized vector distance between eigenvalue distributions of two philosophical systems.'
        },
        {
          term: 'Eigenvalue Drift',
          definition: 'The gradual realignment of core axioms when subjected to apophatic inquiry.'
        },
        {
          term: 'Isostheneia',
          transliteration: 'Greek: equal strength / equipollence',
          definition: 'The balance of opposing arguments leading to suspension of judgment.'
        }
      ]
    },
    phase3: {
      authenticSelfhood: 'Embracing the polyphony of divergent perspectives without clinging to a desperate ideological monolith.',
      threatsToIndividuality: [
        'Totalitarian ideologies that enforce synthetic unity through censorship and dogma.',
        'Lazy relativism that treats all divergence as trivial rather than deeply structural.',
        'Intellectual cowardice that retreats into dogmatism at the first sign of philosophical friction.'
      ],
      subtractiveLeap: 'Surrendering the need for a single, unified Theory of Everything, resting instead in the fluid, multi-perspectival play of the Void.',
      personalAccountabilityInjunctions: [
        'Expose your own axioms to their most devastating counter-arguments.',
        'Never paper over an ontological contradiction for the sake of aesthetic neatness.',
        'Use divergence not to destroy inquiry, but to deepen its humility.'
      ]
    },
    phase4: {
      strengths: [
        'Prevents syncretic mush: preserves the sharp, distinct flavors of diverse philosophical traditions.',
        'Mathematically diagnoses hidden fault lines within seemingly unified intellectual systems.',
        'Catalyzes breakthrough insights by highlighting fertile points of conceptual collision.'
      ],
      vulnerabilities: [
        'Can induce epistemic nihilism if divergence is misinterpreted as meaninglessness.',
        'High computational complexity in tracking non-linear eigenvalue interactions.'
      ],
      structuralAutopsy: {
        contradiction: 'The Metric of Incommensurability: Calculating distance between systems requires a shared coordinate space, yet incommensurability asserts that no such neutral space exists.',
        formalMechanism: 'The formula normalizes by Tr(M_tensor), assuming the trace of the tensor can provide an objective scale.',
        aporia: 'If the scale is objective, the systems are not truly incommensurable; if they are incommensurable, the distance cannot be calculated.',
        invariantResolution: 'Δλ measures comparative divergence within the pragmatic horizon of human discourse, not absolute metaphysical separation.'
      },
      doctrinalAutopsy: {
        contradiction: 'Ecumenism vs. Orthodoxy: The doctrinal autopsy reveals that institutional ecumenism papers over real divergence to maintain political alliances, while dogmatic fundamentalism weaponizes divergence to justify holy war.',
        dogmaticReificationRisk: 'Both postures reify doctrine—one by diluting it, the other by idolizing it.',
        aporia: 'How to take doctrine seriously without taking it dogmatically?',
        invariantResolution: 'Nihiltheism treats doctrines as transient constellations: bright, distinct, and shining across an infinite sky of Nothingness.'
      },
      rhetoricalAutopsy: {
        contradiction: 'The Rhetoric of Objective Neutrality: The author presenting Δλ uses clean, neutral mathematical notation (vectors, matrices) to describe explosive ideological warfare.',
        stylisticParadox: 'Sublimating passionate existential fury into sterile topological metrics.',
        aporia: 'Does the mathematics cool the mind, or does it merely conceal the existential stakes?',
        invariantResolution: 'Transparent dual-register presentation: balancing cold matrix mathematics with passionate phenomenological prose.'
      },
      asymptoticInvariantHold: 'Stabilized at Δλ = 0.88: Maximum creative tension held without systemic breakdown.',
      constructiveSynthesis: {
        synthesizedElevationTheorem: 'Theorem of Non-Commutative Drift: Divergence between ontological anchors is not an epistemic failure but the generative mechanism of eidetic disclosure, demonstrating that all conceptual systems are partial projections of an unconditioned liminal whole.',
        boundaryMechanism: 'Deploys epoché to arrest unilateral hegemony, using divergence as a dynamic filter that cleanses dogmatic absolutism.',
        eideticPotentiality: 'Points directly to the multi-dimensional manifold of pure potentiality, where opposing perspectives reveal their complementary geometry in the field of the Void.',
        actionableHeuristic: 'When Δλ > 0.80, refrain from premature dialectical unification; track each trajectory to its terminal limit until constructive synthesis emerges spontaneously.'
      },
      occurrenceVsElevation: {
        occurrenceTrap: 'Sinking into argumentative sectarianism, defending one anchor vertex as personal identity against the other.',
        elevationResolution: 'Rising into eidetic vantage, witnessing how divergence itself is the dance of form over groundless silence.',
        empiricalScore: 0.42,
        elevationScore: 0.86,
        ratio: 2.05,
        statusBadge: 'Elevation-Dominant [Structural Insight]'
      }
    }
  },

  density: {
    id: 'density',
    label: 'Ontological Density',
    symbol: 'ρonto',
    color: '#06B6D4',
    bgGradient: 'from-cyan-500 to-blue-600',
    description: 'Degree of conceptual reification and essentialist petrification within a discourse.',
    tensorFormula: 'ρonto = 1 / (1 + exp(-κ · (Essence_Claims - Apophatic_Negations)))',
    defaultLens: 'doctrinal',
    correlatedGraphNodeId: 'substance',
    epistemicStatus: 'Phenomenological Datum',
    comparativePhilosophers: [
      {
        philosopher: 'Nāgārjuna',
        tradition: 'Madhyamaka Buddhism',
        locus: 'MMK Ch. XV (Svabhāva-parīkṣā)',
        constructiveResonance: 'Ruthlessly deconstructs intrinsic essence (svabhāva); whatever has svabhāva cannot change, originate, or dissolve, proving that high density is an illusion.',
        nonEquivalenceRemainder: 'Nāgārjuna stops at radical śūnyatā without affirming a transcendent realm of Platonic potentiality; Nihiltheism integrates the positive aesthetic of the Void.',
        epistemicTag: 'Axiomatic Invariant'
      },
      {
        philosopher: 'Meister Eckhart',
        tradition: 'Rhineland Mysticism',
        locus: 'Sermon 83 (Renovamini spiritu)',
        constructiveResonance: 'Insists on total de-densification: stripped of all creaturely density, the soul meets the pure unconditioned Gottheit.',
        nonEquivalenceRemainder: 'Eckhart retains theological terms like "soul" and "divine spark" (Seelenfünklein); Nihiltheism treats even these as subtle density artifacts to be dissolved.',
        epistemicTag: 'Boundary Operator'
      },
      {
        philosopher: 'Nishitani Keiji',
        tradition: 'Kyoto School Zen',
        locus: 'Religion and Nothingness, Ch. IV',
        constructiveResonance: 'Exposes how Western ontology reifies Being into a heavy substantial center, contrasting it with the weightless openness of Śūnyatā.',
        nonEquivalenceRemainder: 'Nishitani draws on Mahāyāna Tathatā (Suchness); Nihiltheism maintains strict vigilance against any new crypto-substantialism.',
        epistemicTag: 'Dialectical Synthesis'
      },
      {
        philosopher: 'Emil Cioran',
        tradition: 'Aphoristic Pessimism',
        locus: 'Tears and Saints',
        constructiveResonance: 'Mockingly punctures the heavy, pompous density of theological dogma and philosophical treatises with sharp aphoristic lightning.',
        nonEquivalenceRemainder: 'Cioran’s de-densification descends into bitter existential spleen; Nihiltheism elevates into serene contemplative lightness.',
        epistemicTag: 'Phenomenological Datum'
      },
      {
        philosopher: 'Sextus Empiricus',
        tradition: 'Pyrrhonean Skepticism',
        locus: 'Outlines of Pyrrhonism II.1–3',
        constructiveResonance: 'Deconstructs the dogmatists’ criteria of truth and proof, dissolving their heavy metaphysical apparatus into light appearances.',
        nonEquivalenceRemainder: 'Pyrrhonism remains purely epistemological; Nihiltheism extends de-densification into a full ontological and aesthetic doctrine.',
        epistemicTag: 'Boundary Operator'
      },
      {
        philosopher: 'Albert Camus',
        tradition: 'Absurdist Philosophy',
        locus: 'The Myth of Sisyphus',
        constructiveResonance: 'Warns against "philosophical suicide"—the sudden desperate jump into a dense, comforting metaphysical faith when faced with the absurd.',
        nonEquivalenceRemainder: 'Camus relies on heroic human revolt; Nihiltheism discovers deep, restorative peace in the very absence of density.',
        epistemicTag: 'Phenomenological Datum'
      },
      {
        philosopher: 'Plato',
        tradition: 'Classical Metaphysics',
        locus: 'Republic VII (Allegory of the Cave)',
        constructiveResonance: 'Recognizes that the shadows on the cave wall possess heavy, deceptive density; true wisdom demands turning toward the immaterial source.',
        nonEquivalenceRemainder: 'Plato relocates density to the Forms themselves; Nihiltheism recognizes the realm of Forms as pure, weightless potentiality, not heavy substances.',
        epistemicTag: 'Horizon-Bound / Unverifiable'
      }
    ],
    phase1: {
      primaryTarget: 'Essentialist petrification, dogmatic reification, the illusion of substantial permanence (svabhāva), and the idolization of conceptual nouns.',
      corePillars: [
        {
          title: 'De-reification Gradient',
          explanation: 'Philosophical lucidity increases in direct proportion to the reduction of reified substances in the conceptual vocabulary.'
        },
        {
          title: 'The Sigmoidal Density Threshold',
          explanation: 'When ρonto exceeds 0.50, discourse crosses a phase boundary from open phenomenological description into dogmatic theology.'
        },
        {
          title: 'Weightlessness of Emptiness',
          explanation: 'Realizing that all phenomena are devoid of self-nature (śūnya) induces an ontological weightlessness: freedom from the heavy gravity of dogma.'
        },
        {
          title: 'Subtractive Hygiene',
          explanation: 'Methodically auditing texts to replace heavy nouns with relational verbs and apophatic pauses.'
        }
      ],
      primaryTexts: [
        {
          author: 'Nāgārjuna',
          treatise: 'Mūlamadhyamakakārikā',
          locus: 'Chapter XV: Examination of Svabhāva (Intrinsic Essence)',
          context: 'Demonstrating that any entity possessing intrinsic essence (svabhāva) could neither change, originate, nor cease—proving that high density is impossible in reality.'
        },
        {
          author: 'Friedrich Nietzsche',
          treatise: 'Twilight of the Idols',
          locus: 'Reason in Philosophy (§5)',
          context: 'Denouncing grammar for constantly seducing thought into positing substances, egos, and things where only relational flux exists.'
        }
      ],
      literaryStyle: 'Genealogical critique, radical aphoristic dissection, and rigorous apophatic reductio.'
    },
    phase2: {
      canonicalQuotes: [
        {
          quote: 'Reason in language: oh what an old deceitful female she is! I am afraid we are not rid of God because we still have faith in grammar.',
          source: 'Friedrich Nietzsche, Twilight of the Idols',
          commentary: 'Grammar creates substantives (nouns), which create the illusion of high ontological density.'
        },
        {
          quote: 'The Nothing is neither an object nor anything that "is" at all.',
          source: 'Martin Heidegger, What is Metaphysics? (p. 98)',
          commentary: 'The clearing is not another heavy entity, but the zero-density horizon in which entities show up.'
        }
      ],
      psychologicalFriction: {
        frictionType: 'Ontological Claustrophobia & Resistance to Dissolution',
        phenomenologicalDescription: 'The terror of losing one’s conceptual anchors; the human psyche clings to dense dogmas as lifeboats against cosmic weightlessness.',
        aporiaSignal: 'Drop in ρonto accompanied by defensive dogmatic re-assertion.'
      },
      individualVsCollective: 'Society runs on heavy density: laws, flags, titles, and dogmas require massive belief in substance; the sovereign individual lives at low density, light and unburdened.',
      specializedLexicon: [
        {
          term: 'Ontological Density (ρonto)',
          definition: 'The proportion of substantive, essentialist claims relative to fluid, relational, and apophatic statements.'
        },
        {
          term: 'Svabhāva',
          transliteration: 'Sanskrit: own-being / intrinsic nature',
          definition: 'The imaginary independent essence attributed to things, dismantled by Nagarjuna.'
        },
        {
          term: 'Subtractive Vector',
          definition: 'The methodical reduction of conceptual density until only unconditioned presence remains.'
        }
      ]
    },
    phase3: {
      authenticSelfhood: 'Walking without metaphysical armor; possessing an identity that is light, porous, and continuously open to the void.',
      threatsToIndividuality: [
        'Sedimentation of personal habits into rigid identities ("I am essentially X").',
        'Absorption into bureaucratic and doctrinal apparatuses that demand worship of reified symbols.',
        'Existential panic that seeks refuge in reactionary fundamentalisms.'
      ],
      subtractiveLeap: 'The Courage of Emptiness: willingly surrendering one’s cherished ideological certainties and realizing that selfhood is a verb of relation, not a noun of substance.',
      personalAccountabilityInjunctions: [
        'Ask of every belief: "Is this pointing to reality or merely worshiping its own density?"',
        'Purge the compulsion to explain every mystery with a new invented substance.',
        'Embrace simplicity and intellectual poverty as highest virtues.'
      ]
    },
    phase4: {
      strengths: [
        'Directly exposes metaphysical bloat in theological and philosophical texts.',
        'Provides an objective scale for measuring how heavily an author relies on unprovable essences.',
        'Empowers the reader to dismantle manipulative ideological structures with minimal effort.'
      ],
      vulnerabilities: [
        'Danger of nihilistic reductionism: dismissing poetic or ethical metaphors merely because they possess linguistic density.',
        'Risk of creating an anti-density dogma where even practical language is viewed with neurotic suspicion.'
      ],
      structuralAutopsy: {
        contradiction: 'Measuring Density with Dense Symbols: To quantify ontological density, the algorithm must assign weight and value to words, thereby reifying the very language it aims to de-densify.',
        formalMechanism: 'The formula ρonto treats semantic terms as discrete measurable masses, mimicking the Newtonian physics of matter.',
        aporia: 'Can a calculation of density escape being dense itself?',
        invariantResolution: 'ρonto is treated as an operational sieve: once the grain of insight is separated from the chaff of reification, the sieve itself is set aside.'
      },
      doctrinalAutopsy: {
        contradiction: 'The Dogma of Non-Dogmatism: The doctrinal autopsy uncovers the subtle dogma of demanding that all thinkers conform to the imperative of low density.',
        dogmaticReificationRisk: 'Turning "Emptiness" or "Nothingness" into the densest concept of all—a super-substance that rules all other substances.',
        aporia: 'If Emptiness is reified, it becomes the most oppressive idol of all (śūnyatā-dṛṣṭi: the disease of emptiness).',
        invariantResolution: 'Nagarjuna’s antidote: Emptiness is also empty. ρonto must de-densify even its own category of Emptiness.'
      },
      rhetoricalAutopsy: {
        contradiction: 'The Heavy Prose of De-densifiers: Thinkers who critique density frequently write the densest, most impenetrable prose in human history.',
        stylisticParadox: 'Using monstrous neologisms and massive syntactic structures to announce the arrival of lightness and simplicity.',
        aporia: 'Language must become extraordinarily dense to crack open the density of common sense.',
        invariantResolution: 'Cultivating the sharp, concise aphorism (Nietzsche, Cioran) as the authentic rhetorical vehicle of low density.'
      },
      asymptoticInvariantHold: 'Optimal state reached at ρonto = 0.18: sufficient density to sustain rational communication, insufficient to permit ideological tyranny.',
      constructiveSynthesis: {
        synthesizedElevationTheorem: 'Theorem of Kenotic De-densification: Ontological density ρonto measures the inertia of conceptual petrification; reducing ρonto toward the asymptotic hold (θ = 0.18) does not annihilate meaning, but liberates phenomena to disclose their luminous, weightless presence.',
        boundaryMechanism: 'Operates as an epistemic degreaser that dissolves the dogmatic adhesive binding signs to imagined immutable substances.',
        eideticPotentiality: 'Unlocks the weightless realm of pure Platonic potentiality, where forms are understood not as rigid cosmic statues, but as fluid, eternal harmonies.',
        actionableHeuristic: 'Whenever discourse becomes stifling or ideological friction spikes, execute a kenotic audit: subtract 3 substantive nouns and replace with operational verbs.'
      },
      occurrenceVsElevation: {
        occurrenceTrap: 'Clinging to doctrinal definitions and intellectual titles to ward off the fear of personal insignificance.',
        elevationResolution: 'Surrendering the heavy fortress of the ego, enjoying the unencumbered freedom of the void.',
        empiricalScore: 0.18,
        elevationScore: 0.92,
        ratio: 5.11,
        statusBadge: 'Elevation-Dominant [Kenotic Lightness]'
      }
    }
  },

  apophatic: {
    id: 'apophatic',
    label: 'Apophatic Tension',
    symbol: 'θapoph',
    color: '#10B981',
    bgGradient: 'from-emerald-500 to-teal-600',
    description: 'Boundary resistance against dogmatic affirmation; strength of the negative theological shield.',
    tensorFormula: 'θapoph = 1 - (Affirmation_Count / Total_Assertions) · cos(φ_reductio)',
    defaultLens: 'rhetorical',
    correlatedGraphNodeId: 'void',
    epistemicStatus: 'Axiomatic Invariant',
    comparativePhilosophers: [
      {
        philosopher: 'Meister Eckhart',
        tradition: 'Rhineland Negative Theology',
        locus: 'Sermons on the Gottheit',
        constructiveResonance: 'Maintains supreme apophatic tension: "God is a word, a speaking word, but the Gottheit is a silent silence." True devotion is unsaying.',
        nonEquivalenceRemainder: 'Eckhart was a Dominican friar constrained by ecclesial heresy trials; Nihiltheism radicalizes unsaying beyond any theological institution.',
        epistemicTag: 'Axiomatic Invariant'
      },
      {
        philosopher: 'Nāgārjuna',
        tradition: 'Madhyamaka Buddhism',
        locus: 'Vigrahavyāvartanī (The Dispeller of Objections, v. 29)',
        constructiveResonance: '"If I had any thesis, I would be at fault. But I have no thesis, therefore I am free of error." Peak apophatic resistance against all dogmatic affirmation.',
        nonEquivalenceRemainder: 'Nāgārjuna treats unsaying as a therapeutic dialectic; Nihiltheism recognizes it also as an aesthetic and ontological gateway to pure potentiality.',
        epistemicTag: 'Axiomatic Invariant'
      },
      {
        philosopher: 'Nishitani Keiji',
        tradition: 'Kyoto School Zen',
        locus: 'Religion and Nothingness, Ch. III',
        constructiveResonance: 'Apophatic tension must not rest in mere negative theology (which remains a covert cataphasis); it must step onto the field of Śūnyatā itself.',
        nonEquivalenceRemainder: 'Nishitani engages European existentialists primarily; Nihiltheism builds modern algorithmic and epistemological discriminator systems.',
        epistemicTag: 'Dialectical Synthesis'
      },
      {
        philosopher: 'Emil Cioran',
        tradition: 'Aphoristic Skepticism',
        locus: 'The Temptation to Exist',
        constructiveResonance: 'Practices continuous unsaying as an uncompromising defense against fanaticism, asserting that every affirmation ends in an execution.',
        nonEquivalenceRemainder: 'Cioran’s tension is born of disgust and insomnia; Nihiltheism’s tension is born of mathematical clarity and serene Gelassenheit.',
        epistemicTag: 'Phenomenological Datum'
      },
      {
        philosopher: 'Sextus Empiricus',
        tradition: 'Pyrrhonean Skepticism',
        locus: 'Outlines of Pyrrhonism I.18–20',
        constructiveResonance: 'The skeptic’s phrases ("no more this than that", "I determine nothing") consume themselves like fire consuming fuel—pure apophatic unsaying.',
        nonEquivalenceRemainder: 'Pyrrhonism avoids metaphysics entirely; Nihiltheism establishes the metaphysics of groundless sacred freedom.',
        epistemicTag: 'Boundary Operator'
      },
      {
        philosopher: 'Albert Camus',
        tradition: 'Absurdist Existentialism',
        locus: 'The Myth of Sisyphus',
        constructiveResonance: 'Refuses to soften the silence of the cosmos with positive religious balm; tension is held through lucidity and obstinate defiance.',
        nonEquivalenceRemainder: 'Camus lacks a doctrine of sacred absence; his cosmos is silent and foreign, whereas Nihiltheism experiences the Void as sublime home.',
        epistemicTag: 'Phenomenological Datum'
      },
      {
        philosopher: 'Plato',
        tradition: 'Classical Eidetic Philosophy',
        locus: 'Republic VI (509b: Good is beyond Being / epekeina tes ousias)',
        constructiveResonance: 'Plato’s highest principle (the Good) is explicitly stated to be beyond being in dignity and power—the founding moment of Western apophasis.',
        nonEquivalenceRemainder: 'Platonism quickly became affirmative dogmatic metaphysics; Nihiltheism holds the line at epekeina tes ousias without building a new pyramid of being.',
        epistemicTag: 'Horizon-Bound / Unverifiable'
      }
    ],
    phase1: {
      primaryTarget: 'Cataphatic overconfidence, positive theology, anthropomorphic divinities, and the illusion that human grammar can circumscribe the Infinite.',
      corePillars: [
        {
          title: 'The Way of Unsaying (Via Negativa)',
          explanation: 'Truth is approached not by accumulating attributes, but by ruthlessly stripping away every false predicate until only luminous silence remains.'
        },
        {
          title: 'Boundary Resistance Factor',
          explanation: 'θapoph acts as a dynamic shield: whenever positive dogma tries to invade and colonize the Void, apophatic tension rises to repel the invasion.'
        },
        {
          title: 'Double Negation as Affirmation of Nothing',
          explanation: 'Negating the negation does not return to the original positive idol; it opens into unconditioned, radical freedom.'
        },
        {
          title: 'Apophatic Lucidity',
          explanation: 'The mind recognizes that silence is not ignorance, but the highest state of epistemic honesty.'
        }
      ],
      primaryTexts: [
        {
          author: 'Pseudo-Dionysius the Areopagite',
          treatise: 'Mystical Theology',
          locus: 'Chapter V: That the supreme Cause of all things sensible and intelligible is not any of these',
          context: 'Negating every imaginable category from God—affirming that It is neither soul, nor mind, nor magnitude, nor darkness, nor light, nor truth, nor kingship, nor error.'
        },
        {
          author: 'Emil Cioran',
          treatise: 'The Trouble with Being Born',
          locus: 'Aphorisms on Negation and Birth',
          context: 'Articulating active negation as an unrelenting existential hygiene against the vulgarity of dogmatic affirmation.'
        }
      ],
      literaryStyle: 'Sublime apophatic liturgy, hyperbolic paradoxical aphorism, and systematic systematic negation chains.'
    },
    phase2: {
      canonicalQuotes: [
        {
          quote: 'We pray that we may come unto this Darkness, and through lack of sight and knowledge see and know that which is above sight and knowledge.',
          source: 'Pseudo-Dionysius, Mystical Theology (I.1)',
          commentary: 'Apophatic tension reaches its peak when unknowing becomes the primary mode of cognition.'
        },
        {
          quote: 'Why do you preach about God? Whatever you say about God is a lie.',
          source: 'Meister Eckhart, Sermon on the Divine Nature',
          commentary: 'Positive affirmations are structural falsehoods when applied to the unconditioned.'
        }
      ],
      psychologicalFriction: {
        frictionType: 'Apophatic Vertigo & Conceptual Asphyxiation',
        phenomenologicalDescription: 'The acute cognitive strain of attempting to think without concepts and speak without predicates; feeling intellectual ground evaporate beneath one’s feet.',
        aporiaSignal: 'High θapoph (> 0.80) indicating intense boundary resistance where every sentence must immediately un-say itself.'
      },
      individualVsCollective: 'The collective demands positive slogans, manifestos, and creeds; the solitary thinker maintains apophatic vigilance, refusing to endorse any verbal idol.',
      specializedLexicon: [
        {
          term: 'Apophatic Tension (θapoph)',
          definition: 'The quantitative resilience with which a philosophical model prevents positive dogmas from colonizing the Void.'
        },
        {
          term: 'Via Negativa',
          transliteration: 'Latin: the negative way',
          definition: 'The methodological refusal to predicate affirmative qualities of the ultimate ground.'
        },
        {
          term: 'Gottheit',
          transliteration: 'German: Godhead / Divine Abyss',
          definition: 'The silent, unmanifest source beyond God the Creator in Rhineland mysticism.'
        }
      ]
    },
    phase3: {
      authenticSelfhood: 'Standing before existence without a theological contract; refusing to trade the awe of the open void for the comforting fairy tales of positive dogma.',
      threatsToIndividuality: [
        'The seduction of religious and political orthodoxies promising absolute certainty and group belonging.',
        'Spiritual bypass: using positive mysticism to avoid confronting raw existential angst.',
        'The fatigue of sustained negation, leading to regression into comfortable superstition.'
      ],
      subtractiveLeap: 'The Unsaying of the Ego: recognizing that the "I" is itself the ultimate cataphatic idol, and allowing it to dissolve into the silence of the Void.',
      personalAccountabilityInjunctions: [
        'Never let an affirmative claim stand without interrogating its unspoken shadows.',
        'Honor the silence that remains after every explanation has failed.',
        'Treat doubt not as a sin, but as the highest sacred faculty of the intellect.'
      ]
    },
    phase4: {
      strengths: [
        'Impervious to dogmatic refutation because it refuses to make dogmatic assertions.',
        'Shatters intellectual arrogance and religious fundamentalism at their root.',
        'Creates an infinite clearing for genuine, direct existential encounter.'
      ],
      vulnerabilities: [
        'Risk of falling into sterile silence where nothing can be said, shared, or built.',
        'Vulnerability to rhetorical acrobatics where obscurity is confused with profound depth.'
      ],
      structuralAutopsy: {
        contradiction: 'The Metric of the Inexpressible: Calculating apophatic tension as a mathematical function (θapoph = 1 - Affirmation/Total) assumes that unsaying can be reduced to algorithmic ratios.',
        formalMechanism: 'Language counts statements as tokens, but genuine apophasis occurs in the invisible pauses and unspoken intentionality between words.',
        aporia: 'An algorithm can parse syntax, but it cannot measure whether a silence is empty or transcendent.',
        invariantResolution: 'θapoph is calibrated against semantic intent and context vectors, serving as a structural mirror rather than an algorithmic judge.'
      },
      doctrinalAutopsy: {
        contradiction: 'Orthodoxy vs. Heresy: The doctrinal autopsy uncovers how the via negativa historically operated as a safety valve inside orthodox institutions while quietly subverting their foundations.',
        dogmaticReificationRisk: 'Institutions allow negative theology only on condition that it terminates in the Trinity or the Church’s authority.',
        aporia: 'Nihiltheism radicalizes apophasis to its terminal conclusion: removing even the Trinity, leaving only the unconditioned Void.',
        invariantResolution: 'Absolute apophasis refuses institutional containment: it leaves no doctrinal sanctuary unvisited.'
      },
      rhetoricalAutopsy: {
        contradiction: 'The Paradox of the Screaming Hermit: The rhetorical autopsy exposes the theatrical nature of passionate apophatic literature. The author cries out that language is useless while writing voluminous masterpieces.',
        stylisticParadox: 'The apophatic author is seduced by the beauty of the very language they are condemning to death.',
        aporia: 'Language is the executioner and the victim at the same time.',
        invariantResolution: 'Ironic awareness: embracing the tragicomedy of speech. We speak not because words suffice, but to celebrate their magnificent failure before the infinite.'
      },
      asymptoticInvariantHold: 'Optimal balance holds at θ = 0.81 in advanced epochs: maximum negative protection without speech loss.',
      constructiveSynthesis: {
        synthesizedElevationTheorem: 'Theorem of Apophatic Boundary Resilience: θapoph operates not as a sterile ban on articulation, but as a protective boundary operator that prevents positive theological capture, ensuring that language remains an unconditioned aperture onto the otherworldly horizon of pure potentiality.',
        boundaryMechanism: 'Maintains an active repulsion field against reifying projections, converting dogmatic affirmations into self-consuming apophatic ladders.',
        eideticPotentiality: 'By preserving the unconditioned clearing of the Void from dogmatic colonization, apophasis safeguards the timeless reservoir of eidetic potentiality from degradation.',
        actionableHeuristic: 'For every theoretical theorem formulated, append an apophatic codicil declaring its operational limits, preventing it from hardening into dogma.'
      },
      occurrenceVsElevation: {
        occurrenceTrap: 'Using negative theology as an intellectual weapon to silence opponents, feeding spiritual egoism.',
        elevationResolution: 'Surrendering into radical poverty of spirit (*paupertas spiritus*), becoming the silent clearing where reality meets itself.',
        empiricalScore: 0.22,
        elevationScore: 0.94,
        ratio: 4.27,
        statusBadge: 'Elevation-Dominant [Negative Clarity]'
      }
    }
  },

  gap: {
    id: 'gap',
    label: 'Phenomenological Gap',
    symbol: 'δgap',
    color: '#EC4899',
    bgGradient: 'from-pink-500 to-rose-600',
    description: 'Distance of subject-object dissolution; chasm between lived existential awareness and conceptual representation.',
    tensorFormula: 'δgap = ∥Ψ_lived(t) - Φ_represented(t)∥_Hilbert',
    defaultLens: 'structural',
    correlatedGraphNodeId: 'epoche',
    epistemicStatus: 'Phenomenological Datum',
    comparativePhilosophers: [
      {
        philosopher: 'Albert Camus',
        tradition: 'Absurdist Phenomenology',
        locus: 'The Myth of Sisyphus (The Absurd Walls)',
        constructiveResonance: 'Pinpoints the sudden estrangement when the scenery collapses and the stranger greets us: the chasm between human consciousness and silent world.',
        nonEquivalenceRemainder: 'Camus treats the gap as an absurd wall to be stubbornly defied; Nihiltheism treats the gap as the sacred opening of unconditioned freedom.',
        epistemicTag: 'Phenomenological Datum'
      },
      {
        philosopher: 'Nishitani Keiji',
        tradition: 'Kyoto School Zen',
        locus: 'Religion and Nothingness, Ch. I',
        constructiveResonance: 'Overcomes the Cartesian dualism of subject and object by stepping back onto the field of Śūnyatā, where both realize their non-dual emptiness.',
        nonEquivalenceRemainder: 'Nishitani expects full satori/enlightenment to close the gap; Nihiltheism tracks the gap as an enduring topological invariant of finite consciousness.',
        epistemicTag: 'Dialectical Synthesis'
      },
      {
        philosopher: 'Edmund Husserl',
        tradition: 'Transcendental Phenomenology',
        locus: 'The Crisis of European Sciences §41',
        constructiveResonance: 'Diagnoses the fatal gap created when the abstract mathematical idealizations of Galilean science replace the primordial Lebenswelt (life-world).',
        nonEquivalenceRemainder: 'Husserl seeks a rigorous scientific transcendental ego; Nihiltheism recognizes the ego as an empty projection arising from the abyss.',
        epistemicTag: 'Phenomenological Datum'
      },
      {
        philosopher: 'Meister Eckhart',
        tradition: 'Rhineland Mysticism',
        locus: 'Sermon on the Eye of God',
        constructiveResonance: '"The eye wherein I see God is the same eye wherein God sees me"—transcending the subject-object gap at the apex of contemplation.',
        nonEquivalenceRemainder: 'Eckhart clothes the insight in monotheistic divine communion; Nihiltheism strips away the divine subject, leaving pure awareness without observer.',
        epistemicTag: 'Boundary Operator'
      },
      {
        philosopher: 'Nāgārjuna',
        tradition: 'Madhyamaka Buddhism',
        locus: 'MMK Ch. XVIII (Ātma-parīkṣā)',
        constructiveResonance: 'Demonstrates that neither the self nor the world possesses independent existence; the gap dissolves when both sides are seen as empty designations.',
        nonEquivalenceRemainder: 'Madhyamaka prioritizes linguistic deconstruction; Nihiltheism measures the affective existential vertigo of modern lived experience.',
        epistemicTag: 'Axiomatic Invariant'
      },
      {
        philosopher: 'Emil Cioran',
        tradition: 'Existential Pessimism',
        locus: 'The Fall into Time',
        constructiveResonance: 'Describes human consciousness as an unhealable fracture in the cosmos: to be conscious is to be separated forever from the innocence of being.',
        nonEquivalenceRemainder: 'Cioran laments this fracture as a curse; Nihiltheism transmutes it into the lucid condition for aesthetic contemplation and sacred freedom.',
        epistemicTag: 'Phenomenological Datum'
      },
      {
        philosopher: 'Plato',
        tradition: 'Classical Epistemology',
        locus: 'Meno (The Paradox of Inquiry) & Phaedrus (Anamnesis)',
        constructiveResonance: 'The soul feels the gap between sensible particulars and the eternal forms, experienced as divine nostalgia and longing (eros).',
        nonEquivalenceRemainder: 'Plato demands recollecting pre-existent memories of heaven; Nihiltheism understands the forms as emergent symmetries of the groundless void.',
        epistemicTag: 'Horizon-Bound / Unverifiable'
      }
    ],
    phase1: {
      primaryTarget: 'Cartesian dualism, epistemological naive realism, and the myth that the conscious subject stands outside reality looking through a clear glass pane.',
      corePillars: [
        {
          title: 'The Insoluble Chasm (Hiatus Irrationalis)',
          explanation: 'Between the raw immediacy of lived consciousness (Erlebnis) and the dead symbols of language lies an irreducible, unbridgeable distance.'
        },
        {
          title: 'Subject-Object Dissolution Vector',
          explanation: 'In the limit experience of the Void, the artificial split between the observing self and the observed world collapses into pure presence.'
        },
        {
          title: 'Phenomenological Vigilance',
          explanation: 'Continuously tracking the distortion introduced whenever lived experience is translated into public ideological currency.'
        },
        {
          title: 'Epistemic Humility',
          explanation: 'Accepting that our theories are not mirrors of nature, but provisional maps drawn across an unfathomable ocean.'
        }
      ],
      primaryTexts: [
        {
          author: 'Edmund Husserl',
          treatise: 'Cartesian Meditations & The Crisis of European Sciences',
          locus: '§41: The Phenomenological Reduction and the Life-World (Lebenswelt)',
          context: 'Diagnosing the crisis of modern science as the substitution of mathematical idealizations for the original, concrete life-world.'
        },
        {
          author: 'Albert Camus',
          treatise: 'The Myth of Sisyphus',
          locus: 'An Absurd Reasoning: The Absurd Walls',
          context: 'Describing the feeling of absurdity as the sudden estrangement between man and the world: the gap where familiarity dissolves into cosmic alienness.'
        }
      ],
      literaryStyle: 'Phenomenological reduction, evocative existential description, and relentless analysis of cognitive alienation.'
    },
    phase2: {
      canonicalQuotes: [
        {
          quote: 'The world evades us because it becomes itself again. The stage sets collapse. Rising, streetcar, four hours in the office... then the stranger greets us.',
          source: 'Albert Camus, The Myth of Sisyphus (p. 14)',
          commentary: 'δgap measures the sudden emergence of the absurd gap between routine and reality.'
        },
        {
          quote: 'On the field of Emptiness, the self is itself only in so far as it is not itself; the object is itself only in so far as it is not itself.',
          source: 'Nishitani Keiji, Religion and Nothingness (p. 148)',
          commentary: 'Subject-object dissolution closes the phenomenal gap not by merging substances, but by seeing both as empty.'
        }
      ],
      psychologicalFriction: {
        frictionType: 'Existential Alienation & Cosmic Estrangement (Unheimlichkeit)',
        phenomenologicalDescription: 'The eerie realization that despite all our science and philosophy, we remain profound strangers in an indifferent universe; the gap between mind and matter will not heal.',
        aporiaSignal: 'Expansion in δgap indicating an acute crisis of meaning where words become hollow sounds.'
      },
      individualVsCollective: 'Society invents entertainment, domesticity, and corporate careers to fill the phenomenological gap; the lucid thinker steps directly into the chasm.',
      specializedLexicon: [
        {
          term: 'Phenomenological Gap (δgap)',
          definition: 'The measurable distance between raw experiential awareness and theoretical representation.'
        },
        {
          term: 'Hiatus Irrationalis',
          transliteration: 'Latin: the irrational chasm',
          definition: 'The permanent metaphysical fracture between logical categories and concrete existence.'
        },
        {
          term: 'Epoché of the Object',
          definition: 'Suspending belief in the independent existence of the external object to observe its presence in consciousness.'
        }
      ]
    },
    phase3: {
      authenticSelfhood: 'Living in the gap without despair; transforming the alienation of the absurd into the unconditioned freedom of the lucid rebel.',
      threatsToIndividuality: [
        'The craving for epistemic omniscience that pretends the gap has been closed by technology or dogma.',
        'Psychological dissociation: retreating into purely theoretical abstractions to avoid feeling the raw wound of existence.',
        'Consolatory romanticism that invents synthetic cosmic unities to escape lucidity.'
      ],
      subtractiveLeap: 'The Absurd Revolt: choosing to live with the unhealable gap without committing physical or philosophical suicide (refusing both despair and false faith).',
      personalAccountabilityInjunctions: [
        'Never mistake a description of a thing for the reality of the thing.',
        'Acknowledge the permanent blind spot at the center of your own consciousness.',
        'Transform the estrangement of the gap into deep reverence for the mystery of being.'
      ]
    },
    phase4: {
      strengths: [
        'Vindicates the primacy of lived experience over bloodless academic abstractions.',
        'Prevents cognitive imperialism: reminds researchers that models are always incomplete.',
        'Builds a direct bridge between rigorous phenomenology and existential ethics.'
      ],
      vulnerabilities: [
        'Risk of solipsism: concluding that because the gap cannot be bridged, communication between minds is impossible.',
        'Danger of epistemological fatalism: abandoning all scientific inquiry as futile.'
      ],
      structuralAutopsy: {
        contradiction: 'Quantifying the Unrepresentable Distance: How can an analytical index measure the distance between a concept and that which lies outside all concepts?',
        formalMechanism: 'The Hilbert space projection treats consciousness as a state vector, which is itself a conceptual representation.',
        aporia: 'The ruler we use to measure the gap is forged inside the very territory that the gap alienates us from.',
        invariantResolution: 'δgap operates phenomenologically as a qualitative horizon indicator rather than a Newtonian yardstick.'
      },
      doctrinalAutopsy: {
        contradiction: 'The False Promise of Revelation: The doctrinal autopsy reveals how theological dogmas promise to bridge the gap through divine grace or mystical union, only to substitute an even thicker layer of ecclesiastical symbols.',
        dogmaticReificationRisk: 'Religions turn the gap into "sin" or "fallenness" that requires their proprietary priesthood to forgive and bridge.',
        aporia: 'Nihiltheism insists the gap is not a moral defect or cosmic catastrophe; it is the ontological condition of conscious life.',
        invariantResolution: 'Accepting the gap as the sacred opening of freedom rather than a fall from grace.'
      },
      rhetoricalAutopsy: {
        contradiction: 'The Melodrama of Alienation: Rhetorical autopsy reveals a tendency toward romantic dramatization of the gap (the dramatic sigh, the trembling hero).',
        stylisticParadox: 'The author exploits the agony of the gap to create compelling literary entertainment.',
        aporia: 'The aesthetic enjoyment of alienation undermines the sobriety of the philosophical critique.',
        invariantResolution: 'Adopting a dry, topological, and mathematically poised language that reports the gap with scientific and spiritual equanimity.'
      },
      asymptoticInvariantHold: 'Reaches asymptotic stabilization at δgap = 0.85 in advanced convergence: the gap is acknowledged, witnessed, and held without illusion.',
      constructiveSynthesis: {
        synthesizedElevationTheorem: 'Theorem of the Open Chasm: The phenomenological gap δgap is not a cognitive defect to be conquered, but the sacred expanse wherein finite consciousness encounters its own boundless freedom, transmuting absurd estrangement into contemplative intimacy with the void.',
        boundaryMechanism: 'De-reifies representational certitude by continuously measuring the Hilbert distance between conceptual projection and lived immediacy.',
        eideticPotentiality: 'The gap is the exact liminal space where the eidetic forms become visible: not as physical objects in the world, but as timeless configurations of consciousness.',
        actionableHeuristic: 'When feeling alienated by conceptual systems, pause, close your eyes, and inhabit the raw gap between the word and the breath.'
      },
      occurrenceVsElevation: {
        occurrenceTrap: 'Interpreting the gap as psychological loneliness, depression, or a defect in need of pharmaceutical or dogmatic sedation.',
        elevationResolution: 'Recognizing the gap as the unconditioned horizon of the sacred, standing in lucid gratitude before the ungrounded presence of being.',
        empiricalScore: 0.35,
        elevationScore: 0.89,
        ratio: 2.54,
        statusBadge: 'Elevation-Dominant [Phenomenological Awe]'
      }
    }
  }
};

export const getDifferentialPairwiseProfile = (
  metricAId: string,
  metricBId: string
): DifferentialPairwiseProfile => {
  const profileA = PHILOCRASH_METRIC_PROFILES[metricAId] || PHILOCRASH_METRIC_PROFILES.composite;
  const profileB = PHILOCRASH_METRIC_PROFILES[metricBId] || PHILOCRASH_METRIC_PROFILES.density;

  const pairKey = [metricAId, metricBId].sort().join('_');

  const KNOWN_DIFFERENTIALS: Record<string, Partial<DifferentialPairwiseProfile>> = {
    apophatic_density: {
      title: 'Apophatic Tension vs. Ontological Density',
      divergenceVector: '∇(θapoph ⊥ ρonto)',
      covarianceRatio: -0.78,
      constructiveSynthesisIndex: 0.91,
      crossInterferenceDiagnosis: 'Inverse polarization: High ontological density acts as an invasive mass that compresses apophatic tension; conversely, maximal apophatic tension systematically evacuates essentialist density.',
      synthesizedTheorem: 'Law of Kenotic Equilibrium: As ontological density approaches the critical minimum (ρonto → 0.18), apophatic tension stabilizes from reactive resistance into a transparent, luminous horizon of pure potentiality.',
      dialecticalResolution: 'Rather than fighting substantive language, the thinker treats every noun as a transparent aperture into the groundless Void.'
    },
    composite_divergence: {
      title: 'Composite Disparity vs. Topological Divergence',
      divergenceVector: '∇(Δtotal ∥ Δλ)',
      covarianceRatio: 0.84,
      constructiveSynthesisIndex: 0.87,
      crossInterferenceDiagnosis: 'Coupled propagation: Topological divergence between anchor vertices acts as the primary driving engine that inflates the composite disparity across the entire tensor manifold.',
      synthesizedTheorem: 'Theorem of Structural Dispersion: Systemic disparity is not diffuse chaos, but the lawful integration of specific eigenvalue divergences between incommensurable metaphysical frameworks.',
      dialecticalResolution: 'By isolating the primary divergent eigenvalue (Δλ), the practitioner can surgically reduce composite tension without suppressing philosophical nuance.'
    },
    gap_apophatic: {
      title: 'Phenomenological Gap vs. Apophatic Tension',
      divergenceVector: '∇(δgap ⊗ θapoph)',
      covarianceRatio: 0.65,
      constructiveSynthesisIndex: 0.89,
      crossInterferenceDiagnosis: 'Sympathetic resonance: The wider the experienced gap between lived reality and conceptual signs, the stronger the imperative to deploy negative theological unsaying to prevent reification.',
      synthesizedTheorem: 'Theorem of Phenomenological Kenosis: Apophatic unsaying is the exact rhetorical counterpart to the phenomenological gap, ensuring that consciousness does not mistake its conceptual maps for the unconditioned territory.',
      dialecticalResolution: 'The chasm of the gap is inhabited not as a wound of alienation, but as the silent temple of apophatic contemplation.'
    }
  };

  const existing = KNOWN_DIFFERENTIALS[pairKey];
  if (existing) {
    return {
      pairKey,
      metricAId,
      metricBId,
      title: existing.title || `${profileA.label} vs. ${profileB.label}`,
      divergenceVector: existing.divergenceVector || `∇(${profileA.symbol} ⊗ ${profileB.symbol})`,
      covarianceRatio: existing.covarianceRatio ?? -0.45,
      constructiveSynthesisIndex: existing.constructiveSynthesisIndex ?? 0.82,
      crossInterferenceDiagnosis: existing.crossInterferenceDiagnosis || `Interference pattern between ${profileA.label} and ${profileB.label}: dynamic resonance across ontological tensor.`,
      synthesizedTheorem: existing.synthesizedTheorem || `Theorem of Cross-Metric Synthesis: The interaction of ${profileA.symbol} and ${profileB.symbol} maps the operational boundary where dogmatic friction transmutes into eidetic clarity.`,
      dialecticalResolution: existing.dialecticalResolution || `Balance the dialectical tension between ${profileA.label} and ${profileB.label} through systematic subtractive epoché.`
    };
  }

  return {
    pairKey,
    metricAId,
    metricBId,
    title: `${profileA.label} vs. ${profileB.label}`,
    divergenceVector: `∇(${profileA.symbol} ⊗ ${profileB.symbol})`,
    covarianceRatio: -0.52,
    constructiveSynthesisIndex: 0.85,
    crossInterferenceDiagnosis: `Differential analysis between ${profileA.label} (${profileA.symbol}) and ${profileB.label} (${profileB.symbol}) reveals an orthogonal tension between formal representation and apophatic clearing.`,
    synthesizedTheorem: `Theorem of Bipolar Ontological Resonance: The conjugate variance of ${profileA.symbol} and ${profileB.symbol} delineates the exact operational perimeter wherein conceptual reification collapses to reveal unconditioned potentiality.`,
    dialecticalResolution: `Operate the two metrics as complementary boundary operators: let ${profileA.symbol} audit structural limits while ${profileB.symbol} preserves affective and phenomenological lucidity.`
  };
};
