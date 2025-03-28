/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true, // Stops TypeScript errors from failing the build
  },
  images: {
    domains: [
      'via.placeholder.com',
      'pixabay.com',
      'images.unsplash.com',
      'res.cloudinary.com',
      'i.imgur.com',
      'img.youtube.com'
    ],
  },
};

module.exports = nextConfig;
