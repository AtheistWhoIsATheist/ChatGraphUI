import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Database, Cpu, Box, Sparkles, Microscope, 
  BarChart3, AlertTriangle, Network, HardDrive, Menu, Compass, GitCompare,
  Cloud, Loader2
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
  'deep_ingestion' |
  'global_topology' |
  'comparative_workbench';

export const NAV_ITEMS = [
  { id: 'deep_ingestion', icon: Database, title: "Journal314 Ingestion" },
  { id: 'engine', icon: Cpu, title: "Journal314 / REN Graph Engine" },
  { id: '3d_engine', icon: Box, title: "REN Topology (3D)" },
  { id: 'global_topology', icon: Compass, title: "Global Topology" },
  { id: 'comparative_workbench', icon: GitCompare, title: "Comparative Research" },
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
    isFileManagerOpen, setFileManagerOpen,
    gdriveConnected, gdriveSyncStatus, gdriveSyncMessage
  } = useAppStore();

  return (
    <>
      <AnimatePresence>
        {!isLeftSidebarOpen && (
          <motion.button
            key="open-left-sidebar"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -50, opacity: 0 }}
            onClick={() => setLeftSidebarOpen(true)}
            className="fixed left-0 top-1/2 -translate-y-1/2 z-50 w-10 h-20 bg-zinc-950 border-y-2 border-r-2 border-white/5 flex items-center justify-center text-zinc-400 hover:text-zinc-300 hover:border-white/10 transition-colors rounded-2xl transition shadow-xl group backdrop-blur-md cursor-pointer"
          >
            <Menu className="w-6 h-6 group-hover:scale-110 transition-transform" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isLeftSidebarOpen && (
          <motion.div 
            key="left-sidebar-panel"
            initial={{ x: -80 }}
            animate={{ x: 0 }}
            exit={{ x: -80 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-24 h-full shrink-0 border-r-2 border-white/5 bg-zinc-900/50 flex flex-col items-center py-6 z-40 shadow-2xl relative"
          >
            <button 
              onClick={() => setLeftSidebarOpen(false)}
              className="absolute top-2 right-2 p-1 text-zinc-500 hover:text-white transition-colors cursor-pointer z-50"
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

                {/* Google Drive Status Indicator */}
                <div className="relative group flex flex-col items-center">
                  <button
                    onClick={() => {
                      setLeftSidebarOpen(true);
                      setFileManagerOpen(true);
                    }}
                    className={cn(
                      "w-12 h-12 flex items-center justify-center rounded-2xl border transition-all duration-300 relative",
                      gdriveConnected 
                        ? "bg-emerald-950/10 border-emerald-500/20 text-emerald-400 hover:border-emerald-500/40 hover:bg-emerald-950/20" 
                        : "bg-white/5 border-white/5 text-zinc-600 hover:text-zinc-400 hover:border-white/10"
                    )}
                  >
                    {gdriveSyncStatus === 'scanning' || gdriveSyncStatus === 'importing' || gdriveSyncStatus === 'exporting' ? (
                      <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
                    ) : (
                      <Cloud className="w-5 h-5" />
                    )}
                    
                    {/* Tiny blinking connection status light */}
                    {gdriveConnected && (
                      <span className={cn(
                        "absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-black",
                        gdriveSyncStatus === 'error' ? "bg-red-500" :
                        gdriveSyncStatus === 'success' ? "bg-blue-400" : "bg-emerald-500 animate-pulse"
                      )} />
                    )}
                  </button>

                  {/* Scented Tooltip */}
                  <div className="absolute left-16 bottom-1 w-48 p-3 bg-zinc-900 border border-white/10 text-[9px] font-mono tracking-wider leading-relaxed rounded-xl shadow-2xl opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 pointer-events-none transition-all duration-200 z-50">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-zinc-200 uppercase">Google Drive</span>
                      <span className={cn(
                        "px-1 py-0.2 rounded font-bold uppercase text-[7px]",
                        gdriveConnected ? "bg-emerald-950 text-emerald-400 border border-emerald-500/20" : "bg-zinc-800 text-zinc-500"
                      )}>
                        {gdriveConnected ? "ACTIVE" : "OFFLINE"}
                      </span>
                    </div>
                    {gdriveConnected ? (
                      <div className="space-y-1">
                        <p className="text-zinc-400">
                          {gdriveSyncStatus === 'idle' && "Synchronized & idle."}
                          {gdriveSyncStatus === 'scanning' && "Scanning document repository..."}
                          {gdriveSyncStatus === 'importing' && "Harvesting raw text substrate..."}
                          {gdriveSyncStatus === 'exporting' && "Uploading analysis bundle..."}
                          {gdriveSyncStatus === 'success' && "Sync cycle complete."}
                          {gdriveSyncStatus === 'error' && "Connection or write fault."}
                        </p>
                        {gdriveSyncMessage && (
                          <div className="border-t border-white/5 pt-1 mt-1 text-[8px] text-emerald-500 truncate" title={gdriveSyncMessage}>
                            {gdriveSyncMessage}
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-zinc-500">Tap to authorize account and harvest files.</p>
                    )}
                  </div>
                </div>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

