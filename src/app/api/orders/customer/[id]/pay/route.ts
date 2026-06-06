import { NextRequest, NextResponse } from 'next/server';

const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'https://api.asb.web.tr/api';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const res = await fetch(`${BACKEND}/orders/customer/${id}/pay`, {
      method: 'POST',
      headers: { 'Authorization': authHeader },
      credentials: 'include'
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    console.error('[Customer Order Pay API]', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
