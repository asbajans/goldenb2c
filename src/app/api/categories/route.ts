import { NextRequest, NextResponse } from 'next/server';
const BACKEND = 'https://api.asb.web.tr/api';
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const lang = searchParams.get('lang') || 'en';
    const res = await fetch(`${BACKEND}/marketplace/categories?lang=${encodeURIComponent(lang)}`, { cache: 'no-store' });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ data: [], error: err.message }, { status: 200 });
  }
}
