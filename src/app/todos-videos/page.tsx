'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import VideoCard from '@/app/components/VideoCard'



type Video = {
  id: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  artistSongName: string;
  userName: string;
};

export default function TodosVideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVideos() {
      try {
        const querySnapshot = await getDocs(collection(db, 'videos'));
        const data: Video[] = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Video[];
        setVideos(data);
      } catch (error) {
        console.error('Erro ao buscar vídeos:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchVideos();
  }, []);

  useEffect(() => {
    videos.forEach((_, idx) => {
      const vidEl = videoRefs.current[idx];
      if (!vidEl) return;

      if (hoveredIndex === idx && vidEl.src) {
        vidEl.currentTime = 0;
        vidEl.muted = true;
        vidEl.play().catch((err) => {
          if (
            !err.message.includes(
              'interrupted because video-only background media'
            )
          ) {
            console.error('Erro ao reproduzir vídeo:', err);
          }
        });
      } else {
        vidEl?.pause();
        if (vidEl) vidEl.currentTime = 0;
      }
    });
  }, [hoveredIndex, videos]);

 


  if (loading) return <p className="p-4">Carregando vídeos...</p>;

  return (
    <section className="mb-8 px-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl text-blue-600 dark:text-blue-400">Todos os Vídeos</h2>
        <Link href="/" className="text-sm text-blue-500 hover:underline">
          Ver menos
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
       {videos.map((video, idx) => (
  <VideoCard
    key={video.id}
    video={video}
    index={idx}
    isHovered={hoveredIndex === idx}
    onHoverStart={() => setHoveredIndex(idx)}
    onHoverEnd={() => setHoveredIndex((prev) => (prev === idx ? null : prev))}
    videoRef={(el) => (videoRefs.current[idx] = el)}
  />
))}

      </div>
    </section>
  );
}
