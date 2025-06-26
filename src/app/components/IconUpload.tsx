'use client'

import { useRouter } from 'next/navigation'
import { Upload } from 'lucide-react'
import { useUser } from '@/app/components/UserContext'

export default function IconeUpload() {
  const { user } = useUser()
  const router = useRouter()

  // Se não estiver logado, não renderiza nada
  if (!user) return null

  return (
    <div
      title="Fazer Upload"
      onClick={() => router.push('/upload')}
      style={{
        position: 'fixed',
        bottom: 10,
        right: 20,
        width: 64,
        height: 64,
        borderRadius: '50%',
        backgroundColor: '#00aaff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        zIndex: 11000,
        boxShadow: '0 0 10px rgba(0,0,0,0.3)',
      }}
    >
      <Upload size={32} color="#fff" />
    </div>
  )
}
