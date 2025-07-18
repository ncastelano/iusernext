"use client";

import { useState, CSSProperties, useEffect } from "react";
import { auth, db, storage } from "@/lib/firebase";
import {
  collection,
  doc,
  setDoc,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react"; // ADICIONADO

export default function CadastroPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [name, setName] = useState("");
  const [namePage, setNamePage] = useState("");
  const [namePageAvailable, setNamePageAvailable] = useState<null | boolean>(
    null
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewURL, setPreviewURL] = useState<string | null>(null);
  const router = useRouter();
  const [confirmSenha, setConfirmSenha] = useState("");
  const [senhaVisivel, setSenhaVisivel] = useState(false); // NOVO estado
  const isValidNamePage = (name: string) =>
    /^[a-z0-9-]{3,20}$/.test(name.trim().toLowerCase());

  const checkNamePageAvailability = async (pageName: string) => {
    const q = query(collection(db, "users"), where("namePage", "==", pageName));
    const snapshot = await getDocs(q);
    return snapshot.empty;
  };

  useEffect(() => {
    const trimmed = namePage.trim().toLowerCase();

    if (!isValidNamePage(trimmed)) {
      setNamePageAvailable(null);
      return;
    }

    const delay = setTimeout(async () => {
      const available = await checkNamePageAvailability(trimmed);
      setNamePageAvailable(available);
    }, 500);

    return () => clearTimeout(delay);
  }, [namePage]);

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedPage = namePage.trim().toLowerCase();

    if (!isValidNamePage(trimmedPage)) {
      alert(
        "Nome de página inválido. Use apenas letras, números e hífens (3-20 caracteres)."
      );
      return;
    }

    if (!namePageAvailable) {
      alert("Esse nome de página já está em uso.");
      return;
    }

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
        namePage: trimmedPage,
      });

      router.push("/mapa");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao cadastrar.");
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (file) {
      if (file.size > 6 * 1024 * 1024) {
        alert("Imagem muito grande! Máximo 6MB.");
        return;
      }
      setImageFile(file);
      setPreviewURL(URL.createObjectURL(file));
    }
  };

  // Mensagem dinâmica do campo namePage
  const trimmedNamePage = namePage.trim().toLowerCase();
  const namePageMessage = !isValidNamePage(trimmedNamePage)
    ? "Use letras, números e hífens (3-20 caracteres)."
    : namePageAvailable === null
    ? "Verificando disponibilidade..."
    : namePageAvailable
    ? "✅ Nome de página disponível!"
    : "❌ Nome de página já está em uso.";

  const namePageMessageColor = !isValidNamePage(trimmedNamePage)
    ? "#f39c12"
    : namePageAvailable
    ? "#2ecc71"
    : "#e74c3c";

  return (
    <main style={styles.main}>
      <div style={styles.glassCard}>
        {/* Título / logo omitido por brevidade */}

        <form onSubmit={handleCadastro} style={styles.form}>
          <input
            type="text"
            placeholder="Nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={styles.input}
          />
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
          />
          {/* Campo de senha com ícone do olho */}
          <div style={{ position: "relative" }}>
            <input
              type={senhaVisivel ? "text" : "password"}
              placeholder="Senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              style={{
                ...styles.input,
                paddingRight: 42, // espaço para o ícone
              }}
            />
            <button
              type="button"
              onClick={() => setSenhaVisivel((prev) => !prev)}
              style={styles.eyeButton}
              aria-label={senhaVisivel ? "Ocultar senha" : "Mostrar senha"}
            >
              {senhaVisivel ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <input
            type="password"
            placeholder="Confirmar Senha"
            value={confirmSenha}
            onChange={(e) => setConfirmSenha(e.target.value)}
            required
            style={{
              ...styles.input,
              borderColor:
                confirmSenha.length === 0
                  ? "rgba(255,255,255,0.15)"
                  : senha === confirmSenha
                  ? "#2ecc71"
                  : "#e74c3c",
            }}
          />

          {confirmSenha && (
            <p
              style={{
                fontSize: 13,
                color: senha === confirmSenha ? "#2ecc71" : "#e74c3c",
                marginTop: -12,
              }}
            >
              {senha === confirmSenha
                ? "✅ Senhas coincidem"
                : "❌ Senhas não coincidem"}
            </p>
          )}

          {/* Campo namePage */}
          <div style={{ position: "relative" }}>
            <span style={styles.prefix}>iuser.com.br/</span>
            <input
              type="text"
              placeholder="nome-da-página"
              value={namePage}
              onChange={(e) => setNamePage(e.target.value)}
              required
              style={{
                ...styles.input,
                paddingLeft: 120,
                borderColor: !isValidNamePage(trimmedNamePage)
                  ? "#f39c12"
                  : namePageAvailable
                  ? "#2ecc71"
                  : "#e74c3c",
              }}
            />
          </div>
          {namePage && (
            <p
              style={{
                fontSize: 13,
                color: namePageMessageColor,
                marginTop: 4,
              }}
            >
              {namePageMessage}
            </p>
          )}

          {/* Avatar */}
          <label htmlFor="avatarInput" style={styles.avatarLabel}>
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
                loader={({ src }) => src}
                unoptimized
              />
            ) : (
              "Escolher Avatar"
            )}
          </label>
          <input
            id="avatarInput"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{ display: "none" }}
            required
          />

          <button type="submit" style={styles.button}>
            Cadastrar
          </button>
        </form>
      </div>
    </main>
  );
}

// 🎨 Styles separados
const styles: Record<string, CSSProperties> = {
  main: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    background: "linear-gradient(to bottom, #0f0c29, #302b63, #24243e)",
  },
  glassCard: {
    background: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(255, 255, 255, 0.15)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    borderRadius: 24,
    padding: "40px 32px",
    maxWidth: 420,
    width: "100%",
    color: "#f5f5f5",
    boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
    width: "100%",
  },
  input: {
    width: "100%",
    padding: "12px 16px",
    background: "rgba(255, 255, 255, 0.07)",
    border: "1px solid rgba(255, 255, 255, 0.15)",
    borderRadius: 10,
    color: "#fff",
    fontSize: 14,
    outline: "none",
  },
  prefix: {
    position: "absolute",
    top: "50%",
    left: 12,
    transform: "translateY(-50%)",
    color: "#aaa",
    fontSize: 14,
  },
  button: {
    padding: "12px",
    background: "linear-gradient(135deg, #4ea1f3, #2563eb)",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    fontWeight: 600,
    fontSize: 15,
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
  },
  avatarLabel: {
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
    margin: "0 auto 20px auto",
  },
  eyeButton: {
    position: "absolute",
    top: "50%",
    right: 14, // garante que fique colado à borda direita do input
    transform: "translateY(-50%)",
    background: "transparent",
    border: "none",
    color: "#ccc",
    cursor: "pointer",
    padding: 4,
    zIndex: 1, // garante que fique acima
  },
};
