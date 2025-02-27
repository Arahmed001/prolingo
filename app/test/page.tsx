'use client';

import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

interface Lesson {
  id: string;
  title: string;
  description: string;
  level: string;
  difficulty: string;
}

export default function TestAPIPage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<number | null>(null);

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/lessons', {
          headers: {
            'Authorization': 'Bearer prolingo-api-key'
          }
        });
        
        setStatus(response.status);
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch lessons');
        }
        
        setLessons(Array.isArray(data) ? data : []);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setLessons([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLessons();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main id="main-content" id="main-content" className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">API Test Page</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">API Endpoint Test: GET /api/lessons</h2>
          
          <div className="mb-4">
            <p className="text-gray-700">
              <strong>Status:</strong> {status !== null ? status : 'Pending'}
            </p>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="loader"></div>
              <p className="ml-3">Loading lessons data...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-4">
              <p><strong>Error:</strong> {error}</p>
            </div>
          ) : (
            <div>
              <p className="mb-4">
                <strong>Total Lessons:</strong> {lessons.length}
              </p>
              
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto bg-white border border-gray-200">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-4 py-2 text-left border-b">ID</th>
                      <th className="px-4 py-2 text-left border-b">Title</th>
                      <th className="px-4 py-2 text-left border-b">Description</th>
                      <th className="px-4 py-2 text-left border-b">Level</th>
                      <th className="px-4 py-2 text-left border-b">Difficulty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lessons.length > 0 ? (
                      lessons.map(lesson => (
                        <tr key={lesson.id} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-2 text-sm">{lesson.id}</td>
                          <td className="px-4 py-2">{lesson.title}</td>
                          <td className="px-4 py-2 text-sm">
                            {lesson.description.length > 50 
                              ? `${lesson.description.substring(0, 50)}...` 
                              : lesson.description}
                          </td>
                          <td className="px-4 py-2">{lesson.level}</td>
                          <td className="px-4 py-2">{lesson.difficulty}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-4 py-4 text-center text-gray-500">
                          No lessons available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">API Documentation</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg">GET /api/lessons</h3>
              <p className="text-gray-700 mb-2">Retrieves a list of all available lessons.</p>
              
              <div className="bg-gray-50 p-4 rounded-lg mb-2">
                <p className="font-medium">Headers:</p>
                <code className="block bg-gray-100 p-2 rounded mt-1">
                  Authorization: Bearer prolingo-api-key
                </code>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-medium">Response:</p>
                <code className="block bg-gray-100 p-2 rounded mt-1">
                  [&#123;<br />
                  &nbsp;&nbsp;"id": "lesson-id",<br />
                  &nbsp;&nbsp;"title": "Lesson Title",<br />
                  &nbsp;&nbsp;"description": "Lesson description...",<br />
                  &nbsp;&nbsp;"level": "A1",<br />
                  &nbsp;&nbsp;"difficulty": "Beginner"<br />
                  &#125;, ...]
                </code>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold">Error Responses:</h3>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li>
                  <strong>401 Unauthorized</strong>: Missing or invalid API key
                  <code className="block bg-gray-100 p-2 rounded mt-1">
                    &#123; "error": "Unauthorized" &#125;
                  </code>
                </li>
                <li>
                  <strong>500 Internal Server Error</strong>: Server-side error
                  <code className="block bg-gray-100 p-2 rounded mt-1">
                    &#123; "error": "Failed to fetch lessons" &#125;
                  </code>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
} 