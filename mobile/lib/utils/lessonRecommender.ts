import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase/init';

interface Lesson {
  id: string;
  title: string;
  description: string;
  level: string;
  difficulty: number;
  topics: string[];
}

interface UserProgress {
  completedLessons: string[];
  level: string;
  xp: number;
  strengths: string[];
  weaknesses: string[];
}

export async function getRecommendedLessons(
  userProgress: UserProgress,
  count: number = 3
): Promise<Lesson[]> {
  try {
    // Get lessons at user's current level and one level above
    const currentLevelIndex = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].indexOf(userProgress.level);
    const nextLevel = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'][currentLevelIndex + 1];
    
    const lessonsRef = collection(db, 'lessons');
    const q = query(
      lessonsRef,
      where('level', 'in', [userProgress.level, nextLevel]),
      where('published', '==', true),
      orderBy('difficulty'),
      limit(10)
    );

    const querySnapshot = await getDocs(q);
    const lessons: Lesson[] = [];
    querySnapshot.forEach((doc) => {
      lessons.push({ id: doc.id, ...doc.data() as Omit<Lesson, 'id'> });
    });

    // Filter out completed lessons
    const availableLessons = lessons.filter(
      lesson => !userProgress.completedLessons.includes(lesson.id)
    );

    // Score lessons based on user's strengths and weaknesses
    const scoredLessons = availableLessons.map(lesson => ({
      ...lesson,
      score: calculateLessonScore(lesson, userProgress)
    }));

    // Sort by score and return top recommendations
    return scoredLessons
      .sort((a, b) => b.score - a.score)
      .slice(0, count)
      .map(({ score, ...lesson }) => lesson);
  } catch (error) {
    console.error('Error getting recommended lessons:', error);
    return [];
  }
}

function calculateLessonScore(lesson: Lesson, userProgress: UserProgress): number {
  let score = 0;

  // Base score based on level appropriateness
  if (lesson.level === userProgress.level) {
    score += 10;
  } else {
    score += 5; // Next level lessons get a lower base score
  }

  // Adjust score based on difficulty
  const normalizedXP = userProgress.xp / 1000; // Assuming 1000 XP per level
  const difficultyMatch = Math.abs(normalizedXP - lesson.difficulty);
  score += (1 - difficultyMatch) * 5; // Higher score for better difficulty match

  // Boost score for topics in user's weaknesses
  lesson.topics.forEach(topic => {
    if (userProgress.weaknesses.includes(topic)) {
      score += 3;
    }
  });

  // Slightly lower score for topics in user's strengths
  lesson.topics.forEach(topic => {
    if (userProgress.strengths.includes(topic)) {
      score -= 1;
    }
  });

  return score;
} 