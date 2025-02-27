"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useLanguage } from './I18nProvider';
import LanguageSwitcher from './LanguageSwitcher';
import { usePathname } from 'next/navigation';

export default function Header() {
  const { t } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const pathname = usePathname();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Handle keyboard events for accessibility
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleMenu();
    }
  };

  return (
    <header className="bg-white border-b border-border sticky top-0 z-50" role="banner">
      {/* Skip to content link - hidden visually but accessible to screen readers */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:p-4 focus:bg-blue-600 focus:text-white focus:z-50">
        Skip to content
      </a>

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center" aria-label="ProLingo home">
              <span className="text-2xl font-bold text-primary">Pro<span className="text-secondary">Lingo</span></span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8" aria-label="Main navigation">
            <Link href="/lessons" className="text-gray-700 hover:text-primary font-medium" tabIndex={0}>
              {t('lessons')}
            </Link>
            <Link href="/leaderboard" className="text-gray-700 hover:text-primary font-medium" tabIndex={0}>
              {t('leaderboard')}
            </Link>
            <Link href="/features" className="text-gray-700 hover:text-primary font-medium" tabIndex={0}>
              {t('features')}
            </Link>
            <Link href="/pricing" className="text-gray-700 hover:text-primary font-medium" tabIndex={0}>
              {t('pricing')}
            </Link>
            <Link href="/resources" className="text-gray-700 hover:text-primary font-medium" tabIndex={0}>
              {t('resources')}
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-primary font-medium" tabIndex={0}>
              {t('about')}
            </Link>
          </nav>

          {/* Desktop CTA Buttons and Language Switcher */}
          <div className="hidden md:flex items-center space-x-4" aria-label="User authentication">
            <LanguageSwitcher />
            <Link href="/login" className="text-gray-700 hover:text-primary font-medium" tabIndex={0}>
              {t('login')}
            </Link>
            <Link href="/register" className="btn-secondary" tabIndex={0}>
              {t('signUp')}
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-primary hover:bg-gray-100"
              onClick={toggleMenu}
              onKeyDown={handleKeyDown}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
              aria-label={isMenuOpen ? "Close main menu" : "Open main menu"}
            >
              <span className="sr-only">{isMenuOpen ? "Close main menu" : "Open main menu"}</span>
              {/* Icon when menu is closed */}
              {!isMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                /* Icon when menu is open */
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      {isMenuOpen && (
        <div className="md:hidden" id="mobile-menu" aria-label="Mobile navigation">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-border">
            <Link href="/lessons" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50" tabIndex={0}>
              {t('lessons')}
            </Link>
            <Link href="/leaderboard" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50" tabIndex={0}>
              {t('leaderboard')}
            </Link>
            <Link href="/features" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50" tabIndex={0}>
              {t('features')}
            </Link>
            <Link href="/pricing" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50" tabIndex={0}>
              {t('pricing')}
            </Link>
            <Link href="/resources" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50" tabIndex={0}>
              {t('resources')}
            </Link>
            <Link href="/about" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50" tabIndex={0}>
              {t('about')}
            </Link>
            <div className="mt-3 px-3">
              <LanguageSwitcher />
            </div>
            <div className="pt-4 pb-3 border-t border-border mt-3" aria-label="User authentication">
              <Link href="/login" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50" tabIndex={0}>
                {t('login')}
              </Link>
              <Link href="/register" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50 mt-1" tabIndex={0}>
                {t('signUp')}
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
} 