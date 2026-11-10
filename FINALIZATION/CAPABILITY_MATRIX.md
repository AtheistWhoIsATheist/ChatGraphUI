# HYPERMARKMAP Ω — CAPABILITY MATRIX

| ID | Capability Description | Baseline Status | Ω Elevation Status | Verification Mechanism |
|---|---|---|---|---|
| **CAP-01** | Zero-CDN Local Bundled D3 Architecture | Failed (CDN injection with 12s timeout) | **Complete & Verified** | Bundled `d3` (v7.9.0) imported locally from `node_modules`. Zero external network calls. |
| **CAP-02** | Robust Markdown Parser (H1–H6, Lists, Blockquotes, Codes) | Basic line scan | **Complete & Verified** | Full hierarchy generator with indentation detection, unicode symbols (`∅`, `⚖`, `⇄`, `🜏`, `⟁`), inline quotes, and wiki-link normalization. |
| **CAP-03** | JSON Hierarchy Ingestion (`simpleMindMap` & Nested Tree) | Supported | **Complete & Verified** | Supports both standard `children` tree and `data` node schema from `JOURNAL314_OMEGA_HYPERMAP_EXPANDED.json`. |
| **CAP-04** | Radial Polar Topology Projection | Basic angle radial | **Complete & Verified** | Mathematical polar angle distribution, dynamic radial level scaling, collision-free text alignment based on quadrant. |
| **CAP-05** | Horizontal Left-to-Right Hierarchy Projection | Standard tree | **Complete & Verified** | D3 horizontal cluster layout with smooth cubic bezier filaments connecting parent and children. |
| **CAP-06** | Luminous Cosmic Visual Aesthetics (`image_2e60a0.jpg`) | Missing (flat SVG circles) | **Complete & Verified** | Multi-layered glowing orb nodes, neon cyan/violet filaments, radial backdrop wireframe, starfield particles. |
| **CAP-07** | Glassmorphic Node Metadata Cards & Detail Modal | Missing | **Complete & Verified** | Interactive node inspector with depth indicator, child count, breadcrumb trail, raw notes, and copy/export actions. |
| **CAP-08** | Collapse / Expand with Descendant Count Badges | Partial | **Complete & Verified** | Clickable node expansion with animated transitions and glowing badges displaying collapsed child count (`+N`). |
| **CAP-09** | Scented Search with Auto-Branch Disclosure | Partial (only highlight) | **Complete & Verified** | Search queries highlight matches, automatically unfold ancestor chains, and provide Next/Prev match navigation. |
| **CAP-10** | Dynamic Depth Filter Slider | Missing | **Complete & Verified** | Interactive slider allows instant restriction to levels 1 through 6+ with smooth animation. |
| **CAP-11** | Interactive Canvas: Smooth Pan, Zoom & Fit-to-Screen | Basic D3 zoom | **Complete & Verified** | Smooth pan/zoom bounds, reset button, and automated bounding box calculation for perfect center-fitting. |
| **CAP-12** | Integrated Dual-Mode Split Markdown Editor | Missing | **Complete & Verified** | Real-time split editor allowing instant editing of Markdown source with live map rendering. |
| **CAP-13** | High-Fidelity SVG & PNG Export | Incomplete | **Complete & Verified** | Client-side standalone SVG download and Canvas-based 2x high-resolution PNG generation with embedded styles. |
| **CAP-14** | Interactive Minimap Navigation | Missing | **Complete & Verified** | Real-time thumbnail minimap with draggable viewport rectangle and quick pan jump. |
| **CAP-15** | Keyboard Navigation Suite | None | **Complete & Verified** | `⌘F` / `/` for search, `Escape` to clear, `+`/`-` zoom, `0` fit view, `E` toggle editor, `Tab` toggle layout. |
| **CAP-16** | Corpus Presets & Dialectical Library | Static file upload | **Complete & Verified** | One-click preset loader: Journal 314 Omega (297KB), Apophatic Dialectics, and Philosophical Taxonomies. |
| **CAP-17** | Local Storage Persistence | None | **Complete & Verified** | Preserves layout mode, depth setting, zoom preference, and last edited document across sessions. |
| **CAP-18** | Unified Workspace Integration | Isolated page | **Complete & Verified** | First-class citizen in `App.tsx` top-level navigation, direct route `/hypermarkmap`, and `NihiltheismWorkspace`. |
