import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Video } from "types/video";

export function useVideos() {
  const [videos, setVideos] = useState<Video[]>([]);

  useEffect(() => {
    const fetchVideos = async () => {
      const q = query(
        collection(db, "videos"),
        where("publishedDateTime", "!=", null),
        orderBy("publishedDateTime", "desc")
      );
      const snapshot = await getDocs(q);
      setVideos(
        snapshot.docs.map((doc) => ({
          videoID: doc.id,
          ...doc.data(),
        })) as Video[]
      );
    };
    fetchVideos();
  }, []);

  return { videos };
}
