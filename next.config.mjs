/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config, { dev }) {
    if (dev) {
      // Use in-memory webpack cache during development.
      // This prevents ENOENT errors caused by stale / missing .pack.gz files
      // that occur when switching between `next build` and `next dev`
      // (both previously wrote to the same .next/cache/webpack/ directory).
      config.cache = { type: 'memory' };
    }
    return config;
  },
};

export default nextConfig;
