'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import styles from './sellers.module.css';

function StoreCard({ store }: { store: any }) {
  return (
    <a href={`/sellers/${store.storeSlug}`} className={styles.storeCard} id={`store-${store.storeSlug}`}>
      {/* Banner */}
      <div className={styles.banner}>
        {store.banner && store.banner.startsWith('http') ? (
          <Image src={store.banner} alt={store.storeName} fill style={{ objectFit: 'cover' }} sizes="400px" />
        ) : (
          <div className={styles.bannerPlaceholder}>
            <span>✦</span>
          </div>
        )}
        {/* Logo */}
        <div className={styles.logoWrap}>
          {store.logo && store.logo.startsWith('http') ? (
            <Image src={store.logo} alt={store.storeName} width={56} height={56} className={styles.logo} />
          ) : (
            <div className={styles.logoPlaceholder}>{store.storeName?.[0] || '✦'}</div>
          )}
        </div>
      </div>
      {/* Content */}
      <div className={styles.cardContent}>
        <h3 className={styles.storeName}>{store.storeName}</h3>
        {store.description && <p className={styles.storeDesc}>{store.description.slice(0, 80)}{store.description.length > 80 ? '...' : ''}</p>}
        <div className={styles.storeMeta}>
          <span className={styles.metaItem}>📦 {store.totalProducts || 0} products</span>
          {store.rating > 0 && <span className={styles.metaItem}>⭐ {Number(store.rating).toFixed(1)}</span>}
        </div>
        <div className={styles.visitBtn}>Visit Store →</div>
      </div>
    </a>
  );
}

export default function SellersPage() {
  const [stores, setStores] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '24' });
    if (search) params.set('search', search);
    fetch(`/api/stores?${params.toString()}`)
      .then(r => r.json())
      .then(d => { setStores(Array.isArray(d?.data) ? d.data : []); setTotal(d?.pagination?.total ?? 0); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [search, page]);

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>✦ Our Sellers</h1>
          <p className={styles.pageCount}>{total} verified stores</p>
        </div>
        <div className={styles.searchWrap}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.35-4.35"/></svg>
          <input
            type="text"
            placeholder="Search stores..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className={styles.searchInput}
          />
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className={styles.grid}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className={styles.skeletonCard}>
              <div className={styles.skeletonBanner} />
              <div className={styles.skeletonBody}>
                <div className={styles.skeletonLine} />
                <div className={styles.skeletonLineShort} />
              </div>
            </div>
          ))}
        </div>
      ) : stores.length > 0 ? (
        <>
          <div className={styles.grid}>
            {stores.map(store => <StoreCard key={store.id} store={store} />)}
          </div>
          {total > 24 && (
            <div className={styles.pagination}>
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className={styles.pgBtn}>← Prev</button>
              <span className={styles.pgInfo}>Page {page} of {Math.ceil(total / 24)}</span>
              <button disabled={page >= Math.ceil(total / 24)} onClick={() => setPage(p => p + 1)} className={styles.pgBtn}>Next →</button>
            </div>
          )}
        </>
      ) : (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>🏪</div>
          <h3>No Stores Found</h3>
          <p>Try a different search term.</p>
        </div>
      )}

      {/* CTA */}
      <div className={styles.cta}>
        <h2>Are you a jewelry maker?</h2>
        <p>Join our marketplace and reach customers worldwide with AI-powered tools.</p>
        <a href="/sellers/join" className={styles.ctaBtn}>Start Selling Free ✦</a>
      </div>
    </div>
  );
}
