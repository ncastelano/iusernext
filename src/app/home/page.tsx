"use client";

import { useEffect, useState, useRef } from "react";
import {
  collection,
  getDocs,
  orderBy,
  query,
  addDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import Image from "next/image";
import { getAuth } from "firebase/auth";

import Overlay from "src/app/components/Overlay";

const auth = getAuth();
const user = auth.currentUser;

export interface Video {
  videoID?: string;
  publishedDateTime?: number;
  artistSongName?: string;
  latitude?: number;
  longitude?: number;
  userProfileImage?: string;
  userName?: string;
  thumbnailUrl: string;
  videoUrl?: string;
}

export type Comment = {
  id: string;
  userID: string;
  userName: string;
  userProfileImage: string;
  text: string;
  timestamp: Timestamp | null;
  replies?: Comment[];
};

export default function Home() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationDirection, setAnimationDirection] = useState<
    "left" | "right" | null
  >(null);
  const [nextIndex, setNextIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);

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
            videoUrl: data.videoUrl || undefined,
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

  // *** NOVO: carrega comentários sempre que o vídeo ativo mudar ***
  useEffect(() => {
    const currentVideoID = videos[activeIndex]?.videoID;
    if (currentVideoID) {
      loadComments(currentVideoID);
    } else {
      setComments([]); // limpa comentários se não tiver vídeo
    }
  }, [activeIndex, videos]);

  async function loadComments(videoID: string) {
    setLoadingComments(true);
    try {
      const ref = collection(db, "videos", videoID, "comments");
      const snapshot = await getDocs(ref);

      const loaded: Comment[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          userID: data.userID || "unknown",
          userName: data.userName || "Anônimo",
          userProfileImage: data.userProfileImage || "",
          text: data.text || "",
          timestamp: data.timestamp || null,
          replies: data.replies || [],
        };
      });
      setComments(loaded);
    } catch (error) {
      console.error("Erro ao carregar comentários:", error);
    }
    setLoadingComments(false);
  }

  const nextVideo = () => {
    if (isAnimating || videos.length <= 1) return;
    setIsCommentsOpen(false);
    setAnimationDirection("left");
    setNextIndex((activeIndex + 1) % videos.length);
    setIsAnimating(true);
    setIsPlaying(false);
  };

  const prevVideo = () => {
    if (isAnimating || videos.length <= 1) return;
    setIsCommentsOpen(false);
    setAnimationDirection("right");
    setNextIndex((activeIndex - 1 + videos.length) % videos.length);
    setIsAnimating(true);
    setIsPlaying(false);
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

  const currentVideo = videos[activeIndex];
  const upcomingVideo = nextIndex !== null ? videos[nextIndex] : null;
  const canPlayVideo = !!(currentVideo?.videoID && currentVideo?.videoUrl);

  useEffect(() => {
    if (canPlayVideo && !isPlaying) {
      setIsPlaying(true);
    }
  }, [canPlayVideo, isPlaying]);

  if (loading) {
    return <div style={styles.loading}>Carregando vídeos...</div>;
  }

  if (videos.length === 0) {
    return <div style={styles.loading}>Nenhum vídeo disponível.</div>;
  }

  return (
    <main
      style={styles.container}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div
        style={{
          ...styles.videoWrapper,
          transform:
            animationDirection === "left"
              ? isAnimating
                ? "translateX(-100%)"
                : "translateX(0)"
              : animationDirection === "right"
              ? isAnimating
                ? "translateX(100%)"
                : "translateX(0)"
              : "translateX(0)",
          transition: isAnimating ? "transform 0.5s ease" : undefined,
        }}
        onTransitionEnd={onTransitionEnd}
      >
        {currentVideo && (
          <>
            <video
              key={currentVideo.videoID}
              src={currentVideo.videoUrl}
              poster={currentVideo.thumbnailUrl}
              controls
              autoPlay
              muted
              style={styles.video}
            />
            <Overlay
              video={currentVideo}
              onCommentClick={() => {
                setIsCommentsOpen(true);
                if (currentVideo.videoID) {
                  loadComments(currentVideo.videoID);
                }
              }}
              commentCount={comments.length}
            />
          </>
        )}
      </div>

      {isCommentsOpen && (
        <section style={styles.commentsSection}>
          <button
            onClick={() => setIsCommentsOpen(false)}
            style={styles.closeCommentsButton}
          >
            Fechar comentários
          </button>
          {loadingComments ? (
            <p>Carregando comentários...</p>
          ) : comments.length === 0 ? (
            <p>Sem comentários ainda.</p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} style={styles.comment}>
                <Image
                  src={comment.userProfileImage}
                  alt={comment.userName}
                  width={40}
                  height={40}
                  style={{ borderRadius: "50%" }}
                />
                <div>
                  <strong>{comment.userName}</strong>
                  <p>{comment.text}</p>
                </div>
              </div>
            ))
          )}
        </section>
      )}
    </main>
  );
}

const styles = {
  container: {
    position: "relative" as const,
    width: "100vw",
    height: "100vh",
    overflow: "hidden" as const,
    backgroundColor: "#000",
  },
  videoWrapper: {
    width: "100%",
    height: "100%",
    position: "relative" as const,
  },
  video: {
    width: "100%",
    height: "100%",
    objectFit: "cover" as const,
  },
  loading: {
    color: "#fff",
    fontSize: "1.5rem",
    textAlign: "center" as const,
    marginTop: "40vh",
  },
  commentsSection: {
    position: "absolute" as const,
    bottom: 0,
    left: 0,
    width: "100%",
    maxHeight: "40vh",
    overflowY: "auto" as const,
    backgroundColor: "rgba(0,0,0,0.85)",
    color: "#fff",
    padding: "1rem",
  },
  closeCommentsButton: {
    marginBottom: "1rem",
    backgroundColor: "#222",
    border: "none",
    color: "#fff",
    padding: "0.5rem 1rem",
    cursor: "pointer",
  },
  comment: {
    display: "flex",
    gap: "1rem",
    marginBottom: "1rem",
  },
};
