import OpenAI from 'openai';
import { Lesson, VocabularyItem, GrammarExercise } from '../types';
import { collection, addDoc, updateDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import axios from 'axios';

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_ORGANIZATION,
});

// Language levels
const LANGUAGE_LEVELS = ['Beginner', 'Elementary', 'Intermediate', 'Advanced', 'Proficient'];

/**
 * Generate a complete lesson using AI
 */
export async function generateLesson(topic: string, level: string): Promise<Lesson | null> {
  try {
    // Validate level
    if (!LANGUAGE_LEVELS.includes(level)) {
      throw new Error(`Invalid language level: ${level}. Must be one of: ${LANGUAGE_LEVELS.join(', ')}`);
    }

    // Generate lesson content
    const lessonContent = await generateLessonContent(topic, level);
    
    // Generate vocabulary
    const vocabulary = await generateVocabulary(topic, level);
    
    // Generate grammar exercises
    const grammar = await generateGrammarExercises(topic, level);
    
    // Generate or select an audio URL
    const audioUrl = await getAudioUrl(topic);
    
    // Generate or select an image URL
    const imageUrl = await getImageUrl(topic);
    
    // Create the lesson object
    const lesson: Lesson = {
      id: generateUniqueId(),
      title: `${topic} - ${level}`,
      level,
      description: lessonContent.description,
      imageUrl,
      duration: determineDuration(level, lessonContent.content.length),
      content: lessonContent.content,
      vocabulary,
      grammar,
      audioUrl
    };
    
    // Save to Firebase
    await saveLessonToFirebase(lesson);
    
    return lesson;
  } catch (error) {
    console.error('Error generating lesson:', error);
    return null;
  }
}

/**
 * Generate lesson content using OpenAI
 */
async function generateLessonContent(topic: string, level: string): Promise<{ content: string, description: string }> {
  const prompt = `
    Create an ESL lesson about "${topic}" for ${level} level students.
    The lesson should include:
    1. A brief introduction to the topic
    2. Key concepts and explanations
    3. Examples of usage
    4. Practice scenarios
    
    Also provide a short description (1-2 sentences) summarizing the lesson.
    
    Format the response as HTML that can be directly inserted into a webpage.
    Return the result as a JSON object with two properties:
    - content: The HTML formatted lesson content
    - description: A brief description of the lesson (max 150 characters)
  `;

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: 0.7,
  });

  const result = JSON.parse(response.choices[0].message.content || '{}');
  return {
    content: result.content || '',
    description: result.description || ''
  };
}

/**
 * Generate vocabulary items using OpenAI
 */
async function generateVocabulary(topic: string, level: string): Promise<VocabularyItem[]> {
  const prompt = `
    Generate 5-10 vocabulary words related to "${topic}" appropriate for ${level} level ESL students.
    For each word, provide a clear, simple definition.
    
    Return the result as a JSON array of objects, each with:
    - word: The vocabulary word
    - definition: A simple definition suitable for ${level} level students
  `;

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: 0.7,
  });

  const result = JSON.parse(response.choices[0].message.content || '{}');
  return result.vocabulary || [];
}

/**
 * Generate grammar exercises using OpenAI
 */
async function generateGrammarExercises(topic: string, level: string): Promise<GrammarExercise[]> {
  const prompt = `
    Create 3-5 fill-in-the-blank grammar exercises related to "${topic}" for ${level} level ESL students.
    Each exercise should have a clear question and a single word answer.
    
    Return the result as a JSON array of objects, each with:
    - question: The fill-in-the-blank question (e.g., "I ___ to the store yesterday.")
    - answer: The correct answer (e.g., "went")
  `;

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: 0.7,
  });

  const result = JSON.parse(response.choices[0].message.content || '{}');
  return result.exercises || [];
}

/**
 * Get or generate an audio URL for pronunciation
 */
async function getAudioUrl(topic: string): Promise<string> {
  // For now, return a placeholder URL
  // In production, this would integrate with ElevenLabs or another TTS service
  return 'https://freesound.org/data/previews/66/66717_9316-lq.mp3';
}

