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