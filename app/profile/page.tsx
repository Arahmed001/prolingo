"use client";

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../../lib/firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc, 
  updateDoc, 
  setDoc 
} from 'firebase/firestore';

// Prevent static prerendering
export const dynamic = 'force-dynamic';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [completedLessons, setCompletedLessons] = useState(0);
  const [totalLessons, setTotalLessons] = useState(10); // Default value
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [userGoal, setUserGoal] = useState('');
  const [isSavingGoal, setIsSavingGoal] = useState(false);
  const [goalSaved, setGoalSaved] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Mark that we're on the client side
    setIsClient(true);

    // Only run auth check in the browser
    if (typeof window !== 'undefined') {
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setLoading(false);
        if (currentUser) {
          setUser(currentUser);
          fetchUserData(currentUser.uid);
          fetchProgressData(currentUser.uid);
        } else {
          // Redirect to login if no user is logged in
          router.push('/login');
        }
      });

      // Cleanup subscription on unmount
      return () => unsubscribe();
    } else {
      // If we're on the server, just set loading to false
      setLoading(false);
    }
  }, [router]);

  const fetchUserData = async (userId: string) => {
    try {
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.goal) {
          setUserGoal(userData.goal);
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchProgressData = async (userId: string) => {
    try {
      // Get total lessons count
      const lessonsCollection = collection(db, 'lessons');
      const lessonsSnapshot = await getDocs(lessonsCollection);
      const totalLessonsCount = lessonsSnapshot.size;
      setTotalLessons(totalLessonsCount > 0 ? totalLessonsCount : 10);
      
      // Get completed lessons count
      const progressCollection = collection(db, 'progress');
      const progressQuery = query(
        progressCollection,
        where('userId', '==', userId),
        where('completed', '==', true)
      );
      const progressSnapshot = await getDocs(progressQuery);
      const completedLessonsCount = progressSnapshot.size;
      setCompletedLessons(completedLessonsCount);
      
      // Calculate percentage
      const percentage = totalLessonsCount > 0 
        ? Math.round((completedLessonsCount / totalLessonsCount) * 100) 
        : 0;
      setProgressPercentage(percentage);
    } catch (error) {
      console.error('Error fetching progress data:', error);
    }
  };

  const handleGoalSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSavingGoal(true);
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        goal: userGoal
      });
      setGoalSaved(true);
      setTimeout(() => setGoalSaved(false), 3000);
    } catch (error) {
      console.error('Error saving goal:', error);
      // If the document doesn't exist yet, create it
      try {
        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(userDocRef, {
          email: user.email,
          goal: userGoal
        });
        setGoalSaved(true);
        setTimeout(() => setGoalSaved(false), 3000);
      } catch (innerError) {
        console.error('Error creating user document:', innerError);
      }
    } finally {
      setIsSavingGoal(false);
    }
  };

  // Show a loading state until we confirm we're on the client
  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl font-medium text-primary">Loading...</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl font-medium text-primary">Loading...</div>
      </div>
    );
  }

  // If we're still here and there's no user, we're in the process of redirecting
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl font-medium text-primary">Redirecting to login...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow-md rounded-xl overflow-hidden">
          {/* Header */}
          <div className="bg-primary px-6 py-8 text-white">
            <h1 className="text-3xl font-bold">User Profile</h1>
            <p className="mt-2 text-white/80">View and manage your account information</p>
          </div>

          {/* Profile Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* User Info */}
              <div className="md:col-span-2 space-y-6">
                <div className="bg-white border border-border rounded-lg p-6 shadow-sm">
                  <h2 className="text-xl font-semibold mb-4 text-primary">Account Information</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">Email</label>
                      <div className="text-lg font-medium">{user.email}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">Account ID</label>
                      <div className="text-sm text-muted-foreground">{user.uid}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">Account Created</label>
                      <div className="text-sm text-muted-foreground">
                        {user.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress Section */}
                <div className="bg-white border border-border rounded-lg p-6 shadow-sm">
                  <h2 className="text-xl font-semibold mb-4 text-primary">Your Progress</h2>
                  
                  {/* A1 Progress Bar */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-muted-foreground">A1 Progress</span>
                      <span className="text-sm font-medium">{progressPercentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${progressPercentage}%` }}
                      ></div>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      {completedLessons} of {totalLessons} lessons completed
                    </div>
                  </div>
                  
                  {/* Learning Goal */}
                  <div className="mt-6">
                    <h3 className="text-lg font-medium text-primary mb-3">Your Learning Goal</h3>
                    <form onSubmit={handleGoalSubmit} className="space-y-3">
                      <input
                        type="text"
                        value={userGoal}
                        onChange={(e) => setUserGoal(e.target.value)}
                        placeholder="e.g., Reach A2 by June"
                        className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <button
                        type="submit"
                        disabled={isSavingGoal}
                        className="w-full py-2 px-4 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
                      >
                        {isSavingGoal ? 'Saving...' : 'Save Goal'}
                      </button>
                      {goalSaved && (
                        <div className="text-sm text-green-600">Goal saved successfully!</div>
                      )}
                    </form>
                  </div>
                </div>

                {/* Achievements Section */}
                <div className="bg-white border border-border rounded-lg p-6 shadow-sm">
                  <h2 className="text-xl font-semibold mb-4 text-primary">Your Achievements</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* First Lesson Badge */}
                    <div className={`border rounded-lg p-4 text-center ${completedLessons > 0 ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-gray-50 opacity-50'}`}>
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h3 className="font-medium">First Lesson</h3>
                      <p className="text-xs text-muted-foreground mt-1">Completed your first lesson</p>
                    </div>
                    
                    {/* 5 Quizzes Badge */}
                    <div className={`border rounded-lg p-4 text-center ${completedLessons >= 5 ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-gray-50 opacity-50'}`}>
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <h3 className="font-medium">5 Quizzes</h3>
                      <p className="text-xs text-muted-foreground mt-1">Completed 5 quizzes</p>
                    </div>
                    
                    {/* A1 Star Badge */}
                    <div className={`border rounded-lg p-4 text-center ${progressPercentage >= 100 ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-gray-50 opacity-50'}`}>
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                      </div>
                      <h3 className="font-medium">A1 Star</h3>
                      <p className="text-xs text-muted-foreground mt-1">Completed A1 level</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-border rounded-lg p-6 shadow-sm">
                  <h2 className="text-xl font-semibold mb-4 text-primary">Account Actions</h2>
                  <div className="space-y-4">
                    <button 
                      className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-secondary hover:bg-secondary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary"
                      onClick={() => router.push('/change-password')}
                    >
                      Change Password
                    </button>
                    <button 
                      className="w-full py-2 px-4 border border-border rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                      onClick={() => auth.signOut().then(() => router.push('/login'))}
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="space-y-6">
                <div className="bg-white border border-border rounded-lg p-6 shadow-sm">
                  <h2 className="text-xl font-semibold mb-4 text-primary">Your Stats</h2>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Lessons Completed</span>
                      <span className="text-xl font-bold text-primary">{completedLessons}</span>
                    </div>
                    <div className="border-t border-border pt-4 flex justify-between items-center">
                      <span className="text-muted-foreground">Quizzes Taken</span>
                      <span className="text-xl font-bold text-primary">{Math.floor(completedLessons * 0.7)}</span>
                    </div>
                    <div className="border-t border-border pt-4 flex justify-between items-center">
                      <span className="text-muted-foreground">Average Score</span>
                      <span className="text-xl font-bold text-accent">85%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-border rounded-lg p-6 shadow-sm">
                  <h2 className="text-xl font-semibold mb-4 text-primary">Subscription</h2>
                  <div className="p-4 bg-primary/10 rounded-lg">
                    <div className="font-medium text-primary">Free Plan</div>
                    <div className="text-sm text-muted-foreground mt-1">Basic access to ESL teaching tools</div>
                  </div>
                  <div className="mt-4">
                    <button 
                      className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                      onClick={() => router.push('/pricing')}
                    >
                      Upgrade Plan
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 