import React, { useState, useMemo } from 'react';
import {
  MessageCircle,
  X,
  Send,
  HelpCircle,
  ChevronRight,
  Sparkles,
  Minus,
  MoreVertical,
  RefreshCw,
  Phone,
  Search,
  ExternalLink
} from 'lucide-react';
import { CityConfig } from '../types';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const CHITTOOR_FAQS: FAQ[] = [
  {
    id: 'faq-ch-1',
    question: 'Can I find beauty and wellness services on ChittoorAds?',
    answer: 'Yes, absolutely! ChittoorAds features verified beauty parlors, women\'s bridal makeup studios, men\'s grooming salons, Ayurvedic wellness centers, and spas across Church Street, Gandhi Road, and Kattamanchi. Simply search "Beauty" or "Parlor" in the search bar above to browse ratings and contact beauticians directly.',
    category: 'Services',
  },
  {
    id: 'faq-ch-2',
    question: 'Can I find event and wedding services in Chittoor?',
    answer: 'Yes! You can find Kalyana Mandapams (function halls), event caterers, wedding decorators, photographers, and traditional Nadaswaram troupes in Chittoor and Kanipakam. Browse our classifieds and listings to connect with trusted local event coordinators.',
    category: 'Events',
  },
  {
    id: 'faq-ch-3',
    question: 'How do I view top trending businesses in Chittoor?',
    answer: 'To see top trending businesses, use the "Sort" dropdown in the directory and select "Top Rated" or "Most Reviewed". You can also filter by "Verified Only" and "4.5+ Stars" to immediately find Chittoor\'s highest customer-rated providers.',
    category: 'Directory',
  },
  {
    id: 'faq-ch-4',
    question: 'How do I list my business or post a free ad on ChittoorAds?',
    answer: 'Posting is 100% Free! Just click the "+ Post Free Ad" button in the top navigation bar. Fill in your business details, phone number, and address. Your ad goes live immediately across Chittoor district without any middleman charges.',
    category: 'Support',
  },
  {
    id: 'faq-ch-5',
    question: 'How do I book a cab for Kanipakam Temple darshan?',
    answer: 'Click on the "Kanipakam Pilgrimage" tab in the top navigation to view verified taxi and cab packages from Chittoor station to Sri Varasiddhi Vinayaka Temple. You can call or chat on WhatsApp directly with drivers.',
    category: 'Travel',
  },
  {
    id: 'faq-ch-6',
    question: 'Are doctors and hospitals available 24x7 in Chittoor?',
    answer: 'Yes. Major centers like Sri Balaji Multi-Speciality Hospital on Gandhi Road and the District Government Hospital provide 24x7 trauma care. For immediate emergencies, dial 108 or view our Emergency Helplines section.',
    category: 'Healthcare',
  },
];

const VELLORE_FAQS: FAQ[] = [
  {
    id: 'faq-vel-1',
    question: 'How do I find CMC Hospital specialists and clinic timings in Vellore?',
    answer: 'Vellore Ads features verified diagnostic centers, medical labs, and private clinics around CMC Ida Scudder Road and Bagayam. Use our "Hospitals & Healthcare" category to browse phone numbers, consultation hours, and addresses.',
    category: 'Healthcare',
  },
  {
    id: 'faq-vel-2',
    question: 'Can I find student PGs and hostels near VIT University Katpadi?',
    answer: 'Yes! Browse our "Student PGs & Accommodations" section for verified student boarding, AC rooms with high-speed Wi-Fi, study desks, and hygienic mess food within walking distance of VIT Gate 2 and Gate 3.',
    category: 'Hostels',
  },
  {
    id: 'faq-vel-3',
    question: 'Where can I find authentic Ambur Seeraga Samba Dum Biryani?',
    answer: 'Vellore is famous for traditional Ambur Biryani. Browse our "Restaurants" category to locate iconic spots like Star Biryani, Fort City non-veg messes, and family dining along Arcot Road and Officers Line.',
    category: 'Dining',
  },
  {
    id: 'faq-vel-4',
    question: 'How do I list my Vellore business on Vellore Ads?',
    answer: 'Listing on Vellore Ads is 100% Free! Click "+ Post Free Ad" in the top header, select your Vellore locality (Katpadi, Sathuvachari, Fort City, etc.), add your phone number and photos. Your listing is published immediately.',
    category: 'Support',
  },
  {
    id: 'faq-vel-5',
    question: 'Where can I stay during Sripuram Golden Temple visits?',
    answer: 'Explore our "Hotels & Pilgrim Stays" category for comfortable family AC rooms and guest houses near Bagayam and Sripuram Road with parking and 24-hr check-in.',
    category: 'Travel',
  },
  {
    id: 'faq-vel-6',
    question: 'What are the 24x7 emergency helplines in Vellore?',
    answer: 'In medical emergencies, dial 108 for free ambulance dispatch. For CMC Emergency, call 0416-2281000. For Vellore Police, dial 100 or 0416-2222100. Tap "24x7 Emergency Helplines" in the top bar for one-tap calling.',
    category: 'Emergency',
  },
];

