"use client";

import React, { ReactNode, createContext, useState, useEffect, useContext } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { db, auth } from '../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

// Define available languages
export const LANGUAGES = {
  en: { name: 'English', nativeName: 'English' },
  es: { name: 'Spanish', nativeName: 'Español' },
  fr: { name: 'French', nativeName: 'Français' },
};

// Create the language context
type LanguageContextType = {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string, defaultValue?: string) => string;
  translations: Record<string, string>;
};

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key: string, defaultValue?: string) => defaultValue || key,
  translations: {},
});

// Custom hook to use the language context
export const useLanguage = () => useContext(LanguageContext);

interface I18nProviderProps {
  children: ReactNode;
}

export default function I18nProvider({ children }: I18nProviderProps) {
  const [language, setLanguage] = useState('en');
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const router = useRouter();
  const pathname = usePathname();

  // Load translations for the current language
  useEffect(() => {
    const loadTranslations = async () => {
      try {
        const response = await fetch(`/locales/${language}/common.json`);
        const data = await response.json();
        setTranslations(data);
      } catch (error) {
        console.error('Error loading translations:', error);
      }
    };
    
    loadTranslations();
  }, [language]);

  // Load user's language preference from Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userSettingsRef = doc(db, 'settings', user.uid);
          const userSettings = await getDoc(userSettingsRef);
          
          if (userSettings.exists()) {
            const { language: userLanguage } = userSettings.data();
            if (userLanguage && userLanguage !== language) {
              setLanguage(userLanguage);
              router.refresh();
            }
          }
        } catch (error) {
          console.error('Error loading language settings:', error);
        }
      }
    });

    return () => unsubscribe();
  }, [language, router]);

  // Translation function
  const t = (key: string, defaultValue?: string): string => {
    return translations[key] || defaultValue || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, translations }}>
      {children}
    </LanguageContext.Provider>
  );
} 