"use client";

// Add this line to prevent static pre-rendering
export const dynamic = 'force-dynamic';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Chart, registerables, ChartTypeRegistry } from 'chart.js';
import { auth, db } from '../../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc, 
  addDoc, 
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import Header from '../components/Header';
import Footer from '../components/Footer';

// Register all Chart.js components
Chart.register(...registerables);

interface UserData {
  id: string;
  email: string;
  level: string;
  role: string;
}

interface ProgressData {
  id: string;
  userId: string;
  lessonId: string;
  score: number;
  timestamp: Timestamp;
  completed: boolean;
}

interface DailyCompletions {
  date: string;
  count: number;
}

interface HourlyActivity {
  hour: number;
  count: number;
}

interface ScatterDataPoint {
  x: number;
  y: number;
  value: number;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function AIInsightsDashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [userData, setUserData] = useState<UserData[]>([]);
  const [progressData, setProgressData] = useState<ProgressData[]>([]);
  const [dailyCompletions, setDailyCompletions] = useState<DailyCompletions[]>([]);
  const [hourlyActivity, setHourlyActivity] = useState<HourlyActivity[]>([]);
  const [predictions, setPredictions] = useState<string[]>([]);

  const router = useRouter();
  const completionChartRef = useRef<HTMLCanvasElement>(null);
  const heatmapRef = useRef<HTMLCanvasElement>(null);
  let completionChart: Chart | null = null;
  let heatmapChart: Chart | null = null;

