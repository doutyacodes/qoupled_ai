/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
          {
            protocol: 'https',
            hostname: 'wowfy.in',
            pathname: "/testusr/images/**", // Match all images in this folder
          },
        ],
        unoptimized: true, // Disable Next.js optimization
      },
};


export default nextConfig;
