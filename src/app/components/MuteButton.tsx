"use client";
import { Volume2, VolumeX } from "lucide-react";

type MuteButtonProps = {
  muted: boolean;
  onToggle: () => void;
};

export function MuteButton({ muted, onToggle }: MuteButtonProps) {
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
    <button
      onClick={onToggle}
      style={{
        ...buttonStyle,
        position: "fixed",
        top: 20,
        right: 20,
        width: "clamp(40px, 6vw, 60px)",
        height: "clamp(40px, 6vw, 60px)",
        zIndex: 30,
      }}
      aria-label={muted ? "Unmute all videos" : "Mute all videos"}
    >
      {muted ? <VolumeX size={24} /> : <Volume2 size={24} />}
    </button>
  );
}
