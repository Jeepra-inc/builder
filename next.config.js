/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Ignore files that don't exist
    config.resolve.fallback = { fs: false };
    return config;
  },
  // Add this to fix the invariant error
  experimental: {
    missingSuspenseWithCSRBailout: false
  }
};

module.exports = nextConfig;