import { 
  doc, 
  updateDoc, 
  increment, 
  arrayUnion, 
  getDoc,
  serverTimestamp,
  addDoc,
  collection
} from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Calculate the level based on XP
 * @param xp - The user's current XP
 * @returns The calculated level
 */
export const calculateLevel = (xp: number): number => {
  // Simple level calculation: level = 1 + floor(xp / 100)
  // This means each level requires 100 XP
  return Math.floor(xp / 100) + 1;
};

/**
 * Calculate XP needed for the next level
 * @param currentLevel - The user's current level
 * @returns XP needed for the next level
 */
export const xpForNextLevel = (currentLevel: number): number => {
  return currentLevel * 100;
};

/**
 * Calculate XP progress percentage towards the next level
 * @param xp - The user's current XP
 * @returns Percentage progress towards the next level (0-100)
 */
export const calculateLevelProgress = (xp: number): number => {
  const currentLevel = calculateLevel(xp);
  const xpForCurrentLevel = (currentLevel - 1) * 100;
  const xpForNext = xpForNextLevel(currentLevel);
  
  const xpInCurrentLevel = xp - xpForCurrentLevel;
  const xpNeededForNextLevel = xpForNext - xpForCurrentLevel;
  
  return Math.min(100, Math.round((xpInCurrentLevel / xpNeededForNextLevel) * 100));
};

/**
 * Award XP to a user and update their level if necessary
 * @param userId - The user's ID
 * @param xpAmount - Amount of XP to award
 * @param reason - Reason for the XP award (for tracking)
 * @returns Promise resolving to the updated user data
 */
export const awardXP = async (
  userId: string, 
  xpAmount: number, 
  reason: string
): Promise<{ success: boolean; newXp?: number; newLevel?: number; error?: any }> => {
  try {
    // Get current user data
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      return { success: false, error: 'User not found' };
    }
    
    const userData = userSnap.data();
    const currentXp = userData.xp || 0;
    const currentLevel = userData.level || 1;
    
    // Calculate new values
    const newXp = currentXp + xpAmount;
    const newLevel = calculateLevel(newXp);
    
    // Update user document
    await updateDoc(userRef, {
      xp: increment(xpAmount),
      level: newLevel,
      lastXpUpdate: serverTimestamp()
    });
    
    // Record XP transaction
    await addDoc(collection(db, 'xpTransactions'), {
      userId,
      amount: xpAmount,
      reason,
      timestamp: serverTimestamp(),
      previousXp: currentXp,
      newXp,
      previousLevel: currentLevel,
      newLevel
    });
    
    // Check if user leveled up
    const didLevelUp = newLevel > currentLevel;
    
    // If user leveled up, add a level up reward
    if (didLevelUp) {
      await updateDoc(userRef, {
        rewards: arrayUnion(`Level ${newLevel} Achievement`),
        notifications: arrayUnion({
          type: 'level_up',
          message: `Congratulations! You've reached Level ${newLevel}!`,
          read: false,
          timestamp: serverTimestamp()
        })
      });
    }
    
    return {
      success: true,
      newXp,
      newLevel
    };
  } catch (error) {
    console.error('Error awarding XP:', error);
    return { success: false, error };
  }
};

/**
 * Update user streak and award streak bonuses
 * @param userId - The user's ID
 * @returns Promise resolving to the updated streak count
 */
export const updateStreak = async (
  userId: string
): Promise<{ success: boolean; streak?: number; error?: any }> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      return { success: false, error: 'User not found' };
    }
    
    const userData = userSnap.data();
    const lastLogin = userData.lastLogin?.toDate() || new Date(0);
    const today = new Date();
    
    // Check if last login was yesterday
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const isConsecutiveDay = 
      lastLogin.getDate() === yesterday.getDate() &&
      lastLogin.getMonth() === yesterday.getMonth() &&
      lastLogin.getFullYear() === yesterday.getFullYear();
    
    // Check if already logged in today
    const isToday = 
      lastLogin.getDate() === today.getDate() &&
      lastLogin.getMonth() === today.getMonth() &&
      lastLogin.getFullYear() === today.getFullYear();
    
    let newStreak = userData.streak || 0;
    
    if (isToday) {
      // Already logged in today, no streak update
      return { success: true, streak: newStreak };
    } else if (isConsecutiveDay) {
      // Consecutive day login, increment streak
      newStreak += 1;
    } else {
      // Streak broken, reset to 1
      newStreak = 1;
    }
    
    // Update user document
    await updateDoc(userRef, {
      streak: newStreak,
      lastLogin: serverTimestamp()
    });
    
    // Award streak bonuses
    if (newStreak > 0 && newStreak % 7 === 0) {
      // Weekly streak bonus
      await awardXP(userId, 50, 'Weekly streak bonus');
      
      await updateDoc(userRef, {
        rewards: arrayUnion(`${newStreak}-Day Streak Badge`),
        notifications: arrayUnion({
          type: 'streak_milestone',
          message: `Amazing! You've maintained a ${newStreak}-day streak!`,
          read: false,
          timestamp: serverTimestamp()
        })
      });
    } else if (newStreak > 0) {
      // Daily streak bonus (smaller)
      await awardXP(userId, 5, 'Daily streak bonus');
    }
    
    return { success: true, streak: newStreak };
  } catch (error) {
    console.error('Error updating streak:', error);
    return { success: false, error };
  }
};

/**
 * Check if a user has completed a challenge
 * @param userId - The user's ID
 * @param challengeId - The challenge ID
 * @returns Promise resolving to whether the challenge is completed
 */
export const checkChallengeCompletion = async (
  userId: string,
  challengeId: string
): Promise<{ completed: boolean; progress: number; error?: any }> => {
  try {
    // Implementation would depend on your challenge structure
    // This is a simplified example
    return { completed: false, progress: 0 };
  } catch (error) {
    console.error('Error checking challenge completion:', error);
    return { completed: false, progress: 0, error };
  }
};

/**
 * Claim a reward for completing a challenge
 * @param userId - The user's ID
 * @param challengeId - The challenge ID
 * @returns Promise resolving to the claim result
 */
export const claimChallengeReward = async (
  userId: string,
  challengeId: string
): Promise<{ success: boolean; reward?: string; xpAwarded?: number; error?: any }> => {
  try {
    // Implementation would depend on your challenge structure
    // This is a simplified example
    return { success: false };
  } catch (error) {
    console.error('Error claiming challenge reward:', error);
    return { success: false, error };
  }
}; 