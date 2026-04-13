// Server-side: talks directly to backend
// Client-side: uses Next.js API proxy to avoid any CORS/env issues
function getBase(path: string) {
  // On Vercel server: use backend directly
  if (typeof window === 'undefined') {
    const backend = process.env.NEXT_PUBLIC_API_URL || 'https://api.asb.web.tr/api';
    return `${backend}${path}`;
  }
  // On client (browser): use our Next.js API proxy
  return `/api${path}`;
}

export async function fetchProducts(page = 1, limit = 24) {
  try {
    const url = getBase(`/products?page=${page}&limit=${limit}`);
    const res = await fetch(url, { cache: 'no-store' });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error('[fetchProducts]', error);
    return { data: [], pagination: { total: 0, page: 1, limit: 24, pages: 0 } };
  }
}

export async function fetchProductDetails(slug: string) {
  try {
    // Always hit backend directly for product detail (SSR page)
    const backend = process.env.NEXT_PUBLIC_API_URL || 'https://api.asb.web.tr/api';
    const res = await fetch(`${backend}/marketplace/products/${slug}`, { cache: 'no-store' });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error('[fetchProductDetails]', error);
    return null;
  }
}
