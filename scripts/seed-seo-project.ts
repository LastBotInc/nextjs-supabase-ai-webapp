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

async function seedSeoProject() {
  console.log('Starting SEO project seeding...');

  try {
    // Get the admin user to associate with the project
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

    // Extract domain from websiteUrl
    const domain = new URL(brandInfo.websiteUrl).hostname;

    // Check if project already exists
    const { data: existingProject } = await supabase
      .from('seo_projects')
      .select('id')
      .eq('domain', domain)
      .single();

    if (existingProject) {
      console.log(`SEO project for "${domain}" already exists. Updating...`);
      
      const { error } = await supabase
        .from('seo_projects')
        .update({
          name: `${brandInfo.name} - Main Website`,
          description: `SEO tracking and analysis for ${brandInfo.name}'s main website. ${brandInfo.description}`,
          settings: {
            brand: {
              name: brandInfo.name,
              description: brandInfo.description,
              tone: brandInfo.tone,
              keywords: brandInfo.commonPhrases,
              services: brandInfo.services.map(s => s.name),
              solutions: brandInfo.solutions.map(s => s.name)
            },
            tracking: {
              competitors: [],
              targetLocations: ['United States', 'Global'],
              targetLanguages: ['en'],
              updateFrequency: 'weekly'
            },
            alerts: {
              enabled: true,
              emailNotifications: true,
              thresholds: {
                positionDrop: 5,
                trafficDrop: 20,
                newCompetitor: true
              }
            }
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', existingProject.id);

      if (error) {
        console.error('Error updating SEO project:', error);
        process.exit(1);
      }

      console.log(`✅ SEO project "${brandInfo.name} - Main Website" updated successfully!`);
    } else {
      // Create new SEO project
      const { data, error } = await supabase
        .from('seo_projects')
        .insert({
          user_id: adminUserId,
          name: `${brandInfo.name} - Main Website`,
          domain: domain,
          description: `SEO tracking and analysis for ${brandInfo.name}'s main website. ${brandInfo.description}`,
          settings: {
            brand: {
              name: brandInfo.name,
              description: brandInfo.description,
              tone: brandInfo.tone,
              keywords: brandInfo.commonPhrases,
              services: brandInfo.services.map(s => s.name),
              solutions: brandInfo.solutions.map(s => s.name)
            },
            tracking: {
              competitors: [],
              targetLocations: ['United States', 'Global'],
              targetLanguages: ['en'],
              updateFrequency: 'weekly'
            },
            alerts: {
              enabled: true,
              emailNotifications: true,
              thresholds: {
                positionDrop: 5,
                trafficDrop: 20,
                newCompetitor: true
              }
            }
          }
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating SEO project:', error);
        process.exit(1);
      }

      console.log(`✅ SEO project "${brandInfo.name} - Main Website" created successfully!`);
      console.log(`Project ID: ${data.id}`);
      console.log(`Domain: ${domain}`);

      // Seed initial keywords based on brand phrases
      console.log('\n🔍 Seeding initial keywords...');
      
      const keywordsToInsert = brandInfo.commonPhrases.map(phrase => ({
        keyword: phrase.toLowerCase(),
        project_id: data.id,
        search_intent: phrase.includes('solution') || phrase.includes('integration') ? 'commercial' : 'informational',
        created_at: new Date().toISOString()
      }));

      // Add service-related keywords
      brandInfo.services.forEach(service => {
        keywordsToInsert.push({
          keyword: service.name.toLowerCase(),
          project_id: data.id,
          search_intent: 'commercial',
          created_at: new Date().toISOString()
        });
      });

      // Add solution-related keywords
      brandInfo.solutions.forEach(solution => {
        keywordsToInsert.push({
          keyword: solution.name.toLowerCase(),
          project_id: data.id,
          search_intent: 'transactional',
          created_at: new Date().toISOString()
        });
      });

      const { data: keywords, error: keywordError } = await supabase
        .from('keyword_research')
        .insert(keywordsToInsert)
        .select();

      if (keywordError) {
        console.error('Error seeding keywords:', keywordError);
        // Don't exit, just log the error
      } else {
        console.log(`✅ Seeded ${keywords.length} initial keywords`);
      }
    }

    // Display project summary
    console.log('\n📊 SEO Project Summary:');
    console.log(`Name: ${brandInfo.name} - Main Website`);
    console.log(`Domain: ${domain}`);
    console.log(`Website: ${brandInfo.websiteUrl}`);
    console.log(`Services: ${brandInfo.services.length}`);
    console.log(`Solutions: ${brandInfo.solutions.length}`);
    console.log(`Common Phrases: ${brandInfo.commonPhrases.length}`);

    console.log('\n✨ SEO project seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding SEO project:', error);
    process.exit(1);
  }
}

// Run the seeding
seedSeoProject();