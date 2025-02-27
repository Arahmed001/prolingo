import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Quiz } from '../types';

// Sample quiz data with various question types
const sampleQuizzes: Quiz[] = [
  {
    id: 'quiz1',
    lessonId: 'lesson1',
    title: 'Basic Greetings Quiz',
    description: 'Test your knowledge of basic greetings',
    questions: [
      {
        id: 1,
        type: 'multiple-choice',
        question: 'Which of the following is a formal greeting?',
        options: ['Hey!', 'Hello, nice to meet you.', 'What\'s up?', 'Yo!'],
        correctAnswer: 1
      },
      {
        id: 2,
        type: 'true-false',
        question: 'It is appropriate to use "Hey there!" in a formal business email.',
        correctAnswer: false
      },
      {
        id: 3,
        type: 'fill-in-blank',
        question: 'The phrase "_____ to meet you" is commonly used when meeting someone for the first time.',
        correctAnswer: 'nice'
      }
    ]
  },
  {
    id: 'quiz2',
    lessonId: 'lesson2',
    title: 'Common Phrases Quiz',
    description: 'Test your knowledge of everyday phrases',
    questions: [
      {
        id: 1,
        type: 'multiple-choice',
        question: 'Which phrase would you use to ask someone to repeat something?',
        options: ['Excuse me?', 'I don\'t care.', 'That\'s fine.', 'See you later.'],
        correctAnswer: 0
      },
      {
        id: 2,
        type: 'matching',
        question: 'Match the phrases with their appropriate contexts:',
        options: [
          { text: 'Cheers!', match: 'Toasting at a celebration' },
          { text: 'Bless you!', match: 'After someone sneezes' },
          { text: 'Take care!', match: 'Saying goodbye' }
        ]
      }
    ]
  }
];

// Function to add sample quizzes to Firestore
export async function addSampleQuizzes() {
  try {
    // Check if quizzes already exist
    const quizzesCollection = collection(db, 'quizzes');
    const quizzesSnapshot = await getDocs(quizzesCollection);
    
    if (!quizzesSnapshot.empty) {
      console.log('Quizzes already exist in the database.');
      return false;
    }
    
    // Add each quiz to Firestore
    for (const quiz of sampleQuizzes) {
      await setDoc(doc(db, 'quizzes', quiz.id), quiz);
      console.log(`Added quiz: ${quiz.title}`);
    }
    
    console.log('Sample quizzes added successfully!');
    return true;
  } catch (error) {
    console.error('Error adding sample quizzes:', error);
    return false;
  }
}

// Export the sample quizzes for use in other files
export { sampleQuizzes }; 