import type { Metadata } from 'next'
import './globals.css'
import ConditionalUI from './components/ConditionalUI'
import { UserProvider } from './components/UserContext' // importe aqui

export const metadata: Metadata = {
  title: 'iUser',
  description: 'a melhor plataforma',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon/icon-192x192.png',
    apple: '/icon/icon-512x512.png',
  },
}

export const viewport = {
  themeColor: '#0f172a',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <UserProvider>
          <ConditionalUI />
          {children}
        </UserProvider>
      </body>
    </html>
  )
}
