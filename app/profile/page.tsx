"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  updateDoc, 
  arrayUnion,
  Timestamp,
  increment,
  serverTimestamp,
  addDoc
} from 'firebase/firestore';
import Link from 'next/link';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { initializeGamificationData } from '@/lib/scripts/sampleChallenges';

// Define reward tiers
const REWARD_TIERS = [
  { xp: 50, reward: '50 XP Bonus', description: 'Congratulations on reaching 50 XP! You\'ve earned a bonus.' },
  { xp: 100, reward: 'Gold Badge', description: 'You\'ve earned a Gold Badge for reaching 100 XP!' },
  { xp: 200, reward: 'VIP Access', description: 'Amazing! You\'ve unlocked VIP Access for reaching 200 XP.' },
  { xp: 500, reward: 'Pro Certificate', description: 'Incredible achievement! You\'ve earned a Pro Certificate.' },
];

interface User {
  uid: string;
  displayName: string;
  email: string | null;
  photoURL: string | null;
  xp: number;
  level: number;
  streak: number;
  rewards: string[];
  joinedAt: Timestamp;
}

interface Challenge {
  id: string;
  task?: string;
  duration?: string;
  reward?: string;
  description?: string;
  xpReward?: number;
  createdAt?: any;
}

interface Progress {
  userId: string;
  lessonId: string;
  completed: boolean;
  completedAt: Timestamp;
}

interface UserProgress {
  userId: string;
  lessonId: string;
  completed: boolean;
  score: number;
  completedAt: any;
}

interface Reward {
  id: string;
  title: string;
  description: string;
  cost: number;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [currentReward, setCurrentReward] = useState('');
  const [newRewards, setNewRewards] = useState<string[]>([]);
  
  // Additional states from previous implementation
  const [rewardStatus, setRewardStatus] = useState('');
  const [syncStatus, setSyncStatus] = useState('');
  const [exportStatus, setExportStatus] = useState('');
  const [rewards, setRewards] = useState<Reward[]>([]);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser: FirebaseUser | null) => {
      if (!authUser) {
        router.push('/login');
        return;
      }

      try {
        // Fetch user data from Firestore
        const userDoc = await getDoc(doc(db, 'users', authUser.uid));
        
        if (userDoc.exists()) {
          const userData = userDoc.data() as User;
          setUser({
            uid: authUser.uid,
            displayName: userData.displayName || authUser.displayName || 'Language Learner',
            email: authUser.email,
            photoURL: authUser.photoURL,
            xp: userData.xp || 0,
            level: userData.level || 1,
            streak: userData.streak || 0,
            rewards: userData.rewards || [],
            joinedAt: userData.joinedAt || Timestamp.now(),
          });

          // Check for new rewards
          checkForNewRewards(userData.xp || 0, userData.rewards || []);

          // Fetch challenges
          await fetchChallenges();
          
          // Fetch user progress
          await fetchUserProgress(authUser.uid);
        } else {
          // Create a new user document if it doesn't exist
          const newUser = {
            displayName: authUser.displayName || 'Language Learner',
            email: authUser.email,
            photoURL: authUser.photoURL,
            xp: 0,
            level: 1,
            streak: 0,
            rewards: [],
            joinedAt: Timestamp.now(),
          };
          setUser({ uid: authUser.uid, ...newUser });
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Check if user has earned new rewards
  const checkForNewRewards = (xp: number, existingRewards: string[]) => {
    const newUnlockedRewards: string[] = [];
    
    REWARD_TIERS.forEach(tier => {
      if (xp >= tier.xp && !existingRewards.includes(tier.reward)) {
        newUnlockedRewards.push(tier.reward);
      }
    });
    
    if (newUnlockedRewards.length > 0) {
      setNewRewards(newUnlockedRewards);
      setCurrentReward(newUnlockedRewards[0]);
      setShowRewardModal(true);
      updateUserRewards(newUnlockedRewards);
    }
  };

  // Update user rewards in Firebase
  const updateUserRewards = async (rewards: string[]) => {
    if (!user) return;
    
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        rewards: arrayUnion(...rewards)
      });
    } catch (error) {
      console.error("Error updating user rewards:", error);
    }
  };

  // Fetch available challenges
  const fetchChallenges = async () => {
    try {
      const challengesSnapshot = await getDocs(collection(db, 'challenges'));
      
      if (challengesSnapshot.empty) {
        // If no challenges exist, create sample challenge
        const sampleChallenge = {
          id: '2',
          task: 'Complete 5 quizzes',
          duration: 'week',
          reward: 'Silver Badge',
          description: 'Master 5 different quizzes this week to earn a special silver badge!',
          xpReward: 50,
          createdAt: Timestamp.fromDate(new Date())
        };
        
        setChallenges([sampleChallenge]);
        return;
      }
      
      const fetchedChallenges: Challenge[] = [];
      challengesSnapshot.forEach(doc => {
        fetchedChallenges.push({
          id: doc.id,
          ...doc.data()
        } as Challenge);
      });
      
      setChallenges(fetchedChallenges);
    } catch (error) {
      console.error("Error fetching challenges:", error);
    }
  };

  // Fetch user progress data
  const fetchUserProgress = async (userId: string) => {
    try {
      const progressQuery = query(
        collection(db, 'progress'),
        where('userId', '==', userId)
      );
      
      const progressSnapshot = await getDocs(progressQuery);
      
      if (progressSnapshot.empty) {
        return;
      }
      
      const fetchedProgress: UserProgress[] = [];
      progressSnapshot.forEach(doc => {
        fetchedProgress.push({
          ...doc.data()
        } as UserProgress);
      });
      
      setUserProgress(fetchedProgress);
    } catch (error) {
      console.error("Error fetching user progress:", error);
    }
  };

  // Calculate challenge progress
  const calculateChallengeProgress = (challenge: Challenge) => {
    // Check if challenge.task exists to prevent "undefined is not an object" error
    if (!challenge || !challenge.task) {
      return 0; // Return 0 progress if challenge.task is undefined
    }
    
    try {
      if (challenge.task.includes('Complete') && challenge.task.includes('lessons')) {
        const completedLessons = userProgress.filter(p => p.completed && p.lessonId.startsWith('lesson')).length;
        // Safely parse the number, defaulting to 1 if parsing fails
        const targetLessons = parseInt(challenge.task.split(' ')[1]) || 1;
        return Math.min(completedLessons / targetLessons, 1) * 100;
      }
      
      if (challenge.task.includes('Complete') && challenge.task.includes('quizzes')) {
        const completedQuizzes = userProgress.filter(p => p.completed && p.lessonId.startsWith('quiz')).length;
        // Safely parse the number, defaulting to 1 if parsing fails
        const targetQuizzes = parseInt(challenge.task.split(' ')[1]) || 1;
        return Math.min(completedQuizzes / targetQuizzes, 1) * 100;
      }
      
      if (challenge.task.includes('Achieve')) {
        const highScoreTests = userProgress.filter(p => p.score >= 90).length;
        // Safely parse the number, defaulting to 1 if parsing fails
        const targetTests = parseInt(challenge.task.split(' ')[2]) || 1;
        return Math.min(highScoreTests / targetTests, 1) * 100;
      }
      
      // Default progress calculation
      return 0;
    } catch (error) {
      console.error("Error calculating challenge progress:", error);
      return 0; // Return 0 progress if there's an error
    }
  };

  // Claim reward for completed challenge
  const claimChallengeReward = async (challenge: Challenge) => {
    if (!user || !challenge || !challenge.task) return;
    
    const progress = calculateChallengeProgress(challenge);
    
    if (progress >= 100) {
      try {
        const userRef = doc(db, 'users', user.uid);
        
        // Add XP and the challenge reward (safely handle missing properties)
        const xpReward = challenge.xpReward || 10; // Default to 10 XP if missing
        const reward = challenge.reward || 'XP Bonus'; // Default reward name if missing
        
        await updateDoc(userRef, {
          xp: increment(xpReward),
          rewards: arrayUnion(reward as string) // Use type assertion to tell TypeScript this is definitely a string
        });
        
        // Update local user state (safely handle missing properties)
        setUser(prev => prev ? {
          ...prev,
          xp: prev.xp + xpReward,
          rewards: [...prev.rewards, reward]
        } : null);
        
        // Show reward modal
        setCurrentReward(reward);
        setShowRewardModal(true);
        
        // Refresh challenges
        await fetchChallenges();
      } catch (error) {
        console.error("Error claiming challenge reward:", error);
      }
    }
  };
  
  // Redeem a reward from the previous implementation
  const handleRedeemReward = async (reward: Reward) => {
    // Placeholder for backward compatibility
    console.log("Would redeem reward:", reward);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4">Loading profile data...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow p-4 md:p-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          {/* Profile Header */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
              <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {user?.displayName?.charAt(0) || 'U'}
              </div>
              <div className="flex-grow text-center md:text-left">
                <h1 className="text-2xl font-bold">{user?.displayName || 'User'}</h1>
                <p className="text-gray-600">{user?.email || ''}</p>
                <div className="mt-2 flex flex-wrap gap-2 justify-center md:justify-start">
                  <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    Level {user?.level || 1}
                  </div>
                  <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                    {user?.xp || 0} XP
                  </div>
                  <div className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">
                    {user?.streak || 0} Day Streak
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Progress and Rewards Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Level Progress</h2>
              <div className="mb-4">
                <div className="flex justify-between mb-1">
                  <span>XP to Next Level</span>
                  <span>{user?.xp || 0}/{(user?.level || 1) * 100} XP</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-blue-600 h-2.5 rounded-full" style={{ 
                    width: `${Math.min(100, ((user?.xp || 0) / ((user?.level || 1) * 100)) * 100)}%` 
                  }}></div>
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-2">Your Rewards</h3>
              <div className="space-y-2">
                {user?.rewards && user?.rewards.length > 0 ? (
                  user?.rewards.map((reward, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="text-yellow-500">🏆</span>
                      <span>{reward}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">Complete challenges to earn rewards!</p>
                )}
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Reward Tiers</h2>
              <div className="space-y-4">
                {REWARD_TIERS.map((tier, index) => (
                  <div key={index} className="border-l-4 pl-4" style={{ 
                    borderColor: (user?.xp || 0) >= tier.xp ? 'green' : 'gray',
                    opacity: (user?.xp || 0) >= tier.xp ? 1 : 0.6
                  }}>
                    <div className="flex justify-between">
                      <h3 className="font-semibold">{tier.reward}</h3>
                      <span className="text-sm">{tier.xp} XP</span>
                    </div>
                    <p className="text-sm text-gray-600">{tier.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Weekly Challenges Section */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Weekly Challenges</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {challenges.length === 0 && (
                <p className="text-gray-500 col-span-2">No challenges available at the moment. Check back soon!</p>
              )}
              {challenges.map((challenge) => {
                // Skip rendering if challenge is missing required properties
                if (!challenge || !challenge.task || !challenge.id) {
                  return null;
                }
                
                const progress = calculateChallengeProgress(challenge);
                const isCompleted = progress >= 100;
                
                return (
                  <div key={challenge.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold">{challenge.task}</h3>
                      <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs">
                        {challenge.duration || 'Ongoing'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{challenge.description || 'Complete this challenge to earn rewards!'}</p>
                    <div className="flex items-center gap-2 text-sm mb-3">
                      <span className="text-yellow-500">🏆</span>
                      <span>{challenge.reward || 'XP Reward'} (+{challenge.xpReward || 0} XP)</span>
                    </div>
                    <div className="mb-3">
                      <div className="flex justify-between mb-1 text-xs">
                        <span>Progress</span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: `${progress}%` }}></div>
                      </div>
                    </div>
                    <button
                      onClick={() => claimChallengeReward(challenge)}
                      disabled={!isCompleted}
                      className={`w-full py-2 rounded-md text-sm text-center ${
                        isCompleted 
                          ? 'bg-green-600 text-white hover:bg-green-700' 
                          : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {user?.rewards?.includes(challenge.reward)
                        ? 'Claimed'
                        : isCompleted 
                          ? 'Claim Reward' 
                          : 'In Progress'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
            {userProgress.length > 0 ? (
              <div className="space-y-3">
                {userProgress.slice(0, 5).map((item, index) => (
                  <div key={index} className="flex items-center justify-between border-b pb-3">
                    <div>
                      <div className="font-medium">{item.lessonId}</div>
                      <div className="text-sm text-gray-600">
                        {item.completed ? 'Completed' : 'In Progress'} • Score: {item.score}%
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {item.completedAt?.toDate?.() 
                        ? new Date(item.completedAt.toDate()).toLocaleDateString() 
                        : 'Recently'}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No activity recorded yet. Start learning!</p>
            )}
          </div>
        </div>
      </main>
      <Footer />
      
      {/* Reward Modal */}
      {showRewardModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 text-center animate-bounce-in">
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-2xl font-bold mb-2">Reward Unlocked!</h2>
            <p className="text-xl text-yellow-600 mb-4">{currentReward}</p>
            <p className="mb-6 text-gray-600">Keep up the great work! Continue learning to unlock more rewards.</p>
            <button 
              onClick={() => setShowRewardModal(false)}
              className="bg-blue-600 text-white py-2 px-6 rounded-full hover:bg-blue-700 transition-colors"
            >
              Awesome!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}