/** @type {import("next").NextConfig} */
const nextConfig = {
  // Server Actions are enabled by default in Next.js 14+
  // Removed experimental.serverActions as it's no longer needed
  output: "standalone",
  experimental: {
    pwa: true,
  },
};

module.exports = nextConfig;
