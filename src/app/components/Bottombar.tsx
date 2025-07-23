import React from "react";
import { Home, MapPin, User, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

const NAVBAR_HEIGHT = 90;

export default function BottomBar() {
  const router = useRouter();

  const handleNavigate = (path: string) => router.push(path);

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
      <NavIcon
        icon={<Home size={40} />}
        label="Home"
        onClick={() => handleNavigate("/home")}
      />
      <NavIcon
        icon={<MapPin size={40} />}
        label="Mapa"
        onClick={() => handleNavigate("/mapa")}
      />
      <NavIcon
        icon={<User size={40} />}
        label="Perfil"
        onClick={() => handleNavigate("/me")}
      />
      <NavIcon
        icon={<Plus size={40} />}
        label="Upload"
        onClick={() => handleNavigate("/upload")}
      />
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
        fontSize: "0.875rem",
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
