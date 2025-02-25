// This script updates the lessons collection in Firebase with vocabulary, grammar, and audio fields
// Run with: node scripts/update-lessons.js

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, getDoc, updateDoc } = require('firebase/firestore');
require('dotenv').config();

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Sample data to add to lessons
const sampleData = {
  // Lesson 1: Basic Greetings
  'lesson1': {
    vocabulary: [
      { word: 'Hello', definition: 'A common greeting used when meeting someone' },
      { word: 'Goodbye', definition: 'A parting phrase used when leaving someone' },
      { word: 'Good morning', definition: 'A greeting used in the morning hours' },
      { word: 'Good afternoon', definition: 'A greeting used in the afternoon hours' },
      { word: 'Good evening', definition: 'A greeting used in the evening hours' }
    ],
    grammar: [
      { 
        question: 'Fill in the blank: I ___ a student.',
        answer: 'am'
      },
      {
        question: 'Fill in the blank: She ___ from Spain.',
        answer: 'is'
      },
      {
        question: 'Fill in the blank: They ___ learning English.',
        answer: 'are'
      }
    ],
    audioUrl: 'https://freesound.org/data/previews/66/66717_9316-lq.mp3'
  },
  
  // Lesson 2: Introductions
  'lesson2': {
    vocabulary: [
      { word: 'Name', definition: 'What you are called' },
      { word: 'Meet', definition: 'To be introduced to someone for the first time' },
      { word: 'Friend', definition: 'A person you know well and like' },
      { word: 'Family', definition: 'A group of people related to each other' },
      { word: 'Introduce', definition: 'To present someone to another person' }
    ],
    grammar: [
      { 
        question: 'Fill in the blank: My name ___ John.',
        answer: 'is'
      },
      {
        question: 'Fill in the blank: What ___ your name?',
        answer: 'is'
      },
      {
        question: 'Fill in the blank: ___ are you from?',
        answer: 'Where'
      }
    ],
    audioUrl: 'https://freesound.org/data/previews/66/66717_9316-lq.mp3'
  }
};

// Function to update a lesson document
async function updateLesson(lessonId, data) {
  try {
    const lessonRef = doc(db, 'lessons', lessonId);
    const lessonSnap = await getDoc(lessonRef);
    
    if (lessonSnap.exists()) {
      await updateDoc(lessonRef, data);
      console.log(`Lesson ${lessonId} updated successfully`);
    } else {
      console.log(`Lesson ${lessonId} does not exist`);
    }
  } catch (error) {
    console.error(`Error updating lesson ${lessonId}:`, error);
  }
}

// Main function to update all lessons
async function updateLessons() {
  console.log('Starting to update lessons...');
  
  for (const [lessonId, data] of Object.entries(sampleData)) {
    await updateLesson(lessonId, data);
  }
  
  console.log('Finished updating lessons');
}

// Run the update function
updateLessons()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error in update process:', error);
    process.exit(1);
  }); 