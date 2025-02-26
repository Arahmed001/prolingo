export default function AboutPage() {
  return (
    <div className="min-h-screen bg-muted py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-3 sm:mb-4">About ProLingo</h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Empowering ESL learners with AI-driven tools
          </p>
        </div>
        
        <div className="bg-white p-5 sm:p-8 rounded-xl shadow-md mb-8 sm:mb-12">
          <h2 className="text-xl sm:text-2xl font-bold text-primary mb-3 sm:mb-4">Our Mission</h2>
          <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4">
            At ProLingo, we're dedicated to making language learning accessible, effective, and enjoyable for everyone. 
            Our AI-powered platform adapts to your unique learning style, helping you master English at your own pace.
          </p>
          <p className="text-sm sm:text-base text-muted-foreground">
            We believe that language is the bridge to new opportunities, cultures, and connections. 
            Our mission is to empower ESL learners worldwide with innovative tools that break down barriers 
            and open doors to personal and professional growth.
          </p>
        </div>
        
        <h2 className="text-xl sm:text-2xl font-bold text-primary mb-4 sm:mb-6 text-center">Why Choose ProLingo</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8 mt-6 sm:mt-8">
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary/10 rounded-full mb-3 sm:mb-4 flex items-center justify-center">
              <span className="text-xl sm:text-2xl">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-primary mb-1 sm:mb-2">AI Lessons</h3>
            <p className="text-xs sm:text-sm md:text-base text-muted-foreground">
              Personalized content that adapts to your learning style and progress, 
              focusing on areas where you need the most practice.
            </p>
          </div>
          
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-secondary/10 rounded-full mb-3 sm:mb-4 flex items-center justify-center">
              <span className="text-xl sm:text-2xl">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-secondary mb-1 sm:mb-2">Progress Tracking</h3>
            <p className="text-xs sm:text-sm md:text-base text-muted-foreground">
              Monitor your growth with detailed analytics that show your improvement over time 
              and highlight areas for further development.
            </p>
          </div>
          
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-accent/10 rounded-full mb-3 sm:mb-4 flex items-center justify-center">
              <span className="text-xl sm:text-2xl">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-accent mb-1 sm:mb-2">Community</h3>
            <p className="text-xs sm:text-sm md:text-base text-muted-foreground">
              Learn together with a supportive global community of fellow language learners, 
              sharing experiences and practicing in a collaborative environment.
            </p>
          </div>
        </div>
        
        <div className="mt-10 sm:mt-16 text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-primary mb-4 sm:mb-6">Start Your Language Journey Today</h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-6 sm:mb-8">
            Join thousands of learners who are achieving their language goals with ProLingo.
          </p>
          <a 
            href="/register" 
            className="inline-block py-2 sm:py-3 px-6 sm:px-8 bg-primary text-white text-sm sm:text-base font-medium rounded-lg hover:bg-primary/90 transition-colors"
          >
            Sign Up for Free
          </a>
        </div>
      </div>
    </div>
  );
} 