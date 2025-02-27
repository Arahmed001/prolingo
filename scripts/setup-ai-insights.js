// Setup script to add sample data for AI insights
import { db, auth } from '../lib/firebase';
import { 
  collection, 
  addDoc, 
  getDocs,
  serverTimestamp, 
  Timestamp,
  query,
  where
} from 'firebase/firestore';
import { signInWithEmailAndPassword } from 'firebase/auth';

// Sample user IDs (will be replaced with actual IDs if available)
const DEFAULT_USER_IDS = ['sample-user-1', 'sample-user-2', 'sample-user-3'];

// Generate a random date within the last 30 days
function getRandomRecentDate() {
  const now = new Date();
  const daysAgo = Math.floor(Math.random() * 30); // 0-29 days ago
  const hoursAgo = Math.floor(Math.random() * 24); // 0-23 hours ago
  
  const date = new Date();
  date.setDate(now.getDate() - daysAgo);
  date.setHours(now.getHours() - hoursAgo);
  
  return date;
}

// Generate sample progress data for AI insights
async function generateSampleProgressData(userIds) {
  const sampleProgress = [];
  
  // Generate 100 sample progress records
  for (let i = 0; i < 100; i++) {
    // Create realistic pattern - more completions on weekdays during typical hours
    const date = getRandomRecentDate();
    const dayOfWeek = date.getDay(); // 0-6 (Sunday-Saturday)
    const hourOfDay = date.getHours(); // 0-23
    
    // Weighted random scores based on time pattern
    let scoreBase = 70; // Base score
    
    // Better scores during morning/afternoon (9AM-5PM)
    if (hourOfDay >= 9 && hourOfDay <= 17) {
      scoreBase += 10;
    }
    
    // Better scores on weekdays
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      scoreBase += 5;
    }
    
    // Apply some randomness
    const score = Math.min(100, Math.floor(scoreBase + (Math.random() * 20) - 10));
    
    // Create progress entry
    sampleProgress.push({
      userId: userIds[Math.floor(Math.random() * userIds.length)],
      lessonId: `lesson-${Math.floor(Math.random() * 5) + 1}`,
      score,
      completed: true,
      timestamp: Timestamp.fromDate(date)
    });
  }
  
  return sampleProgress;
}

// Main setup function
async function setupAIInsightsData() {
  try {
    console.log("Starting AI insights sample data setup...");
    
    // Sign in with test account
    console.log("Signing in...");
    await signInWithEmailAndPassword(auth, "test@example.com", "password123");
    
    const user = auth.currentUser;
    if (!user) {
      console.error("Failed to authenticate. Please check your credentials.");
      return;
    }
    
    console.log("Signed in as:", user.email);
    
    // Check if we have existing users or need to use default IDs
    const usersSnapshot = await getDocs(collection(db, 'users'));
    let userIds = DEFAULT_USER_IDS;
    
    if (!usersSnapshot.empty) {
      userIds = usersSnapshot.docs.map(doc => doc.id);
      console.log(`Found ${userIds.length} existing users`);
    } else {
      console.log("No existing users found, using default sample user IDs");
      
      // Add some sample users if none exist
      for (const [index, userId] of DEFAULT_USER_IDS.entries()) {
        await addDoc(collection(db, 'users'), {
          id: userId,
          email: `user${index + 1}@prolingo.com`,
          level: index === 2 ? 'A2' : 'A1', // One slightly more advanced user
          role: 'user',
          createdAt: serverTimestamp()
        });
      }
    }
    
    // Check if we already have progress data
    const progressSnapshot = await getDocs(collection(db, 'progress'));
    
    if (!progressSnapshot.empty) {
      console.log(`Found ${progressSnapshot.docs.length} existing progress records. Skipping sample data creation.`);
      console.log("To recreate sample data, please delete existing progress records first.");
      return;
    }
    
    // Generate and add sample progress data
    console.log("Generating sample progress data...");
    const sampleProgress = await generateSampleProgressData(userIds);
    
    console.log(`Adding ${sampleProgress.length} progress records...`);
    for (const progress of sampleProgress) {
      await addDoc(collection(db, 'progress'), progress);
    }
    
    console.log("Sample AI insights data setup complete!");
    
  } catch (error) {
    console.error("Error during setup:", error);
  }
}

// Run the setup
setupAIInsightsData(); 