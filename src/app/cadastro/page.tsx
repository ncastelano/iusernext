"use client";

import { useState, CSSProperties, useEffect } from "react";
import { auth, db, storage } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

const mainStyle: CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "24px",
  background: "linear-gradient(to bottom, #0f0c29, #302b63, #24243e)",
};

const glassCard: CSSProperties = {
  background: "rgba(255, 255, 255, 0.05)",
  border: "1px solid rgba(255, 255, 255, 0.15)",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  borderRadius: "24px",
  padding: "40px 32px",
  maxWidth: "420px",
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
  justifyContent: "center",
};

const logoStyle: CSSProperties = {
  borderRadius: "10px",
  objectFit: "cover",
};

const logoWrapper: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 4,
  marginBottom: 28,
};

const titleStyle: CSSProperties = {
  fontSize: 28,
  fontWeight: 700,
  color: "#fff",
};

const subtitleStyle: CSSProperties = {
  fontSize: 14,
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

const avatarLabelStyle: CSSProperties = {
  width: 160,
  height: 160,
  borderRadius: "50%",
  backgroundColor: "rgba(255,255,255,0.05)",
  border: "2px dashed #555",
  color: "#ccc",
  fontSize: 14,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  cursor: "pointer",
  userSelect: "none",
  margin: "0 auto 28px auto",
  transition: "all 0.3s ease-in-out",
};

const footerText: CSSProperties = {
  marginTop: 24,
  fontSize: 14,
  color: "#bbb",
  textAlign: "center",
};

const linkStyle: CSSProperties = {
  color: "#4ea1f3",
  textDecoration: "underline",
};

export default function CadastroPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [name, setName] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewURL, setPreviewURL] = useState<string | null>(null);
  const router = useRouter();

  const customLoader = ({ src }: { src: string }) => src;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (file) {
      if (file.size > 6 * 1024 * 1024) {
        alert("Arquivo muito grande! Máximo permitido: 6MB.");
        e.target.value = "";
        setImageFile(null);
        setPreviewURL(null);
        return;
      }
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setPreviewURL(url);
    } else {
      setImageFile(null);
      setPreviewURL(null);
    }
  };

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, senha);
      const uid = cred.user.uid;

      let imageURL = "";

      if (imageFile) {
        const imageRef = ref(storage, `users/${uid}/profile.jpg`);
        await uploadBytes(imageRef, imageFile);
        imageURL = await getDownloadURL(imageRef);
      }

      await setDoc(doc(collection(db, "users"), uid), {
        uid,
        name,
        email,
        image: imageURL,
      });

      router.push("/mapa");
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("Erro desconhecido ao cadastrar usuário.");
      }
    }
  };

  return (
    <main style={mainStyle}>
      <div style={glassCard}>
        {/* Logo + título */}
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

        {/* Avatar Upload */}
        <label htmlFor="avatarInput" style={avatarLabelStyle}>
          {previewURL ? (
            <Image
              src={previewURL}
              alt="Avatar Preview"
              width={160}
              height={160}
              style={{
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                objectFit: "cover",
              }}
              loader={customLoader}
              unoptimized
            />
          ) : (
            "Escolher Avatar"
          )}
        </label>

        {/* Formulário */}
        <form onSubmit={handleCadastro} style={formStyle}>
          <input
            type="text"
            placeholder="Nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={inputStyle}
          />
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
          <input
            id="avatarInput"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{ display: "none" }}
            required
          />
          <button type="submit" style={buttonStyle}>
            Cadastrar
          </button>
        </form>

        {/* Link para login */}
        <p style={footerText}>
          Já tem uma conta?{" "}
          <Link href="/login" style={linkStyle}>
            Entrar
          </Link>
        </p>
      </div>
    </main>
  );
}