const BENGALURU_FAQS: FAQ[] = [
  {
    id: 'faq-blr-1',
    question: 'How do I find flexible coworking spaces in Indiranagar and HSR Layout?',
    answer: 'Bengaluru Ads features premium shared desks, private team cabins, and conference rooms across 100ft Road Indiranagar, HSR 27th Main, and Koramangala. Filter by "Coworking & Enterprise Spaces" to compare rates.',
    category: 'Coworking',
  },
  {
    id: 'faq-blr-2',
    question: 'Are there verified managed PGs for IT professionals in Bengaluru?',
    answer: 'Yes! Our "PGs & Co-Living Spaces" category lists tech-friendly accommodations with fiber Wi-Fi, housekeeping, biometric access, and home-style meals in Koramangala, Whitefield, and Electronic City.',
    category: 'Co-Living',
  },
  {
    id: 'faq-blr-3',
    question: 'How do I post a free business listing on Bengaluru Ads?',
    answer: 'Listing on Bengaluru Ads is completely free. Click "+ Post Free Ad" in the top bar, pick your Bengaluru locality (Whitefield, Koramangala, Jayanagar, etc.), enter your business details, and get discovered by local customers.',
    category: 'Support',
  },
  {
    id: 'faq-blr-4',
    question: 'Where can I find top South Indian filter coffee and benne dosas?',
    answer: 'Browse our "Restaurants, Cafes & Breweries" category to discover legendary South Bengaluru eateries in Jayanagar 4th Block, Malleshwaram, and Basavanagudi.',
    category: 'Food',
  },
  {
    id: 'faq-blr-5',
    question: 'What emergency helpline should I dial in Bengaluru?',
    answer: 'For police emergencies, dial 112 (Namma 112). For medical emergencies and government ambulance dispatch, dial 108. For BESCOM electricity complaints, dial 1912.',
    category: 'Emergency',
  },
];

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
}

interface FloatingChatbotProps {
  currentCity?: CityConfig;
}

