import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { brandInfo } from '../lib/brand-info';
import type { Database } from '../types/database';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

// Define content types with tone adjustments based on type
const contentTypes = [
  {
    name: 'News',
    slug: 'news',
    description: 'Timely reporting on current events or announcements',
    tone_adjustments: { formal: 1, friendly: -1, technical: 0, innovative: 0 },
    typical_length_min: 400,
    typical_length_max: 800,
    structure_template: ['headline', 'lead_paragraph', 'body', 'quotes', 'conclusion'],
    writing_guidelines: [
      'Start with the most important information (inverted pyramid)',
      'Use active voice and present tense when appropriate',
      'Include relevant quotes from stakeholders',
      'Provide context and background information',
      'Remain objective and factual'
    ],
    example_titles: [
      'LastBot Launches New AI Integration Platform',
      'Industry Report: AI Adoption Accelerates in 2024',
      'Partnership Announcement: LastBot and TechCorp Join Forces'
    ],
    keywords: ['announcement', 'update', 'latest', 'breaking', 'report'],
    meta_description_template: 'Latest news: {title}. Read about {topic} and its impact on {audience}.'
  },
  {
    name: 'Opinion',
    slug: 'opinion',
    description: 'Subjective commentary or perspective, often signed by the author',
    tone_adjustments: { formal: -1, friendly: 1, technical: -1, innovative: 1 },
    typical_length_min: 600,
    typical_length_max: 1200,
    structure_template: ['introduction', 'thesis', 'arguments', 'counter_arguments', 'conclusion'],
    writing_guidelines: [
      'Present a clear perspective or argument',
      'Support opinions with evidence and examples',
      'Acknowledge alternative viewpoints',
      'Use personal experiences when relevant',
      'End with a thought-provoking conclusion'
    ],
    example_titles: [
      'Why Human-Centric AI is the Future of Business',
      'The Hidden Costs of Ignoring AI Integration',
      'My Journey from AI Skeptic to Advocate'
    ],
    keywords: ['perspective', 'viewpoint', 'opinion', 'analysis', 'commentary'],
    meta_description_template: 'Opinion piece: {title}. Explore {author}\'s perspective on {topic}.'
  },
  {
    name: 'Informational/Explainer',
    slug: 'informational',
    description: 'Educational content designed to inform or clarify',
    tone_adjustments: { formal: 0, friendly: 1, technical: 1, innovative: 0 },
    typical_length_min: 800,
    typical_length_max: 1500,
    structure_template: ['introduction', 'background', 'main_concepts', 'examples', 'summary'],
    writing_guidelines: [
      'Break down complex concepts into digestible parts',
      'Use analogies and real-world examples',
      'Define technical terms clearly',
      'Include visual aids or diagrams when helpful',
      'Provide actionable takeaways'
    ],
    example_titles: [
      'Understanding AI Integration: A Beginner\'s Guide',
      'What is Human-Centric AI and Why Does it Matter?',
      'The Complete Guide to AI-First Business Transformation'
    ],
    keywords: ['guide', 'explain', 'understand', 'learn', 'basics'],
    meta_description_template: 'Learn about {topic}: {title}. A comprehensive guide covering {key_points}.'
  },
  {
    name: 'Review',
    slug: 'review',
    description: 'Assessment or critique of products, services, books, etc.',
    tone_adjustments: { formal: 0, friendly: 0, technical: 1, innovative: 0 },
    typical_length_min: 700,
    typical_length_max: 1400,
    structure_template: ['introduction', 'overview', 'pros', 'cons', 'verdict'],
    writing_guidelines: [
      'Provide balanced and fair assessment',
      'Include specific examples and use cases',
      'Compare with alternatives when relevant',
      'Highlight both strengths and weaknesses',
      'Give clear recommendations'
    ],
    example_titles: [
      'Review: Top 5 AI Integration Platforms for SMBs',
      'LastBot vs Competitors: An In-Depth Comparison',
      'Book Review: "The AI-First Mindset" by Jane Doe'
    ],
    keywords: ['review', 'comparison', 'evaluation', 'assessment', 'verdict'],
    meta_description_template: 'Review of {product}: {title}. Detailed analysis including pros, cons, and recommendations.'
  },
  {
    name: 'How-to/Tutorial',
    slug: 'how-to',
    description: 'Step-by-step guidance or instruction',
    tone_adjustments: { formal: -1, friendly: 1, technical: 0, innovative: 0 },
    typical_length_min: 600,
    typical_length_max: 2000,
    structure_template: ['introduction', 'requirements', 'steps', 'troubleshooting', 'conclusion'],
    writing_guidelines: [
      'Use numbered steps for clarity',
      'Include prerequisites and requirements upfront',
      'Provide screenshots or code examples',
      'Anticipate common problems and solutions',
      'Test all instructions before publishing'
    ],
    example_titles: [
      'How to Implement AI Chatbots in 5 Easy Steps',
      'Tutorial: Setting Up Your First AI Integration',
      'Step-by-Step Guide to AI-Powered Customer Service'
    ],
    keywords: ['how-to', 'tutorial', 'guide', 'steps', 'instructions'],
    meta_description_template: 'Learn how to {action}: {title}. Step-by-step tutorial with {unique_value}.'
  },
  {
    name: 'Case Study',
    slug: 'case-study',
    description: 'Real-world example to demonstrate a concept or result',
    tone_adjustments: { formal: 1, friendly: 0, technical: 0, innovative: 0 },
    typical_length_min: 1000,
    typical_length_max: 2500,
    structure_template: ['executive_summary', 'challenge', 'solution', 'implementation', 'results', 'lessons_learned'],
    writing_guidelines: [
      'Start with measurable results',
      'Provide detailed background and context',
      'Explain the implementation process',
      'Include specific metrics and outcomes',
      'Extract actionable insights'
    ],
    example_titles: [
      'Case Study: How XYZ Corp Increased Efficiency by 40% with AI',
      'From Manual to Automated: A Digital Transformation Success Story',
      'Small Business, Big Impact: AI Integration Case Study'
    ],
    keywords: ['case study', 'success story', 'results', 'implementation', 'roi'],
    meta_description_template: 'Case study: {title}. Discover how {company} achieved {result} using {solution}.'
  },
  {
    name: 'Listicle',
    slug: 'listicle',
    description: 'List-based articles (e.g., "10 Ways to...")',
    tone_adjustments: { formal: -2, friendly: 2, technical: -1, innovative: 1 },
    typical_length_min: 500,
    typical_length_max: 1500,
    structure_template: ['introduction', 'list_items', 'conclusion'],
    writing_guidelines: [
      'Use compelling numbered headlines',
      'Keep each point concise but informative',
      'Order items logically (importance, chronology, etc.)',
      'Include actionable tips in each item',
      'Add a summary or key takeaway'
    ],
    example_titles: [
      '7 Signs Your Business Needs AI Integration',
      '10 Common AI Myths Debunked',
      '5 Quick Wins for AI-First Transformation'
    ],
    keywords: ['tips', 'ways', 'reasons', 'list', 'top'],
    meta_description_template: '{number} {item_type} for {topic}: {title}. Essential tips and insights.'
  },
  {
    name: 'Interview',
    slug: 'interview',
    description: 'Q&A or narrative based on someone\'s responses',
    tone_adjustments: { formal: 0, friendly: 2, technical: 0, innovative: 0 },
    typical_length_min: 800,
    typical_length_max: 2000,
    structure_template: ['introduction', 'background', 'qa_section', 'key_insights', 'conclusion'],
    writing_guidelines: [
      'Provide context about the interviewee',
      'Ask thought-provoking questions',
      'Maintain the interviewee\'s voice',
      'Highlight key quotes and insights',
      'Include relevant follow-up questions'
    ],
    example_titles: [
      'Interview with AI Pioneer: The Future of Human-Centric Technology',
      'CEO Spotlight: Leading an AI-First Company',
      'Expert Q&A: Navigating AI Integration Challenges'
    ],
    keywords: ['interview', 'qa', 'conversation', 'insights', 'expert'],
    meta_description_template: 'Interview with {interviewee}: {title}. Insights on {topic} and {key_theme}.'
  },
  {
    name: 'Thought Leadership',
    slug: 'thought-leadership',
    description: 'Strategic, expert commentary often tied to brand voice or authority',
    tone_adjustments: { formal: 2, friendly: 0, technical: 1, innovative: 2 },
    typical_length_min: 1000,
    typical_length_max: 2000,
    structure_template: ['executive_summary', 'current_state', 'vision', 'strategy', 'call_to_action'],
    writing_guidelines: [
      'Present unique insights and perspectives',
      'Back arguments with data and research',
      'Address industry trends and future directions',
      'Establish authority and expertise',
      'Inspire action and change'
    ],
    example_titles: [
      'The Next Decade of AI: Predictions and Preparations',
      'Building Ethical AI Systems: A Leadership Imperative',
      'Why Every Company Must Become an AI Company'
    ],
    keywords: ['future', 'strategy', 'leadership', 'innovation', 'transformation'],
    meta_description_template: 'Thought leadership: {title}. Strategic insights on {topic} for {audience}.'
  },
  {
    name: 'Roundup',
    slug: 'roundup',
    description: 'Curated collection of resources, tools, or insights',
    tone_adjustments: { formal: -1, friendly: 1, technical: 0, innovative: 0 },
    typical_length_min: 600,
    typical_length_max: 1800,
    structure_template: ['introduction', 'curated_items', 'analysis', 'recommendations'],
    writing_guidelines: [
      'Provide diverse and valuable resources',
      'Include brief descriptions for each item',
      'Organize by category or theme',
      'Add personal insights or commentary',
      'Update regularly to maintain relevance'
    ],
    example_titles: [
      'Monthly Roundup: Best AI Tools for Small Business',
      'Year in Review: Top AI Breakthroughs of 2024',
      'Resource Roundup: Essential AI Learning Materials'
    ],
    keywords: ['roundup', 'collection', 'resources', 'tools', 'best'],
    meta_description_template: '{title}: Curated collection of {item_type} for {audience}. {unique_value}.'
  }
];

