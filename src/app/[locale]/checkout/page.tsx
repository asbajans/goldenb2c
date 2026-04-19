'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import styles from './checkout.module.css';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, clearCart, refreshCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    country: 'Turkey',
    notes: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('stripe');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cart?.items?.length) return;

    setLoading(true);
    try {
      const res = await fetch('https://api.asb.web.tr/api/cart/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, paymentMethod })
      });
      const data = await res.json();

      if (data.success) {
        await clearCart();
        router.push(`/order/${data.orderId}?success=1`);
      } else {
        alert(data.error || 'Checkout failed');
      }
    } catch (error) {
      console.error(error);
      alert('Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  if (!cart?.items?.length) {
    return (
      <div className={styles.empty}>
        <h1>Your cart is empty</h1>
        <Link href="/products" className={styles.shopBtn}>Browse Products</Link>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Checkout</h1>

      <form onSubmit={handleSubmit} className={styles.layout}>
        <div className={styles.form}>
          <section className={styles.section}>
            <h2>Shipping Address</h2>
            <div className={styles.field}>
              <label>Full Name *</label>
              <input name="name" value={form.name} onChange={handleChange} required placeholder="John Doe" />
            </div>
            <div className={styles.field}>
              <label>Phone *</label>
              <input name="phone" value={form.phone} onChange={handleChange} required placeholder="+90 555 000 0000" />
            </div>
            <div className={styles.field}>
              <label>Email</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="email@example.com" />
            </div>
            <div className={styles.field}>
              <label>Address *</label>
              <input name="address" value={form.address} onChange={handleChange} required placeholder="Street address, Apt No" />
            </div>
            <div className={styles.row}>
              <div className={styles.field}>
                <label>City *</label>
                <input name="city" value={form.city} onChange={handleChange} required placeholder="Istanbul" />
              </div>
              <div className={styles.field}>
                <label>Country</label>
                <select name="country" value={form.country} onChange={handleChange}>
                  <option value="Turkey">Turkey</option>
                  <option value="Germany">Germany</option>
                  <option value="USA">USA</option>
                  <option value="UK">UK</option>
                </select>
              </div>
            </div>
            <div className={styles.field}>
              <label>Notes</label>
              <textarea name="notes" value={form.notes} onChange={handleChange} placeholder="Special instructions..." rows={3} />
            </div>
          </section>

          <section className={styles.section}>
            <h2>Payment Method</h2>
            <div className={styles.paymentOptions}>
              <label className={`${styles.paymentOption} ${paymentMethod === 'stripe' ? styles.paymentActive : ''}`}>
                <input type="radio" name="payment" value="stripe" checked={paymentMethod === 'stripe'} onChange={() => setPaymentMethod('stripe')} />
                <span className={styles.paymentIcon}>💳</span>
                <div>
                  <strong>Credit Card</strong>
                  <p>Pay securely with Stripe</p>
                </div>
              </label>
              <label className={`${styles.paymentOption} ${paymentMethod === 'bankTransfer' ? styles.paymentActive : ''}`}>
                <input type="radio" name="payment" value="bankTransfer" checked={paymentMethod === 'bankTransfer'} onChange={() => setPaymentMethod('bankTransfer')} />
                <span className={styles.paymentIcon}>🏦</span>
                <div>
                  <strong>Bank Transfer</strong>
                  <p>Wire transfer to our account</p>
                </div>
              </label>
              <label className={`${styles.paymentOption} ${paymentMethod === 'crypto' ? styles.paymentActive : ''}`}>
                <input type="radio" name="payment" value="crypto" checked={paymentMethod === 'crypto'} onChange={() => setPaymentMethod('crypto')} />
                <span className={styles.paymentIcon}>₿</span>
                <div>
                  <strong>USDT</strong>
                  <p>Pay with USDT TRC20</p>
                </div>
              </label>
            </div>
          </section>
        </div>

        <div className={styles.summary}>
          <h2>Order Summary</h2>
          <div className={styles.items}>
            {cart.items.map((item: any) => (
              <div key={item.id} className={styles.itemRow}>
                <span>{item.quantity}x {item.title}</span>
                <span>₺{Number(item.totalPrice).toLocaleString('tr-TR')}</span>
              </div>
            ))}
          </div>
          <div className={styles.divider} />
          <div className={styles.totalRow}>
            <span>Total</span>
            <span>₺{Number(cart.total).toLocaleString('tr-TR')}</span>
          </div>
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Processing...' : 'Place Order'}
          </button>
          <div className={styles.secure}>🔒 Secure checkout</div>
        </div>
      </form>
    </div>
  );
}