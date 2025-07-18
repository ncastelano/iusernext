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
    return <p className="text-gray-400">Nenhum vídeo encontrado.</p>;
  }

  return (
    <motion.ul
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
    >
      {videos.map((video, index) => (
        <motion.li
          key={video.videoID ?? index}
          variants={itemVariants}
          whileHover={{
            scale: 1.07,
            boxShadow: "0 8px 20px rgba(255, 255, 255, 0.25)",
            transition: { type: "spring", stiffness: 300, damping: 25 },
          }}
          className="rounded-lg overflow-hidden cursor-pointer bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 hover:brightness-110 transition-all duration-300"
          style={{ willChange: "transform, box-shadow" }}
        >
          <Link
            href={`/${encodeURIComponent(userName)}/${encodeURIComponent(
              video.videoID || index.toString()
            )}`}
            className="block"
          >
            <Image
              src={video.thumbnailUrl || "/default-thumbnail.png"}
              alt={`Thumbnail do vídeo: ${video.artistSongName}`}
              width={320}
              height={180}
              className="object-cover w-full h-auto"
              priority={index < 3}
              draggable={false}
            />
          </Link>
        </motion.li>
      ))}
    </motion.ul>
  );
}
