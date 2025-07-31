/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Disable to prevent hydration issues in production
  // Enable static export for GitHub Pages
  output: 'export',
  // Disable image optimization for static export
  images: {
    unoptimized: true,
  },
  // Trailing slashes for better compatibility
  trailingSlash: true,
  // Add experimental features for better production stability
  experimental: {
    serverComponentsExternalPackages: [],
    esmExternals: 'loose', // Fix for external modules
  },
  // Webpack configuration to handle SSR issues
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't resolve these modules on client side
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        dns: false,
        child_process: false,
        tls: false,
      };
    }
    
    // Handle React hydration issues
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks?.cacheGroups,
          default: false,
          vendors: false,
          // Separate chunk for React
          react: {
            name: 'react',
            chunks: 'all',
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
          },
        },
      },
    };
    
    return config;
  },
  // Headers removed for static export compatibility
  eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig