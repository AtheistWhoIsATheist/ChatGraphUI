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
import { ThemeClusters } from './components/ThemeClusters';
import { AISynthesisPanel } from './components/AISynthesisPanel';
import { corpusNodes, corpusLinks, Node, Link } from './data/corpus';
import { 
  Menu, X, Database, AlertTriangle, Cpu, MessageSquare, Layers, Zap, BookOpen, Sparkles, ShieldCheck, HardDriveDownload, Info, HardDrive, Microscope, Box, BarChart3, Group, Network
} from 'lucide-react';
import { cn } from './lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { runIngestion, IngestionFile } from './utils/runIngestion';

type ViewMode = 'engine' | 'stream' | 'gaps' | 'deep_ingestion' | 'discriminator' | '3d_engine' | 'oe_analytics' | 'theme_clusters' | 'ai_synthesis';
type SidebarMode = 'chat' | 'intelligence' | 'insights' | 'audit' | 'details';

function TheoryOverlay() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="absolute bottom-6 right-6 z-40 px-6 py-4 bg-zinc-100 border border-white/10 text-black hover:bg-[#fff] hover:border-[#fff] transition-colors flex items-center gap-3 shadow-2xl hover:shadow-none hover:translate-y-[2px] hover:translate-x-[2px] rounded-2xl transition hover:bg-white/5 disabled:opacity-50 hover:-translate-y-1 hover:shadow-xl backdrop-blur-md"
      >
        <BookOpen className="w-5 h-5" />
        <span className="text-sm font-semibold  tracking-widest">Theoretical Framework</span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-24 right-6 z-40 w-[600px] max-h-[70vh] overflow-hidden bg-zinc-950 border border-white/10 shadow-2xl flex flex-col rounded-2xl transition hover:bg-white/5 disabled:opacity-50 hover:-translate-y-1 hover:shadow-xl backdrop-blur-md"
          >
            <div className="p-4 flex justify-between items-center border-b border-white/5 bg-zinc-900/50">
              <h3 className="text-zinc-300 font-semibold  tracking-widest">Theoretical Framework</h3>
              <button onClick={() => setIsOpen(false)} className="p-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-100/10 border border-transparent hover:border-white/10 transition-colors rounded-2xl transition hover:bg-white/5 disabled:opacity-50 hover:-translate-y-1 hover:shadow-xl backdrop-blur-md">
                <X className="w-5 h-5" />
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
    <div className="flex h-screen w-full bg-zinc-950 text-zinc-100 overflow-hidden font-sans selection:bg-zinc-100/50 relative">
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
              <h1 className="text-4xl md:text-6xl font-serif tracking-widest text-zinc-200  animate-glitch">
                Journal314 & REN Analysis Engine
              </h1>
              <p className="text-zinc-500 font-mono tracking-widest  text-sm">
                Structural Textual Analysis
              </p>
              <motion.div 
                animate={{ scaleX: [0, 1] }} 
                transition={{ duration: 1.5, delay: 1, ease: "circOut" }}
                className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#FF3A00] to-transparent"
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
            className="fixed left-0 top-1/2 -translate-y-1/2 z-30 w-10 h-20 bg-zinc-950 border-y-2 border-r-2 border-white/5 flex items-center justify-center text-zinc-400 hover:text-zinc-300 hover:border-white/10 transition-colors rounded-2xl transition hover:bg-white/5 disabled:opacity-50 hover:-translate-y-1 hover:shadow-xl backdrop-blur-md group"
          >
            <Menu className="w-6 h-6 group-hover:scale-110 transition-transform" />
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
            className="w-24 border-r-2 border-white/5 bg-zinc-900/50 flex flex-col items-center py-6 z-20 shadow-2xl relative"
          >
            <button 
              onClick={() => setIsLeftSidebarOpen(false)}
              className="absolute top-2 right-2 p-1 text-zinc-500 hover:text-zinc-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-12 h-12 bg-zinc-950 border border-white/10 flex items-center justify-center mb-8 shadow-2xl rounded-2xl transition hover:bg-white/5 disabled:opacity-50 hover:-translate-y-1 hover:shadow-xl backdrop-blur-md">
              <span className="font-serif text-zinc-200 font-semibold text-2xl animate-pulse-slow">V</span>
            </div>
            
            <nav className="flex-1 flex flex-col gap-6">
              {[
                { id: 'deep_ingestion', icon: Database, title: "Journal314 Ingestion" },
                { id: 'engine', icon: Cpu, title: "Journal314 / REN Graph Engine" },
                { id: '3d_engine', icon: Box, title: "REN Topology (3D)" },
                { id: 'stream', icon: Sparkles, title: "Synthesis Stream" },
                { id: 'discriminator', icon: Microscope, title: "Occurrence-Elevation Discriminator" },
                { id: 'oe_analytics', icon: BarChart3, title: "Occurrence-Elevation Analytics" },
                { id: 'gaps', icon: AlertTriangle, title: "Structural Gaps" },
                { id: 'theme_clusters', icon: Network, title: "Theme Topological Clusters" },
                { id: 'ai_synthesis', icon: Cpu, title: "REN Synthesis Panel" }
              ].map((item) => (
                <button 
                  key={item.id}
                  onClick={() => setViewMode(item.id as ViewMode)}
                  className={cn(
                    "w-14 h-14 flex items-center justify-center transition-all cursor-pointer border rounded-2xl transition hover:bg-white/5 disabled:opacity-50 hover:-translate-y-1 hover:shadow-xl backdrop-blur-md",
                    viewMode === item.id 
                      ? "bg-white/10 border-white/10 text-black shadow-2xl translate-y-[-2px] translate-x-[-2px]" 
                      : "bg-white/5 border-transparent text-zinc-400 hover:border-white/10 hover:text-zinc-300 hover:bg-white/10/10"
                  )}
                  title={item.title}
                >
                  <item.icon className="w-6 h-6" strokeWidth={2} />
                </button>
              ))}

              <div className="mt-auto flex flex-col gap-4 border-t-2 border-white/5 pt-6">
                <button 
                  onClick={() => setIsFileManagerOpen(!isFileManagerOpen)}
                  className={cn(
                    "w-14 h-14 flex items-center justify-center transition-all cursor-pointer border rounded-2xl transition hover:bg-white/5 disabled:opacity-50 hover:-translate-y-1 hover:shadow-xl backdrop-blur-md",
                    isFileManagerOpen 
                      ? "bg-zinc-100 border-white/10 text-black shadow-2xl translate-y-[-2px] translate-x-[-2px]" 
                      : "bg-white/5 border-transparent text-zinc-400 hover:border-white/10 hover:text-zinc-200 hover:bg-zinc-100/10"
                  )}
                  title="Document Ingestion Manager"
                >
                  <HardDrive className="w-6 h-6" strokeWidth={2} />
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
        {viewMode === 'theme_clusters' && (
          <ThemeClusters />
        )}
        {viewMode === 'ai_synthesis' && (
          <AISynthesisPanel />
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
            className="fixed right-0 top-1/2 -translate-y-1/2 z-30 w-10 h-20 bg-zinc-950 border-y-2 border-l-2 border-white/5 flex items-center justify-center text-zinc-400 hover:text-zinc-300 hover:border-white/10 transition-colors rounded-2xl transition hover:bg-white/5 disabled:opacity-50 hover:-translate-y-1 hover:shadow-xl backdrop-blur-md group"
          >
            <Menu className="w-6 h-6 group-hover:scale-110 transition-transform" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Right Sidebar - Synthesis Engine & Intelligence Cards */}
      <AnimatePresence>
        {isRightSidebarOpen && (
          <motion.div 
            initial={{ x: 400 }}
            animate={{ x: 0 }}
            exit={{ x: 400 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-[400px] border-l-2 border-white/5 bg-zinc-900/50 flex flex-col z-20 shadow-2xl relative"
          >
            <button 
              onClick={() => setIsRightSidebarOpen(false)}
              className="absolute top-2 left-2 p-1 text-zinc-500 hover:text-zinc-200 transition-colors z-50"
            >
              <X className="w-5 h-5" />
            </button>
            
            {/* Sidebar Mode Toggle */}
            <div className="absolute -left-[3.5rem] top-24 flex flex-col gap-4 z-50">
              {[
                { id: 'chat', icon: MessageSquare, color: 'text-zinc-200', activeBorder: 'border-white/10' },
                { id: 'intelligence', icon: Layers, color: 'text-zinc-300', activeBorder: 'border-[#FFD700]' },
                { id: 'insights', icon: Zap, color: 'text-zinc-300', activeBorder: 'border-[#00FF66]' },
                { id: 'details', icon: Info, color: 'text-zinc-300', activeBorder: 'border-white/10' },
                { id: 'audit', icon: ShieldCheck, color: 'text-[#ff00ff]', activeBorder: 'border-[#ff00ff]' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSidebarMode(item.id as SidebarMode)}
                  className={cn(
                    "w-14 h-14 flex items-center justify-center transition-all border-y-2 border-l-2 border-r-0 relative rounded-2xl transition hover:bg-white/5 disabled:opacity-50 hover:-translate-y-1 hover:shadow-xl backdrop-blur-md",
                    sidebarMode === item.id 
                      ? `bg-zinc-900/50 ${item.activeBorder} ${item.color} -ml-2 w-16 z-20` 
                      : "bg-white/5 border-white/5 text-zinc-500 hover:text-white hover:border-white/20 hover:bg-white/10"
                  )}
                  title={item.id}
                >
                  <item.icon className="w-6 h-6" strokeWidth={sidebarMode === item.id ? 3 : 2} />
                  {sidebarMode === item.id && (
                    <div className={cn("absolute right-[-4px] top-0 bottom-0 w-2 bg-zinc-900/50 z-30", item.activeBorder.replace('border-', 'bg-'))} />
                  )}
                </button>
              ))}
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
