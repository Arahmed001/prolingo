'use client';

import { auth } from '../../lib/firebase/auth';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useState } from 'react';

export default function TestPage() {
  const [status, setStatus] = useState<string>('');

  const testLogin = async () => {
    try {
      const result = await signInWithEmailAndPassword(
        auth,
        'test@prolingo.com',
        'password123'
      );
      console.log('Success', result.user);
      setStatus('Logged in successfully!');
    } catch (error) {
      console.error('Login failed:', error);
      setStatus('Login failed. Check console for details.');
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Firebase Auth Test</h1>
      <button
        onClick={testLogin}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Test Login
      </button>
      {status && <p className="mt-4">{status}</p>}
    </div>
  );
} 