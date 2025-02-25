export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-muted py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary mb-4">Features</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover the powerful features of ProLingo that help ESL teachers create engaging lessons.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-primary mb-2">AI Lesson Planning</h3>
            <p className="text-muted-foreground">
              Generate customized lesson plans aligned with CEFR frameworks in seconds, saving hours of preparation time.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="text-4xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-primary mb-2">Interactive Materials</h3>
            <p className="text-muted-foreground">
              Access a vast library of engaging activities, exercises, and assessments that adapt to student proficiency levels.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-primary mb-2">Progress Tracking</h3>
            <p className="text-muted-foreground">
              Monitor student progress with comprehensive analytics and insights to tailor your teaching approach.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-primary mb-2">Smart Search</h3>
            <p className="text-muted-foreground">
              Quickly find relevant teaching materials using our AI-powered search functionality.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="text-4xl mb-4">🌐</div>
            <h3 className="text-xl font-semibold text-primary mb-2">Multi-language Support</h3>
            <p className="text-muted-foreground">
              Interface available in multiple languages to support teachers from around the world.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="text-4xl mb-4">📱</div>
            <h3 className="text-xl font-semibold text-primary mb-2">Mobile Friendly</h3>
            <p className="text-muted-foreground">
              Access your lessons and materials on any device with our responsive design.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 