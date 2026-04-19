import { NextRequest, NextResponse } from 'next/server';

const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'https://api.asb.web.tr/api';

export async function GET(request: NextRequest) {
  try {
    const res = await fetch(`${BACKEND}/cart`, {
      headers: { cookie: request.headers.get('cookie') || '' },
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
    
    let endpoint = BACKEND + '/cart';
    let method = 'POST';
    let reqBody = body;
    
    if (body.action === 'add') {
      endpoint = BACKEND + '/cart/add';
      reqBody = { productId: body.productId, variantId: body.variantId, quantity: body.quantity };
    } else if (body.action === 'checkout') {
      endpoint = BACKEND + '/cart/checkout';
      reqBody = { name: body.name, phone: body.phone, address: body.address, city: body.city, notes: body.notes };
    } else if (body.action === 'clear') {
      endpoint = BACKEND + '/cart/clear';
      method = 'DELETE';
      reqBody = undefined;
    }
    
    const res = await fetch(endpoint, {
      method,
      headers: {
        'Content-Type': 'application/json',
        cookie: request.headers.get('cookie') || ''
      },
      body: method === 'POST' ? JSON.stringify(reqBody) : undefined,
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
    const body = await request.json();
    const res = await fetch(`${BACKEND}/cart/item/${body.itemId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        cookie: request.headers.get('cookie') || ''
      },
      body: JSON.stringify({ quantity: body.quantity }),
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
    const body = await request.json();
    const res = await fetch(`${BACKEND}/cart/item/${body.itemId}`, {
      method: 'DELETE',
      headers: { cookie: request.headers.get('cookie') || '' },
      credentials: 'include'
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}