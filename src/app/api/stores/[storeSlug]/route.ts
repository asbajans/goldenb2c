import { NextRequest, NextResponse } from 'next/server';
const BACKEND = 'https://api.asb.web.tr/api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ storeSlug: string }> }
) {
  const { storeSlug } = await params;
  const { searchParams } = new URL(request.url);
  const url = `${BACKEND}/marketplace/stores/${storeSlug}?${searchParams.toString()}`;
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) {
      const text = await res.text();
      console.error(`[Store Proxy] Backend ${res.status}:`, text);
      return NextResponse.json({ store: null, data: [], error: `Backend ${res.status}` }, { status: 200 });
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    console.error('[Store Proxy] Fetch failed:', err.message);
    return NextResponse.json({ store: null, data: [], error: err.message }, { status: 200 });
  }
}
