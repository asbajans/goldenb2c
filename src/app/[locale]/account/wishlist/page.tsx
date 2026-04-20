'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import styles from './wishlist.module.css';

interface WishlistItem {
  id: string;
  productId: string;
  title: string;
  price: number;
  image?: string;
  storeSlug?: string;
}

export default function WishlistPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    fetchWishlist();
  }, [user]);

  async function fetchWishlist() {
    try {
      const token = localStorage.getItem('gc_token');
      const res = await fetch('/api/wishlist', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        setItems(data.wishlist || []);
      }
    } catch (err) {
      console.error('Fetch wishlist error:', err);
    } finally {
      setLoading(false);
    }
  }

  async function removeFromWishlist(productId: string) {
    try {
      const token = localStorage.getItem('gc_token');
      await fetch('/api/wishlist', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ productId })
      });
      setItems(items.filter(item => item.productId !== productId));
    } catch (err) {
      console.error('Remove wishlist error:', err);
    }
  }

  if (authLoading || loading) {
    return <div className={styles.loading}><div className={styles.spinner} />Loading...</div>;
  }

  if (!user) return null;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>My Wishlist</h1>
        <Link href="/account" className={styles.backBtn}>← Back to Account</Link>
      </div>

      {!items.length ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>❤️</div>
          <h2>Your wishlist is empty</h2>
          <p>Save items you love to your wishlist.</p>
          <Link href="/products" className={styles.shopBtn}>Browse Products</Link>
        </div>
      ) : (
        <div className={styles.grid}>
          {items.map(item => (
            <div key={item.id} className={styles.card}>
              <Link href={`/p/${item.productId}`} className={styles.imageWrap}>
                {item.image ? (
                  <Image src={item.image} alt={item.title} fill sizes="240px" style={{ objectFit: 'cover' }} />
                ) : (
                  <div className={styles.placeholder}>✦</div>
                )}
              </Link>
              <div className={styles.info}>
                <Link href={`/p/${item.productId}`} className={styles.title}>{item.title}</Link>
                <p className={styles.price}>₺{Number(item.price).toLocaleString('tr-TR')}</p>
                <button onClick={() => removeFromWishlist(item.productId)} className={styles.removeBtn}>
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}