"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, ReactNode } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";

interface PublicarLayoutProps {
  children: ReactNode;
}

export default function PublicarLayout({ children }: PublicarLayoutProps) {
  const router = useRouter();
  const auth = getAuth();

  // estado para controlar quando o usuário já foi verificado
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        // se não estiver logado, redireciona para login
        router.replace("/login");
      } else {
        // usuário logado, libera o conteúdo
        setCheckingAuth(false);
      }
    });

    return () => unsubscribe();
  }, [auth, router]);

  if (checkingAuth) {
    // Loader simples enquanto checa login
    return (
      <div
        style={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#000",
          color: "#fff",
          fontSize: "24px",
        }}
      >
        Carregando...
      </div>
    );
  }

  // Se passou da checagem, renderiza o conteúdo da página
  return <>{children}</>;
}
