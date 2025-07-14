import { inngest } from './inngest-client';
import { createClient } from '@/utils/supabase/server';
import { GoogleGenAI, Type } from '@google/genai';
import { marked } from 'marked';

export const helloWorld = inngest.createFunction(
  { id: 'hello-world' },
  { event: 'test/hello.world' },
  async ({ event, step }) => {
    await step.sleep('wait-a-moment', '1s');
    return { message: `Hello ${event.data.email || 'World'}!` };
  },
);

// Function to publish scheduled posts
export const publishScheduledPosts = inngest.createFunction(
  { 
    id: 'publish-scheduled-posts',
    name: 'Publish Scheduled Posts',
  },
  { cron: '*/15 * * * *' }, // Run every 15 minutes
  async ({ step }) => {
    const published = await step.run('check-and-publish-posts', async () => {
      const supabase = await createClient();
      const now = new Date().toISOString();
      
      // Find posts that are scheduled to be published
      const { data: scheduledPosts, error: fetchError } = await supabase
        .from('posts')
        .select('*')
        .eq('published', false)
        .not('scheduled_publish_at', 'is', null)
        .lte('scheduled_publish_at', now)
        .limit(10);

      if (fetchError) {
        console.error('Error fetching scheduled posts:', fetchError);
        throw fetchError;
      }

      if (!scheduledPosts || scheduledPosts.length === 0) {
        return { publishedCount: 0 };
      }

      // Publish each post
      const publishedIds = [];
      for (const post of scheduledPosts) {
        const { error: updateError } = await supabase
          .from('posts')
          .update({ 
            published: true,
            updated_at: now
          })
          .eq('id', post.id);

        if (updateError) {
          console.error(`Error publishing post ${post.id}:`, updateError);
        } else {
          publishedIds.push(post.id);
          console.log(`✅ Published post: ${post.title} (${post.id})`);
        }
      }

      return { 
        publishedCount: publishedIds.length,
        publishedIds 
      };
    });

    return published;
  }
);

// Function to generate content for upcoming calendar entries
export const generateDailyContent = inngest.createFunction(
  { 
    id: 'generate-daily-content',
    name: 'Generate Daily Content',
  },
  { cron: '0 9 * * *' }, // Run daily at 9 AM
  async ({ step }) => {
    const generated = await step.run('generate-upcoming-content', async () => {
      const supabase = await createClient();
      
      // Get tomorrow's date
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];
      
      // Find calendar entries that need content generation
      const { data: calendarEntries, error: fetchError } = await supabase
        .from('content_calendar')
        .select('*, ai_personas(*)')
        .eq('status', 'planned')
        .eq('date', tomorrowStr)
        .is('post_id', null)
        .limit(5);

      if (fetchError) {
        console.error('Error fetching calendar entries:', fetchError);
        throw fetchError;
      }

      if (!calendarEntries || calendarEntries.length === 0) {
        return { generatedCount: 0 };
      }

      const generatedPosts = [];
      
      for (const entry of calendarEntries) {
        try {
          // Update status to generating
          await supabase
            .from('content_calendar')
            .update({ status: 'generating' })
            .eq('id', entry.id);

          // Generate content using the same system as manual generation
          await inngest.send({
            name: 'ai/content.generate',
            data: {
              planId: entry.id,
              userId: entry.created_by,
              title: entry.planned_title || entry.topic,
              prompt: entry.generation_prompt || `Write about: ${entry.topic}`,
              contentType: entry.content_types || { name: entry.content_type },
              personaIds: entry.multiple_persona_ids || [entry.persona_id],
              language: entry.locale || 'en',
              keywords: entry.keywords || [],
              topics: [entry.topic, ...(entry.custom_topics || [])],
              scheduledDate: entry.date,
              scheduledTime: entry.time_slot,
              makeItMine: '',
              generateImage: false,
              imagePrompt: ''
            }
          });

          generatedPosts.push(entry.id);
          console.log(`✅ Generated content for: ${entry.topic} (${entry.id})`);

        } catch (error) {
          console.error(`Error generating content for entry ${entry.id}:`, error);
          
          // Update status to failed
          await supabase
            .from('content_calendar')
            .update({ status: 'failed' })
            .eq('id', entry.id);
        }
      }

      return { 
        generatedCount: generatedPosts.length,
        generatedPostIds: generatedPosts 
      };
    });

    return generated;
  }
);

