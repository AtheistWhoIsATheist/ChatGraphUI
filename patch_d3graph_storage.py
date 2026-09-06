import re

with open('src/components/ANG/D3Graph.tsx', 'r') as f:
    content = f.read()

# 1. Update worker INIT payload to send saved positions
init_code = """
    // Local Storage layout loading
    let savedPositions: any = null;
    try {
      const saved = localStorage.getItem('nihil_graph_layout');
      if (saved) savedPositions = JSON.parse(saved);
    } catch (e) {}

    const payloadNodes = nodes.map(n => {
      const pos = savedPositions?.[n.id];
      if (pos) {
        return { ...n, x: pos.x, y: pos.y, fx: pos.x, fy: pos.y };
      }
      return n;
    });

    workerRef.current.postMessage({
      type: 'INIT',
      payload: { nodes: payloadNodes, links, width, height, clusteringEnabled, gravityStrength }
    });
"""
content = re.sub(r"    workerRef\.current\.postMessage\(\{\n      type: 'INIT',\n      payload: \{ nodes, links, width, height, clusteringEnabled, gravityStrength \}\n    \}\);", init_code.strip(), content)

# 2. Update END message to save layout
end_msg_code = """
      if (type === 'END') {
        const { nodes: updatedNodes } = payload;
        const layout: Record<string, any> = {};
        updatedNodes.forEach((n: any) => {
          layout[n.id] = { x: n.x, y: n.y };
        });
        localStorage.setItem('nihil_graph_layout', JSON.stringify(layout));
      }
"""
content = content.replace("if (type === 'TICK' || type === 'END') {", end_msg_code.strip() + "\n      if (type === 'TICK' || type === 'END') {")

with open('src/components/ANG/D3Graph.tsx', 'w') as f:
    f.write(content)
print("Patched storage")
