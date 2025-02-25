import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Lesson } from '../types';

// Fetch all lessons
export async function getLessons(): Promise<Lesson[]> {
  try {
    const lessonsCollection = collection(db, 'lessons');
    const lessonSnapshot = await getDocs(lessonsCollection);
    const lessonList = lessonSnapshot.docs.map(doc => doc.data() as Lesson);
    return lessonList;
  } catch (error) {
    console.error('Error fetching lessons:', error);
    return [];
  }
}

// Fetch a single lesson by ID
export async function getLessonById(id: string): Promise<Lesson | null> {
  try {
    const lessonDoc = doc(db, 'lessons', id);
    const lessonSnapshot = await getDoc(lessonDoc);
    
    if (lessonSnapshot.exists()) {
      return lessonSnapshot.data() as Lesson;
    } else {
      console.log(`No lesson found with ID: ${id}`);
      return null;
    }
  } catch (error) {
    console.error(`Error fetching lesson with ID ${id}:`, error);
    return null;
  }
} 