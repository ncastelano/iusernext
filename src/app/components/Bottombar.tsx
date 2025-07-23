"use client";

import React from "react";
import { Home, MapPin, User, Plus, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useUser } from "@/app/components/UserContext";
import Image from "next/image";

const NAVBAR_HEIGHT = 90;

export default function BottomBar() {
  const router = useRouter();
  const { user } = useUser();

  const handleNavigate = (path: string) => router.push(path);

  const handleUserClick = () => {
    router.push(user?.namePage ? `/${user.namePage.toLowerCase()}` : "/login");
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        height: NAVBAR_HEIGHT,
        width: "100%",
        background:
          "linear-gradient(to top, rgba(0, 0, 0, 1.0), rgba(0, 0, 0, 0.8), rgba(0,0,0, 0.5), transparent)",
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        zIndex: 10,
      }}
    >
      {/* Home */}
      <NavIcon
        icon={<Home size={32} />}
        label="Home"
        onClick={() => handleNavigate("/home")}
      />

      {/* Mapa */}
      <NavIcon
        icon={<MapPin size={32} />}
        label="Mapa"
        onClick={() => handleNavigate("/mapa")}
      />

      {/* Flash */}
      <NavIcon
        icon={<Zap size={32} />}
        label="Flash"
        onClick={() => handleNavigate("/flash")}
      />

      {/* Upload */}
      <NavIcon
        icon={<Plus size={32} />}
        label="Upload"
        onClick={() => handleNavigate("/upload")}
      />

      {/* Perfil */}
      <button
        onClick={handleUserClick}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          background: "none",
          border: "none",
          color: "white",
          fontSize: "0.75rem",
          cursor: "pointer",
          flexShrink: 0,
          padding: "0.5rem 0.75rem",
        }}
      >
        {user?.image ? (
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              overflow: "hidden",
              border: "2px solid white",
              marginBottom: 4,
            }}
          >
            <Image
              src={user.image}
              alt={user.namePage || "User"}
              width={32}
              height={32}
              style={{ objectFit: "cover", width: "100%", height: "100%" }}
            />
          </div>
        ) : (
          <User size={32} />
        )}
        <span>{user?.namePage ? "Perfil" : "Login"}</span>
      </button>
    </div>
  );
}

function NavIcon({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        background: "none",
        border: "none",
        color: "white",
        fontSize: "0.75rem",
        cursor: "pointer",
        flexShrink: 0,
        padding: "0.5rem 0.75rem",
      }}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
