"use client";

// Add this line to prevent static pre-rendering
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, getDoc, doc, addDoc, serverTimestamp, query, where, orderBy, limit } from 'firebase/firestore';
import { db, isFirebaseInitialized } from '../../../lib/firebase';
import Header from '../../../app/components/Header';
import Footer from '../../../app/components/Footer';
import FirebaseGuard from '../../../app/components/FirebaseGuard';

interface Student {
  id: string;
  email: string;
  name: string;
  progress: {
    completedLessons: number;
    totalLessons: number;
    lastActivity: Date;
  };
}

interface Assignment {
  lessonId: string;
  studentIds: string[];
  dueDate: Date;
  createdAt: Date;
  teacherId: string;
}

interface Lesson {
  id: string;
  title: string;
  level?: string;
  difficulty?: string;
  [key: string]: any;
}

interface LessonPlan {
  id: string;
  lessonId: string;
  lessonTitle: string;
  plan: string;
  teacherId: string;
  timestamp: any;
}

interface StudentProgress {
  id: string;
  userId: string;
  lessonId: string;
  score: number;
  studentName?: string;
}

export default function TeacherDashboard() {
  return (
    <FirebaseGuard
      fallback={
        <div className="min-h-screen flex flex-col">
          <Header />
          <main id="main-content" className="flex-grow bg-gray-50 py-8 flex items-center justify-center">
            <div className="text-center p-6 max-w-sm mx-auto">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Teacher Dashboard</h2>
              <p className="text-gray-600">Please wait while we set up your dashboard...</p>
            </div>
          </main>
          <Footer />
        </div>
      }
    >
      <TeacherDashboardContent />
    </FirebaseGuard>
  );
}

