import React, { useState, useEffect } from 'react';
import { KnowledgeGraph } from './components/KnowledgeGraph';
import { Chatbot } from './components/Chatbot';
import { IntelligenceCards } from './components/IntelligenceCards';
import { InsightPrompts } from './components/InsightPrompts';
import { StreamFeed } from './components/StreamFeed';
import { StructuralGaps } from './components/StructuralGaps';
import { ShiftingVoidExplanation } from './components/ShiftingVoidExplanation';
import { AuditTrailPanel } from './components/AuditTrailPanel';
import { NodeDetailsPanel } from './components/NodeDetailsPanel';
import { FileManager } from './components/FileManager';
import KnowledgeBaseDeepIngestion from './pages/KnowledgeBaseDeepIngestion';
import { OEDiscriminator } from './components/OEDiscriminator';
import { OEDashboard } from './components/OEDiscriminatorDashboard';
import { ThreeGraph } from './components/ThreeGraph';
import { corpusNodes, corpusLinks, Node, Link } from './data/corpus';
import { 
  Menu, X, Database, AlertTriangle, Cpu, MessageSquare, Layers, Zap, BookOpen, Sparkles, ShieldCheck, HardDriveDownload, Info, HardDrive, Microscope, Box, BarChart3
} from 'lucide-react';
import { cn } from './lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { runIngestion, IngestionFile } from './utils/runIngestion';

type ViewMode = 'engine' | 'stream' | 'gaps' | 'deep_ingestion' | 'discriminator' | '3d_engine' | 'oe_analytics';
type SidebarMode = 'chat' | 'intelligence' | 'insights' | 'audit' | 'details';

