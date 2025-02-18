import { validateTurnstileToken } from '@/utils/turnstile';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Missing token' },
        { status: 400 }
      );
    }

    const isValid = await validateTurnstileToken(token);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error validating turnstile token:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 