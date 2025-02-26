export interface Lesson {
  id: string;
  title: string;
  level: string;
  description: string;
  imageUrl: string;
  duration: string;
  content?: string; // Optional content field for lesson material
  vocabulary?: VocabularyItem[]; // Optional vocabulary flashcards
  grammar?: GrammarExercise[]; // Optional grammar exercises
  audioUrl?: string; // Optional audio URL for pronunciation
}

export interface VocabularyItem {
  word: string;
  definition: string;
}

export interface GrammarExercise {
  question: string;
  answer: string;
}

// Quiz related types
export interface Quiz {
  id: string;
  lessonId: string;
  title: string;
  description?: string;
  questions: QuizQuestion[];
}

// Base question type
export interface BaseQuestion {
  id: number;
  type: string;
  question: string;
}

// Multiple choice question
export interface MultipleChoiceQuestion extends BaseQuestion {
  type: 'multiple-choice';
  options: string[];
  correctAnswer: number;
}

// Fill in the blank question
export interface FillInBlankQuestion extends BaseQuestion {
  type: 'fill';
  answer: string;
  explanation?: string;
}

// Matching question
export interface MatchingQuestion extends BaseQuestion {
  type: 'match';
  pairs: { term: string; definition: string }[];
}

// Union type for all question types
export type QuizQuestion = MultipleChoiceQuestion | FillInBlankQuestion | MatchingQuestion; 