import React, { useState, useMemo, useEffect } from 'react';
import {
  Home,
  Inbox,
  Share2,
  LayoutGrid,
  Calendar,
  FileText,
  Trash2,
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  Search,
  BookOpen,
  Edit3,
  Copy,
  Check,
  Maximize2,
  Plus,
  X,
  Columns,
  Book,
  Brain,
  HelpCircle,
  HardDrive,
  Clock,
  Settings,
  PanelLeftClose,
  PanelLeft,
  PanelRightClose,
  PanelRight,
  Activity,
  Bookmark,
  Compass,
  Download,
  Upload,
  Sparkles
} from 'lucide-react';
import { CosmicCosmosBackdrop } from './CosmicCosmosBackdrop';
import { RadialStarGraph } from './RadialStarGraph';
import { CommandPalette } from './CommandPalette';
import { ObsidianCanvasView } from './ObsidianCanvasView';
import { InboxModal } from './InboxModal';
import { TemplatesModal } from './TemplatesModal';
import { J314DiscriminatorWorkbench } from './J314DiscriminatorWorkbench';
import { INITIAL_NOTES, INITIAL_VAULT, TAG_LIST } from './data';
import { NoteDocument, WorkspaceTabType, VaultFile } from './types';

// Child view components for unified seamless workspace
import { AcademicPipelineView } from '../ANG/views/AcademicPipelineView';
import { OntologyMap } from '../OntologyMap';
import { ChatView } from '../ANG/views/ChatView';
import { LibraryView } from '../ANG/views/LibraryView';
import { AporiaView } from '../ANG/views/AporiaView';
import { CorpusIntakeTool } from '../CorpusIntakeTool';
import { DigestView } from '../ANG/views/DigestView';
import { SettingsView } from '../ANG/views/SettingsView';
import { GateMode, BoundaryState } from '../../types/ang';
import { Marginalia, CorpusIngestionBatch } from '../../types';
import { DisparityHistoryChart } from '../ANG/DisparityHistoryChart';
import { OccurrenceElevationBalanceView } from './OccurrenceElevationBalanceView';
import { HyperMarkmapView } from '../HyperMarkmap/HyperMarkmapView';

export interface NihiltheismWorkspaceProps {
  // Dialectic State
  messages?: any[];
  onSendMessage?: (content: string) => void;
  gateMode?: GateMode;
  onGateModeChange?: (mode: GateMode) => void;
  boundaryState?: BoundaryState;

  // Ontology Graph State
  displayNodes?: any[];
  displayLinks?: any[];
  corpusTexts?: any[];
  marginalia?: Marginalia[];
  selectedNodeId?: string | null;
  hoveredNodeId?: string | null;
  onSelectNode?: (nodeId: string | null) => void;
  onHoverNode?: (nodeId: string | null) => void;
  onSelectQuestion?: (question: any) => void;
  targetFocusSource?: string | null;

  // Ingest Batches & Aporias
  ingestionBatches?: CorpusIngestionBatch[];
  aporias?: any[];
  onSaveMarginalia?: (corpusId: string, noteText: string) => void;
  onDeleteMarginalia?: (id: string) => void;
  onSaveBatch?: (batch: CorpusIngestionBatch) => void;
  onDeleteBatch?: (id: string) => void;
  onClearAllBatches?: () => void;
}

interface OpenTabItem {
  key: string;
  type: WorkspaceTabType;
  title: string;
  noteId?: string;
}

