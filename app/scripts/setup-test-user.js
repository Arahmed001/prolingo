// Script to set up a test user with CEFR level in Firebase
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc } = require('firebase/firestore');
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth');

// Your Firebase configuration
const firebaseConfig = {
  // Add your Firebase config here
  // This should match the config in your lib/firebase.js file
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

async function setupTestUser() {
  try {
    // Create a test user or update if exists
    const email = 'test@prolingo.com';
    const password = 'testpassword123';
    
    try {
      // Try to create the user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('Test user created:', userCredential.user.uid);
      
      // Set user data with CEFR level
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email: email,
        level: 'A1',
        createdAt: new Date().toISOString()
      });
      
      console.log('User data set with CEFR level A1');
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        console.log('User already exists. You can sign in with this email and password.');
        
        // You would need to sign in and get the UID to update the user data
        // For simplicity, we'll just provide instructions
        console.log('To update the user level, sign in and run:');
        console.log('const userRef = doc(db, "users", auth.currentUser.uid);');
        console.log('await updateDoc(userRef, { level: "A1" });');
      } else {
        throw error;
      }
    }
    
    // Create some sample lessons if needed
    console.log('Setup complete!');
    
  } catch (error) {
    console.error('Error setting up test user:', error);
  }
}

setupTestUser();
