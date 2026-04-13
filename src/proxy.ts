import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Match all paths except static assets and API routes
  matcher: [
    // Match root
    '/',
    // Match locale-prefixed paths
    '/(tr|en|de)/:path*',
    // Match paths without locale prefix so middleware can redirect them
    '/((?!_next|_vercel|api|.*\\..*).*)' 
  ]
};
