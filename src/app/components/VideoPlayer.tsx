"use client";

import { useRef, useEffect } from "react";
import Image from "next/image";
import { Play, Pause } from "lucide-react";
import { Video } from "types/video";

type VideoPlayerProps = {
  video: Video;
  isPlaying: boolean;
  isReady: boolean;
  muted: boolean;
  onCanPlay: (id: string) => void;
  onPlayToggle: (id: string) => void;
  videoRefs: React.MutableRefObject<Record<string, HTMLVideoElement | null>>;
};

export function VideoPlayer({
  video,
  isPlaying,
  isReady,
  muted,
  onCanPlay,
  onPlayToggle,
  videoRefs,
}: VideoPlayerProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null);

  // Atualiza o ref compartilhado com o componente pai
  useEffect(() => {
    videoRefs.current[video.videoID] = localVideoRef.current;
  }, [video.videoID, localVideoRef]);

  // Atualiza o estado de mute
  useEffect(() => {
    if (localVideoRef.current) {
      localVideoRef.current.muted = muted;
    }
  }, [muted]);

  return (
    <>
      {video.videoUrl && isReady ? (
        <>
          <video
            ref={localVideoRef}
            src={video.videoUrl}
            playsInline
            loop
            autoPlay
            className="position-absolute w-100 h-100 object-fit-cover"
            style={{ zIndex: 0 }}
            onCanPlay={() => onCanPlay(video.videoID)}
          />
          <button
            onClick={() => onPlayToggle(video.videoID)}
            style={{
              backgroundColor: "rgba(0,0,0,0.6)",
              border: "none",
              borderRadius: "50%",
              color: "#fff",
              cursor: "pointer",
              transition: "opacity 0.3s",
              boxShadow: "0 0 10px rgba(0,0,0,0.5)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "clamp(40px, 8vw, 100px)",
              height: "clamp(40px, 8vw, 100px)",
              zIndex: 20,
              opacity: isPlaying ? 0 : 1,
            }}
            aria-label={isPlaying ? "Pause video" : "Play video"}
          >
            {isPlaying ? <Pause size={40} /> : <Play size={40} />}
          </button>
        </>
      ) : (
        <>
          {video.videoUrl && (
            <video
              src={video.videoUrl}
              muted
              playsInline
              onCanPlay={() => onCanPlay(video.videoID)}
              style={{ display: "none" }}
            />
          )}
          <Image
            src={video.thumbnailUrl}
            alt="Thumbnail"
            fill
            className="object-fit-cover"
            style={{ zIndex: 0 }}
            sizes="100vw"
          />
        </>
      )}
    </>
  );
}
