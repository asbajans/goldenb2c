'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import styles from './product.module.css';

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);

  useEffect(() => {
    if (!slug) return;
    fetch(`https://api.asb.web.tr/api/marketplace/products/${slug}`)
      .then(r => r.json())
      .then(d => {
        setProduct(d);
        if (d?.variants?.length) setSelectedVariant(d.variants[0]);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug]);

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
      <a href="/products" className={styles.backBtn}>← Browse Products</a>
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

  return (
    <div className={styles.page}>
      <div className={styles.breadcrumb}>
        <a href="/">Home</a>
        <span>→</span>
        <a href="/products">Products</a>
        {product.category && <><span>→</span><a href={`/categories?type=${product.category}`}>{product.category}</a></>}
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
            <a href={`/categories?type=${product.category}`} className={styles.catPill}>
              {product.category}
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
            <button className={styles.btnBuy}>🛒 Add to Cart</button>
            <button className={styles.btnWish}>♡ Wishlist</button>
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
  );
}
