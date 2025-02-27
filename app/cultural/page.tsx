"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '../components/Header';
import Footer from '../components/Footer';

interface CulturalCard {
  title: string;
  note: string;
  icon: React.ReactNode;
  color: string;
}

// Cultural insights data
const culturalInsights = [
  {
    id: 1,
    title: 'Greetings',
    note: 'Hello is common in English-speaking countries, but many cultures have unique greetings. In Japan, people bow instead of shaking hands, while in France, friends often greet with kisses on the cheek.',
    imageUrl: '/images/greetings.svg',
  },
  {
    id: 2,
    title: 'Idioms',
    note: '"Rain cats and dogs" means heavy rain in English. This phrase dates back to the 1700s, possibly referring to the poor drainage systems where animals would appear in streets after storms.',
    imageUrl: '/images/idioms.svg',
  },
  {
    id: 3,
    title: 'Traditions',
    note: 'Thanksgiving is celebrated in November in the United States. This harvest festival brings families together for a traditional meal of turkey, stuffing, and pumpkin pie to express gratitude.',
    imageUrl: '/images/traditions.svg',
  },
];

// Quiz questions
const quizQuestions = [
  {
    id: 1,
    question: 'What does "rain cats and dogs" mean?',
    options: [
      { id: 'a', text: 'Pets falling from the sky' },
      { id: 'b', text: 'Heavy rain' },
      { id: 'c', text: 'Animals fighting' },
      { id: 'd', text: 'A pet parade' },
    ],
    correctAnswer: 'b',
  },
  {
    id: 2,
    question: 'When is Thanksgiving celebrated in the United States?',
    options: [
      { id: 'a', text: 'October' },
      { id: 'b', text: 'November' },
      { id: 'c', text: 'December' },
      { id: 'd', text: 'January' },
    ],
    correctAnswer: 'b',
  },
];

export default function CulturalInsightsPage() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);

  // Handle selecting an answer
  const handleSelectAnswer = (questionId: number, optionId: string) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: optionId,
    });
  };

  // Handle submitting the quiz
  const handleSubmitQuiz = () => {
    setShowResults(true);
  };

  // Calculate score
  const calculateScore = () => {
    let score = 0;
    quizQuestions.forEach((question) => {
      if (selectedAnswers[question.id] === question.correctAnswer) {
        score += 1;
      }
    });
    return score;
  };

  // Reset quiz
  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setShowResults(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main id="main-content" id="main-content" className="flex-grow bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-center text-gray-900 mb-12">Cultural Insights</h1>
          
          {/* Cultural Insights Cards */}
          <section aria-labelledby="section-heading" className="mb-16">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Explore Cultural Nuances</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {culturalInsights.map((insight) => (
                <div 
                  key={insight.id} 
                  className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg hover:-translate-y-1"
                >
                  <div className="p-6">
                    <div className="flex justify-center mb-4">
                      <Image 
                        src={insight.imageUrl} 
                        alt={insight.title} 
                        width={80} 
                        height={80}
                        className="rounded-md"
                      />
                    </div>
                    <h3 className="text-xl font-bold text-blue-600 mb-3">{insight.title}</h3>
                    <p className="text-gray-600">{insight.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
          
          {/* Comprehension Quiz */}
          <section aria-labelledby="section-heading" className="bg-white rounded-lg shadow-md p-6 mb-12">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Cultural Comprehension Quiz</h2>
            
            {!showResults ? (
              <div>
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Question {quizQuestions[currentQuestion].id} of {quizQuestions.length}
                  </h3>
                  <p className="text-xl font-medium text-gray-800 mb-6">
                    {quizQuestions[currentQuestion].question}
                  </p>
                  <div className="space-y-3">
                    {quizQuestions[currentQuestion].options.map((option) => (
                      <div 
                        key={option.id}
                        className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                          selectedAnswers[quizQuestions[currentQuestion].id] === option.id
                            ? 'bg-blue-50 border-blue-500'
                            : 'hover:bg-gray-50 border-gray-200'
                        }`}
                        onClick={() => handleSelectAnswer(quizQuestions[currentQuestion].id, option.id)} onKeyDown={(e) => { if(e.key === "Enter" || e.key === " ") e.target.click(); }}
                      >
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            className="form-radio h-5 w-5 text-blue-600"
                            checked={selectedAnswers[quizQuestions[currentQuestion].id] === option.id}
                            onChange={() => handleSelectAnswer(quizQuestions[currentQuestion].id, option.id)}
                          />
                          <span className="ml-3 text-gray-700">{option.text}</span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <button
                    onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))} onKeyDown={(e) => { if(e.key === "Enter" || e.key === " ") e.target.click(); }}
                    disabled={currentQuestion === 0}
                    className={`px-4 py-2 rounded-md ${
                      currentQuestion === 0
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Previous
                  </button>
                  
                  {currentQuestion < quizQuestions.length - 1 ? (
                    <button
                      onClick={() => setCurrentQuestion(currentQuestion + 1)} onKeyDown={(e) => { if(e.key === "Enter" || e.key === " ") e.target.click(); }}
                      disabled={!selectedAnswers[quizQuestions[currentQuestion].id]}
                      className={`px-4 py-2 rounded-md ${
                        !selectedAnswers[quizQuestions[currentQuestion].id]
                          ? 'bg-blue-300 text-white cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmitQuiz} onKeyDown={(e) => { if(e.key === "Enter" || e.key === " ") e.target.click(); }}
                      disabled={!Object.keys(selectedAnswers).length || Object.keys(selectedAnswers).length < quizQuestions.length}
                      className={`px-4 py-2 rounded-md ${
                        !Object.keys(selectedAnswers).length || Object.keys(selectedAnswers).length < quizQuestions.length
                          ? 'bg-blue-300 text-white cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      Submit Quiz
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Quiz Results</h3>
                <p className="text-xl mb-6">
                  You scored {calculateScore()} out of {quizQuestions.length}!
                </p>
                
                <div className="mb-8">
                  {quizQuestions.map((question) => (
                    <div key={question.id} className="mb-6 text-left bg-gray-50 p-4 rounded-lg">
                      <p className="font-medium text-gray-800 mb-2">{question.question}</p>
                      <p className="text-sm text-gray-600 mb-1">
                        Your answer: {question.options.find(o => o.id === selectedAnswers[question.id])?.text || 'Not answered'}
                      </p>
                      <p className="text-sm font-medium text-green-600">
                        Correct answer: {question.options.find(o => o.id === question.correctAnswer)?.text}
                      </p>
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={handleResetQuiz} onKeyDown={(e) => { if(e.key === "Enter" || e.key === " ") e.target.click(); }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Try Again
                  </button>
                  <Link tabIndex={0} tabIndex={0} href="/" className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300">
                    Back to Home
                  </Link>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 