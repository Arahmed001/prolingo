import { ReactNode } from "react";

export interface Lesson {
  id: string;
  title: string;
  level: string;
  description: string;
  imageUrl: string;
  duration: string;
  category?: string; // Category for grouping lessons (e.g., 'foundational', 'reading', 'speaking')
  content?: string; // Optional content field for lesson material
  vocabulary?: VocabularyItem[]; // Optional vocabulary flashcards
  grammar?: GrammarExercise[]; // Optional grammar exercises
  audioUrl?: string; // Optional audio URL for pronunciation
  examples?: string[]; // Added for AI-generated examples
}

export interface VocabularyItem {
  term: ReactNode;
  word: string;
  definition: string;
}

export interface GrammarExercise {
  question: string;
  answer: string;
  explanation?: string; // Added for grammar exercise explanation
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

export interface Progress {
  userId: string;
  lessonId: string;
  completed: boolean;
  score?: number;
  lastAccessed: Date | string;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName?: string;
  role?: 'student' | 'teacher' | 'admin';
  createdAt: Date | string;
  lastLogin: Date | string;
}

export interface Thread {
  id: string;
  title: string;
  author: {
    id: string;
    name: string;
  };
  createdAt: Date | string;
  updatedAt: Date | string;
  content: string;
  replies: Reply[];
}

export interface Reply {
  id: string;
  author: {
    id: string;
    name: string;
  };
  content: string;
  createdAt: Date | string;
} 