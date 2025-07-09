// app/components/IamHere.tsx
import React from "react";

interface IamHereProps {
  latitude?: number;
  longitude?: number;
}
export const IamHere: React.FC<IamHereProps> = ({ latitude, longitude }) => {
  if (typeof latitude !== "number" || typeof longitude !== "number") {
    return null;
  }

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
      📍 {latitude.toFixed(4)}, {longitude.toFixed(4)}
    </div>
  );
};
