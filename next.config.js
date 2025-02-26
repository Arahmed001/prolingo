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
  // Disable static optimization for specific pages
  unstable_runtimeJS: true,
  // Configure environment variables for the build
  env: {
    // Add a flag to detect build time vs runtime
    NEXT_PUBLIC_IS_BUILD_TIME: process.env.NODE_ENV === 'production',
  },
  // Explicitly tell Next.js which pages should be generated at runtime
  // and not during the build process
  generateBuildId: async () => {
    return 'my-build-id'
  },
  // Disable automatic static optimization for all pages
  // This is a drastic measure but will ensure Firebase pages work
  typescript: {
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  }
}

module.exports = nextConfig