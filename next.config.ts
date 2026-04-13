import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin(
  './src/i18n/request.ts'
);

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 's3.asb.web.tr' },
      { protocol: 'https', hostname: 'api.asb.web.tr' },
    ]
  }
};

export default withNextIntl(nextConfig);
