import { collection, getDocs, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

// Sample thread data
const sampleThreads = [
  {
    id: 'thread1',
    title: 'Help with A1 German vocabulary',
    authorEmail: 'test@prolingo.com',
    authorName: 'Test User',
    createdAt: new Date(),
    responseCount: 0,
    likes: 0
  },
  {
    id: 'thread2',
    title: 'Looking for Spanish conversation partners',
    authorEmail: 'test@prolingo.com',
    authorName: 'Test User',
    createdAt: new Date(),
    responseCount: 0,
    likes: 2
  },
  {
    id: 'thread3',
    title: 'Tips for improving listening comprehension',
    authorEmail: 'test@prolingo.com',
    authorName: 'Test User',
    createdAt: new Date(),
    responseCount: 0,
    likes: 5
  }
];

// Function to add sample threads to Firestore
export async function addSampleThreads() {
  try {
    // Check if threads already exist
    const threadsCollection = collection(db, 'threads');
    const threadSnapshot = await getDocs(threadsCollection);
    
    if (threadSnapshot.empty) {
      console.log('No threads found. Adding sample threads...');
      
      // Add each sample thread
      for (const thread of sampleThreads) {
        const threadRef = doc(db, 'threads', thread.id);
        await setDoc(threadRef, {
          ...thread,
          createdAt: serverTimestamp()
        });
        console.log(`Added thread: ${thread.title}`);
      }
      
      console.log('Sample threads added successfully!');
      return true;
    } else {
      console.log('Threads already exist in the database.');
      return false;
    }
  } catch (error) {
    console.error('Error adding sample threads:', error);
    return false;
  }
}

// Export the sample threads for testing
export { sampleThreads }; 