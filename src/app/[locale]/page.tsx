'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import ProductCard from '@/components/ProductCard';
import styles from './page.module.css';

const CATEGORY_ICONS: Record<string, string> = {
  rings: '💍', necklaces: '📿', bracelets: '✨', earrings: '🌟',
  pendants: '🔮', sets: '👑', kolye: '📿', bilezik: '✨',
  yüzük: '💍', küpe: '🌟', default: '✦'
};

const TRUST_ITEMS = [
  { icon: '🔒', key: 'securePayments' },
  { icon: '🌍', key: 'globalShipping' },
  { icon: '🤖', key: 'aiPowered' },
  { icon: '✦', key: 'authenticGold' },
];

function getCatIcon(name: string) {
  return CATEGORY_ICONS[name?.toLowerCase()] || CATEGORY_ICONS.default;
}

export default function Home() {
  const t = useTranslations('Home');
  const tc = useTranslations('Common');
  const tCat = useTranslations('Categories');

  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch dynamic categories from DB (same source as products/categories pages)
  useEffect(() => {
    fetch('/api/categories')
      .then(r => r.json())
      .then(d => setCategories(Array.isArray(d?.data) ? d.data.slice(0, 6) : []))
      .catch(console.error);
  }, []);

  useEffect(() => {
    fetch('/api/products?page=1&limit=16')
      .then(r => r.json())
      .then(data => {
        setProducts(Array.isArray(data?.data) ? data.data : []);
        setTotal(data?.pagination?.total ?? 0);
      })
      .catch(err => console.error('Product fetch error:', err))
      .finally(() => setLoading(false));
  }, []);

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

      {/* ===== PRODUCTS ===== */}
      <section className={`${styles.section} ${styles.productSection}`}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>{t('featuredPieces')}</h2>
              <p className={styles.sectionSub}>{t('curatedByAI')}</p>
            </div>
            <Link href="/products" className={styles.seeAll}>{tc('viewAll')} →</Link>
          </div>

          {loading ? (
            <div className={styles.productGrid}>
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className={styles.skeletonCard}>
                  <div className={styles.skeletonImg} />
                  <div className={styles.skeletonContent}>
                    <div className={styles.skeletonLine} />
                    <div className={styles.skeletonLineShort} />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className={styles.productGrid}>
              {products.map((product: any, i: number) => {
                const imageUrl = product.images?.[0];
                const isValidImage = imageUrl && typeof imageUrl === 'string' && imageUrl.startsWith('http');

                return (
                  <div key={product.id} style={{ animationDelay: `${i * 0.05}s` }} className={styles.productItem}>
                    <ProductCard
                      id={product.id}
                      title={product.title}
                      price={product.priceTRY ? `₺${Number(product.priceTRY).toLocaleString('tr-TR')}` : '—'}
                      priceUSD={product.priceUSD ? `$${Number(product.priceUSD).toFixed(0)}` : undefined}
                      storeName={product.store?.storeName || 'Golden Store'}
                      imageUrl={isValidImage ? imageUrl : ''}
                      slug={product.slug}
                      category={product.category}
                      isNew={i < 4}
                    />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>✦</div>
              <h3>{t('noProductsYet')}</h3>
              <p>{t('checkBackSoon')}</p>
            </div>
          )}
        </div>
      </section>

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