import React, { useState, useMemo } from 'react';
import {
  X,
  Sparkles,
  Send,
  MapPin,
  Copy,
  Check,
  Bot,
  User,
  HelpCircle,
  Lightbulb
} from 'lucide-react';
import { askCityScout } from '../services/aiService';
import { CityConfig } from '../types';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCity?: CityConfig;
}

interface Message {
  role: 'assistant' | 'user';
  text: string;
  time: string;
}

const CHITTOOR_PRESETS = [
  'Best 24/7 hospital & emergency care in Chittoor',
  'Kanipakam temple darshan timings & taxi pickup',
  'Totapuri mango pulp mandis in Murukambattu',
  'Authentic Kuppadam silk saree stores on Church St',
  'Where can I get famous Chittoor Karam Dosa?',
  'House rentals & plot prices near Chittoor Bypass',
];

const VELLORE_PRESETS = [
  'CMC Vellore doctor appointment & emergency helpline',
  'Katpadi student PGs & hostels near VIT University',
  'Famous Ambur Seeraga Samba mutton biryani spots',
  'Sripuram Golden Temple timings and family lodging',
  'Vellore Fort and Jalakandeswarar temple history',
  'Leather manufacturing and footwear in Ranipet',
];

const BENGALURU_PRESETS = [
  'Coworking desks & startup spaces in Indiranagar',
  'Managed co-living PGs in HSR Layout and Koramangala',
  'Best crispy butter benne dosa & degree filter coffee',
  'Super-speciality robotic surgery & multispeciality hospitals',
  'Software developer and tech recruitment consultancies',
  'Apartments & gated community flats along ORR',
];

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  isOpen,
  onClose,
  currentCity,
}) => {
  const cityId = currentCity?.id || 'chittoor';
  const cityName = currentCity?.name || 'Chittoor';
  const brandName = currentCity?.brandName || 'Chittoor Ads';
  const cityCode = currentCity?.code || 'AP-03';

  const presets = useMemo(() => {
    switch (cityId) {
      case 'vellore':
        return VELLORE_PRESETS;
      case 'bengaluru':
        return BENGALURU_PRESETS;
      case 'chittoor':
      default:
        return CHITTOOR_PRESETS;
    }
  }, [cityId]);

  const [inputQuery, setInputQuery] = useState('');
  const [language, setLanguage] = useState<'en' | 'te'>('en');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const initialGreeting = useMemo(() => {
    if (cityId === 'vellore') {
      return `Vanakkam! 🙏 I am your **Vellore Smart Scout**, your AI directory assistant for Vellore Fort City, Katpadi, Sathuvachari, and TN-23.\n\nAsk me about CMC Hospital specialists, student PGs near VIT, Ambur Star Biryani, Sripuram Golden Temple lodges, or emergency helplines!`;
    }
    if (cityId === 'bengaluru') {
      return `Namaskara! 🙏 I am your **Bengaluru Smart Scout**, your AI assistant for Silicon City, Indiranagar, Koramangala, HSR Layout, and KA-01.\n\nAsk me about coworking spaces, managed tech PGs, iconic filter coffee spots, super-speciality hospitals, or real estate!`;
    }
    return `Namaskaram! 🙏 I am your **Chittoor Smart Scout**, your local AI assistant for Chittoor town, Kanipakam, Murukambattu, and AP-03 surroundings.\n\nAsk me anything about local hospitals, mango agro mandis, silk boutiques, temple cab bookings, food spots, or emergency helplines!`;
  }, [cityId]);

  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      text: initialGreeting,
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
      const reply = await askCityScout(cityId, q, language);
      const botMsg: Message = {
        role: 'assistant',
        text: reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: `Apologies, could not fetch AI response. Please check local directory search or emergency contacts for ${cityName}.`,
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
                <h3 className="font-bold text-sm sm:text-base font-heading">{cityName} Smart Scout</h3>
                <span className="text-[10px] bg-red-600 font-bold px-1.5 py-0.2 rounded text-white uppercase">
                  AI Powered
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                Local Concierge & Ad Assistant • {brandName} ({cityCode})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition cursor-pointer"
              aria-label="Close assistant modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Chat History Messages */}
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 bg-slate-50">
          {messages.map((msg, idx) => {
            const isBot = msg.role === 'assistant';
            return (
              <div
                key={idx}
                className={`flex gap-3 max-w-[88%] ${isBot ? 'self-start' : 'self-end ml-auto flex-row-reverse'}`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    isBot ? 'bg-amber-400 text-slate-950' : 'bg-[#E51E31] text-white'
                  }`}
                >
                  {isBot ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>

                <div>
                  <div
                    className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      isBot
                        ? 'bg-white border border-slate-200 text-slate-800 shadow-2xs whitespace-pre-line'
                        : 'bg-[#E51E31] text-white font-medium'
                    }`}
                  >
                    {msg.text}
                  </div>

                  <div
                    className={`flex items-center gap-2 mt-1 text-[10px] text-slate-400 ${
                      isBot ? '' : 'justify-end'
                    }`}
                  >
                    <span>{msg.time}</span>
                    {isBot && (
                      <button
                        onClick={() => handleCopyText(msg.text, idx)}
                        className="hover:text-slate-700 flex items-center gap-0.5 cursor-pointer"
                      >
                        {copiedIdx === idx ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-600 font-bold">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium pl-10">
              <Sparkles className="w-4 h-4 text-amber-500 animate-spin" />
              <span>{cityName} Smart Scout is searching local directory...</span>
            </div>
          )}
        </div>

        {/* Suggested Quick Question Chips */}
        <div className="px-4 py-2.5 bg-white border-t border-slate-200 shrink-0">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 mb-1.5">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
            <span>Popular Queries in {cityName}:</span>
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {presets.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(preset)}
                className="text-xs bg-slate-100 hover:bg-red-50 hover:text-[#E51E31] hover:border-red-200 border border-slate-200 px-2.5 py-1 rounded-full whitespace-nowrap transition cursor-pointer font-medium"
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Input Text Form */}
        <div className="p-3 bg-white border-t border-slate-200 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder={`Ask ${cityName} Scout anything...`}
              disabled={isLoading}
              className="flex-1 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-red-500 outline-hidden bg-slate-50 focus:bg-white transition"
            />
            <button
              type="submit"
              disabled={isLoading || !inputQuery.trim()}
              className="p-2.5 rounded-xl bg-[#E51E31] hover:bg-red-700 disabled:opacity-50 text-white transition cursor-pointer shrink-0"
              aria-label="Send query"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
