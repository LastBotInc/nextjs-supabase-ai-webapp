import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = process.env.GOOGLE_AI_STUDIO_KEY || process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.error('Error: Neither GOOGLE_AI_STUDIO_KEY nor GEMINI_API_KEY environment variable is set');
}

const genAI = new GoogleGenerativeAI(API_KEY!);

export async function POST(request: Request) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing authorization header' }, { status: 401 });
    }

    const supabase = await createClient();
    
    // Verify the user with the token
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { url } = await request.json();
    
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Check if API key exists
    if (!API_KEY) {
      return NextResponse.json(
        { error: 'API key not configured. Please set GOOGLE_AI_STUDIO_KEY or GEMINI_API_KEY environment variable.' },
        { status: 500 }
      );
    }

    // Use Gemini to analyze the website
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
    });

    const prompt = `Based on the website URL ${url}, provide a brand analysis. Even if you cannot directly access the website, use your knowledge about the company to provide relevant brand information.

Analyze and extract brand information focusing on:
1. Company description (what they do, their mission)
2. Brand tone and voice characteristics
3. Key personality traits
4. Common phrases or terminology they use
5. Writing style patterns
6. Services offered
7. Solutions provided

Provide the analysis in the following JSON format:
{
  "description": "Company description",
  "tone_formal": 5, // 0-10 scale
  "tone_friendly": 5, // 0-10 scale
  "tone_technical": 5, // 0-10 scale
  "tone_innovative": 5, // 0-10 scale
  "personality_primary": ["trait1", "trait2"],
  "personality_secondary": ["trait1", "trait2"],
  "personality_avoid": ["trait1", "trait2"],
  "writing_style": ["style1", "style2"],
  "common_phrases": ["phrase1", "phrase2"],
  "avoid_phrases": [],
  "services": [{"name": "service1", "description": "description"}],
  "solutions": [{"name": "solution1", "description": "description"}]
}

If the company is not well-known, provide reasonable defaults based on the URL and common patterns for similar businesses.`;

    const result = await model.generateContent(prompt);

    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to extract brand information');
    }

    const brandData = JSON.parse(jsonMatch[0]);

    // Validate and sanitize the data
    const sanitizedData = {
      description: brandData.description || '',
      tone_formal: Math.min(10, Math.max(0, brandData.tone_formal || 5)),
      tone_friendly: Math.min(10, Math.max(0, brandData.tone_friendly || 5)),
      tone_technical: Math.min(10, Math.max(0, brandData.tone_technical || 5)),
      tone_innovative: Math.min(10, Math.max(0, brandData.tone_innovative || 5)),
      personality_primary: Array.isArray(brandData.personality_primary) ? brandData.personality_primary.slice(0, 5) : [],
      personality_secondary: Array.isArray(brandData.personality_secondary) ? brandData.personality_secondary.slice(0, 5) : [],
      personality_avoid: Array.isArray(brandData.personality_avoid) ? brandData.personality_avoid.slice(0, 5) : [],
      writing_style: Array.isArray(brandData.writing_style) ? brandData.writing_style.slice(0, 7) : [],
      common_phrases: Array.isArray(brandData.common_phrases) ? brandData.common_phrases.slice(0, 10) : [],
      avoid_phrases: Array.isArray(brandData.avoid_phrases) ? brandData.avoid_phrases.slice(0, 10) : [],
      services: Array.isArray(brandData.services) ? brandData.services.slice(0, 10) : [],
      solutions: Array.isArray(brandData.solutions) ? brandData.solutions.slice(0, 10) : [],
    };

    return NextResponse.json(sanitizedData);
  } catch (error) {
    console.error('Error analyzing brand:', error);
    return NextResponse.json(
      { error: 'Failed to analyze brand' },
      { status: 500 }
    );
  }
}