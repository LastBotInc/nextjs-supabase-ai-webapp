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

export interface BrandService {
  name: string;
  description: string;
}

export interface BrandSolution {
  name: string;
  description: string;
}

export interface BrandVoice {
  name: string;
  websiteUrl: string;
  description: string;
  tone: BrandTone;
  personality: BrandPersonality;
  writingStyle: string[];
  commonPhrases: string[];
  avoidPhrases: string[];
  services: BrandService[];
  solutions: BrandSolution[];
}

export const brandInfo: BrandVoice = {
  name: "LastBot",
  websiteUrl: "https://www.lastbot.com",
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
  ],
  services: [
    {
      name: "AI Consulting",
      description: "Strategic guidance to help organizations identify and implement AI opportunities that align with business goals"
    },
    {
      name: "AI Implementation",
      description: "End-to-end deployment of AI solutions with focus on seamless integration into existing workflows"
    },
    {
      name: "Custom AI Development",
      description: "Tailored AI applications designed specifically for your unique business requirements"
    },
    {
      name: "AI Training & Workshops",
      description: "Comprehensive training programs to upskill teams and foster AI literacy across organizations"
    },
    {
      name: "AI Support & Maintenance",
      description: "Ongoing support to ensure AI solutions continue delivering value and evolve with your needs"
    }
  ],
  solutions: [
    {
      name: "LastBot Chat",
      description: "Intelligent conversational AI that provides 24/7 customer support while maintaining your brand voice"
    },
    {
      name: "LastBot Analytics",
      description: "AI-powered analytics platform that transforms data into actionable business insights"
    },
    {
      name: "LastBot Automation",
      description: "Smart automation tools that streamline repetitive tasks while keeping humans in control"
    },
    {
      name: "LastBot Content",
      description: "AI content generation system that creates brand-aligned content at scale"
    },
    {
      name: "LastBot Integration Hub",
      description: "Seamless connectivity between AI capabilities and your existing tech stack"
    }
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