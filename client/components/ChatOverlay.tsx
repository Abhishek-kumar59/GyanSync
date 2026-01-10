
import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User, Sparkles } from 'lucide-react';
import { getStudyAdvice } from '../services/geminiService';
import { ChatMessage } from '../types';

interface ChatOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  // Added darkMode prop to fix Type error
  darkMode: boolean;
}

export const ChatOverlay: React.FC<ChatOverlayProps> = ({ isOpen, onClose, darkMode }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', content: "Hello! I'm your GyanSync study assistant. How can I help you today? Need help with a concept or organizing your schedule?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const history = messages.map(m => ({
      role: m.role,
      parts: [{ text: m.content }]
    }));
    history.push({ role: 'user', parts: [{ text: input }] });

    const response = await getStudyAdvice(history);
    setMessages(prev => [...prev, { role: 'model', content: response }]);
    setIsLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed bottom-6 right-6 w-full max-w-[90vw] sm:w-[450px] max-h-[600px] h-[80vh] rounded-3xl shadow-2xl border flex flex-col z-[100] animate-in slide-in-from-bottom-6 duration-300 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
      <div className={`p-4 text-white rounded-t-3xl flex items-center justify-between transition-colors ${darkMode ? 'bg-slate-900' : 'bg-[#1D265A]'}`}>
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-1.5 rounded-xl backdrop-blur-md">
            <img src="./logo.png" alt="GyanSync Logo" className="w-6 h-6 object-contain brightness-0 invert" />
          </div>
          <div>
            <h3 className="text-sm font-bold">GyanSync Assistant</h3>
            <p className="text-[10px] text-orange-200 flex items-center gap-1">
              <Sparkles size={10} /> Powered by Gemini
            </p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
          <X size={20} />
        </button>
      </div>

      <div ref={scrollRef} className={`flex-1 overflow-y-auto p-4 space-y-4 transition-colors ${darkMode ? 'bg-slate-900/50' : 'bg-slate-50/50'}`}>
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`p-2 rounded-lg h-fit transition-colors ${msg.role === 'user' ? (darkMode ? 'bg-indigo-600/20' : 'bg-indigo-100') : (darkMode ? 'bg-slate-700 border border-slate-600' : 'bg-white border border-slate-200')}`}>
                {msg.role === 'user' ? <User size={14} className="text-indigo-600" /> : <Bot size={14} className={`${darkMode ? 'text-slate-400' : 'text-slate-600'}`} />}
              </div>
              <div className={`p-3 rounded-2xl text-sm leading-relaxed transition-all ${
                msg.role === 'user' 
                ? 'bg-[#1D265A] text-white rounded-tr-none shadow-md' 
                : (darkMode ? 'bg-slate-800 text-slate-200 border border-slate-700 shadow-sm rounded-tl-none' : 'bg-white text-slate-700 border border-slate-100 shadow-sm rounded-tl-none')
              }`}>
                {msg.content}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className={`p-3 rounded-2xl flex gap-1 items-center border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
              <span className={`w-1.5 h-1.5 rounded-full animate-bounce bg-[#F48B29]`}></span>
              <span className={`w-1.5 h-1.5 rounded-full animate-bounce delay-75 bg-[#F48B29]`}></span>
              <span className={`w-1.5 h-1.5 rounded-full animate-bounce delay-150 bg-[#F48B29]`}></span>
            </div>
          </div>
        )}
      </div>

      <div className={`p-4 border-t rounded-b-3xl transition-colors ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
        <div className={`flex gap-2 p-1.5 rounded-2xl border transition-colors ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask GyanSync assistant..."
            className={`flex-1 bg-transparent px-3 py-2 text-sm focus:outline-none ${darkMode ? 'text-white placeholder-slate-600' : 'text-slate-900 placeholder-slate-400'}`}
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="bg-[#1D265A] hover:bg-[#2A367A] disabled:opacity-50 text-white p-2 rounded-xl transition-all shadow-md"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
