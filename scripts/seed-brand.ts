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

async function seedBrand() {
  console.log('Starting brand seeding...');

  try {
    // Get the admin user to associate with the brand
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id')
      .eq('is_admin', true)
      .limit(1);

    if (!profiles || profiles.length === 0) {
      console.error('No admin user found. Please create an admin user first.');
      console.log('Run: npm run seed:users:local');
      process.exit(1);
    }

    const adminUserId = profiles[0].id;
    console.log(`Using admin user: ${adminUserId}`);

    // Check if brand already exists
    const { data: existingBrand } = await supabase
      .from('brands')
      .select('id')
      .eq('name', brandInfo.name)
      .single();

    if (existingBrand) {
      console.log(`Brand "${brandInfo.name}" already exists. Updating...`);
      
      const { error } = await supabase
        .from('brands')
        .update({
          website_url: brandInfo.websiteUrl,
          description: brandInfo.description,
          tone_formal: brandInfo.tone.formal,
          tone_friendly: brandInfo.tone.friendly,
          tone_technical: brandInfo.tone.technical,
          tone_innovative: brandInfo.tone.innovative,
          personality_primary: brandInfo.personality.primary,
          personality_secondary: brandInfo.personality.secondary,
          personality_avoid: brandInfo.personality.avoid,
          writing_style: brandInfo.writingStyle,
          common_phrases: brandInfo.commonPhrases,
          avoid_phrases: brandInfo.avoidPhrases,
          services: brandInfo.services,
          solutions: brandInfo.solutions,
          is_active: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingBrand.id);

      if (error) {
        console.error('Error updating brand:', error);
        process.exit(1);
      }

      console.log(`✅ Brand "${brandInfo.name}" updated successfully!`);
    } else {
      // Create new brand
      const { data, error } = await supabase
        .from('brands')
        .insert({
          user_id: adminUserId,
          name: brandInfo.name,
          website_url: brandInfo.websiteUrl,
          description: brandInfo.description,
          tone_formal: brandInfo.tone.formal,
          tone_friendly: brandInfo.tone.friendly,
          tone_technical: brandInfo.tone.technical,
          tone_innovative: brandInfo.tone.innovative,
          personality_primary: brandInfo.personality.primary,
          personality_secondary: brandInfo.personality.secondary,
          personality_avoid: brandInfo.personality.avoid,
          writing_style: brandInfo.writingStyle,
          common_phrases: brandInfo.commonPhrases,
          avoid_phrases: brandInfo.avoidPhrases,
          services: brandInfo.services,
          solutions: brandInfo.solutions,
          is_active: true
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating brand:', error);
        process.exit(1);
      }

      console.log(`✅ Brand "${brandInfo.name}" created successfully!`);
      console.log(`Brand ID: ${data.id}`);
    }

    // Display brand summary
    console.log('\n📊 Brand Summary:');
    console.log(`Name: ${brandInfo.name}`);
    console.log(`Website: ${brandInfo.websiteUrl}`);
    console.log(`Services: ${brandInfo.services.length}`);
    console.log(`Solutions: ${brandInfo.solutions.length}`);
    console.log(`Tone: Formal ${brandInfo.tone.formal}/10, Friendly ${brandInfo.tone.friendly}/10`);
    console.log(`Primary traits: ${brandInfo.personality.primary.join(', ')}`);

    console.log('\n✨ Brand seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding brand:', error);
    process.exit(1);
  }
}

// Run the seeding
seedBrand();