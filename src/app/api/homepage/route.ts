import { NextRequest, NextResponse } from 'next/server';

const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'https://api.asb.web.tr/api';

// Curated homepage sections (per-category fair quotas + rotation).
export async function GET(request: NextRequest) {
  try {
    const qs = new URL(request.url).search;
    const res = await fetch(`${BACKEND}/marketplace/homepage${qs}`);
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
