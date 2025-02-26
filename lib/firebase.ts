import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAnalytics, Analytics } from 'firebase/analytics';

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Create a function to initialize Firebase
function initializeFirebase() {
  // Only initialize Firebase if we're in the browser and have a valid API key
  if (isBrowser && firebaseConfig.apiKey) {
    try {
      const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
      const auth = getAuth(app);
      const db = getFirestore(app);
      const analytics = isBrowser ? getAnalytics(app) : undefined;
      
      return { app, auth, db, analytics };
    } catch (error) {
      console.error('Firebase initialization error:', error);
      return null;
    }
  }
  return null;
}

// Create mock implementations for server-side rendering
const mockAuth = {
  currentUser: null,
  onAuthStateChanged: () => () => {},
} as unknown as Auth;

const mockFirestore = {
  collection: () => ({
    doc: () => ({
      get: () => Promise.resolve({ exists: false, data: () => ({}) }),
      set: () => Promise.resolve(),
    }),
    where: () => ({
      get: () => Promise.resolve({ empty: true, docs: [] }),
    }),
  }),
} as unknown as Firestore;

// Initialize Firebase or use mocks
const firebaseInstance = initializeFirebase();

// Export the initialized services or mocks
export const auth = firebaseInstance?.auth || mockAuth;
export const db = firebaseInstance?.db || mockFirestore;
export const analytics = firebaseInstance?.analytics;

// Export a function to check if Firebase is initialized
export const isFirebaseInitialized = () => !!firebaseInstance; 