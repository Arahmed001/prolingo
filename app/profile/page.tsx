"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../lib/firebase';

// Prevent static prerendering
export const dynamic = 'force-dynamic';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
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
                      <span className="text-xl font-bold text-primary">5</span>
                    </div>
                    <div className="border-t border-border pt-4 flex justify-between items-center">
                      <span className="text-muted-foreground">Quizzes Taken</span>
                      <span className="text-xl font-bold text-primary">3</span>
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