"use client";

import { useState, useRef } from "react";
import { VideoPlayer } from "@/app/components/VideoPlayer";
import { UserAvatar } from "@/app/components/UserAvatar";
import { CommentSection } from "@/app/components/CommentSection";
import { MuteButton } from "@/app/components/MuteButton";

import { MessageCircle } from "lucide-react";
import "bootstrap/dist/css/bootstrap.min.css";

import { Anonymous } from "types/anonimous";
import { Video } from "types/video";
import { useVideos } from "../hooks/useVideos";
import { useVideoProgressManager } from "../hooks/useVideoProgressManager";
import { useTouchScroll } from "../hooks/useTouchScroll";
import { useComments } from "../hooks/useComments";

export default function InicioPage({ userId }: Anonymous) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});

  const { videos } = useVideos();
  const [mutedGlobal, setMutedGlobal] = useState(true);
  const [playing, setPlaying] = useState<Record<string, boolean>>({});
  const [videosReady, setVideosReady] = useState<Record<string, boolean>>({});
  const [showComments, setShowComments] = useState(false);
  const [currentVideoId, setCurrentVideoId] = useState("");

  const { comments } = useComments(currentVideoId, showComments);
  useTouchScroll(containerRef);
  useVideoProgressManager(userId, videoRefs);

  const handleCanPlay = async (videoId: string) => {
    setVideosReady((prev) => ({ ...prev, [videoId]: true }));
    if (userId) {
      const video = videoRefs.current[videoId];
      if (video) {
        const { getVideoProgress } = await import("@/lib/videoProgress");
        const savedPosition = await getVideoProgress(userId, videoId);
        if (savedPosition > 0) video.currentTime = savedPosition;
      }
    }
    setPlaying((prev) => ({ ...prev, [videoId]: true }));
  };

  const togglePlay = (videoId: string) => {
    const video = videoRefs.current[videoId];
    if (!video) return;
    playing[videoId] ? video.pause() : video.play();
    setPlaying((prev) => ({ ...prev, [videoId]: !prev[videoId] }));
  };

  const toggleComments = (videoId: string) => {
    if (showComments && currentVideoId === videoId) {
      setShowComments(false);
      setCurrentVideoId("");
    } else {
      setCurrentVideoId(videoId);
      setShowComments(true);
    }
  };

  return (
    <div className="vh-100" style={{ overflow: "hidden" }}>
      <div
        ref={containerRef}
        className="d-flex flex-row overflow-auto"
        style={{
          scrollSnapType: "x mandatory",
          height: showComments ? "60vh" : "100vh",
          transition: "height 0.3s ease",
        }}
      >
        {videos.map((video: Video) => (
          <div
            key={video.videoID}
            className="flex-shrink-0 w-100 d-flex align-items-center justify-content-center position-relative"
            style={{ scrollSnapAlign: "center" }}
          >
            <VideoPlayer
              video={video}
              isPlaying={!!playing[video.videoID]}
              isReady={!!videosReady[video.videoID]}
              muted={mutedGlobal}
              onCanPlay={handleCanPlay}
              onPlayToggle={togglePlay}
              videoRefs={videoRefs}
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
