---
name: Nihiltheist File Ingestion System
description: Orchestrates a complete knowledge ingestion engine centered on Nihiltheistic philosophy. Captures raw artifacts, produces bias-stripped syntheses, catalogs philosophical entities, and generates boundary-pushing questions.
---

# Nihiltheist File Ingestion System — SKILL.md

## Purpose

This skill orchestrates a complete knowledge ingestion engine centered on Nihiltheistic philosophy. It captures raw artifacts, produces bias-stripped syntheses, catalogs philosophical entities, and generates boundary-pushing questions—all coordinated by an autonomous Knowledge Curator agent.

## Core Architecture: The Four Pillars

Every artifact flows through four interconnected repositories:

[Ingestion Source] → Library → Summaries → Entities ←→ Questions
                          ↑          ↑          ↑
                     Knowledge Curator (AI Agent)

### 1. Library
Path: \`/Nihilismi Experientia Sacra 2/Library/\`
Repository for all raw ingested materials. Preserves original structure and provenance. Metadata includes source type, original formatting, deconstruction timestamp, and cross-references to extracted entities.

### 2. Summaries
Path: \`/Nihilismi Experientia Sacra 2/Summaries/\`
Distilled syntheses of Library artifacts, stripped of normative assumptions, deistic overlays, and theological bias. Each summary maintains a lineage link back to its source Library entry.

### 3. Entities
Path: \`/Nihilismi Experientia Sacra 2/Entities/\`
Relational catalog of core philosophical concepts, thinkers, traditions, and their interconnections. Cross-referenced bidirectionally with Library artifacts (as evidence) and Summaries (as interpretations). Each entity is a file with structured frontmatter.

### 4. Questions
Path: \`/Nihilismi Experientia Sacra 2/Questions/\`
Emergent, boundary-pushing interrogations derived from the intersection of Entities and new ingested content. Questions are ranked by void-resonance score and tagged by conceptual origin.

## Knowledge Curator AI Agent

An autonomous agent, trained and operative directive scoped exclusively to Library and Entities content. Acts as a Nihiltheistic philosophical interlocutor that engages in iterative conceptual densification.

## Usage

\`\`\`bash
# Full ingestion pipeline
bun scripts/ingest.ts --source /path/to/artifact --type md|url|pdf|video

# Entity graph maintenance
bun scripts/entity-graph.ts

# Knowledge Curator chat
bun scripts/curator-chat.ts

# Generate weekly digest
bun scripts/digest.ts
\`\`\`

## Web UI (zo.space routes)
- \`POST /api/nes2/ingest\`     — trigger ingestion
- \`GET  /api/nes2/library\`    — browse library
- \`GET  /api/nes2/entities\`    — query entities
- \`POST /api/nes2/curator\`     — chat with Knowledge Curator
