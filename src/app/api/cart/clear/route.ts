import { NextRequest, NextResponse } from 'next/server';

const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'https://api.asb.web.tr/api';

export async function DELETE(request: NextRequest) {
  try {
    const res = await fetch(`${BACKEND}/cart/clear`, {
      method: 'DELETE',
      headers: {
        cookie: request.headers.get('cookie') || ''
      },
      credentials: 'include'
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}