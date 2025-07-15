import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { User } from "types/user";
import { Video } from "types/video";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { UserSettingsButton } from "../components/UserSettingsButton";

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
    const videos: Video[] = videosSnapshot.docs.map((doc) => ({
      videoID: doc.id,
      ...doc.data(),
    })) as Video[];

    return (
      <main className="max-w-xl mx-auto p-8 space-y-8 bg-black min-h-screen">
        <section className="text-center">
          <Image
            src={safeUser.image || "/default-profile.png"}
            alt={`Foto de ${safeUser.name}`}
            width={160}
            height={160}
            className="rounded-full mx-auto object-cover shadow-md"
          />
          <h1 className="mt-4 text-4xl font-bold text-white">
            {safeUser.name}
          </h1>
          <p className="text-xl text-gray-300">{safeUser.username}</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold border-b border-gray-700 pb-2 text-white">
            Informações
          </h2>
          <p className="text-white">
            <strong>Email:</strong> <span>{safeUser.email}</span>
          </p>
          <p className="text-white">
            <strong>Localização:</strong>{" "}
            <span>
              {safeUser.latitude !== null && safeUser.longitude !== null
                ? `Latitude: ${safeUser.latitude.toFixed(
                    6
                  )}, Longitude: ${safeUser.longitude.toFixed(6)}`
                : "Não informado"}
            </span>
          </p>
          <p>
            <strong>Status:</strong>{" "}
            <span
              className={`inline-block px-4 py-1 rounded-full text-white ${
                safeUser.visible ? "bg-green-600" : "bg-gray-400"
              }`}
            >
              {safeUser.visible ? "Visível" : "Oculto / Não informado"}
            </span>
          </p>
          <UserSettingsButton profileUid={safeUser.uid} />
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-white flex items-center gap-2">
            Vídeos de {safeUser.name}
            <span className="bg-gray-700 text-sm px-2 py-1 rounded-full">
              {videos.length}
            </span>
          </h2>
          {videos.length === 0 ? (
            <p className="text-gray-400">Nenhum vídeo encontrado.</p>
          ) : (
            <ul className="flex flex-col space-y-4">
              {videos.map((video) => (
                <li key={video.videoID} className="w-full max-w-md mx-auto">
                  <Link
                    href={`/${encodeURIComponent(
                      safeUser.name
                    )}/${encodeURIComponent(video.videoID)}`}
                  >
                    <Image
                      src={video.thumbnailUrl || "/default-thumbnail.png"}
                      alt={`Thumbnail do vídeo: ${video.artistSongName}`}
                      width={320}
                      height={180}
                      className="rounded-lg object-cover shadow-lg cursor-pointer"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    );
  } catch (error) {
    console.error("Erro ao buscar usuário ou vídeos:", error);
    return <div>Erro ao carregar o perfil.</div>;
  }
}
