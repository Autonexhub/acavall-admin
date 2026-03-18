/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  // Don't use static export - Hostinger will need to run Node.js or we create a custom deployment
  trailingSlash: true,
};

module.exports = nextConfig;
