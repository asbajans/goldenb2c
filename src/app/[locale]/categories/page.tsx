'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import styles from './categories.module.css';

const ICONS: Record<string, string> = {
  rings: '💍', necklaces: '📿', bracelets: '✨', earrings: '🌟',
  pendants: '🔮', sets: '👑', kolye: '📿', bilezik: '✨',
  yüzük: '💍', küpe: '🌟', default: '✦'
};

function getIcon(name: string) {
  const k = name?.toLowerCase();
  return ICONS[k] || ICONS.default;
}

export default function CategoriesPage() {
  const searchParams = useSearchParams();
  const typeParam = searchParams.get('type') || '';

  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [activeCategory, setActiveCategory] = useState(typeParam);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [catLoading, setCatLoading] = useState(true);
  const [page, setPage] = useState(1);

  // Load categories
  useEffect(() => {
    fetch('/api/categories')
      .then(r => r.json())
      .then(d => setCategories(Array.isArray(d?.data) ? d.data : []))
      .catch(console.error)
      .finally(() => setCatLoading(false));
  }, []);

  // Load products when filter changes
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '24' });
    if (activeCategory) params.set('category', activeCategory);
    if (search) params.set('search', search);
    fetch(`/api/products?${params.toString()}`)
      .then(r => r.json())
      .then(d => { setProducts(Array.isArray(d?.data) ? d.data : []); setTotal(d?.pagination?.total ?? 0); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [activeCategory, search, page]);

  const handleCategory = (name: string) => {
    setActiveCategory(prev => prev === name ? '' : name);
    setPage(1);
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerInner}>
          <h1 className={styles.pageTitle}>
            {activeCategory ? `${getIcon(activeCategory)} ${activeCategory}` : '✦ All Categories'}
          </h1>
          <p className={styles.pageCount}>{total} products</p>
        </div>
        {/* Search */}
        <div className={styles.searchWrap}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.35-4.35"/></svg>
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className={styles.searchInput}
          />
        </div>
      </div>

      <div className={styles.layout}>
        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <h3 className={styles.sideTitle}>Categories</h3>
          {catLoading ? (
            <div className={styles.catSkeleton}>Loading...</div>
          ) : (
            <ul className={styles.catList}>
              <li>
                <button
                  className={`${styles.catItem} ${!activeCategory ? styles.catActive : ''}`}
                  onClick={() => handleCategory('')}
                >
                  <span>✦ All</span>
                  <span className={styles.catCount}>{categories.reduce((a, c) => a + (c.count || 0), 0)}</span>
                </button>
              </li>
              {categories.map((cat: any) => (
                <li key={cat.name}>
                  <button
                    className={`${styles.catItem} ${activeCategory === cat.name ? styles.catActive : ''}`}
                    onClick={() => handleCategory(cat.name)}
                  >
                    <span>{getIcon(cat.name)} {cat.name}</span>
                    <span className={styles.catCount}>{cat.count}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>

        {/* Products Grid */}
        <main className={styles.main}>
          {loading ? (
            <div className={styles.productGrid}>
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className={styles.skeletonCard}>
                  <div className={styles.skeletonImg} />
                  <div className={styles.skeletonBody}>
                    <div className={styles.skeletonLine} />
                    <div className={styles.skeletonLineShort} />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <>
              <div className={styles.productGrid}>
                {products.map((p: any, i: number) => {
                  const img = p.images?.[0];
                  const valid = img && img.startsWith('http');
                  return (
                    <ProductCard
                      key={p.id}
                      id={p.id}
                      title={p.title}
                      price={p.priceTRY ? `₺${Number(p.priceTRY).toLocaleString('tr-TR')}` : '—'}
                      priceUSD={p.priceUSD ? `$${Number(p.priceUSD).toFixed(0)}` : undefined}
                      storeName={p.store?.storeName || ''}
                      imageUrl={valid ? img : ''}
                      slug={p.slug}
                      category={p.category}
                      isNew={i < 3}
                    />
                  );
                })}
              </div>
              {/* Pagination */}
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
              <div className={styles.emptyIcon}>✦</div>
              <h3>No products found</h3>
              <p>Try a different category or search term.</p>
              <button onClick={() => { setActiveCategory(''); setSearch(''); }} className={styles.resetBtn}>Clear Filters</button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
