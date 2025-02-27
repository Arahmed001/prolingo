// Setup script for Prolingo
// Run with: node setup-prolingo.js

const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  collection, 
  addDoc, 
  doc, 
  setDoc,
  serverTimestamp
} = require('firebase/firestore');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');

// Your Firebase configuration
const firebaseConfig = {
  // Replace with your Firebase project configuration
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Sample lesson data with quiz
const sampleLesson = {
  title: "Basic Greetings and Introductions",
  description: "Learn how to greet people and introduce yourself in a new language.",
  content: "Greetings are an essential part of any language. They are the first thing you learn and use every day. In this lesson, we'll cover basic greetings, introductions, and simple conversations.\n\nStart by learning how to say 'hello' and 'goodbye' in different situations. Then, practice introducing yourself with your name and asking others for theirs.",
  difficulty: "Beginner",
  level: "A1",
  vocabulary: [
    "hello", "goodbye", "morning", "afternoon", "evening",
    "name", "pleased", "meet", "how", "are", "you"
  ],
  grammar: [
    "Simple present tense",
    "Personal pronouns",
    "Question formation"
  ],
  quiz: [
    {
      question: "Which phrase would you use to greet someone in the morning?",
      options: ["Good morning", "Good evening", "Good night", "Goodbye"],
      correctAnswer: "Good morning"
    },
    {
      question: "How would you ask someone's name?",
      options: ["How are you?", "What is your name?", "Where are you from?", "How old are you?"],
      correctAnswer: "What is your name?"
    },
    {
      question: "Which is the correct way to introduce yourself?",
      options: ["I'm called John", "My name is John", "They call me John", "All of the above"],
      correctAnswer: "All of the above"
    }
  ]
};

// Sample chat messages with sentiment
const sampleChats = [
  {
    message: "This is really hard, I don't understand these grammar rules.",
    isUser: true,
    timestamp: serverTimestamp(),
    sentiment: "negative"
  },
  {
    message: "I understand this might be challenging. Let's try a different approach or something easier. What specific part are you finding difficult?",
    isUser: false,
    timestamp: serverTimestamp(),
    sentiment: "neutral"
  },
  {
    message: "The conditional tenses are confusing me.",
    isUser: true,
    timestamp: serverTimestamp(),
    sentiment: "negative"
  },
  {
    message: "Let's break down conditional tenses step by step. There are different types, but we'll start with the basics. Would you like me to explain with some examples?",
    isUser: false,
    timestamp: serverTimestamp(),
    sentiment: "neutral"
  },
  {
    message: "Yes please, that would be really helpful!",
    isUser: true,
    timestamp: serverTimestamp(),
    sentiment: "positive"
  },
  {
    message: "Great! Let's start with the first conditional, which we use to talk about real possibilities in the future. The structure is: If + present simple, will + infinitive. For example: 'If it rains tomorrow, I will stay at home.'",
    isUser: false,
    timestamp: serverTimestamp(),
    sentiment: "neutral"
  },
  {
    message: "Oh, that makes sense! I think I'm getting it now.",
    isUser: true,
    timestamp: serverTimestamp(),
    sentiment: "positive"
  }
];

// Sample progress data
const sampleProgress = [
  {
    lessonId: "lesson1",
    score: 90,
    completed: true,
    timestamp: serverTimestamp()
  },
  {
    lessonId: "lesson1",
    score: 85,
    completed: true,
    timestamp: serverTimestamp()
  },
  {
    lessonId: "lesson1",
    score: 95,
    completed: true,
    timestamp: serverTimestamp()
  },
  {
    lessonId: "lesson2",
    score: 45,
    completed: true,
    timestamp: serverTimestamp()
  },
  {
    lessonId: "lesson2",
    score: 40,
    completed: true,
    timestamp: serverTimestamp()
  },
  {
    lessonId: "lesson2",
    score: 48,
    completed: true,
    timestamp: serverTimestamp()
  }
];

// Sample VR interaction data
const sampleVRInteractions = [
  {
    object: "book",
    timestamp: serverTimestamp()
  },
  {
    object: "speaker",
    timestamp: serverTimestamp()
  },
  {
    object: "quiz",
    timestamp: serverTimestamp()
  }
];

// Sample developer inquiries
const sampleDeveloperInquiries = [
  {
    email: 'dev@prolingo.com',
    message: 'Need API help with authentication',
    timestamp: serverTimestamp()
  },
  {
    email: 'integration@company.com',
    message: 'Looking to integrate ProLingo with our platform',
    timestamp: serverTimestamp()
  }
];

// Sample lesson plans
const sampleLessonPlans = [
  {
    lessonId: null, // Will be replaced with the actual lesson ID
    lessonTitle: "Basic Greetings and Introductions",
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
  }
];

// Sample student progress data
const sampleStudentProgress = [
  {
    lessonId: null, // Will be replaced with the actual lesson ID
    score: 92,
    completed: true,
    timestamp: serverTimestamp()
  },
  {
    lessonId: null, // Will be replaced with the actual lesson ID
    score: 78,
    completed: true,
    timestamp: serverTimestamp()
  },
  {
    lessonId: null, // Will be replaced with the actual lesson ID
    score: 65,
    completed: true,
    timestamp: serverTimestamp()
  }
];

async function setup() {
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
    
    // Add sample lesson
    console.log("Adding sample lesson...");
    const lessonRef = await addDoc(collection(db, "lessons"), sampleLesson);
    console.log("Sample lesson added with ID:", lessonRef.id);
    
    // Add sample chats
    console.log("Adding sample chats...");
    for (const chat of sampleChats) {
      await addDoc(collection(db, "chats"), {
        ...chat,
        userId: user.uid
      });
    }
    console.log("Sample chats added");
    
    // Add sample progress
    console.log("Adding sample progress...");
    for (const progress of sampleProgress) {
      await addDoc(collection(db, "progress"), {
        ...progress,
        userId: user.uid,
        lessonId: lessonRef.id
      });
    }
    console.log("Sample progress added");
    
    // Add sample VR interactions
    console.log("Adding sample VR interactions...");
    for (const interaction of sampleVRInteractions) {
      await addDoc(collection(db, "vr-interactions"), {
        ...interaction,
        userId: user.uid
      });
    }
    console.log("Sample VR interactions added");
    
    // Add sample developer inquiries
    console.log("Adding sample developer inquiries...");
    for (const inquiry of sampleDeveloperInquiries) {
      await addDoc(collection(db, "developer-inquiries"), {
        ...inquiry,
        userId: user.uid
      });
    }
    console.log("Sample developer inquiries added");
    
    // Add sample lesson plans
    console.log("Adding sample lesson plans...");
    for (const plan of sampleLessonPlans) {
      await addDoc(collection(db, "lesson-plans"), {
        ...plan,
        lessonId: lessonRef.id,
        teacherId: user.uid
      });
    }
    console.log("Sample lesson plans added");
    
    // Add sample student progress
    console.log("Adding sample student progress...");
    for (const progress of sampleStudentProgress) {
      await addDoc(collection(db, "progress"), {
        ...progress,
        lessonId: lessonRef.id,
        userId: user.uid
      });
    }
    console.log("Sample student progress added");
    
    console.log("Setup complete!");
  } catch (error) {
    console.error("Error during setup:", error);
  }
}

setup(); 