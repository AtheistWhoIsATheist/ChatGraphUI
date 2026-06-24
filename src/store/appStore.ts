import { create } from 'zustand';
import { Node, Link, corpusNodes, corpusLinks } from '../data/corpus';
import { ViewMode } from '../components/NavigationSidebar';

export type SidebarMode = 'chat' | 'intelligence' | 'insights' | 'audit' | 'details';

interface AppState {
  // Graph Data
  nodes: Node[];
  links: Link[];
  
  // Navigation
  viewMode: ViewMode;
  selectedNodeId: string | undefined;
  
  // UI Panels
  sidebarMode: SidebarMode;
  isLeftSidebarOpen: boolean;
  isRightSidebarOpen: boolean;
  isFileManagerOpen: boolean;

  // Google Drive Connection & Sync
  gdriveConnected: boolean;
  gdriveSyncStatus: 'idle' | 'scanning' | 'importing' | 'exporting' | 'error' | 'success';
  gdriveSyncMessage: string;
  
  // Methods
  setNodes: (nodes: Node[]) => void;
  setLinks: (links: Link[]) => void;
  addNode: (node: Node) => void;
  addLink: (link: Link) => void;
  setViewMode: (mode: ViewMode) => void;
  setSelectedNodeId: (id: string | undefined) => void;
  setSidebarMode: (mode: SidebarMode) => void;
  setLeftSidebarOpen: (open: boolean) => void;
  setRightSidebarOpen: (open: boolean) => void;
  setFileManagerOpen: (open: boolean) => void;
  setGDriveConnected: (connected: boolean) => void;
  setGDriveSyncStatus: (status: 'idle' | 'scanning' | 'importing' | 'exporting' | 'error' | 'success') => void;
  setGDriveSyncMessage: (msg: string) => void;
  
  // Batch updates
  integrateSyntheticData: (newNodes: Node[], newLinks: Link[]) => void;
}

export const useAppStore = create<AppState>((set) => ({
  nodes: corpusNodes,
  links: corpusLinks,
  viewMode: 'engine',
  selectedNodeId: undefined,
  sidebarMode: 'chat',
  isLeftSidebarOpen: true,
  isRightSidebarOpen: true,
  isFileManagerOpen: false,

  // Google Drive Initial values
  gdriveConnected: !!localStorage.getItem('google_access_token'),
  gdriveSyncStatus: 'idle',
  gdriveSyncMessage: '',

  setNodes: (nodes) => set({ nodes }),
  setLinks: (links) => set({ links }),
  addNode: (node) => set((state) => ({ nodes: [...state.nodes, node] })),
  addLink: (link) => set((state) => ({ links: [...state.links, link] })),
  setViewMode: (viewMode) => set({ viewMode }),
  setSelectedNodeId: (selectedNodeId) => set({ selectedNodeId }),
  setSidebarMode: (sidebarMode) => set({ sidebarMode }),
  setLeftSidebarOpen: (isLeftSidebarOpen) => set({ isLeftSidebarOpen }),
  setRightSidebarOpen: (isRightSidebarOpen) => set({ isRightSidebarOpen }),
  setFileManagerOpen: (isFileManagerOpen) => set({ isFileManagerOpen }),
  setGDriveConnected: (gdriveConnected) => set({ gdriveConnected }),
  setGDriveSyncStatus: (gdriveSyncStatus) => set({ gdriveSyncStatus }),
  setGDriveSyncMessage: (gdriveSyncMessage) => set({ gdriveSyncMessage }),
  
  integrateSyntheticData: (newNodes, newLinks) => set((state) => ({
    nodes: [...state.nodes, ...newNodes],
    links: [...state.links, ...newLinks],
  })),
}));
