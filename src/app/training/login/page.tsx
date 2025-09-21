"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { collection, query, where, getDocs } from "firebase/firestore";

interface UserData {
  role?: string;
  alunoPage?: string;
  uid?: string;
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [bgPosition, setBgPosition] = useState(0);

  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      setBgPosition((prev) => (prev >= 100 ? 0 : prev + 0.1));
    }, 16);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Login no Firebase Auth
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Busca dados do usuário no Firestore
      const q = query(collection(db, "training"), where("uid", "==", user.uid));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const userData = snapshot.docs[0].data() as UserData;

        // Se for aluno e tiver alunoPage
        if (userData.role === "aluno" && userData.alunoPage) {
          router.push(`/aluno/${encodeURIComponent(userData.alunoPage)}`);
          return;
        }

        // Se não for aluno ou não tiver alunoPage, vai para a página do personal
        router.push("/personal_home");
      } else {
        // Caso não exista no Firestore (por algum motivo)
        router.push("/personal_home");
      }
    } catch (err) {
      console.error(err);
      if (err instanceof Error) setError(err.message);
      else setError("Erro desconhecido ao tentar entrar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "relative",
        minHeight: "100dvh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        padding: "3rem",
        boxSizing: "border-box",
      }}
    >
      {/* Background animado */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(135deg, #0f5976, #0f766e, #0f7646, #0f7625)",
          backgroundSize: "400% 400%",
          backgroundPosition: `${bgPosition}% 50%`,
          transition: "background-position 0.1s linear",
          zIndex: 1,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          zIndex: 2,
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          color: "white",
        }}
      >
        <h1
          style={{
            fontFamily: '"Caveat", cursive',
            fontSize: "3rem",
            fontWeight: 600,
            marginBottom: "1.5rem",
            letterSpacing: "2px",
            color: "white",
            textShadow: "0 4px 20px rgba(0,0,0,0.9)",
          }}
        >
          iUser <span style={{ color: "#22c55e" }}>Training</span>
        </h1>

        <div
          style={{
            background: "rgba(255,255,255,0.08)",
            backdropFilter: "blur(15px) saturate(180%)",
            WebkitBackdropFilter: "blur(15px) saturate(180%)",
            padding: "2rem 1.5rem",
            borderRadius: "16px",
            width: "300px",
            border: "1px solid rgba(255,255,255,0.18)",
            boxShadow: "0 8px 30px rgba(0,0,0,0.6)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            transition: "transform 0.3s ease, box-shadow 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-5px)";
            e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,0.8)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 8px 30px rgba(0,0,0,0.6)";
          }}
        >
          <form onSubmit={handleLogin} style={{ width: "100%" }}>
            <div style={{ width: "100%", marginBottom: "1rem" }}>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  border: "none",
                  borderRadius: "8px",
                  background: "rgba(255,255,255,0.1)",
                  color: "white",
                  fontSize: "1rem",
                  outline: "none",
                  boxSizing: "border-box",
                  transition: "0.3s",
                }}
                onFocus={(e) =>
                  (e.currentTarget.style.background = "rgba(255,255,255,0.15)")
                }
                onBlur={(e) =>
                  (e.currentTarget.style.background = "rgba(255,255,255,0.1)")
                }
              />
            </div>

            <div
              style={{
                width: "100%",
                marginBottom: "1rem",
                position: "relative",
              }}
            >
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "12px 40px 12px 16px",
                  border: "none",
                  borderRadius: "8px",
                  background: "rgba(255,255,255,0.1)",
                  color: "white",
                  fontSize: "1rem",
                  outline: "none",
                  boxSizing: "border-box",
                  transition: "0.3s",
                }}
                onFocus={(e) =>
                  (e.currentTarget.style.background = "rgba(255,255,255,0.15)")
                }
                onBlur={(e) =>
                  (e.currentTarget.style.background = "rgba(255,255,255,0.1)")
                }
              />
              <span
                onClick={() => setShowPassword((prev) => !prev)}
                style={{
                  position: "absolute",
                  top: "50%",
                  right: "12px",
                  transform: "translateY(-50%)",
                  cursor: "pointer",
                  color: "#fff",
                  fontSize: "1.2rem",
                }}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "12px",
                background: "#22c55e",
                border: "none",
                borderRadius: "8px",
                fontWeight: 700,
                color: "white",
                fontSize: "1rem",
                cursor: "pointer",
                transition: "background 0.3s, transform 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#16a34a";
                e.currentTarget.style.transform = "scale(1.02)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#22c55e";
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>

          {error && (
            <p
              style={{
                marginTop: "0.5rem",
                color: "#f97316",
                fontSize: "0.9rem",
              }}
            >
              {error}
            </p>
          )}

          <p style={{ marginTop: "1rem", fontSize: "0.9rem" }}>
            Não tem conta?{" "}
            <Link
              href="/cadastrar"
              style={{ color: "#22c55e", fontWeight: 600 }}
            >
              Cadastre-se
            </Link>
          </p>
        </div>
      </div>

      <style>{`
        input::placeholder {
          color: white;
          opacity: 1;
        }
      `}</style>
    </div>
  );
}
