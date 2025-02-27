"use client";

/*
 * TODO: Further Customization Steps for Lessons Page
 * 
 * 1. Add Category Field to Lesson Data:
 *    - Update the Lesson interface in lib/types.ts to include a 'category' field
 *    - Modify lessonService.ts to include categories in sample lessons
 *    - Update existing lessons in Firebase with appropriate categories
 * 
 * 2. Improve Lesson Grouping Logic:
 *    - Replace the current index-based grouping with actual category-based grouping
 *    - Update getLessonsByCategory() to filter by the actual category field
 * 
 * 3. Enhance Visual Elements:
 *    - Add custom icons for each category (replace generic book icon)
 *    - Consider adding lesson thumbnails to the dropdowns
 *    - Add tooltips to action buttons for better UX
 * 
 * 4. Add Additional Filtering Options:
 *    - Filter by duration (e.g., "30 min", "45 min")
 *    - Filter by topic tags (requires adding tags to lesson data)
 *    - Add sorting options (newest, most popular, etc.)
 * 
 * 5. Implement Analytics:
 *    - Track which categories and lessons are most viewed
 *    - Add a "Popular Lessons" section based on analytics
 * 
 * 6. Improve Accessibility:
 *    - Ensure proper ARIA labels on all interactive elements
 *    - Test with screen readers and keyboard navigation
 *    - Add high contrast mode option
 * 
 * 7. Add User Preferences:
 *    - Save user's last selected level filter in localStorage
 *    - Implement a "favourite lessons" feature
 *    - Add recently viewed lessons section
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getLessons } from '../../lib/services/lessonService';
import { Lesson } from '../../lib/types';
import FirebaseGuard from '../components/FirebaseGuard';
import { usePerformanceMonitoring } from '../../lib/performance';

// Flag image blur placeholders
const flagImagePlaceholders = {
  spanish: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z/C/HgAGgwJ/lK3Q6wAAAABJRU5ErkJggg==',
  french: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z/C/HgAGgwJ/lK3Q6wAAAABJRU5ErkJggg==',
  chinese: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z/C/HgAGgwJ/lK3Q6wAAAABJRU5ErkJggg==',
  english: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z/C/HgAGgwJ/lK3Q6wAAAABJRU5ErkJggg==',
};

// Prevent static prerendering
export const dynamic = 'force-dynamic';

export default function LessonsPage() {
  // Add performance monitoring
  usePerformanceMonitoring('/lessons');
  
  return (
    <FirebaseGuard
      fallback={
        <div id="main-content" className="min-h-screen bg-muted py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
          <div id="main-content" className="max-w-7xl mx-auto">
            <div id="main-content" className="text-center mb-8 sm:mb-12">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-3 sm:mb-4">English Lessons</h1>
              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
                Loading lessons...
              </p>
            </div>
          </div>
        </div>
      }
    >
      <LessonsContent />
    </FirebaseGuard>
  );
}

// Define lesson categories
const LESSON_CATEGORIES = [
  {
    id: 'foundational',
    title: 'FOUNDATIONAL LITERACY LESSONS',
    description: 'Our complete progressive curriculum for beginners, introducing the fundamentals',
    color: 'bg-red-500',
    textColor: 'text-white',
    borderColor: 'border-red-400',
    hoverColor: 'hover:bg-red-600',
    icon: (
      <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    id: 'reading',
    title: 'READING FOR NEWCOMERS',
    description: 'Stand-alone reading lessons for students at the newcomer level',
    color: 'bg-red-400',
    textColor: 'text-white',
    borderColor: 'border-red-300',
    hoverColor: 'hover:bg-red-500',
    icon: (
      <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    id: 'speaking',
    title: 'SPEAKING FOR NEWCOMERS',
    description: 'Stand-alone speaking lessons for students at the newcomer level',
    color: 'bg-orange-500',
    textColor: 'text-white',
    borderColor: 'border-orange-400',
    hoverColor: 'hover:bg-orange-600',
    icon: (
      <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
  {
    id: 'curriculum',
    title: 'STEP-BY-STEP CURRICULUM',
    description: 'Our module of 35 lessons for beginner-level students',
    color: 'bg-orange-400',
    textColor: 'text-white',
    borderColor: 'border-orange-300',
    hoverColor: 'hover:bg-orange-500',
    icon: (
      <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    id: 'listening',
    title: 'LISTENING PRACTICE',
    description: 'Focused listening exercises for all levels',
    color: 'bg-amber-500',
    textColor: 'text-white',
    borderColor: 'border-amber-400',
    hoverColor: 'hover:bg-amber-600',
    icon: (
      <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
      </svg>
    ),
  },
  {
    id: 'grammar',
    title: 'GRAMMAR ESSENTIALS',
    description: 'Key grammar concepts explained simply',
    color: 'bg-green-500',
    textColor: 'text-white',
    borderColor: 'border-green-400',
    hoverColor: 'hover:bg-green-600',
    icon: (
      <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
];

function LessonsContent() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [selectedDuration, setSelectedDuration] = useState('All');
  
  // Group lessons by level for filtering
  const levels = ['All', 'A0', 'A1', 'A2', 'B1', 'B1+', 'B2', 'C1'];
  
  // Duration options for filtering
  const durations = ['All', '30 minutes', '45 minutes', '60 minutes'];

  useEffect(() => {
    async function fetchLessons() {
      try {
        const lessonData = await getLessons();
        console.log('Fetched lessons:', lessonData);
        setLessons(lessonData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching lessons:', err);
        setError('Failed to load lessons. Please try again later.');
        setLoading(false);
      }
    }

    fetchLessons();
  }, []);

  // Filter lessons based on search term, selected level, and duration
  const filteredLessons = lessons.filter(lesson => {
    const matchesSearch = lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         lesson.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = selectedLevel === 'All' || lesson.level === selectedLevel;
    const matchesDuration = selectedDuration === 'All' || lesson.duration === selectedDuration;
    return matchesSearch && matchesLevel && matchesDuration;
  });

  // Group lessons by category (for this demo, we'll use level as a proxy for category)
  const getLessonsByCategory = (categoryId: string) => {
    // Use the actual category field from the lessons
    return filteredLessons.filter(lesson => 
      // If the lesson has a category field, use it; otherwise, distribute by index as fallback
      lesson.category 
        ? lesson.category === categoryId 
        : filteredLessons.indexOf(lesson) % LESSON_CATEGORIES.length === LESSON_CATEGORIES.findIndex(cat => cat.id === categoryId)
    );
  };

  if (loading) {
    return (
      <div id="main-content" className="min-h-screen flex items-center justify-center">
        <div id="main-content" className="text-base sm:text-xl font-medium text-primary">Loading lessons...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div id="main-content" className="min-h-screen flex items-center justify-center">
        <div id="main-content" className="text-base sm:text-xl font-medium text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div id="main-content" className="min-h-screen bg-muted py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div id="main-content" className="max-w-7xl mx-auto">
        <div id="main-content" className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-3 sm:mb-4">English Lessons</h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Browse our collection of English language lessons designed for different proficiency levels.
          </p>
        </div>

        {/* Search Bar */}
        <div id="main-content" className="mb-6 bg-primary text-white p-4 rounded-md flex items-center">
          <div id="main-content" className="mr-2 whitespace-nowrap">I'm looking for:</div>
          <input
            type="text"
            placeholder="Search by grammar terms, lesson topics or words & phrases"
            className="flex-1 p-2 rounded-md text-black"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button aria-label="Button" tabIndex={0} className="ml-2 bg-secondary p-2 rounded-md">
            <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Filters */}
        <div id="main-content" className="mb-8 border border-border rounded-md p-4">
          <div id="main-content" className="text-sm font-medium mb-2">FILTERS:</div>
          
          {/* Level Filters */}
          <div id="main-content" className="mb-4">
            <div id="main-content" className="text-xs text-muted-foreground mb-1">LEVEL:</div>
            <div id="main-content" className="flex flex-wrap gap-2">
              {levels.map(level => (
                <button
                  key={level}
                  className={`px-4 py-1 rounded-md text-sm font-medium transition-colors ${
                    selectedLevel === level 
                      ? level === 'All' 
                        ? 'bg-gray-200 text-gray-800' 
                        : level === 'A0' 
                          ? 'bg-red-500 text-white'
                          : level === 'A1'
                            ? 'bg-red-400 text-white'
                            : level === 'A2'
                              ? 'bg-orange-500 text-white'
                              : level === 'B1'
                                ? 'bg-amber-500 text-white'
                                : level === 'B1+'
                                  ? 'bg-amber-400 text-white'
                                  : level === 'B2'
                                    ? 'bg-green-500 text-white'
                                    : 'bg-green-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setSelectedLevel(level)} onKeyDown={(e) => { if(e.key === "Enter" || e.key === " ") e.target.click(); }}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
          
          {/* Duration Filters */}
          <div>
            <div id="main-content" className="text-xs text-muted-foreground mb-1">DURATION:</div>
            <div id="main-content" className="flex flex-wrap gap-2">
              {durations.map(duration => (
                <button
                  key={duration}
                  className={`px-4 py-1 rounded-md text-sm font-medium transition-colors ${
                    selectedDuration === duration 
                      ? 'bg-primary text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setSelectedDuration(duration)} onKeyDown={(e) => { if(e.key === "Enter" || e.key === " ") e.target.click(); }}
                >
                  {duration}
                </button>
              ))}
            </div>
          </div>
        </div>

        {filteredLessons.length === 0 ? (
          <div id="main-content" className="text-center py-8 sm:py-12">
            <p className="text-base sm:text-lg text-muted-foreground">No lessons match your search criteria.</p>
          </div>
        ) : (
          <div id="main-content" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {LESSON_CATEGORIES.map((category) => {
              const categoryLessons = getLessonsByCategory(category.id);
              if (categoryLessons.length === 0) return null;
              
              return (
                <div 
                  key={category.id} 
                  id={`category-${category.id}`}
                  className={`rounded-lg overflow-hidden shadow-md ${category.color} ${category.textColor}`}
                >
                  <div id="main-content" className="p-5">
                    <div id="main-content" className="flex items-start mb-4">
                      <div id="main-content" className="mr-4">
                        {category.icon}
                      </div>
                      <div>
                        <h2 className="text-lg font-bold mb-2">{category.title}</h2>
                        <p className="text-sm opacity-90">{category.description}</p>
                      </div>
                    </div>
                    
                    {/* Lesson Selector */}
                    <div id="main-content" className="mt-4 mb-2">
                      <select 
                        className="w-full p-2 rounded-md text-gray-800 text-sm"
                        onChange={(e) => {
                          if (e.target.value) {
                            window.location.href = `/lessons/${e.target.value}`;
                          }
                        }}
                        defaultValue=""
                        aria-label={`Select a ${category.title.toLowerCase()} lesson`}
                      >
                        <option value="" disabled>Select a lesson</option>
                        {categoryLessons.map(lesson => (
                          <option key={lesson.id} value={lesson.id}>
                            {lesson.title} - {lesson.level}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs mt-1 opacity-80 text-center">Select a specific lesson to open</p>
                    </div>
                    
                    {/* Action Buttons */}
                    <div id="main-content" className="flex mt-4 space-x-2 justify-center">
                      {categoryLessons.length > 0 && (
                        <div id="main-content" className="flex flex-col items-center">
                          <Link tabIndex={0} 
                            href={`/lessons/${categoryLessons[0].id}`}
                            className="p-3 rounded-full bg-white/30 hover:bg-white/50 relative group transition-all hover:scale-110 flex items-center justify-center shadow-md"
                            aria-label="Play lesson introduction"
                          >
                            <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                            </svg>
                            <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs bg-gray-800 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                              Open First Lesson
                            </span>
                          </Link>
                          <p className="text-xs mt-1 opacity-80">Start</p>
                        </div>
                      )}
                      <div id="main-content" className="flex flex-col items-center">
                        <button tabIndex={0} 
                          className="p-2 rounded-full bg-white/20 hover:bg-white/30 relative group"
                          aria-label="Preview lesson"
                          onClick={() => {
                            if (categoryLessons.length > 0) {
                              const randomIndex = Math.floor(Math.random() * categoryLessons.length);
                              window.location.href = `/lessons/${categoryLessons[randomIndex].id}`;
                            }
                          }}
                        >
                          <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                          </svg>
                          <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs bg-gray-800 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            Open Random Lesson
                          </span>
                        </button>
                        <p className="text-xs mt-1 opacity-80">Random</p>
                      </div>
                      <div id="main-content" className="flex flex-col items-center">
                        <button tabIndex={0} 
                          className="p-2 rounded-full bg-white/20 hover:bg-white/30 relative group"
                          aria-label="View all lessons in this category"
                          onClick={() => {
                            setSearchTerm('');
                            setSelectedLevel('All');
                            setSelectedDuration('All');
                            // Filter by this category
                            document.getElementById(`category-${category.id}`)?.scrollIntoView({ behavior: 'smooth' });
                          }}
                        >
                          <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                            <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                          </svg>
                          <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs bg-gray-800 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            View All Lessons
                          </span>
                        </button>
                        <p className="text-xs mt-1 opacity-80">All</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// Use this function anywhere in the component where you render flag images
const renderFlagImage = (language: string, altText: string) => (
  <div className="relative h-5 w-8 mr-2">
    <Image
      src={`/flags/${language.toLowerCase()}.svg`}
      alt={altText}
      fill
      sizes="32px"
      className="object-cover rounded-sm"
      loading="lazy"
      placeholder="blur"
      blurDataURL={flagImagePlaceholders[language.toLowerCase()] || flagImagePlaceholders.english}
      unoptimized={true}
    />
  </div>
); 