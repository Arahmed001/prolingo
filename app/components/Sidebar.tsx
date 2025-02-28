"use client";

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useLanguage } from './I18nProvider';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

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
      label: t('student') || 'Student',
      href: '/student',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
        </svg>
      ),
      children: [
        { label: t('lessons') || 'Lessons', href: '/student/lessons' },
        { label: t('progress') || 'Progress', href: '/student/progress' },
        { label: t('quizzes') || 'Quizzes', href: '/student/quizzes' }
      ]
    },
    {
      label: t('teacher') || 'Teacher',
      href: '/teacher',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
        </svg>
      ),
      children: [
        { label: t('classroom') || 'Classroom', href: '/teacher/classroom' },
        { label: t('students') || 'Students', href: '/teacher/students' },
        { label: t('assignments') || 'Assignments', href: '/teacher/assignments' }
      ]
    },
    {
      label: t('assessment') || 'Assessment',
      href: '/assessment',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
          <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
        </svg>
      ),
      children: [
        { label: t('tests') || 'Tests', href: '/assessment/tests' },
        { label: t('results') || 'Results', href: '/assessment/results' },
        { label: t('analytics') || 'Analytics', href: '/assessment/analytics' }
      ]
    },
    {
      label: t('community') || 'Community',
      href: '/community',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
        </svg>
      ),
      children: [
        { label: t('forums') || 'Forums', href: '/community/forums' },
        { label: t('events') || 'Events', href: '/community/events' },
        { label: t('leaderboard') || 'Leaderboard', href: '/community/leaderboard' }
      ]
    },
    {
      label: t('admin') || 'Admin',
      href: '/admin',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
        </svg>
      ),
      children: [
        { label: t('users') || 'Users', href: '/admin/users' },
        { label: t('content') || 'Content', href: '/admin/content' }
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
    },
    {
      label: t('settings') || 'Settings',
      href: '/settings',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
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