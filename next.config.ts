import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // ビルド時に特定のディレクトリを除外
  webpack: (config) => {
    // Supabase Edge Functionsのディレクトリをビルドから除外
    config.externals = config.externals || [];
    config.externals.push({
      'supabase/functions': 'commonjs supabase/functions'
    });
    
    return config;
  },
  // ビルド時に特定のファイルを除外
  experimental: {
    excludeDefaultMomentLocales: true,
  },
};

export default nextConfig;
