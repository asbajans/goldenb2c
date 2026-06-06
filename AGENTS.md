# Golden Crafters Market — Geliştirici Rehberi

## Proje Künyesi
- **Amaç:** goldencrafters.com — çok dilli, AI destekli B2C kuyumcu pazar yeri. Backend'e proxy olarak çalışan Next.js frontend.
- **Stack:** Next.js 16.2 + React 19 + TypeScript + next-intl (i18n)
- **Hosting:** Vercel
- **Backend:** `api.asb.web.tr` (golden-marketplace reposu)

## Repo Yapısı
```
market/
├── src/
│   ├── app/
│   │   ├── [locale]/               # Dil bazlı routing (en, tr, it, ar, es)
│   │   │   ├── layout.tsx          # Root layout (i18n + AuthProvider + CartProvider)
│   │   │   ├── page.tsx            # Anasayfa
│   │   │   ├── about/              # Hakkımızda (Coming Soon)
│   │   │   ├── account/            # Kullanıcı dashboard
│   │   │   │   ├── orders/         # Sipariş geçmişi
│   │   │   │   ├── addresses/      # Adres yönetimi
│   │   │   │   ├── settings/       # Profil ayarları
│   │   │   │   └── wishlist/       # Favoriler
│   │   │   ├── blog/               # Blog (Coming Soon)
│   │   │   ├── cart/               # Sepet
│   │   │   ├── categories/         # Kategori listeleme + filtreleme
│   │   │   ├── checkout/           # Ödeme (adres + kart/havale)
│   │   │   ├── login/              # Giriş
│   │   │   ├── register/           # Kayıt
│   │   │   ├── order/[id]/         # Sipariş başarı sayfası
│   │   │   ├── p/[slug]/           # Ürün detay + schema.org LD+JSON
│   │   │   ├── products/           # Ürün listeleme + filtreleme + arama
│   │   │   ├── sellers/            # Mağaza rehberi
│   │   │   │   ├── [storeSlug]/    # Mağaza detay
│   │   │   │   └── join/           # Satıcı ol (→ seller.asb.web.tr)
│   │   │   ├── location/[city]/    # Şehir bazlı ürün gezintisi
│   │   │   └── [...slug]/          # Coming Soon catch-all
│   │   ├── api/                    # Backend proxy route'ları
│   │   │   ├── auth/               # Giriş/kayıt proxy
│   │   │   ├── products/           # Ürün CRUD proxy
│   │   │   ├── cart/               # Sepet CRUD proxy
│   │   │   ├── cart/checkout/      # Sipariş oluşturma proxy
│   │   │   ├── categories/         # Kategori proxy
│   │   │   ├── stores/             # Mağaza proxy
│   │   │   ├── orders/customer/    # Müşteri siparişleri proxy
│   │   │   ├── addresses/          # Adres CRUD proxy
│   │   │   ├── wishlist/           # Favori CRUD proxy
│   │   │   ├── user/               # Kullanıcı profili proxy
│   │   │   ├── settings/           # Site ayarları proxy
│   │   │   └── feed/               # Google Merchant / Instagram feed proxy
│   │   ├── components/
│   │   │   ├── Header.tsx          # Navigasyon + arama + dil seçici + sepet
│   │   │   ├── Footer.tsx          # Alt bilgi + sosyal linkler + rozetler
│   │   │   ├── ProductCard.tsx     # Ürün kartı bileşeni
│   │   │   ├── Providers.tsx       # Context provider'ları birleştirir
│   │   │   └── TrackingProvider.tsx# Facebook/TikTok/Google pixel yöneticisi
│   │   ├── context/
│   │   │   ├── AuthContext.tsx      # JWT auth state (localStorage: gc_token)
│   │   │   └── CartContext.tsx      # Sepet state (localStorage)
│   │   ├── i18n/                   # next-intl yapılandırması
│   │   ├── data/cities.ts          # Lokalize şehir/kategori verisi
│   │   ├── services/api.ts         # API helper
│   │   └── utils/pixel.ts          # Pixel event helper'ları
├── messages/                       # Dil dosyaları
│   ├── en.json                     # İngilizce (tam)
│   ├── tr.json                     # Türkçe (tam)
│   ├── it.json                     # İtalyanca (tam)
│   ├── ar.json                     # Arapça (tam, RTL)
│   ├── es.json                     # İspanyolca (İngilizce kopyası — çevrilmemiş)
│   └── de.json                     # Almanca (sadece 1 key)
├── public/                         # Statik dosyalar
├── next.config.ts                  # Next.js + next-intl plugin
├── vercel.json                     # Vercel deploy config
├── Dockerfile                      # Docker multi-stage build
└── docker-compose.yml              # Local Docker (NEXT_PUBLIC_API_URL)
```

