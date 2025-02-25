// This script generates AI content for lessons
// Run with: node scripts/generate-ai-content.js

require('dotenv').config();
const { initializeApp } = require('firebase/app');
const { getFirestore } = require('firebase/firestore');
const { generateLesson, validateContent } = require('../lib/services/aiContentService');

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

// Topics for ESL lessons
const TOPICS = [
  // Beginner topics
  { topic: 'Greetings and Introductions', level: 'Beginner' },
  { topic: 'Numbers and Counting', level: 'Beginner' },
  { topic: 'Colors and Shapes', level: 'Beginner' },
  { topic: 'Family Members', level: 'Beginner' },
  { topic: 'Days of the Week', level: 'Beginner' },
  
  // Elementary topics
  { topic: 'Daily Routines', level: 'Elementary' },
  { topic: 'Food and Restaurants', level: 'Elementary' },
  { topic: 'Shopping and Clothes', level: 'Elementary' },
  { topic: 'Weather and Seasons', level: 'Elementary' },
  { topic: 'Hobbies and Free Time', level: 'Elementary' },
  
  // Intermediate topics
  { topic: 'Travel and Transportation', level: 'Intermediate' },
  { topic: 'Health and Medicine', level: 'Intermediate' },
  { topic: 'Work and Careers', level: 'Intermediate' },
  { topic: 'Technology and Internet', level: 'Intermediate' },
  { topic: 'Environment and Nature', level: 'Intermediate' },
  
  // Advanced topics
  { topic: 'Current Events and News', level: 'Advanced' },
  { topic: 'Arts and Culture', level: 'Advanced' },
  { topic: 'Science and Innovation', level: 'Advanced' },
  { topic: 'Social Issues', level: 'Advanced' },
  { topic: 'Business and Economics', level: 'Advanced' },
  
  // Proficient topics
  { topic: 'Philosophy and Ethics', level: 'Proficient' },
  { topic: 'Literature and Writing', level: 'Proficient' },
  { topic: 'Psychology and Human Behavior', level: 'Proficient' },
  { topic: 'Politics and Government', level: 'Proficient' },
  { topic: 'History and Civilization', level: 'Proficient' }
];

// Parse command line arguments
const args = process.argv.slice(2);
const topicIndex = args.length > 0 ? parseInt(args[0]) : -1;
const count = args.length > 1 ? parseInt(args[1]) : 1;

/**
 * Generate lessons based on command line arguments
 */
async function generateLessons() {
  console.log('Starting AI content generation...');
  
  try {
    if (topicIndex >= 0 && topicIndex < TOPICS.length) {
      // Generate a specific topic
      const { topic, level } = TOPICS[topicIndex];
      console.log(`Generating lesson for topic: ${topic} (${level})`);
      
      const lesson = await generateLesson(topic, level);
      
      if (lesson) {
        console.log(`Successfully generated lesson: ${lesson.title}`);
        
        // Validate the content
        const validation = await validateContent(lesson.content || '');
        console.log(`Content validation: ${validation.isValid ? 'Passed' : 'Failed'}`);
        console.log(`Quality score: ${validation.score}`);
        console.log(`Feedback: ${validation.feedback}`);
      } else {
        console.error('Failed to generate lesson');
      }
    } else {
      // Generate multiple random topics
      console.log(`Generating ${count} random lessons...`);
      
      for (let i = 0; i < count; i++) {
        const randomIndex = Math.floor(Math.random() * TOPICS.length);
        const { topic, level } = TOPICS[randomIndex];
        
        console.log(`Generating lesson ${i + 1}/${count}: ${topic} (${level})`);
        
        const lesson = await generateLesson(topic, level);
        
        if (lesson) {
          console.log(`Successfully generated lesson: ${lesson.title}`);
        } else {
          console.error(`Failed to generate lesson ${i + 1}`);
        }
      }
    }
    
    console.log('AI content generation completed');
  } catch (error) {
    console.error('Error in content generation process:', error);
  }
}

// Run the generation function
generateLessons()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Unhandled error:', error);
    process.exit(1);
  }); 