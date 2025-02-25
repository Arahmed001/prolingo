"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Prevent static prerendering
export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to profile page
    router.push('/profile');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted">
      <div className="text-xl font-medium text-primary">Redirecting to profile...</div>
    </div>
  );
} 