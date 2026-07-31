import React, { useState, useEffect } from 'react';
import { Bookmark, Plus, Trash2, X } from 'lucide-react';
import { FilterState } from './FilterSidebar';

export interface SavedViewConfig {
  id: string;
  name: string;
  timestamp: number;
  lens: 'source_clusters' | 'concept_hubs' | 'thinker_network' | 'audit_mode' | 'path_mode';
  filters: FilterState;
  pinnedNodeIds: string[];
}

interface SavedViewsMenuProps {
  isOpen: boolean;
  onClose: () => void;
  currentLens: 'source_clusters' | 'concept_hubs' | 'thinker_network' | 'audit_mode' | 'path_mode';
  currentFilters: FilterState;
  pinnedNodeIds: string[];
  onLoadView: (view: SavedViewConfig) => void;
}

export const SavedViewsMenu: React.FC<SavedViewsMenuProps> = ({
  isOpen,
  onClose,
  currentLens,
  currentFilters,
  pinnedNodeIds,
  onLoadView
}) => {
  const [savedViews, setSavedViews] = useState<SavedViewConfig[]>([]);
  const [newViewName, setNewViewName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Load saved views from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('nes2_saved_graph_views');
      if (stored) {
        setSavedViews(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load saved views:', e);
    }
  }, []);

  const handleSaveCurrentView = () => {
    if (!newViewName.trim()) return;
    const newView: SavedViewConfig = {
      id: `VIEW-${Date.now()}`,
      name: newViewName.trim(),
      timestamp: Date.now(),
      lens: currentLens,
      filters: currentFilters,
      pinnedNodeIds
    };
    const updated = [newView, ...savedViews];
    setSavedViews(updated);
    localStorage.setItem('nes2_saved_graph_views', JSON.stringify(updated));
    setNewViewName('');
    setIsCreating(false);
  };

  const handleDeleteView = (id: string) => {
    const updated = savedViews.filter(v => v.id !== id);
    setSavedViews(updated);
    localStorage.setItem('nes2_saved_graph_views', JSON.stringify(updated));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-md bg-neutral-950 border border-neutral-900 rounded-2xl shadow-2xl overflow-hidden font-mono text-xs">
        
        {/* Header */}
        <div className="p-4 border-b border-neutral-900 bg-neutral-900/60 flex items-center justify-between">
          <div className="flex items-center gap-2 text-cyan-400 font-bold">
            <Bookmark className="w-4 h-4" />
            <h3 className="font-display text-sm uppercase tracking-wider text-neutral-100">
              Saved Views & Presets
            </h3>
          </div>
          <button onClick={onClose} className="text-neutral-500 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          
          {/* Create New View */}
          {!isCreating ? (
            <button
              onClick={() => setIsCreating(true)}
              className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-cyan-500/50 text-cyan-400 font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Save Current Lens & Filter State</span>
            </button>
          ) : (
            <div className="bg-neutral-900 p-3 rounded-xl border border-neutral-800 space-y-2">
              <label className="text-[10px] text-neutral-400 uppercase font-bold">View Name</label>
              <input
                type="text"
                placeholder="e.g. Audit Mode - 102 Duplicates"
                value={newViewName}
                onChange={(e) => setNewViewName(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-cyan-500"
              />
              <div className="flex justify-end gap-2 pt-1">
                <button
                  onClick={() => setIsCreating(false)}
                  className="px-3 py-1 rounded bg-neutral-800 text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveCurrentView}
                  className="px-3 py-1 rounded bg-cyan-500 text-black font-bold hover:bg-cyan-400"
                >
                  Save View
                </button>
              </div>
            </div>
          )}

          {/* Saved Views List */}
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            <h4 className="text-[10px] uppercase text-neutral-500 font-bold">User Saved Views</h4>
            
            {savedViews.length === 0 ? (
              <div className="text-center py-6 text-neutral-600 text-xs">
                No custom saved views yet. Save your current lens, zoom, and filters above.
              </div>
            ) : (
              savedViews.map(view => (
                <div
                  key={view.id}
                  className="p-3 bg-neutral-900/60 border border-neutral-850 rounded-xl flex items-center justify-between hover:border-neutral-700 transition-all"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="font-bold text-neutral-200 text-xs">{view.name}</span>
                    <span className="text-[10px] text-neutral-500">
                      Lens: <strong className="text-cyan-400">{view.lens}</strong> • Saved {new Date(view.timestamp).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        onLoadView(view);
                        onClose();
                      }}
                      className="px-2.5 py-1 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-900 text-[10px] font-bold"
                    >
                      Apply
                    </button>
                    <button
                      onClick={() => handleDeleteView(view.id)}
                      className="p-1 rounded text-neutral-500 hover:text-red-400 hover:bg-neutral-800"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-3 border-t border-neutral-900 bg-neutral-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-neutral-900 text-neutral-300 hover:bg-neutral-850"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
