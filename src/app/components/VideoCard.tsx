'use client';


import Image from 'next/image';

type Video = {
  id: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  artistSongName: string;
  userName: string;
};

type VideoCardProps = {
  video: Video;
  index: number;
  isHovered: boolean;
  onHoverStart: () => void;
  onHoverEnd: () => void;
  videoRef: (el: HTMLVideoElement | null) => void;
};

export default function VideoCard({
  video,
  index,
  isHovered,
  onHoverStart,
  onHoverEnd,
  videoRef,
}: VideoCardProps) {
  const getRankingBorder = (index: number) => {
    if (index === 0) return 'border-4 border-yellow-400';
    if (index === 1) return 'border-4 border-gray-400';
    if (index === 2) return 'border-4 border-amber-700';
    return 'border border-gray-200 dark:border-gray-700';
  };

  const getRankingColor = (index: number) => {
    if (index === 0) return 'bg-yellow-400 text-white';
    if (index === 1) return 'bg-gray-400 text-white';
    if (index === 2) return 'bg-amber-700 text-white';
    return 'bg-gray-300 text-gray-800 dark:bg-gray-600 dark:text-white';
  };

  const getRankingLabel = (index: number) => `#${index + 1}`;

  return (
    <div
      className={`relative bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden cursor-pointer ${getRankingBorder(index)}`}
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
    >
      <div
        className={`absolute -top--0 -left--2 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-lg z-10 ${getRankingColor(index)}`}
      >
        {getRankingLabel(index)}
      </div>

      <div className="w-full aspect-video bg-gray-300 dark:bg-gray-700 relative flex items-center justify-center">
        {isHovered && video.videoUrl ? (
          <video
            ref={videoRef}
            src={video.videoUrl}
            muted
            className="w-full h-full object-cover"
            playsInline
          />
        ) : video.thumbnailUrl ? (
          <Image
            src={video.thumbnailUrl}
            alt={`${video.artistSongName} thumbnail`}
            className="w-full h-full object-cover"
            width={400}
            height={225}
            unoptimized
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
  );
}
