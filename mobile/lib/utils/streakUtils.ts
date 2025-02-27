import { doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebase/init';

export async function updateUserStreak(userId: string, lastLoginDate: string) {
  const today = new Date();
  const lastLogin = new Date(lastLoginDate);
  
  // Reset time to midnight for accurate day comparison
  today.setHours(0, 0, 0, 0);
  lastLogin.setHours(0, 0, 0, 0);
  
  const diffTime = Math.abs(today.getTime() - lastLogin.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  const userRef = doc(db, 'users', userId);
  
  if (diffDays === 1) {
    // Consecutive day, increment streak
    await updateDoc(userRef, {
      streak: increment(1),
      lastLoginDate: today.toISOString()
    });
  } else if (diffDays > 1) {
    // Streak broken, reset to 1
    await updateDoc(userRef, {
      streak: 1,
      lastLoginDate: today.toISOString()
    });
  }
  // If diffDays === 0, same day login, do nothing
} 