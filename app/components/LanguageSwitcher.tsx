"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'next-i18next';
import { doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

interface Language {
  code: string;
  name: string;
  flag: string;
}

const languages: Language[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation('common');
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<Language>(languages[0]);
  const [user, setUser] = useState<any>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Set initial language based on i18n
  useEffect(() => {
    const currentLang = languages.find(lang => lang.code === i18n.language) || languages[0];
    setCurrentLanguage(currentLang);
  }, [i18n.language]);

  // Check for authenticated user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const changeLanguage = async (language: Language) => {
    // Change language in i18next
    await i18n.changeLanguage(language.code);
    setCurrentLanguage(language);
    setIsOpen(false);
    
    // Save user preference to Firebase if logged in
    if (user) {
      try {
        const userRef = doc(db, 'settings', user.uid);
        await updateDoc(userRef, {
          language: language.code
        });
      } catch (error) {
        console.error('Error updating language preference:', error);
      }
    }
    
    // Refresh the page to apply the language change
    router.refresh();
  };

  const handleKeyDown = (e: React.KeyboardEvent, callback: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      callback();
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        aria-label="Select language"
        aria-expanded={isOpen}
        aria-controls="language-menu"
        className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
        onClick={toggleDropdown}
        onKeyDown={(e) => handleKeyDown(e, toggleDropdown)}
      >
        <span className="mr-1">{currentLanguage.flag}</span>
        <span className="mx-1">{currentLanguage.name}</span>
        <svg
          className={`w-4 h-4 ml-1 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {isOpen && (
        <div
          id="language-menu"
          className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 py-1 border border-gray-200"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="language-button"
        >
          {languages.map((language) => (
            <div
              key={language.code}
              className={`px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer flex items-center ${
                currentLanguage.code === language.code ? 'bg-gray-50 font-medium' : ''
              }`}
              role="menuitem"
              tabIndex={0}
              onClick={() => changeLanguage(language)}
              onKeyDown={(e) => handleKeyDown(e, () => changeLanguage(language))}
            >
              <span className="mr-2">{language.flag}</span>
              {language.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 