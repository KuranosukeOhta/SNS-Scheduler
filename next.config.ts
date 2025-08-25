import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Supabase Edge Functionsのディレクトリをビルドから除外
  experimental: {
    excludeDefaultMomentLocales: false,
  },
  // ビルド時に特定のディレクトリを除外
  webpack: (config) => {
    // Supabase Edge Functionsのディレクトリをビルドから除外
    config.module.rules.push({
      test: /supabase\/functions\/.*\.ts$/,
      loader: 'ignore-loader'
    });
    
    return config;
  },
};

export default nextConfig;
