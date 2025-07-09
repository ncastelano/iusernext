import React from "react";

interface DescriptionProps {
  artistSongName?: string;
}
export const Description: React.FC<DescriptionProps> = ({ artistSongName }) => {
  if (!artistSongName) return null;

  return (
    <div
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        color: "#fff",
        padding: "6px 12px",
        borderRadius: "8px",
        fontSize: "0.9rem",
      }}
    >
      🎵 {artistSongName}
    </div>
  );
};
