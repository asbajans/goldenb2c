const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'https://api.asb.web.tr').replace(/\/api$/, '');

export function proxiedImage(url: string | null | undefined): string {
  if (!url) return '/placeholder.jpg';
  if (url.startsWith('data:') || url.startsWith('/')) return url;
  return `${API_BASE}/api/image-proxy?url=${encodeURIComponent(url)}`;
}

export function isExternalUrl(url: string): boolean {
  return url.startsWith('http://') || url.startsWith('https://');
}
