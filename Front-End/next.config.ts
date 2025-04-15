import type { NextConfig } from "next";

const backendHost = process.env.BACKEND_HOST || "localhost";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: backendHost,
        port: "5000",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
