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
  const [showDialog, setShowDialog] = useState(false);
  const [telefone, setTelefone] = useState("");
  const [anamneseOption, setAnamneseOption] = useState("");
  const [personalEmail, setPersonalEmail] = useState("emaildo@personal.com");
  const [isPersonal, setIsPersonal] = useState<boolean | null>(null);
  const [studentPage, setStudentPage] = useState<string>("");

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

      if (user.email) setPersonalEmail(user.email);

      try {
        const ref = doc(db, "training", user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          if (data.personalUID) {
            setIsPersonal(false);
            setStudentPage(data.studentPage || "");
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

  // 🔹 Função de formatação com limite de 11 dígitos
  const formatTelefone = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11); // só 11 números
    const match = digits.match(/^(\d{0,2})(\d{0,5})(\d{0,4})$/);
    if (!match) return "";
    return !match[2]
      ? match[1]
      : `(${match[1]}) ${match[2]}${match[3] ? "-" + match[3] : ""}`;
  };

  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTelefone(formatTelefone(e.target.value));
  };

  const handleEnviarWhatsapp = () => {
    if (!personalEmail || !telefone) {
      alert("Preencha o telefone e verifique o email do personal.");
      return;
    }

    let numero = telefone.replace(/\D/g, "");
    if (!numero.startsWith("55")) numero = "55" + numero;

    let mensagem = `Olá, estou te convidando para ser meu aluno. Para prosseguir com o cadastro, entre no link: https://www.iuser.com.br/convite/${personalEmail}`;
    if (anamneseOption) mensagem += `\nOpção de Anamnese: ${anamneseOption}`;

    window.open(
      `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`,
      "_blank"
    );

    alert("Pedido enviado com sucesso!");
    setShowDialog(false);
    setTelefone("");
    setAnamneseOption("");
  };

  const inicioLink = isPersonal
    ? "/personal_home"
    : studentPage
    ? `/aluno/${studentPage}`
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

  const estiloBotaoConvidar: React.CSSProperties = {
    ...estiloBotaoPadrao,
    padding: "0.5rem 1.5rem",
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

  if (!mounted) return null;

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

            {isPersonal && (
              <button
                style={estiloBotaoConvidar}
                onClick={() => setShowDialog(true)}
              >
                Convidar Aluno
              </button>
            )}

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

          {isPersonal && (
            <button
              style={estiloBotaoConvidar}
              onClick={() => {
                setShowDialog(true);
                setIsOpen(false);
              }}
            >
              Convidar Aluno
            </button>
          )}

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

      {showDialog && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
            padding: "1rem",
          }}
        >
          <div
            style={{
              background: "rgba(255,255,255,0.08)",
              backdropFilter: "blur(15px) saturate(180%)",
              WebkitBackdropFilter: "blur(15px) saturate(180%)",
              borderRadius: "16px",
              border: "1px solid rgba(255,255,255,0.18)",
              boxShadow: "0 6px 20px rgba(0,0,0,0.5)",
              width: "100%",
              maxWidth: "400px",
              textAlign: "center",
              color: "#fff",
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              padding: "2rem",
            }}
          >
            <h2 style={{ marginBottom: "1rem", fontSize: "1.25rem" }}>
              Adicionar Novo Aluno
            </h2>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleEnviarWhatsapp();
              }}
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              <input
                type="tel"
                placeholder="Telefone / WhatsApp"
                value={telefone}
                onChange={handleTelefoneChange}
                style={{
                  padding: "12px 16px",
                  borderRadius: "12px",
                  border: "1px solid rgba(255,255,255,0.3)",
                  background: "rgba(0,0,0,0.6)",
                  color: "#fff",
                  outline: "none",
                  fontSize: "1rem",
                  backdropFilter: "blur(10px)",
                  transition: "0.3s",
                }}
                required
              />

              <select
                value={anamneseOption}
                onChange={(e) => setAnamneseOption(e.target.value)}
                style={{
                  padding: "12px 16px",
                  borderRadius: "12px",
                  border: "1px solid rgba(255,255,255,0.3)",
                  background: "#000",
                  color: "#fff",
                  outline: "none",
                  fontSize: "1rem",
                  transition: "0.3s",
                }}
              >
                <option value="">Selecionar Anamnese...</option>
                <option value="padrao">Padrão</option>
                <option value="parq">PAR-Q</option>
              </select>

              <button
                type="submit"
                style={{
                  background: "#16a34a",
                  color: "#fff",
                  border: "none",
                  padding: "8px 20px",
                  borderRadius: "9999px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "0.3s",
                }}
              >
                Enviar Convite pelo WhatsApp
              </button>
            </form>

            <button
              onClick={() => setShowDialog(false)}
              style={{
                marginTop: "1rem",
                background: "#dc2626",
                border: "none",
                borderRadius: "12px",
                padding: "0.5rem 1rem",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
