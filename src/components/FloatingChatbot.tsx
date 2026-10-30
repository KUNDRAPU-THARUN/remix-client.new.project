import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  MessageCircle, 
  X, 
  Minus, 
  RefreshCw, 
  MoreVertical, 
  Search, 
  Send, 
  Bot, 
  User, 
  Sparkles,
  ChevronRight,
  ExternalLink,
  Phone
} from 'lucide-react';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const FAQS_DATA: FAQ[] = [
  {
    id: 'faq-1',
    question: 'Can I find beauty and wellness services on Chittoorads.com?',
    answer: 'Yes, absolutely! ChittoorAds features verified beauty parlors, women\'s bridal makeup studios, men\'s grooming salons, Ayurvedic wellness centers, and spas across Church Street, Gandhi Road, and Kattamanchi. Simply search "Beauty" or "Parlor" in the search bar above to browse ratings and contact beauticians directly.',
    category: 'Services',
  },
  {
    id: 'faq-2',
    question: 'Can I find event and wedding services on Chittoorads.com?',
    answer: 'Yes! You can find Kalyana Mandapams (function halls), event caterers, wedding decorators, photographers, and traditional Nadaswaram troupes in Chittoor and Kanipakam. Browse our classifieds and listings to connect with trusted local event coordinators.',
    category: 'Events',
  },
  {
    id: 'faq-3',
    question: 'How do I view top trending businesses on Chittoorads.com?',
    answer: 'To see top trending businesses, use the "Sort" dropdown in the directory and select "Top Rated" or "Most Reviewed". You can also filter by "Verified Only" and "4.5+ Stars" to immediately find Chittoor\'s highest customer-rated providers.',
    category: 'Directory',
  },
  {
    id: 'faq-4',
    question: 'How do I contact Chittoorads.com to list my business or post an ad?',
    answer: 'Posting is 100% Free! Just click the "+ Post Free Ad" button in the top navigation bar. Fill in your business details, phone number, and address. Your ad goes live immediately across Chittoor district without any middleman charges.',
    category: 'Support',
  },
  {
    id: 'faq-5',
    question: 'How do I book a cab for Kanipakam Temple darshan?',
    answer: 'Click on the "Kanipakam Pilgrimage" tab in the top navigation to view verified taxi and cab packages from Chittoor station to Sri Varasiddhi Vinayaka Temple. You can call or chat on WhatsApp directly with drivers.',
    category: 'Travel',
  },
  {
    id: 'faq-6',
    question: 'Are doctors and hospitals available 24x7 in Chittoor?',
    answer: 'Yes. Major centers like Sri Balaji Multi-Speciality Hospital on Gandhi Road and the District Government Hospital provide 24x7 trauma care. For immediate emergencies, dial 108 or view our Emergency Helplines section.',
    category: 'Healthcare',
  },
];

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
}

