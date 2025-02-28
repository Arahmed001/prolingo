"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db, auth } from '../../../lib/firebase';
import { doc, getDoc, updateDoc, collection, addDoc, query, where, getDocs, increment, setDoc, serverTimestamp } from 'firebase/firestore';
import Header from '../../../app/components/Header';
import Footer from '../../../app/components/Footer';

// Prevent static prerendering
export const dynamic = 'force-dynamic';

interface QuizQuestion {
  type: 'multiple' | 'fill' | 'matching';
  question: string;
  options?: string[];
  answer: string;
  difficulty: 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
}

interface UserProgress {
  userId: string;
  lessonId: string;
  score: number;
  difficulty: string;
  timestamp: Date;
}

// Function to add sample quiz data
const addSampleQuizData = async (lessonId: string) => {
  try {
    const quizzesCollection = collection(db, 'quizzes');

    // A1 Level Questions
    await addDoc(quizzesCollection, {
      lessonId,
      type: 'multiple',
      question: 'What does "rain" mean?',
      options: ['Water falling from clouds', 'Bright sunshine', 'Strong wind', 'Heavy snow'],
      answer: 'Water falling from clouds',
      difficulty: 'A1'
    });

    await addDoc(quizzesCollection, {
      lessonId,
      type: 'fill',
      question: 'Complete the sentence: "My name ___ John."',
      answer: 'is',
      difficulty: 'A1'
    });

    await addDoc(quizzesCollection, {
      lessonId,
      type: 'matching',
      question: 'Match the word with its meaning: "Hello"',
      options: ['A greeting', 'A goodbye', 'Thank you', 'Please'],
      answer: 'A greeting',
      difficulty: 'A1'
    });

    // B1 Level Questions
    await addDoc(quizzesCollection, {
      lessonId,
      type: 'multiple',
      question: 'Which sentence uses the present perfect correctly?',
      options: [
        'I have been living here for three years',
        'I am living here for three years',
        'I live here for three years',
        'I was living here for three years'
      ],
      answer: 'I have been living here for three years',
      difficulty: 'B1'
    });

    await addDoc(quizzesCollection, {
      lessonId,
      type: 'fill',
      question: 'Complete with the correct form: "If I ___ (know) the answer, I would tell you."',
      answer: 'knew',
      difficulty: 'B1'
    });

    await addDoc(quizzesCollection, {
      lessonId,
      type: 'matching',
      question: 'Match the phrasal verb: "put up with"',
      options: ['tolerate', 'support', 'establish', 'create'],
      answer: 'tolerate',
      difficulty: 'B1'
    });

    console.log('Sample quiz data has been added successfully!');
  } catch (error) {
    console.error('Error adding sample quiz data:', error);
  }
};

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

