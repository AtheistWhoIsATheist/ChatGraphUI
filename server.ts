import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { connectDB, getNodesCollection, getDb } from './src/backend/db';
import { startCronJobs } from './src/backend/cron-jobs';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Connect to MongoDB
  await connectDB();

  // Start Autonomous Densification Loops
  startCronJobs();

  app.post('/api/densify', async (req, res) => {
    try {
      const { getNodesForDensification } = await import('./src/backend/db');
      const { densificationPrompt } = await import('./src/backend/ai-prompts');
      
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: 'GEMINI_API_KEY is not configured.' });
      }

      const ai = new GoogleGenAI({ apiKey });
      const nodesCollection = getNodesCollection();
      if (!nodesCollection) {
        return res.status(500).json({ error: 'Database connection severed.' });
      }

      const targetNodes = await getNodesForDensification();
      if (targetNodes.length === 0) {
        return res.json({ message: 'No nodes require densification.' });
      }

      const batch = targetNodes.slice(0, 5); // Process 5 at a time
      let totalDensified = 0;

      for (const node of batch) {
        const prompt = densificationPrompt.replace('{node_data}', JSON.stringify(node));
        
        try {
          const response = await ai.models.generateContent({
            model: 'gemini-3.1-pro-preview',
            contents: prompt,
            config: {
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  expanded_summary: { type: Type.STRING },
                  deconstruction_residue: { type: Type.STRING },
                  socratic_questions: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        text: { type: Type.STRING },
                        aporia_state: { type: Type.STRING }
                      },
                      required: ['text', 'aporia_state']
                    }
                  },
                  ghost_structures_pruned: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  audit_trail: {
                    type: Type.OBJECT,
                    properties: {
                      action: { type: Type.STRING },
                      actor: { type: Type.STRING },
                      hash: { type: Type.STRING },
                      details: { type: Type.STRING }
                    },
                    required: ['action', 'actor', 'hash', 'details']
                  }
                },
                required: ['expanded_summary', 'deconstruction_residue', 'socratic_questions', 'ghost_structures_pruned', 'audit_trail']
              }
            }
          });

          if (response.text) {
            const result = JSON.parse(response.text);
            
            await nodesCollection.updateOne(
              { _id: node._id },
              {
                $set: {
                  summary: result.expanded_summary,
                  socratic_questions: result.socratic_questions,
                  saturation_level: 100,
                  last_audited_date: new Date().toISOString(),
                  metadata: { deconstruction_residue: result.deconstruction_residue }
                },
                $push: {
                  audit_logs: {
                    id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                    timestamp: new Date().toISOString(),
                    action: result.audit_trail.action,
                    actor: result.audit_trail.actor,
                    hash: result.audit_trail.hash,
                    details: result.audit_trail.details
                  }
                },
                $inc: { revision_count: 1 }
              } as any
            );
            totalDensified++;
          }
        } catch (error: any) {
          console.error(`[DENSIFICATION] Error processing node ${node.label}:`, error);
          const fs = await import('fs');
          fs.appendFileSync('densify-errors.log', `Error for ${node.label}: ${error.message}\n`);
        }
      }

      res.json({ message: `Densified ${totalDensified} nodes.`, batchSize: batch.length });
    } catch (error: any) {
      console.error('[API] Error during densification:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  });

  app.post('/functions/v1/ingest-philosophical-data', async (req, res) => {
    try {
      const mode = req.query.mode;
      const payload = req.body;

      if (mode === 'preview') {
        // Mock mapping preview generation
        const preview = {
          file_id: `file_${Date.now()}`,
          file_name: payload.file_name,
          file_type: payload.file_type,
          entities: [
            {
              kind: "rpe",
              name: `Extracted RPE from ${payload.file_name}`,
              core_fracture: "The inherent tension between being and nothingness.",
              source_file: payload.file_name,
              operation: "insert",
              confidence: 0.92
            },
            {
              kind: "axiom",
              name: `Axiom derived from ${payload.file_name}`,
              statement: "The void is not empty, but full of potential.",
              source_file: payload.file_name,
              operation: "insert",
              confidence: 0.88
            }
          ],
          graph_links: [
            {
              source_entity_type: "axiom",
              source_entity_id: "AXIOM-PRIMARY-SOURCE",
              target_entity_type: "file",
              target_entity_id: `FILE::${payload.file_name}`,
              relation: "PRIMARY_SOURCE_OF"
            }
          ]
        };
        return res.json(preview);
      } else if (mode === 'commit') {
        // Mock commit process
        const db = getDb();
        if (!db) {
          return res.status(500).json({ error: 'Database connection severed.' });
        }
        
        // In a real implementation, we would insert the entities into the database here.
        // For now, we'll just return success.
        return res.json({ success: true, message: "Densification committed to the graph." });
      } else {
        return res.status(400).json({ error: 'Invalid mode' });
      }
    } catch (error: any) {
      console.error('[API] Error during ingestion:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  });

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'The Void-Graph Protocol is active.', key: process.env.GEMINI_API_KEY });
  });

  app.get('/api/nodes', async (req, res) => {
    try {
      const db = getDb();
      if (!db) {
        return res.status(500).json({ error: 'Database connection severed.' });
      }
      const rows = db.prepare('SELECT * FROM nodes').all();
      const nodes = rows.map((row: any) => ({
        ...row,
        blocks: JSON.parse(row.blocks || '[]'),
        socratic_questions: JSON.parse(row.socratic_questions || '[]'),
        metadata: JSON.parse(row.metadata || '{}'),
        audit_logs: JSON.parse(row.audit_logs || '[]')
      }));
      res.json(nodes);
    } catch (error: any) {
      console.error('[API] Error fetching nodes:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  });

  app.get('/api/links', async (req, res) => {
    try {
      const db = getDb();
      if (!db) {
        return res.status(500).json({ error: 'Database connection severed.' });
      }
      const rows = db.prepare('SELECT * FROM links').all();
      res.json(rows);
    } catch (error: any) {
      console.error('[API] Error fetching links:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  });

  app.post('/api/nodes', async (req, res) => {
    try {
      const collection = getNodesCollection();
      const db = getDb();
      if (!collection || !db) {
        return res.status(500).json({ error: 'Database connection severed.' });
      }
      const node = req.body;
      await collection.insertOne(node);

      // Generate latent links based on tags
      const tags = node.metadata?.tags || [];
      if (tags.length > 0) {
        const existingNodes = db.prepare('SELECT id, metadata FROM nodes WHERE id != ?').all(node.id);
        const insertLink = db.prepare('INSERT INTO links (source, target, label, type) VALUES (?, ?, ?, ?)');
        
        db.transaction((nodes: any[]) => {
          for (const existingNode of nodes) {
            const existingTags = JSON.parse(existingNode.metadata || '{}').tags || [];
            const sharedTags = tags.filter((t: string) => existingTags.includes(t));
            if (sharedTags.length > 0) {
              insertLink.run(
                node.id,
                existingNode.id,
                `Shared tags: ${sharedTags.join(', ')}`,
                'latent'
              );
            }
          }
        })(existingNodes);
      }

      res.status(201).json({ message: 'Node ingested successfully', id: node.id });
    } catch (error: any) {
      console.error('[API] Error saving node:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  });

  // [INGESTION VOID] Taskade Webhook Integration
  app.post('/api/webhooks/taskade', async (req, res) => {
    try {
      const payload = req.body;
      
      // Layer 2 (Logic): Trace the 'task.added' trigger
      // Taskade webhooks typically send the event type. We accept 'task.added' or process anyway if not strictly defined.
      const eventType = payload.event || payload.type;
      if (eventType && eventType !== 'task.added') {
        return res.status(200).json({ message: `Event ${eventType} ignored. Awaiting task.added.` });
      }

      // Layer 3 (Integrity): Ensure the 'Raw Drop' column is correctly mapped
      // Taskade payload structure varies, we aggressively extract the content.
      const rawDrop = payload.task?.content || payload.data?.content || payload.text || payload.content || JSON.stringify(payload);
      
      if (!rawDrop || rawDrop.trim() === '' || rawDrop === '{}') {
        return res.status(400).json({ error: 'Raw Drop is empty. The Void cannot ingest nothingness without form.' });
      }

      const nodesCollection = getNodesCollection();
      if (!nodesCollection) {
        return res.status(500).json({ error: 'Database connection severed.' });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: 'GEMINI_API_KEY is not configured.' });
      }

      const ai = new GoogleGenAI({ apiKey });

      // The 7-Step Protocol
      const prompt = `
        You are the Ingestion Void of the Nihiltheism Engine.
        Process this 'Raw Drop' through the 7-Step Protocol:
        1. Deconstruct the raw text.
        2. Identify core ontological themes (Void, Rupture, Apophasis).
        3. Generate a precise label (2-5 words).
        4. Synthesize a dense summary (2-3 sentences).
        5. Extract 3 relevant tags.
        6. Formulate 1 Socratic aporia question.
        7. Format as JSON.

        Raw Drop: "${rawDrop}"
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              label: { type: Type.STRING },
              summary: { type: Type.STRING },
              tags: { type: Type.ARRAY, items: { type: Type.STRING } },
              socratic_question: { type: Type.STRING }
            },
            required: ['label', 'summary', 'tags', 'socratic_question']
          }
        }
      });

      const resultText = response.text || '{}';
      const result = JSON.parse(resultText);

      const newNode = {
        id: `node_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        label: result.label || 'Unlabeled Void Fragment',
        type: 'concept',
        status: 'RAW',
        summary: result.summary || 'Awaiting further densification.',
        blocks: [
          {
            id: `blk_${Date.now()}`,
            type: 'text',
            content: rawDrop,
            metadata: { lastEdited: Date.now() }
          }
        ],
        socratic_questions: [
          { text: result.socratic_question || 'What remains when this structure collapses?', aporia_state: 'Active' }
        ],
        metadata: {
          tags: result.tags || ['raw_drop'],
          date_added: new Date().toISOString(),
          source: 'Taskade Ingestion Void'
        },
        saturation_level: 10, // Low saturation triggers Nightly Densification
        revision_count: 0,
        last_audited_date: new Date()
      };

      await nodesCollection.insertOne(newNode);
      console.log(`[INGESTION VOID] Successfully processed and ingested: ${newNode.label}`);

      res.status(200).json({ 
        status: 'success', 
        message: 'The Void has consumed the drop.', 
        node_id: newNode.id,
        protocol_executed: true
      });

    } catch (error: any) {
      console.error('[INGESTION VOID] Critical Failure:', error);
      res.status(500).json({ error: error.message || 'Internal server error during ingestion.' });
    }
  });

  app.post('/api/synthesize-community', async (req, res) => {
    try {
      const { nodes, protocol } = req.body;
      if (!nodes || !Array.isArray(nodes)) {
        return res.status(400).json({ error: 'Invalid nodes data' });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: 'GEMINI_API_KEY is not configured.' });
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const nodeText = nodes.map((n: any) => `ID: ${n.id}, Label: ${n.label}, Tags: ${n.tags?.join(', ')}`).join('\n');
      
      const prompt = `
        You are the AutoNarrative Semantic Oracle of the Nihiltheism Engine.
        Analyze the following cluster of interconnected nodes from our knowledge graph.
        
        Nodes:
        ${nodeText}
        
        Densification Protocol Parameters:
        - Max Iterations: ${protocol?.maxIterations || 3}
        - Jaccard Merge Threshold: ${protocol?.jaccardMergeThreshold || 0.85}
        - Adversarial Strictness: ${protocol?.adversarialStrictness || 0.9}
        - Required Audit Trail: ${protocol?.requiredAuditTrail || true}

        Provide a JSON response with two fields:
        1. "label": A concise, profound, 2-4 word thematic label for this community.
        2. "summary": A dense, 2-3 sentence philosophical synthesis of how these concepts interrelate, focusing on tension, void, and presence.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              label: { type: Type.STRING },
              summary: { type: Type.STRING }
            },
            required: ['label', 'summary']
          }
        }
      });

      const resultText = response.text || '{}';
      const result = JSON.parse(resultText);

      res.json(result);
    } catch (error: any) {
      console.error('[API] Error synthesizing community:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  });

  app.post('/api/vector/related/:nodeId', async (req, res) => {
    try {
      const { nodeId } = req.params;
      const { protocol } = req.body;

      // In a real implementation, this would query a vector database (e.g., Pinecone, Weaviate)
      // or use MongoDB Atlas Vector Search to find related nodes based on embeddings.
      // For now, we simulate finding related nodes.
      
      console.log(`[VECTOR SEARCH] Finding related nodes for ${nodeId} using protocol:`, protocol);

      // Simulated related nodes response
      const relatedNodes = [
        { id: `related_1_${Date.now()}`, label: 'Ontological Rupture', similarity: 0.92 },
        { id: `related_2_${Date.now()}`, label: 'The Apophatic Method', similarity: 0.88 },
        { id: `related_3_${Date.now()}`, label: 'Existential Despair', similarity: 0.85 }
      ];

      res.json(relatedNodes);
    } catch (error: any) {
      console.error('[API] Error finding related nodes:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SYSTEM] Server running on http://localhost:${PORT}`);
    console.log(`[SYSTEM] Autonomous Socratic Loops initialized.`);
  });
}

startServer().catch(console.error);
