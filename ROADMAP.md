# Golden Crafters Market — Yol Haritası & Eksiklikler

## Öncelik: KRİTİK (Hemen)
- [ ] **Test altyapısı** — Hiçbir test framework'ü kurulu değil. Jest + React Testing Library eklenmeli. İlk adım: bileşen smoke test'leri ve API route test'leri.
- [x] **Eksik sayfalar tamamlansın** — Gizlilik Politikası, Kullanım Şartları oluşturuldu; Hakkımızda dolduruldu; Blog iyileştirildi.

## Öncelik: YÜKSEK (Bu Sprint)
- [x] **Çeviri eksikleri giderilsin** — `es.json` çevrildi, `de.json` tüm key'lerle genişletildi, `de` routing.ts'e eklendi.
- [x] **Proper 404 sayfası** — `[...slug]` catch-all 404 sayfasına dönüştürüldü, `not-found.tsx` eklendi, next-intl çevirileri ile çalışıyor.
- [x] **Error Boundary** — `error.tsx` eklendi (Next.js App Router convention), hata sayfası çevirilerle çalışıyor, reset + home button'ları var.

## Öncelik: ORTA (Gelecek Sprint)
- [ ] **SEO iyileştirmesi** — Tüm sayfalar client-side render. Ürün ve kategori sayfaları için SSR veya ISR düşünülmeli.
- [ ] **CSP Header** — Content Security Policy header'ı eklenmeli (güvenlik).
- [ ] **Meta tag'ler** — Her sayfa için dinamik meta description / OG tag'leri eklenmeli.
- [ ] **PWA desteği** — Service worker ile offline erişim ve bildirim desteği.
- [ ] **Erişilebilirlik** — Aria label'lar, klavye navigasyonu, renk kontrastı denetimi.
- [ ] **Lint hatalarını temizle** — 83 adet `@typescript-eslint/no-explicit-any` ve 32 `react-hooks` uyarısı giderilmeli.

## Öncelik: DÜŞÜK (Gerekirse)
- [ ] **TypeScript type paylaşımı** — Backend ile ortak type paketi oluşturulmalı (şu an manuel inline typing).
- [ ] **Rate limiting** — API proxy route'larına rate limit eklenmeli.
- [ ] **Dokümantasyon** — `.env.example` dosyası oluşturulmalı.

## Fazlalıklar (Temizlenecek)
- [x] `app/page.module.css` — Next.js default dosyası, silindi
- [x] `public/` altındaki Next.js varsayılan SVG'leri (`file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg`) — silindi
- [x] `CLAUDE.md` — Sadece `@AGENTS.md` yönlendirmesi yapıyordu, silindi
- [ ] `TASKS.md` — Tamamlanmış task geçmişi, artık güncel değil
- [ ] Docker + docker-compose — Vercel deploy ediliyor, Docker altyapısı kullanılmıyor olabilir
