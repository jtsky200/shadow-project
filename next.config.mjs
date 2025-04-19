/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
    // Adding this to avoid issues with local images
    unoptimized: true,
  },
  experimental: {
    scrollRestoration: true,
    optimizeCss: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.DEEPSEEK_API_URL || 'http://localhost:3001/:path*'
      }
    ]
  },
  webpack: (config, { dev, isServer }) => {
    // Handle various file types
    config.module.rules.push({
      test: /\.(pdf|txt|csv|doc|docx|xls|xlsx)$/,
      type: 'asset/resource',
    });
    
    // Disable cache in development to avoid errors
    if (dev) {
      config.cache = false;
    }
    
    // Enable React Fast Refresh in development
    if (dev && !isServer) {
      config.optimization.runtimeChunk = 'single';
    }
    
    return config;
  },
};

export default nextConfig; 