import React from "react";
import { User } from "types/user";
import Image from "next/image";
import Link from "next/link";

export const CustomInfoWindowUser = ({
  user,
  onClose,
  selected = false,
}: {
  user: User;
  onClose: () => void;
  selected?: boolean;
}) => {
  const openGoogleMaps = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const currentLat = position.coords.latitude;
          const currentLng = position.coords.longitude;

          const destinationLat = user.latitude;
          const destinationLng = user.longitude;

          const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${currentLat},${currentLng}&destination=${destinationLat},${destinationLng}&travelmode=driving`;
          window.open(mapsUrl, "_blank");
        },
        (err) => {
          alert("Erro ao obter sua localização.");
          console.error(err);
        }
      );
    } else {
      alert("Geolocalização não suportada.");
    }
  };

  return (
    <div
      style={{
        ...styles.container,
        borderColor: selected ? "#2ecc71" : "#333",
        borderWidth: selected ? 2 : 1,
        borderStyle: "solid",
      }}
    >
      <Link href={`/${user.namePage}`} style={styles.imageWrapper}>
        <Image
          src={user.image}
          alt={user.namePage}
          width={100}
          height={100}
          style={{ objectFit: "cover" }}
        />
      </Link>

      <div style={styles.textWrapper}>
        <h4 style={styles.title}>{user.namePage}</h4>
        <p style={styles.subtitle}>Email: {user.email}</p>
        <button onClick={openGoogleMaps} style={styles.mapsButton}>
          Como chegar
        </button>
      </div>

      <button onClick={onClose} style={styles.closeButton} aria-label="Fechar">
        ×
      </button>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: "absolute",
    transform: "translate(-50%, -100%)",
    backgroundColor: "#1a1a1a",
    borderRadius: "10px",
    padding: "8px",
    width: "260px",
    maxWidth: "90vw",
    zIndex: 100,
    display: "flex",
    gap: "12px",
    color: "#fff",
    boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
  },
  imageWrapper: {
    width: "100px",
    height: "100px",
    flexShrink: 0,
    borderRadius: "8px",
    overflow: "hidden",
  },
  textWrapper: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    overflow: "hidden",
  },
  title: {
    margin: "0 0 4px 0",
    fontSize: "14px",
    fontWeight: 600,
    lineHeight: "1.2",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  subtitle: {
    margin: 0,
    fontSize: "12px",
    color: "#aaa",
    lineHeight: 1.2,
    wordBreak: "break-word",
  },
  closeButton: {
    position: "absolute",
    top: "4px",
    right: "4px",
    background: "transparent",
    border: "none",
    color: "#ccc",
    fontSize: "18px",
    cursor: "pointer",
    lineHeight: 1,
  },
  mapsButton: {
    marginTop: "6px",
    padding: "6px 10px",
    backgroundColor: "#2ecc71",
    color: "#000",
    border: "none",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: 600,
    cursor: "pointer",
    alignSelf: "start",
  },
};