// Function to analyze content performance weekly
export const analyzeContentPerformance = inngest.createFunction(
  { 
    id: 'analyze-content-performance',
    name: 'Analyze Content Performance',
  },
  { cron: '0 10 * * 1' }, // Run weekly on Mondays at 10 AM
  async ({ step }) => {
    const analysis = await step.run('analyze-weekly-performance', async () => {
      const supabase = await createClient();
      
      // Get posts from the last week
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const { data: posts, error: fetchError } = await supabase
        .from('posts')
        .select('*, ai_personas(*)')
        .eq('published', true)
        .gte('updated_at', oneWeekAgo.toISOString())
        .not('ai_persona_id', 'is', null);

      if (fetchError) {
        console.error('Error fetching posts:', fetchError);
        throw fetchError;
      }

      // Group performance by persona
      const performanceByPersona: Record<string, any> = {};
      
      for (const post of posts || []) {
        if (!post.ai_persona_id) continue;
        
        if (!performanceByPersona[post.ai_persona_id]) {
          performanceByPersona[post.ai_persona_id] = {
            personaName: post.ai_personas?.name,
            postCount: 0,
            topics: []
          };
        }
        
        performanceByPersona[post.ai_persona_id].postCount++;
        performanceByPersona[post.ai_persona_id].topics.push(post.title);
      }

      console.log('📊 Weekly content performance analysis:', performanceByPersona);
      
      return { 
        analyzedPosts: posts?.length || 0,
        performanceByPersona 
      };
    });

    return analysis;
  }
);

