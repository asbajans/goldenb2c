import { NextRequest, NextResponse } from 'next/server';

const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'https://api.asb.web.tr/api';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json({ addresses: [] }, { status: 401 });
    }

    const res = await fetch(`${BACKEND}/addresses`, {
      headers: { 'Authorization': authHeader },
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
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const res = await fetch(`${BACKEND}/addresses`, {
      method: 'POST',
      headers: { 
        'Authorization': authHeader,
        'Content-Type': 'application/json'
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
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const res = await fetch(`${BACKEND}/addresses`, {
      method: 'DELETE',
      headers: { 
        'Authorization': authHeader,
        'Content-Type': 'application/json'
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