const withNextIntl = require('next-intl/plugin')(
  './app/i18n/request.ts'
);
const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    _next_intl_trailing_slash: 'true'
  },
  assetPrefix: '',
  async rewrites() {
    return {
      beforeFiles: [
        // Rewrite API routes to edge functions
        {
          source: '/api/:path*',
          destination: '/api/:path*',
          has: [
            {
              type: 'header',
              key: 'x-use-edge',
              value: '1',
            },
          ],
        },
      ],
    }
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '54321',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '54321',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'replicate.delivery',
        pathname: '/**',
      },
      // Product feed images - common e-commerce domains
      {
        protocol: 'https',
        hostname: '*.caffitella.fi',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'caffitella.fi',
        pathname: '/**',
      },
      // Generic pattern for product images from various sources
      {
        protocol: 'https',
        hostname: '*.shopify.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.shopifycdn.com', 
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.wordpress.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.woocommerce.com',
        pathname: '/**',
      }
    ],
    formats: ['image/webp'],
    minimumCacheTTL: 31536000,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  experimental: {
    optimizePackageImports: [
      '@headlessui/react', 
      'react-icons',
      '@heroicons/react',
      'framer-motion',
      'react-use',
      'lodash'
    ],
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
    level: 'info'
  },
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'].filter(ext => !ext.includes('test')),
  eslint: {
    ignoreDuringBuilds: true
  },
  outputFileTracingExcludes: {
    '*': [
      // Dev files
      '**/__tests__/**',
      '**/cypress/**',
      '**/mocks/**',
      'jest.config.*',
      'cypress.*',
      '.eslintrc.*',
      'tsconfig.*',
      
      // Large static assets
      'public/**/*.{jpg,png,gif,mp4}',
      'public/images/**',
      'public/videos/**',
      
      // Source files that will be compiled
      'src/**/*.ts',
      'src/**/*.tsx',
      
      // Cache and temp files
      '**/node_modules/.cache/**',
      '**/node_modules/sharp/vendor/**',
      '.next/cache/**',
      
      // Build artifacts
      'coverage/**',
      '.git/**',
    ],
  },
  // Packages that need to be transpiled
  transpilePackages: [
    'next',
    'react',
    'react-dom',
    '@supabase/auth-helpers-nextjs',
    '@supabase/supabase-js',
    '@headlessui/react',
    'react-icons',
    'next-intl',
    'next/dist/server/app-render',
    'next/dist/server/app-render/work-unit-async-storage.external'
  ],
  webpack: (config, { isServer }) => {
    // Enable module concatenation for smaller bundles
    config.optimization.concatenateModules = true

    // Add resolution for the problematic module
    if (isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'next/dist/server/app-render/work-unit-async-storage.external': path.join(__dirname, 'node_modules/next/dist/server/app-render/work-unit-async-storage.external.js'),
        'next/dist/server/app-render': path.join(__dirname, 'node_modules/next/dist/server/app-render')
      }
    }

    // Aggressive code splitting for API routes
    if (isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        minSize: 20000,
        maxSize: 240000,
        minChunks: 1,
        maxAsyncRequests: 30,
        maxInitialRequests: 30,
        cacheGroups: {
          default: false,
          vendors: false,
          apiRoutes: {
            test: /[\\/]app[\\/]api[\\/]/,
            name: 'api-route',
            chunks: 'all',
            minChunks: 1,
            priority: 10,
          },
          aiDeps: {
            test: /[\\/]node_modules[\\/](@google\/generative-ai|turndown|sharp|@tavily\/core)[\\/]/,
            name: 'ai-dependencies',
            chunks: 'async',
            priority: 20,
          },
        },
      }
    }

    // Use Next.js built-in minification instead of Terser
    config.optimization = {
      ...config.optimization,
      minimize: true,
    }

    return config
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              // Scripts - allow self and specific analytics
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.vercel-insights.com https://*.va.vercel-scripts.com https://va.vercel-scripts.com https://*.cloudflare.com https://challenges.cloudflare.com",
              // Styles - allow self and inline styles needed for Next.js
              "style-src 'self' 'unsafe-inline'",
              // Images - allow self, data URLs, and specific domains
              "img-src 'self' data: blob: https: http://127.0.0.1:54321 http://localhost:54321 https://*.supabase.co",
              // Fonts - restrict to self
              "font-src 'self' data: https://fonts.gstatic.com",
              // Connect - allow specific APIs and websockets
              "connect-src 'self' https://*.vercel-insights.com https://*.va.vercel-scripts.com https://va.vercel-scripts.com https://*.supabase.co https://dnhlnmjbjspbgogkywnf.supabase.co wss://*.supabase.co wss://dnhlnmjbjspbgogkywnf.supabase.co http://127.0.0.1:54321 http://localhost:54321 ws://127.0.0.1:54321 ws://localhost:54321",
              // Media - allow self and specific domains
              "media-src 'self' blob: data: https://*.lastbot.net https://*.vercel.app http://localhost:* http://127.0.0.1:*",
              // Object - restrict entirely
              "object-src 'none'",
              // Frame - allow self and Cloudflare Turnstile
              "frame-src 'self' https://challenges.cloudflare.com",
              // Worker - restrict to self
              "worker-src 'self' blob:",
              // Manifest - allow self
              "manifest-src 'self'",
              // Form action - restrict to self
              "form-action 'self'",
              // Base URI - restrict to self
              "base-uri 'self'",
            ].join('; ')
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'no-referrer-when-downgrade'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
          }
        ]
      },
      // Static assets caching
      {
        source: '/:all*(svg|jpg|jpeg|png|webp|avif|ico|css|js)',
        locale: false,
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          }
        ],
      },
      // Add specific caching for static pages
      {
        source: '/:locale(en|fi|sv)/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, stale-while-revalidate=86400',
          }
        ],
      },
      // Add specific caching for analytics scripts
      {
        source: '/speed-insights/script.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'Timing-Allow-Origin',
            value: '*'
          }
        ],
      },
    ];
  },
};

module.exports = withNextIntl(nextConfig);

