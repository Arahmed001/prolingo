'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { auth, db } from '../../lib/firebase/init';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import 'aframe';

// Declare a-frame elements for TypeScript
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'a-scene': any;
      'a-assets': any;
      'a-sky': any;
      'a-plane': any;
      'a-box': any;
      'a-cylinder': any;
      'a-sphere': any;
      'a-entity': any;
      'a-camera': any;
      'a-cursor': any;
      'a-light': any;
      'a-text': any;
    }
  }
}

// Register A-Frame components for interactivity
if (typeof window !== 'undefined') {
  // Custom A-Frame component for object interactions
  require('aframe').registerComponent('vr-object', {
    schema: {
      type: { type: 'string', default: 'book' },
      link: { type: 'string', default: '' },
      audio: { type: 'string', default: '' }
    },
    
    init: function() {
      const el = this.el;
      const data = this.data;
      
      el.addEventListener('click', function() {
        const userId = localStorage.getItem('userId');
        if (!userId) return;
        
        // Record interaction in Firebase
        const logInteraction = async () => {
          try {
            await addDoc(collection(db, 'vr-interactions'), {
              userId: userId,
              object: data.type,
              timestamp: serverTimestamp()
            });
            console.log(`Interaction with ${data.type} logged`);
          } catch (error) {
            console.error("Error logging interaction:", error);
          }
        };
        
        logInteraction();
        
        // Handle different interactions based on object type
        if (data.type === 'book') {
          // Show text and navigate
          const textEl = document.createElement('a-text');
          textEl.setAttribute('value', 'Hello!');
          textEl.setAttribute('position', '0 1 0');
          textEl.setAttribute('align', 'center');
          el.appendChild(textEl);
          
          // Remove text after 2 seconds
          setTimeout(() => {
            if (textEl.parentNode) {
              textEl.parentNode.removeChild(textEl);
            }
          }, 2000);
          
          // Navigate to lesson after a delay
          if (data.link) {
            setTimeout(() => {
              window.location.href = data.link;
            }, 1500);
          }
        }
        else if (data.type === 'speaker') {
          // Play audio
          if (data.audio) {
            const audioEl = new Audio(data.audio);
            audioEl.play();
          }
        }
        else if (data.type === 'quiz') {
          // Navigate to quiz
          if (data.link) {
            window.location.href = data.link;
          }
        }
      });
    }
  });
}

