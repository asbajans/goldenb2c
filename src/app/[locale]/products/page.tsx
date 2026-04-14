'use client';
import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import styles from './products.module.css';

const ICONS: Record<string, string> = {
  rings: '💍', necklaces: '📿', bracelets: '✨', earrings: '🌟',
  pendants: '🔮', sets: '👑', kolye: '📿', bilezik: '✨',
  yüzük: '💍', küpe: '🌟', default: '✦'
};

function getIcon(name: string) {
  const k = name?.toLowerCase();
  return ICONS[k] || ICONS.default;
}

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'popular', label: 'Most Popular' },
];

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('type') || '';

  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [catLoading, setCatLoading] = useState(true);
  
  const [page, setPage] = useState(1);
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [priceError, setPriceError] = useState(false);

  const limit = 24;

  const loadCategories = useCallback(() => {
    fetch('/api/categories')
      .then(r => r.json())
      .then(d => setCategories(Array.isArray(d?.data) ? d.data : []))
      .catch(console.error)
      .finally(() => setCatLoading(false));
  }, []);

  const loadProducts = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      sort,
    });
    if (activeCategory) params.set('category', activeCategory);
    if (search) params.set('search', search);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);

    fetch(`/api/products?${params.toString()}`)
      .then(r => r.json())
      .then(d => {
        setProducts(Array.isArray(d?.data) ? d.data : []);
        setTotal(d?.pagination?.total ?? 0);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, activeCategory, search, sort, minPrice, maxPrice]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    setPage(1);
  }, [activeCategory, search, sort, minPrice, maxPrice]);

  const handleCategory = (name: string) => {
    setActiveCategory(prev => prev === name ? '' : name);
  };

  const handlePriceFilter = () => {
    const min = Number(minPrice);
    const max = Number(maxPrice);
    if (minPrice && maxPrice && min > max) {
      setPriceError(true);
      return;
    }
    setPriceError(false);
    loadProducts();
  };

  const clearFilters = () => {
    setActiveCategory('');
    setSearch('');
    setSort('newest');
    setMinPrice('');
    setMaxPrice('');
    setPage(1);
    setPriceError(false);
  };

  const totalPages = Math.ceil(total / limit);
  const hasFilters = activeCategory || search || minPrice || maxPrice;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.pageTitle}>
            {activeCategory ? `${getIcon(activeCategory)} ${activeCategory}` : '✦ All Products'}
          </h1>
          <span className={styles.pageCount}>{total} products found</span>
        </div>
        
        <div className={styles.headerRight}>
          <div className={styles.searchWrap}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="11" cy="11" r="7"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className={styles.sortSelect}
          >
            {SORT_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          <div className={styles.viewToggle}>
            <button
              className={`${styles.viewBtn} ${viewMode === 'grid' ? styles.viewActive : ''}`}
              onClick={() => setViewMode('grid')}
              aria-label="Grid view"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <rect x="3" y="3" width="7" height="7" rx="1"/>
                <rect x="14" y="3" width="7" height="7" rx="1"/>
                <rect x="3" y="14" width="7" height="7" rx="1"/>
                <rect x="14" y="14" width="7" height="7" rx="1"/>
              </svg>
            </button>
            <button
              className={`${styles.viewBtn} ${viewMode === 'list' ? styles.viewActive : ''}`}
              onClick={() => setViewMode('list')}
              aria-label="List view"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <rect x="3" y="4" width="18" height="3" rx="1"/>
                <rect x="3" y="11" width="18" height="3" rx="1"/>
                <rect x="3" y="18" width="18" height="3" rx="1"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <div className={styles.sideSection}>
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
                    <span className={styles.catCount}>
                      {categories.reduce((a, c) => a + (c.count || 0), 0)}
                    </span>
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
          </div>

          <div className={styles.sideSection}>
            <h3 className={styles.sideTitle}>Price Range</h3>
            <div className={styles.priceInputs}>
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={e => setMinPrice(e.target.value)}
                className={styles.priceInput}
                min="0"
              />
              <span className={styles.priceDash}>-</span>
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={e => setMaxPrice(e.target.value)}
                className={styles.priceInput}
                min="0"
              />
            </div>
            {priceError && <p className={styles.priceError}>Min price must be less than max</p>}
            <button onClick={handlePriceFilter} className={styles.filterBtn}>
              Apply Filter
            </button>
          </div>

          {hasFilters && (
            <button onClick={clearFilters} className={styles.clearBtn}>
              ✦ Clear All Filters
            </button>
          )}
        </aside>

        <main className={styles.main}>
          {loading ? (
            <div className={`${styles.productGrid} ${styles[viewMode]}`}>
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
              <div className={`${styles.productGrid} ${styles[viewMode]}`}>
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

              {totalPages > 1 && (
                <div className={styles.pagination}>
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                    className={styles.pgBtn}
                  >
                    ← Prev
                  </button>
                  <div className={styles.pgNumbers}>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum = i + 1;
                      if (totalPages > 5) {
                        if (page > 3) pageNum = page - 2 + i;
                        if (pageNum > totalPages) pageNum = totalPages - 4 + i;
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`${styles.pgNum} ${page === pageNum ? styles.pgActive : ''}`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage(p => p + 1)}
                    className={styles.pgBtn}
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>✦</div>
              <h3>No products found</h3>
              <p>Try adjusting your filters or search term.</p>
              <button onClick={clearFilters} className={styles.resetBtn}>
                Clear Filters
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
