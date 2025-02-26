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
        type: 'fill',
        question: '_____ means "Hello" in a casual setting.',
        answer: 'Hi',
        explanation: 'Hi is a casual greeting commonly used in English.'
      },
      {
        id: 3,
        type: 'match',
        question: 'Match the greeting with its appropriate context:',
        pairs: [
          { term: 'Good morning', definition: 'Used before noon' },
          { term: 'Good afternoon', definition: 'Used from noon to evening' },
          { term: 'Good evening', definition: 'Used after sunset' },
          { term: 'Good night', definition: 'Used when parting at night' }
        ]
      }
    ]
  },
  {
    id: 'quiz2',
    lessonId: 'lesson2',
    title: 'Common Phrases Quiz',
    description: 'Test your knowledge of common everyday phrases',
    questions: [
      {
        id: 1,
        type: 'multiple-choice',
        question: 'Which phrase would you use to ask someone to repeat something?',
        options: [
          'I don\'t understand.',
          'Could you repeat that, please?',
          'Nice to meet you.',
          'See you later.'
        ],
        correctAnswer: 1
      },
      {
        id: 2,
        type: 'fill',
        question: 'To express gratitude, you can say "_____".',
        answer: 'Thank you',
        explanation: '"Thank you" is the most common way to express gratitude in English.'
      },
      {
        id: 3,
        type: 'match',
        question: 'Match these phrases with their meanings:',
        pairs: [
          { term: 'Excuse me', definition: 'Getting attention politely' },
          { term: 'I\'m sorry', definition: 'Apologizing' },
          { term: 'Congratulations', definition: 'Celebrating achievement' },
          { term: 'Take care', definition: 'Saying goodbye with concern' }
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
    const quizSnapshot = await getDocs(quizzesCollection);
    
    if (quizSnapshot.empty) {
      console.log('No quizzes found. Adding sample quizzes...');
      
      // Add each sample quiz
      for (const quiz of sampleQuizzes) {
        const quizRef = doc(db, 'quizzes', quiz.id);
        await setDoc(quizRef, quiz);
        console.log(`Added quiz: ${quiz.title}`);
      }
      
      console.log('Sample quizzes added successfully!');
      return true;
    } else {
      console.log('Quizzes already exist in the database.');
      return false;
    }
  } catch (error) {
    console.error('Error adding sample quizzes:', error);
    return false;
  }
}

// Export the sample quizzes for testing
export { sampleQuizzes }; 