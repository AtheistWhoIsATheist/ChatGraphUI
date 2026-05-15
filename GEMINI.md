# GEMINI.md - AI Implementation Guardrails

## Model Selection Strategy
- **Extraction & Synthesis**: Prefer `gemini-2.0-flash` for high-throughput scrutiny and initial extraction. Use `gemini-1.5-pro` for deep recursive densification.
- **Generative Scrutiny**: Use `gemini-2.0-flash` for real-time inference of structural gaps in AxiomForge.

## Prompt Engineering Patterns
Use the **"AxiomForge Substrate Scrutiny"** pattern:
```markdown
Analyze for:
1. Entities (Extracted vs. Inferred)
2. Links (Supports, Contradicts, Bridges)
3. Narrative Synthesis (Generative Extrapolation)
4. Agnostic Framing (Phenomenological Occurrences)
```

## Recursive Self-Improvement Protocol
Whenever performing an enhancement:
1. Identify the structural gap.
2. Execute a targeted refactor or addition.
3. Log the outcome in `localStorage` via `/src/utils/selfImprovement.ts`.

## UI/UX Rules (Antigravity Design)
- **Rupture Sequences**: Staggered entrances for high-impact discovery.
- **Scented Search**: Enhanced node lookup with semantic relevance.
- **Void Visuals**: Deep zinc backgrounds (#0c0c0c), emerald accents (#10b981), and mono-spaced data overlays.

---
*Reference for Gemini model calls and autonomous enhancement loops.*
