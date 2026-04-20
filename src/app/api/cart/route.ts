import { NextRequest, NextResponse } from 'next/server';

const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'https://api.asb.web.tr/api';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const cookieHeader = request.headers.get('cookie') || '';
    
    const headers: Record<string, string> = {};
    if (cookieHeader) headers['cookie'] = cookieHeader;
    if (authHeader) headers['Authorization'] = authHeader;
    
    const res = await fetch(`${BACKEND}/cart`, {
      headers,
      credentials: 'include'
    });
    
    let data;
    try {
      data = await res.json();
    } catch (e) {
      data = { items: [], count: 0, total: 0 };
    }
    
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    console.error('[Cart GET] Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const authHeader = request.headers.get('authorization');
    const cookieHeader = request.headers.get('cookie') || '';
    
    let endpoint = BACKEND + '/cart';
    let method = 'POST';
    let reqBody: any = null;
    
    if (body.action === 'add') {
      endpoint = BACKEND + '/cart/add';
      reqBody = { 
        productId: body.productId, 
        variantId: body.variantId || null, 
        quantity: body.quantity || 1 
      };
    } else if (body.action === 'checkout') {
      endpoint = BACKEND + '/cart/checkout';
      reqBody = { name: body.name, phone: body.phone, address: body.address, city: body.city, notes: body.notes };
    } else if (body.action === 'clear') {
      endpoint = BACKEND + '/cart/clear';
      method = 'DELETE';
      reqBody = null;
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (cookieHeader) {
      headers['cookie'] = cookieHeader;
    }
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    
    const res = await fetch(endpoint, {
      method,
      headers,
      body: method === 'POST' && reqBody ? JSON.stringify(reqBody) : undefined,
      credentials: 'include'
    });
    
    let data;
    try {
      data = await res.json();
    } catch (e) {
      data = { error: 'Invalid response from backend' };
    }
    
    if (!res.ok) {
      console.error('[Cart POST] Backend error:', res.status, res.statusText, data);
    }
    
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    console.error('[Cart POST] Error:', error.message, error.stack);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const authHeader = request.headers.get('authorization');
    const res = await fetch(`${BACKEND}/cart/item/${body.itemId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        cookie: request.headers.get('cookie') || '',
        ...(authHeader ? { Authorization: authHeader } : {})
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
    const authHeader = request.headers.get('authorization');
    const res = await fetch(`${BACKEND}/cart/item/${body.itemId}`, {
      method: 'DELETE',
      headers: { 
        cookie: request.headers.get('cookie') || '',
        ...(authHeader ? { Authorization: authHeader } : {})
      },
      credentials: 'include'
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}