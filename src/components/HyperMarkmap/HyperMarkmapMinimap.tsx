import React, { useState } from 'react';
import { MapPin, EyeOff } from 'lucide-react';
import { HyperNode } from './types';

interface Props {
  rootNode: HyperNode;
  onFitView: () => void;
}

export const HyperMarkmapMinimap: React.FC<Props> = ({ rootNode, onFitView }) => {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="absolute bottom-10 right-4 z-20 p-1.5 bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-lg text-slate-400 hover:text-white shadow-xl transition-colors"
        title="Open Minimap"
        aria-label="Open minimap"
      >
        <MapPin size={13} className="text-slate-300" />
      </button>
    );
  }

  // Collect top-level points for thumbnail
  const points: { x: number; y: number; depth: number }[] = [];
  const maxTier = 3;

  function traverse(n: HyperNode, angle: number, radius: number, tier: number) {
    if (tier > maxTier) return;
    const x = 70 + radius * Math.cos(angle);
    const y = 50 + radius * Math.sin(angle);
    points.push({ x, y, depth: tier });

    const children = n.children || [];
    if (children.length > 0) {
      const step = (Math.PI * 2) / children.length;
      children.forEach((child, i) => {
        traverse(child, angle + i * step * 0.7, radius + 15, tier + 1);
      });
    }
  }

  traverse(rootNode, 0, 0, 0);

  return (
    <aside
      aria-label="Minimap Navigator"
      className="absolute bottom-10 right-4 z-20 w-36 h-28 bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-lg overflow-hidden shadow-2xl flex flex-col select-none"
    >
      <div className="flex items-center justify-between px-2 py-0.5 bg-slate-950/80 border-b border-slate-800 text-[9px] font-mono text-slate-400">
        <span className="text-slate-300">MINIMAP</span>
        <button
          onClick={() => setIsOpen(false)}
          className="hover:text-white text-slate-500"
          title="Minimize Minimap"
          aria-label="Minimize minimap"
        >
          <EyeOff size={10} />
        </button>
      </div>

      <div
        onClick={onFitView}
        className="flex-1 relative cursor-pointer group"
        title="Click to center and fit map"
      >
        <svg className="w-full h-full" viewBox="0 0 140 100">
          <circle cx="70" cy="50" r="40" fill="none" stroke="rgba(148,163,184,0.08)" strokeWidth="0.8" />
          <circle cx="70" cy="50" r="22" fill="none" stroke="rgba(148,163,184,0.12)" strokeWidth="0.8" />
          {points.map((p, idx) => (
            <circle
              key={idx}
              cx={p.x}
              cy={p.y}
              r={p.depth === 0 ? 2.5 : p.depth === 1 ? 1.6 : 1.1}
              fill={p.depth === 0 ? '#f8fafc' : p.depth === 1 ? '#38bdf8' : '#94a3b8'}
              opacity={0.75}
            />
          ))}
        </svg>

        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-slate-950/60 transition-opacity text-[10px] text-slate-200 font-mono">
          Fit Map
        </div>
      </div>
    </aside>
  );
};
