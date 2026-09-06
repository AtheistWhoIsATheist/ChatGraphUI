import re

with open('src/components/ANG/AngLayout.tsx', 'r') as f:
    content = f.read()

# Add FileManager import
content = content.replace("import { D3Graph } from './D3Graph';", "import { D3Graph } from './D3Graph';\nimport { FileManager } from './FileManager';")
content = content.replace("Database, Sparkles, Cpu, ChevronRight, Layers, Send, Network, Brain, Fingerprint, BookOpen, Swords", "Database, Sparkles, Cpu, ChevronRight, Layers, Send, Network, Brain, Fingerprint, BookOpen, Swords, HardDrive, Search, Sliders")

# Add state variables
state_vars = """
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [activeLens, setActiveLens] = useState<LensType>('overview');
  const [clusteringEnabled, setClusteringEnabled] = useState(false);
  const [isFileManagerOpen, setIsFileManagerOpen] = useState(false);
  const [scentedSearch, setScentedSearch] = useState('');
  const [gravityStrength, setGravityStrength] = useState(50);
"""
content = re.sub(r'const \[activeNodeId, setActiveNodeId\].*?const \[clusteringEnabled, setClusteringEnabled\] = useState\(false\);', state_vars.strip(), content, flags=re.DOTALL)

# Add DataHub button to header
header_btn = """
        <div className="flex gap-2">
          <button onClick={() => setIsFileManagerOpen(true)} className="neumorphic-button px-3 py-1.5 text-xs font-mono flex items-center gap-2 text-white/70 hover:text-cyan-cosmic transition-all border border-cyan-cosmic/30">
            <HardDrive size={12} /> DataHub
          </button>
          <button disabled className="neumorphic-button px-3 py-1.5 text-xs font-mono flex items-center gap-2 text-white/40 hover:text-cyan-cosmic disabled:opacity-30 transition-all">
            <Package size={12} />
            Pack Vault
          </button>
        </div>
"""
content = re.sub(r'<button disabled className="neumorphic-button px-3 py-1.5 text-xs font-mono flex items-center gap-2 text-white/40 hover:text-cyan-cosmic disabled:opacity-30 transition-all">.*?Pack Vault\s*</button>', header_btn.strip(), content, flags=re.DOTALL)

# Add Gravity and Search controls to the center column header
center_controls = """
              <button 
                onClick={() => setClusteringEnabled(!clusteringEnabled)}
                className={`neumorphic-button px-3 py-1.5 text-xs font-mono flex items-center gap-2 transition-all ${
                  clusteringEnabled ? 'text-violet-ethereal glow-violet bg-violet-ethereal/10' : 'text-white/40'
                }`}
              >
                <Network size={12} />
                CLUSTERING
              </button>
            </div>
            
            <div className="flex items-center gap-4 flex-1 justify-end">
              <div className="flex items-center gap-2 text-white/50">
                <Sliders size={12} />
                <input 
                  type="range" min="0" max="100" value={gravityStrength} 
                  onChange={(e) => setGravityStrength(Number(e.target.value))}
                  className="w-24 accent-violet-ethereal cursor-pointer"
                  title="Gravity Matrix (Pull influential nodes to center)"
                />
              </div>
              <div className="relative">
                <Search size={12} className="absolute left-2 top-1.5 text-white/40" />
                <input 
                  type="text"
                  placeholder="Scented Search..."
                  value={scentedSearch}
                  onChange={(e) => setScentedSearch(e.target.value)}
                  className="w-40 bg-black/40 border border-white/10 rounded pl-7 pr-2 py-1 text-xs text-white/90 focus:border-cyan-cosmic/50 outline-none"
                />
              </div>
            </div>
"""
content = re.sub(r'<button \s*onClick=\{\(\) => setClusteringEnabled\(!clusteringEnabled\)\}.*?CLUSTERING\s*</button>\s*</div>', center_controls.strip(), content, flags=re.DOTALL)

# Add FileManager rendering
file_manager_render = """
      {/* File Manager DataHub Overlay */}
      {isFileManagerOpen && <FileManager onClose={() => setIsFileManagerOpen(false)} />}
"""
content = content.replace("</main>", "</main>\n" + file_manager_render)

# Update D3Graph props
content = content.replace(
  "clusteringEnabled={clusteringEnabled}",
  "clusteringEnabled={clusteringEnabled}\n                gravityStrength={gravityStrength}\n                searchTerm={scentedSearch}"
)

with open('src/components/ANG/AngLayout.tsx', 'w') as f:
    f.write(content)
print("Patched AngLayout")
