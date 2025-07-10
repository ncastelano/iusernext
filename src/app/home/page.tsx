"use client";

import { useEffect, useState, useRef } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Image from "next/image";
import { Play } from "lucide-react";

interface Video {
  videoID?: string; // usado para indicar vídeo pronto
  publishedDateTime?: number;
  artistSongName?: string;
  latitude?: number;
  longitude?: number;
  userProfileImage?: string;
  userName?: string;
  thumbnailUrl: string;
  videoUrl?: string; // vou supor que exista a url do vídeo para tocar (adicione no firestore)
}

export default function Home() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const [isAnimating, setIsAnimating] = useState(false);
  const [animationDirection, setAnimationDirection] = useState<
    "left" | "right" | null
  >(null);
  const [nextIndex, setNextIndex] = useState<number | null>(null);

  // Para controlar se o vídeo está tocando (true = mostrar vídeo HTML5)
  const [isPlaying, setIsPlaying] = useState(false);

  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const minSwipeDistance = 50;

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
            videoUrl: data.videoUrl || undefined, // supondo que tenha
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

  const nextVideo = () => {
    if (isAnimating || videos.length <= 1) return;
    setAnimationDirection("left");
    setNextIndex((activeIndex + 1) % videos.length);
    setIsAnimating(true);
    setIsPlaying(false); // parar vídeo ao trocar
  };

  const prevVideo = () => {
    if (isAnimating || videos.length <= 1) return;
    setAnimationDirection("right");
    setNextIndex((activeIndex - 1 + videos.length) % videos.length);
    setIsAnimating(true);
    setIsPlaying(false); // parar vídeo ao trocar
  };

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
        nextVideo();
      } else {
        prevVideo();
      }
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const onTransitionEnd = () => {
    if (nextIndex !== null) {
      setActiveIndex(nextIndex);
      setNextIndex(null);
    }
    setIsAnimating(false);
    setAnimationDirection(null);
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

  const currentVideo = videos[activeIndex];
  const upcomingVideo = nextIndex !== null ? videos[nextIndex] : null;

  // Botão Play aparece se videoID existe e videoUrl existe (pronto para vídeo)
  const canPlayVideo = !!(currentVideo.videoID && currentVideo.videoUrl);

  // Quando troca de vídeo, parar vídeo tocando
  // (se preferir, pode pausar o vídeo no evento onEnded do <video>)

  return (
    <div
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        position: "relative",
        userSelect: "none",
        touchAction: "pan-y",
        backgroundColor: "#000",
      }}
    >
      {/* Container animação deslize */}
      <div
        style={{
          display: "flex",
          width: "200vw",
          height: "100vh",
          transform: isAnimating
            ? animationDirection === "left"
              ? "translateX(-100vw)"
              : "translateX(100vw)"
            : "translateX(0)",
          transition: isAnimating ? "transform 0.5s ease" : "none",
        }}
        onTransitionEnd={onTransitionEnd}
      >
        {/* Vídeo atual */}
        <div
          style={{
            width: "100vw",
            height: "100vh",
            position: "relative",
            flexShrink: 0,
            backgroundColor: "#000",
          }}
        >
          {/* Troca img por video se isPlaying */}
          {isPlaying && canPlayVideo ? (
            <video
              src={currentVideo.videoUrl}
              controls
              autoPlay
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                position: "absolute",
                top: 0,
                left: 0,
                zIndex: 0,
                backgroundColor: "#000",
              }}
              onEnded={() => setIsPlaying(false)}
            />
          ) : (
            <Image
              src={currentVideo.thumbnailUrl}
              alt={currentVideo.artistSongName || "Thumbnail do vídeo"}
              fill
              style={{
                objectFit: "cover",
                filter: "brightness(0.6)",
                position: "absolute",
                top: 0,
                left: 0,
                zIndex: 0,
              }}
              sizes="100vw"
              priority
            />
          )}

          <Overlay video={currentVideo} />
        </div>

        {/* Próximo vídeo */}
        {upcomingVideo && (
          <div
            style={{
              width: "100vw",
              height: "100vh",
              position: "relative",
              flexShrink: 0,
              backgroundColor: "#000",
            }}
          >
            <Image
              src={upcomingVideo.thumbnailUrl}
              alt={upcomingVideo.artistSongName || "Thumbnail do vídeo"}
              fill
              style={{
                objectFit: "cover",
                filter: "brightness(0.6)",
                position: "absolute",
                top: 0,
                left: 0,
                zIndex: 0,
              }}
              sizes="100vw"
              priority
            />
            <Overlay video={upcomingVideo} />
          </div>
        )}
      </div>

      {/* Botão Play (canto inferior direito) */}
      {canPlayVideo && !isPlaying && (
        <button
          onClick={() => setIsPlaying(true)}
          aria-label="Play vídeo"
          style={{
            position: "fixed",
            bottom: 90, // semelhante altura NavigationBar (ajuste se quiser)
            right: 30,
            backgroundColor: "#064e3b", // verde escuro
            border: "none",
            borderRadius: "9999px", // pílula
            padding: "12px 24px",
            color: "#fff",
            fontWeight: "600",
            fontSize: "1.25rem",
            display: "flex",
            alignItems: "center",
            gap: 12,
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(6, 78, 59, 0.6)",
            userSelect: "none",
            transition: "background-color 0.3s ease",
            zIndex: 9999,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#07543f";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#064e3b";
          }}
          type="button"
        >
          Play
          <span
            style={{
              display: "flex",
              backgroundColor: "#10b981", // verde claro
              borderRadius: "50%",
              padding: 6,
            }}
          >
            <Play size={24} color="#fff" />
          </span>
        </button>
      )}
    </div>
  );
}

function Overlay({ video }: { video: Video }) {
  return (
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
              width={60}
              height={60}
              style={{
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
  );
}
