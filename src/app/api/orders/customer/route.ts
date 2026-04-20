import { NextRequest, NextResponse } from 'next/server';

const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'https://api.asb.web.tr/api';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json({ orders: [] }, { status: 401 });
    }

    const res = await fetch(`${BACKEND}/orders/customer`, {
      headers: { 
        'Authorization': authHeader,
        'cookie': request.headers.get('cookie') || ''
      },
      credentials: 'include'
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    console.error('[Customer Orders API]', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
