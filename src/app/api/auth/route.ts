import { NextRequest, NextResponse } from 'next/server';

const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'https://api.asb.web.tr/api';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  if (action === 'google') {
    try {
      const backendUrl = `${BACKEND}/auth/google`;
      return NextResponse.redirect(backendUrl);
    } catch (error: any) {
      console.error('[Google Auth Redirect]', error.message);
      return NextResponse.redirect('/login?error=auth_failed');
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