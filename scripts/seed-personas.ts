import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createPersonas() {
  console.log('🎭 Creating sample personas...');
  
  const personas = [
    {
      name: 'Tech Entrepreneur',
      description: 'Early-stage startup founder looking for AI solutions to scale their business',
      personality_traits: {
        tone: 'Professional and forward-thinking',
        style: 'Innovation-focused, direct, growth-oriented',
        expertise: 'Technology and business scaling'
      },
      system_prompt: 'You are writing for tech entrepreneurs who are building startups. Focus on innovation, scalability, and practical technology solutions. Use a professional yet accessible tone that demonstrates deep understanding of startup challenges.',
      topics: ['AI technology', 'Business automation', 'Startup scaling', 'Venture capital', 'Product development'],
      active: true
    },
    {
      name: 'Marketing Director',
      description: 'Marketing professional seeking AI tools for content creation and customer engagement',
      personality_traits: {
        tone: 'Creative and data-driven',
        style: 'Results-oriented, strategic, engaging',
        expertise: 'Digital marketing and customer acquisition'
      },
      system_prompt: 'You are writing for marketing directors and professionals. Focus on measurable results, creative strategies, and data-driven insights. Use engaging language that balances creativity with analytical rigor.',
      topics: ['Content marketing', 'AI automation', 'Customer analytics', 'Brand strategy', 'Digital advertising'],
      active: true
    },
    {
      name: 'Small Business Owner',
      description: 'Owner of a small to medium business looking to leverage AI for operational efficiency',
      personality_traits: {
        tone: 'Practical and cost-conscious',
        style: 'Straightforward, efficiency-focused, accessible',
        expertise: 'Operations and resource management'
      },
      system_prompt: 'You are writing for small business owners who need practical, cost-effective solutions. Focus on immediate benefits, ease of implementation, and return on investment. Use clear, jargon-free language.',
      topics: ['Process automation', 'Cost reduction', 'Customer service', 'Operations management', 'Business efficiency'],
      active: true
    }
  ];

  for (const persona of personas) {
    console.log('📝 Attempting to create persona:', persona.name);
    
    const { data, error } = await supabase
      .from('ai_personas')
      .insert(persona)
      .select();
    
    if (error) {
      console.error('❌ Error creating persona:', persona.name);
      console.error('   Error details:', error);
    } else {
      console.log('✅ Created persona:', persona.name);
      console.log('   Data returned:', data);
    }
  }
  
  console.log('✨ Personas seeding completed!');
}

createPersonas().catch(console.error);