/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: false,
  partialPrefetching: false,
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
    localPatterns: [
      {
        pathname: "/api/public/websites/**/assets/**",
        search: "?sectionId=memories",
      },
      {
        pathname: "/api/public/websites/**/assets/**",
        search: "?sectionId=final-photograph",
      },
      {
        pathname: "/api/websites/**/assets/**",
        search: "?sectionId=memories",
      },
      {
        pathname: "/api/websites/**/assets/**",
        search: "?sectionId=final-photograph",
      },
      {
        pathname: "/**",
        search: "",
      },
    ],
  },
};

export default nextConfig;
