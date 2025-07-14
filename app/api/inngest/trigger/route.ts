import { NextRequest, NextResponse } from 'next/server';
import { inngest } from '@/lib/inngest-client';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get event details from request body
    const { name, data } = await request.json();

    if (!name) {
      return NextResponse.json({ error: 'Event name is required' }, { status: 400 });
    }

    // Send event to Inngest
    const result = await inngest.send({
      name,
      data: {
        ...data,
        userId: user.id,
        triggeredAt: new Date().toISOString()
      }
    });

    return NextResponse.json({ 
      success: true, 
      eventId: result.ids?.[0],
      message: 'Event triggered successfully' 
    });

  } catch (error) {
    console.error('Error triggering Inngest event:', error);
    return NextResponse.json(
      { error: 'Failed to trigger event' }, 
      { status: 500 }
    );
  }
}