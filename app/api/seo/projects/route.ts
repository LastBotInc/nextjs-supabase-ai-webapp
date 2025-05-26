import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { SEOProject, CreateSEOProjectForm } from '@/types/seo';

/**
 * GET /api/seo/projects
 * Get all SEO projects for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get projects for the user
    const { data: projects, error } = await supabase
      .from('seo_projects')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching SEO projects:', error);
      return NextResponse.json(
        { error: 'Failed to fetch projects' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: projects,
    });

  } catch (error) {
    console.error('Error in GET /api/seo/projects:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/seo/projects
 * Create a new SEO project
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body: CreateSEOProjectForm = await request.json();
    
    // Validate required fields
    if (!body.name || !body.domain) {
      return NextResponse.json(
        { error: 'Name and domain are required' },
        { status: 400 }
      );
    }

    // Validate domain format
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/;
    if (!domainRegex.test(body.domain)) {
      return NextResponse.json(
        { error: 'Invalid domain format' },
        { status: 400 }
      );
    }

    // Check if project with same domain already exists for this user
    const { data: existingProject } = await supabase
      .from('seo_projects')
      .select('id')
      .eq('user_id', user.id)
      .eq('domain', body.domain)
      .single();

    if (existingProject) {
      return NextResponse.json(
        { error: 'Project with this domain already exists' },
        { status: 409 }
      );
    }

    // Create the project
    const projectData = {
      user_id: user.id,
      name: body.name,
      domain: body.domain,
      description: body.description || null,
      settings: body.settings || {},
    };

    const { data: project, error } = await supabase
      .from('seo_projects')
      .insert(projectData)
      .select()
      .single();

    if (error) {
      console.error('Error creating SEO project:', error);
      return NextResponse.json(
        { error: 'Failed to create project' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: project,
      message: 'Project created successfully',
    }, { status: 201 });

  } catch (error) {
    console.error('Error in POST /api/seo/projects:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/seo/projects
 * Update an existing SEO project
 */
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { id, ...updateData } = body;
    
    // Validate required fields
    if (!id) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    // Validate domain format if provided
    if (updateData.domain) {
      const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/;
      if (!domainRegex.test(updateData.domain)) {
        return NextResponse.json(
          { error: 'Invalid domain format' },
          { status: 400 }
        );
      }

      // Check if another project with same domain already exists for this user
      const { data: existingProject } = await supabase
        .from('seo_projects')
        .select('id')
        .eq('user_id', user.id)
        .eq('domain', updateData.domain)
        .neq('id', id)
        .single();

      if (existingProject) {
        return NextResponse.json(
          { error: 'Another project with this domain already exists' },
          { status: 409 }
        );
      }
    }

    // Update the project
    const { data: project, error } = await supabase
      .from('seo_projects')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id) // Ensure user can only update their own projects
      .select()
      .single();

    if (error) {
      console.error('Error updating SEO project:', error);
      return NextResponse.json(
        { error: 'Failed to update project' },
        { status: 500 }
      );
    }

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found or access denied' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: project,
      message: 'Project updated successfully',
    });

  } catch (error) {
    console.error('Error in PUT /api/seo/projects:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/seo/projects
 * Delete an SEO project and all related data
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get project ID from query params
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('id');
    
    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    // Verify project exists and belongs to user
    const { data: project } = await supabase
      .from('seo_projects')
      .select('id')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single();

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found or access denied' },
        { status: 404 }
      );
    }

    // Delete the project (cascade will handle related data)
    const { error } = await supabase
      .from('seo_projects')
      .delete()
      .eq('id', projectId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting SEO project:', error);
      return NextResponse.json(
        { error: 'Failed to delete project' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Project deleted successfully',
    });

  } catch (error) {
    console.error('Error in DELETE /api/seo/projects:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 