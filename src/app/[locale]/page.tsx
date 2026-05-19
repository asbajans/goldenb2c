'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import ProductCard from '@/components/ProductCard';
import styles from './page.module.css';

const TRUST_ITEMS = [
  { icon: '🔒', key: 'securePayments' },
  { icon: '🌍', key: 'globalShipping' },
  { icon: '🤖', key: 'aiPowered' },
  { icon: '✦', key: 'authenticGold' },
];

export default function Home() {
  const t = useTranslations('Home');
  const tc = useTranslations('Common');

  const [categories, setCategories] = useState<any[]>([]);
  const [categoryProducts, setCategoryProducts] = useState<Record<string, any[]>>({});
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const locale = useLocale();

  // Fetch categories, then fetch 6 newest products per category
  useEffect(() => {
    let cancelled = false;

    fetch(`/api/categories?lang=${locale}`)
      .then(r => r.json())
      .then(async d => {
        if (cancelled) return;
        const cats = Array.isArray(d?.data) ? d.data.slice(0, 6) : [];
        setCategories(cats);

        // For each category fetch 6 newest products in parallel
        const results = await Promise.all(
          cats.map((cat: any) =>
            fetch(`/api/products?category=${encodeURIComponent(cat.slug)}&limit=6&lang=${locale}`)
              .then(r => r.json())
              .then(data => ({ slug: cat.slug, products: Array.isArray(data?.data) ? data.data : [] }))
              .catch(() => ({ slug: cat.slug, products: [] }))
          )
        );

        if (cancelled) return;
        const map: Record<string, any[]> = {};
        let totalCount = 0;
        results.forEach(r => { map[r.slug] = r.products; totalCount += r.products.length; });
        setCategoryProducts(map);
        setTotal(totalCount);
      })
      .catch(console.error)
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [locale]);

  return (
    <main className={styles.main}>

      {/* ===== HERO ===== */}
      <section className={styles.hero}>
        <div className={styles.heroBg}>
          <div className={styles.heroOrb1} />
          <div className={styles.heroOrb2} />
        </div>
        <div className={styles.heroContent}>
          <span className={styles.heroPill}>✦ &nbsp;Premium Jewelry Marketplace</span>
          <h1 className={styles.heroTitle}>
            {t('heroTitle')}<br />
            <span className={styles.heroGold}>{t('heroTitleGold')}</span>
          </h1>
          <p className={styles.heroSub}>
            {t('heroSubtitle')}
          </p>
          <div className={styles.heroActions}>
            <Link href="/products" className={styles.btnPrimary} id="hero-shop-now">{t('shopNow')} ✦</Link>
            <Link href="/sellers" className={styles.btnSecondary} id="hero-see-sellers">{t('meetSellers')}</Link>
          </div>
          <div className={styles.heroStats}>
            <div className={styles.stat}>
              <strong>{total > 0 ? `${total}+` : '—'}</strong>
              <span>{t('products')}</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}><strong>150+</strong><span>{t('verifiedSellers')}</span></div>
            <div className={styles.statDivider} />
            <div className={styles.stat}><strong>4</strong><span>{t('languages')}</span></div>
          </div>
        </div>
      </section>

      {/* ===== CATEGORY PRODUCTS ===== */}
      {!loading && categories.length > 0 && categories.map((cat, catIdx) => {
        const products = categoryProducts[cat.slug] || [];
        if (products.length === 0) return null;
        return (
          <section key={cat.slug} className={`${styles.section} ${styles.catProductSection}`}>
            <div className="container">
              <div className={styles.sectionHeader}>
                <div>
                  <h2 className={styles.sectionTitle}>{cat.name}</h2>
                  <p className={styles.sectionSub}>{t('curatedByAI')}</p>
                </div>
                <Link href={`/products?type=${encodeURIComponent(cat.slug)}`} className={styles.seeAll}>{tc('viewAll')} →</Link>
              </div>
              <div className={styles.catProductTrack}>
                {products.map((product: any, i: number) => {
                  const imageUrl = product.images?.[0];
                  const isValidImage = imageUrl && typeof imageUrl === 'string' && imageUrl.startsWith('http');
                  return (
                    <div key={product.id} className={styles.catProductCard} style={{ animationDelay: `${i * 0.05}s` }}>
                      <ProductCard
                        id={product.id}
                        title={product.title}
                        price={product.priceTRY ? `₺${Number(product.priceTRY).toLocaleString('tr-TR')}` : '—'}
                        priceUSD={product.priceUSD ? `$${Number(product.priceUSD).toFixed(0)}` : undefined}
                        storeName={product.store?.storeName || 'Golden Store'}
                        imageUrl={isValidImage ? imageUrl : ''}
                        slug={product.slug}
                        category={product.category}
                        isNew={i < 2}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        );
      })}

      {loading && (
        <section className={`${styles.section} ${styles.productSection}`}>
          <div className="container">
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>{t('featuredPieces')}</h2>
            </div>
            <div className={styles.catProductTrack}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className={styles.catProductCard}>
                  <div className={styles.skeletonCard}>
                    <div className={styles.skeletonImg} />
                    <div className={styles.skeletonContent}>
                      <div className={styles.skeletonLine} />
                      <div className={styles.skeletonLineShort} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== TRUST BADGES ===== */}
      <section className={styles.trustSection}>
        <div className="container">
          <div className={styles.trustGrid}>
            {TRUST_ITEMS.map(item => (
              <div key={item.key} className={styles.trustItem}>
                <div className={styles.trustIcon}>{item.icon}</div>
                <div>
                  <h4 className={styles.trustTitle}>{t(item.key)}</h4>
                  <p className={styles.trustDesc}>{t(item.key + 'Desc')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SELLER CTA ===== */}
      <section className={styles.ctaSection}>
        <div className="container">
          <div className={styles.ctaBox}>
            <div className={styles.ctaOrb} />
            <h2 className={styles.ctaTitle}>{t('sellOnGolden')}</h2>
            <p className={styles.ctaSub}>{t('sellOnGoldenSub')}</p>
            <Link href="/sellers/join" className={styles.ctaBtn} id="cta-become-seller">{t('startSelling')} ✦</Link>
          </div>
        </div>
      </section>

    </main>
  );
}