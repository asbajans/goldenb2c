'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import styles from '../orders/orders.module.css';

interface ReturnItem {
  id: string;
  orderId: string;
  reason: string;
  status: string;
  refundAmount?: number | null;
  returnAddress?: string | null;
  trackingNumber?: string | null;
  createdAt: string;
  order?: { orderNumber: string };
  product?: { title: string; slug: string };
}

const statusLabels: Record<string, string> = {
  pending: 'Pending Approval',
  approved: 'Approved',
  rejected: 'Rejected',
  shipped: 'Shipped',
  inspected: 'Inspected',
  refunded: 'Refunded',
  cancelled: 'Cancelled'
};

const statusColors: Record<string, string> = {
  pending: '#f59e0b',
  approved: '#3b82f6',
  rejected: '#ef4444',
  shipped: '#06b6d4',
  inspected: '#8b5cf6',
  refunded: '#22c55e',
  cancelled: '#6b7280'
};

export default function ReturnsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [returns, setReturns] = useState<ReturnItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    async function fetchReturns() {
      try {
        const token = localStorage.getItem('gc_token');
        const res = await fetch('/api/returns', {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (res.ok) {
          const data = await res.json();
          setReturns(data.data || []);
        }
      } catch {
        setReturns([]);
      } finally {
        setLoading(false);
      }
    }
    fetchReturns();
  }, [user]);

  if (authLoading || loading) {
    return <div className={styles.loading}><div className={styles.spinner} />Loading returns...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>My Returns</h1>
        <Link href="/account" className={styles.backBtn}>← Back to Account</Link>
      </div>

      {!returns.length ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>↩️</div>
          <h2>No returns yet</h2>
          <p>You can request a return from an order detail page within the return window.</p>
          <Link href="/account/orders" className={styles.shopBtn}>My Orders</Link>
        </div>
      ) : (
        <div className={styles.list}>
          {returns.map(r => (
            <div key={r.id} className={styles.orderCard}>
              <div className={styles.orderHeader}>
                <span className={styles.orderNumber}>
                  #{r.order?.orderNumber || r.orderId} — {r.product?.title}
                </span>
                <span
                  className={styles.status}
                  style={{ backgroundColor: `${statusColors[r.status]}20`, color: statusColors[r.status] }}
                >
                  {statusLabels[r.status] || r.status}
                </span>
              </div>
              <div className={styles.orderInfo}>
                <div className={styles.infoItem}>
                  <span className={styles.label}>Reason</span>
                  <span className={styles.value}>{r.reason}</span>
                </div>
                {r.refundAmount != null && (
                  <div className={styles.infoItem}>
                    <span className={styles.label}>Refund</span>
                    <span className={styles.value}>₺{Number(r.refundAmount).toLocaleString('tr-TR')}</span>
                  </div>
                )}
              </div>
              {r.status === 'approved' && r.returnAddress && (
                <div className={styles.products}>
                  <span className={styles.productName}>Return address: {r.returnAddress}</span>
                  {r.trackingNumber && <span className={styles.productName}>Tracking: {r.trackingNumber}</span>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
