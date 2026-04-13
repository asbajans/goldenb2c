import { NextRequest, NextResponse } from 'next/server';
const BACKEND = 'https://api.asb.web.tr/api';
export async function GET(request: NextRequest) {
  try {
    const res = await fetch(`${BACKEND}/marketplace/categories`, { cache: 'no-store' });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ data: [], error: err.message }, { status: 200 });
  }
}
