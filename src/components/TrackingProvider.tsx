'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { initPixels, trackPageView, trackViewContent, trackAddToCart, trackInitiateCheckout, trackPurchase, trackSearch } from '../utils/pixel';

export default function TrackingProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialized = useRef(false);
  const prevPath = useRef(pathname);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        // Admin panelinden gelen ID'lerde baş/son boşluk olabiliyor
        // (örn. " GTM-XXXX" iframe URL'ini bozup 404 veriyordu) — kırp.
        const clean = (v: unknown) => (typeof v === 'string' ? v.trim() : undefined) || undefined;
        const settings = {
          facebookPixelId: clean(data.facebook_pixel_id),
          tiktokPixelId: clean(data.tiktok_pixel_id),
          googleAnalyticsId: clean(data.google_analytics_id),
          googleGtmId: clean(data.google_gtm_id),
          googleAdsId: clean(data.google_ads_id),
          googleAdsConversionLabel: clean(data.google_ads_conversion_label),
        };
        initPixels(settings);
      })
      .catch(err => console.warn('Failed to load tracking settings:', err));
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      trackAddToCart(detail.productId, detail.quantity);
    };
    window.addEventListener('track:addToCart', handler);
    return () => window.removeEventListener('track:addToCart', handler);
  }, []);

  useEffect(() => {
    if (!initialized.current) return;
    if (pathname === prevPath.current) return;
    prevPath.current = pathname;

    trackPageView(pathname || '/');

    if (pathname?.includes('/p/')) {
      const slug = pathname.split('/p/')[1];
      if (slug) trackViewContent(slug);
    }

    if (pathname?.includes('/checkout')) {
      trackInitiateCheckout();
    }

    if (pathname?.includes('/order/')) {
      const orderId = pathname.split('/order/')[1];
      if (orderId) {
        try {
          const stored = sessionStorage.getItem('lastOrder');
          if (stored) {
            const order = JSON.parse(stored);
            trackPurchase(order.id || orderId, order.total || 0, order.currency || 'TRY');
            sessionStorage.removeItem('lastOrder');
          }
        } catch {}
      }
    }

    const searchTerm = searchParams?.get('search');
    if (searchTerm) {
      trackSearch(searchTerm);
    }
  }, [pathname, searchParams]);

  return <>{children}</>;
}