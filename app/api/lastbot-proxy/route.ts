import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { q, locale, widget_id } = await req.json();

    const baseUrl = process.env.NEXT_PUBLIC_LASTBOT_BASE_URL;
    if (!baseUrl) {
      return NextResponse.json(
        { error: 'LastBot base URL is not configured' },
        { status: 500 }
      );
    }

    const searchUrl = `${baseUrl}/${locale}/widgets/${widget_id}/search?q=${encodeURIComponent(q)}`;

    console.log(`[LastBot Proxy] Forwarding search request to: GET ${searchUrl}`);

    const apiResponse = await fetch(searchUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error(
        `[LastBot Proxy] API error: ${apiResponse.status} ${apiResponse.statusText}`,
        errorText
      );
      return NextResponse.json(
        { error: `Failed to fetch from LastBot API: ${apiResponse.statusText}` },
        { status: apiResponse.status }
      );
    }

    if (apiResponse.status === 204) {
      console.log(
        '[LastBot Proxy] Received 204 No Content from API. Returning empty array.'
      );
      return NextResponse.json([]);
    }

    const data = await apiResponse.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[LastBot Proxy] Internal server error:', error);
    return NextResponse.json(
      { error: 'Internal server error in proxy' },
      { status: 500 }
    );
  }
} 