import Link from "next/link"
import Image from "next/image"
import { useTranslation } from "next-i18next"
import ClientHomePage from "./ClientHomePage"

// Static content for the home page
const features = [
  { 
    title: 'AI Lesson Planning', 
    desc: 'Generate customised lesson plans aligned with CEFR frameworks in seconds, saving hours of preparation time.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 sm:w-10 sm:h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    )
  },
  { 
    title: 'Interactive Materials', 
    desc: 'Access a vast library of engaging activities, exercises, and assessments that adapt to student proficiency levels.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 sm:w-10 sm:h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    )
  },
  { 
    title: 'Progress Tracking', 
    desc: 'Monitor student progress with comprehensive analytics and insights to tailor your teaching approach.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 sm:w-10 sm:h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    )
  }
];

// Configure static generation
export const generateMetadata = () => {
  return {
    title: 'ProLingo - AI-Powered Language Learning',
    description: 'ProLingo combines artificial intelligence with linguistic expertise to deliver personalised language learning experiences.'
  };
};

// Make this page statically generated
export const dynamic = 'force-static';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-secondary py-16 md:py-24 text-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="md:w-1/2 space-y-6">
              <h1 className="font-poppins text-3xl md:text-5xl font-bold leading-tight">
                CEFR-Aligned Language Learning
              </h1>
              <h2 className="text-4xl md:text-6xl font-bold mb-4 font-poppins">
                Welcome
              </h2>
              <p className="text-lg md:text-xl opacity-90 max-w-lg">
                ProLingo combines artificial intelligence with linguistic expertise to deliver personalized language learning experiences.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Link 
                  href="/student/lessons" 
                  className="bg-white text-primary px-6 py-3 rounded-lg font-medium hover:bg-opacity-90 transition shadow-lg"
                >
                  Start Learning
                </Link>
                <Link 
                  href="/marketing" 
                  className="border border-white px-6 py-3 rounded-lg font-medium hover:bg-white/10 transition"
                >
                  Learn More →
                </Link>
              </div>
              <div className="mt-4">
                <Link 
                  href="/about" 
                  className="inline-flex items-center text-white hover:underline"
                >
                  <span className="mr-2">About Us</span> →
                </Link>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <div className="w-full max-w-md relative">
                <div className="aspect-video bg-white/20 rounded-lg flex items-center justify-center p-4">
                  <span className="text-center text-lg">Language Learning Illustration</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 font-poppins">Features</h2>
          <div className="text-center max-w-3xl mx-auto mb-12">
            <p className="text-lg text-gray-700">
              Our AI-powered platform offers everything you need to master a new language with confidence, from personalized lessons to immersive practice sessions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Personalized Learning",
                description: "Adapt to your learning style and pace with our AI-powered curriculum.",
                icon: "✓"
              },
              {
                title: "Interactive Exercises",
                description: "Practice speaking, writing, and comprehension with engaging activities.",
                icon: "✓"
              },
              {
                title: "Progress Tracking",
                description: "Visualize your improvement and identify areas needing attention.",
                icon: "✓"
              }
            ].map((feature, index) => (
              <div 
                key={index} 
                className="bg-gray-50 p-6 rounded-lg border border-gray-100 hover:shadow-md transition"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary text-xl mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 font-poppins">What Our Users Say</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                quote: "ProLingo has completely transformed how I approach language learning. The personalized feedback is invaluable.",
                name: "Sarah Johnson",
                role: "Spanish Learner"
              },
              {
                quote: "I've tried many language apps, but ProLingo's AI-driven approach has helped me progress faster than ever before.",
                name: "Miguel Rodriguez",
                role: "English Learner"
              },
              {
                quote: "The community features make learning social and fun. I can practice with other learners around the world.",
                name: "Elise Chen",
                role: "French Learner"
              }
            ].map((testimonial, index) => (
              <div 
                key={index} 
                className="bg-white p-6 rounded-lg shadow-sm border border-gray-100"
              >
                <div className="mb-4 text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M12 12a1 1 0 0 0 1-1V8.558a1 1 0 0 0-1-1h-1.388c0-.351.021-.703.062-1.054.062-.372.166-.703.31-.992.145-.29.331-.517.559-.683.227-.186.516-.279.868-.279V3c-.579 0-1.085.124-1.52.372a3.322 3.322 0 0 0-1.085.992 4.92 4.92 0 0 0-.62 1.458A7.712 7.712 0 0 0 9 7.558V11a1 1 0 0 0 1 1h2Zm-6 0a1 1 0 0 0 1-1V8.558a1 1 0 0 0-1-1H4.612c0-.351.021-.703.062-1.054.062-.372.166-.703.31-.992.145-.29.331-.517.559-.683.227-.186.516-.279.868-.279V3c-.579 0-1.085.124-1.52.372a3.322 3.322 0 0 0-1.085.992 4.92 4.92 0 0 0-.62 1.458A7.712 7.712 0 0 0 3 7.558V11a1 1 0 0 0 1 1h2Z"/>
                  </svg>
                </div>
                <p className="text-gray-700 mb-4">{testimonial.quote}</p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                    <span className="text-gray-500 font-medium">
                      {testimonial.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 font-poppins">Ready to Start Your Language Journey?</h2>
          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of learners who have achieved fluency with our innovative approach.
          </p>
          <Link 
            href="/register" 
            className="bg-white text-primary px-8 py-4 rounded-lg font-medium hover:bg-opacity-90 transition shadow-lg text-lg"
          >
            Sign Up for Free
          </Link>
        </div>
      </section>
    </div>
  );
}

