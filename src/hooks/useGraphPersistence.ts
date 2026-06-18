import { useEffect } from 'react';
import { useAppStore } from '../store/appStore';

/**
 * Hook to automatically persist and restore the state of graph nodes and links.
 * Grounds data persistence across page reloads.
 */
export function useGraphPersistence() {
  const { nodes, links, setNodes, setLinks } = useAppStore();

  // 1. Initial hydration: restore state from localStorage on load if present
  useEffect(() => {
    try {
      const savedNodes = localStorage.getItem('journal314_nodes_v2');
      const savedLinks = localStorage.getItem('journal314_links_v2');

      if (savedNodes) {
        const parsedNodes = JSON.parse(savedNodes);
        if (Array.isArray(parsedNodes) && parsedNodes.length > 0) {
          setNodes(parsedNodes);
          console.log(`[Persistence] Hydrated ${parsedNodes.length} nodes from localStorage.`);
        }
      }

      if (savedLinks) {
        const parsedLinks = JSON.parse(savedLinks);
        if (Array.isArray(parsedLinks) && parsedLinks.length > 0) {
          setLinks(parsedLinks);
          console.log(`[Persistence] Hydrated ${parsedLinks.length} links from localStorage.`);
        }
      }
    } catch (error) {
      console.error('[Persistence] Error loading state from localStorage:', error);
    }
  }, [setNodes, setLinks]);

  // 2. State synchronization: watch nodes and links and save to localStorage on updates
  useEffect(() => {
    try {
      if (nodes && nodes.length > 0) {
        localStorage.setItem('journal314_nodes_v2', JSON.stringify(nodes));
      }
      if (links && links.length > 0) {
        localStorage.setItem('journal314_links_v2', JSON.stringify(links));
      }
    } catch (error) {
      console.error('[Persistence] Error saving state to localStorage:', error);
    }
  }, [nodes, links]);
}
