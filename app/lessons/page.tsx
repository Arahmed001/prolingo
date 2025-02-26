"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getLessons } from '../../lib/services/lessonService';
import { Lesson } from '../../lib/types';

// Prevent static prerendering
export const dynamic = 'force-dynamic';

export default function LessonsPage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchLessons() {
      try {
        const lessonData = await getLessons();
        console.log('Fetched lessons:', lessonData); // Log fetched lessons for debugging
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl font-medium text-primary">Loading lessons...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl font-medium text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary mb-4">English Lessons</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Browse our collection of English language lessons designed for different proficiency levels.
          </p>
        </div>

        {lessons.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">No lessons available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {lessons.map((lesson) => (
              <Link 
                href={`/lessons/${lesson.id}`} 
                key={lesson.id}
                className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                <div className="relative h-48 w-full">
                  {lesson.imageUrl ? (
                    <Image
                      src={lesson.imageUrl}
                      alt={lesson.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gray-300 flex items-center justify-center">
                      <div className="w-16 h-12 bg-gray-400 rounded"></div>
                    </div>
                  )}
                  <div className="absolute top-4 right-4 bg-primary text-white text-sm font-medium py-1 px-3 rounded-full">
                    {lesson.level}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-primary mb-2">{lesson.title}</h3>
                  <p className="text-muted-foreground mb-4">{lesson.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-secondary">
                      {lesson.duration}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      View Lesson 
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 