export const NihiltheismWorkspace: React.FC<NihiltheismWorkspaceProps> = ({
  messages = [],
  onSendMessage = () => {},
  gateMode = 'AUTO',
  onGateModeChange = () => {},
  boundaryState = { theta: 0.18, mode: 'CLEAR' },
  displayNodes = [],
  displayLinks = [],
  corpusTexts = [],
  marginalia = [],
  selectedNodeId = null,
  hoveredNodeId = null,
  onSelectNode = () => {},
  onHoverNode = () => {},
  onSelectQuestion = () => {},
  targetFocusSource = null,
  ingestionBatches = [],
  aporias = [],
  onSaveMarginalia = () => {},
  onDeleteMarginalia = () => {},
  onSaveBatch = () => {},
  onDeleteBatch = () => {},
  onClearAllBatches = () => {}
}) => {
  // Vault & Notes State with localStorage Persistence
  const [notes, setNotes] = useState<Record<string, NoteDocument>>(() => {
    try {
      const saved = localStorage.getItem('nihiltheism_vault_notes_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...INITIAL_NOTES, ...parsed };
      }
    } catch (e) {
      // fallback to initial
    }
    return INITIAL_NOTES;
  });

  // Persist notes changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('nihiltheism_vault_notes_v2', JSON.stringify(notes));
    } catch (e) {
      // ignore
    }
  }, [notes]);

  const [activeTabKey, setActiveTabKey] = useState<string>('note:nihiltheism');
  const [openTabs, setOpenTabs] = useState<OpenTabItem[]>([
    { key: 'note:nihiltheism', type: 'note', title: 'Nihiltheism', noteId: 'nihiltheism' },
    { key: 'note:existence', type: 'note', title: 'Existence', noteId: 'existence' },
    { key: 'note:aesthetic-of-emptiness', type: 'note', title: 'Aesthetic of Emptiness', noteId: 'aesthetic-of-emptiness' },
    { key: 'tool:academic', type: 'academic', title: 'Dissertation Pipeline' }
  ]);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<{ id: string; title: string; noteId?: string } | null>(null);

  const triggerToast = (title: string, noteId?: string) => {
    setToastMessage({ id: String(Date.now()), title, noteId });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Sidebar visibilities for distraction-free focus
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);
  const [rightSidebarTab, setRightSidebarTab] = useState<'context' | 'telemetry' | 'citations'>('telemetry');
  const [telemetrySubMode, setTelemetrySubMode] = useState<'chart' | 'discriminator'>('chart');

  // Modals & Panels
  const [isInboxOpen, setIsInboxOpen] = useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isTrashOpen, setIsTrashOpen] = useState(false);

  // Note View Controls
  const [isEditMode, setIsEditMode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSplitView, setIsSplitView] = useState(false);

  // Folder Expansion
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    'v-00': true,
    'v-20': true,
    'v-30': true,
    'v-40': true,
    'v-50': true
  });

  // Current active note (if active tab is a note)
  const activeTab = openTabs.find((t) => t.key === activeTabKey) || openTabs[0];
  const currentNoteId = activeTab?.noteId || 'nihiltheism';
  const currentNote = notes[currentNoteId] || notes['nihiltheism'];

  // Keyboard shortcut listener for Command Palette (⌘K) and Sidebar toggle (⌘\)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      } else if ((e.metaKey || e.ctrlKey) && e.key === '\\') {
        e.preventDefault();
        setIsLeftSidebarOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Open note helper
  const handleOpenNote = (noteId: string) => {
    const note = notes[noteId];
    if (!note) return;
    const tabKey = `note:${noteId}`;
    const exists = openTabs.some((t) => t.key === tabKey);
    if (!exists) {
      setOpenTabs((prev) => [...prev, { key: tabKey, type: 'note', title: note.title, noteId }]);
    }
    setActiveTabKey(tabKey);
  };

  // Commit Note to Vault from Autopsy or J314 Discriminator
  const handleCommitNoteToVault = (newDoc: NoteDocument) => {
    setNotes((prev) => ({
      ...prev,
      [newDoc.id]: newDoc
    }));
    triggerToast(`Elevated Note Committed: "${newDoc.title}"`, newDoc.id);
  };

  // Export & Import Vault JSON
  const handleExportVaultJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(notes, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `nihiltheism-vault-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    triggerToast('Vault JSON backup exported successfully');
  };

  const handleImportVaultJSON = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        if (typeof parsed === 'object' && parsed !== null) {
          setNotes((prev) => ({ ...prev, ...parsed }));
          triggerToast(`Successfully restored ${Object.keys(parsed).length} notes to vault`);
        }
      } catch (err) {
        triggerToast('Failed to parse vault JSON backup file');
      }
    };
    reader.readAsText(file);
  };

  // Open tool helper
  const handleOpenTool = (type: WorkspaceTabType) => {
    const tabKey = `tool:${type}`;
    const exists = openTabs.some((t) => t.key === tabKey);
    const TOOL_TITLES: Record<string, string> = {
      academic: 'Dissertation Pipeline',
      graph: 'Abyssal Ontology Map',
      canvas: 'Spatial Canvas Board',
      chat: 'Dialectic Curator',
      library: 'Corpus Library',
      questions: 'Aporia Registry',
      ingest: 'Source Intake',
      digest: 'Synthesis Digest',
      settings: 'Abyssal Settings',
      balance: 'O/E Balance',
      hypermarkmap: 'HyperMarkmap Ω'
    };
    if (!exists) {
      setOpenTabs((prev) => [
        ...prev,
        { key: tabKey, type, title: TOOL_TITLES[type] || type.toUpperCase() }
      ]);
    }
    setActiveTabKey(tabKey);
  };

  // Close tab helper
  const handleCloseTab = (e: React.MouseEvent, tabKey: string) => {
    e.stopPropagation();
    const remaining = openTabs.filter((t) => t.key !== tabKey);
    if (remaining.length === 0) {
      setOpenTabs([{ key: 'note:nihiltheism', type: 'note', title: 'Nihiltheism', noteId: 'nihiltheism' }]);
      setActiveTabKey('note:nihiltheism');
    } else {
      setOpenTabs(remaining);
      if (activeTabKey === tabKey) {
        setActiveTabKey(remaining[remaining.length - 1].key);
      }
    }
  };

  // Toggle folder
  const toggleFolder = (folderId: string) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [folderId]: !prev[folderId]
    }));
  };

  // Copy note link
  const handleCopyLink = () => {
    navigator.clipboard?.writeText?.(
      `obsidian://open?vault=Nihiltheism&file=${encodeURIComponent(currentNote.title)}`
    );
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Filter vault by search or tag
  const filteredVault = useMemo(() => {
    if (!searchQuery && !filterTag) return INITIAL_VAULT;
    return INITIAL_VAULT.map((folder) => {
      const filteredChildren = folder.children?.filter((child) => {
        const childNote = child.noteId ? notes[child.noteId] : null;
        if (filterTag && childNote) {
          return childNote.relatedIdeas.some((t) => t.toLowerCase() === filterTag.toLowerCase());
        }
        if (searchQuery) {
          return (
            child.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (childNote && childNote.title.toLowerCase().includes(searchQuery.toLowerCase()))
          );
        }
        return true;
      });
      return {
        ...folder,
        children: filteredChildren
      };
    }).filter(
      (folder) =>
        (folder.children && folder.children.length > 0) ||
        folder.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, filterTag, notes]);

  // Tab Icon Resolver
  const getTabIcon = (type: WorkspaceTabType) => {
    switch (type) {
      case 'note':
        return <FileText size={12} className="text-violet-300" />;
      case 'academic':
        return <BookOpen size={12} className="text-amber-400" />;
      case 'graph':
        return <Share2 size={12} className="text-cyan-400" />;
      case 'canvas':
        return <LayoutGrid size={12} className="text-emerald-400" />;
      case 'chat':
        return <Brain size={12} className="text-purple-400" />;
      case 'library':
        return <Book size={12} className="text-blue-400" />;
      case 'questions':
        return <HelpCircle size={12} className="text-rose-400" />;
      case 'ingest':
        return <HardDrive size={12} className="text-emerald-400" />;
      case 'digest':
        return <Clock size={12} className="text-teal-400" />;
      case 'settings':
        return <Settings size={12} className="text-neutral-400" />;
      case 'balance':
        return <Compass size={12} className="text-amber-400" />;
      default:
        return <FileText size={12} className="text-white/40" />;
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden text-neutral-200 flex flex-col font-sans select-none bg-[#05030a]">
      {/* 1. Procedural Deep-Space Singularity Backdrop */}
      <CosmicCosmosBackdrop />

      {/* 2. Top Window Frame & Unified Quick Navigation Header */}
      <header className="relative z-20 h-11 px-4 flex items-center justify-between border-b border-white/[0.08] bg-[#090614]/85 backdrop-blur-xl">
        {/* Left: Branding + Left Sidebar Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)}
            className={`p-1.5 rounded-lg border transition-all ${
              isLeftSidebarOpen
                ? 'bg-white/[0.05] border-white/10 text-white/70 hover:text-white'
                : 'bg-violet-600/20 border-violet-500/40 text-violet-300 shadow-[0_0_10px_rgba(139,92,246,0.3)]'
            }`}
            title="Toggle Vault Sidebar (⌘\)"
          >
            {isLeftSidebarOpen ? <PanelLeftClose size={14} /> : <PanelLeft size={14} />}
          </button>

          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-white/[0.05] border border-white/10 flex items-center justify-center text-violet-300">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5">
                <polygon points="12,2 22,20 2,20" />
                <circle cx="12" cy="13" r="1.5" fill="currentColor" />
              </svg>
            </div>
            <span className="text-xs font-semibold tracking-wider text-white">NIHILTHEISM</span>
            <span className="text-white/30 text-[10px] hidden sm:inline">•</span>
            <span className="text-white/45 text-[10px] font-mono hidden sm:inline">Vault v2.4</span>
          </div>
        </div>

        {/* Center: Quick Flow View Switcher Pills */}
        <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/5 backdrop-blur-md">
          <button
            onClick={() => handleOpenNote('nihiltheism')}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
              activeTab.type === 'note'
                ? 'bg-violet-600/30 text-white border border-violet-500/40 shadow-sm'
                : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <FileText size={11} className="text-violet-300" />
            <span>Notes</span>
          </button>

          <button
            onClick={() => handleOpenTool('academic')}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
              activeTab.type === 'academic'
                ? 'bg-amber-600/30 text-amber-200 border border-amber-500/40 shadow-sm'
                : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <BookOpen size={11} className="text-amber-400" />
            <span>Academia</span>
          </button>

          <button
            onClick={() => handleOpenTool('graph')}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
              activeTab.type === 'graph'
                ? 'bg-cyan-600/30 text-cyan-200 border border-cyan-500/40 shadow-sm'
                : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Share2 size={11} className="text-cyan-400" />
            <span>Ontology</span>
          </button>

          <button
            onClick={() => handleOpenTool('canvas')}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
              activeTab.type === 'canvas'
                ? 'bg-emerald-600/30 text-emerald-200 border border-emerald-500/40 shadow-sm'
                : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <LayoutGrid size={11} className="text-emerald-400" />
            <span>Canvas</span>
          </button>

          <button
            onClick={() => handleOpenTool('chat')}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
              activeTab.type === 'chat'
                ? 'bg-purple-600/30 text-purple-200 border border-purple-500/40 shadow-sm'
                : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Brain size={11} className="text-purple-400" />
            <span>Dialectic</span>
          </button>

          <button
            onClick={() => handleOpenTool('library')}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
              activeTab.type === 'library'
                ? 'bg-blue-600/30 text-blue-200 border border-blue-500/40 shadow-sm'
                : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Book size={11} className="text-blue-400" />
            <span>Corpus</span>
          </button>

          <button
            onClick={() => handleOpenTool('questions')}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
              activeTab.type === 'questions'
                ? 'bg-rose-600/30 text-rose-200 border border-rose-500/40 shadow-sm'
                : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <HelpCircle size={11} className="text-rose-400" />
            <span>Aporias</span>
          </button>

          <button
            onClick={() => handleOpenTool('balance')}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
              activeTab.type === 'balance'
                ? 'bg-gradient-to-r from-amber-600/30 to-violet-600/30 text-white border border-amber-500/40 shadow-sm'
                : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Compass size={11} className="text-amber-400" />
            <span>Balance</span>
          </button>

          <button
            onClick={() => handleOpenTool('hypermarkmap')}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
              activeTab.type === 'hypermarkmap'
                ? 'bg-gradient-to-r from-cyan-600/30 to-violet-600/30 text-white border border-cyan-500/40 shadow-sm'
                : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Sparkles size={11} className="text-cyan-400" />
            <span>HyperMarkmap Ω</span>
          </button>
        </div>

        {/* Right: Search, Right Sidebar Toggle, & Window Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCommandPaletteOpen(true)}
            className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/[0.04] border border-white/10 text-white/50 hover:text-white hover:border-violet-500/30 transition-all text-xs"
            title="Search Vault (⌘K)"
          >
            <Search size={12} />
            <kbd className="text-[10px] font-mono px-1 rounded bg-white/5 border border-white/10">⌘K</kbd>
          </button>

          <button
            onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
            className={`p-1.5 rounded-lg border transition-all ${
              isRightSidebarOpen
                ? 'bg-white/[0.05] border-white/10 text-white/70 hover:text-white'
                : 'bg-violet-600/20 border-violet-500/40 text-violet-300 shadow-[0_0_10px_rgba(139,92,246,0.3)]'
            }`}
            title="Toggle Inspector Sidebar"
          >
            {isRightSidebarOpen ? <PanelRightClose size={14} /> : <PanelRight size={14} />}
          </button>

          <div className="h-4 w-[1px] bg-white/10 mx-1" />

          {/* Window control dots */}
          <div className="flex items-center gap-1.5">
            <span
              onClick={() => {}}
              className="w-3 h-3 rounded-full bg-white/10 hover:bg-rose-500/80 cursor-pointer transition-colors"
              title="Close"
            />
            <span
              onClick={() => {
                if (!document.fullscreenElement) {
                  document.documentElement.requestFullscreen?.();
                } else {
                  document.exitFullscreen?.();
                }
              }}
              className="w-3 h-3 rounded-full bg-white/10 hover:bg-amber-500/80 cursor-pointer transition-colors"
              title="Fullscreen"
            />
            <span
              onClick={() => {}}
              className="w-3 h-3 rounded-full bg-white/10 hover:bg-emerald-500/80 cursor-pointer transition-colors"
              title="Minimize"
            />
          </div>
        </div>
      </header>

      {/* 3. Main Three-Column Obsidian Workspace Area */}
      <div className="relative z-10 flex-1 flex overflow-hidden p-3 gap-3">
        {/* ========================================================================= */}
        {/* LEFT COLUMN: Sidebar (Vault, Nav, Search, Quotes, Emblems)               */}
        {/* ========================================================================= */}
        {isLeftSidebarOpen && (
          <aside className="w-64 lg:w-72 h-full flex flex-col obsidian-card rounded-2xl overflow-hidden shrink-0 border border-white/10 shadow-2xl animate-fadeIn">
            {/* Sacred Branding */}
            <div className="p-3.5 pb-2.5 flex items-start gap-3 border-b border-white/[0.06]">
              <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/10 flex items-center justify-center shrink-0 text-violet-300 shadow-inner">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
                  <polygon points="12,2 22,20 2,20" stroke="currentColor" />
                  <polygon points="12,7 18,18 6,18" stroke="currentColor" strokeWidth="1" strokeOpacity="0.7" />
                  <circle cx="12" cy="13" r="1.5" fill="currentColor" fillOpacity="0.8" />
                </svg>
              </div>
              <div>
                <h1 className="text-sm font-semibold tracking-wide text-white leading-tight">
                  Nihiltheism
                </h1>
                <p className="text-[11px] text-white/45 tracking-tight">
                  Notes for a Meaningless Beauty
                </p>
              </div>
            </div>

            {/* In-sidebar Quick Filter Input */}
            <div className="px-3 pt-2.5 pb-1">
              <div className="relative flex items-center w-full rounded-xl bg-white/[0.04] border border-white/10 text-white/70 hover:border-violet-500/30 transition-all text-xs group px-2.5 py-1">
                <Search size={13} className="text-white/35 group-hover:text-violet-400 transition-colors shrink-0 mr-2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search vault..."
                  className="w-full bg-transparent text-white placeholder-white/30 focus:outline-none text-xs"
                />
                <button
                  onClick={() => setIsCommandPaletteOpen(true)}
                  title="Open Command Palette (⌘K)"
                  className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-white/50 border border-white/10 hover:text-white shrink-0 ml-1"
                >
                  ⌘K
                </button>
              </div>
            </div>

            {/* Primary Nav List */}
            <div className="px-2 py-1.5 space-y-0.5 border-b border-white/[0.06]">
              <button
                onClick={() => handleOpenNote('nihiltheism')}
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                  activeTab.key === 'note:nihiltheism'
                    ? 'text-white bg-white/[0.06] font-medium'
                    : 'text-white/60 hover:text-white hover:bg-white/[0.03]'
                }`}
              >
                <Home size={13} className="text-violet-400" />
                <span>Home</span>
              </button>

              <button
                onClick={() => setIsInboxOpen(true)}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-white/70 hover:text-white hover:bg-white/[0.04] transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Inbox size={13} className="text-violet-400" />
                  <span>Inbox</span>
                </div>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-violet-600/30 text-violet-200 border border-violet-500/30">
                  3
                </span>
              </button>

              <button
                onClick={() => handleOpenTool('graph')}
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                  activeTab.type === 'graph'
                    ? 'text-white bg-white/[0.06] font-medium'
                    : 'text-white/60 hover:text-white hover:bg-white/[0.03]'
                }`}
              >
                <Share2 size={13} className="text-cyan-400" />
                <span>Graph</span>
              </button>

              <button
                onClick={() => handleOpenTool('canvas')}
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                  activeTab.type === 'canvas'
                    ? 'text-white bg-white/[0.06] font-medium'
                    : 'text-white/60 hover:text-white hover:bg-white/[0.03]'
                }`}
              >
                <LayoutGrid size={13} className="text-emerald-400" />
                <span>Canvas</span>
              </button>

              <button
                onClick={() => handleOpenTool('balance')}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                  activeTab.type === 'balance'
                    ? 'text-white bg-white/[0.06] font-medium'
                    : 'text-white/60 hover:text-white hover:bg-white/[0.03]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Compass size={13} className="text-amber-400" />
                  <span>O/E Balance</span>
                </div>
                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Claims
                </span>
              </button>

              <button
                onClick={() => handleOpenTool('hypermarkmap')}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                  activeTab.type === 'hypermarkmap'
                    ? 'text-white bg-white/[0.06] font-medium'
                    : 'text-white/60 hover:text-white hover:bg-white/[0.03]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles size={13} className="text-cyan-400" />
                  <span>HyperMarkmap Ω</span>
                </div>
                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Visual
                </span>
              </button>

              <button
                onClick={() => {
                  const today = new Date().toISOString().split('T')[0];
                  const dailyNoteId = `daily-${today}`;
                  if (!notes[dailyNoteId]) {
                    const newDaily: NoteDocument = {
                      id: dailyNoteId,
                      title: `Daily Contemplation — ${today}`,
                      subtitle: 'Temporal observations within ungrounded silence.',
                      folder: '10 – Self',
                      path: `Self / Daily ${today}`,
                      introParagraph: 'The morning opens without metaphysical guarantee. Record observations, paradoxes, and phenomena encountered today...',
                      quote: '“To wake is to resume the gentle construction of a world that was never commanded.”',
                      corePrinciples: [
                        { number: 1, title: 'Observe without clinging', description: 'Let sensations rise and dissipate in the void.' },
                        { number: 2, title: 'Notice boundaries', description: 'Where does the witness end and the world begin?' }
                      ],
                      relatedIdeas: ['#daily', '#self', '#meditation'],
                      closingQuote: 'Evening restores all contours to dust.',
                      backlinksCount: 1,
                      wordCount: 85,
                      charCount: 520,
                      isCustom: true
                    };
                    setNotes((prev) => ({ ...prev, [dailyNoteId]: newDaily }));
                  }
                  handleOpenNote(dailyNoteId);
                }}
                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs text-white/60 hover:text-white hover:bg-white/[0.03] transition-colors"
              >
                <Calendar size={13} className="text-amber-400" />
                <span>Daily Notes</span>
              </button>

              <button
                onClick={() => setIsTemplatesOpen(true)}
                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs text-white/60 hover:text-white hover:bg-white/[0.03] transition-colors"
              >
                <FileText size={13} className="text-indigo-400" />
                <span>Templates</span>
              </button>

              <button
                onClick={() => setIsTrashOpen(!isTrashOpen)}
                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs text-white/40 hover:text-white/60 hover:bg-white/[0.03] transition-colors"
              >
                <Trash2 size={13} className="text-white/30" />
                <span>Trash</span>
              </button>
            </div>

            {/* Vault Folder Tree */}
            <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
              <div className="flex items-center justify-between px-2 py-1">
                <span className="text-[10px] font-mono tracking-widest text-white/40 uppercase">
                  VAULT
                </span>
                {filterTag && (
                  <button
                    onClick={() => setFilterTag(null)}
                    className="text-[10px] text-violet-400 hover:text-violet-300 font-mono"
                  >
                    clear ({filterTag})
                  </button>
                )}
              </div>

              {filteredVault.map((folder) => {
                const isExpanded = !!expandedFolders[folder.id];
                return (
                  <div key={folder.id} className="space-y-0.5">
                    <button
                      onClick={() => toggleFolder(folder.id)}
                      className="w-full flex items-center gap-1.5 px-2 py-1 rounded-md text-xs text-white/70 hover:text-white hover:bg-white/[0.04] transition-colors"
                    >
                      {isExpanded ? (
                        <ChevronDown size={12} className="text-white/40" />
                      ) : (
                        <ChevronRight size={12} className="text-white/40" />
                      )}
                      {isExpanded ? (
                        <FolderOpen size={13} className="text-violet-400/70" />
                      ) : (
                        <Folder size={13} className="text-white/50" />
                      )}
                      <span className="truncate">{folder.name}</span>
                    </button>

                    {/* Folder Items */}
                    {isExpanded && folder.children && (
                      <div className="pl-5 space-y-0.5 border-l border-white/[0.05] ml-3 mt-0.5">
                        {folder.children.map((child: VaultFile) => {
                          const isCurrentActive =
                            (child.noteId && activeTab.noteId === child.noteId) ||
                            (child.toolView && activeTab.type === child.toolView);

                          return (
                            <button
                              key={child.id}
                              onClick={() => {
                                if (child.noteId) handleOpenNote(child.noteId);
                                else if (child.toolView) handleOpenTool(child.toolView);
                              }}
                              className={`w-full flex items-center gap-2 px-2 py-1 rounded-lg text-xs transition-all ${
                                isCurrentActive
                                  ? 'bg-violet-600/30 text-white font-medium border border-violet-500/30 shadow-sm'
                                  : 'text-white/60 hover:text-white hover:bg-white/[0.03]'
                              }`}
                            >
                              {child.toolView ? (
                                getTabIcon(child.toolView)
                              ) : (
                                <FileText size={12} className={isCurrentActive ? 'text-violet-300' : 'text-white/35'} />
                              )}
                              <span className="truncate">{child.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Backup & Restore Controls */}
            <div className="px-3 py-2 border-t border-white/[0.06] bg-black/40 flex items-center justify-between gap-1 text-[10px] font-mono">
              <button
                onClick={handleExportVaultJSON}
                className="flex items-center gap-1 px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                title="Export Vault as JSON Backup"
              >
                <Download size={11} />
                <span>Backup JSON</span>
              </button>

              <label className="flex items-center gap-1 px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer">
                <Upload size={11} />
                <span>Restore</span>
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImportVaultJSON(file);
                  }}
                />
              </label>
            </div>

            {/* Bottom Planetary Art with Epigraph Quote */}
            <div className="relative p-3 border-t border-white/[0.06] bg-black/40 overflow-hidden">
              <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-violet-950/20 to-transparent pointer-events-none" />
              <p className="relative z-10 text-[11px] font-serif italic text-white/55 leading-relaxed">
                “In the end, there is no end, and that is enough.”
              </p>
            </div>

            {/* Footer Status Line */}
            <div className="px-3 py-1.5 bg-[#070510] border-t border-white/[0.04] text-[9px] font-mono tracking-widest text-white/30 flex items-center justify-between">
              <span>NULL • EXPLORE • RECORD • TRANSCEND</span>
            </div>
          </aside>
        )}

        {/* ========================================================================= */}
        {/* CENTER COLUMN: Main Document / Feature View Canvas                        */}
        {/* ========================================================================= */}
        <main className="flex-1 h-full flex flex-col obsidian-card rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative">
          {/* Document / Tool Tab Bar */}
          <div className="h-10 px-3 bg-[#0d0a1c]/85 border-b border-white/[0.06] flex items-center justify-between overflow-x-auto gap-1">
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
              {openTabs.map((tab) => {
                const isActive = activeTabKey === tab.key;
                return (
                  <div
                    key={tab.key}
                    onClick={() => setActiveTabKey(tab.key)}
                    className={`group flex items-center gap-2 px-3 py-1.5 rounded-t-lg text-xs cursor-pointer transition-all border-b-2 ${
                      isActive
                        ? 'bg-white/[0.06] text-white border-violet-400 font-medium'
                        : 'text-white/50 hover:text-white/80 border-transparent hover:bg-white/[0.02]'
                    }`}
                  >
                    {getTabIcon(tab.type)}
                    <span className="truncate max-w-[130px]">{tab.title}</span>
                    <button
                      onClick={(e) => handleCloseTab(e, tab.key)}
                      className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-white/10 text-white/40 hover:text-white transition-opacity"
                    >
                      <X size={11} />
                    </button>
                  </div>
                );
              })}

              {/* Add Tab dropdown button */}
              <button
                onClick={() => {
                  const newId = `note-${Date.now()}`;
                  const newDoc: NoteDocument = {
                    id: newId,
                    title: 'Untitled Note',
                    subtitle: 'A blank contemplation in the void.',
                    folder: '20 – Philosophy',
                    path: 'Philosophy / Untitled Note',
                    introParagraph: 'Begin recording your philosophical reflections here...',
                    relatedIdeas: ['#void', '#reflection'],
                    backlinksCount: 0,
                    wordCount: 7,
                    charCount: 48,
                    isCustom: true
                  };
                  setNotes((prev) => ({ ...prev, [newId]: newDoc }));
                  handleOpenNote(newId);
                  setIsEditMode(true);
                }}
                title="New Note Tab"
                className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors ml-1"
              >
                <Plus size={13} />
              </button>
            </div>

            {/* Right Tab Bar Actions */}
            <div className="flex items-center gap-2 text-xs text-white/40 shrink-0">
              {activeTab.type === 'note' && (
                <>
                  <button
                    onClick={() => setIsEditMode(!isEditMode)}
                    className={`p-1.5 rounded hover:text-white transition-colors ${
                      isEditMode ? 'text-violet-300 bg-violet-500/20' : 'hover:bg-white/5'
                    }`}
                    title={isEditMode ? 'Switch to Reading View' : 'Edit Note'}
                  >
                    {isEditMode ? <BookOpen size={13} /> : <Edit3 size={13} />}
                  </button>

                  <button
                    onClick={handleCopyLink}
                    className="p-1.5 rounded hover:text-white hover:bg-white/5 transition-colors"
                    title="Copy Obsidian link"
                  >
                    {copiedLink ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                  </button>
                </>
              )}

              <button
                onClick={() => setIsSplitView(!isSplitView)}
                className={`p-1.5 rounded hover:text-white transition-colors ${
                  isSplitView ? 'text-violet-300 bg-violet-500/20' : 'hover:bg-white/5'
                }`}
                title="Toggle Split Pane"
              >
                <Columns size={13} />
              </button>
            </div>
          </div>

          {/* Central Workspace Body — Switcher based on Active Tab Type */}
          <div className="flex-1 overflow-hidden relative">
            {/* 1. Note Document View */}
            {activeTab.type === 'note' && (
              <div className="w-full h-full flex flex-col overflow-y-auto">
                {/* Document Breadcrumb Strip */}
                <div className="px-8 pt-4 pb-2 flex items-center justify-between text-xs text-white/45 font-mono">
                  <div className="flex items-center gap-1.5">
                    <Folder size={12} className="text-violet-400/60" />
                    <span>{currentNote.path}</span>
                  </div>
                  <div className="text-[11px] text-white/35">{currentNote.folder}</div>
                </div>

                {/* Note Content */}
                <div className="flex-1 px-8 py-4 space-y-6">
                  {isEditMode ? (
                    /* Edit Form */
                    <div className="space-y-4 max-w-3xl animate-fadeIn">
                      <div>
                        <label className="text-xs font-mono text-white/40 block mb-1">Title</label>
                        <input
                          type="text"
                          value={currentNote.title}
                          onChange={(e) => {
                            const val = e.target.value;
                            setNotes((prev) => ({
                              ...prev,
                              [currentNote.id]: { ...prev[currentNote.id], title: val }
                            }));
                          }}
                          className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-xl font-serif text-white focus:outline-none focus:border-violet-400"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-mono text-white/40 block mb-1">Subtitle</label>
                        <input
                          type="text"
                          value={currentNote.subtitle}
                          onChange={(e) => {
                            const val = e.target.value;
                            setNotes((prev) => ({
                              ...prev,
                              [currentNote.id]: { ...prev[currentNote.id], subtitle: val }
                            }));
                          }}
                          className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-1.5 text-sm text-white/80 focus:outline-none focus:border-violet-400"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-mono text-white/40 block mb-1">Body Text</label>
                        <textarea
                          rows={6}
                          value={currentNote.introParagraph}
                          onChange={(e) => {
                            const val = e.target.value;
                            setNotes((prev) => ({
                              ...prev,
                              [currentNote.id]: {
                                ...prev[currentNote.id],
                                introParagraph: val,
                                wordCount: val.split(/\s+/).filter(Boolean).length,
                                charCount: val.length
                              }
                            }));
                          }}
                          className="w-full bg-white/[0.04] border border-white/10 rounded-xl p-3 text-sm text-white/80 focus:outline-none focus:border-violet-400 leading-relaxed font-sans"
                        />
                      </div>
                      <button
                        onClick={() => setIsEditMode(false)}
                        className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium transition-colors"
                      >
                        Done Editing
                      </button>
                    </div>
                  ) : (
                    /* Reading View */
                    <div className="max-w-3xl space-y-6 animate-fadeIn">
                      <div className="space-y-1.5">
                        <h1 className="text-3xl lg:text-4xl font-serif tracking-tight text-white font-normal">
                          {currentNote.title}
                        </h1>
                        <p className="text-base font-serif italic text-white/65">
                          {currentNote.subtitle}
                        </p>
                      </div>

                      {currentNote.quote && (
                        <div className="border-l-2 border-violet-400/70 pl-4 py-1.5 my-4 bg-white/[0.015] rounded-r-lg">
                          <p className="font-serif italic text-base lg:text-lg text-white/90 whitespace-pre-line leading-relaxed">
                            {currentNote.quote}
                          </p>
                        </div>
                      )}

                      <div className="text-sm lg:text-[15px] leading-relaxed text-white/80 font-sans tracking-wide">
                        <p>{currentNote.introParagraph}</p>
                      </div>

                      {currentNote.corePrinciples && currentNote.corePrinciples.length > 0 && (
                        <div className="space-y-3 pt-2">
                          <div className="flex items-center gap-2 group cursor-pointer">
                            <h2 className="text-xl font-serif text-white font-normal">Core Principles</h2>
                            <span className="text-white/30 group-hover:text-violet-400 transition-colors text-sm">🔗</span>
                          </div>

                          <ol className="space-y-3.5 pl-1">
                            {currentNote.corePrinciples.map((cp) => (
                              <li key={cp.number} className="flex items-start gap-2.5 text-sm">
                                <span className="font-mono text-xs text-white/40 pt-0.5">{cp.number}.</span>
                                <div className="space-y-0.5">
                                  <span className="font-semibold text-white/95 block">{cp.title}</span>
                                  <span className="text-white/70 block leading-relaxed text-sm">{cp.description}</span>
                                </div>
                              </li>
                            ))}
                          </ol>
                        </div>
                      )}

                      <div className="space-y-2.5 pt-2">
                        <div className="flex items-center gap-2 group cursor-pointer">
                          <h2 className="text-xl font-serif text-white font-normal">Related Ideas</h2>
                          <span className="text-white/30 group-hover:text-violet-400 transition-colors text-sm">🔗</span>
                        </div>

                        <div className="flex flex-wrap gap-2 pt-1">
                          {currentNote.relatedIdeas.map((tag) => (
                            <button
                              key={tag}
                              onClick={() => setFilterTag(tag)}
                              className="px-3 py-1 rounded-full text-xs font-mono bg-white/[0.04] hover:bg-violet-600/30 text-white/70 hover:text-white border border-white/10 hover:border-violet-500/40 transition-all cursor-pointer"
                            >
                              {tag}
                            </button>
                          ))}
                        </div>
                      </div>

                      {currentNote.closingQuote && (
                        <div className="pt-6 pb-4 border-t border-white/[0.06]">
                          <p className="font-serif italic text-sm lg:text-base text-white/60 leading-relaxed">
                            {currentNote.closingQuote}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer status */}
                <footer className="h-9 px-6 bg-[#0a0718]/90 border-t border-white/[0.06] flex items-center justify-between text-xs text-white/40 font-mono mt-auto">
                  <div className="flex items-center gap-4">
                    <span>{currentNote.backlinksCount} backlinks</span>
                    <span>{currentNote.wordCount} words</span>
                    <span>{currentNote.charCount.toLocaleString()} characters</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsEditMode(!isEditMode)}
                      className="hover:text-white transition-colors"
                      title="Toggle View Mode"
                    >
                      <BookOpen size={12} />
                    </button>
                    <button
                      onClick={() => setIsSplitView(!isSplitView)}
                      className="hover:text-white transition-colors"
                      title="Split View"
                    >
                      <Columns size={12} />
                    </button>
                  </div>
                </footer>
              </div>
            )}

            {/* 2. Academic Dissertation Research Pipeline View */}
            {activeTab.type === 'academic' && (
              <div className="w-full h-full overflow-y-auto">
                <AcademicPipelineView />
              </div>
            )}

            {/* 3. Full 2D/3D Abyssal Ontology Map View */}
            {activeTab.type === 'graph' && (
              <div className="w-full h-full">
                <OntologyMap
                  nodes={displayNodes}
                  links={displayLinks}
                  corpusTexts={corpusTexts}
                  marginalia={marginalia}
                  selectedNodeId={selectedNodeId}
                  hoveredNodeId={hoveredNodeId}
                  onSelectNode={onSelectNode}
                  onHoverNode={onHoverNode}
                  onSelectQuestion={onSelectQuestion}
                  onNavigateToTab={() => {}}
                  ingestionBatches={ingestionBatches}
                  initialFocusSource={targetFocusSource}
                  onSaveBatch={onSaveBatch}
                  onDeleteBatch={onDeleteBatch}
                  aporias={aporias}
                  onSaveMarginalia={onSaveMarginalia}
                />
              </div>
            )}

            {/* 4. Spatial Obsidian Canvas Board View */}
            {activeTab.type === 'canvas' && (
              <div className="w-full h-full">
                <ObsidianCanvasView onOpenNote={handleOpenNote} />
              </div>
            )}

            {/* 5. Dialectic Curator View */}
            {activeTab.type === 'chat' && (
              <div className="w-full h-full">
                <ChatView
                  messages={messages}
                  onSendMessage={onSendMessage}
                  boundaryState={boundaryState}
                  sessionTime="0h 14m"
                  nodesCreated={displayNodes.length || 12}
                />
              </div>
            )}

            {/* 6. Corpus Library & Marginalia View */}
            {activeTab.type === 'library' && (
              <div className="w-full h-full overflow-y-auto">
                <LibraryView
                  corpusTexts={corpusTexts}
                  marginalia={marginalia}
                  onSaveMarginalia={onSaveMarginalia}
                  onDeleteMarginalia={onDeleteMarginalia}
                />
              </div>
            )}

            {/* 7. Aporia Paradox Registry View */}
            {activeTab.type === 'questions' && (
              <div className="w-full h-full overflow-y-auto">
                <AporiaView aporias={aporias} />
              </div>
            )}

            {/* 8. Corpus Ingestion Tool View */}
            {activeTab.type === 'ingest' && (
              <div className="w-full h-full overflow-y-auto">
                <CorpusIntakeTool
                  ingestionBatches={ingestionBatches}
                  onSaveBatch={onSaveBatch}
                  onDeleteBatch={onDeleteBatch}
                  onClearAllBatches={onClearAllBatches}
                  onNavigateToTab={(tab) => handleOpenTool(tab as any)}
                />
              </div>
            )}

            {/* 9. Synthesis Digest View */}
            {activeTab.type === 'digest' && (
              <div className="w-full h-full overflow-y-auto">
                <DigestView
                  dateStart="Aug 19"
                  dateEnd="Aug 26"
                  generatedAt={new Date().toISOString()}
                  stats={{
                    sourcesIngested: 3,
                    nodesCreated: 127,
                    sessions: 7,
                    totalSessionTime: '14h 23m',
                    paradoxesConfirmed: 1,
                    aporiaAdded: aporias.length,
                    invarianceAnalyses: 2,
                    newInvariants: 1
                  }}
                  synthesisNote="The void discloses rather than merely negates. Invariant boundary tests hold steady."
                  pendingReviewCount={3}
                />
              </div>
            )}

            {/* 10. Engine Settings View */}
            {activeTab.type === 'settings' && (
              <div className="w-full h-full overflow-y-auto">
                <SettingsView />
              </div>
            )}

            {/* 11. Occurrence vs Elevation Claims Balance View */}
            {activeTab.type === 'balance' && (
              <div className="w-full h-full overflow-hidden">
                <OccurrenceElevationBalanceView
                  ingestionBatches={ingestionBatches}
                  vaultNotes={notes}
                  onOpenNote={handleOpenNote}
                  onNavigateToTab={handleOpenTool}
                  onSaveBatch={onSaveBatch}
                  onCommitNoteToVault={handleCommitNoteToVault}
                />
              </div>
            )}

            {/* 12. HyperMarkmap Visual Engine */}
            {activeTab.type === 'hypermarkmap' && (
              <div className="w-full h-full overflow-hidden">
                <HyperMarkmapView />
              </div>
            )}
          </div>
        </main>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: Contextual Intelligence & Constellation Graph Inspector    */}
        {/* ========================================================================= */}
        {isRightSidebarOpen && (
          <aside className="w-72 lg:w-80 h-full flex flex-col gap-3 overflow-y-auto shrink-0 pr-0.5 animate-fadeIn">
            {/* Inspector Tab Switcher */}
            <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/5">
              <button
                onClick={() => setRightSidebarTab('context')}
                className={`flex-1 py-1 rounded-lg text-[11px] font-mono transition-all text-center ${
                  rightSidebarTab === 'context'
                    ? 'bg-violet-600/30 text-white font-semibold border border-violet-500/40'
                    : 'text-white/50 hover:text-white'
                }`}
              >
                Graph & Context
              </button>
              <button
                onClick={() => setRightSidebarTab('telemetry')}
                className={`flex-1 py-1 rounded-lg text-[11px] font-mono transition-all text-center ${
                  rightSidebarTab === 'telemetry'
                    ? 'bg-violet-600/30 text-white font-semibold border border-violet-500/40'
                    : 'text-white/50 hover:text-white'
                }`}
              >
                Telemetry
              </button>
              <button
                onClick={() => setRightSidebarTab('citations')}
                className={`flex-1 py-1 rounded-lg text-[11px] font-mono transition-all text-center ${
                  rightSidebarTab === 'citations'
                    ? 'bg-violet-600/30 text-white font-semibold border border-violet-500/40'
                    : 'text-white/50 hover:text-white'
                }`}
              >
                Citations
              </button>
            </div>

            {/* 1. Context Mode: Radial Star Graph, Linked Mentions, Tags */}
            {rightSidebarTab === 'context' && (
              <>
                <RadialStarGraph
                  activeNoteId={currentNoteId}
                  onSelectNode={(nodeId) => handleOpenNote(nodeId)}
                  onOpenFullGraph={() => handleOpenTool('graph')}
                />

                <div className="obsidian-card rounded-2xl p-4 flex flex-col space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold tracking-wide text-white/90">
                      Linked Mentions ({currentNote.linkedMentions ? currentNote.linkedMentions.length : 5})
                    </h3>
                    <button
                      onClick={() => handleOpenTool('graph')}
                      className="p-1 rounded text-white/40 hover:text-white hover:bg-white/5 transition-colors"
                      title="Open Graph"
                    >
                      <Maximize2 size={12} />
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    {(currentNote.linkedMentions && currentNote.linkedMentions.length > 0
                      ? currentNote.linkedMentions
                      : notes['nihiltheism'].linkedMentions || []
                    ).map((mention) => (
                      <div
                        key={mention.id}
                        onClick={() => handleOpenNote(mention.targetId)}
                        className="p-2 rounded-xl bg-white/[0.025] hover:bg-white/[0.06] border border-white/5 hover:border-violet-500/30 cursor-pointer transition-all group"
                      >
                        <div className="flex items-center gap-1.5 text-xs font-medium text-white/90 group-hover:text-violet-300">
                          <FileText size={11} className="text-white/40 group-hover:text-violet-400" />
                          <span>{mention.title}</span>
                        </div>
                        <p className="text-[11px] text-white/50 font-mono mt-0.5 leading-snug line-clamp-2">
                          {mention.snippet}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="obsidian-card rounded-2xl p-4 flex flex-col space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold tracking-wide text-white/90">Tags</h3>
                    {filterTag && (
                      <button
                        onClick={() => setFilterTag(null)}
                        className="text-[10px] text-violet-400 hover:text-violet-300 font-mono"
                      >
                        Reset
                      </button>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {TAG_LIST.map((tag) => {
                      const isTagSelected = filterTag === tag.name;
                      return (
                        <button
                          key={tag.name}
                          onClick={() => setFilterTag(isTagSelected ? null : tag.name)}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-mono transition-all ${
                            isTagSelected
                              ? 'bg-violet-500 text-white shadow-md'
                              : 'bg-white/[0.04] text-white/70 hover:bg-white/[0.08] hover:text-white border border-white/5'
                          }`}
                        >
                          <span>{tag.name}</span>
                          <span className="text-[9px] text-white/40 ml-0.5">{tag.count}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {/* 2. Telemetry Mode: Boundary θ, Gate Mode, Disparity Index & J314 Discriminator */}
            {rightSidebarTab === 'telemetry' && (
              <div className="space-y-3">
                {/* Segmented Mode Selector: Disparity Index vs J314 Discriminator */}
                <div className="flex items-center gap-1 bg-black/60 p-1 rounded-xl border border-white/10 font-mono text-xs">
                  <button
                    onClick={() => setTelemetrySubMode('chart')}
                    className={`flex-1 py-1.5 rounded-lg text-center transition-all flex items-center justify-center gap-1.5 ${
                      telemetrySubMode === 'chart'
                        ? 'bg-amber-500/20 text-amber-200 border border-amber-500/40 shadow-sm font-bold'
                        : 'text-white/50 hover:text-white'
                    }`}
                  >
                    <Activity size={12} className={telemetrySubMode === 'chart' ? 'text-amber-400' : ''} />
                    <span>Disparity Index</span>
                  </button>

                  <button
                    onClick={() => setTelemetrySubMode('discriminator')}
                    className={`flex-1 py-1.5 rounded-lg text-center transition-all flex items-center justify-center gap-1.5 ${
                      telemetrySubMode === 'discriminator'
                        ? 'bg-violet-600/30 text-white border border-violet-400 shadow-sm font-bold'
                        : 'text-white/50 hover:text-white'
                    }`}
                  >
                    <Compass size={12} className={telemetrySubMode === 'discriminator' ? 'text-violet-300' : ''} />
                    <span>J314 Engine</span>
                  </button>
                </div>

                {telemetrySubMode === 'chart' ? (
                  <>
                    <div className="obsidian-card rounded-2xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Activity size={14} className="text-violet-400" />
                          <h4 className="text-xs font-semibold text-white font-mono uppercase">
                            Boundary θ Tension
                          </h4>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          {boundaryState.mode}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-mono text-white/60">
                          <span>Dissolution Coefficient</span>
                          <span className="text-white font-bold">{boundaryState.theta.toFixed(2)} / 1.00</span>
                        </div>
                        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-400 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, boundaryState.theta * 100)}%` }}
                          />
                        </div>
                        <p className="text-[10px] text-white/40 font-mono pt-1">
                          Apophatic discipline holding. Zero paradox contamination detected.
                        </p>
                      </div>
                    </div>

                    <div className="obsidian-card rounded-2xl p-4 space-y-2.5">
                      <h4 className="text-xs font-semibold text-white font-mono uppercase">Gate Mode</h4>
                      <div className="grid grid-cols-3 gap-1.5">
                        {(['AUTO', 'DEEP', 'FAST'] as GateMode[]).map((mode) => (
                          <button
                            key={mode}
                            onClick={() => onGateModeChange(mode)}
                            className={`py-1.5 rounded-lg text-xs font-mono transition-all border ${
                              gateMode === mode
                                ? 'bg-violet-600/30 text-white border-violet-400 shadow-sm font-bold'
                                : 'border-white/10 text-white/60 hover:text-white'
                            }`}
                          >
                            {mode}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="obsidian-card rounded-2xl p-4 space-y-2 text-xs font-mono text-white/70">
                      <div className="flex justify-between py-1 border-b border-white/5">
                        <span>Aporias Active</span>
                        <span className="text-white">{aporias.length}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-white/5">
                        <span>Ontology Nodes</span>
                        <span className="text-white">{displayNodes.length || 12}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span>Corpus Ingested</span>
                        <span className="text-white">{corpusTexts.length || 5} works</span>
                      </div>
                    </div>

                    {/* Live Animated Visual Disparity Index with Multi-Node Comparison & Live Vault Reactivity */}
                    <DisparityHistoryChart
                      className="w-full rounded-2xl border border-white/10"
                      onSelectGraphNode={onSelectNode}
                      vaultNotesCount={Object.keys(notes).length}
                      activeAporiasCount={aporias.length}
                      dialecticMessagesCount={messages.length}
                      boundaryTheta={boundaryState.theta}
                      onCommitToVault={handleCommitNoteToVault}
                      onOpenNote={handleOpenNote}
                    />
                  </>
                ) : (
                  /* J314 Occurrence-Elevation Discriminator Workbench */
                  <J314DiscriminatorWorkbench
                    vaultNotes={notes}
                    onCommitToVault={handleCommitNoteToVault}
                    onOpenNote={handleOpenNote}
                    className="w-full shadow-lg"
                  />
                )}
              </div>
            )}

            {/* 3. Citations Mode: Quick BibTeX Reference Cards */}
            {rightSidebarTab === 'citations' && (
              <div className="obsidian-card rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bookmark size={14} className="text-amber-400" />
                    <h4 className="text-xs font-semibold text-white font-mono uppercase">
                      Manuscript Citations
                    </h4>
                  </div>
                  <button
                    onClick={() => handleOpenTool('academic')}
                    className="text-[10px] text-amber-400 hover:text-amber-300 font-mono"
                  >
                    View All
                  </button>
                </div>

                <div className="space-y-2">
                  {[
                    { author: 'Nishitani, K.', year: '1982', title: 'Religion and Nothingness', key: 'nishitani1982' },
                    { author: 'Eckhart, M.', year: '1314', title: 'The Silent Wasteland of God', key: 'eckhart1314' },
                    { author: 'Camus, A.', year: '1942', title: 'The Myth of Sisyphus', key: 'camus1942' },
                    { author: 'Nagarjuna', year: '150 CE', title: 'Mulamadhyamakakarika', key: 'nagarjuna150' }
                  ].map((cit) => (
                    <div
                      key={cit.key}
                      className="p-2 rounded-xl bg-white/[0.03] border border-white/5 space-y-1 hover:border-amber-500/30 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-white">{cit.author} ({cit.year})</span>
                        <button
                          onClick={() => {
                            navigator.clipboard?.writeText?.(`\\cite{${cit.key}}`);
                          }}
                          title="Copy \\cite{key}"
                          className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-white/50 hover:text-amber-300"
                        >
                          \cite
                        </button>
                      </div>
                      <p className="text-[11px] text-white/60 italic font-serif truncate">{cit.title}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Right Footer Quote & Sacred Emblem */}
            <div className="mt-auto pt-2 pb-1 flex items-center justify-between text-[10px] text-white/35 font-mono">
              <span className="tracking-wider truncate">A TEMPORARY MIND IN AN INFINITE ELSEWHERE.</span>
              <div className="w-4 h-4 text-white/40 shrink-0 ml-1">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <polygon points="12,2 22,20 2,20" />
                  <circle cx="12" cy="13" r="1.5" fill="currentColor" />
                </svg>
              </div>
            </div>
          </aside>
        )}
      </div>

      {/* 4. Integrated Modals */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        notes={notes}
        onSelectNote={handleOpenNote}
        onSelectTag={(t) => setFilterTag(t)}
      />

      <InboxModal
        isOpen={isInboxOpen}
        onClose={() => setIsInboxOpen(false)}
        onAcceptToVault={(item) => {
          const newId = `note-inbox-${Date.now()}`;
          const newDoc: NoteDocument = {
            id: newId,
            title: item.title,
            subtitle: `Integrated from ${item.source}`,
            folder: '40 – Systems',
            path: `Systems / ${item.title}`,
            introParagraph: item.snippet,
            relatedIdeas: ['#inbox', '#synthesis', '#void'],
            backlinksCount: 1,
            wordCount: item.snippet.split(/\s+/).length,
            charCount: item.snippet.length,
            isCustom: true
          };
          setNotes((prev) => ({ ...prev, [newId]: newDoc }));
          handleOpenNote(newId);
        }}
        onOpenDialectic={() => handleOpenTool('chat')}
      />

      <TemplatesModal
        isOpen={isTemplatesOpen}
        onClose={() => setIsTemplatesOpen(false)}
        onApplyTemplate={(newDoc) => {
          setNotes((prev) => ({ ...prev, [newDoc.id]: newDoc }));
          handleOpenNote(newDoc.id);
        }}
      />

      {/* 5. Ambient Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[#0e091c] border border-amber-500/40 text-neutral-100 shadow-[0_0_25px_rgba(245,158,11,0.25)] animate-fade-in font-mono text-xs">
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          <span className="font-sans font-medium text-white">{toastMessage.title}</span>
          {toastMessage.noteId && (
            <button
              onClick={() => {
                if (toastMessage.noteId) handleOpenNote(toastMessage.noteId);
                setToastMessage(null);
              }}
              className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-black font-bold text-[11px] transition-colors ml-1"
            >
              Open Note
            </button>
          )}
          <button
            onClick={() => setToastMessage(null)}
            className="text-white/40 hover:text-white ml-1"
          >
            <X size={13} />
          </button>
        </div>
      )}
    </div>
  );
};
