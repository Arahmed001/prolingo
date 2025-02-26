"use client";

import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

interface CulturalCard {
  title: string;
  note: string;
  icon: React.ReactNode;
  color: string;
}

export default function CulturalInsightsPage() {
  // Static cultural insights cards
  const culturalCards: CulturalCard[] = [
    {
      title: 'Greetings',
      note: 'In English-speaking countries, a handshake is the common greeting in formal settings, while a simple "Hello" or "Hi" is used in casual encounters. In contrast, many European cultures greet with cheek kisses.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
        </svg>
      ),
      color: 'bg-blue-50 border-blue-200'
    },
    {
      title: 'Idioms',
      note: '"It\'s raining cats and dogs" means it\'s raining heavily. This peculiar phrase likely originated in 17th century England when poor drainage systems would cause drowned animals to wash up in the streets after storms.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
        </svg>
      ),
      color: 'bg-purple-50 border-purple-200'
    },
    {
      title: 'Table Manners',
      note: 'In the United States, it\'s common to switch the fork to your dominant hand after cutting food. In Europe, however, the fork typically remains in the left hand and the knife in the right throughout the meal.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
        </svg>
      ),
      color: 'bg-amber-50 border-amber-200'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow bg-gray-50 py-8 sm:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="font-heading text-3xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">Cultural Insights</h1>
            <p className="max-w-2xl mx-auto text-base sm:text-xl text-gray-600">
              Discover the nuances of language and culture that make communication meaningful.
            </p>
          </div>
          
          {/* Cultural Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {culturalCards.map((card, index) => (
              <div 
                key={index} 
                className={`rounded-lg border ${card.color} overflow-hidden shadow-sm transition-all hover:shadow-md`}
              >
                <div className="p-5 sm:p-6">
                  <div className="flex items-center mb-4">
                    <div className="mr-3 p-2 rounded-full bg-white shadow-sm">
                      {card.icon}
                    </div>
                    <h2 className="font-heading text-lg sm:text-xl font-semibold text-gray-900">{card.title}</h2>
                  </div>
                  <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                    {card.note}
                  </p>
                </div>
                <div className={`px-5 sm:px-6 py-3 bg-white border-t ${card.color.replace('bg-', 'border-')}`}>
                  <button className="text-primary hover:text-primary-dark font-medium text-sm transition-colors flex items-center">
                    Learn more
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {/* Additional Content Section */}
          <div className="mt-10 sm:mt-16 bg-white rounded-lg shadow-sm p-5 sm:p-8 border border-gray-200">
            <h2 className="font-heading text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Why Cultural Insights Matter</h2>
            <p className="text-gray-700 text-sm sm:text-base mb-4">
              Understanding cultural nuances is essential for effective communication in a new language. 
              Beyond vocabulary and grammar, cultural context shapes how native speakers interpret and 
              respond to different situations.
            </p>
            <p className="text-gray-700 text-sm sm:text-base">
              Our cultural insights help you navigate social interactions with confidence, avoid 
              misunderstandings, and connect more authentically with native speakers.
            </p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 