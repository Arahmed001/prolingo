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
    <>
      <main className="flex min-h-screen flex-col">
        {/* Hero Section with Navy Background */}
        <section className="relative py-20 md:py-32 px-6 bg-primary text-white overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-secondary opacity-10 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 -left-24 w-80 h-80 bg-accent opacity-10 rounded-full blur-3xl"></div>
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-20"></div>
          </div>
          
          <div className="container mx-auto max-w-7xl relative z-10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-12">
              <div className="md:w-1/2">
                <div className="inline-block px-4 py-1 bg-accent/20 rounded-full text-accent font-medium text-sm mb-6">
                  AI-Powered ESL Teaching Platform
                </div>
                <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
                  Transform <span className="text-accent">English Teaching</span> with Intelligent Tools
                </h1>
                <p className="text-lg md:text-xl text-white/80 mb-8 max-w-xl">
                  ProLingo helps ESL educators create engaging lessons, generate CEFR-aligned curriculum, and assess student progress with powerful AI technology.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link 
                    href="/demo" 
                    className="btn-secondary"
                  >
                    Start Free Trial
                  </Link>
                  <Link 
                    href="/solutions" 
                    className="py-3 px-6 rounded-lg border border-white/30 text-white font-medium hover:bg-white/10 transition-colors duration-200"
                  >
                    Explore Solutions
                  </Link>
                </div>
              </div>
              
              <div className="md:w-1/2 flex justify-center">
                <div className="relative w-full max-w-md h-80 md:h-96">
                  <div className="absolute inset-0 bg-gradient-to-r from-secondary to-accent rounded-2xl opacity-20 blur-xl"></div>
                  <div className="relative bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 h-full w-full">
                    <div className="bg-[#111432] rounded-lg p-4 h-full w-full overflow-hidden shadow-xl">
                      <div className="text-white text-sm">
                        <div className="mb-3 border-b border-primary-light/30 pb-2">
                          <div className="flex justify-between">
                            <div className="font-medium">Lesson Plan Generator</div>
                            <div className="text-accent">CEFR B1</div>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <div className="text-secondary/90 text-xs mb-1">Topic</div>
                            <div>Travel and Cultural Experiences</div>
                          </div>
                          <div>
                            <div className="text-secondary/90 text-xs mb-1">Language Focus</div>
                            <div>Past Simple vs. Present Perfect</div>
                          </div>
                          <div>
                            <div className="text-secondary/90 text-xs mb-1">Activities</div>
                            <div>• Reading comprehension: "Travel Stories"</div>
                            <div>• Speaking: Interview about travel experiences</div>
                            <div>• Grammar exercise: Tense review</div>
                            <div>• Writing: Postcard from a trip</div>
                          </div>
                          <div className="text-xs italic text-white/60 mt-2">
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

        {/* Stats Section */}
        <section className="py-10 bg-white border-b border-border">
          <div className="container mx-auto max-w-7xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl md:text-4xl font-bold text-primary mb-1">10,000+</div>
                <div className="text-muted-foreground">Educators</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-primary mb-1">500+</div>
                <div className="text-muted-foreground">Schools</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-primary mb-1">30+</div>
                <div className="text-muted-foreground">Countries</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-primary mb-1">1M+</div>
                <div className="text-muted-foreground">Lessons Created</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-6 bg-muted">
          <div className="container mx-auto max-w-7xl">
            <div className="text-center mb-16">
              <div className="inline-block px-4 py-1 bg-primary/10 rounded-full text-primary font-medium text-sm mb-4">
                POWERFUL FEATURES
              </div>
              <h2 className="text-3xl md:text-5xl font-bold mb-4">Why Educators Choose <span className="gradient-text">ProLingo</span></h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Our platform combines AI technology with pedagogical expertise to deliver exceptional English language teaching tools for classrooms of all sizes.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div 
                  key={index} 
                  className={index === 1 ? "accent-card" : "card"}
                >
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 px-6 bg-white">
          <div className="container mx-auto max-w-7xl">
            <div className="text-center mb-16">
              <div className="inline-block px-4 py-1 bg-secondary/10 rounded-full text-secondary font-medium text-sm mb-4">
                STREAMLINED WORKFLOW
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">How ProLingo Works</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Our intuitive platform makes it easy to create, deliver, and track English language learning materials.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              {/* Connecting line for desktop */}
              <div className="hidden md:block absolute top-24 left-1/2 h-0.5 w-[calc(100%-120px)] -translate-x-1/2 bg-border"></div>
              
              {/* Step 1 */}
              <div className="relative">
                <div className="flex justify-center mb-8">
                  <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold relative z-10">1</div>
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold mb-2">Define Your Needs</h3>
                  <p className="text-muted-foreground">Specify your teaching goals, student levels, and curriculum requirements.</p>
                </div>
              </div>
              
              {/* Step 2 */}
              <div className="relative">
                <div className="flex justify-center mb-8">
                  <div className="w-12 h-12 rounded-full bg-secondary text-white flex items-center justify-center text-xl font-bold relative z-10">2</div>
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold mb-2">Generate Content</h3>
                  <p className="text-muted-foreground">Our AI creates CEFR-aligned lesson plans, activities, and assessments in seconds.</p>
                </div>
              </div>
              
              {/* Step 3 */}
              <div className="relative">
                <div className="flex justify-center mb-8">
                  <div className="w-12 h-12 rounded-full bg-accent text-white flex items-center justify-center text-xl font-bold relative z-10">3</div>
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold mb-2">Teach & Track</h3>
                  <p className="text-muted-foreground">Deliver engaging lessons and monitor student progress with detailed analytics.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 px-6 bg-muted">
          <div className="container mx-auto max-w-7xl">
            <div className="text-center mb-16">
              <div className="inline-block px-4 py-1 bg-accent/10 rounded-full text-accent font-medium text-sm mb-4">
                SUCCESS STORIES
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Trusted by Language Educators Worldwide</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Join thousands of teachers, schools, and institutions who are enhancing their ESL programs with ProLingo.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-xl shadow-md">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">JD</div>
                  <div>
                    <h4 className="font-semibold">Dr. Jane Davis</h4>
                    <p className="text-sm text-muted-foreground">ESL Department Chair, International Academy</p>
                  </div>
                </div>
                <p className="text-muted-foreground italic">
                  "ProLingo has revolutionized how our teachers prepare lessons. The AI-generated materials are remarkably aligned with our curriculum goals, and the time saved allows our faculty to focus more on student interaction."
                </p>
              </div>
              
              <div className="bg-white p-8 rounded-xl shadow-md">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-bold">MT</div>
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
        <section className="py-16 px-6 bg-primary text-white relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-secondary opacity-10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent opacity-10 rounded-full blur-3xl"></div>
          
          <div className="container mx-auto max-w-7xl text-center relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Your ESL Teaching?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Join thousands of educators who are enhancing language learning with ProLingo's AI-powered platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/signup" 
                className="bg-secondary text-white font-bold py-3 px-8 rounded-lg text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
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
    </>
  )
}

