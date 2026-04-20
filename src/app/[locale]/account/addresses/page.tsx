'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import styles from './addresses.module.css';

interface Address {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  isDefault: boolean;
}

export default function AddressesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', address: '', city: '', phone: '' });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    fetchAddresses();
  }, [user]);

  async function fetchAddresses() {
    try {
      const token = localStorage.getItem('gc_token');
      const res = await fetch('/api/addresses', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        setAddresses(data.addresses || []);
      }
    } catch (err) {
      console.error('Fetch addresses error:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const token = localStorage.getItem('gc_token');
      const res = await fetch('/api/addresses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        fetchAddresses();
        setShowForm(false);
        setFormData({ name: '', address: '', city: '', phone: '' });
      }
    } catch (err) {
      console.error('Add address error:', err);
    }
  }

  if (authLoading || loading) {
    return <div className={styles.loading}><div className={styles.spinner} />Loading...</div>;
  }

  if (!user) return null;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>My Addresses</h1>
        <Link href="/account" className={styles.backBtn}>← Back to Account</Link>
      </div>

      {!addresses.length && !showForm ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>📍</div>
          <h2>No addresses saved</h2>
          <p>Add an address for faster checkout.</p>
          <button onClick={() => setShowForm(true)} className={styles.addBtn}>Add Address</button>
        </div>
      ) : (
        <div className={styles.grid}>
          {addresses.map(addr => (
            <div key={addr.id} className={styles.card}>
              <h3>{addr.name}</h3>
              <p>{addr.address}</p>
              <p>{addr.city}</p>
              <p>{addr.phone}</p>
              {addr.isDefault && <span className={styles.default}>Default</span>}
            </div>
          ))}
          <button onClick={() => setShowForm(true)} className={styles.addCard}>+ Add New Address</button>
        </div>
      )}

      {showForm && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>Add Address</h2>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Address Name (e.g. Home, Work)"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className={styles.input}
                required
              />
              <textarea
                placeholder="Full Address"
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
                className={styles.textarea}
                required
              />
              <input
                type="text"
                placeholder="City"
                value={formData.city}
                onChange={e => setFormData({ ...formData, city: e.target.value })}
                className={styles.input}
                required
              />
              <input
                type="tel"
                placeholder="Phone"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className={styles.input}
                required
              />
              <div className={styles.actions}>
                <button type="button" onClick={() => setShowForm(false)} className={styles.cancelBtn}>Cancel</button>
                <button type="submit" className={styles.submitBtn}>Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}