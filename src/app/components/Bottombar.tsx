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

  return (
    <>
      <style>{`
  .bottom-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    height: clamp(60px, 10vh, 90px);
    background: linear-gradient(to top, rgba(0,0,0,1), rgba(0,0,0,0.8), rgba(0,0,0,0.5), transparent);
    display: flex;
    justify-content: space-around;
    align-items: center;
    z-index: 10;
    padding: 0 clamp(1rem, 2vw, 2rem);
  }

  .nav-button {
    display: flex;
    flex-direction: column;
    align-items: center;
    background: none;
    border: none;
    color: white;
    font-size: clamp(10px, 2vw, 14px);
    cursor: pointer;
    flex-shrink: 0;
    padding: 0.5rem clamp(0.4rem, 1vw, 0.75rem);
  }

  .profile-image {
    width: clamp(28px, 5vw, 40px);
    height: clamp(28px, 5vw, 40px);
    border-radius: 50%;
    overflow: hidden;
    border: 2px solid white;
    margin-bottom: 4px;
  }

  /* Aumenta apenas entre 900px e 1200px */
  @media (min-width: 900px) and (max-width: 1199px) {
    .nav-button {
      font-size: 16px;
    }

    .profile-image {
      width: 48px;
      height: 48px;
    }

    .nav-button svg {
      width: 36px;
      height: 36px;
    }
  }
`}</style>

      <div className="bottom-bar">
        {/* Home */}
        <NavIcon
          icon={<Home size="clamp(20px, 5vw, 32px)" />}
          label="Home"
          onClick={() => handleNavigate("/home")}
        />

        {/* Mapa */}
        <NavIcon
          icon={<MapPin size="clamp(20px, 5vw, 32px)" />}
          label="Mapa"
          onClick={() => handleNavigate("/mapa")}
        />

        {/* Flash */}
        <NavIcon
          icon={<Zap size="clamp(20px, 5vw, 32px)" />}
          label="Flash"
          onClick={() => handleNavigate("/flash")}
        />

        {/* Upload */}
        <NavIcon
          icon={<Plus size="clamp(20px, 5vw, 32px)" />}
          label="Upload"
          onClick={() => handleNavigate("/upload")}
        />

        {/* Perfil */}
        <button className="nav-button" onClick={handleUserClick}>
          {user?.image ? (
            <div className="profile-image">
              <Image
                src={user.image}
                alt={user.namePage || "User"}
                fill
                style={{ objectFit: "cover" }}
              />
            </div>
          ) : (
            <User size="clamp(20px, 5vw, 32px)" />
          )}
          <span>{user?.namePage ? "Perfil" : "Login"}</span>
        </button>
      </div>
    </>
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
    <button className="nav-button" onClick={onClick}>
      {icon}
      <span>{label}</span>
    </button>
  );
}
