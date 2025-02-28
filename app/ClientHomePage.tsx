"use client";

import { useEffect } from 'react';
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from './components/I18nProvider';
import { usePerformanceMonitoring } from '../lib/performance';

interface Feature {
  title: string;
  desc: string;
  icon: React.ReactNode;
}

interface ClientHomePageProps {
  features: Feature[];
}

export default function ClientHomePage({ features }: ClientHomePageProps) {
  // Use our custom language hook
  const { t } = useLanguage();
  
  // Add performance monitoring
  usePerformanceMonitoring('/');
  
  return (
    <>
      <main id="main-content" className="flex min-h-screen flex-col">
        {/* Hero Section with Navy Background */}
        <section className="relative py-12 sm:py-16 md:py-20 lg:py-32 px-4 sm:px-6 bg-primary text-white overflow-hidden" aria-labelledby="hero-heading">
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0" aria-hidden="true">
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-secondary opacity-10 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 -left-24 w-80 h-80 bg-accent opacity-10 rounded-full blur-3xl"></div>
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-20"></div>
          </div>
          
          <div className="container mx-auto max-w-7xl relative z-10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8 lg:gap-12">
              <div className="w-full md:w-1/2">
                <div className="inline-block px-3 sm:px-4 py-1 bg-accent/20 rounded-full text-accent font-medium text-xs sm:text-sm mb-4 sm:mb-6">
                  CEFR-Aligned Language Learning
                </div>
                <h1 id="hero-heading" className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight md:leading-tight">
                  {t('welcome') || 'Welcome'}
                </h1>
                <p className="mt-4 sm:mt-6 text-lg sm:text-xl text-white/80 max-w-lg">
                  ProLingo combines artificial intelligence with linguistic expertise to deliver personalised language learning experiences.
                </p>
                <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-4">
                  <Link tabIndex={0} 
                    href="/register" 
                    className="btn-accent py-3 px-8 rounded-full text-center font-medium"
                    role="button"
                    aria-label="Get started with ProLingo"
                  >
                    {t('startLearning') || 'Start Learning'}
                  </Link>
                  <Link tabIndex={0} 
                    href="/marketing" 
                    className="py-3 px-8 rounded-full text-center font-medium bg-white/10 hover:bg-white/20 transition"
                    role="button"
                    aria-label="Learn more about ProLingo marketing"
                  >
                    <span className="flex items-center justify-center">
                      <span>Marketing</span>
                      <svg className="w-5 h-5 ml-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </span>
                  </Link>
                </div>
                <div className="mt-4">
                  <Link tabIndex={0} 
                    href="/about" 
                    className="text-white/80 hover:text-white underline text-sm flex items-center"
                    role="button"
                    aria-label="Learn more about ProLingo"
                  >
                    {t('about') || 'About'} <span className="ml-1">→</span>
                  </Link>
                </div>
              </div>
              <div className="w-full md:w-1/2 mt-8 md:mt-0">
                <div className="relative w-full h-80 sm:h-96 md:h-[500px]">
                  <Image
                    src="/hero-image.png"
                    alt="Students learning languages with ProLingo platform"
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-contain"
                    loading="lazy"
                    priority={false}
                    unoptimized={true}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6" aria-labelledby="features-heading">
          <div className="container mx-auto max-w-7xl">
            <div className="text-center mb-12 sm:mb-16">
              <h2 id="features-heading" className="text-3xl sm:text-4xl font-bold text-gray-900">
                {t('features') || 'Features'}
              </h2>
              <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
                Our AI-powered platform offers everything you need to master a new language effectively.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
              {features.map((feature, i) => (
                <div 
                  key={i} 
                  className="bg-white rounded-xl p-6 sm:p-8 shadow-sm border border-gray-100 hover:shadow-md transition"
                >
                  <div className="rounded-full w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center bg-primary/5 text-primary mb-4 sm:mb-6">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2 sm:mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
            
            <div className="mt-12 sm:mt-16 text-center">
              <Link tabIndex={0} 
                href="/features" 
                className="btn-primary py-3 px-8 rounded-full text-center font-medium inline-block"
                role="button"
                aria-label="Explore all features"
              >
                {t('exploreFeatures', 'Explore All Features')}
              </Link>
            </div>
          </div>
        </section>
        
        {/* Marketing Banner */}
        <section className="py-12 bg-blue-600 text-white">
          <div className="container mx-auto max-w-7xl px-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold">Want to learn more about ProLingo?</h2>
                <p className="mt-2 text-blue-100">Check out our marketing page for more information and testimonials.</p>
              </div>
              <Link 
                href="/marketing" 
                className="px-6 py-3 bg-white text-blue-600 rounded-md font-medium hover:bg-blue-50 transition-colors"
              >
                Visit Marketing Page
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
} 