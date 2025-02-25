"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getLessonById } from '../../../lib/services/lessonService';
import { Lesson, VocabularyItem, GrammarExercise } from '../../../lib/types';

// Prevent static prerendering
export const dynamic = 'force-dynamic';

export default function LessonPage({ params }: { params: { id: string } }) {
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [flippedCards, setFlippedCards] = useState<{[key: number]: boolean}>({});
  const [grammarAnswers, setGrammarAnswers] = useState<{[key: number]: string}>({});
  const [grammarFeedback, setGrammarFeedback] = useState<{[key: number]: {correct: boolean, message: string}}>({});
  const router = useRouter();
  const { id } = params;

  useEffect(() => {
    async function fetchLesson() {
      try {
        const lessonData = await getLessonById(id);
        if (lessonData) {
          setLesson(lessonData);
          
          // Initialize grammar answers
          if (lessonData.grammar) {
            const initialAnswers: {[key: number]: string} = {};
            lessonData.grammar.forEach((_, index) => {
              initialAnswers[index] = '';
            });
            setGrammarAnswers(initialAnswers);
          }
        } else {
          setError('Lesson not found');
        }
        setLoading(false);
      } catch (err) {
        console.error(`Error fetching lesson with ID ${id}:`, err);
        setError('Failed to load lesson. Please try again later.');
        setLoading(false);
      }
    }

    if (id) {
      fetchLesson();
    }
  }, [id]);

  const toggleFlashcard = (index: number) => {
    setFlippedCards(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleGrammarInputChange = (index: number, value: string) => {
    setGrammarAnswers(prev => ({
      ...prev,
      [index]: value
    }));
  };

  const checkGrammarAnswer = (index: number, exercise: GrammarExercise) => {
    const userAnswer = grammarAnswers[index]?.trim().toLowerCase();
    const correctAnswer = exercise.answer.toLowerCase();
    
    if (userAnswer === correctAnswer) {
      setGrammarFeedback(prev => ({
        ...prev,
        [index]: {
          correct: true,
          message: 'Correct! Great job!'
        }
      }));
    } else {
      setGrammarFeedback(prev => ({
        ...prev,
        [index]: {
          correct: false,
          message: `Not quite. The correct answer is "${exercise.answer}".`
        }
      }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl font-medium text-primary">Loading lesson...</div>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="text-xl font-medium text-red-500">{error || 'Lesson not found'}</div>
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
    <div className="min-h-screen bg-muted py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link 
            href="/lessons" 
            className="text-primary hover:text-primary/80 flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Lessons
          </Link>
        </div>

        <div className="bg-white rounded-xl overflow-hidden shadow-lg">
          <div className="relative h-64 w-full">
            {lesson.imageUrl ? (
              <Image
                src={lesson.imageUrl}
                alt={lesson.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                <span className="text-primary">No image</span>
              </div>
            )}
            <div className="absolute top-4 right-4 bg-primary text-white text-sm font-medium py-1 px-3 rounded-full">
              {lesson.level}
            </div>
          </div>

          <div className="p-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold text-primary">{lesson.title}</h1>
              <span className="text-sm font-medium text-secondary bg-secondary/10 py-1 px-3 rounded-full">
                {lesson.duration}
              </span>
            </div>

            <p className="text-lg text-muted-foreground mb-8">{lesson.description}</p>

            {/* Audio Playback Section */}
            {lesson.audioUrl && (
              <div className="mb-8 p-4 bg-primary/5 rounded-lg">
                <h2 className="text-xl font-semibold text-primary mb-3">Pronunciation Guide</h2>
                <div className="flex items-center gap-4">
                  <audio 
                    controls 
                    className="w-full"
                    src={lesson.audioUrl || "https://freesound.org/data/previews/66/66717_9316-lq.mp3"}
                  >
                    Your browser does not support the audio element.
                  </audio>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Listen to the correct pronunciation of key phrases from this lesson.
                </p>
              </div>
            )}

            <div className="border-t border-border pt-6">
              <h2 className="text-xl font-semibold text-primary mb-4">Lesson Content</h2>
              
              {lesson.content ? (
                <div 
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: lesson.content }}
                />
              ) : (
                <div className="prose max-w-none">
                  <p>No content available for this lesson yet.</p>
                </div>
              )}
            </div>

            {/* Vocabulary Flashcards Section */}
            {lesson.vocabulary && lesson.vocabulary.length > 0 && (
              <div className="mt-8 border-t border-border pt-6">
                <h2 className="text-xl font-semibold text-primary mb-4">Vocabulary</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {lesson.vocabulary.map((item, index) => (
                    <div 
                      key={index}
                      className={`
                        cursor-pointer p-4 rounded-lg shadow-sm transition-all duration-300
                        ${flippedCards[index] ? 'bg-primary/10' : 'bg-white border border-border'}
                      `}
                      onClick={() => toggleFlashcard(index)}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-muted-foreground">
                          {flippedCards[index] ? 'Definition' : 'Word'}
                        </span>
                        <span className="text-xs text-primary">Click to flip</span>
                      </div>
                      <div className="text-center py-4">
                        <p className="text-xl font-medium">
                          {flippedCards[index] ? item.definition : item.word}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  Click on each card to reveal its definition.
                </p>
              </div>
            )}

            {/* Grammar Exercises Section */}
            {lesson.grammar && lesson.grammar.length > 0 && (
              <div className="mt-8 border-t border-border pt-6">
                <h2 className="text-xl font-semibold text-primary mb-4">Grammar Exercises</h2>
                <div className="space-y-6">
                  {lesson.grammar.map((exercise, index) => (
                    <div key={index} className="p-4 bg-white border border-border rounded-lg">
                      <p className="text-lg mb-3">{exercise.question}</p>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <input
                          type="text"
                          value={grammarAnswers[index] || ''}
                          onChange={(e) => handleGrammarInputChange(index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                          placeholder="Your answer..."
                        />
                        <button
                          onClick={() => checkGrammarAnswer(index, exercise)}
                          className="px-4 py-2 bg-secondary text-white rounded-md hover:bg-secondary/90 transition-colors"
                        >
                          Check
                        </button>
                      </div>
                      
                      {grammarFeedback[index] && (
                        <div className={`mt-3 p-3 rounded-md ${grammarFeedback[index].correct ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                          {grammarFeedback[index].message}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8 flex justify-between">
              <button
                className="px-4 py-2 bg-white border border-primary text-primary rounded-md hover:bg-primary/5 transition-colors"
                onClick={() => router.push('/lessons')}
              >
                Back to Lessons
              </button>
              <div className="flex gap-4">
                <button
                  className="px-4 py-2 bg-secondary text-white rounded-md hover:bg-secondary/90 transition-colors"
                  onClick={() => router.push(`/quiz/${id}`)}
                >
                  Take Quiz
                </button>
                <button
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
                >
                  Mark as Complete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 