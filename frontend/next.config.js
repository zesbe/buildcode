/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Remove static export for server-side rendering
  // output: 'export',
  // Image optimization works with server-side rendering
  images: {
    domains: [], // Add external image domains if needed
  },
  // Trailing slashes for better compatibility
  trailingSlash: true,
  // Ensure API routes are properly handled
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
}

module.exports = nextConfig