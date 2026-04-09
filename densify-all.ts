import { getNodesForDensification, getNodesCollection, connectDB } from './src/backend/db';
import { densificationPrompt } from './src/backend/ai-prompts';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'placeholder' });

async function runDensification() {
  await connectDB();
  const nodesCollection = getNodesCollection();
  if (!nodesCollection) {
    console.error('Failed to get nodes collection');
    return;
  }

  let totalDensified = 0;
  let hasMore = true;

  while (hasMore) {
    const targetNodes = await getNodesForDensification();
    if (targetNodes.length === 0) {
      hasMore = false;
      break;
    }

    const batch = targetNodes.slice(0, 2);
    console.log(`[DENSIFICATION] Acquired ${batch.length} nodes for densification.`);

    for (const node of batch) {
      console.log(`[DENSIFICATION] Processing node: ${node.label}`);
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
          console.log(`[DENSIFICATION] Densified Node: ${node.label}`);
          totalDensified++;
        }
      } catch (error) {
        console.error(`[DENSIFICATION] Error processing node ${node.label}:`, error);
      }
    }
    hasMore = false; // Just do one batch for testing
  }

  console.log(`[DENSIFICATION] Complete. Total nodes densified: ${totalDensified}`);
}

runDensification().catch(console.error);
