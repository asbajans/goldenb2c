import { NextRequest, NextResponse } from 'next/server';

const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'https://api.asb.web.tr/api';

export async function PUT(request: NextRequest) {
  try {
    const { itemId, quantity } = await request.json();
    const res = await fetch(`${BACKEND}/cart/item/${itemId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        cookie: request.headers.get('cookie') || ''
      },
      body: JSON.stringify({ quantity }),
      credentials: 'include'
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { itemId } = await request.json();
    const res = await fetch(`${BACKEND}/cart/item/${itemId}`, {
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