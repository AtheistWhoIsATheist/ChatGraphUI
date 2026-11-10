# HYPERMARKMAP Ω — PROJECT IDENTITY & ENVIRONMENT SPECIFICATION

## 1. Application Identity
- **Application Name:** HyperMarkmap Ω (Knowledge Cartographer & Cognitive Synthesis Engine)
- **Primary Domain:** Hierarchical Markdown & Textual Visualization, Dialectical Concept Cartography, and Intellectual Instrument
- **Aesthetic Benchmark:** Luminous Cosmic Glassmorphism (`image_2e60a0.jpg`) — deep void background (`#04050d`), multi-layer radiant orb nodes, glowing cyan-to-violet bezier filaments, subtle starfield particles, sacred celestial wireframe geometry, and frosted glass cards.

## 2. Technology Stack & Runtime
- **Frontend Framework:** React 18.3.1
- **Language:** TypeScript 5.5.3 (strict type checking)
- **Bundler / Dev Server:** Vite 5.4.2
- **Server Framework:** Express 5.0.0-beta.3 (`server.ts`)
- **Node Environment:** Node.js v20+ / ESNext
- **Styling Engine:** Tailwind CSS 3.4.10 with custom cosmic void palette extensions
- **Animation & Motion:** Framer Motion (`motion/react` 12.4.7)
- **Graph & Tree Computing:** Bundled D3.js v7.9.0 (offline, zero-CDN runtime injection)
- **Icons:** Lucide React 0.344.0

## 3. Server Configuration & Ports
- **Local Dev Server:** Runs via `tsx server.ts` on port 3000 (`http://localhost:3000`).
- **Production Server:** Runs via `node server.ts` reading dynamic `process.env.PORT || 3000`. Fully compliant with containerized Cloud Run deployments.
- **Vite Integration:** In development (`NODE_ENV !== 'production'`), Vite is mounted via middleware; in production, static assets from `dist` are served with SPA fallback.

## 4. Key Storage Keys & Endpoints
- **LocalStorage State:** `hypermarkmap-prefs-v2`, `hypermarkmap-custom-doc`
- **Canonical Datasets:**
  - `/data/JOURNAL314_OMEGA_HYPERMAP_EXPANDED.json` (297 KB canonical tree)
  - `/data/j314-apophatic.json` (47 KB fallback tree)
- **Navigation Routes:** Accessible in primary `App.tsx` navigation bar (`HyperMarkmap`), direct route `/hypermarkmap`, and within `NihiltheismWorkspace` under both top navigation and sidebar shortcuts.
