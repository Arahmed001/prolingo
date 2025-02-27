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
  return <ClientHomePage features={features} />;
}

