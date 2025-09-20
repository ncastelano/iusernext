"use client";

export default function AnamnesisTemplates() {
  return (
    <div
      style={{
        background:
          "linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(34, 197, 94, 0.05))",
        borderRadius: "16px",
        padding: "20px",
        border: "1px solid rgba(34, 197, 94, 0.4)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        boxShadow: "0 8px 20px rgba(0,0,0,0.5)",
      }}
    >
      <h2
        style={{
          color: "#22c55e",
          marginBottom: "20px",
          textAlign: "center",
          fontSize: "1.6rem",
          fontWeight: "bold",
        }}
      >
        📋 Modelos de Anamneses
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "20px",
        }}
      >
        {[
          [
            "Modelo Básico",
            "👤 Nome, idade, sexo",
            "⚕️ Histórico de saúde",
            "🎯 Objetivo principal",
            "📏 Medidas corporais iniciais",
          ],
          [
            "Modelo Detalhado",
            "💊 Doenças pré-existentes",
            "🏃 Nível de atividade física",
            "🥗 Hábitos alimentares",
            "🛌 Qualidade do sono",
          ],
          [
            "Modelo Avançado",
            "📈 Avaliação física completa",
            "🧠 Perfil psicológico/motivacional",
            "🩺 Histórico familiar",
            "🧪 Exames recentes",
          ],
        ].map((item, index) => (
          <div
            key={index}
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: "12px",
              padding: "15px",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              boxShadow: "0 4px 15px rgba(0,0,0,0.3)",
            }}
          >
            <h3 style={{ color: "#22c55e", marginBottom: "10px" }}>
              {item[0]}
            </h3>
            {item.slice(1).map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
