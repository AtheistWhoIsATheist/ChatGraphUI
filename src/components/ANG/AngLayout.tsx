import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft,
  Database, Sparkles, Cpu, ChevronRight, Layers, Send, Network, Brain, Fingerprint, BookOpen, Swords, HardDrive, Search, Sliders
} from 'lucide-react';
import { AngView, GateMode, BoundaryState } from '../../types/ang';
import { VoidCanvas } from './VoidCanvas';
import { D3Graph } from './D3Graph';
import { FileManager } from './FileManager';
import { IntelligenceSidebar } from './IntelligenceSidebar';
import { MetadataPanel } from './MetadataPanel';
import nihilData from '../../data/nihiltheism-graph.json';

import { DisparityHistoryChart } from './DisparityHistoryChart';

interface AngLayoutProps {
  activeView: AngView;
  onNavigate: (view: AngView) => void;
  children: React.ReactNode;
  gateMode: GateMode;
  onGateModeChange: (mode: GateMode) => void;
  boundaryState: BoundaryState;
}

type LensType = 'overview' | 'provenance' | 'conflict';

export const AngLayout: React.FC<AngLayoutProps> = ({
  activeView,
  onNavigate,
  children,
  gateMode,
  onGateModeChange,
}) => {
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [activeLens, setActiveLens] = useState<LensType>('overview');
  const [clusteringMode, setClusteringMode] = useState<'none' | 'doctrinal' | 'structural'>('none');
  const [isFileManagerOpen, setIsFileManagerOpen] = useState(false);
  const [scentedSearch, setScentedSearch] = useState('');
  const [gravityStrength, setGravityStrength] = useState(50);
  const [activeMetadataNodeId, setActiveMetadataNodeId] = useState<string | null>(null);
  
  const activeNode = activeNodeId 
    ? nihilData.graph.nodes.find(n => n.id === activeNodeId) 
    : null;

  const connectedLinks = activeNodeId
    ? nihilData.graph.links.filter(l => l.source === activeNodeId || l.target === activeNodeId)
    : [];

  const filteredNodes = useMemo(() => {
    switch (activeLens) {
      case 'provenance': return nihilData.graph.nodes.filter(n => n.type === 'document' || n.type === 'thinker');
      case 'conflict': return nihilData.graph.nodes.filter(n => n.type === 'claim' || n.id === 'latent-divine');
      default: return nihilData.graph.nodes;
    }
  }, [activeLens]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'thinker': return <Brain size={14} className="text-violet-ethereal" />;
      case 'concept': return <Fingerprint size={14} className="text-cyan-cosmic" />;
      case 'claim': return <Swords size={14} className="text-orange-400" />;
      case 'document': return <BookOpen size={14} className="text-amber-200/60" />;
      default: return <Network size={14} className="text-white/40" />;
    }
  };

  return (
    <div className="h-screen w-screen bg-void-surface overflow-hidden flex flex-col font-sans">
      <VoidCanvas />
      <div className="fixed inset-0 z-50 pointer-events-none"></div>
      
      <header className="relative z-10 px-4 py-3 border-b border-white/5 flex items-center justify-between bg-void-surface/90 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border border-violet-ethereal/50 flex items-center justify-center">
            <div className="w-3 h-3 bg-violet-ethereal/50 animate-pulse"></div>
          </div>
          <div className="flex flex-col">
            <h1 className="font-display text-lg text-white/80 leading-none tracking-widest uppercase">Synethetix Nihil Brain</h1>
            <span className="text-[10px] text-white/40 font-mono mt-1">Dissertation Memory Architecture</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => onNavigate('workspace')} 
            className={`neumorphic-button px-3 py-1.5 text-xs font-mono flex items-center gap-1.5 transition-all border ${
              activeView === 'workspace' 
                ? 'border-violet-400/60 text-violet-200 bg-violet-600/20 font-bold shadow-[0_0_12px_rgba(168,85,247,0.3)]' 
                : 'border-white/10 text-white/80 hover:text-violet-300'
            }`}
          >
            <Sparkles size={12} className="text-violet-400" /> Visual Core
          </button>
          <button 
            onClick={() => onNavigate('graph')} 
            className={`neumorphic-button px-3 py-1.5 text-xs font-mono flex items-center gap-1.5 transition-all border ${
              activeView === 'graph' 
                ? 'border-cyan-cosmic/50 text-cyan-cosmic bg-cyan-cosmic/10 font-bold' 
                : 'border-white/10 text-white/70 hover:text-cyan-cosmic'
            }`}
          >
            <Network size={12} /> Graph
          </button>
          <button 
            onClick={() => onNavigate('academic')} 
            className={`neumorphic-button px-3 py-1.5 text-xs font-mono flex items-center gap-1.5 transition-all border ${
              activeView === 'academic' 
                ? 'border-amber-500/50 text-amber-400 bg-amber-500/10 font-bold' 
                : 'border-white/10 text-white/70 hover:text-amber-500'
            }`}
          >
            <BookOpen size={12} /> Academia
          </button>
          <button 
            onClick={() => onNavigate('chat')} 
            className={`neumorphic-button px-3 py-1.5 text-xs font-mono flex items-center gap-1.5 transition-all border ${
              activeView === 'chat' 
                ? 'border-violet-ethereal/50 text-violet-300 bg-violet-ethereal/10 font-bold' 
                : 'border-white/10 text-white/70 hover:text-violet-ethereal'
            }`}
          >
            <Brain size={12} /> Dialectic
          </button>
          <button onClick={() => setIsFileManagerOpen(true)} className="neumorphic-button px-3 py-1.5 text-xs font-mono flex items-center gap-1.5 text-white/70 hover:text-cyan-cosmic transition-all border border-cyan-cosmic/30">
            <HardDrive size={12} /> DataHub
          </button>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex overflow-hidden">
        {activeView && activeView !== 'graph' ? (
          <div className="flex-1 h-full overflow-hidden bg-void-surface">
            {children}
          </div>
        ) : (
          <>
            {/* Left Column: The Library (Nodes) */}
        <div className="w-72 h-full glass-panel flex flex-col border-y-0 border-l-0 bg-void-surface/40">
          <div className="p-3 border-b border-white/5 flex items-center justify-between">
            <h2 className="font-display text-sm text-white/80">Ontological Corpus</h2>
            <button className="p-1 text-white/30 hover:text-white/60 transition-colors">
              <ChevronLeft size={16} />
            </button>
          </div>
          
          <div className="px-3 py-2 border-b border-white/5 flex gap-1 bg-black/20">
            <button onClick={() => setActiveLens('overview')} className={`flex-1 py-1 text-[10px] font-mono rounded border transition-colors ${activeLens === 'overview' ? 'border-cyan-cosmic/50 text-cyan-cosmic bg-cyan-cosmic/10' : 'border-transparent text-white/40 hover:text-white/80'}`}>ALL</button>
            <button onClick={() => setActiveLens('provenance')} className={`flex-1 py-1 text-[10px] font-mono rounded border transition-colors ${activeLens === 'provenance' ? 'border-violet-ethereal/50 text-violet-ethereal bg-violet-ethereal/10' : 'border-transparent text-white/40 hover:text-white/80'}`}>PROVENANCE</button>
            <button onClick={() => setActiveLens('conflict')} className={`flex-1 py-1 text-[10px] font-mono rounded border transition-colors ${activeLens === 'conflict' ? 'border-orange-400/50 text-orange-400 bg-orange-400/10' : 'border-transparent text-white/40 hover:text-white/80'}`}>CONFLICT</button>
          </div>

          <div className="flex-1 overflow-auto p-2 space-y-1">
            {filteredNodes.map(node => (
              <button
                key={node.id}
                onClick={() => setActiveNodeId(node.id)}
                className={`w-full text-left p-2 rounded flex items-center gap-3 transition-all ${
                  activeNodeId === node.id 
                    ? 'bg-white/10 text-white border border-white/20' 
                    : 'text-white/50 hover:bg-white/5 hover:text-white/80 border border-transparent'
                }`}
              >
                {getTypeIcon(node.type || 'concept')}
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-mono truncate">{node.label}</span>
                  <span className="text-[9px] text-white/30 uppercase tracking-wider truncate">{node.type}</span>
                </div>
              </button>
            ))}
          </div>
          <div className="p-2 border-t border-white/5 text-xs text-white/30 font-mono flex justify-between bg-black/40">
            <span>{filteredNodes.length} nodes (lens)</span>
            <span>{nihilData.graph.links.length} edges</span>
          </div>
        </div>

        {/* Center Column: Void/Synthesis Engine */}
        <div className="flex-1 flex flex-col h-full min-w-0 px-4">
          <div className="py-4 flex items-center justify-between gap-4 border-b border-white/5">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => onGateModeChange('DEEP')}
                className={`neumorphic-button px-3 py-1.5 text-xs font-mono flex items-center gap-2 transition-all ${
                  gateMode === 'DEEP' || gateMode === 'AUTO' ? 'text-cyan-cosmic glow-cyan' : 'text-white/40'
                }`}
              >
                <Database size={12} />
                RAG_STRICT
              </button>
              <button 
                onClick={() => onGateModeChange('AUTO')}
                className={`neumorphic-button px-3 py-1.5 text-xs font-mono flex items-center gap-2 transition-all ${
                  gateMode === 'AUTO' ? 'text-white/40' : 'text-white/40'
                }`}
              >
                <Sparkles size={12} />
                CREATIVE
              </button>
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
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-white/30 font-mono">SHORT-TERM</span>
              <input 
                type="range" 
                min="0" 
                max="100" 
                defaultValue="50"
                className="w-24 h-1 appearance-none bg-white/10 cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-violet-ethereal [&::-webkit-slider-thumb]:shadow-lg" 
              />
              <span className="text-[10px] text-white/30 font-mono">LONG-TERM</span>
            </div>
          </div>
          
          <div className="flex-1 overflow-hidden relative border-t border-b border-white/5 bg-black/20">
            <D3Graph 
              nodes={filteredNodes} 
              links={nihilData.graph.links} 
              activeNodeId={activeNodeId} 
              onNodeClick={setActiveNodeId}
              clusteringMode={clusteringMode}
                gravityStrength={gravityStrength}
                searchTerm={scentedSearch}
            />
          </div>

          
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
            
            <DisparityHistoryChart />
            <MetadataPanel nodeId={activeMetadataNodeId} />
          </div>

          <form className="py-4 border-t border-white/5 z-10 relative bg-void-surface" onSubmit={(e) => e.preventDefault()}>
            <div className="glass-panel rounded-none border-0 flex items-center gap-3 p-2 focus-within:border-violet-ethereal/30 transition-colors bg-black/40">
              <input 
                type="text" 
                placeholder="Interrogate the corpus..." 
                className="flex-1 bg-transparent text-sm text-white/90 placeholder:text-white/20 outline-none font-mono disabled:opacity-50 px-2" 
              />
              <button type="submit" disabled className="neumorphic-button p-2 text-violet-ethereal disabled:opacity-30 hover:glow-violet transition-all">
                <Send size={16} />
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Memory State */}
        <div className="w-64 h-full glass-panel flex flex-col border-y-0 border-r-0 bg-void-surface/40">
          <div className="p-3 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu size={14} className="text-white/40" />
              <h2 className="font-display text-sm text-white/80">Inspector</h2>
            </div>
            <button className="p-1 text-white/30 hover:text-white/60 transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>
          <div className="flex-1 overflow-auto p-4 space-y-6">
            {activeNode ? (
              <>
                <div className="space-y-2">
                  <h3 className="text-[9px] font-mono text-cyan-cosmic uppercase tracking-widest">Tags / Clusters</h3>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="px-1.5 py-0.5 bg-white/10 border border-white/20 rounded text-[9px] text-white/80 font-mono uppercase">
                      {activeNode.cluster || 'unclustered'}
                    </span>
                    {(activeNode as any).tags?.map((t: string) => (
                      <span key={t} className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-[9px] text-white/50 font-mono">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-[9px] font-mono text-violet-ethereal uppercase tracking-widest">Provenance</h3>
                  <div className="p-2 border border-white/5 bg-black/20 rounded text-xs text-white/60 font-mono truncate">
                    {activeNode.source || 'Unassigned'}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-[9px] font-mono text-white/40 uppercase tracking-widest">Graph Metrics</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 border border-white/5 bg-black/20 rounded">
                      <strong className="block font-mono text-sm text-white/90">{connectedLinks.length}</strong>
                      <span className="text-[8px] text-white/40 uppercase">Degree</span>
                    </div>
                    <div className="p-2 border border-white/5 bg-black/20 rounded">
                      <strong className="block font-mono text-sm text-white/90">{activeNode.size}</strong>
                      <span className="text-[8px] text-white/40 uppercase">Mass (Tokens)</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t border-white/5">
                  <h3 className="text-[9px] font-mono text-amber-400/70 uppercase tracking-widest">Guardrails</h3>
                  <p className="text-[10px] text-white/40 leading-relaxed italic">
                    Nothing is permitted to masquerade as a source claim merely because it fits the thesis. Distinguish retrieved text from interpretive synthesis.
                  </p>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-white/20 gap-3">
                <Layers size={32} />
                <span className="text-xs font-mono text-center">No entity focused</span>
                <span className="text-[10px] text-white/10 text-center px-4 leading-relaxed">Select an ontological unit to inspect identity, source trail, and epistemic status.</span>
              </div>
            )}
          </div>
          <div className="h-24 border-t border-white/5 relative overflow-hidden flex flex-col justify-end p-2 bg-gradient-to-t from-black/50 to-transparent">
            {activeNode ? (
              <div className="space-y-1 w-full">
                <div className="flex justify-between text-[8px] font-mono text-white/30 uppercase">
                  <span>Size Vector</span>
                  <span className="text-cyan-cosmic">{activeNode.size} units</span>
                </div>
                <div className="w-full h-1 bg-white/10 rounded overflow-hidden">
                  <div className="h-full bg-cyan-cosmic shadow-[0_0_10px_rgba(0,240,255,0.5)] transition-all duration-500" style={{ width: `${Math.min(100, activeNode.size * 4)}%` }}></div>
                </div>
              </div>
            ) : (
              <svg className="w-full h-full opacity-30" viewBox="0 0 200 100">
                <text x="100" y="55" textAnchor="middle" className="fill-white/30 text-[8px] uppercase font-mono tracking-widest">vector space empty</text>
              </svg>
            )}
          </div>
        </div>
          </>
        )}
      </main>

      
      {/* Intelligence Sidebar / Semantic Oracle */}
      <IntelligenceSidebar activeNodeId={activeNodeId} />

      {/* File Manager DataHub Overlay */}
      {isFileManagerOpen && <FileManager onClose={() => setIsFileManagerOpen(false)} />}


      <footer className="relative z-10 px-4 py-2 border-t border-white/5 flex items-center justify-between text-[9px] text-white/30 font-mono bg-black/60">
        <div className="flex items-center gap-4">
          <span className="text-green-400 flex items-center gap-1"><div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div> LOCAL MEMORY</span>
          <span>{activeNode ? activeNode.size * 14 : 0} TOKENS ACTIVE</span>
        </div>
        <div className="flex items-center gap-4">
          <span>LENS: {activeLens.toUpperCase()}</span>
          <span>MODE: {gateMode === 'DEEP' ? 'RAG STRICT' : 'CREATIVE'}</span>
        </div>
      </footer>
    </div>
  );
};

