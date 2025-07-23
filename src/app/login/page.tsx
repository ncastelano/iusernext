"use client";

import { useState, useEffect, CSSProperties } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useUser } from "@/app/components/UserContext";

const mainStyle: CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "24px",
  background: "linear-gradient(to bottom, #0f0c29, #302b63, #24243e)",
};

const loadingStyle: CSSProperties = {
  ...mainStyle,
  color: "#ccc",
};

const glassCard: CSSProperties = {
  background: "rgba(255, 255, 255, 0.05)",
  border: "1px solid rgba(255, 255, 255, 0.15)",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  borderRadius: "24px",
  padding: "40px 32px",
  maxWidth: "400px",
  width: "100%",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  color: "#f5f5f5",
};

const titleContainer: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
};

const logoStyle: CSSProperties = {
  borderRadius: "10px",
  objectFit: "cover",
};

const logoWrapper: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "8px",
  marginBottom: "32px",
};

const titleStyle: CSSProperties = {
  fontSize: "28px",
  fontWeight: "bold",
  marginTop: "12px",
  letterSpacing: "1px",
};

const subtitleStyle: CSSProperties = {
  fontSize: "14px",
  color: "#ccc",
};

const formStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "16px",
  width: "100%",
};

const inputStyle: CSSProperties = {
  width: "100%",
  padding: "12px 16px",
  background: "rgba(255, 255, 255, 0.07)",
  border: "1px solid rgba(255, 255, 255, 0.15)",
  borderRadius: 10,
  color: "#fff",
  fontSize: "14px",
  outline: "none",
};

const buttonStyle: CSSProperties = {
  padding: "12px",
  background: "linear-gradient(135deg, #4ea1f3, #2563eb)",
  color: "#fff",
  border: "none",
  borderRadius: 10,
  fontWeight: 600,
  fontSize: "15px",
  cursor: "pointer",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
};

const footerText: CSSProperties = {
  marginTop: 24,
  fontSize: 14,
  color: "#bbb",
};

const linkStyle: CSSProperties = {
  color: "#4ea1f3",
  textDecoration: "underline",
};

export default function LoginPage() {
  const { user, loading } = useUser();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  useEffect(() => {
    if (!loading && user) {
      router.replace("/home");
    }
  }, [user, loading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, senha);
      router.push("/home");
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("Erro inesperado ao fazer login.");
      }
    }
  };

  if (loading) {
    return (
      <main style={loadingStyle}>
        <p>Carregando...</p>
      </main>
    );
  }

  return (
    <main style={mainStyle}>
      <div style={glassCard}>
        <div style={logoWrapper}>
          <div style={titleContainer}>
            <Image
              src="/icon/icon1.png"
              alt="Logo iUser"
              width={40}
              height={40}
              style={logoStyle}
            />
            <h1 style={titleStyle}>iUser</h1>
          </div>
          <p style={subtitleStyle}>Sua rede social</p>
        </div>

        <form onSubmit={handleLogin} style={formStyle}>
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={inputStyle}
          />
          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
            style={inputStyle}
          />
          <button type="submit" style={buttonStyle}>
            Entrar
          </button>
        </form>

        <p style={footerText}>
          Não tem uma conta?{" "}
          <Link href="/cadastro" style={linkStyle}>
            Cadastre-se
          </Link>
        </p>
      </div>
    </main>
  );
}
