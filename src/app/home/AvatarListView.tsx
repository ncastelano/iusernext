"use client";

import Image from "next/image";

type AvatarItem = {
  id: string;
  title: string;
  image?: string;
};

type AvatarListViewProps = {
  items: AvatarItem[];
  onAvatarClick?: (item: AvatarItem) => void;
};

export default function AvatarListView({
  items,
  onAvatarClick,
}: AvatarListViewProps) {
  if (items.length === 0) return null;

  return (
    <>
      {/* Estilo inline para esconder scrollbar */}
      <style>{`
        .no-scrollbar {
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none;  /* IE 10+ */
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none; /* Chrome, Safari, Edge */
        }
      `}</style>

      <div
        className="no-scrollbar"
        style={{
          position: "fixed",
          bottom:
            "calc(clamp(60px, 10vh, 90px) + clamp(40px, 7vh, 60px) + max(2.5vh, 20px))",

          left: 0,
          width: "100%",
          padding: "0 4vw",
          overflowX: "auto",
          display: "flex",
          gap: "1rem",
          zIndex: 11,
          maxHeight: 120,
        }}
      >
        {items.map((item) => (
          <div
            key={item.id}
            style={{
              flexShrink: 0,
              width: 50,
              height: 50,
              borderRadius: "50%",
              overflow: "hidden",
              border: "2px solid white",
              backgroundColor: "#ccc",
              cursor: onAvatarClick ? "pointer" : "default",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            title={item.title}
            onClick={() => onAvatarClick?.(item)}
          >
            {item.image ? (
              <Image
                src={item.image}
                alt={item.title}
                width={50}
                height={50}
                style={{ objectFit: "cover" }}
              />
            ) : (
              <div style={{ width: "100%", height: "100%" }} />
            )}
          </div>
        ))}
      </div>
    </>
  );
}
