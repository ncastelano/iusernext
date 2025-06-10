import type { Metadata } from 'next'
import './globals.css'
import ConditionalUI from './components/ConditionalUI'

// ✅ Metadados corretos
export const metadata: Metadata = {
  title: 'iUser',
  description: 'a melhor plataforma',
  manifest: '/manifest.json',
  icons: {
    icon: '/icons/icon-192x192.png',
    apple: '/icons/icon-512x512.png',
  },
}

// ✅ Apenas o necessário no viewport
export const viewport = {
  themeColor: '#0f172a',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <ConditionalUI />
        {children}
      </body>
    </html>
  )
}
