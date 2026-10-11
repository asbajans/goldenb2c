import { NextRequest, NextResponse } from 'next/server';

const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'https://api.asb.web.tr/api';

function passthrough(request: NextRequest): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const auth = request.headers.get('authorization');
  if (auth) headers['Authorization'] = auth;
  return headers;
}

export async function GET(request: NextRequest) {
  try {
    const auth = request.headers.get('authorization');
    if (!auth) return NextResponse.json({ data: [] }, { status: 401 });
    const qs = new URL(request.url).search;
    const res = await fetch(`${BACKEND}/returns${qs}`, { headers: passthrough(request) });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = request.headers.get('authorization');
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await request.json();
    const res = await fetch(`${BACKEND}/returns`, {
      method: 'POST',
      headers: passthrough(request),
      body: JSON.stringify(body)
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
