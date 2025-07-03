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

  const toggleComments = (videoId: string) => {
    setShowComments((prev) =>
      prev && currentVideoId === videoId ? false : true
    );
    setCurrentVideoId(videoId);
  };

  return (
    <div className="vh-100" style={{ overflow: "hidden" }}>
      <div
        ref={containerRef}
        className="d-flex flex-row"
        style={{
          overflowX: showComments ? "hidden" : "auto", // 🔒 desabilita scroll horizontal
          scrollSnapType: "x mandatory",
          height: showComments ? "60vh" : "100vh",
          transition: "height 0.3s ease",
        }}
      >
        {videos.map((video) => (
          <div
            key={video.videoID}
            className="flex-shrink-0 w-100 d-flex align-items-center justify-content-center position-relative"
            style={{ scrollSnapAlign: "center" }}
          >
            <VideoPlayer video={video} muted={mutedGlobal} />

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

            {/* Mostra o CommentSection apenas no vídeo atual */}
            {showComments && currentVideoId === video.videoID && (
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  zIndex: 30,
                }}
              >
                <CommentSection
                  comments={comments}
                  currentVideoId={currentVideoId}
                  onClose={() => setShowComments(false)}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {showComments && (
        <CommentSection
          comments={comments}
          currentVideoId={currentVideoId}
          onClose={() => setShowComments(false)}
        />
      )}

      <MuteButton
        muted={mutedGlobal}
        onToggle={() => setMutedGlobal((prev) => !prev)}
      />
    </div>
  );
}
