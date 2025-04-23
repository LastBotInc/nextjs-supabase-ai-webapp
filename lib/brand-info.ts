export interface BrandTone {
  formal: number; // 0-10 scale where 10 is most formal
  friendly: number; // 0-10 scale where 10 is most friendly
  technical: number; // 0-10 scale where 10 is most technical
  innovative: number; // 0-10 scale where 10 is most innovative
  trustworthy: number; // 0-10 scale where 10 is most trustworthy
}

export interface BrandPersonality {
  primary: string[];
  secondary: string[];
  avoid: string[];
}

export interface BrandVoice {
  name: string;
  description: string;
  tone: BrandTone;
  personality: BrandPersonality;
  writingStyle: string[];
  commonPhrases: string[];
  avoidPhrases: string[];
}

export const brandInfo: BrandVoice = {
  name: "Innolease",
  description: "Innolease, part of the Autolle.com Group, provides comprehensive business vehicle leasing and fleet management solutions tailored to each client's specific needs. With 800+ vehicles nationwide and digital tools like InnoFleet Manager, we empower Finnish businesses to manage mobility with cost-efficiency, clarity, and scalability.",
  tone: {
    formal: 6,     // Professional but approachable and modern
    friendly: 6,   // Business-friendly but not overly casual
    technical: 7,  // Knowledgeable about vehicles and leasing
    innovative: 8, // Modern digital tools and services, 'On the pulse'
    trustworthy: 9 // High emphasis on transparency and reliability
  },
  personality: {
    primary: [
      "Reliable", // Luotettavuus
      "Expert", // Asiantuntijuus
      "Customer-centric", // Asiakaslähtöinen
      "Quality-focused", // Laadukkuus
      "Modern" // Ajan hermolla
    ],
    secondary: [
      "Experienced", // Kokemus
      "Transparent",
      "Adaptable",
      "Efficient",
      "Digital-forward",
      "Collaborative"
    ],
    avoid: [
      "Overly casual",
      "Ambiguous",
      "Inflexible",
      "Impersonal",
      "Traditional/outdated"
    ]
  },
  writingStyle: [
    "Clear, concise business language with minimal jargon",
    "Use concrete examples of cost savings and efficiency gains",
    "Emphasize the complete service approach from leasing to maintenance",
    "Focus on customizable solutions for different business needs",
    "Highlight digital tools that simplify fleet management",
    "Balance professional tone with approachable language",
    "Use data points and specifics when describing services"
  ],
  commonPhrases: [
    "Tailored leasing solutions",
    "Comprehensive fleet management",
    "Digital tools and services",
    "Transparent pricing",
    "Dedicated account manager",
    "Cost-efficient mobility",
    "Predictable vehicle costs",
    "One unified service experience",
    "Flexible leasing options"
  ],
  avoidPhrases: [
    "One-size-fits-all",
    "Hidden costs",
    "Standard packages only",
    "Inflexible terms",
    "Complicated processes",
    "Old-fashioned service",
    "Limited options"
  ]
};

export const getGeminiPrompt = (context: string): string => {
  const toneGuide = Object.entries(brandInfo.tone)
    .map(([key, value]) => `${key}: ${value}/10`)
    .join(', ');

  return `As ${brandInfo.name}, ${brandInfo.description}

Please write the following content while adhering to our brand voice:
    
Tone (${toneGuide})

Key personality traits to emphasize:
${brandInfo.personality.primary.join(', ')}

Writing style guidelines:
${brandInfo.writingStyle.join('\n')}

Content to write:
${context}

Note: Avoid using these phrases: ${brandInfo.avoidPhrases.join(', ')}`;
};

export const validateContent = (content: string): boolean => {
  const lowercaseContent = content.toLowerCase();
  
  // Check for avoided phrases
  const hasAvoided = brandInfo.avoidPhrases.some(phrase => 
    lowercaseContent.includes(phrase.toLowerCase())
  );
  
  return !hasAvoided;
}; 