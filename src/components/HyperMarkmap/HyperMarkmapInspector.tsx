import React, { useState } from 'react';
import {
  Maximize,
  Copy,
  Check,
  X,
  GitBranch,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { HyperNode, PHILOSOPHICAL_OPERATORS, CANONICAL_TRADITIONS } from './types';

interface Props {
  node: HyperNode | null;
  onClose: () => void;
  onFocusNode: (nodeId: string) => void;
  onToggleNode: (nodeId: string) => void;
}

export const HyperMarkmapInspector: React.FC<Props> = ({
  node,
  onClose,
  onFocusNode,
  onToggleNode
}) => {
  const [copied, setCopied] = useState(false);

  if (!node) return null;

  const childCount = (node.children?.length || 0) + (node._children?.length || 0);
  const descendantCount = node.descendantCount || childCount;

  const handleCopy = () => {
    let text = `${'#'.repeat(Math.max(1, node.depth))} ${node.name}\n`;
    if (node.notes) text += `> ${node.notes}\n`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const detectedLanes = CANONICAL_TRADITIONS.filter((t) =>
    node.traditions?.includes(t.id)
  );

  const operatorInfo = node.operator ? PHILOSOPHICAL_OPERATORS[node.operator] : null;

  return (
    <aside
      aria-label="Knowledge Node Inspector"
      className="fixed right-0 top-10 bottom-6 z-40 w-88 max-w-sm bg-slate-900/95 backdrop-blur-md border-l border-slate-800 shadow-2xl p-4 text-slate-200 text-xs font-sans flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200 select-none"
    >
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0">
              <GitBranch size={14} className="text-slate-300" />
            </div>
            <div>
              <div className="font-mono text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                Node Inspector
              </div>
              <h3 className="font-bold text-white text-sm leading-tight break-words">
                {node.name}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 hover:text-white text-slate-400 hover:bg-slate-800 rounded transition-colors"
            title="Close inspector (Esc)"
          >
            <X size={14} />
          </button>
        </div>

        {/* Position Metrics */}
        <div className="grid grid-cols-3 gap-2 mb-3 font-mono text-[11px]">
          <div className="bg-slate-950/70 border border-slate-800/80 p-2 rounded flex flex-col">
            <span className="text-slate-500 text-[10px]">Tier</span>
            <span className="text-slate-200 font-bold">Depth {node.depth}</span>
          </div>
          <div className="bg-slate-950/70 border border-slate-800/80 p-2 rounded flex flex-col">
            <span className="text-slate-500 text-[10px]">Branches</span>
            <span className="text-slate-200 font-bold">{childCount}</span>
          </div>
          <div className="bg-slate-950/70 border border-slate-800/80 p-2 rounded flex flex-col">
            <span className="text-slate-500 text-[10px]">Subtree</span>
            <span className="text-slate-200 font-bold">{descendantCount}</span>
          </div>
        </div>

        {/* Philosophical Operator Badge */}
        {node.operator && (
          <div className="mb-3 p-2 bg-slate-950/80 border border-slate-800 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-base text-slate-200">
                {node.operator}
              </span>
              <div className="flex flex-col">
                <span className="font-mono text-[11px] font-semibold text-slate-200 uppercase">
                  {operatorInfo?.label || 'Operator'}
                </span>
                <span className="text-[10px] text-slate-400 leading-tight">
                  {operatorInfo?.description || 'Dialectical operator marker'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tradition Lanes Badges */}
        {detectedLanes.length > 0 && (
          <div className="mb-3">
            <div className="text-[10px] uppercase font-mono text-slate-500 mb-1.5 font-semibold">
              Detected Tradition Lanes
            </div>
            <div className="flex flex-wrap gap-1.5">
              {detectedLanes.map((lane) => (
                <span
                  key={lane.id}
                  className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono bg-slate-950 border border-slate-800 text-slate-300"
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: lane.color }}
                  />
                  <span>{lane.label}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Corpus Notes / Excerpt Block */}
        {node.notes ? (
          <div className="mb-4">
            <div className="flex items-center justify-between text-[10px] uppercase font-mono text-slate-500 mb-1.5 font-semibold">
              <span>Corpus Excerpt</span>
              <button
                onClick={handleCopy}
                className="hover:text-slate-300 transition-colors flex items-center gap-1"
                title="Copy excerpt"
              >
                {copied ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <div className="p-2.5 bg-slate-950 border-l-2 border-slate-700 rounded-r text-[11px] text-slate-300 italic font-serif max-h-40 overflow-y-auto leading-relaxed whitespace-pre-wrap">
              "{node.notes}"
            </div>
          </div>
        ) : (
          <div className="mb-4 p-2.5 bg-slate-950/40 border border-slate-900 rounded text-[11px] text-slate-500 italic font-mono">
            No attached excerpt or blockquote notes for this node.
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="pt-3 border-t border-slate-800 flex items-center gap-2 font-mono text-[11px]">
        <button
          onClick={() => onFocusNode(node.id)}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-slate-200 hover:text-white transition-colors"
        >
          <Maximize size={12} />
          <span>Focus Node</span>
        </button>

        {childCount > 0 && (
          <button
            onClick={() => onToggleNode(node.id)}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-slate-200 hover:text-white transition-colors"
          >
            {node._children && node._children.length > 0 ? (
              <>
                <ChevronDown size={12} />
                <span>Expand ({node._children.length})</span>
              </>
            ) : (
              <>
                <ChevronUp size={12} />
                <span>Collapse</span>
              </>
            )}
          </button>
        )}
      </div>
    </aside>
  );
};
