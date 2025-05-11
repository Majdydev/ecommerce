import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'th.bing.com',
      },
      {
        protocol: 'https', 
        hostname: 'www.android.com'
      }
    ],
  },
};

export default nextConfig;
