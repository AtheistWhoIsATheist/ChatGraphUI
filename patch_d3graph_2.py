import re

with open('src/components/ANG/D3Graph.tsx', 'r') as f:
    content = f.read()

content = content.replace("clusteringEnabled?: boolean;", "clusteringMode?: 'none' | 'doctrinal' | 'structural';")
content = content.replace("clusteringEnabled = false,", "clusteringMode = 'none',")
content = content.replace("payload: { nodes: payloadNodes, links, width, height, clusteringEnabled, gravityStrength }", "payload: { nodes: payloadNodes, links, width, height, clusteringMode, gravityStrength }")
content = content.replace("}, [nodes, links, clusteringEnabled, gravityStrength]);", "}, [nodes, links, clusteringMode, gravityStrength]);")

with open('src/components/ANG/D3Graph.tsx', 'w') as f:
    f.write(content)
print("D3Graph updated")
