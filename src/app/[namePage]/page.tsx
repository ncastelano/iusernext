//app/[name]/page.tsx

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

    // Definindo valores padrão caso estejam ausentes
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
      <main className="min-h-screen bg-gradient-to-b from-[#0f0c29] via-[#302b63] to-[#24243e] text-white">
        <div className="max-w-3xl mx-auto p-6 space-y-10">
          <section
            className="relative overflow-hidden rounded-3xl shadow-xl"
            style={{ aspectRatio: "16 / 9" }}
          >
            <UserProfileAnimations
              imageUrl={safeUser.image || "/default-profile.png"}
              userName={safeUser.namePage}
            />
          </section>

          <div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl shadow-lg border border-white/20">
            <InfoProfileAnimations
              safeUser={safeUser}
              videosCount={videos.length}
            />
            <CommentProfile profileUid={safeUser.uid} />
          </div>

          <section className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl shadow-lg border border-white/20">
            {videos.length === 0 ? (
              <p className="text-gray-300 text-center">
                Nenhum vídeo encontrado.
              </p>
            ) : (
              <VideosProfileAnimations
                videos={videos}
                userName={safeUser.namePage}
              />
            )}
          </section>
        </div>
      </main>
    );
  } catch (error) {
    console.error("Erro ao buscar usuário ou vídeos:", error);
    return <div>Erro ao carregar o perfil.</div>;
  }
}
