import { collection, getDocs, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Quiz, QuizQuestion } from '../types';

// Fetch all quizzes
export async function getQuizzes(): Promise<Quiz[]> {
  try {
    const quizzesCollection = collection(db, 'quizzes');
    const quizSnapshot = await getDocs(quizzesCollection);
    const quizList = quizSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data
      } as Quiz;
    });
    return quizList;
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    return [];
  }
}

// Fetch a single quiz by ID
export async function getQuizById(id: string): Promise<Quiz | null> {
  try {
    const quizDoc = doc(db, 'quizzes', id);
    const quizSnapshot = await getDoc(quizDoc);
    
    if (quizSnapshot.exists()) {
      const data = quizSnapshot.data();
      return {
        id: quizSnapshot.id,
        ...data
      } as Quiz;
    } else {
      console.log(`No quiz found with ID: ${id}`);
      return null;
    }
  } catch (error) {
    console.error(`Error fetching quiz with ID ${id}:`, error);
    return null;
  }
}

// Fetch quiz for a specific lesson
export async function getQuizByLessonId(lessonId: string): Promise<Quiz | null> {
  try {
    // Query quizzes where lessonId matches
    const quizzesCollection = collection(db, 'quizzes');
    const quizSnapshot = await getDocs(quizzesCollection);
    
    const quizzes = quizSnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as Quiz))
      .filter(quiz => quiz.lessonId === lessonId);
    
    if (quizzes.length > 0) {
      return quizzes[0]; // Return the first matching quiz
    } else {
      console.log(`No quiz found for lesson ID: ${lessonId}`);
      return null;
    }
  } catch (error) {
    console.error(`Error fetching quiz for lesson ID ${lessonId}:`, error);
    return null;
  }
}

// Create or update a quiz
export async function saveQuiz(quiz: Quiz): Promise<boolean> {
  try {
    const quizRef = doc(db, 'quizzes', quiz.id);
    await setDoc(quizRef, quiz, { merge: true });
    return true;
  } catch (error) {
    console.error('Error saving quiz:', error);
    return false;
  }
} 