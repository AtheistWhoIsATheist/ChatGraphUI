import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { HyperMarkmapCanvas, HyperMarkmapCanvasRef } from './HyperMarkmapCanvas';
import { HyperMarkmapToolbar } from './HyperMarkmapToolbar';
import { HyperMarkmapEditor } from './HyperMarkmapEditor';
import { HyperMarkmapInspector } from './HyperMarkmapInspector';
import { HyperMarkmapMinimap } from './HyperMarkmapMinimap';
import { HyperMarkmapDock } from './HyperMarkmapDock';
import { TraditionDrawer } from './TraditionDrawer';
import { CorpusImportModal } from './CorpusImportModal';
import {
  parseMarkdownToTree,
  parseJsonToTree,
  treeToMarkdown,
  cloneTree,
  computeDescendantCounts,
  computeTraditionCounts
} from './parser';
import {
  HyperNode,
  LayoutMode,
  DisplaySettings,
  SearchState
} from './types';
import { Maximize2, CheckCircle2 } from 'lucide-react';

const DEFAULT_MARKDOWN = `# Nihiltheism Ω — Notes for a Meaningless Beauty
## 00 — Epistemic Groundlessness ∅
- The Abgrund as Ontological Origin [Buddhist]
  - Radical Disorientation
  - Collapse of Idolatrous Axioms
- Negative Theology & Radical Apophaticism ⚖ [Christian]
  - Divine Darkness of Dionysius
  - Eckhart's Desert of the Godhead [Christian]
## 10 — J314 Occurrence-Elevation Discriminator ⇄
- Phenomenological Occurrence [Phenomenological]
  - Reactive Psychological Friction
  - Contingent Historical Noise
- Transcendent Structural Elevation 🜏 [Sufi]
  - Eidetic Invariant Clarity
  - Gelassenheit (Serene Release) [Existential]
## 20 — Apophatic Dialectics ⟁
- Collision of Theism & Nihilism [Postmodern]
  - Deconstruction of the Cosmic Monarch
  - Rebirth of the Transcendent Void [Daoist]
- Constructive Synthesis Protocols [Hindu]
  - Trans-Egoic Grounding
  - Active Search for Answered Theorems [Kabbalistic]
## 30 — Dissolution and Rebirth
- The Witness Paradox [Counter-Enlightenment]
  - Who records the dissolution?
  - Pure awareness prior to predicates
- The Meaningless Beauty
  - Aesthetics of Groundless Wonder
  - Eternal Forms in Liminal Space`;

const DEFAULT_SETTINGS: DisplaySettings = {
  showGlow: false,
  showStarfield: true,
  showFilaments: true,
  showOrbs: true,
  colorTheme: 'slate',
  fontSize: 12,
  nodeSpacing: 38,
  maxVisibleDepth: 7,
  zenMode: false
};

