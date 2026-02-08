import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Proxy API requests to Spring Boot backend */
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8080/api/:path*',
      },
    ];
  },
};

export default nextConfig;
