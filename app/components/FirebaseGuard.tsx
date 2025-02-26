"use client";

import { ReactNode, useEffect, useState } from 'react';
import { isFirebaseInitialized } from '../../lib/firebase';

interface FirebaseGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * A component that only renders its children when Firebase is initialized.
 * This prevents Firebase-related errors during server-side rendering and static site generation.
 */
export default function FirebaseGuard({ children, fallback }: FirebaseGuardProps) {
  const [isClient, setIsClient] = useState(false);
  
  // This effect will only run in the browser
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // If we're on the server or Firebase isn't initialized, show the fallback
  if (!isClient || !isFirebaseInitialized()) {
    return fallback ? (
      <>{fallback}</>
    ) : (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-6 max-w-sm mx-auto">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading...</h2>
          <p className="text-gray-600">Please wait while we set up your experience.</p>
        </div>
      </div>
    );
  }
  
  // If we're in the browser and Firebase is initialized, render the children
  return <>{children}</>;
} 