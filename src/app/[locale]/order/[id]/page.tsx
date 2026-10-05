'use client';
import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import styles from './order.module.css';

import { Suspense } from 'react';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const success = searchParams.get('success');
  const orderId = searchParams.get('orderId');
  const { clearCart } = useCart();

  // After a successful payment (esp. returning from Stripe) the local cart
  // is stale — clear it so revisiting checkout can't re-order the same items.
  // NOTE: 'lastOrder' is intentionally kept: TrackingProvider consumes it for
  // purchase analytics.
  useEffect(() => {
    if (!success) return;
    clearCart();
    try {
      sessionStorage.removeItem('gc_checkout_order_id');
    } catch { /* ignore */ }
  }, [success]);

  if (!success) {
    return (
      <div className={styles.page}>
        <div className={styles.error}>
          <h1>Invalid Access</h1>
          <Link href="/products" className={styles.btn}>Go to Products</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.success}>
        <div className={styles.icon}>✅</div>
        <h1>Thank You!</h1>
        <p>Your order has been placed successfully.</p>
        {orderId && <p className={styles.orderId}>Order #: {orderId}</p>}
        
        <div className={styles.info}>
          <p>We'll send you an email confirmation shortly.</p>
          <p>You can track your order status in your account.</p>
        </div>
        
        <div className={styles.actions}>
          <Link href="/products" className={styles.primaryBtn}>Continue Shopping</Link>
          <Link href="/" className={styles.secondaryBtn}>Back to Home</Link>
        </div>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OrderSuccessContent />
    </Suspense>
  );
}