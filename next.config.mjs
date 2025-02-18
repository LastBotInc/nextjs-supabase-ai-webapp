import crypto from 'crypto';

/** @type {import('next').NextConfig} */
const config = {
  // Enable production source maps for better error tracking
  productionBrowserSourceMaps: true,

  // Optimize images
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  // Optimize builds
  swcMinify: true,
  compress: true,
  poweredByHeader: false,

  // Optimize production bundle
  experimental: {
    optimizePackageImports: [
      '@heroicons/react',
      '@radix-ui/react-toast',
      '@radix-ui/react-tabs',
      'framer-motion',
      'recharts',
      'lucide-react'
    ],
  },

  // Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    // Production optimizations
    if (!dev && !isServer) {
      // Split chunks more aggressively in production
      config.optimization.splitChunks = {
        chunks: 'all',
        minSize: 20000,
        maxSize: 244000, // Keep chunks under Vercel's limit
        minChunks: 1,
        maxAsyncRequests: 30,
        maxInitialRequests: 30,
        cacheGroups: {
          default: false,
          vendors: false,
          framework: {
            chunks: 'all',
            name: 'framework',
            test: /(?<!node_modules.*)[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription)[\\/]/,
            priority: 40,
            enforce: true
          },
          lib: {
            test(module) {
              return module.size() > 160000 &&
                /node_modules[/\\]/.test(module.identifier());
            },
            name(module) {
              const hash = crypto.createHash('sha1');
              hash.update(module.identifier());
              return hash.digest('hex').substring(0, 8);
            },
            priority: 30,
            minChunks: 1,
            reuseExistingChunk: true,
          },
          commons: {
            name: 'commons',
            minChunks: 2,
            priority: 20
          },
          shared: {
            name(module, chunks) {
              return crypto
                .createHash('sha1')
                .update(chunks.reduce((acc, chunk) => acc + chunk.name, ''))
                .digest('hex') + '_shared';
            },
            priority: 10,
            minChunks: 2,
            reuseExistingChunk: true
          }
        }
      };

      // Minimize JS
      config.optimization.minimize = true;
    }

    return config;
  }
};

export default config; 