export default function VRPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [vrMode, setVrMode] = useState<boolean>(false);
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const sceneRef = useRef<any>(null);
  const router = useRouter();

  // Check authentication
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        // Store userId in localStorage for A-Frame component access
        localStorage.setItem('userId', user.uid);
        setLoading(false);
      } else {
        router.push('/login');
      }
    });

    return () => {
      unsubscribe();
      localStorage.removeItem('userId');
    };
  }, [router]);

  // Toggle VR mode
  const handleToggleVR = () => {
    if (sceneRef.current) {
      if (!vrMode) {
        sceneRef.current.enterVR();
      } else {
        sceneRef.current.exitVR();
      }
      setVrMode(!vrMode);
    }
  };

  // Toggle high contrast mode
  const handleToggleHighContrast = () => {
    setHighContrast(!highContrast);
  };

  // Text-to-speech function
  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
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
      <main id="main-content" id="main-content" className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-primary mb-6">VR Language Learning Environment</h1>
          
          {/* Controls and settings */}
          <div className="mb-6 flex flex-wrap gap-4">
            <button
              onClick={handleToggleVR} onKeyDown={(e) => { if(e.key === "Enter" || e.key === " ") e.target.click(); }}
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
            >
              {vrMode ? 'Exit VR' : 'Enter VR'}
            </button>
            
            <button
              onClick={handleToggleHighContrast} onKeyDown={(e) => { if(e.key === "Enter" || e.key === " ") e.target.click(); }}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
            >
              {highContrast ? 'Standard Mode' : 'High Contrast Mode'}
            </button>
            
            <button
              onClick={() => speak('Welcome to the VR language learning environment. Click on objects to interact with them.')} onKeyDown={(e) => { if(e.key === "Enter" || e.key === " ") e.target.click(); }}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Text-to-Speech Help
            </button>
          </div>
          
          {/* Non-VR fallback buttons */}
          <div className="mb-8 md:hidden">
            <h2 className="text-xl font-semibold mb-4">Quick Access (Non-VR)</h2>
            <div className="flex flex-wrap gap-3">
              <a tabIndex={0} href="/lessons/1" className="bg-green-500 text-white px-4 py-2 rounded-lg">
                Book (Lesson 1)
              </a>
              <button aria-label="Button" tabIndex={0} tabIndex={0} 
                onClick={() => new Audio('https://freesound.org/data/previews/66/66717_9316-lq.mp3').play()} onKeyDown={(e) => { if(e.key === "Enter" || e.key === " ") e.target.click(); }}
                className="bg-yellow-500 text-white px-4 py-2 rounded-lg"
              >
                Speaker (Play Audio)
              </button>
              <a tabIndex={0} href="/quiz/1" className="bg-red-500 text-white px-4 py-2 rounded-lg">
                Quiz 1
              </a>
            </div>
          </div>
          
          {/* A-Frame VR Scene */}
          <div className={`relative w-full ${highContrast ? 'contrast-high' : ''}`} style={{ height: '600px' }}>
            <a-scene
              ref={sceneRef}
              embedded
              loading-screen="enabled: false"
              vr-mode-ui="enabled: true"
              keyboard-shortcuts="enterVR: true; exitVR: true;"
            >
              {/* A-Frame assets */}
              <a-assets>
                <img id="sky-texture" src="/images/classroom-360.jpg" alt="" />
                <img id="floor-texture" src="/images/floor.jpg" alt="" />
                <img id="book-texture" src="/images/book.jpg" alt="" />
                <audio id="click-sound" src="https://freesound.org/data/previews/66/66717_9316-lq.mp3"></audio>
              </a-assets>
              
              {/* Sky and environment */}
              <a-sky color={highContrast ? "#000000" : "#87CEEB"}></a-sky>
              <a-plane 
                position="0 0 0" 
                rotation="-90 0 0" 
                width="20" 
                height="20" 
                color={highContrast ? "#FFFFFF" : "#7BC8A4"}
              ></a-plane>
              
              {/* Classroom furniture */}
              <a-box 
                position="-3 0.5 -5" 
                width="4" 
                height="1" 
                depth="2" 
                color={highContrast ? "#FFFFFF" : "#8B4513"}
                shadow
              ></a-box>
              
              <a-box 
                position="3 0.5 -5" 
                width="4" 
                height="1" 
                depth="2" 
                color={highContrast ? "#FFFFFF" : "#8B4513"}
                shadow
              ></a-box>
              
              {/* Interactive objects */}
              {/* Book */}
              <a-box
                position="-2 1.1 -5"
                width="0.5"
                height="0.1"
                depth="0.7"
                color={highContrast ? "#FFFF00" : "#1E88E5"}
                shadow
                animation="property: rotation; to: 0 360 0; loop: true; dur: 20000; easing: linear;"
                vr-object="type: book; link: /lessons/1"
              >
                <a-text 
                  value="Book" 
                  position="0 0.1 0" 
                  align="center" 
                  color={highContrast ? "#000000" : "#FFFFFF"}
                  scale="0.5 0.5 0.5"
                ></a-text>
              </a-box>
              
              {/* Speaker */}
              <a-cylinder
                position="0 1.1 -5"
                radius="0.3"
                height="0.5"
                color={highContrast ? "#FF00FF" : "#E53935"}
                shadow
                animation="property: position; to: 0 1.3 -5; dir: alternate; dur: 2000; loop: true; easing: easeInOutCubic"
                vr-object="type: speaker; audio: https://freesound.org/data/previews/66/66717_9316-lq.mp3"
              >
                <a-text 
                  value="Speaker" 
                  position="0 0.4 0" 
                  align="center" 
                  color={highContrast ? "#000000" : "#FFFFFF"}
                  scale="0.5 0.5 0.5"
                ></a-text>
              </a-cylinder>
              
              {/* Quiz button */}
              <a-sphere
                position="2 1.1 -5"
                radius="0.4"
                color={highContrast ? "#00FFFF" : "#43A047"}
                shadow
                animation="property: scale; to: 1.1 1.1 1.1; dir: alternate; dur: 1000; loop: true; easing: easeInOutCubic"
                vr-object="type: quiz; link: /quiz/1"
              >
                <a-text 
                  value="Quiz" 
                  position="0 0.5 0" 
                  align="center" 
                  color={highContrast ? "#000000" : "#FFFFFF"}
                  scale="0.5 0.5 0.5"
                ></a-text>
              </a-sphere>
              
              {/* Lighting */}
              <a-light type="ambient" color="#BBB"></a-light>
              <a-light type="directional" position="0 1 1" intensity="0.6"></a-light>
              
              {/* Camera and controls */}
              <a-entity position="0 1.6 0">
                <a-camera>
                  <a-cursor color={highContrast ? "#FFFF00" : "#FFFFFF"}></a-cursor>
                </a-camera>
              </a-entity>
            </a-scene>
          </div>
          
          {/* Recommendations */}
          <div className="mt-8 p-6 bg-gray-50 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Recommended Next Steps</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <a tabIndex={0} href="/lessons/1" className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-primary">Basic Greetings</h3>
                <p className="text-gray-600 text-sm mt-1">Learn essential greeting phrases</p>
              </a>
              <a tabIndex={0} href="/lessons/2" className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-primary">Common Phrases</h3>
                <p className="text-gray-600 text-sm mt-1">Everyday expressions you'll need</p>
              </a>
              <a tabIndex={0} href="/quiz/1" className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-primary">Starter Quiz</h3>
                <p className="text-gray-600 text-sm mt-1">Test your beginner knowledge</p>
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
} 