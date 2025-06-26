import { db } from '@/lib/firebase'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { User } from 'types/user'
import { Video } from 'types/video'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function UserProfilePage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params
  const decodedName = decodeURIComponent(name)

  try {
    // Buscar usuário pelo nome
    const usersRef = collection(db, 'users')
    const qUser = query(usersRef, where('name', '==', decodedName))
    const userSnapshot = await getDocs(qUser)

    if (userSnapshot.empty) return notFound()

    const user = userSnapshot.docs[0].data() as User

    // Buscar vídeos do usuário pelo uid
    const videosRef = collection(db, 'videos')
    const qVideos = query(videosRef, where('userID', '==', user.uid))
    const videosSnapshot = await getDocs(qVideos)

    const videos: Video[] = videosSnapshot.docs.map(doc => doc.data() as Video)

    return (
      <main className="max-w-xl mx-auto p-8 space-y-8 bg-black min-h-screen">
        <section className="text-center">
          <Image
            src={user.image || '/default-profile.png'}
            alt={`Foto de ${user.name}`}
            width={160}
            height={160}
            className="rounded-full mx-auto object-cover shadow-md"
          />
          <h1 className="mt-4 text-4xl font-bold text-white">{user.name}</h1>
          <p className="text-xl text-gray-300">{user.username}</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold border-b border-gray-700 pb-2 text-white">
            Informações
          </h2>
          <p className="text-white">
            <strong>Email:</strong> <span>{user.email}</span>
          </p>
          <p className="text-white">
            <strong>Localização:</strong>{' '}
            <span>
              Latitude: {user.latitude.toFixed(6)}, Longitude: {user.longitude.toFixed(6)}
            </span>
          </p>
          <p>
            <strong>Status:</strong>{' '}
            <span
              className={`inline-block px-4 py-1 rounded-full text-white ${
                user.visible ? 'bg-green-600' : 'bg-gray-400'
              }`}
            >
              {user.visible ? 'Visível' : 'Oculto'}
            </span>
          </p>
        </section>

       <section>
  <h2 className="text-2xl font-semibold mb-4 text-white flex items-center gap-2">
    Vídeos de {user.name}
    <span className="bg-gray-700 text-sm px-2 py-1 rounded-full">
      {videos.length}
    </span>
  </h2>
  {videos.length === 0 ? (
    <p className="text-gray-400">Nenhum vídeo encontrado.</p>
  ) : (
    <ul className="flex flex-col space-y-4">
      {videos.map(video => (
        <li key={video.videoID} className="w-full max-w-md mx-auto">
          <Link href={`/${encodeURIComponent(user.name)}/${encodeURIComponent(video.videoID)}`}>
            <Image
              src={video.thumbnailUrl || '/default-thumbnail.png'}
              alt={`Thumbnail do vídeo: ${video.artistSongName}`}
              width={320}
              height={180}
              className="rounded-lg object-cover shadow-lg cursor-pointer"
            />
          </Link>
        </li>
      ))}
    </ul>
  )}
</section>

      </main>
    )
  } catch (error) {
    console.error('Erro ao buscar usuário ou vídeos:', error)
    return <div>Erro ao carregar o perfil.</div>
  }
}
