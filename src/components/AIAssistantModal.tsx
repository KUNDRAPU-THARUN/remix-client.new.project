import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Send, 
  MessageSquare, 
  Bot, 
  User, 
  Copy, 
  Check, 
  Languages, 
  Building2, 
  MapPin, 
  Phone 
} from 'lucide-react';
import { askChittoorScout } from '../services/aiService';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  role: 'assistant' | 'user';
  text: string;
  time: string;
}

const PRESET_QUESTIONS = [
  'Best 24/7 hospital & emergency care in Chittoor',
  'Kanipakam temple darshan timings & taxi pickup',
  'Totapuri mango pulp mandis in Murukambattu',
  'Authentic Kuppadam silk saree stores on Church St',
  'Where can I get famous Chittoor Karam Dosa?',
  'House rentals & plot prices near Chittoor Bypass',
];

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [inputQuery, setInputQuery] = useState('');
  const [language, setLanguage] = useState<'en' | 'te'>('en');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      text: `Namaskaram! 🙏 I am your **Chittoor Smart Scout**, your local AI assistant for Chittoor town, Kanipakam, Murukambattu, and AP-03 surroundings.\n\nAsk me anything about local hospitals, mango agro mandis, silk boutiques, temple cab bookings, food spots, or emergency helplines! You can also ask in Telugu (తెలుగులో కూడా అడగవచ్చు).`,
      time: 'Just now',
    },
  ]);

  if (!isOpen) return null;

  const handleSend = async (queryToSend?: string) => {
    const q = (queryToSend || inputQuery).trim();
    if (!q || isLoading) return;

    const userMsg: Message = {
      role: 'user',
      text: q,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const reply = await askChittoorScout(q, language);
      const botMsg: Message = {
        role: 'assistant',
        text: reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: 'Apologies, could not fetch AI response. Please check local directory search or emergency contacts.',
          time: 'Just now',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyText = async (text: string, idx: number) => {
    try {
      if (!navigator.clipboard) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(text);
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 2000);
    } catch (error) {
      console.warn('Could not copy assistant response:', error);
      alert('Could not copy the response. Please select and copy the text manually.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden my-auto h-[85vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shadow-xs">
              <Sparkles className="w-5 h-5 fill-slate-950 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base font-heading">Chittoor Smart Scout</h3>
                <span className="text-[10px] bg-red-600 font-bold px-1.5 py-0.2 rounded text-white uppercase">
                  AI Powered
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                Local Concierge & Ad Assistant • Chittoor AP-03
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Toggle */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'te' : 'en')}
              className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 text-amber-300 transition"
              title="Toggle Telugu / English responses"
            >
              <Languages className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'English' : 'తెలుగు'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 bg-slate-50">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.role === 'assistant' && (
                <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center shrink-0 mt-1 font-bold text-xs border border-amber-300">
                  <Bot className="w-4 h-4 text-amber-700" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-2xs relative group ${
                  m.role === 'user'
                    ? 'bg-red-600 text-white rounded-tr-none'
                    : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-none'
                }`}
              >
                <div className="whitespace-pre-line font-normal">{m.text}</div>
                <div className="flex items-center justify-between gap-3 mt-2 text-[10px] opacity-75">
                  <span>{m.time}</span>
                  {m.role === 'assistant' && (
                    <button
                      onClick={() => handleCopyText(m.text, idx)}
                      className="opacity-0 group-hover:opacity-100 transition flex items-center gap-1 hover:text-red-600"
                      title="Copy text"
                    >
                      {copiedIdx === idx ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      <span>{copiedIdx === idx ? 'Copied' : 'Copy'}</span>
                    </button>
                  )}
                </div>
              </div>

              {m.role === 'user' && (
                <div className="w-7 h-7 rounded-full bg-red-100 text-red-700 flex items-center justify-center shrink-0 mt-1 font-bold text-xs">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center shrink-0 font-bold text-xs border border-amber-300">
                <Bot className="w-4 h-4 text-amber-700" />
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none p-3.5 text-xs text-slate-500 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                <span>Chittoor Smart Scout is searching local directory...</span>
              </div>
            </div>
          )}
        </div>

        {/* Preset suggestions */}
        <div className="p-2.5 bg-slate-100 border-t border-slate-200 overflow-x-auto shrink-0 flex gap-1.5 no-scrollbar">
          {PRESET_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="text-[11px] whitespace-nowrap bg-white hover:bg-red-50 text-slate-700 hover:text-red-700 border border-slate-200 px-2.5 py-1 rounded-full font-medium transition shrink-0"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input box */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder={
              language === 'te'
                ? 'చిత్తూరులో ఆసుపత్రులు, మామిడి మార్కెట్, కాణిపాకం సేవల గురించి అడగండి...'
                : 'Ask about local shops, doctors, mango mandis, Kanipakam cabs...'
            }
            className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-red-500 font-medium"
          />

          <button
            type="submit"
            disabled={!inputQuery.trim() || isLoading}
            className="bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white p-2.5 sm:px-4 sm:py-2.5 rounded-xl font-semibold transition flex items-center gap-1.5 cursor-pointer text-xs sm:text-sm"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Ask</span>
          </button>
        </form>
      </div>
    </div>
  );
};
