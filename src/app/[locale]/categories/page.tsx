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

const CATEGORY_VARIATIONS: Record<string, { name: string; label: string; options: string[] }[]> = {
  rings: [{ name: 'size', label: 'Size', options: ['6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17'] }],
  yüzük: [{ name: 'size', label: 'Ölçü', options: ['6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17'] }],
  necklaces: [{ name: 'length', label: 'Length', options: ['40cm', '45cm', '50cm', '55cm', '60cm', '70cm', '80cm'] }],
  kolye: [{ name: 'length', label: 'Uzunluk', options: ['40cm', '45cm', '50cm', '55cm', '60cm', '70cm', '80cm'] }],
  bracelets: [{ name: 'size', label: 'Size', options: ['16cm', '17cm', '18cm', '19cm', '20cm'] }],
  bilezik: [{ name: 'size', label: 'Ölçü', options: ['16cm', '17cm', '18cm', '19cm', '20cm'] }],
  earrings: [{ name: 'type', label: 'Type', options: ['Stud', 'Drop', 'Hoop', 'Clip'] }],
  küpe: [{ name: 'type', label: 'Tip', options: ['Klipsli', 'Toplu', 'Vidalı', 'İttirme'] }]
};

const MILYEM_OPTIONS = ['14K', '18K', '22K', '24K'];

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
  const [selectedVariations, setSelectedVariations] = useState<Record<string, string>>({});
  const [selectedMilyem, setSelectedMilyem] = useState('');

  const categoryVariations = activeCategory ? CATEGORY_VARIATIONS[activeCategory.toLowerCase()] || [] : [];
  const hasVariationFilters = categoryVariations.length > 0 || selectedMilyem;

  useEffect(() => {
    fetch('/api/categories')
      .then(r => r.json())
      .then(d => setCategories(Array.isArray(d?.data) ? d.data : []))
      .catch(console.error)
      .finally(() => setCatLoading(false));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '24' });
    if (activeCategory) params.set('category', activeCategory);
    if (search) params.set('search', search);
    if (selectedMilyem) params.set('milyem', selectedMilyem);
    
    fetch(`/api/products?${params.toString()}`)
      .then(r => r.json())
      .then(d => { setProducts(Array.isArray(d?.data) ? d.data : []); setTotal(d?.pagination?.total ?? 0); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [activeCategory, search, page, selectedMilyem]);

  const handleCategory = (name: string) => {
    setActiveCategory(prev => prev === name ? '' : name);
    setSelectedVariations({});
    setSelectedMilyem('');
    setPage(1);
  };

  const handleVariation = (varName: string, value: string) => {
    setSelectedVariations(prev => {
      if (prev[varName] === value) {
        const { [varName]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [varName]: value };
    });
    setPage(1);
  };

  const clearFilters = () => {
    setActiveCategory('');
    setSearch('');
    setSelectedVariations({});
    setSelectedMilyem('');
    setPage(1);
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerInner}>
          <h1 className={styles.pageTitle}>
            {activeCategory ? `${getIcon(activeCategory)} ${activeCategory}` : '✦ All Categories'}
          </h1>
          <p className={styles.pageCount}>{total} products</p>
        </div>
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
        <aside className={styles.sidebar}>
          <div className={styles.filterSection}>
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
          </div>

          {activeCategory && (
            <>
              <div className={styles.filterSection}>
                <h3 className={styles.sideTitle}>Gold Purity</h3>
                <div className={styles.variationGrid}>
                  <button
                    className={`${styles.varBtn} ${!selectedMilyem ? styles.varActive : ''}`}
                    onClick={() => { setSelectedMilyem(''); setPage(1); }}
                  >
                    All
                  </button>
                  {MILYEM_OPTIONS.map(opt => (
                    <button
                      key={opt}
                      className={`${styles.varBtn} ${selectedMilyem === opt ? styles.varActive : ''}`}
                      onClick={() => setSelectedMilyem(prev => prev === opt ? '' : opt)}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {categoryVariations.map(v => (
                <div key={v.name} className={styles.filterSection}>
                  <h3 className={styles.sideTitle}>{v.label}</h3>
                  <div className={styles.variationGrid}>
                    {v.options.map(opt => (
                      <button
                        key={opt}
                        className={`${styles.varBtn} ${selectedVariations[v.name] === opt ? styles.varActive : ''}`}
                        onClick={() => handleVariation(v.name, opt)}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </>
          )}

          {hasVariationFilters && (
            <button onClick={clearFilters} className={styles.clearFiltersBtn}>
              ✦ Clear All Filters
            </button>
          )}
        </aside>

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
              <p>Try adjusting your filters.</p>
              <button onClick={clearFilters} className={styles.resetBtn}>Clear Filters</button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}