'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import ProductCard from '@/components/ProductCard';
import styles from './products.module.css';

import { Suspense } from 'react';

function ProductsContent() {
  const t = useTranslations('Products');
  const tc = useTranslations('Common');

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
  // Mobilde filtre paneli varsayılan AÇIK gelir — ürünlerin üstünde,
  // sayfayla birlikte kayar; tek dokunuşla kapatılabilir.
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [priceError, setPriceError] = useState(false);
  const locale = useLocale();
  const router = useRouter();

  // URL → state senkronu: TÜM filtreler (kategori, kelime, fiyat) URL'den
  // okunur. Hiçbir filtre diğerini SIFIRLAMAZ — eskiden fiyat yazıp kategori
  // seçince fiyat, kelime arayıp kategori seçince kelime siliniyordu.
  useEffect(() => {
    const urlType = searchParams.get('type') || '';
    const urlSearch = searchParams.get('search') || '';
    const urlMin = searchParams.get('minPrice') || '';
    const urlMax = searchParams.get('maxPrice') || '';
    setActiveCategory(prev => (prev !== urlType ? urlType : prev));
    setSearch(prev => (prev !== urlSearch ? urlSearch : prev));
    setMinPrice(prev => (prev !== urlMin ? urlMin : prev));
    setMaxPrice(prev => (prev !== urlMax ? urlMax : prev));
    setPage(1);
  }, [searchParams]);

  const limit = 24;

  // Latest request sequence (see loadProducts guard). Bumped on every new
  // search so stale responses are ignored.
  const requestSeq = useRef(0);

  const SORT_OPTIONS = [
    { value: 'newest', label: t('newest') },
    { value: 'price_asc', label: t('priceLowToHigh') },
    { value: 'price_desc', label: t('priceHighToLow') },
    { value: 'popular', label: t('bestSelling') },
  ];

  const loadCategories = useCallback(() => {
    fetch(`/api/categories?lang=${locale}`)
      .then(r => r.json())
      .then(d => setCategories(Array.isArray(d?.data) ? d.data : []))
      .catch(console.error)
      .finally(() => setCatLoading(false));
  }, [locale]);

  const loadProducts = useCallback(() => {
    // Sequence guard: keystrokes fire overlapping requests; a slow earlier
    // response (e.g. for "k") must never overwrite a later one ("kolye"),
    // which used to show ALL products after searching.
    const seq = ++requestSeq.current;
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
    params.set('lang', locale);

    fetch(`/api/products?${params.toString()}`)
      .then(r => r.json())
      .then(d => {
        if (seq !== requestSeq.current) return;
        setProducts(Array.isArray(d?.data) ? d.data : []);
        setTotal(d?.pagination?.total ?? 0);
      })
      .catch(console.error)
      .finally(() => {
        if (seq === requestSeq.current) setLoading(false);
      });
  }, [page, activeCategory, search, sort, minPrice, maxPrice]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // Debounced fetch: typing fires one request ~400ms after the last keystroke
  // instead of one per keystroke (fewer backend hits, no response races).
  useEffect(() => {
    const t = setTimeout(() => loadProducts(), search ? 400 : 0);
    return () => clearTimeout(t);
  }, [loadProducts, search]);

  useEffect(() => {
    setPage(1);
  }, [activeCategory, search, sort, minPrice, maxPrice]);

  /** Tüm aktif filtreleri tek URL'de birleştirir — hiçbiri kaybolmaz. */
  const buildUrl = (over: { type?: string; search?: string; min?: string; max?: string }) => {
    const p = new URLSearchParams();
    const t = over.type !== undefined ? over.type : activeCategory;
    const s = over.search !== undefined ? over.search : search;
    const mn = over.min !== undefined ? over.min : minPrice;
    const mx = over.max !== undefined ? over.max : maxPrice;
    if (t) p.set('type', t);
    if (s) p.set('search', s);
    if (mn) p.set('minPrice', mn);
    if (mx) p.set('maxPrice', mx);
    const q = p.toString();
    return `/${locale}/products${q ? `?${q}` : ''}`;
  };

  const handleCategory = (name: string) => {
    const next = name === activeCategory ? '' : name;
    setActiveCategory(next);
    // URL'yi TÜM aktif filtrelerle kur — kelime araması ve fiyat korunur.
    router.replace(buildUrl({ type: next }));
  };

  const handlePriceFilter = () => {
    const min = Number(minPrice);
    const max = Number(maxPrice);
    if (minPrice && maxPrice && min > max) {
      setPriceError(true);
      return;
    }
    setPriceError(false);
    // URL'yi TÜM aktif filtrelerle kur — kategori ve kelime korunur.
    router.replace(buildUrl({ min: minPrice, max: maxPrice }));
    loadProducts();
  };

  const handleSearchApply = () => {
    setPage(1);
    // URL'yi TÜM aktif filtrelerle kur — kategori ve fiyat korunur.
    router.replace(buildUrl({ search }));
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

  const getCategoryLabel = (slug: string) => {
    const cat = categories.find(c => c.slug === slug);
    return cat?.name || slug;
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.pageTitle}>
            {activeCategory ? getCategoryLabel(activeCategory) : `✦ ${t('allProducts')}`}
          </h1>
          <span className={styles.pageCount}>{t('showingResults', { count: total })}</span>
        </div>
        
        <div className={styles.headerRight}>
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

      <button
        type="button"
        className={styles.filterToggle}
        onClick={() => setFiltersOpen(o => !o)}
        aria-expanded={filtersOpen}
      >
        {filtersOpen ? '▲' : '▼'} {t('filters')}
      </button>

      <div className={styles.layout}>
        <aside className={`${styles.sidebar} ${filtersOpen ? '' : styles.sidebarHidden}`}>
          <div className={styles.sideSection}>
            <h3 className={styles.sideTitle}>{tc('categories')}</h3>
            {catLoading ? (
              <div className={styles.catSkeleton}>{tc('loading')}</div>
            ) : (
              <ul className={styles.catList}>
                <li>
                  <button
                    className={`${styles.catItem} ${!activeCategory ? styles.catActive : ''}`}
                    onClick={() => handleCategory('')}
                  >
                    <span>✦ {tc('viewAll')}</span>
                    <span className={styles.catCount}>
                      {categories.reduce((a, c) => a + (c.count || 0), 0)}
                    </span>
                  </button>
                </li>
                {categories.map((cat: any) => (
                  <li key={cat.slug}>
                    <button
                      className={`${styles.catItem} ${activeCategory === cat.slug ? styles.catActive : ''}`}
                      onClick={() => handleCategory(cat.slug)}
                    >
                      <span>{cat.name}</span>
                      <span className={styles.catCount}>{cat.count}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className={styles.sideSection}>
            <h3 className={styles.sideTitle}>{t('keywordSearch')}</h3>
            <div className={styles.priceInputs}>
              <input
                type="text"
                placeholder={t('keywordPlaceholder')}
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSearchApply(); }}
                className={styles.priceInput}
                style={{ flex: 1 }}
              />
            </div>
            <button onClick={handleSearchApply} className={styles.filterBtn}>
              {t('searchButton')}
            </button>
          </div>

          <div className={styles.sideSection}>
            <h3 className={styles.sideTitle}>{t('priceRange')}</h3>
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
              {t('applyFilters')}
            </button>
          </div>

          {hasFilters && (
            <button onClick={clearFilters} className={styles.clearBtn}>
              ✦ {t('clearFilters')}
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
                      category={p._categoryName || p.category}
                      isNew={i < 3}
                      discountRate={p.discountRate}
                      discountedPrice={p.discountRate ? `₺${Number(Number(p.priceTRY) * (1 - p.discountRate / 100)).toLocaleString('tr-TR')}` : undefined}
                      discountedPriceUSD={p.discountRate ? `$${Number(Number(p.priceUSD || 0) * (1 - p.discountRate / 100)).toFixed(0)}` : undefined}
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
                    ← {tc('viewAll').split(' ')[0]}
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
              <h3>{t('noProductsFound')}</h3>
              <p>{t('tryDifferentFilters')}</p>
              <button onClick={clearFilters} className={styles.resetBtn}>
                {t('clearFilters')}
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div style={{ padding: '4rem', textAlign: 'center' }}>Loading products...</div>}>
      <ProductsContent />
    </Suspense>
  );
}