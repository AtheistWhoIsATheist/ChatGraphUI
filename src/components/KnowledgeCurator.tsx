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
      crisisMode ? "bg-[#110000] border-[#FF0000]" : "bg-zinc-950"
    )}>
      {/* Decorative Background */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxyZWN0IHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9IiMwMDAiIC8+PGNpcmNsZSBjeD0iNCIgY3k9IjQiIHI9IjEiIGZpbGw9IiMzMzMiIC8+PC9zdmc+')] opacity-20 pointer-events-none z-0"></div>

      {/* Header */}
      <header className={cn(
        "px-6 py-6 flex justify-between items-center border-b relative z-10",
        crisisMode ? "border-[#FF0000] bg-[#FF0000]/10" : "border-white/5 bg-zinc-900/40"
      )}>
        <h1 className="text-3xl font-semibold text-white tracking-widest ">Knowledge Curator</h1>
        <div className="flex items-center gap-6">
          <div className={cn(
            "inline-flex items-center gap-3 px-4 py-2 border text-xs font-semibold  tracking-widest rounded-xl transition duration-300 backdrop-blur-md",
            crisisMode 
              ? "bg-[#FF0000] border-[#FF0000] text-white" 
              : wsConnected 
                ? "bg-[#00FF66] border-[#00FF66] text-zinc-950"
                : "bg-white/5 border-white/20 text-zinc-400"
          )}>
            <div className={cn(
              "w-2 h-2 rounded-none",
              crisisMode ? "bg-[#fff] animate-pulse" : wsConnected ? "bg-zinc-950" : "bg-[#555]"
            )} />
            {crisisMode ? "CRISIS" : wsConnected ? "Connected" : "Disconnected"}
          </div>
          <button className="w-12 h-12 border border-transparent hover:border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-zinc-300 transition-colors rounded-xl transition duration-300 backdrop-blur-md">
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
            className="px-6 py-4 bg-[#FF0000] border-b border-[#000] flex items-center gap-4 text-xs text-zinc-950 font-semibold tracking-widest  relative z-10"
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
          <div className="flex-1 flex flex-col items-center justify-center gap-6 text-zinc-500">
            <div className="text-8xl font-semibold text-[#111]">∅</div>
            <div className="text-sm font-bold tracking-widest  bg-zinc-900/40 border border-[#222] px-4 py-2">Awaiting synthesis...</div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className="flex flex-col gap-4 p-6 bg-zinc-900/40 border border-white/5 rounded-xl transition duration-300 backdrop-blur-md hover:border-white/10 transition-colors group">
            <div className="text-sm leading-relaxed text-zinc-300 font-serif prose prose-invert prose-p:leading-loose">
              {formatSynthesisText(msg.text)}
            </div>
            <div className="flex justify-between items-center text-[10px] text-zinc-400 font-bold border-t-2 border-[#222] pt-4 mt-2">
              <span className=" tracking-widest">{new Date(msg.timestamp).toLocaleTimeString()}</span>
              <span className="bg-white/5 px-2 py-1 border border-white/5 text-zinc-300">θ = {msg.theta.toFixed(2)}</span>
            </div>
          </div>
        ))}

        {isStreaming && (
          <div className="flex flex-col gap-4 p-6 bg-zinc-900/40 border border-white/10 shadow-xl rounded-xl transition duration-300 backdrop-blur-md">
            <div className="text-sm leading-relaxed text-white font-serif prose prose-invert prose-p:leading-loose">
              {formatSynthesisText(synthesis)}
              <span className="inline-block w-3 h-6 ml-2 bg-zinc-800 text-white border-transparent hover:bg-zinc-700 animate-pulse align-middle" />
            </div>
          </div>
        )}

        {crisisMode && (
          <div className="mt-8 flex flex-col gap-4">
            <div className="p-6 bg-[#110000] border-l border-t-2 border-r-2 border-b-2 border-[#FF0000] shadow-xl rounded-xl transition duration-300 backdrop-blur-md">
              <div className="text-sm text-[#FF0000] font-semibold  tracking-widest mb-6 border-b-2 border-[#FF0000] pb-2 inline-block">Crisis Resources Available</div>
              <div className="flex flex-col gap-4">
                <div className="text-sm text-white font-bold tracking-wider"><span className="bg-[#FF0000] text-zinc-950 px-2 py-1 mr-2 rounded-xl transition duration-300 backdrop-blur-md">988</span> (US) | 24/7 Free Confidential Support</div>
                <div className="text-sm text-white font-bold tracking-wider">Text <span className="bg-[#FF0000] text-zinc-950 px-2 py-1 mx-2 rounded-xl transition duration-300 backdrop-blur-md">HOME</span> to <span className="bg-[#FF0000] text-zinc-950 px-2 py-1 ml-2 rounded-xl transition duration-300 backdrop-blur-md">741741</span></div>
                <div className="text-sm text-white font-bold tracking-wider"><span className="bg-[#FF0000] text-zinc-950 px-2 py-1 mr-2 rounded-xl transition duration-300 backdrop-blur-md">911</span> (US) | Immediate Life-Threatening Situations</div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Theta Meter */}
      <div className={cn(
        "px-8 py-6 border-t border-b bg-zinc-900/40 relative z-20",
        crisisMode ? "border-[#FF0000]" : "border-white/5"
      )}>
        <ThetaMeter theta={theta} size="lg" showTrend={true} thetaHistory={thetaHistory} />
      </div>

      {/* Input Area */}
      <div className="p-8 bg-zinc-950 border-t border-white/5 relative z-20">
        <div className="flex gap-6 items-end">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={crisisMode || isStreaming}
            placeholder={crisisMode ? "INPUT DISABLED DURING CRISIS MODE..." : "QUERY JOURNAL OR REN TRANSCRIPTS..."}
            className={cn(
              "flex-1 p-5 bg-zinc-900/40 border font-bold text-sm text-zinc-100 placeholder:text-zinc-500 resize-none min-h-[80px] max-h-[160px] outline-none transition-colors custom-scrollbar tracking-wide  rounded-xl transition duration-300 backdrop-blur-md",
              crisisMode 
                ? "border-[#FF0000] text-[#FF0000] placeholder:text-[#FF0000] opacity-50 cursor-not-allowed" 
                : "border-white/5 hover:border-[#666] focus:border-white/10"
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
              "px-10 py-5 border font-semibold text-sm  tracking-widest whitespace-nowrap h-full min-h-[80px] transition-colors rounded-xl transition duration-300 backdrop-blur-md",
              crisisMode 
                ? "bg-[#110000] border-[#FF0000] text-[#FF0000] opacity-50 cursor-not-allowed shadow-none" 
                : !inputValue.trim() 
                  ? "bg-white/5 border-white/20 text-zinc-500 cursor-not-allowed"
                  : "bg-zinc-800 text-white border-transparent hover:bg-zinc-700 border-white/10 hover:bg-[#fff] hover:border-[#fff] text-zinc-950 shadow-xl hover:shadow-none hover:translate-y-[2px] hover:translate-x-[2px]"
            )}
          >
            {crisisMode ? "CRISIS MODE" : "Transmit"}
          </button>
        </div>
        <div className={cn(
          "text-[10px] mt-4 font-semibold  tracking-widest",
          crisisMode ? "text-[#FF0000]" : "text-zinc-500"
        )}>
          {crisisMode ? "⚠️ Synthesis suppressed. Human oversight required." : wsConnected ? "✓ Connected to Synthesis Engine via WSS" : "Disconnected from Core"}
        </div>
      </div>
    </div>
  );
}
