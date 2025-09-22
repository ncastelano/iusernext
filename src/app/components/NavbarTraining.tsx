"use client";

import { useState, useEffect } from "react";
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

  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        setIsPersonal(null);
        return;
      }

      try {
        const ref = doc(db, "training", user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          if (data.personalUID) {
            setIsPersonal(false);
            setAlunoPage(data.alunoPage || "");
          } else {
            setIsPersonal(true);
          }
        } else setIsPersonal(false);
      } catch (err) {
        console.error(err);
        setIsPersonal(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const isActive = (route: string) => pathname === route;

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace("/training/login");
    } catch (err) {
      console.error(err);
    }
  };

  if (!mounted || isPersonal === null) return null;

  const inicioLink = isPersonal
    ? "/personal_home"
    : alunoPage
    ? `/aluno/${alunoPage}`
    : "/";

  const links = [{ name: "Início", href: inicioLink }];

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
              key={link.href}
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
