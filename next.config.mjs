/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,

  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '10004',
        pathname: '/wp-content/uploads/**',
      },
    ],
  },
};

export default nextConfig;