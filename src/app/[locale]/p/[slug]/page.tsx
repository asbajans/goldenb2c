import type { Metadata } from 'next';
import { ProductDetailClient } from './ProductDetailClient';

const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'https://api.asb.web.tr/api';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://goldencrafters.com';

const LOCALES = ['en', 'tr', 'it', 'ar', 'es'] as const;

async function fetchProduct(slug: string, locale: string) {
  try {
    const res = await fetch(
      `${BACKEND}/marketplace/products/${encodeURIComponent(slug)}?lang=${locale}`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (!data || data.error || !data.id) return null;
    return data;
  } catch {
    return null;
  }
}

type PageParams = { locale: string; slug: string };

// Dile özel <title> + meta description: backend ?lang= ile o dile çevrilmiş
// başlık/açıklamayı döndürür (Product.translations üzerinden).
export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const product = await fetchProduct(slug, locale);
  if (!product) return {};

  const title: string = product.title || slug;
  const rawDesc: string = product.description || '';
  const description = rawDesc.length > 160 ? rawDesc.slice(0, 157) + '...' : rawDesc;
  const encSlug = encodeURIComponent(slug);
  const url = `${SITE_URL}/${locale}/p/${encSlug}`;
  const languages: Record<string, string> = {};
  for (const l of LOCALES) languages[l] = `${SITE_URL}/${l}/p/${encSlug}`;

  const image = Array.isArray(product.images) && product.images[0] ? product.images[0] : undefined;

  return {
    title,
    description: description || undefined,
    alternates: { canonical: url, languages },
    openGraph: {
      title,
      description: description || undefined,
      url,
      type: 'website',
      siteName: 'Golden Crafters',
      ...(image ? { images: [{ url: image }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: description || undefined,
      ...(image ? { images: [image] } : {}),
    },
  };
}

export default function ProductDetailPage() {
  return <ProductDetailClient />;
}
