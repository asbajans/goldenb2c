import { NextRequest, NextResponse } from 'next/server';

const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'https://api.asb.web.tr/api';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://goldencrafters.com';

const LOCALES = ['en', 'tr', 'it', 'ar'];

const STATIC_PAGES = [
  { path: '', changefreq: 'daily', priority: '1.0' },
  { path: '/products', changefreq: 'daily', priority: '0.9' },
  { path: '/categories', changefreq: 'weekly', priority: '0.8' },
  { path: '/about', changefreq: 'monthly', priority: '0.5' },
  { path: '/blog', changefreq: 'weekly', priority: '0.6' },
  { path: '/sellers', changefreq: 'weekly', priority: '0.7' },
  { path: '/cart', changefreq: 'monthly', priority: '0.3' },
];

export async function GET() {
  const urls: string[] = [];

  // Static pages in all locales
  for (const locale of LOCALES) {
    for (const page of STATIC_PAGES) {
      urls.push(`  <url>
    <loc>${SITE_URL}/${locale}${page.path}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`);
    }
  }

  try {
    // Fetch product slugs
    const res = await fetch(`${BACKEND}/products?page=1&limit=1000`);
    const data = await res.json();
    const products = data?.data || [];

    for (const locale of LOCALES) {
      for (const product of products) {
        urls.push(`  <url>
    <loc>${SITE_URL}/${locale}/p/${product.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`);
      }
    }
  } catch {}

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

  return new NextResponse(xml, {
    headers: { 'Content-Type': 'application/xml' },
  });
}