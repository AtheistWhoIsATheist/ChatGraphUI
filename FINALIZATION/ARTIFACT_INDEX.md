# HYPERMARKMAP Ω — ARTIFACT INDEX

This index catalogs all code, style, data, and documentation artifacts comprising the HyperMarkmap Ω cognitive visualization system.

---

## 1. Documentation & Governance (`/FINALIZATION/`)
- `FINALIZATION/LIVE_BASELINE.md`: Audit of the original live benchmark (`https://nihilist.zo.space/hypermarkmap`).
- `FINALIZATION/PROJECT_IDENTITY.md`: Identity, technology stack, environment specifications, and Cloud Run port handling.
- `FINALIZATION/CAPABILITY_MATRIX.md`: 18-point capability validation matrix.
- `FINALIZATION/DEFECT_LEDGER.md`: 7-point defect audit and fix ledger.
- `FINALIZATION/CHANGE_LEDGER.md`: Chronological architecture change record.
- `FINALIZATION/PERFORMANCE_REPORT.md`: Benchmark results across small, medium, and 906-node canonical corpora.
- `FINALIZATION/OUT_OF_SCOPE.md`: Anti-drift record of intentionally excluded paradigms.
- `FINALIZATION/ARTIFACT_INDEX.md`: This comprehensive artifact ledger.

---

## 2. Core HyperMarkmap Modules (`/src/components/HyperMarkmap/`)
- `src/components/HyperMarkmap/types.ts`: TypeScript contracts for `HyperNode`, layouts, display settings, and search states.
- `src/components/HyperMarkmap/parser.ts`: Deterministic Markdown & simpleMindMap JSON parser, operator extractor (`∅`, `⚖`, `⇄`, `🜏`, `⟁`), and Markdown serializer.
- `src/components/HyperMarkmap/HyperMarkmapCanvas.tsx`: D3 SVG renderer featuring:
  - Multi-tier glowing orb nodes (halos, radiant cores, depth sizing).
  - Luminescent bezier filaments with gradient transitions.
  - Cosmic starry background canvas with celestial geometry.
  - Collapsed child count badges (`+N`).
  - Smooth pan/zoom bounds and fit-to-view calculation.
- `src/components/HyperMarkmap/HyperMarkmapToolbar.tsx`: Glassmorphic navigation bar with search counter, navigation, layout toggles, depth slider, zoom, presets, and exports.
- `src/components/HyperMarkmap/HyperMarkmapEditor.tsx`: Split-pane live Markdown editor with syntax formatting shortcuts and file uploader.
- `src/components/HyperMarkmap/HyperMarkmapInspector.tsx`: Glassmorphic node inspector card with depth, metrics, blockquotes, and focus actions.
- `src/components/HyperMarkmap/HyperMarkmapMinimap.tsx`: Real-time thumbnail overview with quick-fit viewport jump.
- `src/components/HyperMarkmap/HyperMarkmapView.tsx`: Master coordinator component with `localStorage` persistence, error handling, and keyboard accelerators.

---

## 3. Host System Integrations
- `src/App.tsx`: Top-level router mounting `HyperMarkmapView` under `/hypermarkmap` and view switcher.
- `src/types/ang.ts`: Extension of `AngView` union to include `'hypermarkmap'`.
- `src/components/ANG/AngLayout.tsx`: Top header button with radiant glow for direct access.
- `src/components/Nihiltheism/types.ts`: Extension of `WorkspaceTabType` to include `'hypermarkmap'`.
- `src/components/Nihiltheism/NihiltheismWorkspace.tsx`: Top bar tab, left sidebar tool, and seamless container integration.

---

## 4. Canonical Datasets & Automated Test Suite
- `public/data/JOURNAL314_OMEGA_HYPERMAP_EXPANDED.json`: 297 KB canonical corpus (906 nodes, 23 chapters).
- `public/data/j314-apophatic.json`: 47 KB apophatic dialectic corpus.
- `tests_hypermarkmap.cjs`: Automated Node.js test suite verifying parsing, simpleMindMap hierarchy, search auto-unfolding, and performance budgets.
