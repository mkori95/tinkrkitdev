/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config, { dev }) {
    if (dev) {
      // Use in-memory webpack cache during development.
      // Prevents ENOENT errors when switching between `next build` and `next dev`.
      config.cache = { type: 'memory' };
    }
    return config;
  },

  async headers() {
    return [
      {
        // Matches /favicon.ico exactly
        source: '/favicon.ico',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
        ],
      },
      {
        // Matches /tinkrkit-icon.png (the actual icon file that exists)
        source: '/tinkrkit-icon.png',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
        ],
      },
    ];
  },
};

export default nextConfig;
