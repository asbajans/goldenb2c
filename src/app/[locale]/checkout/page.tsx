'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import styles from './checkout.module.css';

interface BankInfo {
  bank_name?: string;
  bank_iban?: string;
  bank_account_name?: string;
  bank_swift?: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, clearCart, refreshCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [bankInfo, setBankInfo] = useState<BankInfo>({});
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

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(d => setBankInfo({
        bank_name: d.bank_name,
        bank_iban: d.bank_iban,
        bank_account_name: d.bank_account_name,
        bank_swift: d.bank_swift
      }))
      .catch(console.error);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cart?.items?.length) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('gc_token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const cartItems = cart.items.map((item: any) => ({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity
      }));

      const res = await fetch('/api/cart/checkout', {
        method: 'POST',
        headers,
        body: JSON.stringify({ ...form, paymentMethod, cartItems })
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

            {paymentMethod === 'bankTransfer' && (bankInfo.bank_name || bankInfo.bank_iban) && (
              <div className={styles.bankDetails}>
                <h3>Bank Transfer Details</h3>
                <div className={styles.bankRow}>
                  <span>Bank:</span>
                  <strong>{bankInfo.bank_name}</strong>
                </div>
                <div className={styles.bankRow}>
                  <span>Account Name:</span>
                  <strong>{bankInfo.bank_account_name}</strong>
                </div>
                <div className={styles.bankRow}>
                  <span>IBAN:</span>
                  <strong className={styles.iban}>{bankInfo.bank_iban}</strong>
                </div>
                {bankInfo.bank_swift && (
                  <div className={styles.bankRow}>
                    <span>SWIFT:</span>
                    <strong>{bankInfo.bank_swift}</strong>
                  </div>
                )}
                <p className={styles.bankNote}>Please transfer the total amount to the account above and upload your receipt.</p>
              </div>
            )}
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