export default function QuizPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentDifficulty, setCurrentDifficulty] = useState<string>('A1');
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userLevel, setUserLevel] = useState<string>('A1');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    if (!auth.currentUser) {
      router.push('/login');
      return;
    }

    const fetchUserLevelAndQuestions = async () => {
      try {
        // Fetch user's CEFR level
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser!.uid));
        const level = userDoc.exists() ? userDoc.data().level || 'A1' : 'A1';
        setUserLevel(level);

        // Fetch user's last quiz attempt for this lesson
        const progressQuery = query(
          collection(db, 'progress'),
          where('userId', '==', auth.currentUser!.uid),
          where('lessonId', '==', params.id)
        );
        const progressDocs = await getDocs(progressQuery);
        let lastDifficulty = 'A1';
        
        if (!progressDocs.empty) {
          const lastAttempt = progressDocs.docs
            .map(doc => doc.data() as UserProgress)
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];
          
          // Adjust difficulty based on last score
          if (lastAttempt.score >= 80) {
            lastDifficulty = getNextDifficulty(lastAttempt.difficulty);
          } else if (lastAttempt.score < 50) {
            lastDifficulty = getPreviousDifficulty(lastAttempt.difficulty);
          } else {
            lastDifficulty = lastAttempt.difficulty;
          }
        }

        setCurrentDifficulty(lastDifficulty);

        // Fetch questions for the current difficulty
        const questionsQuery = query(
          collection(db, 'quizzes'),
          where('lessonId', '==', params.id),
          where('difficulty', '==', lastDifficulty)
        );
        const questionDocs = await getDocs(questionsQuery);
        const fetchedQuestions = questionDocs.docs.map(doc => doc.data() as QuizQuestion);

        // If no questions found and in development mode, add sample data
        if (fetchedQuestions.length === 0 && process.env.NODE_ENV === 'development') {
          await addSampleQuizData(params.id);
          const newQuestionDocs = await getDocs(questionsQuery);
          const newQuestions = newQuestionDocs.docs.map(doc => doc.data() as QuizQuestion);
          setQuestions(newQuestions);
        } else {
          setQuestions(fetchedQuestions);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching quiz data:', error);
        setLoading(false);
      }
    };

    fetchUserLevelAndQuestions();
  }, [params.id, router]);

  const getNextDifficulty = (current: string): string => {
    const levels = ['A1', 'A2', 'B1', 'B2', 'C1'];
    const currentIndex = levels.indexOf(current);
    return currentIndex < levels.length - 1 ? levels[currentIndex + 1] : current;
  };

  const getPreviousDifficulty = (current: string): string => {
    const levels = ['A1', 'A2', 'B1', 'B2', 'C1'];
    const currentIndex = levels.indexOf(current);
    return currentIndex > 0 ? levels[currentIndex - 1] : current;
  };

  const handleAnswerChange = (index: number, answer: string) => {
    setAnswers({ ...answers, [index]: answer });
  };

  const handleSubmit = async () => {
    if (!auth.currentUser) return;

    const correctAnswers = questions.reduce((count, question, index) => {
      return answers[index] === question.answer ? count + 1 : count;
    }, 0);

    const finalScore = Math.round((correctAnswers / questions.length) * 100);
    setScore(finalScore);
    setSubmitted(true);

    try {
      // Save progress to Firebase
      await addDoc(collection(db, 'progress'), {
        userId: auth.currentUser.uid,
        lessonId: params.id,
        score: finalScore,
        difficulty: currentDifficulty,
        timestamp: serverTimestamp()
      });

      // Update user's level if needed
      if (finalScore >= 80 && currentDifficulty === userLevel) {
        const nextLevel = getNextDifficulty(userLevel);
        await updateDoc(doc(db, 'users', auth.currentUser.uid), {
          level: nextLevel
        });
      }
    } catch (error) {
      console.error('Error saving quiz results:', error);
    }
  };

  // Share quiz score function
  const handleShareScore = async () => {
    if (!auth.currentUser) {
      router.push('/login');
      return;
    }

    const shareUrl = `https://prolingo.vercel.app/quiz/${params.id}`;
    const shareTitle = `My ProLingo Quiz Score`;
    const correctAnswers = Object.keys(answers).filter(key => 
      answers[parseInt(key)] === questions[parseInt(key)]?.answer
    ).length;
    const totalQuestions = questions.length;
    
    const shareText = `I scored ${correctAnswers}/${totalQuestions} on the ${currentDifficulty} level quiz in ProLingo!`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(`${shareText} Check it out at ${shareUrl}`);
        setToastMessage('Score copied to clipboard!');
        setShowToast(true);
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const renderQuestion = (question: QuizQuestion, index: number) => {
    switch (question.type) {
      case 'multiple':
        return (
          <div className="mb-6">
            <p className="text-lg font-medium mb-3">{question.question}</p>
            <div className="space-y-2">
              {question.options?.map((option, optionIndex) => (
                <label key={optionIndex} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name={`question-${index}`}
                    value={option}
                    checked={answers[index] === option}
                    onChange={(e) => handleAnswerChange(index, e.target.value)}
                    disabled={submitted}
                    className="form-radio text-blue-600"
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case 'fill':
        return (
          <div className="mb-6">
            <p className="text-lg font-medium mb-3">{question.question}</p>
            <input
              type="text"
              value={answers[index] || ''}
              onChange={(e) => handleAnswerChange(index, e.target.value)}
              disabled={submitted}
              className="form-input mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Type your answer here"
            />
          </div>
        );

      case 'matching':
        return (
          <div className="mb-6">
            <p className="text-lg font-medium mb-3">{question.question}</p>
            <select
              value={answers[index] || ''}
              onChange={(e) => handleAnswerChange(index, e.target.value)}
              disabled={submitted}
              className="form-select mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select an answer</option>
              {question.options?.map((option, optionIndex) => (
                <option key={optionIndex} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="loader"></div>
          </div>
        ) : (
          <div className="container mx-auto px-4 py-8">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-primary mb-2">Quiz: {params.id}</h1>
                <div className="flex items-center space-x-4">
                  <p className="text-gray-600">Difficulty level:</p>
                  <div className="flex space-x-2">
                    {['A1', 'A2', 'B1', 'B2', 'C1'].map((level) => (
                      <button
                        key={level}
                        onClick={() => setCurrentDifficulty(level)}
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          currentDifficulty === level
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {questions.length > 0 ? (
                <form onSubmit={handleSubmit}>
                  {questions.map((question, index) => renderQuestion(question, index))}
                  
                  {!submitted && (
                    <button
                      type="submit"
                      className="mt-6 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                    >
                      Submit Answers
                    </button>
                  )}
                </form>
              ) : (
                <p className="text-center py-8 text-gray-600">No questions found for this difficulty level.</p>
              )}

              {submitted && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h2 className="text-xl font-semibold mb-2">Quiz Results</h2>
                  <p className="text-lg">
                    Your score: <span className="font-bold text-blue-600">{score}%</span>
                  </p>
                  <p className="mt-2 text-gray-600">
                    {score >= 80 ? (
                      'Great job! You\'re ready for more challenging questions.'
                    ) : score < 50 ? (
                      'Keep practicing! We\'ll adjust the difficulty to help you improve.'
                    ) : (
                      'Good effort! Keep practicing to improve your score.'
                    )}
                  </p>
                  
                  <div className="mt-4 flex space-x-4">
                    <button
                      onClick={handleShareScore}
                      className="bg-secondary text-white px-4 py-2 rounded-lg hover:bg-secondary-dark transition-colors flex items-center"
                      aria-label="Share score"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                      </svg>
                      Share Score
                    </button>
                    <button
                      onClick={() => router.push(`/lessons/${params.id}`)}
                      className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      Back to Lesson
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
      <Footer />
      {showToast && <Toast message={toastMessage} onClose={() => setShowToast(false)} />}
    </div>
  );
} 