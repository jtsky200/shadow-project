/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '**',
      },
    ],
    unoptimized: true, // Allow local images to be displayed without optimization
  },
  reactStrictMode: true, // Enable React strict mode for improved error handling
  
  // Minimize layout shifts and improve stability
  experimental: {
    scrollRestoration: true,
    optimizeCss: true,
    largePageDataBytes: 256 * 1000, // 256KB
  },
  
  // Allow us to safely access images, json files, and other assets
  webpack: (config, { dev }) => {
    config.module.rules.push({
      test: /\.(json|png|jpe?g|gif|svg)$/i,
      type: 'asset/resource',
    });
    
    // Disable webpack caching in development to prevent the caching errors
    if (dev) {
      config.cache = false;
      
      // Enable React fast refresh in development
      config.optimization = {
        ...config.optimization,
        moduleIds: 'deterministic',
        runtimeChunk: 'single',
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendors: false,
            defaultVendors: false,
          },
        },
      };
    }
    
    return config;
  },
};

export default nextConfig; 