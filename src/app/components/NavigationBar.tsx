"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/app/components/UserContext";
import { UserRoundPen, MapPinHouse, ImageUp, Menu } from "lucide-react";
import Image from "next/image";

function NavigationBar() {
  const router = useRouter();
  const { user } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);

  const iconBaseStyle: React.CSSProperties = {
    width: "clamp(40px, 6vw, 80px)",
    height: "clamp(40px, 6vw, 80px)",
    cursor: "pointer",
    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
    userSelect: "none",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
  };

  const activeIconStyle: React.CSSProperties = {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    boxShadow: "0 0 12px 2px rgba(255,255,255,0.4)",
  };

  const handleUserClick = () => {
    setMenuOpen(false);
    if (user?.name) {
      router.push(`/${user.name}`);
    } else {
      router.push("/login");
    }
  };

  const handleMapaClick = () => {
    setMenuOpen(false);
    router.push("/mapa");
  };

  const handleUploadClick = () => {
    setMenuOpen(false);
    router.push("/upload");
  };

  const handleMenuToggle = () => {
    setMenuOpen((prev) => !prev);
  };

  return (
    <nav
      style={{
        position: "fixed",
        bottom: 30,
        left: 30, // Mudei aqui para posicionar no canto esquerdo
        // Removi left: "50%" e transform translateX(-50%)
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: menuOpen ? 24 : 0,
        zIndex: 1000,
        userSelect: "none",
        padding: menuOpen ? "12px 24px" : "12px",
        width: menuOpen ? "auto" : "clamp(40px, 6vw, 80px)",
        transition: "width 0.4s ease, padding 0.4s ease, gap 0.4s ease",
      }}
      aria-label="Navigation menu"
    >
      {/* Ícone menu sempre visível */}
      <div
        onClick={handleMenuToggle}
        style={{
          ...iconBaseStyle,
          ...(menuOpen ? activeIconStyle : {}),
          minWidth: "clamp(40px, 6vw, 80px)",
          minHeight: "clamp(40px, 6vw, 80px)",
          padding: 0,
          boxSizing: "border-box",
        }}
        aria-expanded={menuOpen}
        aria-controls="nav-icons"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            handleMenuToggle();
          }
        }}
        title="Menu"
      >
        <Menu size={28} />
      </div>

      {/* Ícones que aparecem quando menu aberto */}
      <div
        id="nav-icons"
        style={{
          display: "flex",
          gap: 24,
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? "auto" : "none",
          transition: "opacity 0.4s ease 0.15s",
        }}
      >
        {/* USER ICON OR AVATAR */}
        <div
          onClick={handleUserClick}
          style={{
            ...iconBaseStyle,
            ...(user?.image
              ? {
                  backgroundColor: "transparent",
                  boxShadow: "0 0 10px 2px rgba(255,255,255,0.5)",
                }
              : {}),
            overflow: "hidden",
            transform: menuOpen ? "translateY(0)" : "translateY(20px)",
            transition: "transform 0.4s ease",
          }}
          title={user?.name || "Login"}
          tabIndex={menuOpen ? 0 : -1}
          role="button"
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              handleUserClick();
            }
          }}
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
                display: "block",
              }}
            />
          ) : (
            <UserRoundPen size={28} />
          )}
        </div>

        {/* MAP ICON */}
        <div
          onClick={handleMapaClick}
          style={{
            ...iconBaseStyle,
            transform: menuOpen ? "translateY(0)" : "translateY(20px)",
            transition: "transform 0.4s ease 0.05s",
          }}
          title="Mapa"
          tabIndex={menuOpen ? 0 : -1}
          role="button"
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              handleMapaClick();
            }
          }}
        >
          <MapPinHouse size={28} />
        </div>

        {/* UPLOAD ICON */}
        <div
          onClick={handleUploadClick}
          style={{
            ...iconBaseStyle,
            transform: menuOpen ? "translateY(0)" : "translateY(20px)",
            transition: "transform 0.4s ease 0.1s",
          }}
          title="Upload"
          tabIndex={menuOpen ? 0 : -1}
          role="button"
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              handleUploadClick();
            }
          }}
        >
          <ImageUp size={28} />
        </div>
      </div>
    </nav>
  );
}

export default NavigationBar;
