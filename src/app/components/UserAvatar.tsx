"use client";
import Image from "next/image";

export function UserAvatar({ imageUrl }: { imageUrl: string }) {
  return (
    <div
      className="position-absolute rounded-circle border border-light overflow-hidden"
      style={{
        top: 20,
        left: 20,
        width: "clamp(60px, 10vw, 120px)",
        height: "clamp(60px, 10vw, 120px)",
        boxShadow: "0 0 10px rgba(0,0,0,0.5)",
        zIndex: 10,
      }}
    >
      <Image
        src={imageUrl}
        alt="User avatar"
        width={120}
        height={120}
        style={{ objectFit: "cover" }}
      />
    </div>
  );
}
