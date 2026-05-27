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
import { GlobalTopology } from './components/GlobalTopology';
import { AISynthesisPanel } from './components/AISynthesisPanel';
import { corpusNodes, corpusLinks, Node, Link } from './data/corpus';
import { 
  Menu, X, Database, AlertTriangle, Cpu, MessageSquare, Layers, Zap, BookOpen, Sparkles, ShieldCheck, HardDriveDownload, Info, HardDrive, Microscope, Box, BarChart3, Group, Network
} from 'lucide-react';
import { cn } from './lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { runIngestion, IngestionFile } from './utils/runIngestion';
import { NavigationSidebar, ViewMode } from './components/NavigationSidebar';
import { logOptimization } from './utils/selfImprovement';
import { TheoryOverlay } from './components/TheoryOverlay';
import { useAppStore, SidebarMode } from './store/appStore';

function App() {
  const { 
    nodes, links, viewMode, selectedNodeId, sidebarMode, 
    isLeftSidebarOpen, isRightSidebarOpen, isFileManagerOpen,
    setNodes, setLinks, setViewMode, setSelectedNodeId, setSidebarMode,
    setLeftSidebarOpen, setRightSidebarOpen, setFileManagerOpen,
    addNode, addLink, integrateSyntheticData
  } = useAppStore();

  const [showRupture, setShowRupture] = useState(true);
  const [files, setFiles] = useState<IngestionFile[]>([]);
  const [synthesisHistory, setSynthesisHistory] = useState<{nodes: Node[], links: Link[]}[]>([]);

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
        }

        if (linksRes.ok) {
          const data = await linksRes.json();
          setLinks(data);
        }
      } catch (error) {
        console.error('Error fetching data, using corpus defaults:', error);
      }
    };
    fetchData();
  }, [setNodes, setLinks]);

  useEffect(() => {
    const timer = setTimeout(() => setShowRupture(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  const handleNodeSelect = (node: Node) => {
    setSelectedNodeId(node.id);
    setSidebarMode('details');
    setRightSidebarOpen(true);
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
    } catch (error) {
      console.error('Extraction failed:', error);
    }
  };

  // Content Renderer
  const renderMainContent = () => {
    switch (viewMode) {
      case 'deep_ingestion':
        return (
          <div className="w-full h-full overflow-y-auto custom-scrollbar">
            <KnowledgeBaseDeepIngestion />
          </div>
        );
      case 'engine':
        return (
          <div className="relative w-full h-full">
            <KnowledgeGraph />
            <TheoryOverlay />
          </div>
        );
      case '3d_engine':
        return (
          <div className="relative w-full h-full">
            <ThreeGraph />
            <TheoryOverlay />
          </div>
        );
      case 'stream':
        return <StreamFeed nodes={nodes} onNodeSelect={handleNodeSelect} selectedNodeId={selectedNodeId} />;
      case 'gaps':
        return <StructuralGaps nodes={nodes} onNodeSelect={handleNodeSelect} />;
      case 'discriminator':
        return <OEDiscriminator />;
      case 'oe_analytics':
        return <OEDashboard />;
      case 'theme_clusters':
        return <ThemeClusters />;
      case 'global_topology':
        return <GlobalTopology />;
      case 'ai_synthesis':
        return (
          <AISynthesisPanel 
            nodes={nodes}
            onIntegrate={(newNodes, newLinks) => {
              setSynthesisHistory(prev => [...prev, { nodes: [...nodes], links: [...links] }]);
              integrateSyntheticData(newNodes, newLinks);
              logOptimization('refactor', 'Merged synthetic bridge into main corpus', { nodeCount: newNodes.length });
            }}
            onUndo={() => {
              if (synthesisHistory.length > 0) {
                const last = synthesisHistory[synthesisHistory.length - 1];
                setNodes(last.nodes);
                setLinks(last.links);
                setSynthesisHistory(prev => prev.slice(0, -1));
              }
            }}
            canUndo={synthesisHistory.length > 0}
          />
        );
      default:
        return null;
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
              <h1 className="text-4xl md:text-6xl font-serif tracking-widest text-zinc-200 animate-glitch">
                Journal314 & REN Analysis Engine
              </h1>
              <p className="text-zinc-500 font-mono tracking-widest text-sm">
                Structural Textual Analysis
              </p>
              <motion.div 
                animate={{ scaleX: [0, 1] }} 
                transition={{ duration: 1.5, delay: 1, ease: "circOut" }}
                className="h-[2px] w-full bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"
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
            onClick={() => setLeftSidebarOpen(true)}
            className="fixed left-0 top-1/2 -translate-y-1/2 z-30 w-10 h-20 bg-zinc-950 border-y-2 border-r-2 border-white/5 flex items-center justify-center text-zinc-400 hover:text-zinc-300 hover:border-white/10 transition-colors rounded-2xl transition shadow-xl group backdrop-blur-md"
          >
            <Menu className="w-6 h-6 group-hover:scale-110 transition-transform" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Left Sidebar - Navigation & Tools */}
      <NavigationSidebar />

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
              onClose={() => setFileManagerOpen(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-hidden">
        {renderMainContent()}
      </main>

      {/* Toggle Right Sidebar Button (when closed) */}
      <AnimatePresence>
        {!isRightSidebarOpen && (
          <motion.button
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 50, opacity: 0 }}
            onClick={() => setRightSidebarOpen(true)}
            className="fixed right-0 top-1/2 -translate-y-1/2 z-30 w-10 h-20 bg-zinc-950 border-y-2 border-l-2 border-white/5 flex items-center justify-center text-zinc-400 hover:text-zinc-300 hover:border-white/10 transition-colors rounded-2xl transition shadow-xl group backdrop-blur-md"
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
              onClick={() => setRightSidebarOpen(false)}
              className="absolute top-2 left-2 p-1 text-zinc-500 hover:text-zinc-200 transition-colors z-50"
            >
              <X className="w-5 h-5" />
            </button>
            
            {/* Sidebar Mode Toggle */}
            <div className="absolute -left-[3.5rem] top-24 flex flex-col gap-4 z-50">
              {[
                { id: 'chat', icon: MessageSquare, color: 'text-zinc-200', activeBorder: 'border-white/10' },
                { id: 'intelligence', icon: Layers, color: 'text-zinc-300', activeBorder: 'border-emerald-500' },
                { id: 'insights', icon: Zap, color: 'text-zinc-300', activeBorder: 'border-[#00FF66]' },
                { id: 'details', icon: Info, color: 'text-zinc-300', activeBorder: 'border-white/10' },
                { id: 'audit', icon: ShieldCheck, color: 'text-[#ff00ff]', activeBorder: 'border-[#ff00ff]' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSidebarMode(item.id as SidebarMode)}
                  className={cn(
                    "w-14 h-14 flex items-center justify-center transition-all border-y-2 border-l-2 border-r-0 relative rounded-2xl transition hover:bg-white/5 backdrop-blur-md",
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


export default App;
