"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AccessibilityPage() {
  const [fontSize, setFontSize] = useState(16);
  const [highContrast, setHighContrast] = useState(false);

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedFontSize = localStorage.getItem('accessibility-font-size');
    const savedContrast = localStorage.getItem('accessibility-high-contrast');
    
    if (savedFontSize) {
      setFontSize(parseInt(savedFontSize));
      document.documentElement.style.fontSize = `${savedFontSize}px`;
    }
    
    if (savedContrast === 'true') {
      setHighContrast(true);
      document.body.classList.add('high-contrast');
    }
  }, []);

  // Update font size
  const handleFontSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSize = parseInt(e.target.value);
    setFontSize(newSize);
    document.documentElement.style.fontSize = `${newSize}px`;
    localStorage.setItem('accessibility-font-size', newSize.toString());
  };

  // Toggle contrast mode
  const toggleContrast = () => {
    const newContrastValue = !highContrast;
    setHighContrast(newContrastValue);
    
    if (newContrastValue) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
    
    localStorage.setItem('accessibility-high-contrast', newContrastValue.toString());
  };

  return (
    <main id="main-content" className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto max-w-4xl px-4 sm:px-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Accessibility at ProLingo</h1>
        
        <section aria-labelledby="commitment-heading" className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 id="commitment-heading" className="text-xl font-semibold text-gray-900 mb-4">Our Commitment</h2>
          <p className="text-gray-700 mb-4">
            At ProLingo, we are committed to ensuring our platform is accessible to all users, including those with disabilities. 
            We strive to comply with WCAG 2.1 guidelines and continuously work to improve the accessibility of our services.
          </p>
          <p className="text-gray-700">
            Our development team follows best practices for creating accessible web applications, including proper semantic HTML, 
            ARIA attributes, keyboard navigation support, and color contrast compliance.
          </p>
        </section>
        
        <section aria-labelledby="features-heading" className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 id="features-heading" className="text-xl font-semibold text-gray-900 mb-4">Accessibility Features</h2>
          <ul className="space-y-3 text-gray-700 list-disc pl-5">
            <li>Skip to content links to bypass navigation</li>
            <li>Keyboard navigation support throughout the application</li>
            <li>Screen reader friendly content with proper ARIA attributes</li>
            <li>Sufficient color contrast for text visibility</li>
            <li>Responsive design that supports zoom up to 200%</li>
            <li>Text alternatives for non-text content</li>
            <li>Clear form labels and error messages</li>
            <li>Consistent and predictable navigation</li>
          </ul>
        </section>
        
        <section aria-labelledby="resources-heading" className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 id="resources-heading" className="text-xl font-semibold text-gray-900 mb-4">Accessibility Resources</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">For Users</h3>
              <ul className="space-y-2 text-gray-700 list-disc pl-5">
                <li>
                  <Link href="/help/accessibility" className="text-primary hover:underline" tabIndex={0}>
                    How to use ProLingo with a screen reader
                  </Link>
                </li>
                <li>
                  <Link href="/help/keyboard-shortcuts" className="text-primary hover:underline" tabIndex={0}>
                    Keyboard shortcuts guide
                  </Link>
                </li>
                <li>
                  <Link href="/help/customize-display" className="text-primary hover:underline" tabIndex={0}>
                    Display customization options
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">For Developers</h3>
              <ul className="space-y-2 text-gray-700 list-disc pl-5">
                <li>
                  <Link href="/accessibility/component-guide" className="text-primary hover:underline" tabIndex={0}>
                    Accessible component examples
                  </Link>
                </li>
                <li>
                  <a 
                    href="https://github.com/prolingo/accessibility" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-primary hover:underline"
                    tabIndex={0}
                  >
                    Our accessibility documentation on GitHub
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </section>
        
        <section aria-labelledby="feedback-heading" className="bg-white rounded-lg shadow-sm p-6">
          <h2 id="feedback-heading" className="text-xl font-semibold text-gray-900 mb-4">Feedback and Support</h2>
          <p className="text-gray-700 mb-4">
            We welcome your feedback on the accessibility of ProLingo. Please let us know if you encounter any barriers 
            to accessing our content or functionality.
          </p>
          <div className="flex flex-col sm:flex-row sm:space-x-4">
            <Link 
              href="/contact?subject=Accessibility"
              className="btn-primary text-center mb-3 sm:mb-0"
              tabIndex={0}
              role="button"
              aria-label="Contact us about accessibility"
            >
              Contact Us
            </Link>
            <Link 
              href="/help/request"
              className="btn-secondary text-center"
              tabIndex={0}
              role="button"
              aria-label="Request accessibility assistance"
            >
              Request Assistance
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
} 