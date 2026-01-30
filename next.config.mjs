/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',

  // 🔑 REQUIRED for folder-based URLs
  trailingSlash: true,

  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
