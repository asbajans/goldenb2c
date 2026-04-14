'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import styles from './store.module.css';

export default function StoreDetailPage() {
  const params = useParams();
  const storeSlug = params?.storeSlug as string;

  const [store, setStore] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>({ total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!storeSlug) return;
    setLoading(true);
    fetch(`/api/stores/${storeSlug}?page=${page}&limit=24`)
      .then(r => r.json())
      .then(d => {
        setStore(d?.store || null);
        setProducts(Array.isArray(d?.data) ? d.data : []);
        setPagination(d?.pagination || { total: 0, pages: 1 });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [storeSlug, page]);

  if (loading) return (
    <div className={styles.loading}>
      <div className={styles.spinner} />
      <p>Loading store...</p>
    </div>
  );

  if (!store) return (
    <div className={styles.notFound}>
      <div className={styles.notFoundIcon}>🏪</div>
      <h1>Store Not Found</h1>
      <Link href="/sellers" className={styles.backBtn}>← Browse Stores</Link>
    </div>
  );

  return (
    <div className={styles.page}>
      {/* ── Store Hero ── */}
      <div className={styles.hero}>
        <div className={styles.heroBanner}>
          {store.banner && store.banner.startsWith('http') ? (
            <Image src={store.banner} alt={store.storeName} fill style={{ objectFit: 'cover' }} sizes="100vw" priority />
          ) : (
            <div className={styles.bannerPlaceholder}>
              <span>✦</span>
            </div>
          )}
          <div className={styles.heroOverlay} />
        </div>
        <div className={styles.heroContent}>
          <div className={styles.logoWrap}>
            {store.logo && store.logo.startsWith('http') ? (
              <Image src={store.logo} alt={store.storeName} width={88} height={88} className={styles.storeLogo} />
            ) : (
              <div className={styles.logoPlaceholder}>{store.storeName?.[0] || '✦'}</div>
            )}
          </div>
          <div className={styles.storeInfo}>
            <h1 className={styles.storeName}>{store.storeName}</h1>
            <div className={styles.storeMeta}>
              <span className={styles.metaBadge}>📦 {store.totalProducts || 0} products</span>
              {store.rating > 0 && <span className={styles.metaBadge}>⭐ {Number(store.rating).toFixed(1)}</span>}
            </div>
            {store.description && <p className={styles.storeDesc}>{store.description}</p>}
          </div>
        </div>
      </div>

      {/* ── Breadcrumb ── */}
      <div className={styles.breadcrumb}>
        <Link href="/">Home</Link>
        <span>→</span>
        <Link href="/sellers">Sellers</Link>
        <span>→</span>
        <span>{store.storeName}</span>
      </div>

      {/* ── Products ── */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Products from {store.storeName}</h2>

        {products.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>📦</div>
            <h3>No products yet</h3>
            <p>This store hasn&apos;t listed any products.</p>
          </div>
        ) : (
          <>
            <div className={styles.grid}>
              {products.map((product: any) => (
                <Link key={product.id} href={`/p/${product.slug}`} className={styles.productCard} id={`product-${product.slug}`}>
                  <div className={styles.cardImage}>
                    {Array.isArray(product.images) && product.images[0] ? (
                      <Image
                        src={product.images[0]}
                        alt={product.title}
                        fill
                        sizes="(max-width: 768px) 50vw, 25vw"
                        style={{ objectFit: 'cover' }}
                      />
                    ) : (
                      <div className={styles.imgPlaceholder}>✦</div>
                    )}
                  </div>
                  <div className={styles.cardBody}>
                    <p className={styles.cardTitle}>{product.title}</p>
                    {product.priceTRY && (
                      <p className={styles.cardPrice}>₺{Number(product.priceTRY).toLocaleString('tr-TR')}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>

            {pagination.pages > 1 && (
              <div className={styles.pagination}>
                <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className={styles.pgBtn}>← Prev</button>
                <span className={styles.pgInfo}>Page {page} of {pagination.pages}</span>
                <button disabled={page >= pagination.pages} onClick={() => setPage(p => p + 1)} className={styles.pgBtn}>Next →</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
