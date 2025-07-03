"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { Play, Pause } from "lucide-react";
import { Video } from "types/video";

type VideoPlayerProps = {
  video: Video;
  muted: boolean;
};

export function VideoPlayer({ video, muted }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = muted;
    }
  }, [muted]);

  const togglePlay = () => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    if (videoEl.paused) {
      videoEl.play();
      setIsPlaying(true);
    } else {
      videoEl.pause();
      setIsPlaying(false);
    }
  };

  return (
    <>
      {video.videoUrl && isReady ? (
        <>
          <video
            ref={videoRef}
            src={video.videoUrl}
            playsInline
            loop
            autoPlay
            className="position-absolute w-100 h-100 object-fit-cover"
            style={{ zIndex: 0 }}
            onCanPlay={() => setIsReady(true)}
          />
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
        </>
      ) : (
        <>
          {video.videoUrl && (
            <video
              src={video.videoUrl}
              muted
              playsInline
              onCanPlay={() => setIsReady(true)}
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
