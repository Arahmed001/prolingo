"use client";

import { useState, useEffect, useRef, ReactNode, JSXElementConstructor, Key, PromiseLikeOfReactNode, ReactElement, SetStateAction } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getLessonById } from '../../../lib/services/lessonService';
import { Lesson, VocabularyItem } from '../../../lib/types';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc, collection, addDoc, serverTimestamp, getDoc, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { auth, db } from '../../../lib/firebase/init';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { usePerformanceMonitoring } from '../../../lib/performance';

// Base64 blur placeholders for images
const blurPlaceholders = {
  default: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mO8/+d/PQAJBAj5ZYCkFwAAAABJRU5ErkJggg==',
  vocabulary: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  grammar: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mMUYGhoBAABBAEAcIMBSAAAAABJRU5ErkJggg==',
};

// Define a local GrammarExercise interface with the explanation property
interface GrammarExercise {
  question: string;
  answer: string;
  explanation?: string;
}

// Define a QuizQuestion interface
interface QuizQuestion {
  type: 'multiple-choice' | 'fill-in';
  question: string;
  options?: string[];
  answer: string;
}

// Extend the Lesson type to include examples
interface ExtendedLesson extends Lesson {
  questions: any;
  quiz: any;
  difficulty: ReactNode;
  examples?: string[];
  grammar?: GrammarExercise[];
  aiGeneratedContent?: {
    text: string;
    tips: string[];
  };
}

interface Progress {
  id: string;
  userId: string;
  lessonId: string;
  score: number;
  completed: boolean;
  timestamp: any;
}

// Prevent static prerendering
export const dynamic = 'force-dynamic';