/**
 * Get or generate an image URL for the lesson
 */
async function getImageUrl(topic: string): Promise<string> {
  // For now, return a placeholder URL
  // In production, this would integrate with Stability AI or another image generation service
  return 'https://via.placeholder.com/800x600?text=Lesson+Image';
}

/**
 * Determine the estimated duration of a lesson based on content length and level
 */
function determineDuration(level: string, contentLength: number): string {
  // Simple algorithm to estimate duration
  const baseMinutes = 10;
  const wordsPerMinute = level === 'Beginner' ? 100 : 
                         level === 'Elementary' ? 150 :
                         level === 'Intermediate' ? 200 :
                         level === 'Advanced' ? 250 : 300;
  
  const estimatedMinutes = baseMinutes + Math.ceil(contentLength / wordsPerMinute);
  
  // Round to nearest 5 minutes
  const roundedMinutes = Math.ceil(estimatedMinutes / 5) * 5;
  
  return `${roundedMinutes} min`;
}

/**
 * Generate a unique ID for a new lesson
 */
function generateUniqueId(): string {
  return `lesson_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
}

/**
 * Save a lesson to Firebase
 */
async function saveLessonToFirebase(lesson: Lesson): Promise<void> {
  try {
    const lessonsCollection = collection(db, 'lessons');
    await addDoc(lessonsCollection, lesson);
    console.log(`Lesson "${lesson.title}" saved to Firebase`);
  } catch (error) {
    console.error('Error saving lesson to Firebase:', error);
    throw error;
  }
}

/**
 * Update an existing lesson with AI-generated content
 */
export async function refreshLessonContent(lessonId: string): Promise<boolean> {
  try {
    // Get the existing lesson
    const lessonDoc = doc(db, 'lessons', lessonId);
    const lessonSnapshot = await getDoc(lessonDoc);
    
    if (!lessonSnapshot.exists()) {
      console.error(`Lesson with ID ${lessonId} not found`);
      return false;
    }
    
    const existingLesson = lessonSnapshot.data() as Lesson;
    
    // Extract topic from title
    const topicMatch = existingLesson.title.match(/^(.*?)\s*-\s*.*$/);
    const topic = topicMatch ? topicMatch[1].trim() : existingLesson.title;
    
    // Generate new content
    const newContent = await generateLessonContent(topic, existingLesson.level);
    const newVocabulary = await generateVocabulary(topic, existingLesson.level);
    const newGrammar = await generateGrammarExercises(topic, existingLesson.level);
    
    // Update the lesson
    await updateDoc(lessonDoc, {
      description: newContent.description,
      content: newContent.content,
      vocabulary: newVocabulary,
      grammar: newGrammar,
      // Keep the same image and audio for consistency
    });
    
    console.log(`Lesson "${existingLesson.title}" refreshed successfully`);
    return true;
  } catch (error) {
    console.error(`Error refreshing lesson ${lessonId}:`, error);
    return false;
  }
}

/**
 * Check if content meets quality standards
 */
export async function validateContent(content: string): Promise<{
  isValid: boolean;
  score: number;
  feedback: string;
}> {
  try {
    const prompt = `
      Evaluate the following ESL lesson content for quality, accuracy, and appropriateness.
      Rate it on a scale from 0 to 1, where 1 is excellent and 0 is poor.
      Provide brief feedback on strengths and areas for improvement.
      
      Content to evaluate:
      ${content.substring(0, 2000)}... (truncated)
      
      Return the result as a JSON object with:
      - score: A number between 0 and 1
      - feedback: Brief feedback (max 200 characters)
    `;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    const score = result.score || 0;
    const threshold = parseFloat(process.env.AI_CONTENT_QUALITY_THRESHOLD || '0.7');
    
    return {
      isValid: score >= threshold,
      score,
      feedback: result.feedback || ''
    };
  } catch (error) {
    console.error('Error validating content:', error);
    return {
      isValid: false,
      score: 0,
      feedback: 'Error during validation process'
    };
  }
} 