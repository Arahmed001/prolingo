export interface Lesson {
  id: string;
  title: string;
  level: string;
  description: string;
  imageUrl: string;
  duration: string;
  content?: string; // Optional content field for lesson material
} 