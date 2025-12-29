import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
        pathname: "/**",
      },
    ],
    domains: ["lh3.googleusercontent.com"],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb", // Increase the body size limit to 5MB
    },
  },
};

export default nextConfig;
