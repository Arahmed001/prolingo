const { db } = require('../../lib/firebase');
const { collection, addDoc } = require('firebase/firestore');

async function setupCommunityData() {
  try {
    // Add sample user content
    const userContentCollection = collection(db, 'user-content');
    await addDoc(userContentCollection, {
      title: 'A1 Tips',
      content: 'Practice greetings daily! Start with "Hello", "Good morning", and "How are you?"',
      author: 'test@prolingo.com',
      timestamp: new Date(),
      likes: 0
    });

    await addDoc(userContentCollection, {
      title: 'My Learning Journey',
      content: 'I started at A1 level and now I\'m at B1. Here\'s what helped me: daily practice, watching movies with subtitles, and using Prolingo!',
      author: 'user1@prolingo.com',
      timestamp: new Date(),
      likes: 5
    });

    await addDoc(userContentCollection, {
      title: 'Conversation Practice Tips',
      content: 'Find a language exchange partner and practice for at least 30 minutes every day. It really helps with confidence!',
      author: 'user2@prolingo.com',
      timestamp: new Date(),
      likes: 3
    });

    // Add sample users for partner matching
    const usersCollection = collection(db, 'users');
    await addDoc(usersCollection, {
      email: 'user1@prolingo.com',
      level: 'A1',
      interests: ['conversation practice', 'grammar'],
      nativeLanguage: 'English',
      learningLanguage: 'Spanish'
    });

    await addDoc(usersCollection, {
      email: 'user2@prolingo.com',
      level: 'B1',
      interests: ['writing', 'reading'],
      nativeLanguage: 'Spanish',
      learningLanguage: 'English'
    });

    await addDoc(usersCollection, {
      email: 'user3@prolingo.com',
      level: 'A2',
      interests: ['speaking', 'listening'],
      nativeLanguage: 'English',
      learningLanguage: 'Spanish'
    });

    console.log('Sample community data has been added successfully!');
  } catch (error) {
    console.error('Error setting up community data:', error);
  }
}

setupCommunityData(); 