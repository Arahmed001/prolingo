"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getLessonById } from '../../../lib/services/lessonService';
import { Lesson, VocabularyItem, GrammarExercise } from '../../../lib/types';
import { getAuth } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db } from '../../../lib/firebase';

// Extend the Lesson type to include examples
interface ExtendedLesson extends Lesson {
  examples?: string[];
}

// Prevent static prerendering
export const dynamic = 'force-dynamic';

export default function LessonPage({ params }: { params: { id: string } }) {
  const [lesson, setLesson] = useState<ExtendedLesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [flippedCards, setFlippedCards] = useState<{[key: number]: boolean}>({});
  const [grammarAnswers, setGrammarAnswers] = useState<{[key: number]: string}>({});
  const [grammarFeedback, setGrammarFeedback] = useState<{[key: number]: {correct: boolean, message: string}}>({});
  
  // Speaking exercise states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(5);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordingStatus, setRecordingStatus] = useState<'idle' | 'recording' | 'recorded' | 'uploading' | 'uploaded' | 'error'>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const router = useRouter();
  const { id } = params;
  const auth = getAuth();
  const storage = getStorage();

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

  // Handle recording countdown timer
  useEffect(() => {
    if (isRecording && recordingTime > 0) {
      timerRef.current = setTimeout(() => {
        setRecordingTime(prev => prev - 1);
      }, 1000);
    } else if (isRecording && recordingTime === 0) {
      stopRecording();
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isRecording, recordingTime]);

  // Clean up audio URL when component unmounts
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      setRecordingStatus('recording');
      setFeedbackMessage('');
      
      // Reset recording state
      audioChunksRef.current = [];
      setRecordingTime(5);
      
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Create media recorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      // Set up event handlers
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        
        // Create URL for audio playback
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        
        setRecordingStatus('recorded');
        
        // Stop all tracks in the stream
        stream.getTracks().forEach(track => track.stop());
      };
      
      // Start recording
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      setFeedbackMessage('Could not access microphone. Please check your browser permissions.');
      setRecordingStatus('error');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const uploadRecording = async () => {
    if (!audioBlob || !auth.currentUser) {
      setFeedbackMessage('You must be logged in to save recordings.');
      return;
    }
    
    try {
      setRecordingStatus('uploading');
      setUploadProgress(0);
      
      // Create a reference to the file location in Firebase Storage
      const userId = auth.currentUser.uid;
      const timestamp = new Date().getTime();
      const filePath = `recordings/${userId}/${id}/${timestamp}.webm`;
      const storageRef = ref(storage, filePath);
      
      // Upload the blob
      const uploadTask = uploadBytes(storageRef, audioBlob);
      
      // Wait for upload to complete
      await uploadTask;
      setUploadProgress(100);
      
      // Get the download URL
      const downloadUrl = await getDownloadURL(storageRef);
      
      setRecordingStatus('uploaded');
      setFeedbackMessage('Your recording has been saved successfully!');
      
      // You could store the reference in Firestore here if needed
      
    } catch (error) {
      console.error('Error uploading recording:', error);
      setRecordingStatus('error');
      setFeedbackMessage('Failed to upload recording. Please try again.');
    }
  };

  const resetRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingStatus('idle');
    setFeedbackMessage('');
  };

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

            {/* Speaking Exercise Section */}
            <div className="mt-8 border-t border-border pt-6">
              <h2 className="text-xl font-semibold text-primary mb-4">Speaking Exercise</h2>
              <div className="bg-primary/5 rounded-lg p-5">
                <div className="mb-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Practice Your Pronunciation</h3>
                  <p className="text-gray-700 mb-4">
                    Record yourself speaking the phrases from this lesson to improve your pronunciation.
                    The recording will automatically stop after 5 seconds.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-3 mb-4">
                    {recordingStatus === 'idle' || recordingStatus === 'error' ? (
                      <button
                        onClick={startRecording}
                        className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                        </svg>
                        Start Recording
                      </button>
                    ) : recordingStatus === 'recording' ? (
                      <button
                        onClick={stopRecording}
                        className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                        </svg>
                        Stop Recording ({recordingTime}s)
                      </button>
                    ) : (
                      <div className="flex flex-col sm:flex-row gap-3">
                        <button
                          onClick={resetRecording}
                          className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                          </svg>
                          Record Again
                        </button>
                        {recordingStatus !== 'uploading' && recordingStatus !== 'uploaded' && (
                          <button
                            onClick={uploadRecording}
                            className="px-4 py-2 bg-secondary text-white rounded-md hover:bg-secondary/90 transition-colors flex items-center justify-center gap-2"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                            Save Recording
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Audio Playback */}
                  {audioUrl && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Your Recording:</h4>
                      <audio 
                        controls 
                        className="w-full"
                        src={audioUrl}
                      >
                        Your browser does not support the audio element.
                      </audio>
                    </div>
                  )}
                  
                  {/* Upload Progress */}
                  {recordingStatus === 'uploading' && (
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Uploading...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-secondary h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  
                  {/* Feedback Message */}
                  {feedbackMessage && (
                    <div className={`p-3 rounded-md ${
                      recordingStatus === 'error' 
                        ? 'bg-red-50 text-red-700' 
                        : recordingStatus === 'uploaded' 
                          ? 'bg-green-50 text-green-700'
                          : 'bg-blue-50 text-blue-700'
                    }`}>
                      {feedbackMessage}
                    </div>
                  )}
                  
                  {/* Tips */}
                  <div className="mt-4 text-sm text-gray-600">
                    <h4 className="font-medium mb-1">Tips for better recordings:</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Speak clearly and at a normal pace</li>
                      <li>Practice in a quiet environment</li>
                      <li>Position your microphone properly</li>
                      <li>Listen to your recordings and compare with the lesson audio</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Example Sentences Section */}
            <div className="mt-8 border-t border-border pt-6">
              <h2 className="text-xl font-semibold text-primary mb-4">Example Sentences</h2>
              <div className="bg-primary/5 rounded-lg p-5">
                <ul className="space-y-3">
                  {(lesson.examples || getDefaultExamples(id)).map((example, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </span>
                      <p className="text-gray-700">{example}</p>
                    </li>
                  ))}
                </ul>
                <p className="text-sm text-muted-foreground mt-4">
                  Try creating your own sentences using the vocabulary and grammar from this lesson!
                </p>
              </div>
            </div>

            {/* Recommendation Section */}
            <div className="mt-8 border-t border-border pt-6">
              <h2 className="text-xl font-semibold text-primary mb-4">What to Learn Next</h2>
              <div className="bg-accent/10 rounded-lg p-5">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">
                      Recommended Next Lesson
                    </h3>
                    <p className="text-gray-700 mb-4">
                      Ready to continue your learning journey? We recommend trying the following lesson next:
                    </p>
                    <Link 
                      href={`/lessons/${getRecommendation(id).id}`}
                      className="inline-flex items-center px-4 py-2 bg-accent text-white rounded-md hover:bg-accent-dark transition-colors"
                    >
                      Try {getRecommendation(id).title} Next
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

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