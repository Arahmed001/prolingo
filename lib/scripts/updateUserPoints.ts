import { db } from '../firebase';
import { 
  collection, 
  query, 
  getDocs, 
  updateDoc,
  doc
} from 'firebase/firestore';

/**
 * Updates all existing users to ensure they have a points field
 * This script can be run to add points to users who were created
 * before the points system was implemented
 */
export const updateUserPoints = async () => {
  try {
    // Get all users
    const usersQuery = query(collection(db, 'users'));
    const usersSnapshot = await getDocs(usersQuery);
    
    if (usersSnapshot.empty) {
      console.log('No users found in the database.');
      return;
    }
    
    let updatedCount = 0;
    
    // Update each user that doesn't have points
    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      
      // Check if points field exists and is a number
      if (userData.points === undefined || typeof userData.points !== 'number') {
        // Add default starting points (50) to user
        await updateDoc(doc(db, 'users', userDoc.id), {
          points: 50 // Give them some starter points
        });
        
        updatedCount++;
      }
    }
    
    console.log(`Updated ${updatedCount} users with points field.`);
    console.log(`${usersSnapshot.docs.length - updatedCount} users already had points.`);
    
  } catch (error) {
    console.error('Error updating user points:', error);
  }
};

/**
 * Reward points to a specific user
 * @param userEmail The email of the user to reward
 * @param points The number of points to add
 * @param reason Optional reason for the reward
 */
export const rewardUserPoints = async (userEmail: string, points: number, reason?: string) => {
  try {
    // Find user by email
    const usersQuery = query(
      collection(db, 'users'),
      /* where('email', '==', userEmail) */
    );
    
    const usersSnapshot = await getDocs(usersQuery);
    
    if (usersSnapshot.empty) {
      console.log(`No user found with email: ${userEmail}`);
      return false;
    }
    
    // Find the user with matching email
    const userDoc = usersSnapshot.docs.find(doc => 
      doc.data().email?.toLowerCase() === userEmail.toLowerCase()
    );
    
    if (!userDoc) {
      console.log(`No user found with email: ${userEmail}`);
      return false;
    }
    
    const userData = userDoc.data();
    const currentPoints = userData.points || 0;
    const newPoints = currentPoints + points;
    
    // Update user points
    await updateDoc(doc(db, 'users', userDoc.id), {
      points: newPoints,
      lastPointsUpdate: {
        amount: points,
        reason: reason || 'Manual reward',
        timestamp: new Date()
      }
    });
    
    console.log(`Awarded ${points} points to user ${userEmail}. New total: ${newPoints}`);
    return true;
    
  } catch (error) {
    console.error('Error rewarding points:', error);
    return false;
  }
}; 