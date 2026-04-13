const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:777/api';

export async function fetchProducts(page = 1, limit = 24) {
  try {
    const res = await fetch(`${API_BASE}/marketplace/products?page=${page}&limit=${limit}`, {
      next: { revalidate: 60 } // Next.js ISR (Incremental Static Regeneration)
    });
    
    if (!res.ok) {
      throw new Error('Failed to fetch public products');
    }

    return await res.json();
  } catch (error) {
    console.error(error);
    return { data: [], pagination: { total: 0 } };
  }
}

export async function fetchProductDetails(slug: string) {
  try {
    const res = await fetch(`${API_BASE}/marketplace/products/${slug}`, {
      next: { revalidate: 60 }
    });
    
    if (!res.ok) {
      throw new Error('Product not found');
    }

    return await res.json();
  } catch (error) {
    console.error(error);
    return null;
  }
}
