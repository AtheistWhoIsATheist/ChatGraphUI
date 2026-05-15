# GEMINI.md - AI Implementation Guardrails

## Model Selection Strategy
- **Extraction & Synthesis**: Prefer `gemini-2.5-pro` for deep philosophical extraction in AxiomForge.
- **Chat & Summarization**: Use `gemini-2.0-flash` for high-throughput interaction.

## Prompt Engineering Patterns
Use the **"AxiomForge Substrate Extraction"** pattern:
```markdown
Analyze text for:
1. Entities (void_concept, thinker, paradox, ren_stage, axiom, argument, synthesis)
2. Links (contradicts, supports, derives_from, synthesizes, transcends, voids, iterates)
3. Narrative Synthesis
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
