'use client';
import { useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { trackPurchase } from '@/utils/pixel';
import styles from './order.module.css';

import { Suspense } from 'react';

function OrderSuccessContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const success = searchParams.get('success');
  const orderId = searchParams.get('orderId');
  const routeId = (params?.id as string) || orderId;
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

  // Fire purchase conversion (GA4 purchase + Google Ads conversion + Meta/TikTok)
  // directly on the success page. Required because returning from Stripe is a
  // full page load, which TrackingProvider's route-change listener misses.
  // trackPurchase/trackGoogleAdsConversion are idempotent per order, so the
  // client-side (bank transfer) flow can't double-report either.
  useEffect(() => {
    if (!success) return;
    try {
      const stored = sessionStorage.getItem('lastOrder');
      if (!stored) return;
      const order = JSON.parse(stored);
      const id = order.id || routeId;
      if (!id) return;
      trackPurchase(id, order.total || 0, order.currency || 'TRY');
    } catch { /* ignore */ }
  }, [success, routeId]);

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
        {routeId && <p className={styles.orderId}>Order #: {routeId}</p>}
        
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