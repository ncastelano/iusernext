import Image from "next/image";
import { Video } from "@/app/flash/page"; // Importa a interface Video do Home para manter a tipagem

interface OverlayProps {
  video: Video;
  onCommentClick?: () => void;
  commentCount?: number;
}

export default function Overlay({
  video,
  onCommentClick,
  commentCount,
}: OverlayProps) {
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

      {/*
  {video.latitude !== undefined && video.longitude !== undefined && (
    <p style={{ margin: 0, fontSize: "1.1rem", opacity: 0.8 }}>
      Latitude: {video.latitude.toFixed(5)} | Longitude:{" "}
      {video.longitude.toFixed(5)}
    </p>
  )}
*/}

      {video.artistSongName && (
        <h1 style={styles.songTitle}>{video.artistSongName}</h1>
      )}

      {onCommentClick && (
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button onClick={onCommentClick} style={styles.commentButton}>
            {typeof commentCount === "number" ? ` ${commentCount}` : ""}{" "}
            Comentários
          </button>
        </div>
      )}
    </div>
  );
}

const styles = {
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
};
