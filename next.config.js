/**
 * next.config.js
 * --------------
 * Centralized Next.js configuration. The default export is intentionally light
 * right now so we can bolt on redirects, rewrites, or experimental flags later
 * without touching multiple files.
 */

/** /** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      net: false,
      tls: false,
      fs: false,
    };
    return config;
  },
  turbopack:{}
};

module.exports = nextConfig;

