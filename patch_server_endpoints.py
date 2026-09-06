import re

with open('server.ts', 'r') as f:
    content = f.read()

endpoints = """
  // API Route: AutoNarrative Module
  app.post("/api/autonarrative", async (req, res) => {
    try {
      const { clusterId, nodes } = req.body;
      if (!nodes || nodes.length === 0) return res.status(400).json({ error: "Missing nodes" });
      
      const nodeDescriptions = nodes.map((n: any) => `${n.label}: ${n.desc}`).join('\\n');
      const prompt = `
Act as a Computational Linguist. You are analyzing a community of nodes from a Nihiltheism knowledge graph.
Here are the nodes (top by betweenness centrality):
${nodeDescriptions}

Generate:
1. A Thematic Label (3 words max)
2. A Summary Paragraph explaining the conceptual intersection of these nodes.
3. A Critical Conflict - identify if any nodes within the cluster represent opposing viewpoints.
`;

      const response = await getAi().models.generateContent({
        model: "gemini-pro-latest",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              thematicLabel: { type: Type.STRING },
              summary: { type: Type.STRING },
              criticalConflict: { type: Type.STRING }
            },
            required: ["thematicLabel", "summary", "criticalConflict"]
          }
        }
      });
      const data = JSON.parse(response.text || "{}");
      res.json({ clusterId, ...data });
    } catch(err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // API Route: GapSynthesis Algorithm
  app.post("/api/gapsynthesis", async (req, res) => {
    try {
      const { clusterA, clusterB, nodesA, nodesB } = req.body;
      const prompt = `
Act as a Network Scientist. You are analyzing two highly modular and distinct clusters in a Nihiltheism knowledge graph:
Cluster A: ${clusterA} (Nodes: ${nodesA.map((n:any)=>n.label).join(', ')})
Cluster B: ${clusterB} (Nodes: ${nodesB.map((n:any)=>n.label).join(', ')})

Find a 'Latent Synapse' - a concept not currently in the text that logically links these two disparate topics.
Generate an 'Insight Prompt' for the user (e.g., 'You have discussed X and Y, but have not explored the impact of [Hidden Concept Z] on their relationship.')
`;

      const response = await getAi().models.generateContent({
        model: "gemini-pro-latest",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              latentSynapse: { type: Type.STRING },
              insightPrompt: { type: Type.STRING }
            },
            required: ["latentSynapse", "insightPrompt"]
          }
        }
      });
      const data = JSON.parse(response.text || "{}");
      res.json({ clusterA, clusterB, ...data });
    } catch(err: any) {
      res.status(500).json({ error: err.message });
    }
  });
"""

# Insert right before global error handler
target = "// Global API error handler"
if target in content:
    content = content.replace(target, endpoints + "\n  " + target)
    with open('server.ts', 'w') as f:
        f.write(content)
    print("Patched successfully")
else:
    print("Could not find target")
