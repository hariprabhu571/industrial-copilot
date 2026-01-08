/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3001/api/:path*',
      },
    ]
  },
  // Increase timeout for large file uploads
  experimental: {
    proxyTimeout: 300000, // 5 minutes
  },
  // Increase body size limit
  serverRuntimeConfig: {
    bodyParser: {
      sizeLimit: '50mb',
    },
  },
}

export default nextConfig