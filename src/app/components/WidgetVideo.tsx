"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type WidgetVideoProps = {
  thumbnailUrl?: string;
  userProfileImage?: string;
  videoUrl?: string;
};

export default function WidgetVideo({
  thumbnailUrl,
  videoUrl,
}: WidgetVideoProps) {
  const [showVideo, setShowVideo] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const tryPlayVideo = () => {
      if (!videoUrl || !videoRef.current) return;

      const video = videoRef.current;
      const canPlay = video.readyState >= 3;

      if (canPlay) {
        setShowVideo(true);
      } else {
        timeout = setTimeout(tryPlayVideo, 3000);
      }
    };

    tryPlayVideo();

    return () => clearTimeout(timeout);
  }, [videoUrl]);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
      }}
    >
      {showVideo && videoUrl ? (
        <video
          ref={videoRef}
          src={videoUrl}
          autoPlay
          muted
          playsInline
          loop
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            objectFit: "cover",
            zIndex: 0,
          }}
        />
      ) : thumbnailUrl ? (
        <Image
          src={thumbnailUrl}
          alt="Thumbnail"
          fill
          style={{
            objectFit: "cover",
            zIndex: 0,
            borderRadius: "50%",
          }}
        />
      ) : (
        <div
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            background: "#333",
            color: "#ccc",
            fontSize: "0.9rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
          }}
        >
          Sem mídia
        </div>
      )}
    </div>
  );
}
