"use client";

import Link from "next/link";
import Image from "next/image";

interface Personal {
  uid: string;
  name: string;
  email: string;
  image: string;
  personalPage: string;
}

interface PersonalAvatarProps {
  personal: Personal;
  greeting: string;
}

export default function PersonalAvatar({
  personal,
  greeting,
}: PersonalAvatarProps) {
  return (
    <Link
      href={`/personal/${personal.personalPage}`}
      style={{ textDecoration: "none" }}
    >
      <div
        style={{
          position: "relative",
          zIndex: 10,
          width: "100%",
          maxWidth: "400px",
          cursor: "pointer",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            background: "rgba(255,255,255,0.08)",
            backdropFilter: "blur(15px) saturate(180%)",
            WebkitBackdropFilter: "blur(15px) saturate(180%)",
            padding: "1rem 1.5rem",
            borderRadius: "16px",
            border: "1px solid rgba(255,255,255,0.18)",
            boxShadow: "0 6px 20px rgba(0,0,0,0.5)",
            gap: "1rem",
          }}
        >
          {/* Avatar */}
          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              border: "2px solid white",
              overflow: "hidden",
              flexShrink: 0,
              position: "relative",
            }}
          >
            <Image
              src={personal.image}
              alt={personal.name}
              fill
              style={{ objectFit: "cover", borderRadius: "50%" }}
            />
          </div>

          {/* Saudação */}
          <h2 style={{ margin: 0, color: "#fff", fontSize: "1.2rem" }}>
            {greeting}, {personal.name}
          </h2>
        </div>
      </div>
    </Link>
  );
}
