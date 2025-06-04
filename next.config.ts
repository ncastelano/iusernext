import withPWA from 'next-pwa'

const isDev = process.env.NODE_ENV === 'development'

const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [ 'lh3.googleusercontent.com',        // Google (login avatar)
      'firebasestorage.googleapis.com'],  // adiciona seu domínio Firebase Storage aqui
  },
  devIndicators: false, // desativa a barra de dev tools, se quiser
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
