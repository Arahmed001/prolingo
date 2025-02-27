"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, updateDoc, setDoc, collection, addDoc, serverTimestamp, query, where, getDocs, increment } from 'firebase/firestore';
import { getLessonById } from '../../../lib/services/lessonService';
import { Lesson } from '../../../lib/types';
import { auth, db } from '../../../lib/firebase/init';

// Define assessment question types
interface AssessmentQuestion {
  type: 'multiple-choice' | 'fill-in' | 'true-false' | 'matching';
  question: string;
  options?: string[];
  answer: string;
  explanation?: string;
}

interface Assessment {
  id: string;
  lessonId: string;
  level: string;
  questions: AssessmentQuestion[];
  createdAt: any;
  updatedAt: any;
}

// Prevent static prerendering
export const dynamic = 'force-dynamic';

export default function AssessmentPage({ params }: { params: { id: string } }) {
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userAnswers, setUserAnswers] = useState<{[key: number]: string}>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [userLevel, setUserLevel] = useState<string>('A1'); // Default to A1
  const [showCompletionMessage, setShowCompletionMessage] = useState(false);
  
  const router = useRouter();
  const { id } = params;
  const auth = getAuth();
  
  // Fetch user level from Firebase
  useEffect(() => {
    async function fetchUserLevel() {
      if (auth.currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            if (userData.level) {
              setUserLevel(userData.level);
            }
          }
        } catch (error) {
          console.error('Error fetching user level:', error);
        }
      }
    }
    
    fetchUserLevel();
  }, [auth.currentUser]);
  
  // Fetch assessment and related lesson
  useEffect(() => {
    async function fetchAssessmentAndLesson() {
      if (!id) return;
      
      try {
        // First try to get the assessment from Firebase
        const assessmentDoc = await getDoc(doc(db, 'assessments', id));
        
        if (assessmentDoc.exists()) {
          // Assessment exists, use it
          const assessmentData = assessmentDoc.data() as Assessment;
          setAssessment(assessmentData);
          
          // Fetch the related lesson
          const lessonData = await getLessonById(assessmentData.lessonId);
          if (lessonData) {
            setLesson(lessonData);
          }
        } else {
          // Assessment doesn't exist, try to get the lesson and generate an assessment
          const lessonData = await getLessonById(id);
          
          if (lessonData) {
            setLesson(lessonData);
            // Generate assessment questions based on lesson content
            await generateAssessmentQuestions(lessonData, userLevel);
          } else {
            setError('Lesson not found');
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error(`Error fetching assessment with ID ${id}:`, err);
        setError('Failed to load assessment. Please try again later.');
        setLoading(false);
      }
    }
    
    fetchAssessmentAndLesson();
  }, [id, userLevel]);
  
  // Function to generate assessment questions based on lesson content
  const generateAssessmentQuestions = async (lessonData: Lesson, level: string) => {
    // Generate assessment questions based on lesson content and user level
    const assessmentQuestions: AssessmentQuestion[] = [];
    const title = lessonData.title.toLowerCase();
    
    if (level === 'A1') {
      if (title.includes('greetings')) {
        assessmentQuestions.push(
          {
            type: 'multiple-choice',
            question: 'What do you say when meeting someone for the first time?',
            options: ['Good luck', 'Nice to meet you', 'See you later', 'How old are you'],
            answer: 'Nice to meet you'
          },
          {
            type: 'fill-in',
            question: 'Complete the greeting: "Good _____, how are you?"',
            answer: 'morning'
          },
          {
            type: 'true-false',
            question: '"Hello" is a formal greeting.',
            answer: 'false',
            explanation: '"Hello" is a neutral greeting that can be used in both formal and informal situations.'
          }
        );
      } else if (title.includes('numbers')) {
        assessmentQuestions.push(
          {
            type: 'multiple-choice',
            question: 'What comes after "seven"?',
            options: ['six', 'nine', 'eight', 'ten'],
            answer: 'eight'
          },
          {
            type: 'fill-in',
            question: 'Write the number 3 as a word:',
            answer: 'three'
          },
          {
            type: 'matching',
            question: 'Match the numbers with their words',
            options: ['1:one', '2:two', '3:three', '4:four'],
            answer: '1:one,2:two,3:three,4:four'
          }
        );
      }
      // Add more A1 level questions for different topics
    } else if (level === 'A2') {
      if (title.includes('greetings')) {
        assessmentQuestions.push(
          {
            type: 'multiple-choice',
            question: 'Which is an informal greeting?',
            options: ['Good afternoon, sir', 'Hey, how\'s it going?', 'Pleased to meet you', 'How do you do?'],
            answer: 'Hey, how\'s it going?'
          },
          {
            type: 'fill-in',
            question: 'Complete the sentence: "I haven\'t seen you ___ ages!"',
            answer: 'for'
          }
        );
      }
      // Add more A2 questions
    } else if (level === 'B1' || level === 'B2' || level === 'C1' || level === 'C2') {
      // Higher level questions
      assessmentQuestions.push(
        {
          type: 'fill-in',
          question: `Write an appropriate ${title}-related expression for formal situations:`,
          answer: ''  // Open-ended for higher levels
        },
        {
          type: 'multiple-choice',
          question: 'Which of these expressions would be most appropriate in a business context?',
          options: [
            'Hey there!', 
            'Good morning, I hope this message finds you well.', 
            'What\'s up?', 
            'Yo!'
          ],
          answer: 'Good morning, I hope this message finds you well.'
        }
      );
    }
    
    // Default questions if none were generated
    if (assessmentQuestions.length === 0) {
      assessmentQuestions.push(
        {
          type: 'multiple-choice',
          question: `Which word is related to "${title}"?`,
          options: ['apple', 'car', 'book', 'computer'],
          answer: 'book'  // Default answer
        },
        {
          type: 'fill-in',
          question: `Write a word related to "${title}":`,
          answer: ''  // Open-ended
        }
      );
    }
    
    // Create assessment object
    const newAssessment: Assessment = {
      id: id,
      lessonId: id,
      level: level,
      questions: assessmentQuestions,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    setAssessment(newAssessment);
    
    // Save assessment questions to Firebase
    try {
      if (auth.currentUser) {
        const assessmentRef = doc(db, 'assessments', id);
        await setDoc(assessmentRef, newAssessment);
        console.log('Saved assessment questions to Firebase');
      }
    } catch (error) {
      console.error('Error saving assessment questions:', error);
    }
  };
  
  // Handle user answer changes
  const handleAnswerChange = (index: number, value: string) => {
    setUserAnswers({
      ...userAnswers,
      [index]: value
    });
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    if (!auth.currentUser) {
      router.push('/login');
      return;
    }

    try {
      // Calculate final score
      const finalScore = calculateScore();
      setScore(finalScore);
      
      // Save assessment result
      await saveAssessmentResult(finalScore);
      
      // Increment XP (10 points for completing, bonus points for high scores)
      const baseXP = 10;
      const bonusXP = finalScore >= 90 ? 5 : finalScore >= 75 ? 3 : 0;
      await incrementUserXP(auth.currentUser.uid, baseXP + bonusXP);
      
      // Show completion message
      setShowCompletionMessage(true);
      
      // Redirect to learning path after delay
      setTimeout(() => {
        router.push('/learning-path');
      }, 3000);
    } catch (error) {
      console.error('Error submitting assessment:', error);
      setError('Failed to submit assessment. Please try again.');
    }
  };
  
  // Add this function to handle XP increment
  async function incrementUserXP(userId: string, amount: number = 10) {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        xp: increment(amount),
        updatedAt: serverTimestamp()
      });
      console.log(`Added ${amount} XP to user ${userId}`);
    } catch (error) {
      console.error('Error incrementing XP:', error);
    }
  }
  
  const calculateScore = (): number => {
    if (!assessment) return 0;
    
    let correctAnswers = 0;
    let totalQuestions = assessment.questions.length;
    
    assessment.questions.forEach((question, index) => {
      if (question.type === 'fill-in') {
        // For fill-in questions, check if the answer is close enough (case insensitive)
        const userAnswer = userAnswers[index]?.trim().toLowerCase() || '';
        const correctAnswer = question.answer.toLowerCase();
        
        if (userAnswer === correctAnswer) {
          correctAnswers++;
        }
      } else if (question.type === 'multiple-choice' || question.type === 'true-false') {
        // For multiple choice and true-false, check exact match
        if (userAnswers[index] === question.answer) {
          correctAnswers++;
        }
      } else if (question.type === 'matching') {
        // For matching questions, check if all pairs match
        const userMatches = userAnswers[index]?.split(',') || [];
        const correctMatches = question.answer.split(',');
        
        if (userMatches.length === correctMatches.length && 
            userMatches.every(match => correctMatches.includes(match))) {
          correctAnswers++;
        }
      }
    });
    
    return Math.round((correctAnswers / totalQuestions) * 100);
  };
  
  const saveAssessmentResult = async (finalScore: number) => {
    if (!auth.currentUser || !assessment) return;
    
    // Save result to Firebase
    await addDoc(collection(db, 'assessmentResults'), {
      userId: auth.currentUser.uid,
      assessmentId: id,
      lessonId: assessment.lessonId,
      score: finalScore,
      level: userLevel,
      answers: userAnswers,
      completedAt: serverTimestamp()
    });
    
    // Update user progress
    const progressRef = collection(db, 'progress');
    const progressQuery = query(
      progressRef,
      where('userId', '==', auth.currentUser.uid),
      where('lessonId', '==', assessment.lessonId)
    );
    
    const progressSnapshot = await getDocs(progressQuery);
    
    if (progressSnapshot.empty) {
      // Create new progress entry
      await addDoc(progressRef, {
        userId: auth.currentUser.uid,
        lessonId: assessment.lessonId,
        lessonTitle: lesson?.title || '',
        completed: finalScore >= 70, // Mark as completed if score is 70% or higher
        score: finalScore,
        date: new Date(),
        timestamp: serverTimestamp()
      });
    } else {
      // Update existing progress entry
      const progressDoc = progressSnapshot.docs[0];
      await updateDoc(progressDoc.ref, {
        completed: finalScore >= 70,
        score: finalScore,
        date: new Date(),
        timestamp: serverTimestamp()
      });
    }
  };
  
  if (loading) {
    return (
      <div id="main-content" className="min-h-screen flex items-center justify-center">
        <div id="main-content" className="text-base sm:text-lg font-medium text-primary">Loading assessment...</div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div id="main-content" className="min-h-screen flex items-center justify-center">
        <div id="main-content" className="text-base sm:text-lg font-medium text-red-500">{error}</div>
      </div>
    );
  }
  
  return (
    <div id="main-content" className="min-h-screen bg-muted py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div id="main-content" className="max-w-4xl mx-auto">
        <div id="main-content" className="mb-6">
          <Link tabIndex={0} tabIndex={0} 
            href={`/lessons/${assessment?.lessonId || id}`} 
            className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/80"
          >
            <svg aria-hidden="true" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Lesson
          </Link>
        </div>

        <div id="main-content" className="bg-white shadow-md rounded-xl overflow-hidden">
          <div id="main-content" className="bg-primary px-6 py-6 sm:py-8 text-white">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">
              {lesson?.title || 'Assessment'} - Assessment
            </h1>
            <p className="mt-1 text-sm text-white/80">
              Test your knowledge of {lesson?.title || 'this topic'}
            </p>
          </div>

          <div id="main-content" className="p-4 sm:p-6">
            {submitted ? (
              <div id="main-content" className="space-y-6">
                <div id="main-content" className="bg-muted p-6 rounded-lg text-center">
                  <h2 className="text-2xl font-bold mb-2">Your Score: {score}%</h2>
                  <p className="text-gray-600 mb-4">
                    {score !== null && score >= 70 
                      ? 'Congratulations! You passed the assessment.' 
                      : 'Keep practicing to improve your score.'}
                  </p>
                  <div id="main-content" className="flex flex-col sm:flex-row justify-center gap-4 mt-6">
                    <Link tabIndex={0} tabIndex={0} 
                      href={`/lessons/${assessment?.lessonId || id}`}
                      className="px-4 py-2 bg-secondary text-white rounded-md hover:bg-secondary/90 transition-colors"
                    >
                      Return to Lesson
                    </Link>
                    <button
                      onClick={() => setSubmitted(false)} onKeyDown={(e) => { if(e.key === "Enter" || e.key === " ") e.target.click(); }}
                      className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
                
                <div id="main-content" className="space-y-6">
                  <h3 className="text-xl font-semibold">Review Your Answers</h3>
                  {assessment?.questions.map((question, index) => {
                    const isCorrect = 
                      question.type === 'fill-in' 
                        ? userAnswers[index]?.trim().toLowerCase() === question.answer.toLowerCase()
                        : userAnswers[index] === question.answer;
                    
                    return (
                      <div 
                        key={index} 
                        className={`p-4 rounded-lg border ${
                          isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                        }`}
                      >
                        <p className="font-medium mb-2">{question.question}</p>
                        <div id="main-content" className="mb-2">
                          <span className="text-sm font-medium">Your answer: </span>
                          <span className={isCorrect ? 'text-green-600' : 'text-red-600'}>
                            {userAnswers[index] || '(No answer)'}
                          </span>
                        </div>
                        {!isCorrect && (
                          <div id="main-content" className="mb-2">
                            <span className="text-sm font-medium">Correct answer: </span>
                            <span className="text-green-600">{question.answer}</span>
                          </div>
                        )}
                        {question.explanation && (
                          <div id="main-content" className="mt-2 text-sm text-gray-600">
                            <span className="font-medium">Explanation: </span>
                            {question.explanation}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <form aria-label="Form" aria-label="Form" onSubmit={handleSubmit} className="space-y-6">
                {assessment?.questions.map((question, index) => (
                  <div key={index} className="p-4 bg-muted rounded-lg">
                    <p className="font-medium mb-3">{index + 1}. {question.question}</p>
                    
                    {question.type === 'multiple-choice' && question.options && (
                      <div id="main-content" className="space-y-2">
                        {question.options.map((option, optionIndex) => (
                          <label key={optionIndex} className="flex items-start">
                            <input
                              type="radio"
                              name={`question-${index}`}
                              value={option}
                              checked={userAnswers[index] === option}
                              onChange={() => handleAnswerChange(index, option)}
                              className="mt-1 mr-2"
                              required aria-required="true"
                            />
                            <span>{option}</span>
                          </label>
                        ))}
                      </div>
                    )}
                    
                    {question.type === 'fill-in' && (
                      <input
                        type="text"
                        value={userAnswers[index] || ''}
                        onChange={(e) => handleAnswerChange(index, e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        placeholder="Your answer"
                        required aria-required="true"
                      />
                    )}
                    
                    {question.type === 'true-false' && (
                      <div id="main-content" className="space-y-2">
                        <label className="flex items-start">
                          <input
                            type="radio"
                            name={`question-${index}`}
                            value="true"
                            checked={userAnswers[index] === 'true'}
                            onChange={() => handleAnswerChange(index, 'true')}
                            className="mt-1 mr-2"
                            required aria-required="true"
                          />
                          <span>True</span>
                        </label>
                        <label className="flex items-start">
                          <input
                            type="radio"
                            name={`question-${index}`}
                            value="false"
                            checked={userAnswers[index] === 'false'}
                            onChange={() => handleAnswerChange(index, 'false')}
                            className="mt-1 mr-2"
                            required aria-required="true"
                          />
                          <span>False</span>
                        </label>
                      </div>
                    )}
                    
                    {question.type === 'matching' && question.options && (
                      <div id="main-content" className="space-y-3">
                        {question.options.map((option, optionIndex) => {
                          const [key, value] = option.split(':');
                          return (
                            <div key={optionIndex} className="flex items-center">
                              <span className="mr-2 font-medium">{key}:</span>
                              <select
                                value={userAnswers[index]?.split(',')[optionIndex]?.split(':')[1] || ''}
                                onChange={(e) => {
                                  const currentAnswers = userAnswers[index]?.split(',') || [];
                                  currentAnswers[optionIndex] = `${key}:${e.target.value}`;
                                  handleAnswerChange(index, currentAnswers.join(','));
                                }}
                                className="p-2 border border-gray-300 rounded-md"
                                required aria-required="true"
                              >
                                <option value="">Select an answer</option>
                                {question.options?.map((opt, i) => (
                                  <option key={i} value={opt.split(':')[1]}>
                                    {opt.split(':')[1]}
                                  </option>
                                ))}
                              </select>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
                
                <div id="main-content" className="flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
                  >
                    Submit Answers
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 