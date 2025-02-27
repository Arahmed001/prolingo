import { collection, getDocs, doc, getDoc, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Lesson } from '../types';

// Sample lessons data
const sampleLessons: Omit<Lesson, 'id'>[] = [
  {
    title: 'Greetings',
    level: 'A1',
    description: 'Learn common greetings and introductions in English.',
    imageUrl: '',
    duration: '30 minutes',
    category: 'foundational',
    content: 'In this lesson, you will learn how to greet people in English and introduce yourself.',
    vocabulary: [
      { term: 'Hello', word: 'Hello', definition: 'A common greeting' },
      { term: 'Hi', word: 'Hi', definition: 'An informal greeting' },
      { term: 'Good morning', word: 'Good morning', definition: 'A greeting used in the morning' },
      { term: 'Good afternoon', word: 'Good afternoon', definition: 'A greeting used in the afternoon' },
      { term: 'Good evening', word: 'Good evening', definition: 'A greeting used in the evening' }
    ]
  },
  {
    title: 'Numbers',
    level: 'A1',
    description: 'Learn to count and use numbers in English.',
    imageUrl: '',
    duration: '45 minutes',
    category: 'foundational',
    content: 'This lesson covers numbers from 1-100, ordinal numbers, and basic math vocabulary.',
    vocabulary: [
      { term: 'One', word: 'One', definition: 'The number 1' },
      { term: 'Two', word: 'Two', definition: 'The number 2' },
      { term: 'Three', word: 'Three', definition: 'The number 3' },
      { term: 'First', word: 'First', definition: 'Ordinal form of one' },
      { term: 'Second', word: 'Second', definition: 'Ordinal form of two' }
    ]
  },
  {
    title: 'Colours',
    level: 'A1',
    description: 'Learn the names of common colours in English.',
    imageUrl: '',
    duration: '30 minutes',
    category: 'reading',
    content: 'This lesson introduces the names of common colours and how to describe objects using colours.',
    vocabulary: [
      { term: 'Red', word: 'Red', definition: 'The colour of blood or a tomato' },
      { term: 'Blue', word: 'Blue', definition: 'The colour of the sky or ocean' },
      { term: 'Green', word: 'Green', definition: 'The colour of grass or leaves' },
      { term: 'Yellow', word: 'Yellow', definition: 'The colour of the sun or a banana' },
      { term: 'Black', word: 'Black', definition: 'The darkest colour, absence of light' }
    ]
  },
  {
    title: 'Days of the Week',
    level: 'A1',
    description: 'Learn the names of the days of the week in English.',
    imageUrl: '',
    duration: '30 minutes',
    category: 'speaking',
    content: 'This lesson covers the days of the week, their pronunciation, and how to talk about your weekly schedule.',
    vocabulary: [
      { term: 'Monday', word: 'Monday', definition: 'The first day of the work week' },
      { term: 'Tuesday', word: 'Tuesday', definition: 'The second day of the work week' },
      { term: 'Wednesday', word: 'Wednesday', definition: 'The third day of the work week' },
      { term: 'Thursday', word: 'Thursday', definition: 'The fourth day of the work week' },
      { term: 'Friday', word: 'Friday', definition: 'The fifth day of the work week' }
    ]
  },
  {
    title: 'Basic Phrases',
    level: 'A1',
    description: 'Learn essential phrases for everyday conversations.',
    imageUrl: '',
    duration: '45 minutes',
    category: 'curriculum',
    content: 'This lesson introduces common phrases used in everyday situations like shopping, ordering food, and asking for directions.',
    vocabulary: [
      { term: 'Excuse me', word: 'Excuse me', definition: 'Used to get someone\'s attention politely' },
      { term: 'Thank you', word: 'Thank you', definition: 'Used to express gratitude' },
      { term: 'You\'re welcome', word: 'You\'re welcome', definition: 'Response to thank you' },
      { term: 'I\'m sorry', word: 'I\'m sorry', definition: 'Used to apologize' },
      { term: 'Please', word: 'Please', definition: 'Used when asking for something politely' }
    ]
  }
];

// Fetch all lessons
export async function getLessons(): Promise<Lesson[]> {
  try {
    const lessonsCollection = collection(db, 'lessons');
    const lessonSnapshot = await getDocs(lessonsCollection);
    
    // If no lessons exist, add sample lessons
    if (lessonSnapshot.empty) {
      console.log('No lessons found. Adding sample lessons...');
      await addSampleLessons();
      
      // Fetch lessons again after adding samples
      const updatedSnapshot = await getDocs(lessonsCollection);
      const lessonList = updatedSnapshot.docs.map(doc => {
        return {
          id: doc.id,
          ...doc.data()
        } as Lesson;
      });
      return lessonList;
    }
    
    const lessonList = lessonSnapshot.docs.map(doc => {
      return {
        id: doc.id,
        ...doc.data()
      } as Lesson;
    });
    return lessonList;
  } catch (error) {
    console.error('Error fetching lessons:', error);
    return [];
  }
}

// Add sample lessons to the database
async function addSampleLessons(): Promise<void> {
  try {
    const lessonsCollection = collection(db, 'lessons');
    
    for (const lesson of sampleLessons) {
      await addDoc(lessonsCollection, lesson);
      console.log(`Added sample lesson: ${lesson.title}`);
    }
    
    console.log('Successfully added sample lessons');
  } catch (error) {
    console.error('Error adding sample lessons:', error);
  }
}

// Fetch a single lesson by ID
export async function getLessonById(id: string): Promise<Lesson | null> {
  try {
    const lessonDoc = doc(db, 'lessons', id);
    const lessonSnapshot = await getDoc(lessonDoc);
    
    if (lessonSnapshot.exists()) {
      return {
        id: lessonSnapshot.id,
        ...lessonSnapshot.data()
      } as Lesson;
    } else {
      console.log(`No lesson found with ID: ${id}`);
      return null;
    }
  } catch (error) {
    console.error(`Error fetching lesson with ID ${id}:`, error);
    return null;
  }
} 