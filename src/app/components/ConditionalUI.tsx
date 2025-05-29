'use client'

import { usePathname } from 'next/navigation'
import Navbar from './Navbar'
import DevWidget from './DevWidgets'

export default function ConditionalUI() {
  const pathname = usePathname()
  const hide = pathname === '/login' || pathname === '/cadastro'

  if (hide) return null

  return (
    <>
      <Navbar />
      <DevWidget />
    </>
  )
}
