import { NextRequest, NextResponse } from 'next/server';

const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'https://api.asb.web.tr/api';

// Public — no login required (Merchant Center condition).
export async function GET(request: NextRequest) {
  try {
    const lang = new URL(request.url).searchParams.get('lang') || 'en';
    const res = await fetch(`${BACKEND}/marketplace/policies/return?lang=${encodeURIComponent(lang)}`);
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
