import type { NextConfig } from 'next';

// Bundle analyzer configuration - only load if available
let withBundleAnalyzer = (config: NextConfig) => config;
try {
  if (process.env.ANALYZE === 'true') {
    withBundleAnalyzer = require('@next/bundle-analyzer')({
      enabled: true,
    });
  }
} catch (error) {
  // Bundle analyzer not available, use default config
  console.log('Bundle analyzer not available, skipping...');
}

// 🚨 SECURITY: Production builds MUST enforce code quality checks
// NEVER bypass TypeScript or ESLint validation in production
const nextConfig: NextConfig = {
  // Essential experimental features for performance
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-avatar',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-select',
      '@radix-ui/react-popover',
      '@radix-ui/react-checkbox',
      '@radix-ui/react-label',
      '@radix-ui/react-slot',
    ],
  },

  // Essential compiler options
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Performance optimizations
  poweredByHeader: false,
  compress: true,

  // Enhanced webpack configuration for performance
  webpack: (config, { dev, isServer }) => {
    // Optimize chunk splitting for production
    if (!isServer && !dev) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          // Vendor chunk for all node_modules
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
            enforce: true,
          },
          // Separate chunk for framer-motion
          framer: {
            test: /[\\/]framer-motion[\\/]/,
            name: 'framer-motion',
            chunks: 'all',
            priority: 20,
            enforce: true,
          },
          // Separate chunk for Radix UI components
          radix: {
            test: /[\\/]@radix-ui[\\/]/,
            name: 'radix-ui',
            chunks: 'all',
            priority: 15,
            enforce: true,
          },
          // Separate chunk for recharts
          recharts: {
            test: /[\\/]recharts[\\/]/,
            name: 'recharts',
            chunks: 'all',
            priority: 15,
            enforce: true,
          },
          // Separate chunk for @dnd-kit
          dndkit: {
            test: /[\\/]@dnd-kit[\\/]/,
            name: 'dnd-kit',
            chunks: 'all',
            priority: 15,
            enforce: true,
          },
          // Separate chunk for @tanstack
          tanstack: {
            test: /[\\/]@tanstack[\\/]/,
            name: 'tanstack',
            chunks: 'all',
            priority: 15,
            enforce: true,
          },
          // Common chunk for shared code
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 5,
            enforce: true,
          },
        },
      };
    }

    return config;
  },

  // Essential headers for security and performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          // Performance headers
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate',
          },
        ],
      },
    ];
  },

  // Optimize images
  images: {
    formats: ['image/webp'],
    minimumCacheTTL: 60,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'scontent-*.cdninstagram.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'scontent.cdninstagram.com',
        pathname: '/**',
      }
    ],
  },

  // Build output configuration
  output: 'standalone',
  distDir: '.next',

  // TypeScript configuration - Enforce type checking for production security
  typescript: {
    ignoreBuildErrors: false, // ✅ Enforce TypeScript type checking in production
  },

  // ESLint configuration - Enable for production builds
  eslint: {
    ignoreDuringBuilds: false, // Enable ESLint checks during build
    dirs: ['src', 'pages', 'components', 'lib', 'app'], // Specify directories to lint
  },

  // Exclude test files from build
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'],

  // Trailing slash configuration
  trailingSlash: false,
};

// Export with bundle analyzer
export default withBundleAnalyzer(nextConfig);
