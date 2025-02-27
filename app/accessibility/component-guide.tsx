"use client";

import React from 'react';
import Link from 'next/link';

/**
 * This component serves as a reference guide for creating accessible components
 * in the ProLingo application. It provides examples of properly implemented
 * accessibility features for common UI components.
 */
export default function AccessibilityComponentGuide() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-border" role="banner">
        <div className="container mx-auto max-w-7xl px-4 py-4">
          <h1 className="text-2xl font-bold text-primary">Accessibility Component Guide</h1>
        </div>
      </header>

      <main id="main-content" className="container mx-auto max-w-7xl px-4 py-8">
        <section aria-labelledby="intro-heading" className="mb-12">
          <h2 id="intro-heading" className="text-xl font-semibold mb-4">Introduction</h2>
          <p>
            This guide demonstrates how to implement accessible components in ProLingo.
            Each example includes the recommended accessibility attributes and best practices.
          </p>
        </section>

        {/* Skip Link Example */}
        <section aria-labelledby="skip-link-heading" className="mb-12 p-6 bg-white rounded-lg shadow-sm">
          <h2 id="skip-link-heading" className="text-xl font-semibold mb-4">Skip Links</h2>
          <div className="bg-gray-100 p-4 rounded-md mb-4">
            <pre className="text-sm overflow-x-auto">
              {`<a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:p-4 focus:bg-blue-600 focus:text-white focus:z-50">
  Skip to content
</a>`}
            </pre>
          </div>
          <p className="text-sm text-gray-600 mb-2">
            Skip links should be the first focusable element on the page and link to the main content.
            They should only be visible when focused, helping keyboard users bypass navigation.
          </p>
        </section>

        {/* Form Example */}
        <section aria-labelledby="form-heading" className="mb-12 p-6 bg-white rounded-lg shadow-sm">
          <h2 id="form-heading" className="text-xl font-semibold mb-4">Accessible Form</h2>
          
          <form aria-label="Example form" className="mb-4">
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                id="name"
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                aria-required="true"
                required
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                aria-required="true"
                required
                aria-describedby="email-hint"
              />
              <p id="email-hint" className="mt-1 text-sm text-gray-500">We'll never share your email with anyone else.</p>
            </div>
            
            <div className="mb-4">
              <fieldset>
                <legend className="block text-sm font-medium text-gray-700 mb-1">Notification preferences</legend>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center">
                    <input
                      id="notifications-email"
                      name="notifications"
                      type="radio"
                      className="h-4 w-4 border-gray-300"
                    />
                    <label htmlFor="notifications-email" className="ml-2 text-sm text-gray-700">
                      Email
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="notifications-sms"
                      name="notifications"
                      type="radio"
                      className="h-4 w-4 border-gray-300"
                    />
                    <label htmlFor="notifications-sms" className="ml-2 text-sm text-gray-700">
                      SMS
                    </label>
                  </div>
                </div>
              </fieldset>
            </div>
            
            <button
              type="submit"
              className="bg-primary text-white py-2 px-4 rounded-md"
              tabIndex={0}
            >
              Submit
            </button>
          </form>
          
          <div className="bg-gray-100 p-4 rounded-md">
            <p className="text-sm font-semibold mb-2">Key accessibility features:</p>
            <ul className="text-sm text-gray-600 list-disc list-inside">
              <li>Form has an <code>aria-label</code> describing its purpose</li>
              <li>Each input has a properly associated <code>label</code> element</li>
              <li>Required fields use both <code>required</code> and <code>aria-required="true"</code></li>
              <li>Helper text is linked to its input with <code>aria-describedby</code></li>
              <li>Radio buttons are grouped in a <code>fieldset</code> with a <code>legend</code></li>
            </ul>
          </div>
        </section>
        
        {/* Error Message Example */}
        <section aria-labelledby="error-heading" className="mb-12 p-6 bg-white rounded-lg shadow-sm">
          <h2 id="error-heading" className="text-xl font-semibold mb-4">Error Messages</h2>
          
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="w-full px-3 py-2 border border-red-300 rounded-md"
              aria-invalid="true"
              aria-describedby="password-error"
            />
            <div 
              id="password-error" 
              className="mt-1 text-sm text-red-600" 
              role="alert"
              aria-live="assertive"
            >
              Password must be at least 8 characters long.
            </div>
          </div>
          
          <div className="bg-gray-100 p-4 rounded-md">
            <pre className="text-sm overflow-x-auto mb-2">
{`<input
  id="password"
  aria-invalid="true"
  aria-describedby="password-error"
/>
<div 
  id="password-error" 
  role="alert"
  aria-live="assertive"
>
  Error message here
</div>`}
            </pre>
            <p className="text-sm text-gray-600">
              Error messages should use <code>role="alert"</code> and <code>aria-live="assertive"</code> to 
              immediately notify screen readers. Inputs with errors should use <code>aria-invalid="true"</code> 
              and link to their error message with <code>aria-describedby</code>.
            </p>
          </div>
        </section>

        {/* Loading States */}
        <section aria-labelledby="loading-heading" className="mb-12 p-6 bg-white rounded-lg shadow-sm">
          <h2 id="loading-heading" className="text-xl font-semibold mb-4">Loading States</h2>
          
          <div className="mb-4 p-4 border border-gray-200 rounded-md">
            <div className="flex items-center" aria-live="polite">
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary mr-3" aria-hidden="true"></div>
              <span>Loading content...</span>
            </div>
          </div>
          
          <div className="bg-gray-100 p-4 rounded-md">
            <pre className="text-sm overflow-x-auto mb-2">
{`<div aria-live="polite">
  <div className="animate-spin..." aria-hidden="true"></div>
  <span>Loading content...</span>
</div>`}
            </pre>
            <p className="text-sm text-gray-600">
              Loading indicators should use <code>aria-live="polite"</code> to announce their state to screen readers.
              Decorative spinners should have <code>aria-hidden="true"</code> so only the text is announced.
            </p>
          </div>
        </section>

        {/* Interactive Controls */}
        <section aria-labelledby="controls-heading" className="mb-12 p-6 bg-white rounded-lg shadow-sm">
          <h2 id="controls-heading" className="text-xl font-semibold mb-4">Custom Interactive Controls</h2>
          
          <div className="mb-4 space-y-4">
            {/* Custom Button */}
            <div 
              role="button" 
              tabIndex={0} 
              className="inline-flex items-center px-4 py-2 border border-primary text-primary rounded-md hover:bg-primary-50 cursor-pointer"
              onClick={() => alert('Button clicked')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  alert('Button activated with keyboard');
                }
              }}
              aria-label="Custom button example"
            >
              Custom Button
            </div>
            
            {/* Custom Toggle */}
            <div className="flex items-center">
              <span id="toggle-label" className="text-sm text-gray-700 mr-2">Dark mode:</span>
              <div 
                role="switch" 
                tabIndex={0}
                aria-checked="false" 
                aria-labelledby="toggle-label"
                className="relative inline-flex h-6 w-11 items-center rounded-full border-2 border-transparent bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                onClick={() => {}}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                  }
                }}
              >
                <span 
                  aria-hidden="true" 
                  className="translate-x-0 inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform"
                ></span>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-100 p-4 rounded-md">
            <p className="text-sm font-semibold mb-2">Key accessibility features:</p>
            <ul className="text-sm text-gray-600 list-disc list-inside">
              <li>Custom interactive elements have appropriate ARIA roles (<code>role="button"</code>, <code>role="switch"</code>)</li>
              <li>They're keyboard accessible with <code>tabIndex={0}</code></li>
              <li>They include keyboard event handlers for Enter and Space keys</li>
              <li>They have descriptive labels (via <code>aria-label</code> or <code>aria-labelledby</code>)</li>
              <li>State is communicated (e.g., <code>aria-checked</code> for toggles)</li>
            </ul>
          </div>
        </section>

        <section aria-labelledby="resources-heading">
          <h2 id="resources-heading" className="text-xl font-semibold mb-4">Additional Resources</h2>
          <p className="mb-2">For more information, please refer to:</p>
          <ul className="space-y-2 list-disc list-inside">
            <li>
              <Link href="/accessibility" className="text-primary hover:underline" tabIndex={0}>
                Our main accessibility documentation
              </Link>
            </li>
            <li>
              <a 
                href="https://www.w3.org/WAI/ARIA/apg/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
                tabIndex={0}
              >
                ARIA Authoring Practices Guide
              </a>
            </li>
          </ul>
        </section>
      </main>
    </div>
  );
} 