// Function to handle bulk content generation
export const bulkContentGeneration = inngest.createFunction(
  {
    id: 'bulk-content-generation',
    name: 'Bulk Content Generation',
    concurrency: {
      limit: 3, // Limit concurrent executions
    },
  },
  { event: 'content/bulk-generation.start' },
  async ({ event, step }) => {
    const { configId, items } = event.data;
    const results = { completed: 0, failed: 0, total: items.length };

    // Initialize AI
    const API_KEY = process.env.GOOGLE_AI_STUDIO_KEY;
    if (!API_KEY) {
      throw new Error('GOOGLE_AI_STUDIO_KEY is not set');
    }
    const ai = new GoogleGenAI({ apiKey: API_KEY });

    // Process items in batches
    const batchSize = 5;
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      
      await step.run(`process-batch-${i}`, async () => {
        const supabase = await createClient();
        
        for (const item of batch) {
          try {
            // Get persona and content type details
            const [personaResult, contentTypeResult] = await Promise.all([
              supabase.from('ai_personas').select('*').eq('id', item.personaId).single(),
              supabase.from('content_types').select('*').eq('id', item.contentTypeId).single()
            ]);

            if (personaResult.error || contentTypeResult.error) {
              throw new Error('Failed to fetch persona or content type');
            }

            const persona = personaResult.data;
            const contentType = contentTypeResult.data;

            // Get brand if associated with content type
            let brand = null;
            if (contentType.brand_id) {
              const { data: brandData } = await supabase
                .from('brands')
                .select('*')
                .eq('id', contentType.brand_id)
                .single();
              brand = brandData;
            }

            // Build the prompt
            const prompt = `
You are ${persona.name}. ${persona.description}

${persona.system_prompt}

Content Type: ${contentType.name}
${contentType.description ? `Description: ${contentType.description}` : ''}

Topic: ${item.topic}
Keywords to include: ${item.keywords.join(', ')}
Target Language: ${item.language}

${contentType.writing_guidelines?.length ? `
Writing Guidelines:
${contentType.writing_guidelines.map((g: string) => `- ${g}`).join('\n')}
` : ''}

${contentType.structure_template?.length ? `
Structure Template:
${contentType.structure_template.map((s: string) => `- ${s}`).join('\n')}
` : ''}

${brand ? `
Brand Voice:
- Tone: Formal ${contentType.tone_formal || brand.tone_formal}/10, Friendly ${contentType.tone_friendly || brand.tone_friendly}/10
- Primary traits: ${brand.personality_primary.join(', ')}
- Writing style: ${brand.writing_style.join(', ')}
- Common phrases: ${brand.common_phrases.join(', ')}
- Avoid: ${brand.avoid_phrases.join(', ')}
` : ''}

Generate a ${contentType.typical_length_min}-${contentType.typical_length_max} word article.

WRITING REQUIREMENTS - PROFESSIONAL YET NATURAL:

**SENTENCE VARIETY**: Create natural rhythm through varied sentence lengths (7-35 words typically). Short sentences emphasize key points. Longer sentences develop complex ideas with appropriate detail and context.

**VOCABULARY**: Use professional language that remains accessible. Technical terms should be explained naturally within the text. Avoid jargon unless necessary for the audience.

1. **Writing Structure**:
   - Varied sentence lengths for natural flow
   - Clear paragraph organization
   - Logical progression of ideas
   - Smooth transitions between concepts
   - Examples and data to support points

2. **Professional Tone**:
   - Authoritative but approachable
   - Specific examples and case studies
   - Industry-appropriate terminology
   - Clear explanations of complex concepts
   - Evidence-based arguments
   - Practical insights and takeaways

3. **Natural Writing Elements**:
   - Professional opinions: "In my experience..."
   - Thoughtful questions: "This raises an important question..."
   - Direct but respectful address: "You may have encountered...", "Consider this scenario..."
   - Measured reactions: "This finding was particularly significant"
   - Relevant context: "This connects to the broader trend of..."

4. **Avoid AI Patterns**:
   - NEVER use: "moreover", "furthermore", "nevertheless", "albeit", "whilst"
   - Vary paragraph structure naturally
   - Use transitions that feel conversational
   - Acknowledge nuance: "While X is generally true, there are cases where Y applies"
   - Include specific details: "In March 2023" instead of "recently"
   - Reference current industry developments appropriately

5. **Credibility Markers**:
   - Acknowledge limitations: "The data suggests, though more research is needed..."
   - Present balanced views: "While some argue X, others point to Y"
   - Include relevant examples from recognized companies or studies
   - Use industry terminology correctly and consistently
   - Reference specific tools, platforms, or methodologies
   - Cite approximate figures when exact data isn't available

6. **Writing Quality**:
   - Consistent grammar and punctuation
   - Professional formatting throughout
   - Clear and concise expression
   - Logical flow of ideas
   - Proper use of technical terms
   - No intentional errors or typos

Return the content in JSON format:
{
  "title": "Engaging title here",
  "content": "Full article content in markdown format",
  "excerpt": "Brief 2-3 sentence summary",
  "meta_description": "SEO meta description (max 160 chars)",
  "tags": ["tag1", "tag2", "tag3"],
  "slug": "url-friendly-slug"
}`;

            // Generate content
            const result = await ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: prompt,
              config: {
                temperature: 0.8,
                maxOutputTokens: 8192
              }
            });
            const text = result.text;
            
            // Parse the JSON response
            const content = JSON.parse(text.replace(/```json\n?/g, '').replace(/```\n?/g, ''));
            
            // Translate if needed
            let finalContent = content;
            if (item.language !== 'en') {
              const translationPrompt = `
Translate the following content to ${item.language === 'fi' ? 'Finnish' : 'Swedish'}. 
Maintain the same tone, style, and formatting.
Keep technical terms and brand names unchanged.

${JSON.stringify(content)}

Return in the same JSON format.`;
              
              const translationResult = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: translationPrompt,
                config: {
                  temperature: 0.3,
                  maxOutputTokens: 8192
                }
              });
              const translatedText = translationResult.text;
              finalContent = JSON.parse(translatedText.replace(/```json\n?/g, '').replace(/```\n?/g, ''));
            }

            // Convert markdown content to HTML
            const htmlContent = await marked(finalContent.content);

            // Create the post
            const { data: post, error: postError } = await supabase
              .from('posts')
              .insert({
                title: finalContent.title,
                content: htmlContent, // Use HTML instead of markdown
                excerpt: finalContent.excerpt,
                meta_description: finalContent.meta_description,
                tags: finalContent.tags,
                slug: `${finalContent.slug}-${Date.now()}`,
                locale: item.language,
                published: false,
                scheduled_publish_at: item.scheduledDate ? `${item.scheduledDate}T${item.scheduledTime}:00` : null,
                ai_persona_id: item.personaId,
                generation_prompt: item.topic,
                auto_generated: true,
                subject: 'generative-ai'
              })
              .select()
              .single();

            if (postError) throw postError;

            // Create calendar entry if scheduled
            if (item.scheduledDate) {
              await supabase
                .from('content_calendar')
                .insert({
                  date: item.scheduledDate,
                  time_slot: `${item.scheduledTime}:00`,
                  topic: item.topic,
                  keywords: item.keywords,
                  target_audience: '',
                  persona_id: item.personaId,
                  content_type: contentType.slug,
                  status: 'scheduled',
                  post_id: post.id,
                  locale: item.language
                });
            }

            results.completed++;
            console.log(`✅ Generated: ${finalContent.title} (${item.language})`);
            
          } catch (error) {
            console.error(`Error processing item ${item.id}:`, error);
            results.failed++;
          }
        }
      });

      // Update progress
      await step.run(`update-progress-${i}`, async () => {
        await step.sendEvent('content/bulk-generation.progress', {
          configId,
          progress: {
            completed: results.completed,
            failed: results.failed,
            total: results.total
          }
        });
      });
    }

    return {
      configId,
      results
    };
  }
);

