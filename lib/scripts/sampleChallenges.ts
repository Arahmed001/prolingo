import { db } from '../firebase';
import { 
  collection, 
  query, 
  getDocs, 
  addDoc, 
  where,
  serverTimestamp,
  writeBatch,
  doc
} from 'firebase/firestore';

interface Challenge {
  lessonId: string;
  question: string;
  hint: string;
  difficulty: 'easy' | 'medium' | 'hard';
  createdAt: any;
}

// Sample challenge data for gamification
const sampleChallenges = [
  {
    id: '1',
    task: 'Complete 3 lessons',
    duration: 'day',
    reward: 'Daily Streak Badge',
    description: 'Complete 3 different lessons within 24 hours to earn a special badge!',
    xpReward: 25,
    createdAt: serverTimestamp()
  },
  {
    id: '2',
    task: 'Complete 5 quizzes',
    duration: 'week',
    reward: 'Silver Badge',
    description: 'Master 5 different quizzes this week to earn a special silver badge!',
    xpReward: 50,
    createdAt: serverTimestamp()
  },
  {
    id: '3',
    task: 'Achieve 90% on 3 tests',
    duration: 'month',
    reward: 'Mastery Badge',
    description: 'Show your mastery by scoring at least 90% on 3 different tests!',
    xpReward: 100,
    createdAt: serverTimestamp()
  },
  {
    id: '4',
    task: 'Learn 50 vocabulary words',
    duration: 'week',
    reward: 'Vocabulary Champion',
    description: 'Expand your language skills by learning 50 new words in a week!',
    xpReward: 75,
    createdAt: serverTimestamp()
  }
];

// Sample progress data
const sampleProgress = [
  {
    userId: 'PLACEHOLDER_USER_ID', // Will be replaced with actual user ID
    lessonId: 'lesson-1',
    completed: true,
    score: 85,
    completedAt: serverTimestamp()
  },
  {
    userId: 'PLACEHOLDER_USER_ID', // Will be replaced with actual user ID
    lessonId: 'quiz-1',
    completed: true,
    score: 90,
    completedAt: serverTimestamp()
  },
  {
    userId: 'PLACEHOLDER_USER_ID', // Will be replaced with actual user ID
    lessonId: 'quiz-2',
    completed: true,
    score: 88,
    completedAt: serverTimestamp()
  }
];

/**
 * Add sample challenge data to Firebase if it doesn't already exist
 */
export async function initializeChallenges() {
  try {
    // Check if challenges already exist
    const challengesSnapshot = await getDocs(collection(db, 'challenges'));
    
    if (challengesSnapshot.empty) {
      console.log('No challenges found, adding sample data...');
      
      // Add challenges to Firebase
      const batch = writeBatch(db);
      
      sampleChallenges.forEach(challenge => {
        const challengeRef = doc(collection(db, 'challenges'), challenge.id);
        batch.set(challengeRef, challenge);
      });
      
      await batch.commit();
      console.log('Successfully added sample challenges to Firebase!');
    } else {
      console.log('Challenges already exist in Firebase. Skipping sample data creation.');
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error initializing challenges:', error);
    return { success: false, error };
  }
}

/**
 * Add sample progress data for a specific user
 */
export async function addSampleProgressForUser(userId: string) {
  try {
    // Check if the user already has progress data
    const progressQuery = query(
      collection(db, 'progress'),
      where('userId', '==', userId)
    );
    
    const progressSnapshot = await getDocs(progressQuery);
    
    if (progressSnapshot.empty) {
      console.log('No progress found for user, adding sample data...');
      
      // Add progress data for the user
      const batch = writeBatch(db);
      
      sampleProgress.forEach((progress, index) => {
        const updatedProgress = {
          ...progress,
          userId: userId,
          completedAt: serverTimestamp()
        };
        
        const progressRef = doc(collection(db, 'progress'));
        batch.set(progressRef, updatedProgress);
      });
      
      await batch.commit();
      console.log('Successfully added sample progress for user!');
    } else {
      console.log('Progress data already exists for user. Skipping sample data creation.');
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error adding sample progress:', error);
    return { success: false, error };
  }
}

// Main function to run when script is executed directly
export async function initializeGamificationData(userId?: string) {
  await initializeChallenges();
  
  if (userId) {
    await addSampleProgressForUser(userId);
  }
  
  return { success: true, message: 'Gamification data initialized successfully!' };
} 