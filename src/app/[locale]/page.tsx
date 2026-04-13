import { fetchProducts } from '@/services/api';
import ProductCard from '@/components/ProductCard';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

const CATEGORIES = [
  { label: 'Rings', icon: '💍', slug: 'rings' },
  { label: 'Necklaces', icon: '📿', slug: 'necklaces' },
  { label: 'Bracelets', icon: '✨', slug: 'bracelets' },
  { label: 'Earrings', icon: '🌟', slug: 'earrings' },
  { label: 'Pendants', icon: '🔮', slug: 'pendants' },
  { label: 'Sets', icon: '👑', slug: 'sets' },
];

const TRUST_ITEMS = [
  { icon: '🔒', title: 'Secure Payments', desc: 'SSL encrypted checkout' },
  { icon: '🌍', title: 'Global Shipping', desc: 'Worldwide delivery' },
  { icon: '🤖', title: 'AI-Powered', desc: 'Smart content & discovery' },
  { icon: '✦', title: '100% Authentic', desc: 'Verified gold quality' },
];

export default async function Home() {
  const productsResponse = await fetchProducts(1, 16);
  const products: any[] = productsResponse?.data || [];

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
            Discover the World's<br />
            <span className={styles.heroGold}>Finest Gold Craft</span>
          </h1>
          <p className={styles.heroSub}>
            Independent jewelers. Authentic pieces. AI-powered discovery across 3 languages and global currencies.
          </p>
          <div className={styles.heroActions}>
            <a href="/products" className={styles.btnPrimary} id="hero-shop-now">Shop Now ✦</a>
            <a href="/sellers" className={styles.btnSecondary} id="hero-see-sellers">Meet Sellers</a>
          </div>
          <div className={styles.heroStats}>
            <div className={styles.stat}><strong>{products.length > 0 ? `${productsResponse?.pagination?.total ?? '—'}+` : '—'}</strong><span>Products</span></div>
            <div className={styles.statDivider} />
            <div className={styles.stat}><strong>150+</strong><span>Verified Sellers</span></div>
            <div className={styles.statDivider} />
            <div className={styles.stat}><strong>3</strong><span>Languages</span></div>
          </div>
        </div>
      </section>

      {/* ===== CATEGORIES ===== */}
      <section className={styles.section}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Shop by Category</h2>
            <a href="/categories" className={styles.seeAll}>See all →</a>
          </div>
          <div className={styles.categoryGrid}>
            {CATEGORIES.map(cat => (
              <a key={cat.slug} href={`/categories?type=${cat.slug}`} className={styles.catCard} id={`cat-${cat.slug}`}>
                <div className={styles.catIcon}>{cat.icon}</div>
                <span className={styles.catLabel}>{cat.label}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PRODUCTS ===== */}
      <section className={`${styles.section} ${styles.productSection}`}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Featured Pieces</h2>
              <p className={styles.sectionSub}>Curated by our AI from verified sellers</p>
            </div>
            <a href="/products" className={styles.seeAll}>View all →</a>
          </div>

          {products.length > 0 ? (
            <div className={styles.productGrid}>
              {products.map((product: any, i: number) => {
                const imageUrl = product.images && product.images.length > 0
                  ? product.images[0]
                  : undefined;

                const isValidImage = imageUrl &&
                  typeof imageUrl === 'string' &&
                  (imageUrl.startsWith('http') || imageUrl.startsWith('/'));

                return (
                  <div key={product.id} style={{ animationDelay: `${i * 0.06}s` }} className={styles.productItem}>
                    <ProductCard
                      id={product.id}
                      title={product.title}
                      price={product.priceTRY ? `₺${Number(product.priceTRY).toLocaleString('tr-TR')}` : '—'}
                      priceUSD={product.priceUSD ? `$${Number(product.priceUSD).toFixed(0)}` : undefined}
                      storeName={product.store?.storeName || 'Golden Store'}
                      imageUrl={isValidImage ? imageUrl : '/placeholder.jpg'}
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
              <h3>No products yet</h3>
              <p>New collections are being added. Check back soon.</p>
            </div>
          )}
        </div>
      </section>

      {/* ===== TRUST BADGES ===== */}
      <section className={styles.trustSection}>
        <div className="container">
          <div className={styles.trustGrid}>
            {TRUST_ITEMS.map(item => (
              <div key={item.title} className={styles.trustItem}>
                <div className={styles.trustIcon}>{item.icon}</div>
                <div>
                  <h4 className={styles.trustTitle}>{item.title}</h4>
                  <p className={styles.trustDesc}>{item.desc}</p>
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
            <h2 className={styles.ctaTitle}>Sell on Golden Crafters</h2>
            <p className={styles.ctaSub}>Join hundreds of independent jewelers. AI-powered listings, Etsy & Amazon sync, and instant multi-language storefronts.</p>
            <a href="/sellers/join" className={styles.ctaBtn} id="cta-become-seller">Start Selling Free ✦</a>
          </div>
        </div>
      </section>

    </main>
  );
}
