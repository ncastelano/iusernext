import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { User } from "types/user";
import { Video } from "types/video";
import { notFound } from "next/navigation";

import UserProfileAnimations from "../components/UserProfileAnimation";

import InfoProfileAnimations from "../components/InfoProfileAnimations";
import VideosProfileAnimations from "../components/VideoProfileAnimations";

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;
  const decodedName = decodeURIComponent(name);

  try {
    const usersRef = collection(db, "users");
    const qUser = query(usersRef, where("name", "==", decodedName));
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
      <main className="max-w-xl mx-auto p-8 space-y-8 bg-black min-h-screen">
        <section
          className="relative w-full max-w-xl mx-auto overflow-hidden rounded-lg"
          style={{ aspectRatio: "16 / 9" }}
        >
          <UserProfileAnimations
            imageUrl={safeUser.image || "/default-profile.png"}
            userName={safeUser.name}
          />
        </section>

        <InfoProfileAnimations
          safeUser={safeUser}
          videosCount={videos.length}
        />

        {videos.length === 0 ? (
          <p className="text-gray-400">Nenhum vídeo encontrado.</p>
        ) : (
          <VideosProfileAnimations videos={videos} userName={safeUser.name} />
        )}
      </main>
    );
  } catch (error) {
    console.error("Erro ao buscar usuário ou vídeos:", error);
    return <div>Erro ao carregar o perfil.</div>;
  }
}
