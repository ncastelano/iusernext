"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { VideoData } from "types/markerTypes";

interface Props {
  video: VideoData;
  onClose: () => void;
}

export default function CustomInfoWindowPlace({ video, onClose }: Props) {
  const router = useRouter();

  const handleGoToProfile = () => {
    router.push(`/${video.namePage.toLowerCase()}`);
  };

  return (
    <div
      style={{
        position: "relative",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        background: "rgba(255, 255, 255, 0.25)",
        borderRadius: 16,
        padding: 16,
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
        border: "1px solid rgba(255, 255, 255, 0.3)",
        width: 260,
        textAlign: "center",
        color: "#000",
        fontFamily: "sans-serif",
      }}
    >
      {/* Botão de fechar */}
      <button
        onClick={onClose}
        style={{
          position: "absolute",
          top: 8,
          right: 8,
          background: "rgba(255, 0, 0, 0.1)",
          backdropFilter: "blur(4px)",
          border: "1px solid rgba(255, 0, 0, 0.3)",
          color: "red",
          borderRadius: "50%",
          width: 28,
          height: 28,
          fontWeight: "bold",
          fontSize: 18,
          cursor: "pointer",
        }}
        aria-label="Fechar"
      >
        ×
      </button>

      {/* Avatar + namePage (clicável) */}
      <div
        onClick={handleGoToProfile}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          marginBottom: 12,
          cursor: "pointer",
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            overflow: "hidden",
            border: "2px solid white",
            backgroundColor: "#ccc",
            boxShadow: "0 0 4px rgba(0,0,0,0.2)",
            flexShrink: 0,
          }}
        >
          {video.userProfileImage && (
            <Image
              src={video.userProfileImage}
              alt={video.namePage}
              width={40}
              height={40}
              style={{ objectFit: "cover", width: "100%", height: "100%" }}
            />
          )}
        </div>
        <p
          style={{
            fontWeight: 600,
            fontSize: "1rem",
            margin: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {video.namePage}
        </p>
      </div>

      {/* Thumbnail */}
      {video.thumbnailUrl ? (
        <Image
          src={video.thumbnailUrl}
          alt={video.thumbnailUrl}
          width={200}
          height={120}
          onClick={() => router.push(`/${video.namePage}/${video.videoID}`)}
          style={{
            borderRadius: 12,
            objectFit: "cover",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            cursor: "pointer",
            transition: "transform 0.2s ease",
          }}
        />
      ) : (
        <div
          style={{
            width: 200,
            height: 120,
            backgroundColor: "#ddd",
            borderRadius: 12,
          }}
        />
      )}
    </div>
  );
}