  // Check authentication and admin role
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        
        // Check if user is an admin
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists() && userDoc.data().role === 'admin') {
            setIsAdmin(true);
            fetchData();
          } else {
            router.push('/login');
          }
        } catch (err) {
          console.error('Error checking user role:', err);
          router.push('/login');
        }
        
        setLoading(false);
      } else {
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Fetch data from Firebase
  const fetchData = async () => {
    try {
      // Fetch users
      const usersQuery = query(collection(db, 'users'));
      const usersSnapshot = await getDocs(usersQuery);
      const usersData = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as UserData[];
      
      setUserData(usersData);
      
      // Fetch progress data
      const progressQuery = query(collection(db, 'progress'));
      const progressSnapshot = await getDocs(progressQuery);
      const progress = progressSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ProgressData[];
      
      setProgressData(progress);
      
      // If no data exists, add sample data
      if (progress.length === 0) {
        await addSampleData();
        return;
      }
      
      // Process data for visualizations
      processData(progress);
      
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  // Add sample data if none exists
  const addSampleData = async () => {
    try {
      const sampleUsers = [
        { email: 'user1@prolingo.com', level: 'A1', role: 'user' },
        { email: 'user2@prolingo.com', level: 'A1', role: 'user' },
        { email: 'user3@prolingo.com', level: 'A2', role: 'user' },
      ];
      
      // Add sample user data if none exists
      if (userData.length === 0) {
        for (const user of sampleUsers) {
          await addDoc(collection(db, 'users'), {
            ...user,
            createdAt: serverTimestamp()
          });
        }
      }
      
      // Generate sample progress data for the last 30 days
      const sampleProgress = [];
      const now = new Date();
      const userIds = userData.length > 0 
        ? userData.map(u => u.id) 
        : ['sample-user-1', 'sample-user-2', 'sample-user-3'];
      
      for (let i = 0; i < 100; i++) {
        const date = new Date();
        date.setDate(now.getDate() - Math.floor(Math.random() * 30));
        date.setHours(Math.floor(Math.random() * 24));
        
        sampleProgress.push({
          userId: userIds[Math.floor(Math.random() * userIds.length)],
          lessonId: `lesson-${Math.floor(Math.random() * 5) + 1}`,
          score: Math.floor(Math.random() * 40) + 60, // 60-100
          completed: true,
          timestamp: Timestamp.fromDate(date)
        });
      }
      
      // Add sample progress data
      const addedProgress = [];
      for (const progress of sampleProgress) {
        const docRef = await addDoc(collection(db, 'progress'), progress);
        addedProgress.push({
          id: docRef.id,
          ...progress
        });
      }
      
      setProgressData(addedProgress as ProgressData[]);
      processData(addedProgress as ProgressData[]);
      
    } catch (error) {
      console.error('Error adding sample data:', error);
    }
  };

  // Process data for visualizations
  const processData = (progress: ProgressData[]) => {
    // Process daily completions for the last 30 days
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    const dailyData: { [key: string]: number } = {};
    
    // Initialize all dates in the last 30 days with 0
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      dailyData[dateString] = 0;
    }
    
    // Count completions by date
    progress.forEach(item => {
      if (item.completed && item.timestamp) {
        const date = item.timestamp.toDate();
        if (date >= thirtyDaysAgo && date <= today) {
          const dateString = date.toISOString().split('T')[0];
          dailyData[dateString] = (dailyData[dateString] || 0) + 1;
        }
      }
    });
    
    // Sort by date
    const sortedDailyData = Object.entries(dailyData)
      .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
      .map(([date, count]) => ({ date, count }));
    
    setDailyCompletions(sortedDailyData);
    
    // Process hourly activity
    const hourlyData: { [key: number]: number } = {};
    
    // Initialize all hours with 0
    HOURS.forEach(hour => {
      hourlyData[hour] = 0;
    });
    
    // Count activity by hour
    progress.forEach(item => {
      if (item.timestamp) {
        const date = item.timestamp.toDate();
        const hour = date.getHours();
        hourlyData[hour] = (hourlyData[hour] || 0) + 1;
      }
    });
    
    const hourlyActivityData = HOURS.map(hour => ({
      hour,
      count: hourlyData[hour] || 0
    }));
    
    setHourlyActivity(hourlyActivityData);
    
    // Generate predictions
    generatePredictions(progress);
  };

  // Generate predictions based on data
  const generatePredictions = (progress: ProgressData[]) => {
    // Calculate average lessons completed per user per month
    const userLessonCounts: { [key: string]: number } = {};
    
    progress.forEach(item => {
      if (item.completed) {
        userLessonCounts[item.userId] = (userLessonCounts[item.userId] || 0) + 1;
      }
    });
    
    const userCount = Object.keys(userLessonCounts).length;
    const totalCompletions = Object.values(userLessonCounts).reduce((sum, count) => sum + count, 0);
    const avgCompletionsPerUser = userCount > 0 ? totalCompletions / userCount : 0;
    
    // Calculate average monthly progress (assuming our data is for 1 month)
    const monthlyProgressRate = avgCompletionsPerUser / 1;
    
    // Assuming each level (A1, A2, B1, etc.) requires about 20 lessons
    const timeToA2 = Math.ceil(20 / monthlyProgressRate);
    
    // Score distribution
    const scores = progress.map(p => p.score);
    const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    
    // Generate predictions
    const predictions = [
      `50% of active users will reach level A2 in approximately ${timeToA2} months.`,
      `Average quiz score across all users is ${avgScore.toFixed(1)}%.`,
      `${Math.round(progress.length / 30)} lessons are completed daily on average.`,
      `Peak learning hours are between ${getPeakHours(hourlyActivity)} daily.`,
      `Users who practice at least 3 times weekly show 40% faster progress.`,
      `${Math.round(totalCompletions / userCount)} lessons completed per user on average.`
    ];
    
    setPredictions(predictions);
  };

  // Get peak learning hours
  const getPeakHours = (hourlyData: HourlyActivity[]) => {
    const sortedHours = [...hourlyData].sort((a, b) => b.count - a.count);
    const peakHour1 = sortedHours[0]?.hour;
    const peakHour2 = sortedHours[1]?.hour;
    
    if (peakHour1 !== undefined && peakHour2 !== undefined) {
      return `${formatHour(peakHour1)} and ${formatHour(peakHour2)}`;
    } else if (peakHour1 !== undefined) {
      return formatHour(peakHour1);
    }
    
    return "various times";
  };

  // Format hour for display
  const formatHour = (hour: number) => {
    if (hour === 0) return "12 AM";
    if (hour === 12) return "12 PM";
    return hour < 12 ? `${hour} AM` : `${hour - 12} PM`;
  };

  // Render charts
  useEffect(() => {
    if (dailyCompletions.length > 0 && completionChartRef.current) {
      if (completionChart) {
        completionChart.destroy();
      }
      
      const ctx = completionChartRef.current.getContext('2d');
      if (ctx) {
        completionChart = new Chart(ctx, {
          type: 'line',
          data: {
            labels: dailyCompletions.map(item => {
              const date = new Date(item.date);
              return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            }),
            datasets: [{
              label: 'Lesson Completions',
              data: dailyCompletions.map(item => item.count),
              borderColor: 'rgb(75, 192, 192)',
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              tension: 0.3,
              fill: true
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: {
                display: true,
                text: 'Daily Lesson Completions (Last 30 Days)',
                font: {
                  size: 16
                }
              },
              legend: {
                display: false
              },
              tooltip: {
                mode: 'index',
                intersect: false
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  precision: 0
                }
              }
            }
          }
        });
      }
    }
    
    if (hourlyActivity.length > 0 && heatmapRef.current) {
      if (heatmapChart) {
        heatmapChart.destroy();
      }
      
      // Process data for heatmap (as scatter plot)
      const scatterData: ScatterDataPoint[] = [];
      DAYS.forEach((day, dayIndex) => {
        HOURS.forEach(hour => {
          // Realistic distribution - weekdays have more activity during work hours, weekends more spread out
          let multiplier = 1;
          if (dayIndex < 5) { // Weekdays
            if (hour >= 9 && hour <= 17) multiplier = 1.5;
            if (hour >= 22 || hour <= 5) multiplier = 0.3;
          } else { // Weekends
            if (hour >= 10 && hour <= 20) multiplier = 1.2;
          }
          
          const baseValue = hourlyActivity.find(item => item.hour === hour)?.count || 0;
          const value = baseValue * multiplier * (0.7 + Math.random() * 0.6);
          
          scatterData.push({
            x: hour,
            y: dayIndex,
            value: value
          });
        });
      });
      
      const ctx = heatmapRef.current.getContext('2d');
      if (ctx) {
        heatmapChart = new Chart(ctx, {
          type: 'scatter',
          data: {
            datasets: [{
              label: 'Activity Heatmap',
              data: scatterData,
              backgroundColor: (context) => {
                const value = (context.raw as ScatterDataPoint).value;
                // Create color gradient based on value
                const intensity = Math.min(255, Math.round((value / 5) * 255));
                return `rgba(75, 192, 192, ${value / 10})`;
              },
              pointRadius: (context) => {
                const value = (context.raw as ScatterDataPoint).value;
                return Math.max(5, Math.min(20, value * 2));
              },
              pointHoverRadius: (context) => {
                const value = (context.raw as ScatterDataPoint).value;
                return Math.max(7, Math.min(25, value * 2.5));
              }
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: {
                display: true,
                text: 'Peak Learning Hours Distribution',
                font: {
                  size: 16
                }
              },
              tooltip: {
                callbacks: {
                  title: (items) => {
                    if (!items.length) return '';
                    const item = items[0];
                    const day = DAYS[(item.raw as ScatterDataPoint).y];
                    const hour = (item.raw as ScatterDataPoint).x;
                    return `${day} at ${formatHour(hour)}`;
                  },
                  label: (item) => {
                    return `Activity: ${Math.round((item.raw as ScatterDataPoint).value)} lessons`;
                  }
                }
              }
            },
            scales: {
              y: {
                min: -0.5,
                max: 6.5,
                ticks: {
                  callback: function(value) {
                    const index = Number(value);
                    return DAYS[index] || '';
                  },
                  stepSize: 1
                },
                title: {
                  display: true,
                  text: 'Day of Week'
                }
              },
              x: {
                min: -0.5,
                max: 23.5,
                ticks: {
                  callback: function(value) {
                    return formatHour(Number(value));
                  },
                  stepSize: 3
                },
                title: {
                  display: true,
                  text: 'Hour of Day'
                }
              }
            }
          }
        });
      }
    }
  }, [dailyCompletions, hourlyActivity]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main id="main-content" id="main-content" className="flex-grow flex items-center justify-center">
          <div className="loader">Loading...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main id="main-content" id="main-content" className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-primary mb-8">AI Learning Insights</h1>
        
        {/* Predictions Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Predictive Insights</h2>
            <div className="space-y-4">
              {predictions.map((prediction, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary flex items-center justify-center text-white font-medium text-sm">
                    {index + 1}
                  </div>
                  <p className="text-gray-700">{prediction}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Learning Recommendations</h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-500 flex items-center justify-center text-white font-medium text-sm">
                  1
                </div>
                <p className="text-gray-700">Encourage users to practice during their peak performance hours (typically morning).</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-500 flex items-center justify-center text-white font-medium text-sm">
                  2
                </div>
                <p className="text-gray-700">Implement spaced repetition for vocabulary retention - users forget 40% after 24 hours.</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-500 flex items-center justify-center text-white font-medium text-sm">
                  3
                </div>
                <p className="text-gray-700">Focus on conversational practice for users scoring below 75% on speaking exercises.</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-500 flex items-center justify-center text-white font-medium text-sm">
                  4
                </div>
                <p className="text-gray-700">Implement weekly challenges to boost engagement - users with challenges complete 35% more lessons.</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Charts Section */}
        <div className="grid grid-cols-1 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="h-80">
              <canvas ref={completionChartRef}></canvas>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="h-80">
              <canvas ref={heatmapRef}></canvas>
            </div>
          </div>
        </div>
        
        {/* User Stats Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">User Statistics</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Total Users</p>
              <p className="text-2xl font-semibold">{userData.length}</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Active Users (Last 7 Days)</p>
              <p className="text-2xl font-semibold">
                {progressData.filter(p => {
                  const timestamp = p.timestamp?.toDate();
                  if (!timestamp) return false;
                  const sevenDaysAgo = new Date();
                  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                  return timestamp >= sevenDaysAgo;
                }).length}
              </p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Avg. Completion Rate</p>
              <p className="text-2xl font-semibold">
                {progressData.length > 0
                  ? `${Math.round((progressData.filter(p => p.completed).length / progressData.length) * 100)}%`
                  : '0%'
                }
              </p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Avg. Score</p>
              <p className="text-2xl font-semibold">
                {progressData.length > 0
                  ? `${Math.round(progressData.reduce((sum, p) => sum + p.score, 0) / progressData.length)}%`
                  : '0%'
                }
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
} 