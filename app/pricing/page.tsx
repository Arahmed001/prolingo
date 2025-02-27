export default function PricingPage() {
  return (
    <div id="main-content" className="min-h-screen bg-muted py-12 px-4 sm:px-6 lg:px-8">
      <div id="main-content" className="max-w-7xl mx-auto">
        <div id="main-content" className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary mb-4">Pricing Plans</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose the perfect plan for your ESL teaching needs.
          </p>
        </div>
        
        <div id="main-content" className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          {/* Basic Plan */}
          <div id="main-content" className="bg-white p-8 rounded-xl shadow-md border border-border flex flex-col">
            <h3 className="text-xl font-semibold text-primary mb-2">Basic</h3>
            <div id="main-content" className="text-4xl font-bold text-primary mb-4">$9<span className="text-lg text-muted-foreground">/month</span></div>
            <p className="text-muted-foreground mb-6">Perfect for individual teachers just getting started.</p>
            
            <ul className="space-y-3 mb-8 flex-grow">
              <li className="flex items-center">
                <svg aria-hidden="true" aria-hidden="true" className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span>10 AI-generated lessons per month</span>
              </li>
              <li className="flex items-center">
                <svg aria-hidden="true" aria-hidden="true" className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span>Basic analytics</span>
              </li>
              <li className="flex items-center">
                <svg aria-hidden="true" aria-hidden="true" className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span>Email support</span>
              </li>
            </ul>
            
            <button aria-label="Button" tabIndex={0} tabIndex={0} className="w-full py-2 px-4 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors">
              Get Started
            </button>
          </div>
          
          {/* Pro Plan */}
          <div id="main-content" className="bg-white p-8 rounded-xl shadow-lg border-2 border-primary flex flex-col relative">
            <div id="main-content" className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-3 py-1 transform translate-y-0 translate-x-0 rounded-bl-lg rounded-tr-lg">
              POPULAR
            </div>
            <h3 className="text-xl font-semibold text-primary mb-2">Pro</h3>
            <div id="main-content" className="text-4xl font-bold text-primary mb-4">$29<span className="text-lg text-muted-foreground">/month</span></div>
            <p className="text-muted-foreground mb-6">Ideal for professional teachers with multiple classes.</p>
            
            <ul className="space-y-3 mb-8 flex-grow">
              <li className="flex items-center">
                <svg aria-hidden="true" aria-hidden="true" className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span>Unlimited AI-generated lessons</span>
              </li>
              <li className="flex items-center">
                <svg aria-hidden="true" aria-hidden="true" className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span>Advanced analytics</span>
              </li>
              <li className="flex items-center">
                <svg aria-hidden="true" aria-hidden="true" className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span>Priority support</span>
              </li>
              <li className="flex items-center">
                <svg aria-hidden="true" aria-hidden="true" className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span>Custom quiz generation</span>
              </li>
            </ul>
            
            <button aria-label="Button" tabIndex={0} tabIndex={0} className="w-full py-2 px-4 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors">
              Get Started
            </button>
          </div>
          
          {/* Enterprise Plan */}
          <div id="main-content" className="bg-white p-8 rounded-xl shadow-md border border-border flex flex-col">
            <h3 className="text-xl font-semibold text-primary mb-2">Enterprise</h3>
            <div id="main-content" className="text-4xl font-bold text-primary mb-4">$99<span className="text-lg text-muted-foreground">/month</span></div>
            <p className="text-muted-foreground mb-6">For schools and educational institutions.</p>
            
            <ul className="space-y-3 mb-8 flex-grow">
              <li className="flex items-center">
                <svg aria-hidden="true" aria-hidden="true" className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span>Everything in Pro plan</span>
              </li>
              <li className="flex items-center">
                <svg aria-hidden="true" aria-hidden="true" className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span>Unlimited teacher accounts</span>
              </li>
              <li className="flex items-center">
                <svg aria-hidden="true" aria-hidden="true" className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span>Dedicated account manager</span>
              </li>
              <li className="flex items-center">
                <svg aria-hidden="true" aria-hidden="true" className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span>Custom integration options</span>
              </li>
            </ul>
            
            <button aria-label="Button" tabIndex={0} tabIndex={0} className="w-full py-2 px-4 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors">
              Contact Sales
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 