import { db } from '../../lib/firebase.js';
import { collection, addDoc } from 'firebase/firestore';

async function setupQuizData() {
  try {
    const quizzesCollection = collection(db, 'quizzes');

    // A1 Level Questions
    await addDoc(quizzesCollection, {
      lessonId: '1',
      type: 'multiple',
      question: 'What does "rain" mean?',
      options: ['Water falling from clouds', 'Bright sunshine', 'Strong wind', 'Heavy snow'],
      answer: 'Water falling from clouds',
      difficulty: 'A1'
    });

    await addDoc(quizzesCollection, {
      lessonId: '1',
      type: 'fill',
      question: 'Complete the sentence: "My name ___ John."',
      answer: 'is',
      difficulty: 'A1'
    });

    await addDoc(quizzesCollection, {
      lessonId: '1',
      type: 'matching',
      question: 'Match the word with its meaning: "Hello"',
      options: ['A greeting', 'A goodbye', 'Thank you', 'Please'],
      answer: 'A greeting',
      difficulty: 'A1'
    });

    // B1 Level Questions
    await addDoc(quizzesCollection, {
      lessonId: '1',
      type: 'multiple',
      question: 'Which sentence uses the present perfect correctly?',
      options: [
        'I have been living here for three years',
        'I am living here for three years',
        'I live here for three years',
        'I was living here for three years'
      ],
      answer: 'I have been living here for three years',
      difficulty: 'B1'
    });

    await addDoc(quizzesCollection, {
      lessonId: '1',
      type: 'fill',
      question: 'Complete with the correct form: "If I ___ (know) the answer, I would tell you."',
      answer: 'knew',
      difficulty: 'B1'
    });

    await addDoc(quizzesCollection, {
      lessonId: '1',
      type: 'matching',
      question: 'Match the phrasal verb: "put up with"',
      options: ['tolerate', 'support', 'establish', 'create'],
      answer: 'tolerate',
      difficulty: 'B1'
    });

    // Add more questions for different lessons
    await addDoc(quizzesCollection, {
      lessonId: '2',
      type: 'multiple',
      question: 'What is the weather like today?',
      options: ['It\'s sunny', 'It\'s raining', 'It\'s snowing', 'It\'s windy'],
      answer: 'It\'s sunny',
      difficulty: 'A1'
    });

    await addDoc(quizzesCollection, {
      lessonId: '2',
      type: 'fill',
      question: 'Complete the sentence: "She ___ to school every day."',
      answer: 'goes',
      difficulty: 'A1'
    });

    await addDoc(quizzesCollection, {
      lessonId: '2',
      type: 'matching',
      question: 'Match the word with its meaning: "Goodbye"',
      options: ['A farewell', 'A greeting', 'Thank you', 'Please'],
      answer: 'A farewell',
      difficulty: 'A1'
    });

    console.log('Sample quiz data has been added successfully!');
  } catch (error) {
    console.error('Error setting up quiz data:', error);
  }
}

setupQuizData(); 