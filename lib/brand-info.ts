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
  detailedDescription: string;
  domain: string;
  industry: string;
  targetAudience: string[];
  keyServices: string[];
  tone: BrandTone;
  personality: BrandPersonality;
  writingStyle: string[];
  commonPhrases: string[];
  avoidPhrases: string[];
}

export const brandInfo: BrandVoice = {
  name: "Brancoy HI Engine",
  description: "Brancoy HI Engine is an intelligent AI-powered migration and optimization tool that transforms your eCommerce business for Shopify. It doesn't just move your data, but continuously optimizes it, providing the smartest way to move to Shopify.",
  detailedDescription: "Brancoy HI Engine is a comprehensive AI-powered eCommerce migration and optimization platform specifically designed for Shopify. Unlike traditional migration tools that simply transfer data, Brancoy HI Engine intelligently analyzes, optimizes, and continuously improves your eCommerce store throughout the migration process and beyond. Our platform combines advanced AI algorithms with deep Shopify expertise to ensure seamless data migration, SEO preservation, performance optimization, and ongoing store enhancement. We specialize in migrating from platforms like WooCommerce, Magento, BigCommerce, and custom solutions to Shopify, while maintaining data integrity, improving site performance, and enhancing the overall customer experience. Our AI continuously monitors and optimizes product catalogs, customer data, order history, inventory management, and marketing campaigns to maximize conversion rates and revenue growth.",
  domain: "brancoy.com",
  industry: "eCommerce Technology & Migration Services",
  targetAudience: [
    "eCommerce business owners looking to migrate to Shopify",
    "Digital agencies managing client migrations",
    "Enterprise retailers seeking platform optimization",
    "Shopify developers and consultants",
    "Online store managers and technical teams"
  ],
  keyServices: [
    "AI-powered eCommerce migration to Shopify",
    "Automated data optimization and cleanup",
    "SEO preservation and enhancement during migration",
    "Performance optimization and speed improvements",
    "Continuous AI-driven store optimization",
    "Multi-platform migration support (WooCommerce, Magento, BigCommerce)",
    "Custom migration solutions for enterprise clients",
    "Post-migration monitoring and optimization",
    "Data integrity and security assurance",
    "24/7 AI-powered store monitoring and improvements"
  ],
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

  return `As ${brandInfo.name}, ${brandInfo.detailedDescription}

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
  return `${brandInfo.detailedDescription}

Industry: ${brandInfo.industry}
Domain: ${brandInfo.domain}

Key Services:
${brandInfo.keyServices.map(service => `- ${service}`).join('\n')}

Target Audience:
${brandInfo.targetAudience.map(audience => `- ${audience}`).join('\n')}`;
}; 