"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

interface AnimatedCardProps {
  href: string;
  src: string;
  alt: string;
}

export function AnimatedCard({ href, src, alt }: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      whileHover={{ scale: 1.05, filter: "brightness(1.1)" }}
      className="cursor-pointer rounded-lg overflow-hidden shadow-md"
      style={{ width: 150 }} // manter largura fixa
    >
      <Link href={href} className="block w-full h-full">
        <Image
          src={src}
          alt={alt}
          width={240} // usar a mesma largura do container
          height={135} // manter proporção 16:9 (240 / 16 * 9 = 135)
          className="object-cover w-full h-full"
          unoptimized={true} // opcional, se tiver problema no Next.js carregando imagem
        />
      </Link>
    </motion.div>
  );
}
