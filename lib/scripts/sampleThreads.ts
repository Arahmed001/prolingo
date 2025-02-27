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
    likes: 0
  },
  {
    id: 'thread3',
    title: 'Resources for learning French pronunciation',
    authorEmail: 'test@prolingo.com',
    authorName: 'Test User',
    createdAt: new Date(),
    responseCount: 0,
    likes: 0
  }
];

// Function to add sample threads to Firestore
export async function addSampleThreads() {
  try {
    // Check if threads already exist
    const threadsCollection = collection(db, 'threads');
    const threadsSnapshot = await getDocs(threadsCollection);
    
    if (!threadsSnapshot.empty) {
      console.log('Threads already exist in the database.');
      return false;
    }
    
    // Add each thread to Firestore
    for (const thread of sampleThreads) {
      await setDoc(doc(db, 'threads', thread.id), {
        ...thread,
        createdAt: serverTimestamp()
      });
      console.log(`Added thread: ${thread.title}`);
    }
    
    console.log('Sample threads added successfully!');
    return true;
  } catch (error) {
    console.error('Error adding sample threads:', error);
    return false;
  }
}

// Export the sample threads for use in other files
export { sampleThreads }; 