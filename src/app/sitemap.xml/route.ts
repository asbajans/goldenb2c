import { NextResponse } from 'next/server';
import { LOCALE_CATEGORIES, LOCALE_CITIES } from '@/data/cities';

const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'https://api.asb.web.tr/api';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://goldencrafters.com';

const LOCALES = ['en', 'tr', 'it', 'ar'];

const STATIC_PAGES: { path: string; freq: string; prio: string }[] = [
  { path: '', freq: 'daily', prio: '1.0' },
  { path: '/products', freq: 'daily', prio: '0.9' },
  { path: '/categories', freq: 'weekly', prio: '0.8' },
  { path: '/about', freq: 'monthly', prio: '0.5' },
  { path: '/blog', freq: 'weekly', prio: '0.6' },
  { path: '/sellers', freq: 'weekly', prio: '0.7' },
  { path: '/sellers/join', freq: 'monthly', prio: '0.5' },
];

export async function GET() {
  const urls: string[] = [];

  // 1. Static pages per locale
  for (const locale of LOCALES) {
    for (const page of STATIC_PAGES) {
      urls.push(`  <url><loc>${SITE_URL}/${locale}${page.path}</loc><changefreq>${page.freq}</changefreq><priority>${page.prio}</priority></url>`);
    }
  }

  // 2. City × category pages (localized per language)
  for (const locale of LOCALES) {
    const cities = LOCALE_CITIES[locale] || [];
    const cats = LOCALE_CATEGORIES[locale] || [];
    for (const city of cities) {
      urls.push(`  <url><loc>${SITE_URL}/${locale}/location/${city.slug}</loc><changefreq>weekly</changefreq><priority>0.6</priority></url>`);
      for (const cat of cats) {
        urls.push(`  <url><loc>${SITE_URL}/${locale}/location/${city.slug}?type=${encodeURIComponent(cat.name)}</loc><changefreq>weekly</changefreq><priority>0.5</priority></url>`);
      }
    }
  }

  // 3. Category pages
  for (const locale of LOCALES) {
    const cats = LOCALE_CATEGORIES[locale] || [];
    for (const cat of cats) {
      urls.push(`  <url><loc>${SITE_URL}/${locale}/categories?type=${cat.name}</loc><changefreq>daily</changefreq><priority>0.8</priority></url>`);
    }
  }

  // 4. Product pages from API
  try {
    const res = await fetch(`${BACKEND}/marketplace/products?page=1&limit=10000`, {
      signal: AbortSignal.timeout(10000)
    });
    if (res.ok) {
      const data = await res.json();
      const products: any[] = data?.data || data?.products || [];
      for (const locale of LOCALES) {
        for (const product of products) {
          const slug = product.slug || product.id;
          urls.push(`  <url><loc>${SITE_URL}/${locale}/p/${slug}</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>`);
          if (product.variants?.length) {
            for (const v of product.variants) {
              const vid = v.id || v.sku || v.name;
              if (vid) urls.push(`  <url><loc>${SITE_URL}/${locale}/p/${slug}/v/${vid}</loc><changefreq>weekly</changefreq><priority>0.7</priority></url>`);
            }
          }
        }
      }
    }
  } catch {}

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

  return new NextResponse(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}