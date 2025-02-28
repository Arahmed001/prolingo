import ClientMarketingPage from './ClientMarketingPage';

// Static content metadata
export const metadata = {
  title: 'ProLingo - Master English with AI-Powered Learning',
  description: 'Transform your language learning journey with ProLingo\'s personalized AI approach. Try free today and join thousands of successful learners.'
};

// Make this page statically generated and publicly accessible
export const dynamic = 'force-static';

export default function MarketingPage() {
  return <ClientMarketingPage />;
} 