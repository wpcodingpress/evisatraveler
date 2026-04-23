/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    remotePatterns: [],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.plugins = [...(config.plugins || []), new (require('@prisma/plugin-preview').PrismaPlugin)()];
    }
    return config;
  },
};

export default nextConfig;
