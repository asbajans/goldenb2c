type PixelSettings = {
  facebookPixelId?: string;
  tiktokPixelId?: string;
  googleAnalyticsId?: string;
  googleGtmId?: string;
};

declare const fbq: any;
declare const ttq: any;
declare const gtag: any;

let initialized = false;
let settings: PixelSettings = {};

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

export async function initPixels(pixelSettings: PixelSettings) {
  if (initialized) return;
  settings = pixelSettings;
  initialized = true;

  const promises: Promise<void>[] = [];

  if (settings.facebookPixelId) {
    promises.push(initFacebookPixel(settings.facebookPixelId));
  }
  if (settings.tiktokPixelId) {
    promises.push(initTikTokPixel(settings.tiktokPixelId));
  }
  if (settings.googleGtmId) {
    promises.push(initGoogleTagManager(settings.googleGtmId));
  }
  if (settings.googleAnalyticsId) {
    promises.push(initGoogleAnalytics(settings.googleAnalyticsId));
  }

  await Promise.all(promises);
}

function initFacebookPixel(pixelId: string): Promise<void> {
  return new Promise((resolve) => {
    const existing = document.querySelector(`script[data-fb-pixel]`);
    if (existing) { resolve(); return; }

    const script = document.createElement('script');
    script.setAttribute('data-fb-pixel', '');
    script.innerHTML = `
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '${pixelId}');
      fbq('track', 'PageView');
    `;
    document.head.appendChild(script);
    resolve();
  });
}

function initTikTokPixel(pixelId: string): Promise<void> {
  return new Promise((resolve) => {
    const existing = document.querySelector(`script[data-tt-pixel]`);
    if (existing) { resolve(); return; }

    const script = document.createElement('script');
    script.setAttribute('data-tt-pixel', '');
    script.innerHTML = `
      !function (w, d, t) {
        w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=[
          "page","track","identify","instances","debug","on","off","once","ready",
          "alias","group","enableCookie","disableCookie"
        ];ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(
          Array.prototype.slice.call(arguments,0)))}};
        for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);
        ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++
          )ttq.setAndDefer(e,ttq.methods[n]);return e};
        ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";
        ttq._i=ttq._i||{};ttq._i[e]=[];ttq._i[e]._u=i;ttq._t=ttq._t||{};ttq._t[e]=+new Date;
        ttq._o=ttq._o||{};ttq._o[e]=n||{};var o=document.createElement("script");
        o.type="text/javascript";o.async=true;o.src=i+"?sdkid="+e+"&lib="+t;
        var a=document.getElementsByTagName("script")[0];
        a.parentNode.insertBefore(o,a)};
        ttq.load('${pixelId}');
        ttq.page();
      }(window, document, 'ttq');
    `;
    document.head.appendChild(script);
    resolve();
  });
}

function initGoogleTagManager(gtmId: string): Promise<void> {
  return new Promise((resolve) => {
    const existing = document.querySelector(`script[data-gtm]`);
    if (existing) { resolve(); return; }

    const script = document.createElement('script');
    script.setAttribute('data-gtm', '');
    script.innerHTML = `
      (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
      'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
      })(window,document,'script','dataLayer','${gtmId}');
    `;
    document.head.appendChild(script);

    const noscript = document.createElement('noscript');
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.googletagmanager.com/ns.html?id=${gtmId}`;
    iframe.height = '0';
    iframe.width = '0';
    iframe.style.display = 'none';
    iframe.style.visibility = 'hidden';
    noscript.appendChild(iframe);
    document.body.prepend(noscript);

    resolve();
  });
}

function initGoogleAnalytics(gaId: string): Promise<void> {
  return new Promise((resolve) => {
    const existing = document.querySelector(`script[data-ga]`);
    if (existing) { resolve(); return; }

    const script = document.createElement('script');
    script.setAttribute('data-ga', '');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
    document.head.appendChild(script);

    const initScript = document.createElement('script');
    initScript.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${gaId}');
    `;
    document.head.appendChild(initScript);
    resolve();
  });
}

export function trackPageView(path: string, title?: string) {
  if (settings.facebookPixelId && typeof fbq !== 'undefined') {
    fbq('track', 'PageView');
  }
  if (settings.tiktokPixelId && typeof ttq !== 'undefined') {
    ttq.page();
  }
  if (settings.googleAnalyticsId && typeof gtag !== 'undefined') {
    gtag('event', 'page_view', { page_path: path, page_title: title });
  }
}

export function trackViewContent(contentId: string, contentType: string = 'product') {
  if (settings.facebookPixelId && typeof fbq !== 'undefined') {
    fbq('track', 'ViewContent', { content_ids: [contentId], content_type: contentType });
  }
  if (settings.tiktokPixelId && typeof ttq !== 'undefined') {
    ttq.track('ViewContent', { content_id: contentId, content_type: contentType });
  }
  if (settings.googleAnalyticsId && typeof gtag !== 'undefined') {
    gtag('event', 'view_item', { items: [{ id: contentId }] });
  }
}

export function trackAddToCart(productId: string, quantity: number = 1) {
  if (settings.facebookPixelId && typeof fbq !== 'undefined') {
    fbq('track', 'AddToCart', { content_ids: [productId], content_type: 'product', quantity });
  }
  if (settings.tiktokPixelId && typeof ttq !== 'undefined') {
    ttq.track('AddToCart', { content_id: productId, quantity });
  }
  if (settings.googleAnalyticsId && typeof gtag !== 'undefined') {
    gtag('event', 'add_to_cart', { items: [{ id: productId, quantity }] });
  }
}

export function trackInitiateCheckout() {
  if (settings.facebookPixelId && typeof fbq !== 'undefined') {
    fbq('track', 'InitiateCheckout');
  }
  if (settings.tiktokPixelId && typeof ttq !== 'undefined') {
    ttq.track('InitiateCheckout');
  }
  if (settings.googleAnalyticsId && typeof gtag !== 'undefined') {
    gtag('event', 'begin_checkout');
  }
}

export function trackPurchase(orderId: string, value: number, currency: string = 'TRY') {
  if (settings.facebookPixelId && typeof fbq !== 'undefined') {
    fbq('track', 'Purchase', { content_ids: [orderId], value, currency });
  }
  if (settings.tiktokPixelId && typeof ttq !== 'undefined') {
    ttq.track('CompletePayment', { content_id: orderId, value, currency });
  }
  if (settings.googleAnalyticsId && typeof gtag !== 'undefined') {
    gtag('event', 'purchase', { transaction_id: orderId, value, currency });
  }
}

export function trackSearch(searchTerm: string) {
  if (settings.facebookPixelId && typeof fbq !== 'undefined') {
    fbq('track', 'Search', { search_string: searchTerm });
  }
  if (settings.tiktokPixelId && typeof ttq !== 'undefined') {
    ttq.track('Search', { keyword: searchTerm });
  }
  if (settings.googleAnalyticsId && typeof gtag !== 'undefined') {
    gtag('event', 'search', { search_term: searchTerm });
  }
}