import { NextRequest, NextResponse } from 'next/server';

const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'https://api.asb.web.tr/api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  try {
    const { slug } = await params;
    const path = slug.join('/');
    const url = `${BACKEND}/feed/${path}`;

    const res = await fetch(url, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!res.ok) {
      return new NextResponse(`Feed not found: ${res.status}`, { status: res.status });
    }

    const text = await res.text();
    const contentType = path.endsWith('.xml')
      ? 'application/xml; charset=utf-8'
      : 'application/json; charset=utf-8';

    return new NextResponse(text, {
      headers: { 'Content-Type': contentType },
    });
  } catch (error: any) {
    console.error('[Feed Proxy]', error.message);
    return new NextResponse('Feed proxy error', { status: 500 });
  }
}