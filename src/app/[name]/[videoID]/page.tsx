// app/[name]/[videoID]/page.tsx

import { db } from '@/lib/firebase'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { notFound } from 'next/navigation'
import { Video } from 'types/video'
import { User } from 'types/user'

interface Props {
  params: {
    name: string
    videoID: string
  }
}

export default async function VideoPage({ params }: Props) {
  const { videoID } = params

  // Buscar o vídeo específico pelo ID
  const videosRef = collection(db, 'videos')
  const qVideo = query(videosRef, where('videoID', '==', videoID))
  const videoSnapshot = await getDocs(qVideo)

  if (videoSnapshot.empty) return notFound()

  const video = videoSnapshot.docs[0].data() as Video

  // Buscar o dono do vídeo
  const usersRef = collection(db, 'users')
  const qUser = query(usersRef, where('uid', '==', video.userID))
  const userSnapshot = await getDocs(qUser)

  if (userSnapshot.empty) return notFound()

 

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
        padding: 20,
        backgroundColor: '#111',
        color: '#eee',
      }}
    >
      <h1>{video.artistSongName}</h1>
      <img
        src={video.thumbnailUrl}
        alt={`Thumbnail do vídeo ${video.videoID}`}
        style={{ maxWidth: '100%', borderRadius: 12, boxShadow: '0 0 10px rgba(0,0,0,0.7)' }}
      />
      <p><strong>Usuário:</strong> {video.userName}</p>
      <p>
        <strong>Data de publicação:</strong>{' '}
        {video.publishedDateTime
          ? new Date(video.publishedDateTime).toLocaleDateString('pt-BR')
          : 'Não disponível'}
      </p>
    </main>
  )
}
