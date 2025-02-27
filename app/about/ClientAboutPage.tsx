"use client";

import { useEffect } from 'react';
import Link from 'next/link';
import { usePerformanceMonitoring } from '../../lib/performance';

interface MissionContent {
  title: string;
  paragraphs: string[];
}

interface Feature {
  title: string;
  description: string;
  icon: string;
}

interface ClientAboutPageProps {
  mission: MissionContent;
  features: Feature[];
}

export default function ClientAboutPage({ mission, features }: ClientAboutPageProps) {
  // Add performance monitoring
  usePerformanceMonitoring('/about');
  
  // Render the icon based on the icon name
  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'computer':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        );
      case 'chart':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
      case 'globe':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'practice':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        );
      case 'community':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        );
      case 'teacher':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path d="M12 14l9-5-9-5-9 5 9 5z" />
            <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  return (
    <div id="main-content" className="min-h-screen bg-muted py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div id="main-content" className="max-w-7xl mx-auto">
        <div id="main-content" className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-3 sm:mb-4">About ProLingo</h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Empowering ESL learners with AI-driven tools
          </p>
        </div>
        
        <div id="main-content" className="bg-white p-5 sm:p-8 rounded-xl shadow-md mb-8 sm:mb-12">
          <h2 className="text-xl sm:text-2xl font-bold text-primary mb-3 sm:mb-4">{mission.title}</h2>
          {mission.paragraphs.map((paragraph, i) => (
            <p key={i} className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4">
              {paragraph}
            </p>
          ))}
        </div>
        
        <h2 className="text-xl sm:text-2xl font-bold text-primary mb-4 sm:mb-6 text-center">Why Choose ProLingo</h2>
        
        <div id="main-content" className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8 mt-6 sm:mt-8">
          {features.map((feature, i) => (
            <div key={i} id="main-content" className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
              <div id="main-content" className="w-12 h-12 sm:w-16 sm:h-16 bg-primary/10 rounded-full mb-3 sm:mb-4 flex items-center justify-center">
                <span className="text-xl sm:text-2xl">
                  {renderIcon(feature.icon)}
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-primary mb-1 sm:mb-2">{feature.title}</h3>
              <p className="text-xs sm:text-sm md:text-base text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
        
        <div id="main-content" className="mt-10 sm:mt-16 text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-primary mb-4 sm:mb-6">Start Your Language Journey Today</h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-6 sm:mb-8">
            Join thousands of learners who are achieving their language goals with ProLingo.
          </p>
          <Link href="/register" className="inline-block py-2 sm:py-3 px-6 sm:px-8 bg-primary text-white text-sm sm:text-base font-medium rounded-lg hover:bg-primary/90 transition-colors">
            Sign Up for Free
          </Link>
        </div>
      </div>
    </div>
  );
} 