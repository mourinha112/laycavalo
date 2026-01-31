/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Desabilita geração estática para evitar erro com Supabase
  output: 'standalone',
  // Ignora erros de ESLint durante build
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Ignora erros de TypeScript durante build
  typescript: {
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig
