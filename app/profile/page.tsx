"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '../../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc,
  addDoc,
  serverTimestamp,
  updateDoc,
  limit,
  orderBy,
  setDoc,
  Timestamp
} from 'firebase/firestore';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Link from 'next/link';
import RewardHistory from '../components/RewardHistory';

// Prevent static prerendering
export const dynamic = 'force-dynamic';

interface VocabularyItem {
  word: string;
  definition?: string;
  def?: string; // Alternative field name
  term?: string; // Another alternative field name
}

interface Lesson {
  id: string;
  title: string;
  vocabulary?: VocabularyItem[];
  vocab?: VocabularyItem[]; // Alternative field name
}

interface UserProgress {
  id: string;
  lessonId: string;
  score: number;
  completed: boolean;
  timestamp: any;
}

interface Challenge {
  id: string;
  lessonId: string;
  question: string;
  hint?: string;
}

interface ChallengeResponse {
  id?: string;
  userId: string;
  challengeId: string;
  response: string;
  submittedAt: Timestamp;
}

interface Reward {
  id: string;
  title: string;
  description: string;
  cost: number;
}

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [syncStatus, setSyncStatus] = useState<string>('');
  const [exportStatus, setExportStatus] = useState<string>('');
  
  // For Daily Challenge
  const [dailyChallenge, setDailyChallenge] = useState<Challenge | null>(null);
  const [challengeResponse, setChallengeResponse] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [challengeSubmitStatus, setChallengeSubmitStatus] = useState<string>('');
  
  // For Reward Center
  const [rewards, setRewards] = useState<Reward[]>([
    { id: 'reward1', title: 'Extra Practice Session', description: 'Unlock an extra practice session with advanced materials', cost: 50 },
    { id: 'reward2', title: 'Badge: Language Explorer', description: 'Earn a special badge for your profile', cost: 100 },
    { id: 'reward3', title: 'Custom Avatar', description: 'Unlock a custom avatar for your profile', cost: 150 }
  ]);
  const [userPoints, setUserPoints] = useState<number>(0);
  const [rewardStatus, setRewardStatus] = useState<string>('');
  
  const router = useRouter();

  // Check authentication status
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        fetchUserData(user.uid);
        fetchDailyChallenge();
        fetchUserPoints(user.uid);
        setLoading(false);
      } else {
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Fetch user data including progress and lessons
  const fetchUserData = async (userId: string) => {
    try {
      // Fetch user progress
      const progressQuery = query(
        collection(db, 'progress'),
        where('userId', '==', userId)
      );
      
      const progressSnapshot = await getDocs(progressQuery);
      const progressData: UserProgress[] = [];
      
      progressSnapshot.forEach((doc) => {
        progressData.push({ id: doc.id, ...doc.data() } as UserProgress);
      });
      
      setUserProgress(progressData);
      
      // Fetch lessons with vocabulary
      const lessonsQuery = query(collection(db, 'lessons'));
      const lessonsSnapshot = await getDocs(lessonsQuery);
      const lessonsData: Lesson[] = [];
      
      lessonsSnapshot.forEach((doc) => {
        lessonsData.push({ id: doc.id, ...doc.data() } as Lesson);
      });
      
      setLessons(lessonsData);
      
      // If no lessons with vocabulary exist, add sample data
      if (lessonsData.length === 0 || !lessonsData.some(lesson => 
          (lesson.vocabulary && lesson.vocabulary.length > 0) || 
          (lesson.vocab && lesson.vocab.length > 0))) {
        await addSampleVocabularyData();
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  // Add sample vocabulary data if none exists
  const addSampleVocabularyData = async () => {
    try {
      const sampleLesson = {
        title: 'Basic Greetings',
        description: 'Learn how to greet people in different situations',
        level: 'A1',
        vocabulary: [
          { word: 'Hello', definition: 'Hi, a common greeting' },
          { word: 'Goodbye', definition: 'Bye, used when leaving' },
          { word: 'Good morning', definition: 'A greeting used in the morning' },
          { word: 'Good afternoon', definition: 'A greeting used in the afternoon' },
          { word: 'Good evening', definition: 'A greeting used in the evening' },
          { word: 'How are you?', definition: 'A question asking about someone\'s wellbeing' },
          { word: 'Thank you', definition: 'Used to express gratitude' },
          { word: 'You\'re welcome', definition: 'A response to thank you' },
          { word: 'Please', definition: 'Used when asking for something politely' },
          { word: 'Excuse me', definition: 'Used to get attention or apologize for a minor disturbance' }
        ],
        createdAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, 'lessons'), sampleLesson);
      
      // Add the newly created lesson to the state
      setLessons([...lessons, { id: docRef.id, ...sampleLesson }]);
      
      console.log("Added sample vocabulary data");
    } catch (error) {
      console.error("Error adding sample vocabulary data:", error);
    }
  };

  // Function to sync progress with Duolingo (placeholder)
  const syncWithDuolingo = () => {
    console.log("Syncing with Duolingo...");
    setSyncStatus('Syncing...');
    
    // Simulate API call with timeout
    setTimeout(() => {
      // Simulate successful response
      const fakeResponse = {
        success: true,
        message: "Successfully synced with Duolingo",
        data: {
          syncedLessons: userProgress.length,
          skillLevel: "A1+",
          pointsEarned: 120
        }
      };
      
      console.log("Sync response:", fakeResponse);
      setSyncStatus(`Success! Synced ${fakeResponse.data.syncedLessons} lessons.`);
      
      // Reset status after 3 seconds
      setTimeout(() => setSyncStatus(''), 3000);
    }, 1500);
  };

  // Function to export vocabulary as CSV
  const exportVocabulary = () => {
    setExportStatus('Preparing export...');
    
    try {
      // Collect all vocabulary items from all lessons
      const allVocabulary: VocabularyItem[] = [];
      
      lessons.forEach(lesson => {
        const lessonVocab = lesson.vocabulary || lesson.vocab || [];
        lessonVocab.forEach(item => {
          allVocabulary.push(item);
        });
      });
      
      if (allVocabulary.length === 0) {
        setExportStatus('No vocabulary found to export');
        setTimeout(() => setExportStatus(''), 3000);
        return;
      }
      
      // Create CSV content
      let csvContent = "word,definition\n";
      
      allVocabulary.forEach(item => {
        // Use the appropriate field for definition
        const definition = item.definition || item.def || '';
        // Escape quotes in the content
        const escapedWord = item.word ? item.word.replace(/"/g, '""') : '';
        const escapedDefinition = definition.replace(/"/g, '""');
        
        csvContent += `"${escapedWord}","${escapedDefinition}"\n`;
      });
      
      // Create a blob and download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      link.setAttribute('href', url);
      link.setAttribute('download', 'prolingo_vocabulary.csv');
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setExportStatus('Vocabulary exported successfully!');
      setTimeout(() => setExportStatus(''), 3000);
    } catch (error) {
      console.error("Error exporting vocabulary:", error);
      setExportStatus('Error exporting vocabulary');
      setTimeout(() => setExportStatus(''), 3000);
    }
  };

  // Fetch a random daily challenge
  const fetchDailyChallenge = async () => {
    try {
      if (!user) return;
      
      // First check if user has already completed a challenge today
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Start of today
      
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1); // Start of tomorrow
      
      // Check for responses submitted today
      const responseQuery = query(
        collection(db, 'challengeResponses'),
        where('userId', '==', user.uid),
        where('submittedAt', '>=', Timestamp.fromDate(today)),
        where('submittedAt', '<', Timestamp.fromDate(tomorrow))
      );
      
      const responseSnapshot = await getDocs(responseQuery);
      
      // If user has already completed a challenge today, show that info
      if (!responseSnapshot.empty) {
        setChallengeSubmitStatus('You\'ve already completed today\'s challenge! Come back tomorrow for a new one.');
        return;
      }
      
      // Check for challenges in Firestore
      const challengesQuery = query(
        collection(db, 'challenges'),
        limit(10)
      );
      
      const challengesSnapshot = await getDocs(challengesQuery);
      
      if (!challengesSnapshot.empty) {
        // Get a random challenge from the collection
        const challengeDocs = challengesSnapshot.docs;
        const randomChallenge = challengeDocs[Math.floor(Math.random() * challengeDocs.length)];
        const challengeData = { id: randomChallenge.id, ...randomChallenge.data() } as Challenge;
        
        setDailyChallenge(challengeData);
        return;
      }
      
      // If no challenges in collection, fall back to lesson-based challenges
      const lessonsQuery = query(
        collection(db, 'lessons'),
        limit(10)
      );
      
      const lessonsSnapshot = await getDocs(lessonsQuery);
      
      if (lessonsSnapshot.empty) {
        return;
      }
      
      // Randomly select a lesson
      const lessonDocs = lessonsSnapshot.docs;
      const randomLesson = lessonDocs[Math.floor(Math.random() * lessonDocs.length)];
      const lessonData = { id: randomLesson.id, ...randomLesson.data() } as Lesson;
      
      // Create a challenge based on the lesson content
      const challenge: Challenge = {
        id: `challenge-${Date.now()}`,
        lessonId: lessonData.id,
        question: `Create a sentence using vocabulary from the "${lessonData.title}" lesson.`,
        hint: "Use the words and phrases you've learned in this lesson."
      };
      
      setDailyChallenge(challenge);
    } catch (error) {
      console.error('Error fetching daily challenge:', error);
    }
  };
  
  // Fetch user points
  const fetchUserPoints = async (userId: string) => {
    try {
      const userQuery = query(
        collection(db, 'users'),
        where('email', '==', user?.email)
      );
      
      const userSnapshot = await getDocs(userQuery);
      
      if (!userSnapshot.empty) {
        const userData = userSnapshot.docs[0].data();
        setUserPoints(userData.points || 0);
      }
    } catch (error) {
      console.error('Error fetching user points:', error);
    }
  };
  
  // Submit challenge response
  const handleChallengeSubmit = async () => {
    if (!user || !dailyChallenge || !challengeResponse.trim()) {
      setChallengeSubmitStatus('Please provide a response to the challenge.');
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Check if user has already submitted a challenge today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const responseQuery = query(
        collection(db, 'challengeResponses'),
        where('userId', '==', user.uid),
        where('submittedAt', '>=', Timestamp.fromDate(today)),
        where('submittedAt', '<', Timestamp.fromDate(tomorrow))
      );
      
      const responseSnapshot = await getDocs(responseQuery);
      
      if (!responseSnapshot.empty) {
        setChallengeSubmitStatus('You\'ve already completed today\'s challenge! Come back tomorrow for a new one.');
        setSubmitting(false);
        return;
      }
      
      const response: ChallengeResponse = {
        userId: user.uid,
        challengeId: dailyChallenge.id,
        response: challengeResponse,
        submittedAt: Timestamp.now()
      };
      
      await addDoc(collection(db, 'challengeResponses'), response);
      
      // Award points for completing the challenge
      const userQuery = query(
        collection(db, 'users'),
        where('email', '==', user.email)
      );
      
      const userSnapshot = await getDocs(userQuery);
      
      if (!userSnapshot.empty) {
        const userDoc = userSnapshot.docs[0];
        const userData = userDoc.data();
        const newPoints = (userData.points || 0) + 10;
        
        await updateDoc(doc(db, 'users', userDoc.id), {
          points: newPoints,
          lastPointsUpdate: {
            amount: 10,
            reason: 'Daily Challenge Completion',
            timestamp: new Date()
          }
        });
        
        setUserPoints(newPoints);
      }
      
      setChallengeResponse('');
      setChallengeSubmitStatus('Challenge response submitted successfully! You earned 10 points. Come back tomorrow for a new challenge.');
      setDailyChallenge(null); // Clear the challenge since it's completed for today
    } catch (error) {
      console.error('Error submitting challenge response:', error);
      setChallengeSubmitStatus('Failed to submit response. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Redeem a reward
  const handleRedeemReward = async (reward: Reward) => {
    if (!user) {
      return;
    }
    
    if (userPoints < reward.cost) {
      setRewardStatus(`You don't have enough points to redeem ${reward.title}.`);
      return;
    }
    
    try {
      const userQuery = query(
        collection(db, 'users'),
        where('email', '==', user.email)
      );
      
      const userSnapshot = await getDocs(userQuery);
      
      if (!userSnapshot.empty) {
        const userDoc = userSnapshot.docs[0];
        const newPoints = userPoints - reward.cost;
        
        // Update user points
        await updateDoc(doc(db, 'users', userDoc.id), {
          points: newPoints
        });
        
        // Record reward redemption
        await addDoc(collection(db, 'redemptions'), {
          userId: user.uid,
          rewardId: reward.id,
          rewardTitle: reward.title,
          cost: reward.cost,
          redeemedAt: Timestamp.now()
        });
        
        setUserPoints(newPoints);
        setRewardStatus(`You've successfully redeemed ${reward.title}!`);
      }
    } catch (error) {
      console.error('Error redeeming reward:', error);
      setRewardStatus('Failed to redeem reward. Please try again.');
    }
  };

  // Show loading state
  if (loading) {
    return (
      <>
        <Header />
        <main id="main-content" className="flex-grow flex items-center justify-center p-4 bg-muted">
          <div className="loader">Loading your profile data...</div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main id="main-content" className="flex-grow container mx-auto px-4 py-8 max-w-7xl bg-muted">
        <h1 className="text-2xl md:text-3xl font-bold text-primary mb-6 md:mb-8">Your Profile</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
          {/* User Info Card */}
          <div className="bg-white rounded-lg shadow-md p-4 md:p-6 h-full">
            <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 text-gray-800">User Info</h2>
            <div className="mb-3 md:mb-4">
              <p className="text-gray-600 mb-1 text-sm">Email</p>
              <p className="font-medium">{user?.email}</p>
            </div>
            <div className="mb-2">
              <p className="text-gray-600 mb-1 text-sm">Account Created</p>
              <p className="font-medium">{user?.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'N/A'}</p>
            </div>
            <div className="mt-4 text-primary">
              <p className="text-gray-600 mb-1 text-sm">Points Balance</p>
              <p className="font-bold text-xl">{userPoints} points</p>
            </div>
          </div>
          
          {/* Daily Challenge Card */}
          <div className="bg-white rounded-lg shadow-md p-4 md:p-6 h-full">
            <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 text-gray-800">Daily Challenge</h2>
            {dailyChallenge ? (
              <>
                <div className="mb-4">
                  <h3 className="text-md font-medium text-gray-700 mb-2">Challenge:</h3>
                  <p className="p-3 bg-gray-50 rounded-md">{dailyChallenge.question}</p>
                  {dailyChallenge.hint && (
                    <p className="mt-2 text-sm text-gray-500 italic">Hint: {dailyChallenge.hint}</p>
                  )}
                </div>
                <div className="mb-4">
                  <label htmlFor="challenge-response" className="block text-sm font-medium text-gray-700 mb-1">
                    Your Response:
                  </label>
                  <textarea
                    id="challenge-response"
                    rows={4}
                    className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    value={challengeResponse}
                    onChange={(e) => setChallengeResponse(e.target.value)}
                    placeholder="Type your response here..."
                    disabled={submitting}
                  ></textarea>
                </div>
                <button
                  onClick={handleChallengeSubmit}
                  disabled={submitting || !challengeResponse.trim()}
                  className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Response'}
                </button>
                {challengeSubmitStatus && (
                  <p className={`mt-2 text-sm ${challengeSubmitStatus.includes('successfully') ? 'text-green-600' : 'text-red-600'}`}>
                    {challengeSubmitStatus}
                  </p>
                )}
              </>
            ) : (
              <div className="flex justify-center items-center h-40">
                <p className="text-gray-500">Loading today's challenge...</p>
              </div>
            )}
          </div>
          
          {/* Reward Center Card */}
          <div className="bg-white rounded-lg shadow-md p-4 md:p-6 h-full">
            <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 text-gray-800">Reward Center</h2>
            <p className="mb-4 text-gray-600">Redeem your points for these exclusive rewards!</p>
            <div className="space-y-3">
              {rewards.map((reward) => (
                <div key={reward.id} className="border rounded-md p-3 bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-800">{reward.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{reward.description}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-primary">{reward.cost} pts</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRedeemReward(reward)}
                    disabled={userPoints < reward.cost}
                    className={`mt-2 w-full py-1.5 px-3 rounded-md text-white font-medium text-sm
                      ${userPoints >= reward.cost 
                        ? 'bg-primary hover:bg-primary-dark' 
                        : 'bg-gray-400 cursor-not-allowed'}`}
                  >
                    {userPoints >= reward.cost ? 'Redeem Reward' : 'Not Enough Points'}
                  </button>
                </div>
              ))}
            </div>
            {rewardStatus && (
              <p className={`mt-3 text-sm ${rewardStatus.includes('successfully') ? 'text-green-600' : rewardStatus.includes('enough') ? 'text-orange-600' : 'text-red-600'}`}>
                {rewardStatus}
              </p>
            )}
            
            {/* Reward History Section */}
            {user && <RewardHistory userId={user.uid} limit={3} />}
          </div>
        </div>
        
        {/* User Progress */}
        <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-6 md:mb-8">
          <h2 className="text-lg md:text-xl font-semibold mb-4 md:mb-6 text-gray-800">Learning Progress</h2>
          
          {userProgress.length > 0 ? (
            <div className="overflow-x-auto rounded-md border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lesson
                    </th>
                    <th scope="col" className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Score
                    </th>
                    <th scope="col" className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Completed
                    </th>
                    <th scope="col" className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {userProgress
                    .sort((a, b) => {
                      const dateA = new Date(a.timestamp?.seconds ? a.timestamp.toDate() : a.timestamp);
                      const dateB = new Date(b.timestamp?.seconds ? b.timestamp.toDate() : b.timestamp);
                      return dateB.getTime() - dateA.getTime();
                    })
                    .map((progress) => {
                      const lesson = lessons.find(l => l.id === progress.lessonId);
                      
                      return (
                        <tr key={progress.id} className="hover:bg-gray-50">
                          <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {lesson?.title || progress.lessonId}
                            </div>
                          </td>
                          <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {progress.score}%
                            </div>
                          </td>
                          <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                              ${
                                progress.completed 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                              {progress.completed ? 'Yes' : 'No'}
                            </span>
                          </td>
                          <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(progress.timestamp?.seconds ? progress.timestamp.toDate() : progress.timestamp).toLocaleDateString()}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-gray-500">No activity yet. Start learning to track your progress!</p>
              <Link href="/lessons" className="mt-4 inline-block text-primary hover:text-primary-light font-medium">
                Browse Lessons
              </Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
} 