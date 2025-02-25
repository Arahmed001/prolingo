"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getLessonById } from '../../../lib/services/lessonService';
import { Lesson } from '../../../lib/types';

// Prevent static prerendering
export const dynamic = 'force-dynamic';

// Define quiz question type
interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
}

export default function QuizPage({ params }: { params: { id: string } }) {
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const { id } = params;

  // Quiz state
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([-1, -1, -1, -1]);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  // Sample quiz questions - in a real app, these would come from a database or API
  const quizQuestions: QuizQuestion[] = [
    {
      id: 1,
      question: "What is the correct greeting for meeting someone for the first time?",
      options: ["Goodbye!", "Nice to meet you!", "See you later!", "What's up?"],
      correctAnswer: 1
    },
    {
      id: 2,
      question: "Which phrase would you use to ask someone's name?",
      options: ["How are you?", "Where are you from?", "What's your name?", "How old are you?"],
      correctAnswer: 2
    },
    {
      id: 3,
      question: "What is the appropriate response to 'How are you?'",
      options: ["I'm from Canada.", "I'm 25 years old.", "I'm fine, thank you. And you?", "My name is John."],
      correctAnswer: 2
    },
    {
      id: 4,
      question: "Which is a formal way to say goodbye?",
      options: ["See ya!", "Farewell!", "Later!", "Bye-bye!"],
      correctAnswer: 1
    }
  ];

  useEffect(() => {
    async function fetchLesson() {
      try {
        const lessonData = await getLessonById(id);
        if (lessonData) {
          setLesson(lessonData);
        } else {
          setError('Lesson not found');
        }
        setLoading(false);
      } catch (err) {
        console.error(`Error fetching lesson with ID ${id}:`, err);
        setError('Failed to load quiz. Please try again later.');
        setLoading(false);
      }
    }

    if (id) {
      fetchLesson();
    }
  }, [id]);

  // Handle answer selection
  const handleAnswerSelect = (answerIndex: number) => {
    const newSelectedAnswers = [...selectedAnswers];
    newSelectedAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newSelectedAnswers);
  };

  // Handle quiz submission
  const handleSubmitQuiz = () => {
    let newScore = 0;
    selectedAnswers.forEach((selectedAnswer, index) => {
      if (selectedAnswer === quizQuestions[index].correctAnswer) {
        newScore += 1;
      }
    });
    setScore(newScore);
    setShowResults(true);
  };

  // Handle next question
  const handleNextQuestion = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleSubmitQuiz();
    }
  };

  // Handle restart quiz
  const handleRestartQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswers([-1, -1, -1, -1]);
    setShowResults(false);
    setScore(0);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl font-medium text-primary">Loading quiz...</div>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="text-xl font-medium text-red-500">{error || 'Quiz not found'}</div>
        <button
          onClick={() => router.push('/lessons')}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
        >
          Back to Lessons
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link 
            href={`/lessons/${id}`} 
            className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Lesson
          </Link>
        </div>

        <div className="bg-white rounded-xl overflow-hidden shadow-lg border border-blue-100">
          <div className="bg-blue-600 text-white p-6">
            <h1 className="text-2xl font-bold">Quiz: {lesson.title}</h1>
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm font-medium bg-blue-500 py-1 px-3 rounded-full">
                {lesson.level}
              </span>
              <span className="text-sm">Test your knowledge</span>
            </div>
          </div>

          <div className="p-8">
            {/* Progress bar */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-blue-600">
                  Question {showResults ? quizQuestions.length : currentQuestion + 1} of {quizQuestions.length}
                </span>
                <span className="text-sm font-medium text-blue-600">
                  {showResults ? '100' : Math.round(((currentQuestion + 1) / quizQuestions.length) * 100)}% Complete
                </span>
              </div>
              <div className="w-full bg-blue-100 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                  style={{ width: showResults ? '100%' : `${((currentQuestion + 1) / quizQuestions.length) * 100}%` }}
                ></div>
              </div>
            </div>

            {!showResults ? (
              /* Quiz questions */
              <div className="bg-white rounded-lg p-6 border border-blue-100 shadow-sm">
                <h2 className="text-xl font-semibold text-blue-800 mb-4">
                  {quizQuestions[currentQuestion].question}
                </h2>
                
                <div className="space-y-3 mt-6">
                  {quizQuestions[currentQuestion].options.map((option, index) => (
                    <div 
                      key={index}
                      className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedAnswers[currentQuestion] === index 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                      onClick={() => handleAnswerSelect(index)}
                    >
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center mr-3 ${
                        selectedAnswers[currentQuestion] === index 
                          ? 'border-blue-500' 
                          : 'border-gray-300'
                      }`}>
                        {selectedAnswers[currentQuestion] === index && (
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                      <span className="text-gray-700">{option}</span>
                    </div>
                  ))}
                </div>
                
                <div className="mt-8 flex justify-between">
                  <button
                    className="px-4 py-2 bg-white border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                    onClick={() => router.push(`/lessons/${id}`)}
                  >
                    Exit Quiz
                  </button>
                  <button
                    className={`px-6 py-2 bg-blue-600 text-white rounded-md transition-colors ${
                      selectedAnswers[currentQuestion] === -1 
                        ? 'opacity-50 cursor-not-allowed' 
                        : 'hover:bg-blue-700'
                    }`}
                    onClick={handleNextQuestion}
                    disabled={selectedAnswers[currentQuestion] === -1}
                  >
                    {currentQuestion < quizQuestions.length - 1 ? 'Next Question' : 'Submit Quiz'}
                  </button>
                </div>
              </div>
            ) : (
              /* Results section */
              <div className="bg-white rounded-lg p-6 border border-blue-100 shadow-sm">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-4">
                    <span className="text-2xl font-bold text-blue-600">{score}/{quizQuestions.length}</span>
                  </div>
                  <h2 className="text-2xl font-bold text-blue-800">
                    {score === quizQuestions.length 
                      ? 'Perfect Score!' 
                      : score >= quizQuestions.length / 2 
                        ? 'Good Job!' 
                        : 'Keep Practicing!'}
                  </h2>
                  <p className="text-gray-600 mt-2">
                    You answered {score} out of {quizQuestions.length} questions correctly.
                  </p>
                </div>

                <div className="space-y-4 mt-8">
                  <h3 className="font-semibold text-blue-800">Question Review:</h3>
                  {quizQuestions.map((question, index) => (
                    <div key={index} className="p-4 rounded-lg border border-gray-200">
                      <p className="font-medium text-gray-800">{question.question}</p>
                      <div className="mt-2 flex items-center">
                        <span className="text-sm font-medium mr-2">Your answer:</span>
                        <span className={`text-sm ${
                          selectedAnswers[index] === question.correctAnswer 
                            ? 'text-green-600' 
                            : 'text-red-600'
                        }`}>
                          {selectedAnswers[index] === -1 
                            ? 'Not answered' 
                            : question.options[selectedAnswers[index]]}
                        </span>
                      </div>
                      {selectedAnswers[index] !== question.correctAnswer && (
                        <div className="mt-1 flex items-center">
                          <span className="text-sm font-medium mr-2">Correct answer:</span>
                          <span className="text-sm text-green-600">
                            {question.options[question.correctAnswer]}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex justify-between">
                  <button
                    className="px-4 py-2 bg-white border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                    onClick={() => router.push(`/lessons/${id}`)}
                  >
                    Back to Lesson
                  </button>
                  <button
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    onClick={handleRestartQuiz}
                  >
                    Retry Quiz
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 