/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep development assets separate from production builds.
  distDir: process.env.NODE_ENV === "development" ? ".next-dev" : ".next",
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
