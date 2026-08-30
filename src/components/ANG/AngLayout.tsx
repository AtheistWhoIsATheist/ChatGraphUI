import React, { useState, useMemo } from 'react';
import { 
  Package, ChevronLeft,
  Database, Sparkles, Cpu, ChevronRight, Layers, Send, Network, Brain, Fingerprint, BookOpen, ScrollText, Swords
} from 'lucide-react';
import { AngView, GateMode, BoundaryState } from '../../types/ang';
import { VoidCanvas } from './VoidCanvas';
import nihilData from '../../data/nihiltheism-graph.json';

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
  gateMode,
  onGateModeChange,
}) => {
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [activeLens, setActiveLens] = useState<LensType>('overview');
  
  const activeNode = activeNodeId 
    ? nihilData.graph.nodes.find(n => n.id === activeNodeId) 
    : null;

  const connectedLinks = activeNodeId
    ? nihilData.graph.links.filter(l => l.source === activeNodeId || l.target === activeNodeId)
    : [];

  const collisionData = activeNodeId 
    ? nihilData.collisions.find(c => c.triggerId === activeNodeId)
    : null;

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

  const getConfidenceStyle = (confidence: string) => {
    const status = confidence?.toLowerCase() || 'unrated';
    if (['textual', 'verified', 'defined'].includes(status)) return 'text-green-300 border-green-900/50 bg-green-900/20';
    if (['speculative', 'open'].includes(status)) return 'text-red-400 border-red-900/50 bg-red-900/20';
    return 'text-amber-300 border-amber-900/50 bg-amber-900/20';
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
        
        <button disabled className="neumorphic-button px-3 py-1.5 text-xs font-mono flex items-center gap-2 text-white/40 hover:text-cyan-cosmic disabled:opacity-30 transition-all">
          <Package size={12} />
          Pack Vault
        </button>
      </header>

      <main className="relative z-10 flex-1 flex overflow-hidden">
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
        <div className="flex-1 flex flex-col h-full max-w-3xl mx-auto px-4">
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
          
          <div className="flex-1 overflow-auto py-6 space-y-6 relative flex items-center justify-center pointer-events-none">
            {activeNode ? (
              <div className="text-center space-y-6 max-w-2xl w-full z-10 p-6 glass-panel border border-white/10 rounded-xl pointer-events-auto shadow-2xl bg-void-surface/80 backdrop-blur-xl">
                
                <div className="flex items-center justify-center gap-3 mb-2">
                  <div className={`px-3 py-1 border rounded-full text-[9px] font-mono uppercase tracking-widest ${getConfidenceStyle(activeNode.confidence || 'unrated')}`}>
                    EPISTEMIC: {activeNode.confidence || 'UNRATED'}
                  </div>
                  <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[9px] text-white/60 font-mono uppercase tracking-widest">
                    {activeNode.type || 'CONCEPT'}
                  </div>
                </div>

                <h1 className="font-display text-3xl text-white/90 text-glow-violet leading-tight">{activeNode.label}</h1>
                <p className="text-sm text-white/60 font-mono leading-relaxed max-w-lg mx-auto">{activeNode.desc}</p>
                
                {(activeNode as any).quote && (
                  <div className="mt-4 p-4 border-l-2 border-violet-ethereal bg-violet-ethereal/5 text-left italic text-white/70 text-sm font-mono relative">
                    <ScrollText size={16} className="absolute -left-2 -top-2 text-violet-ethereal bg-void-surface" />
                    "{ (activeNode as any).quote }"
                  </div>
                )}

                {collisionData && (
                  <div className="mt-6 border border-orange-500/30 bg-orange-500/5 rounded-lg p-4 text-left">
                    <div className="text-[10px] font-mono text-orange-400 uppercase tracking-widest border-b border-orange-500/20 pb-2 mb-3 flex items-center justify-between">
                      <span>{collisionData.header}</span>
                      <span className="px-2 py-0.5 bg-orange-500/20 text-orange-300 rounded">UNRESOLVED</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-xs font-bold text-white/80 mb-1">{collisionData.poleA.title}</h4>
                        <p className="text-[10px] text-white/50">{collisionData.poleA.desc}</p>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white/80 mb-1">{collisionData.poleB.title}</h4>
                        <p className="text-[10px] text-white/50">{collisionData.poleB.desc}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {connectedLinks.length > 0 && !collisionData && (
                  <div className="mt-6 pt-6 border-t border-white/5">
                    <p className="text-[10px] text-cyan-cosmic font-mono mb-3 uppercase tracking-widest">Topological Vectors</p>
                    <div className="flex flex-col gap-2 max-h-32 overflow-auto pr-2">
                      {connectedLinks.map((link, i) => (
                        <div key={i} className="text-[11px] text-white/60 font-mono flex items-center justify-center gap-2 bg-black/20 py-1 rounded">
                          <span className="text-white/40 truncate w-32 text-right">{link.source === activeNode.id ? activeNode.label : link.source}</span>
                          <span className="text-cyan-cosmic/70 text-[9px] uppercase">--[{link.relationship}]--&gt;</span>
                          <span className="text-white/40 truncate w-32 text-left">{link.target === activeNode.id ? activeNode.label : link.target}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center space-y-6 z-10 pointer-events-auto max-w-lg">
                <h1 className="font-display text-4xl text-white/60 text-glow-violet">The Void Awaits Input.</h1>
                
                <div className="mt-12 p-6 border border-red-500/20 bg-red-500/5 rounded-xl shadow-2xl backdrop-blur-md">
                  <div className="flex items-center justify-center gap-2 mb-4 text-red-400">
                    <Swords size={18} />
                    <span className="text-xs font-mono uppercase tracking-widest">Defense Simulator Active</span>
                  </div>
                  <p className="text-sm text-white/70 italic leading-relaxed">
                    "{nihilData.defenseSimulator[Math.floor(Date.now() / 10000) % nihilData.defenseSimulator.length]}"
                  </p>
                  <div className="mt-6 text-[10px] text-white/30 font-mono uppercase">
                    Select a node from the corpus to mount a defense.
                  </div>
                </div>
              </div>
            )}
          </div>

          <form className="py-4 border-t border-white/5 z-10 relative" onSubmit={(e) => e.preventDefault()}>
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
      </main>

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

