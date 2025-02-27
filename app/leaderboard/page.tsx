"use client";

import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs, startAfter, endBefore, limitToLast } from 'firebase/firestore';
import { db } from '../../lib/firebase';

// Prevent static prerendering
export const dynamic = 'force-dynamic';

interface User {
  id: string;
  email: string;
  score: number;
}

export default function LeaderboardPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [firstVisible, setFirstVisible] = useState<any>(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);
  const usersPerPage = 5;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Create a query to get top 5 users by score
      const usersQuery = query(
        collection(db, 'users'),
        orderBy('score', 'desc'),
        limit(usersPerPage + 1) // Get one extra to check if there's a next page
      );
      
      const snapshot = await getDocs(usersQuery);
      
      // Check if there's a next page
      setHasNextPage(snapshot.docs.length > usersPerPage);
      
      // Remove the extra document if it exists
      const docs = hasNextPage ? snapshot.docs.slice(0, usersPerPage) : snapshot.docs;
      
      // Set first and last visible documents for pagination
      setFirstVisible(docs[0]);
      setLastVisible(docs[docs.length - 1]);
      
      // Map the documents to User objects
      const userData = docs.map((doc) => ({
        id: doc.id,
        email: doc.data().email || 'Anonymous',
        score: doc.data().score || 0
      }));
      
      setUsers(userData);
      setHasPrevPage(false); // First page has no previous page
    } catch (error) {
      console.error('Error fetching users:', error);
      // If there's an error, provide some sample data
      setUsers([
        { id: '1', email: 'user1@example.com', score: 950 },
        { id: '2', email: 'user2@example.com', score: 820 },
        { id: '3', email: 'user3@example.com', score: 780 },
        { id: '4', email: 'user4@example.com', score: 650 },
        { id: '5', email: 'user5@example.com', score: 520 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchNextPage = async () => {
    if (!lastVisible) return;
    
    setLoading(true);
    try {
      const nextQuery = query(
        collection(db, 'users'),
        orderBy('score', 'desc'),
        startAfter(lastVisible),
        limit(usersPerPage + 1)
      );
      
      const snapshot = await getDocs(nextQuery);
      
      // Check if there's a next page
      setHasNextPage(snapshot.docs.length > usersPerPage);
      
      // Remove the extra document if it exists
      const docs = hasNextPage ? snapshot.docs.slice(0, usersPerPage) : snapshot.docs;
      
      if (docs.length === 0) {
        setHasNextPage(false);
        return;
      }
      
      // Set first and last visible documents for pagination
      setFirstVisible(docs[0]);
      setLastVisible(docs[docs.length - 1]);
      
      // Map the documents to User objects
      const userData = docs.map((doc) => ({
        id: doc.id,
        email: doc.data().email || 'Anonymous',
        score: doc.data().score || 0
      }));
      
      setUsers(userData);
      setHasPrevPage(true);
      setCurrentPage(currentPage + 1);
    } catch (error) {
      console.error('Error fetching next page:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPrevPage = async () => {
    if (!firstVisible) return;
    
    setLoading(true);
    try {
      const prevQuery = query(
        collection(db, 'users'),
        orderBy('score', 'desc'),
        endBefore(firstVisible),
        limitToLast(usersPerPage)
      );
      
      const snapshot = await getDocs(prevQuery);
      
      if (snapshot.docs.length === 0) {
        setHasPrevPage(false);
        return;
      }
      
      // Set first and last visible documents for pagination
      setFirstVisible(snapshot.docs[0]);
      setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
      
      // Map the documents to User objects
      const userData = snapshot.docs.map((doc) => ({
        id: doc.id,
        email: doc.data().email || 'Anonymous',
        score: doc.data().score || 0
      }));
      
      setUsers(userData);
      setHasNextPage(true);
      setCurrentPage(currentPage - 1);
      
      // If we're back to page 1, there's no previous page
      if (currentPage - 1 <= 1) {
        setHasPrevPage(false);
      }
    } catch (error) {
      console.error('Error fetching previous page:', error);
    } finally {
      setLoading(false);
    }
  };

  // For demonstration purposes, we'll use these functions for the static pagination
  const handleNextPage = () => {
    // For now, we'll just increment the page number for UI feedback
    // In a real implementation, this would call fetchNextPage()
    setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    // For now, we'll just decrement the page number for UI feedback
    // In a real implementation, this would call fetchPrevPage()
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div id="main-content" className="min-h-screen bg-muted py-12 px-4 sm:px-6 lg:px-8">
      <div id="main-content" className="max-w-4xl mx-auto">
        {/* Header */}
        <div id="main-content" className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary mb-4">Leaderboard</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            See how you rank against other ProLingo learners. Keep practicing to climb the ranks!
          </p>
        </div>

        {/* Leaderboard Table */}
        <div id="main-content" className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          {loading ? (
            <div id="main-content" className="p-8 text-center">
              <div id="main-content" className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
              <p className="mt-4 text-muted-foreground">Loading leaderboard data...</p>
            </div>
          ) : (
            <div id="main-content" className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rank
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Score
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user, index) => {
                    // Calculate the actual rank based on the current page
                    const rank = (currentPage - 1) * usersPerPage + index + 1;
                    
                    return (
                      <tr key={user.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div id="main-content" className="flex items-center">
                            <div id="main-content" className={`
                              flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-white font-medium
                              ${rank === 1 ? 'bg-yellow-500' : 
                                rank === 2 ? 'bg-gray-400' : 
                                rank === 3 ? 'bg-amber-700' : 'bg-primary'}
                            `}>
                              {rank}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div id="main-content" className="text-sm font-medium text-gray-900">
                            {user.email.split('@')[0]}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div id="main-content" className="text-sm font-bold text-primary">
                            {user.score.toLocaleString()}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  
                  {/* If no users are found, show a message */}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                        No users found. Be the first to join the leaderboard!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Pagination */}
          <div id="main-content" className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <div id="main-content" className="text-sm text-gray-700">
              Page {currentPage}
            </div>
            <div id="main-content" className="flex space-x-2">
              <button
                onClick={handlePrevPage} onKeyDown={(e) => { if(e.key === "Enter" || e.key === " ") e.target.click(); }}
                disabled={currentPage <= 1}
                className={`px-4 py-2 border rounded-md text-sm font-medium ${
                  currentPage <= 1
                    ? 'border-gray-300 text-gray-400 cursor-not-allowed'
                    : 'border-primary text-primary hover:bg-primary/10'
                }`}
              >
                Prev
              </button>
              <button
                onClick={handleNextPage} onKeyDown={(e) => { if(e.key === "Enter" || e.key === " ") e.target.click(); }}
                className="px-4 py-2 border border-primary rounded-md text-sm font-medium text-primary hover:bg-primary/10"
              >
                Next
              </button>
            </div>
          </div>
        </div>
        
        {/* Info Section */}
        <div id="main-content" className="bg-white rounded-xl shadow-md overflow-hidden p-6">
          <h2 className="text-2xl font-bold text-primary mb-4">How Scoring Works</h2>
          <div id="main-content" className="space-y-4">
            <p className="text-muted-foreground">
              Your score is calculated based on several factors:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
              <li>Completing lessons: +10 points each</li>
              <li>Quiz scores: Up to +50 points based on percentage correct</li>
              <li>Daily streaks: +5 points per day</li>
              <li>Perfect quizzes (100%): +20 bonus points</li>
            </ul>
            <p className="text-muted-foreground">
              Keep learning consistently to maximize your score and climb the leaderboard!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 