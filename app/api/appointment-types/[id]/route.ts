import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient()

    const { data: appointmentType, error } = await supabase
      .from('appointment_types')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single()

    if (error) {
      console.error('Error fetching appointment type:', error)
      return NextResponse.json(
        { error: 'Failed to fetch appointment type' },
        { status: 500 }
      )
    }

    if (!appointmentType) {
      return NextResponse.json(
        { error: 'Appointment type not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(appointmentType)
  } catch (error) {
    console.error('Error in GET /api/appointment-types/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 