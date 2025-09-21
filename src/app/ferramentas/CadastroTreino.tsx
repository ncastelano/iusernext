"use client";

import { useState, ChangeEvent, useEffect } from "react";
import Link from "next/link";
import { auth, db, storage } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  doc,
  setDoc,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Image from "next/image";

export default function CadastroPage() {
  const [name, setName] = useState("");
  const [personalPage, setPersonalPage] = useState("");
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

    if (!name || !email || !password || !personalPage) {
      alert("Preencha todos os campos!");
      return;
    }

    try {
      // Verificar se personalPage já existe
      const q = query(
        collection(db, "training"),
        where("personalPage", "==", personalPage)
      );
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        alert("Este codinome já está em uso, escolha outro.");
        return;
      }

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

      // Criar usuário no Firestore
      await setDoc(doc(db, "training", user.uid), {
        uid: user.uid,
        personalUID: user.uid,
        name,
        personalPage,
        email,
        image: imageUrl,
        createdAt: new Date(),
      });

      alert("Cadastro realizado com sucesso!");
      window.location.href = "/training/login";
    } catch (error: unknown) {
      console.error("Erro ao cadastrar usuário:", error);
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("Erro desconhecido ao cadastrar usuário.");
      }
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

      {/* Formulario */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          color: "white",
          width: "100%",
          maxWidth: "500px",
        }}
      >
        <h1
          style={{
            fontFamily: '"Caveat", cursive',
            fontSize: "3rem",
            fontWeight: 600,
            marginBottom: "1.5rem",
            color: "white",
            textShadow: "0 4px 20px rgba(0,0,0,0.9)",
          }}
        >
          iUser <span style={{ color: "#22c55e" }}>Training</span>
        </h1>

        {/* Card */}
        <form
          onSubmit={handleSubmit}
          style={{
            width: "100%",
            background: "rgba(255,255,255,0.05)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            borderRadius: "20px",
            padding: "25px",
            display: "flex",
            flexDirection: "column",
            gap: "15px",
            boxShadow: "0 8px 20px rgba(0,0,0,0.5)",
          }}
        >
          {/* Imagem de perfil */}
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
              margin: "0 auto 1.5rem",
              cursor: "pointer",
              color: "#fff",
              fontSize: "0.9rem",
              textAlign: "center",
              overflow: "hidden",
              background: "rgba(0,0,0,0.4)",
            }}
          >
            {preview ? (
              <Image
                src={preview}
                alt="Profile"
                width={120}
                height={120}
                style={{ objectFit: "cover", borderRadius: "50%" }}
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

          {/* Inputs */}
          <input
            type="text"
            placeholder="Nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              padding: "15px",
              borderRadius: "15px",
              border: "1px solid rgba(255,255,255,0.3)",
              background: "rgba(255,255,255,0.1)",
              color: "#fff",
              outline: "none",
              fontSize: "1rem",
            }}
          />
          <input
            type="text"
            placeholder="Codinome (personalPage)"
            value={personalPage}
            onChange={(e) => setPersonalPage(e.target.value)}
            style={{
              padding: "15px",
              borderRadius: "15px",
              border: "1px solid rgba(255,255,255,0.3)",
              background: "rgba(255,255,255,0.1)",
              color: "#fff",
              outline: "none",
              fontSize: "1rem",
            }}
          />
          {personalPage && (
            <p style={{ fontSize: "0.8rem", color: "#22c55e" }}>
              https://www.iuser.com.br/personal/{personalPage}
            </p>
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              padding: "15px",
              borderRadius: "15px",
              border: "1px solid rgba(255,255,255,0.3)",
              background: "rgba(255,255,255,0.1)",
              color: "#fff",
              outline: "none",
              fontSize: "1rem",
            }}
          />

          {/* Senhas */}
          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: "100%",
                padding: "15px 45px 15px 15px",
                borderRadius: "15px",
                border: "1px solid rgba(255,255,255,0.3)",
                background: "rgba(255,255,255,0.1)",
                color: "#fff",
                outline: "none",
                fontSize: "1rem",
              }}
            />
            <span
              onClick={() => setShowPassword((prev) => !prev)}
              style={{
                position: "absolute",
                top: "50%",
                right: "15px",
                transform: "translateY(-50%)",
                cursor: "pointer",
                color: "#fff",
                fontSize: "1.2rem",
              }}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
          <div style={{ position: "relative" }}>
            <input
              type={showRepeatPassword ? "text" : "password"}
              placeholder="Repetir Senha"
              value={repeatPassword}
              onChange={(e) => setRepeatPassword(e.target.value)}
              style={{
                width: "100%",
                padding: "15px 45px 15px 15px",
                borderRadius: "15px",
                border: "1px solid rgba(255,255,255,0.3)",
                background: "rgba(255,255,255,0.1)",
                color: "#fff",
                outline: "none",
                fontSize: "1rem",
              }}
            />
            <span
              onClick={() => setShowRepeatPassword((prev) => !prev)}
              style={{
                position: "absolute",
                top: "50%",
                right: "15px",
                transform: "translateY(-50%)",
                cursor: "pointer",
                color: "#fff",
                fontSize: "1.2rem",
              }}
            >
              {showRepeatPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          {/* Botão */}
          <button
            type="submit"
            style={{
              width: "100%",
              padding: "15px",
              borderRadius: "20px",
              background: "#22c55e",
              border: "none",
              fontWeight: "bold",
              cursor: "pointer",
              fontSize: "1rem",
              transition: "background 0.3s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#16a34a")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#22c55e")}
          >
            Cadastrar
          </button>

          <p style={{ marginTop: "1rem", fontSize: "0.9rem" }}>
            Já possui conta?{" "}
            <Link
              href="/training/login"
              style={{ color: "#22c55e", fontWeight: 600 }}
            >
              Voltar para entrar
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
