"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { Play, Pause } from "lucide-react";
import { Video } from "types/video";

type VideoPlayerProps = {
  video: Video;
  muted: boolean;
  playing: boolean;
};

export function VideoPlayer({ video, muted, playing }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);

  // Sincroniza mute
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = muted;
    }
  }, [muted]);

  // Controla play/pause pela prop 'playing'
  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl || videoError) return;

    if (playing) {
      videoEl.play().catch((err) => {
        console.warn("Erro ao dar play:", err);
      });
      setIsPlaying(true);
    } else {
      videoEl.pause();
      setIsPlaying(false);
    }
  }, [playing, videoError]);

  const togglePlay = () => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    if (videoEl.paused) {
      videoEl
        .play()
        .then(() => setIsPlaying(true))
        .catch(console.warn);
    } else {
      videoEl.pause();
      setIsPlaying(false);
    }
  };

  return (
    <div className="position-absolute w-100 h-100" style={{ zIndex: 0 }}>
      {/* Fallback: tela preta enquanto carrega */}
      {!isLoaded && !videoError && (
        <div
          className="w-100 h-100"
          style={{
            backgroundColor: "black",
            position: "absolute",
            top: 0,
            left: 0,
            zIndex: 1,
          }}
        />
      )}

      {/* Vídeo */}
      {video.videoUrl && !videoError && (
        <video
          ref={videoRef}
          src={video.videoUrl}
          muted
          playsInline
          loop
          preload="metadata"
          autoPlay
          className="position-absolute w-100 h-100 object-fit-cover"
          style={{ zIndex: 0 }}
          onCanPlay={() => setIsLoaded(true)}
          onError={() => setVideoError(true)}
        />
      )}

      {/* Fallback final: thumbnail se o vídeo falhar */}
      {videoError && (
        <Image
          src={video.thumbnailUrl}
          alt="Thumbnail"
          fill
          className="object-fit-cover"
          style={{ zIndex: 0 }}
          sizes="100vw"
        />
      )}

      {/* Botão de play/pause (opcional) */}
      <button
        onClick={togglePlay}
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
    </div>
  );
}
