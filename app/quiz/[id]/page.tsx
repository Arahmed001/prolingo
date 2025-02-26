"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getLessonById } from '../../../lib/services/lessonService';
import { getQuizById } from '../../../lib/services/quizService';
import { Lesson, Quiz, QuizQuestion } from '../../../lib/types';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

// Define the match type for clarity
interface Match {
  term: string;
  definition: string;
}

const QuizPage = ({ params }: { params: { id: string } }) => {
  const router = useRouter();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Quiz state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [fillAnswers, setFillAnswers] = useState<string[]>([]);
  const [matchAnswers, setMatchAnswers] = useState<Match[][]>([]);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [explanations, setExplanations] = useState<string[]>([]);
  
  // Fallback quiz for testing if Firebase fetch fails
  const fallbackQuiz: Quiz = {
    id: 'fallback-quiz',
    lessonId: 'fallback-lesson',
    title: 'Fallback Quiz',
    description: 'This is a fallback quiz for testing',
    questions: [
      {
        id: 1,
        type: 'multiple-choice',
        question: 'Which of the following is a greeting?',
        options: ['Hello', 'Goodbye', 'Thank you', 'Sorry'],
        correctAnswer: 0
      },
      {
        id: 2,
        type: 'fill',
        question: '_____ means "Hello" in English.',
        answer: 'Hi',
        explanation: 'Hi is a casual greeting commonly used in English.'
      },
      {
        id: 3,
        type: 'match',
        question: 'Match the greeting with its meaning:',
        pairs: [
          { term: 'Hello', definition: 'A common greeting' },
          { term: 'Goodbye', definition: 'A farewell' },
          { term: 'Thank you', definition: 'Expressing gratitude' },
          { term: 'Sorry', definition: 'Apologizing' }
        ]
      }
    ]
  };
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch the quiz
        const quizData = await getQuizById(params.id);
        
        if (!quizData) {
          console.error('Quiz not found');
          setError('Quiz not found');
          setQuiz(fallbackQuiz); // Use fallback for testing
        } else {
          setQuiz(quizData);
          
          // Fetch the associated lesson
          const lessonData = await getLessonById(quizData.lessonId);
          setLesson(lessonData);
        }
      } catch (err) {
        console.error('Error fetching quiz:', err);
        setError('Failed to load quiz');
        setQuiz(fallbackQuiz); // Use fallback for testing
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [params.id]);
  
  // Initialize answer arrays when quiz loads
  useEffect(() => {
    if (quiz) {
      const initialSelectedAnswers = new Array(quiz.questions.length).fill(-1);
      const initialFillAnswers = new Array(quiz.questions.length).fill('');
      const initialMatchAnswers = new Array(quiz.questions.length).fill([]).map(() => []);
      const initialExplanations = new Array(quiz.questions.length).fill('');
      
      setSelectedAnswers(initialSelectedAnswers);
      setFillAnswers(initialFillAnswers);
      setMatchAnswers(initialMatchAnswers);
      setExplanations(initialExplanations);
    }
  }, [quiz]);
  
  // Handle multiple choice selection
  const handleAnswerSelect = (questionIndex: number, optionIndex: number) => {
    const newSelectedAnswers = [...selectedAnswers];
    newSelectedAnswers[questionIndex] = optionIndex;
    setSelectedAnswers(newSelectedAnswers);
  };
  
  // Handle fill-in-the-blank input
  const handleFillAnswer = (questionIndex: number, answer: string) => {
    const newFillAnswers = [...fillAnswers];
    newFillAnswers[questionIndex] = answer;
    setFillAnswers(newFillAnswers);
  };
  
  // Handle matching pairs
  const handleMatchAnswer = (questionIndex: number, term: string, definition: string) => {
    const newMatchAnswers = [...matchAnswers];
    
    // Initialize the array for this question if it doesn't exist
    if (!Array.isArray(newMatchAnswers[questionIndex])) {
      newMatchAnswers[questionIndex] = [];
    }
    
    // Check if this term already has a match
    const existingMatchIndex = newMatchAnswers[questionIndex].findIndex(
      (match: Match) => match.term === term
    );
    
    if (existingMatchIndex !== -1) {
      // Update existing match
      newMatchAnswers[questionIndex][existingMatchIndex] = { term, definition };
    } else {
      // Add new match
      newMatchAnswers[questionIndex].push({ term, definition });
    }
    
    setMatchAnswers(newMatchAnswers);
  };
  
  // Check if current question is answered
  const isCurrentQuestionAnswered = () => {
    if (!quiz) return false;
    
    const currentQuestion = quiz.questions[currentQuestionIndex];
    
    switch (currentQuestion.type) {
      case 'multiple-choice':
        return selectedAnswers[currentQuestionIndex] !== -1;
      case 'fill':
        return fillAnswers[currentQuestionIndex]?.trim() !== '';
      case 'match':
        return Array.isArray(matchAnswers[currentQuestionIndex]) && 
               matchAnswers[currentQuestionIndex].length === currentQuestion.pairs.length;
      default:
        return false;
    }
  };
  
  // Handle quiz submission
  const handleSubmitQuiz = () => {
    if (!quiz) return;
    
    let totalScore = 0;
    const newExplanations = [...explanations];
    
    // Calculate score for each question
    quiz.questions.forEach((question, index) => {
      switch (question.type) {
        case 'multiple-choice':
          if (selectedAnswers[index] === question.correctAnswer) {
            totalScore++;
            newExplanations[index] = 'Correct!';
          } else {
            newExplanations[index] = `Incorrect. The correct answer is: ${question.options[question.correctAnswer]}`;
          }
          break;
          
        case 'fill':
          // Case-insensitive comparison for fill-in-the-blank
          if (fillAnswers[index]?.trim().toLowerCase() === question.answer.toLowerCase()) {
            totalScore++;
            newExplanations[index] = 'Correct!';
          } else {
            newExplanations[index] = `Incorrect. The correct answer is: ${question.answer}`;
            if (question.explanation) {
              newExplanations[index] += `. ${question.explanation}`;
            }
          }
          break;
          
        case 'match':
          let allCorrect = true;
          const userMatches = matchAnswers[index] || [];
          const correctPairs = question.pairs;
          
          // Check if all matches are correct
          if (userMatches.length === correctPairs.length) {
            for (const userMatch of userMatches) {
              const correctPair = correctPairs.find(pair => pair.term === userMatch.term);
              if (!correctPair || correctPair.definition !== userMatch.definition) {
                allCorrect = false;
                break;
              }
            }
          } else {
            allCorrect = false;
          }
          
          if (allCorrect) {
            totalScore++;
            newExplanations[index] = 'Correct matches!';
          } else {
            const correctPairsText = correctPairs
              .map(pair => `${pair.term} → ${pair.definition}`)
              .join(', ');
            newExplanations[index] = `Incorrect corresponds to. The correct pairs are: ${correctPairsText}`;
          }
          break;
      }
    });
    
    setScore(totalScore);
    setExplanations(newExplanations);
    setQuizCompleted(true);
  };
  
  // Handle next question
  const handleNextQuestion = () => {
    if (!quiz) return;
    
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      handleSubmitQuiz();
    }
  };
  
  // Handle quiz restart
  const handleRestartQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers(new Array(quiz?.questions.length || 0).fill(-1));
    setFillAnswers(new Array(quiz?.questions.length || 0).fill(''));
    setMatchAnswers(new Array(quiz?.questions.length || 0).fill([]).map(() => []));
    setExplanations(new Array(quiz?.questions.length || 0).fill(''));
    setQuizCompleted(false);
    setScore(0);
  };
  
  // Remove a match
  const handleRemoveMatch = (questionIndex: number, termToRemove: string) => {
    const newMatchAnswers = [...matchAnswers];
    
    if (Array.isArray(newMatchAnswers[questionIndex])) {
      newMatchAnswers[questionIndex] = newMatchAnswers[questionIndex].filter(
        (match: Match) => match.term !== termToRemove
      );
      setMatchAnswers(newMatchAnswers);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-lg">Loading quiz...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  if (error || !quiz) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
            <p className="text-lg">{error || 'Failed to load quiz'}</p>
            <Link href="/lessons" className="mt-6 inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Back to Lessons
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        {!quizCompleted ? (
          <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6">
            <div className="mb-6">
              <Link href={`/lessons/${quiz.lessonId}`} className="text-blue-600 hover:underline flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Lesson
              </Link>
            </div>
            
            <h1 className="text-2xl font-bold mb-4">{quiz.title}</h1>
            
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Question {currentQuestionIndex + 1} of {quiz.questions.length}</span>
                <span>{Math.round(progress)}% Complete</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
              </div>
            </div>
            
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">{currentQuestion.question}</h2>
              
              {/* Multiple Choice Question */}
              {currentQuestion.type === 'multiple-choice' && (
                <div className="space-y-3">
                  {currentQuestion.options.map((option, optionIndex) => (
                    <div 
                      key={optionIndex}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedAnswers[currentQuestionIndex] === optionIndex
                          ? 'bg-blue-100 border-blue-500'
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => handleAnswerSelect(currentQuestionIndex, optionIndex)}
                    >
                      <div className="flex items-center">
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center mr-3 ${
                          selectedAnswers[currentQuestionIndex] === optionIndex
                            ? 'border-blue-500 bg-blue-500'
                            : 'border-gray-400'
                        }`}>
                          {selectedAnswers[currentQuestionIndex] === optionIndex && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <span>{option}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Fill in the Blank Question */}
              {currentQuestion.type === 'fill' && (
                <div className="space-y-4">
                  <p className="text-gray-700 mb-2">
                    Fill in the blank with the correct answer:
                  </p>
                  <div className="relative">
                    <input
                      type="text"
                      value={fillAnswers[currentQuestionIndex] || ''}
                      onChange={(e) => handleFillAnswer(currentQuestionIndex, e.target.value)}
                      placeholder="Type your answer here"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>
                </div>
              )}
              
              {/* Matching Question */}
              {currentQuestion.type === 'match' && (
                <div className="space-y-6">
                  <p className="text-gray-700 mb-2">
                    Match each term with its correct definition by selecting from the dropdown:
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Left column: Terms */}
                    <div className="space-y-3">
                      <h3 className="font-medium text-gray-700">Terms</h3>
                      {currentQuestion.pairs.map((pair, pairIndex) => {
                        const currentMatch = matchAnswers[currentQuestionIndex]?.find(
                          (match: Match) => match.term === pair.term
                        );
                        
                        return (
                          <div key={pairIndex} className="flex items-center p-3 bg-gray-50 rounded-lg">
                            <span className="font-medium">{pair.term}</span>
                            {currentMatch && (
                              <div className="ml-auto flex items-center text-blue-600">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                                <span className="mr-2">{currentMatch.definition}</span>
                                <button 
                                  onClick={() => handleRemoveMatch(currentQuestionIndex, pair.term)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* Right column: Definitions to select */}
                    <div className="space-y-3">
                      <h3 className="font-medium text-gray-700">Definitions</h3>
                      {currentQuestion.pairs.map((pair, pairIndex) => {
                        // Check if this definition is already matched
                        const isMatched = matchAnswers[currentQuestionIndex]?.some(
                          (match: Match) => match.definition === pair.definition
                        );
                        
                        if (isMatched) return null;
                        
                        return (
                          <div 
                            key={pairIndex} 
                            className="p-3 bg-white border border-gray-200 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors"
                          >
                            <div className="flex justify-between items-center">
                              <span>{pair.definition}</span>
                              <div className="space-x-2">
                                {currentQuestion.pairs.map((termPair, termIndex) => {
                                  // Check if this term is already matched
                                  const isTermMatched = matchAnswers[currentQuestionIndex]?.some(
                                    (match: Match) => match.term === termPair.term
                                  );
                                  
                                  if (isTermMatched) return null;
                                  
                                  return (
                                    <button
                                      key={termIndex}
                                      onClick={() => handleMatchAnswer(currentQuestionIndex, termPair.term, pair.definition)}
                                      className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                                    >
                                      {termPair.term}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-between">
              <button
                onClick={() => router.push(`/lessons/${quiz.lessonId}`)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Exit Quiz
              </button>
              
              <button
                onClick={handleNextQuestion}
                disabled={!isCurrentQuestionAnswered()}
                className={`px-6 py-2 rounded-lg transition-colors ${
                  isCurrentQuestionAnswered()
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {currentQuestionIndex < quiz.questions.length - 1 ? 'Next Question' : 'Submit Quiz'}
              </button>
            </div>
          </div>
        ) : (
          // Quiz Results
          <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6">
            <h1 className="text-2xl font-bold mb-4">Quiz Results</h1>
            
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg font-medium">Your Score:</span>
                <span className="text-xl font-bold">{score} / {quiz.questions.length}</span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                <div 
                  className={`h-2.5 rounded-full ${
                    (score / quiz.questions.length) >= 0.7 
                      ? 'bg-green-600' 
                      : (score / quiz.questions.length) >= 0.4 
                        ? 'bg-yellow-500' 
                        : 'bg-red-500'
                  }`} 
                  style={{ width: `${(score / quiz.questions.length) * 100}%` }}
                ></div>
              </div>
              
              <p className="text-center mt-2">
                {(score / quiz.questions.length) >= 0.8 
                  ? 'Excellent work! You have a great understanding of this material.'
                  : (score / quiz.questions.length) >= 0.6 
                    ? 'Good job! You\'re making good progress.'
                    : 'Keep practicing! Review the lesson material and try again.'}
              </p>
            </div>
            
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Review</h2>
              
              <div className="space-y-6">
                {quiz.questions.map((question, questionIndex) => (
                  <div key={questionIndex} className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">
                      Question {questionIndex + 1}: {question.question}
                    </h3>
                    
                    {/* Multiple Choice Review */}
                    {question.type === 'multiple-choice' && (
                      <div>
                        <p className="mb-2">
                          Your answer: {selectedAnswers[questionIndex] !== -1 
                            ? question.options[selectedAnswers[questionIndex]] 
                            : 'Not answered'}
                        </p>
                        <p className="mb-2">
                          Correct answer: {question.options[question.correctAnswer]}
                        </p>
                      </div>
                    )}
                    
                    {/* Fill in the Blank Review */}
                    {question.type === 'fill' && (
                      <div>
                        <p className="mb-2">
                          Your answer: {fillAnswers[questionIndex] || 'Not answered'}
                        </p>
                        <p className="mb-2">
                          Correct answer: {question.answer}
                        </p>
                      </div>
                    )}
                    
                    {/* Matching Review */}
                    {question.type === 'match' && (
                      <div>
                        <p className="mb-2">Your matches:</p>
                        <ul className="list-disc list-inside mb-2">
                          {matchAnswers[questionIndex]?.map((match, matchIndex) => (
                            <li key={matchIndex}>
                              {match.term} → {match.definition}
                            </li>
                          )) || <li>No matches provided</li>}
                        </ul>
                        
                        <p className="mb-2">Correct matches:</p>
                        <ul className="list-disc list-inside">
                          {question.pairs.map((pair, pairIndex) => (
                            <li key={pairIndex}>
                              {pair.term} → {pair.definition}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div className={`mt-3 p-3 rounded-lg ${
                      explanations[questionIndex]?.startsWith('Correct') 
                        ? 'bg-green-50 text-green-800' 
                        : 'bg-red-50 text-red-800'
                    }`}>
                      {explanations[questionIndex]}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-between">
              <button
                onClick={() => router.push(`/lessons/${quiz.lessonId}`)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back to Lesson
              </button>
              
              <button
                onClick={handleRestartQuiz}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Retry Quiz
              </button>
            </div>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default QuizPage; 