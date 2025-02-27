import { collection, getDocs, doc, setDoc, query, where } from 'firebase/firestore';
import { db } from '../firebase';

// Sample progress data
const createSampleProgress = (studentId: string) => [
  {
    userId: studentId,
    lessonId: '1',
    completed: true,
    score: 85,
    completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
  },
  {
    userId: studentId,
    lessonId: '2',
    completed: true,
    score: 92,
    completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
  },
  {
    userId: studentId,
    lessonId: '3',
    completed: true,
    score: 78,
    completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
  },
  {
    userId: studentId,
    lessonId: '4',
    completed: false,
    score: 0,
    completedAt: null
  }
];

// Sample assignments data
const createSampleAssignments = (studentEmail: string, teacherId: string) => [
  {
    studentEmail,
    lessonId: '5',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    teacherId
  },
  {
    studentEmail,
    lessonId: '6',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    teacherId
  }
];

// Function to add sample progress data to Firestore
export async function addSampleProgressData() {
  try {
    // Check if we have student users
    const usersCollection = collection(db, 'users');
    const studentQuery = query(usersCollection, where('role', '==', 'student'));
    const studentSnapshot = await getDocs(studentQuery);
    
    // Check if we have teacher users
    const teacherQuery = query(usersCollection, where('role', '==', 'teacher'));
    const teacherSnapshot = await getDocs(teacherQuery);
    
    if (studentSnapshot.empty) {
      console.log('No student users found. Please create student accounts first.');
      return false;
    }
    
    if (teacherSnapshot.empty) {
      console.log('No teacher users found. Please create teacher accounts first.');
      return false;
    }
    
    // Get the first teacher ID
    const teacherId = teacherSnapshot.docs[0].id;
    
    // Check if progress data already exists
    const progressCollection = collection(db, 'progress');
    const progressSnapshot = await getDocs(progressCollection);
    
    if (!progressSnapshot.empty) {
      console.log('Progress data already exists in the database.');
      return false;
    }
    
    // Add progress data for each student
    for (const studentDoc of studentSnapshot.docs) {
      const studentId = studentDoc.id;
      const studentEmail = studentDoc.data().email;
      const progressData = createSampleProgress(studentId);
      
      // Add progress entries
      for (let i = 0; i < progressData.length; i++) {
        const progressEntry = progressData[i];
        await setDoc(doc(db, 'progress', `${studentId}_lesson${i+1}`), progressEntry);
        console.log(`Added progress for student ${studentId}, lesson ${i+1}`);
      }
      
      // Add assignments
      const assignmentsCollection = collection(db, 'assignments');
      const assignmentsData = createSampleAssignments(studentEmail, teacherId);
      
      for (let i = 0; i < assignmentsData.length; i++) {
        const assignmentEntry = assignmentsData[i];
        await setDoc(doc(db, 'assignments', `${studentId}_assignment${i+1}`), assignmentEntry);
        console.log(`Added assignment for student ${studentEmail}, lesson ${assignmentEntry.lessonId}`);
      }
    }
    
    console.log('Sample progress and assignment data added successfully!');
    return true;
  } catch (error) {
    console.error('Error adding sample progress data:', error);
    return false;
  }
} 