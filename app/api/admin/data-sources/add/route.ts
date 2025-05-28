import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { spawn } from 'child_process';
import path from 'path';

interface AddDataSourceRequest {
  url: string;
  type?: string;
  name?: string;
}

export async function POST(request: Request) {
  try {
    // 1. Token Verification Layer
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const authClient = await createClient();
    const { data: { user }, error: authError } = await authClient.auth.getUser(token);

    if (authError || !user) {
      console.error('Auth error:', authError);
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }

    // 2. Admin Role Verification Layer
    const { data: profile, error: profileError } = await authClient
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      return NextResponse.json({ error: 'Error verifying admin status' }, { status: 500 });
    }

    if (!profile?.is_admin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    // 3. Parse request body
    const body: AddDataSourceRequest = await request.json();
    
    if (!body.url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(body.url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // 4. Check if data source already exists
    const supabase = await createClient(undefined, true); // Service role
    const { data: existingSource } = await supabase
      .from('data_sources')
      .select('id, name, identifier')
      .eq('feed_url', body.url)
      .single();

    if (existingSource) {
      return NextResponse.json(
        { 
          error: 'Data source with this URL already exists',
          existingSource: {
            id: existingSource.id,
            name: existingSource.name,
            identifier: existingSource.identifier
          }
        },
        { status: 409 }
      );
    }

    // 5. Run data-source-importer tool
    const sourceType = body.type || 'product_feed';
    
    return new Promise((resolve) => {
      const args = [
        'tools/data-source-importer.ts',
        '--url', body.url,
        '--type', sourceType
      ];

      const child = spawn('tsx', args, {
        cwd: process.cwd(),
        env: { ...process.env },
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let stdout = '';
      let stderr = '';

      child.stdout?.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve(NextResponse.json({
            success: true,
            message: 'Data source added successfully',
            output: stdout
          }));
        } else {
          console.error('Data source importer failed:', stderr);
          resolve(NextResponse.json(
            { 
              error: 'Failed to add data source',
              details: stderr || 'Unknown error occurred'
            },
            { status: 500 }
          ));
        }
      });

      child.on('error', (error) => {
        console.error('Failed to spawn data source importer:', error);
        resolve(NextResponse.json(
          { 
            error: 'Failed to start data source importer',
            details: error.message
          },
          { status: 500 }
        ));
      });

      // Set timeout to prevent hanging
      setTimeout(() => {
        child.kill();
        resolve(NextResponse.json(
          { error: 'Data source import timed out' },
          { status: 408 }
        ));
      }, 60000); // 60 second timeout
    });

  } catch (err) {
    console.error('Unexpected error in POST /api/admin/data-sources/add:', err);
    const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 