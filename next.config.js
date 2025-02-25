/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Make it extra clear we want the app directory structure
  distDir: '.next'
}

module.exports = nextConfig