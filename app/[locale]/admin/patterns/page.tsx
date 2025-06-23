import { Metadata } from 'next';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

// Define types
type Props = {
  params: {
    locale: string
  }
}

// Metadata for the page
export const metadata: Metadata = {
  title: 'Pattern Showcase | Innolease',
  description: 'A showcase of all available pattern overlays for Innolease',
};

// Pattern demo card component
const PatternCard = ({ name, classes }: { name: string, classes: string }) => (
  <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
    <div className={`h-[200px] ${classes}`}>
      <div className="flex items-center justify-center h-full">
        <span className="px-4 py-2 bg-white/80 rounded text-gray-900 font-medium">
          {name}
        </span>
      </div>
    </div>
    <div className="p-4">
      <code className="text-sm text-gray-700 p-2 bg-gray-100 block rounded overflow-x-auto">
        {classes}
      </code>
    </div>
  </div>
);

export default function PatternsPage({ params }: Props) {
  const t = useTranslations('Common');
  
  const patterns = [
    { name: 'Wavy Pattern', classes: 'has-overlay-pattern overlay-pattern-wavy overlay-opacity-15 bg-gray-200' },
    { name: 'Shape Pattern', classes: 'has-overlay-pattern overlay-pattern-shape overlay-opacity-15 bg-gray-200' },
    { name: 'Tile Dense Pattern', classes: 'has-overlay-pattern overlay-pattern-tile-dense overlay-opacity-15 bg-gray-200' },
    { name: 'Polka Dots Pattern', classes: 'has-overlay-pattern overlay-pattern-polka-dots overlay-opacity-15 bg-gray-200' },
    { name: 'Diamonds Pattern', classes: 'has-overlay-pattern overlay-pattern-diamonds overlay-opacity-15 bg-gray-200' },
    { name: 'Grid Pattern', classes: 'has-overlay-pattern overlay-pattern-grid overlay-opacity-15 bg-gray-200' },
    { name: 'Dots Pattern', classes: 'has-overlay-pattern overlay-pattern-dots overlay-opacity-15 bg-gray-200' },
  ];
  
  // Color variations
  const colorVariations = [
    { name: 'Blue Background', classes: 'has-overlay-pattern overlay-pattern-diamonds overlay-opacity-15 bg-blue-100 text-blue-700' },
    { name: 'Green Background', classes: 'has-overlay-pattern overlay-pattern-diamonds overlay-opacity-15 bg-green-100 text-green-700' },
    { name: 'Red Background', classes: 'has-overlay-pattern overlay-pattern-diamonds overlay-opacity-15 bg-red-100 text-red-700' },
    { name: 'Yellow Background', classes: 'has-overlay-pattern overlay-pattern-polka-dots overlay-opacity-15 bg-yellow-100 text-yellow-700' },
  ];
  
  // Opacity variations
  const opacityVariations = [
    { name: 'Low Opacity (5%)', classes: 'has-overlay-pattern overlay-pattern-diamonds overlay-opacity-5 bg-purple-100 text-purple-700' },
    { name: 'Medium Opacity (10%)', classes: 'has-overlay-pattern overlay-pattern-diamonds overlay-opacity-10 bg-purple-100 text-purple-700' },
    { name: 'Higher Opacity (15%)', classes: 'has-overlay-pattern overlay-pattern-diamonds overlay-opacity-15 bg-purple-100 text-purple-700' },
    { name: 'Highest Opacity (20%)', classes: 'has-overlay-pattern overlay-pattern-diamonds overlay-opacity-20 bg-purple-100 text-purple-700' },
  ];

  return (
    <main>
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <Link href="/" className="text-[#B87333] hover:underline mb-4 inline-block">
            &larr; {t('back')}
          </Link>
          <h1 className="text-3xl font-bold font-['Inter_Tight'] text-gray-900">Pattern Showcase</h1>
          <p className="text-gray-700 mt-2">
            A demonstration of all available pattern overlays and their variations.
          </p>
        </div>
        
        <div className="mb-12">
          <h2 className="text-2xl font-bold font-['Inter_Tight'] text-gray-900 mb-4">Pattern Types</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {patterns.map((pattern, index) => (
              <PatternCard key={index} name={pattern.name} classes={pattern.classes} />
            ))}
          </div>
        </div>
        
        <div className="mb-12">
          <h2 className="text-2xl font-bold font-['Inter_Tight'] text-gray-900 mb-4">Color Variations</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {colorVariations.map((pattern, index) => (
              <PatternCard key={index} name={pattern.name} classes={pattern.classes} />
            ))}
          </div>
        </div>
        
        <div className="mb-12">
          <h2 className="text-2xl font-bold font-['Inter_Tight'] text-gray-900 mb-4">Opacity Variations</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {opacityVariations.map((pattern, index) => (
              <PatternCard key={index} name={pattern.name} classes={pattern.classes} />
            ))}
          </div>
        </div>
        
        <div className="mb-12">
          <h2 className="text-2xl font-bold font-['Inter_Tight'] text-gray-900 mb-4">Usage Examples</h2>
          
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">Hero Section</h3>
            <div className="has-overlay-pattern overlay-pattern-diamonds overlay-opacity-10 bg-gray-800 text-white p-8 rounded-lg">
              <div className="max-w-xl">
                <h2 className="text-3xl font-bold mb-4">Sample Hero Section</h2>
                <p className="mb-4">This hero section uses the diamond pattern with 10% opacity on a dark background.</p>
                <button className="bg-[#B87333] text-white px-4 py-2 rounded hover:bg-opacity-90 font-medium">
                  Learn More
                </button>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">Card Section</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="has-overlay-pattern overlay-pattern-polka-dots overlay-opacity-10 bg-blue-50 p-6 rounded-lg border border-blue-100">
                <h3 className="font-bold mb-2 text-blue-900">Feature 1</h3>
                <p className="text-blue-800">This card uses the polka dots pattern on a light blue background.</p>
              </div>
              <div className="has-overlay-pattern overlay-pattern-wavy overlay-opacity-10 bg-green-50 p-6 rounded-lg border border-green-100">
                <h3 className="font-bold mb-2 text-green-900">Feature 2</h3>
                <p className="text-green-800">This card uses the wavy pattern on a light green background.</p>
              </div>
              <div className="has-overlay-pattern overlay-pattern-shape overlay-opacity-10 bg-yellow-50 p-6 rounded-lg border border-yellow-100">
                <h3 className="font-bold mb-2 text-yellow-900">Feature 3</h3>
                <p className="text-yellow-800">This card uses the shape pattern on a light yellow background.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 