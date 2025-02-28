import { db } from '../firebase';
import { 
  collection, 
  query, 
  getDocs, 
  addDoc, 
  where,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { addSampleChallenges } from './sampleChallenges';
import { updateUserPoints } from './updateUserPoints';

/**
 * Initializes all sample data needed for user retention features
 */
export const initializeUserRetentionData = async () => {
  try {
    console.log('Initializing user retention data...');
    
    // Step 1: Add sample challenges
    await addSampleChallenges();
    
    // Step 2: Update user points
    await updateUserPoints();
    
    // Step 3: Add sample redemptions if none exist
    await initializeRedemptionRecords();
    
    console.log('User retention data initialization complete!');
  } catch (error) {
    console.error('Error initializing user retention data:', error);
  }
};

/**
 * Adds sample redemption records for demo purposes
 */
const initializeRedemptionRecords = async () => {
  try {
    // Check if redemptions already exist
    const redemptionsQuery = query(collection(db, 'redemptions'));
    const redemptionsSnapshot = await getDocs(redemptionsQuery);
    
    if (!redemptionsSnapshot.empty) {
      console.log(`Found ${redemptionsSnapshot.docs.length} existing redemption records. Skipping sample data creation.`);
      return;
    }
    
    // Get users to associate redemptions with
    const usersQuery = query(collection(db, 'users'));
    const usersSnapshot = await getDocs(usersQuery);
    
    if (usersSnapshot.empty) {
      console.log('No users found. Skipping redemption data creation.');
      return;
    }
    
    // Create sample redemption records for the first user
    const firstUser = usersSnapshot.docs[0];
    const userId = firstUser.id;
    const userData = firstUser.data();
    
    const now = new Date();
    
    const sampleRedemptions = [
      {
        userId: userData.id || firstUser.id,
        rewardId: 'reward1',
        rewardTitle: 'Extra Practice Session',
        cost: 50,
        redeemedAt: Timestamp.fromDate(new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)) // 7 days ago
      },
      {
        userId: userData.id || firstUser.id,
        rewardId: 'reward2',
        rewardTitle: 'Badge: Language Explorer',
        cost: 100,
        redeemedAt: Timestamp.fromDate(new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)) // 3 days ago
      }
    ];
    
    for (const redemption of sampleRedemptions) {
      await addDoc(collection(db, 'redemptions'), redemption);
    }
    
    console.log(`Added ${sampleRedemptions.length} sample redemption records to Firestore.`);
  } catch (error) {
    console.error('Error adding sample redemption records:', error);
  }
}; 