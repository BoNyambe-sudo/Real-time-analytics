import type { NextConfig } from "next"

const serverUrl = process.env.SERVER_URL || "http://localhost:4000"

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: "/socket.io/:path*", destination: `${serverUrl}/socket.io/:path*` },
    ]
  },
}

export default nextConfig