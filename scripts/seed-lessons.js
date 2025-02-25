// This script seeds the Firestore database with sample lessons
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc } = require('firebase/firestore');
require('dotenv').config({ path: '.env.local' });

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Sample lessons data
const lessons = [
  {
    id: '1',
    title: 'Greetings and Introductions',
    level: 'A1',
    description: 'Learn basic greetings and how to introduce yourself in English.',
    imageUrl: 'https://images.unsplash.com/photo-1516398810565-0cb4310bb8ea?q=80&w=500',
    duration: '30 minutes'
  },
  {
    id: '2',
    title: 'Numbers and Counting',
    level: 'A1',
    description: 'Master numbers from 1-100 and basic counting expressions.',
    imageUrl: 'https://images.unsplash.com/photo-1509228627152-72ae9ae6848d?q=80&w=500',
    duration: '25 minutes'
  },
  {
    id: '3',
    title: 'Daily Routines',
    level: 'A2',
    description: 'Vocabulary and phrases for describing your daily activities.',
    imageUrl: 'https://images.unsplash.com/photo-1493666438817-866a91353ca9?q=80&w=500',
    duration: '45 minutes'
  },
  {
    id: '4',
    title: 'Food and Restaurants',
    level: 'B1',
    description: 'Learn how to order food and discuss dining preferences.',
    imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=500',
    duration: '40 minutes'
  },
  {
    id: '5',
    title: 'Travel and Directions',
    level: 'B1',
    description: 'Vocabulary for travel situations and asking for directions.',
    imageUrl: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=500',
    duration: '35 minutes'
  }
];

async function seedLessons() {
  try {
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    console.log('Connected to Firestore, beginning to seed lessons...');
    
    // Add each lesson to the 'lessons' collection
    for (const lesson of lessons) {
      await setDoc(doc(db, 'lessons', lesson.id), lesson);
      console.log(`Added lesson: ${lesson.title}`);
    }
    
    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding lessons:', error);
    process.exit(1);
  }
}

// Run the seed function
seedLessons();