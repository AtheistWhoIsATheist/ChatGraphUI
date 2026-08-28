import React, { useState } from 'react';
import { 
  Package, ChevronLeft, Plus, Trash2, Download, Zap, XCircle, FileText, 
  Database, Sparkles, Cpu, ChevronRight, Layers, Send, Network
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

export const AngLayout: React.FC<AngLayoutProps> = ({
  children,
  gateMode,
  onGateModeChange,
}) => {
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  
  const activeNode = activeNodeId 
    ? nihilData.graph.nodes.find(n => n.id === activeNodeId) 
    : null;

  const connectedLinks = activeNodeId
    ? nihilData.graph.links.filter(l => l.source === activeNodeId || l.target === activeNodeId)
    : [];

  return (
    <div className="h-screen w-screen bg-void-surface overflow-hidden flex flex-col font-sans">
      <VoidCanvas />
      <div className="fixed inset-0 z-50 pointer-events-none"></div>
      
      <header className="relative z-10 px-4 py-3 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border border-violet-ethereal/50 flex items-center justify-center">
            <div className="w-3 h-3 bg-violet-ethereal/50 animate-pulse"></div>
          </div>
          <h1 className="font-display text-lg text-white/80">Synethetix Nihil Brain</h1>
          <span className="text-[10px] text-white/20 font-mono">v2.0</span>
        </div>
        
        <button disabled className="neumorphic-button px-3 py-1.5 text-xs font-mono flex items-center gap-2 text-white/40 hover:text-cyan-cosmic disabled:opacity-30 transition-all">
          <Package size={12} />
          Pack Vault
        </button>
      </header>

      <main className="relative z-10 flex-1 flex overflow-hidden">
        {/* Left Column: The Library (Nodes) */}
        <div className="w-72 h-full glass-panel flex flex-col border-y-0 border-l-0">
          <div className="p-3 border-b border-white/5 flex items-center justify-between">
            <h2 className="font-display text-sm text-white/80">Ontological Corpus</h2>
            <button className="p-1 text-white/30 hover:text-white/60 transition-colors">
              <ChevronLeft size={16} />
            </button>
          </div>
          <div className="p-2 border-b border-white/5 flex gap-1 flex-wrap">
            <button className="neumorphic-button p-2 text-violet-ethereal hover:text-glow-violet transition-all" title="Add Files">
              <Plus size={14} />
            </button>
            <button disabled className="neumorphic-button p-2 text-white/40 hover:text-red-400 disabled:opacity-30 transition-all" title="Delete Selected">
              <Trash2 size={14} />
            </button>
            <button disabled className="neumorphic-button p-2 text-white/40 hover:text-cyan-cosmic disabled:opacity-30 transition-all" title="Export">
              <Download size={14} />
            </button>
            <button disabled className="neumorphic-button p-2 text-white/40 hover:text-cyan-cosmic disabled:opacity-30 transition-all" title="Toggle Active">
              <Zap size={14} />
            </button>
            <button disabled className="neumorphic-button p-2 text-white/40 hover:text-red-500 disabled:opacity-30 transition-all ml-auto" title="Flush Memory">
              <XCircle size={14} />
            </button>
          </div>
          <div className="flex-1 overflow-auto p-2 space-y-1">
            {nihilData.graph.nodes.map(node => (
              <button
                key={node.id}
                onClick={() => setActiveNodeId(node.id)}
                className={`w-full text-left p-2 rounded flex items-center gap-2 transition-all ${
                  activeNodeId === node.id 
                    ? 'bg-violet-ethereal/20 text-white border border-violet-ethereal/30 glow-violet' 
                    : 'text-white/50 hover:bg-white/5 hover:text-white/80'
                }`}
              >
                <Network size={14} className={activeNodeId === node.id ? 'text-cyan-cosmic' : ''} />
                <span className="text-xs font-mono truncate">{node.label}</span>
              </button>
            ))}
          </div>
          <div className="p-2 border-t border-white/5 text-xs text-white/30 font-mono flex justify-between">
            <span>{nihilData.graph.nodes.length} nodes</span>
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
              <div className="text-center space-y-6 max-w-lg z-10 p-6 glass-panel border border-violet-ethereal/20 rounded-xl pointer-events-auto">
                <div className="inline-block px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] text-cyan-cosmic font-mono uppercase mb-2">
                  {activeNode.category}
                </div>
                <h1 className="font-display text-2xl text-white/90 text-glow-violet leading-tight">{activeNode.label}</h1>
                
                {connectedLinks.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-white/5">
                    <p className="text-xs text-white/40 font-mono mb-3 uppercase tracking-wider">Topological Vectors</p>
                    <div className="flex flex-col gap-2">
                      {connectedLinks.map((link, i) => (
                        <div key={i} className="text-xs text-white/60 font-mono flex items-center justify-center gap-2">
                          <span className="text-white/30">{link.source === activeNode.id ? activeNode.label : link.source}</span>
                          <span className="text-cyan-cosmic/70 text-[10px]">--[{link.relationship}]--&gt;</span>
                          <span className="text-white/30">{link.target === activeNode.id ? activeNode.label : link.target}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center space-y-4 z-10 pointer-events-auto">
                <h1 className="font-display text-3xl text-white/60 text-glow-violet">The Void Awaits Input.</h1>
                <p className="text-sm text-white/20 font-mono max-w-md mx-auto">Select a node from the Library. Query the darkness. Receive synthesis.</p>
                
                <div className="mt-12 space-y-3 max-w-md mx-auto text-left opacity-60">
                  <p className="text-[10px] text-cyan-cosmic font-mono uppercase tracking-widest border-b border-white/5 pb-1">Recursive Tensions</p>
                  {nihilData.tensions.map((t, i) => (
                    <div key={i} className="text-xs">
                      <span className="text-white/60 font-mono block mb-1">{t.title}</span>
                      <span className="text-white/30">{t.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <form className="py-4 border-t border-white/5 z-10 relative" onSubmit={(e) => e.preventDefault()}>
            <div className="glass-panel rounded-none border-0 flex items-center gap-3 p-2 focus-within:border-violet-ethereal/30 transition-colors">
              <input 
                type="text" 
                placeholder="Query the void..." 
                className="flex-1 bg-transparent text-sm text-white/90 placeholder:text-white/20 outline-none font-mono disabled:opacity-50 px-2" 
              />
              <button type="submit" disabled className="neumorphic-button p-2 text-violet-ethereal disabled:opacity-30 hover:glow-violet transition-all">
                <Send size={16} />
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Memory State */}
        <div className="w-64 h-full glass-panel flex flex-col border-y-0 border-r-0">
          <div className="p-3 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu size={14} className="text-white/40" />
              <h2 className="font-display text-sm text-white/80">Node State</h2>
            </div>
            <button className="p-1 text-white/30 hover:text-white/60 transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>
          <div className="flex-1 overflow-auto p-4 space-y-6">
            {activeNode ? (
              <>
                <div className="space-y-2">
                  <h3 className="text-[10px] font-mono text-cyan-cosmic uppercase tracking-widest">Themes</h3>
                  <div className="flex flex-wrap gap-1">
                    {activeNode.theme.map(t => (
                      <span key={t} className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[9px] text-white/60 font-mono">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-[10px] font-mono text-violet-ethereal uppercase tracking-widest">Description</h3>
                  <p className="text-xs text-white/70 leading-relaxed">
                    {activeNode.description}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Significance</h3>
                  <p className="text-xs text-white/50 leading-relaxed italic border-l-2 border-white/10 pl-2">
                    {activeNode.significance}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-[10px] font-mono text-red-400/70 uppercase tracking-widest">Stakes</h3>
                  <p className="text-xs text-white/60 leading-relaxed">
                    {activeNode.stakes}
                  </p>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-white/20 gap-3">
                <Layers size={32} />
                <span className="text-xs font-mono text-center">No node focused</span>
                <span className="text-xs text-white/10 text-center">Select an ontological unit to inspect state</span>
              </div>
            )}
          </div>
          <div className="h-32 border-t border-white/5 relative overflow-hidden flex flex-col justify-end p-2 bg-gradient-to-t from-black/50 to-transparent">
            {activeNode ? (
              <div className="space-y-1 w-full">
                <div className="flex justify-between text-[8px] font-mono text-white/30 uppercase">
                  <span>Size Vector</span>
                  <span className="text-cyan-cosmic">{activeNode.size} units</span>
                </div>
                <div className="w-full h-1 bg-white/10 rounded overflow-hidden">
                  <div className="h-full bg-cyan-cosmic shadow-[0_0_10px_rgba(0,240,255,0.5)]" style={{ width: `${Math.min(100, activeNode.size * 4)}%` }}></div>
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

      <footer className="relative z-10 px-4 py-2 border-t border-white/5 flex items-center justify-between text-[10px] text-white/20 font-mono bg-void-surface">
        <span>MEMORY: {activeNode ? activeNode.size * 14 : 0} tokens active</span>
        <span>MODE: {gateMode === 'DEEP' ? 'RAG STRICT' : 'CREATIVE'}</span>
        <span>CONTEXT: 50% long-term</span>
      </footer>
    </div>
  );
};

