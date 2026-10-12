import { NextResponse } from 'next/server';
import { LOCALE_CATEGORIES, LOCALE_CITIES } from '@/data/cities';

const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'https://api.asb.web.tr/api';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://goldencrafters.com';

const LOCALES = ['en', 'tr', 'it', 'ar', 'es'];

const STATIC_PAGES: { path: string; freq: string; prio: string }[] = [
  { path: '', freq: 'daily', prio: '1.0' },
  { path: '/products', freq: 'daily', prio: '0.9' },
  { path: '/categories', freq: 'weekly', prio: '0.8' },
  { path: '/about', freq: 'monthly', prio: '0.5' },
  { path: '/blog', freq: 'weekly', prio: '0.6' },
  { path: '/sellers', freq: 'weekly', prio: '0.7' },
  { path: '/sellers/join', freq: 'monthly', prio: '0.5' },
];

/** Her URL için 5 dil + x-default hreflang alternatifi */
function alternates(path: string): string {
  const links = LOCALES.map(
    l => `<xhtml:link rel="alternate" hreflang="${l}" href="${SITE_URL}/${l}${path}"/>`
  ).join('');
  return `${links}<xhtml:link rel="alternate" hreflang="x-default" href="${SITE_URL}/en${path}"/>`;
}

function urlEntry(loc: string, freq: string, prio: string, lastmod?: string, altPath?: string): string {
  const lm = lastmod ? `<lastmod>${lastmod}</lastmod>` : '';
  const alt = altPath !== undefined ? alternates(altPath) : '';
  return `  <url><loc>${loc}</loc>${lm}<changefreq>${freq}</changefreq><priority>${prio}</priority>${alt}</url>`;
}

function toDate(d: any): string | undefined {
  if (!d) return undefined;
  const t = new Date(d);
  return isNaN(t.getTime()) ? undefined : t.toISOString().split('T')[0];
}

export async function GET() {
  const urls: string[] = [];

  // 1. Static pages per locale (hreflang'li)
  for (const page of STATIC_PAGES) {
    for (const locale of LOCALES) {
      urls.push(urlEntry(`${SITE_URL}/${locale}${page.path}`, page.freq, page.prio, undefined, page.path));
    }
  }

  // 2. City × category pages (localized per language)
  for (const locale of LOCALES) {
    const cities = LOCALE_CITIES[locale] || [];
    const cats = LOCALE_CATEGORIES[locale] || [];
    for (const city of cities) {
      urls.push(`  <url><loc>${SITE_URL}/${locale}/location/${city.slug}</loc><changefreq>weekly</changefreq><priority>0.6</priority></url>`);
      for (const cat of cats) {
        urls.push(`  <url><loc>${SITE_URL}/${locale}/location/${city.slug}?type=${encodeURIComponent(cat.slug || cat.name)}</loc><changefreq>weekly</changefreq><priority>0.5</priority></url>`);
      }
    }
  }

  // 3. Category pages
  for (const locale of LOCALES) {
    const cats = LOCALE_CATEGORIES[locale] || [];
    for (const cat of cats) {
      urls.push(`  <url><loc>${SITE_URL}/${locale}/categories?type=${encodeURIComponent(cat.slug || cat.name)}</loc><changefreq>daily</changefreq><priority>0.8</priority></url>`);
    }
  }

  // 4. Product pages from API — sayfalı çekilir (tek istekteki limit
  // backend tarafından kırpılabilir), her dilde + lastmod + hreflang.
  // NOT: eski /p/{slug}/v/{id} varyant URL'leri route karşılığı olmadığı
  // (404) için sitemap'e yazılmaz — ölü link Google güvenini düşürür.
  try {
    const products: any[] = [];
    const PAGE_SIZE = 1000;
    for (let page = 1; page <= 50; page++) {
      const res = await fetch(`${BACKEND}/marketplace/products?page=${page}&limit=${PAGE_SIZE}`, {
        signal: AbortSignal.timeout(15000),
      });
      if (!res.ok) break;
      const data = await res.json();
      const items: any[] = data?.data || data?.products || [];
      products.push(...items);
      if (items.length < PAGE_SIZE) break;
    }
    for (const product of products) {
      const slug = product.slug || product.id;
      if (!slug) continue;
      // Slug'lar boşluk içerebiliyor (feed kaynaklı) — loc geçerli URL olmalı
      const encSlug = encodeURIComponent(slug);
      const lastmod = toDate(product.updatedAt);
      for (const locale of LOCALES) {
        urls.push(urlEntry(`${SITE_URL}/${locale}/p/${encSlug}`, 'weekly', '0.8', lastmod, `/p/${encSlug}`));
      }
    }
  } catch {}

  // 5. Blog posts from public settings (keeps articles discoverable)
  try {
    const res = await fetch(`${BACKEND}/settings/public`, {
      signal: AbortSignal.timeout(10000)
    });
    if (res.ok) {
      const data = await res.json();
      const posts = data?.blog_posts ? JSON.parse(data.blog_posts) : [];
      const active = (Array.isArray(posts) ? posts : [])
        .filter((p: any) => p && p.isActive !== false && p.id !== undefined)
        .slice(0, 500);
      for (const post of active) {
        for (const locale of LOCALES) {
          urls.push(urlEntry(`${SITE_URL}/${locale}/blog/${post.id}`, 'weekly', '0.6', toDate(post.updatedAt), `/blog/${post.id}`));
        }
      }
    }
  } catch {}

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
</urlset>`;

  return new NextResponse(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}
