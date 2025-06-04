'use client'

import { useState, useEffect } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import Image from 'next/image'

type User = {
  name: string
  image: string
  email: string
}

export default function AllProfiles() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchUsers() {
      try {
        const usersCol = collection(db, 'users')
        const userSnapshot = await getDocs(usersCol)
        const userList = userSnapshot.docs.map(doc => doc.data() as User)
        setUsers(userList)
      } catch (error) {
        console.error('Erro ao buscar usuários:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  if (loading) {
    return <p className="text-white text-center py-4">Carregando usuários...</p>
  }

  return (
    <section className="px-4 py-6">
      <h2 className="text-xl text-white text-center mb-4">👥 Todos os Perfis</h2>

      <ul className="flex overflow-x-auto gap-4 profile-scrollbar">
        {users.map((user, idx) => (
          <li
            key={idx}
            className="flex flex-col items-center flex-shrink-0"
          >
            <div className="relative w-20 h-20 rounded-full overflow-hidden border border-gray-700 shadow-md">
              <Image
                src={user.image}
                alt={`${user.name} avatar`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </div>
            <p className="text-white text-sm mt-2 truncate max-w-[80px] text-center">{user.name}</p>
          </li>
        ))}
      </ul>

      <style jsx>{`
        .profile-scrollbar::-webkit-scrollbar {
          height: 8px;
        }

        .profile-scrollbar::-webkit-scrollbar-track {
          background: #000;
        }

        .profile-scrollbar::-webkit-scrollbar-thumb {
          background-color: #777;
          border-radius: 8px;
        }

        .profile-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #aaa;
        }

        .profile-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #777 #000;
        }
      `}</style>
    </section>
  )
}
