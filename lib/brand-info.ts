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
  name: "LastBot",
  description: "LastBot helps companies become AI-first while maintaining their focus on people. We provide a fast-track approach to AI integration, creating genuine connections and delivering autonomous solutions that empower businesses in their digital transformation journey.",
  tone: {
    formal: 7,     // Professional but not stiff
    friendly: 9,   // Very approachable and human
    technical: 8,  // Strong technical expertise but accessible
    innovative: 9  // Leading edge in AI technology
  },
  personality: {
    primary: [
      "Human-centric",
      "Innovative",
      "Trustworthy",
      "Empowering",
      "Forward-thinking"
    ],
    secondary: [
      "Approachable",
      "Educational",
      "Collaborative",
      "Ethical",
      "Results-driven"
    ],
    avoid: [
      "Impersonal",
      "Overly technical",
      "Aggressive",
      "Hype-driven",
      "Fear-mongering about AI"
    ]
  },
  writingStyle: [
    "Balance technical accuracy with human warmth",
    "Use clear, jargon-free language when explaining complex concepts",
    "Emphasize the human benefits of AI technology",
    "Share practical examples and real-world applications",
    "Address common AI concerns with empathy and understanding",
    "Focus on empowerment rather than replacement",
    "Maintain an educational and collaborative tone"
  ],
  commonPhrases: [
    "AI-first approach",
    "Human-centric AI",
    "Fast-track to AI integration",
    "Continuous learning",
    "Digital transformation",
    "Genuine connections",
    "Autonomous solutions",
    "24/7 availability"
  ],
  avoidPhrases: [
    "AI takeover",
    "Replace humans",
    "Fully automated",
    "No human intervention",
    "Revolutionary AI",
    "Disruptive technology",
    "Game-changing solution",
    "Market leader"
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

export const getKeywordGenerationDescription = (): string => {
  return `${brandInfo.name} is a company that ${brandInfo.description.toLowerCase()} We specialize in AI integration, digital transformation, and autonomous solutions for businesses. Our services include AI consulting, implementation, and ongoing support to help companies become AI-first while maintaining their human-centric approach. We focus on creating genuine connections between technology and people, providing 24/7 AI-powered solutions that empower businesses in their digital journey.`;
}; 