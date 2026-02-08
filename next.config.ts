import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
   images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pmsy56qp4f.ufs.sh",
        pathname: "/f/*",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**", // allow all Unsplash images
      },
    ],
  },
};

export default nextConfig;
