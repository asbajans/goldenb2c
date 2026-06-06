'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';
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
  currency: string;
  createdAt: string;
  confirmedDate?: string;
  shippedDate?: string;
  deliveredDate?: string;
  cancelledDate?: string;
  shippingAddress?: any;
  customerNote?: string;
  source: string;
  items: OrderItem[];
}

const statusFlow = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'] as const;

const statusConfig: Record<string, { label: string; color: string }> = {
  pending:    { label: 'Pending',     color: '#f59e0b' },
  confirmed:  { label: 'Confirmed',   color: '#3b82f6' },
  processing: { label: 'Processing',  color: '#8b5cf6' },
  shipped:    { label: 'Shipped',     color: '#06b6d4' },
  delivered:  { label: 'Delivered',   color: '#22c55e' },
  cancelled:  { label: 'Cancelled',   color: '#ef4444' },
  returned:   { label: 'Returned',    color: '#6b7280' }
};

function getPaymentMethod(note?: string): string {
  if (!note) return 'Bank Transfer / EFT';
  if (note.includes('Kredi Kartı')) return 'Credit Card (Stripe)';
  if (note.includes('Banka Havalesi')) return 'Bank Transfer / EFT';
  return 'Bank Transfer / EFT';
}

export default function OrderDetailPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams<{id: string}>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user || !params?.id) return;

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

  const handleCancel = async () => {
    if (!order || !window.confirm('Are you sure you want to cancel this order?')) return;
    setCancelling(true);
    try {
      const token = localStorage.getItem('gc_token');
      const res = await fetch(`/api/orders/customer/${order.id}/cancel`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const data = await res.json();
      if (data.success) {
        setOrder(prev => prev ? { ...prev, status: 'cancelled' } : null);
      } else {
        alert(data.error || 'Failed to cancel order');
      }
    } catch (err) {
      alert('Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  const handlePay = async () => {
    if (!order) return;
    setPaying(true);
    try {
      const token = localStorage.getItem('gc_token');
      const res = await fetch(`/api/orders/customer/${order.id}/pay`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const data = await res.json();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        alert(data.error || 'Failed to create payment');
      }
    } catch (err) {
      alert('Failed to create payment');
    } finally {
      setPaying(false);
    }
  };

  const statusIdx = (s: string) => statusFlow.indexOf(s as typeof statusFlow[number]);

  if (authLoading || loading) {
    return <div className={styles.loading}><div className={styles.spinner} />Loading order...</div>;
  }

  if (!user || !order) {
    return null;
  }

  const currentStatusIdx = statusIdx(order.status);
  const isCancelled = order.status === 'cancelled' || order.status === 'returned';
  const isStripe = getPaymentMethod(order.customerNote) === 'Credit Card (Stripe)';

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Link href="/account/orders" className={styles.backBtn}>← Back to Orders</Link>
        <h1>Order #{order.orderNumber}</h1>
        <span
          className={styles.status}
          style={{
            background: `${statusConfig[order.status]?.color || '#6b7280'}18`,
            color: statusConfig[order.status]?.color || '#6b7280'
          }}
        >
          {statusConfig[order.status]?.label || order.status}
        </span>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {/* Status Timeline */}
      {!isCancelled && (
        <div className={styles.timeline}>
          {statusFlow.map((s, idx) => {
            const done = idx <= currentStatusIdx;
            const active = idx === currentStatusIdx;
            const config = statusConfig[s];
            return (
              <div key={s} className={`${styles.step} ${done ? styles.done : ''} ${active ? styles.active : ''}`}>
                <div
                  className={styles.dot}
                  style={done ? { background: config.color, borderColor: config.color } : undefined}
                />
                <div className={styles.stepInfo}>
                  <span className={styles.stepLabel}>{config.label}</span>
                  {order[`${s}Date` as keyof Order] && (
                    <span className={styles.stepDate}>
                      {new Date(order[`${s}Date` as keyof Order] as string).toLocaleDateString('tr-TR')}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancelled banner */}
      {isCancelled && (
        <div className={styles.cancelledBanner}>
          This order has been <strong>cancelled</strong>.
        </div>
      )}

      <div className={styles.grid}>
        {/* Items */}
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

        {/* Sidebar */}
        <div className={styles.sidebar}>
          {/* Order Details */}
          <div className={styles.card}>
            <h2>Order Details</h2>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Order Number</span>
              <span className={styles.detailValue}>#{order.orderNumber}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Date</span>
              <span className={styles.detailValue}>{new Date(order.createdAt).toLocaleDateString('tr-TR')}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Payment</span>
              <span className={styles.detailValue}>{getPaymentMethod(order.customerNote)}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Source</span>
              <span className={styles.detailValue}>{order.source || 'Golden'}</span>
            </div>
          </div>

          {/* Summary */}
          <div className={styles.card}>
            <h2>Summary</h2>
            <div className={styles.row}>
              <span>Subtotal</span>
              <span>₺{Number(order.subtotal).toLocaleString('tr-TR')}</span>
            </div>
            <div className={styles.row}>
              <span>Shipping</span>
              <span>{order.shippingCost > 0 ? `₺${Number(order.shippingCost).toLocaleString('tr-TR')}` : 'Free'}</span>
            </div>
            <div className={`${styles.row} ${styles.totalRow}`}>
              <span>Total</span>
              <span className={styles.totalAmount}>₺{Number(order.totalAmount).toLocaleString('tr-TR')}</span>
            </div>
          </div>

          {/* Shipping Address */}
          {order.shippingAddress && (
            <div className={styles.card}>
              <h2>Shipping Address</h2>
              <p className={styles.addressLine}>{order.shippingAddress.name}</p>
              <p className={styles.addressLine}>{order.shippingAddress.address}</p>
              <p className={styles.addressLine}>{order.shippingAddress.city}</p>
              {order.shippingAddress.phone && (
                <p className={styles.addressLine}>{order.shippingAddress.phone}</p>
              )}
            </div>
          )}

          {/* Actions */}
          {(order.status === 'pending' || order.status === 'confirmed') && (
            <div className={styles.card}>
              <h2>Actions</h2>

              {isStripe && order.status === 'pending' && (
                <button
                  className={styles.payBtn}
                  onClick={handlePay}
                  disabled={paying}
                >
                  {paying ? 'Redirecting...' : 'Pay Now 💳'}
                </button>
              )}

              <button
                className={styles.cancelBtn}
                onClick={handleCancel}
                disabled={cancelling}
              >
                {cancelling ? 'Cancelling...' : 'Cancel Order'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
