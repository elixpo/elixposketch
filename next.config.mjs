/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  // Allow external CDN scripts
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3002/:path*',
      },
    ];
  },
};

export default nextConfig;
