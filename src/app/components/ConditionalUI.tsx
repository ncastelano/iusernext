'use client'

import { usePathname } from 'next/navigation'
import Navbar from 'src/app/components/Navbar'


export default function ConditionalUI() {
  const pathname = usePathname()
  const hide = pathname === '/login' || pathname === '/cadastro'

  if (hide) return null

  return (
    <>
      <Navbar />

    </>
  )
}
