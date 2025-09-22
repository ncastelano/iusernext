"use client";
import { Zap, CircleUserRound, MapPin, Plus } from "lucide-react";
import React from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/app/components/UserContext";
import Image from "next/image";

function NavigationBar() {
  const router = useRouter();
  const { user } = useUser();

  const iconBaseStyle: React.CSSProperties = {
    width: "clamp(60px, 8vw, 80px)",
    height: "clamp(60px, 8vw, 80px)",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    border: "2px solid white",
    backgroundColor: "transparent",
    backdropFilter: "blur(10px)",
    boxShadow: "0 0 6px rgba(255,255,255,0.5)",
    transition: "all 0.3s ease",
    overflow: "hidden", // <- garante que nada escape
    boxSizing: "border-box",
    flexShrink: 0,
  };

  const handleUserClick = () => {
    router.push(user?.namePage ? `/${user.namePage}` : "/login");
  };

  const handleMapaClick = () => {
    router.push("/mapa");
  };

  const handleUploadClick = () => {
    router.push("/upload");
  };

  const handleFlashClick = () => {
    router.push("/flash");
  };

  return (
    <nav
      style={{
        position: "fixed",
        bottom: 70,
        left: 0,
        right: 0,
        margin: "0 auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
        padding: "12px 24px",
        borderRadius: 60,
        zIndex: 1000,
        background: "rgba(0,0,0,0.3)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        border: "1px solid rgba(255,255,255,0.2)",
        maxWidth: "min(95vw, 480px)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
      }}
    >
      {/* Avatar ou ícone do usuário */}
      <div
        onClick={handleUserClick}
        style={{
          ...iconBaseStyle,
          ...(user?.image
            ? {
                backgroundColor: "transparent",
                boxShadow: "0 0 10px 2px rgba(255,255,255,0.6)",
              }
            : {}),
          position: "relative", // necessário pro <Image fill />
        }}
        title={user?.namePage || "Login"}
        role="button"
        tabIndex={0}
        onKeyDown={(e) =>
          (e.key === "Enter" || e.key === " ") && handleUserClick()
        }
      >
        {user?.image ? (
          <Image
            src={user.image}
            alt={user.namePage || "User"}
            fill
            style={{
              objectFit: "cover",
              borderRadius: "50%",
            }}
            priority
          />
        ) : (
          <CircleUserRound size={32} color="#fff" />
        )}
      </div>

      {/* Mapa */}
      <div
        onClick={handleMapaClick}
        style={iconBaseStyle}
        title="Mapa"
        role="button"
        tabIndex={0}
        onKeyDown={(e) =>
          (e.key === "Enter" || e.key === " ") && handleMapaClick()
        }
      >
        <MapPin size={32} color="#fff" />
      </div>

      {/* Flash */}
      <div
        onClick={handleFlashClick}
        style={iconBaseStyle}
        title="Flash"
        role="button"
        tabIndex={0}
        onKeyDown={(e) =>
          (e.key === "Enter" || e.key === " ") && handleFlashClick()
        }
      >
        <Zap size={32} color="#fff" />
      </div>

      {/* Upload */}
      <div
        onClick={handleUploadClick}
        style={iconBaseStyle}
        title="Upload"
        role="button"
        tabIndex={0}
        onKeyDown={(e) =>
          (e.key === "Enter" || e.key === " ") && handleUploadClick()
        }
      >
        <Plus size={32} color="#fff" />
      </div>
    </nav>
  );
}

export default NavigationBar;
