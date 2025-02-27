"use client";

import { useState, FormEvent } from 'react';
import { db } from '../../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

// Prevent static prerendering
export const dynamic = 'force-dynamic';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Add a new document to the "contacts" collection
      await addDoc(collection(db, "contacts"), {
        name,
        email,
        message,
        timestamp: serverTimestamp()
      });

      // Reset form and show success message
      setName('');
      setEmail('');
      setMessage('');
      setSubmitStatus('success');
    } catch (error) {
      console.error("Error adding contact:", error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="main-content" className="min-h-screen bg-muted py-12 px-4 sm:px-6 lg:px-8">
      <div id="main-content" className="max-w-md mx-auto">
        <div id="main-content" className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Contact Us</h1>
          <p className="text-muted-foreground">
            Have questions or feedback? We'd love to hear from you.
          </p>
        </div>

        <div id="main-content" className="bg-white p-8 rounded-xl shadow-md">
          {submitStatus === 'success' ? (
            <div id="main-content" className="text-center py-8">
              <div id="main-content" className="w-16 h-16 bg-green-100 rounded-full mx-auto flex items-center justify-center mb-4">
                <svg aria-hidden="true" aria-hidden="true" className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-primary mb-2">Message sent!</h2>
              <p className="text-muted-foreground mb-6">
                Thank you for reaching out. We'll get back to you as soon as possible.
              </p>
              <button
                onClick={() => setSubmitStatus('idle')} onKeyDown={(e) => { if(e.key === "Enter" || e.key === " ") e.target.click(); }}
                className="py-2 px-4 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form aria-label="Form" aria-label="Form" onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required aria-required="true"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required aria-required="true"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  required aria-required="true"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  placeholder="How can we help you?"
                />
              </div>

              {submitStatus === 'error' && (
                <div id="main-content" className="text-red-500 text-sm text-center">
                  Error sending message. Please try again.
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  {isSubmitting ? 'Sending...' : 'Submit'}
                </button>
              </div>
            </form>
          )}
        </div>

        <div id="main-content" className="mt-12 text-center">
          <h2 className="text-xl font-semibold text-primary mb-4">Other Ways to Reach Us</h2>
          <div id="main-content" className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div id="main-content" className="bg-white p-4 rounded-lg shadow-sm">
              <div id="main-content" className="text-primary mb-2">
                <svg aria-hidden="true" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-medium">Email</h3>
              <p className="text-sm text-muted-foreground">support@prolingo.com</p>
            </div>
            <div id="main-content" className="bg-white p-4 rounded-lg shadow-sm">
              <div id="main-content" className="text-primary mb-2">
                <svg aria-hidden="true" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-medium">Phone</h3>
              <p className="text-sm text-muted-foreground">+1 (555) 123-4567</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 