export const FloatingChatbot: React.FC<FloatingChatbotProps> = ({ currentCity }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const cityId = currentCity?.id || 'chittoor';
  const cityName = currentCity?.name || 'Chittoor';
  const brandName = currentCity?.brandName || 'Chittoor Ads';
  const phoneClean = currentCity?.contact?.phone ? currentCity.contact.phone.replace(/[^0-9]/g, '') : '';

  const faqs = useMemo(() => {
    switch (cityId) {
      case 'vellore':
        return VELLORE_FAQS;
      case 'bengaluru':
        return BENGALURU_FAQS;
      case 'chittoor':
      default:
        return CHITTOOR_FAQS;
    }
  }, [cityId]);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: `Hello! Welcome to ${brandName} Q&A Support. How can we help you today in ${cityName}? Click a question below or search our knowledge base.`,
      timestamp: 'Just now',
    },
  ]);

  const [showOptionsMenu, setShowOptionsMenu] = useState(false);

  // Filter FAQs based on user search query
  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectFaq = (faq: FAQ) => {
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Add user question
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: faq.question,
      timestamp: timeNow,
    };

    // Add bot answer
    const botMsg: ChatMessage = {
      id: `b-${Date.now() + 1}`,
      sender: 'bot',
      text: faq.answer,
      timestamp: timeNow,
    };

    setMessages((prev) => [...prev, userMsg, botMsg]);
    setSearchQuery('');
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `reset-${Date.now()}`,
        sender: 'bot',
        text: `Chat history reset. How can we help you find local businesses, classifieds or emergency services in ${cityName}?`,
        timestamp: 'Just now',
      },
    ]);
    setShowOptionsMenu(false);
  };

  return (
    <div className="relative">
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-4 sm:right-6 z-40 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white p-3.5 sm:p-4 rounded-full shadow-2xl shadow-blue-500/40 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer flex items-center justify-center group"
          title={`Open ${brandName} Q&A Support`}
          aria-label={`Open ${brandName} Q&A Support`}
        >
          <div className="relative">
            <MessageCircle className="w-7 h-7" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-blue-600 animate-pulse" />
          </div>
          {/* Tooltip on hover */}
          <span className="absolute right-16 bg-slate-900 text-white text-xs font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap shadow-md opacity-0 group-hover:opacity-100 transition pointer-events-none">
            {brandName} Q&A Support
          </span>
        </button>
      )}

      {/* Chat Window Popup Card */}
      {isOpen && (
        <div className="fixed bottom-6 right-4 sm:right-6 z-50 w-[92vw] sm:w-[410px] max-h-[600px] h-[82vh] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="bg-blue-900 text-white px-4 py-3.5 flex items-center justify-between shrink-0 select-none shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-700/80 flex items-center justify-center text-white">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm tracking-wide">{brandName} Q&A Support</h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                </div>
                <p className="text-[11px] text-blue-200">Ask questions & search {cityName} FAQs</p>
              </div>
            </div>

            {/* Top Action Controls */}
            <div className="flex items-center gap-1 relative">
              <button
                onClick={handleResetChat}
                className="p-1.5 text-blue-200 hover:text-white hover:bg-blue-800 rounded-md transition cursor-pointer"
                title="Reset chat conversation"
              >
                <RefreshCw className="w-4 h-4" />
              </button>

              <button
                onClick={() => setShowOptionsMenu(!showOptionsMenu)}
                className="p-1.5 text-blue-200 hover:text-white hover:bg-blue-800 rounded-md transition cursor-pointer"
                title="Options"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-blue-200 hover:text-white hover:bg-blue-800 rounded-md transition font-bold cursor-pointer"
                title="Minimize chat"
              >
                <Minus className="w-4 h-4 stroke-[2.5]" />
              </button>

              {/* Dropdown Options Menu */}
              {showOptionsMenu && (
                <div className="absolute right-0 top-10 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-20 text-slate-800 text-xs">
                  <button
                    onClick={handleResetChat}
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-medium cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                    <span>Clear Chat History</span>
                  </button>
                  {phoneClean && (
                    <a
                      href={`https://wa.me/${phoneClean}?text=Hi%20${encodeURIComponent(brandName)}%20Support`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 text-emerald-700 font-medium"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>WhatsApp Helpdesk</span>
                    </a>
                  )}
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      setShowOptionsMenu(false);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 text-rose-600 font-medium cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Close Window</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Quick FAQ Search Bar */}
          <div className="p-3 bg-slate-50 border-b border-slate-200 shrink-0">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${cityName} FAQs (e.g. hospital, food)...`}
                className="w-full pl-9 pr-8 py-2 text-xs bg-white rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 font-medium text-slate-800"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {/* Message History & Chat Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-[13px] leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-xs font-medium'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs shadow-2xs'
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.timestamp}</span>
              </div>
            ))}

            {/* Suggested FAQ Chips Area */}
            <div className="pt-2">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
                <span>Frequently Asked Questions ({cityName}):</span>
              </div>

              <div className="space-y-1.5">
                {filteredFaqs.length > 0 ? (
                  filteredFaqs.map((faq) => (
                    <button
                      key={faq.id}
                      onClick={() => handleSelectFaq(faq)}
                      className="w-full text-left p-2.5 bg-white hover:bg-blue-50/80 rounded-xl border border-slate-200/90 hover:border-blue-300 text-xs text-slate-700 transition flex items-center justify-between group cursor-pointer shadow-2xs"
                    >
                      <div className="flex items-center gap-2 pr-2">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-700">
                          {faq.category}
                        </span>
                        <span className="font-medium text-slate-800 group-hover:text-blue-900 leading-snug">
                          {faq.question}
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 shrink-0" />
                    </button>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 text-center py-4 bg-white rounded-xl border border-slate-200">
                    No FAQs matching "{searchQuery}". Try "hospital", "food", or "ad".
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Footer Contact Link */}
          <div className="p-3 bg-white border-t border-slate-200 flex items-center justify-between text-xs shrink-0">
            <span className="text-slate-500 text-[11px]">Need custom assistance?</span>
            {phoneClean ? (
              <a
                href={`https://wa.me/${phoneClean}?text=Hello%20${encodeURIComponent(brandName)}%20Support`}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 text-[11px]"
              >
                <span>WhatsApp Us</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            ) : (
              <span className="text-slate-400 text-[11px] italic">24/7 AI Scout Active</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
