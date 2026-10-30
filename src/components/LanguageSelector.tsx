import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';
import { SupportedLanguage } from '../i18n/translations';

export const LanguageSelector: React.FC = () => {
  const { currentLanguage, setLanguage, languages, currentLanguageOption } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectLanguage = (code: SupportedLanguage) => {
    setLanguage(code);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Sleek Pill Dropdown Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="bg-white/10 hover:bg-white/20 border border-slate-200/30 rounded-full px-2.5 sm:px-3 py-1 text-xs font-semibold text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs select-none"
        title="Change Language / భాషను మార్చండి"
      >
        <span className="text-sm leading-none">🌐</span>
        <span className="flex items-center gap-1">
          <span>{currentLanguageOption.flag}</span>
          <span className="hidden sm:inline font-bold">{currentLanguageOption.nativeName}</span>
          <span className="sm:hidden font-bold">{currentLanguageOption.code.toUpperCase()}</span>
        </span>
        <ChevronDown className={`w-3 h-3 text-slate-300 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-9 w-64 bg-slate-900/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-700/80 py-2 z-50 animate-in fade-in zoom-in-95 duration-150 text-slate-100">
          <div className="px-3.5 py-1.5 border-b border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Select Regional Language</span>
            <span className="text-amber-400">AP-03 / రాయలసీమ</span>
          </div>

          <div className="py-1">
            {languages.map((lang) => {
              const isSelected = currentLanguage === lang.code;

              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleSelectLanguage(lang.code)}
                  className={`w-full text-left px-3.5 py-2.5 transition flex items-center justify-between group cursor-pointer ${
                    isSelected
                      ? 'bg-red-600/90 text-white font-bold'
                      : 'hover:bg-white/10 text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base leading-none">{lang.flag}</span>
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-bold leading-tight">
                        <span>{lang.nativeName}</span>
                        <span className={`text-[11px] font-normal ${isSelected ? 'text-red-100' : 'text-slate-400'}`}>
                          ({lang.name})
                        </span>
                      </div>
                      <p className={`text-[10px] mt-0.5 leading-none ${isSelected ? 'text-red-200' : 'text-slate-400'}`}>
                        {lang.regionNote}
                      </p>
                    </div>
                  </div>

                  {isSelected && (
                    <Check className="w-4 h-4 text-white shrink-0 ml-2" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Google Translate Integration Prompt */}
          <div className="px-3.5 py-2 border-t border-slate-800 bg-black/40 rounded-b-xl text-[10px] text-slate-400 flex items-center justify-between">
            <span>Dynamic i18n & Regional Support</span>
            <span className="text-emerald-400 font-semibold">Active</span>
          </div>
        </div>
      )}
    </div>
  );
};
