import { NextRequest, NextResponse } from 'next/server';

const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'https://api.asb.web.tr/api';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  const authHeader = request.headers.get('authorization');

  if (action === 'google') {
    return NextResponse.redirect(`${BACKEND}/auth/google`);
  }

  if (action === 'me') {
    if (!authHeader) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }
    try {
      const res = await fetch(`${BACKEND}/auth/me`, {
        method: 'GET',
        headers: { 
          'Authorization': authHeader,
          'Content-Type': 'application/json'
        }
      });
      const data = await res.json();
      
      if (!res.ok) {
        console.error('[Auth /me] Backend error:', res.status, data);
      }
      
      return NextResponse.json(data, { status: res.status });
    } catch (error: any) {
      console.error('[Auth /me] Error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action') || 'fast-signup';
  
  const body = await request.json();
  
  try {
    const res = await fetch(`${BACKEND}/auth/${action}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    console.error('[Auth Proxy]', error.message);
    return NextResponse.json({ error: { message: error.message } }, { status: 500 });
  }
}