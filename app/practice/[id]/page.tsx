"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getAuth } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getLessonById } from '../../../lib/services/lessonService';
import { Lesson } from '../../../lib/types';
import { auth, storage, db } from '../../../lib/firebase/init';

// Prevent static prerendering
export const dynamic = 'force-dynamic';

export default function PracticePage({ params }: { params: { id: string } }) {
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Speaking exercise states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(5);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordingStatus, setRecordingStatus] = useState<'idle' | 'recording' | 'recorded' | 'uploading' | 'uploaded' | 'error'>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  
  // Writing exercise states
  const [writingText, setWritingText] = useState('');
  const [writingPrompt, setWritingPrompt] = useState('');
  const [isSubmittingWriting, setIsSubmittingWriting] = useState(false);
  const [writingFeedback, setWritingFeedback] = useState('');
  const [writingStatus, setWritingStatus] = useState<'idle' | 'submitting' | 'submitted' | 'error'>('idle');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const router = useRouter();
  const { id } = params;
  const auth = getAuth();
  const storage = getStorage();

  useEffect(() => {
    if (!auth.currentUser) {
      router.push('/login');
      return;
    }

    async function fetchLesson() {
      try {
        const lessonData = await getLessonById(id);
        if (lessonData) {
          setLesson(lessonData);
          setWritingPrompt(generateWritingPrompt(lessonData.title));
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

    fetchLesson();
  }, [id, auth.currentUser, router]);

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
      
      audioChunksRef.current = [];
      setRecordingTime(5);
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        setRecordingStatus('recorded');
        stream.getTracks().forEach(track => track.stop());
      };
      
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
      
      const userId = auth.currentUser.uid;
      const timestamp = new Date().getTime();
      const filePath = `recordings/${userId}/${id}/${timestamp}.webm`;
      const storageRef = ref(storage, filePath);
      
      await uploadBytes(storageRef, audioBlob);
      setUploadProgress(100);
      
      const downloadUrl = await getDownloadURL(storageRef);
      setRecordingStatus('uploaded');
      setFeedbackMessage('Great pronunciation! Your recording has been saved successfully.');
      
      console.log('Recording saved at:', filePath);
      console.log('Download URL:', downloadUrl);
      
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

  const submitWriting = async () => {
    if (!writingText.trim() || !auth.currentUser) {
      setWritingFeedback('Please write something and ensure you are logged in.');
      setWritingStatus('error');
      return;
    }
    
    try {
      setIsSubmittingWriting(true);
      setWritingStatus('submitting');
      
      const userId = auth.currentUser.uid;
      const writingsCollection = collection(db, `writings/${userId}/${id}`);
      
      await addDoc(writingsCollection, {
        text: writingText,
        timestamp: serverTimestamp(),
        lessonId: id,
        userId: userId
      });
      
      setWritingStatus('submitted');
      setWritingFeedback('Good effort! Your writing has been saved.');
      
    } catch (error) {
      console.error('Error submitting writing:', error);
      setWritingStatus('error');
      setWritingFeedback('Failed to save your writing. Please try again.');
    } finally {
      setIsSubmittingWriting(false);
    }
  };

  const resetWriting = () => {
    setWritingText('');
    setWritingFeedback('');
    setWritingStatus('idle');
  };

  const generateWritingPrompt = (title: string): string => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('greetings')) {
      return 'Write a short greeting dialogue between two people meeting for the first time.';
    } else if (lowerTitle.includes('numbers')) {
      return 'Write a sentence that includes at least three different numbers.';
    }
    return `Write a sentence using "${title}" vocabulary.`;
  };

  if (loading) {
    return (
      <div id="main-content" className="min-h-screen flex items-center justify-center">
        <div id="main-content" className="text-base sm:text-lg font-medium text-primary">Loading practice exercises...</div>
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
            href={`/lessons/${id}`}
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
              Practice {lesson?.title || 'Lesson'}
            </h1>
          </div>

          <div id="main-content" className="p-4 sm:p-6 space-y-8">
            {/* Speaking Practice Section */}
            <div id="main-content" className="bg-accent/5 rounded-lg p-5">
              <h2 className="text-xl font-semibold text-primary mb-4">Speaking Practice</h2>
              <div id="main-content" className="mb-4">
                <p className="text-gray-700 mb-4">
                  Record yourself speaking phrases from this lesson to improve your pronunciation.
                  The recording will automatically stop after 5 seconds.
                </p>
                
                <div id="main-content" className="flex flex-col sm:flex-row gap-3 mb-4">
                  {recordingStatus === 'idle' || recordingStatus === 'error' ? (
                    <button
                      onClick={startRecording} onKeyDown={(e) => { if(e.key === "Enter" || e.key === " ") e.target.click(); }}
                      className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                    >
                      <svg aria-hidden="true" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                      </svg>
                      Record (5 seconds)
                    </button>
                  ) : recordingStatus === 'recording' ? (
                    <button
                      onClick={stopRecording} onKeyDown={(e) => { if(e.key === "Enter" || e.key === " ") e.target.click(); }}
                      className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                    >
                      Stop Recording ({recordingTime}s)
                    </button>
                  ) : (
                    <div id="main-content" className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={resetRecording} onKeyDown={(e) => { if(e.key === "Enter" || e.key === " ") e.target.click(); }}
                        className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                      >
                        Record Again
                      </button>
                      {recordingStatus !== 'uploading' && recordingStatus !== 'uploaded' && (
                        <button
                          onClick={uploadRecording} onKeyDown={(e) => { if(e.key === "Enter" || e.key === " ") e.target.click(); }}
                          className="px-4 py-2 bg-secondary text-white rounded-md hover:bg-secondary/90 transition-colors"
                        >
                          Save Recording
                        </button>
                      )}
                    </div>
                  )}
                </div>
                
                {audioUrl && (
                  <div id="main-content" className="mb-4">
                    <audio controls className="w-full" src={audioUrl}>
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                )}
                
                {feedbackMessage && (
                  <div id="main-content" className={`p-4 rounded-md ${
                    recordingStatus === 'error' 
                      ? 'bg-red-50 text-red-700' 
                      : 'bg-green-50 text-green-700'
                  }`}>
                    {feedbackMessage}
                  </div>
                )}
              </div>
            </div>

            {/* Writing Practice Section */}
            <div id="main-content" className="bg-secondary/5 rounded-lg p-5">
              <h2 className="text-xl font-semibold text-primary mb-4">Writing Practice</h2>
              <div id="main-content" className="mb-4">
                <p className="text-gray-700 mb-4">{writingPrompt}</p>
                
                <textarea
                  value={writingText}
                  onChange={(e) => setWritingText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[120px]"
                  placeholder="Write your response here..."
                  disabled={isSubmittingWriting || writingStatus === 'submitted'}
                />
                
                <div id="main-content" className="flex flex-col sm:flex-row gap-3 mt-4">
                  {writingStatus === 'idle' || writingStatus === 'error' ? (
                    <button
                      onClick={submitWriting} onKeyDown={(e) => { if(e.key === "Enter" || e.key === " ") e.target.click(); }}
                      disabled={isSubmittingWriting || !writingText.trim()}
                      className={`px-4 py-2 bg-primary text-white rounded-md transition-colors ${
                        isSubmittingWriting || !writingText.trim() 
                          ? 'opacity-50 cursor-not-allowed' 
                          : 'hover:bg-primary/90'
                      }`}
                    >
                      Submit
                    </button>
                  ) : writingStatus === 'submitted' && (
                    <button
                      onClick={resetWriting} onKeyDown={(e) => { if(e.key === "Enter" || e.key === " ") e.target.click(); }}
                      className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                    >
                      Write Another Response
                    </button>
                  )}
                </div>
                
                {writingFeedback && (
                  <div id="main-content" className={`mt-4 p-4 rounded-md ${
                    writingStatus === 'error' 
                      ? 'bg-red-50 text-red-700' 
                      : 'bg-green-50 text-green-700'
                  }`}>
                    {writingFeedback}
                  </div>
                )}
              </div>
            </div>

            {/* Quiz Link Section */}
            <div id="main-content" className="bg-primary/5 rounded-lg p-5">
              <h2 className="text-xl font-semibold text-primary mb-4">Assessment</h2>
              <p className="text-gray-700 mb-4">
                Ready to test your knowledge? Take the assessment for this lesson.
              </p>
              <Link
                href={`/assessment/${id}`}
                className="inline-block px-6 py-3 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
              >
                Take Assessment
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 