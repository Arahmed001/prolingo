import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AIInsightsDashboard from '../../app/ai-insights/page';

// Mock the next/navigation module
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock the firebase auth module
jest.mock('../../lib/firebase', () => ({
  auth: {
    currentUser: { uid: 'test-user-id' },
    onAuthStateChanged: jest.fn((auth, callback) => {
      callback({ uid: 'test-user-id' });
      return jest.fn(); // Return unsubscribe function
    }),
  },
  db: {
    collection: jest.fn(() => ({
      where: jest.fn(() => ({
        get: jest.fn(() => Promise.resolve({
          docs: [{ id: 'doc1', data: () => ({ role: 'admin' }) }],
        })),
      })),
    })),
  },
}));

// Mock Chart.js
jest.mock('chart.js', () => ({
  Chart: jest.fn(),
  registerables: [],
}));

// Mock the Header and Footer components
jest.mock('../../app/components/Header', () => {
  return function DummyHeader() {
    return <div data-testid="mock-header">Header</div>;
  };
});

jest.mock('../../app/components/Footer', () => {
  return function DummyFooter() {
    return <div data-testid="mock-footer">Footer</div>;
  };
});

describe('AI Insights Dashboard Page', () => {
  it('renders the AI insights dashboard', async () => {
    // Render the component
    render(<AIInsightsDashboard />);
    
    // Wait for the loading state to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
    
    // Check for the main heading
    expect(screen.getByText('AI Learning Insights')).toBeInTheDocument();
    
    // Check for key sections
    expect(screen.getByText('Predictive Insights')).toBeInTheDocument();
    expect(screen.getByText('Learning Recommendations')).toBeInTheDocument();
    
    // Verify header and footer are rendered
    expect(screen.getByTestId('mock-header')).toBeInTheDocument();
    expect(screen.getByTestId('mock-footer')).toBeInTheDocument();
  });
}); 