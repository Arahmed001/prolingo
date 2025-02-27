import ClientAboutPage from "./ClientAboutPage";

// Static content metadata
export const metadata = {
  title: 'About ProLingo - AI-Powered Language Learning',
  description: 'Learn about our mission to make language learning accessible, effective, and enjoyable for everyone.'
};

// Make this page statically generated
export const dynamic = 'force-static';

export default function AboutPage() {
  // Static content passed to client component
  const missionContent = {
    title: "Our Mission",
    paragraphs: [
      "At ProLingo, we're dedicated to making language learning accessible, effective, and enjoyable for everyone. Our AI-powered platform adapts to your unique learning style, helping you master English at your own pace.",
      "We believe that language is the bridge to new opportunities, cultures, and connections. Our mission is to empower ESL learners worldwide with innovative tools that break down barriers and open doors to personal and professional growth."
    ]
  };

  const features = [
    {
      title: "AI Lessons",
      description: "Personalised content that adapts to your learning style and progress, focusing on areas where you need the most practice.",
      icon: "computer"
    },
    {
      title: "Progress Tracking",
      description: "Detailed analytics that show your growth over time, with insights to help you improve faster.",
      icon: "chart"
    },
    {
      title: "Cultural Immersion",
      description: "Learn not just the language, but the cultural context and real-world usage through authentic scenarios.",
      icon: "globe"
    },
    {
      title: "Interactive Practice",
      description: "Engage with dynamic exercises that make learning fun while reinforcing key concepts and vocabulary.",
      icon: "practice"
    },
    {
      title: "Community Support",
      description: "Connect with fellow learners and native speakers in our supportive community forums.",
      icon: "community"
    },
    {
      title: "Expert Guidance",
      description: "Access professional tips and methodologies from experienced language educators.",
      icon: "teacher"
    }
  ];

  return <ClientAboutPage mission={missionContent} features={features} />;
} 