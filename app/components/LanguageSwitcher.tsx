"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage, LANGUAGES } from './I18nProvider';

export default function LanguageSwitcher({ customClassName = '' }: { customClassName?: string }) {
  const { language, setLanguage } = useLanguage();
  const router = useRouter();

  const handleChangeLanguage = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = e.target.value;
    setLanguage(newLanguage);
    
    // Set cookie for middleware
    document.cookie = `NEXT_LOCALE=${newLanguage};path=/;max-age=${60 * 60 * 24 * 30}`;
    
    // Refresh the page to apply the language change
    router.refresh();
  };

  return (
    <div className="language-switcher">
      <select 
        value={language} 
        onChange={handleChangeLanguage}
        className="bg-transparent border border-gray-300 rounded px-2 py-1 text-sm"
        aria-label="Select language"
      >
        {Object.entries(LANGUAGES).map(([code, { nativeName }]) => (
          <option key={code} value={code}>
            {nativeName}
          </option>
        ))}
      </select>
    </div>
  );
} 