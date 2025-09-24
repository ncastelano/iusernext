// app/[name]/page.tsx

import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { Video } from "types/video";
import { notFound } from "next/navigation";
import UserProfileAnimations from "./UserProfileAnimation";
import InfoProfileAnimations from "./InfoProfileAnimations";
import VideosProfileAnimations from "./VideoProfileAnimations";
import CommentProfile from "./CommentProfile";
import { User } from "types/users";

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ namePage: string }>;
}) {
  const { namePage } = await params;
  const decodedName = decodeURIComponent(namePage);

  try {
    const usersRef = collection(db, "users");
    const qUser = query(usersRef, where("namePage", "==", decodedName));
    const userSnapshot = await getDocs(qUser);

    if (userSnapshot.empty) return notFound();

    const user = userSnapshot.docs[0].data() as User;

    const safeUser = {
      ...user,
      latitude: typeof user.latitude === "number" ? user.latitude : null,
      longitude: typeof user.longitude === "number" ? user.longitude : null,
      visible: typeof user.visible === "boolean" ? user.visible : false,
    };

    const videosRef = collection(db, "videos");
    const qVideos = query(videosRef, where("userID", "==", user.uid));
    const videosSnapshot = await getDocs(qVideos);
    const videos: Video[] = videosSnapshot.docs.map(
      (doc) => doc.data() as Video
    );

    return (
      <main
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)",
          color: "#fff",
          padding: "2rem",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Banner do usuário */}

        <UserProfileAnimations
          imageUrl={safeUser.image || "/default-profile.png"}
          userName={safeUser.namePage}
        />

        {/* Info e comentários */}
        <div style={{ marginTop: "1.5rem" }}>
          {" "}
          <InfoProfileAnimations
            safeUser={safeUser}
            videosCount={videos.length}
          />
        </div>

        <div style={{ marginTop: "1.5rem" }}>
          <CommentProfile profileUid={safeUser.uid} />
        </div>

        {/* Vídeos */}
        <section
          style={{
            background: "rgba(255, 255, 255, 0.08)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            borderRadius: "16px",
            padding: "2rem",
            boxShadow: "0 8px 20px rgba(0,0,0,0.35)",
          }}
        >
          {videos.length === 0 ? (
            <p
              style={{
                color: "rgba(255,255,255,0.6)",
                textAlign: "center",
                fontSize: "1.1rem",
                fontWeight: 300,
              }}
            >
              Nenhum vídeo encontrado.
            </p>
          ) : (
            <VideosProfileAnimations
              videos={videos}
              userName={safeUser.namePage}
            />
          )}
        </section>
      </main>
    );
  } catch (error) {
    console.error("Erro ao buscar usuário ou vídeos:", error);
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#1a1a1a",
          color: "#fff",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: "1.2rem",
          fontWeight: 500,
        }}
      >
        Erro ao carregar o perfil.
      </div>
    );
  }
}
