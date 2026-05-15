'use client';
import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import ProductCard from '@/components/ProductCard';
import Link from 'next/link';

export default function LocationPage() {
  const t = useTranslations('Common');
  const params = useParams();
  const searchParams = useSearchParams();
  const city = params?.city as string || '';
  const category = searchParams?.get('category') || '';
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let url = `/api/products?page=1&limit=24`;
    if (category) url += `&category=${encodeURIComponent(category)}`;
    fetch(url)
      .then(r => r.json())
      .then(data => {
        setProducts(Array.isArray(data?.data) ? data.data : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [category]);

  const cityName = city.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  return (
    <div>
      <div style={{ maxWidth: 1320, margin: '0 auto', padding: '2rem 1.5rem' }}>
        <h1>{cityName} - Gold Jewelry</h1>
        <p style={{ color: '#666', marginBottom: '2rem' }}>
          {category ? `${cityName} ${category} gold jewelry` : `Gold jewelry in ${cityName}`}
        </p>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
          {['rings', 'necklaces', 'bracelets', 'earrings', 'pendants', 'sets'].map(cat => (
            <Link
              key={cat}
              href={`/${(params?.locale as string) || 'en'}/location/${city}?category=${cat}`}
              style={{
                padding: '6px 16px', borderRadius: 20, border: '1px solid #ddd',
                background: category === cat ? '#c9963c' : 'transparent',
                color: category === cat ? '#fff' : '#333',
                fontSize: 14, textDecoration: 'none'
              }}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </Link>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>Loading...</div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#999' }}>
            No products found for {cityName}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
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