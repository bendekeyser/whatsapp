/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['puppeteer-core', 'puppeteer'],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push({
        'puppeteer-core': 'puppeteer-core',
        puppeteer: 'puppeteer',
      });
    }
    return config;
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Connection', value: 'keep-alive' }
        ],
      },
    ];
  }
};

export default nextConfig;
