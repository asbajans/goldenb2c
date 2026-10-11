import { NextRequest, NextResponse } from 'next/server';

const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'https://api.asb.web.tr/api';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = request.headers.get('authorization');
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;
    const res = await fetch(`${BACKEND}/returns/${id}`, {
      headers: { Authorization: auth }
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
