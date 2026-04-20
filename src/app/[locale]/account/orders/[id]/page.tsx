'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import styles from './orderDetail.module.css';

interface OrderItem {
  id: string;
  title: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  image?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  subtotal: number;
  shippingCost: number;
  totalAmount: number;
  createdAt: string;
  shippingAddress?: any;
  items: OrderItem[];
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

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user || !params.id) return;

    async function fetchOrder() {
      try {
        const token = localStorage.getItem('gc_token');
        const res = await fetch(`/api/orders/customer/${params.id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });

        if (res.ok) {
          const data = await res.json();
          setOrder(data);
        } else {
          setError('Order not found');
        }
      } catch (err) {
        console.error('Fetch order error:', err);
        setError('Failed to load order');
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [user, params.id]);

  if (authLoading || loading) {
    return <div className={styles.loading}><div className={styles.spinner} />Loading order...</div>;
  }

  if (!user || !order) {
    return null;
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Link href="/account/orders" className={styles.backBtn}>← Back to Orders</Link>
        <h1>Order #{order.orderNumber}</h1>
        <span className={styles.status}>{statusLabels[order.status] || order.status}</span>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.grid}>
        <div className={styles.items}>
          <h2>Items</h2>
          {order.items?.map(item => (
            <div key={item.id} className={styles.item}>
              <div className={styles.itemImage}>
                {item.image ? (
                  <Image src={item.image} alt={item.title} fill sizes="80px" style={{ objectFit: 'cover' }} />
                ) : (
                  <div className={styles.placeholder}>✦</div>
                )}
              </div>
              <div className={styles.itemInfo}>
                <h3>{item.title}</h3>
                <p>SKU: {item.sku}</p>
              </div>
              <div className={styles.itemQty}>x{item.quantity}</div>
              <div className={styles.itemPrice}>
                ₺{Number(item.totalPrice).toLocaleString('tr-TR')}
              </div>
            </div>
          ))}
        </div>

        <div className={styles.summary}>
          <h2>Summary</h2>
          <div className={styles.row}>
            <span>Subtotal</span>
            <span>₺{Number(order.subtotal).toLocaleString('tr-TR')}</span>
          </div>
          <div className={styles.row}>
            <span>Shipping</span>
            <span>{order.shippingCost > 0 ? `₺${Number(order.shippingCost).toLocaleString('tr-TR')}` : 'Free'}</span>
          </div>
          <div className={styles.row + ' ' + styles.total}>
            <span>Total</span>
            <span>₺{Number(order.totalAmount).toLocaleString('tr-TR')}</span>
          </div>

          {order.shippingAddress && (
            <div className={styles.address}>
              <h3>Shipping Address</h3>
              <p>{order.shippingAddress.name}</p>
              <p>{order.shippingAddress.address}</p>
              <p>{order.shippingAddress.city}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}