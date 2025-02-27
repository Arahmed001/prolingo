"use client";

import { useState, useEffect } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Prevent static prerendering
export const dynamic = 'force-dynamic';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('teacher'); // Default role
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  // Check if we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      setError('Authentication is only available in the browser');
      setLoading(false);
      return;
    }

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Create user document in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email,
        role,
        createdAt: serverTimestamp()
      });

      // Redirect to login page on success
      router.push('/login');
    } catch (error) {
      console.error('Registration error:', error);
      setError('Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // Show a loading state until we confirm we're on the client
  if (!isClient) {
    return (
      <div id="main-content" className="min-h-screen flex items-center justify-center bg-muted">
        <div id="main-content" className="text-xl font-medium text-primary">Loading...</div>
      </div>
    );
  }

  return (
    <div id="main-content" className="min-h-screen flex items-center justify-center bg-muted py-12 px-4 sm:px-6 lg:px-8">
      <div id="main-content" className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-primary">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Or{' '}
            <Link tabIndex={0} tabIndex={0} href="/login" className="font-medium text-secondary hover:text-secondary/80">
              sign in to your existing account
            </Link>
          </p>
        </div>
        <form aria-label="Form" aria-label="Form" className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div id="main-content" className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required aria-required="true"
                className="appearance-none relative block w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required aria-required="true"
                className="appearance-none relative block w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                autoComplete="new-password"
                required aria-required="true"
                className="appearance-none relative block w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                I am a
              </label>
              <select
                id="role"
                name="role"
                className="appearance-none relative block w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="teacher">Teacher</option>
                <option value="student">Student</option>
                <option value="school_admin">School Administrator</option>
              </select>
            </div>
          </div>

          {error && (
            <div id="main-content" className="text-red-500 text-sm text-center">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 