## Geliştirme Ortamı
```bash
cd market
npm install
npm run dev            # → http://localhost:3000
npm run build          # Production build
npm run lint           # ESLint
```

### Ortam Değişkenleri
| Değişken | Zorunlu | Varsayılan |
|----------|---------|-----------|
| `NEXT_PUBLIC_API_URL` | Evet | `https://api.asb.web.tr/api` |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Hayır | Google OAuth için |
| `NEXT_PUBLIC_SITE_URL` | Hayır | `https://goldencrafters.com` |

> `.env` dosyası `.gitignore`'dadır. Yeni değişken eklerken `.env.example` oluşturun.

## Kod Standartları

### Next.js
- Tüm sayfalar `'use client'` — data fetching `useEffect` + `fetch` ile yapılır
- API route'ları server-side proxy görevi görür, backend'e yönlendirir
- Yeni sayfa eklerken `src/app/[locale]/` altında locale-aware routing kullanın

### TypeScript
- `strict: true` — inline type tanımlamaları yerine interface/type export edin
- API yanıt tiplerini manuel tanımlayın (backend'le paylaşılan paket yok)

### İsimlendirme
- Dosyalar: `PascalCase.tsx` (component'ler), `camelCase.ts` (utils, context, services)
- CSS modülleri: `bileşenAdı.module.css`

### i18n
- Yeni bir metin eklerken tüm dil dosyalarına (`messages/*.json`) ekleyin
- Dil anahtarları namespace bazında gruplanır: `Common`, `Home`, `Products`, `Cart`, vs.
- Desteklenen diller: `['en', 'tr', 'it', 'ar', 'es']` (de yapılandırmada yok)

## Mimari Kararlar

### API Proxy Pattern
Tüm `/api/*` route'ları client'tan gelen istekleri backend'e (`NEXT_PUBLIC_API_URL`) yönlendirir. Bu sayede:
- CORS sorunu olmaz
- Hassas bilgiler client'a sızdırılmaz
- Backend URL'si gizli kalır

### Client-Side Fetching
Tüm sayfalar client-side render edilir. SEO için sitemap.xml dinamik olarak üretilir, JSON-LD schema.org markup ürün detay sayfasına eklenir.

### Auth
JWT token `localStorage`'da `gc_token` anahtarıyla saklanır. AuthContext uygulama başlangıcında token'ı okur ve kullanıcı bilgisini getirir.

### Sepet
Guest sepet: localStorage tabanlı. Authenticated sepet: backend API üzerinden. CartContext her iki durumu da yönetir.

## Önemli Uyarılar

1. **Backend ayrı repo**: `golden-marketplace/` reposundaki API'ye bağımlıdır. API değişikliklerinde frontend type'larını manuel güncelleyin.
2. **Çeviri eksikleri**: `es.json` = `en.json` kopyası (çevrilmemiş), `de.json` sadece 1 key içeriyor. Yeni dil eklerken routing.ts'deki `locales` dizisini de güncelleyin.
3. **Coming Soon sayfaları**: About, Blog ve [...slug] catch-all "Coming Soon" gösterir. Gerçek sayfalar eklendiğinde kaldırılmalı.
4. **Vercel deploy**: `vercel.json` üzerinden yapılır. Preview deployment'lar için env override'larını unutmayın.
5. **Console.log**: Production'da çalışmaz (Next.js derleme zamanında temizler). Yine de kullanmamaya özen gösterin.
6. **SEO için SSR düşünün**: Şu an tüm sayfalar client-side render ediliyor. Ürün/kategori sayfaları için SSR veya ISG düşünülebilir.
7. **Coming Soon sayfaları kaldırıldı**: `[...slug]` catch-all artık 404 sayfası. About, Privacy Policy, Terms of Service sayfaları dolduruldu. Blog sayfası iyileştirildi.
8. **Hata yönetimi**: `error.tsx` (Error Boundary) ve `not-found.tsx` eklendi. Tüm hatalar çevirilerle kullanıcıya gösteriliyor.

## Product & Category Sistemi (KRİTİK)

### Kategori Veri Akışı
1. `pages/api/categories/route.ts` → backend'deki `/api/marketplace/categories`'e proxy yapar (`MarketplaceController.getCategories`)
2. Backend, ürünleri `categoryId`'ye göre gruplar + legacy raw `category` alanına göre gruplar
3. Aynı kategori hem `categoryId` hem raw `category`'den gelirse, **büyük olan count** kullanılır
4. Kategori adları admin paneldeki `Category.translations` (JSONB) üzerinden backend tarafında çevrilir

### `_categoryName` Kullanımı
Backend'den gelen her ürün yanıtında `_categoryName` alanı bulunur. Bu alan:
- `categoryRef` varsa (product.categoryId → Category tablosu): Admin paneldeki çeviriyi kullanır
- Yoksa: `FALLBACK_CATEGORY_TRANSLATIONS` map'inden kategori ismini çözer

Frontend'de `product._categoryName || product.category` şeklinde kullanılır.

### Kategori Label Çözümleme (Frontend)
`products/page.tsx`'deki `getCategoryLabel` fonksiyonu, backend'in `/api/categories`'den döndürdüğü `categories` dizisini kullanır:
```typescript
const getCategoryLabel = (slug: string) => {
  const cat = categories.find(c => c.slug === slug);
  return cat?.name || slug;
};
```
Çeviriler backend'den geldiği için `useTranslations('Categories')` kullanılmaz.

### Kategori Filtreleme (URL'den)
`/products?type=slug` şeklinde çalışır. Backend'deki `getProducts` endpoint'i:
- `slug` admin kategorisiyle eşleşirse → BOTH `categoryId` AND raw `category` alanında ara
- Eşleşmezse → text-based ILIKE ara (tüm dil varyantlarıyla)

---

## Feed Sistemi (Proxy)

Market frontend, feed endpoint'lerini backend'e proxy'ler:

| Frontend Route | Backend Hedef | Açıklama |
|----------------|---------------|----------|
| `/api/feed/google.xml` | `api.asb.web.tr/api/feed/google.xml` | Google Shopping RSS XML |
| `/api/feed/facebook.json` | `api.asb.web.tr/api/feed/facebook.json` | Facebook Catalog JSON |
| `/api/feed/instagram.json` | `api.asb.web.tr/api/feed/instagram.json` | Instagram Catalog JSON |
| `/api/feed/share/:slug` | `api.asb.web.tr/api/feed/share/:slug` | OG meta data |

**Proxy dosyası:** `src/app/api/feed/[...slug]/route.ts` — catch-all route, tüm alt path'leri backend'e yönlendirir, Content-Type korunur.

---

## AI İçerik Yönetimi

### Frontend'de AI Kullanımı
AI özellikleri **satıcı panelinde** (seller.asb.web.tr) bulunur, market frontend'inde AI işlemi yoktur. Market sadece AI tarafından üretilmiş içerikleri **görüntüler**:

- **Çeviriler:** `Product.translations` JSONB alanında saklanır. Backend `applyTranslation()` ile dile göre uygun başlık/açıklamayı seçer.
- **`_categoryName`:** Admin panel kategorilerinin çevirileri backend tarafından eklenir.
- **ProductCard / Ürün Detay:** `trans.title || json.title` ve `trans.description || json.description` şeklinde çeviriler kullanılır.

### Desteklenen Diller
`['en', 'tr', 'it', 'ar', 'es']` — AI çeviri ve feed'lerde kullanılan diller. Yeni dil eklerken:
1. Backend: `aiService.ts` dil listesi
2. Frontend: `routing.ts` locales dizisi
3. Frontend: `messages/{lang}.json`

## AI Agent'lar İçin İpuçları
- Kod yazmadan önce mevcut pattern'leri okuyun (benzer bir sayfa/route nasıl yazılmış)
- `next-intl` API'si için `useTranslations()`, `Link`, `useRouter` kullanın (routing.ts'den import edin)
- Yeni API route'u eklerken backend endpoint pattern'ini takip edin
- CSS modülleri kullanın, global CSS'den kaçının
- Test eklerken framework mevcut değil — Jest + React Testing Library kurulması önerilir
- Kategori ile ilgili bir değişiklik yaparken: backend'in `getCategories` + `getProducts`'u, frontend'in `products/page.tsx`'deki `getCategoryLabel`'ı, ve `Footer`/`Header`'daki kategori linklerini birlikte düşünün
- `useTranslations('Categories')` yerine backend'in döndürdüğü `cat.name`'i kullanın — çeviriler backend'den gelir
