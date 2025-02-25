export default function AboutPage() {
  return (
    <div className="min-h-screen bg-muted py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary mb-4">About ProLingo</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Empowering ESL learners with AI-driven tools
          </p>
        </div>
        
        <div className="bg-white p-8 rounded-xl shadow-md mb-12">
          <h2 className="text-2xl font-bold text-primary mb-4">Our Mission</h2>
          <p className="text-muted-foreground mb-4">
            At ProLingo, we're dedicated to making language learning accessible, effective, and enjoyable for everyone. 
            Our AI-powered platform adapts to your unique learning style, helping you master English at your own pace.
          </p>
          <p className="text-muted-foreground">
            We believe that language is the bridge to new opportunities, cultures, and connections. 
            Our mission is to empower ESL learners worldwide with innovative tools that break down barriers 
            and open doors to personal and professional growth.
          </p>
        </div>
        
        <h2 className="text-2xl font-bold text-primary mb-6 text-center">Why Choose ProLingo</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="w-16 h-16 bg-primary/10 rounded-full mb-4 flex items-center justify-center">
              <span className="text-2xl">🤖</span>
            </div>
            <h3 className="text-xl font-semibold text-primary mb-2">AI Lessons</h3>
            <p className="text-muted-foreground">
              Personalized content that adapts to your learning style and progress, 
              focusing on areas where you need the most practice.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="w-16 h-16 bg-secondary/10 rounded-full mb-4 flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="text-xl font-semibold text-secondary mb-2">Progress Tracking</h3>
            <p className="text-muted-foreground">
              Monitor your growth with detailed analytics that show your improvement over time 
              and highlight areas for further development.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="w-16 h-16 bg-accent/10 rounded-full mb-4 flex items-center justify-center">
              <span className="text-2xl">👥</span>
            </div>
            <h3 className="text-xl font-semibold text-accent mb-2">Community</h3>
            <p className="text-muted-foreground">
              Learn together with a supportive global community of fellow language learners, 
              sharing experiences and practicing in a collaborative environment.
            </p>
          </div>
        </div>
        
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-primary mb-6">Start Your Language Journey Today</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Join thousands of learners who are achieving their language goals with ProLingo.
          </p>
          <a 
            href="/register" 
            className="inline-block py-3 px-8 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors"
          >
            Sign Up for Free
          </a>
        </div>
      </div>
    </div>
  );
} 