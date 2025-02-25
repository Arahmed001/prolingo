"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../../lib/firebase';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';

// Prevent static prerendering
export const dynamic = 'force-dynamic';

export default function SubscriptionPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [currentPlan, setCurrentPlan] = useState('free');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
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
        if (userData.plan) {
          setCurrentPlan(userData.plan);
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const updateSubscription = async (plan: string) => {
    if (!user) return;
    
    setIsUpdating(true);
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        plan: plan
      });
      setCurrentPlan(plan);
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (error) {
      console.error('Error updating subscription:', error);
      // If the document doesn't exist yet, create it
      try {
        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(userDocRef, {
          email: user.email,
          plan: plan
        });
        setCurrentPlan(plan);
        setUpdateSuccess(true);
        setTimeout(() => setUpdateSuccess(false), 3000);
      } catch (innerError) {
        console.error('Error creating user document:', innerError);
      }
    } finally {
      setIsUpdating(false);
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
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary mb-4">Choose Your Plan</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Select the subscription plan that best fits your learning needs and unlock premium features.
          </p>
          {updateSuccess && (
            <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-md">
              Your subscription has been updated successfully!
            </div>
          )}
        </div>

        {/* Subscription Plans */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Free Plan */}
          <div className={`bg-white rounded-xl shadow-md overflow-hidden border-2 ${currentPlan === 'free' ? 'border-primary' : 'border-transparent'}`}>
            <div className="p-6">
              <h2 className="text-2xl font-bold text-primary mb-2">Free Plan</h2>
              <div className="text-3xl font-bold mb-4">$0<span className="text-lg text-muted-foreground font-normal">/month</span></div>
              <p className="text-muted-foreground mb-6">Basic access to ESL teaching tools</p>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Access to basic lessons</span>
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Limited quizzes</span>
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Progress tracking</span>
                </li>
                <li className="flex items-center text-muted-foreground">
                  <svg className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>Advanced lessons</span>
                </li>
                <li className="flex items-center text-muted-foreground">
                  <svg className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>Personalized feedback</span>
                </li>
              </ul>
              
              <button 
                onClick={() => updateSubscription('free')}
                disabled={currentPlan === 'free' || isUpdating}
                className={`w-full py-3 px-4 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary
                  ${currentPlan === 'free' 
                    ? 'bg-gray-100 text-primary border border-primary cursor-default' 
                    : 'bg-primary text-white hover:bg-primary/90'}`}
              >
                {currentPlan === 'free' ? 'Current Plan' : 'Select Free Plan'}
              </button>
            </div>
          </div>
          
          {/* Premium Plan */}
          <div className={`bg-white rounded-xl shadow-md overflow-hidden border-2 ${currentPlan === 'premium' ? 'border-primary' : 'border-transparent'}`}>
            <div className="p-6">
              <div className="bg-primary text-white text-center py-1 px-4 rounded-full text-sm font-medium w-fit mb-4">RECOMMENDED</div>
              <h2 className="text-2xl font-bold text-primary mb-2">Premium Plan</h2>
              <div className="text-3xl font-bold mb-4">$10<span className="text-lg text-muted-foreground font-normal">/month</span></div>
              <p className="text-muted-foreground mb-6">Full access to all features</p>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>All free plan features</span>
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Unlimited lessons & quizzes</span>
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Advanced grammar exercises</span>
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Personalized learning path</span>
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Priority support</span>
                </li>
              </ul>
              
              <button 
                onClick={() => updateSubscription('premium')}
                disabled={currentPlan === 'premium' || isUpdating}
                className={`w-full py-3 px-4 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary
                  ${currentPlan === 'premium' 
                    ? 'bg-gray-100 text-primary border border-primary cursor-default' 
                    : 'bg-primary text-white hover:bg-primary/90'}`}
              >
                {currentPlan === 'premium' ? 'Current Plan' : 'Select Premium Plan'}
              </button>
            </div>
          </div>
        </div>
        
        {/* Virtual Currency Section */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden p-6 mb-8">
          <h2 className="text-2xl font-bold text-primary mb-4">ProLingo Coins</h2>
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div className="mb-4 md:mb-0">
              <p className="text-lg mb-2">Purchase virtual currency to unlock special features</p>
              <p className="text-muted-foreground">100 Coins = $1</p>
              <div className="mt-4 flex items-center">
                <div className="flex items-center bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Your balance: 0 coins</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col space-y-2">
              <button className="bg-secondary text-white py-2 px-6 rounded-md hover:bg-secondary/90 transition-colors">
                Buy 100 Coins ($1)
              </button>
              <button className="bg-secondary text-white py-2 px-6 rounded-md hover:bg-secondary/90 transition-colors">
                Buy 500 Coins ($5)
              </button>
              <button className="bg-secondary text-white py-2 px-6 rounded-md hover:bg-secondary/90 transition-colors">
                Buy 1000 Coins ($10)
              </button>
            </div>
          </div>
        </div>
        
        {/* FAQ Section */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden p-6">
          <h2 className="text-2xl font-bold text-primary mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-lg">How do I change my subscription plan?</h3>
              <p className="text-muted-foreground">You can change your subscription plan at any time by visiting this page and selecting a different plan.</p>
            </div>
            <div>
              <h3 className="font-medium text-lg">What are ProLingo Coins used for?</h3>
              <p className="text-muted-foreground">ProLingo Coins can be used to unlock special features, premium lessons, and exclusive content.</p>
            </div>
            <div>
              <h3 className="font-medium text-lg">Can I cancel my subscription?</h3>
              <p className="text-muted-foreground">Yes, you can cancel your subscription at any time. Your access will continue until the end of your billing period.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 