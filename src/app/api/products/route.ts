import { NextRequest, NextResponse } from 'next/server';

const BACKEND = 'https://api.asb.web.tr/api';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get('page') || '1';
  const limit = searchParams.get('limit') || '24';
  const search = searchParams.get('search') || '';

  const url = `${BACKEND}/marketplace/products?page=${page}&limit=${limit}${search ? `&search=${search}` : ''}`;

  try {
    const res = await fetch(url, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!res.ok) {
      const text = await res.text();
      console.error(`[API Proxy] Backend error ${res.status}:`, text);
      return NextResponse.json({ data: [], pagination: { total: 0, page: 1, limit: 24, pages: 0 }, error: `Backend ${res.status}` }, { status: 200 });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    console.error('[API Proxy] Fetch failed:', err.message);
    return NextResponse.json({ data: [], pagination: { total: 0, page: 1, limit: 24, pages: 0 }, error: err.message }, { status: 200 });
  }
}