export const FloatingChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: 'Hello! Welcome to ChittoorAds Q&A Support. How can we help you today? Click a question below or search our knowledge base.',
      timestamp: 'Just now',
    },
  ]);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Filter FAQs based on search input
  const filteredFaqs = useMemo(() => {
    if (!searchQuery.trim()) return FAQS_DATA;
    const q = searchQuery.toLowerCase();
    return FAQS_DATA.filter(
      (f) => f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const handleSelectFaq = (faq: FAQ) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: faq.question,
      timestamp: time,
    };

    const botMsg: ChatMessage = {
      id: `b-${Date.now() + 1}`,
      sender: 'bot',
      text: faq.answer,
      timestamp: time,
    };

    setMessages((prev) => [...prev, userMsg, botMsg]);
    setSearchQuery('');
  };

  const handleCustomQuestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userQ = searchQuery.trim();

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: userQ,
      timestamp: time,
    };

    // Find best match in FAQs or provide smart answer
    const match = FAQS_DATA.find(
      (f) =>
        f.question.toLowerCase().includes(userQ.toLowerCase()) ||
        userQ.toLowerCase().includes(f.category.toLowerCase())
    );

    let answer = match
      ? match.answer
      : `Thanks for asking about "${userQ}". You can search our directory for listings across Gandhi Road, Church Street, Kattamanchi and Murukambattu, or tap "+ Post Free Ad" to list your business! For direct assistance, WhatsApp us at +91 94402 18456.`;

    const botMsg: ChatMessage = {
      id: `b-${Date.now() + 1}`,
      sender: 'bot',
      text: answer,
      timestamp: time,
    };

    setMessages((prev) => [...prev, userMsg, botMsg]);
    setSearchQuery('');
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'bot',
        text: 'Chat history reset. How can we help you find local businesses, classifieds or temple services in Chittoor?',
        timestamp: 'Just now',
      },
    ]);
    setSearchQuery('');
    setShowOptionsMenu(false);
  };

  return (
    <>
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-xl hover:shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-105 group cursor-pointer focus:outline-hidden"
          title="Open ChittoorAds Q&A Support"
          aria-label="Open ChittoorAds Q&A Support"
        >
          <div className="relative">
            <MessageCircle className="w-7 h-7" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-blue-600 animate-pulse" />
          </div>
          {/* Tooltip on hover */}
          <span className="absolute right-16 bg-slate-900 text-white text-xs font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap shadow-md opacity-0 group-hover:opacity-100 transition pointer-events-none">
            ChittoorAds Q&A Support
          </span>
        </button>
      )}

      {/* Chat Window Popup Card */}
      {isOpen && (
        <div className="fixed bottom-6 right-4 sm:right-6 z-50 w-[92vw] sm:w-[410px] max-h-[600px] h-[82vh] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header: Dark blue top bar */}
          <div className="bg-blue-900 text-white px-4 py-3.5 flex items-center justify-between shrink-0 select-none shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-700/80 flex items-center justify-center text-white">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm tracking-wide">ChittoorAds Q&A Support</h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                </div>
                <p className="text-[11px] text-blue-200">Ask questions & search local FAQs</p>
              </div>
            </div>

            {/* Top Action Controls */}
            <div className="flex items-center gap-1 relative">
              {/* Reset button */}
              <button
                onClick={handleResetChat}
                className="p-1.5 text-blue-200 hover:text-white hover:bg-blue-800 rounded-md transition"
                title="Reset chat conversation"
              >
                <RefreshCw className="w-4 h-4" />
              </button>

              {/* Options dots icon */}
              <button
                onClick={() => setShowOptionsMenu(!showOptionsMenu)}
                className="p-1.5 text-blue-200 hover:text-white hover:bg-blue-800 rounded-md transition"
                title="Options"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {/* Minimize line */}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-blue-200 hover:text-white hover:bg-blue-800 rounded-md transition font-bold"
                title="Minimize chat"
              >
                <Minus className="w-4 h-4 stroke-[2.5]" />
              </button>

              {/* Dropdown Options Menu */}
              {showOptionsMenu && (
                <div className="absolute right-0 top-10 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-20 text-slate-800 text-xs">
                  <button
                    onClick={handleResetChat}
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-medium"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                    <span>Clear Chat History</span>
                  </button>
                  <a
                    href="https://wa.me/919440218456?text=Hi%20ChittoorAds%20Support"
                    target="_blank"
                    rel="noreferrer"
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 text-emerald-700 font-medium"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>WhatsApp Helpdesk</span>
                  </a>
                  <button
                    onClick={() => {
                      setShowOptionsMenu(false);
                      setSearchQuery('beauty');
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-medium"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Find Beauty Services</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Chat Messages Container */}
          <div className="flex-1 p-3.5 sm:p-4 overflow-y-auto space-y-3 bg-slate-50 text-xs sm:text-sm">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'bot' && (
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-2xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>
                  <span
                    className={`block text-[10px] mt-1 ${
                      msg.sender === 'user' ? 'text-blue-200 text-right' : 'text-slate-400'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>

                {msg.sender === 'user' && (
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5 text-[10px]">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}

            {/* Quick Suggested FAQs List (Clickable Pill Cards) */}
            <div className="pt-2">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                Suggested Frequently Asked Questions:
              </p>
              <div className="space-y-1.5">
                {filteredFaqs.length > 0 ? (
                  filteredFaqs.map((faq) => (
                    <button
                      key={faq.id}
                      onClick={() => handleSelectFaq(faq)}
                      className="w-full text-left p-2.5 rounded-xl bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-700 hover:text-blue-900 transition-all text-xs flex items-center justify-between gap-2 shadow-2xs group cursor-pointer"
                    >
                      <span className="font-medium leading-snug">{faq.question}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  ))
                ) : (
                  <div className="text-center p-3 text-xs text-slate-400 bg-white rounded-xl border border-dashed border-slate-200">
                    No FAQs matching "{searchQuery}". Press Enter to submit your question.
                  </div>
                )}
              </div>
            </div>

            <div ref={messagesEndRef} />
          </div>

          {/* Search & Input Field */}
          <form
            onSubmit={handleCustomQuestionSubmit}
            className="p-3 bg-white border-t border-slate-200 shrink-0"
          >
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search FAQs..."
                className="w-full pl-9 pr-10 py-2.5 text-xs sm:text-sm bg-slate-100 rounded-xl border border-slate-200 focus:bg-white focus:border-blue-500 outline-hidden font-medium text-slate-800 placeholder:text-slate-400"
              />
              <button
                type="submit"
                disabled={!searchQuery.trim()}
                className="absolute right-1.5 p-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-30 text-white transition cursor-pointer"
                title="Send question"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>

          {/* Footer Branding */}
          <div className="py-1.5 px-3 bg-slate-100/90 border-t border-slate-200/80 text-center shrink-0">
            <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">
              POWERED BY RedbackAI
            </span>
          </div>
        </div>
      )}
    </>
  );
};
