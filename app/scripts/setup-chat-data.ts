import { db } from '../../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

// Replace with a test user ID
const TEST_USER_ID = 'test_user_123';

async function setupChatData() {
  try {
    const chatsCollection = collection(db, 'chats');

    // Add sample conversation
    await addDoc(chatsCollection, {
      userId: TEST_USER_ID,
      message: 'Hello',
      isUser: true,
      timestamp: serverTimestamp()
    });

    await addDoc(chatsCollection, {
      userId: TEST_USER_ID,
      message: 'Hi! How can I help you practice English today?',
      isUser: false,
      timestamp: serverTimestamp()
    });

    await addDoc(chatsCollection, {
      userId: TEST_USER_ID,
      message: 'Can we practice talking about the weather?',
      isUser: true,
      timestamp: serverTimestamp()
    });

    await addDoc(chatsCollection, {
      userId: TEST_USER_ID,
      message: 'That\'s a great topic! Let\'s practice describing weather. Can you tell me what the weather is like today?',
      isUser: false,
      timestamp: serverTimestamp()
    });

    await addDoc(chatsCollection, {
      userId: TEST_USER_ID,
      message: 'It\'s sunny and warm today!',
      isUser: true,
      timestamp: serverTimestamp()
    });

    await addDoc(chatsCollection, {
      userId: TEST_USER_ID,
      message: 'Great description! Can you add more details? For example, the temperature or if there are any clouds?',
      isUser: false,
      timestamp: serverTimestamp()
    });

    console.log('Sample chat data has been added successfully!');
  } catch (error) {
    console.error('Error setting up chat data:', error);
  }
}

setupChatData(); 