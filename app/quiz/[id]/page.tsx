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

export default function QuizPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentDifficulty, setCurrentDifficulty] = useState<string>('A1');
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userLevel, setUserLevel] = useState<string>('A1');

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
      
      <main id="main-content" id="main-content" className="flex-grow bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center">
              <div aria-live="polite" className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading quiz questions...</p>
            </div>
          ) : (
            <>
              <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-2xl font-bold text-gray-900">Lesson Quiz</h1>
                  <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    Difficulty: {currentDifficulty}
                  </div>
                </div>

                <form aria-label="Form" aria-label="Form" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                  {questions.map((question, index) => (
                    <div key={index} className="mb-8 pb-6 border-b border-gray-200 last:border-0">
                      {renderQuestion(question, index)}
                    </div>
                  ))}

                  {!submitted && (
                    <button
                      type="submit"
                      className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Submit Quiz
                    </button>
                  )}
                </form>

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
                    <button
                      onClick={() => router.push(`/lesson/${params.id} onKeyDown={(e) => { if(e.key === "Enter" || e.key === " ") e.target.click(); }}`)}
                      className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Back to Lesson
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
} 