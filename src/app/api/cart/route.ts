import { NextRequest, NextResponse } from 'next/server';

const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'https://api.asb.web.tr/api';

export async function GET(request: NextRequest) {
  try {
    const res = await fetch(`${BACKEND}/cart`, {
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const res = await fetch(`${BACKEND}/cart/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        cookie: request.headers.get('cookie') || ''
      },
      body: JSON.stringify(body),
      credentials: 'include'
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('itemId');
    const body = await request.json();
    
    const res = await fetch(`${BACKEND}/cart/item/${itemId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        cookie: request.headers.get('cookie') || ''
      },
      body: JSON.stringify(body),
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
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('itemId');
    
    const url = itemId 
      ? `${BACKEND}/cart/item/${itemId}`
      : `${BACKEND}/cart/clear`;
    
    const res = await fetch(url, {
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