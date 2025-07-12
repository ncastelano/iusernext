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
        const vids = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            videoID: doc.id,
            artistSongName: data.artistSongName || undefined,
            latitude: data.latitude || undefined,
            longitude: data.longitude || undefined,
            userProfileImage: data.userProfileImage || undefined,
            userName: data.userName || undefined,
            thumbnailUrl: data.thumbnailUrl || "",
            publishedDateTime: data.publishedDateTime || undefined,
            videoUrl: data.videoUrl || undefined,
          };
        });
        setVideos(videos);
      } catch (error) {
        console.error("Erro ao buscar vídeos:", error);
      }
      setLoading(false);
    }

    fetchVideos();
  }, []);

  return { videos, loading };
};
