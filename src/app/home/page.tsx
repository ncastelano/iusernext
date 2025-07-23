"use client";

import React, { useEffect, useState } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import {
  Home,
  MapPin,
  Plus,
  User,
  Search,
  Zap,
  Store,
  Package,
  Landmark,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

const NAVBAR_HEIGHT = 60; // altura da navbar fixa em px

const mapContainerStyle = {
  width: "100vw",
  height: `calc(100vh - ${NAVBAR_HEIGHT}px)`, // ajuste para o mapa preencher até acima da navbar
};

const defaultCenter = {
  lat: -23.55052,
  lng: -46.633308,
};

const filters = [
  { label: "Flash", icon: <Zap size={16} />, key: "flash" },
  { label: "Usuários", icon: <User size={16} />, key: "users" },
  { label: "Lojas", icon: <Store size={16} />, key: "store" },
  { label: "Produtos", icon: <Package size={16} />, key: "product" },
  { label: "Lugares", icon: <Landmark size={16} />, key: "place" },
];

type MarkerData = {
  id: string;
  lat: number;
  lng: number;
  title: string;
};

export default function HomePage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("flash");
  const [markers, setMarkers] = useState<MarkerData[]>([]);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: apiKey ?? "",
    libraries: ["places"],
  });

  useEffect(() => {
    const loadMarkers = async () => {
      const newMarkers: MarkerData[] = [];

      const videosSnapshot = await getDocs(collection(db, "videos"));
      videosSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.latitude && data.longitude) {
          newMarkers.push({
            id: doc.id,
            lat: data.latitude,
            lng: data.longitude,
            title: data.artistSongName || "Vídeo",
          });
        }
      });

      const usersSnapshot = await getDocs(collection(db, "users"));
      usersSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.latitude && data.longitude) {
          newMarkers.push({
            id: doc.id,
            lat: data.latitude,
            lng: data.longitude,
            title: data.name || "Usuário",
          });
        }
      });

      setMarkers(newMarkers);
    };

    loadMarkers();
  }, []);

  const handleNavigate = (path: string) => router.push(path);

  if (!isLoaded) return <div>Carregando mapa...</div>;

  return (
    <div style={{ height: "100vh", width: "100vw", overflow: "hidden" }}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={defaultCenter}
        zoom={14}
      >
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            position={{ lat: marker.lat, lng: marker.lng }}
            title={marker.title}
          />
        ))}
      </GoogleMap>

      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          width: "100%",
          background: "rgba(0, 0, 0, 0.6)",
          backdropFilter: "blur(12px)",
          padding: "10px 16px",
          zIndex: 1000,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "8px",
            flexWrap: "wrap",
          }}
        >
          <div style={{ position: "relative", flex: 1 }}>
            <Search
              size={16}
              style={{
                position: "absolute",
                top: "50%",
                left: 8,
                transform: "translateY(-50%)",
                color: "#aaa",
              }}
            />
            <input
              type="text"
              placeholder="Buscar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                padding: "8px 8px 8px 28px",
                borderRadius: "8px",
                border: "1px solid #ccc",
                width: "100%",
                fontSize: "14px",
              }}
            />
          </div>

          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setSelectedFilter(f.key)}
              style={{
                backgroundColor: selectedFilter === f.key ? "#fff" : "#222",
                color: selectedFilter === f.key ? "#000" : "#fff",
                border: "none",
                borderRadius: "8px",
                padding: "6px 10px",
                fontSize: "12px",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                cursor: "pointer",
              }}
            >
              {f.icon}
              {f.label}
            </button>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
            alignItems: "center",
            paddingTop: "6px",
            borderTop: "1px solid #444",
          }}
        >
          <NavIcon
            icon={<Home size={24} />}
            label="Home"
            onClick={() => handleNavigate("/home")}
          />
          <NavIcon
            icon={<MapPin size={24} />}
            label="Mapa"
            onClick={() => handleNavigate("/mapa")}
          />
          <NavIcon
            icon={<User size={24} />}
            label="Perfil"
            onClick={() => handleNavigate("/me")}
          />
          <NavIcon
            icon={<Plus size={24} />}
            label="Upload"
            onClick={() => handleNavigate("/upload")}
          />
        </div>
      </div>
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
        color: "#fff",
        fontSize: "12px",
        cursor: "pointer",
      }}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
