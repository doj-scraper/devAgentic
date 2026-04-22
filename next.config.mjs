/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ["ioredis", "ioredis-mock"],
  async headers() {
    if (process.env.NODE_ENV === "production") return [];
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store, must-revalidate" }
        ]
      }
    ];
  },
  allowedDevOrigins: ["*"]
};

export default nextConfig;
