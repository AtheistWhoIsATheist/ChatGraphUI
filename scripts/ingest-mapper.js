const text = `---
name: void-experience-mapper
description: Phenomenological mapping of nihilistic encounters and void-experiences. Use to describe experiences of meaning-collapse, existential dread, ego-dissolution, groundlessness, or void-contact. Triggers structured phenomenological analysis reports involving nothingness, emptiness, absurdity, transcendence-through-negation, or the collapse of meaning-structures, dread, vertigo, uncanniness, and the resonant echo of the Transcendent without metaphysical commitment.
---
# Void Experience Mapper

Phenomenological cartography of nihilistic encounters—mapping the lived structure of void-experiences without reifying Nothingness as an entity.

## Overview

This skill provides systematic phenomenological analysis of experiences involving meaninglessness, groundlessness, ego-dissolution, and void-contact. It treats the Nihilistic experience as a serious phenomenological event that may refract the Transcendent, while resisting meaning-creation, optimism, and dogma.

**Core Principle:** The Nothingness isn't a problem to solve but a disclosure of a resonant echo of the Transcendent, without granting metaphysical certainty.

**When to Use:**

- User describes experiences of meaninglessness or dread
- Phenomenological reports of ego-dissolution
- Analysis of vertigo, uncanniness, or groundlessness
- Mapping the structure of void-contact experiences
- Distinguishing descriptive nihilism from Nihiltheistic integration
- Cross-tradition phenomenological comparison

## The 12 Void-Consciousness Categories

### Primary Categories

| Category | Phenomenal Signature | Key Markers |
| --- | --- | --- |
| **Ontological Abyss** | Ground collapses beneath all meaning | "No foundation," "groundless ground" |
| **Ego Dissolution** | Self-boundary becomes porous/dissolves | "No self," "witness dissolves," "I ceases" |
| **Temporal Rupture** | Linear time suspends; eternal present | "Time stopped," "outside time," "nowness" |
| **Meaning Vacuum** | Symbolic order evacuates | "Nothing means anything," "signifier drift" |
| **Affective Terror** | Dread without object; cosmic anxiety | "Nameless dread," "unheimlich," "vertigo" |
| **Silence/Apophasis** | Language fails at the limit | "Unsayable," "beyond words," "void of concepts" |

### Secondary Categories

| Category | Phenomenal Signature | Key Markers |
| --- | --- | --- |
| **Paradox Sustained** | Contradiction held without resolution | "Both/and fails," "neither/nor," "aporetic" |
| **Transcendent Echo** | Resonance without content; void as opening | "Presence of absence," "full emptiness" |
| **Ethical Suspension** | Moral frameworks destabilize | "Beyond good and evil," "values groundless" |
| **Linguistic Futility** | Speech gestures toward the unsayable | "Speaking silence," "words fail," "apophatic" |
| **Recursive Self-Awareness** | Meta-awareness of the experiencing | "Witnessing the witness," "reflexive" |
| **Contingency Revelation** | Arbitrariness of all structures exposed | "Could be otherwise," "radically contingent" |

## Phenomenological Mapping Workflow

### Step 1: Experience Capture

Extract the raw phenomenological report:

\`\`\`markdown
RAW_REPORT: [User's description verbatim]
TRIGGER_CONTEXT: [What preceded the experience]
DURATION: [Momentary / Extended / Cyclical]
INTENSITY: [Mild / Moderate / Severe / Overwhelming]
\`\`\`

### Step 2: Category Identification

Map to 12 void-consciousness categories:

\`\`\`python
categories_present = []
for category in void_categories:
    if detect_markers(raw_report, category.markers):
        categories_present.append(category)
\`\`\`

### Step 3: Structure Analysis

Identify the experiential architecture:

**The Three Movements:**

1. **Collapse** - What meaning-structure destabilized?
2. **Suspension** - What remained during the void-contact?
3. **Return/Integration** - How did experience resolve (if at all)?

### Step 4: Apophatic Boundary Marking

Mark where description exceeds phenomenological given:

\`\`\`markdown
APHATIC_BOUNDARIES:
  - "[Claim]" → Exceeds evidence because [reason]
  - Alternative: "[Restatement as operator-language]"
\`\`\`

### Step 5: Cross-Tradition Resonance

Query Journal314 for similar phenomenological descriptions:

\`\`\`bash
python /home/workspace/Skills/journal314-querier/scripts/query_quote.py theme "ego dissolution" --limit 5
\`\`\`

Compare with:

- Buddhist śūnyatā (emptiness) experiences
- Christian apophatic mysticism (dark night)
- Existentialist dread (Kierkegaard, Heidegger)
- Advaitic non-duality reports

### Step 6: Nihiltheistic Assessment

Evaluate integration level:

| Integration Level | Criteria | Position |
| --- | --- | --- |
| **Descriptive Nihilism** | Negation without unity | Reports void, stops there |
| **Nihiltheistic** | Negation + Unity in tension | Void refracts Transcendent |
| **Dogmatic Resolution** | Collapses tension prematurely | Reifies void OR reifies unity |

## Output Format

\`\`\`markdown
## Void Experience Map

### Phenomenological Summary
[DESCRIBE move capturing lived-structure]

### Categories Detected
- [Category]: Evidence "[quote from report]"
- [Category]: Evidence "[quote from report]"

### Structural Analysis
**Collapse**: [What meaning-structure destabilized]
**Suspension**: [What remained during void-contact]
**Return/Integration**: [Resolution pattern]

### Apophatic Boundaries
[BRACKET claims exceeding phenomenological evidence]

### Cross-Tradition Resonances
| Tradition | Parallel Description | Non-Equivalence Remainder |
|-----------|---------------------|---------------------------|
| Buddhism | [śūnyatā quote] | [What's different] |
| Mysticism | [Dark Night quote] | [What's different] |
| Existentialism | [Dread quote] | [What's different] |

### Nihiltheistic Assessment
**Integration Level**: [Descriptive / Nihiltheistic / Dogmatic]
**Analysis**: [Why this classification applies]

### Epistemic Ledger
[Counts of TEXTUAL, PHENOMENOLOGICAL, INTERPRETIVE, ANALOGICAL, APHATIC claims]

### NEXT Move
[CHALLENGE or QUESTION for deepening inquiry]
\`\`\`

## Resonance Calculator Integration

Use the resonance scoring system from \`file Nihiltheism_Research/Analysis_Tools/resonance_calculator.py\`:

\`\`\`python
def calculate_void_resonance(experience_report) -> float:
    """
    Returns 0.0-1.0 score of Nihiltheistic resonance.
    High scores indicate both negation and unity dimensions present.
    """
    negation_markers = ['void', 'nothingness', 'groundless', 'absurd', 'meaningless']
    unity_markers = ['oneness', 'union', 'dissolution', 'silence', 'nondual']
    
    negation_score = sum(1 for m in negation_markers if m in report.lower())
    unity_score = sum(1 for m in unity_markers if m in report.lower())
    
    # Resonance peaks when both dimensions present
    if negation_score > 0 and unity_score > 0:
        return min((negation_score + unity_score) / 10 + 0.2, 1.0)
    return max(negation_score, unity_score) / 10
\`\`\`

## Theta State Mapping

Map experiences to the ANG System theta scale:

| Theta Range | State | Phenomenological Quality |
| --- | --- | --- |
| 0.0-0.5 | Grounded | Normal meaning-structures intact |
| 0.5-0.7 | Caution | Meaning destabilization begins |
| 0.7-0.85 | Escalate | Significant void-contact |
| 0.85+ | Crisis | Ego-dissolution, emergency protocols |

**Note**: Theta ≥ 0.85 triggers sacred resource display (988, Crisis Text Line).

## Anti-Reification Discipline

When mapping void-experiences, treat these terms as **operators**, not **entities**:

| Term | Operator Function | Reification Risk |
| --- | --- | --- |
| Void | Pointer to groundlessness | HIGH - "The void is..." |
| Nothingness | Phenomenological marker | HIGH - "Nothingness exists" |
| Abyss | Limit-concept | MEDIUM - "The abyss wants..." |
| Transcendent | Horizon-operator | HIGH - "The Transcendent is..." |
| Self | Process, not substance | HIGH - "The true self..." |

**Correct usage**: "The experience has the structure of void-contact" (operator)
**Incorrect usage**: "The void contains wisdom" (reification)

## Integration with ANG System

Feed mapped experiences into the Four Pillars:

1. **The Library**: Store raw experience report
2. **Summaries**: Synthesized phenomenological structure
3. **Entities**: Extract concepts (Ego-Dissolution, Groundlessness)
4. **Questions**: Generate aporias from the experience

## Crisis Protocol

If experience mapping reveals:

- Active suicidal ideation
- Overwhelming despair without grounding
- Disconnection from all support structures

**Immediate Actions:**

1. Display sacred resources (988, Crisis Text Line)
2. Recommend grounding techniques
3. Suggest professional support
4. Theta meter → crimson state

## Governance: Phase 4 Validation Gate

Before finalizing map:

- [ ] **Metaphysical Smuggling Check**: No unstated ontological claims about "the void"

- [ ] **Apophatic Discipline**: Boundary marks where description exceeds evidence

- [ ] **Anti-Reification**: Void/Nothingness treated as operators

- [ ] **Epistemic Status**: All claims labeled (PHENOMENOLOGICAL, INTERPRETIVE, APHATIC)

- [ ] **Cross-Tradition**: Resonances include non-equivalence remainder

- [ ] **Existential Courage**: Stakes confronted, not evaded

---

*Skill maintains Matrix I: Phenomenological Cartography of the Void. All outputs subject to apophatic discipline and anti-reification auditing per Zenith Protocol.*`;

fetch('http://localhost:3000/api/nes2/ingest', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    source: 'adammueller777@gmail.com',
    sourceType: 'markdown',
    content: text
  })
}).then(r => r.json()).then(console.log).catch(console.error);
