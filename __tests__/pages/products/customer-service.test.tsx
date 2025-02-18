import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import CustomerServiceProduct from '@/app/[locale]/products/customer-service/page';
import { NextIntlClientProvider } from 'next-intl';

// Mock translations
const messages = {
  Products: {
    customerService: {
      hero: {
        title: 'AI-First Customer Service',
        description: 'Test description',
        cta: 'BOOK A DEMO'
      },
      features: {
        title: 'Features That Transform Service',
        speed: {
          title: 'Lightning-Fast Responses',
          description: 'Test speed description'
        },
        quality: {
          title: 'Consistent Quality',
          description: 'Test quality description'
        },
        efficiency: {
          title: 'Enhanced Efficiency',
          description: 'Test efficiency description'
        },
        satisfaction: {
          title: 'Improved Satisfaction',
          description: 'Test satisfaction description'
        }
      },
      howItWorks: {
        title: 'How It Works',
        analyze: {
          title: 'Smart Analysis',
          description: 'Test analyze description'
        },
        assist: {
          title: 'Agent Assistance',
          description: 'Test assist description'
        },
        learn: {
          title: 'Continuous Learning',
          description: 'Test learn description'
        }
      },
      benefits: {
        title: 'Key Benefits',
        roi: {
          title: 'Rapid ROI',
          description: 'Test ROI description'
        },
        satisfaction: {
          title: 'Higher CSAT',
          description: 'Test satisfaction description'
        },
        scalability: {
          title: 'Easy Scaling',
          description: 'Test scalability description'
        }
      },
      cta: {
        title: 'Ready to Transform Your Customer Service?',
        description: 'Test CTA description',
        button: 'GET STARTED NOW'
      }
    }
  }
};

describe('CustomerServiceProduct', () => {
  const renderWithProvider = () => {
    return render(
      <NextIntlClientProvider messages={messages} locale="en">
        <CustomerServiceProduct />
      </NextIntlClientProvider>
    );
  };

  it('renders the hero section', () => {
    renderWithProvider();
    expect(screen.getByText('AI-First Customer Service')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
    expect(screen.getByText('BOOK A DEMO')).toBeInTheDocument();
  });

  it('renders all feature cards', () => {
    renderWithProvider();
    expect(screen.getByText('Lightning-Fast Responses')).toBeInTheDocument();
    expect(screen.getByText('Consistent Quality')).toBeInTheDocument();
    expect(screen.getByText('Enhanced Efficiency')).toBeInTheDocument();
    expect(screen.getByText('Improved Satisfaction')).toBeInTheDocument();
  });

  it('renders the how it works section', () => {
    renderWithProvider();
    expect(screen.getByText('How It Works')).toBeInTheDocument();
    expect(screen.getByText('Smart Analysis')).toBeInTheDocument();
    expect(screen.getByText('Agent Assistance')).toBeInTheDocument();
    expect(screen.getByText('Continuous Learning')).toBeInTheDocument();
  });

  it('renders the benefits section', () => {
    renderWithProvider();
    expect(screen.getByText('Key Benefits')).toBeInTheDocument();
    expect(screen.getByText('Rapid ROI')).toBeInTheDocument();
    expect(screen.getByText('Higher CSAT')).toBeInTheDocument();
    expect(screen.getByText('Easy Scaling')).toBeInTheDocument();
  });

  it('renders the CTA section', () => {
    renderWithProvider();
    expect(screen.getByText('Ready to Transform Your Customer Service?')).toBeInTheDocument();
    expect(screen.getByText('Test CTA description')).toBeInTheDocument();
    expect(screen.getByText('GET STARTED NOW')).toBeInTheDocument();
  });
}); 