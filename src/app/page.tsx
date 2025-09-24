"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter(); // Hook para navegação programática

  // Estilo base compartilhado para os cards
  const cardStyle: React.CSSProperties = {
    cursor: "pointer", // Cursor indica que é clicável
    padding: "clamp(1rem, 2vw, 2rem) clamp(2rem, 4vw, 3rem)", // Espaço interno (top/bottom e left/right) responsivo
    borderRadius: "16px", // Bordas arredondadas do card
    background: "rgba(255, 255, 255, 0.05)", // Fundo semitransparente
    backdropFilter: "blur(10px)", // Desfoque do que estiver atrás do card
    WebkitBackdropFilter: "blur(10px)", // Compatibilidade Safari
    border: "1px solid rgba(255, 255, 255, 0.1)", // Borda fina e semitransparente
    color: "white", // Cor do texto
    width: "80%", // Largura relativa ao container (ajustável)
    maxWidth: "500px", // Máximo 500px para manter retângulo horizontal
    height: "clamp(100px, 15vw, 140px)", // Altura proporcional e responsiva
    textAlign: "center", // Centraliza o texto dentro do card
    transition: "transform 0.3s, box-shadow 0.3s", // Transição suave para hover (transformação e sombra)
    display: "flex", // Flex para posicionar conteúdo
    justifyContent: "center", // Centraliza horizontalmente o conteúdo do card
    alignItems: "center", // Centraliza verticalmente o conteúdo
    gap: "1rem", // Espaço entre elementos dentro do card
    flexDirection: "row", // Coloca elementos em linha (icone + texto)
  };

  return (
    <div
      style={{
        display: "flex", // Container flex
        flexDirection: "column", // Empilha os cards verticalmente
        justifyContent: "center", // Centraliza verticalmente na tela
        alignItems: "center", // Centraliza horizontalmente na tela
        minHeight: "100dvh", // Ocupa toda a altura da tela (desktop e mobile)
        gap: "clamp(1rem, 4vw, 2rem)", // Espaço entre os cards (responsivo)
        padding: "2rem 1rem", // Espaçamento interno do container (vertical e horizontal)
        width: "100%", // Ocupa 100% da largura disponível
        background: "linear-gradient(135deg, #0f766e, #0f5976, #000000)", // Fundo degradê
        boxSizing: "border-box", // Evita overflow pelo padding
      }}
    >
      {/* Card iUser */}
      <div
        style={cardStyle}
        onClick={() => router.push("/inicio")} // Navegação ao clicar
        onMouseEnter={(e) => {
          const target = e.currentTarget as HTMLDivElement;
          target.style.transform = "scale(1.05)"; // Leve aumento ao passar o mouse
          target.style.boxShadow = "0 8px 20px rgba(0,0,0,0.4)"; // Sombra ao passar o mouse
        }}
        onMouseLeave={(e) => {
          const target = e.currentTarget as HTMLDivElement;
          target.style.transform = "scale(1)"; // Retorna ao tamanho normal
          target.style.boxShadow = "none"; // Remove sombra
        }}
      >
        <Image
          src="/icon/icon1.png"
          alt="Logo iUser"
          width={50}
          height={50}
          style={{
            width: "clamp(40px, 8vw, 50px)", // Largura responsiva do ícone
            height: "auto", // Mantém proporção
          }}
        />
        <h2
          style={{
            margin: 0, // Remove margem padrão
            fontSize: "clamp(1.2rem, 3vw, 1.5rem)", // Tamanho do texto responsivo
          }}
        >
          iUser
        </h2>
      </div>

      {/* Card iUser Training */}
      <div
        style={{
          ...cardStyle, // Reaproveita o estilo base
          fontFamily: '"Caveat", cursive', // Fonte diferenciada para este card
          fontSize: "clamp(1.5rem, 4vw, 2rem)", // Tamanho do texto responsivo
          fontWeight: 600, // Negrito
          textShadow: "0 4px 20px rgba(0,0,0,0.9)", // Sombra do texto
        }}
        onClick={() => router.push("/training/login")} // Navegação ao clicar
        onMouseEnter={(e) => {
          const target = e.currentTarget as HTMLDivElement;
          target.style.transform = "scale(1.05)";
          target.style.boxShadow = "0 8px 20px rgba(0,0,0,0.4)";
        }}
        onMouseLeave={(e) => {
          const target = e.currentTarget as HTMLDivElement;
          target.style.transform = "scale(1)";
          target.style.boxShadow = "none";
        }}
      >
        iUser <span style={{ color: "#22c55e" }}>Training</span>{" "}
        {/* Texto colorido */}
      </div>
    </div>
  );
}
