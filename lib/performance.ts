import { useEffect } from 'react';
import { db } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Custom hook to measure and log page load performance
 * @param page The page path being measured
 * @returns void
 */
export function usePerformanceMonitoring(page: string): void {
  useEffect(() => {
    // Performance measurement
    const measurePageLoad = async () => {
      try {
        // Get performance metrics if available
        if (window.performance) {
          const perfData = window.performance.timing;
          const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
          
          // Only log if we have valid data
          if (pageLoadTime > 0) {
            // Log to Firebase
            await addDoc(collection(db, 'performance'), {
              page,
              loadTime: pageLoadTime,
              timestamp: serverTimestamp(),
              // Additional metrics
              domComplete: perfData.domComplete - perfData.domLoading,
              networkLatency: perfData.responseEnd - perfData.requestStart,
              renderTime: perfData.domComplete - perfData.responseEnd,
              userAgent: navigator.userAgent,
            });
            
            // Optionally log to console during development
            if (process.env.NODE_ENV === 'development') {
              console.log(`Page load performance (${page}):`, {
                totalLoadTime: `${pageLoadTime}ms`,
                domProcessing: `${perfData.domComplete - perfData.domLoading}ms`,
                networkLatency: `${perfData.responseEnd - perfData.requestStart}ms`,
                renderTime: `${perfData.domComplete - perfData.responseEnd}ms`,
              });
            }
          }
        }
      } catch (error) {
        // Don't crash the app if performance monitoring fails
        console.error('Error logging performance data:', error);
      }
    };

    // Ensure we measure after the page has fully loaded
    if (document.readyState === 'complete') {
      measurePageLoad();
    } else {
      window.addEventListener('load', measurePageLoad);
      return () => window.removeEventListener('load', measurePageLoad);
    }
  }, [page]);
}

/**
 * Utility function to capture more detailed performance metrics
 * Can be used for specific user interactions beyond page load
 */
export async function logPerformanceEvent(
  eventName: string, 
  duration: number,
  additionalData: Record<string, any> = {}
): Promise<void> {
  try {
    await addDoc(collection(db, 'performance_events'), {
      event: eventName,
      duration,
      timestamp: serverTimestamp(),
      ...additionalData
    });
  } catch (error) {
    console.error(`Error logging performance event ${eventName}:`, error);
  }
} 