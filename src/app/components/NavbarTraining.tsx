"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { Caveat } from "next/font/google";
import { doc, getDoc } from "firebase/firestore";

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function NavbarTraining() {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isPersonal, setIsPersonal] = useState<boolean | null>(null);
  const [alunoPage, setAlunoPage] = useState<string>("");
  const [personalPage, setPersonalPage] = useState<string>("");

  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const handleResize = () =>
      setIsMobile(typeof window !== "undefined" && window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        setIsPersonal(null);
        setAlunoPage("");
        setPersonalPage("");
        return;
      }

      try {
        const ref = doc(db, "training", user.uid);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
          // sem documento, considera como não-personal (sem alunoPage)
          setIsPersonal(false);
          setAlunoPage("");
          setPersonalPage("");
          return;
        }

        const data = snap.data() as Record<string, any>;

        // Nova regra simples e explícita:
        // - se existir `personalPage` -> é personal
        // - senão se existir `alunoPage` -> é aluno
        // - senão -> trata como aluno sem página
        if (data.personalPage) {
          setIsPersonal(true);
          setPersonalPage(String(data.personalPage));
          setAlunoPage("");
        } else if (data.alunoPage) {
          setIsPersonal(false);
          setAlunoPage(String(data.alunoPage));
          setPersonalPage("");
        } else {
          setIsPersonal(false);
          setAlunoPage("");
          setPersonalPage("");
        }
      } catch (err) {
        console.error("Erro ao buscar perfil de training:", err);
        setIsPersonal(false);
        setAlunoPage("");
        setPersonalPage("");
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace("/training/login");
    } catch (err) {
      console.error("Erro ao deslogar:", err);
    }
  };

  // Roteamento do botão "Início":
  // - se personal -> /personal_home
  // - se aluno com alunoPage -> /aluno/[alunoPage]
  // - fallback -> /training/login
  const inicioLink = isPersonal
    ? "/personal_home"
    : alunoPage
    ? `/aluno/${alunoPage}`
    : "/training/login";

  const links = [{ name: "Início", href: inicioLink }];

  const isActive = (route: string) => {
    if (!pathname) return false;
    // marca ativo para /aluno/* quando estivermos em qualquer rota /aluno/
    if (route.startsWith("/aluno/")) return pathname.startsWith("/aluno/");
    // marca ativo para /personal_home e suas variações
    if (route === "/personal_home")
      return (
        pathname === "/personal_home" || pathname.startsWith("/personal_home")
      );
    return pathname === route;
  };

  const estiloBotaoPadrao: React.CSSProperties = {
    background: "#16a34a",
    color: "#fff",
    border: "none",
    padding: "0.4rem 1.5rem",
    borderRadius: "9999px",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: "0.95rem",
  };

  const estiloBotaoSair: React.CSSProperties = {
    ...estiloBotaoPadrao,
    background: "#dc2626",
    padding: "0.5rem 1.5rem",
  };

  const estiloBotaoLinkAtivo: React.CSSProperties = {
    ...estiloBotaoPadrao,
    background: "rgba(21, 128, 61, 0.8)",
  };

  if (!mounted || isPersonal === null) return null;

  return (
    <nav
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        width: "100%",
        zIndex: 50,
        background: "transparent",
      }}
    >
      <div
        style={{
          maxWidth: "1120px",
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0.5rem 1.5rem",
        }}
      >
        <Link
          href="/"
          className={caveat.className}
          style={{
            color: "#fff",
            fontSize: "1.8rem",
            letterSpacing: "1px",
            textDecoration: "none",
            textShadow: "0 2px 6px rgba(0,0,0,0.3)",
            fontWeight: 600,
          }}
        >
          iUser <span style={{ color: "#22c55e" }}>Training</span>
        </Link>

        {!isMobile && (
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={
                  isActive(link.href) ? estiloBotaoLinkAtivo : estiloBotaoPadrao
                }
              >
                {link.name}
              </Link>
            ))}

            <button style={estiloBotaoSair} onClick={handleLogout}>
              Sair
            </button>
          </div>
        )}

        {isMobile && (
          <button
            onClick={() => setIsOpen(!isOpen)}
            style={{
              fontSize: "1.5rem",
              color: "#22c55e",
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
            aria-label="Abrir menu"
          >
            ☰
          </button>
        )}
      </div>

      {isMobile && isOpen && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
            padding: "0.5rem 1.5rem 1rem",
          }}
        >
          {links.map((link) => (
            <Link
              key={link.href + "-m"}
              href={link.href}
              style={
                isActive(link.href) ? estiloBotaoLinkAtivo : estiloBotaoPadrao
              }
              onClick={() => setIsOpen(false)}
            >
              {link.name}
            </Link>
          ))}

          <button
            style={estiloBotaoSair}
            onClick={() => {
              handleLogout();
              setIsOpen(false);
            }}
          >
            Sair
          </button>
        </div>
      )}
    </nav>
  );
}
