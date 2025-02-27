"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Prevent static prerendering
export const dynamic = 'force-dynamic';

export default function QuizIndexRedirectPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to the lessons page
    router.replace('/lessons');
  }, [router]);
  
  return (
    <div id="main-content" className="min-h-screen flex items-center justify-center">
      <div id="main-content" className="text-base sm:text-lg font-medium text-primary">
        Redirecting to lessons...
      </div>
    </div>
  );
} 