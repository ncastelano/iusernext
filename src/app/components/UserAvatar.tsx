// app/components/UserAvatar.tsx
"use client";
import Image from "next/image";

interface UserAvatarProps {
  imageUrl: string;
  userName: string;
}

export function UserAvatar({ imageUrl, userName }: UserAvatarProps) {
  return (
    <div className="d-flex flex-column align-items-start">
      {/* Avatar + Username */}
      <div className="d-flex align-items-center">
        <div
          className="rounded-circle border border-light overflow-hidden"
          style={{
            width: "clamp(60px, 10vw, 120px)",
            height: "clamp(60px, 10vw, 120px)",
            boxShadow: "0 0 10px rgba(0,0,0,0.5)",
            flexShrink: 0,
          }}
        >
          <Image
            src={imageUrl}
            alt="User avatar"
            width={120}
            height={120}
            style={{ objectFit: "cover", width: "100%", height: "100%" }}
          />
        </div>
        <span
          className="ms-2"
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
      </div>
    </div>
  );
}
