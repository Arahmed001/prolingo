// This file is specifically for server-side Firebase operations
// It will not be used in the browser

// Mock implementations for server-side rendering
const mockAuth = {
  currentUser: null,
  onAuthStateChanged: () => () => {},
  signInWithEmailAndPassword: () => Promise.resolve({}),
  createUserWithEmailAndPassword: () => Promise.resolve({}),
  signOut: () => Promise.resolve(),
};

const mockFirestore = {
  collection: () => ({
    doc: () => ({
      get: () => Promise.resolve({ 
        exists: false, 
        data: () => ({}),
        id: 'mock-id' 
      }),
      set: () => Promise.resolve(),
    }),
    where: () => ({
      get: () => Promise.resolve({ 
        empty: true, 
        docs: [] 
      }),
    }),
    orderBy: () => ({
      get: () => Promise.resolve({ 
        empty: true, 
        docs: [] 
      }),
    }),
    add: () => Promise.resolve({ id: 'mock-id' }),
  }),
  doc: () => ({
    get: () => Promise.resolve({ 
      exists: false, 
      data: () => ({}),
      id: 'mock-id' 
    }),
    set: () => Promise.resolve(),
  }),
};

// Export the mock implementations
export const serverAuth = mockAuth;
export const serverDb = mockFirestore; 