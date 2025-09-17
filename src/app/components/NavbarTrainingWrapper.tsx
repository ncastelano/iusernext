"use client";

import { usePathname } from "next/navigation";
import NavbarTraining from "./NavbarTraining";

export default function NavbarTrainingWrapper() {
  const pathname = usePathname();

  const showNavbarTraining =
    pathname === "/personal_home" ||
    /^\/personal\/[^/]+$/.test(pathname) ||
    /^\/aluno\/[^/]+$/.test(pathname);

  if (!showNavbarTraining) return null;

  return <NavbarTraining />;
}
