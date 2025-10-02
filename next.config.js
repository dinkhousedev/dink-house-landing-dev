/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'nextuipro.nyc3.cdn.digitaloceanspaces.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'wchxzbuuwssrnaxshseu.supabase.co',
        pathname: '/**',
      },
    ],
  },
}

module.exports = nextConfig
