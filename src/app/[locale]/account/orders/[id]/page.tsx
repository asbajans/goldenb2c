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
  const [returns, setReturns] = useState<any[]>([]);
  const [returnReason, setReturnReason] = useState('withdrawal');
  const [returnNote, setReturnNote] = useState('');
  const [tracking, setTracking] = useState('');
  const [returnActing, setReturnActing] = useState(false);

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
          fetchReturns(data.id);
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

    async function fetchReturns(orderId: string) {
      try {
        const token = localStorage.getItem('gc_token');
        const res = await fetch(`/api/returns?orderId=${orderId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (res.ok) {
          const data = await res.json();
          setReturns(data.data || []);
        }
      } catch {
        // silent
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

  const authHeaders = (): Record<string, string> => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const token = localStorage.getItem('gc_token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  };

  const handleReturnRequest = async (orderItemId?: string) => {
    if (!order) return;
    setReturnActing(true);
    try {
      const res = await fetch('/api/returns', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ orderId: order.id, orderItemId, reason: returnReason, customerNote: returnNote })
      });
      const data = await res.json();
      if (res.ok) {
        alert('Return request sent to the seller.');
        setReturnNote('');
        const r = await fetch(`/api/returns?orderId=${order.id}`, { headers: authHeaders() });
        if (r.ok) setReturns((await r.json()).data || []);
      } else {
        alert(data.error || 'Failed to open return request');
      }
    } catch {
      alert('Failed to open return request');
    } finally {
      setReturnActing(false);
    }
  };

  const handleShipReturn = async (returnId: string) => {
    setReturnActing(true);
    try {
      const res = await fetch(`/api/returns/${returnId}/ship`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ trackingNumber: tracking })
      });
      const data = await res.json();
      if (res.ok) {
        alert('Tracking info sent to the seller.');
        setTracking('');
        if (order) {
          const r = await fetch(`/api/returns?orderId=${order.id}`, { headers: authHeaders() });
          if (r.ok) setReturns((await r.json()).data || []);
        }
      } else {
        alert(data.error || 'Failed to send tracking info');
      }
    } catch {
      alert('Failed to send tracking info');
    } finally {
      setReturnActing(false);
    }
  };

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

          {/* Returns */}
          <div className={styles.card}>
            <h2>Returns</h2>
            {returns.length === 0 && order.status === 'delivered' && (
              <>
                <div className={styles.row}>
                  <span>Reason</span>
                  <select
                    value={returnReason}
                    onChange={e => setReturnReason(e.target.value)}
                    style={{ maxWidth: 180 }}
                  >
                    <option value="withdrawal">Withdrawal (14 days)</option>
                    <option value="defective">Defective product</option>
                    <option value="wrong">Wrong product</option>
                    <option value="incomplete">Incomplete product</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                {order.items && order.items.length > 1 && (
                  <p style={{ fontSize: 13, color: '#666' }}>
                    Multi-item order — the request below covers the whole order. For a single item, contact support.
                  </p>
                )}
                <div className={styles.row}>
                  <span>Note</span>
                </div>
                <textarea
                  value={returnNote}
                  onChange={e => setReturnNote(e.target.value)}
                  rows={3}
                  style={{ width: '100%', marginBottom: 8 }}
                  placeholder="Optional note for the seller"
                />
                <button
                  className={styles.payBtn}
                  onClick={() => handleReturnRequest(order.items?.length === 1 ? order.items[0].id : undefined)}
                  disabled={returnActing}
                >
                  {returnActing ? 'Sending...' : 'Request Return ↩️'}
                </button>
                <p style={{ fontSize: 12, color: '#666', marginTop: 8 }}>
                  <Link href="/returns-policy">Return &amp; Refund Policy</Link>
                </p>
              </>
            )}
            {returns.map(r => (
              <div key={r.id} className={styles.row}>
                <span>{r.reason} — {r.status}</span>
                <span>
                  {r.status === 'approved' && (
                    <span style={{ display: 'block' }}>
                      <span style={{ fontSize: 12 }}>{r.returnAddress}</span>
                      <span style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                        <input
                          value={tracking}
                          onChange={e => setTracking(e.target.value)}
                          placeholder="Tracking no"
                          style={{ flex: 1 }}
                        />
                        <button
                          className={styles.payBtn}
                          onClick={() => handleShipReturn(r.id)}
                          disabled={returnActing}
                        >
                          Send
                        </button>
                      </span>
                    </span>
                  )}
                  {r.status === 'pending' && <span style={{ fontSize: 12 }}>Waiting seller approval</span>}
                  {r.status === 'refunded' && <span style={{ fontSize: 12 }}>Refunded ✓</span>}
                  {r.status === 'rejected' && <span style={{ fontSize: 12 }}>Rejected by seller</span>}
                </span>
              </div>
            ))}
            {returns.length === 0 && order.status !== 'delivered' && (
              <p style={{ fontSize: 13, color: '#666' }}>Returns open after delivery.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