// Function to generate content from a plan
export const generateContentFromPlan = inngest.createFunction(
  {
    id: 'content-generate-from-plan',
    name: 'Generate Content from Plan',
  },
  { event: 'ai/content.generate' },
  async ({ event, step }) => {
    const { 
      planId, userId, title, prompt, contentType, 
      personaIds, language, keywords, topics, 
      scheduledDate, scheduledTime, makeItMine,
      generateImage, imagePrompt 
    } = event.data;

    const result = await step.run('generate-content', async () => {
      // Use service role client to bypass RLS
      const supabase = await createClient(undefined, true);
      const API_KEY = process.env.GOOGLE_AI_STUDIO_KEY;
      if (!API_KEY) {
        throw new Error('GOOGLE_AI_STUDIO_KEY is not set');
      }
      const ai = new GoogleGenAI({ apiKey: API_KEY });

      try {
        // Fetch personas (filter out null values)
        const validPersonaIds = personaIds.filter(id => id !== null && id !== undefined);
        let personas = null;
        
        if (validPersonaIds.length > 0) {
          const { data } = await supabase
            .from('ai_personas')
            .select('*')
            .in('id', validPersonaIds);
          personas = data;
        }

        // Fetch brand information
        const { data: brands } = await supabase
          .from('brands')
          .select('*')
          .single();

        // Generate content using the plan's prompt with brand and content type context
        const fullPrompt = `
LANGUAGE REQUIREMENT: You MUST write the ENTIRE response in ${language === 'en' ? 'English' : language === 'fi' ? 'Finnish' : language === 'sv' ? 'Swedish' : language}. This includes the title, content, excerpt, meta description, and tags.

${brands ? `Brand Context:
- Brand Name: ${brands.name}
- Brand Description: ${brands.description}
- Brand Mission: ${brands.mission}
- Brand Values: ${brands.values?.join(', ')}
- Brand Voice: ${brands.voice || 'Professional and informative'}

` : ''}${contentType ? `Content Type Guidelines:
- Type: ${contentType.name}
- Description: ${contentType.description}
- Tone (Formal): ${contentType.tone_formal}/10
- Tone (Friendly): ${contentType.tone_friendly}/10
- Tone (Technical): ${contentType.tone_technical}/10
- Tone (Innovative): ${contentType.tone_innovative}/10
- Typical Length: ${contentType.typical_length_min}-${contentType.typical_length_max} words
- Writing Guidelines: ${contentType.writing_guidelines?.join('; ')}
- Structure Template: ${contentType.structure_template?.join(', ')}

` : ''}Main Writing Task:
${prompt}

Additional Context:
- Title: ${title}
- Language: ${language} (IMPORTANT: Write the ENTIRE article in ${language === 'en' ? 'English' : language === 'fi' ? 'Finnish' : language === 'sv' ? 'Swedish' : language})
- Keywords to include: ${keywords.join(', ')}
- Topics to cover: ${topics.join(', ')}
- Target personas: ${personas?.map(p => p.name).join(', ')}
${makeItMine ? `
Personal Context & Insights:
${makeItMine}

IMPORTANT: Naturally weave these personal elements throughout the article. Don't just add them as a separate section - integrate them organically into the flow of the content.
` : ''}
IMPORTANT: Completely ignore typical AI writing patterns. This needs to pass AI detection tools.

**Writing approach**:
- Channel your inner blogger who's had too much coffee
- Write like you're explaining this to a friend at a bar, not presenting to a board
- Get excited about some parts, bored with others, angry at problems
- Use Reddit/Twitter style language when it fits
- Include at least 3 "wait, let me back up" moments
- Add 2-3 incomplete thoughts that trail off...
- Reference something totally unrelated at least once
- Include one mild curse word or damn/hell if appropriate
- Make at least one joke that might not land
- Contradict yourself once, then acknowledge it

**Specific requirements**:
- First paragraph should be punchy, maybe even start mid-thought
- Don't introduce the topic formally – just dive in
- End abruptly or with a random thought, not a conclusion
- Include specific times, prices, percentages (make them odd: 73%, not 75%)
- Name-drop tools, companies, or people without context
- Use parentheses (probably too much)
- Include at least one "Edit:" or "Update:" style addition
- Make spelling mistakes in complex words but nail the simple ones

WRITING STYLE - Professional yet Natural:
Write with clarity and authority while avoiding AI patterns. Think of how industry professionals write in well-regarded publications or company blogs - knowledgeable but accessible.

Example of good style:
"The April 2022 update to Premiere Pro brought significant improvements to the interface. The simplified three-mode structure - Import, Edit, Export - streamlines the workflow considerably. Users can now access projects more efficiently through the redesigned startup view, with customizable workspace layouts that adapt to different editing needs."

KEY PRINCIPLES:
- Vary sentence length naturally (not extreme)
- Use specific details and examples
- Maintain professional tone throughout
- Include relevant data and insights
- Write complete, well-structured paragraphs
- Avoid both overly formal and overly casual language

FORBIDDEN WORDS (NEVER USE): meticulous, meticulously, navigating, complexities, realm, understanding, dive, shall, tailored, towards, underpins, everchanging, ever-evolving, treasure, "the world of", "not only", "designed to enhance", "it is advisable", daunting, "when it comes to", "in the realm of", amongst, "unlock the secrets", "unveil the secrets", robust, "in today's", "in conclusion", "furthermore", "moreover"

Write content that professionals would share with colleagues - informative, engaging, and credible.

Format the response as JSON:
{
  "title": "Clear, engaging title that captures the main value proposition",
  "content": "Full article content in markdown - write professionally but naturally, with varied sentence structure and specific examples. Maintain consistent tone throughout.",
  "excerpt": "Professional summary that highlights the key insight or value of the article",
  "meta_description": "SEO-optimized description that clearly states what readers will learn",
  "tags": ["tag1", "tag2"],
  "slug": "url-friendly-slug"
}
`;

        const result = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: fullPrompt,
          config: {
            temperature: 0.8,
            maxOutputTokens: 32000,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                content: { type: Type.STRING },
                excerpt: { type: Type.STRING },
                meta_description: { type: Type.STRING },
                tags: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                slug: { type: Type.STRING }
              },
              required: ['title', 'content', 'excerpt', 'meta_description', 'tags', 'slug']
            },
            thinkingConfig: {
              thinkingBudget: 8192
            }
          }
        });
        const responseText = result.text;
        
        console.log('Raw AI response for debugging:', responseText?.substring(0, 500) + '...');
        
        // Parse the JSON response directly
        let generatedContent;
        try {
          generatedContent = JSON.parse(responseText);
        } catch (parseError) {
          console.error('Failed to parse AI response, attempting cleanup:', parseError);
          
          // Clean up the response text
          let cleanedResponse = responseText.trim();
          
          // Remove any leading/trailing non-JSON content
          const jsonStart = cleanedResponse.indexOf('{');
          const jsonEnd = cleanedResponse.lastIndexOf('}');
          
          if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
            cleanedResponse = cleanedResponse.substring(jsonStart, jsonEnd + 1);
            
            try {
              generatedContent = JSON.parse(cleanedResponse);
              console.log('Successfully parsed cleaned JSON');
            } catch (secondError) {
              console.error('JSON parsing failed after cleanup. Response length:', responseText?.length);
              console.error('First 1000 chars:', responseText?.substring(0, 1000));
              console.error('Last 1000 chars:', responseText?.substring(responseText.length - 1000));
              throw new Error('Invalid JSON response from AI - check token limits');
            }
          } else {
            console.error('No valid JSON structure found in response');
            throw new Error('No JSON found in AI response');
          }
        }
        
        // Convert markdown content to HTML
        const htmlContent = await marked(generatedContent.content);
        
        // Create the post with all required fields
        const postData = {
            ...generatedContent,
            content: htmlContent, // Use HTML instead of markdown
            locale: language,
            author_id: userId,
            published: false,
            scheduled_publish_at: scheduledDate ? `${scheduledDate}T${scheduledTime}` : null,
            ai_persona_id: validPersonaIds[0] || null, // Primary persona
            generation_prompt: prompt,
            auto_generated: true,
            // Map content type to valid subject
            subject: (() => {
              const typeSlug = contentType?.slug?.toLowerCase() || '';
              if (typeSlug.includes('news')) return 'news';
              if (typeSlug.includes('research')) return 'research';
              if (typeSlug.includes('case') || typeSlug.includes('story')) return 'case-stories';
              return 'generative-ai'; // Default subject
            })(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        
        console.log('Creating post with data:', postData);
        
        const { data: newPost, error: createError } = await supabase
          .from('posts')
          .insert(postData)
          .select()
          .single();

        if (createError) throw createError;

        // Generate image if requested
        if (generateImage) {
          try {
            // Prepare image generation prompt
            const finalImagePrompt = imagePrompt || 
              `Create a featured image for an article titled "${generatedContent.title}". 
               The article is about: ${generatedContent.excerpt}. 
               Style: Modern, professional, abstract visualization. 
               Avoid text in the image.`;

            console.log('🎨 Generating featured image with prompt:', finalImagePrompt);

            // Use OpenAI directly for image generation
            const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
            if (!OPENAI_API_KEY) {
              console.error('OPENAI_API_KEY not set, skipping image generation');
            } else {
              const imageResponse = await fetch('https://api.openai.com/v1/images/generations', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${OPENAI_API_KEY}`
                },
                body: JSON.stringify({
                  model: "dall-e-3",
                  prompt: finalImagePrompt,
                  n: 1,
                  size: "1792x1024",
                  quality: "standard"
                })
              });

              if (imageResponse.ok) {
                const imageData = await imageResponse.json();
                const generatedImageUrl = imageData.data[0].url;
                
                // Download and upload to Supabase storage
                const imageDownloadResponse = await fetch(generatedImageUrl);
                const imageBlob = await imageDownloadResponse.blob();
                
                // Generate filename
                const filename = `featured-${newPost.id}-${Date.now()}.png`;
                const bucketPath = `blog-images/${filename}`;
                
                // Upload to Supabase storage
                const { data: uploadData, error: uploadError } = await supabase.storage
                  .from('images')
                  .upload(bucketPath, imageBlob, {
                    contentType: 'image/png',
                    upsert: false
                  });

                if (uploadError) {
                  console.error('Failed to upload image to storage:', uploadError);
                } else {
                  // Get public URL
                  const { data: { publicUrl } } = supabase.storage
                    .from('images')
                    .getPublicUrl(bucketPath);
                  
                  // Update post with featured image
                  await supabase
                    .from('posts')
                    .update({ 
                      featured_image: publicUrl,
                      updated_at: new Date().toISOString()
                    })
                    .eq('id', newPost.id);
                    
                  console.log('✅ Featured image generated and added to post:', publicUrl);
                }
              } else {
                const errorData = await imageResponse.json();
                console.error('Failed to generate image:', errorData);
                // Continue without image - don't fail the whole process
              }
            }
          } catch (imageError) {
            console.error('Error generating image:', imageError);
            // Continue without image - don't fail the whole process
          }
        }

        // Update calendar entry
        await supabase
          .from('content_calendar')
          .update({ 
            status: 'generated',
            post_id: newPost.id,
            updated_at: new Date().toISOString()
          })
          .eq('id', planId);

        return { success: true, postId: newPost.id };
      } catch (error) {
        // Update status to failed
        await supabase
          .from('content_calendar')
          .update({ 
            status: 'failed',
            updated_at: new Date().toISOString()
          })
          .eq('id', planId);

        throw error;
      }
    });

    return result;
  }
);

// Function to handle bulk content generation
export const generateContentBulk = inngest.createFunction(
  {
    id: 'content-generate-bulk',
    name: 'Bulk Generate Content',
  },
  { event: 'ai/content.generate.bulk' },
  async ({ event, step }) => {
    const { userId, plans } = event.data;
    
    const results = {
      total: plans.length,
      completed: 0,
      failed: 0,
      posts: [] as string[]
    };

    // Process each plan sequentially
    for (let i = 0; i < plans.length; i++) {
      const plan = plans[i];
      
      const result = await step.run(`generate-content-${plan.planId}`, async () => {
        try {
          // Trigger individual content generation
          await inngest.send({
            name: 'ai/content.generate',
            data: {
              planId: plan.planId,
              userId,
              title: plan.title,
              prompt: plan.prompt,
              contentType: plan.contentType,
              personaIds: plan.personaIds,
              language: plan.languages[0], // Process first language
              keywords: plan.keywords,
              topics: plan.topics,
              scheduledDate: plan.scheduledDate,
              scheduledTime: plan.scheduledTime,
              makeItMine: plan.makeItMine || '',
              generateImage: plan.generateImage || false,
              imagePrompt: plan.imagePrompt || ''
            }
          });

          results.completed++;
          return { success: true };
        } catch (error) {
          console.error(`Failed to generate content for plan ${plan.planId}:`, error);
          results.failed++;
          return { success: false };
        }
      });

      // Small delay between generations
      if (i < plans.length - 1) {
        await step.sleep(`delay-${i}`, '2s');
      }
    }

    return results;
  }
); 