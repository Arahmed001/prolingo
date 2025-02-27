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
} from 'firebase/firestore';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Link from 'next/link';

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

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [syncStatus, setSyncStatus] = useState<string>('');
  const [exportStatus, setExportStatus] = useState<string>('');
  
  const router = useRouter();

  // Check authentication status
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        fetchUserData(user.uid);
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

  // Show loading state
  if (loading) {
    return (
      <>
        <Header />
        <main id="main-content" id="main-content" className="flex-grow flex items-center justify-center p-4 bg-muted">
          <div className="loader">Loading your profile data...</div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main id="main-content" id="main-content" className="flex-grow container mx-auto px-4 py-8 max-w-7xl bg-muted">
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
          </div>
          
          {/* Progress Card */}
          <div className="bg-white rounded-lg shadow-md p-4 md:p-6 h-full">
            <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 text-gray-800">Learning Progress</h2>
            <div className="mb-3 md:mb-4">
              <p className="text-gray-600 mb-1 text-sm">Completed Lessons</p>
              <p className="font-medium">{userProgress.filter(p => p.completed).length}</p>
            </div>
            <div className="mb-2">
              <p className="text-gray-600 mb-1 text-sm">Average Score</p>
              <p className="font-medium">
                {userProgress.length > 0
                  ? `${Math.round(userProgress.reduce((sum, p) => sum + p.score, 0) / userProgress.length)}%`
                  : 'No lessons completed yet'}
              </p>
            </div>
          </div>
          
          {/* Tool Integrations Card */}
          <div className="bg-white rounded-lg shadow-md p-4 md:p-6 h-full">
            <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 text-gray-800">Tool Integrations</h2>
            
            <div className="space-y-4">
              <div>
                <button aria-label="Button" tabIndex={0} tabIndex={0} 
                  onClick={syncWithDuolingo} onKeyDown={(e) => { if(e.key === "Enter" || e.key === " ") e.target.click(); }}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded transition-colors text-sm md:text-base"
                >
                  Sync Progress with Duolingo
                </button>
                {syncStatus && (
                  <p className="text-sm mt-2 text-green-600">{syncStatus}</p>
                )}
              </div>
              
              <div>
                <button aria-label="Button" tabIndex={0} tabIndex={0} 
                  onClick={exportVocabulary} onKeyDown={(e) => { if(e.key === "Enter" || e.key === " ") e.target.click(); }}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded transition-colors text-sm md:text-base"
                >
                  Export Vocabulary as CSV
                </button>
                {exportStatus && (
                  <p className="text-sm mt-2 text-blue-600">{exportStatus}</p>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Recent Activity Section */}
        <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-6 md:mb-8">
          <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 text-gray-800">Recent Activity</h2>
          
          {userProgress.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lesson
                    </th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Score
                    </th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Completed
                    </th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {userProgress
                    .sort((a, b) => new Date(b.timestamp?.seconds ? b.timestamp.toDate() : b.timestamp).getTime() - 
                                   new Date(a.timestamp?.seconds ? a.timestamp.toDate() : a.timestamp).getTime())
                    .slice(0, 5)
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
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
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
              <Link tabIndex={0} tabIndex={0} href="/lessons" className="mt-4 inline-block text-primary hover:text-primary-light font-medium">
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