'use client';
import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import ProductCard from '@/components/ProductCard';
import Link from 'next/link';
import { LOCALE_CATEGORIES, LOCALE_CITIES, CityInfo } from '@/data/cities';

export default function LocationPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const citySlug = params?.city as string || '';
  const categorySlug = searchParams?.get('category') || '';

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const cities = LOCALE_CITIES[locale] || LOCALE_CITIES.en;
  const categories = LOCALE_CATEGORIES[locale] || LOCALE_CATEGORIES.en;

  const cityInfo = cities.find(c => c.slug === citySlug);
  const currentCat = categories.find(c => c.slug === categorySlug);

  useEffect(() => {
    if (!citySlug) return;
    const catName = currentCat?.name || '';
    const params = new URLSearchParams({ page: '1', limit: '24' });
    if (catName) params.set('category', catName);
    fetch(`/api/products?${params.toString()}`)
      .then(r => r.json())
      .then(data => {
        setProducts(Array.isArray(data?.data) ? data.data : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [citySlug, categorySlug, currentCat?.name]);

  return (
    <div>
      <div style={{ maxWidth: 1320, margin: '0 auto', padding: '2rem 1.5rem' }}>
        <h1>
          {cityInfo?.name || citySlug.replace(/-/g, ' ')}
          {' '}Gold Jewelry
          {currentCat ? ` - ${currentCat.name}` : ''}
        </h1>
        <p style={{ color: '#666', marginBottom: '2rem', fontSize: '0.95rem' }}>
          {cityInfo?.name || citySlug} premium gold jewelry.
          {cityInfo ? ` ${cityInfo.country}.` : ''}
          {currentCat ? ` Shop our collection of ${currentCat.name.toLowerCase()}.` : ''}
        </p>

        {/* Category filters */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
          <Link
            href={`/${locale}/location/${citySlug}`}
            style={{
              padding: '6px 16px', borderRadius: 20, border: '1px solid #ddd',
              background: !categorySlug ? '#c9963c' : 'transparent',
              color: !categorySlug ? '#fff' : '#333',
              fontSize: 14, textDecoration: 'none', transition: 'all 0.2s'
            }}
          >
            All
          </Link>
          {categories.map(cat => (
            <Link
              key={cat.slug}
              href={`/${locale}/location/${citySlug}?category=${cat.slug}`}
              style={{
                padding: '6px 16px', borderRadius: 20, border: '1px solid #ddd',
                background: categorySlug === cat.slug ? '#c9963c' : 'transparent',
                color: categorySlug === cat.slug ? '#fff' : '#333',
                fontSize: 14, textDecoration: 'none', transition: 'all 0.2s'
              }}
            >
              {cat.name}
            </Link>
          ))}
        </div>

        {/* Products */}
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
                category={product.category}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}