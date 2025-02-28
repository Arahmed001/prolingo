import { db } from '../firebase';
import { 
  collection, 
  query, 
  getDocs, 
  addDoc, 
  serverTimestamp 
} from 'firebase/firestore';

/**
 * Adds sample marketing signup data to Firestore
 */
export const addSampleMarketingSignups = async () => {
  try {
    // Check if marketing signups already exist
    const signupsQuery = query(collection(db, 'marketing-signups'));
    const signupsSnapshot = await getDocs(signupsQuery);
    
    if (!signupsSnapshot.empty) {
      console.log(`Found ${signupsSnapshot.docs.length} existing marketing signups. Skipping sample data creation.`);
      return;
    }
    
    // Sample signup data
    const sampleSignups = [
      {
        email: 'john@prolingo.com',
        timestamp: serverTimestamp()
      },
      {
        email: 'sarah.teacher@edumail.com',
        timestamp: serverTimestamp() 
      },
      {
        email: 'miguel.rodriguez@example.com',
        timestamp: serverTimestamp()
      }
    ];
    
    // Add sample signups to Firestore
    for (const signup of sampleSignups) {
      await addDoc(collection(db, 'marketing-signups'), signup);
    }
    
    console.log(`Added ${sampleSignups.length} sample marketing signups to Firestore.`);
  } catch (error) {
    console.error('Error adding sample marketing signups:', error);
  }
}; 