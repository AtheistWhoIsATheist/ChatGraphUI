# HYPERMARKMAP Ω — OUT OF SCOPE & ANTI-DRIFT LEDGER

The following capabilities and architectures were evaluated and intentionally excluded in accordance with the Anti-Drift Law of the Master Directive:

1. **Heavy External 3D Runtimes (Three.js/WebGL for primary 2D tree mapping):**
   - *Rationale:* D3 with SVG provides sub-pixel crisp typography, effortless export to vector formats (SVG, PDF), seamless accessibility, and lightweight DOM event handling. 3D canvas would degrade text legibility and break standalone vector exports.
2. **Third-Party Mindmap SaaS Engines (MindNode / XMind proprietary formats):**
   - *Rationale:* HyperMarkmap is centered on open text protocols: standard CommonMark/Markdown and transparent JSON hierarchies.
3. **Multi-Tenant Server-Authoritative Database Syncing (Postgres/Neo4j for local maps):**
   - *Rationale:* HyperMarkmap is an instant, client-authoritative cognitive instrument. Data persistence is managed seamlessly in local storage and file exports without mandatory login barriers.
4. **Third-Party AI Chatbot Overlays:**
   - *Rationale:* In strict adherence to AI Studio Build guidelines, no unsolicited AI chatbots or "Ask AI" widgets are inserted. The tool remains an authentic, focused cognitive cartographer.
