// Setup script to add sample developer inquiries to Firebase
import { db, auth } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { signInWithEmailAndPassword } from 'firebase/auth';

// Sample developer inquiries
const sampleInquiries = [
  {
    email: 'dev@prolingo.com',
    message: 'I need help with the authentication process in the API. How can I generate a new API key?',
    timestamp: serverTimestamp()
  },
  {
    email: 'integration@company.com',
    message: 'We\'re looking to integrate ProLingo lessons into our educational platform. Can you provide more detailed documentation on the lesson structure?',
    timestamp: serverTimestamp()
  },
  {
    email: 'tech@languageapp.com',
    message: 'The SDK is missing TypeScript definitions. When will these be available?',
    timestamp: serverTimestamp()
  }
];

async function setupDeveloperData() {
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
    
    // Add sample developer inquiries
    console.log("Adding sample developer inquiries...");
    for (const inquiry of sampleInquiries) {
      await addDoc(collection(db, 'developer-inquiries'), {
        ...inquiry,
        userId: user.uid
      });
    }
    console.log("Sample developer inquiries added");
    
    console.log("Developer data setup complete!");
  } catch (error) {
    console.error("Error during setup:", error);
  }
}

// Run the setup
setupDeveloperData(); 