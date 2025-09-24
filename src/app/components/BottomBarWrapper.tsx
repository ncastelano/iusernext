"use client";

import { usePathname } from "next/navigation";
import BottomBar from "./Bottombar";

export default function BottomBarWrapper() {
  const pathname = usePathname();

  // Lista de rotas que devem exibir o BottomBar
  const allowedRoutes = [
    "/inicio",
    "/perfil",
    "/contatos",
    "/mapa",
    "/publicar",
  ];

  const showBottomBar = allowedRoutes.includes(pathname);

  if (!showBottomBar) return null;

  return <BottomBar />;
}
