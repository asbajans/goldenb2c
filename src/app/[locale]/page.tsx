'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import ProductCard from '@/components/ProductCard';
import styles from './page.module.css';

function getYouTubeId(url: string): string | null {
  if (!url) return null;
  const reg = /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const m = url.match(reg);
  return m ? m[1] : null;
}

const TRUST_ITEMS = [
  { icon: '🔒', key: 'securePayments' },
  { icon: '🌍', key: 'globalShipping' },
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

  const [sliders, setSliders] = useState<any[]>([]);
  const [activeSlide, setActiveSlide] = useState(0);
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [blogPosts, setBlogPosts] = useState<any[]>([]);

  // Fetch settings (sliders, featured products)
  useEffect(() => {
    fetch(`/api/settings`)
      .then(r => r.json())
      .then(data => {
        if (data.homepage_sliders) {
          try {
            const items = JSON.parse(data.homepage_sliders);
            setSliders(items.filter((s: any) => s.imageUrl || s.videoUrl));
          } catch { }
        }
        if (data.homepage_featured_products) {
          try {
            const ids = JSON.parse(data.homepage_featured_products);
            if (Array.isArray(ids) && ids.length > 0) {
              fetch(`/api/products?ids=${ids.join(',')}&lang=${locale}`)
                .then(r => r.json())
                .then(d => { if (Array.isArray(d?.data)) setFeaturedProducts(d.data); })
                .catch(() => {});
            }
          } catch { }
        }
        if (data.blog_posts) {
          try {
            const items = JSON.parse(data.blog_posts);
            setBlogPosts(items.filter((p: any) => p.isActive !== false));
          } catch { }
        }
      })
      .catch(() => {});
  }, [locale]);

  // Auto-slide
  useEffect(() => {
    if (sliders.length < 2) return;
    const timer = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % sliders.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [sliders.length]);

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

      {/* ===== HERO / SLIDER ===== */}
      {sliders.length > 0 ? (
        <section className={styles.sliderSection}>
          <div className={styles.sliderContainer}>
            {sliders.map((slide, idx) => {
              const vid = slide.videoUrl ? getYouTubeId(slide.videoUrl) : null;
              const isActive = idx === activeSlide;
              return (
                <div
                  key={slide.id || idx}
                  className={`${styles.slide} ${isActive ? styles.slideActive : ''}`}
                >
                  {vid ? (
                    <div className={styles.slideVideoWrap}>
                      <iframe
                        src={`https://www.youtube-nocookie.com/embed/${vid}?autoplay=${isActive ? 1 : 0}&mute=1&loop=1&playlist=${vid}&controls=0&modestbranding=1&rel=0&iv_load_policy=3&disablekb=1&fs=0&playsinline=1`}
                        className={styles.slideVideo}
                        allow="autoplay; encrypted-media"
                        title=""
                      />
                      <div className={styles.slideClickGuard} />
                      <div className={styles.slideOverlay} />
                    </div>
                  ) : slide.imageUrl ? (
                    <img src={slide.imageUrl} alt={slide.translations?.[locale]?.title || ''} className={styles.slideImage} />
                  ) : null}
                  <div className={styles.slideContent}>
                    <h2 className={styles.slideTitle}>{slide.translations?.[locale]?.title || ''}</h2>
                    {slide.translations?.[locale]?.subtitle && (
                      <p className={styles.slideSubtitle}>{slide.translations?.[locale]?.subtitle}</p>
                    )}
                    {slide.link && (
                      <Link href={slide.link} className={styles.slideBtn}>
                        {tc('viewAll')} ✦
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
            {sliders.length > 1 && (
              <div className={styles.sliderDots}>
                {sliders.map((_, idx) => (
                  <button
                    key={idx}
                    className={`${styles.sliderDot} ${idx === activeSlide ? styles.sliderDotActive : ''}`}
                    onClick={() => setActiveSlide(idx)}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      ) : (
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
      )}

      {/* ===== FEATURED PRODUCTS ===== */}
      {featuredProducts.length > 0 && (
        <section className={`${styles.section} ${styles.productSection}`}>
          <div className="container">
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>{t('featuredPieces')}</h2>
              <Link href="/products" className={styles.seeAll}>{tc('viewAll')} →</Link>
            </div>
            <div className={styles.productGrid}>
              {featuredProducts.map((product, i) => {
                const imageUrl = product.images?.[0];
                const isValidImage = imageUrl && typeof imageUrl === 'string' && imageUrl.startsWith('http');
                return (
                  <div key={product.id} className={styles.productItem} style={{ animationDelay: `${i * 0.05}s` }}>
                    <ProductCard
                      id={product.id}
                      title={product.title}
                      price={product.priceTRY ? `₺${Number(product.priceTRY).toLocaleString('tr-TR')}` : '—'}
                      priceUSD={product.priceUSD ? `$${Number(product.priceUSD).toFixed(0)}` : undefined}
                      storeName={product.store?.storeName || 'Golden Store'}
                      imageUrl={isValidImage ? imageUrl : ''}
                      slug={product.slug}
                      category={product._categoryName || product.category}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

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
                        category={product._categoryName || product.category}
                        isNew={i < 2}
                        discountRate={product.discountRate}
                        discountedPriceUSD={product.discountRate ? `$${Number(Number(product.priceUSD || 0) * (1 - product.discountRate / 100)).toFixed(0)}` : undefined}
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

      {/* ===== BLOG ===== */}
      <section className={styles.blogSection}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>{t('latestArticles')}</h2>
            <Link href="/blog" className={styles.seeAll}>{tc('viewAll')} →</Link>
          </div>
          <div className={styles.blogGrid}>
            {blogPosts.slice(0, 4).map((post) => {
              const tr = post.translations?.[locale] || post.translations?.en || {};
              return (
                <Link key={post.id} href={`/blog/${post.id}`} className={styles.blogCard}>
                  <div className={styles.blogImageWrap}>
                    {post.imageUrl ? (
                      <img src={post.imageUrl} alt={tr.title || ''} className={styles.blogImage} />
                    ) : (
                      <div className={styles.blogImagePlaceholder}>
                        <span>📝</span>
                      </div>
                    )}
                  </div>
                  <div className={styles.blogBody}>
                    <h3 className={styles.blogTitle}>{tr.title || ''}</h3>
                    {tr.excerpt && <p className={styles.blogExcerpt}>{tr.excerpt}</p>}
                    <span className={styles.blogLink}>Read More →</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

    </main>
  );
}