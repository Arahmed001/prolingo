"use client";

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useLanguage } from './I18nProvider';
import { usePathname } from 'next/navigation';

// Interface for navigation items
interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
  icon?: React.ReactNode;
}

export default function Sidebar() {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(true);
  const [expandedItems, setExpandedItems] = useState<{[key: string]: boolean}>({});
  const sidebarRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  
  // Main navigation items
  const navigationItems: NavItem[] = [
    {
      label: t('home'),
      href: '/',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
        </svg>
      )
    },
    {
      label: t('lessons'),
      href: '/lessons',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
        </svg>
      ),
      children: [
        { label: t('beginnerLessons'), href: '/lessons/beginner' },
        { label: t('intermediateLessons'), href: '/lessons/intermediate' },
        { label: t('advancedLessons'), href: '/lessons/advanced' }
      ]
    },
    {
      label: t('leaderboard'),
      href: '/leaderboard',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
        </svg>
      )
    },
    {
      label: t('features'),
      href: '/features',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
        </svg>
      )
    },
    {
      label: t('pricing'),
      href: '/pricing',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      label: t('resources'),
      href: '/resources',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
        </svg>
      ),
      children: [
        { label: t('blog'), href: '/resources/blog' },
        { label: t('tutorials'), href: '/resources/tutorials' },
        { label: t('downloads'), href: '/resources/downloads' }
      ]
    },
    {
      label: t('about'),
      href: '/about',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      label: t('marketing'),
      href: '/marketing',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
        </svg>
      )
    }
  ];

  // Toggle sidebar
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  // Toggle submenu expansion
  const toggleSubMenu = (label: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [label]: !prev[label]
    }));
  };

  // Handle clicks outside sidebar to close it on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node) && isOpen && window.innerWidth < 768) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Check if path matches or is a child of the current route
  const isActive = (href: string) => {
    if (pathname === href) return true;
    if (pathname?.startsWith(`${href}/`) && href !== '/') return true;
    return false;
  };

  // Render a navigation item (and its children if any)
  const renderNavItem = (item: NavItem) => {
    const active = isActive(item.href);
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems[item.label];
    
    return (
      <div key={item.href} className="w-full">
        <div className="flex items-center">
          {hasChildren ? (
            <button
              onClick={() => toggleSubMenu(item.label)}
              className={`flex items-center w-full py-2 px-4 rounded-md transition-colors text-left ${
                active ? 'bg-primary/10 text-primary font-medium' : 'text-gray-700 hover:bg-gray-100'
              }`}
              aria-expanded={isExpanded}
              aria-controls={`submenu-${item.label}`}
            >
              <span className="mr-3">{item.icon}</span>
              {isOpen && (
                <>
                  <span className="flex-grow">{item.label}</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-4 w-4 transition-transform ${isExpanded ? 'transform rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </>
              )}
            </button>
          ) : (
            <Link
              href={item.href}
              className={`flex items-center w-full py-2 px-4 rounded-md transition-colors ${
                active ? 'bg-primary/10 text-primary font-medium' : 'text-gray-700 hover:bg-gray-100'
              }`}
              title={!isOpen ? item.label : ''}
            >
              <span className="mr-3">{item.icon}</span>
              {isOpen && <span>{item.label}</span>}
            </Link>
          )}
        </div>
        
        {/* Submenu */}
        {hasChildren && isOpen && (
          <div
            id={`submenu-${item.label}`}
            className={`ml-6 mt-1 space-y-1 transition-all duration-300 overflow-hidden ${
              isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            {item.children?.map((child) => (
              <Link
                key={child.href}
                href={child.href}
                className={`block py-2 pl-4 pr-3 rounded-md ${
                  isActive(child.href) 
                    ? 'bg-primary/5 text-primary font-medium' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {child.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/30 z-40 md:hidden" 
          aria-hidden="true"
          onClick={toggleSidebar}
        />
      )}
      
      {/* Mobile Toggle Button */}
      <button
        type="button"
        className="fixed top-4 left-4 z-30 md:hidden flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-primary hover:bg-gray-100"
        onClick={toggleSidebar}
        aria-expanded={isOpen}
        aria-controls="sidebar"
        aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
      >
        <span className="sr-only">{isOpen ? "Close sidebar" : "Open sidebar"}</span>
        {!isOpen ? (
          <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        ) : (
          <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
      </button>
      
      {/* Sidebar */}
      <div
        ref={sidebarRef}
        id="sidebar"
        className={`fixed top-0 left-0 bottom-0 z-50 bg-white border-r border-border transform transition-all duration-300 ease-in-out ${
          isOpen ? 'w-64' : 'w-16'
        } ${
          !isOpen && window.innerWidth < 768 ? '-translate-x-full' : 'translate-x-0'
        } md:relative md:flex md:flex-col md:min-h-screen`}
        aria-label="Sidebar navigation"
      >
        {/* Logo and Toggle Button */}
        <div className="p-4 flex items-center justify-between border-b border-border">
          {isOpen ? (
            <Link href="/" className="flex items-center" aria-label="ProLingo home">
              <span className="text-2xl font-bold text-primary">Pro<span className="text-secondary">Lingo</span></span>
            </Link>
          ) : (
            <Link href="/" className="flex items-center" aria-label="ProLingo home">
              <span className="text-2xl font-bold text-primary">PL</span>
            </Link>
          )}
          
          {/* Toggle button for all screen sizes */}
          <button
            type="button"
            className="p-2 rounded-md text-gray-500 hover:bg-gray-100"
            onClick={toggleSidebar}
            aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              )}
            </svg>
          </button>
        </div>
        
        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {navigationItems.map(renderNavItem)}
        </nav>
      </div>
    </>
  );
} 