"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { db } from '../../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

// Testimonial interface
interface Testimonial {
  name: string;
  role: string;
  quote: string;
  image?: string;
}

const testimonials: Testimonial[] = [
  {
    name: 'John Doe',
    role: 'ESL Student',
    quote: 'ProLingo transformed my language learning journey. The AI-powered lessons helped me improve my English faster than any other method I tried.',
    image: '/images/testimonials/testimonial-1.jpg'
  },
  {
    name: 'Sarah Chen',
    role: 'Business Professional',
    quote: 'As someone who needs English for my career, ProLingo provides exactly what I need - practical, conversation-focused exercises that I can practice anytime.',
    image: '/images/testimonials/testimonial-2.jpg'
  },
  {
    name: 'Miguel Rodriguez',
    role: 'University Student',
    quote: 'The daily challenges and reward system keep me motivated. I have been using ProLingo for 3 months and my confidence in speaking English has improved dramatically.',
    image: '/images/testimonials/testimonial-3.jpg'
  }
];

export default function ClientMarketingPage() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ success: boolean; message: string } | null>(null);
  
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setSubmitStatus({
        success: false,
        message: 'Please enter a valid email address.'
      });
      return;
    }
    
    setSubmitting(true);
    setSubmitStatus(null);
    
    try {
      // Save to Firebase
      await addDoc(collection(db, 'marketing-signups'), {
        email,
        timestamp: serverTimestamp()
      });
      
      setSubmitStatus({
        success: true,
        message: 'Thank you for signing up! We\'ll be in touch soon.'
      });
      setEmail('');
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus({
        success: false,
        message: 'There was an error submitting your information. Please try again.'
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <main id="main-content" className="flex-grow">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">Master English with ProLingo</h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">AI-Powered Learning for All</p>
            <Link href="/register" className="inline-block px-8 py-4 bg-white text-blue-700 font-medium rounded-full hover:bg-blue-50 transition-colors text-lg shadow-lg">
              Try Free
            </Link>
          </div>
          
          <div className="mt-12 md:mt-16 flex justify-center">
            <div className="relative w-full max-w-3xl">
              <div className="absolute inset-0 bg-blue-400 opacity-20 rounded-lg transform -rotate-1"></div>
              <div className="relative bg-white p-3 rounded-lg shadow-xl">
                <img 
                  src="/images/app-preview.png" 
                  alt="ProLingo App Preview" 
                  className="w-full h-auto rounded"
                  onError={(e) => e.currentTarget.src = 'https://via.placeholder.com/800x450/1E40AF/FFFFFF?text=ProLingo+App+Preview'}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">What Our Users Say</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Join thousands of learners who have transformed their English skills with ProLingo</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6 border border-gray-100 transform transition-transform duration-300 hover:-translate-y-2">
                <div className="mb-4">
                  {/* Stars */}
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
                
                <p className="text-gray-700 mb-6 italic">"{testimonial.quote}"</p>
                
                <div className="flex items-center">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
                    {testimonial.image ? (
                      <img 
                        src={testimonial.image} 
                        alt={testimonial.name} 
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = `https://ui-avatars.com/api/?name=${testimonial.name.replace(' ', '+')}&background=1E40AF&color=fff`;
                        }}
                      />
                    ) : (
                      <span className="text-blue-700 font-bold text-xl">
                        {testimonial.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    )}
                  </div>
                  <div className="ml-3">
                    <h3 className="font-semibold text-gray-800">{testimonial.name}</h3>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Call to Action Section */}
      <section className="py-16 md:py-24 bg-blue-700 text-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="md:flex items-center justify-between">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Start Your English Journey Today</h2>
              <p className="text-xl text-blue-100 mb-6">Join our community and get exclusive updates, language tips, and special offers.</p>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Personalized learning path</span>
                </li>
                <li className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Daily challenges to keep you motivated</span>
                </li>
                <li className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Community support from fellow learners</span>
                </li>
              </ul>
            </div>
            
            <div className="md:w-5/12">
              <div className="bg-white rounded-lg p-6 md:p-8 shadow-lg">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Sign Up for Updates</h3>
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      placeholder="your@email.com"
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={email}
                      onChange={handleEmailChange}
                      required
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                  >
                    {submitting ? 'Signing Up...' : 'Join Now'}
                  </button>
                  
                  {submitStatus && (
                    <div className={`mt-4 p-3 rounded ${submitStatus.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                      {submitStatus.message}
                    </div>
                  )}
                  
                  <p className="mt-3 text-xs text-gray-600 text-center">
                    By signing up, you agree to our <Link href="/terms" className="underline hover:text-blue-600">Terms of Service</Link> and <Link href="/privacy" className="underline hover:text-blue-600">Privacy Policy</Link>.
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
} 