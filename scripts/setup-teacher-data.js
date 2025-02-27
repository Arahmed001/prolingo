// Setup script to add sample teacher data to Firebase
import { db, auth } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { signInWithEmailAndPassword } from 'firebase/auth';

// Sample lesson plans
const sampleLessonPlans = [
  {
    lessonId: 'lesson1',
    lessonTitle: 'Basic Greetings and Introductions',
    plan: `Lesson: Basic Greetings and Introductions
Duration: 30 minutes
Level: A1
Activities:
1. Vocabulary Flashcards (10 min)
2. Conversation Practice (10 min)
3. Interactive Quiz (10 min)

Learning Objectives:
- Master key vocabulary related to greetings and introductions
- Practice conversational skills in realistic scenarios
- Understand and apply grammar concepts appropriately`,
    timestamp: serverTimestamp()
  },
  {
    lessonId: 'lesson2',
    lessonTitle: 'Numbers and Counting',
    plan: `Lesson: Numbers and Counting
Duration: 45 minutes
Level: A1
Activities:
1. Vocabulary Flashcards (15 min)
2. Grammar Exercise (15 min)
3. Interactive Quiz (15 min)

Learning Objectives:
- Master numbers from 1-100
- Practice counting objects and people
- Understand and apply numerical concepts in conversation`,
    timestamp: serverTimestamp()
  }
];

// Sample student progress data
const sampleStudentProgress = [
  {
    userId: 'student1', // This should be replaced with an actual student user ID
    lessonId: 'lesson1',
    score: 92,
    completed: true,
    timestamp: serverTimestamp()
  },
  {
    userId: 'student2', // This should be replaced with an actual student user ID
    lessonId: 'lesson1',
    score: 78,
    completed: true,
    timestamp: serverTimestamp()
  },
  {
    userId: 'student3', // This should be replaced with an actual student user ID
    lessonId: 'lesson1',
    score: 65,
    completed: true,
    timestamp: serverTimestamp()
  },
  {
    userId: 'student1', // This should be replaced with an actual student user ID
    lessonId: 'lesson2',
    score: 85,
    completed: true,
    timestamp: serverTimestamp()
  },
  {
    userId: 'student2', // This should be replaced with an actual student user ID
    lessonId: 'lesson2',
    score: 63,
    completed: true,
    timestamp: serverTimestamp()
  }
];

async function setupTeacherData() {
  try {
    // Sign in with email and password
    console.log("Signing in...");
    // Replace with your test user credentials
    await signInWithEmailAndPassword(auth, "test@example.com", "password");
    
    const user = auth.currentUser;
    
    if (!user) {
      console.error("Failed to authenticate. Please check your credentials.");
      return;
    }
    
    console.log("Signed in as:", user.email);
    
    // Get student user IDs if available
    let studentIds = ['student1', 'student2', 'student3']; // Default fallback IDs
    
    try {
      const studentsQuery = query(collection(db, 'users'), where('role', '==', 'student'));
      const studentsSnapshot = await getDocs(studentsQuery);
      
      if (!studentsSnapshot.empty) {
        studentIds = studentsSnapshot.docs.map(doc => doc.id);
        console.log("Found student IDs:", studentIds);
      } else {
        console.log("No student users found, using default IDs");
      }
    } catch (error) {
      console.error("Error fetching student users:", error);
    }
    
    // Add sample lesson plans
    console.log("Adding sample lesson plans...");
    for (const plan of sampleLessonPlans) {
      await addDoc(collection(db, "lesson-plans"), {
        ...plan,
        teacherId: user.uid
      });
    }
    console.log("Sample lesson plans added");
    
    // Add sample student progress
    console.log("Adding sample student progress...");
    for (let i = 0; i < sampleStudentProgress.length; i++) {
      const progress = sampleStudentProgress[i];
      // Cycle through available student IDs
      const studentId = studentIds[i % studentIds.length];
      
      await addDoc(collection(db, "progress"), {
        ...progress,
        userId: studentId
      });
    }
    console.log("Sample student progress added");
    
    console.log("Teacher data setup complete!");
  } catch (error) {
    console.error("Error during setup:", error);
  }
}

// Run the setup
setupTeacherData(); 