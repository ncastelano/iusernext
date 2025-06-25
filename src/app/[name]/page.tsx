import { db } from '@/lib/firebase'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { notFound } from 'next/navigation'
import { Video } from 'types/video'
import Image from 'next/image'

type PageProps = {
  params: {
    name: string
    videoID: string
  }
}

export default async function VideoPage({ params }: PageProps) {
  const { videoID } = params

  const videosRef = collection(db, 'videos')
  const qVideo = query(videosRef, where('videoID', '==', videoID))
  const videoSnapshot = await getDocs(qVideo)

  if (videoSnapshot.empty) return notFound()

  const video = videoSnapshot.docs[0].data() as Video

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
      <Image
        src={video.thumbnailUrl || '/default-thumbnail.png'}
        alt={`Thumbnail do vídeo ${video.videoID}`}
        width={640}
        height={360}
        style={{ borderRadius: 12, boxShadow: '0 0 10px rgba(0,0,0,0.7)' }}
        className="w-full h-auto max-w-full"
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
