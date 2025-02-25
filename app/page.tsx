import Link from "next/link"
import Image from "next/image"

const features = [
  { 
    title: 'AI Lesson Planning', 
    desc: 'Generate customized lesson plans aligned with CEFR frameworks in seconds, saving hours of preparation time.',
    icon: '📝'
  },
  { 
    title: 'Interactive Materials', 
    desc: 'Access a vast library of engaging activities, exercises, and assessments that adapt to student proficiency levels.',
    icon: '📚'
  },
  { 
    title: 'Progress Tracking', 
    desc: 'Monitor student progress with comprehensive analytics and insights to tailor your teaching approach.',
    icon: '📊'
  }
];

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      {/* Hero Section with Gradient Background */}
      <section className="relative py-20 md:py-32 px-6 bg-gradient-to-br from-blue-800 via-blue-700 to-blue-800 text-white">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
        
        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="md:w-1/2">
              <h1 className="text-4xl md:text-6xl font-extrabold mb-6">
                Transform <span className="text-accent">English Teaching</span> with AI-Powered Tools
              </h1>
              <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-xl">
                ProLingo helps ESL educators create engaging lessons, generate CEFR-aligned curriculum, and assess student progress with powerful AI technology.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  href="/demo" 
                  className="btn-primary"
                >
                  Start Free Trial
                </Link>
                <Link 
                  href="/solutions" 
                  className="py-3 px-6 rounded-lg border border-blue-300 text-white font-medium hover:bg-blue-700 transition-colors duration-200"
                >
                  Explore Solutions
                </Link>
              </div>
            </div>
            
            <div className="md:w-1/2 flex justify-center">
              <div className="relative w-full max-w-md h-80 md:h-96">
                <div className="absolute inset-0 bg-gradient-to-r from-secondary to-accent rounded-2xl opacity-20 blur-xl"></div>
                <div className="relative bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 h-full w-full">
                  <div className="bg-slate-900 rounded-lg p-4 h-full w-full overflow-hidden">
                    <div className="text-white text-sm">
                      <div className="mb-3 border-b border-blue-400/30 pb-2">
                        <div className="flex justify-between">
                          <div className="font-medium">Lesson Plan Generator</div>
                          <div className="text-blue-300">CEFR B1</div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <div className="text-blue-300 text-xs mb-1">Topic</div>
                          <div>Travel and Cultural Experiences</div>
                        </div>
                        <div>
                          <div className="text-blue-300 text-xs mb-1">Language Focus</div>
                          <div>Past Simple vs. Present Perfect</div>
                        </div>
                        <div>
                          <div className="text-blue-300 text-xs mb-1">Activities</div>
                          <div>• Reading comprehension: "Travel Stories"</div>
                          <div>• Speaking: Interview about travel experiences</div>
                          <div>• Grammar exercise: Tense review</div>
                          <div>• Writing: Postcard from a trip</div>
                        </div>
                        <div className="text-xs italic text-blue-200 mt-2">
                          *Generated in 3 seconds with ProLingo AI
                        </div>
                      </div>
                    </div>
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
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Educators Choose <span className="gradient-text">ProLingo</span></h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our platform combines AI technology with pedagogical expertise to deliver exceptional English language teaching tools for classrooms of all sizes.
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

      {/* Testimonials Section */}
      <section className="py-20 px-6 bg-white">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Trusted by Language Educators Worldwide</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join thousands of teachers, schools, and institutions who are enhancing their ESL programs with ProLingo.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="card border border-border p-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">JD</div>
                <div>
                  <h4 className="font-semibold">Dr. Jane Davis</h4>
                  <p className="text-sm text-muted-foreground">ESL Department Chair, International Academy</p>
                </div>
              </div>
              <p className="text-muted-foreground italic">
                "ProLingo has revolutionized how our teachers prepare lessons. The AI-generated materials are remarkably aligned with our curriculum goals, and the time saved allows our faculty to focus more on student interaction."
              </p>
            </div>
            
            <div className="card border border-border p-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold">MT</div>
                <div>
                  <h4 className="font-semibold">Marco Trevisan</h4>
                  <p className="text-sm text-muted-foreground">Language Center Director, European Institute</p>
                </div>
              </div>
              <p className="text-muted-foreground italic">
                "The CEFR alignment and customization options make ProLingo an invaluable tool for our diverse student body. We've seen measurable improvements in student engagement and assessment scores since implementing the platform."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 bg-gradient-to-r from-primary to-secondary text-white">
        <div className="container mx-auto max-w-7xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Your ESL Teaching?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of educators who are enhancing language learning with ProLingo's AI-powered platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/signup" 
              className="bg-white text-primary font-bold py-3 px-8 rounded-lg text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
            >
              Start Your Free Trial
            </Link>
            <Link 
              href="/contact" 
              className="bg-transparent border-2 border-white text-white font-bold py-3 px-8 rounded-lg text-lg hover:bg-white/10 transition-all duration-200"
            >
              Request a Demo
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}

