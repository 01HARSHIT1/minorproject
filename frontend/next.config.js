/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Output configuration for Vercel
  output: 'standalone',
  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  },
}

module.exports = nextConfig
