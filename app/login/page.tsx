"use client";

import { useState, useEffect, useRef } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';

// Prevent static prerendering
export const dynamic = 'force-dynamic';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const errorRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation('common');

  // Check if we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Focus on error message when it appears
  useEffect(() => {
    if (error && errorRef.current) {
      errorRef.current.focus();
    }
  }, [error]);

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

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Redirect to profile on successful login
      router.push('/profile');
    } catch (error) {
      console.error('Login error:', error);
      setError('Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  // Show a loading state until we confirm we're on the client
  if (!isClient) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="p-8 rounded-lg shadow-md bg-white w-full max-w-md" aria-live="polite">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-gray-600">{t('loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main id="main-content" className="min-h-screen flex justify-center items-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-md p-6 sm:p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">{t('login')} to ProLingo</h1>
            <p className="mt-2 text-gray-600">Welcome back! Please enter your details.</p>
          </div>
          
          {error && (
            <div 
              ref={errorRef}
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4" 
              role="alert"
              aria-live="assertive"
              tabIndex={-1}
            >
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} aria-label="Login form">
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('email')}
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                  required
                  aria-required="true"
                  aria-invalid={!!error}
                  aria-describedby={error ? "login-error" : undefined}
                />
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    {t('password')}
                  </label>
                  <Link 
                    href="/forgot-password" 
                    className="text-sm text-primary hover:text-primary-dark"
                    tabIndex={0}
                  >
                    {t('forgotPassword')}
                  </Link>
                </div>
                <input
                  id="password"
                  type="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                  required
                  aria-required="true"
                  aria-invalid={!!error}
                />
              </div>
            </div>
            
            <div className="mt-6">
              <button
                type="submit"
                className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                disabled={loading}
                aria-busy={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t('loading')}
                  </span>
                ) : (
                  t('login')
                )}
              </button>
            </div>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link 
                href="/register" 
                className="text-primary hover:text-primary-dark font-medium"
                tabIndex={0}
              >
                {t('signUp')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
} 