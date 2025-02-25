import Link from "next/link"
import Image from "next/image"

const features = [
  { 
    title: 'Learn', 
    desc: 'Personalized AI-generated lessons that adapt to your skill level and learning style.',
    icon: '📚'
  },
  { 
    title: 'Practice', 
    desc: 'Interactive coding exercises and quizzes to reinforce your knowledge and build confidence.',
    icon: '💻'
  },
  { 
    title: 'Track', 
    desc: 'Comprehensive analytics to monitor your progress and identify areas for improvement.',
    icon: '📊'
  }
];

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      {/* Hero Section with Gradient Background */}
      <section className="relative py-20 md:py-32 px-6 bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-900 text-white">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
        
        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="md:w-1/2">
              <h1 className="text-4xl md:text-6xl font-extrabold mb-6">
                Master <span className="text-pink-400">Programming</span> with AI-Powered Learning
              </h1>
              <p className="text-lg md:text-xl text-indigo-200 mb-8 max-w-xl">
                ProLingo makes learning programming languages intuitive and effective with personalized lessons, interactive exercises, and real-time feedback.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  href="/lessons" 
                  className="btn-primary"
                >
                  Get Started Free
                </Link>
                <Link 
                  href="/about" 
                  className="py-3 px-6 rounded-lg border border-indigo-400 text-white font-medium hover:bg-indigo-800 transition-colors duration-200"
                >
                  Learn More
                </Link>
              </div>
            </div>
            
            <div className="md:w-1/2 flex justify-center">
              <div className="relative w-full max-w-md h-80 md:h-96">
                {/* Replace with your actual image or illustration */}
                <div className="absolute inset-0 bg-gradient-to-r from-secondary to-accent rounded-2xl opacity-20 blur-xl"></div>
                <div className="relative bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 h-full w-full">
                  <div className="bg-slate-900 rounded-lg p-4 h-full w-full overflow-hidden">
                    <pre className="text-green-400 text-sm">
                      <code>
{`// ProLingo Code Example
function learnToCode() {
  const languages = [
    "JavaScript", 
    "Python",
    "React"
  ];
  
  return languages.map(lang => 
    \`Learning \${lang} with ProLingo\`
  );
}

// Start your journey today!`}
                      </code>
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-muted">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose <span className="gradient-text">ProLingo</span></h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our platform combines cutting-edge AI technology with proven learning methods to help you master programming skills faster.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="card border-t-4 border-t-primary"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 bg-gradient-to-r from-primary to-secondary text-white">
        <div className="container mx-auto max-w-7xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Start Your Coding Journey?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of learners who have accelerated their programming skills with ProLingo.
          </p>
          <Link 
            href="/signup" 
            className="bg-white text-primary font-bold py-3 px-8 rounded-lg text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
          >
            Start Learning Now
          </Link>
        </div>
      </section>
    </main>
  )
}

