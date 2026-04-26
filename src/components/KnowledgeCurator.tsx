import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Settings, AlertTriangle } from 'lucide-react';
import { useSynthesisStore } from '../store/synthesisStore';
import { ThetaMeter } from './ThetaMeter';
import { formatSynthesisText } from '../utils/formatSynthesisText';
import { useWebSocket } from '../hooks/useWebSocket';
import { cn } from '../lib/utils';

export function KnowledgeCurator() {
  const {
    synthesis,
    theta,
    thetaHistory,
    messages,
    inputValue,
    isStreaming,
    crisisMode,
    wsConnected,
    setInputValue,
  } = useSynthesisStore();

  const { sendMessage } = useWebSocket();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, synthesis]);

  const handleSend = () => {
    if (!inputValue.trim() || isStreaming || crisisMode) return;
    sendMessage(inputValue);
    setInputValue('');
  };

  return (
    <div className={cn(
      "w-full h-full flex flex-col font-mono relative",
      crisisMode ? "bg-[#110000] border-[#FF0000]" : "bg-[#000]"
    )}>
      {/* Decorative Background */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxyZWN0IHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9IiMwMDAiIC8+PGNpcmNsZSBjeD0iNCIgY3k9IjQiIHI9IjEiIGZpbGw9IiMzMzMiIC8+PC9zdmc+')] opacity-20 pointer-events-none z-0"></div>

      {/* Header */}
      <header className={cn(
        "px-6 py-6 flex justify-between items-center border-b-4 relative z-10",
        crisisMode ? "border-[#FF0000] bg-[#FF0000]/10" : "border-[#333] bg-[#050505]"
      )}>
        <h1 className="text-3xl font-black text-[#fff] tracking-widest uppercase">Knowledge Curator</h1>
        <div className="flex items-center gap-6">
          <div className={cn(
            "inline-flex items-center gap-3 px-4 py-2 border-2 text-xs font-black uppercase tracking-widest neo-flat",
            crisisMode 
              ? "bg-[#FF0000] border-[#FF0000] text-[#fff]" 
              : wsConnected 
                ? "bg-[#00FF66] border-[#00FF66] text-[#000]"
                : "bg-[#111] border-[#555] text-[#888]"
          )}>
            <div className={cn(
              "w-2 h-2 rounded-none",
              crisisMode ? "bg-[#fff] animate-pulse" : wsConnected ? "bg-[#000]" : "bg-[#555]"
            )} />
            {crisisMode ? "CRISIS" : wsConnected ? "Connected" : "Disconnected"}
          </div>
          <button className="w-12 h-12 border-2 border-transparent hover:border-[#00E5FF] bg-[#111] hover:bg-[#00E5FF]/10 flex items-center justify-center text-[#888] hover:text-[#00E5FF] transition-colors neo-flat">
            <Settings className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Crisis Banner */}
      <AnimatePresence>
        {crisisMode && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-6 py-4 bg-[#FF0000] border-b-4 border-[#000] flex items-center gap-4 text-xs text-[#000] font-black tracking-widest uppercase relative z-10"
          >
            <AlertTriangle className="w-6 h-6" />
            <span>CRISIS MODE ACTIVE: Synthesis safety threshold exceeded. Awaiting resolution.</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages Panel */}
      <div className={cn(
        "flex-1 overflow-y-auto p-8 flex flex-col gap-8 custom-scrollbar relative z-10",
        crisisMode ? "bg-[#110000]" : "bg-transparent"
      )}>
        {messages.length === 0 && !isStreaming && !crisisMode && (
          <div className="flex-1 flex flex-col items-center justify-center gap-6 text-[#555]">
            <div className="text-8xl font-black text-[#111]">∅</div>
            <div className="text-sm font-bold tracking-[0.3em] uppercase bg-[#050505] border border-[#222] px-4 py-2">Awaiting synthesis...</div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className="flex flex-col gap-4 p-6 bg-[#050505] border-2 border-[#333] neo-flat hover:border-[#00E5FF] transition-colors group">
            <div className="text-sm leading-relaxed text-[#ccc] font-serif prose prose-invert prose-p:leading-loose">
              {formatSynthesisText(msg.text)}
            </div>
            <div className="flex justify-between items-center text-[10px] text-[#888] font-bold border-t-2 border-[#222] pt-4 mt-2">
              <span className="uppercase tracking-widest">{new Date(msg.timestamp).toLocaleTimeString()}</span>
              <span className="bg-[#111] px-2 py-1 border border-[#333] text-[#00E5FF]">θ = {msg.theta.toFixed(2)}</span>
            </div>
          </div>
        ))}

        {isStreaming && (
          <div className="flex flex-col gap-4 p-6 bg-[#050505] border-2 border-[#00E5FF] shadow-[4px_4px_0_rgba(0,229,255,0.3)] neo-flat">
            <div className="text-sm leading-relaxed text-[#fff] font-serif prose prose-invert prose-p:leading-loose">
              {formatSynthesisText(synthesis)}
              <span className="inline-block w-3 h-6 ml-2 bg-[#00E5FF] animate-pulse align-middle" />
            </div>
          </div>
        )}

        {crisisMode && (
          <div className="mt-8 flex flex-col gap-4">
            <div className="p-6 bg-[#110000] border-l-4 border-t-2 border-r-2 border-b-2 border-[#FF0000] shadow-[8px_8px_0_rgba(255,0,0,0.4)] neo-flat">
              <div className="text-sm text-[#FF0000] font-black uppercase tracking-widest mb-6 border-b-2 border-[#FF0000] pb-2 inline-block">Crisis Resources Available</div>
              <div className="flex flex-col gap-4">
                <div className="text-sm text-[#fff] font-bold tracking-wider"><span className="bg-[#FF0000] text-[#000] px-2 py-1 mr-2 neo-flat">988</span> (US) | 24/7 Free Confidential Support</div>
                <div className="text-sm text-[#fff] font-bold tracking-wider">Text <span className="bg-[#FF0000] text-[#000] px-2 py-1 mx-2 neo-flat">HOME</span> to <span className="bg-[#FF0000] text-[#000] px-2 py-1 ml-2 neo-flat">741741</span></div>
                <div className="text-sm text-[#fff] font-bold tracking-wider"><span className="bg-[#FF0000] text-[#000] px-2 py-1 mr-2 neo-flat">911</span> (US) | Immediate Life-Threatening Situations</div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Theta Meter */}
      <div className={cn(
        "px-8 py-6 border-t-4 border-b-4 bg-[#050505] relative z-20",
        crisisMode ? "border-[#FF0000]" : "border-[#333]"
      )}>
        <ThetaMeter theta={theta} size="lg" showTrend={true} thetaHistory={thetaHistory} />
      </div>

      {/* Input Area */}
      <div className="p-8 bg-[#000] border-t-4 border-[#333] relative z-20">
        <div className="flex gap-6 items-end">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={crisisMode || isStreaming}
            placeholder={crisisMode ? "INPUT DISABLED DURING CRISIS MODE..." : "ASK ABOUT THE VOID, PARADOX, OR APOPHATIC THEOLOGY..."}
            className={cn(
              "flex-1 p-5 bg-[#050505] border-2 font-bold text-sm text-[#eee] placeholder:text-[#555] resize-none min-h-[80px] max-h-[160px] outline-none transition-colors custom-scrollbar tracking-wide uppercase neo-flat",
              crisisMode 
                ? "border-[#FF0000] text-[#FF0000] placeholder:text-[#FF0000] opacity-50 cursor-not-allowed" 
                : "border-[#333] hover:border-[#666] focus:border-[#00E5FF]"
            )}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <button
            onClick={handleSend}
            disabled={crisisMode || isStreaming || !inputValue.trim()}
            className={cn(
              "px-10 py-5 border-2 font-black text-sm uppercase tracking-widest whitespace-nowrap h-full min-h-[80px] transition-colors neo-flat",
              crisisMode 
                ? "bg-[#110000] border-[#FF0000] text-[#FF0000] opacity-50 cursor-not-allowed shadow-none" 
                : !inputValue.trim() 
                  ? "bg-[#111] border-[#555] text-[#555] cursor-not-allowed"
                  : "bg-[#00E5FF] border-[#00E5FF] hover:bg-[#fff] hover:border-[#fff] text-[#000] shadow-[6px_6px_0_rgba(0,229,255,0.3)] hover:shadow-none hover:translate-y-[2px] hover:translate-x-[2px]"
            )}
          >
            {crisisMode ? "CRISIS MODE" : "Transmit"}
          </button>
        </div>
        <div className={cn(
          "text-[10px] mt-4 font-black uppercase tracking-widest",
          crisisMode ? "text-[#FF0000]" : "text-[#555]"
        )}>
          {crisisMode ? "⚠️ Synthesis suppressed. Human oversight required." : wsConnected ? "✓ Connected to Synthesis Engine via WSS" : "Disconnected from Core"}
        </div>
      </div>
    </div>
  );
}
