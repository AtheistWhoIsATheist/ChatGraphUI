import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Mic, Paperclip, Send, Square } from 'lucide-react';
import { BoundaryState } from '../../../types/ang';

interface ChatMessage {
  id: string;
  role: 'RESEARCHER' | 'CURATOR';
  content: string;
  timestamp: string;
  metadata?: {
    depthLevel?: number;
    triggers?: string[];
  };
}

interface ChatViewProps {
  messages: ChatMessage[];
  onSendMessage: (content: string) => void;
  boundaryState: BoundaryState;
  sessionTime: string;
  nodesCreated: number;
}

export const ChatView: React.FC<ChatViewProps> = ({ 
  messages, 
  onSendMessage,
  boundaryState,
  sessionTime,
  nodesCreated
}) => {
  const [input, setInput] = useState('');
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (input.trim()) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  return (
    <div className="w-full h-full flex flex-col relative overflow-hidden bg-[#0D0D0D]">
      {/* Chat History Surface */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 flex flex-col gap-6">
        {messages.map((msg) => (
          <motion.div 
            key={msg.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.0, 0.0, 0.2, 1.0] }}
            className={`w-full flex ${msg.role === 'RESEARCHER' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'RESEARCHER' ? (
              <div className="max-w-[70%] bg-[#1E1E1E] text-[#C8C0B0] px-4 py-3 rounded-2xl rounded-tr-sm text-sm whitespace-pre-wrap shadow-sm">
                {msg.content}
              </div>
            ) : (
              <div className="w-full max-w-4xl bg-[#161616] border border-[#2A2A2A] rounded-2xl rounded-tl-sm overflow-hidden flex flex-col shadow-lg">
                {msg.metadata && (
                  <div className="bg-[#1E1E1E] border-b border-[#2A2A2A] px-4 py-1.5 flex items-center justify-between text-[10px] text-[#5A5450] uppercase tracking-widest font-mono select-none">
                    <span>Deep Analysis</span>
                    <span>Depth: {msg.metadata.depthLevel} | Triggers: {msg.metadata.triggers?.join(', ') || 'None'}</span>
                  </div>
                )}
                <div className="p-6 text-[#B8B0A0] text-sm leading-[1.7] whitespace-pre-wrap markdown-body">
                  {msg.content}
                </div>
                <div className="bg-[#121212] px-4 py-2 border-t border-[#1E1E1E] flex items-center justify-end gap-3 text-[10px] opacity-0 hover:opacity-100 transition-opacity focus-within:opacity-100">
                  <button className="text-[#8A8278] hover:text-[#3A6A3A] transition-colors uppercase tracking-widest font-bold">Save to Graph</button>
                  <button className="text-[#8A8278] hover:text-[#6A6A2A] transition-colors uppercase tracking-widest font-bold">Add to Questions</button>
                </div>
              </div>
            )}
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Surface */}
      <div className="w-full shrink-0 bg-[#0D0D0D] p-4 relative z-20">
        <div className="max-w-4xl mx-auto flex flex-col gap-2">
          
          {/* Main Input Area */}
          <div className="relative bg-[#121212] border border-[#2A2A2A] rounded-2xl p-2 flex items-end gap-2 focus-within:border-[#3A6A3A] transition-colors">
            
            {/* Voice Toggle */}
            <button 
              onClick={() => setIsVoiceActive(!isVoiceActive)}
              className={`p-2 rounded-xl transition-colors shrink-0 ${isVoiceActive ? 'text-[#3A6A3A] bg-[#3A6A3A]/10' : 'text-[#5A5450] hover:text-[#C8C0B0] hover:bg-[#1E1E1E]'}`}
              title="Voice Input (Ctrl+Shift+V)"
            >
              {isVoiceActive ? <Square className="w-5 h-5 fill-current" /> : <Mic className="w-5 h-5" />}
            </button>

            {/* Attach */}
            <button className="p-2 rounded-xl text-[#5A5450] hover:text-[#C8C0B0] hover:bg-[#1E1E1E] transition-colors shrink-0" title="Attach Document (Ctrl+5)">
              <Paperclip className="w-5 h-5" />
            </button>

            {isVoiceActive ? (
              <div className="flex-1 h-[44px] flex items-center px-4 gap-1 relative overflow-hidden">
                <span className="absolute left-4 top-1 text-[10px] text-[#5A5450] uppercase tracking-widest font-bold">Listening...</span>
                {Array.from({ length: 40 }).map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ height: Math.random() * 24 + 4 }}
                    transition={{ repeat: Infinity, duration: 0.15, repeatType: 'reverse' }}
                    className="flex-1 bg-[#3A6A3A] rounded-full min-w-[2px]"
                  />
                ))}
              </div>
            ) : (
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Ask Curator..."
                className="flex-1 bg-transparent border-none focus:ring-0 resize-none max-h-[144px] text-sm text-[#C8C0B0] py-2.5 px-2 placeholder:text-[#5A5450] scrollbar-thin"
                rows={1}
                style={{ minHeight: '44px' }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = `${Math.min(target.scrollHeight, 144)}px`;
                }}
              />
            )}

            <button 
              onClick={handleSend}
              disabled={!input.trim() && !isVoiceActive}
              className="p-2 bg-[#1A2A1A] text-[#3A6A3A] rounded-xl hover:bg-[#2A4A2A] hover:text-white transition-colors shrink-0 disabled:opacity-50 disabled:cursor-not-allowed border border-[#2A3A2A]"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          {/* Session Status Bar */}
          <div className="flex items-center justify-between px-2 text-[10px] font-mono text-[#5A5450] uppercase tracking-widest">
            <div className="flex gap-4">
              <span>Session: {sessionTime}</span>
              <span>Nodes Created: {nodesCreated}</span>
            </div>
            <div className="flex items-center gap-1 group cursor-help">
              <span>θ: {boundaryState.theta.toFixed(2)}</span>
              <span className="text-[#8A8278]">{boundaryState.mode}</span>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};
