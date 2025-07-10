"use client";

import { useEffect, useState, useRef } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Image from "next/image";

interface Video {
  videoID?: string;
  publishedDateTime?: number;
  artistSongName?: string;
  latitude?: number;
  longitude?: number;
  userProfileImage?: string;
  userName?: string;
  thumbnailUrl: string;
}

export default function Home() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Referências para controlar o swipe
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const minSwipeDistance = 50; // px mínimo para considerar swipe

  useEffect(() => {
    async function fetchVideos() {
      setLoading(true);
      try {
        const q = query(
          collection(db, "videos"),
          orderBy("publishedDateTime", "desc")
        );
        const snapshot = await getDocs(q);

        const vids: Video[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            videoID: doc.id,
            artistSongName: data.artistSongName || undefined,
            latitude: data.latitude || undefined,
            longitude: data.longitude || undefined,
            userProfileImage: data.userProfileImage || undefined,
            userName: data.userName || undefined,
            thumbnailUrl: data.thumbnailUrl || "",
            publishedDateTime: data.publishedDateTime || undefined,
          };
        });
        setVideos(vids);
      } catch (error) {
        console.error("Erro ao buscar vídeos:", error);
      }
      setLoading(false);
    }
    fetchVideos();
  }, []);

  // Funções para mudar de vídeo
  const nextVideo = () => {
    setActiveIndex((prev) => (prev + 1) % videos.length);
  };

  const prevVideo = () => {
    setActiveIndex((prev) => (prev - 1 + videos.length) % videos.length);
  };

  // Handlers do swipe
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.changedTouches[0].clientX;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].clientX;
  };

  const onTouchEnd = () => {
    if (
      touchStartX.current !== null &&
      touchEndX.current !== null &&
      Math.abs(touchStartX.current - touchEndX.current) > minSwipeDistance
    ) {
      if (touchStartX.current > touchEndX.current) {
        // Swipe para esquerda
        nextVideo();
      } else {
        // Swipe para direita
        prevVideo();
      }
    }
    // Reset
    touchStartX.current = null;
    touchEndX.current = null;
  };

  if (loading) {
    return (
      <div
        style={{
          backgroundColor: "#000",
          color: "#fff",
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: "1.5rem",
          fontWeight: "bold",
        }}
      >
        Carregando vídeos...
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div
        style={{
          backgroundColor: "#000",
          color: "#fff",
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: "1.2rem",
        }}
      >
        Nenhum vídeo encontrado.
      </div>
    );
  }

  const video = videos[activeIndex];

  return (
    <div
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      style={{
        width: "100vw",
        height: "100vh",
        position: "relative",
        overflow: "hidden",
        userSelect: "none",
        touchAction: "pan-y", // para evitar conflito com scroll vertical
      }}
    >
      {/* Thumbnail ocupa toda tela */}
      <img
        src={video.thumbnailUrl}
        alt={video.artistSongName || "Thumbnail do vídeo"}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          filter: "brightness(0.6)",
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: 0,
          transition: "transform 0.3s ease",
        }}
      />

      {/* Overlay dos dados */}
      <div
        style={{
          position: "absolute",
          top: 20,
          left: 20,
          right: 20,
          zIndex: 10,
          color: "#fff",
          textShadow: "0 0 5px rgba(0,0,0,0.8)",
          display: "flex",
          flexDirection: "column",
          gap: 12,
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        }}
      >
        {(video.userProfileImage || video.userName) && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginTop: 10,
            }}
          >
            {video.userProfileImage ? (
              <Image
                src={video.userProfileImage}
                alt={video.userName || "Avatar do usuário"}
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "2px solid white",
                  boxShadow: "0 0 6px rgba(255,255,255,0.7)",
                }}
              />
            ) : (
              <div
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: "50%",
                  backgroundColor: "#555",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  color: "#ccc",
                  fontSize: "1.5rem",
                }}
              >
                ?
              </div>
            )}

            {video.userName && (
              <span
                style={{
                  fontWeight: "600",
                  fontSize: "1.3rem",
                  textShadow: "0 0 3px rgba(0,0,0,0.7)",
                  userSelect: "text",
                }}
              >
                {video.userName}
              </span>
            )}
          </div>
        )}

        {video.latitude !== undefined && video.longitude !== undefined && (
          <p style={{ margin: 0, fontSize: "1.1rem", opacity: 0.8 }}>
            Latitude: {video.latitude.toFixed(5)} | Longitude:{" "}
            {video.longitude.toFixed(5)}
          </p>
        )}
        {video.artistSongName && (
          <h1
            style={{
              margin: 0,
              fontSize: "2.5rem",
              fontWeight: "bold",
              maxWidth: "90vw",
              overflowWrap: "break-word",
            }}
          >
            {video.artistSongName}
          </h1>
        )}
      </div>
    </div>
  );
}
