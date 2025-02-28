"use client";

import { useLanguage } from './I18nProvider';

export default function EnhancedLanguageSwitcher({ customClassName = '' }: { customClassName?: string }) {
  const { language, setLanguage } = useLanguage();
  
  const languages = [
    { code: 'en', label: 'EN' },
    { code: 'es', label: 'ES' },
    { code: 'fr', label: 'FR' }
  ];
  
  return (
    <div className="flex items-center space-x-1">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => setLanguage(lang.code)}
          className={`${
            language === lang.code ? 'font-bold' : 'opacity-70 hover:opacity-100'
          } px-2 py-1 rounded transition-colors ${customClassName}`}
          aria-label={`Switch to ${lang.label} language`}
          aria-current={language === lang.code ? 'true' : 'false'}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
} 