"use client";

import { useState, useEffect, useRef, ReactNode, JSXElementConstructor, Key, PromiseLikeOfReactNode, ReactElement, SetStateAction } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getLessonById } from '../../../lib/services/lessonService';
import { Lesson, VocabularyItem } from '../../../lib/types';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc, collection, addDoc, serverTimestamp, getDoc, query, where, getDocs, orderBy, limit, arrayUnion, setDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../../../lib/firebase/init';
import Footer from '../../components/Footer';
import { usePerformanceMonitoring } from '../../../lib/performance';
import CustomToast from '../../components/Toast';

// Base64 blur placeholders for images
const blurPlaceholders = {
  default: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mO8/+d/PQAJBAj5ZYCkFwAAAABJRU5ErkJggg==',
  vocabulary: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  grammar: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mMUYGhoBAABBAEAcIMBSAAAAABJRU5ErkJggg==',
};

// Define a local GrammarExercise interface with the explanation property
interface GrammarExercise {
  question: string;
  answer: string;
  explanation?: string;
}

// Define a QuizQuestion interface
interface QuizQuestion {
  type: 'multiple-choice' | 'fill-in';
  question: string;
  options?: string[];
  answer: string;
}

// Extend the Lesson type to include examples
interface ExtendedLesson extends Lesson {
  questions: any;
  quiz: any;
  difficulty: ReactNode;
  examples?: string[];
  grammar?: GrammarExercise[];
  aiGeneratedContent?: {
    text: string;
    tips: string[];
  };
  aiContent?: AIContent;
}

interface Progress {
  id: string;
  userId: string;
  lessonId: string;
  score: number;
  completed: boolean;
  timestamp: any;
}

// Prevent static prerendering
export const dynamic = 'force-dynamic';

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

// Enhanced interfaces for AI content - rename to avoid conflicts
interface AIVocabularyItem {
  term?: string;
  word?: string;
  definition: string;
  imageUrl?: string;
  usage?: string; // Added for AI content
}

interface AIGrammarPoint {
  question: string;
  answer?: string;
  rule?: string; // Added for AI content
  example?: string; // Added for AI content
}

interface AIContent {
  sentences: string[];
  vocab: AIVocabularyItem[];
  grammar: {
    rule: string;
    example: string;
  };
}

// New interface for slide-based lesson format
interface LessonSlide {
  id: string;
  title: string;
  type: 'intro' | 'content' | 'vocabulary' | 'grammar' | 'examples' | 'practice' | 'video' | 'audio' | 'quiz' | 'objectives';
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  audioUrl?: string;
  vocabulary?: AIVocabularyItem[];
  grammarPoint?: {
    rule: string;
    example: string;
  };
  examples?: string[];
  notes?: string; // Instructor notes (visible only to teachers)
  cefrCriteria?: string[]; // CEFR criteria this slide fulfills
  objectives?: string[]; // Learning objectives for this slide
  isHtml?: boolean; // Flag to indicate if content should be rendered as HTML
}

