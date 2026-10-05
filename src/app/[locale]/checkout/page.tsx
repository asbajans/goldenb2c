'use client';
import { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useCart } from '@/context/CartContext';
import styles from './checkout.module.css';

interface BankInfo {
  bank_name?: string;
  bank_iban?: string;
  bank_account_name?: string;
  bank_swift?: string;
}

interface Address {
  id: string;
  name: string;
  fullName: string;
  address: string;
  city: string;
  phone: string;
  isDefault: boolean;
}

function CheckoutContent() {
  const t = useTranslations('Checkout');
  const tc = useTranslations('Common');
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const { cart, addItem, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(false);
  const [bankInfo, setBankInfo] = useState<BankInfo>({});
  const [addresses, setAddresses] = useState<Address[]>([]);
  // Backend order id of the current checkout attempt. Persisted so that going
  // back from Stripe and pressing "Pay" again reuses the SAME order (backend
  // MODE 0) instead of creating a new one — the charged amount stays stable.
  const [orderId, setOrderId] = useState<string | null>(null);
  const submittingRef = useRef(false);
  // Admin-controlled payment toggles (from /api/settings -> backend public
  // settings). Defaults mirror the backend seed until settings load.
  const [bankEnabled, setBankEnabled] = useState(true);
  const [ccEnabled, setCcEnabled] = useState(true);
  
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    country: 'Turkey',
    notes: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('bankTransfer');

  useEffect(() => {
    try {
      const pending = sessionStorage.getItem('gc_checkout_order_id');
      if (pending) setOrderId(pending);
    } catch { /* sessionStorage unavailable */ }

    fetch('/api/settings')
      .then(r => r.json())
      .then(d => {
        setBankInfo({
          bank_name: d.bank_name,
          bank_iban: d.bank_iban,
          bank_account_name: d.bank_account_name,
          bank_swift: d.bank_swift
        });
        // Respect Admin Panel -> Odeme Yonetimi toggles. A MISSING key means an
        // older backend that still hides the flags (isPublic=false bug) — in
        // that case keep the current behaviour (both methods visible) so
        // working card payments are never hidden during the transition.
        // The backend enforces the toggles too once it is redeployed.
        const bank = d.payment_bank_transfer_enabled !== 'false';
        const cc = d.payment_credit_card_enabled === undefined
          ? true
          : d.payment_credit_card_enabled === 'true';
        setBankEnabled(bank);
        setCcEnabled(cc);
        setPaymentMethod(prev => {
          if (prev === 'bankTransfer' && bank) return prev;
          if (prev === 'stripe' && cc) return prev;
          if (bank) return 'bankTransfer';
          if (cc) return 'stripe';
          return prev;
        });
      })
      .catch(console.error);
      
    const token = localStorage.getItem('gc_token');
    if (token) {
      fetch('/api/addresses', { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json())
        .then(data => {
          if (data.addresses) {
            setAddresses(data.addresses);
            const defaultAddr = data.addresses.find((a: Address) => a.isDefault) || data.addresses[0];
            if (defaultAddr) {
              handleAddressSelect(defaultAddr);
            }
          }
        })
        .catch(console.error);
    }
  }, []);

  // Handle meta products and coupon from URL
  useEffect(() => {
    const productsParam = searchParams.get('products');
    const couponParam = searchParams.get('coupon');

    if (productsParam) {
      setInitializing(true);
      const entries = productsParam.split(',').filter(Boolean);
      
      Promise.all(entries.map(async (entry: string) => {
        const [productKey, qtyStr] = entry.split(':');
        const quantity = parseInt(qtyStr) || 1;
        // productKey format: UUID_variant or just UUID
        const productId = productKey.split('_')[0];
        
        try {
          const res = await fetch(`/api/products/by-id/${productId}?lang=en`);
          if (!res.ok) return null;
          const product = await res.json();
          return { product, quantity };
        } catch {
          return null;
        }
      })).then(results => {
        const valid = results.filter(Boolean) as any[];
        // Idempotent: only add the quantity that is NOT already in the cart.
        // Without this, every remount (e.g. coming back from Stripe and
        // pressing Pay again) incremented the quantities 1x -> 2x -> 3x.
        let existingItems: any[] = [];
        try {
          const stored = localStorage.getItem('gc_cart');
          existingItems = stored ? JSON.parse(stored).items || [] : [];
        } catch { /* ignore corrupt cart */ }
        for (const { product, quantity } of valid) {
          const already = existingItems
            .filter((i: any) => i.productId === product.id)
            .reduce((s: number, i: any) => s + (Number(i.quantity) || 0), 0);
          const deficit = quantity - already;
          if (deficit <= 0) continue;
          addItem({
            productId: product.id,
            title: product.title,
            sku: product.sku || '',
            unitPrice: product.discountedPrice || product.priceTRY || 0,
            discountedPrice: product.discountedPrice,
            quantity: deficit,
            image: product.images?.[0] || '',
            storeName: product.store?.storeName,
            storeSlug: product.store?.storeSlug,
          });
          existingItems.push({ productId: product.id, quantity: deficit });
        }
        setInitializing(false);
      });
    }

    if (couponParam) {
      sessionStorage.setItem('gc_coupon', couponParam);
    }
  }, []);

  const handleAddressSelect = (addr: Address) => {
    setForm(prev => ({
      ...prev,
      name: addr.fullName || addr.name || '',
      address: addr.address || '',
      city: addr.city || '',
      phone: addr.phone || ''
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cart?.items?.length) return;
    // Double-submit guard: React state updates are async, so rapid double
    // clicks could fire two checkouts before `loading` disables the button.
    // Each duplicate used to create an extra order / inflate the amount.
    if (submittingRef.current) return;
    submittingRef.current = true;

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
        body: JSON.stringify({ ...form, paymentMethod, cartItems, orderId })
      });
      const data = await res.json();

      if (data.success || data.orderId) {
        const newOrderId = data.orderId || data.id;
        try {
          if (data.checkoutUrl) {
            // Stripe: remember the order so a retry reuses it (stable amount).
            sessionStorage.setItem('gc_checkout_order_id', newOrderId);
          } else {
            sessionStorage.removeItem('gc_checkout_order_id');
          }
        } catch { /* ignore */ }
        setOrderId(data.checkoutUrl ? newOrderId : null);

        sessionStorage.setItem('lastOrder', JSON.stringify({
          id: newOrderId,
          total: data.total || 0,
          currency: 'TRY'
        }));

        if (data.checkoutUrl) {
          window.location.href = data.checkoutUrl;
        } else {
          await clearCart();
          router.push(`/order/${newOrderId}?success=1`);
        }
      } else {
        alert(data.error || 'Checkout failed');
      }
    } catch (error) {
      console.error(error);
      alert('Checkout failed');
    } finally {
      submittingRef.current = false;
      setLoading(false);
    }
  };

  if (initializing) {
    return (
      <div className={styles.empty}>
        <h1>Preparing your cart...</h1>
        <p>Please wait while we load your products.</p>
      </div>
    );
  }

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
          
          {/* Saved Addresses Section */}
          {addresses.length > 0 && (
            <section className={styles.section}>
              <h2>Saved Addresses</h2>
              <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr', marginBottom: '1.5rem' }}>
                {addresses.map(addr => (
                  <div 
                    key={addr.id} 
                    onClick={() => handleAddressSelect(addr)}
                    style={{ 
                      padding: '1rem', 
                      border: '1px solid #ddd', 
                      borderRadius: '8px',
                      cursor: 'pointer',
                      background: form.address === addr.address ? '#f6ffed' : '#fff',
                      borderColor: form.address === addr.address ? '#b7eb8f' : '#ddd'
                    }}
                  >
                    <strong style={{ display: 'block', marginBottom: '0.25rem' }}>{addr.name}</strong>
                    <div style={{ fontSize: '0.85rem', color: '#666' }}>{addr.fullName}</div>
                    <div style={{ fontSize: '0.85rem', color: '#666' }}>{addr.address}</div>
                    <div style={{ fontSize: '0.85rem', color: '#666' }}>{addr.city} - {addr.phone}</div>
                  </div>
                ))}
              </div>
            </section>
          )}

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
               <label>Order Notes</label>
               <textarea name="notes" value={form.notes} onChange={handleChange} placeholder="Optional notes for your order" rows={3}></textarea>
            </div>
          </section>

          <section className={styles.section}>
            <h2>Payment Method</h2>
            {!bankEnabled && !ccEnabled && (
              <p style={{ color: '#a00' }}>
                Online payment methods are currently disabled. Please contact us to complete your order.
              </p>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              {ccEnabled && (
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="stripe"
                    checked={paymentMethod === 'stripe'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <span>Credit Card (Stripe)</span>
                </label>
              )}
              {bankEnabled && (
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="bankTransfer"
                    checked={paymentMethod === 'bankTransfer'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <span>Bank Transfer / EFT</span>
                </label>
              )}
            </div>

            {paymentMethod === 'bankTransfer' && (bankInfo.bank_name || bankInfo.bank_iban) && (
              <div className={styles.bankDetails} style={{ marginTop: '1.5rem', padding: '1rem', background: '#f9f9f9', borderRadius: '8px', border: '1px solid #eaeaea' }}>
                <h3 style={{ marginTop: 0, fontSize: '1rem', marginBottom: '1rem' }}>Bank Transfer Details</h3>
                <div className={styles.bankRow} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ color: '#666' }}>Bank:</span>
                  <strong>{bankInfo.bank_name}</strong>
                </div>
                <div className={styles.bankRow} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ color: '#666' }}>Account Name:</span>
                  <strong>{bankInfo.bank_account_name}</strong>
                </div>
                <div className={styles.bankRow} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ color: '#666' }}>IBAN:</span>
                  <strong className={styles.iban}>{bankInfo.bank_iban}</strong>
                </div>
                {bankInfo.bank_swift && (
                  <div className={styles.bankRow} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ color: '#666' }}>SWIFT:</span>
                    <strong>{bankInfo.bank_swift}</strong>
                  </div>
                )}
                <p className={styles.bankNote} style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#666' }}>
                  Please transfer the total amount to the account above and upload your receipt or specify your order number in the transfer description.
                </p>
              </div>
            )}
          </section>
        </div>

        <div className={styles.summary}>
          <h2>Order Summary</h2>
          <div className={styles.items}>
            {cart.items.map((item: any) => (
              <div key={item.id} className={styles.itemRow} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>{item.quantity}x {item.title}</span>
                <span>₺{Number(item.totalPrice).toLocaleString('tr-TR')}</span>
              </div>
            ))}
          </div>
          <div className={styles.divider} style={{ margin: '1rem 0', borderBottom: '1px solid #eaeaea' }} />
          <div className={styles.totalRow} style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '1.5rem' }}>
            <span>Total</span>
            <span>₺{Number(cart.total).toLocaleString('tr-TR')}</span>
          </div>
          <button 
            type="submit" 
            className={styles.submitBtn} 
            disabled={loading}
            style={{ width: '100%', padding: '1rem', background: '#d4a017', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '1.1rem', cursor: 'pointer', fontWeight: 'bold' }}
          >
            {loading ? 'Processing...' : 'Place Order'}
          </button>
          <div className={styles.secure} style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.85rem', color: '#666' }}>
            🔒 Secure checkout
          </div>
        </div>
      </form>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className={styles.empty}><h1>Loading...</h1></div>}>
      <CheckoutContent />
    </Suspense>
  );
}