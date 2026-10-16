export type AutopsyLens = 'structural' | 'doctrinal' | 'rhetorical' | 'tripartite';

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
  phase1: PhilocrashPhase1;
  phase2: PhilocrashPhase2;
  phase3: PhilocrashPhase3;
  phase4: PhilocrashPhase4;
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
      asymptoticInvariantHold: 'Stabilized at θ = 0.18: At this critical boundary, ideological densification is systematically minimized, allowing active negation to function as an unconditioned vector of clarity.'
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
          treatise: 'Outlines of Pyrrhonism (Pyrrhonean Hypotyposes)',
          locus: 'Book I, Chapters 12–15',
          context: 'Systematizing the Ten Tropes of Epoché to demonstrate that for every dogmatic assertion, an equally persuasive counter-assertion exists (isostheneia), causing divergence.'
        },
        {
          author: 'Jacques Derrida',
          treatise: 'Margins of Philosophy',
          locus: 'Différance (pp. 1–28)',
          context: 'Exposing how meaning is perpetually deferred and differentiated, preventing any concept from achieving self-identical presence.'
        },
        {
          author: 'Gilles Deleuze',
          treatise: 'Difference and Repetition',
          locus: 'Chapter I: Difference in Itself',
          context: 'Establishing difference as ontologically primary over identity, proving that divergence is not a failure of unity but the genesis of thought.'
        }
      ],
      literaryStyle: 'Comparative diachronic analysis utilizing matrix algebra metaphors and Pyrrhonian counter-positioning.'
    },
    phase2: {
      canonicalQuotes: [
        {
          quote: 'To every argument an equal argument is opposed.',
          source: 'Sextus Empiricus, Outlines of Pyrrhonism (I.12)',
          commentary: 'The foundation of topological divergence: opposing vectors cancel dogmatic certainty.'
        },
        {
          quote: 'Différance is neither a word nor a concept, but the active movement of differing and deferring.',
          source: 'Jacques Derrida, Différance',
          commentary: 'Eigenvalue drift measures the unavoidable deferral of ultimate semantic closure.'
        },
        {
          quote: 'The idea of a single ultimate truth is the mother of all fanaticisms.',
          source: 'Emil Cioran, A Short History of Decay',
          commentary: 'Divergence acts as a prophylactic against ideological monism.'
        }
      ],
      psychologicalFriction: {
        frictionType: 'Hermeneutic Disorientation',
        phenomenologicalDescription: 'The dizziness experienced when comparing two profound worldviews and realizing that neither can subsume the other, leaving the thinker without a supreme umpire.',
        aporiaSignal: 'Sudden expansion in Δλ indicating radical incommensurability between ingested treatises.'
      },
      individualVsCollective: 'Institutions enforce dogmatic harmony to prevent civic fragmentation; the authentic investigator welcomes divergence as proof of mental freedom.',
      specializedLexicon: [
        {
          term: 'Topological Divergence (Δλ)',
          definition: 'The angular separation between foundational axioms across distinct ontological matrices.'
        },
        {
          term: 'Isostheneia',
          transliteration: 'Greek: equal strength',
          definition: 'The equilibrium between opposing arguments that necessitates the suspension of judgment.'
        },
        {
          term: 'Spectral Drift',
          definition: 'The gradual wandering of a philosophical term away from its historical origin under dialectical stress.'
        },
        {
          term: 'Anchor Vertex',
          definition: 'A seminal concept or thinker serving as a benchmark in comparative graph analysis.'
        }
      ]
    },
    phase3: {
      authenticSelfhood: 'Dwelling in the tension of divergent perspectives without rushing into synthetic closure or dogmatic allegiance.',
      threatsToIndividuality: [
        'Totalizing intellectual orthodoxies that punish conceptual deviation.',
        'Intellectual sloth that harmonizes contradictions by ignoring foundational distinctions.',
        'Sectarian tribalism that identifies identity with a single canonical line.'
      ],
      subtractiveLeap: 'Abandoning the requirement for a master narrative: accepting that the map of knowledge is an open archipelago separated by unbridgeable abysses.',
      personalAccountabilityInjunctions: [
        'Resist flattening nuanced historical disputes into vague generalities.',
        'Track divergence ruthlessly, especially when it challenges personal favorite theories.',
        'Treat every divergence as an invitation to deeper Epoché.'
      ]
    },
    phase4: {
      strengths: [
        'Unmasks superficial syncretism that conflates disparate traditions (e.g. naive equating of Christian kenosis with Buddhist śūnyatā).',
        'Quantifies the exact conceptual cost of comparative philosophical translation.',
        'Protects against dogmatic totalization by demonstrating plural eigenvalue trajectories.'
      ],
      vulnerabilities: [
        'Risk of relativist despair: concluding that because divergence exists, all claims are equally vacuous.',
        'Mathematical formalism that threatens to substitute geometric spatial analogies for deep semantic reading.'
      ],
      structuralAutopsy: {
        contradiction: 'Metric Invariance vs. Relational Drift: Can a single metric validly measure distance between frameworks whose very definition of "distance" and "truth" differ fundamentally?',
        formalMechanism: 'Projecting divergent systems onto a unified coordinate space assumes a meta-space that neither system author authorized.',
        aporia: 'The meta-framework that measures divergence must either belong to one of the systems (biasing the result) or claim absolute transcendence (violating Nihiltheism).',
        invariantResolution: 'The divergence tensor is acknowledged as an heuristic, immanent diagnostic instrument rather than an absolute celestial compass.'
      },
      doctrinalAutopsy: {
        contradiction: 'Perennialist Harmony vs. Irreducible Rift: The doctrinal autopsy exposes the fatal tension between the perennialist hope for a single universal secret and the nihiltheistic insistence on irremediable abyss.',
        dogmaticReificationRisk: 'Interfaith dialogues habitually sanitize radical thinkers to manufacture comfortable ecumenical consensus.',
        aporia: 'If all roads lead to the same Void, divergence is an illusion; if they do not, there is no single Void to speak of.',
        invariantResolution: 'The Void is not a common denominator or shared substance; it is the unique silence into which every distinct system collapses on its own terms.'
      },
      rhetoricalAutopsy: {
        contradiction: 'The Rhetoric of Comparison: Comparing two thinkers requires speaking in a third language that inevitably betrays the idiomatic precision of both original voices.',
        stylisticParadox: 'The terminology of divergence pretends to stand outside the fray while actively participating in the fray.',
        aporia: 'We speak of divergence to achieve clarity, but the more precisely divergence is mapped, the more impossible definitive synthesis becomes.',
        invariantResolution: 'Rhetorical transparency: explicitly declaring the provisional nature of the comparative apparatus at every iteration.'
      },
      asymptoticInvariantHold: 'Eigenvalues stabilize when anchor vertices cease asserting exclusive monopoly over the ontological horizon.'
    }
  },

  density: {
    id: 'density',
    label: 'Ontological Density',
    symbol: 'ρonto',
    color: '#06B6D4',
    bgGradient: 'from-cyan-500 to-blue-600',
    description: 'Degree of conceptual reification and ontological weight across textual propositions.',
    tensorFormula: 'ρonto = ∑ (w_i · Substantia_i) / Vol(Discourse)',
    defaultLens: 'doctrinal',
    correlatedGraphNodeId: 'nihil',
    phase1: {
      primaryTarget: 'Substance-metaphysics, essentialism, and the compulsive human habit of turning fluid linguistic processes into hard, eternal objects.',
      corePillars: [
        {
          title: 'Critique of Reification (Verdinglichung)',
          explanation: 'Concepts are not metaphysical furniture; they are ephemeral heuristic models that harden into idols when unexamined.'
        },
        {
          title: 'Subtractive De-densification',
          explanation: 'Genuine philosophical progress is not the accumulation of heavier doctrines, but the systematic subtraction of superfluous ontological baggage.'
        },
        {
          title: 'Inverse Correlation to Lucidity',
          explanation: 'As ontological density increases, existential freedom decreases; high density indicates heavy metaphysical sclerosis.'
        },
        {
          title: 'Apophatic Solvency',
          explanation: 'Active Nihil dissolves dense conceptual deposits, restoring the mind to transparent, unencumbered receptivity.'
        }
      ],
      primaryTexts: [
        {
          author: 'Friedrich Nietzsche',
          treatise: 'Twilight of the Idols',
          locus: 'How the "True World" Finally Became a Fable',
          context: 'Chronicles the four-stage de-densification of Western metaphysics from Plato to the death of God, showing how the "true world" dissolved into smoke.'
        },
        {
          author: 'Martin Heidegger',
          treatise: 'Being and Time & What is Metaphysics?',
          locus: 'The Question of the Anstoss / Das Nichts',
          context: 'Diagnosing the Western "oblivion of Being" as an obsession with entities (high ontological density) at the expense of the ontological difference and the Nothing.'
        },
        {
          author: 'Nāgārjuna',
          treatise: 'Mūlamadhyamakakārikā',
          locus: 'Chapter XV: Examination of Svabhāva (Intrinsic Essence)',
          context: 'Demonstrating that any entity possessing intrinsic essence (svabhāva) could neither change, originate, nor cease—proving that high density is impossible in reality.'
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
          quote: 'The Nothing is neither an object nor anything that "is" at all. It occurs neither by itself nor "apart from" beings.',
          source: 'Martin Heidegger, What is Metaphysics? (p. 98)',
          commentary: 'The clearing is not another heavy entity, but the zero-density horizon in which entities show up.'
        },
        {
          quote: 'Those who see essence and non-essence, existence and non-existence, do not see the truth of the Buddha’s teaching.',
          source: 'Nāgārjuna, Mūlamadhyamakakārikā XV.6',
          commentary: 'High density is the cognitive illusion that things exist by virtue of self-subsistent core identity.'
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
          term: 'Petrification of the Word',
          definition: 'The cognitive decline wherein metaphor hardens into literal metaphysical dogma.'
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
        contradiction: 'The Heavy Prose of De-densifiers: Thinkers who critique density (Heidegger, Derrida, Hegel) frequently write the densest, most impenetrable prose in human history.',
        stylisticParadox: 'Using monstrous neologisms and massive syntactic structures to announce the arrival of lightness and simplicity.',
        aporia: 'Language must become extraordinarily dense to crack open the density of common sense.',
        invariantResolution: 'Cultivating the sharp, concise aphorism (Nietzsche, Cioran) as the authentic rhetorical vehicle of low density.'
      },
      asymptoticInvariantHold: 'Optimal state reached at ρonto = 0.18: sufficient density to sustain rational communication, insufficient to permit ideological tyranny.'
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
        },
        {
          author: 'Meister Eckhart',
          treatise: 'Sermon 83: Renovamini spiritu',
          locus: 'On the Divine Wilderness',
          context: 'Praying: "God, rid me of God"—the ultimate apophatic plea to surpass the personal creator deity to enter the silent wilderness of the Gottheit.'
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
          quote: 'I have dreamed of an intellectual hygiene that would eliminate all assertions, leaving only clean doubt.',
          source: 'Emil Cioran, Notebooks',
          commentary: 'θapoph is the mathematical index of this intellectual hygiene.'
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
          term: 'Kenotic Unsaying',
          definition: 'The deliberate evacuation of propositional certainty in favor of radical presence.'
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
        'Vulnerability to rhetorical acrobatics where obscurity is confused with profound depth.',
        'Psychological danger of melancholic isolation when negation is decoupled from generative awe.'
      ],
      structuralAutopsy: {
        contradiction: 'The Metric of the Inexpressible: Calculating apophatic tension as a mathematical function (θapoph = 1 - Affirmation/Total) assumes that unsaying can be reduced to algorithmic ratios.',
        formalMechanism: 'Language counts statements as tokens, but genuine apophasis occurs in the invisible pauses and unspoken intentionality between words.',
        aporia: 'An algorithm can parse syntax, but it cannot measure whether a silence is empty or transcendent.',
        invariantResolution: 'θapoph is calibrated against semantic intent and context vectors, serving as a structural mirror rather than an algorithmic judge.'
      },
      doctrinalAutopsy: {
        contradiction: 'Orthodoxy vs. Heresy: The doctrinal autopsy uncovers how the via negativa historically operated as a safety valve inside orthodox institutions (e.g. Christian monasteries) while quietly subverting their foundations.',
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
      asymptoticInvariantHold: 'Optimal balance holds at θ = 0.81 in advanced epochs: maximum negative protection without speech loss.'
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
        },
        {
          author: 'Keiji Nishitani',
          treatise: 'Religion and Nothingness',
          locus: 'Chapter I: What is Religion? (The Field of Śūnyatā)',
          context: 'Overcoming the Cartesian cogito by realizing that the subject and object are both grounded in the field of absolute emptiness.'
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
        },
        {
          quote: 'No concept can ever capture the taste of the apple, much less the terror of the abyss.',
          source: 'Peter Wessel Zapffe, The Last Messiah',
          commentary: 'The phenomenological gap is the permanent scar of human consciousness.'
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
        },
        {
          term: 'Field of Śūnyatā',
          definition: 'The non-dual horizon where the dualism of subject and object dissolves.'
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
        formalMechanism: 'The Hilbert space projection (∥Ψ_lived - Φ_rep∥) treats consciousness as a state vector, which is itself a conceptual representation.',
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
        contradiction: 'The Melodrama of Alienation: Rhetorical autopsy of existentialist literature reveals a tendency toward romantic dramatization of the gap (the dramatic sigh, the trembling hero, the weeping philosopher).',
        stylisticParadox: 'The author exploits the agony of the gap to create compelling literary entertainment.',
        aporia: 'The aesthetic enjoyment of alienation undermines the sobriety of the philosophical critique.',
        invariantResolution: 'Adopting a dry, topological, and mathematically poised language that reports the gap with scientific and spiritual equanimity.'
      },
      asymptoticInvariantHold: 'Reaches asymptotic stabilization at δgap = 0.85 in advanced convergence: the gap is acknowledged, witnessed, and held without illusion.'
    }
  }
};
