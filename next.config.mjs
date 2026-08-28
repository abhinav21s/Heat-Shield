/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  transpilePackages: ['leaflet'],
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
};

export default nextConfig;