// Add a toast notification component
const Toast = ({ message, onClose }: { message: string; onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center">
      <span>{message}</span>
      <button 
        onClick={onClose}
        className="ml-2 text-white focus:outline-none"
        aria-label="Close notification"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
};

export default function LessonPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [lesson, setLesson] = useState<ExtendedLesson | null>(null);
  const [quizMode, setQuizMode] = useState<boolean>(false);
  const [currentQuizIndex, setCurrentQuizIndex] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [score, setScore] = useState<number>(0);
  const [quizCompleted, setQuizCompleted] = useState<boolean>(false);
  const [userProgress, setUserProgress] = useState<Progress[]>([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  const router = useRouter();
  const params = useParams();
  const lessonId = params.id as string;
  
  // Add performance monitoring
  usePerformanceMonitoring(`/lessons/${lessonId}`);

  const DIFFICULTY_THRESHOLD = 80;
  const CONSECUTIVE_HIGH_SCORES_NEEDED = 3;

  // Function to get recommendation based on lesson ID
  const getRecommendation = (lessonId: string): { title: string, id: string } => {
    // Simple hardcoded recommendations based on lesson ID
    const recommendations: {[key: string]: { title: string, id: string }} = {
      'greetings': { title: 'Numbers', id: 'numbers' },
      'numbers': { title: 'Colors', id: 'colors' },
      'colors': { title: 'Family Members', id: 'family' },
      'family': { title: 'Food and Drinks', id: 'food' },
      'food': { title: 'Travel Phrases', id: 'travel' },
      'travel': { title: 'Weather', id: 'weather' },
      'weather': { title: 'Hobbies', id: 'hobbies' },
      'hobbies': { title: 'Daily Routines', id: 'routines' },
      'routines': { title: 'Greetings', id: 'greetings' },
    };
    
    return recommendations[lessonId] || { title: 'Greetings', id: 'greetings' };
  };

  // Example sentences for lessons if not provided by Firebase
  const getDefaultExamples = (lessonId: string): string[] => {
    const defaultExamples: {[key: string]: string[]} = {
      'greetings': [
        'Hello, how are you today?',
        'Good morning! It\'s nice to meet you.',
        'Hi there! My name is Sarah.',
        'Good evening, everyone!',
        'Hey! Long time no see!'
      ],
      'numbers': [
        'I need to buy three apples and two oranges.',
        'The building has twenty-five floors.',
        'My phone number is 555-123-4567.',
        'She scored ninety-eight on her math test.',
        'There are seven days in a week.'
      ],
      'colors': [
        'The sky is blue on a clear day.',
        'Her dress was a beautiful shade of red.',
        'I painted my bedroom walls green.',
        'The sunset had amazing orange and purple hues.',
        'He always wears black shoes to work.'
      ],
      'family': [
        'My sister is three years younger than me.',
        'His grandparents live in the countryside.',
        'We visit our cousins every summer.',
        'Her father is a doctor at the local hospital.',
        'My aunt makes the best chocolate cake.'
      ],
      'food': [
        'I usually have cereal for breakfast.',
        'This restaurant serves delicious Italian pasta.',
        'Would you like some more coffee?',
        'She\'s allergic to nuts and seafood.',
        'Let\'s order pizza for dinner tonight.'
      ]
    };
    
    return defaultExamples[lessonId] || [
      'This is an example sentence.',
      'Language learning is fun and rewarding.',
      'Practice makes perfect!',
      'Try to use new vocabulary every day.',
      'Don\'t be afraid to make mistakes.'
    ];
  };

  // Check authentication status
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        setLoading(false);
      } else {
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Load lesson data
  useEffect(() => {
    if (!user || !lessonId) return;

    const fetchLesson = async () => {
      try {
        const lessonRef = doc(db, 'lessons', lessonId);
        const lessonSnap = await getDoc(lessonRef);
        
        if (lessonSnap.exists()) {
          setLesson({ id: lessonSnap.id, ...lessonSnap.data() } as ExtendedLesson);
        } else {
          console.error("Lesson not found");
          router.push('/lessons');
        }
      } catch (error) {
        console.error("Error fetching lesson:", error);
      }
    };

    fetchLesson();
  }, [user, lessonId, router]);

  // Load user progress
  useEffect(() => {
    if (!user || !lessonId) return;

    const fetchUserProgress = async () => {
      try {
        const progressQuery = query(
          collection(db, 'progress'),
          where('userId', '==', user.uid),
          where('lessonId', '==', lessonId),
          orderBy('timestamp', 'desc'),
          limit(3)
        );
        
        const progressSnap = await getDocs(progressQuery);
        const progressData: Progress[] = [];
        
        progressSnap.forEach((doc) => {
          progressData.push({ id: doc.id, ...doc.data() } as Progress);
        });
        
        setUserProgress(progressData);
        
        // Check if we need to adjust difficulty
        adjustLessonDifficulty(progressData);
      } catch (error) {
        console.error("Error fetching user progress:", error);
      }
    };

    fetchUserProgress();
  }, [user, lessonId]);

  // Adjust lesson difficulty based on quiz scores
  const adjustLessonDifficulty = async (progress: Progress[]) => {
    if (!lesson || progress.length < 3) return;
    
    // Calculate average score of last 3 quizzes
    const totalScore = progress.reduce((sum, p) => sum + p.score, 0);
    const averageScore = totalScore / progress.length;
    
    // Get current lesson difficulty level
    const currentLevel = lesson.level; // e.g., "A1", "A2", "B1", etc.
    
    try {
      // If average score >= 80%, increase difficulty
      if (averageScore >= 80) {
        let newContent = lesson.content || '';
        let newVocabulary = [...(lesson.vocabulary || [])];
        let newGrammar = [...(lesson.grammar || [])];
        let newLevel = currentLevel;
        
        // Adjust content based on current level
        if (currentLevel === 'A1') {
          newLevel = 'A2';
          newContent += "\n\nLet's explore more advanced concepts. Discuss your daily routine in more detail.";
          newVocabulary.push({
            word: 'routine', definition: '',
            term: undefined
          }, { word: 'schedule', definition: '', term: undefined }, { word: 'appointment', definition: '', term: undefined }, { word: 'commute', definition: '', term: undefined });
          newGrammar.push({ question: 'How do you use present continuous tense?', answer: 'Use it for actions happening now: subject + am/is/are + verb-ing' }, { question: 'When do you use frequency adverbs?', answer: 'Use them to describe how often something happens' });
        } else if (currentLevel === 'A2') {
          newLevel = 'B1';
          newContent += "\n\nNow let's discuss hypothetical situations and your preferences.";
          newVocabulary.push({
            word: 'preference', definition: '',
            term: undefined
          }, { word: 'hypothesis', definition: '', term: undefined }, { word: 'condition', definition: '', term: undefined }, { word: 'possibility', definition: '', term: undefined });
          newGrammar.push({ question: 'How do you form conditional tenses?', answer: 'Use if-clauses with different verb forms depending on the type of conditional' }, { question: 'How do you use modal verbs for possibility?', answer: 'Use might, may, could to express different degrees of possibility' });
        }
        
        // Update lesson in Firestore
        const lessonRef = doc(db, 'lessons', lessonId);
        await updateDoc(lessonRef, {
          content: newContent,
          vocabulary: newVocabulary,
          grammar: newGrammar,
          level: newLevel,
          difficulty: 'Increased based on user performance'
        });
        
        // Update local state
        setLesson({
          ...lesson,
          content: newContent,
          vocabulary: newVocabulary,
          grammar: newGrammar,
          level: newLevel
        });
      }
      // If average score < 50%, decrease difficulty
      else if (averageScore < 50) {
        let newContent = lesson.content || '';
        let newVocabulary = [...(lesson.vocabulary || [])];
        let newGrammar = [...(lesson.grammar || [])];
        let newLevel = currentLevel;
        
        // Adjust content based on current level
        if (currentLevel === 'B1') {
          newLevel = 'A2';
          newContent = "Let's simplify the content. Focus on basic daily conversations.\n\n" + newContent.split("\n\n")[0];
          newVocabulary = newVocabulary.slice(0, Math.max(5, newVocabulary.length - 4));
          newGrammar = newGrammar.slice(0, Math.max(3, newGrammar.length - 2));
        } else if (currentLevel === 'A2') {
          newLevel = 'A1';
          newContent = "Let's start with the basics. Simple greetings and introductions.\n\n" + newContent.split("\n\n")[0];
          newVocabulary = newVocabulary.slice(0, Math.max(3, newVocabulary.length - 4));
          newGrammar = newGrammar.slice(0, Math.max(2, newGrammar.length - 2));
        }
        
        // Update lesson in Firestore
        const lessonRef = doc(db, 'lessons', lessonId);
        await updateDoc(lessonRef, {
          content: newContent,
          vocabulary: newVocabulary,
          grammar: newGrammar,
          level: newLevel,
          difficulty: 'Decreased based on user performance'
        });
        
        // Update local state
        setLesson({
          ...lesson,
          content: newContent,
          vocabulary: newVocabulary,
          grammar: newGrammar,
          level: newLevel
        });
      }
    } catch (error) {
      console.error("Error adjusting lesson difficulty:", error);
    }
  };

  // Start quiz
  const handleStartQuiz = () => {
    setQuizMode(true);
    setCurrentQuizIndex(0);
    setScore(0);
    setQuizCompleted(false);
    setSelectedAnswer('');
  };

  // Submit answer
  const handleSubmitAnswer = () => {
    if (!lesson) return;
    // Check if answer is correct
    const currentQuestion = lesson.questions[currentQuizIndex];
    if (selectedAnswer === currentQuestion.answer) {
      setScore(prevScore => prevScore + 1);
    }
    // Move to next question or finish quiz
    if (currentQuizIndex < lesson.quiz.length - 1) {
      setCurrentQuizIndex(prevIndex => prevIndex + 1);
      setSelectedAnswer('');
    } else {
      completeQuiz();
    }
  };

  // Complete quiz
  const completeQuiz = async () => {
    if (!user || !lessonId || !lesson) return;
    
    setQuizCompleted(true);
    
    // Calculate percentage score
    const percentageScore = Math.round((score / lesson.quiz.length) * 100);
    
    try {
      // Save progress to Firebase
      const progressRef = doc(collection(db, 'progress'));
      await updateDoc(progressRef, {
        userId: user.uid,
        lessonId,
        score: percentageScore,
        completed: true,
        timestamp: new Date()
      });
      
      // Add to local progress
      const newProgress: Progress = {
        id: 'temp-id',
        userId: user.uid,
        lessonId,
        score: percentageScore,
        completed: true,
        timestamp: new Date()
      };
      
      setUserProgress(prevProgress => [newProgress, ...prevProgress]);
      
      // Check if we need to adjust difficulty with the new progress
      adjustLessonDifficulty([newProgress, ...userProgress.slice(0, 2)]);
    } catch (error) {
      console.error("Error saving progress:", error);
    }
  };

  // Replace any image rendering with optimized version
  const renderImage = (src: string, alt: string, className: string = "") => (
    <div className={`relative ${className || "h-40 w-full"}`}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className="object-cover rounded-md"
        loading="lazy"
        placeholder="blur"
        blurDataURL={blurPlaceholders.default}
      />
    </div>
  );

  // Replace vocabulary image rendering with optimized version
  const renderVocabularyImage = (item: VocabularyItem) => (
    item.imageUrl ? (
      <div className="relative h-20 w-20 mx-auto mb-2">
        <Image
          src={item.imageUrl}
          alt={item.term}
          fill
          sizes="80px"
          className="object-cover rounded-md"
          loading="lazy"
          placeholder="blur"
          blurDataURL={blurPlaceholders.vocabulary}
        />
      </div>
    ) : null
  );

  // Share lesson function
  const handleShareLesson = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    const shareUrl = `https://prolingo.vercel.app/lessons/${lessonId}`;
    const shareTitle = `Check out this lesson: ${lesson?.title || 'Language Lesson'}`;
    const shareText = `I'm learning ${lesson?.title || 'a new language'} on ProLingo!`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        setToastMessage('Link copied to clipboard!');
        setShowToast(true);
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  // Show loading state
  if (loading || !lesson) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main id="main-content" id="main-content" className="flex-grow flex items-center justify-center">
          <div className="loader">Loading...</div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main id="main-content" id="main-content" className="flex-grow container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          {!quizMode ? (
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-primary">{lesson.title}</h1>
                  <p className="text-gray-600 mt-1">Level: {lesson.level} • Difficulty: {lesson.difficulty}</p>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={handleShareLesson}
                    className="bg-secondary text-white px-4 py-2 rounded-lg hover:bg-secondary-dark transition-colors flex items-center"
                    aria-label="Share lesson"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                    </svg>
                    Share Lesson
                  </button>
                  <button
                    onClick={handleStartQuiz} onKeyDown={(e) => { if(e.key === "Enter" || e.key === " ") e.target.click(); }}
                    className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
                  >
                    Take Quiz
                  </button>
                </div>
              </div>
              
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-2">Description</h2>
                <p className="text-gray-700">{lesson.description}</p>
              </div>
              
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-2">Content</h2>
                <div className="prose max-w-none">
                  {lesson.content?.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-4">{paragraph}</p>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <h2 className="text-xl font-semibold mb-2">Vocabulary</h2>
                  <ul className="list-disc pl-5 space-y-1">
                    {lesson.vocabulary?.map((word, index) => (
                      <li key={index} className="text-gray-700">{word.term}: {word.definition}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-2">Grammar Points</h2>
                  <ul className="list-disc pl-5 space-y-1">
                    {lesson.grammar?.map((point, index) => (
                      <li key={index} className="text-gray-700">{point.question}</li>
                    ))}
                  </ul>
                </div>
              </div>
              
              {userProgress.length > 0 && (
                <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                  <h2 className="text-xl font-semibold mb-2">Your Progress</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {userProgress.map((progress) => (
                      <div key={progress.id} className="bg-white p-3 rounded shadow">
                        <div className="text-lg font-semibold text-primary">{progress.score}%</div>
                        <div className="text-xs text-gray-500">
                          {new Date(progress.timestamp).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div>
              {!quizCompleted ? (
                <div>
                  <h1 className="text-2xl font-bold mb-8 text-center">Quiz: {lesson.title}</h1>
                  
                  <div className="mb-4 text-center">
                    <span className="text-sm bg-gray-100 px-3 py-1 rounded-full">
                      Question {currentQuizIndex + 1} of {lesson.quiz.length}
                    </span>
                  </div>
                  
                  <div className="bg-gray-50 p-6 rounded-lg mb-6">
                    <h2 className="text-xl font-semibold mb-4">
                      {lesson.quiz[currentQuizIndex].question}
                    </h2>
                    
                    <div className="space-y-3">
                      {lesson.quiz[currentQuizIndex].options.map((option: number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | PromiseLikeOfReactNode | SetStateAction<string> | null | undefined, index: Key | null | undefined) => (
                        <div 
                          key={index}
                          onClick={() => setSelectedAnswer(String(option))} onKeyDown={(e) => { if(e.key === "Enter" || e.key === " ") e.target.click(); }}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            selectedAnswer === option 
                              ? 'border-primary bg-primary bg-opacity-10' 
                              : 'border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          <div className="flex items-center">
                            <div className={`w-6 h-6 flex items-center justify-center rounded-full mr-3 ${
                              selectedAnswer === option 
                                ? 'bg-primary text-white' 
                                : 'bg-gray-200'
                            }`}>
                              {String.fromCharCode(65 + Number(index ?? 0))}
                            </div>
                            <span>{String(option)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      onClick={handleSubmitAnswer} onKeyDown={(e) => { if(e.key === "Enter" || e.key === " ") e.target.click(); }}
                      disabled={!selectedAnswer}
                      className={`px-6 py-2 rounded-lg ${
                        selectedAnswer 
                          ? 'bg-primary text-white hover:bg-primary-dark' 
                          : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      } transition-colors`}
                    >
                      {currentQuizIndex < lesson.quiz.length - 1 ? 'Next' : 'Finish'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-10">
                  <h1 className="text-2xl font-bold mb-4">Quiz Completed!</h1>
                  <div className="mb-6">
                    <div className="text-5xl font-bold text-primary mb-2">
                      {Math.round((score / lesson.quiz.length) * 100)}%
                    </div>
                    <p className="text-gray-600">
                      You answered {score} out of {lesson.quiz.length} questions correctly
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <button
                      onClick={() => setQuizMode(false)} onKeyDown={(e) => { if(e.key === "Enter" || e.key === " ") e.target.click(); }}
                      className="block w-full sm:w-auto sm:inline-block px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                    >
                      Return to Lesson
                    </button>
                    <button
                      onClick={handleStartQuiz} onKeyDown={(e) => { if(e.key === "Enter" || e.key === " ") e.target.click(); }}
                      className="block w-full sm:w-auto sm:inline-block px-6 py-2 bg-white border border-primary text-primary rounded-lg hover:bg-gray-50 transition-colors sm:ml-3"
                    >
                      Retry Quiz
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
      {showToast && <Toast message={toastMessage} onClose={() => setShowToast(false)} />}
    </div>
  );
} 