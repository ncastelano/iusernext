'use client'

import { usePathname } from 'next/navigation'
import Navbar from './Navbar'
import UserAvatar from './IuserEnterLogin'
import IuserEnterLogin from './IuserEnterLogin'

export default function ConditionalUI() {
  const pathname = usePathname()
  const hide = pathname === '/login' || pathname === '/cadastro'

  if (hide) return null

  return (
    <>
      <Navbar />
      <IuserEnterLogin />
    </>
  )
}
