import Link from "next/link"

const features = [
  { title: 'Learn', desc: 'AI-generated lessons' },
  { title: 'Practice', desc: 'Interactive quizzes' },
  { title: 'Track', desc: 'Monitor progress' }
];

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-background text-foreground">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-6xl font-bold mb-4">
          Welcome to ProLingo
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          Master programming languages with AI-powered learning
        </p>
        <Link 
          href="/lessons" 
          className="bg-primary text-primary-foreground px-8 py-3 rounded-lg text-lg font-semibold hover:opacity-90 transition-opacity"
        >
          Get Started
        </Link>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
        {features.map((feature, index) => (
          <div 
            key={index} 
            className="p-6 rounded-lg bg-card text-card-foreground border border-border hover:border-primary transition-colors"
          >
            <h2 className="text-2xl font-semibold mb-2">{feature.title}</h2>
            <p className="text-muted-foreground">{feature.desc}</p>
          </div>
        ))}
      </div>
    </main>
  )
}

