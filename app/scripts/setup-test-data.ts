import { db } from '../../lib/firebase/init';
import { collection, addDoc, doc, setDoc } from 'firebase/firestore';

const SAMPLE_USER_ID = 'test_user_123';

// Sample chat messages with sentiment
const sampleChats = [
  {
    userId: SAMPLE_USER_ID,
    message: "Hello! I'm excited to start learning!",
    sentiment: 'positive',
    isAI: false,
    timestamp: new Date(Date.now() - 86400000 * 5) // 5 days ago
  },
  {
    userId: SAMPLE_USER_ID,
    message: "That's great to hear! Would you like to try something challenging to push your skills further?",
    sentiment: 'neutral',
    isAI: true,
    timestamp: new Date(Date.now() - 86400000 * 5 + 1000)
  },
  {
    userId: SAMPLE_USER_ID,
    message: "This is really difficult, I'm feeling frustrated",
    sentiment: 'negative',
    isAI: false,
    timestamp: new Date(Date.now() - 86400000 * 3) // 3 days ago
  },
  {
    userId: SAMPLE_USER_ID,
    message: "I understand this might be frustrating. Let's break it down into smaller, more manageable steps. Would you like to try an easier example?",
    sentiment: 'neutral',
    isAI: true,
    timestamp: new Date(Date.now() - 86400000 * 3 + 1000)
  },
  {
    userId: SAMPLE_USER_ID,
    message: "Yes, that helps! I understand it better now",
    sentiment: 'positive',
    isAI: false,
    timestamp: new Date(Date.now() - 86400000 * 3 + 2000)
  }
];

// Sample progress data showing improvement over time
const sampleProgress = [
  {
    userId: SAMPLE_USER_ID,
    lessonId: 'lesson1',
    score: 65,
    timestamp: new Date(Date.now() - 86400000 * 10) // 10 days ago
  },
  {
    userId: SAMPLE_USER_ID,
    lessonId: 'lesson1',
    score: 75,
    timestamp: new Date(Date.now() - 86400000 * 7) // 7 days ago
  },
  {
    userId: SAMPLE_USER_ID,
    lessonId: 'lesson1',
    score: 85,
    timestamp: new Date(Date.now() - 86400000 * 4) // 4 days ago
  },
  {
    userId: SAMPLE_USER_ID,
    lessonId: 'lesson1',
    score: 90,
    timestamp: new Date(Date.now() - 86400000 * 1) // 1 day ago
  }
];

// Sample lesson with different difficulty levels
const sampleLesson = {
  id: 'lesson1',
  title: 'Basic Greetings',
  content: 'Hello! Welcome to the basic greetings lesson. We will learn how to say hello and goodbye.',
  level: 'A1',
  difficulty: 1,
  nextLevelContent: 'Welcome to intermediate greetings! In this lesson, we will explore formal and informal greetings, and learn about cultural differences in greetings.'
};

export async function setupTestData() {
  try {
    // Create test user
    await setDoc(doc(db, 'users', SAMPLE_USER_ID), {
      email: 'test@example.com',
      level: 'A1',
      createdAt: new Date()
    });

    // Add chat messages
    for (const chat of sampleChats) {
      await addDoc(collection(db, 'chats'), chat);
    }

    // Add progress data
    for (const progress of sampleProgress) {
      await addDoc(collection(db, 'progress'), progress);
    }

    // Add lesson
    await setDoc(doc(db, 'lessons', 'lesson1'), sampleLesson);

    console.log('Test data setup completed successfully!');
  } catch (error) {
    console.error('Error setting up test data:', error);
  }
} 