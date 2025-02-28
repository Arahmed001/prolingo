"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import Leaderboard from '@/app/components/Leaderboard';
import RewardsBadges from '@/app/components/RewardsBadges';

// Prevent static prerendering
export const dynamic = 'force-dynamic';

interface User {
  id: string;
  email: string;
  score: number;
}

export default function LeaderboardPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
      if (!user) {
        router.push('/login');
      }
    });
    
    return () => unsubscribe();
  }, [router]);
  
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4">Loading leaderboard...</p>
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
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Leaderboard</h1>
            <p className="text-gray-600">See how you rank against other learners and earn your spot at the top!</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Leaderboard limitCount={15} />
            </div>
            
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold mb-4">How It Works</h2>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0">
                      1
                    </div>
                    <div>
                      <h3 className="font-semibold">Complete Lessons</h3>
                      <p className="text-sm text-gray-600">Earn XP by completing lessons and quizzes</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0">
                      2
                    </div>
                    <div>
                      <h3 className="font-semibold">Maintain Streaks</h3>
                      <p className="text-sm text-gray-600">Log in daily to build your streak for bonus XP</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0">
                      3
                    </div>
                    <div>
                      <h3 className="font-semibold">Complete Challenges</h3>
                      <p className="text-sm text-gray-600">Take on special challenges for XP boosts</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0">
                      4
                    </div>
                    <div>
                      <h3 className="font-semibold">Earn Badges</h3>
                      <p className="text-sm text-gray-600">Collect badges to showcase your achievements</p>
                    </div>
                  </div>
                </div>
        </div>

              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg shadow-md p-6 text-white">
                <h2 className="text-xl font-bold mb-3">Weekly Challenge</h2>
                <p className="mb-4">Complete 5 lessons this week to earn the "Weekly Champion" badge and 50 bonus XP!</p>
                <div className="w-full bg-white/20 rounded-full h-2.5 mb-2">
                  <div className="bg-white h-2.5 rounded-full" style={{ width: '40%' }}></div>
                </div>
                <div className="text-sm text-white/80">2 of 5 lessons completed</div>
                <button className="mt-4 bg-white text-blue-600 px-4 py-2 rounded-md font-medium hover:bg-blue-50 transition-colors">
                  Start Learning
                </button>
              </div>
            </div>
          </div>
          
          <div className="mt-8">
            <RewardsBadges 
              className="bg-white rounded-lg shadow-md p-6"
              rewards={[
                {
                  name: 'First Lesson',
                  description: 'Completed your first lesson',
                  icon: '🎓',
                  date: new Date(),
                  type: 'achievement'
                },
                {
                  name: 'Perfect Score',
                  description: 'Achieved 100% on a quiz',
                  icon: '🏆',
                  date: new Date(),
                  type: 'badge'
                },
                {
                  name: '3-Day Streak',
                  description: 'Logged in for 3 consecutive days',
                  icon: '🔥',
                  date: new Date(),
                  type: 'achievement'
                }
              ]}
            />
          </div>
          
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Leaderboard History</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Winner</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">XP Earned</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prize</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">April 2023</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Sarah Johnson</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">1,250 XP</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Gold Trophy + Premium Month</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">March 2023</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Michael Chen</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">1,120 XP</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Gold Trophy + Premium Month</td>
                      </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">February 2023</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Emma Rodriguez</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">980 XP</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Gold Trophy + Premium Month</td>
                    </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
} 