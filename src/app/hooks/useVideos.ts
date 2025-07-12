import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Video } from "types/video";

export const useVideos = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVideos() {
      setLoading(true);
      try {
        const q = query(
          collection(db, "videos"),
          orderBy("publishedDateTime", "desc")
        );
        const snapshot = await getDocs(q);
        const vids: Video[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            videoID: doc.id,
            artistSongName: data.artistSongName ?? "",
            latitude: data.latitude ?? 0,
            longitude: data.longitude ?? 0,
            userProfileImage: data.userProfileImage ?? "",
            userName: data.userName ?? "",
            thumbnailUrl: data.thumbnailUrl ?? "",
            publishedDateTime: data.publishedDateTime ?? null,
            videoUrl: data.videoUrl ?? "",
            userID: data.userID ?? "",
            isFlash: data.isFlash ?? false,
            isPlace: data.isPlace ?? false,
            isStore: data.isStore ?? false,
            isProduct: data.isProduct ?? false,
          };
        });

        setVideos(vids);
      } catch (error) {
        console.error("Erro ao buscar vídeos:", error);
      }
      setLoading(false);
    }

    fetchVideos();
  }, []);

  return { videos, loading };
};
