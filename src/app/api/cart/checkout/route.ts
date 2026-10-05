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

    // NOTE: cartItems are forwarded to the backend as-is (MODE 1: order is
    // created from scratch) or, when orderId is present, the SAME pending
    // order is reused (MODE 0: idempotent retry). We must NEVER call
    // backend /cart/add here: it increments the persistent DB cart, so every
    // "Pay" attempt inflated the quantity (1x -> 2x -> 3x...) and Stripe
    // charged the multiplied amount. See backend routes/cart.ts.
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
        paymentMethod: body.paymentMethod,
        cartItems: body.cartItems,
        orderId: body.orderId,
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