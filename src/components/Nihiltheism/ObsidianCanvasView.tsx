import React, { useState } from 'react';
import { Plus, ZoomIn, ZoomOut, RotateCcw, FileText } from 'lucide-react';

interface CanvasCard {
  id: string;
  x: number;
  y: number;
  width: number;
  title: string;
  type: 'concept' | 'quote' | 'aporia' | 'system';
  content: string;
  tag: string;
  color: string;
}

export const ObsidianCanvasView: React.FC<{ onOpenNote?: (noteId: string) => void }> = ({ onOpenNote }) => {
  const [zoom, setZoom] = useState(1);
  const [cards, setCards] = useState<CanvasCard[]>([
    {
      id: 'c-1',
      x: 60,
      y: 70,
      width: 280,
      title: 'Nihiltheism (Core Singularity)',
      type: 'concept',
      content: 'The sacredness of non-existence. Not the worship of nothing, but the freedom within it.',
      tag: '#metaphysics',
      color: 'border-violet-500/50 bg-violet-950/20'
    },
    {
      id: 'c-2',
      x: 410,
      y: 40,
      width: 290,
      title: 'Aporia of the Witness',
      type: 'aporia',
      content: 'Who witnesses dissolution? If a witness persists, dissolution was incomplete. If dissolution is complete, who reports?',
      tag: '#aporia',
      color: 'border-amber-500/50 bg-amber-950/20'
    },
    {
      id: 'c-3',
      x: 420,
      y: 280,
      width: 290,
      title: 'Aesthetic of Emptiness',
      type: 'quote',
      content: 'Forms sculpted by omission and silence. What is left unpainted contains the whole sky.',
      tag: '#aesthetics',
      color: 'border-cyan-500/50 bg-cyan-950/20'
    },
    {
      id: 'c-4',
      x: 770,
      y: 160,
      width: 280,
      title: 'Dissolution Axiom',
      type: 'system',
      content: 'All nodes return to the void. Meaning is not discovered; it is sung into the uncaring storm.',
      tag: '#systems',
      color: 'border-purple-500/50 bg-purple-950/20'
    }
  ]);

  const [draggingCardId, setDraggingCardId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    const card = cards.find((c) => c.id === id);
    if (!card) return;
    setDraggingCardId(id);
    setDragOffset({
      x: e.clientX / zoom - card.x,
      y: e.clientY / zoom - card.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingCardId) return;
    setCards((prev) =>
      prev.map((card) => {
        if (card.id === draggingCardId) {
          return {
            ...card,
            x: Math.max(10, e.clientX / zoom - dragOffset.x),
            y: Math.max(10, e.clientY / zoom - dragOffset.y)
          };
        }
        return card;
      })
    );
  };

  const handleMouseUp = () => {
    setDraggingCardId(null);
  };

  const addCard = () => {
    const newCard: CanvasCard = {
      id: `c-${Date.now()}`,
      x: 200 + Math.random() * 150,
      y: 150 + Math.random() * 100,
      width: 270,
      title: 'New Spatial Node',
      type: 'concept',
      content: 'Double click or drag this card across the canvas to connect concepts.',
      tag: '#reflection',
      color: 'border-violet-400/40 bg-white/[0.03]'
    };
    setCards((prev) => [...prev, newCard]);
  };

  return (
    <div
      className="relative w-full h-full overflow-hidden bg-[#070510]/80 select-none flex flex-col"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Canvas Top Controls Toolbar */}
      <div className="absolute top-4 left-6 z-20 flex items-center gap-2 bg-[#120d24]/90 backdrop-blur-md p-1.5 rounded-xl border border-white/10 shadow-xl">
        <span className="text-xs font-mono px-2 text-white/50 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          Spatial Canvas
        </span>
        <div className="h-4 w-[1px] bg-white/10" />
        <button
          onClick={addCard}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-violet-600/30 hover:bg-violet-600/50 text-white border border-violet-500/40 transition-colors"
        >
          <Plus size={12} /> Add Card
        </button>
        <button
          onClick={() => setZoom((z) => Math.min(1.5, z + 0.1))}
          className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          title="Zoom In"
        >
          <ZoomIn size={13} />
        </button>
        <span className="text-[10px] font-mono text-white/40">{Math.round(zoom * 100)}%</span>
        <button
          onClick={() => setZoom((z) => Math.max(0.6, z - 0.1))}
          className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          title="Zoom Out"
        >
          <ZoomOut size={13} />
        </button>
        <button
          onClick={() => setZoom(1)}
          className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          title="Reset Zoom"
        >
          <RotateCcw size={13} />
        </button>
      </div>

      {/* Grid Canvas Board */}
      <div
        className="flex-1 w-full h-full relative cursor-grab active:cursor-grabbing overflow-auto"
        style={{
          backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px)`,
          backgroundSize: `${24 * zoom}px ${24 * zoom}px`,
          transform: `scale(${zoom})`,
          transformOrigin: '0 0'
        }}
      >
        {/* SVG Connection Filaments */}
        <svg className="absolute inset-0 w-[2000px] h-[2000px] pointer-events-none z-0">
          <defs>
            <linearGradient id="canvasGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#00F0FF" stopOpacity="0.3" />
            </linearGradient>
          </defs>
          {/* Connecting c-1 to c-2 */}
          <path
            d={`M ${cards[0]?.x + cards[0]?.width} ${cards[0]?.y + 60} C ${cards[0]?.x + cards[0]?.width + 60} ${cards[0]?.y + 60}, ${cards[1]?.x - 60} ${cards[1]?.y + 60}, ${cards[1]?.x} ${cards[1]?.y + 60}`}
            fill="none"
            stroke="url(#canvasGrad)"
            strokeWidth="1.8"
            strokeDasharray="4 3"
          />
          {/* Connecting c-1 to c-3 */}
          <path
            d={`M ${cards[0]?.x + cards[0]?.width} ${cards[0]?.y + 80} C ${cards[0]?.x + cards[0]?.width + 60} ${cards[0]?.y + 80}, ${cards[2]?.x - 60} ${cards[2]?.y + 60}, ${cards[2]?.x} ${cards[2]?.y + 60}`}
            fill="none"
            stroke="rgba(168, 85, 247, 0.4)"
            strokeWidth="1.8"
          />
          {/* Connecting c-2 to c-4 */}
          <path
            d={`M ${cards[1]?.x + cards[1]?.width} ${cards[1]?.y + 60} C ${cards[1]?.x + cards[1]?.width + 60} ${cards[1]?.y + 60}, ${cards[3]?.x - 60} ${cards[3]?.y + 60}, ${cards[3]?.x} ${cards[3]?.y + 60}`}
            fill="none"
            stroke="rgba(0, 240, 255, 0.3)"
            strokeWidth="1.8"
            strokeDasharray="5 3"
          />
        </svg>

        {/* Floating Concept Cards */}
        {cards.map((card) => (
          <div
            key={card.id}
            onMouseDown={(e) => handleMouseDown(e, card.id)}
            style={{
              left: `${card.x}px`,
              top: `${card.y}px`,
              width: `${card.width}px`
            }}
            className={`absolute z-10 obsidian-card rounded-2xl p-4 cursor-move border transition-shadow shadow-2xl hover:shadow-[0_0_25px_rgba(139,92,246,0.25)] ${card.color}`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-white/70">
                {card.tag}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenNote?.('nihiltheism');
                }}
                title="Inspect in Note View"
                className="p-1 rounded text-white/40 hover:text-white hover:bg-white/10 transition-colors"
              >
                <FileText size={11} />
              </button>
            </div>
            <h4 className="text-sm font-semibold text-white tracking-wide mb-1 font-serif">
              {card.title}
            </h4>
            <p className="text-xs text-white/70 leading-relaxed font-sans">
              {card.content}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
