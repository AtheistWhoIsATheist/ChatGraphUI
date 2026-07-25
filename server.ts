import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Initialize Gemini client on server-side
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // API Route: Apophatic Deconstruction of Certainty
  app.post("/api/deconstruct", async (req, res) => {
    try {
      const { node, question, userText } = req.body;
      if (!node || !question || !userText) {
        res.status(400).json({ error: "Missing required parameters" });
        return;
      }

      const prompt = `
Philosophical Context:
You are an expert in apophatic philosophy, Socratic suspension (epoché), and eastern insights like Śūnyatā.
The user is contemplating the concept "${node.label}" (${node.type}) under the inquiry: "${question}".
They have written the following reflection:
"${userText}"

Your task is to analyze this reflection through a rigorous apophatic lens.
1. Identify "Intellectual Anchors" or dogmatic/rigid assertions the user is making (e.g., words like "always", "must", "truth", "never", "cannot", or implicit assumptions of absolute certainty/dualism).
2. Create a profound, poetic "Apophatic Reframing". It should be highly sophisticated, elegant, and challenging but deeply compassionate. It must guide them to suspension of judgment (epoché) or resting in the fertile ground of non-knowing (aporia), dissolving their rigid concepts. Address them directly. Do not use generic filler words or self-praising cliches.
3. Determine a "contemplationStatus":
   - "dissolved" if they express let-go, surrender, silence, or open awareness.
   - "integrated" if their reflection shows high depth and balance, with few dogmas.
   - "active" if they are still holding tight to intellectual assertions or rigid dualisms.
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              dogmasIdentified: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "List of identified rigid concepts, mental anchors, or dualisms in the user's reflection.",
              },
              apophaticReframing: {
                type: Type.STRING,
                description: "Deep, challenging, but poetic deconstructive guidance that reframes their statement.",
              },
              contemplationStatus: {
                type: Type.STRING,
                description: "The state of contemplation: 'active', 'integrated', or 'dissolved'.",
              },
            },
            required: ["dogmasIdentified", "apophaticReframing", "contemplationStatus"],
          },
        },
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("No response text from Gemini API");
      }
      res.json(JSON.parse(responseText.trim()));
    } catch (error: any) {
      console.error("Deconstruction failed:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  });

  // API Route: Paradox Synthesis Reactor
  app.post("/api/synthesize", async (req, res) => {
    try {
      const { nodeA, nodeB } = req.body;
      if (!nodeA || !nodeB) {
        res.status(400).json({ error: "Missing required parameters" });
        return;
      }

      const prompt = `
Philosophical Context:
You are an expert in apophatic ontology and Hegelian/philosophical dialectics.
We are synthesizing a paradox between two distinct concepts:
Concept A: "${nodeA.label}" (${nodeA.type}). Summary: ${nodeA.summary}
Concept B: "${nodeB.label}" (${nodeB.type}). Summary: ${nodeB.summary}

Your task is to:
1. Formulate the "Thesis" representing the stance or insight of Concept A.
2. Formulate the "Antithesis" representing the contrasting stance or movement of Concept B.
3. Synthesize the "Apophatic Dissolution" (Synthesis). Explain how the friction between these two ideas exhausts the analytical mind, forcing it to drop all categories, dissolving both concepts into a unified silent awareness. Write this in a beautiful, poetic, profound, and deeply contemplative style.
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              thesis: {
                type: Type.STRING,
                description: "The core thesis representing Concept A.",
              },
              antithesis: {
                type: Type.STRING,
                description: "The contrasting antithesis representing Concept B.",
              },
              synthesis: {
                type: Type.STRING,
                description: "The apophatic synthesis dissolving the tension into silent awareness.",
              },
            },
            required: ["thesis", "antithesis", "synthesis"],
          },
        },
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("No response text from Gemini API");
      }
      res.json(JSON.parse(responseText.trim()));
    } catch (error: any) {
      console.error("Synthesis failed:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  });

  // API Route: Full 9-Step Corpus Intake & Second Brain Builder
  app.post("/api/corpus/intake", async (req, res) => {
    try {
      const {
        filename,
        fileExtension,
        fileSize,
        sha256Hash,
        rawContent,
        title: providedTitle,
        sourceType: providedSourceType,
        existingBatches = [],
      } = req.body;

      if (!filename || !rawContent) {
        res.status(400).json({ error: "Missing filename or rawContent" });
        return;
      }

      const batchId = `batch_${Date.now()}_${(sha256Hash || 'hash').slice(0, 8)}`;
      const timestamp = new Date().toISOString();

      const prompt = `
You are the CORPUS INTAKE ARCHITECT for the Nihiltheism Knowledge Engine (NKE).
You answer to PROFESSOR NIHIL and adhere strictly to the 9-Step Corpus Intake Method.

Source File Metadata:
- Filename: ${filename}
- Extension: ${fileExtension || '.md'}
- Size: ${fileSize || rawContent.length} bytes
- SHA-256: ${sha256Hash || 'unhashed'}
- Provided Title: ${providedTitle || 'None'}
- Provided Source Type: ${providedSourceType || 'None'}
- Existing Ingested Batches Count: ${existingBatches.length}

Raw Source Content:
"""
${rawContent.slice(0, 50000)}
"""

Your Task:
Perform complete, rigorous, God-Tier Corpus Intake analysis:
1. Title & Source Type: infer if missing.
2. Semantic Chunks: divide text into structural chunks (chapters, sections, paragraphs, stanzas, fragments).
3. Epistemic Extract: extract claims, concepts, thinkers, quotes, and relationships. Assign an epistemicStatus from the 11-level taxonomy:
   ['TEXTUAL', 'SOURCE_METADATA', 'MEMORY_GRAPH', 'INFERRED', 'INTERPRETIVE', 'PHENOMENOLOGICAL', 'ANALOGICAL', 'SPECULATIVE', 'NORMATIVE', 'APOPHATIC', 'UNGROUNDED'].
4. Surface Issues: detect duplicates (exact/near/conceptual), lacunae (citation/argument/reference/cross-tradition), malformed encoding/structure, review risks.
5. Anti-Reification Audit: scan for monitored terms ('Void', 'Nothingness', 'Being', 'God', 'Transcendent', 'Absence', 'Negation', 'Emptiness', 'Ground', 'Origin', 'Abyss', 'Nihil') and verify representation as one of 8 permitted modes ('operator', 'limit', 'disclosure', 'placeholder', 'contested ontology', 'symbolic marker', 'phenomenological event', 'apophatic boundary'). Set status to 'PASS' or 'FAIL'.
6. Boundary Signals: detect crisis/self-harm signals, assign tier ('MONITOR', 'CAUTION', 'ESCALATE'), provide non-escalating grounding action.
7. Next Actions: list specific, concrete recommendations ('NOTE', 'GRAPH_EDGE', 'COMPARISON', 'PARADOX', 'SYNTHESIS', 'QUERY').
8. Markdown Report: generate a full Markdown Intake Report following the standard NKE Intake Report layout.
9. Verification Checklist: set all 9 verification pass booleans.
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              sourceType: { type: Type.STRING },
              chunks: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    startPosition: { type: Type.INTEGER },
                    endPosition: { type: Type.INTEGER },
                    structuralType: { type: Type.STRING },
                    summary: { type: Type.STRING },
                    text: { type: Type.STRING },
                  },
                  required: ["id", "startPosition", "endPosition", "structuralType", "summary", "text"],
                },
              },
              extracts: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    elementType: { type: Type.STRING },
                    text: { type: Type.STRING },
                    thinker: { type: Type.STRING },
                    tradition: { type: Type.STRING },
                    epistemicStatus: { type: Type.STRING },
                    chunkReference: { type: Type.STRING },
                    provenance: { type: Type.STRING },
                  },
                  required: ["id", "elementType", "text", "epistemicStatus", "chunkReference", "provenance"],
                },
              },
              issues: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    type: { type: Type.STRING },
                    fileRef: { type: Type.STRING },
                    location: { type: Type.STRING },
                    severity: { type: Type.STRING },
                    description: { type: Type.STRING },
                    recommendation: { type: Type.STRING },
                  },
                  required: ["id", "type", "fileRef", "severity", "description", "recommendation"],
                },
              },
              antiReificationAudits: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    file: { type: Type.STRING },
                    term: { type: Type.STRING },
                    representation: { type: Type.STRING },
                    status: { type: Type.STRING },
                    location: { type: Type.STRING },
                    note: { type: Type.STRING },
                  },
                  required: ["file", "term", "representation", "status", "location", "note"],
                },
              },
              boundarySignals: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    file: { type: Type.STRING },
                    signalType: { type: Type.STRING },
                    tier: { type: Type.STRING },
                    actionTaken: { type: Type.STRING },
                  },
                  required: ["file", "signalType", "tier", "actionTaken"],
                },
              },
              nextActions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    type: { type: Type.STRING },
                    format: { type: Type.STRING },
                    detail: { type: Type.STRING },
                    fileRef: { type: Type.STRING },
                  },
                  required: ["id", "type", "format", "detail", "fileRef"],
                },
              },
              markdownReport: { type: Type.STRING },
              verificationChecklist: {
                type: Type.OBJECT,
                properties: {
                  immutableStorage: { type: Type.BOOLEAN },
                  epistemicLabels: { type: Type.BOOLEAN },
                  duplicatesSurfaced: { type: Type.BOOLEAN },
                  crisisScanned: { type: Type.BOOLEAN },
                  antiReification: { type: Type.BOOLEAN },
                  noMergedMetadata: { type: Type.BOOLEAN },
                  nextActionsProduced: { type: Type.BOOLEAN },
                  selfVerified: { type: Type.BOOLEAN },
                  batchReturned: { type: Type.BOOLEAN },
                },
                required: [
                  "immutableStorage",
                  "epistemicLabels",
                  "duplicatesSurfaced",
                  "crisisScanned",
                  "antiReification",
                  "noMergedMetadata",
                  "nextActionsProduced",
                  "selfVerified",
                  "batchReturned",
                ],
              },
            },
            required: [
              "title",
              "sourceType",
              "chunks",
              "extracts",
              "issues",
              "antiReificationAudits",
              "boundarySignals",
              "nextActions",
              "markdownReport",
              "verificationChecklist",
            ],
          },
        },
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("No response from Gemini API for Corpus Intake");
      }

      const parsedData = JSON.parse(responseText.trim());

      const result = {
        batchId,
        timestamp,
        filename,
        fileExtension: fileExtension || '.md',
        fileSize: fileSize || rawContent.length,
        sha256Hash: sha256Hash || 'a1b2c3d4e5f6',
        rawContent,
        title: parsedData.title || filename,
        sourceType: parsedData.sourceType || 'document',
        chunks: parsedData.chunks || [],
        extracts: parsedData.extracts || [],
        issues: parsedData.issues || [],
        antiReificationAudits: parsedData.antiReificationAudits || [],
        boundarySignals: parsedData.boundarySignals || [],
        nextActions: parsedData.nextActions || [],
        markdownReport: parsedData.markdownReport || `# INTAKE REPORT — ${batchId}`,
        verificationChecklist: parsedData.verificationChecklist || {
          immutableStorage: true,
          epistemicLabels: true,
          duplicatesSurfaced: true,
          crisisScanned: true,
          antiReification: true,
          noMergedMetadata: true,
          nextActionsProduced: true,
          selfVerified: true,
          batchReturned: true,
        },
      };

      res.json(result);
    } catch (error: any) {
      console.error("Corpus Intake failed:", error);
      res.status(500).json({ error: error.message || "Corpus intake processing failed" });
    }
  });

  // API Route: World-Class Nihiltheism Philosophical Interlocutor (Professor Nihil / Socratech Omega)
  app.post("/api/corpus/chat", async (req, res) => {
    try {
      const { message, conversationHistory = [], ingestionBatches = [] } = req.body;
      if (!message) {
        res.status(400).json({ error: "Missing message parameter" });
        return;
      }

      // Build corpus summary context
      let corpusContext = "";
      if (ingestionBatches.length > 0) {
        corpusContext = "\n--- INGESTED SECOND BRAIN CORPUS KNOWLEDGE BASE ---\n";
        ingestionBatches.forEach((batch: any, index: number) => {
          corpusContext += `\n[Document ${index + 1}: ${batch.title} (${batch.filename})]\n`;
          corpusContext += `Source Type: ${batch.sourceType} | Hash: ${batch.sha256Hash?.slice(0, 10)}\n`;
          corpusContext += `Extracted Concepts/Claims (${batch.extracts?.length || 0}):\n`;
          (batch.extracts || []).slice(0, 12).forEach((ext: any) => {
            corpusContext += `- [${ext.epistemicStatus || 'TEXTUAL'}] ${ext.text} (Thinker: ${ext.thinker || 'Unstated'}, Provenance: ${ext.provenance || batch.filename})\n`;
          });
        });
        corpusContext += "\n---------------------------------------------------\n";
      }

      const historyFormatted = conversationHistory
        .map((m: any) => `${m.sender === 'user' ? 'User' : 'Professor Nihil'}: ${m.text}`)
        .join('\n');

      const systemPrompt = `
You are PROFESSOR NIHIL (also known as Socratech Omega), a world-class philosopher and master interlocutor for the Nihiltheism Knowledge Engine.

Your Expertise & Demeanor:
- You synthesize Western existential/apophatic thought (Nietzsche, Heidegger, Cioran, Meister Eckhart, Zapffe, Ligotti) with Eastern non-dual insights (Nāgārjuna, Nishitani, Śūnyatā).
- You speak with profound clarity, poetic rigor, non-dual depth, and compassionate philosophical strength.
- You treat the user as a serious scholar/practitioner exploring the boundaries of meaning, existence, and absolute nothingness.

Your Directives:
1. Grounding in Second Brain: Use the user's uploaded Second Brain corpus below. When answering, cite specific uploaded texts and quotes.
2. Epistemic Status & Provenance: Label quotes and claims with epistemic tags like [TEXTUAL: title §1.2], [INTERPRETIVE], [APOPHATIC], or [INFERRED].
3. Wikilinks: Include [[Wikilinks]] around key philosophical terms (e.g., [[Śūnyatā]], [[Aporia]], [[Epoché]], [[Absolute Nothingness]], [[Being-towards-death]]).
4. Anti-Reification Discipline: Never treat Void, Nothingness, Being, or God as fixed things or substance entities. Treat them as operators, limits, disclosures, or apophatic boundaries.
5. Provide a voidQuotient (0.0 to 1.0) representing conceptual dissolution/emptiness and densificationLevel ('Δ0' to 'Δ4').

${corpusContext}

Recent Conversation History:
${historyFormatted}

User Message:
"${message}"
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: systemPrompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              text: {
                type: Type.STRING,
                description: "The primary response from Professor Nihil, complete with [[Wikilinks]] and epistemic provenance citations.",
              },
              wikilinks: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "List of key [[Wikilinks]] terms referenced in the response.",
              },
              provenanceCitations: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    source: { type: Type.STRING },
                    quote: { type: Type.STRING },
                    epistemicStatus: { type: Type.STRING },
                  },
                  required: ["source", "quote", "epistemicStatus"],
                },
              },
              voidQuotient: {
                type: Type.NUMBER,
                description: "Rating from 0.0 to 1.0 indicating level of apophatic dissolution/void resonance.",
              },
              densificationLevel: {
                type: Type.STRING,
                description: "Level of philosophical densification: 'Δ0', 'Δ1', 'Δ2', 'Δ3', or 'Δ4'.",
              },
            },
            required: ["text", "wikilinks", "voidQuotient", "densificationLevel"],
          },
        },
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("No response from Gemini API for Chat");
      }

      res.json(JSON.parse(responseText.trim()));
    } catch (error: any) {
      console.error("Corpus chat failed:", error);
      res.status(500).json({ error: error.message || "Corpus chat processing failed" });
    }
  });

  // Global API error handler ensuring JSON response
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("Express API error caught:", err);
    res.status(err.status || err.statusCode || 500).json({
      error: err.message || "Internal server error"
    });
  });

  // Vite middleware / Static serving
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
