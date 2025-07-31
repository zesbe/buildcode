/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Disable to prevent hydration issues in production
  // Conditional static export - only for GitHub Pages build
  ...(process.env.GITHUB_ACTIONS && {
    output: 'export',
    images: {
      unoptimized: true,
    },
  }),
  // For Railway, use standard server-side rendering
  ...(!process.env.GITHUB_ACTIONS && {
    images: {
      domains: [], // Add external image domains if needed
    },
  }),
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
  // Headers for Railway deployment (not static export)
  ...(!process.env.GITHUB_ACTIONS && {
    async headers() {
      return [
        {
          // Apply these headers to all API routes
          source: '/api/:path*',
          headers: [
            { key: 'Access-Control-Allow-Credentials', value: 'true' },
            { key: 'Access-Control-Allow-Origin', value: '*' },
            { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
            { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
          ],
        },
      ];
    },
  }),
  eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig