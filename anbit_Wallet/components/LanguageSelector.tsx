import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Check } from 'lucide-react';

const LANGUAGES = [
  { code: 'el' as const, name: 'Ελληνικά', flag: '🇬🇷' },
  { code: 'en' as const, name: 'English', flag: '🇬🇧' },
];

const LanguageSelector: React.FC = () => {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="language-selector-wrap relative shrink-0" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-10 h-10 lg:w-11 lg:h-11 rounded-lg bg-white/[0.05] border border-anbit-border flex items-center justify-center text-white hover:text-white transition-colors"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={t('languageSelection')}
      >
        <Globe className="w-5 h-5 shrink-0" strokeWidth={2} />
      </button>

      {isOpen && (
        <div
          role="listbox"
          className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-anbit-border bg-anbit-card shadow-xl py-1 z-[60] opacity-100 transition-opacity"
          style={{ boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}
        >
          <p className="px-3 py-2 text-xs font-bold text-anbit-muted uppercase tracking-wider">
            {t('chooseLanguage')}
          </p>
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              type="button"
              role="option"
              aria-selected={i18n.language?.startsWith(lang.code)}
              onClick={() => {
                i18n.changeLanguage(lang.code);
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm text-anbit-text hover:bg-anbit-border/40 transition-colors"
            >
              <span className="text-xl leading-none" aria-hidden>
                {lang.flag}
              </span>
              <span className="flex-1 font-medium">{lang.name}</span>
              {i18n.language?.startsWith(lang.code) && (
                <Check className="w-4 h-4 text-anbit-yellow shrink-0" strokeWidth={2.5} />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
