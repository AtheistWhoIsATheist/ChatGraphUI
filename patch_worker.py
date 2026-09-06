import re

with open('src/workers/d3.worker.ts', 'r') as f:
    content = f.read()

# 1. Update payload destructuring
content = content.replace("const { nodes, links, width, height, clusteringEnabled } = payload;", "const { nodes, links, width, height, clusteringEnabled, gravityStrength = 50 } = payload;")

# 2. Add gravity custom physics after clustering
gravity_logic = """
    // Calculate basic degree centrality for Gravity
    const degreeMap: Record<string, number> = {};
    d3Links.forEach((l: any) => {
      const srcId = typeof l.source === 'object' ? l.source.id : l.source;
      const tgtId = typeof l.target === 'object' ? l.target.id : l.target;
      degreeMap[srcId] = (degreeMap[srcId] || 0) + 1;
      degreeMap[tgtId] = (degreeMap[tgtId] || 0) + 1;
    });

    const maxDegree = Math.max(...Object.values(degreeMap), 1);
    const gravityFactor = (gravityStrength / 100);

    simulation.force('radial', d3.forceRadial((d: any) => {
      // High degree -> pulled to center (radius 0)
      // Low degree -> pushed to periphery (radius high)
      const degree = degreeMap[d.id] || 0;
      const influence = degree / maxDegree;
      return (1 - influence) * (Math.min(width, height) * 0.45);
    }, width / 2, height / 2).strength(gravityFactor * 0.5));
"""
content = re.sub(r'(    if \(clusteringEnabled\) \{.*?\n    \})', r'\1\n' + gravity_logic, content, flags=re.DOTALL)

with open('src/workers/d3.worker.ts', 'w') as f:
    f.write(content)
print("Patched worker")
