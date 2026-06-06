'use client';
import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import ProductCard from '@/components/ProductCard';
import Link from 'next/link';
import { LOCALE_CATEGORIES, LOCALE_CITIES } from '@/data/cities';

export default function LocationPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const citySlug = params?.city as string || '';
  const typeParam = searchParams?.get('type') || '';

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const cities = LOCALE_CITIES[locale] || LOCALE_CITIES.en;
  const categories = LOCALE_CATEGORIES[locale] || LOCALE_CATEGORIES.en;

  const cityInfo = cities.find(c => c.slug === citySlug);

  useEffect(() => {
    if (!citySlug) return;
    setLoading(true);
    const query = new URLSearchParams({ page: '1', limit: '24' });
    if (typeParam) query.set('category', typeParam);
    fetch(`/api/products?${query.toString()}`)
      .then(r => r.json())
      .then(data => {
        setProducts(Array.isArray(data?.data) ? data.data : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [citySlug, typeParam]);

  return (
    <div>
      <div style={{ maxWidth: 1320, margin: '0 auto', padding: '2rem 1.5rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: 4 }}>
          {cityInfo?.name || citySlug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
          {' '}Gold Jewelry
        </h1>
        <p style={{ color: '#666', marginBottom: '1.5rem' }}>
          {cityInfo ? `${cityInfo.country}. ` : ''}
          {typeParam || 'All categories'}
        </p>

        {/* Category filters */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
          <Link
            href={`/${locale}/location/${citySlug}`}
            style={{
              padding: '6px 16px', borderRadius: 20, border: '1px solid #ddd',
              background: !typeParam ? '#c9963c' : 'transparent',
              color: !typeParam ? '#fff' : '#333',
              fontSize: 14, textDecoration: 'none'
            }}
          >
            All
          </Link>
          {categories.map(cat => (
            <Link
              key={cat.slug}
              href={`/${locale}/location/${citySlug}?type=${encodeURIComponent(cat.slug)}`}
              style={{
                padding: '6px 16px', borderRadius: 20, border: '1px solid #ddd',
                background: typeParam === cat.slug ? '#c9963c' : 'transparent',
                color: typeParam === cat.slug ? '#fff' : '#333',
                fontSize: 14, textDecoration: 'none'
              }}
            >
              {cat.name}
            </Link>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#999' }}>Loading...</div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#999' }}>
            No products found
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
            {products.map((product: any) => (
              <ProductCard
                key={product.id}
                id={product.id}
                title={product.title}
                price={product.priceTRY ? `₺${Number(product.priceTRY).toLocaleString('tr-TR')}` : '—'}
                priceUSD={product.priceUSD ? `$${Number(product.priceUSD).toFixed(0)}` : undefined}
                storeName={product.store?.storeName || 'Golden Store'}
                imageUrl={product.images?.[0] || ''}
                slug={product.slug}
                category={product._categoryName || product.category}
                discountRate={product.discountRate}
                discountedPrice={product.discountRate ? `₺${Number(Number(product.priceTRY) * (1 - product.discountRate / 100)).toLocaleString('tr-TR')}` : undefined}
                discountedPriceUSD={product.discountRate ? `$${Number(Number(product.priceUSD || 0) * (1 - product.discountRate / 100)).toFixed(0)}` : undefined}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}