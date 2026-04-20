'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import styles from './orders.module.css';

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  items: { quantity: number }[];
}

const statusLabels: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  returned: 'Returned'
};

const statusColors: Record<string, string> = {
  pending: '#f59e0b',
  confirmed: '#3b82f6',
  processing: '#8b5cf6',
  shipped: '#06b6d4',
  delivered: '#22c55e',
  cancelled: '#ef4444',
  returned: '#6b7280'
};

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;

    async function fetchOrders() {
      try {
        const token = localStorage.getItem('gc_token');
        const res = await fetch('/api/orders/customer', {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });

        if (res.ok) {
          const data = await res.json();
          setOrders(data.orders || []);
        } else {
          setOrders([]);
        }
      } catch (err) {
        console.error('Fetch orders error:', err);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, [user]);

  if (authLoading || loading) {
    return <div className={styles.loading}><div className={styles.spinner} />Loading orders...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>My Orders</h1>
        <Link href="/account" className={styles.backBtn}>← Back to Account</Link>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {!orders.length ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>📦</div>
          <h2>No orders yet</h2>
          <p>When you make a purchase, your orders will appear here.</p>
          <Link href="/products" className={styles.shopBtn}>Start Shopping</Link>
        </div>
      ) : (
        <div className={styles.list}>
          {orders.map(order => (
            <Link key={order.id} href={`/account/orders/${order.id}`} className={styles.orderCard}>
              <div className={styles.orderHeader}>
                <span className={styles.orderNumber}>#{order.orderNumber}</span>
                <span 
                  className={styles.status}
                  style={{ backgroundColor: `${statusColors[order.status]}20`, color: statusColors[order.status] }}
                >
                  {statusLabels[order.status] || order.status}
                </span>
              </div>
              <div className={styles.orderInfo}>
                <div className={styles.infoItem}>
                  <span className={styles.label}>Date</span>
                  <span className={styles.value}>
                    {new Date(order.createdAt).toLocaleDateString('tr-TR')}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.label}>Items</span>
                  <span className={styles.value}>
                    {order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.label}>Total</span>
                  <span className={styles.value + ' ' + styles.total}>
                    ₺{Number(order.totalAmount).toLocaleString('tr-TR')}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
