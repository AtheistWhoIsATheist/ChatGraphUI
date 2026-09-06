import re

with open('src/components/ANG/D3Graph.tsx', 'r') as f:
    content = f.read()

# 1. Update Props
props_repl = """interface D3GraphProps {
  nodes: any[];
  links: any[];
  activeNodeId: string | null;
  onNodeClick: (id: string) => void;
  clusteringEnabled?: boolean;
  gravityStrength?: number;
  searchTerm?: string;
}

export const D3Graph: React.FC<D3GraphProps> = ({ nodes, links, activeNodeId, onNodeClick, clusteringEnabled = false, gravityStrength = 50, searchTerm = '' }) => {"""
content = re.sub(r'interface D3GraphProps \{.*?\n.*?=> \{', props_repl, content, flags=re.DOTALL)

# 2. Worker payload update
content = content.replace("payload: { nodes, links, width, height, clusteringEnabled }", "payload: { nodes, links, width, height, clusteringEnabled, gravityStrength }")

# 3. Update useEffect dependencies
content = re.sub(r'\}, \[nodes, links, clusteringEnabled\]\);', '}, [nodes, links, clusteringEnabled, gravityStrength]);', content)

# 4. Search and Active Node styling
styling_repl = """
  useEffect(() => {
    if (elementsRef.current) {
      const searchLower = (searchTerm || '').toLowerCase();
      
      elementsRef.current.node
        .attr('stroke', (d: any) => {
          if (d.id === activeNodeId) return '#ffffff';
          if (searchLower && d.label.toLowerCase().includes(searchLower)) return '#facc15'; // Scented Search Heatmap
          return d.type === 'concept' ? '#63d8e8' : '#a78bfa';
        })
        .attr('stroke-width', (d: any) => {
          if (d.id === activeNodeId) return 3;
          if (searchLower && d.label.toLowerCase().includes(searchLower)) return 3;
          return 1.5;
        })
        .attr('fill', (d: any) => {
           if (searchLower && d.label.toLowerCase().includes(searchLower)) return 'rgba(250, 204, 21, 0.4)';
           return d.type === 'concept' ? 'rgba(99, 216, 232, 0.1)' : 'rgba(167, 139, 250, 0.1)';
        });
    }
  }, [activeNodeId, searchTerm]);
"""
content = re.sub(r'  useEffect\(\(\) => \{\n    if \(elementsRef\.current\) \{\n      elementsRef\.current\.node\n        \.attr\(\'stroke\', .*?\n        \.attr\(\'stroke-width\', .*?\n    \}\n  \}, \[activeNodeId\]\);', styling_repl.strip(), content, flags=re.DOTALL)

with open('src/components/ANG/D3Graph.tsx', 'w') as f:
    f.write(content)

print("Patched D3Graph")