function TheoryOverlay() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="absolute bottom-6 right-6 z-40 px-4 py-2 bg-black/80 backdrop-blur-md border border-white/10 rounded-xl text-zinc-400 hover:text-white hover:border-white/30 transition-all flex items-center gap-2 shadow-2xl"
      >
        <BookOpen className="w-4 h-4" />
        <span className="text-xs uppercase tracking-widest">Theory Overlay</span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-20 right-6 z-40 w-[600px] max-h-[70vh] overflow-hidden bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex flex-col"
          >
            <div className="p-4 flex justify-between items-center border-b border-white/10 bg-black/50">
              <h3 className="text-orange-500 font-serif italic">The Shifting Void</h3>
              <button onClick={() => setIsOpen(false)} className="p-1 text-zinc-500 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar relative">
              <ShiftingVoidExplanation />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function App() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [links, setLinks] = useState<Link[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | undefined>();
  const [viewMode, setViewMode] = useState<ViewMode>('engine');
  const [sidebarMode, setSidebarMode] = useState<SidebarMode>('chat');
  const [showRupture, setShowRupture] = useState(true);
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);
  const [isFileManagerOpen, setIsFileManagerOpen] = useState(false);
  const [files, setFiles] = useState<IngestionFile[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [nodesRes, linksRes] = await Promise.all([
          fetch('/api/nodes'),
          fetch('/api/links')
        ]);
        
        if (nodesRes.ok) {
          const data = await nodesRes.json();
          setNodes(data);
        } else {
          console.error('Failed to fetch nodes, falling back to corpusNodes');
          setNodes(corpusNodes);
        }

        if (linksRes.ok) {
          const data = await linksRes.json();
          setLinks(data);
        } else {
          console.error('Failed to fetch links, falling back to corpusLinks');
          setLinks(corpusLinks);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setNodes(corpusNodes);
        setLinks(corpusLinks);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setShowRupture(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  const handleNodeSelect = (node: Node) => {
    setSelectedNodeId(node.id);
    setSidebarMode('details');
    setIsRightSidebarOpen(true);
  };

  const handleFileExtract = async (file: IngestionFile) => {
    try {
      const result = await runIngestion(
        file, 
        nodes, 
        links, 
        (id, status) => {
          setFiles(prev => prev.map(f => f.id === id ? { ...f, status } : f));
        }
      );

      setNodes(result.nodes);
      setLinks(result.links);
      
      // Persist to backend if needed
      // In this app, we'll rely on the local state for now, 
      // but ideally we'd call an API to save the new nodes/links.
      
    } catch (error) {
      console.error('Extraction failed:', error);
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#0a0a0a] text-zinc-100 overflow-hidden font-sans selection:bg-orange-500/30">
      
      {/* Rupture Sequence */}
      <AnimatePresence>
        {showRupture && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 1.5, ease: "easeInOut" } }}
            className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, filter: "blur(10px)" }}
              animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
              transition={{ duration: 2, ease: "easeOut" }}
              className="text-center space-y-6"
            >
              <h1 className="text-4xl md:text-6xl font-serif tracking-widest text-white/90 uppercase">
                The Void-Graph Protocol
              </h1>
              <p className="text-zinc-500 tracking-[0.3em] uppercase text-sm">
                Professor Nihil & the Nihiltheistic Ontology
              </p>
              <motion.div 
                animate={{ scaleX: [0, 1] }} 
                transition={{ duration: 1.5, delay: 1, ease: "circOut" }}
                className="h-[1px] w-full bg-gradient-to-r from-transparent via-orange-500/50 to-transparent"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Left Sidebar Button (when closed) */}
      <AnimatePresence>
        {!isLeftSidebarOpen && (
          <motion.button
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -50, opacity: 0 }}
            onClick={() => setIsLeftSidebarOpen(true)}
            className="fixed left-0 top-1/2 -translate-y-1/2 z-30 w-8 h-16 bg-[#0f0f0f] border border-l-0 border-white/10 rounded-r-xl flex items-center justify-center text-zinc-500 hover:text-orange-500 transition-colors shadow-2xl"
          >
            <Menu className="w-4 h-4" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Left Sidebar - Navigation & Tools */}
      <AnimatePresence>
        {isLeftSidebarOpen && (
          <motion.div 
            initial={{ x: -80 }}
            animate={{ x: 0 }}
            exit={{ x: -80 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-20 border-r border-white/5 bg-[#0f0f0f] flex flex-col items-center py-6 z-20 shadow-2xl relative"
          >
            <button 
              onClick={() => setIsLeftSidebarOpen(false)}
              className="absolute top-2 right-2 p-1 text-zinc-500 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="w-10 h-10 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mb-8 shadow-[0_0_15px_rgba(249,115,22,0.15)]">
              <span className="font-serif italic text-orange-500 font-bold">V</span>
            </div>
            
            <nav className="flex-1 flex flex-col gap-4">
              <button 
                onClick={() => setViewMode('deep_ingestion')}
                className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center transition-all cursor-pointer",
                  viewMode === 'deep_ingestion' ? "neo-pressed text-orange-400" : "neo-convex text-zinc-500 hover:text-zinc-300"
                )}
                title="Phase 1: Deep Ingestion (The Source)"
              >
                <Database className="w-5 h-5" strokeWidth={1.5} />
              </button>
              <button 
                onClick={() => setViewMode('engine')}
                className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center transition-all cursor-pointer",
                  viewMode === 'engine' ? "neo-pressed text-orange-400" : "neo-convex text-zinc-500 hover:text-zinc-300"
                )}
                title="Phase 2: The Engine [Ω]"
              >
                <Cpu className="w-5 h-5" strokeWidth={1.5} />
              </button>
              <button 
                onClick={() => setViewMode('3d_engine')}
                className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center transition-all cursor-pointer",
                  viewMode === '3d_engine' ? "neo-pressed text-blue-400" : "neo-convex text-zinc-500 hover:text-zinc-300"
                )}
                title="Phase 2.5: 3D Topology (Three.js)"
              >
                <Box className="w-5 h-5" strokeWidth={1.5} />
              </button>
              <button 
                onClick={() => setViewMode('stream')}
                className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center transition-all cursor-pointer",
                  viewMode === 'stream' ? "neo-pressed text-orange-400" : "neo-convex text-zinc-500 hover:text-zinc-300"
                )}
                title="Phase 3: The Stream"
              >
                <Sparkles className="w-5 h-5" strokeWidth={1.5} />
              </button>
              <button 
                onClick={() => setViewMode('discriminator')}
                className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center transition-all cursor-pointer",
                  viewMode === 'discriminator' ? "neo-pressed text-fuchsia-400" : "neo-convex text-zinc-500 hover:text-zinc-300"
                )}
                title="Phase 4: O-E Discriminator"
              >
                <Microscope className="w-5 h-5" strokeWidth={1.5} />
              </button>
              <button 
                onClick={() => setViewMode('oe_analytics')}
                className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center transition-all cursor-pointer",
                  viewMode === 'oe_analytics' ? "neo-pressed text-fuchsia-400" : "neo-convex text-zinc-500 hover:text-zinc-300"
                )}
                title="Phase 4.5: O-E Analytics Dashboard"
              >
                <BarChart3 className="w-5 h-5" strokeWidth={1.5} />
              </button>
              <button 
                onClick={() => setViewMode('gaps')}
                className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center transition-all cursor-pointer",
                  viewMode === 'gaps' ? "neo-pressed text-orange-400" : "neo-convex text-zinc-500 hover:text-zinc-300"
                )}
                title="Phase 5: Gaps"
              >
                <AlertTriangle className="w-5 h-5" strokeWidth={1.5} />
              </button>

              <div className="mt-auto flex flex-col gap-4">
                <button 
                  onClick={() => setIsFileManagerOpen(!isFileManagerOpen)}
                  className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-all cursor-pointer",
                    isFileManagerOpen ? "neo-pressed text-orange-400" : "neo-convex text-zinc-500 hover:text-zinc-300"
                  )}
                  title="Abyssal Archives (File Manager)"
                >
                  <HardDrive className="w-5 h-5" strokeWidth={1.5} />
                </button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* File Manager Panel */}
      <AnimatePresence>
        {isFileManagerOpen && (
          <motion.div
            initial={{ x: -400 }}
            animate={{ x: 0 }}
            exit={{ x: -400 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed left-20 top-0 bottom-0 w-80 z-10 shadow-2xl"
          >
            <FileManager 
              files={files}
              setFiles={setFiles}
              onExtract={handleFileExtract}
              onClose={() => setIsFileManagerOpen(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-hidden">
        {viewMode === 'deep_ingestion' && (
          <div className="w-full h-full overflow-y-auto custom-scrollbar">
            <KnowledgeBaseDeepIngestion />
          </div>
        )}
        {viewMode === 'engine' && (
          <div className="relative w-full h-full">
            <KnowledgeGraph 
              nodes={nodes} 
              links={links}
              onNodeSelect={handleNodeSelect} 
              selectedNodeId={selectedNodeId} 
            />
            <TheoryOverlay />
          </div>
        )}
        {viewMode === '3d_engine' && (
          <div className="relative w-full h-full">
            <ThreeGraph 
              nodes={nodes} 
              links={links}
              onNodeSelect={handleNodeSelect} 
            />
            <TheoryOverlay />
          </div>
        )}
        {viewMode === 'stream' && (
          <StreamFeed nodes={nodes} onNodeSelect={handleNodeSelect} selectedNodeId={selectedNodeId} />
        )}
        {viewMode === 'gaps' && (
          <StructuralGaps nodes={nodes} onNodeSelect={handleNodeSelect} />
        )}
        {viewMode === 'discriminator' && (
          <OEDiscriminator />
        )}
        {viewMode === 'oe_analytics' && (
          <OEDashboard />
        )}
      </main>

      {/* Toggle Right Sidebar Button (when closed) */}
      <AnimatePresence>
        {!isRightSidebarOpen && (
          <motion.button
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 50, opacity: 0 }}
            onClick={() => setIsRightSidebarOpen(true)}
            className="fixed right-0 top-1/2 -translate-y-1/2 z-30 w-8 h-16 bg-[#0f0f0f] border border-r-0 border-white/10 rounded-l-xl flex items-center justify-center text-zinc-500 hover:text-orange-500 transition-colors shadow-2xl"
          >
            <Menu className="w-4 h-4" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Right Sidebar - Professor Nihil & Intelligence Cards */}
      <AnimatePresence>
        {isRightSidebarOpen && (
          <motion.div 
            initial={{ x: 400 }}
            animate={{ x: 0 }}
            exit={{ x: 400 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-[400px] border-l border-white/5 bg-[#0f0f0f] flex flex-col z-20 shadow-2xl relative"
          >
            <button 
              onClick={() => setIsRightSidebarOpen(false)}
              className="absolute top-2 left-2 p-1 text-zinc-500 hover:text-white transition-colors z-50"
            >
              <X className="w-4 h-4" />
            </button>
            
            {/* Sidebar Mode Toggle */}
            <div className="absolute -left-12 top-20 flex flex-col gap-2 z-50">
              <button
                onClick={() => setSidebarMode('chat')}
                className={cn(
                  "w-10 h-10 rounded-l-xl flex items-center justify-center transition-all border border-r-0 border-white/10",
                  sidebarMode === 'chat' ? "bg-[#0f0f0f] text-orange-500" : "bg-black/60 text-zinc-500 hover:text-zinc-300"
                )}
                title="Professor Nihil"
              >
                <MessageSquare className="w-4 h-4" />
              </button>
              <button
                onClick={() => setSidebarMode('intelligence')}
                className={cn(
                  "w-10 h-10 rounded-l-xl flex items-center justify-center transition-all border border-r-0 border-white/10",
                  sidebarMode === 'intelligence' ? "bg-[#0f0f0f] text-fuchsia-500" : "bg-black/60 text-zinc-500 hover:text-zinc-300"
                )}
                title="Intelligence Cards"
              >
                <Layers className="w-4 h-4" />
              </button>
              <button
                onClick={() => setSidebarMode('insights')}
                className={cn(
                  "w-10 h-10 rounded-l-xl flex items-center justify-center transition-all border border-r-0 border-white/10",
                  sidebarMode === 'insights' ? "bg-[#0f0f0f] text-emerald-500" : "bg-black/60 text-zinc-500 hover:text-zinc-300"
                )}
                title="Insight Prompts"
              >
                <Zap className="w-4 h-4" />
              </button>
              <button
                onClick={() => setSidebarMode('details')}
                className={cn(
                  "w-10 h-10 rounded-l-xl flex items-center justify-center transition-all border border-r-0 border-white/10",
                  sidebarMode === 'details' ? "bg-[#0f0f0f] text-orange-500" : "bg-black/60 text-zinc-500 hover:text-zinc-300"
                )}
                title="Node Details"
              >
                <Info className="w-4 h-4" />
              </button>
              <button
                onClick={() => setSidebarMode('audit')}
                className={cn(
                  "w-10 h-10 rounded-l-xl flex items-center justify-center transition-all border border-r-0 border-white/10",
                  sidebarMode === 'audit' ? "bg-[#0f0f0f] text-emerald-500" : "bg-black/60 text-zinc-500 hover:text-zinc-300"
                )}
                title="Audit Trail"
              >
                <ShieldCheck className="w-4 h-4" />
              </button>
            </div>

            {sidebarMode === 'chat' ? (
              <Chatbot 
                nodes={nodes}
                onCollapse={() => {}}
              />
            ) : sidebarMode === 'intelligence' ? (
              <IntelligenceCards 
                nodes={nodes}
                links={links}
                onNodeSelect={handleNodeSelect}
              />
            ) : sidebarMode === 'insights' ? (
              <InsightPrompts 
                nodes={nodes}
                links={links}
                onNodeSelect={handleNodeSelect}
              />
            ) : sidebarMode === 'details' ? (
              <NodeDetailsPanel 
                node={nodes.find(n => n.id === selectedNodeId)}
              />
            ) : (
              <AuditTrailPanel 
                node={nodes.find(n => n.id === selectedNodeId)}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default App;;
