import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { User } from "types/user";
import { Video } from "types/video";
import Image from "next/image";
import { notFound } from "next/navigation";
import { UserSettingsButton } from "../components/UserSettingsButton";
import { AnimatedSection } from "../components/AnimatedSection";
import { AnimatedCard } from "../components/AnimatedCard";

export default async function UserProfilePage({
  params,
}: {
  params: { name: string };
}) {
  const { name } = params;
  const decodedName = decodeURIComponent(name);

  try {
    const usersRef = collection(db, "users");
    const qUser = query(usersRef, where("name", "==", decodedName));
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
    const videos: Video[] = videosSnapshot.docs.map((doc) => ({
      ...(doc.data() as Video),
      videoID: doc.id,
    }));

    return (
      <main className="min-h-screen bg-black relative text-white overflow-hidden">
        {/* Background Effect */}
        <div className="absolute inset-0 z-0 blur-2xl opacity-20 bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-purple-900 via-black to-black" />

        {/* Profile Cover */}
        <section className="relative w-full h-[300px] overflow-hidden z-10">
          <Image
            src={safeUser.image || "/default-profile.png"}
            alt={`Foto de ${safeUser.name}`}
            fill
            className="object-cover"
            priority
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black z-10" />
        </section>

        {/* User Info */}
        <AnimatedSection>
          <section className="px-6 mt-[-60px]">
            <h1 className="text-3xl font-bold">@{safeUser.name}</h1>

            <div className="mt-4 space-y-2 text-sm">
              <p>
                <strong>Email:</strong> {safeUser.email}
              </p>
              <p>
                <strong>Localização:</strong>{" "}
                {safeUser.latitude !== null && safeUser.longitude !== null
                  ? `Latitude: ${safeUser.latitude.toFixed(
                      6
                    )}, Longitude: ${safeUser.longitude.toFixed(6)}`
                  : "Não informado"}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm ${
                    safeUser.visible ? "bg-green-600" : "bg-gray-600"
                  }`}
                >
                  {safeUser.visible ? "Visível" : "Oculto / Não informado"}
                </span>
              </p>
              <UserSettingsButton profileUid={safeUser.uid} />
            </div>
          </section>
        </AnimatedSection>

        {/* Videos Grid */}
        <AnimatedSection>
          <section className="mt-10 px-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              Vídeos de {safeUser.name}
              <span className="bg-gray-700 text-sm px-2 py-1 rounded-full">
                {videos.length}
              </span>
            </h2>

            {videos.length === 0 ? (
              <p className="text-gray-400">Nenhum vídeo encontrado.</p>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 justify-center">
                {videos.map((video) => (
                  <AnimatedCard
                    key={video.videoID}
                    href={`/${encodeURIComponent(
                      safeUser.name
                    )}/${encodeURIComponent(video.videoID)}`}
                    src={video.thumbnailUrl || "/default-thumbnail.png"}
                    alt={`Thumbnail do vídeo: ${video.artistSongName}`}
                  />
                ))}
              </div>
            )}
          </section>
        </AnimatedSection>
      </main>
    );
  } catch (error) {
    console.error("Erro ao buscar usuário ou vídeos:", error);
    return (
      <main className="min-h-screen flex items-center justify-center text-white">
        Erro ao carregar o perfil.
      </main>
    );
  }
}
