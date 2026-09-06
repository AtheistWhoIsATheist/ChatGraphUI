import re

with open('src/workers/d3.worker.ts', 'r') as f:
    content = f.read()

content = content.replace("clusteringEnabled,", "clusteringMode = 'none',")
content = content.replace("clusteringEnabled, gravityStrength = 50 } = payload;", "clusteringMode = 'none', gravityStrength = 50 } = payload;")
content = content.replace("if (clusteringEnabled) {", "if (clusteringMode !== 'none') {")

cluster_logic = """
      const getClusterKey = (d: any) => clusteringMode === 'structural' ? d.type : d.cluster;
      simulation.force('cluster', (alpha: number) => {
        currentNodes.forEach((d: any) => {
          const key = getClusterKey(d);
          if (!clusters[key]) {
            clusters[key] = { x: 0, y: 0, count: 0 };
          }
        });
        
        const clusterNames = Object.keys(clusters);
        const radius = Math.min(width, height) * 0.35;
        
        clusterNames.forEach((name, i) => {
          const angle = (i / clusterNames.length) * 2 * Math.PI;
          clusters[name].x = (width / 2) + Math.cos(angle) * radius;
          clusters[name].y = (height / 2) + Math.sin(angle) * radius;
        });

        currentNodes.forEach((d: any) => {
          const key = getClusterKey(d);
          const target = clusters[key];
          if (target) {
            d.vx -= (d.x - target.x) * alpha * 0.1;
            d.vy -= (d.y - target.y) * alpha * 0.1;
          }
        });
      });
"""
content = re.sub(r"simulation\.force\('cluster', \(alpha: number\) => \{.*?\}\);", cluster_logic.strip(), content, flags=re.DOTALL)

with open('src/workers/d3.worker.ts', 'w') as f:
    f.write(content)
print("Worker updated")
