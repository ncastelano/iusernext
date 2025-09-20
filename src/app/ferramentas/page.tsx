"use client";

import { useState, useEffect } from "react";
import AnamnesisTemplates from "./AnamnesisTemplates";
import TrainingTemplates from "./TrainingTemplates";
import Scheduler from "./Scheduler";
import CadastroDeTreinos from "./CadastroTreino";

export default function Ferramentas() {
  const [bgPosition, setBgPosition] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setBgPosition((prev) => (prev >= 100 ? 0 : prev + 0.1));
    }, 16);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        position: "relative",
        minHeight: "100dvh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        padding: "20px",
        boxSizing: "border-box",
        overflow: "hidden",
        color: "#fff",
      }}
    >
      {/* Background gradient animado */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(135deg, #0f5976, #0f766e, #0f7646, #0f7625)",
          backgroundSize: "400% 400%",
          backgroundPosition: `${bgPosition}% 50%`,
          transition: "background-position 0.1s linear",
          zIndex: 1,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          zIndex: 2,
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        {/* Componentes */}
        <Scheduler />
        <CadastroDeTreinos />
        <AnamnesisTemplates />
      </div>
    </div>
  );
}
