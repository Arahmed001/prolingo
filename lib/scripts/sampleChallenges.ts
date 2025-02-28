import { db } from '../firebase';
import { 
  collection, 
  query, 
  getDocs, 
  addDoc, 
  where,
  serverTimestamp 
} from 'firebase/firestore';

interface Challenge {
  lessonId: string;
  question: string;
  hint: string;
  difficulty: 'easy' | 'medium' | 'hard';
  createdAt: any;
}

export const addSampleChallenges = async () => {
  try {
    // Check if challenges already exist
    const challengesQuery = query(collection(db, 'challenges'));
    const challengesSnapshot = await getDocs(challengesQuery);
    
    if (!challengesSnapshot.empty) {
      console.log(`Found ${challengesSnapshot.docs.length} existing challenges. Skipping sample data creation.`);
      return;
    }
    
    // Get lessons to link challenges to
    const lessonsQuery = query(collection(db, 'lessons'));
    const lessonsSnapshot = await getDocs(lessonsQuery);
    
    if (lessonsSnapshot.empty) {
      console.log('No lessons found. Please add lessons first.');
      return;
    }
    
    const lessonIds = lessonsSnapshot.docs.map(doc => doc.id);
    
    // Sample challenges to add
    const sampleChallenges: Challenge[] = [
      {
        lessonId: lessonIds[0] || 'lesson-placeholder',
        question: 'Create a sentence using the greeting "Good morning" in a formal context.',
        hint: 'Think about how you would greet someone in a professional setting.',
        difficulty: 'easy',
        createdAt: serverTimestamp()
      },
      {
        lessonId: lessonIds[Math.min(1, lessonIds.length - 1)] || 'lesson-placeholder',
        question: 'Translate the following sentence: "I would like to order a coffee, please."',
        hint: 'Use the vocabulary for ordering food and drinks.',
        difficulty: 'medium',
        createdAt: serverTimestamp()
      },
      {
        lessonId: lessonIds[Math.min(2, lessonIds.length - 1)] || 'lesson-placeholder',
        question: 'Write a short dialogue between two people meeting for the first time.',
        hint: 'Include greetings, introductions, and at least one question.',
        difficulty: 'medium',
        createdAt: serverTimestamp()
      },
      {
        lessonId: lessonIds[Math.min(3, lessonIds.length - 1)] || 'lesson-placeholder',
        question: 'Describe your daily routine using at least 5 time-related expressions.',
        hint: 'Include activities from morning to evening and use appropriate time markers.',
        difficulty: 'hard',
        createdAt: serverTimestamp()
      },
      {
        lessonId: lessonIds[Math.min(4, lessonIds.length - 1)] || 'lesson-placeholder',
        question: 'Write three sentences using the past tense to describe what you did yesterday.',
        hint: 'Focus on using the correct verb form for past actions.',
        difficulty: 'medium',
        createdAt: serverTimestamp()
      }
    ];
    
    // Add challenges to Firebase
    for (const challenge of sampleChallenges) {
      await addDoc(collection(db, 'challenges'), challenge);
    }
    
    console.log(`Added ${sampleChallenges.length} sample challenges to Firestore.`);
  } catch (error) {
    console.error('Error adding sample challenges:', error);
  }
}; 