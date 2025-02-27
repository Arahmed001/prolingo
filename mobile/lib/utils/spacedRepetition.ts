export interface ReviewItem {
  id: string;
  lastReviewed: Date;
  nextReview: Date;
  easeFactor: number;
  interval: number;
  consecutiveCorrect: number;
}

const MIN_EASE_FACTOR = 1.3;
const DEFAULT_EASE_FACTOR = 2.5;
const EASE_BONUS = 0.15;
const EASE_PENALTY = 0.2;

export function calculateNextReview(
  item: ReviewItem,
  remembered: boolean,
  quality: number // 0-5, how well the item was remembered
): ReviewItem {
  let { easeFactor, interval, consecutiveCorrect } = item;

  if (remembered) {
    // Successful recall
    if (interval === 0) {
      // First successful recall
      interval = 1;
    } else if (interval === 1) {
      // Second successful recall
      interval = 6;
    } else {
      // Subsequent successful recalls
      interval = Math.round(interval * easeFactor);
    }
    
    consecutiveCorrect++;
    
    // Adjust ease factor based on quality of recall
    easeFactor = Math.max(
      MIN_EASE_FACTOR,
      easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    );
  } else {
    // Failed recall
    interval = 1;
    consecutiveCorrect = 0;
    easeFactor = Math.max(MIN_EASE_FACTOR, easeFactor - EASE_PENALTY);
  }

  const now = new Date();
  const nextReview = new Date(now.getTime() + interval * 24 * 60 * 60 * 1000);

  return {
    ...item,
    lastReviewed: now,
    nextReview,
    easeFactor,
    interval,
    consecutiveCorrect,
  };
}

export function initializeReviewItem(id: string): ReviewItem {
  const now = new Date();
  return {
    id,
    lastReviewed: now,
    nextReview: now,
    easeFactor: DEFAULT_EASE_FACTOR,
    interval: 0,
    consecutiveCorrect: 0,
  };
}

export function calculateReviewPriority(items: ReviewItem[]): ReviewItem[] {
  const now = new Date();
  
  // Sort items by:
  // 1. Overdue items first (nextReview < now)
  // 2. Items with lower ease factor (more difficult) get priority
  // 3. Items with shorter intervals get priority
  return items.sort((a, b) => {
    const aOverdue = a.nextReview.getTime() < now.getTime();
    const bOverdue = b.nextReview.getTime() < now.getTime();

    if (aOverdue !== bOverdue) {
      return aOverdue ? -1 : 1;
    }

    if (a.easeFactor !== b.easeFactor) {
      return a.easeFactor - b.easeFactor;
    }

    return a.interval - b.interval;
  });
}

export function getDueReviews(items: ReviewItem[]): ReviewItem[] {
  const now = new Date();
  return items.filter(item => item.nextReview.getTime() <= now.getTime());
}

export function getReviewStats(items: ReviewItem[]) {
  const now = new Date();
  const dueCount = items.filter(item => item.nextReview.getTime() <= now.getTime()).length;
  const masteredCount = items.filter(item => item.consecutiveCorrect >= 5).length;
  const averageEaseFactor = items.reduce((sum, item) => sum + item.easeFactor, 0) / items.length;

  const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const upcomingCount = items.filter(
    item => 
      item.nextReview.getTime() > now.getTime() && 
      item.nextReview.getTime() <= next24Hours.getTime()
  ).length;

  return {
    dueCount,
    masteredCount,
    upcomingCount,
    averageEaseFactor,
    totalItems: items.length,
    masteryPercentage: (masteredCount / items.length) * 100,
  };
} 