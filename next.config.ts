import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["i.pravatar.cc"], // aggiungi qui tutti i domini esterni che usi
      remotePatterns: [
      {
         protocol: 'http',
        hostname: '10.0.1.99',
        port: '9002',
        pathname: '/avatars/**',
      },
    ],
  },
};



module.exports = nextConfig;

export default nextConfig;
