import { NextRequest, NextResponse } from 'next/server';

const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'https://api.asb.web.tr/api';

export async function GET() {
  try {
    const res = await fetch(`${BACKEND}/settings/public`, {
      next: { revalidate: 60 }
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({});
  }
}