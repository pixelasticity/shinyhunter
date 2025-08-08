import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [new URL('https://raw.githubusercontent.com/PokeAPI/**')],
  },
  webpack: (config) => {
    if (config.resolve.alias) {
      delete config.resolve.alias.react;
      delete config.resolve.alias['react-dom'];
    }
    return config;
  },
};

export default nextConfig;
