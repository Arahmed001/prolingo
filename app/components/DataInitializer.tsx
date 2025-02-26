'use client';

import { useEffect } from 'react';
import { isFirebaseInitialized } from '../../lib/firebase';
import { addSampleQuizzes } from '../../lib/scripts/sampleQuizzes';
import { addSampleThreads } from '../../lib/scripts/sampleThreads';

export default function DataInitializer() {
  // Initialize sample data when the app starts
  useEffect(() => {
    const initializeData = async () => {
      // Wait for Firebase to initialize
      if (isFirebaseInitialized()) {
        try {
          // Add sample quizzes if none exist
          await addSampleQuizzes();
          // Add sample threads if none exist
          await addSampleThreads();
        } catch (error) {
          console.error('Error initializing sample data:', error);
        }
      }
    };

    initializeData();
  }, []);

  // This component doesn't render anything
  return null;
} 