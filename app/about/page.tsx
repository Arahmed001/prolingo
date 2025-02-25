export default function AboutPage() {
  return (
    <div className="min-h-screen bg-muted py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary mb-4">About ProLingo</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Revolutionizing ESL teaching with AI-powered tools and resources.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-12">
          <div>
            <h2 className="text-2xl font-bold text-primary mb-4">Our Mission</h2>
            <p className="text-muted-foreground mb-6">
              At ProLingo, our mission is to empower ESL teachers with innovative AI tools that streamline lesson planning, 
              enhance classroom engagement, and improve learning outcomes for students worldwide.
            </p>
            <p className="text-muted-foreground mb-6">
              We believe that by combining cutting-edge technology with pedagogical expertise, we can transform 
              the way English is taught and learned, making quality education more accessible and effective.
            </p>
            <p className="text-muted-foreground">
              Our platform is designed by teachers, for teachers, with a deep understanding of the challenges 
              and opportunities in ESL education.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-xl shadow-md">
            <h2 className="text-2xl font-bold text-primary mb-4">Our Story</h2>
            <p className="text-muted-foreground mb-4">
              ProLingo was founded in 2023 by a team of experienced ESL teachers and AI specialists who recognized 
              the potential of artificial intelligence to revolutionize language education.
            </p>
            <p className="text-muted-foreground mb-4">
              After years of manually creating lesson plans and teaching materials, our founders envisioned a platform 
              that could automate the time-consuming aspects of lesson preparation while maintaining pedagogical quality.
            </p>
            <p className="text-muted-foreground">
              Today, ProLingo serves thousands of teachers across the globe, continuously evolving with new features 
              and improvements based on user feedback and educational research.
            </p>
          </div>
        </div>
        
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-primary mb-6 text-center">Our Team</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-8">
            <div className="bg-white p-6 rounded-xl shadow-md text-center">
              <div className="w-24 h-24 bg-primary/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">👩‍🏫</span>
              </div>
              <h3 className="text-lg font-semibold text-primary">Sarah Johnson</h3>
              <p className="text-sm text-muted-foreground">Co-Founder & CEO</p>
              <p className="text-sm text-muted-foreground mt-2">
                Former ESL teacher with 15 years of experience
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md text-center">
              <div className="w-24 h-24 bg-primary/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">👨‍💻</span>
              </div>
              <h3 className="text-lg font-semibold text-primary">Michael Chen</h3>
              <p className="text-sm text-muted-foreground">Co-Founder & CTO</p>
              <p className="text-sm text-muted-foreground mt-2">
                AI specialist with a background in educational technology
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md text-center">
              <div className="w-24 h-24 bg-primary/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">👩‍🔬</span>
              </div>
              <h3 className="text-lg font-semibold text-primary">Elena Rodriguez</h3>
              <p className="text-sm text-muted-foreground">Head of Curriculum</p>
              <p className="text-sm text-muted-foreground mt-2">
                PhD in Applied Linguistics and CEFR expert
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md text-center">
              <div className="w-24 h-24 bg-primary/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">👨‍🎨</span>
              </div>
              <h3 className="text-lg font-semibold text-primary">David Kim</h3>
              <p className="text-sm text-muted-foreground">UX/UI Designer</p>
              <p className="text-sm text-muted-foreground mt-2">
                Specializes in creating intuitive educational interfaces
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 