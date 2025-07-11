"use client";

import { useEffect, useState, useRef } from "react";
import {
  collection,
  getDocs,
  orderBy,
  query,
  addDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import Image from "next/image";
import { Timestamp } from "firebase/firestore";

interface Video {
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
  userId: string;
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

  async function loadComments(videoID: string) {
    setLoadingComments(true);
    try {
      const ref = collection(db, "videos", videoID, "comments");
      const snapshot = await getDocs(ref);

      const loaded: Comment[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data.userId || "unknown",
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
    return <div style={styles.loading}>Nenhum vídeo encontrado.</div>;
  }

  return (
    <div
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      style={styles.container}
    >
      <div
        style={{
          display: "flex",
          width: "200vw",
          height: isCommentsOpen ? "60vh" : "100vh",
          transform: isAnimating
            ? animationDirection === "left"
              ? "translateX(-100vw)"
              : "translateX(100vw)"
            : "translateX(0)",
          transition: isAnimating ? "transform 0.5s ease" : "none",
        }}
        onTransitionEnd={onTransitionEnd}
      >
        <div style={styles.videoWrapper}>
          {isPlaying && canPlayVideo ? (
            <video
              src={currentVideo.videoUrl}
              controls
              autoPlay
              style={styles.video}
              onEnded={() => setIsPlaying(false)}
            />
          ) : (
            <Image
              src={currentVideo.thumbnailUrl}
              alt={currentVideo.artistSongName || "Thumbnail"}
              fill
              style={styles.thumbnail}
              sizes="100vw"
              priority
            />
          )}
          <Overlay
            video={currentVideo}
            onCommentClick={async () => {
              const shouldOpen = !isCommentsOpen;
              setIsCommentsOpen(shouldOpen);
              if (shouldOpen && currentVideo.videoID) {
                await loadComments(currentVideo.videoID);
              }
            }}
          />
        </div>

        {isAnimating && upcomingVideo && (
          <div style={styles.videoWrapper}>
            <Image
              src={upcomingVideo.thumbnailUrl}
              alt={upcomingVideo.artistSongName || "Thumbnail"}
              fill
              style={styles.thumbnail}
              sizes="100vw"
              priority
            />
            <Overlay video={upcomingVideo} />
          </div>
        )}
      </div>

      {isCommentsOpen && (
        <div style={styles.commentsOverlay}>
          {loadingComments ? (
            <p>Carregando comentários...</p>
          ) : comments.length === 0 ? (
            <p>Seja o primeiro a comentar!</p>
          ) : (
            comments.map((comment) => (
              <div
                key={comment.id}
                style={{
                  marginBottom: "1rem",
                  display: "flex",
                  gap: "0.75rem",
                  alignItems: "flex-start",
                }}
              >
                {comment.userProfileImage ? (
                  <Image
                    src={comment.userProfileImage}
                    alt={comment.userName}
                    width={40}
                    height={40}
                    style={{ borderRadius: "50%", objectFit: "cover" }}
                  />
                ) : (
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      backgroundColor: "#555",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      color: "#ccc",
                      fontSize: "1.2rem",
                      userSelect: "none",
                    }}
                  >
                    ?
                  </div>
                )}
                <div>
                  <strong>{comment.userName}</strong>
                  <p style={{ margin: 0 }}>{comment.text}</p>
                </div>
              </div>
            ))
          )}

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const input = form.elements.namedItem(
                "comment"
              ) as HTMLInputElement;
              const text = input.value.trim();
              if (!text || !currentVideo?.videoID) return;

              try {
                const ref = collection(
                  db,
                  "videos",
                  currentVideo.videoID,
                  "comments"
                );
                await addDoc(ref, { text, createdAt: Date.now() });
                setComments((prev) => [
                  ...prev,
                  {
                    id: "temp-id-" + Date.now(),
                    userId: "unknown",
                    userName: "Anônimo",
                    userProfileImage: "",
                    text: text,
                    timestamp: null,
                    replies: [],
                  },
                ]);
                input.value = "";
              } catch (err) {
                console.error("Erro ao comentar:", err);
              }
            }}
            style={{ marginTop: "1rem", display: "flex", gap: "0.5rem" }}
          >
            <input
              name="comment"
              placeholder="Digite seu comentário..."
              style={{
                flex: 1,
                padding: "0.5rem",
                borderRadius: "6px",
                border: "none",
                fontSize: "1rem",
              }}
            />
            <button
              type="submit"
              style={{
                padding: "0.5rem 1rem",
                background: "#fff",
                color: "#000",
                border: "none",
                borderRadius: "6px",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              Enviar
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

function Overlay({
  video,
  onCommentClick,
}: {
  video: Video;
  onCommentClick?: () => void;
}) {
  return (
    <div style={styles.overlay}>
      {(video.userProfileImage || video.userName) && (
        <div style={styles.profileRow}>
          {video.userProfileImage ? (
            <Image
              src={video.userProfileImage}
              alt={video.userName || "Avatar"}
              width={60}
              height={60}
              style={styles.avatar}
            />
          ) : (
            <div style={styles.defaultAvatar}>?</div>
          )}
          {video.userName && (
            <span style={styles.username}>{video.userName}</span>
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
        <h1 style={styles.songTitle}>{video.artistSongName}</h1>
      )}

      {onCommentClick && (
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button onClick={onCommentClick} style={styles.commentButton}>
            Comentários
          </button>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    width: "100vw",
    height: "100vh",
    overflow: "hidden",
    position: "relative" as const,
    userSelect: "none" as const,
    touchAction: "pan-y" as const,
    backgroundColor: "#000",
    display: "flex",
    flexDirection: "column" as const,
  },
  loading: {
    backgroundColor: "#000",
    color: "#fff",
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "1.5rem",
    fontWeight: "bold",
  },
  videoWrapper: {
    width: "100vw",
    height: "100%",
    position: "relative" as const,
    flexShrink: 0,
    backgroundColor: "#000",
  },
  video: {
    width: "100%",
    height: "100%",
    objectFit: "cover" as const,
    position: "absolute" as const,
    top: 0,
    left: 0,
    zIndex: 0,
  },
  thumbnail: {
    objectFit: "cover" as const,
    filter: "brightness(0.6)",
    position: "absolute" as const,
    top: 0,
    left: 0,
    zIndex: 0,
  },
  overlay: {
    position: "absolute" as const,
    top: 20,
    left: 20,
    right: 20,
    zIndex: 10,
    color: "#fff",
    textShadow: "0 0 5px rgba(0,0,0,0.8)",
    display: "flex",
    flexDirection: "column" as const,
    gap: 12,
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  profileRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginTop: 10,
  },
  avatar: {
    borderRadius: "50%",
    objectFit: "cover" as const,
    border: "2px solid white",
    boxShadow: "0 0 6px rgba(255,255,255,0.7)",
  },
  defaultAvatar: {
    width: 60,
    height: 60,
    borderRadius: "50%",
    backgroundColor: "#555",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: "#ccc",
    fontSize: "1.5rem",
  },
  username: {
    fontWeight: 600,
    fontSize: "1.3rem",
    textShadow: "0 0 3px rgba(0,0,0,0.7)",
    userSelect: "text" as const,
  },
  songTitle: {
    margin: 0,
    fontSize: "2.5rem",
    fontWeight: "bold",
    maxWidth: "90vw",
    overflowWrap: "break-word" as const,
  },
  commentButton: {
    background: "transparent",
    border: "1px solid white",
    padding: "6px 12px",
    borderRadius: "8px",
    color: "white",
    fontSize: "1rem",
    cursor: "pointer",
    alignSelf: "flex-start",
  },
  commentsOverlay: {
    position: "absolute" as const,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#111",
    color: "#fff",
    maxHeight: "40vh",
    overflowY: "auto" as const,
    padding: "1rem",
    zIndex: 20,
    borderTop: "1px solid #333",
  },
};
