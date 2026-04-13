import { getTranslations } from 'next-intl/server';
import { fetchProducts } from '@/services/api';
import ProductCard from '@/components/ProductCard';

export default async function Home() {
  const t = await getTranslations('Index');
  
  // Fetch initial market products
  const productsResponse = await fetchProducts(1, 12);
  const products = productsResponse?.data || [];

  return (
    <div className="container">
      <header className="hero">
        <h1>{t('title')}</h1>
        <p>Discover products from independent jewelers worldwide.</p>
      </header>
      
      <section style={{ padding: '4rem 0' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Featured Pieces</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
          {products.map((product: any) => (
            <ProductCard 
              key={product.id}
              id={product.id}
              title={product.title}
              price={`₺${product.priceTRY?.toLocaleString()}`}
              storeName={product.store?.storeName || 'Golden Store'}
              imageUrl={product.images && product.images.length > 0 ? product.images[0] : '/placeholder.jpg'}
              slug={product.slug}
            />
          ))}
          {products.length === 0 && (
            <p>No products available right now.</p>
          )}
        </div>
      </section>
    </div>
  );
}
