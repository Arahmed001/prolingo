'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { auth, db } from '../../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function DeveloperPortal() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [email, setEmail] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [formStatus, setFormStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });
  
  const router = useRouter();

  // Check authentication
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        setEmail(user.email || '');
        setLoading(false);
      } else {
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !message) {
      setFormStatus({
        type: 'error',
        message: 'Please fill out all fields'
      });
      return;
    }
    
    try {
      await addDoc(collection(db, 'developer-inquiries'), {
        email,
        message,
        timestamp: serverTimestamp(),
        userId: user?.uid
      });
      
      setFormStatus({
        type: 'success',
        message: 'Your inquiry has been submitted successfully!'
      });
      
      // Reset form
      setMessage('');
    } catch (error) {
      console.error('Error submitting inquiry:', error);
      setFormStatus({
        type: 'error',
        message: 'There was an error submitting your inquiry. Please try again.'
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main id="main-content" id="main-content" className="flex-grow flex items-center justify-center">
          <div className="loader">Loading...</div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main id="main-content" id="main-content" className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-primary mb-8">ProLingo Developer Portal</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* API Documentation */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold mb-4">API Documentation</h2>
              
              <div className="mb-6">
                <h3 className="text-xl font-medium mb-2">Authentication</h3>
                <p className="text-gray-700 mb-3">
                  All API endpoints require authentication using an API key. Include the key in the Authorization header:
                </p>
                <div className="bg-gray-100 p-3 rounded-md">
                  <code>Authorization: Bearer prolingo-api-key</code>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-medium mb-2">Available Endpoints</h3>
                
                <div className="border-l-4 border-primary pl-4 mb-4">
                  <h4 className="font-bold">GET /api/lessons</h4>
                  <p className="text-gray-700 mb-2">Retrieves a list of all available lessons.</p>
                  
                  <div className="mt-3">
                    <p className="font-medium">Response:</p>
                    <pre className="bg-gray-100 p-3 rounded-md mt-1 overflow-x-auto text-sm">
{`[
  {
    "id": "lesson-id",
    "title": "Lesson Title",
    "description": "Lesson description...",
    "level": "A1",
    "difficulty": "Beginner"
  },
  ...
]`}
                    </pre>
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm mt-6">
                  For full API documentation, please visit our 
                  <a tabIndex={0} href="/api/docs" className="text-primary hover:underline ml-1">API docs page</a>.
                </p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold mb-4">SDK & Resources</h2>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <a tabIndex={0} 
                  href="/sdk.zip" 
                  download
                  className="flex items-center justify-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
                >
                  <svg aria-hidden="true" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download SDK
                </a>
                
                <a tabIndex={0} 
                  href="/test" 
                  className="flex items-center justify-center px-4 py-2 bg-white border border-primary text-primary rounded-md hover:bg-gray-50 transition-colors"
                >
                  <svg aria-hidden="true" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  API Test Page
                </a>
              </div>
              
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-2">Integration Code Samples</h3>
                
                <div className="bg-gray-100 p-3 rounded-md mb-3">
                  <p className="font-medium text-sm mb-1">JavaScript</p>
                  <pre className="text-sm overflow-x-auto">
{`fetch('https://prolingo.app/api/lessons', {
  headers: {
    'Authorization': 'Bearer prolingo-api-key'
  }
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));`}
                  </pre>
                </div>
                
                <div className="bg-gray-100 p-3 rounded-md">
                  <p className="font-medium text-sm mb-1">Python</p>
                  <pre className="text-sm overflow-x-auto">
{`import requests

headers = {
    'Authorization': 'Bearer prolingo-api-key'
}

response = requests.get('https://prolingo.app/api/lessons', headers=headers)
data = response.json()
print(data)`}
                  </pre>
                </div>
              </div>
            </div>
          </div>
          
          {/* Contact Form */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <h2 className="text-2xl font-semibold mb-4">Developer Support</h2>
              
              {formStatus.type && (
                <div className={`p-3 rounded-md mb-4 ${
                  formStatus.type === 'success' 
                    ? 'bg-green-50 text-green-800' 
                    : 'bg-red-50 text-red-800'
                }`}>
                  {formStatus.message}
                </div>
              )}
              
              <form aria-label="Form" aria-label="Form" onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="your@email.com"
                    required aria-required="true"
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Message
                  </label>
                  <textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={5}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Describe your question or issue..."
                    required aria-required="true"
                  ></textarea>
                </div>
                
                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
                >
                  Submit Inquiry
                </button>
              </form>
              
              <div className="mt-6 text-center text-sm text-gray-600">
                <p>Need immediate assistance?</p>
                <a tabIndex={0} href="mailto:developer@prolingo.app" className="text-primary hover:underline">
                  developer@prolingo.app
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
} 