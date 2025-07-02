"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  addDoc,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import Image from "next/image";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  MessageCircle,
  Send,
} from "lucide-react";
import "bootstrap/dist/css/bootstrap.min.css";
import { saveVideoProgress, getVideoProgress } from "./videoProgress";

type Video = {
  videoID: string;
  thumbnailUrl: string;
  userProfileImage: string;
  videoUrl?: string;
  publishedDateTime: number;
};

type Comment = {
  id: string;
  userId: string;
  userName: string;
  userProfileImage: string;
  text: string;
  timestamp: number;
};

type Props = {
  userId: string;
  userName?: string;
  userProfileImage?: string;
};

export default function InicioPage({
  userId,
  userName = "Usuário",
  userProfileImage = "/default-profile.png",
}: Props) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [videosReady, setVideosReady] = useState<Record<string, boolean>>({});
  const [playing, setPlaying] = useState<Record<string, boolean>>({});
  const [mutedGlobal, setMutedGlobal] = useState(true);
  const [showComments, setShowComments] = useState(false);
  const [currentVideoId, setCurrentVideoId] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});
  const commentsEndRef = useRef<HTMLDivElement>(null);

  // Buscar vídeos
  useEffect(() => {
    const fetchVideos = async () => {
      const q = query(
        collection(db, "videos"),
        where("publishedDateTime", "!=", null),
        orderBy("publishedDateTime", "desc")
      );

      const snapshot = await getDocs(q);
      const fetchedVideos: Video[] = snapshot.docs.map((doc) => ({
        videoID: doc.id,
        ...doc.data(),
      })) as Video[];

      setVideos(fetchedVideos);
    };

    fetchVideos();
  }, []);

  // Navegação touch horizontal
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let startX = 0;
    let scrollLeft = 0;

    const onTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      scrollLeft = container.scrollLeft;
    };

    const onTouchMove = (e: TouchEvent) => {
      const x = e.touches[0].clientX;
      const walk = startX - x;
      container.scrollLeft = scrollLeft + walk;
    };

    container.addEventListener("touchstart", onTouchStart);
    container.addEventListener("touchmove", onTouchMove);

    return () => {
      container.removeEventListener("touchstart", onTouchStart);
      container.removeEventListener("touchmove", onTouchMove);
    };
  }, []);

  // Carregar comentários quando o vídeo muda ou quando abre/fecha a seção
  useEffect(() => {
    if (!showComments || !currentVideoId) return;

    const commentsRef = collection(db, "videos", currentVideoId, "comments");
    const q = query(commentsRef, orderBy("timestamp", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedComments = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Comment[];
      setComments(loadedComments);

      // Rolagem automática para o final
      setTimeout(() => {
        commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    });

    return () => unsubscribe();
  }, [showComments, currentVideoId]);

  const handleCanPlay = async (id: string) => {
    setVideosReady((prev) => ({ ...prev, [id]: true }));

    if (userId) {
      const savedPosition = await getVideoProgress(userId, id);
      const video = videoRefs.current[id];
      if (video && savedPosition > 0) {
        video.currentTime = savedPosition;
      }
    }

    setPlaying((prev) => ({ ...prev, [id]: true }));
  };

  const togglePlay = (id: string) => {
    const video = videoRefs.current[id];
    if (!video) return;

    if (playing[id]) {
      video.pause();
      setPlaying((prev) => ({ ...prev, [id]: false }));
    } else {
      video.play();
      setPlaying((prev) => ({ ...prev, [id]: true }));
    }
  };

  // Atualiza mute global em todos os vídeos
  useEffect(() => {
    Object.values(videoRefs.current).forEach((video) => {
      if (video) video.muted = mutedGlobal;
    });
  }, [mutedGlobal]);

  const toggleMuteGlobal = () => {
    setMutedGlobal((prev) => !prev);
  };

  // Salva progresso a cada 2s
  useEffect(() => {
    if (!userId) return;

    const interval = setInterval(() => {
      Object.entries(videoRefs.current).forEach(([id, video]) => {
        if (video && !video.paused) {
          saveVideoProgress(userId, id, video.currentTime);
        }
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [userId]);

  // Função para enviar comentário
  const sendComment = async () => {
    if (!newComment.trim() || !currentVideoId || !userId) return;

    try {
      const commentsRef = collection(db, "videos", currentVideoId, "comments");
      await addDoc(commentsRef, {
        userId,
        userName,
        userProfileImage,
        text: newComment.trim(),
        timestamp: serverTimestamp(),
      });
      setNewComment("");
    } catch (error) {
      console.error("Erro ao enviar comentário:", error);
    }
  };

  // Função para alternar comentários
  const toggleComments = (videoId: string) => {
    if (showComments && currentVideoId === videoId) {
      setShowComments(false);
    } else {
      setCurrentVideoId(videoId);
      setShowComments(true);
    }
  };

  const buttonStyle = {
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
  } as React.CSSProperties;

  return (
    <div className="vh-100" style={{ overflow: "hidden" }}>
      {/* Container principal com rolagem horizontal */}
      <div
        ref={containerRef}
        className="d-flex flex-row overflow-auto"
        style={{
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
            {video.videoUrl && videosReady[video.videoID] ? (
              <>
                <video
                  ref={(el) => {
                    videoRefs.current[video.videoID] = el;
                  }}
                  src={video.videoUrl}
                  muted={mutedGlobal}
                  playsInline
                  loop
                  autoPlay
                  className="position-absolute w-100 h-100 object-fit-cover"
                  style={{ zIndex: 0 }}
                  onCanPlay={() => handleCanPlay(video.videoID)}
                  onPlay={() =>
                    setPlaying((prev) => ({ ...prev, [video.videoID]: true }))
                  }
                  onPause={() =>
                    setPlaying((prev) => ({ ...prev, [video.videoID]: false }))
                  }
                />

                <button
                  onClick={() => togglePlay(video.videoID)}
                  style={{
                    ...buttonStyle,
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: "clamp(40px, 8vw, 100px)",
                    height: "clamp(40px, 8vw, 100px)",
                    zIndex: 20,
                    opacity: playing[video.videoID] ? 0 : 1,
                  }}
                  aria-label={
                    playing[video.videoID] ? "Pause video" : "Play video"
                  }
                >
                  {playing[video.videoID] ? (
                    <Pause size={40} />
                  ) : (
                    <Play size={40} />
                  )}
                </button>
              </>
            ) : (
              <>
                {video.videoUrl && (
                  <video
                    src={video.videoUrl}
                    muted
                    playsInline
                    onCanPlay={() => handleCanPlay(video.videoID)}
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

            <div
              className="position-absolute rounded-circle border border-light overflow-hidden"
              style={{
                top: 20,
                left: 20,
                width: "clamp(60px, 10vw, 120px)",
                height: "clamp(60px, 10vw, 120px)",
                boxShadow: "0 0 10px rgba(0,0,0,0.5)",
                zIndex: 10,
              }}
            >
              <Image
                src={video.userProfileImage}
                alt="User avatar"
                width={120}
                height={120}
                style={{ objectFit: "cover" }}
              />
            </div>

            {/* Botão de comentários */}
            <button
              onClick={() => toggleComments(video.videoID)}
              style={{
                ...buttonStyle,
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

      {/* Seção de comentários */}
      {showComments && (
        <div
          className="bg-dark text-white p-3"
          style={{
            height: "40vh",
            overflowY: "auto",
            borderTop: "1px solid #333",
          }}
        >
          <h5 className="mb-3">Comentários</h5>

          {/* Lista de comentários */}
          <div
            className="mb-3"
            style={{ maxHeight: "25vh", overflowY: "auto" }}
          >
            {comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment.id} className="mb-2 d-flex align-items-start">
                  <Image
                    src={comment.userProfileImage}
                    alt={comment.userName}
                    width={40}
                    height={40}
                    className="rounded-circle me-2"
                    style={{ objectFit: "cover" }}
                  />
                  <div>
                    <strong>{comment.userName}</strong>
                    <p className="mb-0">{comment.text}</p>
                    <small className="text-muted">
                      {comment.timestamp
                        ? new Date(comment.timestamp).toLocaleString()
                        : "Agora"}
                    </small>
                  </div>
                </div>
              ))
            ) : (
              <p>Nenhum comentário ainda. Seja o primeiro a comentar!</p>
            )}
            <div ref={commentsEndRef} />
          </div>

          {/* Campo para novo comentário */}
          <div className="d-flex align-items-center">
            <input
              type="text"
              className="form-control bg-secondary text-white border-0"
              placeholder="Adicione um comentário..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && sendComment()}
            />
            <button
              onClick={sendComment}
              className="btn btn-primary ms-2"
              disabled={!newComment.trim()}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Botão de mute */}
      <button
        onClick={toggleMuteGlobal}
        style={{
          ...buttonStyle,
          position: "fixed",
          top: 20,
          right: 20,
          width: "clamp(40px, 6vw, 60px)",
          height: "clamp(40px, 6vw, 60px)",
          zIndex: 30,
        }}
        aria-label={mutedGlobal ? "Unmute all videos" : "Mute all videos"}
      >
        {mutedGlobal ? <VolumeX size={24} /> : <Volume2 size={24} />}
      </button>
    </div>
  );
}
