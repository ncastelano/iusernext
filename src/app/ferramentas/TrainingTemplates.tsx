"use client";

import CadastroTreino from "./CadastroTreino";
import { treinoAB, treinoAB2, treinoABC, treinoABC2 } from "./TrainingModels";

export default function TrainingTemplates() {
  const renderTreinoRow = (treino: any, title: string) => (
    <div style={{ marginBottom: "40px" }}>
      <h2
        style={{
          color: "#4caf50",
          marginBottom: "20px",
          textAlign: "center",
          fontSize: "1.6rem",
          fontWeight: "bold",
        }}
      >
        {title}
      </h2>
      <div
        style={{
          display: "flex",
          gap: "15px",
          overflowX: "auto",
          paddingBottom: "10px",
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(76, 175, 80, 0.4) rgba(76, 175, 80, 0.1)",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {Object.keys(treino).map((dayKey) => {
          const day = treino[dayKey];
          return (
            <div
              key={dayKey}
              style={{
                flex: "0 0 250px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "12px",
                padding: "15px",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
                boxShadow: "0 4px 15px rgba(0,0,0,0.3)",
              }}
            >
              <h3 style={{ color: "#4caf50", marginBottom: "5px" }}>
                {day.title}
              </h3>
              <p style={{ marginBottom: "10px", fontSize: "0.9rem" }}>
                {day.description}
              </p>
              <ul style={{ paddingLeft: "15px", fontSize: "0.85rem" }}>
                {day.exercises.map((exercise: any, idx: number) => (
                  <li key={idx} style={{ color: "#fff", marginBottom: "4px" }}>
                    <strong>{exercise.muscle}:</strong> {exercise.name}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div
      style={{
        background:
          "linear-gradient(135deg, rgba(76, 175, 80, 0.15), rgba(76, 175, 80, 0.05))",
        borderRadius: "16px",
        padding: "20px",
        border: "1px solid rgba(76, 175, 80, 0.4)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        boxShadow: "0 8px 20px rgba(0,0,0,0.5)",
      }}
    >
      {renderTreinoRow(treinoAB, "🏋️ Treino AB")}
      {renderTreinoRow(treinoAB2, "🏋️ Treino AB Alternativo")}
      {renderTreinoRow(treinoABC, "🏋️ Treino ABC")}
      {renderTreinoRow(treinoABC2, "🏋️ Treino ABC Alternativo")}
      {/* Adicione aqui treinoABCD, treinoABCD2, treinoABCDE, treinoABCDE2 */}

      <CadastroTreino />
    </div>
  );
}
