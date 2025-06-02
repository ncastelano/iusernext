'use client';

import { useEffect, useRef, useState } from 'react';

type Video = {
  id: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  artistSongName: string;
  userName: string;
};

type DestaquesProps = {
  videos: Video[];
};

/**
 * Componente Destaques:
 * - Exibe até 5 vídeos em uma grade.
 * - Cada card mostra a thumbnail por padrão.
 * - Quando o mouse passa sobre o card, o vídeo correspondente começa a ser reproduzido (mutado).
 * - Quando o mouse sai, o vídeo pausa e volta ao início, e a thumbnail é mostrada novamente.
 */
export default function Destaques({ videos }: DestaquesProps) {
  // Limita a lista a no máximo 5 vídeos
  const limitedVideos = videos.slice(0, 5);

  // Índice do card atualmente em hover (ou null se nenhum)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Array de refs para os elementos <video>
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  // Quando hoveredIndex mudar, tocar/pausar vídeos conforme
  useEffect(() => {
    limitedVideos.forEach((_, idx) => {
      const vidEl = videoRefs.current[idx];
      if (!vidEl) return;

      if (hoveredIndex === idx && vidEl.src) {
        // Mouse entrou no card: reproduzir (mutado)
        vidEl.currentTime = 0;
        vidEl.muted = true;
        vidEl.play().catch((err) => {
          // Ignora erro de “paused to save power”
          if (
            !err.message.includes(
              'interrupted because video-only background media'
            )
          ) {
            console.error('Erro ao reproduzir vídeo:', err);
          }
        });
      } else {
        // Mouse saiu ou não é o card ativo: pausar e resetar
        vidEl.pause();
        vidEl.currentTime = 0;
      }
    });
  }, [hoveredIndex, limitedVideos]);

  if (limitedVideos.length === 0) {
    return <p>Carregando vídeos...</p>;
  }

  return (
    <section className="mb-8">
      <h2 className="text-xl mb-4 text-blue-600 dark:text-blue-400">Destaques</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {limitedVideos.map((video, idx) => (
          <div
            key={video.id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden cursor-pointer"
            onMouseEnter={() => setHoveredIndex(idx)}
            onMouseLeave={() => setHoveredIndex((prev) => (prev === idx ? null : prev))}
          >
            <div className="w-full aspect-video bg-gray-300 dark:bg-gray-700 relative flex items-center justify-center">
              {hoveredIndex === idx && video.videoUrl ? (
                <video
                  ref={(el) => { videoRefs.current[idx] = el }}
                  src={video.videoUrl}
                  muted
                  className="w-full h-full object-cover"
                  playsInline
                />
              ) : video.thumbnailUrl ? (
                <img
                  src={video.thumbnailUrl}
                  alt={`${video.artistSongName} thumbnail`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full text-gray-500 text-sm">
                  Sem capa
                </div>
              )}
            </div>

            <div className="p-4">
              <h3 className="text-base font-medium text-gray-900 dark:text-white mb-1">
                {video.artistSongName}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                por {video.userName}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
