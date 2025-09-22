"use client";

import { Video } from "types/video";
import Image from "next/image";
import Link from "next/link";
import { motion, Variants, Transition } from "framer-motion";

interface VideosProfileAnimationsProps {
  videos: Video[];
  userName: string;
}

const springTransition: Transition = {
  type: "spring",
  stiffness: 250,
  damping: 20,
};

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30, rotate: -5, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    rotate: 0,
    scale: 1,
    transition: springTransition,
  },
};

export default function VideosProfileAnimations({
  videos,
  userName,
}: VideosProfileAnimationsProps) {
  if (videos.length === 0) {
    return (
      <p style={{ color: "#9ca3af", fontSize: "1rem", textAlign: "center" }}>
        Nenhum vídeo encontrado.
      </p>
    );
  }

  return (
    <motion.ul
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "1.5rem",
        padding: "0",
        margin: "0",
        listStyle: "none",
      }}
    >
      {videos.map((video, index) => (
        <motion.li
          key={video.videoID ?? index}
          variants={itemVariants}
          whileHover={{
            scale: 1.07,
            boxShadow: "0 8px 25px rgba(255, 255, 255, 0.25)",
            transition: { type: "spring", stiffness: 300, damping: 25 },
          }}
          style={{
            borderRadius: "14px",
            overflow: "hidden",
            cursor: "pointer",
            background:
              "linear-gradient(145deg, rgba(31,31,31,1), rgba(55,55,55,1))",
            transition: "all 0.3s ease",
            willChange: "transform, box-shadow",
          }}
        >
          <Link
            href={`/${encodeURIComponent(userName)}/${encodeURIComponent(
              video.videoID || index.toString()
            )}`}
            style={{
              display: "block",
              width: "100%",
              height: "100%",
            }}
          >
            <div
              style={{
                position: "relative",
                width: "100%",
                paddingTop: "56.25%", // proporção 16:9
              }}
            >
              <Image
                src={video.thumbnailUrl || "/default-thumbnail.png"}
                alt={`Thumbnail do vídeo: ${video.artistSongName}`}
                fill
                style={{
                  objectFit: "cover",
                  borderBottom: "3px solid rgba(255,255,255,0.08)",
                  borderRadius: "10px",
                }}
                priority={index < 3}
                draggable={false}
              />
            </div>
          </Link>
        </motion.li>
      ))}
    </motion.ul>
  );
}