export const HyperMarkmapView: React.FC = () => {
  const canvasRef = useRef<HyperMarkmapCanvasRef>(null);

  // Layout mode & settings with localStorage persistence
  const [layoutMode, setLayoutMode] = useState<LayoutMode>(() => {
    try {
      const saved = localStorage.getItem('hypermarkmap-layout');
      return (saved as LayoutMode) || 'radial';
    } catch {
      return 'radial';
    }
  });

  const [displaySettings, setDisplaySettings] = useState<DisplaySettings>(() => {
    try {
      const saved = localStorage.getItem('hypermarkmap-settings');
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // Markdown and Tree state
  const [markdownText, setMarkdownText] = useState<string>(() => {
    try {
      return localStorage.getItem('hypermarkmap-doc') || DEFAULT_MARKDOWN;
    } catch {
      return DEFAULT_MARKDOWN;
    }
  });

  const [rootNode, setRootNode] = useState<HyperNode>(() => parseMarkdownToTree(DEFAULT_MARKDOWN));
  const [selectedNode, setSelectedNode] = useState<HyperNode | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [activeCorpusName, setActiveCorpusName] = useState('Nihiltheism Notes');

  // Tradition filter drawer state
  const [isTraditionDrawerOpen, setIsTraditionDrawerOpen] = useState(false);
  const [selectedTraditionIds, setSelectedTraditionIds] = useState<string[]>([]);
  const [muteZeroCount, setMuteZeroCount] = useState(false);

  // Corpus Import Modal state
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Self-dismissing toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  }, []);

  // Search state
  const [searchState, setSearchState] = useState<SearchState>({
    query: '',
    matchIds: [],
    currentIndex: -1,
    totalMatches: 0
  });

  // Save preferences
  useEffect(() => {
    try {
      localStorage.setItem('hypermarkmap-layout', layoutMode);
      localStorage.setItem(
        'hypermarkmap-settings',
        JSON.stringify({ ...displaySettings, zenMode: false })
      );
    } catch {
      // ignore
    }
  }, [layoutMode, displaySettings]);

  // Load canonical dataset on mount if user hasn't modified local doc
  useEffect(() => {
    const hasCustomDoc = localStorage.getItem('hypermarkmap-doc');
    if (!hasCustomDoc) {
      fetch('/data/JOURNAL314_OMEGA_HYPERMAP_EXPANDED.json')
        .then((res) => {
          if (res.ok) return res.json();
          throw new Error('Not found');
        })
        .then((data) => {
          const parsedTree = parseJsonToTree(data);
          setRootNode(parsedTree);
          setActiveCorpusName('Journal 314 Omega');
          setMarkdownText(treeToMarkdown(parsedTree));
          showToast(`Loaded canonical corpus (${parsedTree.descendantCount || 906} nodes)`);
        })
        .catch(() => {
          const parsed = parseMarkdownToTree(DEFAULT_MARKDOWN);
          setRootNode(parsed);
        });
    }
  }, [showToast]);

  // Compute live tradition counts across current tree
  const traditionCounts = useMemo(() => {
    return computeTraditionCounts(rootNode);
  }, [rootNode]);

  // Update tree when markdown changes in editor
  const handleMarkdownChange = useCallback((text: string) => {
    setMarkdownText(text);
    try {
      localStorage.setItem('hypermarkmap-doc', text);
    } catch {
      // ignore
    }
    const newTree = parseMarkdownToTree(text);
    setRootNode(newTree);
  }, []);

  // Preset loader
  const handleSelectPreset = useCallback(async (presetId: string) => {
    if (presetId === 'journal314') {
      try {
        const res = await fetch('/data/JOURNAL314_OMEGA_HYPERMAP_EXPANDED.json');
        if (res.ok) {
          const json = await res.json();
          const tree = parseJsonToTree(json);
          setRootNode(tree);
          setActiveCorpusName('Journal 314 Omega');
          const md = treeToMarkdown(tree);
          setMarkdownText(md);
          localStorage.setItem('hypermarkmap-doc', md);
          showToast(`Ingested Journal 314 Omega (${tree.descendantCount} nodes)`);
          setTimeout(() => canvasRef.current?.fitView(), 150);
          return;
        }
      } catch (e) {
        console.error('Failed to load journal314 json', e);
      }
    } else if (presetId === 'apophatic') {
      try {
        const res = await fetch('/data/j314-apophatic.json');
        if (res.ok) {
          const json = await res.json();
          const tree = parseJsonToTree(json);
          setRootNode(tree);
          setActiveCorpusName('Apophatic Dialectic');
          const md = treeToMarkdown(tree);
          setMarkdownText(md);
          localStorage.setItem('hypermarkmap-doc', md);
          showToast(`Ingested Apophatic Dialectic (${tree.descendantCount} nodes)`);
          setTimeout(() => canvasRef.current?.fitView(), 150);
          return;
        }
      } catch (e) {
        console.error('Failed to load apophatic json', e);
      }
    } else if (presetId === 'taxonomies') {
      const taxoMd = `# The Tree of Knowledge & Cognitive Philosophy
## Trivium — Language & Reason [Existential]
- Grammar (Structure of Symbol)
- Logic (Dialectical Rigor) [Phenomenological]
- Rhetoric (Persuasive Synthesis)
## Quadrivium — Mathematical Harmonies [Counter-Enlightenment]
- Arithmetic (Pure Number in Thought)
- Geometry (Number in Space) [Daoist]
- Music (Number in Time) [Sufi]
- Astronomy (Number in Space & Time)
## The Metaphysical Summit
- Groundless Ontology ∅ [Buddhist]
- Phenomenological Observation ⇄ [Phenomenological]
- Trans-Rational Elevation 🜏 [Christian]`;
      handleMarkdownChange(taxoMd);
      setActiveCorpusName('Seven Liberal Arts');
      showToast('Ingested Seven Liberal Arts Taxonomy');
      setTimeout(() => canvasRef.current?.fitView(), 150);
    }
  }, [handleMarkdownChange, showToast]);

  // Handle Ingested File from Multipart Corpus Import Modal
  const handleCorpusIngested = useCallback((content: string, filename: string) => {
    setActiveCorpusName(filename);
    if (filename.endsWith('.json')) {
      try {
        const json = JSON.parse(content);
        const tree = parseJsonToTree(json);
        setRootNode(tree);
        const md = treeToMarkdown(tree);
        setMarkdownText(md);
        localStorage.setItem('hypermarkmap-doc', md);
        showToast(`Ingested ${filename} (${tree.descendantCount} nodes)`);
        setTimeout(() => canvasRef.current?.fitView(), 150);
        return;
      } catch (e) {
        console.warn('Fallback markdown parse for file', e);
      }
    }
    handleMarkdownChange(content);
    showToast(`Ingested ${filename}`);
    setTimeout(() => canvasRef.current?.fitView(), 150);
  }, [handleMarkdownChange, showToast]);

  // Toggle Tradition Filter
  const handleToggleTradition = useCallback((id: string) => {
    setSelectedTraditionIds((prev) => {
      if (prev.length === 0) {
        // If all were active, selecting one activates only that one
        return [id];
      }
      if (prev.includes(id)) {
        const next = prev.filter((item) => item !== id);
        return next;
      }
      return [...prev, id];
    });
  }, []);

  // Toggle Collapse / Expand for specific node
  const handleToggleNode = useCallback((nodeId: string) => {
    setRootNode((prevRoot) => {
      const cloned = cloneTree(prevRoot);

      function toggleInTree(node: HyperNode): boolean {
        if (node.id === nodeId) {
          if (node.children && node.children.length > 0) {
            node._children = node.children;
            node.children = undefined;
          } else if (node._children && node._children.length > 0) {
            node.children = node._children;
            node._children = undefined;
          }
          return true;
        }

        const list = node.children || node._children || [];
        for (const child of list) {
          if (toggleInTree(child)) return true;
        }
        return false;
      }

      toggleInTree(cloned);
      computeDescendantCounts(cloned);
      return cloned;
    });
  }, []);

  // Expand All / Collapse All
  const handleExpandAll = useCallback(() => {
    setRootNode((prevRoot) => {
      const cloned = cloneTree(prevRoot);
      function expand(n: HyperNode) {
        if (n._children && n._children.length > 0) {
          n.children = n._children;
          n._children = undefined;
        }
        if (n.children) n.children.forEach(expand);
      }
      expand(cloned);
      computeDescendantCounts(cloned);
      return cloned;
    });
    setTimeout(() => canvasRef.current?.fitView(), 200);
  }, []);

  const handleCollapseAll = useCallback(() => {
    setRootNode((prevRoot) => {
      const cloned = cloneTree(prevRoot);
      function collapse(n: HyperNode) {
        if (n.depth > 0 && n.children && n.children.length > 0) {
          n._children = n.children;
          n.children = undefined;
        }
        const children = n.children || n._children || [];
        children.forEach(collapse);
      }
      collapse(cloned);
      computeDescendantCounts(cloned);
      return cloned;
    });
    setTimeout(() => canvasRef.current?.fitView(), 200);
  }, []);

  // Search Engine with Ancestor Auto-Unfolding
  const handleSearchChange = useCallback((query: string) => {
    if (!query.trim()) {
      setSearchState({
        query: '',
        matchIds: [],
        currentIndex: -1,
        totalMatches: 0
      });
      return;
    }

    const q = query.toLowerCase();
    const matches: string[] = [];
    const ancestorIdsToUnfold = new Set<string>();

    function searchTraverse(node: HyperNode, ancestors: string[]) {
      const nameMatch = node.name.toLowerCase().includes(q);
      const notesMatch = node.notes && node.notes.toLowerCase().includes(q);
      const opMatch = node.operator && node.operator.toLowerCase().includes(q);

      if (nameMatch || notesMatch || opMatch) {
        matches.push(node.id);
        ancestors.forEach((id) => ancestorIdsToUnfold.add(id));
      }

      const allChildren = [...(node.children || []), ...(node._children || [])];
      for (const child of allChildren) {
        searchTraverse(child, [...ancestors, node.id]);
      }
    }

    searchTraverse(rootNode, []);

    if (ancestorIdsToUnfold.size > 0) {
      setRootNode((prev) => {
        const cloned = cloneTree(prev);
        function unfold(n: HyperNode) {
          if (ancestorIdsToUnfold.has(n.id) && n._children && n._children.length > 0) {
            n.children = n._children;
            n._children = undefined;
          }
          if (n.children) n.children.forEach(unfold);
        }
        unfold(cloned);
        computeDescendantCounts(cloned);
        return cloned;
      });
    }

    setSearchState({
      query,
      matchIds: matches,
      currentIndex: matches.length > 0 ? 0 : -1,
      totalMatches: matches.length
    });

    if (matches.length > 0) {
      setTimeout(() => canvasRef.current?.focusNode(matches[0]), 200);
    }
  }, [rootNode]);

  const handleNextMatch = useCallback(() => {
    if (searchState.matchIds.length === 0) return;
    const nextIdx = (searchState.currentIndex + 1) % searchState.matchIds.length;
    setSearchState((prev) => ({ ...prev, currentIndex: nextIdx }));
    canvasRef.current?.focusNode(searchState.matchIds[nextIdx]);
  }, [searchState]);

  const handlePrevMatch = useCallback(() => {
    if (searchState.matchIds.length === 0) return;
    const prevIdx =
      (searchState.currentIndex - 1 + searchState.matchIds.length) % searchState.matchIds.length;
    setSearchState((prev) => ({ ...prev, currentIndex: prevIdx }));
    canvasRef.current?.focusNode(searchState.matchIds[prevIdx]);
  }, [searchState]);

  const handleClearSearch = useCallback(() => {
    setSearchState({
      query: '',
      matchIds: [],
      currentIndex: -1,
      totalMatches: 0
    });
  }, []);

  // Export handlers
  const handleExport = useCallback(async (format: 'svg' | 'png' | 'md' | 'json') => {
    if (format === 'svg') {
      const svgStr = canvasRef.current?.exportSvg();
      if (!svgStr) return;
      const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `hypermarkmap-${Date.now()}.svg`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Exported SVG vector');
    } else if (format === 'png') {
      const dataUrl = await canvasRef.current?.exportPng(2);
      if (!dataUrl) return;
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `hypermarkmap-${Date.now()}.png`;
      a.click();
      showToast('Exported 2x high-resolution PNG');
    } else if (format === 'md') {
      const md = treeToMarkdown(rootNode);
      const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `hypermarkmap-${Date.now()}.md`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Exported CommonMark (.md)');
    } else if (format === 'json') {
      const jsonStr = JSON.stringify(rootNode, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `hypermarkmap-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Exported Hierarchical JSON');
    }
  }, [rootNode, showToast]);

  // Global Keyboard Shortcuts (including Zen Mode Z / Ctrl+B)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName.toLowerCase();
      const isInput = activeTag === 'input' || activeTag === 'textarea';

      // Zen Mode Shortcut: 'z' or 'Z' (when not in input) or Ctrl+B / Cmd+B
      if (((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') || (!isInput && e.key.toLowerCase() === 'z')) {
        e.preventDefault();
        setDisplaySettings((prev) => ({ ...prev, zenMode: !prev.zenMode }));
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
        searchInput?.focus();
        return;
      }

      if (e.key === '/' && !isInput) {
        e.preventDefault();
        const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
        searchInput?.focus();
        return;
      }

      if (e.key === 'Escape') {
        if (isTraditionDrawerOpen) {
          setIsTraditionDrawerOpen(false);
          return;
        }
        if (searchState.query) handleClearSearch();
        setSelectedNode(null);
        if (displaySettings.zenMode) {
          setDisplaySettings((prev) => ({ ...prev, zenMode: false }));
        }
        return;
      }

      if (isInput) return;

      if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        canvasRef.current?.zoomIn();
      } else if (e.key === '-') {
        e.preventDefault();
        canvasRef.current?.zoomOut();
      } else if (e.key === '0') {
        e.preventDefault();
        canvasRef.current?.fitView();
      } else if (e.key.toLowerCase() === 'e') {
        e.preventDefault();
        setIsEditorOpen((prev) => !prev);
      } else if (e.key === 'Tab') {
        e.preventDefault();
        setLayoutMode((prev) => (prev === 'radial' ? 'horizontal' : 'radial'));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchState.query, handleClearSearch, isTraditionDrawerOpen, displaySettings.zenMode]);

  const activeMatchId =
    searchState.currentIndex >= 0 && searchState.currentIndex < searchState.matchIds.length
      ? searchState.matchIds[searchState.currentIndex]
      : null;

  return (
    <div className="relative w-full h-full flex flex-col bg-[#090d16] text-slate-100 overflow-hidden font-sans">
      {/* 1. Ultra-Compact Single-Row Header (Hidden in Zen Mode) */}
      {!displaySettings.zenMode && (
        <HyperMarkmapToolbar
          layoutMode={layoutMode}
          onChangeLayout={setLayoutMode}
          displaySettings={displaySettings}
          onChangeSettings={setDisplaySettings}
          searchState={searchState}
          onSearchChange={handleSearchChange}
          onNextMatch={handleNextMatch}
          onPrevMatch={handlePrevMatch}
          onClearSearch={handleClearSearch}
          onFitView={() => canvasRef.current?.fitView()}
          isEditorOpen={isEditorOpen}
          onToggleEditor={() => setIsEditorOpen(!isEditorOpen)}
          onSelectPreset={handleSelectPreset}
          onOpenImportModal={() => setIsImportModalOpen(true)}
          onExport={handleExport}
          totalNodesCount={rootNode.descendantCount ? rootNode.descendantCount + 1 : 1}
          selectedTraditionIds={selectedTraditionIds}
          onToggleTraditionDrawer={() => setIsTraditionDrawerOpen(!isTraditionDrawerOpen)}
          isTraditionDrawerOpen={isTraditionDrawerOpen}
          activeCorpusName={activeCorpusName}
        />
      )}

      {/* 2. Collapsible Floating Tradition Filter Drawer */}
      <TraditionDrawer
        isOpen={isTraditionDrawerOpen && !displaySettings.zenMode}
        onClose={() => setIsTraditionDrawerOpen(false)}
        selectedTraditionIds={selectedTraditionIds}
        onToggleTradition={handleToggleTradition}
        onSelectAll={() => setSelectedTraditionIds([])}
        onClearAll={() => setSelectedTraditionIds(['__none__'])}
        muteZeroCount={muteZeroCount}
        onToggleMuteZero={() => setMuteZeroCount(!muteZeroCount)}
        traditionCounts={traditionCounts}
      />

      {/* 3. Self-Dismissing Toast Notification */}
      {toastMessage && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-3 py-1.5 bg-slate-900/90 border border-slate-700/80 rounded-full shadow-2xl text-[11px] font-mono text-slate-200 animate-in fade-in slide-in-from-top-2 duration-150">
          <CheckCircle2 size={13} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 4. Zen Mode Floating Chip & Restore Trigger */}
      {displaySettings.zenMode && (
        <div className="absolute top-3 right-4 z-50 flex items-center gap-2 px-2.5 py-1 bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-full shadow-xl text-[10px] font-mono text-slate-400 hover:text-white transition-opacity">
          <span>Zen Mode (Press Z to restore)</span>
          <button
            onClick={() => setDisplaySettings((prev) => ({ ...prev, zenMode: false }))}
            className="p-0.5 hover:text-white text-slate-400"
            title="Exit Zen Mode"
          >
            <Maximize2 size={11} />
          </button>
        </div>
      )}

      {/* 5. Main Canvas Workspace Body */}
      <div className="relative flex-1 flex overflow-hidden">
        {/* Split Markdown Editor Pane */}
        {isEditorOpen && !displaySettings.zenMode && (
          <HyperMarkmapEditor
            markdownText={markdownText}
            onChangeMarkdown={handleMarkdownChange}
            onClose={() => setIsEditorOpen(false)}
            onFileUpload={(file) => {
              const reader = new FileReader();
              reader.onload = (e) => {
                const text = e.target?.result as string;
                if (text) handleCorpusIngested(text, file.name);
              };
              reader.readAsText(file);
            }}
          />
        )}

        {/* Interactive D3 Canvas Visualizer */}
        <div className="relative flex-1 h-full">
          <HyperMarkmapCanvas
            ref={canvasRef}
            rootNode={rootNode}
            layoutMode={layoutMode}
            displaySettings={displaySettings}
            selectedNodeId={selectedNode?.id || null}
            onSelectNode={setSelectedNode}
            onToggleNode={handleToggleNode}
            searchMatchIds={searchState.matchIds}
            activeMatchId={activeMatchId}
            selectedTraditionIds={selectedTraditionIds}
          />

          {/* Consolidated Floating Quick-Action Dock */}
          <HyperMarkmapDock
            layoutMode={layoutMode}
            onToggleLayout={() => setLayoutMode((prev) => (prev === 'radial' ? 'horizontal' : 'radial'))}
            onZoomIn={() => canvasRef.current?.zoomIn()}
            onZoomOut={() => canvasRef.current?.zoomOut()}
            onFitView={() => canvasRef.current?.fitView()}
            onExpandAll={handleExpandAll}
            onCollapseAll={handleCollapseAll}
            isEditorOpen={isEditorOpen}
            onToggleEditor={() => setIsEditorOpen(!isEditorOpen)}
            zenMode={displaySettings.zenMode}
            onToggleZen={() => setDisplaySettings((prev) => ({ ...prev, zenMode: !prev.zenMode }))}
          />

          {/* Off-Canvas Slide-Out Knowledge Node Inspector */}
          <HyperMarkmapInspector
            node={selectedNode}
            onClose={() => setSelectedNode(null)}
            onFocusNode={(id) => canvasRef.current?.focusNode(id)}
            onToggleNode={handleToggleNode}
          />

          {/* Minimap Thumbnail (Hidden in Zen Mode) */}
          {!displaySettings.zenMode && (
            <HyperMarkmapMinimap
              rootNode={rootNode}
              onFitView={() => canvasRef.current?.fitView()}
            />
          )}
        </div>
      </div>

      {/* 6. Ultra-Slim Footer Status Bar (Hidden in Zen Mode) */}
      {!displaySettings.zenMode && (
        <footer className="h-6 min-h-6 px-4 bg-slate-950 border-t border-slate-900 text-slate-500 font-mono text-[10px] flex items-center justify-between select-none">
          <div className="flex items-center gap-3">
            <span>∅ void</span>
            <span>⚖ firewall</span>
            <span>⇄ hyperedge</span>
            <span>🜏 residue</span>
            <span>⟁ apophatic</span>
          </div>
          <div className="hidden md:flex items-center gap-2 text-slate-600">
            <span>Z: Zen</span>
            <span>·</span>
            <span>/: Search</span>
            <span>·</span>
            <span>Esc: Clear</span>
            <span>·</span>
            <span>Tab: Layout</span>
            <span>·</span>
            <span>0: Fit</span>
          </div>
        </footer>
      )}

      {/* 7. Multipart Form-Data Corpus Import Modal */}
      <CorpusImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onCorpusIngested={handleCorpusIngested}
      />
    </div>
  );
};
