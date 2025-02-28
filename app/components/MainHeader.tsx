"use client";

import Link from 'next/link';
import { useLanguage } from './I18nProvider';
import LanguageSwitcher from './LanguageSwitcher';

export default function MainHeader() {
  const { t } = useLanguage();
  
  return (
    <header className="w-full bg-primary py-3 px-4 sm:px-6">
      <div className="container mx-auto max-w-7xl flex justify-end items-center gap-4">
        <LanguageSwitcher />
        <div className="flex items-center gap-2">
          <Link 
            href="/login" 
            className="px-4 py-2 border border-white text-white rounded-md hover:bg-white/10 text-sm font-medium"
          >
            {t('login')}
          </Link>
          <Link 
            href="/register" 
            className="px-4 py-2 bg-white text-primary rounded-md hover:bg-white/90 text-sm font-medium"
          >
            {t('signUp')}
          </Link>
        </div>
      </div>
    </header>
  );
} 