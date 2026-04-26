/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */


import { useState, useRef, useEffect } from 'react';
import Markdown from 'react-markdown';
import { Send, Loader2, ChevronRight, Search, Pin, Download, Settings, AlertTriangle } from 'lucide-react';
import { Node } from '../data/corpus';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { streamChatResponse } from '../services/geminiService';
import { KnowledgeDocument } from '../types';
import { blocksToString } from '../utils/voidUtils';

interface Message {
  role: 'user' | 'model' | 'system';
  text: string;
}

interface ChatbotProps {
  nodes: Node[];
  onCollapse: () => void;
}

export function Chatbot({ nodes, onCollapse }: ChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'I am the Synthesis Engine for Journal314 and REN analysis. I am now ready to process specific files or prompts under this architecture. Enter your query.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const chatSessionRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setIsLoading(true);
    setError(null);

    try {
      const history = messages.map(m => ({
        role: m.role === 'model' ? 'model' : 'user',
        parts: [{ text: m.text }]
      }));
      

      const knowledgeDocs = nodes.map(n => ({
        id: n.id,
        title: n.label,
        content: blocksToString(n.blocks) || n.label,
        uploadDate: n.metadata?.date_added ? new Date(n.metadata.date_added).getTime() : 0,
        tags: n.metadata?.tags || [],
        embedding: n.metadata?.embedding
      }));

      setMessages(prev => [...prev, { role: 'model', text: '' }]);
      
      await streamChatResponse(
        history,
        userText,
        true,
        knowledgeDocs,
        (chunk) => {
          setMessages(prev => {
            const newMessages = [...prev];
            const lastIndex = newMessages.length - 1;
            newMessages[lastIndex] = {
              ...newMessages[lastIndex],
              text: newMessages[lastIndex].text + chunk
            };
            return newMessages;
          });
        }
      );
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMsg = `[SYSTEM ERROR]: ${err.message || 'Connection severed.'}`;
      setError(errorMsg);
      setMessages(prev => [...prev, { role: 'model', text: errorMsg }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#000] border-l-4 border-[#333] font-mono relative">
      {/* Collapse Toggle */}
      <motion.button 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onCollapse}
        className="absolute -left-5 top-8 w-10 h-10 bg-[#FF3A00] border-2 border-[#000] flex items-center justify-center text-[#000] transition-colors z-40 shadow-[4px_4px_0_rgba(255,58,0,0.4)]"
      >
        <ChevronRight className="w-5 h-5" strokeWidth={3} />
      </motion.button>

      {/* Header */}
      <div className="px-6 py-4 border-b-4 border-[#333] bg-[#050505] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ChevronRight className="w-6 h-6 text-[#00E5FF]" strokeWidth={4} />
          <div>
            <h2 className="text-sm font-black text-[#eee] tracking-widest uppercase">REN Synthesis Engine</h2>
            <p className="text-[10px] text-[#00E5FF] uppercase tracking-widest mt-0.5">Synthesis Engine</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-[#888]">
          <Search className="w-5 h-5 hover:text-[#00E5FF] cursor-pointer transition-colors" />
          <Pin className="w-5 h-5 hover:text-[#00E5FF] cursor-pointer transition-colors" />
          <Download className="w-5 h-5 hover:text-[#00E5FF] cursor-pointer transition-colors" />
          <Settings className="w-5 h-5 hover:text-[#FF3A00] cursor-pointer transition-colors" />
        </div>
      </div>

      {/* Error Banner */}
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-[#FF0000] border-b-4 border-[#8B0000] px-6 py-4 flex items-center gap-3"
          >
            <AlertTriangle className="w-5 h-5 text-[#fff]" />
            <span className="text-[11px] text-[#fff] font-bold uppercase tracking-widest">{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-[#050505] relative">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none"></div>
        {messages.map((msg, i) => (
          <div key={i} className={cn("flex w-full relative z-10", msg.role === 'user' ? "justify-end" : "justify-start")}>
            <div className={cn(
              "max-w-[90%] p-5 text-sm leading-relaxed border-2 relative",
              msg.role === 'user' 
                ? "bg-[#FF3A00] border-[#FF3A00] text-[#000] shadow-[6px_6px_0px_rgba(255,58,0,0.3)]" 
                : "bg-[#111] border-[#333] text-[#ccc] shadow-[6px_6px_0px_rgba(0,229,255,0.2)]"
            )}>
              {msg.role !== 'user' && (
                <div className="text-[10px] uppercase font-black tracking-widest text-[#00E5FF] mb-2 inline-block bg-[#00E5FF]/10 px-2 py-1 border border-[#00E5FF]/30">
                  SYSTEM RESPONSE
                </div>
              )}
              {msg.role === 'user' && (
                <div className="text-[10px] uppercase font-black tracking-widest text-[#000] mb-2 inline-block bg-[#000]/10 px-2 py-1 border border-[#000]/30">
                  QUERY INPUT
                </div>
              )}
              <div className="prose prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-[#000] prose-pre:border-2 prose-pre:border-[#333] font-mono">
                <Markdown>{msg.text}</Markdown>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex w-full justify-start relative z-10">
            <div className="max-w-[85%] bg-[#000] border-2 border-[#FF00FF] shadow-[6px_6px_0px_rgba(255,0,255,0.3)] p-5 flex items-center gap-4">
              <Loader2 className="w-5 h-5 animate-spin text-[#FF00FF]" />
              <span className="text-[11px] text-[#FF00FF] font-black uppercase tracking-widest">Deconstructing Query...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-6 pt-4 bg-[#000] border-t-4 border-[#333]">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest text-[#888] font-bold">ENTER TO SEND • SHIFT+ENTER FOR NEWLINE</span>
            <div className="flex items-center gap-2 bg-[#111] border border-[#333] px-3 py-1">
              <div className="w-2 h-2 bg-[#00FF66] shadow-[0_0_8px_rgba(0,255,102,0.6)]"></div>
              <span className="text-[10px] uppercase tracking-widest text-[#00FF66] font-bold">CONTEXT: REN ANALYSIS</span>
            </div>
          </div>
          <div className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="ENTER QUERY..."
              className="w-full bg-[#050505] border-2 border-[#333] py-4 pl-6 pr-16 text-sm text-[#eee] placeholder:text-[#555] focus:outline-none focus:border-[#00E5FF] transition-colors font-mono font-bold tracking-widest uppercase"
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="absolute right-2 w-12 h-12 bg-[#00E5FF] border border-[#000] flex items-center justify-center text-[#000] hover:bg-[#fff] disabled:opacity-50 disabled:bg-[#333] disabled:text-[#888] transition-colors cursor-pointer"
            >
              <Send className="w-5 h-5" strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
