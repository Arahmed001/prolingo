"use client";

import { useEffect } from 'react';

export default function AccessibilityProvider() {
  useEffect(() => {
    // Apply saved font size
    const savedFontSize = localStorage.getItem('accessibility-font-size');
    if (savedFontSize) {
      document.documentElement.style.fontSize = `${savedFontSize}px`;
    }
    
    // Apply saved contrast setting
    const savedContrast = localStorage.getItem('accessibility-high-contrast');
    if (savedContrast === 'true') {
      document.body.classList.add('high-contrast');
    }
  }, []);

  // This component doesn't render anything
  return null;
} 