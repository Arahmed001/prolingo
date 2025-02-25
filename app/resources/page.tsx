export default function ResourcesPage() {
  return (
    <div className="min-h-screen bg-muted py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary mb-4">Resources</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Helpful resources to enhance your ESL teaching experience.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
          {/* Resource Cards */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-xl font-semibold text-primary mb-2">Teaching Guides</h3>
            <p className="text-muted-foreground mb-4">
              Comprehensive guides on various ESL teaching methodologies and best practices.
            </p>
            <a href="#" className="text-secondary hover:text-secondary/80 font-medium">
              Browse Guides →
            </a>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-xl font-semibold text-primary mb-2">Worksheets</h3>
            <p className="text-muted-foreground mb-4">
              Printable worksheets for various language skills and proficiency levels.
            </p>
            <a href="#" className="text-secondary hover:text-secondary/80 font-medium">
              Download Worksheets →
            </a>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-xl font-semibold text-primary mb-2">Video Tutorials</h3>
            <p className="text-muted-foreground mb-4">
              Step-by-step video guides on using ProLingo features effectively.
            </p>
            <a href="#" className="text-secondary hover:text-secondary/80 font-medium">
              Watch Videos →
            </a>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-xl font-semibold text-primary mb-2">Webinars</h3>
            <p className="text-muted-foreground mb-4">
              Recorded and upcoming webinars on ESL teaching topics and platform updates.
            </p>
            <a href="#" className="text-secondary hover:text-secondary/80 font-medium">
              Join Webinars →
            </a>
          </div>
        </div>
        
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-primary mb-6">Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="text-lg font-semibold text-primary mb-2">How do I create my first lesson?</h3>
              <p className="text-muted-foreground">
                To create your first lesson, navigate to the Lessons section and click on "Create New Lesson." 
                Follow the step-by-step guide to generate a customized lesson plan based on your requirements.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="text-lg font-semibold text-primary mb-2">Can I download materials for offline use?</h3>
              <p className="text-muted-foreground">
                Yes, all lesson materials can be downloaded as PDF files for offline use. 
                Look for the download icon in the lesson view to save materials to your device.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="text-lg font-semibold text-primary mb-2">How do I track student progress?</h3>
              <p className="text-muted-foreground">
                Student progress can be tracked through the Analytics dashboard. 
                You can view individual student performance, class averages, and progress over time.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 