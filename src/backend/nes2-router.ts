import express from 'express';
import { ensureDirs, DIRS } from './nes2-fs.js';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { GoogleGenAI, Type } from '@google/genai';

export const nes2Router = express.Router();

// Ensure the directories exist
ensureDirs();

function getAi() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not set");
  return new GoogleGenAI({ apiKey });
}

// Helper to robustly JSON parse LLM responses
function parseAiJson(text: string) {
  try { return JSON.parse(text); } catch (e) {
    const cleaned = text.replace(/```(json)?/g, '').trim();
    try { return JSON.parse(cleaned); } catch (e2) {
      const match = text.match(/\{[\s\S]*\}/);
      if (match) return JSON.parse(match[0]);
      throw e2;
    }
  }
}

// POST /api/ingest
nes2Router.post('/ingest', async (req, res) => {
  try {
    const { source, content, sourceType } = req.body;
    if (!content) return res.status(400).json({ error: 'Content required.' });
    
    // Hash content for duplicate detection
    const hash = crypto.createHash('sha256').update(content).digest('hex');
    const filename = `${hash.substring(0, 12)}.md`;
    const libraryPath = path.join(DIRS.Library, filename);
    
    if (fs.existsSync(libraryPath)) {
      return res.status(200).json({ message: 'Artifact already ingested.', hash });
    }
    
    // Write to Library
    const libraryEntry = `---
source: ${source || 'direct'}
type: ${sourceType || 'text'}
ingested_at: ${new Date().toISOString()}
hash: ${hash}
---

${content}
`;
    fs.writeFileSync(libraryPath, libraryEntry);
    
    // Deconstruct & Synthesize using Knowledge Curator
    const ai = getAi();
    const prompt = `
      You are the Knowledge Curator agent. Deconstruct the following artifact.
      Artifact: ${content}

      Tasks:
      1. Strip all normative assumptions, theological bias, and deistic overlays.
      2. Produce a pure philosophical summary.
      3. Extract philosophical entities (concepts, thinkers, traditions).
      4. Generate boundary-pushing questions reflecting the void.

      Return JSON:
      {
        "summary": "String",
        "entities": [
          { "name": "String", "type": "concept|thinker|tradition", "description": "String", "aliases": ["String"], "void_resonance_score": 0.5 }
        ],
        "questions": [
          { "title": "String", "query": "String", "conceptual_origin": "String" }
        ]
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });

    const data = parseAiJson(response.text || '{}');
    
    // Write Summary
    if (data.summary) {
      const summaryFilename = `${hash}_summary.md`;
      const summaryContent = `---
library_source: ${filename}
generated_at: ${new Date().toISOString()}
---
${data.summary}
`;
      fs.writeFileSync(path.join(DIRS.Summaries, summaryFilename), summaryContent);
    }
    
    // Write Entities
    const extractedEntities = [];
    if (data.entities && Array.isArray(data.entities)) {
      for (const entity of data.entities) {
        const safeName = entity.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const entityFilename = `${safeName}.md`;
        const entityPath = path.join(DIRS.Entities, entityFilename);
        extractedEntities.push(safeName);

        // Append if exists, otherwise create
        let existingFrontmatter = { aliases: [], related_entities: [], library_sources: [], void_resonance_score: entity.void_resonance_score || 0 };
        let existingBody = '';

        if (fs.existsSync(entityPath)) {
          // Simplistic extraction for now: we append sources
          const existing = fs.readFileSync(entityPath, 'utf8');
          // Update resonance score or whatever if needed.
          // For now, simple append
          existingFrontmatter.library_sources.push(filename);
          existingBody = existing;
        } else {
          existingFrontmatter.aliases = entity.aliases || [];
          existingFrontmatter.library_sources = [filename];
          existingFrontmatter.void_resonance_score = entity.void_resonance_score;
          existingBody = entity.description;
        }

        const newContent = `---
type: ${entity.type}
aliases: ${JSON.stringify(existingFrontmatter.aliases)}
library_sources: ${JSON.stringify(Array.from(new Set(existingFrontmatter.library_sources)))}
void_resonance_score: ${existingFrontmatter.void_resonance_score}
---

${existingBody}

## Update ${new Date().toISOString()}
${entity.description}
`;
        fs.writeFileSync(entityPath, newContent);
      }
    }
    
    // Write Questions
    if (data.questions && Array.isArray(data.questions)) {
      for (const q of data.questions) {
        const safeTitle = q.title.replace(/[^a-z0-9]/gi, '_').toLowerCase().substring(0, 30);
        const qFilename = `${safeTitle}_${Date.now()}.md`;
        const qContent = `---
conceptual_origin: ${q.conceptual_origin}
generated_at: ${new Date().toISOString()}
source_hash: ${hash}
---

# ${q.title}

${q.query}
`;
        fs.writeFileSync(path.join(DIRS.Questions, qFilename), qContent);
      }
    }

    return res.status(200).json({ 
      message: 'Ingestion complete', 
      hash,
      extracted_entities: extractedEntities.length,
      questions_generated: data.questions?.length || 0 
    });

  } catch (error: any) {
    console.error('[NES2 Ingest Error]:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/library
nes2Router.get('/library', (req, res) => {
  try {
    const files = fs.readdirSync(DIRS.Library);
    res.json({ files });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/entities
nes2Router.get('/entities', (req, res) => {
  try {
    const files = fs.readdirSync(DIRS.Entities);
    res.json({ files });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/curator
nes2Router.post('/curator', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: 'Query required.' });

    // In a full implementation, we'd do semantic similarity over the entities.
    // For now, grab random or all entities to build context if few.
    const entityFiles = fs.readdirSync(DIRS.Entities).slice(0, 10);
    const context = entityFiles.map(f => {
      return `[${f}]\n` + fs.readFileSync(path.join(DIRS.Entities, f), 'utf8');
    }).join('\n\n');

    const ai = getAi();
    const prompt = `
      You are the Knowledge Curator agent for Nihilismi Experientia Sacra 2.
      Use the following context from our Entities database to answer the user's philosophical inquiry.
      Apply iterative densification. Return a synthesized response with source attribution.
      
      Entities Context:
      ${context}

      User Query: ${query}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: prompt,
    });

    res.json({ response: response.text });
  } catch (error: any) {
    console.error('[NES2 Curator Error]:', error);
    res.status(500).json({ error: error.message });
  }
});
