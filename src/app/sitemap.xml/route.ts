import { NextRequest, NextResponse } from 'next/server';

const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'https://api.asb.web.tr/api';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://goldencrafters.com';

const LOCALES = ['en', 'tr', 'it', 'ar'];
const CITIES = [
  'istanbul', 'ankara', 'izmir', 'bursa', 'antalya', 'adana', 'konya', 'gaziantep',
  'mersin', 'kayseri', 'eskişehir', 'diyarbakir', 'samsun', 'denizli', 'trabzon',
  'erzurum', 'van', 'batman', 'malatya', 'elazig', 'manisa', 'kahramanmaras',
  'sivas', 'corlu', 'tekirdag', 'kocaeli', 'sakarya', 'aydin', 'mugla', 'hatay',
  'kirikkale', 'aksaray', 'igdir', 'karaman', 'kirsehir', 'duzce', 'bolu',
  'canakkale', 'edirne', 'kars', 'tokat', 'amasya', 'zonguldak', 'ordu',
  'giresun', 'rize', 'artvin', 'ardahan', 'agri', 'mus', 'bitlis', 'hakkari',
  'sirnak', 'siirt', 'mardin', 'sanliurfa', 'adiyaman', 'kilis', 'osmaniye',
  'nigde', 'nevsehir', 'yozgat', 'corum', 'kastamonu', 'sinop', 'bartin',
  'karabuk', 'karadeniz_eregli', 'alanya', 'fethiye', 'marmaris', 'bodrum',
  'kusadasi', 'catalca', 'silivri', 'beylikduzu', 'buyukcekmece', 'pendik',
  'kartal', 'maltepe', 'ataşehir', 'kadikoy', 'sisli', 'besiktas', 'uskudar'
];

const CATEGORIES = ['rings', 'necklaces', 'bracelets', 'earrings', 'pendants', 'sets'];

export async function GET() {
  const urls: string[] = [];

  // 1. STATIC PAGES (4 dil × 8 sayfa = 32)
  const staticPages = [
    { path: '', freq: 'daily', prio: '1.0' },
    { path: '/products', freq: 'daily', prio: '0.9' },
    { path: '/categories', freq: 'weekly', prio: '0.8' },
    { path: '/about', freq: 'monthly', prio: '0.5' },
    { path: '/blog', freq: 'weekly', prio: '0.6' },
    { path: '/sellers', freq: 'weekly', prio: '0.7' },
    { path: '/sellers/join', freq: 'monthly', prio: '0.5' },
  ];
  for (const locale of LOCALES) {
    for (const page of staticPages) {
      urls.push(`  <url><loc>${SITE_URL}/${locale}${page.path}</loc><changefreq>${page.freq}</changefreq><priority>${page.prio}</priority></url>`);
    }
  }

  // 2. CITY × CATEGORY PAGES (81 şehir × 6 kategori × 4 dil = ~1,944)
  for (const locale of LOCALES) {
    for (const city of CITIES) {
      urls.push(`  <url><loc>${SITE_URL}/${locale}/location/${city}</loc><changefreq>weekly</changefreq><priority>0.6</priority></url>`);
      for (const cat of CATEGORIES) {
        urls.push(`  <url><loc>${SITE_URL}/${locale}/location/${city}?category=${cat}</loc><changefreq>weekly</changefreq><priority>0.5</priority></url>`);
      }
    }
  }

  // 3. CATEGORY PAGES WITH FILTERS (6 kategori × 4 dil = 24)
  for (const locale of LOCALES) {
    for (const cat of CATEGORIES) {
      urls.push(`  <url><loc>${SITE_URL}/${locale}/categories?type=${cat}</loc><changefreq>daily</changefreq><priority>0.8</priority></url>`);
    }
  }

  // 4. PRODUCT PAGES (API'den çek)
  try {
    const res = await fetch(`${BACKEND}/marketplace/products?page=1&limit=10000`, {
      signal: AbortSignal.timeout(10000)
    });
    if (res.ok) {
      const data = await res.json();
      const products = data?.data || data?.products || [];
      for (const locale of LOCALES) {
        for (const product of products) {
          const slug = product.slug || product.id;
          // Ana ürün sayfası
          urls.push(`  <url><loc>${SITE_URL}/${locale}/p/${slug}</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>`);
          // Varyant sayfaları (varsa her varyant ayrı URL)
          if (product.variants && Array.isArray(product.variants)) {
            for (const variant of product.variants) {
              urls.push(`  <url><loc>${SITE_URL}/${locale}/p/${slug}/v/${variant.id || variant.sku || variant.name}</loc><changefreq>weekly</changefreq><priority>0.7</priority></url>`);
            }
          }
        }
      }
    }
  } catch (e) {
    console.error('Sitemap product fetch failed:', e);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

  return new NextResponse(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}