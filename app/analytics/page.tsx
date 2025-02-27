"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getAuth } from 'firebase/auth';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
// Directly import the charts for now (we'll use client components for optimization)
import { Line, Pie } from 'react-chartjs-2';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { usePerformanceMonitoring } from '../../lib/performance';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// We use client-only rendering to avoid SSR issues with charts
export const runtimeConfig = {
  dynamic: 'force-dynamic'
};

interface ProgressEntry {
  userId: string;
  lessonId: string;
  score: number;
  skill: string;
  date: Date;
  level?: string;
}

interface DailyProgress {
  date: string;
  completions: number;
  averageScore: number;
}

interface SkillDistribution {
  skill: string;
  percentage: number;
  trend: 'improving' | 'stable' | 'declining';
}

interface LearningPattern {
  bestTimeOfDay: string;
  mostProductiveDay: string;
  averageSessionLength: number;
  consistencyScore: number;
}

export default function AnalyticsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dailyProgress, setDailyProgress] = useState<DailyProgress[]>([]);
  const [skillDistribution, setSkillDistribution] = useState<SkillDistribution[]>([]);
  const [predictedLevel, setPredictedLevel] = useState<string>('');
  const [averageScore, setAverageScore] = useState<number>(0);
  const [totalLessons, setTotalLessons] = useState(0);
  const [weeklyLessons, setWeeklyLessons] = useState(0);
  const [learningPattern, setLearningPattern] = useState<LearningPattern | null>(null);
  const [skillTrends, setSkillTrends] = useState<Map<string, number[]>>(new Map());
  
  const auth = getAuth();
  
  // Add performance monitoring
  usePerformanceMonitoring('/analytics');
  
  useEffect(() => {
    if (!auth.currentUser) {
      router.push('/login');
      return;
    }

    const fetchAnalytics = async () => {
      try {
        const progressQuery = query(
          collection(db, 'progress'),
          where('userId', '==', auth.currentUser!.uid)
        );
        const progressSnapshot = await getDocs(progressQuery);
        
        if (progressSnapshot.empty) {
          await addSampleData();
          return;
        }

        // Process progress data
        const progressData = progressSnapshot.docs.map(doc => ({
          ...doc.data(),
          date: doc.data().timestamp?.toDate() || new Date()
        })) as ProgressEntry[];

        // Enhanced analytics calculations
        const last30Days = calculateDailyProgress(progressData);
        const skills = calculateSkillDistribution(progressData);
        const patterns = analyzeLearningPatterns(progressData);
        const trends = calculateSkillTrends(progressData);
        
        const avgScore = calculateAverageScore(progressData);
        const prediction = generateDetailedPrediction(progressData);

        setDailyProgress(last30Days);
        setSkillDistribution(skills);
        setLearningPattern(patterns);
        setSkillTrends(trends);
        setAverageScore(avgScore);
        setPredictedLevel(prediction);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching analytics:', error);
        setError('Failed to load analytics data. Please try again later.');
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [router]);

  const addSampleData = async () => {
    try {
      const sampleData = generateSampleData();
      for (const entry of sampleData) {
        await addDoc(collection(db, 'progress'), {
          userId: auth.currentUser!.uid,
          ...entry,
          timestamp: serverTimestamp()
        });
      }
      // Refresh page to show sample data
      window.location.reload();
    } catch (error) {
      console.error('Error adding sample data:', error);
    }
  };

  const generateSampleData = () => {
    const skills = ['Reading', 'Speaking', 'Writing', 'Listening'];
    const sampleData = [];
    const today = new Date();

    // Generate 30 days of sample data
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      // Add 1-3 entries per day
      const entriesCount = Math.floor(Math.random() * 3) + 1;
      for (let j = 0; j < entriesCount; j++) {
        sampleData.push({
          lessonId: String(Math.floor(Math.random() * 5) + 1),
          score: Math.floor(Math.random() * 30) + 70, // Scores between 70-100
          skill: skills[Math.floor(Math.random() * skills.length)],
          date: date
        });
      }
    }

    return sampleData;
  };

  const calculateDailyProgress = (data: ProgressEntry[]): DailyProgress[] => {
    const dailyMap = new Map<string, { completions: number, scores: number[] }>();
    const today = new Date();
    const thirtyDaysAgo = new Date(today.setDate(today.getDate() - 30));

    // Initialize all days with 0
    for (let i = 0; i < 30; i++) {
      const date = new Date(thirtyDaysAgo);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      dailyMap.set(dateStr, { completions: 0, scores: [] });
    }

    // Count completions and collect scores per day
    data.forEach(entry => {
      const dateStr = entry.date.toISOString().split('T')[0];
      if (dailyMap.has(dateStr)) {
        const dayData = dailyMap.get(dateStr)!;
        dayData.completions += 1;
        dayData.scores.push(entry.score);
      }
    });

    return Array.from(dailyMap).map(([date, data]) => ({
      date,
      completions: data.completions,
      averageScore: data.scores.length > 0 
        ? Math.round(data.scores.reduce((a, b) => a + b) / data.scores.length)
        : 0
    })).sort((a, b) => a.date.localeCompare(b.date));
  };

  const calculateSkillDistribution = (data: ProgressEntry[]): SkillDistribution[] => {
    const skillMap = new Map<string, { total: number, scores: number[] }>();
    let totalScore = 0;

    // Group scores by skill
    data.forEach(entry => {
      if (!skillMap.has(entry.skill)) {
        skillMap.set(entry.skill, { total: 0, scores: [] });
      }
      const skillData = skillMap.get(entry.skill)!;
      skillData.total += entry.score;
      skillData.scores.push(entry.score);
      totalScore += entry.score;
    });

    // Calculate percentages and trends
    return Array.from(skillMap).map(([skill, data]) => {
      const recentScores = data.scores.slice(-5); // Last 5 scores
      const olderScores = data.scores.slice(-10, -5); // Previous 5 scores
      
      let trend: 'improving' | 'stable' | 'declining' = 'stable';
      if (recentScores.length > 0 && olderScores.length > 0) {
        const recentAvg = recentScores.reduce((a, b) => a + b) / recentScores.length;
        const olderAvg = olderScores.reduce((a, b) => a + b) / olderScores.length;
        trend = recentAvg > olderAvg ? 'improving' : recentAvg < olderAvg ? 'declining' : 'stable';
      }

      return {
        skill,
        percentage: Math.round((data.total / totalScore) * 100),
        trend
      };
    });
  };

  const calculateAverageScore = (data: ProgressEntry[]): number => {
    const total = data.reduce((sum, entry) => sum + entry.score, 0);
    return Math.round(total / data.length);
  };

  const analyzeLearningPatterns = (data: ProgressEntry[]): LearningPattern => {
    // Group sessions by hour of day
    const hourlyActivity = new Map<number, number>();
    const dayActivity = new Map<string, number>();
    let totalSessionLength = 0;
    let consecutiveDays = 0;
    let maxConsecutiveDays = 0;

    data.forEach(entry => {
      const hour = entry.date.getHours();
      const day = entry.date.toLocaleDateString('en-US', { weekday: 'long' });
      
      hourlyActivity.set(hour, (hourlyActivity.get(hour) || 0) + 1);
      dayActivity.set(day, (dayActivity.get(day) || 0) + 1);
    });

    // Find best time of day
    const bestHour = Array.from(hourlyActivity.entries())
      .sort((a, b) => b[1] - a[1])[0][0];
    const bestTimeOfDay = `${bestHour}:00 - ${bestHour + 1}:00`;

    // Find most productive day
    const mostProductiveDay = Array.from(dayActivity.entries())
      .sort((a, b) => b[1] - a[1])[0][0];

    // Calculate consistency score (0-100)
    const daysWithActivity = new Set(data.map(entry => 
      entry.date.toISOString().split('T')[0]
    )).size;
    const consistencyScore = Math.round((daysWithActivity / 30) * 100);

    return {
      bestTimeOfDay,
      mostProductiveDay,
      averageSessionLength: Math.round(totalSessionLength / data.length),
      consistencyScore
    };
  };

  const calculateSkillTrends = (data: ProgressEntry[]): Map<string, number[]> => {
    const trends = new Map<string, number[]>();
    const skillData = new Map<string, { scores: number[], dates: Date[] }>();

    // Group scores by skill and date
    data.forEach(entry => {
      if (!skillData.has(entry.skill)) {
        skillData.set(entry.skill, { scores: [], dates: [] });
      }
      const skillInfo = skillData.get(entry.skill)!;
      skillInfo.scores.push(entry.score);
      skillInfo.dates.push(entry.date);
    });

    // Calculate 7-day moving average for each skill
    skillData.forEach((data, skill) => {
      const movingAverages = [];
      for (let i = 6; i < data.scores.length; i++) {
        const weekScores = data.scores.slice(i - 6, i + 1);
        const average = weekScores.reduce((a, b) => a + b) / weekScores.length;
        movingAverages.push(average);
      }
      trends.set(skill, movingAverages);
    });

    return trends;
  };

  const generateDetailedPrediction = (data: ProgressEntry[]): string => {
    const recentProgress = data.slice(-14); // Last 2 weeks
    const avgScore = calculateAverageScore(recentProgress);
    const consistency = new Set(recentProgress.map(e => e.date.toDateString())).size / 14;
    const skillImprovement = calculateSkillImprovement(recentProgress);

    if (avgScore >= 85 && consistency >= 0.7 && skillImprovement >= 10) {
      return "Excellent progress! At this rate, you'll reach B1 level in 2 months. Your consistent practice and high scores show strong language acquisition.";
    } else if (avgScore >= 75 && consistency >= 0.5 && skillImprovement >= 5) {
      return "Good progress! You're on track to reach A2 level in 2-3 months. Try to practice more consistently to speed up your learning.";
    } else if (avgScore >= 65 && consistency >= 0.3) {
      return "You're making steady progress. Focus on daily practice and try to improve your scores to accelerate your learning journey.";
    }
    return "Keep practicing regularly to improve your language skills. Aim for at least 4-5 practice sessions per week.";
  };

  const calculateSkillImprovement = (data: ProgressEntry[]): number => {
    if (data.length < 2) return 0;
    const firstWeek = data.slice(0, 7);
    const secondWeek = data.slice(-7);
    const firstAvg = calculateAverageScore(firstWeek);
    const secondAvg = calculateAverageScore(secondWeek);
    return secondAvg - firstAvg;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main id="main-content" id="main-content" className="flex-grow flex items-center justify-center">
          <div aria-live="polite" className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-base sm:text-lg font-medium text-red-500">{error}</div>
      </div>
    );
  }

  const lineChartData = {
    labels: dailyProgress.map(d => d.date),
    datasets: [
      {
        label: 'Daily Lesson Completions',
        data: dailyProgress.map(d => d.completions),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.3
      }
    ]
  };

  const pieChartData = {
    labels: skillDistribution.map(s => s.skill),
    datasets: [
      {
        data: skillDistribution.map(s => s.percentage),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)', // blue
          'rgba(16, 185, 129, 0.8)', // green
          'rgba(245, 158, 11, 0.8)', // yellow
          'rgba(239, 68, 68, 0.8)'   // red
        ]
      }
    ]
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main id="main-content" id="main-content" className="flex-grow bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Learning Analytics</h1>

          {/* Learning Patterns Card */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Learning Patterns</h2>
            {learningPattern && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">Best Time to Learn</p>
                  <p className="text-lg font-semibold text-blue-700">{learningPattern.bestTimeOfDay}</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">Most Productive Day</p>
                  <p className="text-lg font-semibold text-green-700">{learningPattern.mostProductiveDay}</p>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-gray-600">Consistency Score</p>
                  <p className="text-lg font-semibold text-yellow-700">{learningPattern.consistencyScore}%</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-gray-600">Average Score</p>
                  <p className="text-lg font-semibold text-purple-700">{averageScore}%</p>
                </div>
              </div>
            )}
          </div>

          {/* Prediction Card */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Learning Prediction</h2>
            <p className="text-lg text-blue-600">{predictedLevel}</p>
            <p className="text-sm text-gray-500 mt-2">
              Based on your average score of {averageScore}% and learning patterns
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Line Chart */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Learning Progress</h2>
              <div className="h-[400px]">
                <Line
                  data={lineChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          stepSize: 1
                        }
                      }
                    },
                    plugins: {
                      tooltip: {
                        callbacks: {
                          label: (context) => {
                            const dataPoint = dailyProgress[context.dataIndex];
                            return [
                              `Completions: ${dataPoint.completions}`,
                              `Average Score: ${dataPoint.averageScore}%`
                            ];
                          }
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>

            {/* Skill Distribution */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Skill Distribution</h2>
              <div className="grid grid-cols-1 gap-4 mb-6">
                {skillDistribution.map((skill) => (
                  <div key={skill.skill} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{skill.skill}</p>
                      <div className="flex items-center mt-1">
                        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${skill.percentage}%` }}
                          />
                        </div>
                        <span className="ml-2 text-sm text-gray-600">{skill.percentage}%</span>
                      </div>
                    </div>
                    <div className="flex items-center">
                      {skill.trend === 'improving' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          ↑ Improving
                        </span>
                      )}
                      {skill.trend === 'declining' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          ↓ Declining
                        </span>
                      )}
                      {skill.trend === 'stable' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          → Stable
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="h-[300px]">
                <Pie
                  data={pieChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom'
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
} 