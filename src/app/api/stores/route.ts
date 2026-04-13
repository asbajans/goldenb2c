import { NextRequest, NextResponse } from 'next/server';
const BACKEND = 'https://api.asb.web.tr/api';
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = `${BACKEND}/marketplace/stores?${searchParams.toString()}`;
  try {
    const res = await fetch(url, { cache: 'no-store' });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ data: [], pagination: { total: 0 }, error: err.message }, { status: 200 });
  }
}
