import { ReactNode } from 'react';
import { AnimatedOrbs } from '@/app/components/AnimatedOrbs';

interface ResearchLayoutProps {
  children: ReactNode;
  hero: {
    title: string;
    description: string;
  };
}

export default function ResearchLayout({ children, hero }: ResearchLayoutProps) {
  return (
    <main className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-indigo-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 tracking-tight leading-[1.1] md:leading-[1.1]">
            {hero.title}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            {hero.description}
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="relative py-24 bg-gradient-to-br from-gray-900 to-black overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900 opacity-80" />
        
        <AnimatedOrbs orbs={[
          {
            size: 'lg',
            color: 'purple',
            blur: 'lg',
            animation: 'float',
            speed: 'medium',
            className: 'absolute top-1/4 right-1/3'
          },
          {
            size: 'lg',
            color: 'indigo',
            blur: 'lg',
            animation: 'float',
            speed: 'slow',
            className: 'absolute bottom-1/4 left-1/3'
          }
        ]} />

        <div className="container relative mx-auto px-4">
          {children}
        </div>
      </section>
    </main>
  );
} 