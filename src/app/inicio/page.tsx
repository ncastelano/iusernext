"use client";

import { useEffect, useState, useRef } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  DocumentSnapshot,
  QuerySnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { MessageCircle } from "lucide-react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Video } from "types/video";
import { Comment } from "types/comment";
import { VideoPlayer } from "@/app/components/VideoPlayer";
import { UserAvatar } from "@/app/components/UserAvatar";
import { CommentSection } from "@/app/components/CommentSection";
import { MuteButton } from "@/app/components/MuteButton";

export default function InicioPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [mutedGlobal, setMutedGlobal] = useState(true);
  const [showComments, setShowComments] = useState(false);
  const [currentVideoId, setCurrentVideoId] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);

  // Buscar vídeos
  useEffect(() => {
    const fetchVideos = async () => {
      const q = query(
        collection(db, "videos"),
        where("publishedDateTime", "!=", null),
        orderBy("publishedDateTime", "desc")
      );
      const snapshot = await getDocs(q);
      setVideos(
        snapshot.docs.map((doc) => ({
          videoID: doc.id,
          ...doc.data(),
        })) as Video[]
      );
    };
    fetchVideos();
  }, []);

  // Navegação touch horizontal
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onTouchStart = (e: TouchEvent) => {
      const startX = e.touches[0].clientX;
      const scrollLeft = container.scrollLeft;

      const onTouchMove = (e: TouchEvent) => {
        const x = e.touches[0].clientX;
        container.scrollLeft = scrollLeft + (startX - x);
      };

      const cleanup = () => {
        container.removeEventListener("touchmove", onTouchMove);
        container.removeEventListener("touchend", cleanup);
      };

      container.addEventListener("touchmove", onTouchMove);
      container.addEventListener("touchend", cleanup);
    };

    container.addEventListener("touchstart", onTouchStart);
    return () => container.removeEventListener("touchstart", onTouchStart);
  }, []);

  // Detecta o vídeo mais centralizado no scroll horizontal e atualiza activeVideoIndex
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const containerRect = container.getBoundingClientRect();
      const containerCenterX = containerRect.left + containerRect.width / 2;

      let closestIndex = 0;
      let closestDistance = Infinity;

      const children = Array.from(container.children);

      children.forEach((child, index) => {
        const rect = child.getBoundingClientRect();
        const videoCenterX = rect.left + rect.width / 2;
        const distance = Math.abs(containerCenterX - videoCenterX);

        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });

      if (closestIndex !== activeVideoIndex) {
        setActiveVideoIndex(closestIndex);
        setCurrentVideoId(videos[closestIndex]?.videoID || "");
      }
    };

    let timeout: number;
    const debouncedHandleScroll = () => {
      clearTimeout(timeout);
      timeout = window.setTimeout(handleScroll, 50);
    };

    container.addEventListener("scroll", debouncedHandleScroll);
    // Inicializa ativo
    handleScroll();

    return () => {
      container.removeEventListener("scroll", debouncedHandleScroll);
      clearTimeout(timeout);
    };
  }, [videos, activeVideoIndex]);

  // Comentários
  useEffect(() => {
    if (!showComments || !currentVideoId) return;

    const commentsRef = collection(db, "videos", currentVideoId, "comments");
    const q = query(commentsRef, orderBy("timestamp", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot: QuerySnapshot) => {
      setComments(
        snapshot.docs.map((doc: DocumentSnapshot) => ({
          id: doc.id,
          ...doc.data(),
        })) as Comment[]
      );
    });

    return unsubscribe;
  }, [showComments, currentVideoId]);

  // Controle de navegação por teclado (sempre ativo, bloqueia se showComments aberto)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showComments) return; // bloqueia navegação se comentários abertos

      if (e.key === "ArrowRight") {
        setActiveVideoIndex((prev) => Math.min(prev + 1, videos.length - 1));
      } else if (e.key === "ArrowLeft") {
        setActiveVideoIndex((prev) => Math.max(prev - 1, 0));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showComments, videos.length]);

  const toggleComments = (videoId: string) => {
    setShowComments((prev) =>
      prev && currentVideoId === videoId ? false : true
    );
    setCurrentVideoId(videoId);

    const idx = videos.findIndex((v) => v.videoID === videoId);
    if (idx !== -1) setActiveVideoIndex(idx);
  };

  return (
    <div
      className="vh-100"
      style={{ overflow: "hidden", position: "relative" }}
    >
      <div
        ref={containerRef}
        className="d-flex flex-row"
        style={{
          overflowX: showComments ? "hidden" : "auto",
          scrollSnapType: "x mandatory",
          height: showComments ? "60vh" : "100vh",
          transition: "height 0.3s ease",
        }}
      >
        {videos.map((video, index) => (
          <div
            key={video.videoID}
            className="flex-shrink-0 w-100 d-flex align-items-center justify-content-center position-relative"
            style={{ scrollSnapAlign: "center" }}
          >
            <VideoPlayer
              video={video}
              muted={mutedGlobal}
              playing={index === activeVideoIndex}
            />

            <UserAvatar
              imageUrl={video.userProfileImage}
              userName={video.userName}
              artistSongName={video.artistSongName}
            />

            <button
              onClick={() => toggleComments(video.videoID)}
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
                bottom: 20,
                right: 20,
                width: "clamp(40px, 6vw, 60px)",
                height: "clamp(40px, 6vw, 60px)",
                zIndex: 20,
              }}
              aria-label="Mostrar comentários"
            >
              <MessageCircle size={24} />
            </button>
          </div>
        ))}
      </div>

      {showComments && (
        <div
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            height: "40vh",
            backgroundColor: "#121212",
            borderTop: "1px solid #333",
            boxShadow: "0 -3px 10px rgba(0,0,0,0.7)",
            zIndex: 50,
          }}
        >
          <CommentSection
            comments={comments}
            currentVideoId={currentVideoId}
            onClose={() => setShowComments(false)}
          />
        </div>
      )}

      <MuteButton
        muted={mutedGlobal}
        onToggle={() => setMutedGlobal((prev) => !prev)}
      />
    </div>
  );
}
