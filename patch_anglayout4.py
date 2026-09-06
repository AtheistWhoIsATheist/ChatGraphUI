import re

with open('src/components/ANG/AngLayout.tsx', 'r') as f:
    content = f.read()

content = content.replace("import { IntelligenceSidebar } from './IntelligenceSidebar';", "import { IntelligenceSidebar } from './IntelligenceSidebar';\nimport { MetadataPanel } from './MetadataPanel';")

content = content.replace("const [gravityStrength, setGravityStrength] = useState(50);", "const [gravityStrength, setGravityStrength] = useState(50);\n  const [activeMetadataNodeId, setActiveMetadataNodeId] = useState<string | null>(null);")

reason_feed_start = '<div className="h-48 border-t border-white/5 bg-black/40 p-4 overflow-y-auto flex flex-col gap-3 relative z-10">'
reason_feed_end = "          <form className=\"py-4 border-t border-white/5 z-10 relative bg-void-surface\""

new_reason_feed = """
          <div className="flex">
            <div className="h-48 border-t border-white/5 bg-black/40 p-4 overflow-y-auto flex flex-col gap-4 relative z-10 flex-1">
              <div className="text-[10px] text-white/40 font-mono uppercase tracking-widest border-b border-white/10 pb-2 flex items-center gap-2">
                <Layers size={12} className="text-violet-ethereal" />
                Reasoning Feed
              </div>

              {/* Cluster 1: Metaphysical Vector */}
              <div className="space-y-2 border-l-2 border-violet-ethereal/30 pl-3">
                <div className="text-[10px] uppercase font-mono text-violet-ethereal/70 tracking-widest">Cluster: Metaphysical Vector</div>
                <div className="bg-white/5 border border-white/10 p-3 rounded text-sm text-white/70 font-mono">
                  <p className="mb-2">System detected axiological collapse within the metaphysical vector. Cross-referencing phenomenological tension states.</p>
                  <button 
                    onClick={() => setActiveMetadataNodeId('sacred-dread')}
                    title="Navigate directly to node metadata"
                    className="group inline-flex items-center gap-1.5 px-2.5 py-1 bg-violet-ethereal/10 text-violet-ethereal border border-violet-ethereal/30 rounded text-xs hover:bg-violet-ethereal/30 transition-colors"
                  >
                    <Fingerprint size={12} className="group-hover:animate-pulse" />
                    Node Anchor: Sacred Dread
                  </button>
                </div>
              </div>

              {/* Cluster 2: Ontological Subtraction */}
              <div className="space-y-2 border-l-2 border-cyan-cosmic/30 pl-3 mt-2">
                <div className="text-[10px] uppercase font-mono text-cyan-cosmic/70 tracking-widest">Cluster: Ontological Subtraction</div>
                <div className="bg-white/5 border border-white/10 p-3 rounded text-sm text-white/70 font-mono">
                  <p className="mb-2">Correlating existential finitude markers with active ontological subtraction methodologies.</p>
                  <button 
                    onClick={() => setActiveMetadataNodeId('renunciation')}
                    title="Navigate directly to node metadata"
                    className="group inline-flex items-center gap-1.5 px-2.5 py-1 bg-cyan-cosmic/10 text-cyan-cosmic border border-cyan-cosmic/30 rounded text-xs hover:bg-cyan-cosmic/30 transition-colors"
                  >
                    <Fingerprint size={12} className="group-hover:animate-pulse" />
                    Node Anchor: Renunciation
                  </button>
                </div>
              </div>
            </div>
            
            <MetadataPanel nodeId={activeMetadataNodeId} />
          </div>

"""
content = content.replace(content[content.find(reason_feed_start):content.find(reason_feed_end)], new_reason_feed)

with open('src/components/ANG/AngLayout.tsx', 'w') as f:
    f.write(content)
print("Updated AngLayout reasoning feed and metadata panel")
