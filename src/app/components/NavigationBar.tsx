"use client";
import { Zap, UserRoundPen, MapPinHouse, ImageUp } from "lucide-react";
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
    backgroundColor: "#222",
    boxShadow: "0 0 6px rgba(255,255,255,0.5)",
    transition: "all 0.3s ease",
    overflow: "hidden",
    boxSizing: "border-box",
  };

  const handleUserClick = () => {
    router.push(user?.name ? `/${user.name}` : "/login");
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
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
        padding: "12px 24px",
        borderRadius: 60,
        zIndex: 1000,
        background: "rgba(255, 255, 255, 0.15)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.25)",
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
        }}
        title={user?.name || "Login"}
        role="button"
        tabIndex={0}
        onKeyDown={(e) =>
          (e.key === "Enter" || e.key === " ") && handleUserClick()
        }
      >
        {user?.image ? (
          <Image
            src={user.image}
            alt={user.name || "User"}
            width={80}
            height={80}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              borderRadius: "50%",
            }}
            priority
          />
        ) : (
          <UserRoundPen size={32} color="#fff" />
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
        <MapPinHouse size={32} color="#fff" />
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
        <ImageUp size={32} color="#fff" />
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
    </nav>
  );
}

export default NavigationBar;
