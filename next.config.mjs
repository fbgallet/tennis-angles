/** @type {import('next').NextConfig} */
const nextConfig = {
  sassOptions: {
    includePaths: ["./src"],
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
