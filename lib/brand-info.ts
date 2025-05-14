export interface BrandTone {
  formal: number; // 0-10 scale where 10 is most formal
  friendly: number; // 0-10 scale where 10 is most friendly
  technical: number; // 0-10 scale where 10 is most technical
  innovative: number; // 0-10 scale where 10 is most innovative
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
  name: "Brancoy HI Engine",
  description: "Brancoy HI Engine is an intelligent AI-powered migration and optimization tool that transforms your eCommerce business for Shopify. It doesn't just move your data, but continuously optimizes it, providing the smartest way to move to Shopify.",
  tone: {
    formal: 8,     // Professional, expert
    friendly: 7,   // Collaborative, supportive
    technical: 9,  // Advanced AI, data-driven
    innovative: 10 // Leading edge, future-proof
  },
  personality: {
    primary: [
      "Intelligent",
      "Efficient",
      "Optimizing",
      "Reliable",
      "Scalable",
      "Future-proof"
    ],
    secondary: [
      "Collaborative",
      "Expert",
      "Data-driven",
      "Transformative",
      "Seamless"
    ],
    avoid: [
      "Manual",
      "Basic",
      "Slow",
      "Outdated",
      "Just a migration tool",
      "Replacing your team"
    ]
  },
  writingStyle: [
    "Highlight AI capabilities and data-driven insights",
    "Emphasize speed, accuracy, and continuous optimization",
    "Use clear, confident language about Shopify migration and growth",
    "Focus on the benefits of a future-proof, scalable solution",
    "Convey expertise in eCommerce and Shopify platform",
    "Maintain a professional and collaborative tone"
  ],
  commonPhrases: [
    "Seamlessly migrate to Shopify",
    "Continuously optimizes",
    "AI-powered migration",
    "Intelligent eCommerce",
    "Data accuracy",
    "Faster migration",
    "24/7 AI Optimization",
    "Future-proof Shopify store",
    "Scalable AI power",
    "Collect, Analyze, Localize",
    "Content & SEO Optimization"
  ],
  avoidPhrases: [
    "Simple data transfer",
    "One-time fix",
    "Manual process",
    "We do it all for you (without mentioning collaboration)",
    "Get rid of your team",
    "Magic solution"
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