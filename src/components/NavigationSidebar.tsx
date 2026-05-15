import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Database, Cpu, Box, Sparkles, Microscope, 
  BarChart3, AlertTriangle, Network, HardDrive, Menu
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAppStore } from '../store/appStore';

export type ViewMode = 
  'engine' | 
  '3d_engine' | 
  'stream' | 
  'gaps' | 
  'discriminator' | 
  'oe_analytics' | 
  'theme_clusters' | 
  'ai_synthesis' | 
  'deep_ingestion';

export const NAV_ITEMS = [
  { id: 'deep_ingestion', icon: Database, title: "Journal314 Ingestion" },
  { id: 'engine', icon: Cpu, title: "Journal314 / REN Graph Engine" },
  { id: '3d_engine', icon: Box, title: "REN Topology (3D)" },
  { id: 'stream', icon: Sparkles, title: "Synthesis Stream" },
  { id: 'discriminator', icon: Microscope, title: "Occurrence-Elevation Discriminator" },
  { id: 'oe_analytics', icon: BarChart3, title: "Occurrence-Elevation Analytics" },
  { id: 'gaps', icon: AlertTriangle, title: "Structural Gaps" },
  { id: 'theme_clusters', icon: Network, title: "Theme Topological Clusters" },
  { id: 'ai_synthesis', icon: Cpu, title: "REN Synthesis Panel" }
];

export function NavigationSidebar() {
  const { 
    viewMode, setViewMode, 
    isLeftSidebarOpen, setLeftSidebarOpen, 
    isFileManagerOpen, setFileManagerOpen 
  } = useAppStore();

  return (
    <>
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
              onClick={() => setLeftSidebarOpen(false)}
              className="absolute top-2 right-2 p-1 text-zinc-500 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-12 h-12 bg-black border border-white/10 flex items-center justify-center mb-10 shadow-2xl rounded-2xl group overflow-hidden">
               <div className="absolute inset-0 bg-emerald-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
               <span className="font-serif text-white font-light text-2xl relative z-10">J</span>
            </div>
            
            <nav className="flex-1 flex flex-col gap-5 overflow-y-auto custom-scrollbar no-scrollbar py-2 w-full items-center">
              {NAV_ITEMS.map((item) => (
                <button 
                  key={item.id}
                  onClick={() => setViewMode(item.id as ViewMode)}
                  className={cn(
                    "w-14 h-14 flex items-center justify-center transition-all cursor-pointer rounded-2xl backdrop-blur-md shrink-0",
                    viewMode === item.id 
                      ? "bg-white text-black shadow-xl scale-110" 
                      : "bg-white/5 border border-white/5 text-zinc-500 hover:border-emerald-500/30 hover:text-zinc-200 hover:bg-white/10"
                  )}
                  title={item.title}
                >
                  <item.icon className="w-5 h-5" strokeWidth={viewMode === item.id ? 2.5 : 2} />
                </button>
              ))}

              <div className="mt-8 flex flex-col gap-4 border-t border-white/5 pt-8 w-full items-center">
                <button 
                  onClick={() => setFileManagerOpen(!isFileManagerOpen)}
                  className={cn(
                    "w-14 h-14 flex items-center justify-center transition-all cursor-pointer rounded-2xl backdrop-blur-md",
                    isFileManagerOpen 
                      ? "bg-emerald-500 text-black shadow-xl" 
                      : "bg-white/5 border border-white/5 text-zinc-500 hover:border-emerald-500/30 hover:text-zinc-200 hover:bg-white/10"
                  )}
                  title="Substrate Archive Manager"
                >
                  <HardDrive className="w-5 h-5" strokeWidth={2} />
                </button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

