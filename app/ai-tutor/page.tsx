'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  serverTimestamp 
} from 'firebase/firestore';
import Header from '../components/Header';
import Footer from '../components/Footer';

// Initialize Firebase (assumes firebase app is initialized elsewhere)
const db = getFirestore();
const auth = getAuth();

interface Message {
  id?: string;
  message: string;
  isUser: boolean;
  timestamp: any;
  sentiment: 'positive' | 'negative' | 'neutral';
}

export default function AITutorPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Check authentication status
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        setLoading(false);
      } else {
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Load messages from Firebase
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'chats'),
      where('userId', '==', user.uid),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messageList: Message[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        messageList.push({
          id: doc.id,
          message: data.message,
          isUser: data.isUser,
          timestamp: data.timestamp,
          sentiment: data.sentiment || 'neutral'
        });
      });
      setMessages(messageList);
    });

    return () => unsubscribe();
  }, [user]);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Analyse sentiment using keyword-based approach
  const analyseSentiment = (message: string): 'positive' | 'negative' | 'neutral' => {
    const lowerCaseMessage = message.toLowerCase();
    
    const positiveKeywords = ['great', 'happy', 'easy', 'good', 'wonderful', 'excellent', 'love', 'enjoy'];
    const negativeKeywords = ['hard', 'difficult', 'frustrated', 'bad', 'confusing', 'confused', 'struggle', 'hate'];
    
    const hasPositive = positiveKeywords.some(keyword => lowerCaseMessage.includes(keyword));
    const hasNegative = negativeKeywords.some(keyword => lowerCaseMessage.includes(keyword));
    
    if (hasPositive && !hasNegative) return 'positive';
    if (hasNegative && !hasPositive) return 'negative';
    return 'neutral';
  };

  // Generate AI response based on sentiment
  const generateResponse = (userMessage: string, sentiment: 'positive' | 'negative' | 'neutral'): string => {
    switch (sentiment) {
      case 'positive':
        return "Great job! I'm glad you're enjoying your learning experience. Let's continue with more exciting content!";
      case 'negative':
        return "I understand this might be challenging. Let's try a different approach or something easier. What specific part are you finding difficult?";
      case 'neutral':
      default:
        return "How can I help you with your language learning today? Would you like to practice vocabulary, grammar, or conversation?";
    }
  };

  // Handle sending a message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !user) return;

    const sentiment = analyseSentiment(inputMessage);
    
    // Add user message to Firebase
    const userMessage: Message = {
      message: inputMessage,
      isUser: true,
      timestamp: serverTimestamp(),
      sentiment
    };
    
    try {
      await addDoc(collection(db, 'chats'), {
        ...userMessage,
        userId: user.uid
      });
      
      // Generate AI response
      const aiResponse = generateResponse(inputMessage, sentiment);
      
      // Add AI response to Firebase
      await addDoc(collection(db, 'chats'), {
        message: aiResponse,
        isUser: false,
        timestamp: serverTimestamp(),
        sentiment: 'neutral',
        userId: user.uid
      });
      
      setInputMessage('');
    } catch (error) {
      console.error("Error adding message: ", error);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main id="main-content" className="flex-grow flex items-center justify-center">
          <div className="loader">Loading...</div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main id="main-content" className="flex-grow container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-primary mb-6">AI Language Tutor</h1>
          
          {/* Chat messages */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4 h-[500px] overflow-y-auto">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-10">
                <p>No messages yet. Start chatting with your AI Tutor!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg, index) => (
                  <div 
                    key={msg.id || index}
                    className={`p-3 rounded-lg max-w-[80%] ${
                      msg.isUser 
                        ? 'bg-blue-100 ml-auto' 
                        : 'bg-green-100'
                    }`}
                  >
                    <p>{msg.message}</p>
                    <div className="text-xs text-gray-500 mt-1">
                      {msg.isUser ? 'You' : 'AI Tutor'} 
                      {msg.isUser && ` • Sentiment: ${msg.sentiment}`}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
          
          {/* Message input */}
          <form aria-label="Form" onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your message here..."
              className="flex-grow p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <button
              type="submit"
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
            >
              Send
            </button>
          </form>
          
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h2 className="font-bold text-lg mb-2">AI Tutor Features:</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Ask questions about grammar, vocabulary, or pronunciation</li>
              <li>Practice conversation with natural language responses</li>
              <li>Get feedback on your language learning progress</li>
              <li>AI adapts based on your sentiment to provide better support</li>
            </ul>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
} 