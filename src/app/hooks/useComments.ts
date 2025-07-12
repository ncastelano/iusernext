import { useState } from "react";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Comment } from "types/comment";

export const useComments = (videoID: string | undefined) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);

  const loadComments = async () => {
    if (!videoID) return;
    setLoadingComments(true);
    try {
      const ref = collection(db, "videos", videoID, "comments");
      const snapshot = await getDocs(ref);
      const loaded = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data.userId || "unknown",
          userName: data.userName || "Anônimo",
          userProfileImage: data.userProfileImage || "",
          text: data.text || "",
          timestamp: data.timestamp || null,
          replies: data.replies || [],
        };
      });
      setComments(loaded);
    } catch (error) {
      console.error("Erro ao carregar comentários:", error);
    }
    setLoadingComments(false);
  };

  const addComment = async (text: string) => {
    if (!videoID || !text.trim()) return;
    try {
      const ref = collection(db, "videos", videoID, "comments");
      await addDoc(ref, { text, createdAt: Date.now() });
      setComments((prev) => [
        ...prev,
        {
          id: "temp-id-" + Date.now(),
          userId: "unknown",
          userName: "Anônimo",
          userProfileImage: "",
          text: text,
          timestamp: null,
          replies: [],
        },
      ]);
    } catch (err) {
      console.error("Erro ao comentar:", err);
    }
  };

  return { comments, loadingComments, loadComments, addComment };
};
