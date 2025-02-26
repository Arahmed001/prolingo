/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Make it extra clear we want the app directory structure
  distDir: '.next',
  // Configure which pages should not be statically generated
  experimental: {
    // This ensures pages with dynamic data are rendered at runtime
    // and not during build time
    appDir: true,
  },
  // Exclude Firebase-dependent pages from static generation
  // This tells Next.js not to attempt static optimization for these routes
  excludeDefaultMomentLocales: true,
  // Configure environment variables for the build
  env: {
    // Add a flag to detect build time vs runtime
    NEXT_PUBLIC_IS_BUILD_TIME: process.env.NODE_ENV === 'production',
  }
}

module.exports = nextConfig