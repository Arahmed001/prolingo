"use client";

// Add this line to prevent static pre-rendering
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db, isFirebaseInitialized } from '../../lib/firebase';
import Header from '../../app/components/Header';
import Footer from '../../app/components/Footer';
import FirebaseGuard from '../../app/components/FirebaseGuard';

interface Thread {
  id: string;
  title: string;
  authorEmail: string;
  authorName?: string;
  createdAt: Date;
  responseCount: number;
}

export default function CommunityPage() {
  return (
    <FirebaseGuard
      fallback={
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-grow bg-gray-50 py-8 flex items-center justify-center">
            <div className="text-center p-6 max-w-sm mx-auto">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Community Forum</h2>
              <p className="text-gray-600">Please wait while we set up the forum...</p>
            </div>
          </main>
          <Footer />
        </div>
      }
    >
      <CommunityContent />
    </FirebaseGuard>
  );
}

function CommunityContent() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [newThreadTitle, setNewThreadTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState<{ email: string; displayName: string | null } | null>(null);
  const router = useRouter();
  const auth = getAuth();

  // Check if user is logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser({
          email: user.email || 'anonymous@example.com',
          displayName: user.displayName
        });
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, [auth]);

  // Fetch threads from Firestore
  useEffect(() => {
    const fetchThreads = async () => {
      try {
        const threadsQuery = query(
          collection(db, 'threads'),
          orderBy('createdAt', 'desc')
        );
        
        const querySnapshot = await getDocs(threadsQuery);
        const fetchedThreads = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title || 'Untitled Thread',
            authorEmail: data.authorEmail || 'anonymous@example.com',
            authorName: data.authorName || '',
            createdAt: data.createdAt?.toDate() || new Date(),
            responseCount: data.responseCount || 0
          } as Thread;
        });
        
        setThreads(fetchedThreads);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching threads:', err);
        setError('Failed to load threads. Please try again later.');
        setLoading(false);
      }
    };

    fetchThreads();
  }, []);

  // Handle creating new thread
  const handleCreateThread = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      alert('Please log in to create a thread');
      return;
    }

    if (!newThreadTitle.trim()) {
      alert('Please enter a thread title');
      return;
    }

    try {
      const threadData = {
        title: newThreadTitle.trim(),
        authorEmail: user.email,
        authorName: user.displayName || null,
        createdAt: serverTimestamp(),
        responseCount: 0
      };
      
      await addDoc(collection(db, 'threads'), threadData);
      
      // Refresh threads
      const threadsQuery = query(
        collection(db, 'threads'),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(threadsQuery);
      const updatedThreads = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title || 'Untitled Thread',
          authorEmail: data.authorEmail || 'anonymous@example.com',
          authorName: data.authorName || '',
          createdAt: data.createdAt?.toDate() || new Date(),
          responseCount: data.responseCount || 0
        } as Thread;
      });
      
      setThreads(updatedThreads);
      setNewThreadTitle('');
    } catch (err) {
      console.error('Error creating thread:', err);
      alert('Failed to create thread. Please try again.');
    }
  };

  // Handle clicking on a thread
  const handleThreadClick = (threadId: string) => {
    router.push(`/community/thread/${threadId}`);
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Community Forum</h1>
            <p className="mt-2 text-gray-600">Join the discussion with other language learners</p>
          </div>
          
          {/* Create new thread form */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Start a new thread</h2>
            {user ? (
              <form onSubmit={handleCreateThread} className="space-y-4">
                <div>
                  <label htmlFor="thread-title" className="block text-sm font-medium text-gray-700">
                    Thread Title
                  </label>
                  <input
                    type="text"
                    id="thread-title"
                    value={newThreadTitle}
                    onChange={(e) => setNewThreadTitle(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    placeholder="What do you want to discuss?"
                    required
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    Post Thread
                  </button>
                </div>
              </form>
            ) : (
              <div className="bg-blue-50 rounded-md p-4">
                <p className="text-sm text-blue-700">
                  Please <button onClick={() => router.push('/login')} className="font-bold underline">log in</button> to start a new thread.
                </p>
              </div>
            )}
          </div>
          
          {/* Threads list */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Recent Threads</h2>
            </div>
            
            {loading ? (
              <div className="p-6 text-center text-gray-500">
                Loading threads...
              </div>
            ) : error ? (
              <div className="p-6 text-center text-red-500">
                {error}
              </div>
            ) : threads.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No threads yet. Be the first to start a discussion!
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {threads.map((thread) => (
                  <li
                    key={thread.id}
                    className="px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleThreadClick(thread.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-primary">{thread.title}</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Posted by {thread.authorName || thread.authorEmail.split('@')[0]} on {formatDate(thread.createdAt)}
                        </p>
                      </div>
                      <div className="text-sm text-gray-500">
                        {thread.responseCount} {thread.responseCount === 1 ? 'response' : 'responses'}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 