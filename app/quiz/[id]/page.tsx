"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getLessonById } from '../../../lib/services/lessonService';
import { getQuizByLessonId } from '../../../lib/services/quizService';
import { Lesson, Quiz, QuizQuestion, MultipleChoiceQuestion, FillInBlankQuestion, MatchingQuestion } from '../../../lib/types';

// Prevent static prerendering
export const dynamic = 'force-dynamic';

export default function QuizPage({ params }: { params: { id: string } }) {
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const { id } = params;

  // Quiz state
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [fillAnswers, setFillAnswers] = useState<string[]>([]);
  const [matchAnswers, setMatchAnswers] = useState<{ [key: number]: number }[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [explanations, setExplanations] = useState<{ [key: number]: string }>({});

  // Fallback quiz questions in case Firebase fetch fails
  const fallbackQuizQuestions: QuizQuestion[] = [
    {
      id: 1,
      type: 'multiple-choice',
      question: "What is the correct greeting for meeting someone for the first time?",
      options: ["Goodbye!", "Nice to meet you!", "See you later!", "What's up?"],
      correctAnswer: 1
    },
    {
      id: 2,
      type: 'multiple-choice',
      question: "Which phrase would you use to ask someone's name?",
      options: ["How are you?", "Where are you from?", "What's your name?", "How old are you?"],
      correctAnswer: 2
    },
    {
      id: 3,
      type: 'fill',
      question: "Fill in the blank: 'Hello' _____ 'Hi' in English.",
      answer: "means",
      explanation: "The word 'means' is used to express that one word is equivalent to another."
    },
    {
      id: 4,
      type: 'fill',
      question: "Complete the sentence: 'I _____ a student.'",
      answer: "am",
      explanation: "We use 'am' with the first person singular (I) form of the verb 'to be'."
    },
    {
      id: 5,
      type: 'match',
      question: "Match the greetings with their meanings:",
      pairs: [
        { term: "Hello", definition: "Hi" },
        { term: "Good morning", definition: "Morning greeting" },
        { term: "Goodbye", definition: "Farewell" },
        { term: "See you later", definition: "Informal goodbye" }
      ]
    }
  ];

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch lesson data
        const lessonData = await getLessonById(id);
        if (lessonData) {
          setLesson(lessonData);
          
          // Fetch quiz data for this lesson
          const quizData = await getQuizByLessonId(id);
          if (quizData) {
            setQuiz(quizData);
          } else {
            console.warn(`No quiz found for lesson ID ${id}, using fallback quiz`);
            // Create a fallback quiz if none exists in Firebase
            setQuiz({
              id: `fallback-${id}`,
              lessonId: id,
              title: lessonData.title,
              description: `Quiz for ${lessonData.title}`,
              questions: fallbackQuizQuestions
            });
          }
        } else {
          setError('Lesson not found');
        }
        setLoading(false);
      } catch (err) {
        console.error(`Error fetching data for lesson ID ${id}:`, err);
        setError('Failed to load quiz. Please try again later.');
        setLoading(false);
      }
    }

    if (id) {
      fetchData();
    }
  }, [id]);

  useEffect(() => {
    // Initialize answer arrays based on question types when quiz is loaded
    if (quiz) {
      const questionCount = quiz.questions.length;
      const initialSelectedAnswers = Array(questionCount).fill(-1);
      const initialFillAnswers = Array(questionCount).fill('');
      const initialMatchAnswers = Array(questionCount).fill({});
      
      setSelectedAnswers(initialSelectedAnswers);
      setFillAnswers(initialFillAnswers);
      setMatchAnswers(initialMatchAnswers);
      setCurrentQuestion(0);
      setShowResults(false);
      setScore(0);
      setExplanations({});
    }
  }, [quiz]);

  // Handle multiple choice answer selection
  const handleAnswerSelect = (answerIndex: number) => {
    const newSelectedAnswers = [...selectedAnswers];
    newSelectedAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newSelectedAnswers);
  };

  // Handle fill-in-the-blank answer input
  const handleFillAnswerChange = (answer: string) => {
    const newFillAnswers = [...fillAnswers];
    newFillAnswers[currentQuestion] = answer;
    setFillAnswers(newFillAnswers);
  };

  // Handle matching answer selection
  const handleMatchAnswerSelect = (termIndex: number, definitionIndex: number) => {
    const newMatchAnswers = [...matchAnswers];
    const currentMatches = { ...newMatchAnswers[currentQuestion] };
    
    // If this term is already matched to another definition, remove that match
    Object.keys(currentMatches).forEach(key => {
      if (currentMatches[Number(key)] === definitionIndex) {
        delete currentMatches[Number(key)];
      }
    });
    
    // Add or update the match
    currentMatches[termIndex] = definitionIndex;
    newMatchAnswers[currentQuestion] = currentMatches;
    setMatchAnswers(newMatchAnswers);
  };

  // Check if current question is answered
  const isCurrentQuestionAnswered = () => {
    if (!quiz || !quiz.questions[currentQuestion]) return false;
    
    const currentQ = quiz.questions[currentQuestion];
    
    if (currentQ.type === 'multiple-choice') {
      return selectedAnswers[currentQuestion] !== -1;
    } else if (currentQ.type === 'fill') {
      return fillAnswers[currentQuestion]?.trim() !== '';
    } else if (currentQ.type === 'match') {
      const matches = matchAnswers[currentQuestion] || {};
      // All terms must be matched
      return Object.keys(matches).length === (currentQ as MatchingQuestion).pairs.length;
    }
    
    return false;
  };

  // Handle quiz submission
  const handleSubmitQuiz = () => {
    if (!quiz) return;
    
    let newScore = 0;
    const newExplanations: { [key: number]: string } = {};
    
    quiz.questions.forEach((question, index) => {
      if (question.type === 'multiple-choice') {
        const mcQuestion = question as MultipleChoiceQuestion;
        if (selectedAnswers[index] === mcQuestion.correctAnswer) {
          newScore += 1;
          newExplanations[index] = `Correct: ${mcQuestion.options[mcQuestion.correctAnswer]}`;
        } else {
          newExplanations[index] = `Incorrect. The correct answer is: ${mcQuestion.options[mcQuestion.correctAnswer]}`;
        }
      } 
      else if (question.type === 'fill') {
        const fillQuestion = question as FillInBlankQuestion;
        const userAnswer = fillAnswers[index]?.trim().toLowerCase() || '';
        const correctAnswer = fillQuestion.answer.toLowerCase();
        
        if (userAnswer === correctAnswer) {
          newScore += 1;
          newExplanations[index] = `Correct: "${correctAnswer}" is the right answer. ${fillQuestion.explanation || ''}`;
        } else {
          newExplanations[index] = `Incorrect. The correct answer is: "${correctAnswer}". ${fillQuestion.explanation || ''}`;
        }
      } 
      else if (question.type === 'match') {
        const matchQuestion = question as MatchingQuestion;
        const userMatches = matchAnswers[index] || {};
        let allCorrect = true;
        
        // Check if all matches are correct
        for (let i = 0; i < matchQuestion.pairs.length; i++) {
          if (userMatches[i] !== i) {
            allCorrect = false;
            break;
          }
        }
        
        if (allCorrect) {
          newScore += 1;
          newExplanations[index] = "All matches are correct!";
        } else {
          let explanation = "Incorrect matches. The correct pairs are: ";
          matchQuestion.pairs.forEach((pair, i) => {
            explanation += `"${pair.term}" → "${pair.definition}"${i < matchQuestion.pairs.length - 1 ? ', ' : ''}`;
          });
          newExplanations[index] = explanation;
        }
      }
    });
    
    setScore(newScore);
    setExplanations(newExplanations);
    setShowResults(true);
  };

  // Handle next question
  const handleNextQuestion = () => {
    if (!quiz) return;
    
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleSubmitQuiz();
    }
  };

  // Handle restart quiz
  const handleRestartQuiz = () => {
    if (!quiz) return;
    
    setCurrentQuestion(0);
    
    // Reset all answer types
    const initialSelectedAnswers = Array(quiz.questions.length).fill(-1);
    const initialFillAnswers = Array(quiz.questions.length).fill('');
    const initialMatchAnswers = Array(quiz.questions.length).fill({});
    
    setSelectedAnswers(initialSelectedAnswers);
    setFillAnswers(initialFillAnswers);
    setMatchAnswers(initialMatchAnswers);
    
    setShowResults(false);
    setScore(0);
    setExplanations({});
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl font-medium text-primary">Loading quiz...</div>
      </div>
    );
  }

  if (error || !lesson || !quiz) {
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
                  Question {showResults ? quiz.questions.length : currentQuestion + 1} of {quiz.questions.length}
                </span>
                <span className="text-sm font-medium text-blue-600">
                  {showResults ? '100' : Math.round(((currentQuestion + 1) / quiz.questions.length) * 100)}% Complete
                </span>
              </div>
              <div className="w-full bg-blue-100 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                  style={{ width: showResults ? '100%' : `${((currentQuestion + 1) / quiz.questions.length) * 100}%` }}
                ></div>
              </div>
            </div>

            {!showResults ? (
              /* Quiz questions */
              <div className="bg-white rounded-lg p-6 border border-blue-100 shadow-sm">
                <h2 className="text-xl font-semibold text-blue-800 mb-4">
                  {quiz.questions[currentQuestion].question}
                </h2>
                
                {/* Multiple Choice Question */}
                {quiz.questions[currentQuestion].type === 'multiple-choice' && (
                  <div className="space-y-3 mt-6">
                    {(quiz.questions[currentQuestion] as MultipleChoiceQuestion).options.map((option, index) => (
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
                )}
                
                {/* Fill in the Blank Question */}
                {quiz.questions[currentQuestion].type === 'fill' && (
                  <div className="mt-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                      <input
                        type="text"
                        value={fillAnswers[currentQuestion] || ''}
                        onChange={(e) => handleFillAnswerChange(e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Type your answer here..."
                      />
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      Fill in the blank with the correct word or phrase.
                    </p>
                  </div>
                )}
                
                {/* Matching Question */}
                {quiz.questions[currentQuestion].type === 'match' && (
                  <div className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <h3 className="font-medium text-blue-800">Terms</h3>
                        {(quiz.questions[currentQuestion] as MatchingQuestion).pairs.map((pair, termIndex) => (
                          <div key={termIndex} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                            {pair.term}
                          </div>
                        ))}
                      </div>
                      
                      <div className="space-y-3">
                        <h3 className="font-medium text-blue-800">Definitions</h3>
                        {(quiz.questions[currentQuestion] as MatchingQuestion).pairs.map((pair, defIndex) => {
                          const currentMatches = matchAnswers[currentQuestion] || {};
                          const isMatched = Object.values(currentMatches).includes(defIndex);
                          const matchedTermIndex = Object.keys(currentMatches).find(
                            key => currentMatches[Number(key)] === defIndex
                          );
                          
                          return (
                            <div 
                              key={defIndex} 
                              className={`p-3 rounded-lg border cursor-pointer ${
                                isMatched 
                                  ? 'bg-green-50 border-green-200' 
                                  : 'bg-white border-gray-200 hover:border-blue-300'
                              }`}
                            >
                              <div className="flex justify-between items-center">
                                <span>{pair.definition}</span>
                                {isMatched && matchedTermIndex !== undefined && (
                                  <span className="text-sm font-medium text-green-600">
                                    Matched with: {(quiz.questions[currentQuestion] as MatchingQuestion).pairs[Number(matchedTermIndex)].term}
                                  </span>
                                )}
                              </div>
                              
                              {!isMatched && (
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {(quiz.questions[currentQuestion] as MatchingQuestion).pairs.map((_, termIdx) => {
                                    // Skip if this term is already matched
                                    if (currentMatches[termIdx] !== undefined) return null;
                                    
                                    return (
                                      <button
                                        key={termIdx}
                                        className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                                        onClick={() => handleMatchAnswerSelect(termIdx, defIndex)}
                                      >
                                        Match with {(quiz.questions[currentQuestion] as MatchingQuestion).pairs[termIdx].term}
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-4">
                      Match each term with its correct definition.
                    </p>
                  </div>
                )}
                
                <div className="mt-8 flex justify-between">
                  <button
                    className="px-4 py-2 bg-white border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                    onClick={() => router.push(`/lessons/${id}`)}
                  >
                    Exit Quiz
                  </button>
                  <button
                    className={`px-6 py-2 bg-blue-600 text-white rounded-md transition-colors ${
                      !isCurrentQuestionAnswered() 
                        ? 'opacity-50 cursor-not-allowed' 
                        : 'hover:bg-blue-700'
                    }`}
                    onClick={handleNextQuestion}
                    disabled={!isCurrentQuestionAnswered()}
                  >
                    {currentQuestion < quiz.questions.length - 1 ? 'Next Question' : 'Submit Quiz'}
                  </button>
                </div>
              </div>
            ) : (
              /* Results section */
              <div className="bg-white rounded-lg p-6 border border-blue-100 shadow-sm">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-4">
                    <span className="text-2xl font-bold text-blue-600">{score}/{quiz.questions.length}</span>
                  </div>
                  <h2 className="text-2xl font-bold text-blue-800">
                    {score === quiz.questions.length 
                      ? 'Perfect Score!' 
                      : score >= quiz.questions.length / 2 
                        ? 'Good Job!' 
                        : 'Keep Practicing!'}
                  </h2>
                  <p className="text-gray-600 mt-2">
                    You answered {score} out of {quiz.questions.length} questions correctly.
                  </p>
                </div>

                <div className="space-y-4 mt-8">
                  <h3 className="font-semibold text-blue-800">Question Review:</h3>
                  {quiz.questions.map((question, index) => (
                    <div key={index} className="p-4 rounded-lg border border-gray-200">
                      <p className="font-medium text-gray-800">{question.question}</p>
                      
                      {/* Display user's answer based on question type */}
                      <div className="mt-2">
                        <span className="text-sm font-medium mr-2">Your answer:</span>
                        {question.type === 'multiple-choice' && (
                          <span className={`text-sm ${
                            selectedAnswers[index] === (question as MultipleChoiceQuestion).correctAnswer
                              ? 'text-green-600' 
                              : 'text-red-600'
                          }`}>
                            {selectedAnswers[index] === -1
                              ? 'Not answered' 
                              : (question as MultipleChoiceQuestion).options[selectedAnswers[index]]}
                          </span>
                        )}
                        
                        {question.type === 'fill' && (
                          <span className={`text-sm ${
                            fillAnswers[index]?.toLowerCase().trim() === (question as FillInBlankQuestion).answer.toLowerCase()
                              ? 'text-green-600' 
                              : 'text-red-600'
                          }`}>
                            {!fillAnswers[index] ? 'Not answered' : fillAnswers[index]}
                          </span>
                        )}
                        
                        {question.type === 'match' && (
                          <div className="text-sm">
                            {Object.keys(matchAnswers[index] || {}).length === 0 
                              ? <span className="text-red-600">Not answered</span>
                              : Object.keys(matchAnswers[index] || {}).length === (question as MatchingQuestion).pairs.length
                                ? <span className="text-green-600">All pairs matched</span>
                                : <span className="text-red-600">Incomplete matches</span>
                            }
                          </div>
                        )}
                      </div>
                      
                      {/* Display explanation */}
                      {explanations[index] && (
                        <div className="mt-2 text-sm bg-blue-50 p-2 rounded">
                          {explanations[index]}
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