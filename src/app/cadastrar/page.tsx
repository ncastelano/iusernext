"use client";

import { useState, ChangeEvent, useEffect } from "react";
import Link from "next/link";
import { auth, db, storage } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, setDoc } from "firebase/firestore";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function CadastroPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);

  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [bgPosition, setBgPosition] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setBgPosition((prev) => (prev >= 100 ? 0 : prev + 0.1));
    }, 16);
    return () => clearInterval(interval);
  }, []);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfileImage(e.target.files[0]);
      setPreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== repeatPassword) {
      alert("As senhas não coincidem!");
      return;
    }

    if (!name || !email || !password) {
      alert("Preencha todos os campos!");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      let imageUrl = "";
      if (profileImage) {
        const imageRef = ref(
          storage,
          `imagestraining/${user.uid}/${profileImage.name}`
        );
        await uploadBytes(imageRef, profileImage);
        imageUrl = await getDownloadURL(imageRef);
      }

      await setDoc(doc(db, "training", user.uid), {
        uid: user.uid,
        name,
        email,
        image: imageUrl,
        createdAt: new Date(),
      });

      alert("Cadastro realizado com sucesso!");
      window.location.href = "/training/login";
    } catch (error: any) {
      console.error("Erro ao cadastrar usuário:", error);
      alert(error.message);
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
          <label
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              width: "120px",
              height: "120px",
              border: "2px dashed #22c55e",
              borderRadius: "50%",
              marginBottom: "1.5rem",
              cursor: "pointer",
              color: "#fff",
              fontSize: "0.9rem",
              textAlign: "center",
              overflow: "hidden",
              position: "relative",
              background: "rgba(0,0,0,0.4)",
            }}
          >
            {preview ? (
              <img
                src={preview}
                alt="Profile"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: "50%",
                }}
              />
            ) : (
              <>
                <span style={{ fontSize: "2rem", marginBottom: "0.3rem" }}>
                  📷
                </span>
                <span>Selecionar</span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: "none" }}
            />
          </label>

          <form onSubmit={handleSubmit} style={{ width: "100%" }}>
            <div style={{ width: "100%", marginBottom: "1rem" }}>
              <input
                type="text"
                placeholder="Nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
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

            <div style={{ width: "100%", marginBottom: "1rem" }}>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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

            {/* Senha */}
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

            {/* Repetir senha */}
            <div
              style={{
                width: "100%",
                marginBottom: "1rem",
                position: "relative",
              }}
            >
              <input
                type={showRepeatPassword ? "text" : "password"}
                placeholder="Repetir Senha"
                value={repeatPassword}
                onChange={(e) => setRepeatPassword(e.target.value)}
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
                onClick={() => setShowRepeatPassword((prev) => !prev)}
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
                {showRepeatPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            <button
              type="submit"
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
              Cadastrar
            </button>
          </form>

          <p style={{ marginTop: "1rem", fontSize: "0.9rem" }}>
            Já possui conta?{" "}
            <Link
              href="/training/login"
              style={{ color: "#22c55e", fontWeight: 600 }}
            >
              Voltar para entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
