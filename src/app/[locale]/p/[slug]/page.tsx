'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import styles from './product.module.css';

const SITE_URL = 'https://asb.web.tr';

function generateProductSchema(product: any, price: number, priceUSD: number | null) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    image: product.images?.[0] || `${SITE_URL}/images/placeholder.jpg`,
    sku: product.sku,
    brand: { '@type': 'Brand', name: product.store?.storeName || 'Golden Crafters' },
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}/p/${product.slug}`,
      priceCurrency: 'TRY',
      price: price,
      priceValidUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      availability: product.quantity > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: { '@type': 'Organization', name: product.store?.storeName || 'Golden Crafters' }
    },
    aggregateRating: product.store?.rating ? {
      '@type': 'AggregateRating',
      ratingValue: product.store.rating,
      reviewCount: product.store.totalProducts || 0
    } : undefined
  };
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const locale = params?.locale as string || 'en';
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [adding, setAdding] = useState(false);
  const { addItem } = useCart();
  const { user } = useAuth();
  const [inWishlist, setInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/products/${slug}?lang=${locale}`)
      .then(r => r.json())
      .then(d => {
        setProduct(d);
        if (d?.variants?.length) setSelectedVariant(d.variants[0]);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug, locale]);

  useEffect(() => {
    if (!user || !product?.id) return;
    async function checkWishlist() {
      try {
        const token = localStorage.getItem('gc_token');
        const res = await fetch('/api/wishlist', { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (data.wishlist?.some((item: any) => item.productId === product.id)) {
          setInWishlist(true);
        }
      } catch (e) { console.error(e); }
    }
    checkWishlist();
  }, [user, product?.id]);

  if (loading) return (
    <div className={styles.loading}>
      <div className={styles.loadingSpinner} />
      <p>Loading product...</p>
    </div>
  );

  if (!product || product.error) return (
    <div className={styles.notFound}>
      <div className={styles.notFoundIcon}>✦</div>
      <h1>Product Not Found</h1>
      <a href={`/${locale}/products`} className={styles.backBtn}>← Browse Products</a>
    </div>
  );

  const images: string[] = Array.isArray(product.images) ? product.images : [];
  const price = selectedVariant?.priceTRY || product.priceTRY;
  const priceUSD = selectedVariant?.priceUSD || product.priceUSD;
  const variants: any[] = product.variants || [];

  // Group variant attributes for display
  const variantKeys: string[] = variants.length
    ? Object.keys(variants[0].attributes || {})
    : [];

  const productSchema = generateProductSchema(product, Number(price) || 0, priceUSD ? Number(priceUSD) : null);

  async function toggleWishlist() {
    if (!user) {
      router.push('/login');
      return;
    }
    setWishlistLoading(true);
    try {
      const token = localStorage.getItem('gc_token');
      if (inWishlist) {
        await fetch('/api/wishlist', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ productId: product.id })
        });
        setInWishlist(false);
      } else {
        await fetch('/api/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ productId: product.id })
        });
        setInWishlist(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setWishlistLoading(false);
    }
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <div className={styles.page}>
      <div className={styles.breadcrumb}>
        <a href={`/${locale}`}>Home</a>
        <span>→</span>
        <a href={`/${locale}/products`}>Products</a>
        {product.category && <><span>→</span><a href={`/${locale}/categories?type=${encodeURIComponent(product.category)}`}>{product._categoryName || product.category}</a></>}
        <span>→</span>
        <span>{product.title}</span>
      </div>

      <div className={styles.layout}>
        {/* ── GALLERY ── */}
        <div className={styles.gallery}>
          <div className={styles.mainImage}>
            {images[activeImage] ? (
              <Image
                src={images[activeImage]}
                alt={product.title}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                style={{ objectFit: 'cover' }}
                className={styles.mainImg}
                priority
              />
            ) : (
              <div className={styles.imagePlaceholder}>
                <span>✦</span>
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className={styles.thumbs}>
              {images.map((img, i) => (
                <button
                  key={i}
                  className={`${styles.thumb} ${i === activeImage ? styles.thumbActive : ''}`}
                  onClick={() => setActiveImage(i)}
                >
                  <Image src={img} alt={`${product.title} ${i + 1}`} fill style={{ objectFit: 'cover' }} sizes="80px" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── INFO ── */}
        <div className={styles.info}>
          {product.category && (
            <a href={`/${locale}/categories?type=${encodeURIComponent(product.category)}`} className={styles.catPill}>
              {product._categoryName || product.category}
            </a>
          )}
          <h1 className={styles.title}>{product.title}</h1>

          {/* Store badge */}
          {product.store && (
            <a href={`/sellers/${product.store.storeSlug}`} className={styles.storeBadge}>
              {product.store.logo && (
                <Image src={product.store.logo} alt={product.store.storeName} width={28} height={28} className={styles.storeLogo} />
              )}
              <span>by <strong>{product.store.storeName}</strong></span>
              {product.store.rating > 0 && (
                <span className={styles.storeRating}>⭐ {Number(product.store.rating).toFixed(1)}</span>
              )}
            </a>
          )}

          {/* Price */}
          <div className={styles.priceBlock}>
            {price && (
              <div className={styles.priceMain}>₺{Number(price).toLocaleString('tr-TR')}</div>
            )}
            {priceUSD && (
              <div className={styles.priceSub}>${Number(priceUSD).toFixed(2)} USD</div>
            )}
          </div>

          {/* Variants */}
          {variants.length > 0 && variantKeys.map(key => {
            const uniqueVals = [...new Set(variants.map((v: any) => v.attributes[key]))];
            return (
              <div key={key} className={styles.variantGroup}>
                <h4 className={styles.variantLabel}>{key}</h4>
                <div className={styles.variantBtns}>
                  {uniqueVals.map(val => {
                    const variant = variants.find((v: any) => v.attributes[key] === val);
                    const isSelected = selectedVariant?.attributes?.[key] === val;
                    return (
                      <button
                        key={String(val)}
                        className={`${styles.variantBtn} ${isSelected ? styles.variantBtnActive : ''}`}
                        onClick={() => setSelectedVariant(variant)}
                      >
                        {String(val)}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* CTA */}
          <div className={styles.actions}>
            <button 
              className={styles.btnBuy} 
              disabled={adding}
              onClick={async () => {
                if (!product) return;
                setAdding(true);
                try {
                  await addItem({
                    productId: product.id,
                    variantId: selectedVariant?.id,
                    title: product.title,
                    sku: selectedVariant?.sku || product.sku || '',
                    quantity: 1,
                    unitPrice: parseFloat(price) || 0,
                    totalPrice: parseFloat(price) || 0,
                    image: images[0] || '',
                    storeName: product.storeName || product.store?.storeName || '',
                    storeSlug: product.storeSlug || product.store?.storeSlug || '',
                    variantName: selectedVariant?.sku,
                    attributes: selectedVariant?.attributes || {}
                  });
                  router.push('/cart');
                } catch (e) {
                  console.error(e);
                } finally {
                  setAdding(false);
                }
              }}
            >
              {adding ? 'Adding...' : '🛒 Add to Cart'}
            </button>
            <button 
              className={`${styles.btnWish} ${inWishlist ? styles.btnWishActive : ''}`}
              onClick={toggleWishlist}
              disabled={wishlistLoading}
            >
              {wishlistLoading ? '...' : inWishlist ? '♥ Wishlisted' : '♡ Wishlist'}
            </button>
          </div>

          {/* ── SHARE ── */}
          <div className={styles.share}>
            <span className={styles.shareLabel}>Share</span>
            <button className={styles.shareBtn} onClick={() => {
              const text = encodeURIComponent(`${product.title} - ${SITE_URL}/${locale}/p/${product.slug}`);
              window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener,noreferrer');
            }} aria-label="Share on WhatsApp">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            </button>
            <button className={styles.shareBtn} onClick={() => {
              const url = encodeURIComponent(`${SITE_URL}/${locale}/p/${product.slug}`);
              const image = encodeURIComponent(images[0] || '');
              const desc = encodeURIComponent(product.title);
              window.open(`https://pinterest.com/pin/create/button/?url=${url}&media=${image}&description=${desc}`, '_blank', 'noopener,noreferrer');
            }} aria-label="Share on Pinterest">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146 1.124.347 2.317.535 3.554.535 6.607 0 11.972-5.365 11.972-11.986C23.971 5.367 18.607 0 12.017 0z"/></svg>
            </button>
            <button className={styles.shareBtn} onClick={() => {
              if (navigator.share) {
                navigator.share({ title: product.title, url: `${SITE_URL}/${locale}/p/${product.slug}` });
              } else {
                navigator.clipboard?.writeText(`${SITE_URL}/${locale}/p/${product.slug}`);
              }
            }} aria-label="Share on Instagram">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
            </button>
            <button className={styles.shareBtn} onClick={() => {
              if (navigator.share) {
                navigator.share({ title: product.title, url: `${SITE_URL}/${locale}/p/${product.slug}` });
              } else {
                navigator.clipboard?.writeText(`${SITE_URL}/${locale}/p/${product.slug}`);
              }
            }} aria-label="Share on TikTok">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
            </button>
          </div>

          {/* Details */}
          {product.description && (
            <div className={styles.descBlock}>
              <h3>Description</h3>
              <p>{product.description}</p>
            </div>
          )}

          {/* Specs */}
          <div className={styles.specs}>
            {product.gramWeight && (
              <div className={styles.spec}><span>Weight</span><strong>{product.gramWeight}g</strong></div>
            )}
            {product.milyem && (
              <div className={styles.spec}><span>Purity</span><strong>{product.milyem}‰</strong></div>
            )}
            {product.sku && (
              <div className={styles.spec}><span>SKU</span><strong>{product.sku}</strong></div>
            )}
          </div>

          {/* Trust */}
          <div className={styles.trust}>
            <span>🔒 Secure Checkout</span>
            <span>🌍 Global Shipping</span>
            <span>✦ Authentic Gold</span>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
