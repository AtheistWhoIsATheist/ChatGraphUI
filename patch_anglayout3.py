import re

with open('src/components/ANG/AngLayout.tsx', 'r') as f:
    content = f.read()

content = content.replace("const [clusteringEnabled, setClusteringEnabled] = useState(false);", "const [clusteringMode, setClusteringMode] = useState<'none' | 'doctrinal' | 'structural'>('none');")
content = content.replace("clusteringEnabled={clusteringEnabled}", "clusteringMode={clusteringMode}")

cluster_buttons = """
              <select 
                value={clusteringMode}
                onChange={(e) => setClusteringMode(e.target.value as any)}
                className={`neumorphic-button px-3 py-1.5 text-xs font-mono outline-none transition-all ${
                  clusteringMode !== 'none' ? 'text-violet-ethereal glow-violet bg-violet-ethereal/10' : 'text-white/40 bg-black/40'
                }`}
              >
                <option value="none">NO CLUSTERING</option>
                <option value="doctrinal">DOCTRINAL (Topic)</option>
                <option value="structural">STRUCTURAL (Type)</option>
              </select>
"""
content = re.sub(r'<button \n\s*onClick=\{\(\) => setClusteringEnabled\(!clusteringEnabled\)\}.*?CLUSTERING\n\s*</button>', cluster_buttons.strip(), content, flags=re.DOTALL)

with open('src/components/ANG/AngLayout.tsx', 'w') as f:
    f.write(content)
print("AngLayout updated")
