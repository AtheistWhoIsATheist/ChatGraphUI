# AxiomForge Generative Layer

## Problem Statement
How might we transform AxiomForge from a passive extractor of textual entities into a proactive generative engine that identifies structural gaps and proposes logical nodes/links that should exist based on the REN topology?

## Recommended Direction
Evolve the AxiomForge synthesis protocol to include a "Gap Inference" phase. Instead of just mapping what is *present* in the text, the AI will evaluate the input against the existing knowledge graph and identify what is *missing* but logically implied by the Recursive Existential Nihilism (REN) framework.

This requires passing a summarized context of the current graph to the AI and specifically prompting for "Latent Entities" and "Structural Bridges".

## Key Assumptions to Validate
- [ ] Gemini can maintain coherence when extrapolating from a relatively abstract philosophical framework (REN).
- [ ] Users can distinguish between "Ground Truth" (text-extracted) and "Inferred" (AI-proposed) nodes without it becoming chaotic.
- [ ] The overhead of passing graph context doesn't hit token limits for large graphs (limit context to local clusters or top-level axioms).

## MVP Scope
- Updated prompt in `AISynthesisPanel.tsx` that explicitly requests "Inferred Nodes" and "Logical Bridges".
- Visualization of "Inferred" status in the synthesis result list (e.g., specific icons or colors).
- Passing a simplified list of existing node labels/types as context to the AI for connection discovery.

## Not Doing (and Why)
- **Automatic Integration**: We will not automatically merge inferred nodes. They must be manually reviewed and integrated by the user to avoid "Hallucination Bloat".
- **Real-time Graph Recalculation**: We will only perform this inference during a Synthesis session, not on every graph change, to save on API costs and complexity.

## Open Questions
- How do we handle conflicts between new extracted nodes and existing inferred ones?
- Should inferred nodes have a "decay" factor if not validated by subsequent texts?