export default function LessonPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [lesson, setLesson] = useState<ExtendedLesson | null>(null);
  const [quizMode, setQuizMode] = useState<boolean>(false);
  const [currentQuizIndex, setCurrentQuizIndex] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [score, setScore] = useState<number>(0);
  const [quizCompleted, setQuizCompleted] = useState<boolean>(false);
  const [userProgress, setUserProgress] = useState<Progress[]>([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  // AI content related states
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [showAIContent, setShowAIContent] = useState(false);
  // Teacher-only states
  const [isTeacher, setIsTeacher] = useState(false);
  const [showLessonPlan, setShowLessonPlan] = useState(false);
  const [lessonPlan, setLessonPlan] = useState<any>(null);
  const [isGeneratingLessonPlan, setIsGeneratingLessonPlan] = useState(false);
  
  // Slide-based lesson states
  const [lessonSlides, setLessonSlides] = useState<LessonSlide[]>([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [slideViewMode, setSlideViewMode] = useState(false);
  const slideContainerRef = useRef<HTMLDivElement>(null);
  
  const router = useRouter();
  const params = useParams();
  const lessonId = params.id as string;
  
  // Add performance monitoring
  usePerformanceMonitoring(`/lessons/${lessonId}`);

  const DIFFICULTY_THRESHOLD = 80;
  const CONSECUTIVE_HIGH_SCORES_NEEDED = 3;

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

  // Check authentication status
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        setLoading(false);
        
        // Check if user is a teacher
        const checkUserRole = async () => {
          try {
            const userDocRef = doc(db, 'users', user.uid);
            const userDocSnap = await getDoc(userDocRef);
            
            if (userDocSnap.exists() && userDocSnap.data().role === 'teacher') {
              setIsTeacher(true);
            }
          } catch (error) {
            console.error("Error checking user role:", error);
          }
        };
        
        checkUserRole();
      } else {
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Load lesson data and convert to slides
  useEffect(() => {
    if (!user || !lessonId) return;

    const fetchLesson = async () => {
      try {
        const lessonRef = doc(db, 'lessons', lessonId);
        const lessonSnap = await getDoc(lessonRef);
        
        if (lessonSnap.exists()) {
          const lessonData = { id: lessonSnap.id, ...lessonSnap.data() } as ExtendedLesson;
          setLesson(lessonData);
          
          // Convert lesson content to slides
          convertLessonToSlides(lessonData);
        } else {
          console.error("Lesson not found");
          router.push('/lessons');
        }
      } catch (error) {
        console.error("Error fetching lesson:", error);
      }
    };

    fetchLesson();
  }, [user, lessonId, router]);

  // Convert lesson data to slide format
  const convertLessonToSlides = (lessonData: ExtendedLesson) => {
    const slides: LessonSlide[] = [];
    
    // Objectives slide (new)
    slides.push({
      id: 'objectives',
      title: 'Lesson Objectives',
      type: 'objectives',
      content: 'By the end of this lesson, you should be able to:',
      objectives: generateObjectives(lessonData.title, lessonData.level),
      cefrCriteria: generateCefrCriteria(lessonData.level)
    });
    
    // Intro slide
    slides.push({
      id: 'intro',
      title: lessonData.title,
      type: 'intro',
      content: lessonData.description || '',
      imageUrl: lessonData.imageUrl
    });
    
    // Content slides - split by paragraphs
    if (lessonData.content) {
      // Check if content contains HTML tags
      const containsHtml = /<[a-z][\s\S]*>/i.test(lessonData.content);
      
      if (containsHtml) {
        // If it contains HTML, create a single slide with the HTML content
        slides.push({
          id: `content-html`,
          title: `${lessonData.title} - Content`,
          type: 'content',
          content: lessonData.content,
          isHtml: true
        });
      } else {
        // Otherwise split by paragraphs as before
        const paragraphs = lessonData.content.split('\n\n');
        paragraphs.forEach((paragraph, index) => {
          if (paragraph.trim()) {
            slides.push({
              id: `content-${index}`,
              title: `${lessonData.title} - Content`,
              type: 'content',
              content: paragraph.trim()
            });
          }
        });
      }
    }
    
    // Vocabulary slides - group by 3 items per slide
    if (lessonData.vocabulary && lessonData.vocabulary.length > 0) {
      const vocabChunks = [];
      for (let i = 0; i < lessonData.vocabulary.length; i += 3) {
        vocabChunks.push(lessonData.vocabulary.slice(i, i + 3));
      }
      
      vocabChunks.forEach((chunk, index) => {
        slides.push({
          id: `vocab-${index}`,
          title: 'Vocabulary',
          type: 'vocabulary',
          content: 'Learn the following vocabulary words:',
          vocabulary: chunk.map(item => ({
            word: item.word,
            definition: item.definition,
            term: item.term ? String(item.term) : undefined
          }))
        });
      });
    }
    
    // Grammar slides
    if (lessonData.grammar && lessonData.grammar.length > 0) {
      lessonData.grammar.forEach((grammarItem, index) => {
        slides.push({
          id: `grammar-${index}`,
          title: 'Grammar Point',
          type: 'grammar',
          content: grammarItem.question,
          grammarPoint: {
            rule: grammarItem.answer,
            example: grammarItem.explanation || 'No example provided'
          }
        });
      });
    }
    
    // Example sentences slide
    if (lessonData.examples && lessonData.examples.length > 0) {
      slides.push({
        id: 'examples',
        title: 'Example Sentences',
        type: 'examples',
        content: 'Practice with these examples:',
        examples: lessonData.examples
      });
    } else if (lessonData.aiContent?.sentences) {
      slides.push({
        id: 'ai-examples',
        title: 'Practice Sentences',
        type: 'examples',
        content: 'Practice with these examples:',
        examples: lessonData.aiContent.sentences
      });
    }
    
    // If there's audio content
    if (lessonData.audioUrl) {
      slides.push({
        id: 'audio',
        title: 'Pronunciation',
        type: 'audio',
        content: 'Listen to the correct pronunciation:',
        audioUrl: lessonData.audioUrl
      });
    }
    
    // AI content slides
    if (lessonData.aiContent) {
      // Grammar focus slide
      slides.push({
        id: 'ai-grammar',
        title: 'Grammar Focus',
        type: 'grammar',
        content: 'Key grammar point:',
        grammarPoint: {
          rule: lessonData.aiContent.grammar.rule,
          example: lessonData.aiContent.grammar.example
        }
      });
      
      // Vocabulary from AI content
      if (lessonData.aiContent.vocab && lessonData.aiContent.vocab.length > 0) {
        const aiVocabChunks = [];
        for (let i = 0; i < lessonData.aiContent.vocab.length; i += 3) {
          aiVocabChunks.push(lessonData.aiContent.vocab.slice(i, i + 3));
        }
        
        aiVocabChunks.forEach((chunk, index) => {
          slides.push({
            id: `ai-vocab-${index}`,
            title: 'AI Vocabulary',
            type: 'vocabulary',
            content: 'Learn these additional words:',
            vocabulary: chunk
          });
        });
      }
    }
    
    setLessonSlides(slides);
  };
  
  // Load user progress
  useEffect(() => {
    if (!user || !lessonId) return;

    const fetchUserProgress = async () => {
      try {
        const progressQuery = query(
          collection(db, 'progress'),
          where('userId', '==', user.uid),
          where('lessonId', '==', lessonId),
          orderBy('timestamp', 'desc'),
          limit(3)
        );
        
        const progressSnap = await getDocs(progressQuery);
        const progressData: Progress[] = [];
        
        progressSnap.forEach((doc) => {
          progressData.push({ id: doc.id, ...doc.data() } as Progress);
        });
        
        setUserProgress(progressData);
      } catch (error) {
        console.error("Error fetching user progress:", error);
      }
    };

    fetchUserProgress();
  }, [user, lessonId]);
  
  // Navigation functions for slides
  const goToNextSlide = () => {
    if (currentSlideIndex < lessonSlides.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1);
    }
  };
  
  const goToPrevSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1);
    }
  };
  
  const goToSlide = (index: number) => {
    if (index >= 0 && index < lessonSlides.length) {
      setCurrentSlideIndex(index);
    }
  };
  
  // Toggle fullscreen presentation mode
  const toggleFullscreen = () => {
    if (slideContainerRef.current) {
      if (!isFullscreen) {
        if (slideContainerRef.current.requestFullscreen) {
          slideContainerRef.current.requestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      }
      setIsFullscreen(!isFullscreen);
    }
  };
  
  // Listen for fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);
  
  // Toggle between slide view and regular view
  const toggleSlideView = () => {
    setSlideViewMode(!slideViewMode);
    setCurrentSlideIndex(0);
  };
  
  // Keyboard navigation for slides
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!slideViewMode) return;
      
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
        goToNextSlide();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        goToPrevSlide();
      } else if (e.key === 'Escape') {
        if (isFullscreen) {
          toggleFullscreen();
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [slideViewMode, currentSlideIndex, lessonSlides.length, isFullscreen]);

  // Start quiz
  const handleStartQuiz = () => {
    // Instead of just toggling mode, navigate to the dedicated quiz page
    router.push(`/quiz/${lessonId}`);
  };

  // Submit answer
  const handleSubmitAnswer = () => {
    if (!lesson) return;
    // Check if answer is correct
    const currentQuestion = lesson.questions[currentQuizIndex];
    if (selectedAnswer === currentQuestion.answer) {
      setScore(prevScore => prevScore + 1);
    }
    // Move to next question or finish quiz
    if (currentQuizIndex < lesson.quiz.length - 1) {
      setCurrentQuizIndex(prevIndex => prevIndex + 1);
      setSelectedAnswer('');
    } else {
      completeQuiz();
    }
  };

  // Complete quiz
  const completeQuiz = async () => {
    if (!user || !lessonId || !lesson) return;
    
    setQuizCompleted(true);
    
    // Calculate percentage score
    const percentageScore = Math.round((score / lesson.quiz.length) * 100);
    
    try {
      // Save progress to Firebase
      const progressRef = doc(collection(db, 'progress'));
      await updateDoc(progressRef, {
        userId: user.uid,
        lessonId,
        score: percentageScore,
        completed: true,
        timestamp: new Date()
      });
      
      // Add to local progress
      const newProgress: Progress = {
        id: 'temp-id',
        userId: user.uid,
        lessonId,
        score: percentageScore,
        completed: true,
        timestamp: new Date()
      };
      
      setUserProgress(prevProgress => [newProgress, ...prevProgress]);
      
      // We've removed adjustLessonDifficulty functionality
    } catch (error) {
      console.error("Error saving progress:", error);
    }
  };

  // Replace any image rendering with optimized version
  const renderImage = (src: string, alt: string, className: string = "") => (
    <div className={`relative ${className || "h-40 w-full"}`}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className="object-cover rounded-md"
        loading="lazy"
        placeholder="blur"
        blurDataURL={blurPlaceholders.default}
      />
    </div>
  );

  // Update renderVocabularyImage function to handle both types correctly
  const renderVocabularyImage = (item: AIVocabularyItem | VocabularyItem) => {
    // If it's an AIVocabularyItem with imageUrl
    if ('imageUrl' in item && item.imageUrl) {
      return (
        <div className="relative h-20 w-20 mx-auto mb-2">
          <Image
            src={item.imageUrl}
            alt={'term' in item && item.term ? String(item.term) : 'word' in item && item.word ? item.word : ''}
            fill
            sizes="80px"
            className="object-cover rounded-md"
            loading="lazy"
            placeholder="blur"
            blurDataURL={blurPlaceholders.vocabulary}
          />
        </div>
      );
    }
    return null;
  };

  // Share lesson function
  const handleShareLesson = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    const shareUrl = `https://prolingo.vercel.app/lessons/${lessonId}`;
    const shareTitle = `Check out this lesson: ${lesson?.title || 'Language Lesson'}`;
    const shareText = `I'm learning ${lesson?.title || 'a new language'} on ProLingo!`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        setToastMessage('Link copied to clipboard!');
        setShowToast(true);
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  // Generate AI content based on user's CEFR level
  const generateAIContent = async () => {
    if (!user || !lessonId || !lesson) return;
    
    setIsGeneratingAI(true);
    setToastMessage('Generating AI content...');
    setShowToast(true);
    
    try {
      // Get user's CEFR level from profile or default to A1
      const userDocRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userDocRef);
      const userCEFRLevel = userSnap.exists() ? userSnap.data().cefrLevel || 'A1' : 'A1';
      
      // Sample AI content based on lesson and CEFR level
      // In a real implementation, this would be an API call to an AI service
      const aiContent = createSampleAIContent(lesson.title, userCEFRLevel);
      
      // Update lesson document with AI content
      const lessonRef = doc(db, 'lessons', lessonId);
      await updateDoc(lessonRef, {
        aiContent: aiContent
      });
      
      // Update local state
      setLesson({
        ...lesson,
        aiContent
      });
      
      setToastMessage('AI content generated successfully!');
      setShowToast(true);
      setShowAIContent(true);
    } catch (error) {
      console.error('Error generating AI content:', error);
      setToastMessage('Failed to generate AI content. Please try again.');
      setShowToast(true);
    } finally {
      setIsGeneratingAI(false);
    }
  };
  
  // Create sample AI content based on lesson topic and CEFR level
  const createSampleAIContent = (topic: string, cefrLevel: string): AIContent => {
    // Tailor content complexity based on CEFR level
    const complexity = cefrLevel === 'A1' ? 'basic' : 
                       cefrLevel === 'A2' ? 'elementary' : 
                       cefrLevel === 'B1' ? 'intermediate' : 
                       cefrLevel === 'B2' ? 'upper intermediate' : 
                       cefrLevel === 'C1' ? 'advanced' : 'proficient';
    
    // Sample sentences for different lesson topics
    const sentencesByTopic: {[key: string]: string[]} = {
      'Greetings': [
        'Hello, how are you today?',
        'Good morning! It\'s nice to meet you.',
        'Hi there! My name is Sarah.',
        'Good evening, everyone!',
        'Hey! Long time no see!',
        'How have you been lately?',
        'It\'s a pleasure to meet you.',
        'Welcome to our class!',
        'I hope you\'re having a good day.',
        'See you tomorrow!'
      ],
      'Numbers': [
        'I need to buy three apples and two oranges.',
        'The building has twenty-five floors.',
        'My phone number is 555-123-4567.',
        'She scored ninety-eight on her math test.',
        'There are seven days in a week.',
        'This costs fifteen dollars.',
        'The temperature is twenty-two degrees today.',
        'He is thirty-five years old.',
        'The train arrives in forty-five minutes.',
        'We need fifty chairs for the event.'
      ],
      // Default set for any other topic
      'default': [
        'This is the first example sentence for ' + topic + '.',
        'Learning about ' + topic + ' can be very interesting.',
        'Many people find ' + topic + ' challenging at first.',
        'Practice makes perfect when studying ' + topic + '.',
        'Let\'s explore some key concepts in ' + topic + '.',
        'Understanding ' + topic + ' will help you communicate better.',
        'There are many aspects to consider in ' + topic + '.',
        'The basics of ' + topic + ' are essential for beginners.',
        'Advanced learners can explore complex ' + topic + ' structures.',
        'Don\'t forget to practice ' + topic + ' regularly!'
      ]
    };
    
    // Select sentences based on topic or default if not found
    const sentences = sentencesByTopic[topic] || sentencesByTopic['default'];
    
    // Create vocab items
    const vocabItems: AIVocabularyItem[] = [
      { 
        word: 'example', 
        definition: 'Something that serves as a pattern to be imitated',
        usage: 'This is an example of how to use the word correctly.' 
      },
      { 
        word: 'practice', 
        definition: 'The act of doing something regularly to improve your skill',
        usage: 'Daily practice will help you learn faster.' 
      },
      { 
        word: 'understand', 
        definition: 'To comprehend or grasp the meaning of something',
        usage: 'I understand the concept now, thank you.' 
      },
      { 
        word: 'improve', 
        definition: 'To make or become better',
        usage: 'My skills have improved since I started taking lessons.' 
      },
      { 
        word: 'communicate', 
        definition: 'To share or exchange information with others',
        usage: 'It\'s important to communicate clearly in any language.' 
      }
    ];
    
    // Create grammar rule based on CEFR level
    let grammarRule, grammarExample;
    
    if (cefrLevel === 'A1' || cefrLevel === 'A2') {
      grammarRule = 'Present Simple Tense: Use it for facts, habits, and routines.';
      grammarExample = 'I study languages every day. She likes coffee.';
    } else if (cefrLevel === 'B1' || cefrLevel === 'B2') {
      grammarRule = 'Present Perfect vs Past Simple: Use Present Perfect for experiences and Past Simple for completed actions at a specific time.';
      grammarExample = 'I have visited Paris three times. I visited Paris last summer.';
    } else {
      grammarRule = 'Conditional Structures: Use different conditionals to express various hypothetical situations.';
      grammarExample = 'If I had studied harder, I would have passed the exam. If I were you, I would take that opportunity.';
    }
    
    return {
      sentences,
      vocab: vocabItems,
      grammar: {
        rule: grammarRule,
        example: grammarExample
      }
    };
  };
  
  // Check if AI content exists, otherwise create sample content
  useEffect(() => {
    if (!user || !lessonId || !lesson) return;
    
    const checkAndCreateAIContent = async () => {
      if (!lesson.aiContent) {
        const lessonRef = doc(db, 'lessons', lessonId);
        const lessonSnap = await getDoc(lessonRef);
        
        if (lessonSnap.exists() && !lessonSnap.data().aiContent) {
          // Create sample AI content if it doesn't exist
          const sampleAIContent = createSampleAIContent(lesson.title, lesson.level);
          
          try {
            await updateDoc(lessonRef, {
              aiContent: sampleAIContent
            });
            
            setLesson(prev => prev ? {
              ...prev,
              aiContent: sampleAIContent
            } : null);
          } catch (error) {
            console.error('Error creating sample AI content:', error);
          }
        }
      } else {
        setShowAIContent(true);
      }
    };
    
    checkAndCreateAIContent();
  }, [user, lessonId, lesson]);

  // Generate lesson plan for teachers
  const generateLessonPlan = async () => {
    if (!user || !isTeacher || !lesson) return;
    
    setIsGeneratingLessonPlan(true);
    setToastMessage('Generating lesson plan...');
    setShowToast(true);
    
    try {
      // In a real implementation, this might be an API call to an AI service
      // For now, we'll create a structured lesson plan based on the lesson content
      const generatedLessonPlan = {
        title: `Lesson Plan: ${lesson.title}`,
        level: lesson.level,
        duration: "50 minutes",
        objectives: [
          `Students will be able to use key vocabulary related to ${lesson.title} in context`,
          "Students will practice speaking and listening skills",
          "Students will engage in communicative activities to reinforce learning"
        ],
        materials: [
          "Handouts with vocabulary and example sentences",
          "Audio recordings for pronunciation practice",
          "Interactive whiteboard or poster paper for group activities"
        ],
        warmUp: {
          title: "Warm-up Activity (5-7 minutes)",
          description: `Engage students in a brief discussion about ${lesson.title.toLowerCase()} in their daily lives. Ask open-ended questions to activate prior knowledge.`,
          questions: [
            "What do you already know about this topic?",
            "When do you use this vocabulary in everyday situations?",
            "What challenges do you face when discussing this topic?"
          ]
        },
        presentation: {
          title: "Presentation (10-15 minutes)",
          description: "Introduce new vocabulary and grammar structures",
          steps: [
            "Present new vocabulary with visual aids and example sentences",
            "Model pronunciation and have students repeat",
            "Explain grammatical structures in context",
            "Check for understanding through quick comprehension questions"
          ],
          vocabulary: lesson.vocabulary?.map(v => ({ 
            word: v.term || v.word || '', 
            definition: v.definition,
            exampleSentence: lesson.aiContent?.sentences.find(s => s.includes(String(v.term || v.word || '').toLowerCase())) || `Example with ${v.term || v.word || ''}`
          })) || []
        },
        practice: {
          title: "Guided Practice (15 minutes)",
          description: "Structured activities to practice new language",
          activities: [
            {
              name: "Gap-fill Exercise",
              description: "Students complete sentences using the new vocabulary"
            },
            {
              name: "Pair Dialog Practice",
              description: "Students practice conversations in pairs using provided dialog templates"
            },
            {
              name: "Sentence Formation",
              description: "Students create their own sentences using the target grammar structures"
            }
          ]
        },
        production: {
          title: "Free Production (15 minutes)",
          description: "Less structured activities allowing creative use of language",
          activities: [
            {
              name: "Role Play",
              description: "Students act out scenarios related to the lesson theme"
            },
            {
              name: "Discussion Groups",
              description: "Small groups discuss topics using target vocabulary and structures"
            },
            {
              name: "Information Gap Activity",
              description: "Students work in pairs to complete missing information"
            }
          ]
        },
        assessment: {
          title: "Assessment (5 minutes)",
          description: "Check understanding and provide feedback",
          methods: [
            "Exit tickets with key questions about the lesson content",
            "Brief oral assessment with random students",
            "Self-assessment checklist for students to evaluate their own understanding"
          ]
        },
        homework: {
          title: "Homework/Extension",
          description: "Activities to reinforce learning outside class",
          assignments: [
            "Complete online quiz related to the lesson",
            "Write short paragraph using at least 5 vocabulary items",
            "Prepare a brief presentation about a real-life application of the topic"
          ]
        },
        differentiation: {
          title: "Differentiation Strategies",
          forStrugglingStudents: [
            "Provide vocabulary list with L1 translations",
            "Offer additional guided practice time",
            "Use visual aids to reinforce concepts"
          ],
          forAdvancedStudents: [
            "Assign more complex production tasks",
            "Have them help peers as 'language coaches'",
            "Provide additional challenging vocabulary"
          ]
        },
        notes: {
          title: "Teacher Notes",
          cultural: "Highlight any cultural aspects relevant to this topic",
          common: "Address common errors students make with this content",
          extensions: "Suggestions for extending the lesson if time permits"
        }
      };
      
      setLessonPlan(generatedLessonPlan);
      setShowLessonPlan(true);
      setToastMessage('Lesson plan generated successfully!');
      setShowToast(true);
    } catch (error) {
      console.error('Error generating lesson plan:', error);
      setToastMessage('Failed to generate lesson plan. Please try again.');
      setShowToast(true);
    } finally {
      setIsGeneratingLessonPlan(false);
    }
  };
  
  // Close lesson plan modal
  const closeLessonPlan = () => {
    setShowLessonPlan(false);
  };

  // Render a single slide
  const renderSlide = (slide: LessonSlide) => {
    return (
      <div className="slide-content h-full flex flex-col">
        <h2 className="slide-title text-3xl font-bold text-primary mb-4">{slide.title}</h2>
        
        <div className="slide-body flex-grow flex flex-col">
          {slide.type === 'objectives' && (
            <div className="objectives-slide">
              <p className="text-lg mb-6">{slide.content}</p>
              
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-blue-700 mb-3">Learning Objectives</h3>
                <ul className="space-y-2">
                  {slide.objectives?.map((objective, idx) => (
                    <li key={idx} className="flex items-start">
                      <svg className="h-6 w-6 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{objective}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-blue-700 mb-3">CEFR {slide.title.includes('B1') ? 'B1' : 'Level'} Criteria</h3>
                <ul className="space-y-2">
                  {slide.cefrCriteria?.map((criteria, idx) => (
                    <li key={idx} className="flex items-start">
                      <svg className="h-6 w-6 text-blue-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{criteria}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          
          {slide.type === 'intro' && (
            <div className="intro-slide flex flex-col md:flex-row items-center gap-6 h-full">
              {slide.imageUrl && (
                <div className="slide-image relative w-full md:w-1/2 h-64 md:h-full">
                  <Image 
                    src={slide.imageUrl} 
                    alt={slide.title} 
                    fill 
                    className="object-cover rounded-lg" 
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              )}
              <div className={`slide-text ${slide.imageUrl ? 'md:w-1/2' : 'w-full'}`}>
                <p className="text-xl mb-4">{slide.content}</p>
              </div>
            </div>
          )}
          
          {slide.type === 'content' && (
            <div className="content-slide">
              {slide.isHtml ? (
                <div 
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: slide.content }}
                />
              ) : (
                <div className="prose max-w-none">
                  <p className="text-lg">{slide.content}</p>
                </div>
              )}
            </div>
          )}
          
          {slide.type === 'vocabulary' && (
            <div className="vocabulary-slide">
              <p className="text-lg mb-4">{slide.content}</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {slide.vocabulary?.map((item, idx) => (
                  <div key={idx} className="vocab-item bg-white p-4 rounded-lg shadow">
                    {renderVocabularyImage(item)}
                    <div className="font-semibold text-lg text-primary">{item.word || item.term}</div>
                    <div className="text-gray-700">{item.definition}</div>
                    {item.usage && (
                      <div className="text-sm italic text-gray-600 mt-2">"{item.usage}"</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {slide.type === 'grammar' && (
            <div className="grammar-slide">
              <p className="text-lg mb-4">{slide.content}</p>
              <div className="bg-white p-5 rounded-lg shadow-sm">
                <div className="grammar-rule text-lg font-medium text-primary mb-3">
                  {slide.grammarPoint?.rule}
                </div>
                <div className="grammar-example p-3 bg-gray-50 rounded border-l-4 border-primary">
                  <p className="italic">{slide.grammarPoint?.example}</p>
                </div>
              </div>
            </div>
          )}
          
          {slide.type === 'examples' && (
            <div className="examples-slide">
              <p className="text-lg mb-4">{slide.content}</p>
              <div className="space-y-3">
                {slide.examples?.map((example, idx) => (
                  <div key={idx} className="example-item p-3 bg-white rounded-lg shadow-sm border-l-4 border-secondary">
                    {example}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {slide.type === 'audio' && (
            <div className="audio-slide flex flex-col items-center">
              <p className="text-lg mb-4">{slide.content}</p>
              <div className="bg-white p-6 rounded-lg shadow-sm w-full max-w-md">
                <audio controls className="w-full mt-3">
                  <source src={slide.audioUrl} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              </div>
            </div>
          )}
          
          {slide.type === 'video' && (
            <div className="video-slide">
              <p className="text-lg mb-4">{slide.content}</p>
              <div className="relative pt-[56.25%]">
                {slide.videoUrl && (
                  <iframe 
                    src={slide.videoUrl} 
                    title="Lesson video" 
                    className="absolute top-0 left-0 w-full h-full rounded-lg"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                )}
              </div>
            </div>
          )}
          
          {/* Show instructor notes only for teachers */}
          {isTeacher && slide.notes && (
            <div className="instructor-notes mt-auto pt-4 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-500">Instructor Notes:</h4>
              <p className="text-sm text-gray-600 italic">{slide.notes}</p>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  // Slide navigation controls
  const renderSlideControls = () => {
    return (
      <div className="slide-controls flex justify-between items-center py-4">
        <button
          onClick={goToPrevSlide}
          disabled={currentSlideIndex === 0}
          className={`p-2 rounded-full ${currentSlideIndex === 0 ? 'text-gray-400 cursor-not-allowed' : 'text-primary hover:bg-gray-100'}`}
          aria-label="Previous slide"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <div className="slide-indicator flex space-x-1">
          {lessonSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToSlide(idx)}
              className={`h-2 rounded-full transition-all ${currentSlideIndex === idx ? 'w-4 bg-primary' : 'w-2 bg-gray-300'}`}
              aria-label={`Go to slide ${idx + 1}`}
            ></button>
          ))}
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={toggleFullscreen}
            className="p-2 text-primary rounded-full hover:bg-gray-100"
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isFullscreen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4.5M9 9H4.5M15 9h4.5M15 9V4.5M9 15v4.5M9 15H4.5M15 15h4.5M15 15v4.5" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
              </svg>
            )}
          </button>
          
          <button
            onClick={goToNextSlide}
            disabled={currentSlideIndex === lessonSlides.length - 1}
            className={`p-2 rounded-full ${currentSlideIndex === lessonSlides.length - 1 ? 'text-gray-400 cursor-not-allowed' : 'text-primary hover:bg-gray-100'}`}
            aria-label="Next slide"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    );
  };
  
  // Slide thumbnails for quick navigation
  const renderSlideThumbnails = () => {
    return (
      <div className="slide-thumbnails mt-8">
        <h3 className="text-lg font-medium mb-3">All Slides</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {lessonSlides.map((slide, idx) => (
            <button
              key={idx}
              onClick={() => goToSlide(idx)}
              className={`slide-thumbnail p-2 rounded-lg border ${currentSlideIndex === idx ? 'border-primary bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
            >
              <div className="h-16 flex items-center justify-center">
                <span className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-sm">
                  {idx + 1}
                </span>
              </div>
              <div className="text-xs text-center truncate mt-1">{slide.title}</div>
            </button>
          ))}
        </div>
      </div>
    );
  };

  // Generate learning objectives based on lesson title and CEFR level
  const generateObjectives = (title: string, level: string): string[] => {
    // Base objectives depending on the lesson topic
    let objectives: string[] = [];
    
    // Extract topic keywords from title
    const titleLower = title.toLowerCase();
    
    if (titleLower.includes('food') || titleLower.includes('restaurant')) {
      objectives = [
        'Order food in a restaurant using appropriate phrases',
        'Describe different types of food and cooking methods',
        'Express preferences about food and dining experiences',
        'Understand restaurant menus and interact with serving staff'
      ];
    } else if (titleLower.includes('travel') || titleLower.includes('transport')) {
      objectives = [
        'Ask for and give directions to different places',
        'Purchase tickets for various modes of transportation',
        'Describe travel experiences and preferences',
        'Plan a trip and discuss accommodation options'
      ];
    } else if (titleLower.includes('family') || titleLower.includes('relationship')) {
      objectives = [
        'Describe family members and relationships',
        'Discuss family traditions and dynamics',
        'Talk about personal relationships and social connections',
        'Express emotions and opinions about family matters'
      ];
    } else {
      // Default objectives for any other topic
      objectives = [
        `Understand and use vocabulary related to ${title}`,
        'Engage in simple conversations about the topic',
        'Comprehend key information in authentic materials',
        'Express opinions and preferences on the subject'
      ];
    }
    
    // Adjust complexity based on CEFR level
    if (level.startsWith('A1')) {
      objectives = objectives.map(obj => `${obj} using basic phrases and vocabulary`);
    } else if (level.startsWith('A2')) {
      objectives = objectives.map(obj => `${obj} using simple structures and common expressions`);
    } else if (level.startsWith('B1')) {
      objectives = objectives.map(obj => `${obj} with reasonable fluency and some detail`);
    } else if (level.startsWith('B2')) {
      objectives = objectives.map(obj => `${obj} with clarity, detail and appropriate justification`);
    } else if (level.startsWith('C1') || level.startsWith('C2')) {
      objectives = objectives.map(obj => `${obj} with precision, nuance and cultural awareness`);
    }
    
    return objectives;
  };
  
  // Generate CEFR criteria based on level
  const generateCefrCriteria = (level: string): string[] => {
    switch(level) {
      case 'A1':
        return [
          'Can understand and use familiar everyday expressions and very basic phrases',
          'Can introduce themselves and others and ask/answer questions about personal details',
          'Can interact in a simple way provided the other person talks slowly and clearly'
        ];
      case 'A2':
        return [
          'Can understand sentences and frequently used expressions related to areas of immediate relevance',
          'Can communicate in simple and routine tasks requiring a direct exchange of information',
          'Can describe aspects of their background, immediate environment and matters of immediate need'
        ];
      case 'B1':
        return [
          'Can understand the main points of clear standard input on familiar matters regularly encountered',
          'Can deal with most situations likely to arise while traveling in an area where the language is spoken',
          'Can produce simple connected text on topics of personal interest',
          'Can describe experiences, events, dreams, and ambitions and briefly give reasons for opinions'
        ];
      case 'B2':
        return [
          'Can understand the main ideas of complex text on both concrete and abstract topics',
          'Can interact with a degree of fluency and spontaneity that makes regular interaction with native speakers possible',
          'Can produce clear, detailed text on a wide range of subjects and explain a viewpoint giving advantages and disadvantages'
        ];
      case 'C1':
        return [
          'Can understand a wide range of demanding, longer texts, and recognize implicit meaning',
          'Can express ideas fluently and spontaneously without obvious searching for expressions',
          'Can use language flexibly and effectively for social, academic and professional purposes',
          'Can produce clear, well-structured, detailed text on complex subjects'
        ];
      case 'C2':
        return [
          'Can understand with ease virtually everything heard or read',
          'Can summarize information from different spoken and written sources',
          'Can express themselves spontaneously, very fluently and precisely, differentiating finer shades of meaning'
        ];
      default:
        return [
          'Can understand and use familiar everyday expressions',
          'Can interact in simple conversations on familiar topics',
          'Can describe aspects of personal background and immediate environment'
        ];
    }
  };

  // Render the lesson content with HTML support
  const renderLessonContent = (content: string) => {
    // Check if content contains HTML tags
    const containsHtml = /<[a-z][\s\S]*>/i.test(content);
    
    if (containsHtml) {
      return (
        <div 
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: content }} 
        />
      );
    } else {
      return <p className="prose max-w-none">{content}</p>;
    }
  };

  // Show loading state
  if (loading || !lesson) {
    return (
      <div className="min-h-screen flex flex-col">
        <main id="main-content" className="flex-grow flex items-center justify-center">
          <div className="loader">Loading...</div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main id="main-content" className="flex-grow container mx-auto px-4 py-8">
        {!slideViewMode ? (
          <div className="lesson-container">
            {/* Lesson header with action buttons */}
            <div className="lesson-header mb-6 bg-white rounded-lg shadow-lg p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-blue-900 mb-2">{lesson?.title}</h1>
                  <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                    <span>Level: {lesson?.level}</span>
                    {lesson?.difficulty && <span>• Difficulty: {lesson?.difficulty}</span>}
                  </div>
                </div>
                
                {/* Action buttons */}
                <div className="flex flex-wrap gap-3">
                  {/* Button to enter slide view */}
                  <button
                    onClick={toggleSlideView}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                    aria-label="View as Slides"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 4a3 3 0 00-3 3v6a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H5zm-1 9v-1h5v2H5a1 1 0 01-1-1zm7 1h4a1 1 0 001-1v-1h-5v2zm0-4h5V8h-5v2zM9 8H4v2h5V8z" clipRule="evenodd" />
                    </svg>
                    View as Slides
                  </button>
                  
                  {/* Teacher-only Lesson Plan button */}
                  {isTeacher && (
                    <button
                      onClick={generateLessonPlan}
                      disabled={isGeneratingLessonPlan}
                      className={`bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center ${isGeneratingLessonPlan ? 'opacity-70 cursor-not-allowed' : ''}`}
                      aria-label="Generate lesson plan"
                    >
                      {isGeneratingLessonPlan ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Generating...
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                          </svg>
                          Lesson Plan
                        </>
                      )}
                    </button>
                  )}
                  
                  {/* Share Lesson button */}
                  <button
                    onClick={handleShareLesson}
                    className="bg-secondary text-white px-4 py-2 rounded-lg hover:bg-secondary-dark transition-colors flex items-center"
                    aria-label="Share lesson"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                    </svg>
                    Share Lesson
                  </button>
                  
                  {/* Take Quiz button */}
                  <button
                    onClick={handleStartQuiz}
                    className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
                  >
                    Take Quiz
                  </button>
                </div>
              </div>
            </div>

            {/* Content sections */}
            <div className="lesson-content bg-white rounded-lg shadow-lg p-6">
              {/* Description */}
              <section className="lesson-section mb-8">
                <h2 className="text-2xl font-semibold text-blue-800 mb-3">Description</h2>
                <p className="text-gray-700">{lesson?.description}</p>
              </section>
              
              {/* Content */}
              <section className="lesson-section mb-8">
                <h2 className="text-2xl font-semibold text-blue-800 mb-3">Content</h2>
                {lesson?.content && renderLessonContent(lesson.content)}
              </section>
              
              {/* AI Generated Content Section */}
              <div className="mb-8 border rounded-lg p-4 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-primary">AI-Generated Content</h2>
                  <button
                    onClick={generateAIContent}
                    disabled={isGeneratingAI}
                    className={`px-4 py-2 rounded-lg text-white ${isGeneratingAI ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'} transition-colors flex items-center`}
                  >
                    {isGeneratingAI ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Generating...
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                        </svg>
                        Refresh AI Content
                      </>
                    )}
                  </button>
                </div>
                
                {lesson.aiContent && showAIContent ? (
                  <div className="space-y-6">
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <h3 className="text-lg font-medium text-indigo-700 mb-2">Practice Sentences</h3>
                      <div className="space-y-2">
                        {lesson.aiContent.sentences.map((sentence, index) => (
                          <div key={index} className="p-2 bg-gray-50 rounded border-l-4 border-indigo-300">
                            {sentence}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <h3 className="text-lg font-medium text-indigo-700 mb-2">Vocabulary</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {lesson.aiContent.vocab.map((item, index) => (
                          <div key={index} className="p-3 bg-gray-50 rounded border border-indigo-100">
                            <div className="font-semibold text-indigo-800">{item.word}</div>
                            <div className="text-gray-700 text-sm">{item.definition}</div>
                            <div className="text-gray-600 text-sm italic mt-1">"{item.usage}"</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <h3 className="text-lg font-medium text-indigo-700 mb-2">Grammar Focus</h3>
                      <div className="p-3 bg-gray-50 rounded">
                        <div className="font-medium mb-1">{lesson.aiContent.grammar.rule}</div>
                        <div className="text-gray-700 italic">Example: {lesson.aiContent.grammar.example}</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">
                      {isGeneratingAI ? 
                        'Generating personalized content based on your proficiency level...' : 
                        'Click the button above to generate personalized AI content for this lesson.'}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <h2 className="text-xl font-semibold mb-2">Vocabulary</h2>
                  <ul className="list-disc pl-5 space-y-1">
                    {lesson.vocabulary?.map((word, index) => (
                      <li key={index} className="text-gray-700">{word.term}: {word.definition}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-2">Grammar Points</h2>
                  <ul className="list-disc pl-5 space-y-1">
                    {lesson.grammar?.map((point, index) => (
                      <li key={index} className="text-gray-700">{point.question}</li>
                    ))}
                  </ul>
                </div>
              </div>
              
              {userProgress.length > 0 && (
                <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                  <h2 className="text-xl font-semibold mb-2">Your Progress</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {userProgress.map((progress) => (
                      <div key={progress.id} className="bg-white p-3 rounded shadow">
                        <div className="text-lg font-semibold text-primary">{progress.score}%</div>
                        <div className="text-xs text-gray-500">
                          {new Date(progress.timestamp).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className={`slide-view-container ${isFullscreen ? 'fullscreen' : ''}`} ref={slideContainerRef}>
            <div className="flex justify-between items-center p-4 bg-gray-50 border-b">
              <div>
                <h1 className="text-xl font-bold text-primary">{lesson.title}</h1>
                <p className="text-sm text-gray-600">Level: {lesson.level} • Slide {currentSlideIndex + 1} of {lessonSlides.length}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={toggleSlideView}
                  className="text-gray-600 hover:text-gray-800 p-2 rounded-full hover:bg-gray-100"
                  aria-label="Exit slide view"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-8 min-h-[60vh]">
              {lessonSlides.length > 0 ? renderSlide(lessonSlides[currentSlideIndex]) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">No slides available for this lesson.</p>
                </div>
              )}
            </div>
            
            {lessonSlides.length > 0 && renderSlideControls()}
            
            {!isFullscreen && lessonSlides.length > 0 && renderSlideThumbnails()}
          </div>
        )}
      </main>
      <Footer />
      {showToast && <CustomToast message={toastMessage} onClose={() => setShowToast(false)} />}
      
      {/* Lesson Plan Modal for Teachers */}
      {showLessonPlan && lessonPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-primary">{lessonPlan.title}</h2>
              <button 
                onClick={closeLessonPlan}
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
                aria-label="Close lesson plan"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              {/* Lesson Plan Metadata */}
              <div className="flex flex-wrap mb-6 gap-4">
                <div className="bg-blue-50 px-4 py-2 rounded-lg">
                  <span className="text-sm text-blue-700 font-medium">Level:</span>
                  <span className="ml-2 text-blue-900">{lessonPlan.level}</span>
                </div>
                <div className="bg-blue-50 px-4 py-2 rounded-lg">
                  <span className="text-sm text-blue-700 font-medium">Duration:</span>
                  <span className="ml-2 text-blue-900">{lessonPlan.duration}</span>
                </div>
              </div>
              
              {/* Learning Objectives */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Learning Objectives</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {lessonPlan.objectives.map((objective: string, index: number) => (
                    <li key={index} className="text-gray-700">{objective}</li>
                  ))}
                </ul>
              </div>
              
              {/* Materials */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Materials</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {lessonPlan.materials.map((material: string, index: number) => (
                    <li key={index} className="text-gray-700">{material}</li>
                  ))}
                </ul>
              </div>
              
              {/* Warm-up */}
              <div className="mb-8 p-4 bg-yellow-50 rounded-lg">
                <h3 className="text-xl font-semibold text-yellow-800 mb-2">{lessonPlan.warmUp.title}</h3>
                <p className="text-gray-700 mb-3">{lessonPlan.warmUp.description}</p>
                <div className="bg-white p-3 rounded border border-yellow-200">
                  <h4 className="font-medium text-yellow-800 mb-2">Discussion Questions:</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    {lessonPlan.warmUp.questions.map((question: string, index: number) => (
                      <li key={index} className="text-gray-700">{question}</li>
                    ))}
                  </ul>
                </div>
              </div>
              
              {/* Presentation */}
              <div className="mb-8 p-4 bg-blue-50 rounded-lg">
                <h3 className="text-xl font-semibold text-blue-800 mb-2">{lessonPlan.presentation.title}</h3>
                <p className="text-gray-700 mb-3">{lessonPlan.presentation.description}</p>
                <div className="bg-white p-3 rounded border border-blue-200 mb-4">
                  <h4 className="font-medium text-blue-800 mb-2">Teaching Steps:</h4>
                  <ol className="list-decimal pl-5 space-y-1">
                    {lessonPlan.presentation.steps.map((step: string, index: number) => (
                      <li key={index} className="text-gray-700">{step}</li>
                    ))}
                  </ol>
                </div>
                
                <div className="bg-white p-3 rounded border border-blue-200">
                  <h4 className="font-medium text-blue-800 mb-2">Key Vocabulary:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {lessonPlan.presentation.vocabulary.map((vocab: any, index: number) => (
                      <div key={index} className="p-2 border-b border-blue-100">
                        <div className="font-medium">{vocab.word}</div>
                        <div className="text-sm text-gray-600">{vocab.definition}</div>
                        <div className="text-sm text-gray-500 italic mt-1">{vocab.exampleSentence}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Guided Practice */}
              <div className="mb-8 p-4 bg-green-50 rounded-lg">
                <h3 className="text-xl font-semibold text-green-800 mb-2">{lessonPlan.practice.title}</h3>
                <p className="text-gray-700 mb-3">{lessonPlan.practice.description}</p>
                <div className="bg-white p-3 rounded border border-green-200">
                  <h4 className="font-medium text-green-800 mb-2">Activities:</h4>
                  <div className="space-y-3">
                    {lessonPlan.practice.activities.map((activity: any, index: number) => (
                      <div key={index} className="p-2 border-l-4 border-green-300 pl-3">
                        <div className="font-medium">{activity.name}</div>
                        <div className="text-sm text-gray-600">{activity.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Free Production */}
              <div className="mb-8 p-4 bg-purple-50 rounded-lg">
                <h3 className="text-xl font-semibold text-purple-800 mb-2">{lessonPlan.production.title}</h3>
                <p className="text-gray-700 mb-3">{lessonPlan.production.description}</p>
                <div className="bg-white p-3 rounded border border-purple-200">
                  <h4 className="font-medium text-purple-800 mb-2">Activities:</h4>
                  <div className="space-y-3">
                    {lessonPlan.production.activities.map((activity: any, index: number) => (
                      <div key={index} className="p-2 border-l-4 border-purple-300 pl-3">
                        <div className="font-medium">{activity.name}</div>
                        <div className="text-sm text-gray-600">{activity.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Assessment and Homework */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="p-4 bg-red-50 rounded-lg">
                  <h3 className="text-xl font-semibold text-red-800 mb-2">{lessonPlan.assessment.title}</h3>
                  <p className="text-gray-700 mb-3">{lessonPlan.assessment.description}</p>
                  <ul className="list-disc pl-5 space-y-1">
                    {lessonPlan.assessment.methods.map((method: string, index: number) => (
                      <li key={index} className="text-gray-700">{method}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="p-4 bg-indigo-50 rounded-lg">
                  <h3 className="text-xl font-semibold text-indigo-800 mb-2">{lessonPlan.homework.title}</h3>
                  <p className="text-gray-700 mb-3">{lessonPlan.homework.description}</p>
                  <ul className="list-disc pl-5 space-y-1">
                    {lessonPlan.homework.assignments.map((assignment: string, index: number) => (
                      <li key={index} className="text-gray-700">{assignment}</li>
                    ))}
                  </ul>
                </div>
              </div>
              
              {/* Differentiation */}
              <div className="mb-8 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-800 mb-3">{lessonPlan.differentiation.title}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">For Struggling Students:</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {lessonPlan.differentiation.forStrugglingStudents.map((strategy: string, index: number) => (
                        <li key={index} className="text-gray-600">{strategy}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">For Advanced Students:</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {lessonPlan.differentiation.forAdvancedStudents.map((strategy: string, index: number) => (
                        <li key={index} className="text-gray-600">{strategy}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              
              {/* Teacher Notes */}
              <div className="p-4 bg-gray-100 rounded-lg border border-gray-300">
                <h3 className="text-xl font-semibold text-gray-800 mb-3">{lessonPlan.notes.title}</h3>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-gray-700">Cultural Considerations:</h4>
                    <p className="text-gray-600">{lessonPlan.notes.cultural}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700">Common Errors:</h4>
                    <p className="text-gray-600">{lessonPlan.notes.common}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700">Possible Extensions:</h4>
                    <p className="text-gray-600">{lessonPlan.notes.extensions}</p>
                  </div>
                </div>
              </div>
              
              {/* Print button */}
              <div className="mt-6 text-center">
                <button 
                  onClick={() => window.print()}
                  className="bg-gray-800 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors inline-flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
                  </svg>
                  Print Lesson Plan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 