function TeacherDashboardContent() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState<{ uid: string; email: string } | null>(null);
  const [isTeacher, setIsTeacher] = useState(false);
  const [lessonId, setLessonId] = useState('');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState('');
  const [assignmentSuccess, setAssignmentSuccess] = useState(false);
  const [lessonPlans, setLessonPlans] = useState<LessonPlan[]>([]);
  const [studentProgress, setStudentProgress] = useState<StudentProgress[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState<string>('');
  const [generatingPlan, setGeneratingPlan] = useState<boolean>(false);
  const [formStatus, setFormStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });
  const router = useRouter();
  const auth = getAuth();

  // Check if user is logged in and is a teacher
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser({
          uid: user.uid,
          email: user.email || 'unknown@example.com'
        });
        
        // Check if user is a teacher
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists() && userDoc.data().role === 'teacher') {
            setIsTeacher(true);
            fetchLessons();
            fetchLessonPlans();
            fetchStudentProgress();
          } else {
            // Redirect if not a teacher
            router.push('/login');
          }
        } catch (err) {
          console.error('Error checking user role:', err);
          router.push('/login');
        }
      } else {
        // Redirect if not logged in
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [auth, router]);

  // Fetch students and their progress
  useEffect(() => {
    if (!isTeacher) return;
    
    const fetchStudents = async () => {
      try {
        // Get all users with role 'student'
        const usersQuery = query(
          collection(db, 'users'),
          where('role', '==', 'student')
        );
        
        const usersSnapshot = await getDocs(usersQuery);
        const studentUsers = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          email: doc.data().email || 'unknown@example.com',
          name: doc.data().displayName || 'Unknown Student'
        }));
        
        // Get progress for each student
        const studentsWithProgress = await Promise.all(
          studentUsers.map(async (student) => {
            try {
              const progressQuery = query(
                collection(db, 'progress'),
                where('userId', '==', student.id)
              );
              
              const progressSnapshot = await getDocs(progressQuery);
              let progress = {
                completedLessons: 0,
                totalLessons: 0,
                lastActivity: new Date(0) // Default to epoch
              };
              
              if (!progressSnapshot.empty) {
                const progressData = progressSnapshot.docs[0].data();
                progress = {
                  completedLessons: progressData.completedLessons || 0,
                  totalLessons: progressData.totalLessons || 0,
                  lastActivity: progressData.lastActivity?.toDate() || new Date(0)
                };
              }
              
              return {
                ...student,
                progress
              };
            } catch (err) {
              console.error(`Error fetching progress for student ${student.id}:`, err);
              return {
                ...student,
                progress: {
                  completedLessons: 0,
                  totalLessons: 0,
                  lastActivity: new Date(0)
                }
              };
            }
          })
        );
        
        setStudents(studentsWithProgress);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching students:', err);
        setError('Failed to load students. Please try again later.');
        setLoading(false);
      }
    };

    fetchStudents();
  }, [isTeacher]);

  // Fetch lesson plans from Firebase
  const fetchLessonPlans = async () => {
    try {
      if (!user) return;
      
      const q = query(
        collection(db, 'lesson-plans'),
        where('teacherId', '==', user.uid),
        orderBy('timestamp', 'desc'),
        limit(5)
      );
      
      const plansSnapshot = await getDocs(q);
      const plansList = plansSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as LessonPlan[];
      
      setLessonPlans(plansList);
    } catch (error) {
      console.error('Error fetching lesson plans:', error);
    }
  };

  // Fetch student progress from Firebase
  const fetchStudentProgress = async () => {
    try {
      const progressCollection = collection(db, 'progress');
      const progressSnapshot = await getDocs(progressCollection);
      const progressList = progressSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as StudentProgress[];
      
      // Fetch student user data to display names
      const enhancedProgress = await Promise.all(progressList.map(async (progress) => {
        try {
          const userDoc = await getDoc(doc(db, 'users', progress.userId));
          return {
            ...progress,
            studentName: userDoc.exists() ? userDoc.data().displayName || 'Unknown Student' : 'Unknown Student'
          };
        } catch (error) {
          console.error('Error fetching student info:', error);
          return {
            ...progress,
            studentName: 'Unknown Student'
          };
        }
      }));
      
      setStudentProgress(enhancedProgress);
    } catch (error) {
      console.error('Error fetching student progress:', error);
    }
  };

  // Fetch lessons from Firebase
  const fetchLessons = async () => {
    try {
      const lessonsCollection = collection(db, 'lessons');
      const lessonsSnapshot = await getDocs(lessonsCollection);
      const lessonsList = lessonsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Lesson[];
      
      setLessons(lessonsList);
      
      // Set first lesson as default selection if available
      if (lessonsList.length > 0 && !selectedLessonId) {
        setSelectedLessonId(lessonsList[0].id);
      }
    } catch (error) {
      console.error('Error fetching lessons:', error);
    }
  };

  // Handle student selection for assignment
  const handleStudentSelection = (studentId: string) => {
    setSelectedStudents(prev => {
      if (prev.includes(studentId)) {
        return prev.filter(id => id !== studentId);
      } else {
        return [...prev, studentId];
      }
    });
  };

  // Handle select all students
  const handleSelectAllStudents = () => {
    if (selectedStudents.length === students.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(students.map(student => student.id));
    }
  };

  // Handle assignment submission
  const handleAssignHomework = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      alert('You must be logged in to assign homework');
      return;
    }
    
    if (!lessonId.trim()) {
      alert('Please enter a lesson ID');
      return;
    }
    
    if (selectedStudents.length === 0) {
      alert('Please select at least one student');
      return;
    }
    
    if (!dueDate) {
      alert('Please select a due date');
      return;
    }
    
    try {
      const assignmentData: Omit<Assignment, 'createdAt'> & { createdAt: any } = {
        lessonId: lessonId.trim(),
        studentIds: selectedStudents,
        dueDate: new Date(dueDate),
        createdAt: serverTimestamp(),
        teacherId: user.uid
      };
      
      await addDoc(collection(db, 'assignments'), assignmentData);
      
      // Reset form
      setLessonId('');
      setSelectedStudents([]);
      setDueDate('');
      setAssignmentSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setAssignmentSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Error assigning homework:', err);
      alert('Failed to assign homework. Please try again.');
    }
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  // Calculate progress percentage
  const calculateProgress = (completed: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  };

  // Generate a lesson plan based on selected lesson
  const generateLessonPlan = async () => {
    if (!selectedLessonId) {
      setFormStatus({
        type: 'error',
        message: 'Please select a lesson first'
      });
      return;
    }
    
    if (!user) {
      setFormStatus({
        type: 'error',
        message: 'User authentication required aria-required="true"'
      });
      return;
    }
    
    setGeneratingPlan(true);
    setFormStatus({ type: null, message: '' });
    
    try {
      // Find the selected lesson
      const selectedLesson = lessons.find(lesson => lesson.id === selectedLessonId);
      if (!selectedLesson) {
        throw new Error('Selected lesson not found');
      }
      
      // In a real application, this would call an AI service
      // For now, we'll generate a static plan based on lesson properties
      const activities = ['Vocabulary Flashcards', 'Conversation Practice', 'Grammar Exercise', 'Interactive Quiz'];
      const randomActivities = activities
        .sort(() => 0.5 - Math.random())
        .slice(0, 2 + Math.floor(Math.random() * 3)); // 2-4 random activities
      
      const duration = (30 + Math.floor(Math.random() * 4) * 10); // 30, 40, 50, or 60 minutes
      
      const plan = {
        lessonId: selectedLessonId,
        lessonTitle: selectedLesson.title,
        plan: `Lesson: ${selectedLesson.title}
Duration: ${duration} minutes
Level: ${selectedLesson.level || 'A1'}
Activities:
${randomActivities.map((activity, index) => `${index + 1}. ${activity} (${Math.floor(duration / randomActivities.length)} min)`).join('\n')}

Learning Objectives:
- Master key vocabulary related to ${selectedLesson.title.toLowerCase()}
- Practice conversational skills in realistic scenarios
- Understand and apply grammar concepts appropriately`,
        teacherId: user.uid,
        timestamp: serverTimestamp()
      };
      
      // Add the plan to Firebase
      await addDoc(collection(db, 'lesson-plans'), plan);
      
      // Update local state with the new plan
      setFormStatus({
        type: 'success',
        message: 'Lesson plan generated successfully!'
      });
      
      // Refresh lesson plans
      fetchLessonPlans();
    } catch (error) {
      console.error('Error generating lesson plan:', error);
      setFormStatus({
        type: 'error',
        message: 'Error generating lesson plan. Please try again.'
      });
    } finally {
      setGeneratingPlan(false);
    }
  };

  // Generate AI insight for a student based on their score
  const generateStudentInsight = (score: number, studentName: string) => {
    if (score > 90) {
      return `${studentName} is excelling and ready for more advanced content`;
    } else if (score > 80) {
      return `${studentName} is performing well but could benefit from more practice`;
    } else if (score > 70) {
      return `${studentName} needs additional review of key concepts`;
    } else if (score > 60) {
      return `${studentName} needs more speaking and grammar practice`;
    } else {
      return `${studentName} requires personalised attention and remedial lessons`;
    }
  };

  if (!isTeacher) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="font-heading text-xl sm:text-2xl font-bold text-gray-900 mb-2">Checking credentials...</h1>
          <p className="text-gray-600 text-sm sm:text-base">Please wait while we verify your access.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main id="main-content" className="flex-grow bg-gray-50 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold">Teacher Dashboard</h1>
              <button aria-label="Button" tabIndex={0}
                onClick={toggleAddStudentModal} onKeyDown={(e) => { if(e.key === "Enter" || e.key === " ") e.currentTarget.click(); }}
                className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
              >
                Add Student
              </button>
            </div>
            <p className="mt-1 sm:mt-2 text-gray-600 text-sm sm:text-base">Manage your students and assign homework</p>
          </div>
          
          {/* Assignment Form */}
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6 sm:mb-8">
            <h2 className="font-heading text-lg sm:text-xl font-medium text-gray-900 mb-3 sm:mb-4">Assign Homework</h2>
            
            {assignmentSuccess && (
              <div className="mb-4 p-3 sm:p-4 bg-green-50 text-green-700 rounded-md text-sm sm:text-base">
                Homework successfully assigned!
              </div>
            )}
            
            <form aria-label="Form" onSubmit={handleAssignHomework} className="space-y-3 sm:space-y-4">
              <div>
                <label htmlFor="lesson-id" className="block text-sm font-medium text-gray-700 mb-1">
                  Lesson ID
                </label>
                <input
                  type="text"
                  id="lesson-id"
                  value={lessonId}
                  onChange={(e) => setLessonId(e.target.value)}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary text-sm sm:text-base"
                  placeholder="Enter lesson ID"
                  required aria-required="true"
                />
              </div>
              
              <div>
                <label htmlFor="due-date" className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  id="due-date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary text-sm sm:text-base"
                  required aria-required="true"
                />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Select Students
                  </label>
                  <button
                    type="button"
                    onClick={handleSelectAllStudents} onKeyDown={(e) => { if(e.key === "Enter" || e.key === " ") e.target.click(); }}
                    className="text-xs sm:text-sm text-primary hover:text-primary-dark"
                  >
                    {selectedStudents.length === students.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
                
                <div className="max-h-48 sm:max-h-60 overflow-y-auto border border-gray-300 rounded-md">
                  {students.length === 0 ? (
                    <div className="p-3 sm:p-4 text-gray-500 text-center text-sm sm:text-base">
                      No students found
                    </div>
                  ) : (
                    <ul className="divide-y divide-gray-200">
                      {students.map((student) => (
                        <li key={student.id} className="p-2 sm:p-3 hover:bg-gray-50">
                          <label className="flex items-center space-x-2 sm:space-x-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedStudents.includes(student.id)}
                              onChange={() => handleStudentSelection(student.id)}
                              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                            />
                            <span className="text-gray-900 text-sm sm:text-base">{student.name} ({student.email})</span>
                          </label>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-3 sm:px-4 py-2 border border-transparent rounded-md shadow-sm text-xs sm:text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200"
                >
                  Assign Homework
                </button>
              </div>
            </form>
          </div>
          
          {/* Students Progress Table */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
              <h2 className="font-heading text-lg sm:text-xl font-medium text-gray-900">Student Progress</h2>
            </div>
            
            {loading ? (
              <div className="p-4 sm:p-6 text-center text-gray-500 text-sm sm:text-base">
                Loading students...
              </div>
            ) : error ? (
              <div className="p-4 sm:p-6 text-center text-red-500 text-sm sm:text-base">
                {error}
              </div>
            ) : students.length === 0 ? (
              <div className="p-4 sm:p-6 text-center text-gray-500 text-sm sm:text-base">
                No students found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student
                      </th>
                      <th scope="col" className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th scope="col" className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Progress
                      </th>
                      <th scope="col" className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Completed
                      </th>
                      <th scope="col" className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Activity
                      </th>
                      <th scope="col" className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {students.map((student) => (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <div className="text-xs sm:text-sm font-medium text-gray-900">{student.name}</div>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <div className="text-xs sm:text-sm text-gray-500">{student.email}</div>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full" 
                              style={{ width: `${calculateProgress(student.progress.completedLessons, student.progress.totalLessons)}%` }}
                            ></div>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {calculateProgress(student.progress.completedLessons, student.progress.totalLessons)}%
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <div className="text-xs sm:text-sm text-gray-900">
                            {student.progress.completedLessons} / {student.progress.totalLessons}
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <div className="text-xs sm:text-sm text-gray-500">
                            {student.progress.lastActivity.getTime() === 0 
                              ? 'Never' 
                              : formatDate(student.progress.lastActivity)
                            }
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <button aria-label="Button" tabIndex={0}
                            onClick={() => handleDeleteStudent(student.id)} onKeyDown={(e) => { if(e.key === "Enter" || e.key === " ") e.currentTarget.click(); }}
                            className="text-red-500 hover:text-red-700 transition-colors"
                          >
                            Delete
                          </button>
                          <button aria-label="Button" tabIndex={0}
                            onClick={() => handleViewDetails(student)} onKeyDown={(e) => { if(e.key === "Enter" || e.key === " ") e.currentTarget.click(); }}
                            className="text-primary hover:text-primary/80 transition-colors"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 