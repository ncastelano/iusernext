import type { Metadata } from 'next'
import './globals.css'
import { UserProvider } from './components/UserContext'
//import Navbar from './components/Navbar' // <-- Importa a Navbar
import NavigationBar from './components/NavigationBar'
// import ConditionalUI from './components/ConditionalUI' // <-- Comentado

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
          {/* <ConditionalUI /> */}
          {/*  <Navbar />  */}
         <NavigationBar/>
          {children}
        </UserProvider>
      </body>
    </html>
  )
}
