"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getLessonById } from '../../../lib/services/lessonService';
import { Lesson } from '../../../lib/types';

// Prevent static prerendering
export const dynamic = 'force-dynamic';

export default function LessonPage({ params }: { params: { id: string } }) {
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const { id } = params;

  useEffect(() => {
    async function fetchLesson() {
      try {
        const lessonData = await getLessonById(id);
        if (lessonData) {
          setLesson(lessonData);
        } else {
          setError('Lesson not found');
        }
        setLoading(false);
      } catch (err) {
        console.error(`Error fetching lesson with ID ${id}:`, err);
        setError('Failed to load lesson. Please try again later.');
        setLoading(false);
      }
    }

    if (id) {
      fetchLesson();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl font-medium text-primary">Loading lesson...</div>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="text-xl font-medium text-red-500">{error || 'Lesson not found'}</div>
        <button
          onClick={() => router.push('/lessons')}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
        >
          Back to Lessons
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link 
            href="/lessons" 
            className="text-primary hover:text-primary/80 flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Lessons
          </Link>
        </div>

        <div className="bg-white rounded-xl overflow-hidden shadow-lg">
          <div className="relative h-64 w-full">
            {lesson.imageUrl ? (
              <Image
                src={lesson.imageUrl}
                alt={lesson.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                <span className="text-primary">No image</span>
              </div>
            )}
            <div className="absolute top-4 right-4 bg-primary text-white text-sm font-medium py-1 px-3 rounded-full">
              {lesson.level}
            </div>
          </div>

          <div className="p-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold text-primary">{lesson.title}</h1>
              <span className="text-sm font-medium text-secondary bg-secondary/10 py-1 px-3 rounded-full">
                {lesson.duration}
              </span>
            </div>

            <p className="text-lg text-muted-foreground mb-8">{lesson.description}</p>

            <div className="border-t border-border pt-6">
              <h2 className="text-xl font-semibold text-primary mb-4">Lesson Content</h2>
              
              {/* This would be replaced with actual lesson content */}
              <div className="prose max-w-none">
                <p>This is a placeholder for the actual lesson content. In a real application, this would contain the full lesson materials, including:</p>
                <ul>
                  <li>Vocabulary lists</li>
                  <li>Grammar explanations</li>
                  <li>Practice exercises</li>
                  <li>Audio recordings</li>
                  <li>Interactive elements</li>
                </ul>
                <p>The content would be tailored to the specific lesson topic and level.</p>
              </div>
            </div>

            <div className="mt-8 flex justify-between">
              <button
                className="px-4 py-2 bg-white border border-primary text-primary rounded-md hover:bg-primary/5 transition-colors"
                onClick={() => router.push('/lessons')}
              >
                Back to Lessons
              </button>
              <button
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
              >
                Mark as Complete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 