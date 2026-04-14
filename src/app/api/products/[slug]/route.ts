import { NextRequest, NextResponse } from 'next/server';
const BACKEND = 'https://api.asb.web.tr/api';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const url = `${BACKEND}/marketplace/products/${slug}`;
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) {
      return NextResponse.json({ error: `Backend ${res.status}` }, { status: res.status });
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    console.error('[Product Proxy]', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
