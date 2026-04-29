import { NextRequest, NextResponse } from 'next/server';

const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'https://api.asb.web.tr/api';
const IS_OFFLINE = !BACKEND || BACKEND.includes('localhost');

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const authHeader = request.headers.get('authorization');
    const cookieHeader = request.headers.get('cookie') || '';

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (cookieHeader) headers['cookie'] = cookieHeader;
    if (authHeader) headers['Authorization'] = authHeader;

    if (IS_OFFLINE) {
      return NextResponse.json({ 
        success: true, 
        orderId: 'ORD-' + Date.now(),
        orderNumber: 'GC' + Date.now(),
        message: 'Order placed successfully (demo mode)'
      });
    }

    if (body.cartItems?.length) {
      for (const item of body.cartItems) {
        await fetch(`${BACKEND}/cart/add`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity
          }),
          credentials: 'include'
        });
      }
    }
    
    const res = await fetch(`${BACKEND}/cart/checkout`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: body.name,
        phone: body.phone,
        address: body.address,
        city: body.city,
        country: body.country,
        notes: body.notes,
        paymentMethod: body.paymentMethod
      }),
      credentials: 'include'
    });
    
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    console.error('[Checkout POST] Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}