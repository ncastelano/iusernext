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

  // Estilo base idêntico ao userProfileImage da Home, responsivo e com borda e sombra
  const iconBaseStyle: React.CSSProperties = {
    width: "clamp(60px, 8vw, 90px)",
    height: "clamp(60px, 8vw, 90px)",
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

  const activeIconStyle: React.CSSProperties = {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    boxShadow: "0 0 12px 2px rgba(255,255,255,0.7)",
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
        bottom: 24,
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: menuOpen ? 20 : 0,
        zIndex: 1000,
        padding: menuOpen ? "12px 24px" : "0",
        transition: "all 0.3s ease",
        userSelect: "none",
        backgroundColor: menuOpen ? "rgba(0,0,0,0.4)" : "transparent",
        borderRadius: menuOpen ? 60 : 0,
        boxShadow: menuOpen ? "0 0 15px rgba(255,255,255,0.2)" : "none",
      }}
      aria-label="Navigation menu"
    >
      {/* Botão principal - Menu */}
      <div
        onClick={handleMenuToggle}
        style={{
          ...iconBaseStyle,
          ...(menuOpen ? activeIconStyle : {}),
          minWidth: "clamp(60px, 8vw, 90px)",
          minHeight: "clamp(60px, 8vw, 90px)",
          padding: 0,
          boxSizing: "border-box",
          userSelect: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
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
        <Menu size={32} color="#fff" />
      </div>

      {/* Ícones que aparecem quando o menu está aberto */}
      <div
        id="nav-icons"
        style={{
          display: "flex",
          gap: 20,
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? "auto" : "none",
          transition: "opacity 0.3s ease 0.1s, transform 0.3s ease",
          transform: menuOpen ? "translateY(0)" : "translateY(20px)",
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
                  boxShadow: "0 0 10px 2px rgba(255,255,255,0.6)",
                }
              : {}),
            overflow: "hidden",
            userSelect: "none",
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
              width={90}
              height={90}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: "50%",
                display: "block",
                userSelect: "none",
              }}
              priority
            />
          ) : (
            <UserRoundPen size={32} color="#fff" />
          )}
        </div>

        {/* MAP ICON */}
        <div
          onClick={handleMapaClick}
          style={{
            ...iconBaseStyle,
            userSelect: "none",
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
          <MapPinHouse size={32} color="#fff" />
        </div>

        {/* UPLOAD ICON */}
        <div
          onClick={handleUploadClick}
          style={{
            ...iconBaseStyle,
            userSelect: "none",
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
          <ImageUp size={32} color="#fff" />
        </div>
      </div>
    </nav>
  );
}

export default NavigationBar;
