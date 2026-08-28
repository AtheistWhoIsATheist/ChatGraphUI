import React from 'react';
import { 
  Package, ChevronLeft, Plus, Trash2, Download, Zap, XCircle, FileText, 
  Database, Sparkles, Cpu, ChevronRight, Layers, Send
} from 'lucide-react';
import { AngView, GateMode, BoundaryState } from '../../types/ang';
import { VoidCanvas } from './VoidCanvas';

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
        {/* Left Column: The Library */}
        <div className="w-72 h-full glass-panel flex flex-col border-y-0 border-l-0">
          <div className="p-3 border-b border-white/5 flex items-center justify-between">
            <h2 className="font-display text-sm text-white/80">The Library</h2>
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
          <div className="flex-1 overflow-auto">
            <div className="flex flex-col items-center justify-center h-full text-white/20 gap-3">
              <FileText size={32} />
              <span className="text-xs font-mono">No memories ingested</span>
              <span className="text-xs text-white/10">Drag files to absorb</span>
            </div>
          </div>
          <div className="p-2 border-t border-white/5 text-xs text-white/30 font-mono flex justify-between">
            <span>0 files</span>
            <span>0 tokens</span>
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
          
          <div className="flex-1 overflow-auto py-6 space-y-6 relative">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center space-y-4">
                <h1 className="font-display text-3xl text-white/60 text-glow-violet">The Void Awaits Input.</h1>
                <p className="text-sm text-white/20 font-mono max-w-md mx-auto">Ingest knowledge through the Library. Query the darkness. Receive synthesis.</p>
              </div>
            </div>
            <div className="relative z-10 w-full h-full">
              {children}
            </div>
          </div>

          <form className="py-4 border-t border-white/5" onSubmit={(e) => e.preventDefault()}>
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
              <h2 className="font-display text-sm text-white/80">Memory State</h2>
            </div>
            <button className="p-1 text-white/30 hover:text-white/60 transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>
          <div className="flex-1 overflow-auto p-3">
            <div className="flex flex-col items-center justify-center h-full text-white/20 gap-3">
              <Layers size={32} />
              <span className="text-xs font-mono text-center">No active chunks</span>
              <span className="text-xs text-white/10 text-center">Query the void to retrieve memory</span>
            </div>
          </div>
          <div className="h-32 border-t border-white/5 relative overflow-hidden">
            <svg className="w-full h-full" viewBox="0 0 200 100">
              <text x="100" y="55" textAnchor="middle" className="fill-white/10 text-[8px] uppercase">vector space empty</text>
            </svg>
          </div>
        </div>
      </main>

      <footer className="relative z-10 px-4 py-2 border-t border-white/5 flex items-center justify-between text-[10px] text-white/20 font-mono bg-void-surface">
        <span>MEMORY: 0 tokens across 0 nodes</span>
        <span>MODE: {gateMode === 'DEEP' ? 'RAG STRICT' : 'CREATIVE'}</span>
        <span>CONTEXT: 50% long-term</span>
      </footer>
    </div>
  );
};
