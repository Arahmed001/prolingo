// This script refreshes existing AI content in the database
// Run with: node scripts/refresh-ai-content.js

require('dotenv').config();
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, limit, where } = require('firebase/firestore');
const { refreshLessonContent } = require('../lib/services/aiContentService');
const cron = require('node-cron');

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

// Parse command line arguments
const args = process.argv.slice(2);
const lessonId = args.length > 0 ? args[0] : null;
const isCronJob = args.includes('--cron');
const batchSize = args.length > 1 && !isNaN(parseInt(args[1])) ? parseInt(args[1]) : 5;

/**
 * Refresh a specific lesson by ID
 */
async function refreshSpecificLesson(id) {
  console.log(`Refreshing lesson with ID: ${id}`);
  
  const success = await refreshLessonContent(id);
  
  if (success) {
    console.log(`Successfully refreshed lesson: ${id}`);
  } else {
    console.error(`Failed to refresh lesson: ${id}`);
  }
  
  return success;
}

/**
 * Refresh a batch of lessons
 */
async function refreshLessonBatch(size) {
  console.log(`Refreshing a batch of ${size} lessons...`);
  
  try {
    // Query for lessons to refresh
    // In a real implementation, you might want to order by last updated timestamp
    const lessonsQuery = query(
      collection(db, 'lessons'),
      limit(size)
    );
    
    const snapshot = await getDocs(lessonsQuery);
    
    if (snapshot.empty) {
      console.log('No lessons found to refresh');
      return 0;
    }
    
    console.log(`Found ${snapshot.size} lessons to refresh`);
    
    let successCount = 0;
    
    // Process each lesson
    for (const doc of snapshot.docs) {
      const lessonId = doc.id;
      console.log(`Refreshing lesson: ${lessonId}`);
      
      const success = await refreshLessonContent(lessonId);
      
      if (success) {
        console.log(`Successfully refreshed lesson: ${lessonId}`);
        successCount++;
      } else {
        console.error(`Failed to refresh lesson: ${lessonId}`);
      }
    }
    
    console.log(`Refreshed ${successCount}/${snapshot.size} lessons successfully`);
    return successCount;
  } catch (error) {
    console.error('Error refreshing lessons:', error);
    return 0;
  }
}

/**
 * Main function to refresh content
 */
async function refreshContent() {
  console.log('Starting content refresh process...');
  
  try {
    if (lessonId) {
      // Refresh a specific lesson
      await refreshSpecificLesson(lessonId);
    } else {
      // Refresh a batch of lessons
      await refreshLessonBatch(batchSize);
    }
    
    console.log('Content refresh completed');
  } catch (error) {
    console.error('Error in content refresh process:', error);
  }
}

// If running as a cron job, schedule it
if (isCronJob) {
  const cronSchedule = process.env.AI_CONTENT_REFRESH_CRON || '0 0 * * 0'; // Default: weekly on Sunday at midnight
  
  console.log(`Setting up cron job with schedule: ${cronSchedule}`);
  
  cron.schedule(cronSchedule, () => {
    console.log(`Running scheduled content refresh at ${new Date().toISOString()}`);
    refreshContent()
      .then(() => console.log('Scheduled refresh completed'))
      .catch(error => console.error('Error in scheduled refresh:', error));
  });
  
  console.log('Cron job scheduled. Press Ctrl+C to exit.');
} else {
  // Run once immediately
  refreshContent()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Unhandled error:', error);
      process.exit(1);
    });
} 