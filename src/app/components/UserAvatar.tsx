"use client";
import Image from "next/image";
import { CircleUserRound } from "lucide-react";

interface UserAvatarProps {
  imageUrl?: string;
  userName?: string;
  isLoading?: boolean;
}

export function UserAvatar({
  imageUrl,
  userName,
  isLoading = false,
}: UserAvatarProps) {
  return (
    <div className="d-flex align-items-end">
      <div className="d-flex align-items-center">
        {/* Avatar (imagem ou ícone de fallback) */}
        <div
          className="rounded-circle border border-light d-flex justify-content-center align-items-center bg-dark overflow-hidden"
          style={{
            width: "clamp(60px, 10vw, 120px)",
            height: "clamp(60px, 10vw, 120px)",
            boxShadow: "0 0 10px rgba(0,0,0,0.5)",
            flexShrink: 0,
          }}
        >
          {isLoading || !imageUrl ? (
            <CircleUserRound color="#ccc" size="50%" />
          ) : (
            <Image
              src={imageUrl}
              alt="User avatar"
              width={120}
              height={120}
              style={{ objectFit: "cover", width: "100%", height: "100%" }}
            />
          )}
        </div>

        {/* Nome do usuário ou skeleton */}
        <div
          className="ms-2 d-flex flex-column justify-content-between"
          style={{
            height: "clamp(60px, 10vw, 120px)", // Match avatar height
          }}
        >
          <div>{/* Espaço superior vazio */}</div>

          {isLoading ? (
            <div
              className="skeleton-placeholder"
              style={{
                width: "120px",
                height: "1.1rem",
                borderRadius: "4px",
                background: "linear-gradient(90deg, #333, #444, #333)",
                backgroundSize: "200% 100%",
                animation: "skeleton-loading 1.5s infinite",
              }}
            />
          ) : (
            <span
              style={{
                color: "#fff",
                fontWeight: "bold",
                fontSize: "1rem",
                textShadow: "0 0 5px rgba(0,0,0,0.7)",
                maxWidth: "200px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {userName}
            </span>
          )}
        </div>
      </div>

      {/* CSS da animação Skeleton */}
      <style>{`
        @keyframes skeleton-loading {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </div>
  );
}
