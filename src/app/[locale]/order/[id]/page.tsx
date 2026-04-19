'use client';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import styles from './order.module.css';

export default function OrderSuccessPage() {
  const searchParams = useSearchParams();
  const success = searchParams.get('success');
  const orderId = searchParams.get('orderId');

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