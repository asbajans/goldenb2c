'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import styles from './account.module.css';

export default function AccountPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({ orders: 0, wishlist: 0, addresses: 0 });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return <div className={styles.loading}><div className={styles.spinner} />Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.avatar}>
          {user.firstName?.charAt(0)?.toUpperCase() || 'U'}
        </div>
        <div className={styles.info}>
          <h1>Welcome, {user.firstName}!</h1>
          <p>{user.email}</p>
        </div>
      </div>

      <div className={styles.grid}>
        <Link href="/account/orders" className={styles.card}>
          <div className={styles.cardIcon}>📦</div>
          <h3>My Orders</h3>
          <p>View your order history and track shipments</p>
        </Link>

        <Link href="/account/addresses" className={styles.card}>
          <div className={styles.cardIcon}>📍</div>
          <h3>Addresses</h3>
          <p>Manage your shipping addresses</p>
        </Link>

        <Link href="/account/wishlist" className={styles.card}>
          <div className={styles.cardIcon}>❤️</div>
          <h3>Wishlist</h3>
          <p>Items you&apos;ve saved for later</p>
        </Link>

        <Link href="/account/settings" className={styles.card}>
          <div className={styles.cardIcon}>⚙️</div>
          <h3>Settings</h3>
          <p>Account preferences and security</p>
        </Link>
      </div>
    </div>
  );
}
