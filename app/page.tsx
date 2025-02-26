import Link from "next/link"
import Image from "next/image"

const features = [
  { 
    title: 'AI Lesson Planning', 
    desc: 'Generate customized lesson plans aligned with CEFR frameworks in seconds, saving hours of preparation time.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    )
  },
  { 
    title: 'Interactive Materials', 
    desc: 'Access a vast library of engaging activities, exercises, and assessments that adapt to student proficiency levels.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    )
  },
  { 
    title: 'Progress Tracking', 
    desc: 'Monitor student progress with comprehensive analytics and insights to tailor your teaching approach.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    )
  }
];

export default function Home() {
  return (
    <>
      <main className="flex min-h-screen flex-col">
        {/* Hero Section with Navy Background */}
        <section className="relative py-16 sm:py-20 md:py-32 px-4 sm:px-6 bg-primary text-white overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-secondary opacity-10 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 -left-24 w-80 h-80 bg-accent opacity-10 rounded-full blur-3xl"></div>
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-20"></div>
          </div>
          
          <div className="container mx-auto max-w-7xl relative z-10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12">
              <div className="md:w-1/2">
                <div className="inline-block px-3 sm:px-4 py-1 bg-accent/20 rounded-full text-accent font-medium text-xs sm:text-sm mb-4 sm:mb-6">
                  AI-Powered ESL Teaching Platform
                </div>
                <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 sm:mb-6 leading-tight">
                  Transform <span className="text-accent">English Teaching</span> with Intelligent Tools
                </h1>
                <p className="text-base sm:text-lg md:text-xl text-white/80 mb-6 sm:mb-8 max-w-xl">
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
                    className="py-2 sm:py-3 px-4 sm:px-6 rounded-lg border border-white/30 text-white font-medium hover:bg-white/10 transition-colors duration-200 text-center text-sm sm:text-base"
                  >
                    Explore Solutions
                  </Link>
                </div>
              </div>
              
              <div className="md:w-1/2 flex justify-center mt-8 md:mt-0">
                <div className="relative w-full max-w-md h-72 sm:h-80 md:h-96">
                  <div className="absolute inset-0 bg-gradient-to-r from-secondary to-accent rounded-2xl opacity-20 blur-xl"></div>
                  <div className="relative bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 sm:p-6 h-full w-full">
                    <div className="bg-[#111432] rounded-lg p-3 sm:p-4 h-full w-full overflow-hidden shadow-xl">
                      <div className="text-white text-xs sm:text-sm">
                        <div className="mb-3 border-b border-primary-light/30 pb-2">
                          <div className="flex justify-between">
                            <div className="font-medium">Lesson Plan Generator</div>
                            <div className="text-accent">CEFR B1</div>
                          </div>
                        </div>
                        <div className="space-y-3 sm:space-y-4">
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
        <section className="py-8 sm:py-10 bg-white border-b border-border">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center">
              <div>
                <div className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-1">10,000+</div>
                <div className="text-muted-foreground text-sm sm:text-base">Educators</div>
              </div>
              <div>
                <div className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-1">500+</div>
                <div className="text-muted-foreground text-sm sm:text-base">Schools</div>
              </div>
              <div>
                <div className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-1">30+</div>
                <div className="text-muted-foreground text-sm sm:text-base">Countries</div>
              </div>
              <div>
                <div className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-1">1M+</div>
                <div className="text-muted-foreground text-sm sm:text-base">Lessons Created</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-muted">
          <div className="container mx-auto max-w-7xl">
            <div className="text-center mb-10 sm:mb-16">
              <div className="inline-block px-3 sm:px-4 py-1 bg-primary/10 rounded-full text-primary font-medium text-xs sm:text-sm mb-3 sm:mb-4">
                POWERFUL FEATURES
              </div>
              <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">Why Educators Choose <span className="gradient-text">ProLingo</span></h2>
              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
                Our platform combines AI technology with pedagogical expertise to deliver exceptional English language teaching tools for classrooms of all sizes.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {features.map((feature, index) => (
                <div 
                  key={index} 
                  className={index === 1 ? "accent-card" : "card"}
                >
                  <div className="text-primary mb-4">{feature.icon}</div>
                  <h3 className="font-heading text-xl sm:text-2xl font-bold mb-2 sm:mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm sm:text-base">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-white">
          <div className="container mx-auto max-w-7xl">
            <div className="text-center mb-10 sm:mb-16">
              <div className="inline-block px-3 sm:px-4 py-1 bg-secondary/10 rounded-full text-secondary font-medium text-xs sm:text-sm mb-3 sm:mb-4">
                STREAMLINED WORKFLOW
              </div>
              <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">How ProLingo Works</h2>
              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
                Our intuitive platform makes it easy to create, deliver, and track English language learning materials.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10 relative">
              {/* Connecting line for desktop */}
              <div className="hidden md:block absolute top-24 left-1/2 h-0.5 w-[calc(100%-120px)] -translate-x-1/2 bg-border"></div>
              
              {/* Step 1 */}
              <div className="relative">
                <div className="flex justify-center mb-6 sm:mb-8">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary text-white flex items-center justify-center text-lg sm:text-xl font-bold relative z-10">1</div>
                </div>
                <div className="text-center">
                  <h3 className="font-heading text-lg sm:text-xl font-bold mb-2">Define Your Needs</h3>
                  <p className="text-muted-foreground text-sm sm:text-base">Specify your teaching goals, student levels, and curriculum requirements.</p>
                </div>
              </div>
              
              {/* Step 2 */}
              <div className="relative">
                <div className="flex justify-center mb-6 sm:mb-8">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-secondary text-white flex items-center justify-center text-lg sm:text-xl font-bold relative z-10">2</div>
                </div>
                <div className="text-center">
                  <h3 className="font-heading text-lg sm:text-xl font-bold mb-2">Generate Content</h3>
                  <p className="text-muted-foreground text-sm sm:text-base">Our AI creates CEFR-aligned lesson plans, activities, and assessments in seconds.</p>
                </div>
              </div>
              
              {/* Step 3 */}
              <div className="relative">
                <div className="flex justify-center mb-6 sm:mb-8">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-accent text-white flex items-center justify-center text-lg sm:text-xl font-bold relative z-10">3</div>
                </div>
                <div className="text-center">
                  <h3 className="font-heading text-lg sm:text-xl font-bold mb-2">Teach & Track</h3>
                  <p className="text-muted-foreground text-sm sm:text-base">Deliver engaging lessons and monitor student progress with detailed analytics.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-muted">
          <div className="container mx-auto max-w-7xl">
            <div className="text-center mb-10 sm:mb-16">
              <div className="inline-block px-3 sm:px-4 py-1 bg-accent/10 rounded-full text-accent font-medium text-xs sm:text-sm mb-3 sm:mb-4">
                SUCCESS STORIES
              </div>
              <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">Trusted by Language Educators Worldwide</h2>
              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
                Join thousands of teachers, schools, and institutions who are enhancing their ESL programs with ProLingo.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              <div className="bg-white p-5 sm:p-8 rounded-xl shadow-md">
                <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">JD</div>
                  <div>
                    <h4 className="font-heading font-semibold text-base sm:text-lg">Dr. Jane Davis</h4>
                    <p className="text-xs sm:text-sm text-muted-foreground">ESL Department Chair, International Academy</p>
                  </div>
                </div>
                <p className="text-muted-foreground italic text-sm sm:text-base">
                  "ProLingo has revolutionized how our teachers prepare lessons. The AI-generated materials are remarkably aligned with our curriculum goals, and the time saved allows our faculty to focus more on student interaction."
                </p>
              </div>
              
              <div className="bg-white p-5 sm:p-8 rounded-xl shadow-md">
                <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-bold">MT</div>
                  <div>
                    <h4 className="font-heading font-semibold text-base sm:text-lg">Marco Trevisan</h4>
                    <p className="text-xs sm:text-sm text-muted-foreground">Language Center Director, European Institute</p>
                  </div>
                </div>
                <p className="text-muted-foreground italic text-sm sm:text-base">
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

