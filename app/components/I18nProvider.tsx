"use client";

import React, { ReactNode, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslation } from 'next-i18next';
import { db, auth } from '../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

interface I18nProviderProps {
  children: ReactNode;
}

export default function I18nProvider({ children }: I18nProviderProps) {
  const { i18n } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();

  // Load user's language preference from Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userSettingsRef = doc(db, 'settings', user.uid);
          const userSettings = await getDoc(userSettingsRef);
          
          if (userSettings.exists()) {
            const { language } = userSettings.data();
            if (language && language !== i18n.language) {
              await i18n.changeLanguage(language);
              router.refresh();
            }
          }
        } catch (error) {
          console.error('Error loading language settings:', error);
        }
      }
    });

    return () => unsubscribe();
  }, [i18n, router]);

  return <>{children}</>;
} 