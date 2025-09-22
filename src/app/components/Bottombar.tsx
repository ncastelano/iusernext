"use client";

import React from "react";
import { Home, MapPin, User, Plus, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useUser } from "@/app/components/UserContext";
import Image from "next/image";

export default function BottomBar() {
  const router = useRouter();
  const { user } = useUser();

  const handleNavigate = (path: string) => router.push(path);
  const handleUserClick = () => {
    router.push(user?.namePage ? `/${user.namePage.toLowerCase()}` : "/login");
  };

  // Barra ajustada (30% menor)
  const barStyle: React.CSSProperties = {
    position: "fixed",
    bottom: 0,
    left: 0,
    width: "100vw",
    height: "clamp(84px, 14vh, 126px)", // 30% menor
    background:
      "linear-gradient(to top, rgba(0,0,0,1), rgba(0,0,0,0.8), rgba(0,0,0,0.5), transparent)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 1000,
    padding: "0 1rem",
    boxSizing: "border-box",
  };

  const navButtonStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "none",
    border: "none",
    color: "white",
    fontSize: "clamp(14px, 2.8vw, 20px)", // 30% menor
    cursor: "pointer",
    flexShrink: 0,
    gap: "0.35rem",
  };

  const profileImageWrapper: React.CSSProperties = {
    width: "clamp(39px, 7vw, 56px)", // 30% menor
    height: "clamp(39px, 7vw, 56px)",
    borderRadius: "50%",
    overflow: "hidden",
    border: "2px solid white",
    position: "relative",
  };

  const centerButtonsStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "clamp(1.4rem, 5.6vw, 2.8rem)", // 30% menor
    flexGrow: 1,
  };

  return (
    <div style={barStyle}>
      {/* Botão perfil à esquerda */}
      <button style={navButtonStyle} onClick={handleUserClick}>
        {user?.image ? (
          <div style={profileImageWrapper}>
            <Image
              src={user.image}
              alt={user.namePage || "User"}
              fill
              style={{ objectFit: "cover" }}
            />
          </div>
        ) : (
          <User size="clamp(28px, 7vw, 45px)" color="#fff" /> // 30% menor
        )}
        <span>{user?.namePage ? "Perfil" : "Login"}</span>
      </button>

      {/* Botões centrais */}
      <div style={centerButtonsStyle}>
        <NavIcon
          icon={<Home size="clamp(28px, 7vw, 45px)" color="#fff" />}
          label="Home"
          onClick={() => handleNavigate("/home")}
          style={navButtonStyle}
        />
        <NavIcon
          icon={<MapPin size="clamp(28px, 7vw, 45px)" color="#fff" />}
          label="Mapa"
          onClick={() => handleNavigate("/mapa")}
          style={navButtonStyle}
        />
        <NavIcon
          icon={<Zap size="clamp(28px, 7vw, 45px)" color="#fff" />}
          label="Flash"
          onClick={() => handleNavigate("/flash")}
          style={navButtonStyle}
        />
        <NavIcon
          icon={<Plus size="clamp(28px, 7vw, 45px)" color="#fff" />}
          label="Publicar"
          onClick={() => handleNavigate("/publicar")}
          style={navButtonStyle}
        />
      </div>
    </div>
  );
}

function NavIcon({
  icon,
  label,
  onClick,
  style,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  style: React.CSSProperties;
}) {
  return (
    <button style={style} onClick={onClick}>
      {icon}
      <span>{label}</span>
    </button>
  );
}
