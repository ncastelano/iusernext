import withPWA from 'next-pwa'
import type { Configuration } from 'webpack'

const isDev = process.env.NODE_ENV === 'development'

const nextConfig = {
  reactStrictMode: true, // mantém
  images: {
    domains: ['firebasestorage.googleapis.com'],
  },
  devIndicators: false, // se quiser desativar a barra de dev tools
}

export default withPWA(
  {
    dest: 'public',
    disable: isDev,
    register: true,
    skipWaiting: true,
    buildExcludes: [/middleware-manifest\.json$/],
  }
)(nextConfig)
