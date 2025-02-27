"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { auth, db } from '../../lib/firebase/init';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { setupTestData } from '../scripts/setup-test-data';

interface LessonProgress {
  lessonId: string;
  completed: boolean;
  timestamp?: Date;
}

interface PathLesson {
  id: string;
  title: string;
  level: string;
  description: string;
  completed: boolean;
}

// Prevent static prerendering
export const dynamic = 'force-dynamic';

export default function LearningPathPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userLevel, setUserLevel] = useState('A1');
  const [lessons, setLessons] = useState<PathLesson[]>([]);
  const [progress, setProgress] = useState<{[key: string]: boolean}>({});
  
  const router = useRouter();

  // Default learning paths by CEFR level
  const defaultPaths: { [key: string]: PathLesson[] } = {
    'A1': [
      { id: 'greetings', title: 'Greetings', level: 'A1', description: 'Learn basic greetings and introductions', completed: false },
      { id: 'numbers', title: 'Numbers', level: 'A1', description: 'Master numbers from 1 to 100', completed: false },
      { id: 'colors', title: 'Colors', level: 'A1', description: 'Learn common colors and their usage', completed: false },
      { id: 'family', title: 'Family Members', level: 'A1', description: 'Vocabulary for family relationships', completed: false },
      { id: 'food', title: 'Food and Drinks', level: 'A1', description: 'Basic food and drink vocabulary', completed: false }
    ],
    'A2': [
      { id: 'hobbies', title: 'Hobbies', level: 'A2', description: 'Talk about interests and free time', completed: false },
      { id: 'travel', title: 'Travel', level: 'A2', description: 'Essential travel phrases and vocabulary', completed: false },
      { id: 'weather', title: 'Weather', level: 'A2', description: 'Discuss weather and seasons', completed: false },
      { id: 'shopping', title: 'Shopping', level: 'A2', description: 'Shopping vocabulary and conversations', completed: false },
      { id: 'directions', title: 'Directions', level: 'A2', description: 'Ask for and give directions', completed: false }
    ],
    'B1': [
      { id: 'work', title: 'Work Life', level: 'B1', description: 'Professional vocabulary and situations', completed: false },
      { id: 'health', title: 'Health', level: 'B1', description: 'Medical vocabulary and emergencies', completed: false },
      { id: 'technology', title: 'Technology', level: 'B1', description: 'Digital world and devices', completed: false },
      { id: 'environment', title: 'Environment', level: 'B1', description: 'Environmental issues and solutions', completed: false },
      { id: 'culture', title: 'Culture', level: 'B1', description: 'Cultural traditions and customs', completed: false }
    ]
  };

  useEffect(() => {
    async function fetchUserData() {
      if (!auth.currentUser) {
        router.push('/login');
        return;
      }

      try {
        // Fetch user's CEFR level
        const userRef = doc(db, 'users', auth.currentUser.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const userData = userSnap.data();
          setUserLevel(userData.level || 'A1');
        }

        // Fetch user's progress
        const progressRef = collection(db, 'progress');
        const progressQuery = query(progressRef, where('userId', '==', auth.currentUser.uid));
        const progressSnap = await getDocs(progressQuery);
        
        const progressData: {[key: string]: boolean} = {};
        progressSnap.forEach((doc) => {
          const data = doc.data();
          progressData[data.lessonId] = data.completed;
        });
        
        setProgress(progressData);

        // If no progress exists, create sample progress for the first lesson
        if (progressSnap.empty) {
          // This would typically be handled by a backend function
          console.log('No progress found - would create sample progress here');
        }

        // Get lessons for user's level
        const levelLessons = defaultPaths[userLevel] || defaultPaths['A1'];
        setLessons(levelLessons.map(lesson => ({
          ...lesson,
          completed: progressData[lesson.id] || false
        })));

        setLoading(false);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load your learning path. Please try again later.');
        setLoading(false);
      }
    }

    fetchUserData();
  }, [router]);

  const setupSampleData = async () => {
    if (!auth.currentUser) return;
    
    try {
      setLoading(true);
      await setupTestData(auth.currentUser.uid);
      // Refresh the page to show new data
      window.location.reload();
    } catch (error) {
      console.error('Error setting up sample data:', error);
      setError('Failed to set up sample data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div id="main-content" className="min-h-screen flex items-center justify-center">
        <div id="main-content" className="text-base sm:text-lg font-medium text-primary">Loading your learning path...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div id="main-content" className="min-h-screen flex items-center justify-center">
        <div id="main-content" className="text-base sm:text-lg font-medium text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div id="main-content" className="min-h-screen bg-muted py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div id="main-content" className="max-w-4xl mx-auto">
        <div id="main-content" className="bg-white shadow-md rounded-xl overflow-hidden">
          <div id="main-content" className="bg-primary px-6 py-6 sm:py-8 text-white">
            <div id="main-content" className="flex items-center justify-between">
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Your Learning Path</h1>
                <p className="mt-1 text-sm text-white/80">CEFR Level: {userLevel}</p>
              </div>
              <div id="main-content" className="flex items-center gap-4">
                <button
                  onClick={setupSampleData} onKeyDown={(e) => { if(e.key === "Enter" || e.key === " ") e.target.click(); }}
                  className="px-3 py-1 text-sm bg-white/10 hover:bg-white/20 rounded-md transition-colors"
                >
                  Set Up Test Data
                </button>
                <div id="main-content" className="bg-white/10 backdrop-blur-sm rounded-full p-1 w-12 h-12 flex items-center justify-center">
                  <span className="text-xl font-bold">{userLevel}</span>
                </div>
              </div>
            </div>
          </div>

          <div id="main-content" className="p-4 sm:p-6">
            <div id="main-content" className="relative">
              {lessons.map((lesson, index) => (
                <div key={lesson.id} className="mb-8 relative">
                  {/* Timeline connector */}
                  {index < lessons.length - 1 && (
                    <div id="main-content" className="absolute left-6 top-12 bottom-0 w-0.5 bg-gray-200"></div>
                  )}
                  
                  <div id="main-content" className="flex items-start">
                    {/* Timeline marker */}
                    <div id="main-content" className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-2 ${
                      lesson.completed 
                        ? 'bg-green-100 border-green-500' 
                        : 'bg-white border-gray-300'
                    }`}>
                      {lesson.completed ? (
                        <svg aria-hidden="true" aria-hidden="true" className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span className="text-gray-500">{index + 1}</span>
                      )}
                    </div>

                    {/* Lesson content */}
                    <div id="main-content" className="ml-4 flex-1">
                      <div id="main-content" className="bg-white rounded-lg border border-gray-200 p-4">
                        <div id="main-content" className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{lesson.title}</h3>
                            <p className="mt-1 text-sm text-gray-600">{lesson.description}</p>
                          </div>
                          <div id="main-content" className="ml-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                              {lesson.level}
                            </span>
                          </div>
                        </div>

                        <div id="main-content" className="mt-4 flex flex-col sm:flex-row gap-3">
                          {!lesson.completed ? (
                            <Link
                              href={`/lessons/${lesson.id}`}
                              className="inline-flex justify-center items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
                            >
                              Start Lesson
                            </Link>
                          ) : (
                            <Link
                              href={`/practice/${lesson.id}`}
                              className="inline-flex justify-center items-center px-4 py-2 bg-secondary text-white rounded-md hover:bg-secondary/90 transition-colors"
                            >
                              Practice Again
                            </Link>
                          )}
                          
                          {lesson.completed && (
                            <Link
                              href={`/assessment/${lesson.id}`}
                              className="inline-flex justify-center items-center px-4 py-2 bg-accent text-white rounded-md hover:bg-accent/90 transition-colors"
                            >
                              Take Assessment
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Level completion message */}
            {lessons.every(lesson => lesson.completed) && (
              <div id="main-content" className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div id="main-content" className="flex">
                  <div id="main-content" className="flex-shrink-0">
                    <svg aria-hidden="true" aria-hidden="true" className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div id="main-content" className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">
                      Congratulations! You've completed all lessons for level {userLevel}
                    </h3>
                    <div id="main-content" className="mt-2 text-sm text-green-700">
                      <p>Ready to move to the next level? Contact your teacher to update your CEFR level.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 