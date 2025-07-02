"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/app/components/UserContext";
import { User2, Zap } from "lucide-react";

function NavigationBar() {
  const router = useRouter();
  const { user } = useUser();

  const iconStyle: React.CSSProperties = {
    width: "clamp(40px, 8vw, 100px)",
    height: "clamp(40px, 8vw, 100px)",
    cursor: "pointer",
    transition: "opacity 0.3s",
  };

  const handleUserClick = () => {
    if (user?.username) {
      router.push(`/${user.username}`); // Isso já leva para [name]/page.tsx
    } else {
      router.push("/login");
    }
  };

  const handleFlashClick = () => {
    router.push("/flash");
  };

  return (
    <nav
      style={{
        position: "fixed",
        bottom: 20,
        left: "50%",
        transform: "translateX(-50%)",
        backgroundColor: "rgba(0,0,0,0.6)",
        padding: "clamp(8px, 2vw, 16px) clamp(16px, 6vw, 40px)",
        borderRadius: "20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "clamp(24px, 8vw, 60px)",
        zIndex: 1000,
        boxShadow: "0 0 10px rgba(0,0,0,0.5)",
      }}
    >
      {/* USER ICON OR AVATAR */}
      <div onClick={handleUserClick} style={iconStyle}>
        {user?.image ? (
          <img
            src={user.image}
            alt={user.name || "User"}
            style={{
              ...iconStyle,
              borderRadius: "50%",
              objectFit: "cover",
              display: "block",
            }}
          />
        ) : (
          <User2 color="#fff" style={iconStyle} />
        )}
      </div>

      {/* FLASH ICON */}
      <div onClick={handleFlashClick} style={iconStyle}>
        <Zap color="#fff" style={iconStyle} />
      </div>
    </nav>
  );
}

export default NavigationBar;