async function seedContentTypes() {
  console.log('Starting content types seeding...');

  try {
    // First, check if we have any brands to associate with (optional)
    const { data: brands } = await supabase
      .from('brands')
      .select('id')
      .limit(1);

    const defaultBrandId = brands?.[0]?.id || null;

    // Insert content types
    for (const contentType of contentTypes) {
      const { tone_adjustments, ...contentTypeData } = contentType;
      
      // Calculate adjusted tones based on brand defaults
      const adjustedTones = {
        tone_formal: Math.max(0, Math.min(10, brandInfo.tone.formal + tone_adjustments.formal)),
        tone_friendly: Math.max(0, Math.min(10, brandInfo.tone.friendly + tone_adjustments.friendly)),
        tone_technical: Math.max(0, Math.min(10, brandInfo.tone.technical + tone_adjustments.technical)),
        tone_innovative: Math.max(0, Math.min(10, brandInfo.tone.innovative + tone_adjustments.innovative))
      };

      const { data, error } = await supabase
        .from('content_types')
        .insert({
          ...contentTypeData,
          ...adjustedTones,
          brand_id: defaultBrandId,
          is_system: true, // Mark as system content types
          is_active: true
        })
        .select()
        .single();

      if (error) {
        console.error(`Error inserting content type ${contentType.name}:`, error);
      } else {
        console.log(`✅ Created content type: ${contentType.name}`);
      }
    }

    console.log('\n✨ Content types seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding content types:', error);
    process.exit(1);
  }
}

// Run the seeding
seedContentTypes();